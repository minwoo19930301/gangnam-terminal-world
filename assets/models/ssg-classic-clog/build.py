"""Editable Crocs Classic Clogs, charm counter and display wall in metres."""
from pathlib import Path
from math import pi, tau, sin, cos
import bpy,sys
from mathutils import Matrix
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
gallery=bpy.data.collections.new('SSG_8F_Crocs')
scene.collection.children.link(gallery);m.group=gallery
for name,color in {'sage':'A7BE89','chalk':'F2EEE0','lavender':'B59ACF','melon':'F5A378','sea':'8BCAD2',
        'black':'424445','lemon':'EECB58','pink':'DC879F','green':'82B947','iron':'4C5047',
        'warm':'D9CCB1','timber':'B99470','shell':'E8E6DA','lining':'777A73','leaf':'599066'}.items():
    m.palette[name]=m.material(name,color)
def plate(name,x,d,z,rx,rd,rz,color):
    return m.profile(name,x,d,z,[(rx,.0),(rx,rz)],color,12,rd/rx)

def charm(x,d,z,size,kind):
    if kind==0:
        for n in range(6):
            a=tau*n/6
            plate('꽃잎',x+size*.47*cos(a),d+size*.47*sin(a),z,size*.34,size*.32,.003,'chalk')
        plate('꽃술',x,d,z+.002,size*.30,size*.30,.003,'lemon')
    elif kind==1:
        pts=[(x+size*(.86 if n%2==0 else .42)*cos(n*pi/5),d+size*(.86 if n%2==0 else .42)*sin(n*pi/5),z) for n in range(10)]
        m.piece('별 모양 참',pts+[(a,b,c+.004) for a,b,c in pts],[tuple(reversed(range(10))),tuple(range(10,20))]+[(n,(n+1)%10,(n+1)%10+10,n+10) for n in range(10)],'lemon')
    else:
        plate('체리 참',x-size*.23,d,z,size*.4,size*.4,.004,'pink')
        plate('체리 참',x+size*.38,d+.002,z,size*.37,size*.36,.004,'pink')
        m.rod('초록색 꼭지',[(x-size*.23,d,z+.003),(x,d+size*.73,z+.003),(x+size*.38,d+.002,z+.003)],.0018,'leaf',5)

def clog(x,d,z,yaw,tilt,col,ornament):
    before=set(gallery.objects)
    # Angled quarters around the open heel and a toe box tapering into the sole.
    widths=[(-.137,.026),(-.125,.047),(-.096,.052),(-.045,.055),(.008,.061),
            (.055,.066),(.091,.065),(.118,.053),(.137,.034),(.143,.014)]
    outline=[(w,t) for t,w in widths]+[(-w,t) for t,w in reversed(widths)]
    def sole(name,rings,mat):
        vs=[(u*s,(v-.003)*s+.003,h+.010*(max(0,v)/.143)**3) for s,h in rings for u,v in outline]
        n=len(outline);faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
        faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]);m.piece(name,vs,faces,mat)
    sole('일체형 폼 밑창',[(.93,0),(.99,.004),(1,.027),(.97,.030),(.88,.023)],col)
    sole('음각 풋베드',[(.84,.024),(.85,.025)],col)
    # Muted interior visible through the thirteen openings.
    inner=[(-w*.78,t,.031) for t,w in widths if -.035<t<.138]
    m.piece('앞코 안쪽의 그늘진 풋베드',inner+[(abs(a),b,h) for a,b,h in reversed(inner)],
            [tuple(reversed(range(2*len(inner))))],'lining')
    def top(u,v):
        depth=-.040+.180*v
        w=.055+.012*sin(pi*v)-.034*v**5
        return (u*w,depth,.037+(.061-.025*v)*(1-.73*u*u)*(1-.80*v**4))
    # Each ventilated patch has an outer boundary, a true opening and a short inner wall.
    coords=[(-1,-1),(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0)]
    for j in range(5):
        for i in range(3):
            midu=-1+(i+.5)*2/3;midv=(j+.5)/5
            outer=[top(midu+a/3,midv+b/10) for a,b in coords]
            if j==4 and i!=1:
                m.piece('매끈한 앞코',outer,[(0,1,2,3,4,5,6,7)],col);continue
            hole=[top(midu+.135*cos(-.75*pi+k*tau/8),midv+.037*sin(-.75*pi+k*tau/8)) for k in range(8)]
            vs=outer+hole+[(a,b,h-.0036) for a,b,h in hole]
            faces=[(k,(k+1)%8,8+(k+1)%8,8+k) for k in range(8)]+[(8+k,8+(k+1)%8,16+(k+1)%8,16+k) for k in range(8)]
            m.piece('클로그 통기구',vs,faces,col)
    # Connect the forefoot canopy to the sole. Leave the rear throat open.
    for side in [-1,1]:
        pts=[top(side,k/10) for k in range(11)]
        vs=pts+[(u,v,.027+.010*(max(0,v)/.143)**3) for u,v,h in pts]
        m.piece('측면 갑피',vs,[(k,k+1,k+12,k+11) for k in range(10)],col)
    toe=[top(-1+2*k/8,1) for k in range(9)]
    m.piece('앞코 마감',toe+[(u,v+.004,.038) for u,v,h in toe],[(k,k+1,k+10,k+9) for k in range(8)],col)
    points=[]
    for n in range(25):
        a=pi*n/24
        for dd,h in [(0,0),(.003,0),(.003,.017),(0,.017)]:
            points.append((.059*cos(a),-.034-(.098+dd)*sin(a),.044+.025*sin(a)+h))
    m.piece('회전식 뒤꿈치 스트랩',points,[(4*k+j,4*k+(j+1)%4,4*k+4+(j+1)%4,4*k+4+j) for k in range(24) for j in range(4)],col)
    for side in [-1,1]:
        m.rod('스트랩 피벗',[(side*.056,-.034,.053),(side*.062,-.034,.053)],.008,'lining',12)
    if ornament is not None:
        a,b,h=top(0,.49);charm(a,b,h+.0003,.013,ornament)
    transform=Matrix.Translation((x,-d,z))@Matrix.Rotation(yaw,4,'Z')@Matrix.Rotation(tilt,4,'X')
    for ob in set(gallery.objects)-before:ob.matrix_world=transform

