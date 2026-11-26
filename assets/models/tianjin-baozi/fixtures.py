"""Public timber dining furniture, brass lights, dispenser and the visible dough worktop."""
from mathutils import Matrix,Vector

def timber(name,x,d,z,w,dep,h,colour='oak',edge=.008):
    return B(name,x,d,z,w,dep,h,colour,edge)
def side_steamer(x,d,z,r,n,facing=1):
    saved=set(m.group.objects)
    for j in range(n):
        ring('옆으로 얹힌 찜통 몸통',0,0,j*.052,r,.055,.007,'bamboo',24)
        for dz in [.007,.043]:ring('겹친 둥근 대나무 띠',0,0,j*.052+dz,r+.003,.008,.004,'bamboo2',24)
    for j in range(-6,7):
        xx=j*r*.135;length=2*sqrt(max(0,r*r-xx*xx))
        B('옆에서 보이는 찜판 대나무 살',xx,0,.002,r*.09,length,.005,'rattan',.001)
    pivot=Matrix.Translation((x,-d,z))@Matrix.Rotation(pi/2*facing,4,'X')
    bpy.context.view_layer.update()
    for ob in set(m.group.objects)-saved:ob.matrix_world=pivot@ob.matrix_world
def plates(x,d,z,r=.115,n=4):
    for i in range(n):
        smooth(C('포개 놓은 흰 접시',x,d,z+i*.009,[(r*.58,0),(r*.77,.002),(r*.96,.008),(r,.012),(r*.94,.014),(r*.78,.009)],'porcelain',24))
def cups(x,d,z,tone='porcelain'):
    smooth(C('뒤집은 작은 찻잔',x,d,z,[(.041,0),(.046,.005),(.038,.041),(.029,.055),(.024,.057)],tone,22))
def dispenser(x,d,z):
    B('사각 티슈 케이스',x,d,z,.128,.103,.119,'tissue',.005)
    B('케이스 위 가는 추출구',x,d,z+.118,.078,.012,.002,'ink',.001)
    m.piece('얇게 접힌 흰 티슈',[(x-.037,d,z+.120),(x-.024,d+.008,z+.168),(x+.018,d+.005,z+.161),(x+.031,d,z+.12)],[(0,1,2,3)],'paper')
def joined_chair(x,d,z=0):
    # The photographed dining chair has a curved back rail and dark seat cushion.
    for xx in [-.178,.178]:
        for dd in [-.180,.180]:
            end=.025* (1 if xx>0 else -1);tube('의자의 살짝 벌어진 각재 다리',[(x+xx+end,d+dd*1.15,z+.051),(x+xx,d+dd,z+.466)],.0225,'oakDark',4)
    B('의자 프레임',x,d,z+.438,.427,.436,.042,'oakDark',.013)
    B('짙은 좌방석',x,d,z+.479,.402,.410,.045,'tissue',.021)
    for dd in [-.193,.193]:
        tube('등받이 받침',[(x+.169,d+dd,z+.464),(x+.207,d+dd,z+.650),(x+.25,d+dd,z+.828)],.019,'oakDark',7)
    pts=[(x+.251-.040*(abs(k)/8)**2,d+k*.027,z+.783+.019*(abs(k)/8)**2) for k in range(-8,9)]
    tube('휘어진 등받이 윗선',[(xx,yy,zz+.042) for xx,yy,zz in pts],.028,'oak',9)
    verts=[];faces=[]
    for i,(xx,yy,zz) in enumerate(pts):
        verts.extend([(xx,yy,zz-.046),(xx+.012,yy,zz+.030)])
        if i:faces.append((2*i-2,2*i-1,2*i+1,2*i))
    m.piece('목재 등판',verts,faces,'oak')
    for k in range(11):tube('등판의 가는 목심',[(x+.225,d+(k-5)*.033,z+.613),(x+.239,d+(k-5)*.033,z+.744)],.0057,'stool',5)
communal=part('communal');child(communal,'긴 목제 식탁')
for x in [-.54,.54]:
    for d in [-1.79,1.79]:timber('공용 식탁 굵은 각재 다리',x,d,.050,.096,.098,.833,'oakDark')
