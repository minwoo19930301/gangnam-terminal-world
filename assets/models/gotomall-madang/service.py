"""Stainless cooking hatch, large rice cooker, kitchen pass and utensils left on the tables."""
front=part('front');section(front,'입구의 조명판과 점포 번호')
B('입구의 긴 흰 안내판',0,-.028,2.393,5.19,.065,.329,'white',.012)
text('확인된 중국어 매장 문구','受欢迎的餐厅',.59,-.067,2.548,.222,'ink',font=font)
text('국문 점포 이름','마당',-1.31,-.067,2.551,.224,'ink',font=font)
B('호수 표지',2.59,-.01,2.26,.218,.032,.17,'blue',.005);text('G010 표기','G-010',2.59,-.03,2.343,.061,'white')
mnu=part('menu');section(mnu,'양쪽 벽의 음식 메뉴와 식탁 번호')
# The directory photo has panels with nine or six dish photographs. These are original coloured bowl diagrams.
def printedOval(n,x,d,z,rd,rz,col,segments):
    pts=[(x,d+rd*cos(tau*i/segments),z+rz*sin(tau*i/segments)) for i in range(segments)]
    m.piece(n,pts,[tuple(range(segments))],col)
def wallMenus(s,ds,width,height,base,cols,rows,seed):
    side='left' if s>0 else 'right';x=s*2.66;rand=Random(seed)
    B('코팅된 흰 메뉴 포스터',x,ds,base,.021,width,height,'white',.005)
    for row in range(rows):
        for col in range(cols):
            d=ds+width*((col+.5)/cols-.5);z=base+height*(1-(row+.49)/rows);r=.31*min(width/cols,height/rows)
            printedOval('국그릇을 그린 검은 테두리',x-s*.014,d,z,r,r*.68,'inside',22)
            printedOval('음식 도해 가운데',x-s*.018,d,z+.006,r*.84,r*.51,('rice','batter','miso','green','carrot')[(col+2*row)%5],18)
            for j in range(8):
                a=tau*rand.random();rr=r*rand.uniform(.16,.68)
                printedOval('도해의 계란과 나물',x-s*.022,d+rr*cos(a),z+.004+rr*.60*sin(a),.13*r,.08*r,('cream','green','carrot','pepper','white')[j%5],8)
            # The small lines intentionally carry no guessed meal name or price.
            B('메뉴 사진 밑의 짧은 인쇄선',x-s*.018,d,z-r*.81,.002,r*.98,.007,'inside')
for side,ds,w,h,z,cols,rows in [(1,.99,.70,.73,1.22,3,3),(1,1.75,.68,.72,1.22,3,3),(1,1.03,.58,.51,1.99,1,1),(1,1.74,.59,.50,1.99,1,1),(-1,1.12,.83,1.00,1.13,3,3),(-1,2.10,.76,.97,1.15,2,3),(-1,2.89,.62,.75,1.25,2,2)]:wallMenus(side,ds,w,h,z,cols,rows,int(ds*103))
for idx,num in [(0,'5'),(4,'10')]:
    x,d=tables[idx]
    text('사진에서 읽힌 식탁 번호',num,x-.477,d-.200,1.039,.047,'ink',font=font)
k=part('kitchen');section(k,'금속 후드와 공개 조리창')
# Appliances visible from the dining room, with the low shelf across the kitchen hatch.
B('조리창의 검은 안쪽',0,.424,.93,4.74,.035,1.25,'inside')
for x in [-2.26,2.26]:B('조리창 양옆의 금속 마감',x,.27,.71,.28,.42,1.58,'steel')
B('가로로 긴 스테인리스 후드',0,.23,2.09,4.74,.49,.37,'steel',.025)
B('후드 하단의 꺾인 모서리',0,-.014,2.075,4.74,.046,.061,'bright',.008)
for x in [-1.54,-.72,.11,.89,1.67]:B('후드의 판금 이음',x,-.020,2.115,.007,.006,.303,'darksteel')
B('조리창 아래 작업대',.04,.08,.754,4.47,.59,.061,'steel',.012)
B('앞면의 접은 턱',.04,-.213,.734,4.47,.037,.054,'bright')
for x in [-1.98,-.74,.71,1.97]:
    for d in [-.157,.318]:B('작업대 금속 기둥',x,d,.05,.039,.039,.69,'steel',.004)
for x in [-1.33,.0,1.34]:B('아래 수납칸 측면',x,.18,.17,1.16,.40,.45,'darksteel',.018)
B('조리창 중간 금속 선반',.04,.11,1.31,3.69,.411,.038,'bright',.007)
for x in [-1.71,-.52,.63,1.80]:B('접시 선반 지지대',x,.27,.82,.026,.026,.494,'steel')
for j in range(6):
    x=-1.40+j*.54
    for i in range(3+(j%3)):
        C('조리창의 흰 접시',x,.06,1.359+i*.015,[(.074,0),(.105,.014),(.111,.022),(.105,.025),(.081,.011)],'porcelain',18)
