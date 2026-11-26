"""Build the Gangnam retail display in metres. +Y points towards the display wall."""
import math
from pathlib import Path
import bpy
import bmesh
import numpy as np
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
gallery = bpy.data.collections.new('SSG_9F_JURA')
bpy.context.scene.collection.children.link(gallery)
def paint(name, rgb, category='Enamel'):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    rgba = tuple(((i/255+.055)/1.055)**2.4 if i>10 else i/3294.6 for i in bytes.fromhex(rgb)) + (1,)
    mat.diffuse_color = rgba
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = rgba
    shader.inputs['Metallic'].default_value = .53 if category=='Steel' else .035
    shader.inputs['Roughness'].default_value = .27 if category=='Steel' else .36
    mat['gallery_finish'] = category
    return mat
cream = paint('Ivory lacquer', 'ebdfc5')
white = paint('Porcelain white', 'faf8ef')
graphite = paint('Graphite polymer', '292a2c')
black = paint('Gloss obsidian', '13171a')
screen = paint('Display charcoal', '20262e')
steel = paint('Brushed chrome', 'c5c9c9', 'Steel')
brass = paint('Champagne brass', 'cba75e', 'Steel')
walnut = paint('Walnut edge band', '895537')
coffee = paint('Espresso crema', 'b67537')
leather = paint('Mocha upholstery', '786254')
red = paint('Vermilion lettering', 'c64227')
wood = paint('Quarter cut maple', 'd8bd97', 'Wood')
light = paint('Warm light strip', 'fff1dc','Light')
bs=light.node_tree.nodes.get('Principled BSDF')
(bs.inputs.get('Emission Color') or bs.inputs['Emission']).default_value=(1,.85,.68,1)
bs.inputs['Emission Strength'].default_value=.75
crystal = paint('Faceted clear reservoir','cad6da','Crystal')
bs=crystal.node_tree.nodes.get('Principled BSDF')
bs.inputs['Alpha'].default_value=.52
bs.inputs['Roughness'].default_value=.16
crystal.blend_method='BLEND'
# A repeatable veneer field, with wavering narrow growth bands.
gy,gx=np.mgrid[:256,:256]*math.tau/256
phase=38*gx+2.6*np.sin(gx*2+np.sin(gy))+.65*np.sin(gy*2+gx*5)
grain=.018*np.sin(phase)+.012*np.sin(phase*3)+.017*np.sin(gx*4+np.sin(gy))
pixels=np.ones((256,256,4),np.float32)
pixels[:,:,:3]=np.array([.87,.757,.61])+grain[:,:,None]
img=bpy.data.images.new('Maple veneer',width=256,height=256,alpha=False)
img.pixels.foreach_set(pixels.ravel());img.pack()
tex=wood.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
wood.node_tree.links.new(tex.outputs['Color'],wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def mesh(name, verts, faces, mat, bevel=0):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    bm=bmesh.new();bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel:
        bmesh.ops.bevel(bm,geom=bm.edges[:],offset=bevel,segments=2,affect='EDGES')
    bm.to_mesh(data);bm.free()
    obj=bpy.data.objects.new(name,data);gallery.objects.link(obj);data.materials.append(mat)
    if mat==wood:
        uv=data.uv_layers.new(name='Veneer')
        for loop in data.loops:
            x,y,z=data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv=((x+y)*1.9,z*.55+y*.23)
    return obj

def block(name,x,y,z,w,d,h,mat,bevel=.002):
    verts=[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)]
    return mesh(name,verts,[(0,1,3,2),(4,6,7,5),(0,4,5,1),(1,5,7,3),(3,7,6,2),(2,6,4,0)],mat,bevel)

def turn(name,origin,profile,mat,axis=(0,0,1),sides=24):
    # Ordered (axial distance, radius) pairs support hollow rims and tapered shells.
    basis=Vector(axis).normalized().to_track_quat('Z','Y')
    verts=[Vector(origin)+basis@Vector((r*math.cos(i*math.tau/sides),r*math.sin(i*math.tau/sides),h))
           for h,r in profile for i in range(sides)]
    faces=[tuple(reversed(range(sides))),tuple(range(len(verts)-sides,len(verts)))]
    for j in range(len(profile)-1):
        for i in range(sides):
            k=j*sides+i;t=j*sides+(i+1)%sides
            faces.append((k,t,t+sides,k+sides))
    return mesh(name,verts,faces,mat)

