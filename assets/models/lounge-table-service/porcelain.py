"""Turned porcelain, tea, drinks and glossy lacquer chopsticks at the two public tables."""
from math import pi,tau,cos,sin
import random
import blender_shop_mesh as m
from pastry import rounded,disc

def spun(name,x,d,z,rings,mat,n=60,flutes=0,ell=1):
    v=[];f=[]
    for radius,h in rings:
        for j in range(n):
            a=tau*j/n;rr=radius*(1+(.009*cos(a*flutes) if flutes and radius>.010 else 0))
            v.append((x+rr*cos(a),d+ell*rr*sin(a),z+h))
    for j in range(len(rings)-1):
        for k in range(n):
            a=j*n+k;b=j*n+(k+1)%n;f.append((a,b,b+n,a+n))
    ob=m.piece(name,v,f,mat)
    for p in ob.data.polygons:p.use_smooth=True
    return ob

def saucer(x,d,z,r,h,mat='ivory',flutes=0):
    spun('유약을 바른 얇은 접시',x,d,z,[(r*.03,.001),(r*.39,.001),(r*.49,.003),(r*.54,.006),(r*.71,h*.46),
        (r*.95,h*.91),(r,h),(r*.995,h+.0019),(r*.97,h+.0021),(r*.73,h*.54),(r*.55,.009),(r*.10,.007),(r*.01,.007)],mat,84 if flutes else 52,flutes)

def loop_handle(name,x,d,z,rad,mat,left=False):
    s=-1 if left else 1
    def cubic(start,a,b,end,t):
        v=1-t
        return tuple(v**3*start[k]+3*v*v*t*a[k]+3*v*t*t*b[k]+t**3*end[k] for k in range(2))
    # Both ends intersect the pot or cup wall. These two Bezier arcs leave the finger opening clear.
    arcs=[((.78,1.04),(1.13,1.40),(1.62,1.23),(1.53,.83)),((1.53,.83),(1.46,.52),(1.06,.33),(.86,.33))]
    pts=[]
    for n,arc in enumerate(arcs):
        for i in range(0 if n==0 else 1,20):
            xx,h=cubic(*arc,i/19);pts.append((x+s*rad*xx,d,z+rad*h))
    m.rod(name,pts,.0031 if rad<.055 else .0048,mat,10)

def teacup(x,d,z,blue=False):
    r=.039;body='blueChina' if blue else 'ivory'
    saucer(x,d,z,.063,.008,body,24 if not blue else 0)
    rings=[(.018,.009),(.019,.013),(.023,.015),(.028,.021),(.035,.034),(.039,.049),(.041,.051),
           (.040,.053),(.038,.052),(.036,.047),(.031,.033),(.023,.021),(.011,.019)]
    spun('금테가 도는 찻잔' if blue else '도자기 찻잔',x,d,z,rings,body,72,22 if not blue else 0)
    loop_handle('찻잔 손잡이',x,d,z+.003,r,body)
    spun('잔 가장자리의 좁은 띠',x,d,z,[(.041,.050),(.0415,.051),(.040,.0525)],'gold' if blue else 'milk',70)
    disc('찻잔 안쪽 차와 옅은 메니스커스',x,d,z+.037,.036,.036,.0017,'tea')
    if blue:spun('잔 아래 옅은 흰 유약 띠',x,d,z,[(.029,.022),(.030,.024)],'bluePale',60)