for j in range(8):
    x=-1.78+j*.29;d=.07+.072*(j%2);z=.817
    C('조미용기',x,d,z,[(.034,0),(.038,.005),(.038,.113),(.023,.14),(.020,.164)],('cream','miso','wall','green')[j%4],13)
    C('작은 양념통 뚜껑',x,d,z+.159,[(.024,0),(.023,.021)],'pepper' if j%3 else 'white',12)
# Metal box and a little wall fan in the operator photograph, over the right end.
B('오른쪽의 금속 보관함',-2.37,.13,1.11,.52,.48,.77,'steel',.018)
B('금속 보관함 문',-2.37,-.124,1.13,.483,.018,.72,'bright',.009)
tube('문 손잡이',[(-2.22,-.136,1.42),(-2.22,-.175,1.44),(-2.22,-.175,1.58),(-2.22,-.138,1.60)],.009,'darksteel')
def fan(x,d,z):
    for radius in [.06,.108,.149,.185]:
        points=[(x+radius*cos(tau*i/28),d,z+radius*sin(tau*i/28)) for i in range(29)];tube('작은 순환팬의 둥근 철망',points,.0033,'white',5)
    for k in range(12):
        a=tau*k/12;tube('선풍기 방사형 살',[(x,d-.004,z),(x+.185*cos(a),d,z+.185*sin(a))],.0025,'steel',4)
    for k in range(3):
        a=tau*k/3;points=[(.023,0),(.103,-.029),(.148,.014),(.112,.061),(.058,.052)]
        panel('반투명 회전 날개',x,d+.009,z,[(u*cos(a)-v*sin(a),u*sin(a)+v*cos(a)) for u,v in points],'stone')
    sphere('흰색 중심캡',x,d-.015,z,.039,.020,.039,'white',14,7)
fan(-1.90,-.097,2.062)
co=part('cooker');section(co,'전기 밥솥과 하부 수납')
B('밥솥 받침 상판',0,0,.66,.70,.52,.043,'oak',.010)
for x in [-.29,.29]:
    for d in [-.188,.188]:B('받침대 다리',x,d,.04,.046,.046,.632,'wood')
B('받침대 아래 선반',0,.015,.21,.61,.43,.026,'wood')
for i in range(4):B('받침대 아래 포장 상자',(i%2-.5)*.20,.007+(i//2-.5)*.18,.24,.18,.17,.222,('white','blue','cream','red')[i],.006)
smooth(C('업소용 밥솥 몸통',0,0,.704,[(.17,0),(.209,.019),(.221,.069),(.214,.266),(.197,.295),(.174,.299)],'steel',36))
smooth(C('검은색 밥솥 바닥과 띠',0,0,.704,[(.168,0),(.202,.009),(.211,.034),(.204,.046)],'black',34))
smooth(C('둥근 검정 밥솥 뚜껑',0,0,.991,[(.196,0),(.216,.010),(.219,.022),(.201,.051),(.157,.073),(.055,.080)],'black',38))
tube('뚜껑의 큰 검은 손잡이',[(-.094,.008,1.045),(-.070,.004,1.116),(-.045,.004,1.124),(.048,.004,1.124),(.078,.004,1.111),(.095,.008,1.048)],.016,'black',8)
B('밥솥의 흰 제어판',0,-.214,.771,.157,.016,.139,'white',.014)
B('검은 표시창',0,-.224,.833,.093,.002,.042,'screen',.005)
for i in range(3):sphere('취사 버튼',(i-1)*.041,-.226,.801,.011,.002,.009,'red' if i==1 else 'darksteel',10,5)
t=part('trolley');section(t,'바퀴 달린 수레와 두 번째 선반')
for x in [-.449,.449]:
    for d in [-.274,.274]:
        sphere('고무 바퀴',x,d,.089,.048,.018,.049,'black',13,7)
        B('포크와 캐스터',x,d,.102,.026,.048,.073,'steel',.004);tube('수레 기둥',[(x,d,.147),(x,d,.826)],.016,'steel')
for z in [.254,.785]:
    B('스테인리스 배식 선반',0,0,z,.954,.62,.032,'steel',.016)
    for x in [-.46,.46]:B('옆으로 일어난 턱',x,0,z+.028,.014,.60,.032,'bright',.004)
    for d in [-.295,.295]:B('앞뒤의 짧은 턱',0,d,z+.028,.91,.013,.029,'bright')
for j in range(5):
    C('수레 아래쪽에 쌓인 금속 쟁반',.15,.02,.286+j*.015,[(.111,0),(.159,.013),(.167,.021),(.161,.024),(.124,.013)],'darksteel',24)
C('수레에 둔 흰 병',-.31,.13,.285,[(.039,0),(.048,.009),(.047,.134),(.020,.154),(.016,.18)],'white',16)
