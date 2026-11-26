"""Checkerboard, painted public walls, the open front, host console and spreading brass lamps."""
room=part('room');section(room,'대각선으로 깐 짙은 돌과 미색 돌 바닥')
half=spec['bay']['width']/2;depth=spec['bay']['depth'];size=.46*sqrt(2)
def trim(poly,axis,cut,sg):
    out=[]
    for i,q in enumerate(poly):
        p=poly[i-1];a=(p[axis]-cut)*sg;b=(q[axis]-cut)*sg
        if (a>=0)!=(b>=0):
            t=a/(a-b);out.append((p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t))
        if b>=0:out.append(q)
    return out
for row in range(-1,21):
    for col in range(-11,12):
        cx=(col+.5*(row%2))*size;dd=row*size/2;rad=size/2-.002
        poly=[(cx-rad,dd),(cx,dd-rad),(cx+rad,dd),(cx,dd+rad)]
        for ax,edge,sg in [(0,-half,1),(0,half,-1),(1,.025,1),(1,depth,-1)]:poly=trim(poly,ax,edge,sg)
        if len(poly)>2:m.piece('미색 사각 타일' if row%2 else '먹색 사각 타일',[(x,d,.040) for x,d in poly],[tuple(range(len(poly)))],'porcelain' if row%2 else 'tile')
B('바닥의 회색 줄눈',0,depth/2,.014,half*2,depth,.023,'grain')
section(room,'노란 벽의 짙은 나무 몰딩과 액자')
B('노란 회벽',0,depth-.04,.04,half*2,.08,3.45,'yellow');B('벽 아래 짙은 몰딩',0,depth-.11,.07,half*2,.14,.21,'walnut',.009)
B('웜 화이트 천장',0,depth/2,3.414,half*2,depth,.055,'cream')
B('구석의 어두운 녹색 액자 벽',-half+.03,depth/2,.04,.066,depth,3.39,'sage');B('녹색 벽 하부 장식띠',-half+.095,depth/2,1.03,.13,depth,.083,'walnut',.006)
# Panels flank the wall recesses. Framed drawings are original small vases and branches.
for i,x in enumerate([-4.06,-.16,3.75]):
    B('하얀 액자형 몰딩',x,depth-.107,1.10,2.63,.112,1.79,'cream',.015)
    B('깊은 녹색 액자 속 벽',x,depth-.176,1.24,2.38,.035,1.39,'sage',.004)
    for xx in [-1.15,1.15]:B('짙은 목재 세로틀',x+xx,depth-.203,1.23,.067,.06,1.41,'walnut',.006)
    for k in [-.52,.39]:B('안쪽 세로 살',x+k,depth-.199,1.31,.041,.039,1.27,'wood')
    B('내부 가로 살',x,depth-.204,2.39,2.30,.052,.045,'wood');B('돌출한 창턱',x,depth-.17,1.09,2.78,.225,.079,'cream',.011)
for i,x in enumerate([-5.66,-2.12,1.80,5.57]):
    for k,z in enumerate([1.29,2.0]):
        B('고동색 사각 액자',x,depth-.12,z,.435,.052,.49,'wood',.012);B('황동 가는 안쪽 선',x,depth-.150,z+.025,.390,.013,.440,'gold');B('종이 그림',x,depth-.159,z+.043,.353,.012,.41,'paper')
        pts=[(-.072,0),(-.079,.033),(-.032,.085),(-.044,.15),(.032,.151),(.021,.084),(.072,.029),(.063,0)];panel('벽화의 작은 화병',x,depth-.178,z+.083,pts,'sage' if i%2 else 'blue')
        for j in range(3):tube('작은 매화 가지',[(x,depth-.180,z+.216),(x+(j-1)*.041,depth-.181,z+.272),(x+(j-1)*.083,depth-.181,z+.31)],.004,'wood',5)
for x in [-4.8,-2.5,0,2.6,4.9]:
    for d in [1.16,4.92]:
        C('매입등 테두리',x,d,3.404,[(.071,0),(.074,.022)],'gold',16);C('따뜻한 원형 조명',x,d,3.401,[(.052,0),(.053,.006)],'warm',16)
