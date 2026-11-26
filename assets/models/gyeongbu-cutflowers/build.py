"""Editable wholesale bunches, in metres. See README for the passenger photographs."""
from math import pi, sin, cos
from pathlib import Path
from random import Random
import runpy

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
TAU = 2*pi
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene['source']='2026-10-19 fresh-flower market photographs, https://m.blog.naver.com/alouete/224445972609'


def finish(name, hex_string):
    srgb=[int(hex_string[i:i+2],16)/255 for i in (0,2,4)]
    col=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*col,1)
    return m


charcoal=finish('검정 꽃통','373d3b')
black=finish('꽃통 안 · 그늘','172324')
lip=finish('꽃통 · 테두리','4a514e')
blue=finish('군청 꽃통','334a85')
cobalt=finish('푸른 테두리','4d649a')
terra=finish('적갈색 거꾸로 얹은 화분','955144')
rust=finish('화분 테두리 · 흙갈색','aa6550')
green=finish('줄기','587542')
leaf=finish('잎 · 앞면','548345')
leaflight=finish('잎 · 잎맥','709753')
leafdark=finish('잎 · 그늘','355c38')
bud=finish('연둣빛 꽃봉오리','a6bb72')
paper=finish('포장지 흰 테','f0e9de')
label=finish('집게 카드 · 미색','ebe8df')
clip=finish('카드 집게 · 금속','aab1a8')
ink=finish('카드 · 작은 필기 획','7f8790')
palettes={
 'Sunflower': [finish('해바라기 · '+str(i),c) for i,c in enumerate(['f5ae15','ffca21','ffdc3c','f5ba1c'])],
 'Ivory': [finish('백장미 · '+str(i),c) for i,c in enumerate(['cbb88c','e2d6b2','fbf5df','fff9e7'])],
 'Violet': [finish('자줏빛 겹꽃 · '+str(i),c) for i,c in enumerate(['5e396d','8854ab','a873cb','b986d0'])],
 'Pink': [finish('분홍 겹꽃 · '+str(i),c) for i,c in enumerate(['b74e79','de81a2','f3a8bc','fbc4cb'])]
}
honey=finish('해바라기 · 꽃턱','a77b26')
pollen=finish('해바라기 · 꽃가루','c99827')
olive=finish('해바라기 · 중심','87903b')


def collection(name, x):
    global group, offset
    group=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(group)
    group['origin']=[x,0,0];group['bundle']='cutflowers'
    offset=x


def obj(name, verts, faces, mats, slots=None):
    if not isinstance(mats,list):mats=[mats]
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    for m in mats:data.materials.append(m)
    if slots:
        for p,i in zip(data.polygons,slots):p.material_index=i
    o=bpy.data.objects.new(name,data)
    group.objects.link(o)
    o.location.x=offset
    return o


def rings(name, rows, mats, cols=None):
    n=len(rows[0])
    faces=[(a*n+i,a*n+(i+1)%n,(a+1)*n+(i+1)%n,(a+1)*n+i) for a in range(len(rows)-1) for i in range(n)]
    return obj(name,[p for row in rows for p in row],faces,mats,[c for c in cols for _ in range(n)] if cols else None)


def radial_ring(radius,h,n,round_square=False):
    def comp(x):return (1 if x>=0 else -1)*abs(x)**.49 if round_square else x
    return [(radius*comp(cos(t*TAU/n)),radius*comp(sin(t*TAU/n)),h) for t in range(n)]


def line(name, coords, radius, mat, sides=5):
    coords=[Vector(v) for v in coords]; rows=[]
    for i,p in enumerate(coords):
        tangent=(coords[min(i+1,len(coords)-1)]-coords[max(0,i-1)]).normalized()
        side=tangent.cross(Vector((1,0,0)) if abs(tangent.x)<.8 else Vector((0,1,0))).normalized()
        other=tangent.cross(side)
        rows.append([p+radius*(side*cos(k*TAU/sides)+other*sin(k*TAU/sides)) for k in range(sides)])
    return rings(name,rows,mat)


def blade(name,start,direction,width,bend,tint=leaf):
    p=Vector(start);v=Vector(direction);s=Vector((-v.y,v.x,0)).normalized()*width
    pts=[p,p+.30*v+s*.8,p+.64*v+s,p+v+Vector((0,0,-bend)),p+.64*v-s,p+.30*v-s*.8,
         p+.47*v+Vector((0,0,bend*.6))]
    return obj(name,pts,[(0,1,6),(1,2,6),(2,3,6),(3,4,6),(4,5,6),(5,0,6)],
               [tint,leaflight,leafdark],[0,0,1,0,2,2])


def baseflower(center,normal):
    n=Vector(normal).normalized()
    a=n.cross(Vector((0,1,0))).normalized()
    b=n.cross(a)
    def pt(angle,r,h):
        return Vector(center)+r*(a*cos(angle)+b*sin(angle))+h*n
    return pt


