"""Bamboo steamers, scallop siu mai, pleated wrappers and the small dishes from the official hotel table."""
from math import pi,tau,sqrt,sin,cos
import random
import blender_shop_mesh as m
from pastry import rounded,disc
from porcelain import spun,saucer,plate_oblong

def ring(name,x,d,z,r,h,thickness,tone):
    return spun(name,x,d,z,[(r-thickness,0),(r,0),(r,h),(r-thickness,h),(r-thickness,0)],tone,72)

def basket(x,d,z,r=.080):
    disc('찜기 바닥의 대나무 판',x,d,z+.002,r*.94,r*.94,.006,'bamboo')
    for i in range(-7,8):
        s=i*r*.119;l=sqrt(max(0,(r*.94)**2-s*s))*2
        m.block('안에 차례로 놓인 대나무 발',x+s,d,z+.008,.0065,l,.0028,'bambooPale' if i%3 else 'bamboo',.0006)
    for j in range(4):
        ring('둥글게 만 대나무 띠',x,d,z+j*.012,r+.0007*(j%2),.013,.0026,'bamboo' if j in [0,3] else 'bambooPale')
    for h in [.0004,.021,.046,.050]:ring('얇은 테두리 결',x,d,z+h,r+.0011,.0018,.0027,'bambooEdge')
    for k in range(5):
        a=pi+.07*k;xx=x+r*cos(a);dd=d+r*sin(a)
        m.rod('대나무 결의 짧은 겹침 자국',[(xx,dd,z+.011),(xx+.0006,dd-.0008,z+.025)],.0005,'bambooMark',5)

def lid(x,d,z,r=.080):
    # Diagonal strips alternately pass over and under their neighbors inside a separate rim.
    ring('찜기 뚜껑의 두꺼운 테',x,d,z,r,.012,.004,'bamboo')
    for direction in [0,1]:
        for i in range(-9,10):
            off=i*r*.10;half=sqrt(max(0,(r*.957)**2-off**2));n=29;v=[];f=[]
            for k in range(n):
                along=-half+2*half*k/(n-1)
                h=.0076+.00072*cos(pi*(along/(r*.10)+i+direction))
                for side in [-1,1]:
                    transverse=off+side*.0036
                    a,b=(along,transverse) if direction==0 else (transverse,along)
                    # Rotate both sets of strips off the basket seam as on the photographed lid.
                    v.append((x+.91*a-.415*b,d+.415*a+.91*b,z+h))
                if k:f.append((2*k-2,2*k-1,2*k+1,2*k))
            m.piece('교차해 엮은 납작한 죽피',v,f,'bambooPale' if (i+direction)%3 else 'bambooEdge')

def wrapper(x,d,z,r,h,tone,pleats=14,open_top=False):
    n=70;v=[];f=[]
    rows=[(0,.63,0),(.05,.84,.012),(.18,.98,.03),(.36,1,.06),(.55,.94,.10),
          (.72,.78,.16),(.84,.59,.20),(.94,.32 if not open_top else .67,.27),(1,.10 if not open_top else .67,.35)]
    for t,width,crimp in rows:
        for j in range(n):
            a=tau*j/n;sharp=(.5+.5*cos(pleats*(a-.20*t)))**3
            rad=r*width*(1-crimp*sharp)
            v.append((x+rad*cos(a),d+rad*sin(a)*.93,z+t*h+.0016*crimp*cos(pleats*a)))
    for j in range(len(rows)-1):
        for k in range(n):
            s=j*n+k;q=j*n+(k+1)%n;f.append((s,q,q+n,s+n))
    ob=m.piece('한 장씩 모아 집은 만두피',v,f,tone)
    for p in ob.data.polygons:p.use_smooth=True
    if not open_top:rounded('만두 꼭지',x,d,z+h-.0008,r*.10,r*.10,.0018,tone,12,5)

def siumai(x,d,z,scallop=False):
    wrapper(x,d,z,.018,.024,'siumai',10,True)
    rounded('익힌 새우와 돼지고기 소',x,d,z+.0225,.012,.012,.0048,'shrimp',22,8)
    if scallop:
        spun('두툼한 관자살',x,d,z+.022,[(.011,0),(.013,.004),(.013,.010),(.011,.014),(.001,.015)],'scallop',44,13)
    rng=random.Random(113);v=z+.038 if scallop else z+.027
    for i in range(16):
        a=i*2.4;r=.0053*sqrt((i+.5)/16)
        rounded('관자 위 캐비어' if scallop else '날치알',x+r*cos(a),d+r*sin(a),v+.0008*(1-r/.006)+rng.uniform(-.0003,.0003),
                .0012,.0012,.0012,'caviar' if scallop else 'roe',8,4)

