"""Public corner glazing, customer self-service and the visible espresso counter."""
W,D=4.44,6.20
room=part('room');section(room,'회색 바닥과 따뜻한 크림색 코너')
B('게임 바닥 위 타일 줄눈',0,D/2,.010,W,D,.020,'grout')
for row in range(10):
    for i in range(7):B('큰 회색 바닥 타일',(i-3)*.63,(row+.5)*.616,.031,.628,.614,.010,('floor','tileAlt','floor','floor')[(i+row)%4])
# Zone 1 shows G-012 extending north behind G-011. Only the photographed dining room is fitted.
# The permit gives total area. The unphotographed rear contains only the envelope.
rear=layout['rear'];depth=rear['depth'];north=rear['north'];turn=rear['turn'];left=-W/2
for label,x0,x1,d0,d1 in [('점포 뒤 ㄴ자 반환부',north,left,turn,depth),('카운터 뒤 등록 구획',left,-left,D,depth)]:
    B(label+' 바닥',(x0+x1)/2,(d0+d1)/2,.018,x1-x0,d1-d0,.022,'floor')
    B(label+' 천장',(x0+x1)/2,(d0+d1)/2,2.809,x1-x0,d1-d0,.076,'cream')
B('등록 면적에 맞춘 일자 후면',(north-left)/2,depth-.035,.04,-left-north,.07,2.77,'wall')
B('옆 점포와 맞대는 측면',(left+north)/2,turn+.032,.04,left-north,.064,2.77,'wall')
B('반환부의 북측 경계',north+.032,(turn+depth)/2,.04,.064,depth-turn,2.77,'wall')
B('창 끝에서 이어지는 외벽',-left-.032,(D+depth)/2,.04,.064,depth-D,2.77,'wall')
B('뒷벽',0,D-.035,.04,W,.07,2.77,'wall')
B('창 반대쪽 벽',-2.186,D/2,.038,.072,D,2.78,'white')
B('따뜻한 벽면 하부 오크',-2.137,2.59,.05,.041,5.07,.941,'wood')
B('몰딩 위 벽면 조명',-2.098,2.59,.994,.044,5.10,.031,'warm')
B('측창의 베이지색 하부',2.178,3.10,.04,.085,D,.812,'stone')
B('화분을 놓는 원목 창턱',2.053,3.04,.85,.315,5.94,.061,'oak',.007)
B('측면 흰 알루미늄 창 머리',2.17,3.10,2.603,.10,6.20,.15,'white')
for d in [.07,1.52,3.,4.49,6.10]:B('측창 세로 개폐 프레임',2.174,d,.861,.078,.045,1.745,'white')
for d in [1.40,2.88,4.37]:B('겹창 안쪽 가는 세로 틀',2.155,d,1.322,.036,.015,1.274,'edge')
B('창 앞 석재 코너',2.017,.13,.04,.37,.32,2.758,'stone')
for h in [.68,1.38,2.10]:B('모서리 석재 줄눈',2.013,-.026,h,.365,.006,.008,'wood')
B('돌기둥의 화장실 방향 작은 판',2.017,-.043,1.12,.306,.019,.236,'white')
text('코너 기둥 화장실 화살표','←',2.02,-.056,1.275,.109,'dark',font)
text('코너 기둥 화장실 안내','화 장 실',2.02,-.056,1.173,.052,'dark',font)
B('반대쪽 작은 기둥',-2.130,.03,.040,.17,.14,2.73,'stone')
B('현관 위의 간접광 받침',0,.017,2.68,W,.29,.131,'cream')
B('따뜻한 전면 상부 광원',0,-.116,2.676,4.15,.026,.033,'warm')
B('홀 천장',0,3.12,2.809,W,.995*D,.076,'cream')
for d in [.81,2.57,4.47,5.75]:
    for x in [-1.07,1.04]:
        smooth(C('원형 다운라이트 테두리',x,d,2.790,[(.098,0),(.101,.014)],'edge',24))
        smooth(C('원형 다운라이트 유백 확산판',x,d,2.787,[(.081,0),(.082,.005)],'white',24))
B('공조기 흰 정사각형 카세트',-.56,3.46,2.785,.58,.58,.025,'edge',.012)
for i in range(8):B('공조기 안쪽 흡기 슬릿',-.56,3.26+i*.055,2.779,.45,.010,.008,'steel')
B('들어오는 쪽 남색 매트',-.04,.22,.042,1.08,.57,.009,'navy',.007)
# Door is held open against the negative-X jamb, as seen from outside in the guide photograph.
B('문턱 스테인리스 띠',0,-.009,.044,3.70,.035,.010,'chrome')
for d in [-.65,-.01]:B('열린 문의 아래 가는 테두리',-1.97,d,.080,.026,.027,2.22,'chrome')
tube('유리 손잡이', [(-1.971,-.53,.88),(-1.92,-.53,.88),(-1.92,-.53,1.23),(-1.971,-.53,1.23)],.014,'chrome')
B('입구 고정창 하부 가이드',1.486,.012,.054,.715,.041,.034,'steel')
gl=part('glass')
for a,b in zip([.15,1.54,3.02,4.51],[1.50,2.98,4.47,6.07]):
    m.piece('화장실 안내 통로를 향한 맑은 측창',[(2.162,a,.906),(2.162,b,.906),(2.162,b,2.601),(2.162,a,2.601)],[(0,1,2,3)],'glass')
m.piece('입구 외곽 고정 유리',[(1.13,.01,.082),(1.836,.01,.082),(1.836,.01,2.653),(1.13,.01,2.653)],[(0,1,2,3)],'glass')
m.piece('벽 쪽으로 열어 둔 출입문',[(-1.969,-.65,.085),(-1.969,-.015,.085),(-1.969,-.015,2.31),(-1.969,-.65,2.31)],[(0,1,2,3)],'glass')

