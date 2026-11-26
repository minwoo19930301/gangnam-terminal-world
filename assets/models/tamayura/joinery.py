"""Public dining counters, architectural finishes and two editable seat designs."""
from math import cos, sin, pi, tau, sqrt
import blender_shop_mesh as m

B,R,V,F=m.block,m.rod,m.profile,m.piece

def return_edge(name,x,d,z,w,l,h,tone):
    B(name,x,d,z,w,l,h,tone,min(.008,h*.17))

def sushi_bar():
    B('편백 바 · 안쪽으로 물린 발판',0,.08,.024,6.42,.48,.144,'blackwood',.025)
    B('편백 바 · 세로 판재 몸체',0,.08,.166,6.42,.49,.562,'walnut',.012)
    for k in range(16):
        x=-3.12+k*.416
        B('손님 쪽 세로 목재',x,-.177,.166,.409,.033,.556,'ash',.004)
    B('한 장으로 이어지는 편백 상판',0,0,.725,6.67,.86,.101,'hinoki',.014)
    for side in [-1,1]:
        B('편백 단면',side*3.335,-.004,.734,.006,.824,.083,'hinoki_edge',.003)
    B('조리사 쪽 낮은 편백 작업대',0,.93,.662,6.23,.59,.073,'hinoki',.009)
    B('조리대 아래 짙은 목재',0,.99,.10,6.13,.42,.565,'walnut',.009)
    B('옅은 부조 벽 · 짙은 하부 걸레받이',0,1.62,.017,6.65,.12,.54,'blackwood',.007)
    B('부조 사이에 보이는 옅은 바탕',0,1.69,.54,6.65,.08,2.55,'cream2')
    rows=[[-3.325,-2.31,-.51,.82,2.51,3.325],[-3.325,-1.62,-.26,1.64,3.325],[-3.325,-2.67,-.91,.41,2.12,3.325]]
    for j,edges in enumerate(rows):
        for i,(a,b) in enumerate(zip(edges,edges[1:])):
            proj=[.049,.025,.080,.038][(j*2+i)%4]
            B('흰 부조 · 높이가 다른 석고판',(a+b)/2,1.642-proj/2,.55+.84*j,b-a-.011,proj,.824,'cream' if (i+j)%4 else 'cream2',.004)
    for k in range(20):
        B('끝벽의 편백 세로살',-3.34,.08+k*.077,.05,.068,.035,2.99,'ash',.006)
    B('편백 천장 마감',0,.87,3.095,6.68,1.7,.092,'tea_wood',.009)
    B('부조 위 간접광',0,1.47,3.055,6.50,.095,.027,'cove',.003)
    for x in [-2.68,-.90,.89,2.66]:
        B('조리사 도마',x,.91,.736,.72,.35,.034,'hinoki_edge',.007)
    for x in [-2.22,1.52]:
        B('옻칠 도마 받침',x,.92,.733,.30,.21,.022,'glaze_dark',.005)

def teppan_bar():
    B('철판 바 · 기단',0,.22,.023,3.37,1.91,.112,'charcoal',.014)
    B('흑석 바 · 뒷단',0,.22,.134,3.42,1.85,.60,'blackwood',.009)
    B('손님 정면 흑석 상판',0,-.567,.735,3.67,.686,.068,'granite',.015)
    for side in [-1,1]:
        B('손님 측면 흑석 상판',side*1.497,.41,.735,.68,1.286,.068,'granite',.012)
        B('철판 둘레 스테인리스 옆줄',side*1.143,.405,.759,.025,1.273,.039,'steel',.003)
    B('철판 둘레 스테인리스 전면 줄',0,-.214,.759,2.29,.027,.039,'steel',.003)
    B('요리용 헤어라인 철판',0,.405,.754,2.266,1.211,.043,'steel',.011)
    B('철판 뒤쪽 기름받이 홈',0,.997,.796,2.25,.031,.004,'hood_inner')
    for x in [-.55,.48]:
        V('따뜻한 구리 클로슈',x,.54,.800,[(.144,0),(.147,.008),(.141,.024),(.127,.056),(.097,.087),(.056,.106),(.018,.112)],'copper',32)
        V('클로슈 손잡이',x,.54,.911,[(.012,0),(.012,.009),(.019,.014),(.019,.021),(.013,.025)],'brass',16)
    for x in [-.61,.55]:
        R('서비스용 뒤집개 손잡이',[(x,.75,.811),(x+.065,.89,.822)],.009,'blackwood',8)
        F('납작한 뒤집개 날',[(x-.033,.69,.807),(x+.012,.67,.807),(x+.052,.746,.811),(x+.008,.766,.811)],[(0,1,2,3)],'steel')
    B('벽의 따뜻한 청동 테두리',0,1.53,.01,3.68,.108,2.85,'bronze',.010)
    B('독창적 운문 금속 마감',0,1.461,.54,3.26,.052,2.16,'mural',.009)
    for x in [-1.72,1.72]:
        B('갈색 목재 문선',x,1.441,.014,.21,.085,2.83,'walnut')
    for j in range(4):
        B('후드 상단의 가공 이음',-1.37+.913*j,.26,2.37,.908,1.78,.77,'bronze',.005)
    B('후드 아래 어두운 테두리',0,.26,2.32,3.66,1.79,.063,'hood_inner',.008)
    B('후드 아래의 필터 프레임',0,.26,2.302,3.41,1.49,.023,'brass',.005)
    B('목재 후드의 그림자진 흡입면',0,.26,2.293,3.12,1.23,.015,'hood_inner',.002)
    for k in range(17):
        B('분리 가능한 후드 필터 살',0,-.29+.069*k,2.285,3.06,.017,.011,'iron',.002)
    for d in [-.442,.963]:B('좁은 조리 작업등',0,d,2.287,3.30,.026,.016,'cove',.003)
    for x in [-1.39,-.47,.47,1.39]:
        V('후드 하부 매입등',x,-.591,2.293,[(.027,0),(.034,.004),(.034,.009)],'cove',14)

