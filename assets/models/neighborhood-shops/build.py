"""Editable shelving, dishes and buffet inserts for two Banpo neighbourhood restaurants."""
from math import cos, sin, pi
from pathlib import Path
from random import Random
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
palette={}
rng=Random(3719)


def collection(name,offset):
    c=bpy.data.collections.new(name)
    c['export_model']=name
    c['preview_origin']=offset
    bpy.context.scene.collection.children.link(c)
    return c


def paint(code,lit=False):
    if (code,lit) not in palette:
        m=bpy.data.materials.new(('빛 ' if lit else '')+code)
        srgb=[int(code[k:k+2],16)/255 for k in (0,2,4)]
        m.diffuse_color=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in srgb]+[1]
        m['lit_face']=lit
        palette[code,lit]=m
    return palette[code,lit]


def part(name,verts,faces,mat,lit=False):
    ctr=sum((Vector(v) for v in verts),Vector())/len(verts)
    data=bpy.data.meshes.new(name)
    data.from_pydata([Vector(v)-ctr for v in verts],[],faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    coll.objects.link(obj)
    obj.location=ctr+Vector(coll['preview_origin'])
    obj.data.materials.append(paint(mat,lit))
    return obj


def box(name,x,y,z,w,d,h,mat,lit=False):
    return part(name,[(x+a*w/2,y+b*d/2,z+c*h/2) for c in (-1,1) for b in (-1,1) for a in (-1,1)],
                [(2,3,1,0),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],mat,lit)


def lathe(name,x,y,z,profile,mat,sy=1,sides=24,rough=0,lit=False):
    pts=[]
    for h,r in profile:
        for n in range(sides):
            a=2*pi*n/sides
            rr=r*(1+rng.uniform(-rough,rough))
            pts.append((x+cos(a)*rr,y+sin(a)*rr*sy,z+h+rng.uniform(-rough,rough)*r*.33))
    fs=[(j*sides+i,j*sides+(i+1)%sides,(j+1)*sides+(i+1)%sides,(j+1)*sides+i) for j in range(len(profile)-1) for i in range(sides)]
    fs.extend([tuple(reversed(range(sides))),tuple(range((len(profile)-1)*sides,len(profile)*sides))])
    obj=part(name,pts,fs,mat,lit)
    if rough==0:
        for face in list(obj.data.polygons)[:-2]:face.use_smooth=True
    return obj


def dish(name,x,y,z,r,sy=1):
    return lathe(name,x,y,z,[(0,.64*r),(.012,.75*r),(.020,.93*r),(.029,r),(.032,.97*r),(.015,.77*r)],'e8e4d9',sy=sy)


def stick(name,a,b,r,mat):
    A,B=Vector(a),Vector(b);axis=(B-A).normalized()
    tangent=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((1,0,0))).normalized()
    up=axis.cross(tangent);n=8
    verts=[v+r*(tangent*cos(2*pi*i/n)+up*sin(2*pi*i/n)) for v in (A,B) for i in range(n)]
    return part(name,verts,[(i,(i+1)%n,n+(i+1)%n,i+n) for i in range(n)]+[tuple(reversed(range(n))),tuple(range(n,2*n))],mat)


coll=collection('damun-cooler',(-2.6,0,0))
# Black gasket, ventilated plinth, inset illuminated case, and four wire shelves.
box('회색 뒷판',0,.31,.94,.716,.05,1.86,'455455')
for s in (-1,1):
    box('냉장고 측판',s*.341,0,.97,.035,.67,1.94,'b1baba')
    box('문틀 가스켓',s*.314,-.326,1.02,.025,.040,1.51,'333b39')
    box('등기구',s*.300,.07,.99,.014,.018,1.38,'eef7e9',True)
for z,h in [(.12,.24),(1.82,.24)]:
    box('냉각기 커버',0,0,z,.72,.67,h,'c5ceca')
for n in range(13):
    box('하부 그릴',-.27+n*.045,-.337,.123,.025,.012,.115,'52605d')
box('덮개 회색 띠',0,-.34,1.86,.55,.014,.06,'939d97')
box('온도 표시',.2,-.352,1.86,.080,.007,.028,'569387',True)
for z in (.26,.609,.958,1.307):
    box('진열 선반',0,.005,z,.648,.58,.024,'b9c4b9')
    box('선반 앞 턱',0,-.282,z+.014,.65,.017,.045,'e1e5dc')
    for j in range(9):
        box('선반 와이어',-.266+j*.066,-.000,z+.020,.007,.51,.007,'a0afa7')
profiles=[('ecdfbd','bd704e'),('a4bb96','e6e2b3'),('e0e6d9','415a79'),('5c7866','d5c4a2'),('d7b78b','613a41')]
for row,z in enumerate((.285,.634,.983,1.332)):
    for depth in (0,.18):
        for j in range(5):
            x=-.243+j*.121;y=-.17+depth
            typ=(row+j+(depth>0))%5
            body,band=profiles[typ];h=[.252,.271,.227,.244,.256][typ];rad=[.044,.041,.048,.043,.043][typ]
            lathe('탁주·약주 병',x,y,z,[(0,rad*.72),(.012,rad),(.057,rad),(h*.65,rad*.91),(h*.74,rad*.77),(h*.81,rad*.44),(h*.94,rad*.42)],body,sides=14)
            lathe('띠 라벨',x,y,z+.056,[(0,rad*1.01),(.062,rad*.988)],band,sides=14)
            lathe('병뚜껑',x,y,z+h*.93,[(0,rad*.48),(.021,rad*.48),(.023,rad*.42)],['d3c399','f4f0d9','a09681','584c42','744444'][typ],sides=14)
            if not depth:
                box('라벨 세로획',x,y-rad*.99,z+.085,.017,.002,.036,'f0ebd9')
