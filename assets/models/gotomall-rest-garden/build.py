"""Editable planted bench, foliage and stroller for the shoppers' rest space."""
from math import cos, sin, pi, tau
from random import Random
from pathlib import Path
import runpy
import sys
import bpy
from mathutils import Matrix, Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='고투몰 · 식물 휴게공간'
scene.unit_settings.system='METRIC'
for k,h in {
 'cream':'e8e2d4','warm':'dcd4c5','edge':'d2caba','seam':'bcb5a7','stone':'a49b8e',
 'kick':'8e8171','led':'f3c17c','bronze':'9c8771','pale':'ece9dc','steel':'afb5ad',
 'limestone':'a5a591','rocklit':'b4b29e','rockshade':'888e7f','shale':'7d8377','moss':'7f835f',
 'peat':'494735','mulch':'605745','stick':'6a6549','stem':'6b743e','vein':'93a759',
 'ivy':'405e35','ivy-mid':'547845','ivy-lit':'6f8b4e','leaf':'385139','leaf-mid':'4c6945','leaf-lit':'648155',
 'fern':'627945','reed':'8e995f','cream-leaf':'a7a76b','slate':'48535b','navy':'303f49',
 'fold':'34464e','canvas':'657078','piping':'829097','foam':'403e3c','rubber':'303333',
 'tread':'464746','black':'373a39','strap':'444845','mesh':'666c65','web':'ada697','alu':'a0a5a1',
 'hub':'838883','sand':'d2bb95','shop-dark':'987747','shop-red':'96624e','paper':'e4d7bf',
 'clasp':'797c75'
}.items():
    m.palette[k]=m.material(k,h,.34 if k in ('steel','alu','hub','clasp') else 0)
B,C,T=m.block,m.profile,m.rod
rng=Random(711)

def group(name,parent=None):
    c=bpy.data.collections.new(name)
    (parent or scene.collection).children.link(c)
    m.group=c
    return c

def root(name,origin):
    g=group('고투몰 · '+name)
    g['preview_origin']=origin
    return g

def sweep(name,profile,a0,a1,count,col,closed=False):
    # Concentric elliptical radii are listed as (horizontal radius, depth radius, elevation).
    n=len(profile);v=[]
    for i in range(count+1):
        a=a0+(a1-a0)*i/count
        v.extend((rx*cos(a),rd*sin(a),z) for rx,rd,z in profile)
    f=[(i*n+j,(i+1)*n+j,(i+1)*n+(j+1)%n,i*n+(j+1)%n) for i in range(count) for j in range(n)]
    if not closed:f.extend([tuple(reversed(range(n))),tuple(range(count*n,(count+1)*n))])
    return m.piece(name,v,f,col)

seats=root('흰 곡면 화단 벤치',(0,0,0))
group('인조석 화단과 이음매',seats)
# The smooth planted wall and front seat are one stepped profile, with a recessed kick.
for i in range(18):
    a0=tau*i/18+.0015;a1=tau*(i+1)/18-.0015
    sweep('화단의 곡면 인조석',[(3.38,1.02,.64),(3.38,1.02,.85),(3.40,1.04,.877),(3.52,1.18,.877),
         (3.55,1.20,.854),(3.55,1.2,.08),(3.48,1.15,.06)],a0,a1,4,'cream' if i%5 else 'warm')
sweep('화단 이음의 줄눈',[(3.391,1.033,.64),(3.391,1.033,.866),(3.534,1.188,.862),
      (3.541,1.19,.08)],0,tau,72,'seam',True)
group('앞쪽 곡면 좌석과 발밑 간접조명',seats)
sweep('안으로 들어간 하부 받침',[(3.48,1.13,.025),(3.95,1.61,.025),(3.98,1.65,.14),
      (4.00,1.67,.35),(3.48,1.14,.35)],pi,tau,46,'kick')
sweep('하부 황색 조명 렌즈',[(4.008,1.686,.070),(4.032,1.708,.078),(4.035,1.71,.098),
      (4.008,1.688,.102)],pi+.008,tau-.008,45,'led')
for i in range(12):
    a0=pi+i*pi/12+.001;a1=pi+(i+1)*pi/12-.001
    sweep('가공된 흰 벤치 상판',[(3.53,1.185,.152),(4.095,1.771,.152),(4.125,1.799,.171),
          (4.146,1.816,.206),(4.146,1.816,.404),(4.135,1.806,.433),(4.103,1.776,.452),
          (3.553,1.202,.452),(3.531,1.184,.430)],a0,a1,5,'cream' if i%4 else 'warm')