def sunflower(center,n,r,seed):
    rnd=Random(seed);pt=baseflower(center,n)
    for layer,count in [(0,14),(1,13)]:
        for k in range(count):
            a=TAU*(k+.48*layer)/count+rnd.uniform(-.06,.06)
            size=r*(1-.20*layer)*rnd.uniform(.91,1.05)
            verts=[pt(a,.16*r,0),pt(a-.12,.57*size,.03*r),pt(a-.125,.76*size,.13*r),
                   pt(a+rnd.uniform(-.045,.045),size,rnd.uniform(.08,.28)*r),pt(a+.11,.72*size,.12*r),
                   pt(a+.13,.52*size,.02*r),pt(a,.57*size,.17*r+layer*.003)]
            obj('해바라기 · 접힌 설상화',verts,[(0,1,6),(1,2,6),(2,3,6),(3,4,6),(4,5,6),(5,0,6)],
                palettes['Sunflower'],[0,1+(k%2),2,1,1,0])
    rows=[[pt(k*TAU/14,f*r,h*r) for k in range(14)] for f,h in [(.37,-.02),(.34,.12),(.16,.145),(.02,.14)]]
    rings('두상화 · 황금색 꽃가루와 녹색 중심',rows,[honey,pollen,olive],[0,1,2])


def cup(center,n,r,species,seed):
    rnd=Random(seed);pt=baseflower(center,n)
    for layer,(count,outer,spread,high) in enumerate([(7,1,.56,.58),(5,.72,.70,.75),(4,.45,.82,.83),(3,.24,.9,.88)]):
        for k in range(count):
            a=TAU*(k/count+.193*layer)+rnd.uniform(-.07,.07);o=outer*r;w=spread
            coords=[pt(a,.29*o,-.16*r),pt(a-w*.73,.67*o,.15*r),pt(a-w,o,high*r*.74),
                    pt(a-.22*w,1.05*o,high*r),pt(a+.38*w,1.01*o,high*r*.98),pt(a+w,o*.83,high*r*.73),
                    pt(a+w*.69,.60*o,.12*r),pt(a,.72*o,high*r*.59)]
            faces=[(j,(j+1)%7,7) for j in range(7)]
            obj('말려 겹치는 꽃잎',coords,faces,palettes[species],[0,1,2,3 if layer<2 else 2,2,1,0])


def carnation(center,n,r,seed):
    rnd=Random(seed);pt=baseflower(center,n)
    for layer,(count,o,h) in enumerate([(7,1,.34),(6,.79,.58),(4,.48,.73)]):
        for k in range(count):
            a=TAU*(k/count+.12*layer)+rnd.uniform(-.05,.05)
            v=[pt(a,.13*r,0),pt(a,.58*o*r,h*.54*r)]
            for j in range(7):
                v.append(pt(a+(j-3)*.19,o*r*(1 if j%2 else .92),(h+.16*(j%2)+rnd.uniform(-.05,.05))*r))
            faces=[(0,2,1),(0,1,8)]+[(1,i,i+1) for i in range(2,8)]
            obj('분홍 꽃잎 · 주름진 가장자리',v,faces,palettes['Pink'],[0,1,1,3,2,3,1,2])


def budded(pos,angle,size):
    p=Vector(pos);pt=baseflower(p,(.20*cos(angle),.2*sin(angle),1))
    rows=[[pt(k*TAU/5,r*size,h*size) for k in range(5)] for r,h in [(0,0),(.50,.23),(.43,.83),(.05,1)]]
    rings('반쯤 닫힌 꽃봉오리',rows,[bud,palettes['Ivory'][1]],[0,0,1])


def pot(kind):
    square=kind!='Sunflower'
    colors=[charcoal if square else blue,lip if square else cobalt,black]
    profile=[(.111,0),(.115,.012),(.140,.32),(.144,.373),(.149,.378),
             (.151,.392),(.142,.397),(.134,.388),(.131,.364),(.105,.12)]
    rings('도매용 꽃통 · 안쪽이 열린 겹테', [radial_ring(r,h,16,square) for r,h in profile],
          colors,[0,0,0,1,1,1,2,2,2])
    # Clip and unpriced card follow the front face of the bucket.
    obj('흰 카드', [(-.047,-.147,.39),(.047,-.147,.39),(.047,-.153,.323),(-.047,-.153,.323)],
        [(0,1,2,3)], label)
    line('가격표 집게',[(0,-.141,.398),(0,-.151,.395),(0,-.151,.374)],.0027,clip)
    for i in range(3):
        x=-.029+i*.020
        line('판독되지 않는 카드 필기',[(x,-.150,.359),(x+.01,-.152,.362),(x+.008,-.152,.353)],.0009,ink,3)