def cup(name,x,d,z,r,h,tone='porcelain'):
    V(name,x,d,z,[(r*.62,0),(r*.61,h*.08),(r*.74,h*.14),(r*.93,h*.60),(r,h*.93),(r*.96,h),(r*.86,h*.98),(r*.78,h*.75),(r*.53,h*.24)],tone,22)
def pot(name,x,d,z,scale,tone):
    def rings(data):return [(r*scale,h*scale) for r,h in data]
    V(name,x,d,z,rings([(.044,0),(.054,.008),(.077,.025),(.085,.067),(.069,.105),(.048,.117),(.044,.125)]),tone,26)
    V(name+' 뚜껑',x,d,z,rings([(.049,.114),(.052,.120),(.047,.127),(.010,.142),(.012,.151),(.008,.158)]),tone,24)
    R(name+' 따르는 주둥이',[(x-.060*scale,d,z+.045*scale),(x-.10*scale,d,z+.075*scale),(x-.125*scale,d,z+.108*scale)],.011*scale,tone,12)
    loop=[(x+(.068+.055*sin(pi*t/10))*scale,d,z+(.039+.076*t/10)*scale) for t in range(11)]
    R(name+' 귓고리 손잡이',loop,.010*scale,tone,9)

def tea_bar():
    B('원목 차 바 · 낮은 주춧돌',0,.03,.024,3.57,.57,.105,'charcoal',.014)
    B('차 바 · 정면 목재',0,.02,.13,3.57,.60,.596,'walnut',.013)
    B('차 바 · 넓은 호박색 상판',0,0,.726,3.85,.78,.086,'tea_wood',.019)
    # Iron inset is flush with the end of the long slab.
    B('차 화로의 흑철 테두리',1.10,0,.811,.47,.37,.009,'iron',.007)
    for n in range(9):B('화로 위 쇠살',.915+n*.045,0,.821,.018,.31,.006,'hood_inner',.002)
    pot('철 주전자',1.095,.015,.832,.89,'glaze_dark')
    B('뒤쪽 찻장 기단',0,1.09,.02,3.79,.42,.71,'walnut',.012)
    B('찻장 뒤 한지 벽',0,1.34,.04,3.84,.079,2.85,'shoji',.005)
    for k in range(4):
        B('따뜻한 나무 장문',-1.437+k*.958,.874,.10,.947,.027,.605,'tea_wood',.005)
    B('찻장 위 얇은 상판',0,1.057,.729,3.81,.54,.052,'ash',.007)
    for z,length in [(1.55,2.90),(2.09,2.48)]:
        B('벽 앞에 매단 원목 선반',.15,1.12,z,length,.29,.034,'walnut',.004)
    for x in [-1.04,.68,1.28]:
        R('선반의 가는 황동 봉',[(x,1.04,1.39),(x,1.04,2.89)],.008,'brass',9)
    for row,(base,coords) in enumerate([(.781,[-1.48,-1.18,.72,1.45]),(1.584,[-.98,-.67,.24,.69,1.21]),(2.124,[-.72,-.16,.50,.96])]):
        for j,x in enumerate(coords):
            key=['celadon','porcelain','blueware','glaze_dark'][(row+j)%4]
            if j%3==1:pot('선반의 다관',x,1.10,base,.80+.06*j,key)
            else:cup('회전 물레로 빚은 잔',x,1.10,base,.060+.006*(j%3),.064+.016*(j%3),key)
    for x in [-1.79,1.79]:
        for j in range(4):
            B('쇼지의 좁은 가로대',x,1.292,.39+.62*j,.20,.045,.02,'oak')
        for j in range(3):
            B('쇼지의 좁은 세로살',x-.09+.09*j,1.291,.042,.017,.05,2.82,'oak')
    B('차실 천장 나무',0,.67,2.91,3.84,1.37,.078,'tea_wood',.008)
    B('차실의 따뜻한 벽등',0,1.22,2.871,3.49,.078,.021,'cove',.004)

