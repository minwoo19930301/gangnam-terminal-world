"""Hama Film display panel, mirror, curtain and public photo machine from shop/visitor views."""
q=part('photoRoom');sub(q,'석재 입구·천장·회색 부스 커튼')
B('타일 아래 이음',0,1.49,.009,3.99,2.98,.014,'line')
for row in range(5):
    for i in range(6):B('실내 연회색 타일',(i-2.5)*.657,(row+.5)*.596,.024,.653,.592,.012,'ivory' if (row+i)%5 else 'tile2')
for side in [-1,1]:
    B('양옆 점포 경계',side*1.967,1.49,.039,.060,2.97,2.72,'ivory')
    B('문설주',side*1.929,0,.04,.086,.098,2.681,'chrome')
B('안쪽 거울 벽',0,2.951,.039,3.98,.058,2.72,'wall')
B('회색 천장',0,1.50,2.74,4.00,3.00,.072,'ivory')
for x in [-1.43,-.36,.69,1.47]:
    for d in [.34,1.38,2.42]:C('작은 흰색 매입등',x,d,2.731,[(.059,0),(.059,.009)],'white',14)
B('큰 캐릭터 판을 붙인 낮은 벽',.97,.04,.04,1.935,.083,2.19,'tile2',.005)
B('열린 입구 위 헤더',0,.026,2.18,3.86,.068,.533,'white')
B('입구 발매트',-.91,-.045,.045,.97,.46,.014,'slate',.008)
B('점포 입구 문턱',-.94,0,.041,1.84,.076,.008,'chrome')
B('왼쪽 촬영칸 앞 벽',1.31,1.04,.04,1.27,.056,2.56,'wall')
B('촬영칸 벽 윗부분',.405,1.04,2.18,.59,.052,.42,'ivory')
# Visitor photos show two folds drawn alongside the open doorway; retain a walk-through aperture in game.
for x,w in [(1.02,.20),(.13,.16)]:
    vs=[];fs=[];n=27
    for j in range(9):
        f=j/8;zz=.082+2.09*f
        for i in range(n):
            t=i/(n-1);xx=x+w*(t-.50)*(1.12-.12*f);dd=1.031+.043*sin(t*8*pi+.1*(1-f))+.011*sin(t*17*pi);vs.append((xx,dd,zz+.017*sin(t*8*pi)*(1-f)))
        if j:
            for i in range(n-1):
                k=(j-1)*n+i;fs.append((k,k+1,k+n+1,k+n))
    smooth(m.piece('옆으로 걷은 회색 커튼 주름',vs,fs,'grey'))