mirror=part('mirrors');section(mirror,'황색 벽 안의 세 은경')
mat=m.material('방 안을 비추는 은경','ddddcf',1);mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.038;m.palette['mirror']=mat
for x in spec['mirrorX']:
    d=5.738;ob=m.piece('몰딩 안의 은경',[(x-1.145,d,1.291),(x+1.145,d,1.291),(x+1.145,d,2.598),(x-1.145,d,2.598)],[(0,1,2,3)],'mirror')
    ob['probe_X']=x
front=part('sign');section(front,'검정 철제 개방형 캐노피와 흰 네온 상호')
for x in [-1.27,1.27]:B('각파이프 전면 기둥',x,.04,.044,.08,.09,3.20,'black')
for d in [.04,.66]:
    for z in [2.80,3.216]:B('연속 캐노피 상하틀',0,d,z,2.62,.066,.062,'black')
    for i in range(7):
        x=-1.24+i*.411;tube('검정 강철 삼각 가새',[(x,d,2.846 if i%2 else 3.227),(x+.410,d,3.227 if i%2 else 2.846)],.021,'black',5)
B('간판 앞판',0,-.035,2.71,1.60,.067,.58,'black',.017)
# Continuous tube lines following the photographed cursive Cha R outline.
strokes=[[(.06,.73),(-.01,.90),(-.18,.93),(-.39,.79),(-.55,.53),(-.64,.25),(-.60,.09),(-.49,.05),(-.30,.16),(-.13,.37)],
 [(-.34,.11),(-.14,.48),(.03,.77),(.13,.85),(.13,.69),(-.04,.47),(-.24,.24),(-.29,.11),(-.15,.33),(-.04,.39),(-.07,.22),(-.06,.17),(.08,.26)],
 [(.32,.37),(.23,.39),(.10,.30),(.035,.17),(.07,.10),(.19,.15),(.29,.32),(.30,.34),(.24,.16),(.29,.13),(.42,.22)],
 [(.47,.64),(.45,.53)],[(.57,.07),(.71,.53),(.87,.89)],[(.59,.68),(.74,.85),(.94,.94),(1.08,.89),(1.08,.73),(.98,.58),(.76,.44),(.71,.43),(.89,.26),(1.02,.06),(1.16,.06)]]
for qi,pts in enumerate(strokes):tube('흰색 튜브 상호 '+str(qi),[((.24-x)*.64,-.085,2.756+z*.47) for x,z in pts],.012,'white',10)
host=part('host');section(host,'오크 패널 접객대와 메뉴 클립보드')
B('오크 접객대',0,0,.052,1.32,.48,.94,'oak',.014);B('모서리 있는 석재 상판',0,-.004,.987,1.41,.546,.055,'ledge',.012)
for x in [-.44,0,.44]:
    B('오크 테두리',x,-.249,.147,.355,.030,.66,'lightwood',.006);B('오크 사각 패널',x,-.27,.175,.308,.016,.594,'wood',.006)
B('메뉴 스탠드 바닥',.20,-.05,1.044,.348,.173,.014,'black',.005);B('메뉴판 짙은 테두리',.20,-.053,1.057,.32,.019,.44,'walnut',.007)
B('크림색 메뉴 종이',.20,-.067,1.073,.292,.011,.407,'paper');B('상단의 검은 집게',.20,-.08,1.448,.085,.012,.040,'black',.004)
for i in range(9):B('메뉴 행',.18,-.077,1.11+i*.033,.203-(i%3)*.018,.004,.007,'earth')
B('상담대 옆 살창 기둥',.83,.37,.04,.38,.30,2.79,'walnut');B('작은 반투명 요철 유리판',.83,.20,1.47,.32,.022,.79,'glass',.005)
panel('유리에 붙인 붉은 마름모',.83,.18,1.88,[(-.133,0),(0,.177),(.133,0),(0,-.177)],'red');text('종이의 금빛 길상문','福',.83,.165,1.879,.14,'gold',font=font)
light=part('lamp');section(light,'옆으로 벌어진 황동 가지와 둥근 조명')
C('천장 원형 캡',0,0,3.372,[(.078,0),(.081,.043)],'gold',20);tube('황동 매달기',[(0,0,3.39),(0,0,2.98)],.012,'brass',8)
sphere('방사형 연결구',0,0,2.986,.064,.064,.047,'brass',14,6)
for j in range(7):
    a=tau*j/7+.23;rr=.35 if j%2 else .44;hh=2.83 if j%2 else 3.03
    tube('황동 가지',[(0,0,2.976),(.12*cos(a),.12*sin(a),2.947),(rr*cos(a),rr*sin(a),hh)],.011,'brass',8)
    C('금속 전구 소켓',rr*cos(a),rr*sin(a),hh-.018,[(.024,0),(.027,.046)],'gold',13);sphere('우윳빛 둥근 전구',rr*cos(a),rr*sin(a),hh+.082,.058,.058,.075,'warm',16,8)
