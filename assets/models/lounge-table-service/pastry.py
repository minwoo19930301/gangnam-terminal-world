"""Small plated winter pastries and savouries studied from the hotel's November 2026 serving photograph."""
from math import pi,tau,sin,cos,sqrt
import random
import blender_shop_mesh as m

def rounded(name,x,d,z,rx,ry,rz,mat,n=30,rings=13):
    verts=[];faces=[]
    for j in range(rings+1):
        a=-pi/2+pi*j/rings;c=max(.0001,cos(a));s=sin(a)
        for i in range(n):
            t=tau*i/n;verts.append((x+rx*c*cos(t),d+ry*c*sin(t),z+rz*s))
    for j in range(rings):
        for i in range(n):
            k=j*n+i;q=j*n+(i+1)%n;faces.append((k,q,q+n,k+n))
    ob=m.piece(name,verts,faces,mat)
    for p in ob.data.polygons:p.use_smooth=True
    return ob

def disc(name,x,d,z,rx,ry,height,mat):
    return m.profile(name,x,d,z,[(rx*.90,0),(rx*.98,height*.12),(rx,height*.26),(rx,height*.75),(rx*.97,height*.94),(rx*.90,height)],mat,36,ry/rx)

def berry(x,d,z,r=.012,tilt=0,half=False):
    # Achenes sit in indented pockets. The same curved body is usable as a whole fruit or a sliced half.
    n=48;kmax=25;verts=[];faces=[];seed=[];rng=random.Random(743+int(abs(x)*20000))
    for row,(t,count) in enumerate([(.14,9),(.27,12),(.40,15),(.54,15),(.68,14),(.80,11),(.89,8)]):
        for k in range(count):seed.append((2*pi*(k+(row%2)*.5)/count+rng.uniform(-.033,.033),t+rng.uniform(-.009,.009)))
    def fruit(t,a,pocket=True):
        base=(max(0,sin(pi*t))**.56)*(.63+.64*t)
        deep=0
        if pocket:
            for angle,h in seed:
                delta=(a-angle+pi)%tau-pi
                if abs(delta)<.16 and abs(t-h)<.075:deep=max(deep,.073*max(0,1-(delta/.16)**2-((t-h)/.075)**2)**2)
        rr=r*max(.007,base-deep)
        return (x+rr*cos(a)+r*tilt*(1-t),d+rr*sin(a),z+t*r*2.35)
    for j in range(kmax+1):
        for i in range(n+1):
            a=(-pi if half else -pi)+((pi if half else tau)*i/n);verts.append(fruit(j/kmax,a))
    for j in range(kmax):
        for i in range(n):
            k=j*(n+1)+i;faces.append((k,k+1,k+n+2,k+n+1))
    ob=m.piece('딸기의 오목한 씨방과 붉은 껍질',verts,faces,'berry')
    for p in ob.data.polygons:p.use_smooth=True
    ob['web_berry']=[x,d,z,r,tilt,int(half)]
    # An assembled piece scatters the yellow seeds into a single editable object per berry.
    sv=[];sf=[]
    for a,h in seed:
        a=(a+pi)%tau-pi
        if half and a>0:continue
        px,pd,pz=fruit(h,a)
        start=len(sv)
        for radius,dz in [(.14,-.045),(.47,-.009),(.27,.036),(.07,.055)]:
            for k in range(5):
                t=tau*k/5;tangent=radius*r*.092*cos(t);out=.011*r+.017*r*sin(t)
                sv.append((px+out*cos(a)-tangent*sin(a),pd+out*sin(a)+tangent*cos(a),pz+dz*r))
        for row in range(3):
            for k in range(5):
                l=start+row*5+k;q=start+row*5+(k+1)%5;sf.append((l,q,q+5,l+5))
    if sf:
        seeds=m.piece('딸기씨의 콜드 옐로 하이라이트',sv,sf,'seed')
        seeds['seeds_on_berry_atlas']=True
    if half:
        vs=[];fs=[]
        for j in range(kmax+1):
            h=j/kmax;l=fruit(h,-pi,False);rgt=fruit(h,0,False)
            vs.extend([l,rgt])
            if j:fs.append((2*j-2,2*j-1,2*j+1,2*j))
        m.piece('자른 딸기의 밝은 과육',vs,fs,'cutBerry')
        for k in [-1,1]:
            m.rod('단면의 흰 섬유맥',[(x,d+.0003,z+r*.45),(x+k*r*.30,d+.0003,z+r*1.27),(x+k*r*.58,d+.0003,z+r*1.81)],.00048,'berryVein',5)

def round_cake(x,d,z):
    disc('붉은 딸기 무스 옆면',x,d,z,.027,.025,.022,'pannaRed')
    disc('상단 바닐라 무스',x,d,z+.019,.025,.024,.010,'vanilla')
    disc('얇은 딸기 콩피',x,d,z+.029,.022,.021,.0032,'jam')
    for j in range(20):
        a=tau*j/20
        rounded('무스 옆의 흰 초콜릿 점',x+.026*cos(a),d+.024*sin(a),z+.008+(.003*(j%3)),.0011,.0011,.001,'vanilla',8,5)

