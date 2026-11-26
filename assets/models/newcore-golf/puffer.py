"""Black Originals hooded golf jacket. The quilted shell sits over smooth sleeves and zipped lower panels."""
from math import sin,cos,pi,tau
import blender_shop_mesh as m
from sweater import lathe_panel
from typography import word

def plain_uv(r,a,p):return .98,.50

def jacket():
    def tube(r,a):
        z,w,depth=r
        side=sin(a);front=max(0,-cos(a))
        gathered=.0027*cos(10*a+z*17)+.0019*sin(17*a-z*23)
        shoulder=max(0,(z-.50)/.14)
        z+=.008*side**2*sin(3*a+z*6)-.043*side**2*shoulder
        # The zipper valley separates the two padded front panels.
        depth-=.008*front**28
        return ((w+gathered)*side,(depth+gathered)*cos(a)*(1+.016*sin(a*7+z*15)),z)
    base=[(.018,.185,.064),(.027,.204,.074),(.083,.207,.079),(.145,.195,.080),(.213,.194,.081),(.285,.210,.086),(.302,.215,.086)]
    lathe_panel('신축성 있는 검정 하단 몸판',base,tube,'blackKnit',plain_uv,46)
    tiers=[(.269,.353,.207,.224),(.351,.452,.222,.235),(.450,.547,.226,.230),(.545,.635,.227,.181)]
    for j,(lo,hi,r0,r1) in enumerate(tiers):
        rows=[]
        for k in range(9):
            t=k/8;bulge=sin(pi*t)**.70
            rows.append((lo+(hi-lo)*t,(1-t)*r0+t*r1+.008*bulge,.082+.013*bulge-.002*j))
        lathe_panel('패딩의 볼록한 가로 퀼팅 '+str(j+1),rows,tube,'nylon' if j%2==0 else 'nylonLight',plain_uv,56)
        for end in [-1,1]:
            pts=[tube((lo+.002,r0+.001,.082-.002*j),pi+end*(.11+k*.068)) for k in range(18)]
            m.rod('퀼팅 경계의 가는 상침',pts,.0009,'nylonSeam',5)
    for side in [-1,1]:
        def arm(row,a):
            x,d,z,rx,rd=row
            return side*(x+rx*sin(a)),d+rd*cos(a),z-.009*sin(a)+.0014*sin(4*a+z*19)
        rows=[(.272,0,.07,.036,.036),(.274,.002,.16,.046,.042),(.279,.004,.265,.053,.045),
              (.278,.009,.393,.061,.049),(.267,.012,.487,.068,.054),(.248,.012,.555,.068,.054),
              (.225,.007,.595,.060,.050),(.189,.015,.612,.041,.042)]
        lathe_panel('매끈한 검은 긴소매',rows,arm,'blackKnit',plain_uv,36)
        for z0,z1,tone in [(.001,.018,'blackKnit'),(.018,.0255,'white'),(.0255,.039,'blackKnit'),(.039,.0465,'white'),
                           (.0465,.061,'blackKnit'),(.061,.0685,'white'),(.0685,.078,'blackKnit')]:
            lathe_panel('소맷단의 골지와 세 흰 줄',[(.272,0,z0,.034,.034),(.272,0,z1,.035,.035)],arm,tone,plain_uv,28)
        m.rod('비스듬한 손주머니 지퍼',[(side*.135,-.058,.090),(side*.117,-.072,.145),(side*.115,-.077,.204)],.0027,'nylonSeam',7)
    # An open hood with a folded lip and visibly darker lining.
    n=37;outer=[];inner=[]
    for j in range(9):
        h=j/8
        for k in range(n):
            a=-1.15*pi/2+2.30*pi/2*k/(n-1);x=(.090+.029*sin(pi*h))*sin(a);d=.018+(.050+.040*sin(pi*h))*cos(a)-.035*h;z=.622+.147*h-.016*sin(a)**2
            outer.append((x,d,z));inner.append((x*.940,d-.009,z-.003))
    faces=[(j*n+k,j*n+k+1,(j+1)*n+k+1,(j+1)*n+k) for j in range(8) for k in range(n-1)]
    for text,pts,tone in [('후드 바깥 퀼팅',outer,'nylon'),('후드 안의 먹색 안감',inner,'lining')]:
        ob=m.piece(text,pts,faces,tone)
        for p in ob.data.polygons:p.use_smooth=True
    m.rod('후드 가장자리 바이어스',outer[-n:],.0035,'nylonSeam',8)
    for k in [0,n-1]:m.rod('후드 앞 여밈 끝',[(x,d,z) for x,d,z in outer[k::n]],.0032,'nylonSeam',8)
    m.block('목 뒤 초록 오리지널스 라벨',0,-.037,.610,.060,.002,.045,'labelGreen',.002)
    word('adidas','안쪽 라벨 자수',0,-.039,.633,.010,'white')
    zipcurve=[(0,-.079,.018),(0,-.085,.25),(0,-.099,.31),(0,-.090,.351),(0,-.103,.404),(0,-.089,.452),(0,-.101,.504),(0,-.087,.547),(0,-.096,.594),(0,-.077,.627)]
    m.rod('여밈 지퍼의 검정 테이프',zipcurve,.0045,'ink',8)
    for j in range(68):
        z=.030+.0087*j
        for lo,hi in zip(zipcurve,zipcurve[1:]):
            if lo[2]<=z<=hi[2]:
                d=lo[1]+(hi[1]-lo[1])*(z-lo[2])/(hi[2]-lo[2]);break
        m.block('작은 금속 지퍼 이빨',-.0011 if j%2 else .0011,d-.0036,z,.0030,.0019,.0026,'zipper',.00045)
    m.rod('고리 모양의 지퍼 손잡이',[(0,-.086,.041),(.004,-.089,.039),(.004,-.092,.023),(-.003,-.092,.023),(-.004,-.089,.038),(0,-.086,.041)],.0009,'steel',6)
    # Three raised leaves and seam breaks form the small white chest embroidery.
    for k,(x,turn) in enumerate([(.109,-.63),(.104,0),(.098,.63)]):
        vs=[];z=.548
        for j in range(13):
            t=j/12;y=(t-.5)*.018;w=.0045*sin(pi*t)
            for side in [-1,1]:vs.append((x+side*w*cos(turn)-y*sin(turn),-.081,z+side*w*sin(turn)+y*cos(turn)))
        m.piece('흰 트레포일 가슴 자수',vs,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(12)],'white')