tube('크롬 커튼 봉',[(.01,1.022,2.22),(1.16,1.022,2.22)],.014,'chrome')
# Right-hand accessory shelves seen from the hall.
for z in [.27,.67,1.09,1.52,1.96]:B('오픈 흰 소품선반',-1.76,1.20,z,.36,1.37,.029,'white')
for d in [.55,1.19,1.86]:B('오픈 선반 칸막이',-1.77,d,.06,.34,.027,2.23,'white')
for j in range(6):
    d=.73+.372*(j%3);h=.704+.84*(j//3)
    ellipse('진열한 베레모와 모자',-1.72,d,h+.069,.149,.140,.085,('rose','navy','cream','gold','mint','lilac')[j],16,8)
    ellipse('모자 챙',-1.63,d,h+.032,.134,.140,.021,('petal','denim','cream','gold','mint','lilac')[j],16,7)
for j in range(4):
    d=.76+.30*j;rodloop('촬영용 컬러 머리띠',[(-1.68,d+.057*cos(a),1.153+.066*sin(a)) for a in [i*pi/11 for i in range(12)]],.012,('pink','teal','yellow','cyan')[j])
# Nearly upright branded board and the low planter outside the entrance.
B('입간판 발판',-1.80,-.260,.043,.44,.38,.033,'charcoal',.011)
for x in [-1.994,-1.61]:B('입간판 세로 틀',x,-.249,.075,.022,.026,1.69,'charcoal')
B('입간판 앞면',-1.80,-.253,.185,.385,.029,1.55,'white',.006)
B('하늘색 행사 칸',-1.80,-.269,.64,.36,.003,.64,'teal')
text('입구 행사 문구','1+1',-1.80,-.276,1.03,.133,'white')
text('입간판 셀프사진','셀프 사진관',-1.80,-.275,1.41,.055,'ink',font)
C('입구 화분',-1.48,-.03,.055,[(.11,0),(.123,.012),(.154,.32),(.156,.357),(.145,.363)],'ivory',23)
for i in range(23):
    f=(i%7)/7;a=i*2.39;zz=.46+.18*f;rx=.064+.085*(1-f)
    end=(-1.48+rx*cos(a),-.03+rx*sin(a),zz)
    tube('화분의 작은 줄기',[(-1.48,-.03,.40),end],.004,'leaf',5)
    leaf=[end,(end[0]+.035*cos(a)-.018*sin(a),end[1]+.035*sin(a)+.018*cos(a),zz+.026),(end[0]+.085*cos(a),end[1]+.085*sin(a),zz+.018),(end[0]+.036*cos(a)+.018*sin(a),end[1]+.036*sin(a)-.018*cos(a),zz+.027)]
    m.piece('광택 있는 타원 잎',leaf,[(0,1,2),(0,2,3)],'leaf' if i%2 else 'mint')
s=part('photoSign');sub(s,'청록 사선 헤더와 그림 조명 상자')
B('하마필름 상단 판',.96,-.020,2.18,1.91,.054,.535,'white',.006)
# Clip diagonal stripes exactly to fascia; no protruding triangle at the boundary.
def clip(poly,axis,value,greater):
    out=[];last=poly[-1]
    for pt in poly:
        a=(last[axis]>=value) if greater else (last[axis]<=value);b=(pt[axis]>=value) if greater else (pt[axis]<=value)
        if a!=b:
            t=(value-last[axis])/(pt[axis]-last[axis]);out.append((last[0]+t*(pt[0]-last[0]),last[1]+t*(pt[1]-last[1])))
        if b:out.append(pt)
        last=pt
    return out
for j in range(-6,7):
    o=j*.20;pts=[(o-.10,0),(o,.0),(o-.42,.533),(o-.52,.533)]
    pts=clip(pts,0,-.95,True) if pts else []
    pts=clip(pts,0,.95,False) if pts else []
    if len(pts)>2:front_poly('간판의 비스듬한 청록 띠',.96,-.050,2.18,pts,'sea',.0005)
def oval(label,x,d,z,rx,rz,c):
    return front_poly(label,x,d,z,[(rx*cos(tau*j/40),rz*sin(tau*j/40)) for j in range(40)],c,.001)
oval('상단 흰 타원',.96,-.053,2.448,.622,.179,'paper')
text('HAMA FILM 상호','H A M A   F I L M',.96,-.058,2.445,.117,'ink')
B('흰 조명 상자 옆면',.98,-.043,.22,1.16,.084,1.78,'chrome',.017)
B('아주 연분홍 조명 면',.98,-.088,.236,1.13,.008,1.75,'glossPink',.015)
# Broad blended pink-white backlight across the original hand-drawn sign.
vs=[];fs=[];colors=[]
for j in range(11):
    for i in range(9):
        u=i/8;v=j/10;vs.append((.98+(u-.5)*1.122,-.094,.241+1.738*v))
        f=min(1,((u-.5)*1.6)**2+((v-.52)*1.5)**2)
        a=m.palette['glossWhite'].diffuse_color;b=m.palette['glossPink'].diffuse_color
        colors.append(tuple(a[k]*(1-f)+b[k]*f for k in range(3)))
        if i and j:
            n=j*9+i;fs.append((n-10,n-9,n,n-1))
panel=m.piece('부드러운 분홍빛 라이트 패널',vs,fs,'glossWhite')
att=panel.data.color_attributes.new(name='점포 표면색',type='BYTE_COLOR',domain='POINT')
for row,col in zip(att.data,colors):row.color=(*col,1)
# Hand-traced curves from the character drawn on the public shop lightbox.
def mascot(x,d,z,w):
    def px(u,v):return ((.5-u/516)*w,(.5-v/369)*w*369/516)
    def path(label,start,segs,col,dd,closed=True,line=None):
        points=[start];prev=start
        for x1,y1,x2,y2,x3,y3 in segs:
            for k in range(1,7):
                t=k/6;v=1-t
                points.append((v**3*prev[0]+3*v*v*t*x1+3*v*t*t*x2+t**3*x3,v**3*prev[1]+3*v*v*t*y1+3*v*t*t*y2+t**3*y3))
            prev=(x3,y3)
        pts=[px(*p) for p in points]
        if closed:front_poly(label,x,d+dd,z,pts,col,.0015)
        if line:tube(label+' 윤곽',[(x+a,d+dd-.0018,z+b) for a,b in pts+([pts[0]] if closed else [])],line*w,'navy',6)
    path('화구 연필 손잡이',(72,286),[(104,284,126,293,145,310),(181,309,254,312,310,310),(312,317,309,329,309,329),(248,330,167,329,139,328),(121,345,93,346,78,339),(65,327,61,302,72,286)],'yellow',0,True,.006)
    path('연필의 붓끝',(74,288),[(46,275,46,303,26,303),(36,317,53,341,86,341),(94,330,88,304,74,288)],'lilac',-.003,True,.006)
    path('하늘빛 하마 실루엣',(247,105),[(212,104,163,104,138,104),(99,106,76,144,63,178),(60,194,64,199,69,198),(69,227,83,245,105,263),(114,269,107,276,108,282),(122,286,133,296,144,309),(155,311,172,310,181,302),(186,295,187,284,190,278),(208,278,232,278,246,278),(249,292,251,307,271,308),(292,310,317,312,324,299),(330,288,327,266,335,252),(350,236,364,259,378,272),(395,291,441,303,470,274),(494,248,499,208,480,186),(466,170,452,168,438,159),(426,143,419,121,403,103),(412,90,413,71,400,74),(389,73,379,80,368,91),(353,88,334,88,313,94),(294,93,271,97,247,105)],'pool',-.007,True,.008)
    path('파란 베레모',(248,102),[(246,129,263,143,280,144),(299,145,315,124,333,112),(344,105,358,102,370,92),(371,69,350,55,327,53),(313,50,301,54,293,55),(288,45,283,42,277,49),(272,54,278,61,278,65),(265,75,255,85,248,102)],'blue',-.012,True,.007)
    a,b=px(400,151);oval('작은 하마 눈',x+a,d-.019,z+b,.008*w,.010*w,'navy')
    for k,(u,v) in enumerate([(139,171),(187,221),(351,204)]):
        a,b=px(u,v);oval('볼과 옆구리의 파스텔 점',x+a,d-.018,z+b,.026*w,.017*w,('yellow','lilac','sea')[k])
mascot(.98,-.103,1.022,.951)
for j,letter in enumerate('HAMA FILM'):
    if letter==' ':continue
    a=pi*.17+j*pi*.66/8
    xx=.98+.465*cos(a);hh=1.45+.250*sin(a)
    text('곡선 위의 영문 글자',letter,xx,-.111,hh,.143,'sea')
oval('하단 작은 흰 명판',.98,-.107,.39,.178,.060,'paper')
text('작은 상호','HAMA FILM',.98,-.111,.39,.052,'navy')
def mirrorContour(shrink):
    # The long sides undulate; the top corners round into a short arched head.
    h=1.89-2*shrink;w=.68-2*shrink;r=.115-shrink*.36;bottom=.097+shrink
    pts=[]
    for j in range(47):
        f=j/46;zz=bottom+(h-r)*f;wave=.028*sin(f*tau*5)*sin(pi*f)
        pts.append((-w/2+wave,zz))
    for j in range(11):
        t=pi-(pi/2)*j/10;pts.append((-w/2+r+r*cos(t),bottom+h-r+r*sin(t)))
    for j in range(11):
        t=pi/2-(pi/2)*j/10;pts.append((w/2-r+r*cos(t),bottom+h-r+r*sin(t)))
    for j in reversed(range(47)):
        f=j/46;zz=bottom+(h-r)*f;wave=.028*sin(f*tau*5+.46)*sin(pi*f);pts.append((w/2+wave,zz))
    return pts
v=part('mirror');sub(v,'물결형 하늘색 조명 둘레')
for j,(inset,d,c) in enumerate([(0,-.045,'blue'),(.019,-.069,'sea'),(.042,-.082,'pool'),(.062,-.076,'cyan'),(.077,-.064,'white')]):
    out=mirrorContour(inset);into=mirrorContour([.019,.042,.062,.077,.09][j]);n=len(out)
    pts=[(xx,d,zz) for xx,zz in out]+[(xx,d-.0015,zz) for xx,zz in into];faces=[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    smooth(m.piece('우윳빛 반투명 물결 '+str(j+1),pts,faces,c))
B('거울 아래 은빛 받침',0,-.025,.043,.74,.11,.052,'chrome',.008)
mg=part('mirrorGlass');sub(mg,'무늬 없는 은경 유리')
# Reflection is drawn by one material on this exact face, using a baked view of the furnished room.
profiles=mirrorContour(.089);m.piece('하마필름의 매끈한 은경',[(xx,-.060,zz) for xx,zz in profiles],[tuple(range(len(profiles)))],'mirror')
k=part('booth');sub(k,'셀프 촬영기의 렌즈·터치 화면·인화구')
B('방문객 앞의 흰색 사진기',0,.018,.045,.76,.416,1.980,'ivory',.024)
B('윗면의 확산 섬광판',0,-.197,1.810,.61,.008,.145,'white',.013)
# Cylindrical front opening with concentric optical elements.
def lens(x,d,z,r):
    for rr,dd,col in [(r,0,'sea'),(r*.86,-.005,'navy'),(r*.68,-.011,'black'),(r*.52,-.014,'slate'),(r*.34,-.018,'navy')]:
        oval('렌즈의 둥근 링',x,d+dd,z,rr,rr,col)
    oval('렌즈 표면의 작은 반사',x+r*.18,d-.021,z+r*.16,r*.14,r*.09,'pool')
lens(0,-.198,1.655,.060)
B('메뉴 화면의 검은 베젤',0,-.199,1.00,.654,.019,.498,'charcoal',.012)
B('인화 선택 메뉴 화면',0,-.211,1.017,.619,.004,.462,'screen',.005)
text('선택 화면 제목','사진 선택',0,-.216,1.408,.040,'ink',font)
B('네컷 디자인 선택',.122,-.216,1.080,.23,.002,.259,'white')
for row in range(2):
    for i in range(2):
        x=.122+(i-.5)*.102;z=1.22-row*.11
        B('프레임 미리보기',x,-.218,z-.039,.083,.002,.083,('pool','pink','cream','mint')[row*2+i])
        # Original simple still life illustrations rather than a visitor's likeness.
        oval('생쥐 모양 종이 스티커',x,-.220,z,.021,.023,'navy');oval('둥근 스티커 귀',x-.014,-.222,z+.019,.010,.010,'navy')
for row in range(3):
    for i in range(2):
        oval('프레임 색 선택 원',-.14+(i-.5)*.052,-.218,1.292-row*.059,.018,.018,('pink','mint','yellow','ink','lilac','teal')[2*row+i])
B('촬영기 하부 선반',0,-.218,.86,.72,.145,.044,'white',.009)
for x,word in [(-.19,'인화 사진'),(.14,'카드')]:
    B('투입구의 들린 덮개',x,-.201,.681,.216,.045,.066,'teal',.010)
    B('깊은 인화용 슬롯',x,-.229,.690,.167,.004,.018,'charcoal')
    text('배출구 안내',word,x,-.231,.771,.032,'ink',font)
B('아래의 사각 인화 배출구',-.13,-.195,.353,.33,.052,.127,'charcoal',.010)
B('인화된 네컷 종이 끝',-.14,-.228,.381,.192,.045,.054,'paper',.001)
for i in range(2):B('인화된 민트색 네컷 컷',-.14+(i-.5)*.067,-.253,.388,.051,.003,.026,'teal')
# Four-cut sheets along the front of the inner photo booth.
a=part('samples');sub(a,'촬영부스 외벽에 붙은 견본 스트립')
pal=['sea','pink','slate','mint','lilac','peach','teal','yellow']
def strip(x,d,z,w,h,idx):
    B('인화지의 흰 가장자리',x,d,z,w,.004,h,'white')
    for j in range(4):
        cy=z+h-(j+.59)*h*.233
        B('네컷 견본의 파스텔 프레임',x,d-.003,cy-h*.099,w*.84,.003,h*.194,pal[(idx+j*3)%8])
        # Pattern-mixed cut paper objects: cup, blossom or umbrella.
        if (idx+j)%3==0:
            front_poly('견본의 찻잔',x,d-.006,cy,[(-w*.20,-h*.041),(w*.18,-h*.041),(w*.22,h*.04),(-w*.24,h*.04)],'paper')
        elif (idx+j)%3==1:
            for i in range(4):
                ang=tau*i/4+.42;oval('견본의 꽃잎',x+w*.11*cos(ang),d-.006,cy+h*.031*sin(ang),w*.079,h*.025,'paper')
        else:front_poly('견본의 작은 양산',x,d-.006,cy,[(-w*.26,-h*.018),(w*.02,h*.058),(w*.26,-h*.018)],'paper')
for j in range(4):
    for i in range(10):
        x=.746+i*.115;z=.69+j*.323+.027*((i+j)%3)
        strip(x,1.006,z,.091,.278,i+7*j)
for j in range(2):
    for i in range(4):strip(-.11+i*.127,-.026,2.27+.143*j,.091,.125,i+3*j)
