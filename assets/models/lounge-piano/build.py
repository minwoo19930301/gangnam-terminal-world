"""Editable metre-scale lounge grand. Keyboard faces Blender -Y, game +Z."""
import math
import runpy
import subprocess
from pathlib import Path
import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
piano = bpy.data.collections.new('더 라운지 · 그랜드 피아노와 의자')
scene.collection.children.link(piano)
piano['export_model'] = 'grand'
piano['preview_origin'] = (0,0,0)


def finish(name, value):
    mat = bpy.data.materials.new(name)
    c = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    mat.diffuse_color = (*[(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4) for v in c],1)
    return mat


lacquer = finish('흑단 래커', '24272A')
edge = finish('래커의 연마면', '3B3C3F')
black = finish('흑건', '252326')
ivory = finish('백건', 'F2ECE1')
felt = finish('적갈색 펠트', '8E3F42')
brass = finish('다듬은 황동', 'C5A463')
plate = finish('주철 프레임의 금빛 도장', 'AB8749')
spruce = finish('가문비나무 울림판', 'B48453')
steel = finish('고음 현', 'ADB0AB')
copper = finish('저음 권선', 'AC7655')
leather = finish('의자 검은 가죽', '36302F')
dark = finish('안쪽 그림자', '17171A')


def piece(name, verts, faces, material, bevel=0):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    data.materials.append(material)
    obj=bpy.data.objects.new(name,data)
    piano.objects.link(obj)
    if bevel:
        mod=obj.modifiers.new('모서리 마감', 'BEVEL')
        mod.width=bevel
        mod.segments=2
    return obj


def prism(name, outline, z0, z1, mat, bevel=0):
    n=len(outline)
    pts=[(x,y,z(x,y) if callable(z) else z) for z in (z0,z1) for x,y in outline]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    return piece(name,pts,faces,mat,bevel)


def block(name,x,y,z,w,d,h,mat,r=0):
    return prism(name,[(x-w/2,y-d/2),(x+w/2,y-d/2),(x+w/2,y+d/2),(x-w/2,y+d/2)],z,z+h,mat,r)


def rod(name,a,b,r,mat,sides=8,top=None):
    a,b=Vector(a),Vector(b)
    direction=(b-a).normalized()
    norm=direction.cross(Vector((0,0,1)) if abs(direction.z)<.85 else Vector((0,1,0))).normalized()
    across=direction.cross(norm)
    verts=[point+rad*(norm*math.cos(math.tau*i/sides)+across*math.sin(math.tau*i/sides))
           for point,rad in [(a,r),(b,r if top is None else top)] for i in range(sides)]
    faces=[tuple(reversed(range(sides))),tuple(range(sides,sides*2))]
    faces += [(i,(i+1)%sides,sides+(i+1)%sides,sides+i) for i in range(sides)]
    return piece(name,verts,faces,mat)


def bezier(points,n):
    a,b,c,d=(Vector(p) for p in points)
    return [tuple((1-t)**3*a+3*t*(1-t)**2*b+3*t*t*(1-t)*c+t**3*d)
            for i in range(1,n+1) for t in [i/n]]


# Clockwise at the player's right cheek the bentside curves into the narrow tail.
outline=[(-.79,-.90),(.79,-.90),(.79,-.53)]
outline+=bezier([(.79,-.53),(.79,-.10),(.49,.12),(.34,.35)],12)
outline+=bezier([(.34,.35),(.18,.59),(.23,.98),(.015,1.22)],12)
outline+=bezier([(.015,1.22),(-.16,1.43),(-.67,1.43),(-.775,1.17)],14)
outline+=[(-.79,1.10)]
inner=[(x*.952,.09+(y-.09)*.964) for x,y in outline]
prism('악기 아랫판',outline,.674,.717,lacquer,.007)
prism('울림판',inner,.774,.799,spruce)
# The rim is hollow: the triangular frame, strings and bridge remain visible.
n=len(outline)
rings=[[(x,y,.709) for x,y in outline],[(x,y,.998) for x,y in outline],
       [(x,y,.998) for x,y in inner],[(x,y,.774) for x,y in inner]]
verts=sum(rings,[])
faces=[(k*n+i,k*n+(i+1)%n,((k+1)%4)*n+(i+1)%n,((k+1)%4)*n+i)
       for k in range(4) for i in range(n)]
piece('굽은 측판과 상단 테',verts,faces,lacquer,.004)
block('건반 받침',0,-.994,.696,1.594,.326,.062,lacquer,.012)
# Fixed fallboard lip, cheek blocks, red felt strip and all A0–C8 keys.
block('건반 위 덮개 턱',0,-.852,.881,1.48,.078,.112,lacquer,.011)
block('건반 펠트',0,-.875,.795,1.42,.046,.016,felt,.003)
block('키 베드의 어두운 바탕',0,-1.017,.748,1.46,.285,.029,dark)
w=1.402/52
white_count=0
for midi in range(21,109):
    pitch=midi%12
    if pitch in (1,3,6,8,10):
        x=-1.402/2+white_count*w
        block('흑건 '+str(midi),x,-.951,.806,.0145,.151,.034,black,.0023)
    else:
        x=-1.402/2+(white_count+.5)*w
        block('백건 '+str(midi),x,-1.013,.768,w-.0015,.263,.039,ivory,.0014)
        white_count+=1
