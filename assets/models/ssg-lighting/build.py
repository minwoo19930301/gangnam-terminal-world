"""Author the Lightnow public showroom in metres (X right, Y back, Z up)."""
from math import sin, cos, pi, sqrt
from pathlib import Path
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
collection = bpy.data.collections.new('SSG_9F_Lightnow')
bpy.context.scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
rng = Random(208)

def linear(c):
    v = c/255
    return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4

def finish(name, rgb, group='Finish'):
    m = bpy.data.materials.new(name)
    color = tuple(linear(int(rgb[i:i+2],16)) for i in (0,2,4))+(1,)
    m.diffuse_color = color
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = color
    p.inputs['Metallic'].default_value = .68 if group=='Metal' else .04
    p.inputs['Roughness'].default_value = {'Finish':.54,'Metal':.28,'Diffuser':.36}[group]
    if group=='Diffuser':
        emission = p.inputs.get('Emission Color') or p.inputs.get('Emission')
        emission.default_value = (1,.80,.52,1)
        p.inputs['Emission Strength'].default_value = .29
    m['batch'] = group
    return m

ink=finish('Graphite','28282a')
wall=finish('Chalk','e7e3d9')
wood=finish('Walnut','73503a')
cream=finish('Porcelain','efe2bc','Diffuser')
opal=finish('Opaline','f8f6ef','Diffuser')
amber=finish('Golden lacquer','f1a72b')
alloy=finish('Brushed aluminium','adb0ab','Metal')
brass=finish('Brass','af8150','Metal')
rose=finish('Pale amber glass','f8be81','Diffuser')
slate=finish('Pale blue grey','c1d2d3','Diffuser')
grain=[finish('Whitewashed plank '+str(i),c) for i,c in enumerate(('cfcbbc','dbd7c8','c8c3b7','e1ddcf','d4cfbe'))]

def part(name,mat):
    o=bpy.context.object
    o.name=name
    o.data.materials.append(mat)
    return o

def box(name,x,y,z,w,d,h,m):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z+h/2))
    o=part(name,m)
    o.scale=(w,d,h)
    return o

def lathe(name,x,y,z,profile,m,n=40,fold=0):
    verts=[]
    for r,h in profile:
        for j in range(n):
            a=2*pi*j/n
            radius=max(.00015,r)*(1-fold*(j%2))
            verts.append((radius*cos(a),radius*sin(a),h))
    faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j)
           for k in range(len(profile)-1) for j in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    o=bpy.data.objects.new(name,mesh)
    collection.objects.link(o)
    o.location=(x,y,z)
    mesh.materials.append(m)
    for p in list(mesh.polygons)[:-2]: p.use_smooth=not fold
    if fold:
        o['pleat_segments']=n
    return o

def rod(name,a,b,r,m):
    delta=Vector(b)-Vector(a)
    o=lathe(name,*a,[(r,0),(r,delta.length)],m,12)
    o.rotation_euler=delta.to_track_quat('Z','Y').to_euler()
    return o

def lettering(words,x,y,z,size,m):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    o=bpy.context.object
    o.data.body=words
    o.data.size=size
    o.data.align_x='CENTER'
    o.data.extrude=.001
    bpy.ops.object.convert(target='MESH')
    part(words,m)

def panthella(x,y,z,s,shade,stand):
    def shell(name,profile,mat):
        return lathe(name,x,y,z,[(r*s,h*s) for r,h in profile],mat)
    shell('Trumpet foot and stem',[(.124,0),(.128,.008),(.124,.016),(.091,.026),(.065,.042),(.044,.064),(.029,.1),(.020,.16),(.018,.24),(.021,.33)],stand)
    shell('Underside reflector',[(.010,.317),(.154,.317),(.195,.323)],opal)
    dome=[(.20*cos(i*pi/24),.325+.180*sin(i*pi/24)) for i in range(13)]
    shell('Hemispherical shade',[(.195,.318),(.200,.321)]+dome,shade)
    shell('Touch finial',[(.011,.504),(.010,.510),(.006,.513)],alloy)

