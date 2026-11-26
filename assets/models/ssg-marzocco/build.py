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
gallery = bpy.data.collections.new('SSG_9F_LaMarzocco')
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
red = paint('Vermilion lacquer','d4352e')
black = paint('Black phenolic','252623')
steel = paint('Turned stainless','b8c1c2','Steel')
edge = paint('Machined highlights','e9ece8','Steel')
pewter = paint('Brushed pewter','bcbab1','Steel')
ivory = paint('Warm ceramic','f5f1df')
blue = paint('Cobalt lacquer','203e94')
darkblue = paint('Cobalt inside','112861')
gray = paint('Mineral counter','b5afa6')
brown = paint('Coffee beans','644938')
gold = paint('Brass coupling','bc9661','Steel')
dial = paint('Gauge face','f4eada')
art = paint('Turquoise mineral panel','d7ded9','Artwork')

light = paint('Illuminated ivory letters','fffdf0','Lettering')
light_shader=light.node_tree.nodes.get('Principled BSDF')
emission=light_shader.inputs.get('Emission Color') or light_shader.inputs.get('Emission')
emission.default_value=(.94,.96,1,1)
light_shader.inputs['Emission Strength'].default_value=.85
hopper = paint('Clear hopper shell','e7edf0','Hopper')
hopper.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.44
hopper.blend_method='BLEND'

