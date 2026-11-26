"""The Sweet Park island photographed by the shop: brass case, pale moon jars and wrapped fruit rice cakes."""
from math import cos, sin, pi, tau
from pathlib import Path
import random, sys, json
import bpy
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as shop
bpy.ops.wm.read_factory_settings(use_empty=True)
group=bpy.data.collections.new('HanjungsunGangnam')
bpy.context.scene.collection.children.link(group);shop.group=group
colours={
    'wood':'c09b72','end':'bb926b','shadow':'8c674a','edge':'d4af82','grain':'ac865e',
    'slat':'9a6d48','dark':'70503c','stone':'e7d6be','vein':'c0ad97','veinLight':'f6e9d8',
    'metal':'bea16a','gold':'d6ba82','steel':'97998f','milk':'ffebba','cream':'f3e6d3',
    'pot':'eee5d6','rim':'e2d7c3','inside':'7d715e','mark':'282626','ink':'eee7d7',
    'tray':'53514b','trayEdge':'b6aea0','red':'cf4654','rose':'e67a85','lilac':'a66d9f',
    'plum':'804666','purple':'963762','amber':'dba34e','orange':'e6b966','sheet':'fcf0cd',
    'skin':'c99e80','hair':'342a25','seam':'d4c7b4','pants':'827a6b','shoe':'4b4640','yellow':'efba4c','white':'faf6ed','tape':'ebdbcb'}
for name,code in colours.items():shop.palette[name]=shop.material(name,code,.3 if name in ['metal','gold','steel'] else 0)
rng=random.Random(37)
def box(name,x,d,z,w,depth,h,tone,bevel=0):return shop.block(name,x,d,z,w,depth,h,tone,bevel)
def poly(name,verts,faces,tone):return shop.piece(name,verts,faces,tone)
def prism(name,x0,x1,d0,d1,cut,z,h,tone):
    ring=[(x0+cut,d0),(x1-cut,d0),(x1,d0+cut),(x1,d1-cut),(x1-cut,d1),(x0+cut,d1),(x0,d1-cut),(x0,d0+cut)]
    return poly(name,[(x,d,z+dz)for dz in [0,h] for x,d in ring],
                [tuple(range(7,-1,-1)),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)],tone)

# Local +d points to the public edge; stone top, fluted oak below it.
prism('Oak island base',-2.89,2.89,-.55,.55,.17,.035,.745,'wood')
prism('Shadow plinth',-2.83,2.83,-.50,.50,.15,.006,.08,'dark')
for i in range(90):
    x=-2.69+i*.0605
    box('Reeded oak · public counter',x,.552,.10,.041,.018,.61,'slat' if i%4 else 'wood')
for side in [-1,1]:
    for i in range(13):box('Reeded oak · corner',side*2.892,-.365+i*.059,.10,.018,.038,.61,'slat')
prism('Belt of brushed brass',-2.925,2.925,-.58,.58,.18,.710,.047,'metal')
prism('Warm line below marble edge',-2.927,2.927,-.582,.582,.18,.755,.015,'milk')
prism('Rounded ivory stone sales counter',-2.944,2.944,-.588,.588,.183,.772,.083,'stone')
for i in range(110):
    x=rng.uniform(-2.70,2.67);z=rng.uniform(.779,.84);dx=rng.uniform(.018,.11)
    poly('Light marble vein',[(x,.589,z),(x+dx*.37,.589,z+.004),(x+dx,.589,z-.008),
         (x+dx*.39,.589,z+.007)],[(0,1,2,3)],'vein' if i%3 else 'veinLight')

for i in range(72):
    x=rng.uniform(-2.62,2.58);d=rng.uniform(-.48,.51);width=rng.uniform(.0009,.0036)
    points=[(x,d,.8556)]
    for j in range(rng.randint(2,5)):
        x+=rng.uniform(.015,.069);d+=rng.uniform(-.020,.022)
        points.append((x,d,.8556))
    poly('Fine mineral line in the marble top',points+[(px,pd+width,pz)for px,pd,pz in points],
         [(k,k+1,k+1+len(points),k+len(points))for k in range(len(points)-1)],'vein' if i%3 else 'veinLight')

# Single glass confectionery case at the left, as seen in the brand's own photograph.
# Transparent glass is supplied by the existing lightweight world glass batch.
left,right=-2.79,.30;back,front=-.46,.46
box('Case floor · ivory', (left+right)/2,0,.855,right-left,.91,.049,'cream')
for z,h,c in [( .903,.026,'steel'),(1.379,.037,'metal'),(1.416,.016,'gold')]:
    for d in [back,front]:box('Brass show-case rail',(left+right)/2,d,z,right-left,.025,h,c)
    for x in [left,right]:box('End stile',x,0,z,.025,front-back,h,c)
