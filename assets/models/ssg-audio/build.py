"""Gangnam Scheherazade listening counter. Local +Y is behind the display."""
from pathlib import Path
from math import pi, sin, cos, sqrt, radians
import bpy
import sys
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
from listening import Counter
from finishes import textures, material, map_obj
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_9F_Scheherazade')
bpy.context.scene.collection.children.link(gallery)
palette = dict(walnut='644126', edge='986742', brass='B3915E', ivory='EADDC9',
               pearl='DBCDB7', black='282827', pad='393635', graphite='545655',
               silver='BFC1BE', cream='E4DBCF', copper='996045', screen='151B1C',
               red='E78770', cyan='8DE0DA', violet='A4A0EF', amber='E9BA6D')
palette.update(sampleWhite='FFFFFF',sage='BEC3A2',charcoal='27282B',smoke='42404B',berry='7F3638',
               paleMetal='D2D2CB',champagne='C7A56B',silicone='DEDCCF',cardPaper='D8D4C8',cardInk='575149',
               roseWire='C69884',lavenderWire='A89AB9',bandInk='555251',steel='787B7C',grille='45484A',redLiner='EF3445')
batch='SchezadeDisplay'
parts={}
pose=Matrix.Identity(4)

def linear(n):
    s=int(n,16)/255
    return s/12.92 if s<.04045 else ((s+.055)/1.055)**2.4

def rgb(h):
    return tuple(linear(h[i:i+2]) for i in (0,2,4))+(1,)

def mesh(name, verts, faces, color, smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,data)
    gallery.objects.link(obj)
    obj.matrix_world=pose.copy()
    obj['audioBatch']=batch
    mat=bpy.data.materials.get(color) or bpy.data.materials.new(color)
    mat.diffuse_color=rgb(palette[color])
    data.materials.append(mat)
    for f in data.polygons: f.use_smooth=smooth
    parts.setdefault(batch,[]).append(obj)
    return obj

def skin(name,rings,color,smooth=False,cap=True):
    n=len(rings[0]); faces=[]
    for j in range(len(rings)-1):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    if cap:
        faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
    return mesh(name,[v for ring in rings for v in ring],faces,color,smooth)

def slab(name,x,y,z,w,d,h,col,r=.012):
    r=min(w/2,d/2,r);loop=[]
    for sx,sy,a in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for j in range(4):
            t=radians(a+30*j)
            loop.append((x+sx*(w/2-r)+r*cos(t),y+sy*(d/2-r)+r*sin(t)))
    return skin(name,[[(a,b,k) for a,b in loop] for k in (z,z+h)],col)

def pipe(name,pts,r,col,n=8):
    pts=list(map(Vector,pts));rings=[]
    for j,p in enumerate(pts):
        axis=(pts[min(j+1,len(pts)-1)]-pts[max(0,j-1)]).normalized()
        ref=Vector((0,1,0)) if abs(axis.y)<.92 else Vector((0,0,1))
        u=ref.cross(axis).normalized();v=axis.cross(u)
        rings.append([p+r*(cos(2*pi*i/n)*u+sin(2*pi*i/n)*v) for i in range(n)])
    return skin(name,rings,col,True)

def label(text,x,y,z,size,col):
    data=bpy.data.curves.new(text,'FONT');data.body=text;data.size=size
    data.align_x='CENTER';data.resolution_u=3
    obj=bpy.data.objects.new(text,data);gallery.objects.link(obj)
    bpy.context.view_layer.update()
    m=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    verts=[(x+v.co.x,y-v.co.z,z+v.co.y) for v in m.vertices]
    mesh(text,verts,[list(p.vertices) for p in m.polygons],col)
    bpy.data.objects.remove(obj,do_unlink=True)