def cushion(name,w,l,z,tone):
    verts=[];seg=36
    rings=[(.76,-.056),(.98,-.033),(1,0),(.93,.029),(.71,.042),(.29,.047)]
    for radius,h in rings:
        for i in range(seg):
            c=cos(tau*i/seg);s=sin(tau*i/seg)
            verts.append((w*.5*(1 if c>=0 else -1)*abs(c)**.62*radius,
                          l*.5*(1 if s>=0 else -1)*abs(s)**.66*radius,z+h))
    faces=[(j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i) for j in range(len(rings)-1) for i in range(seg)]
    faces.extend([tuple(reversed(range(seg))),tuple(range((len(rings)-1)*seg,len(rings)*seg))])
    ob=F(name,verts,faces,tone)
    for p in ob.data.polygons:p.use_smooth=True

def armchair():
    for x in [-1,1]:
        for d in [-1,1]:
            R('암체어 · 가늘어지는 목재 다리',[(x*.214,d*.190,.031),(x*.193,d*.174,.219),(x*.176,d*.166,.444)],.026,'ash',10)
            V('다리 아래 작은 글라이드',x*.214,d*.190,.016,[(.019,0),(.021,.015)],'blackwood',12)
    cushion('암체어 · 푹신한 좌방석',.495,.465,.448,'ivory')
    # A shell wraps around three sides, dropping into the two curved arms at its ends.
    ring=[];outer=[];n=38
    for i in range(n+1):
        a=-.11+pi*1.07*i/n
        x=.268*cos(a);d=-.229*sin(a)
        top=.615+.209*max(0,sin(a))**.80
        ring.append((x,d,top));outer.extend([(x*.916,d*.885,.435),(x,d,top-.018),(x*.977,d*.980,top),(x*.878,d*.864,top-.012),(x*.796,d*.795,.477)])
    faces=[]
    for i in range(n):
        for j in range(4):faces.append((5*i+j,5*i+j+1,5*(i+1)+j+1,5*(i+1)+j))
    faces.extend([(0,1,2,3,4),tuple(reversed(range(5*n,5*n+5)))])
    ob=F('암체어 · 팔걸이와 등받이가 이어진 셸',outer,faces,'ivory')
    for p in ob.data.polygons:p.use_smooth=True
    R('등받이 가장자리 파이핑',ring,.004,'ivory_edge',6)
    for x in [-1,1]:
        R('목재 팔걸이 아래 지지대',[(x*.196,-.097,.447),(x*.23,-.042,.585)],.016,'ash',8)

def tea_chair():
    for x in [-.187,.187]:
        for d in [-.174,.174]:
            B('차 의자 각재 다리',x,d,.015,.030,.034,.43,'oak',.004)
        B('가로 결구',x,0,.19,.019,.35,.026,'oak',.002)
        R('등받이 기둥',[(x,-.173,.43),(x,-.222,.779)],.022,'oak',8)
    for d in [-.177,.177]:B('좌판 프레임',0,d,.389,.405,.035,.047,'tea_wood',.006)
    cushion('어두운 짜임 방석',.413,.385,.446,'glaze_dark')
    pts=[(-.227+i*.454/12,-.190-.035*sin(pi*i/12),.747+.022*sin(pi*i/12)) for i in range(13)]
    verts=[(x,d+h,z+t) for x,d,z in pts for h,t in [(-.019,-.034),(.014,-.034),(.014,.033),(-.019,.033)]]
    faces=[(4*i+k,4*(i+1)+k,4*(i+1)+(k+1)%4,4*i+(k+1)%4) for i in range(12) for k in range(4)]
    faces.extend([(0,1,2,3),(51,50,49,48)])
    F('휘어서 만든 차 의자 등판',verts,faces,'tea_wood',.003)