for x in [left,(left+right)/2,right]:
    for d in [back,front]:box('Polished case mullion',x,d,.924,.021,.021,.463,'metal')
for d in [back+.019,front-.019]:
    box('Under-rail linear food light',(left+right)/2,d,1.374,right-left-.043,.013,.009,'white')

def wrapped(x,d,z,a,tone,var):
    # Angular waxed-paper knot and a pleated fan at either side. Keep matched
    # geometries on each platter but vary the actual paper folds among parcels.
    count=8
    verts=[];faces=[]
    rings=[(-.079,.062),(-.047,.028),(-.034,.048),(0,.060),(.034,.05),(.047,.027),(.086,.058)]
    for k,(u,r) in enumerate(rings):
        for j in range(count):
            t=tau*j/count;rr=r*(1+rng.uniform(-.13,.13));v=rr*cos(t);h=rr*sin(t)
            u1=u+(rng.uniform(-.015,.015) if k in (0,6) else 0)
            verts.append((x+u1*cos(a)-v*sin(a),d+u1*sin(a)+v*cos(a),z+h+(abs(u1)*.16)))
    for k in range(len(rings)-1):
        for j in range(count):faces.append((k*count+j,k*count+(j+1)%count,(k+1)*count+(j+1)%count,(k+1)*count+j))
    ob=poly('Folded fruit-rice-cake paper',verts,faces,tone);ob.data.materials.append(shop.palette[var]);ob.data.materials.append(shop.palette['sheet'])
    for i,f in enumerate(ob.data.polygons):
        if i%11 in (2,7):f.material_index=1
        elif i%19==3:f.material_index=2
    # Round seals on the gathered paper, from the close branch photograph.
    pts=[(x+.021*cos(tau*j/9),d+.014*sin(tau*j/9),z+.059+.002*cos(tau*j/9)) for j in range(9)]
    poly('Pale paper seal',pts,[tuple(range(9))],'tape')
for i,(tone,light) in enumerate([('purple','lilac'),('amber','yellow'),('plum','rose'),('red','rose')]):
    x=left+.46+i*.72
    shop.profile('Oval metal platter',x,.08,.905,[(.29,0),(.30,.010),(.32,.02),(.325,.026)],'trayEdge',22,.85)
    shop.profile('Dark platter centre',x,.08,.93,[(.296,0),(.286,.006)],'tray',20,.8)
    for row in range(3):
        for col in range(3):
            wrapped(x+(col-1)*.136+rng.uniform(-.02,.02),.08+(row-1)*.11+rng.uniform(-.012,.012),
                    .982,rng.uniform(-1.3,1.3),tone,light)
    for j in range(5):
        a=j*tau/5
        wrapped(x+.10*cos(a),.08+.095*sin(a),1.062,rng.uniform(-.9,.9),tone,light)
    wrapped(x,.08,1.112,rng.uniform(-.8,.8),tone,light)

# Ceramics cabinet behind the open service surface. Bays curve very slightly
# around the end, preserving the existing visitor queue to the west.
def cabinet(cx,cd,width,cols,a):
    def coord(x,d):return cx+x*cos(a)-d*sin(a),cd+x*sin(a)+d*cos(a)
    def panel(name,x,d,z,w,dep,h,color):
        px,pd=coord(x,d);o=box(name,0,0,0,w,dep,h,color)
        o.location=(px,-pd,z);o.rotation_euler.z=-a;return o
    panel('Oak cupboard behind the service counter',0,0,.055,width,.38,.735,'end')
    panel('Shadowed back of the ceramic cubbies',0,-.178,.79,width,.028,1.29,'shadow')
    for j in range(4):
        panel('Shelf with a pale oak edge',0,.002,.786+j*.417,width,.38,.044,'wood')
        panel('Oak edge strip',0,.194,.786+j*.417,width,.009,.044,'edge')
    for j in range(cols+1):
        panel('Ceramic cabinet upright',(j/cols-.5)*width,0,.79,.032,.38,1.295,'wood')
    for row in range(3):
        for col in range(cols):
            x,d=coord((col+.5-cols/2)*width/cols,.035)
            z=.83+row*.417;r=.130+rng.uniform(-.012,.009)
            rings=[(r*.49,0),(r*.53,.018),(r*.56,.032),(r*.81,.059),(r*.98,.117),
              (r,.172),(r*.88,.218),(r*.66,.248),(r*.425,.26),(r*.41,.273),(r*.45,.278),(r*.45,.288)]
            jar=shop.profile('White moon jar · wheel-thrown profile',x,d,z,rings,'pot',16,.98)
            for f in jar.data.polygons:f.use_smooth=True
            shop.profile('Recess below the narrow mouth',x,d,z+.2885,[(r*.34,0),(r*.33,.001)],'inside',12)