def sleeve_ring():
    n=14
    levels=[]
    for height,rad in [(.54,.093),(.60,.12),(.87,.202)]:
        levels.append([(rad*cos(i*TAU/n),rad*sin(i*TAU/n),height+(.024*sin(i*TAU/n*3+.2) if height>.8 else 0)) for i in range(n)])
    return levels


for index,(kind,num) in enumerate([('Sunflower',8),('Ivory',13),('Violet',14),('Pink',13)]):
    collection(kind,index*1.05)
    rnd=Random(131+index)
    pot(kind)
    for i in range(num):
        angle=i*2.399963+.24
        radial=.157*((i+.5)/num)**.54
        top=Vector((radial*cos(angle),radial*sin(angle),.81+rnd.uniform(-.057,.062)+(1-i/num)*.060))
        start=Vector((.045*cos(angle),.045*sin(angle),.205))
        mid=Vector((.070*cos(angle),.070*sin(angle),.52))
        line('길게 올라온 절화 줄기',[start,mid,top],.0047 if kind=='Sunflower' else .0032,green)
        for j in range(4 if kind=='Sunflower' else 3):
            te=.16+j*.20
            p=mid.lerp(top,te);a=angle+j*2.7+.75
            length=.159 if kind=='Sunflower' else .126
            blade('절화 잎',p,(length*cos(a),length*sin(a),.057+j*.016),
                  .052 if kind=='Sunflower' else .032,.047)
            if kind!='Sunflower' and j<2:
                for side in [-1,1]:
                    b=a+side*.72
                    blade('잎자루 옆의 작은 잎',p,(.079*cos(b),.079*sin(b),.057),.019,.017)

        # Outward-inclined heads are readable from the passenger's eye level, as on the floor.
        inc=.21 if i<3 else rnd.uniform(.5,1.1)
        normal=(.72*inc*cos(angle),(-1.20 if kind=='Sunflower' else -.76)+.71*inc*sin(angle),.93)
        if kind=='Sunflower':
            sunflower(top,normal,rnd.uniform(.083,.103),i)
        elif kind=='Pink':
            carnation(top,normal,rnd.uniform(.050,.064),i)
        else:
            cup(top,normal,rnd.uniform(.042,.054) if kind=='Violet' else rnd.uniform(.056,.065),kind,i)
        if kind in ('Violet','Pink') and i%2==0:
            side=top+Vector((.041*cos(angle+.7),.041*sin(angle+.7),-.054))
            line('곁봉오리 줄기',[top-Vector((0,0,.15)),side],.0025,green)
            budded(side,angle,.030)
    if kind=='Pink':
        rimrow=sleeve_ring()[-1]
        rings('포장 필름 · 흰 인쇄 띠', [[(x,y,z-.014) for x,y,z in rimrow],rimrow],paper)
        line('포장의 접힌 세로선',[(.05,-.071,.525),(.10,-.11,.69),(.165,-.114,.86)],.0018,paper)

collection('Sleeve',4.75)
rings('투명 포장지 · 접어 세운 셀로판',sleeve_ring(),paper)
collection('Riser',5.8)
rings('테라코타색 거꾸로 놓은 받침', [radial_ring(r,h,16) for r,h in
      [(.154,0),(.16,.008),(.16,.026),(.154,.03),(.112,.271),(.111,.285),(.105,.29)]],
      [terra,rust],[1,1,0,0,1,1])

collection('BlackStack',6.65)
for i in range(5):
    z=i*.039
    rows=[radial_ring(r,z+h,16,True) for r,h in [(.103,0),(.135,.272),(.144,.282),(.145,.295),(.135,.300),(.128,.285),(.104,.08)]]
    rings('겹쳐 쌓은 빈 화통',rows,[charcoal,lip,black],[0,0,1,1,2,2])
collection('WorkPapers',7.45)
kraft=finish('포장지 · 크라프트','bcaa8b')
paperedge=finish('종이 단면 · 회백색','b9b7a7')
for i in range(9):
    z=i*.0043
    x=(i%4)*.003
    verts=[(-.17+x,-.105,z),(.17+x,-.101,z+.001),(.16+x,.11,z+.005),(-.17+x,.105,z+.003),
           (-.17+x,-.105,z+.003),(.17+x,-.101,z+.005),(.16+x,.11,z+.008),(-.17+x,.105,z+.006)]
    obj('겹친 접지 · 종이 단면',verts,[(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],
        [paperedge,kraft if i%3==0 else paper],[0,0,0,0,1])
obj('윗장 · 들린 귀퉁이',[(-.148,-.09,.046),(.13,-.089,.047),(.153,.012,.051),(.13,.092,.082),(-.147,.084,.048)],
    [(0,1,2,4),(2,3,4)],paper)

for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=6
        area.spaces.active.region_3d.view_location=(2.7,0,.45)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'cutflowers.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