# The operator's signature green wall has two narrow vase panels flanking a gilded floral relief.
art=part('art');section(art,'운영사 공개 좌석 사진의 금빛 화조 장식과 두 화병 액자')
def frame(n,d,z,w,h):
    B(n+' 짙은 나무 가장자리',0,d,z,.057,w,h,'walnut',.010)
    B(n+' 고동색 금테',.034,d,z+.022,.016,w-.037,h-.044,'brass',.004)
    B(n+' 어두운 안쪽 판',.045,d,z+.044,.016,w-.077,h-.086,'earth',.005)
frame('중앙의 세로 부조',0,1.30,.82,1.38);frame('아랫부분의 작은 부조',0,.99,.82,.278)
for side in [-1,1]:
    dd=side*.88;frame('가느다란 화병 그림',dd,1.17,.337,1.19)
    pts=[(-.043,0),(-.052,.039),(-.055,.121),(-.071,.178),(-.082,.247),(-.060,.294),(-.034,.327),(-.025,.393),(-.045,.405),(-.045,.421),(.045,.421),(.045,.405),(.025,.393),(.034,.327),(.066,.293),(.084,.246),(.070,.173),(.052,.121),(.047,.039),(.040,0)]
    panel('입구가 좁고 배가 부른 금동 화병',.064,dd,1.43,pts,'gold',face='side',dep=.013)
    for j in range(5):B('화병의 밝은 띠',.081,dd,1.59+j*.026,.004,.104+.010*(j%3),.006,'cream')
    for sg in [-1,1]:tube('화병 다리',[(.076,dd+sg*.018,1.437),(.077,dd+sg*.054,1.37),(.076,dd+sg*.077,1.357)],.008,'gold',7)
    for j in range(3):
        sg=(-1 if j%2==0 else 1);tube('화병 속 가는 꽃 가지',[(.077,dd,1.846),(.080,dd+sg*.057,1.96+.09*j),(.080,dd+sg*.102,2.08+.04*j)],.0044,'lightwood',6)
        sphere('화병 가지 끝 황토빛 꽃',.081,dd+sg*.101,2.08+.04*j,.008,.019,.016,'cream',9,5)
rand=Random(746)
# An original raised botanical motif follows the photograph's branching cream-and-gold silhouette.
tube('금빛 매화 줄기',[(.076,-.22,1.49),(.076,-.085,1.63),(.078,.045,1.75),(.08,.009,1.86),(.079,.119,2.03),(.08,.076,2.21),(.081,.179,2.41)],.014,'gold',9)
for i in range(22):
    yy=1.59+i*.038;dd=.018+.11*sin(i*.36);sg=1 if i%2 else -1;end=dd+sg*(.07+rand.random()*.15)
    zz=yy+.055+rand.random()*.098;tube('부조의 뻗은 가지',[(.079,dd,yy),(.081,(dd+end)*.5,yy+.041),(.081,end,zz)],.0058,'lightwood',6)
    for j in range(4):
        at=end+(j-1.4)*.018;h=zz+.021*sin(j+i)
        for petal in range(5):
            a=tau*petal/5;sphere('상아빛 매화 꽃잎',.086,at+.010*cos(a),h+.010*sin(a),.004,.009,.009,'cream' if (j+i)%4 else 'gold',8,4)
        sphere('꽃술',.092,at,h,.003,.004,.004,'gold',7,4)
for i in range(3):
    x=(i-1)*.19;tube('아래 부조의 가지',[(.075,x-.087,1.081),(.077,x-.018,1.135),(.078,x+.081,1.19)],.006,'gold',6)
    for j in [-1,0,1]:sphere('작은 잎새',.082,x+j*.048,1.136+j*.021,.005,.021,.008,'cream',8,5)