def tea_pot(x,d,z,blue=False):
    tone='blueChina' if blue else 'ivory'
    # The official course photos show one white fluted pot; the Winter Bliss photo has blue glazed china.
    scale=1 if blue else .91
    raw=[(.035,.001),(.044,.004),(.047,.010),(.054,.019),(.061,.034),(.066,.054),(.066,.071),(.060,.091),(.049,.106),(.040,.111),(.040,.115),(.035,.115),(.035,.106)]
    spun('둥근 차 주전자의 배와 주둥이 입구',x,d,z,[(r*scale,h*scale)for r,h in raw],tone,96,0 if blue else 27)
    spun('단이 있는 주전자 뚜껑',x,d,z,[(r*scale,h*scale)for r,h in [(.040,.113),(.044,.115),(.043,.119),(.037,.122),(.022,.126),(.005,.129)]],tone,80,0 if blue else 27)
    spun('뚜껑 손잡이',x,d,z,[(r*scale,h*scale)for r,h in [(.005,.124),(.007,.132),(.011,.136),(.011,.140),(.007,.145),(.001,.146)]],tone,40)
    loop_handle('고리 모양 주전자 손잡이',x-.005*scale,d,z+.027*scale,.071*scale,tone)
    # The pouring lip opens upward, allowing the darker inner channel to be seen from a standing camera.
    rings=[(-.052,.037,.019),(-.066,.049,.015),(-.075,.068,.011),(-.084,.088,.010),(-.093,.108,.013),(-.093,.108,.010),(-.082,.088,.008)]
    v=[];f=[];n=30
    for xx,hh,rr in rings:
        for j in range(n):
            a=tau*j/n;v.append((x+scale*(xx+rr*.70*cos(a)),d+scale*rr*sin(a),z+scale*(hh+.003*cos(a))))
    for j in range(len(rings)-1):
        for i in range(n):a=j*n+i;b=j*n+(i+1)%n;f.append((a,b,b+n,a+n))
    tube=m.piece('속이 빈 주전자 주둥이',v,f,tone)
    for p in tube.data.polygons:p.use_smooth=True
    if blue:
        for r,h in [(.045,.116),(.045,.117),(.061,.033),(.040,.004)]:
            spun('두께가 다른 고운 금선',x,d,z,[(r*scale,h*scale),((r+.0003)*scale,(h+.0012)*scale)],'gold',80)

def highball(x,d,z):
    n=64;outer=[(.023,0),(.027,.004),(.028,.010),(.033,.108),(.034,.124)]
    spun('얇은 하이볼 유리와 투명한 입술',x,d,z,outer+[(.032,.125),(.031,.120),(.026,.012),(.021,.010)],'glass',n)
    for j in range(15):
        lo=.011+j*.00655;hi=lo+.00657
        r0=.0263+j*.00032;r1=r0+.00033
        spun('딸기에서 소다로 번지는 음료',x,d,z,[(r0,lo),(r1,hi)],'drink'+str(j),48)
    disc('소다 맨 위 표면',x,d,z+.108,.031,.031,.0011,'drink14')
    for j in range(6):
        a=j*2.4;m.block('반쯤 잠긴 투명 얼음',x+.015*cos(a),d+.016*sin(a),z+.095+(j%2)*.008,.018,.020,.015,'ice',.0035)
    m.rod('가는 황동색 금속 빨대',[(x+.007,d+.004,z+.016),(x-.017,d-.007,z+.165)],.00145,'gold',8)
    rng=random.Random(513);v=[];f=[]
    for j in range(120):
        a=rng.random()*tau;h=rng.uniform(.021,.120);rr=rng.uniform(.00042,.00135);r=.027+(h-.013)*.047
        px=x+r*cos(a);pd=d+r*sin(a);first=len(v);v.extend([(px,pd,z+h+rr),(px-.5*rr*sin(a),pd+.5*rr*cos(a),z+h),
            (px+.00035*cos(a),pd+.00035*sin(a),z+h-.7*rr),(px+.5*rr*sin(a),pd-.5*rr*cos(a),z+h)])
        f.extend([(first,first+1,first+2),(first,first+2,first+3)])
    m.piece('찬 잔에 맺힌 작은 물방울',v,f,'glass')

def plate_oblong(name,x,d,z,w,l,mat):
    # Thin rounded trays with an upturned rim. The UV projection follows each face after bevel evaluation.
    ob=m.block(name,x,d,z,w,l,.006,mat,.003)
    for side in [-1,1]:
        m.block('쟁반 양쪽 올라온 가장자리',x+side*(w/2-.003),d,z+.004,.006,l-.009,.003,mat,.0016)
    return ob

def chopsticks(x,d,z):
    m.profile('황동색 젓가락 받침',x,d+.05,z,[(.011,0),(.014,.004),(.012,.011)],'gold',24,.85)
    for i in [-1,1]:
        m.rod('옻칠한 검은 젓가락',[(x+i*.007-.007,d-.092,z+.006),(x+i*.007+.011,d+.103,z+.015)],.00255,'lacquer',8)
        m.rod('젓가락 뒤 금속 봉합',[(x+i*.007+.010,d+.094,z+.0145),(x+i*.007+.011,d+.104,z+.0151)],.00265,'gold',8)