# Satin shell inlay, based on the irregular iridescent panels in the opening photo.
def inlay(x,w,z,h):
    nx,ny=28,20; vs=[];fs=[];colors=[]
    for j in range(ny+1):
        for i in range(nx+1):
            a=i/nx;b=j/ny
            vs.append((x+(a-.5)*w,.247,z+b*h))
            wave=sin(37*b+3*sin(a*7+b*3+x)+5*a+x)
            tint=.73+.070*wave+.068*sin(11*a-9*b+x)+.026*cos(25*a+13*b)
            colors.append(tuple(max(0,min(1,c*tint+.22)) for c in (.95,.82,.65))+(1,))
            if i<nx and j<ny:
                k=j*(nx+1)+i;fs.append((k,k+1,k+nx+2,k+nx+1))
    obj=mesh('자개빛 배면',vs,fs,'pearl')
    attr=obj.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
    for item,rgba in zip(attr.data,colors):item.color=rgba
    mat=obj.data.materials[0];mat.use_nodes=True
    if not mat.node_tree.nodes.get('Color Attribute'):
        node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='Finish'
        mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

slab('하부 걸레받이',0,0,.006,2.23,.76,.09,'black')
slab('호두나무 하부장',0,0,.096,2.34,.83,.81,'walnut')
for x in [-.864,-.288,.288,.864]:
    slab('서랍 전면',x,-.416,.14,.566,.018,.72,'edge')
    slab('매입형 손잡이',x,-.431,.793,.17,.015,.011,'brass')
slab('청음대 상판',0,-.02,.905,2.40,.94,.048,'edge')
slab('상판 가죽 매트',0,-.13,.953,2.28,.66,.008,'ivory')
slab('전시 배면',0,.30,.952,2.34,.09,1.26,'walnut')
for x in [-.78,0,.78]: inlay(x,.746,1.005,1.08)
for x in [-1.16,-.39,.39,1.16]:
    slab('세로 목재 몰딩',x,.245,.952,.032,.06,1.24,'edge')
for h in [1.012,1.55,2.086]:
    slab('수평 황동 몰딩',0,.227,h,2.33,.043,.016,'brass')
slab('상단 상호판',0,.227,2.09,2.35,.09,.135,'walnut')
label('Scheherazade',0,.179,2.117,.101,'ivory')

batch='SchezadeHeadphones'
def headphone(x,y,z,angle,style):
    global pose
    pose=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')
    light=style=='cream'; openback=style in ('lcd','wood')
    body='cream' if light else 'black';cush='ivory' if light else 'pad'
    # Crown with a wide, thin cross section and a separate suspension strap.
    def band(rx,rz,base,width,thickness,col):
        rings=[]
        for j in range(23):
            t=pi*j/22
            rings.append([(rx*cos(t)+s*thickness*cos(t),b*width,base+rz*sin(t)+s*thickness*sin(t))
                          for s,b in [(1,-1),(1,1),(-1,1),(-1,-1)]])
        skin('헤드밴드',rings,col)
    band(.092,.106,.099,.014 if openback else .019,.004 if openback else .008,body)
    if openback:band(.086,.080,.102,.019,.0035,'pad')
    for s in [-1,1]:
        # Revolved cushion with an open central well, separate housing and outer face.
        def cup(name,profile,col):
            rings=[]
            for xx,r in profile:
                rings.append([(s*xx,.052*r*cos(2*pi*i/28),.063+.059*r*sin(2*pi*i/28)) for i in range(28)])
            if s<0:rings=[list(reversed(row)) for row in rings]
            return skin(name,rings,col,True)
        cup('이어패드',[(.072,.49),(.058,.51),(.052,.61),(.053,.85),(.060,.97),(.076,1),(.081,.88)],cush)
        cup('드라이버 하우징',[(.076,.95),(.081,1.02),(.092,1.02),(.097,.92)],'copper' if style=='wood' else ('silver' if light else 'graphite'))
        cup('이어컵 외판',[(.094,.94),(.099,.86),(.101,.54),(.102,.04)],body)
        if openback:
            for j in range(-4,5):
                h=j*.009;length=.042*sqrt(1-(h/.053)**2)
                pipe('개방형 그릴',[(s*.102,-length,.063+h),(s*.102,length,.063+h)],.0017,'graphite',5)
        for d in ([-1,1] if openback else [1]):
            pipe('요크 암',[(s*.092,0,.126),(s*.101,d*.028,.111),(s*.098,d*.044,.065)],.0034,'silver' if openback else body)
        pipe('회전 힌지',[(s*.09,0,.119),(s*.09,0,.15)],.0042,'silver')
    pose=Matrix.Identity(4)