def hargow(x,d,z,r=.017):
    rounded('새우가 비치는 만두의 탱글한 몸체',x,d,z+.012,r,r*.83,.013,'shrimpWrap',32,14)
    for i in range(11):
        t=i/10;dx=(t-.5)*2*r;h=.008+.017*sqrt(max(0,1-(2*t-1)**2))
        pts=[(x+dx*.74,d-r*.70,z+.007),(x+dx*.94-.0015,d-r*.51,z+h*.69),
             (x+dx,d-.001,z+h),(x+dx+.001,d+r*.32,z+h*.82)]
        m.rod('하가우 가장자리의 반투명 겹주름',pts,.0019,'dumplingIvory',7)

def main_baskets():
    for x,d,mode in [(-.138,-.025,'classic'),(.057,.090,'bright'),(.092,-.121,'prawn')]:
        basket(x,d,0)
        if mode=='classic':
            wrapper(x-.041,d-.010,.013,.018,.035,'dumplingIvory',15)
            siumai(x+.001,d-.038,.013,True);hargow(x-.021,d+.038,.013)
            wrapper(x+.038,d-.011,.013,.019,.035,'redWrap',14)
            wrapper(x+.026,d+.034,.013,.018,.033,'goldWrap',7,True)
            rounded('금빛 피 끝의 가는 오이 고명',x+.026,d+.034,.046,.010,.004,.002,'cucumber',16,6)
        elif mode=='bright':
            wrapper(x-.028,d-.023,.013,.021,.039,'redWrap',14)
            siumai(x+.033,d-.015,.013);wrapper(x,d+.036,.013,.018,.036,'goldWrap',7,True)
            rounded('황금색 피 속 오이 고명',x,d+.036,.045,.011,.005,.002,'cucumber',16,6)
        else:
            for xx,dd in [(-.027,-.024),(.031,-.008),(-.006,.035)]:hargow(x+xx,d+dd,.014)
    before=set(m.group.objects);lid(0,0,0)
    from mathutils import Matrix
    trans=Matrix.Translation((-.136,-.095,.026))@Matrix.Rotation(-.84,4,'X')
    for ob in set(m.group.objects)-before:ob.data.transform(trans)

def appetizer():
    # Blue-and-white dipping bowl, scalloped plate and the rectangular three-item course.
    saucer(-.063,-.018,.003,.094,.012,'ivory',28)
    m.block('작은 딤섬을 받치는 직사각 대잎',-.080,-.023,.018,.088,.057,.0011,'leaf',.001)
    for i in range(2):
        rounded('고소하게 구운 작은 핑거푸드',-.095+i*.055,-.018,.029,.016,.014,.012,'crisp',24,9)
    plate_oblong('세 점을 나란히 내는 흰 도자기',.112,.102,.002,.188,.081,'ivory')
    for i,tone in enumerate(['radish','shrimp','cucumber']):
        x=.051+i*.058
        disc('접시에 담긴 제철 전채',x,.102,.009,.017,.015,.009,tone)
        rounded('전채 위 곁들임',x+.002,.10,.020,.008,.006,.004,['roe','green','scallop'][i],16,6)
    spun('푸른 무늬 양념 종지',.102,-.052,.0,[(.012,.001),(.015,.002),(.025,.009),(.033,.023),(.032,.025),(.028,.022),(.012,.009)],'bluePrint',64)
    disc('종지 안에 담은 소스',.102,-.052,.013,.023,.023,.002,'soy')
    for i in range(23):
        a=i*2.3;r=.017*sqrt((i+.2)/23)
        rounded('소스에 올린 부추와 고추',.102+r*cos(a),-.052+r*sin(a),.016,.0016,.0010,.001,['redWrap','green','seed'][i%3],8,4)

def family_ribs():
    saucer(0,0,.002,.105,.013,'ivory')
    for j in range(5):
        d=(j-2)*.023;w=.116-abs(j-2)*.009
        body=m.block('자스민향 등갈비의 짙은 유약',0,d,.020,w,.028,.026,'sear',.010)
        for i in range(4):
            x=(-.34+.21*i)*w
            m.rod('불에 그을린 갈빗살 결',[(x,d-.010,.041),(x+.003,d-.002,.045),(x+.004,d+.009,.041)],.0012,'char',5)
        m.rod('끝에 드러난 가는 갈비뼈',[(w/2-.009,d,.030),(w/2+.005,d+.002,.032)],.0034,'bone',7)
    for i in range(5):
        d=.052+i*.004
        m.rod('접시 끝의 가는 허브 줄기',[(-.052,d,.019),(-.017,d+.013,.021),(.03,d+.019,.023)],.0008,'green',5)