# Original mottled, folded grain texture. No source photograph is distributed.
n=512
gy,gx=np.mgrid[0:n,0:n]*2*math.pi/n
warp = gx+1.4*np.sin(gy+.8*np.sin(gx*2))+.72*np.sin(gx+gy*2)+.15*np.sin(gy*6+gx*3)
fold = np.sin(4*warp+2*np.sin(gy*2+warp))+.42*np.sin(9*warp+gy*3)
grain=np.random.default_rng(917).normal(0,1,(n,n))
vein=np.clip((fold-.56)*1.38,0,1)*(.28+.72*np.sin(16*warp+gy)**2)*np.clip(.76+grain*.30,0,1)
fleck=np.clip(.068*grain+.035*np.sin(57*warp),-.16,.13)
rgb=np.clip(np.array([.84,.86,.83])[None,None,:]-vein[:,:,None]*[.53,.34,.34]+fleck[:,:,None],0,1)
pixels=np.ones((n,n,4),np.float32);pixels[:,:,:3]=rgb
img=bpy.data.images.new('Mineral swirls',width=n,height=n,alpha=False)
img.pixels.foreach_set(pixels.ravel()); img.pack()
tex=art.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
art.node_tree.links.new(tex.outputs['Color'],art.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

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
    if mat==art:
        uv=data.uv_layers.new(name='Mineral grain')
        for loop in data.loops:
            x,y,z=data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv=(x*.68+y*.27+z*.13,z*1.12+y*.3)
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

def espresso(x,y,z,shell,wide=.37):
    w=wide
    def box(n,a,b,h,ww,dd,hh,m,r=.002):
        return block(n,x+a,y+b,z+h,ww,dd,hh,m,r)
    def point(a,b,h):return (x+a,y+b,z+h)
    for a in (-1,1):
        for b in (-.16,.15):
            turn('Rubber levelling foot',point(a*(w/2-.033),b,0),[(0,.019),(.018,.022),(.031,.018)],black)
    box('Chassis underside',0,0,.029,w-.012,.427,.049,black,.008)
    box('Enamel drip tray lip',0,-.139,.065,w,.170,.044,shell,.008)
    box('Tray inset',0,-.142,.109,w-.018,.149,.004,black)
    for i in range(16):
        a=(i/15-.5)*(w-.03)
        rod('Drip grid',point(a,-.209,.116),point(a,-.078,.116),.0028,edge,8)
    box('Boiler cover',0,.089,.074,w-.018,.238,.266,steel,.009)
    box('Polished front backsplash',0,-.035,.107,w-.029,.014,.174,pewter)
    # Folded asymmetric side cheeks. The lower leading edge recedes below the brew deck.
    outline=[(-.065,.071),(.211,.071),(.211,.361),(.175,.387),(-.173,.387),(-.191,.366),(-.180,.275),(-.103,.253)]
    for side in (-1,1):
        xx=x+side*(w/2-.006)
        verts=[(xx+dx,y+b,z+h) for dx in (-.007,.007) for b,h in outline]
        count=len(outline)
        faces=[tuple(range(count)),tuple(range(count,count*2))]+[(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
        mesh('Enamel folded side cheek',verts,faces,shell,.003)
        for i in range(5):
            box('Side cooling louvre',side*(w/2+.002),.125,.276+i*.009,.002,.105,.003,black,.0003)
    box('Brew deck fascia',0,-.113,.278,w-.018,.157,.099,shell,.009)
    box('Cup warming deck',0,.012,.375,w-.022,.352,.012,pewter,.004)
    for i in range(9):
        box('Warming deck rib',0,-.096+i*.028,.387,w-.055,.004,.003,edge,.0008)
    for a in (-w/2+.019,w/2-.019):
        bend('Cup fence',[point(a,-.105,.39),point(a,-.105,.417),point(a,-.098,.423),point(a,.166,.423),point(a,.176,.416),point(a,.176,.39)],.004,steel)
    if shell==steel:
        # Raised brew group, exposed manometer and paddle on the steel display machine.
        turn('Exposed brew tower',point(0,-.124,.378),[(0,.045),(.019,.049),(.028,.046),(.036,.041),(.066,.043),(.073,.049),(.080,.046)],edge)
        turn('Upper gauge case',point(0,-.116,.488),[(0,.033),(.019,.034),(.025,.031)],steel,(0,-1,0))
        turn('Upper manometer',point(0,-.142,.488),[(0,.029),(.002,.028)],dial,(0,-1,0))
        rod('Upper gauge needle',point(0,-.146,.488),point(.012,-.146,.504),.0016,black)
        rod('Paddle stem',point(.030,-.125,.439),point(.071,-.130,.441),.007,steel)
        rod('Manual paddle',point(.066,-.130,.441),point(.148,-.145,.446),.010,black,16,.016)
        bend('Arched steel pipe',[point(-.133,-.09,.374),point(-.133,-.09,.448),point(-.130,-.104,.464),point(-.124,-.129,.464),point(-.119,-.144,.447),point(-.119,-.153,.414)],.006,edge)
    for a in (-.103,.103):
        axis=(0,-1,0)
        turn('Gauge bezel',point(a,-.190,.318),[(0,.024),(.006,.024),(.010,.021)],edge,axis)
        turn('Pressure gauge',point(a,-.201,.318),[(0,.019),(.001,.019)],dial,axis)
        bend('Gauge needle',[point(a-.004,-.204,.314),point(a+.009,-.204,.327)],.0013,black)
        for t in np.linspace(-2.45,2.45,9):
            end=point(a+.016*math.sin(t),-.204,.318+.016*math.cos(t))
            start=point(a+.013*math.sin(t),-.204,.318+.013*math.cos(t))
            rod('Gauge graduation',start,end,.0007,black,6)
    turn('Group head collar',point(0,-.119,.230),[(0,.036),(.009,.043),(.019,.044),(.023,.036),(.043,.045)],edge)
    turn('Portafilter basket',point(0,-.122,.212),[(0,.025),(.009,.036),(.022,.038)],pewter)
    rod('Portafilter tang',point(.010,-.143,.226),point(.028,-.201,.226),.009,edge)
    rod('Portafilter grip',point(.028,-.195,.226),point(.060,-.306,.213),.012,black,16,.018)
    for a in (-.014,.014):
        bend('Twin spout',[point(0,-.123,.218),point(a,-.123,.207),point(a,-.125,.197)],.0048,steel)
    for side in (-1,1):
        a=side*(w/2-.034)
        turn('Valve boss',point(a,-.16,.347),[(0,.019),(.033,.021)],steel,(0,-1,0))
        turn('Valve knob',point(a,-.194,.347),[(0,.021),(.015,.025),(.030,.024),(.033,.019)],black,(0,-1,0),16)
        pts=[point(a,-.132,.277),point(a,-.142,.256),point(a+side*.018,-.152,.237),point(a+side*.028,-.175,.212),point(a+side*.016,-.196,.158)]
        bend('Articulated wand',pts,.0057,edge)
        rod('Insulated wand sleeve',pts[2],pts[3],.009,black)
        rod('Wand nozzle',pts[-1],point(a+side*.014,-.199,.149),.007,steel)
    box('Paddle pivot',0,-.191,.348,.041,.023,.019,pewter)
    box('Brew paddle',0,-.213,.357,.090,.029,.013,black,.005)
    lettering('Front maker badge','la marzocco',x,y-.226,z+.085,.018,ivory)
    cup(x-.032,y-.14,z+.118,ivory,.72)

def grinder(x,y,z,body):
    def p(a,b,h):return (x+a,y+b,z+h)
    block('Grinder foot',x,y,z,.17,.218,.024,black,.007)
    block('Dosing tray',x,y-.058,z+.024,.15,.11,.009,steel)
    block('Motor pillar',x,y+.034,z+.024,.139,.131,.163,body,.010)
    block('Burr chamber',x,y+.002,z+.183,.179,.177,.082,body,.010)
    turn('Adjustment collar',p(0,.029,.263),[(0,.067),(.012,.067),(.016,.064),(.026,.064)],black)
    for i in range(24):
        a=i*math.tau/24
        rod('Dial knurl',p(.066*math.cos(a),.029+.066*math.sin(a),.265),p(.066*math.cos(a),.029+.066*math.sin(a),.275),.0016,steel,6)
    turn('Bean hopper',p(0,.029,.288),[(0,.034),(.017,.036),(.082,.073),(.109,.074)],hopper)
    turn('Visible bean charge',p(0,.029,.298),[(0,.031),(.049,.059),(.061,.055)],brown)
    rng=np.random.default_rng(142)
    for i in range(30):
        a=i*2.40; radial=.048*math.sqrt(i/30)
        turn('Roasted coffee',p(radial*math.cos(a),.029+radial*math.sin(a),.358+rng.uniform(0,.004)),[(0,.003),(.003,.006),(.006,.0055),(.008,.002)],brown,sides=7)
    turn('Hopper cap',p(0,.029,.396),[(0,.075),(.006,.077),(.011,.073)],black)
    turn('Chute',p(0,-.071,.186),[(0,.023),(.028,.017)],steel,(0,-.34,-.94))
    for side in (-1,1):
        rod('Portafilter fork',p(side*.026,-.031,.124),p(side*.032,-.100,.123),.004,edge)
    lettering('Grinder badge','LA MARZOCCO',x,y-.088,z+.226,.016,red)

# Abutting plinths have split heights and finishes as in the launch photographs.
block('Dark recessed toe',0,.08,.005,3.78,.64,.07,black)
block('Mineral presentation island',-.99,.04,.075,1.85,.77,.807,gray,.008)
block('Tall satin island',.91,.07,.075,1.93,.70,.891,pewter,.009)
block('Pale presentation slab',-.99,.04,.882,1.88,.79,.034,ivory,.004)
block('Steel presentation slab',.91,.07,.966,1.96,.72,.022,steel,.004)
for i in range(5):
    block('Veined art panel',-.99+.66*i,.494,.20,.654,.074,1.84,art,.003)
block('Cup display ledge',.33,.353,1.422,3.28,.237,.021,steel)
block('Shelf light line',.33,.455,1.445,3.26,.017,.014,ivory)
lettering('Gallery wordmark','la marzocco',.28,.437,1.75,.224,light)
for i in range(6):cup(-1.07+i*.54,.334,1.443,black if i%2==0 else ivory)
# Distinctive blue recessed end display with three silver saucer shelves.
block('Cobalt niche back',-1.65,.397,.92,.61,.080,1.14,blue)
for xx in (-1.96,-1.34):
    block('Niche jamb',xx,.272,.92,.031,.31,1.17,pewter)
for h in (.923,1.311,1.697,2.065):
    block('Niche shelf',-1.65,.263,h,.63,.33,.018,steel)
    if h<2:cup(-1.65,.251,h+.019,ivory if h>1 else black,1.13)
espresso(-.89,-.040,.916,red)
grinder(-.47,-.025,.916,ivory)
espresso(.53,-.022,.988,steel,.42)
grinder(1.04,-.012,.988,black)
for x,z in [(-1.22,.916),(.13,.988)]:
    # Folded label holder, with short product-family inscription.
    block('Label foot',x,-.22,z,.119,.06,.007,pewter)
    block('Label tablet',x,-.208,z+.006,.118,.007,.057,ivory)
    lettering('Model family','Linea' if x<0 else 'la marzocco',x,-.214,z+.037,.020,black)
for x in (1.35,1.54):cup(x,-.079,.988,ivory)

bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
import runpy
runpy.run_path(str(OUT/'export.py'))
