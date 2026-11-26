"""Build the editable shop collection and material-batched game copy."""
import math
from pathlib import Path
import bpy
from mathutils import Vector

D = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_Christofle')
scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
bpy.context.preferences.filepaths.save_version = 0

def material(name, rgb, metal, rough):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    return m

silver = material('ChristofleMoodSilver', (.8,.83,.85), .36,.145)
fixture = material('ChristofleFurniture', (1,1,1), .07,.51)
# The game has no room reflection probes. Sample an authored reflection panorama
# using the curved surface normals from a customer's side of the shelf.
def image_material(m, name, width, height, shader):
    img = bpy.data.images.new(name,width,height)
    pixels = []
    for j in range(height):
        for i in range(width):
            pixels.extend((*shader(i/width,j/height),1))
    img.pixels.foreach_set(pixels)
    img.pack()
    node = m.node_tree.nodes.new('ShaderNodeTexImage')
    node.image = img
    m.node_tree.links.new(node.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])

def reflected_room(u,v):
    a = 2*math.pi*u
    # Bright vertical light cards, narrow mullions and warm shelf horizon.
    val = .67+.18*math.cos(a-.3)+.12*math.sin(2*a)
    for center,width,power in [(.07,.022,-.54),(.18,.07,.38),(.30,.025,-.72),(.38,.04,.42),(.62,.065,-.48),(.81,.038,.42),(.91,.018,-.49)]:
        diff=(u-center+.5)%1-.5
        val += power*math.exp(-(diff/width)**4)
    horizon=math.exp(-((v-.43-.035*math.sin(a))/.06)**2)
    val = val*(1-.66*horizon)+.10*v
    return tuple(max(.065,min(.99,val*k+b*horizon)) for k,b in [(1,.095),(1,.065),(1.02,.018)])

image_material(silver,'Shelf softboxes and wood horizon',256,96,reflected_room)
# Procedural atlas strips for olive mottling, wood grain, rails and lettering.
def finish(u,v):
    strip=min(5,int(v*6))
    base=[(.49,.47,.30),(.63,.43,.24),(.34,.22,.12),(.32,.29,.19),(.91,.88,.75),(.10,.092,.077)][strip]
    grain=.045*math.sin(35*u+2*math.sin(28*v))+.024*math.cos(191*u+61*v)
    if strip in (1,2):
        grain=.017*math.sin(612*v+2.8*math.sin(11*u))+.012*math.sin(901*v+6*u)
    if strip==0:
        grain=.018*math.sin(93*v+3*math.sin(19*u))+.016*math.sin(57*u+2*math.cos(193*v))+.025*math.sin(431*u)*math.sin(461*v)
    return tuple(max(.01,c+grain) for c in base)
image_material(fixture,'Olive backing and timber finishes',256,256,finish)

def mesh(name,verts,faces,mat,strip=0,smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(mat)
    for poly in data.polygons: poly.use_smooth=smooth
    uv=data.uv_layers.new().data
    for poly in data.polygons:
        coords=[]
        for li in poly.loop_indices:
            vert=data.vertices[data.loops[li].vertex_index]
            x,y,z=vert.co
            if mat==silver:
                n=vert.normal if smooth else poly.normal
                incident=(vert.co-Vector((.22,-1.20,1.61))).normalized()
                r=incident.reflect(n)
                coords.append([.5+math.atan2(r.y,r.x)/(2*math.pi),.5+math.asin(max(-1,min(1,r.z)))/math.pi])
            else:
                along=y if abs(poly.normal.x)>.8 else x
                across=y if abs(poly.normal.z)>.8 else z
                coords.append([along*.75+.5,(strip+.5+.42*math.sin(across*1.9+strip))/6])
        if mat==silver and max(c[0] for c in coords)-min(c[0] for c in coords)>.5:
            for c in coords:
                if c[0]<.5:c[0]+=1
        for li,c in zip(poly.loop_indices,coords):uv[li].uv=c
    return obj

def box(name,x,y,z,w,d,h,strip):
    verts=[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)]
    return mesh(name,verts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],fixture,strip)