assert white_count==52
for x in [-.757,.757]:
    block('건반 옆 치크블록',x,-1.007,.753,.078,.30,.131,lacquer,.012)
# Continuous outer silhouette also serves as a raised hinged lid.
angle=math.radians(29)
def tilt_lid(p,zoff):
    x,y=p
    return (-.775+(x+.775)*math.cos(angle),y,1.008+(x+.775)*math.sin(angle)+zoff)
upper=[tilt_lid(p,.03) for p in outline]
lower=[tilt_lid(p,0) for p in outline]
piece('열린 상판 및 반사면',lower+upper,[tuple(reversed(range(n))),tuple(range(n,2*n))]+
      [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],lacquer,.004)
for a,b in zip(outline[1:],outline[2:]):
    rod('상판 가는 가장자리',tilt_lid(a,.015),tilt_lid(b,.015),.0042,edge,5)
for yy in [-.35,.67]:
    rod('리드 힌지',(-.777,yy,1.014),(-.777,yy+.112,1.014),.015,brass,10)
rod('긴 뚜껑 받침',(.57,-.40,.93),tilt_lid((.53,.02),.001),.0145,lacquer,10)
# Two crossed string fans, two wooden bridges and raised cast plate ribs.
for i in range(70):
    x=-.69+i/69*1.35
    length=1.93-1.35*(i/69)**1.48
    bass=i<18
    for j in range(2 if bass else 3):
        dx=(j-1)*.0031
        rod('저음 권선' if bass else '고음 현',(x+dx,-.62,.884 if bass else .865),
            (x*.52-.32+dx,-.62+length,.876 if bass else .851),.0019 if bass else .0011,
            copper if bass else steel,4)
    rod('튜닝 핀',(x,-.665+(i%2)*.02,.853),(x+.005,-.665+(i%2)*.02,.884),.006,steel,6)
for x,y in [(-.68,1.15),(-.28,1.16),(-.05,.93),(.29,.25),(.54,-.20)]:
    rod('금빛 프레임 스트럿',(x*.53-.06,-.62,.845),(x,y,.855),.021,plate,10)
rod('주철 전면 프레임',(-.70,-.66,.855),(.68,-.66,.855),.039,plate,10)
for i in range(18):
    u=i/17
    x=-.64+u*1.08
    yy=.99-1.20*u**1.6
    rod('브리지',[x,yy,.829],[x+.061,yy-.035-.085*u,.829],.015,spruce,8)
# Sheet-music rack, with open slots over the front edge of the frame.
block('악보 받침 턱',0,-.659,1.011,.89,.079,.026,lacquer,.006)
for x in [-.395,-.278,-.145,0,.145,.278,.395]:
    rod('악보대 세로살',(x,-.636,1.024),(x,-.565,1.236),.011,edge,8)
block('악보대 윗테',0,-.563,1.227,.82,.027,.031,lacquer,.005)
for x,y in [(-.667,-.815),(.667,-.815),(-.385,1.036)]:
    rod('다리 윗칼라',(x,y,.628),(x,y,.688),.083,lacquer,12)
    rod('깎은 피아노 다리',(x,y,.115),(x,y,.650),.044,lacquer,12,top=.066)
    rod('피아노 다리 아래 금테',(x,y,.093),(x,y,.135),.043,brass,12)
    rod('캐스터 축',(x-.043,y,.062),(x+.043,y,.062),.023,brass,10)
    for d in [-.034,.034]:
        rod('황동 쌍바퀴',(x+d-.008,y,.055),(x+d+.008,y,.055),.048,brass,14)
for x in [-.091,.091]:
    rod('리라 기둥',(x,-.679,.145),(x,-.615,.673),.019,lacquer,10)
    rod('리라 지지봉',(x,-.65,.16),(x*3,.065,.690),.009,brass,8)
block('페달 박스',0,-.694,.112,.284,.157,.069,lacquer,.012)
for x in [-.079,0,.079]:
    rod('페달 축',(x,-.71,.143),(x,-.850,.101),.009,brass,8)
    block('황동 페달',x,-.836,.093,.043,.114,.018,brass,.008)
# The bench incorporates a lightly buttoned seat and working-height knobs.
block('벤치 프레임',0,-1.80,.397,.87,.384,.063,lacquer,.015)
block('벤치 가죽 좌판',0,-1.80,.444,.90,.401,.073,leather,.025)
for x in [-.36,.36]:
    for y in [-1.94,-1.66]:
        rod('의자 다리',(x,y,.015),(x,y,.418),.025,lacquer,8,top=.038)
for x in [-.462,.462]:
    rod('벤치 높이 손잡이',(x*.955,-1.80,.419),(x,-1.80,.419),.036,edge,12)
for x in [-.27,-.09,.09,.27]:
    for y in [-1.892,-1.707]:
        rod('쿠션 단추',(x,y,.514),(x,y,.518),.0105,dark,10)

for region in bpy.context.screen.areas:
    if region.type=='VIEW_3D':
        region.spaces.active.shading.color_type='MATERIAL'
        region.spaces.active.region_3d.view_location=(0,-.20,.77)
        region.spaces.active.region_3d.view_distance=4.5
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'grand.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'grand.glb')],check=True)