rings=json.loads((here/'wordmark.json').read_text())
def mark(label,x,d,h,w,height,color,turn=pi,extrude=.007):
    cu=bpy.data.curves.new(label,'CURVE');cu.dimensions='2D';cu.fill_mode='BOTH';cu.extrude=extrude
    for pts in rings:
        spline=cu.splines.new('POLY');spline.points.add(len(pts)-1);spline.use_cyclic_u=True
        for p,(a,b) in zip(spline.points,pts):p.co=((a-382)*w/764,(36-b)*height/72,0,1)
    o=bpy.data.objects.new(label,cu);m.group.objects.link(o);cu.materials.append(m.palette[color])
    o.location=(x,-d,h);o.rotation_euler=(pi/2,0,turn);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');o.select_set(False)
front=part('front')
mark('푸른 채널 상호의 뒷판',0,.052,2.353,3.34,.331,'navy',extrude=.032)
mark('입구 정면의 파란 YOGURT WORLD',0,-.011,2.353,3.34,.331,'blue',extrude=.011)
B('검은 돌출 표지 몸체',1.965,-.225,2.057,.069,.415,.361,'black',.011)
text('돌출 안내 상판','YOGURT',2.005,-.225,2.285,.082,'white',face='left')
text('돌출 안내 하판','WORLD',2.005,-.225,2.165,.082,'white',face='left')
text('돌출 안내 안쪽 상판','YOGURT',1.926,-.225,2.285,.082,'white',face='right')
text('돌출 안내 안쪽 하판','WORLD',1.926,-.225,2.165,.082,'white',face='right')
B('호수판',2.015,-.035,2.365,.218,.016,.207,'blue',.010);text('입구의 호수','G012',2.015,-.049,2.463,.066,'white')
# The two thin upright fixtures flank the public doorway.
ki=part('kiosk')
B('바닥 고정 발판',0,0,.053,.48,.40,.042,'steel',.016)
B('흰 키오스크 하단',0,.016,.093,.329,.178,.591,'white',.028)
B('흰 터치패널 외함',0,.018,.645,.401,.173,.946,'porcelain',.022)
B('검은 터치패널 프레임',0,-.075,.790,.340,.021,.718,'black',.015)
B('결제 카드 투입 턱',0,-.089,.694,.138,.060,.052,'steel',.004)
B('카드 투입구',0,-.121,.713,.107,.005,.007,'dark')
B('영수증 배출구',0,-.079,.560,.177,.018,.022,'black',.003)
dx=-3.19
B('전면 세로 입간판 발판',dx,.09,.051,.464,.42,.049,'dark',.014)
T=tube
T('배너를 세운 기둥',[(dx,.19,.089),(dx,.19,1.68)],.016,'steel')
B('세워 둔 푸른 메뉴 안내',dx,.108,.142,.473,.026,1.581,'sky',.006)
for z in [.148,.553,.915,1.269,1.646]:B('입간판의 흰 설명 바',dx,.089,z,.464,.006,.040,'white')
panel=part('display')
B('보이는 주문 화면',0,-.089,.822,.310,.007,.655,'palePink')
text('키오스크 요거트월드','요거트월드',0,-.095,1.391,.036,'navy',font)
text('키오스크 계절 아이스크림','딸기 요거트',0,-.095,1.315,.036,'brown',font)
B('하단 주문 선택 영역',0,-.095,.854,.249,.006,.045,'white',.004)
for j in range(2):
    cx=(j-.5)*.104
    ball('화면에 그린 작은 흰 그릇',cx,-.100,1.105+j*.040,.052,.009,.029,'white',18,6)
    ball('화면의 작은 아이스크림',cx,-.105,1.129+j*.040,.049,.005,.030,'yogurt',14,6)
    for i in range(4):ball('화면의 딸기 토핑',cx-.028+i*.013,-.115,1.142+j*.039+.008*sin(i*1.5),.011,.002,.012,'red',9,5)
text('입간판 제목','한 손에 쏙!',dx,.087,1.557,.073,'navy',font)
text('입간판 요거트 명칭','YOGURT WORLD',dx,.085,1.426,.040,'navy')
for j,z in enumerate([.363,.715,1.071]):
    ball('입간판에 그린 컵',dx,.089,z,.067,.011,.051,'white',14,7)
    for i in range(4):ball('입간판 과일과 그릭 한 스푼',dx-.034+i*.019,.077,z+.036+.012*cos(i),.019,.006,.020,('berry','mango','pink')[j],12,5)
wall=part('wall')
B('벽면 간판 남색 판',0,0,0,.032,1.32,.46,'navy',.007)
mark('벽면의 흰 YOGURT WORLD',.021,0,.275,1.126,.121,'white',pi/2,.0015)
text('벽면의 작은 슬로건','REFRESH YOUR WORLD',.022,0,.134,.073,'cyan',face='left')
for side in [-1,1]:
    d=side*1.06;B('월드 시리즈 액자',0,d,-.055,.035,.549,.66,'wood',.006)
    B('액자 배경지',.020,d,-.032,.005,.513,.608,'paper');text('액자 머리글','WORLD SERIES',.023,d,.513,.048,'navy',face='left')
    for j in range(5):
        off=(j%2-.5)*.210;z=.375-(j//2)*.145
        ball('액자의 작은 메뉴 그릇',.027,d+off,z,.003,.069,.043,'white',12,5)
        for i in range(4):ball('과일과 소스',.032,d+off+(i-1.5)*.024,z+.012,.0015,.018,.013,('mango','berry','pink','honey','leaf')[j],8,4)