def vessel(name,x,y,z,profile,mat=silver,strip=0,n=48):
    verts=[(x+r*math.cos(i*math.tau/n),y+r*math.sin(i*math.tau/n),z+h) for h,r in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(profile)-1) for i in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    return mesh(name,verts,faces,mat,strip,True)

def utensil(kind,x,y,z,angle,flat=False):
    # Rounded rectangular cross sections, curved spoon bowl with a thin lip.
    vertices=[]; faces=[]
    def strip(stations):
        start=len(vertices); n=12
        for h,w,t,offset,bowl in stations:
            for i in range(n):
                a=i*math.tau/n
                u=w*math.cos(a); v=offset+t*math.sin(a)-bowl*(1-math.cos(a)**2)
                if flat: v,h2=-h,v+.013
                else:h2=h
                vertices.append((x+u*math.cos(angle)-v*math.sin(angle),y+u*math.sin(angle)+v*math.cos(angle),z+h2))
        for j in range(len(stations)-1):
            for i in range(n):
                b=start+j*n
                faces.append((b+i,b+(i+1)%n,b+n+(i+1)%n,b+n+i))
        faces.append(tuple(reversed(range(start,start+n))))
        faces.append(tuple(range(len(vertices)-n,len(vertices))))
    s=.71 if kind=='Teaspoon' else 1
    stations=[(0,.0015,.001,0,0),(.004,.005,.0024,0,0),(.025,.007,.003,0,0),(.074,.0055,.0025,0,0),(.115,.003,.0018,.002,0)]
    if kind in ('Tablespoon','Teaspoon'):
        stations += [(.132,.006,.001,.005,.001),(.144,.016,.0012,.008,.004),(.163,.0215,.0013,.01,.009),(.18,.019,.0011,.013,.007),(.194,.009,.001,.015,.002),(.197,.001,.0007,.015,0)]
    if kind=='Fork':
        stations += [(.137,.011,.0017,.004,0),(.15,.013,.0014,.008,.002),(.159,.012,.001,.009,.002)]
    if kind=='Knife':
        stations += [(.126,.008,.003,0,0),(.135,.009,.0018,0,0),(.202,.008,.0012,0,0),(.222,.005,.0011,0,0),(.229,.0009,.0007,0,0)]
    strip([tuple(a*s for a in row) for row in stations])
    if kind=='Fork':
        for i in range(4):
            dx=(i-1.5)*.0061
            first=len(vertices)
            strip([(.158,.0027,.0012,.009,0),(.175,.002,.0009,.009,0),(.199,.0006,.0004,.006,0)])
            for k in range(first,len(vertices)):
                a,b,c=vertices[k];vertices[k]=(a+dx*math.cos(angle),b+dx*math.sin(angle),c)
    return mesh(kind,vertices,faces,silver,smooth=True)

# Branch opening photograph: thin timber shelf lips, slotted metal standards,
# greenish surface behind polished vessels. Dimensions of the fixture inferred.
box('Cabinet plinth',0,.08,0,2.76,.48,.59,2)
box('Olive wall lining',0,.285,.56,2.76,.045,1.60,0)
for x in (-1.33,-.43,.43,1.33):
    box('Slotted shelf upright',x,.248,.59,.024,.023,1.55,3)
    for i in range(17): box('Rail mortise',x,.235,.635+i*.086,.009,.003,.024,5)
for z,d in [(.60,.48),(1.05,.72),(1.62,.43),(2.12,.43)]:
    box('Walnut display shelf',0,.27-d/2,z-.033,2.80,d,.033,1)
    box('Fine brass leading edge',0,.268-d,z-.023,2.8,.006,.007,3)
    for x in (-1.33,-.43,.43,1.33):box('Bracket',x,.12,z-.06,.018,.25,.029,3)