def rod(name,a,b,r,mat,sides=12,r2=None):
    v=Vector(b)-Vector(a)
    return turn(name,a,[(0,r),(v.length,r if r2 is None else r2)],mat,v,sides)

def bend(name,points,r,mat):
    # One swept tube, with shared rings at the bends.
    verts=[]; sides=8
    for i,p in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])).normalized()
        u=tangent.cross(Vector((1,0,0)))
        if u.length<.01:u=tangent.cross(Vector((0,0,1)))
        u.normalize();v=tangent.cross(u)
        for k in range(sides):
            a=k*math.tau/sides
            verts.append(Vector(p)+r*(math.cos(a)*u+math.sin(a)*v))
    faces=[(i*sides+k,i*sides+(k+1)%sides,(i+1)*sides+(k+1)%sides,(i+1)*sides+k)
           for i in range(len(points)-1) for k in range(sides)]
    faces.extend([tuple(reversed(range(sides))),tuple(range(len(verts)-sides,len(verts)))])
    mesh(name,verts,faces,mat)

def lettering(name,body,x,y,z,size,mat):
    font=bpy.data.curves.new(name,'FONT')
    font.resolution_u=3;font.body=body;font.align_x='CENTER';font.align_y='CENTER';font.size=size;font.extrude=.0015
    ob=bpy.data.objects.new(name,font);gallery.objects.link(ob)
    ob.location=(x,y,z);ob.rotation_euler.x=math.pi/2;ob.data.materials.append(mat)
    bpy.context.view_layer.objects.active=ob;ob.select_set(True)
    bpy.ops.object.convert(target='MESH');ob.select_set(False)

def cup(x,y,z,mat,s=1):
    def profile(name,p,m):
        turn(name,(x,y,z),[(a*s,r*s) for a,r in p],m)
    profile('Saucer',[(0,.045),(.005,.064),(.009,.069),(.011,.065),(.006,.034)],mat)
    profile('Espresso porcelain',[(.009,.022),(.014,.026),(.023,.035),(.049,.043),(.054,.043),(.054,.039),(.046,.037),(.020,.018)],mat)
    pts=[(x+s*(.041+.018*math.cos(t)),y,z+s*(.035+.014*math.sin(t))) for t in np.linspace(-2.10,2.10,12)]
    bend('Cup handle',pts,.004*s,mat)