sweep('좁은 좌석 줄눈',[(3.55,1.20,.443),(4.12,1.791,.441),(4.136,1.808,.409),
      (4.134,1.807,.17),(3.55,1.2,.17)],pi,tau,60,'seam')

garden=root('수경 화단의 바위와 늘어진 잎',(0,-5,0))
def stone(name,x,d,z,r,ratio,h,tones,count=10):
    v=[]
    for j,(size,zz) in enumerate([(.72,0),(1,.21),(.96,.56),(.69,.86),(.35,1)]):
        for i in range(count):
            a=tau*(i+.17*(j%2))/count
            rr=r*size*(1+rng.uniform(-.10,.09))
            v.append((x+rr*cos(a),d+rr*ratio*sin(a),z+h*(zz+rng.uniform(-.031,.030))))
    faces=[tuple(reversed(range(count))),tuple(range(4*count,5*count))]
    faces.extend((j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i)
                 for j in range(4) for i in range(count))
    obj=m.piece(name,v,faces,tones[0])
    for tone in tones[1:]:obj.data.materials.append(m.palette[tone])
    for face in obj.data.polygons:
        pick=rng.random()
        face.material_index=0 if pick<.72 else 1 if pick<.91 else 2
    return obj
group('수면에 드러난 불규칙한 바위',garden)
# Leave slivers of the existing game water in front of and between the planted islands.
for x,d,r,h in [(-2.54,-.14,.47,.68),(-1.36,.18,.44,.57),(.20,.24,.49,.68),(1.70,.10,.47,.67),(2.65,-.09,.36,.56)]:
    stone('갈라진 담회색 자연석',x,d,.624,r,.72,h,['limestone','rocklit','rockshade'])
    stone('바위 아래 작은 돌',x+.22,d-.21,.651,r*.54,.72,h*.43,['shale','limestone','rockshade'])
for i in range(17):
    a=rng.uniform(.12,pi*1.90);rx=rng.uniform(.74,.93)
    x=3.15*rx*cos(a);d=.88*rx*sin(a)
    stone('물가 둥근 자갈',x,d,.657,rng.uniform(.068,.16),rng.uniform(.72,.91),rng.uniform(.04,.107),
          ['shale','rockshade','moss'])

def leaf(x,d,z,a,length,width,rise,col,shape='heart',mark=False):
    ca,sa=cos(a),sin(a)
    def pt(f,side,h):
        return (x+ca*length*f-sa*width*side,d+sa*length*f+ca*width*side,z+rise*f+h)
    if shape=='heart':
        outline=[(0,0,0),(-.06,-.44,.014),(.13,-.79,.022),(.25,-.68,.023),(.43,-1,.016),
                 (.60,-.71,.015),(1,0,-.021),(.60,.71,.015),(.43,1,.016),(.25,.68,.023),(.13,.79,.022),(-.06,.44,.014)]
    elif shape=='blade':
        outline=[(0,0,0),(.19,-.56,.016),(.45,-1,.035),(.75,-.58,.029),(1,0,-.027),
                 (.75,.55,.024),(.43,.92,.026),(.18,.52,.012)]
    else:
        outline=[(0,0,0),(.17,-.45,.010),(.38,-1,.023),(.70,-.85,.016),(1,0,-.013),
                 (.67,.85,.014),(.37,.96,.020),(.15,.41,.010)]
    vertex=[pt(*v) for v in outline]+[pt(.41,0,.034 if shape!='blade' else .049)]
    n=len(outline)
    obj=m.piece('맥이 솟은 '+{'heart':'갈래잎','blade':'띠 모양 잎','oval':'타원형 잎'}[shape],vertex,
                [(i,(i+1)%n,n) for i in range(n)],col)
    if mark:
        verts=[pt(.02,-.02,.003),pt(.35,-.035,.038),pt(.71,0,.019),
               pt(.36,.031,.038)]
        m.piece('잎 위의 가는 중앙맥',verts,[(0,1,3),(1,2,3)],'vein' if shape=='heart' else 'cream-leaf')
    return obj