m.block('상품 벽의 걸레받이',0,-.53,0,3.90,.16,.12,'iron',.012)
m.block('밝은 진열 벽',0,-.57,.12,3.90,.12,2.40,'shell',.020)
for j in range(3):
    h=.56+j*.49
    m.block('신발 진열 선반',-.48,-.39,h,2.56,.47,.044,'chalk',.009)
    m.block('선반의 자작나무 단면',-.48,-.150,h+.006,2.54,.012,.024,'timber')
    for k in range(5):
        colour=['sage','chalk','lavender','melon','sea','black','lemon','pink'][(k+3*j)%8]
        clog(-1.50+k*.51,-.365,h+.046,-.52,.00,colour,(j+k)%3 if k%2==0 else None)
m.block('참 진열대 하부장',1.20,-.09,0,1.13,.75,.80,'green',.028)
m.block('참 진열대 상판',1.20,-.09,.80,1.19,.80,.055,'chalk',.012)
for j in range(2):
    for i in range(3):
        x=.85+i*.34;d=-.24+j*.30
        m.block('참 견본 트레이',x,d,.857,.30,.26,.019,'warm',.008)
        for k in range(6):charm(x+(k%3-1)*.083,d+(k//3-.5)*.104,.876,.030,(i+j+k)%3)
for i,col in enumerate(['lemon','lavender']):
    m.block('단차를 둔 시착용 받침',-.81+i*.55,.28,0,.48,.53,.34+.16*i,'warm',.025)
    clog(-.81+i*.55,.27,.34+.16*i,-.81,0,col,i)
def lettering(text,x,d,z,size):
    cu=bpy.data.curves.new(text,'FONT');cu.body=text;cu.size=size;cu.align_x='CENTER';cu.extrude=.002
    font=Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
    if font.exists():cu.font=bpy.data.fonts.load(str(font))
    o=bpy.data.objects.new(text,cu);gallery.objects.link(o);o.location=(x,-d,z);o.rotation_euler.x=pi/2
    cu.materials.append(m.palette['iron']);bpy.context.view_layer.update();mesh=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    mesh.transform(o.matrix_world);txt=bpy.data.objects.new(text+' 입체 글자',mesh);gallery.objects.link(txt);bpy.data.objects.remove(o,do_unlink=True)
lettering('crocs',-.48,-.496,2.02,.43)
lettering('Jibbitz',1.20,-.496,1.43,.21)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gallery.blend'),compress=True)
bake_collection(gallery,'CrocsClassicClogs',here/'gallery.glb',preserve_smoothing=True,simplification=(.72,.00024))