cabinet(1.30,-1.20,2.14,5,0)
cabinet(2.37,-1.64,.88,2,-pi/2)

# Anonymous attendant in the branch's ivory wrap jacket, headscarf and mask.
# The body is behind the sales top and has no collision in the public aisle.
cx,cd=.56,-.78
def figure(name,z,levels,color,segments=16):
    return shop.profile(name,cx,cd,z,levels,color,segments,.64)
figure('Dark shoes and trousers',.03,[(.15,0),(.16,.35),(.14,.73)],'pants',12)
figure('Ivory wrap jacket',.66,[(.194,0),(.203,.12),(.17,.30),(.216,.53),(.17,.61),(.082,.64)],'cream')
figure('Ivory headscarf',1.46,[(.126,0),(.14,.11),(.116,.195),(.064,.236),(.023,.242)],'white')
head=shop.profile('Anonymous attendant face',cx,cd+.049,1.343,[(.071,0),(.106,.048),(.112,.144),(.093,.185),(.068,.214)],'skin',16,.71)
for f in head.data.polygons:f.use_smooth=True
for side in [-1,1]:
    eye=box('Narrow eye',cx+side*.041,cd+.12,1.471,.028,.007,.006,'hair')
    shop.rod('Folded jacket sleeve',[(cx+side*.157,cd,1.215),(cx+side*.216,cd+.028,1.028),(cx+side*.071,cd+.154,.918)],.069,'cream',10)
    shop.rod('Uncovered hand',[(cx+side*.056,cd+.154,.927),(cx-side*.008,cd+.161,.904)],.032,'skin',10)
    shop.rod('Gathered scarf seam',[(cx+side*.108,cd+.055,1.512),(cx+side*.118,cd+.022,1.593),(cx+side*.061,cd-.011,1.67)],.008,'seam',6)
poly('Face mask',[(cx-.094,cd+.087,1.450),(cx,cd+.135,1.445),(cx+.094,cd+.087,1.450),(cx+.061,cd+.111,1.369),(cx,cd+.138,1.35),(cx-.061,cd+.111,1.369)],[(0,1,4,5),(1,2,3,4)],'white')
for side in [-1,1]:
    shop.rod('Wrap jacket collar',[(cx+side*.073,cd+.055,1.30),(cx,cd+.128,1.20),(cx-side*.12,cd+.092,1.13)],.016,'seam',6)
box('White apron tie',cx,cd+.139,.949,.325,.019,.045,'white',.009)

# Back-painted plaque on the shelf. The original logo silhouette is a trace of
# the public brand masthead; its two lines are also visible in the branch photo.
box('Brass-rimmed Han Jung Sun plaque',.34,-1.04,2.092,.50,.042,.222,'metal',.027)
box('Soft black lacquer plaque',.34,-1.013,2.101,.483,.014,.207,'mark',.02)
data=json.loads((here/'wordmark.json').read_text())
curve=bpy.data.curves.new('韓貞仙 · HANJUNGSUN','CURVE');curve.dimensions='2D';curve.fill_mode='BOTH'
for loop in data['rings']:
    spline=curve.splines.new('POLY');spline.points.add(len(loop)-1);spline.use_cyclic_u=True
    for point,(x,y) in zip(spline.points,loop):
        point.co=((x/data['width']-.5)*.37,(data['height']/2-y)/data['width']*.37,0,1)
obj=bpy.data.objects.new('韓貞仙 · HANJUNGSUN',curve);group.objects.link(obj);curve.materials.append(shop.palette['ink'])
obj.location=(.34,1.003,2.207);obj.rotation_euler.x=pi/2
bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH')
# Colour variation in the photographed diffuse shelving light, indexed by each
# editable polygon's orientation and position; no runtime lights or image atlas.
for source in group.objects:
    if source.type!='MESH':continue
    me=source.data
    tint=me.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    me.update()
    for face in me.polygons:
        mat=me.materials[face.material_index];base=mat.diffuse_color
        jar=source.name.startswith('White moon jar')
        for li in face.loop_indices:
            v=me.vertices[me.loops[li].vertex_index]
            n=v.normal if jar else face.normal
            # The display photo's key is above and to the customer's left.
            light=max(0.0,min(1.0, .5+n.z*.22-n.x*.29-n.y*.17))
            scale=.78+.27*light
            if jar:
                scale=.29+.91*light
            elif source.name.startswith('Folded fruit'):
                scale=.70+.42*light
            elif 'back of the ceramic' in source.name:scale=.76
            elif mat.name in ('milk','white'):scale=1
            tint.data[li].color=tuple(min(1,c*scale)for c in base[:3])+(1,)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'island.blend'),compress=True)