def shrub(x,d,z,r,height):
    for j in range(12):
        a=j*2.399+rng.uniform(-.32,.32);rr=r*(.29+.74*rng.random());h=height*(.41+.58*rng.random())
        ca,sa=cos(a),sin(a)
        nodes=[(x,d,z),(x+ca*rr*.24,d+sa*rr*.24,z+h*.37),
               (x+ca*rr*.65,d+sa*rr*.65,z+h*.72),(x+ca*rr,d+sa*rr,z+h)]
        T('뻗어 오르는 잔가지',nodes,.009 if h>.44 else .006,'stick',5)
        for k in range(5):
            f=.25+.163*k
            bx=x+ca*rr*f*.96;bd=d+sa*rr*f*.96;bz=z+h*(.26+.70*f)
            for side in [-1,1]:
                yaw=a+side*(.74+.52*rng.random())
                L=rng.uniform(.15,.268)*(1.19 if k%3==0 else .94)
                leaf(bx,bd,bz,yaw,L,L*(.36+.18*rng.random()),rng.uniform(-.154,.078),
                     rng.choice(['leaf','leaf-mid','leaf-lit','ivy-mid']),'oval',k==3 and j%3==0)
        leaf(nodes[-1][0],nodes[-1][1],nodes[-1][2],a,.188,.081,.028,'leaf-lit','oval')
for i,(x,d,r,h) in enumerate([(-2.46,.05,.56,.65),(-1.60,.19,.69,.77),(-.74,-.10,.64,.57),
              (.10,.28,.72,.89),(.85,-.04,.56,.72),(1.62,.24,.66,.64),(2.40,.01,.51,.66)]):
    group('관목 군락 '+str(i+1),garden)
    stone('잎 아래의 식재 기반',x,d,.66,r*.76,.72,.244,['peat','mulch','moss'])
    # Dense interior foliage supports the individual leaves at the outline. The dark core
    # is hidden by leaves at close range, and keeps the mass legible across the hall.
    for j in range(11):
        a=tau*j/11; rr=r*(.17+.48*rng.random())
        cx=x+rr*cos(a);cd=d+rr*sin(a)
        lower=.861+rng.uniform(.012,.065)
        spread=rng.uniform(.119,.192); core_height=rng.uniform(.12,.20)
        stone('관목 안쪽의 작은 잎 군락',cx,cd,lower,spread,rng.uniform(.71,1.02),
              core_height,['leaf','ivy','leaf-mid'],count=6)
        for k in range(5):
            a=tau*k/5+j*.63
            leaf(cx+.036*cos(a),cd+.036*sin(a),lower+core_height*.77,a,spread*1.26,spread*.46,
                 rng.uniform(-.052,.044),rng.choice(['leaf','leaf-mid','leaf-lit']),'oval')
    shrub(x,d,.818,r,h*1.26)
group('늘어진 포복 줄기와 갈래잎',garden)
for i in range(27):
    # The vines cross the high lip before they droop. This keeps their lower leaves
    # connected on the customer side of the stone, even when seen in profile.
    patch=i//3
    x=[-2.89,-2.15,-1.73,-.87,-.43,.51,1.07,2.05,2.67][patch]+(i%3-1)*.069
    inner=-1.02*(max(.05,1-(x/3.38)**2)**.5)
    outer=-1.20*(max(.05,1-(x/3.55)**2)**.5)
    d0=inner+.15;edge=outer-.041
    fall=rng.uniform(.125,.325) if i%3 else rng.uniform(.21,.379)
    pts=[]
    for j in range(9):
        f=j/8;xx=x+.051*sin(4.5*f+i)
        if f<=.5:
            g=f*2;dd=d0+(edge-d0)*g;zz=.886+.074*sin(pi*g)
        else:
            g=(f-.5)*2;dd=edge-.068*sin(g*pi*.67);zz=.887-fall*g
        pts.append((xx,dd,zz))
        if j:
            for side in [-1,1]:
                a=-pi/2+side*(.82+.54*rng.random());L=rng.uniform(.070,.129)
                leaf(xx,dd,zz,a,L,.46*L,-.009-.046*f,rng.choice(['ivy','ivy-mid','ivy-lit']),'heart',
                     j in (2,5) and i%3==0)
    T('화단 밖으로 늘어지는 줄기',pts,.0054,'stem',5)
group('중간 높이의 좁고 긴 잎',garden)
for x,d in [(-2.10,.41),(-1.00,.40),(.59,.21),(1.83,.30),(2.78,.23)]:
    for j in range(12):
        a=j*2.399+rng.uniform(-.15,.15);r=.06*rng.random()
        leaf(x+r*cos(a),d+r*sin(a),.87,a,rng.uniform(.22,.38),rng.uniform(.020,.041),rng.uniform(.12,.37),
          rng.choice(['reed','fern','ivy-lit']),'blade',j%3==0)