for x in [-.548,.548]:timber('식탁 긴 측면 앞치마',x,0,.769,.083,3.73,.125)
for d in [-1.81,1.81]:timber('식탁 머리 앞치마',0,d,.777,1.09,.072,.118,'oakDark')
for k in range(5):
    x=(k-2)*.245;timber('이어 붙인 상판 널',x,0,.878,.243,3.94,.055,'oakLight' if k%3 else 'oak')
    for j in range(3):
        phase=.7*k+.4*j;pts=[(x+(j-1)*.058+.007*sin(p*.70+phase),-1.87+p*.17,.934) for p in range(23)]
        tube('상판에 보이는 가는 나뭇결',pts,.0015,'grain',4)
child(communal,'식탁 위로 솟은 목재 선반과 옆으로 뉜 찜통')
for d in [-1.91,0,1.91]:
    for x in [-.551,.55]:timber('상판을 관통하는 선반 기둥',x,d,.049,.066,.083,2.91,'oak')
    for h in [1.84,2.62,2.91]:timber('선반의 짧은 보',0,d,h,1.16,.081,.067,'oakDark')
for x in [-.552,.55]:
    for h in [1.865,2.624]:timber('개방된 선반 긴 가로대',x,0,h,.060,3.912,.087)
for d in [-1.50,-.89,.76,1.54]:B('상단 소품용 나무 판',0,d,2.651,1.08,.46,.040,'oakLight',.004)
stored=part('stock');child(stored,'눈높이 위로 진열한 찜기와 식탁 끝 식기')
side_steamer(.08,-1.38,2.888,.18,4,1);side_steamer(-.09,1.49,2.861,.165,3,-1)
plates(.37,1.61,.935,.105,5);dispenser(-.39,1.57,.935)
stool=part('stool');child(stool,'둥근 좌판·네 다리·연결대')
smooth(C('원형 목재 좌판',0,0,.574,[(.178,0),(.192,.007),(.193,.027),(.188,.036),(.154,.039)],'stool',40))
for x in [-1,1]:
    for d in [-1,1]:
        tube('사선 목제 스툴 다리',[(x*.174,d*.174,.048),(x*.127,d*.127,.485),(x*.118,d*.118,.575)],.033,'oak',4)
    tube('스툴 가로 발받침',[(x*.152,-.152,.245),(x*.152,.152,.245)],.021,'oakDark',4)
for d in [-.147,.147]:tube('발받침과 측면 연결대',[(-.15,d,.208),(.15,d,.208)],.021,'oak',4)
table=part('walltable');child(table,'각재 식탁과 얇은 목재 상판')
for x in [-.422,.422]:
    for d in [-.473,.473]:timber('식탁 다리',x,d,.05,.059,.061,.668,'oakDark')
for x in [-.422,.422]:timber('식탁 긴 연결대',x,0,.64,.044,.985,.086)
for d in [-.476,.476]:timber('식탁 앞 연결대',0,d,.64,.86,.053,.088)
for j in range(4):timber('전통색 목재 식탁 상판',(j-1.5)*.241,0,.717,.241,1.102,.052,'oakLight' if j%2 else 'oak')
joined_chair(.903,0)
child(table,'벽쪽 접시·찻잔과 티슈')
plates(-.21,.36,.769,.091,3);cups(-.28,.226,.769);cups(-.15,.20,.769);dispenser(-.336,.414,.769)