def ph(x,y,z,s,m):
    def turn(label,profile,material):
        return lathe(label,x,y,z,[(a*s,b*s) for a,b in profile],material)
    turn('Weighted foot',[(.12,0),(.126,.01),(.116,.022),(.08,.032),(.029,.040)],alloy)
    turn('Lamp stem and socket',[(.016,.035),(.014,.32),(.028,.33),(.027,.40)],ink)
    for radius,height in [(.089,.338),(.139,.379),(.191,.422)]:
        turn('Stepped curved reflector',[(radius*.28,height+.043),(radius*.72,height+.019),(radius,height),
             (radius,height+.008),(radius*.72,height+.032),(radius*.39,height+.053),(.02,height+.057)],m)
    turn('Top cap',[(.04,.475),(.040,.483),(.018,.491)],brass)

def pleats(x,y,z,s):
    # Alternating ridges and valleys remain legible on the diffuser underside.
    profile=[(.105,0),(.276,.018),(.343,.07),(.359,.16),(.342,.25),(.295,.34),(.202,.406),(.11,.427)]
    lathe('Pleated luminous envelope',x,y,z,[(r*s,h*s) for r,h in profile],cream,160,.055)
    lathe('Upper retaining collar',x,y,z,[(.11*s,.425*s),(.094*s,.438*s)],alloy)
    lathe('Lower diffusing lens',x,y,z,[(.105*s,-.004),(.108*s,.008)],opal)

def suspension(x,y,height):
    rod('Pendant flex',(x,y,height),(x,y,3.13),.007,ink)
    lathe('Ceiling rose',x,y,3.11,[(.065,0),(.069,.045)],ink)

# Mobile plank-top display table and chairs photographed in the branch.
box('Apron',.49,0,.78,2.58,.77,.100,grain[2])
for i in range(7):
    box('Plank top',.49,-.414+i*.138,.88,2.71,.136,.045,grain[i%5])
for x in [-.47,1.45]:
    box('Trestle shoe',x,0,.024,.30,.80,.055,grain[1])
    box('Trestle upright',x,0,.079,.21,.50,.704,grain[2])
    for y in [-.32,.32]:
        rod('Recessed roller',(x-.07,y,.04),(x+.07,y,.04),.04,ink)
for x in [-.07,1.1]:
    for dx in [-.19,.19]:
        for dy in [-.18,.18]:
            rod('Chair leg',(x+dx, .83+dy,.02),(x+dx*.92,.83+dy*.93,.45),.025,wood)
        rod('Chair back stile',(x+dx,.995,.43),(x+dx,1.05,.84),.022,wood)
    box('Chair seat',x,.83,.43,.46,.43,.042,wood)
    box('Chair back',x,1.045,.68,.43,.042,.17,wood)
panthella(-.46,.02,.925,1.10,cream,grain[0])
panthella(.22,.07,.925,.76,opal,wall)
panthella(.75,.025,.925,.82,amber,amber)
# A fluted silver pedestal and tilted open reflector as seen at the end of the table.
lathe('Fluted reflector base',1.46,.08,.925,[(.116,0),(.121,.013),(.113,.224),(.081,.242)],alloy,72,.065)
dish=lathe('Tilted reflector bowl',1.46,.08,1.19,[(.052,0),(.113,.022),(.177,.067),(.216,.120),(.23,.169),(.224,.172),(.202,.127),(.159,.083),(.091,.051),(.026,.044)],alloy)
dish.rotation_euler[0]=.65
for x in [-.47,.22,.75,1.46]:
    box('Sample card',x,-.303,.925,.139,.079,.008,wall)
    box('Printed rule',x,-.312,.934,.073,.005,.001,ink)

# Raised secondary display and pleated pendant against the pale photograph wall.
box('Gallery backdrop',0,2.66,0,5.15,.105,3.14,wall)
box('Brand panel',-.60,1.78,1.88,1.04,.055,.65,grain[1])
lettering('LIGHT',-.60,1.742,2.21,.235,ink)
lettering('NOW',-.60,1.742,1.99,.235,ink)
rod('Panel hanger',(-.60,1.80,2.52),(-.60,1.80,3.13),.012,alloy)
box('Gallery plinth',.38,2.04,.015,1.72,.69,.81,wall)
for x,s,m in [(-.18,.89,opal),(.37,.70,slate),(.91,.98,rose)]:
    ph(x,2.04,.825,s,m)