stroller=root('휴게광장 접이식 유아차',(5.8,0,0))
group('앞 회전바퀴와 접이식 프레임',stroller)
def axial(name,x,d,z,profile,col,count=20):
    # Rings around the lateral axle. The hole continues through the tire.
    v=[(x+off,d+r*cos(tau*j/count),z+r*sin(tau*j/count)) for off,r in profile for j in range(count)]
    f=[(k*count+j,k*count+(j+1)%count,((k+1)%len(profile))*count+(j+1)%count,
        ((k+1)%len(profile))*count+j) for k in range(len(profile)) for j in range(count)]
    return m.piece(name,v,f,col)
def wheel(x,d,r,front):
    z=r+.007;w=.030 if front else .038
    axial('고무 타이어',x,d,z,[(-w,.72*r),(-w,r*.92),(-w*.72,r),(w*.72,r),
        (w,r*.92),(w,.72*r)],'rubber',23)
    axial('휠 림',x,d,z,[(-w*.74,.65*r),(-w*.74,.77*r),(w*.74,.77*r),(w*.74,.65*r)],'alu',20)
    for j in range(7 if front else 9):
        a=tau*j/(7 if front else 9)
        T('바퀴의 곡선 살',[(x,d+.14*r*cos(a),z+.14*r*sin(a)),(x,d+.49*r*cos(a+.11),
            z+.49*r*sin(a+.11)),(x,d+.70*r*cos(a+.14),z+.70*r*sin(a+.14))],.006 if front else .008,'hub',5)
    axial('중앙 차축 마개',x,d,z,[(-w*1.12,.007),(-w*1.12,r*.17),(w*1.12,r*.17),(w*1.12,.007)],'black',12)
for side in [-1,1]:
    wheel(side*.273,.291,.139,False)
    for offset in [-.026,.026]:wheel(side*.244+offset,-.314,.091,True)
    T('앞바퀴 회전 포크',[(side*.244,-.314,.100),(side*.244,-.33,.215),(side*.235,-.29,.255)],.016,'black',7)
    T('앞차대의 알루미늄 빔',[(side*.235,-.299,.19),(side*.242,-.22,.29),(side*.226,.04,.58),
         (side*.228,.216,.807)],.018,'alu',8)
    T('뒤차대가 접히는 두 번째 대각선',[(side*.263,.287,.148),(side*.236,.251,.251),
         (side*.227,-.094,.545),(side*.214,-.237,.635)],.018,'alu',8)
    T('고무 손잡이 기둥',[(side*.222,.09,.61),(side*.227,.205,.795),(side*.227,.335,.967),
         (side*.220,.404,1.012)],.016,'alu',8)
    axial('차대의 회전 관절',side*.238,.006,.499,[(-.013,.007),(-.015,.039),(.015,.039),(.017,.007)],'black',12)
T('디귿자 손잡이', [(-.216,.393,1.005),(-.201,.423,1.028),(-.172,.432,1.035),
                     (.172,.432,1.035),(.201,.423,1.028),(.216,.393,1.005)],.023,'foam',10)
T('뒤바퀴 차축', [(-.272,.291,.147),(.272,.291,.147)],.014,'black',7)
B('발로 누르는 브레이크',.09,.309,.136,.091,.069,.036,'rubber',.006)

group('쇼핑 바구니와 작은 종이 쇼핑백',stroller)
B('하부 수납 바구니 바닥',0,-.035,.206,.400,.45,.035,'navy',.007)
for side in [-1,1]:
    wire=[(side*.195,-.266,.236),(side*.204,-.276,.340),
          (side*.198,.198,.389),(side*.191,.189,.235)]
    T('바구니 윗테두리',wire,.009,'fold',6)
    for j in range(14):
        d=-.24+j*.032;hi=.342+.045*(d+.24)/.416
        T('접이식 망사 짜임',[(side*.197,d,.240),(side*.200,d+.043,hi)],.0017,'mesh',4)
        T('망사 교차실',[(side*.198,d+.045,.239),(side*.199,d,hi)],.0017,'mesh',4)
for d in [-.258,.195]:
    B('바구니 천 끝',0,d,.227,.393,.018,.106,'navy',.005)
B('접힌 종이 쇼핑백',.074,.018,.247,.170,.089,.189,'sand',.003)
for d in [-.009,.051]:
    T('종이 쇼핑백 손잡이',[(.040,d,.428),(.041,d,.462),(.056,d,.482),(.087,d,.482),
                        (.104,d,.461),(.105,d,.429)],.0033,'shop-dark',6)