lamps=part('light');child(lamps,'황동색 원통 펜던트')
for x,d in [(-4.28,2.34),(-4.28,5.02),(-4.28,7.72),(1.78,4.2),(1.78,6.18)]:
    smooth(C('천장 흰 고정판',x,d,3.510,[(.048,0),(.064,.010),(.065,.020)],'cream',20))
    tube('펜던트 현수줄',[(x,d,3.488),(x,d,2.88)],.0053,'steel',7)
    smooth(C('황동등의 상부 소켓',x,d,2.833,[(.031,0),(.028,.057)],'brass',18))
    # Subtle hammered facets catch the warm spot, with a separate rolled rim.
    n=54;levels=[(0,.258),(.018,.261),(.091,.257),(.18,.254),(.30,.247),(.36,.241),(.373,.209)];verts=[]
    for j,(h,r) in enumerate(levels):
        for k in range(n):
            a=tau*k/n;rr=r*(1+.008*sin(k*2.3+j*.63));verts.append((x+rr*cos(a),d+rr*sin(a),2.468+h))
    faces=[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(len(levels)-1) for k in range(n)]
    m.piece('미세하게 굴곡진 황동 원통 갓',verts,faces,'brass')
    ring('황동 갓 하단의 말린 선',x,d,2.463,.261,.014,.009,'gold',40)
    smooth(C('천장 갓 안쪽 따뜻한 확산면',x,d,2.470,[(.25,0),(.247,.006)],'light',36))
for x in [-2.35,.02,4.92]:
    for d in [1.0,4.12,7.75]:
        smooth(C('매입형 다운라이트 띠',x,d,3.514,[(.049,0),(.059,.012)],'cream',22))
        smooth(C('매입형 확산면',x,d,3.511,[(.044,0),(.046,.005)],'light',20))

base=part('refill');child(base,'목재 급수대·마개·수도꼭지')
for x in [-.433,.433]:
    for d in [-.277,.277]:timber('작은 급수대 목재 다리',x,d,.048,.068,.071,.778,'oakDark')
timber('어두운 급수대 탁상',0,0,.806,.998,.684,.064,'oakDark')
for side in [-1,1]:
    timber('급수대 아래 연결대',0,side*.276,.282,.91,.055,.045,'oak')
for x in [-.277,-.094]:
    tube('유리 급수통 다리',[(x,-.07,.872),(x+.028,-.115,.997),(x+.032,-.024,1.050)],.013,'darkmetal',7)
smooth(C('급수통 금속 받침',-.186,-.026,.974,[(.095,0),(.135,.012),(.126,.027)],'chrome',28))
smooth(C('급수통 뚜껑',-.186,-.026,1.388,[(.129,0),(.133,.019),(.109,.038),(.050,.046)],'shiny',32))
smooth(C('뚜껑 손잡이',-.186,-.026,1.433,[(.021,0),(.027,.013),(.019,.031)],'darkmetal',16))
tube('급수 꼭지', [(-.184,-.107,1.083),(-.184,-.199,1.083),(-.184,-.210,1.051)],.012,'chrome',9)
B('누르는 검은 레버',-.184,-.185,1.094,.026,.076,.013,'tissue',.005)
for x in [.065,.159,.255]:
    for d in [-.107,-.003,.101]:
        for k in range(5 if d>.02 else 4):
            smooth(C('겹쳐 쌓은 금속 컵',x,d,.872+k*.032,[(.037,0),(.043,.008),(.044,.019),(.036,.073),(.031,.078)],'darkmetal' if k%3 else 'chrome',18))
dispenser(.389,.168,.871)
jar=part('jar')
smooth(C('빛이 비치는 물병 벽',-.186,-.026,.996,[(.103,0),(.126,.029),(.125,.335),(.118,.374),(.125,.389)],'water',40))
smooth(C('병 안의 물높이',-.186,-.026,1.23,[(.117,0),(.118,.006)],'water',36))

counter=part('pass');child(counter,'손님 눈에 보이는 만두 작업대')
B('조리대 하부 스테인리스장',0,.16,.053,4.10,.881,.798,'steel',.017)
for x in [-1.53,-.51,.51,1.53]:
    B('작업대 앞 금속 패널',x,-.291,.132,.978,.029,.67,'steel',.011)
    B('서랍의 가로 손잡이',x,-.315,.690,.317,.028,.027,'darkmetal',.007)
