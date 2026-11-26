"""Painted shell of an eleven-metre low-floor bus. Local d increases toward its nose."""
from math import pi,cos,sin,tau
from blender_shop_mesh import block as B,piece as P,rod as R

# Manufacturer envelope 10.995 × 2.490 m. The shoulder narrows at both ends.
HALF=1.245
FRONT=5.4975
AXLES=(-2.70,2.70)
DOORS=[(-.80,.50),(3.66,4.87)]


def width(d):
    a=abs(d)
    return HALF if a<5.15 else HALF-(a-5.15)*.49


def side_panel(name,side,outside,profile,material,thick=.042):
    pts=[(side*(width(d)+outside-off),d,z) for off in [0,thick] for d,z in profile]
    n=len(profile)
    faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,n+i) for i in range(n))
    if side>0:faces=[f[::-1] for f in faces]
    return P(name,pts,faces,material)


def band(name,side,a,b,z,height,material,offset=.001):
    return side_panel(name,side,offset,[(a,z),(b,z),(b,z+height),(a,z+height)],material)


def wrap(name,sections,material):
    # Sections ordered from tail to nose. Preserve the corner radius in the roof profile.
    loops=[]
    for d,half,bottom,top in sections:
        r=min(.13,(top-bottom)*.25)
        loops.append([(-half+.12,d,bottom),(-half,d,bottom+r),(-half,d,top-r),
                      (-half+.045,d,top-.036),(-half+.165,d,top),(half-.165,d,top),
                      (half-.045,d,top-.036),(half,d,top-r),(half,d,bottom+r),(half-.12,d,bottom)])
    n=len(loops[0])
    faces=[tuple(range(n)),tuple(reversed(range((len(loops)-1)*n,len(loops)*n)))]
    for a in range(len(loops)-1):
        for i in range(n):
            faces.append((a*n+i,(a+1)*n+i,(a+1)*n+(i+1)%n,a*n+(i+1)%n))
    return P(name,[v for row in loops for v in row],faces,material)


def ring(name,center,axis,rings,color,segments=32):
    vs=[]
    for along,r in rings:
        for i in range(segments):
            a=tau*i/segments
            if axis=='x':off=(along,r*cos(a),r*sin(a))
            else:off=(r*cos(a),along,r*sin(a))
            vs.append(tuple(center[k]+off[k] for k in range(3)))
    ix=[(j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i)
        for j in range(len(rings)-1) for i in range(segments)]
    return P(name,vs,ix,color)


def running_gear():
    for d in AXLES:
        for s in [-1,1]:
            x=s*(1.04 if d>0 else .9275)
            # Blackwall and shoulder are one continuous ring, including the inner edge.
            shapes=[(-.136,.303),(-.136,.428),(-.109,.467),(-.076,.479),(.080,.479),(.122,.460),(.143,.420),(.143,.304),(-.136,.303)]
            ring('타이어 · 라운드 숄더',(x,d,.479),'x',[(s*k,r) for k,r in shapes],'rubber',40)
            for off in [-.070,0,.070]:
                ring('트레드 · 둘레 홈',(x,d,.479),'x',[(s*(off-.006),.4794),(s*(off+.006),.4794)],'groove',36)
            for radius in [.319,.373,.405]:
                ring('측벽 압인',(x,d,.479),'x',[(s*.143,radius-.003),(s*.145,radius),(s*.143,radius+.003)],'rubber-edge',32)
            rim=[(.07,.02),(.07,.27),(.095,.298),(.141,.313),(.15,.31),(.141,.276),(.116,.251),(.114,.187),(.147,.152),(.166,.078),(.165,.001)]
            ring('휠 · 오목한 알루미늄 디스크',(x,d,.479),'x',[(s*k,r)for k,r in rim],'rim',36)
            for i in range(10):
                a=tau*i/10
                for radius,dia,col,ox in [(.216,.027,'rim-hole',.123),(.121,.015,'steel',.161)]:
                    y=d+radius*cos(a);z=.479+radius*sin(a)
                    ring('환기공' if col=='rim-hole' else '허브 육각 볼트',(x,y,z),'x',[(s*ox,.001),(s*(ox+.002),dia),(s*(ox+.004),dia*.95),(s*(ox+.004),.001)],col,10 if col=='rim-hole' else 6)