group('패딩 좌석과 다섯 점 벨트',stroller)
def fabric(name,verts,col):
    return m.piece(name,verts,[(0,1,2,3)],col)
fabric('유아용 방석', [(-.199,-.223,.489),(.199,-.223,.489),(.195,.073,.516),(-.195,.073,.516)],'slate')
fabric('경사진 등받이',[(-.188,.062,.513),(.188,.062,.513),(.171,.247,.865),(-.171,.247,.865)],'slate')
fabric('접힌 발받침',[(-.188,-.221,.487),(.188,-.221,.487),(.155,-.338,.318),(-.155,-.338,.318)],'navy')
B('발판 고무턱',0,-.342,.300,.318,.046,.039,'rubber',.011)
for side in [-1,1]:
    fabric('접힌 옆천',[(side*.193,-.204,.486),(side*.20,.074,.516),(side*.179,.229,.820),(side*.219,-.063,.655)],'fold')
    T('천 시트의 바이어스',[(side*.193,-.215,.492),(side*.204,-.193,.506),(side*.211,-.06,.65),
        (side*.179,.229,.827)],.004,'piping',5)
    T('어깨 멜빵',[(side*.099,.184,.760),(side*.077,.144,.682),(side*.055,.115,.629),
        (side*.017,.036,.569)],.013,'strap',6)
    T('허리 벨트',[(side*.173,.06,.57),(side*.087,.035,.558),(side*.014,.031,.567)],.010,'strap',6)
for d in [-.16,-.04,.065]:
    T('방석의 누빔선',[(-.15,d,.499),(0,d-.006,.513),(.15,d,.499)],.003,'piping',5)
B('벨트 버클',0,.027,.554,.067,.029,.041,'clasp',.005)
T('앞쪽 손잡이', [(-.219,-.043,.639),(-.216,-.180,.636),(-.171,-.236,.636),
                   (.167,-.236,.636),(.216,-.18,.636),(.219,-.043,.639)],.014,'foam',8)

group('펼쳐진 천 차양과 접힘선',stroller)
# Three meridians shape the hood. Open sides and front leave the empty seat visible.
canopy=[(.229,.790,.05),(.272,.865,.080),(.217,.971,.086),(.109,1.005,.072),(-.006,.994,.035),(-.102,.942,0)]
for k in range(len(canopy)-1):
    v=[]
    for d,z,bow in canopy[k:k+2]:
        for j in range(13):
            t=j/12*2-1;across=.219*t
            v.append((across,d-.023*(1-t*t),z+bow*(1-t*t)-.094*abs(t)**2.36))
    m.piece('차양의 네이비 패널',v,[(j,j+1,j+14,j+13) for j in range(12)],'navy' if k%2 else 'fold')
for i in [1,2,3,5]:
    d,z,bow=canopy[i];points=[]
    for j in range(13):
        t=j/12*2-1
        points.append((.219*t,d-.023*(1-t*t),z+bow*(1-t*t)-.094*abs(t)**2.36+.002))
    T('차양의 곡선 파이핑',points,.004 if i!=5 else .006,'piping',6)
for side in [-1,1]:
    fabric('옆 삼각 차양',[(side*.219,.214,.767),(side*.219,.277,.798),
          (side*.219,.114,.913),(side*.219,-.095,.847)],'fold')
    T('차양 지지대',[(side*.222,.128,.691),(side*.224,.208,.765),(side*.219,.11,.919)],.006,'alu',6)

# Smooth the leaf blade's curved surface and round stems. Keep the cut stone and
# edge binding hard; vertex-normal sharing also lets the web exporter simplify each leaf.
for obj in garden.all_objects:
    if obj.name.startswith(('맥이 솟은','뻗어 오르는 잔가지','관목 안쪽','화단 밖으로')):
        for face in obj.data.polygons:
            face.use_smooth=True

for g in [seats,garden,stroller]:
    bpy.context.view_layer.update()
    translation=Matrix.Translation(Vector(g['preview_origin']))
    for obj in g.all_objects:
        center=sum((Vector(v) for v in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=translation @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    g['basis']='고투몰 취재 사진·지하광장 조사 표7 및 프로젝트의 공개 보행 영상 판독. 세부 치수와 식물 종, 유아차 기종은 추정.'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active;space.shading.color_type='MATERIAL'
        target=Vector((.5,-2,.8));space.region_3d.view_location=target;space.region_3d.view_distance=12
        space.region_3d.view_rotation=(target-Vector((6,7,4.6))).to_track_quat('-Z','Y')
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'plaza.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