B('광택이 도는 조리대 상판',0,.16,.848,4.245,1.019,.055,'shiny',.014)
B('작업대 뒤 낮은 금속 턱',0,.650,.891,4.23,.037,.169,'steel',.005)
B('반죽을 빚는 나무 도마',-.572,-.03,.904,1.196,.562,.031,'beech',.014)
tube('짧은 나무 밀대',[(-1.067,-.186,.966),(-.764,-.164,.966)],.023,'beech',14)
for i in range(8):
    x=-.95+(i%4)*.173;d=-.044+(i//4)*.153
    smooth(C('밀어 둔 얇은 만두피',x,d,.939,[(.059,0),(.065,.002),(.059,.004)],'dough',17))
for x,d in [(.30,.06),(.95,.23)]:
    for j in range(4):ring('작업대에 겹친 대나무 찜기',x,d,.904+j*.082,.195,.086,.014,'bamboo2' if j%2 else 'bamboo',32)
    for j in range(-7,8):
        xx=.024*j;span=2*sqrt(max(0,.177**2-xx**2));B('맨 위 찜기의 대나무 살',x+xx,d,1.224,.014,span,.007,'rattan',.001)
B('준비한 만두용 금속 트레이',1.61,-.023,.905,.610,.401,.023,'chrome',.019)
for x in [1.43,1.59,1.75]:
    for d in [-.104,.046]:ell('조리창 안의 흰 반죽 덩이',x,d,.962,.054,.048,.034,'dough',14,7)
child(counter,'공개 작업창 프레임')
for x in [-2.12,2.12]:B('작업창 수직 나무 테두리',x,.452,.048,.085,.117,2.958,'oak')
B('작업창 상부 후드 마감',0,.509,2.55,4.28,.845,.409,'steel',.015)
for j in range(20):B('후드 하단 짧은 환기 슬롯',-.90+j*.096,.11,2.589,.048,.003,.063,'darkmetal',.005)
menu=part('menu');child(menu,'외부 메뉴대와 메뉴별 이름')
B('메뉴대 작은 바닥판',0,.04,.051,.39,.317,.034,'ink',.014)
B('검은 세로대',0,.02,.08,.048,.05,.79,'darkmetal',.006)
B('메뉴판 검은 테두리',0,-.04,.865,.62,.035,.446,'graphite',.012)
B('도판의 흰 바탕',0,-.06,.886,.591,.007,.405,'paper')
front_text('메뉴 판 제목','천진포자',0,-.065,1.232,.054,'ink',True,0)
for i,(name,col) in enumerate([('고기만두','bamboo2'),('지짐만두','toast'),('차오면','noodle'),('훈툰탕','dough')]):
    x=-.165+(i%2)*.326;z=1.151-(i//2)*.118
    # Flat lithographic dish on the native menu board.
    pts=[(x+.063*cos(tau*q/22),z+.023*sin(tau*q/22)) for q in range(22)]
    side_face('메뉴판의 작은 음식 인쇄',pts,-.065,col)
    front_text('실제 메뉴의 이름',name,x,-.069,z-.048,.031,'ink',True,0)

plaque=part('plaque');child(plaque,'가운데 메달과 좌우 목재 투각')
# The dark horizontal fretwork over the cream banquette is visible in the operator's dining room photograph.
for k in [-1,1]:
    B('상단 목제 띠',k*.74,0,.277,1.49,.078,.074,'oakDark',.009)
    B('양끝 목재 기둥',k*1.435,0,.027,.063,.079,.274,'oakDark',.007)
    B('양끝 하단 테',k*.901,0,.028,1.079,.079,.050,'oakDark',.006)
    line=[(k*.27,0,-.107),(k*.35,0,-.09),(k*.467,0,-.009),(k*.544,0,.018),(k*1.40,0,.052)]
    tube('중앙으로 굽은 아래 목재판',line,.029,'oakDark',9)
    for j in range(5):
        xx=k*(.47+j*.178);zz=.157+.018*cos(j*2.3)
        pts=[]
        for i in range(31):
            a=(i/30)*tau*1.18;rad=.094*(1-i*.022);pts.append((xx+k*rad*cos(a),-.043,zz+rad*sin(a)))
        tube('양쪽으로 되말린 목각 덩굴',pts,.015,'oakDark',8)
        tube('양옆 잎새',[(xx-k*.052,-.032,zz-.059),(xx+k*.026,-.038,zz-.019),(xx+k*.074,-.036,zz+.049)],.012,'grain',7)
center=[(.261*cos(tau*j/55),-.010,.092+.184*sin(tau*j/55)) for j in range(56)]
tube('가운데 타원형 둘레',center,.035,'oakDark',10)
for j in range(9):
    a=tau*j/9;pts=[]
    for i in range(16):
        t=i*pi/15;r=.065+.085*sin(t);phi=a+.34*cos(t);pts.append((r*cos(phi),-.042,.089+r*sin(phi)*.71))
    tube('메달 안 새긴 꽃잎',pts,.014,'grain' if j%4==0 else 'oakDark',8)
ell('중앙 목각 꽃심',0,-.043,.09,.042,.023,.033,'oakDark',18,9)

cooler=part('cooler');child(cooler,'흰색 유리문 냉장 진열장')
B('옅은색 후판',0,.287,.054,.678,.063,1.62,'cream',.013)
for side in [-1,1]:
    B('옆판',side*.323,.004,.053,.042,.615,1.619,'cream',.010)
B('냉장고 최상단 덮개',0,.001,1.63,.682,.622,.061,'cream',.012)
B('하단 냉각기 덮개',0,-.001,.049,.679,.625,.253,'white',.012)
for j in range(15):B('하단 냉각기 세로 환기구',(j-7)*.029,-.317,.101,.013,.006,.091,'darkmetal',.002)
for side in [-1,1]:
    B('유리문 은백색 테두리',side*.306,-.306,.293,.043,.051,1.29,'shiny',.005)
    B('가느다란 검은 가스켓',side*.282,-.325,.34,.008,.014,1.205,'darkmetal')
for zz in [.289,1.547]:B('유리문 가로틀',0,-.307,zz,.648,.053,.044,'shiny',.005)
B('위쪽 흰 조명 명판',0,-.309,1.592,.592,.024,.064,'white',.005)
B('유리문 세로 손잡이',.291,-.344,.68,.028,.036,.286,'white',.008)
for zz in [.342,.621,.902,1.180]:
    B('냉장 선반 앞 가장자리',0,-.212,zz,.548,.021,.019,'steel',.003)
    for j in range(15):B('은색 철망 선반',(j-7)*.036,.011,zz+.006,.0045,.461,.0045,'shiny')
drinks=part('drinks');child(drinks,'선반의 캔·투명병과 포장 띠')
for k,code in [('cola','a84d46'),('soda','5c8560'),('lemon','c8ad55'),('label','dce0cd'),('pet','a8bbb3')]:
    m.palette[k]=m.material(k,code,.23 if k in ('cola','soda','lemon') else 0)
for layer,zz in enumerate([.366,.645,.926,1.204]):
    for col in range(5):
        for row in range(2):
            x=(col-2)*.096;d=-.152+row*.11;tone=['cola','lemon','soda','pet'][(layer+col//2)%4]
            if tone=='pet' or layer==0:
                smooth(C('마개 달린 음료 페트병',x,d,zz,[(.033,0),(.039,.009),(.037,.041),(.039,.058),(.037,.112),(.036,.149),(.022,.167),(.015,.179),(.015,.19)],'pet',14))
                smooth(C('병의 종이 띠',x,d,zz+.065,[(.039,0),(.039,.062)],tone if tone!='pet' else 'label',14))
                smooth(C('음료 병뚜껑',x,d,zz+.183,[(.019,0),(.019,.019)],'lemon' if col%2 else 'soda',12))
            else:
                smooth(C('작은 음료 캔',x,d,zz,[(.030,0),(.033,.004),(.037,.013),(.037,.116),(.033,.125),(.031,.130)],tone,16))
                smooth(C('캔 윗면과 테',x,d,zz+.130,[(.032,0),(.035,.003),(.032,.005)],'shiny',16))
                B('라벨의 간단한 인쇄',x,d-.0363,zz+.05,.042,.001,.020,'label')
                ring('캔의 작은 따개',x,d-.008,zz+.136,.007,.0016,.002,'darkmetal',10)
door=part('coolerGlass')
m.piece('냉장고 앞 투명 유리',[(-.282,-.315,.338),(.282,-.315,.338),(.282,-.315,1.544),(-.282,-.315,1.544)],[(0,1,2,3)],'glass')
