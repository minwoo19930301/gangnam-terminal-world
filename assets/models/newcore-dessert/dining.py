"""The framed bakeware, the plated grill order and a public dining table."""
from math import pi,tau,sin,cos
from random import Random
import blender_shop_mesh as m

def make_dining(group,ball,loft,letters,face_ring,rim):
    B=m.block;P=m.profile;R=m.rod
    group('wall')
    B('밝은 아이보리 미장 벽',0,0,0,4.26,.121,3.01,'wall',.006)
    B('아래쪽 이어지는 몰딩',0,-.071,.040,4.27,.055,.121,'beige',.009)
    for x,h,r,pattern in [(-1.36,1.27,.26,0),(-1.53,1.91,.35,1),(-1.02,2.31,.29,2),(-.53,2.47,.22,1),(.06,2.60,.31,0),(.68,2.41,.23,1),
        (1.14,2.20,.26,0),(1.47,1.72,.285,2),(1.08,1.27,.225,1),(.54,.98,.255,0),(-.02,.77,.17,1),(-.59,.93,.23,2),(-1.02,1.02,.155,0)]:
        face_ring('구움틀의 접힌 테두리',x,-.112,h,r,.016,'bronze',38,.94)
        vs=[];fs=[];n=44
        for j,(rr,d) in enumerate([(r,-.112),(.90*r,-.147),(.77*r,-.144),(.62*r,-.091),(.12*r,-.080),(.002,-.081)]):
            for k in range(n):
                a=tau*k/n;wrinkle=1+(.055*cos(a*(10+pattern*2)) if pattern else 0)
                vs.append((x+rr*wrinkle*cos(a),d,h+rr*.94*wrinkle*sin(a)))
        for j in range(5):fs.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
        m.piece('벽에 걸린 주름 구움틀',vs,fs,'bronzedark' if pattern else 'steel')
        if pattern:face_ring('틀 가운데 고리',x,-.108,h,r*.35,.007,'brass',28,.86)
        if pattern==0:
            R('손잡이 달린 작은 팬',[(x+r*.82,-.115,h+r*.18),(x+r*1.20,-.12,h+r*.43),(x+r*1.44,-.12,h+r*.60)],.021,'bronze')
    group('crest')
    def plaque(rx,rz,d,mat):
        n=60
        p=[(rx*cos(i*tau/n),d,.351+rz*sin(i*tau/n)) for i in range(n)]
        return m.piece('타원형 금속 명판',p,[tuple(range(n))],mat)
    plaque(.615,.328,-.009,'bronze');plaque(.589,.303,-.012,'char')
    face_ring('명판 외곽 금선',0,-.019,.351,.572,.0065,'gold',60,.494)
    letters('ASHLEY',0,-.023,.435,1.02,.195,'paper',True);letters('QUEENS',0,-.023,.283,.94,.152,'paper',True)
    letters('AMERICAN  GRILL  &  SALAD',0,-.024,.176,.73,.044,'gold')
    group('table')
    P('식사용 테이블 원형 바닥',0,0,.008,[(.23,0),(.242,.009),(.232,.026),(.109,.037)],'bronzedark',38)
    P('테이블 받침 기둥',0,0,.045,[(.066,0),(.061,.054),(.043,.071),(.043,.505),(.065,.541),(.126,.62)],'char',24)
    loft('두 사람이 앉는 식탁의 상판',0,0,.695,[(.96,.76,0),(.98,.78,.011),(.98,.78,.050),(.966,.766,.053)],'beige')
    for axis in [-1,1]:
        d=axis*.716
        for xx in [-.189,.189]:
            for dd in [-.16,.16]:
                R('참나무 의자 다리',[(xx*1.10,d+dd*1.14,.011),(xx,d+dd,.405)],.023,'wood',10)
        loft('올리브색 패브릭 좌판',0,d,.394,[(.437,.429,0),(.456,.44,.027),(.439,.429,.073),(.414,.406,.082)],'chair')
        for xx in [-.179,.179]:
            R('등받이 지주',[(xx,d+axis*.173,.432),(xx,d+axis*.226,.699),(xx,d+axis*.226,.823)],.018,'wood',10)
        vs=[];fs=[]
        for ht,off in [(.625,0),(.680,.016),(.805,.018),(.857,-.002)]:
            for i in range(12):
                t=(i-5.5)/5.5;vs.append((t*.218,d+axis*(.241-.046*t*t+off),ht-.034*t*t))
        for j in range(3):fs.extend([(j*12+i,j*12+i+1,(j+1)*12+i+1,(j+1)*12+i) for i in range(11)])
        ob=m.piece('둥글게 감싼 의자 등받이',vs,fs,'chair',.003);sol=ob.modifiers.new('쿠션의 두께','SOLIDIFY');sol.thickness=.029
    group('steak')
    def plate(x,d,r):
        P('백색 림 접시',x,d,0,[(r*.48,0),(r*.57,.004),(r*.59,.009),(r*.93,.019),(r,.029),(r*.99,.033),(r*.92,.030),(r*.73,.015),(r*.58,.013),(0,.013)],'bowl',48)
    plate(-.126,-.025,.123);plate(.146,.045,.143)
    rng=Random(1126)
    def steak(x,d,rx,rd,h,phase):
        n=32;vs=[];fs=[];edge=[rng.uniform(.92,1.08) for _ in range(n)]
        for lev,(s,hh) in enumerate([(.71,0),(.95,.11),(1,.36),(.919,.76),(.78,.96),(.46,1.02),(.08,1.05)]):
            for i in range(n):
                a=tau*i/n;w=edge[i]*s;v=rx*w*cos(a);t=rd*w*sin(a)
                vs.append((x+v*cos(phase)-t*sin(phase),d+v*sin(phase)+t*cos(phase),.015+h*hh+h*.048*sin(3*a+lev)))
        for j in range(6):fs.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
        fs.append(tuple(range(6*n,7*n)));ob=m.piece('구운 소고기 표면과 익은 가장자리',vs,fs,'meat')
        for t in ['sear','juices','fat']:ob.data.materials.append(m.palette[t])
        for p in ob.data.polygons:
            p.use_smooth=True
            if p.index%17 in [3,4]:p.material_index=1
            elif p.index%19 in [9,10]:p.material_index=2
            elif p.index//n in [3,4] and p.index%13==7:p.material_index=3
        for i in range(5):
            off=(i-2)*rd*.255;xx=rx*(.62-abs(i-2)*.06)
            R('스테이크의 갈색 그릴 자국',[(x-xx,d+off-.014,.015+h*.85),(x-xx*.46,d+off-.006,.016+h*.99),
               (x+xx*.18,d+off+.003,.017+h*1.01),(x+xx,d+off+.016,.015+h*.87)],.0019,'sear',5)
    steak(-.148,-.040,.060,.040,.028,.27);steak(-.087,-.003,.048,.035,.025,-.61);steak(.113,.069,.065,.040,.026,.55)
    for i in range(9):
        pts=[]
        for j in range(17):
            a=j*.46+i*.8;r=.014+j*.001
            pts.append((.20+r*cos(a),.073+r*sin(a),.02+i*.0008+.002*sin(2*a)))
        R('알리오올리오 면발',pts,.0027,'pasta',6)
    for dx,dd in [(.146,-.001),(.180,-.008),(.129,.018)]:
        R('브로콜리 줄기',[(dx,dd,.018),(dx+.007,dd+.004,.033)],.005,'sprout',8)
        for k in range(7):
            a=tau*k/7;ball('브로콜리 꽃봉오리',dx+.009*cos(a),dd+.008*sin(a),.035+.003*sin(k),.007,.007,.006,'broccoli',8,5)
    for j in range(4):
        x=.080+j*.009;R('구운 아스파라거스',[(x,-.012,.02),(x+.025,.005,.025),(x+.061,.022,.031)],.0036,'asparagus')
        ball('아스파라거스 봉오리',x+.063,.023,.032,.009,.004,.004,'sprout',8,6)
    for j in range(4):B('구운 당근',.143+j*.011,-.029,.022,.007,.038,.007,'carrot',.003)