# Tall floor light beside the sample plinth. Open rims suggest the clear
# cylinders without alpha sorting or opaque glass across the central pole.
fx,fy=1.68,1.88
lathe('Tower foot',fx,fy,.01,[(.255,0),(.261,.022),(.220,.041),(.100,.058)],ink)
rod('Tower central spine',(fx,fy,.07),(fx,fy,2.58),.018,ink)
for i in range(4):
    base=.12+i*.61
    for h in [base,base+.55]:
        lathe('Tower luminous end plate',fx,fy,h,[(.11,0),(.124,.011),(.123,.021),(.103,.027)],opal)
    for angle in [0,pi*.53,pi*1.19]:
        tx,ty=fx+.128*cos(angle),fy+.128*sin(angle)
        rod('Clear sleeve edge highlight',(tx,ty,base+.025),(tx,ty,base+.55),.0038,alloy)
# Low salvaged timber block with patchwork faces and a floor lantern.
box('Patchwork block',-1.75,.60,.04,1.14,.75,.30,ink)
for row in range(2):
    offset=0
    for width in ([.41,.26,.46] if row==0 else [.25,.52,.36]):
        box('Reclaimed fascia',-2.32+offset+width/2,.221,.045+row*.144,width-.008,.012,.137,rng.choice([ink,wood,wood]))
        offset+=width
pleats(-1.83,.65,.355,1.16)
pleats(-1.62,1.51,1.86,1.39)
suspension(-1.62,1.51,2.46)
# Wide layered pendant above the table, drawn from the branch photograph.
for r,z in [(.47,2.12),(.62,2.22)]:
    lathe('Layered hanging shade',.68,.08,z,[(.07,.053),(r*.68,.022),(r,0),(r,.008),(r*.72,.051),(.085,.095)],slate)
suspension(.68,.08,2.31)
rod('Amber pendant drop',(.68,.08,1.88),(.68,.08,2.19),.027,brass)
# Single ring and horizontal light bar behind the lantern.
ring=lathe('Ring luminaire',-1.64,2.14,2.67,[(.248,0),(.260,0),(.260,.016),(.248,.016),(.248,0)],opal)
# Remove the lathe caps to keep the ring genuinely open.
import bmesh
bm=bmesh.new();bm.from_mesh(ring.data)
bmesh.ops.delete(bm,geom=[f for f in bm.faces if len(f.verts)>4],context='FACES')
bm.to_mesh(ring.data);bm.free()
ring.rotation_euler[0]=pi/2
suspension(-1.64,2.14,2.93)
box('Linear light',-1.64,2.14,2.40,1.18,.024,.023,opal)
# Spot-welded punctured white divider. Construct each opening with its own rim.
verts=[];faces=[]
for col in range(3):
    for row in range(15):
        cy=.93+col*.30; cz=.15+row*.2
        scales=(rng.uniform(.08,.125),rng.uniform(.049,.084))
        start=len(verts)
        for depth in [2.39,2.405]:
            for edge in [False,True]:
                for j in range(12):
                    a=j*pi/6+pi/12
                    if edge:
                        k=max(abs(cos(a)),abs(sin(a)))
                        dy=.15*cos(a)/k; dz=.10*sin(a)/k
                    else:
                        dy=scales[0]*cos(a)+.014*sin(a); dz=scales[1]*sin(a)
                    verts.append((depth,cy+dy,cz+dz))
        for j in range(12):
            k=(j+1)%12
            for indices in [(12+j,12+k,k,j),(36+k,36+j,24+j,24+k),(j,k,24+k,24+j)]:
                faces.append(tuple(start+i for i in indices))
mesh=bpy.data.meshes.new('Perforated partition');mesh.from_pydata(verts,[],faces);mesh.update()
screen=bpy.data.objects.new(mesh.name,mesh);collection.objects.link(screen);mesh.materials.append(wall)

print('EDITABLE OBJECTS',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'lightnow.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