for z in (.81,1.25):
    stick('문손잡이 받침',(.271,-.352,z),(.271,-.383,z),.013,'687472')
stick('세로 손잡이',(.271,-.384,.81),(.271,-.384,1.25),.014,'adb7b3')


coll=collection('hanshin-table',(0,0,0))
dish('치킨 타원 접시',-.045,0,.001,.215,.69)
for i,(x,y,r,h) in enumerate([(-.152,-.048,.068,.08),(-.073,-.063,.065,.064),(.035,-.065,.060,.06),(.09,.004,.060,.073),(-.040,.025,.071,.096),(-.125,.062,.058,.071),(.005,.080,.054,.068),(-.070,-.002,.059,.088)]):
    z=.028+(i>5)*.021
    col=['ba7433','cc863d','ad642d','bb782f','a65e28'][i%5]
    lathe('후라이드 조각',x,y,z,[(0,r*.55),(h*.19,r*.88),(h*.51,r),(h*.79,r*.8),(h,r*.40)],col,.80,sides=13,rough=.17)
    for j in range(11):
        a=rng.random()*2*pi;rr=rng.uniform(.16,.77)*r
        vx=x+cos(a)*rr;vy=y+sin(a)*rr*.8
        lathe('튀김옷 조각',vx,vy,z+h*(.79+(.76-rr/r)*.14),[(0,.007),(.005,.011),(.013,.004)],rng.choice(['daae5d','c68d45','e0af5b','a85f2d']),.8,6,.20)
dish('치킨무 종지',.21,.13,.001,.075,.83)
for i in range(7):
    x=.171+(i%3)*.035;y=.105+(i//3)*.032
    box('치킨무',x,y,.037,.031,.030,.027,'f2eee0')
dish('양념장 종지',.22,-.095,.001,.062,.83)
lathe('양념치킨 소스',.22,-.095,.013,[(0,.044),(.011,.049)],'943d27',.82)
dish('양배추 샐러드 접시',-.30,.135,.001,.083,.88)
for i in range(34):
    a=rng.random()*2*pi;r=.053*rng.random()**.5
    x=-.30+cos(a)*r;y=.135+sin(a)*r*.83
    stick('채 썬 양배추',(x-.012,y-.011,.028+rng.random()*.014),(x+.019,y+.010,.043+rng.random()*.006),.004,rng.choice(['e2e3ac','b7c68a','d9dcb5','d9b198']))
for j in range(2):
    stick('스테인리스 젓가락',(-.31+j*.012,-.15,.012),(-.08+j*.012,-.18,.013),.0038,'c8cbc7')


coll=collection('hanshin-selfbar',(2,0,0))
# Buffet pans have a rolled rectangular lip and a recessed well rather than a solid top.
for j,(name,color) in enumerate([('팝콘','e7c779'),('양배추 샐러드','b8c78d'),('치킨무','efeadd'),('김치','be5b37')]):
    x=-.65+j*.425
    def ring(sx,sy,z):
        return [(x+sx*a,sy*b,z) for a,b in [(-.92,-1),(.92,-1),(1,-.88),(1,.88),(.92,1),(-.92,1),(-1,.88),(-1,-.88)]]
    verts=ring(.19,.22,.093)+ring(.19,.22,.105)+ring(.173,.198,.105)+ring(.139,.156,.008)
    fs=[(k*8+i,k*8+(i+1)%8,(k+1)*8+(i+1)%8,(k+1)*8+i) for k in range(3) for i in range(8)]+[tuple(range(24,32))]
    part(name+' 스테인리스 밧드',verts,fs,'b7bfba')
    for n in range(38):
        xx=x+rng.uniform(-.125,.125);yy=rng.uniform(-.139,.139)
        z=.044+rng.random()*.025
        if j==2:box('셀프바 치킨무',xx,yy,z,.044,.038,.034,'ede9dc')
        elif j==1:stick('셀프바 양배추',(xx-.025,yy-.018,z),(xx+.028,yy+.021,z+.012),.007,rng.choice([color,'a3b17d','d0d59c']))
        else:lathe('팝콘 송이' if j==0 else '배추김치',xx,yy,z,[(0,.019),(.015,.028),(.036,.018)],rng.choice([color,'e0c390','f2deb1'] if j==0 else [color,'d27948','bd502f']),sy=.81,sides=7,rough=.22)
    stick('배식 집게', (x+.06,.04,.095),(x+.17,.165,.145),.008,'777f7d')
    stick('집게 갈래', (x+.029,.042,.095),(x+.17,.165,.145),.007,'a3a9a4')

bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'shops.blend'),compress=True)