def parfait(x,d,z):
    m.profile('얇은 분홍 파나코타 층',x,d,z,[(.015,0),(.020,.005),(.021,.030)],'yogurt',38)
    disc('유리잔 속 진한 딸기 잼 층',x,d,z+.028,.021,.021,.006,'jam')
    disc('딸기 위 흰 요거트 크림',x,d,z+.033,.021,.021,.014,'cream')
    for j in range(6):
        a=tau*j/6;rounded('요거트 위 크림 꽃잎',x+.0135*cos(a),d+.0135*sin(a),z+.048,.008,.008,.006,'cream',14,7)
    berry(x,d,z+.046,.012,half=True)

def eclair(x,d,z):
    rounded('에클레어의 구운 슈 껍질',x,d,z+.011,.025,.014,.011,'choux')
    rounded('길게 짠 딸기 크림',x,d,z+.020,.024,.012,.008,'roseCream')
    for k in [-1,0,1]:berry(x+k*.014,d,z+.023,.0060,tilt=.11,half=True)

def raspberry(x,d,z):
    disc('피스타치오색 받침 비스퀴',x,d,z,.020,.018,.0038,'pistachio')
    m.profile('둥글게 세운 피낭시에',x,d,z+.0035,[(.016,0),(.018,.012),(.014,.031),(.009,.037)],'financier',25,.90)
    rng=random.Random(17)
    for k in range(25):
        a=k*2.4;h=rng.uniform(.006,.027);r=.017*(1-.18*h/.027)
        rounded('라즈베리 파우더와 돌기',x+r*cos(a),d+r*.9*sin(a),z+h,.0015,.0015,.0018,
                'roseCream' if k%3 else 'berry',7,4)
    berry(x,d,z+.038,.0064,tilt=.18)

def mousse(x,d,z):
    disc('얼그레이 무스의 납작한 초콜릿 받침',x,d,z,.024,.015,.003,'darkCocoa')
    rounded('붉은 벨벳 베리 무스',x,d,z+.017,.024,.017,.014,'velvet')
    rounded('위쪽 크림 로제트',x-.004,d,z+.032,.008,.007,.005,'roseCream',20,10)
    berry(x+.006,d,z+.030,.0048)

def slider(x,d,z):
    disc('검은 미니 번 아래',x,d,z,.024,.024,.009,'blackBun')
    for j in range(16):
        a=tau*j/16;r=.021
        rounded('번 사이로 보이는 작은 채소',x+r*cos(a),d+r*sin(a),z+.013+.0017*sin(4*a),.006,.006,.0038,
                'lettuce' if j%3 else 'green',10,5)
    disc('구운 패티와 소스',x,d,z+.016,.022,.022,.007,'sear')
    disc('치즈 슬라이스',x,d,z+.022,.0225,.022,.0027,'cheddar')
    rounded('먹물색 반구형 번',x,d,z+.032,.024,.024,.015,'blackBun',25,12)
    m.rod('위아래를 고정하는 꼬치',[(x,d,z+.04),(x+.0008,d,z+.060)],.0007,'bamboo',6)

def taco(x,d,z):
    n=27;v=[];faces=[]
    for i in range(n):
        t=i/(n-1);a=pi*t
        for side in [-1,1]:
            v.append((x+.026*cos(a),d+side*(.005+.012*sin(a)),z+.002+.021*sin(a)))
        if i:faces.append((2*i-2,2*i-1,2*i+1,2*i))
    ob=m.piece('금빛 옥수수 타코 셸',v,faces,'taco')
    for f in ob.data.polygons:f.use_smooth=True
    for j in range(10):
        t=(j-4.5)/9
        rounded('타코의 가재살과 허브',x+t*.038,d+.003*sin(j*2),z+.016+.005*cos(t*pi),.005,.0046,.0045,
                ['lobster','cream','lettuce'][j%3],10,6)

def roe_tart(x,d,z):
    m.profile('화이트 타르틀레트 셸',x,d,z,[(.012,0),(.019,.011),(.018,.014),(.015,.012)],'vanilla',26)
    rounded('크렘과 딜',x,d,z+.012,.013,.012,.004,'cream',18,7)
    rng=random.Random(141)
    for j in range(39):
        a=j*2.4;r=.0085*sqrt((j+.4)/39)
        rounded('검은 캐비어 알',x+r*cos(a),d+r*sin(a),z+.016+.004*(1-r/.009)+rng.uniform(-.0006,.0006),
                .0014,.0014,.0012,'caviar',7,4)
    for t in [-1,1]:m.rod('타르트에 얹은 딜 한 잎',[(x+.007,d+.002,z+.013),(x+.017,d+t*.007,z+.021)],.0007,'green',5)