def shell():
    for a,b,w in [(-5.35,-3.30,2.17),(-3.30,-2.10,1.38),(-2.10,2.10,2.17),(2.10,3.30,1.38),(3.30,5.35,2.17)]:
        B('차륜 사이로 좁아지는 차대',0,(a+b)/2,.29,w,b-a,.09,'underframe',.013)
    wrap('앞 범퍼와 전면 패널',[(4.96,1.21,.326,1.03),(5.31,1.22,.335,1.16),(5.441,1.079,.37,1.055)],'blue')
    wrap('뒷범퍼와 후면 패널',[(-FRONT,1.087,.337,1.50),(-5.35,1.20,.32,1.52),(-5.06,1.24,.32,1.51)],'blue')
    roof=[(-5.47,1.09,2.64,2.89),(-5.33,1.20,2.65,3.01),(-5.11,1.234,2.65,3.05),
          (4.79,1.228,2.65,3.04),(5.08,1.205,2.64,2.99),(5.33,1.111,2.62,2.86)]
    wrap('일체형 지붕과 둥근 앞머리',roof,'blue')
    wrap('옥상 팩의 연속 흰 덮개',[(-5.15,1.1,2.95,3.04),(-4.86,1.13,2.97,3.29),(-4.45,1.13,2.98,3.36),
         (-2.45,1.13,2.98,3.40),(2.70,1.13,2.98,3.40),(4.33,1.12,2.98,3.34),
         (4.72,1.08,2.98,3.18),(4.99,1.00,2.96,3.025)],'roof')
    for side in [-1,1]:
        limits=[(-5.35,5.15)] if side==1 else [(-5.35,DOORS[0][0]),(DOORS[0][1],DOORS[1][0]),(DOORS[1][1],5.14)]
        for a,b in limits:
            bottom=[(a,.305)]
            for axle in AXLES:
                if a<axle<b:
                    r=.546
                    bottom.append((axle-r,.305))
                    bottom.extend((axle-r*cos(pi*t/20),.48+r*sin(pi*t/20)) for t in range(21))
                    bottom.append((axle+r,.305))
            bottom.append((b,.305))
            pts=bottom+[(b,1.35),(a,1.35)]
            side_panel('알루미늄 측면 패널 · 휠 아치',side,0,pts,'blue')
            band('은색 허리띠',side,a,b,1.22,.06,'belt',.004)
            for axle in AXLES:
                if a<axle<b:
                    r=.555
                    arc=[(side*(HALF+.003),axle-r*cos(pi*t/28),.48+r*sin(pi*t/28)) for t in range(29)]
                    R('아치 고무 덮개',arc,.019,'gasket',6)
        x=side*1.244
        for z,h,col in [(2.61,.147,'black'),(2.755,.049,'cyan'),(2.804,.032,'skyblue')]:
            band('유리 상단과 청색 도장선',side,-5.19,4.95,z,h,col)
        for d in [-4.94,-3.86,-1.70,1.57,3.40]:
            if side<0 and any(a<d<b for a,b in DOORS):continue
            B('점검 패널 이음',x,d,.53,.014,.009,.651,'panel-edge')
            B('직사각 뚜껑의 매입 손잡이',x+side*.010,d+.15,1.090,.016,.121,.024,'gasket',.006)
        for d in [-4.8,-1.4,2.0,4.95]:
            B('측면 반사등 바탕',x,d,.57,.020,.119,.049,'gasket',.005)
            B('주황 측면 반사등',x+side*.015,d,.58,.014,.095,.031,'amber',.004)
        for d in [-3.93,1.60,3.71]:
            B('지붕 덮개 분할선',side*1.131,d,3.025,.01,.013,.284,'roof-line')
    for d in [-3.8,-3.47,-3.13,-2.79]:
        B('루프 에어컨 흡입 프레임',0,d,3.345,1.69,.272,.057,'roof-line',.014)
        for x in range(-8,9):
            B('방열판의 평행 날개',x*.092,d,3.399,.027,.237,.008,'roof')
    for side in [-1,1]:
        x=side*1.145
        for i in range(12):
            B('후미 측판 · 송풍 루버',x+side*.094,-4.58+i*.052,1.02,.022,.016,.176,'panel-edge')
    for d in [-5.0,5.0]:
        for s in [-1,1]:B('범퍼 파팅라인',s*.77,d,.445,.16,.16,.028,'gasket')


def windshield():
    # Front and rear glass bow in plan and lean inward with height.
    for front in [True,False]:
        sign=1 if front else -1
        base,top=(1.055,2.583) if front else (1.18,2.51)
        span=1.104 if front else 1.09
        across=[-1,-.75,-.50,-.25,0,.25,.50,.75,1]
        verts=[]
        for level in range(4):
            t=level/3
            for f in across:
                d=(5.474-(.035*f*f+.118*abs(f)**4)-(.220 if front else .095)*t)*sign
                verts.append((span*f,d,base+(top-base)*t+.035*(1-f*f)*(1-t)))
        faces=[(r*9+i,r*9+i+1,(r+1)*9+i+1,(r+1)*9+i)for r in range(3)for i in range(8)]
        P('앞 2피스 곡면 유리' if front else '후면 곡면 유리',verts,faces,'glass')
    for side in [-1,1]:
        for a,b in window_bays(side):
            side_panel('측창 · 하프 드롭 글라스',side,.003,[(a,1.375),(b,1.375),(b,2.613),(a,2.613)],'glass',.003)
        if side==-1:
            for a,b in DOORS:
                for low,high in [(a+.041,(a+b)/2-.022),((a+b)/2+.022,b-.041)]:
                    side_panel('출입문 투명 안전 유리',side,.002,[(low,.477),(high,.477),(high,2.575),(low,2.575)],'glass',.003)