def apply_pose(transform):
    global pose
    pose=transform

counter=Counter(mesh,skin,slab,pipe,label,apply_pose)
for j,x in enumerate([-.86,-.58,-.144,.144,.58,.86]):
    for k,h in enumerate([1.235,1.77]):
        if j>=4 and k==0:continue
        style=['lcd','wood','cream','black'][(j+2*k)%4]
        pipe('황동 걸이',[(x,.247,h+.194),(x,.102,h+.194)],.008,'brass')
        headphone(x,.116,h,-24 if j%2==0 else 27,style)
        slab('제품 카드',x,.22,h+.226,.138,.012,.049,'ivory',.002)
        label('LCD-2' if style=='lcd' else 'LCD' if style=='wood' else 'BOSE',x,.213,h+.239,.025,'black')

x,angle=-.55,-47
slab('청음 스탠드 받침',x,-.15,.962,.23,.20,.016,'walnut')
pipe('황동 스탠드',[(x,-.11,.978),(x,-.11,1.267),(x,-.156,1.269)],.008,'brass')
apply_pose(Matrix.Translation((x,-.156,0))@Matrix.Rotation(radians(angle),4,'Z'))
slab('밴드 안장',0,0,1.268,.044,.032,.012,'edge',.007)
apply_pose(Matrix.Identity(4))
counter.solitaire(x,-.156,1.068,angle)
rotation=Matrix.Rotation(radians(angle),3,'Z')
join=(x,-.234,.9815)
for side in (-1,1):
    p=rotation@Vector((side*.087,-.013,.003))+Vector((x,-.156,1.068))
    pipe('이어컵 리드',[p,(p.x,p.y-.012,1.044),(x+side*.041,-.202,.988),join],.0025,'black')
points=[join,(x+.011,-.249,.9815),(x+.026,-.260,.968)]
for i in range(25):
    t=i/24
    points.append(((x+.026)*(1-t)-.084*t+.048*sin(t*4*pi),-.260+.033*t-.095*sin(t*pi)**2,.968))
pipe('청음 케이블',points,.003,'black')

slab('DAC 받침',0,-.24,.962,.256,.169,.025,'walnut')
slab('휴대용 DAC',0,-.245,.987,.104,.071,.023,'graphite',.011)
for i,col in enumerate(['red','amber','amber','ivory']):
    x=-.024+.015*i
    pipe('조작구 테두리',[(x,-.224,1.009),(x,-.224,1.011)],.0067,'black',16)
    pipe('조작구',[(x,-.224,1.01),(x,-.224,1.014)],.0052,col,16)
for y,end in [(-.227,-.084),(-.257,-.072)]:
    pipe('오디오 플러그',[(-.048,y,.998),(-.063,y,.998)],.0048,'silver')
    pipe('케이블 부싱',[(-.063,y,.998),(end,y,.968)],.0039,'black')

counter.cabinet()
product_mat=material(textures())
fixture_mat=bpy.data.materials.new('SchezadeDisplay');fixture_mat.use_nodes=True;fixture_mat.use_fake_user=True
shader=fixture_mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.49
color=fixture_mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='Finish'
fixture_mat.node_tree.links.new(color.outputs['Color'],shader.inputs['Base Color'])
for batch_name,objects in parts.items():
    for obj in objects:
        data=obj.data
        if not data.color_attributes.get('Finish'):
            attr=data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for vertex in attr.data:vertex.color=data.materials[0].diffuse_color
        if batch_name=='SchezadeHeadphones':map_obj(obj,obj.get('audioTexture','plain'),product_mat)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print('EDITABLE PARTS',sum(map(len,parts.values())))
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