# All contours below are drawn in elevation, then given depth.
def panel(name,outline,y,depth,mat):
    n=len(outline)
    vertices=[(x,b,z) for b in (y,y+depth) for x,z in outline]
    faces=[tuple(range(n)),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    return mesh(name,vertices,faces,mat)

def arch_points(cx,spring,r):
    return [(cx+r*math.cos(a),spring+r*math.sin(a)) for a in np.linspace(math.pi,0,29)]

def opening(cx,spring,r):
    return [(cx-r,0)]+arch_points(cx,spring,r)+[(cx+r,0)]

def arch_band(name,cx,spring,r,width,y,depth,mat):
    panel(name,opening(cx,spring,r+width)+list(reversed(opening(cx,spring,r))),y,depth,mat)

def sign(body,x,y,z,size,mat,italic=False):
    lettering(body,body,x,y,z,size,mat)
    if italic:
        obj=bpy.context.object
        for vert in obj.data.vertices: vert.co.x+=.33*vert.co.y

# The tasting bar has a lit walnut lip over pale veneer. Its arch is open
# through the full depth, including the curved soffit and the two end faces.
outline=[(-2.23,0)]+opening(.86,.40,.40)+[(2.23,0),(2.23,.96),(-2.23,.96)]
panel('Bridge bar with open arch',outline,-.37,.76,wood)
arch_band('Inlaid arch surround',.86,.40,.40,.025,-.38,.015,cream)
block('Walnut counter edge',0,.008,.959,4.54,.83,.052,walnut,.016)
block('Fine light beneath lip',0,-.377,.946,4.44,.014,.014,light,.004)
for h in [.105,.145]:
    for a,b in [(-2.23,.45),(1.27,2.23)]:
        block('Cabinet reveal',(a+b)/2,-.372,h,b-a,.006,.005,walnut,0)
# Inverted triangular walnut badge in the branch photograph.
for w,base,h,y,mat in [(1.12,.92,.50,-.39,walnut),(.99,.91,.44,-.396,cream),(.85,.89,.355,-.403,walnut)]:
    panel('Inlaid triangular plaque',[(-1.28-w/2,base),(-1.28+w/2,base),(-1.28,base-h)],y,.007,mat)
sign('jura',-1.28,-.413,.765,.13,white,True)

# Recessed illuminated cup niches framed by three concentric curves.
for cx,r,top in [(-1.48,.70,1.64),(.15,.46,1.70),(1.46,.46,1.70)]:
    outer=r+.10
    back=opening(cx,top,r)
    panel('Illuminated niche lining',back,.606,.032,light)
    outline=[(cx-outer,0)]+opening(cx,top,r)+[(cx+outer,0),(cx+outer,2.56),(cx-outer,2.56)]
    panel('Maple niche jamb and spandrel',outline,.47,.17,wood)
    arch_band('Walnut architrave',cx,top,r,.031,.458,.025,walnut)
    for level in [1.27,1.62,1.92]:
        half=r if level<=top else math.sqrt(r*r-(level-top)**2)
        block('Walnut cup shelf',cx,.493,level,2*half,.22,.023,walnut,.003)
        for delta in [-.46,.36]:
            cup(cx+half*delta,.464,level+.023,cream if delta<0 else leather,.95)
for left,right in [(-.68,-.41),(.71,.90)]:
    block('Veneer between niches',(left+right)/2,.56,0,right-left,.16,2.56,wood,.002)
sign('jura',-1.48,.446,2.425,.225,red,True)

def reservoir(x,y,z):
    # Alternating staggered rings form cut-glass lozenges, not a smooth cylinder.
    n=16; verts=[]; faces=[]
    for j in range(7):
        for i in range(n):
            a=(i+.5*(j%2))*math.tau/n
            verts.append((x+.053*math.cos(a),y+.053*math.sin(a),z+j*.041))
    for j in range(6):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n
            faces.extend([(a,b,b+n),(a,b+n,a+n)] if j%2 else [(a,b,a+n),(b,b+n,a+n)])
    mesh('Transparent reservoir jacket',verts,faces,crystal)
    # Alternating facets reflect the bright side and dark base of the housing.
    inner=[(x+(vx-x)*.96,y+(vy-y)*.96,vz) for vx,vy,vz in verts]
    tank=mesh('Reservoir cut crystal reflections',inner,faces,steel)
    tank['crystal_facets']=True
    turn('Reservoir water core',(x,y,z),[(0,.044),(.182,.044)],steel,sides=20)
    for h in [0,.246]:turn('Tank collar',(x,y,z+h),[(0,.05),(.008,.055),(.014,.052)],graphite)

def display(x,y,z,w,h):
    block('Inset TFT bezel',x,y,z,w,.016,h,graphite,.004)
    block('Active glass',x,y-.01,z+.008,w-.012,.009,h-.016,screen,.003)
    for i in range(3):
        cx=x+(i-1)*w*.275
        panel('Drink selection icon',[(cx-.008,z+h*.61),(cx+.008,z+h*.61),(cx+.005,z+h*.43),(cx-.005,z+h*.43)],y-.016,.001,coffee)
        block('Drink selection caption',cx,y-.017,z+h*.33,.015,.0015,.002,white,0)

def machine(x,y,z,giga=False,finish=white):
    w,d,h=(.32,.49,.415) if giga else (.219,.445,.323)
    def box(n,a,b,k,ww,dd,hh,m,r=.002):
        return block(n,x+a,y+b,z+k,ww,dd,hh,m,r)
    front=-d/2
    box('Removable waste drawer',0,0,0,w-.027,d-.020,.039,graphite,.012)
    box('Projecting drip tray',0,-.003,.032,w,d,.019,steel,.006)
    box('Cup grate insert',0,front+.070,.052,w*.76,.095,.003,black,.001)
    for i in range(11):
        box('Drain grid bar',(i-5)*w*.063,front+.069,.055,.004,.09,.002,steel,0)
    box('Rounded case',0,.062,.051,w,d-.135,h-.057,finish,.014)
    # Shell cheeks curve around the recessed coffee delivery bay.
    for side in [-1,1]:
        levels=[(.055,.059),(.11,.048),(h*.73,.031),(h-.012,.045)]
        verts=[]
        for height,offset in levels:
            for vx,vy in [(w/2,front+.125),(w/2,front+.072),(w/2-.012,front+.047),(w/2-offset,front+.034),(w/2-offset,front+.129)]:
                verts.append((x+side*vx,y+vy,z+height))
        faces=[tuple(range(5)),tuple(range(15,20))]
        faces.extend((j*5+i,j*5+(i+1)%5,(j+1)*5+(i+1)%5,(j+1)*5+i) for j in range(3) for i in range(5))
        cheek=mesh('Curved cabinet cheek',verts,faces,finish)
        if giga: cheek['satin_black']=True
    box('Height adjustment rail',0,front+.085,.105,.018,.031,h-.117,black)
    headwidth=w*(.56 if giga else .25);headheight=.075 if giga else .066
    box('Adjustable coffee outlet',0,front+.050,h*.48,headwidth,.083,headheight,steel if giga else finish,.011)
    for outlet in ([-.026,.026] if giga else [0]):
        turn('Outlet chrome ferrule',(x+outlet,y+front+.037,z+h*.48-.019),[(0,.009),(.005,.011),(.020,.011)],steel)
    turn('Round badge',(x,y+front+.006,z+h*.48+headheight*.57),[(0,.017),(.003,.017)],black,(0,-1,0),24)
    sign('jura',x,y+front+.001,z+h*.48+headheight*.57,.012,white,True)
    display(x,y+front+.041,z+h*.754,w*(.76 if giga else .57),h*.23)
    if giga:
        for side in [-1,1]:
            center=(x+side*.081,y+.116,z+h-.007)
            turn('Twin bean hopper',center,[(0,.056),(.028,.068),(.052,.070)],crystal)
            turn('Roasted bean fill',center,[(0,.053),(.034,.064)],coffee)
            turn('Aroma lid',(center[0],center[1],center[2]+.049),[(0,.071),(.008,.071),(.011,.067)],black)
    else:
        reservoir(x+w/2+.032,y+.092,z+.043)
        turn('Flush bean cover',(x-.028,y+.099,z+h-.007),[(0,.054),(.006,.055)],graphite)
    for i in range(7):
        box('Side ventilation',-w/2-.001,.13,.084+.009*i,.003,.088,.003,graphite,0)
    # Short, hollow demitasse with visible crema beneath the outlet.
    for offset in ([-.038,.038] if giga else [0]):
        p=(x+offset,y+front+.042,z+.058)
        turn('Tasting glass',p,[(0,.020),(.004,.023),(.057,.030),(.060,.030),(.060,.027),(.009,.019)],crystal, sides=20)
        turn('Espresso and crema',p,[(.007,.018),(.040,.025),(.043,.025)],coffee,sides=20)
    label='GIGA 10' if giga else 'ENA 8'
    box('Product card',w*.79,front+.062,.001,.105,.035,.052,cream,.002)
    sign(label,x+w*.79,y+front+.042,z+.029,.018,black)

def beans(x,y,z):
    levels=[(0,.057,.036),(.021,.066,.042),(.148,.059,.037),(.187,.047,.014),(.201,.046,.012)]
    v=[(x+i*w,y+j*d,z+h) for h,w,d in levels for i,j in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    f=[(0,1,2,3),(16,17,18,19)]+[(4*k+i,4*k+(i+1)%4,4*k+(i+1)%4+4,4*k+i+4) for k in range(4) for i in range(4)]
    mesh('Folded retail coffee pouch',v,f,cream)
    block('Foil folded seam',x,y,z+.194,.099,.027,.013,brass)
    block('Roaster label',x,y-.042,z+.044,.088,.004,.064,walnut)
    sign('jura',x,y-.046,z+.080,.027,white,True)
for i in range(3): beans(1.08+i*.15,.46,1.293)
machine(-1.26,-.036,1.011,True,black)
machine(-.37,-.042,1.011,False,white)
machine(.48,-.014,1.011,False,graphite)
machine(1.42,-.036,1.011,True,graphite)
# Slim swivel tasting chair with dished seat, curved wrap back and brass foot ring.
sx,sy=-2.65,-.01
turn('Flared brass pedestal',(sx,sy,0),[(0,.22),(.016,.215),(.045,.14),(.085,.062),(.14,.031),(.66,.029)],brass)
turn('Foot ring',(sx,sy,.26),[(0,.129),(.008,.137),(.017,.129),(.012,.119),(.003,.119)],brass)
turn('Upholstered seat',(sx,sy,.65),[(0,.167),(.025,.194),(.058,.19),(.068,.165)],leather)
verts=[]
for a in np.linspace(.05,math.pi-.05,21):
    for radius,h in [(.194,.68),(.195,.91),(.173,.918),(.172,.68)]:
        verts.append((sx+radius*math.cos(a),sy+radius*math.sin(a),h))
faces=[tuple(range(4)),tuple(range(80,84))]
faces.extend((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j) for i in range(20) for j in range(4))
mesh('Curved chair back',verts,faces,leather)

print('Editable mesh count:',len(gallery.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