def window_bays(side):
    divs=([-5.17,-4.00,-2.65,-1.26,.14,1.49,2.82,4.08,5.11] if side>0 else
          [-5.17,-3.88,-2.55,-1.35,-.80,.50,1.79,3.03,3.66,4.87,5.10])
    return [(a+.031,b-.031) for a,b in zip(divs,divs[1:]) if not(side<0 and (a,b) in DOORS)]


def surrounds():
    for side in [-1,1]:
        x=side*(HALF+.002)
        for a,b in window_bays(side):
            for d in [a-.028,b+.027]:B('검은 유리 기둥',side*width(d),d,1.333,.068,.064,1.333,'black',.006)
            band('하단 창틀',side,a,b,1.321,.053,'gasket',.002)
            if b-a>1.06:
                band('상부 개폐창 고무선',side,a,b,2.232,.025,'rubber-edge',.011)
                B('상부 슬라이딩 접합부',x,(a+b)/2,2.251,.018,.024,.350,'black')
                B('창문 손잡이',x,(a+b)/2-.08,2.208,.025,.085,.036,'black',.006)
        for a,b in (DOORS if side<0 else []):
            for d in [a+.007,(a+b)/2,b-.007]:
                B('출입문 세로 고무 프레임',x,d,.34,.071,.044,2.309,'black',.006)
            for z,height in [(.323,.145),(1.294,.073),(2.57,.083)]:
                band('승하차문 프레임과 하단 보호띠',side,a,b,z,height,'black',.016)
            for d in [a+.20,b-.20]:
                B('문턱 노란 미끄럼 방지',-1.16,d,.306,.18,.34,.025,'yellow')
    for s in [-1,1]:
        R('전면 모서리 검은 창틀',[(s*1.074,5.341,1.04),(s*1.108,5.164,2.42),(s*1.07,5.115,2.64)],.054,'black',10)
        R('앞유리 평행 와이퍼',[(s*.57,5.483,1.085),(s*.42,5.488,1.22),(s*.25,5.474,1.34)],.017,'black',8)
        R('와이퍼 고무 날',[(s*.88,5.415,1.44),(s*.46,5.473,1.36),(s*.06,5.492,1.29)],.016,'rubber-edge',8)
        R('미러의 꺾인 암',[(s*1.08,5.03,2.67),(s*1.425,5.09,2.55),(s*1.463,5.30,2.46)],.038,'black',10)
        B('미러 하우징',s*1.455,5.30,2.14,.145,.118,.35,'black',.037)
        B('미러 은색 유리',s*1.455,5.243,2.17,.109,.011,.279,'mirror',.021)
        B('미러 방향 지시등',s*1.455,5.36,2.27,.096,.012,.028,'amber',.005)
        # A continuous charcoal mask wraps the windscreen sill and narrows toward the nose.
        trim=[(.02,5.454,1.076),(.85,5.431,1.061),(1.075,5.369,1.124),
              (1.096,5.337,1.192),(.86,5.444,1.139),(.02,5.469,1.112)]
        P('앞유리 아래 검은 가장자리',[(s*x,d,z) for x,d,z in trim],[tuple(range(6))],'black')
        R('앞 범퍼의 꺾인 은색 장식',[(s*.043,5.447,.566),(s*.50,5.447,.553),(s*.681,5.447,.598)],.009,'belt',6)
        # Tapered dark lamp housings with two round projector lenses.
        side=s
        profile=[(.62,.513),(1.051,.543),(1.033,.995),(.882,.904),(.702,.709)]
        verts=[(u*s,5.487-.052*(u-.62),z) for u,z in profile]
        P('전조등 · 삼각 블랙 베젤',verts,[tuple(range(len(verts)))],'black')
        for u,z,r in [(.900,.767,.078),(.785,.639,.052)]:
            center=(u*s,5.483,z)
            ring('프로젝터 · 금속 렌즈컵',center,'d',[(-.026,.01),(-.021,r*.90),(0,r),(.011,r*.77)],'rim',24)
            ring('프로젝터 · 둥근 유리렌즈',center,'d',[(.011,r*.77),(.028,r*.62),(.035,.002)],'lamp',24)
        R('주간 주행등의 꺾인 선',[(s*.697,5.493,.62),(s*.766,5.486,.73),(s*.979,5.472,.925)],.013,'lamp',8)
        for i,col in enumerate(['brake','reverse','indicator','brake']):
            center=(s*.988,-5.486,.590+i*.178)
            ring('후미등 · 금속 환과 원형 렌즈',center,'d',[(0,.008),(-.005,.072),(-.014,.071),(-.016,.061)],'rim',24)
            ring('후미등 렌즈',center,'d',[(-.016,.062),(-.028,.055),(-.041,.003)],col,24)
    R('곡면 앞유리 중간 접합부',[(0,5.483,1.078),(0,5.395,1.72),(0,5.271,2.595)],.012,'black',8)
    for f in [-1,1]:
        B('노선 전광판 검은 프레임',0,5.257*f,2.57,1.95,.14,.31,'black',.033)
        B('번호판 · 받침',0,5.495*f,.501,.52,.025,.173,'underframe',.011)
        B('영업용 노란 번호판',0,5.511*f,.519,.474,.013,.143,'plate',.004)