bottom=[(0,.053),(.003,.057),(.012,.064),(.029,.077),(.050,.087),(.079,.096),(.104,.0996),(.126,.100),(.128,.0995)]
lid=[(.129,.0994),(.143,.0995),(.167,.097),(.194,.092),(.215,.086),(.236,.078),(.256,.068),(.272,.056),(.286,.043),(.296,.025),(.300,.007),(.3002,.001)]
def egg(x,y,z,opened):
    vessel('MOOD lower polished steel case',x,y,z,bottom+[(.128,.096),(.118,.094)])
    vessel('Case joining rim',x,y,z,[(.125,.0997),(.126,.1002),(.127,.0997)],n=64)
    if not opened:
        vessel('MOOD removable egg cover',x,y,z,lid,n=64)
        return
    vessel('Walnut fitted disk',x,y,z,[(.116,.093),(.126,.096),(.130,.092)],fixture,2)
    for kind,rad,phase,depth in [('Knife',.029,0,.022),('Fork',.052,.22,.056),('Tablespoon',.077,.5,.060),('Teaspoon',.078,1.00,.078)]:
        for i in range(6):
            a=i*math.tau/6+phase
            px=x+rad*math.cos(a);py=y+rad*math.sin(a)
            utensil(kind,px,py,z+.130-depth,a+math.pi/2)
egg(-.19,-.21,1.05,True)
egg(.20,-.17,1.05,False)
# Detached cover seated on its open rim.
vessel('Lifted MOOD lid',-.44,-.19,1.05,[(h-.129,r) for h,r in lid],n=64)
for i,kind in enumerate(['Knife','Fork','Tablespoon','Teaspoon']):
    utensil(kind,.47+i*.056,-.09,1.05,-.09,True)

def barware(name,x,y,z,r,h):
    vessel(name,x,y,z,[(0,r*.67),(.014*h,r*.71),(.048*h,r*.81),(.11*h,r*.89),(.27*h,r*.96),(.81*h,r),(.978*h,r), (h,r*1.012),(h+.002,r*.966),(.94*h,r*.956),(.15*h,r*.89)],n=36)
for x,z,r,h in [(-.96,1.05,.097,.22),(-.72,1.05,.066,.16),(.91,1.05,.065,.22),(-1.04,1.62,.11,.25),(-.72,1.62,.09,.17),(.68,1.62,.059,.16),(.87,1.62,.059,.16),(-.85,.60,.105,.245),(-.57,.60,.07,.145)]:
    barware('Silver bar vessel',x,.025,z,r,h)
for x,z in [(-.27,1.62),(-.01,1.62),(.85,.60)]:
    vessel('Three-part cocktail shaker',x,.026,z,[(0,.033),(.008,.038),(.149,.047),(.159,.046),(.161,.049),(.169,.048),(.187,.040),(.199,.028),(.219,.026),(.22,.029),(.246,.028),(.249,.023)],n=32)
for x,z,r in [(.22,1.62,.115),(.4,.60,.15)]:
    vessel('Shallow silver serving dish',x,.04,z,[(0,r*.5),(.005,r*.64),(.012,r*.81),(.03,r),(.033,r),(.033,r*.97),(.012,r*.76),(.008,r*.48)],n=48)

def lettering(text, location, size, strip):
    curve=bpy.data.curves.new('Brand inscription','FONT')
    curve.body=text;curve.align_x='CENTER';curve.size=size
    curve.shear=.12;curve.extrude=.0003
    obj=bpy.data.objects.new('Christofle inscription',curve);collection.objects.link(obj)
    obj.location=location;obj.rotation_euler.x=math.pi/2
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.data.materials.append(fixture)
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new()
    for item in uv.data:item.uv=(.4,(strip+.5)/6)
    obj.select_set(False)
lettering('Christofle',(0,.252,1.932),.105,4)
lettering('Christofle',(.20,-.2699,1.193),.009,3)
print('Editable objects',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(D/'mood.blend'),compress=True)
# Join only after saving the individually editable masters.
for mat in [silver,fixture]:
    bpy.ops.object.select_all(action='DESELECT')
    parts=[o for o in collection.objects if o.active_material==mat]
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    bpy.context.object.name=mat.name
bpy.ops.export_scene.gltf(filepath=str(D/'gallery.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
