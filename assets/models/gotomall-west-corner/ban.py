"""Open G-011 sale floor, quilted coats, scalloped parasols and boxed household wares."""
c=part('banShell');sub(c,'점포 사이 벽과 밝은 판매장')
B('회색 줄눈 아래',0,2.07,.009,4.13,4.14,.016,'line')
for j in range(6):
    for i in range(6):B('수입 잡화점 바닥 타일',(i-2.5)*.686,(j+.5)*.686,.025,.681,.681,.012,('tile','tile2')[(3*i+j)%4==1])
for side in [-1,1]:
    B('기둥의 밝은 마감',side*2.027,2.08,.04,.071,4.17,2.72,'wall')
    B('입구 슬림 금속 프레임',side*1.98,.013,.04,.038,.050,2.70,'chrome')
B('후벽',0,4.115,.04,4.12,.058,2.72,'cream')
B('천장',0,2.065,2.747,4.13,4.15,.065,'ivory')
for j in range(4):
    for x in [-1.43,-.38,.75,1.57]:
        C('박힌 다운라이트',x,.48+j*.95,2.736,[(.069,0),(.069,.008)],'white',12)
# Bookshelf-like metal stock shelves behind the public aisle.
for x in [-1.32,1.30]:
    for z in [.20,.79,1.38,1.96]:
        B('후면 선반',x,3.82,z,1.27,.49,.030,'metal')
        for i in range(5):
            tint=('paper','slate','cream','rose','teal','card')[(i+int(z*6))%6]
            B('후면 진열 포장',x+(i-2)*.21,3.77,z+.031,.19,.23,.19+.035*(i%3),tint,.006)
    for xx in [-.61,.61]:
        for dd in [3.59,4.03]:B('선반 기둥',x+xx,dd,.058,.026,.026,2.26,'chrome')
s=part('banSign');sub(s,'유리창의 주황 입체 상호와 양쪽 글자')
B('밝은 유리 헤더',0,.026,2.20,3.92,.046,.512,'ivory')
for x in [-1.94,-.69,.70,1.94]:B('유리 이음',x,-.010,2.205,.014,.013,.499,'metal')
text('반에반 붉은 글자 깊이','반 에 반',.00,-.030,2.392,.525,'inner',font,depth=.021,scale=1.20)
text('반에반 주황 전면','반 에 반',.00,-.056,2.398,.522,'lit',font,depth=.002,scale=1.20)
text('공장 직영','공장직영',1.49,-.015,2.52,.153,'red',font)
text('도매 전문','도매전문',1.49,-.015,2.34,.15,'teal',font)
text('수입 생활용품','수입생활용품',-1.47,-.015,2.52,.143,'navy',font)
text('할인 매장','할인매장',-1.47,-.015,2.34,.155,'navy',font)
B('매장 주소판',1.91,-.021,2.067,.236,.024,.146,'navy',.006)
text('G011 주소','G-011',1.91,-.041,2.14,.067,'white')
# Nested loops along elliptical cross sections produce padded quilting with raised channels.
def coatbody(x,d,z,size,color,seed):
    layers=[(0,.166,.100),(.05,.179,.108),(.42,.172,.105),(.67,.151,.092),(.79,.183,.098),(.88,.114,.078),(.94,.061,.056)]
    def interp(j,p):
        for i in range(1,len(layers)):
            if j<=layers[i][0]:
                a,b=layers[i-1],layers[i];k=(j-a[0])/(b[0]-a[0]);return a[p]+(b[p]-a[p])*k
        return layers[-1][p]
    vs=[];fs=[];n=18
    for j in range(35):
        t=j/34*.94;ripple=.0095*sin(t/.079*pi)**2
        for i in range(n):
            a=tau*i/n;wx=(interp(t,1)+ripple)*size;ry=(interp(t,2)+ripple*.8)*size
            vs.append((x+wx*cos(a),d+ry*sin(a),z+t*size+.005*cos(a*3+seed)*size))
        if j:
            for i in range(n):
                k=(j-1)*n;fs.append((k+i,k+(i+1)%n,k+n+(i+1)%n,k+n+i))
    fs.append(tuple(34*n+i for i in range(n)));smooth(m.piece('경량 외투의 가로 누빔 몸판',vs,fs,color))
    for side in [-1,1]:
        vs=[];fs=[]
        for j in range(22):
            f=j/21;wx=(.052+.011*(1-f)+.005*sin(f*8*pi)**2)*size
            xx=x+side*(.144+.078*f)*size;zz=z+(.78-.65*f)*size
            for i in range(12):
                a=tau*i/12;vs.append((xx+wx*cos(a),d+wx*.93*sin(a),zz))
            if j:
                for i in range(12):
                    k=(j-1)*12;fs.append((k+i,k+(i+1)%12,k+12+(i+1)%12,k+12+i))
        smooth(m.piece('겹마다 부푼 외투 소매',vs,fs,color))
    tube('얇은 중앙 지퍼',[(x,d-.107*size,z+.042*size),(x,d-.111*size,z+.44*size),(x,d-.094*size,z+.77*size),(x,d-.062*size,z+.88*size)],.0034,'metal',5)
    for side in [-1,1]:
        tube('비스듬히 절개된 주머니',[(x+side*.085*size,d-.099*size,z+.31*size),(x+side*.123*size,d-.079*size,z+.20*size)],.0039,'slate',5)
    collar=[(x+.063*size*cos(a),d+.055*size*sin(a),z+(.94+.012*cos(a))*size) for a in [i*tau/18 for i in range(19)]]
    tube('스탠드 칼라',collar,.009*size,color)
q=part('coats');sub(q,'바퀴 달린 행거·금속 옷걸이·누빈 외투')
for x in [-.39,.39]:
    B('하부 다리',x,.03,.062,.055,.60,.039,'chrome',.006)
    for d in [-.22,.28]:ellipse('검정 캐스터',x,d,.051,.033,.021,.034,'charcoal')
    tube('크롬 행거 세로대',[(x,.026,.075),(x,.026,1.78)],.014,'chrome',8)
tube('행거 윗봉',[(-.40,.026,1.78),(.40,.026,1.78)],.018,'chrome')
for j,(d,col,size) in enumerate([(.19,'denim',.86),(.13,'olive',.92),(.071,'cloth',.96),(-.003,'ivory',1.0)]):
    x=(j-1.4)*.125
    pts=[(x-.17,d,1.54),(x,d,1.64),(x+.17,d,1.54),(x-.17,d,1.54)]
    tube('철사 옷걸이 어깨',pts,.006,'metal',6)
    tube('윗봉에 건 고리',[(x,d,1.64),(x,d,1.712),(x+.012,d,1.752),(x+.015,.026,1.803),(x-.012,.026,1.803),(x-.021,.026,1.76)],.004,'metal',5)
    coatbody(x,d,1.642-.935*size,size,col,j)
# Open umbrellas photographed over the merchandise. Ribs and scalloped hems carry through the fabric.
u=part('shades');sub(u,'펼친 양산·살과 접힌 우산')
def parasol(x,d,z,r,cols,head):
    n=8
    for k in range(n):
        vs=[];fs=[]
        for ring in range(8):
            f=ring/7
            for i in range(7):
                v=i/6;ang=head+tau*(k+v)/n;ray=r*f*(1-.075*sin(pi*v)*f)
                hh=z+r*(.55*(1-f*f)-.068*sin(pi*v)*f)
                vs.append((x+ray*cos(ang),d+ray*sin(ang),hh))
            if ring:
                for i in range(6):
                    j=(ring-1)*7+i;fs.append((j,j+1,j+8,j+7))
        smooth(m.piece('곡면의 삼각 양산 한 폭',vs,fs,cols[k%len(cols)]))
        tube('살을 따라 잡은 바이어스',[vs[j*7] for j in range(8)],.0037,'ivory',5)
        if k%2==0:
            for i in [2,4]:ellipse('양산의 작은 꽃 무늬',*vs[5*7+i],.012,.012,.003,'rose',8,4)
    tube('양산 손잡이',[(x,d,z+.57*r),(x,d,z-.44),(x+.015,d,z-.48),(x+.039,d,z-.494),(x+.058,d,z-.476)],.010,'metal')
parasol(-.08,.43,1.47,.42,['cream','paper','rose','paper'],.18)
parasol(.25,-.06,1.35,.37,['mint','ivory','cyan','ivory'],.47)
B('우산 받침 상자',0,.1,.047,.73,.51,.39,'charcoal',.014)
for i in range(9):
    x=(i%3-1)*.205;d=(i//3-1)*.14+.08;ht=.65+.07*(i%4)
    vs=[];fs=[];n=12
    for j,(f,rad) in enumerate([(0,.013),(.08,.037),(.82,.05),(.94,.036),(1,.009)]):
        for k in range(n):
            a=tau*k/n+.4*f;r=rad*(1 if k%2 else .66);vs.append((x+r*cos(a),d+r*sin(a),.36+f*ht))
        if j:
            for k in range(n):
                p=(j-1)*n;fs.append((p+k,p+(k+1)%n,p+n+(k+1)%n,p+n+k))
    m.piece('접힌 우산의 천 주름',vs,fs,('lilac','navy','rose','mint')[i%4])
    tube('고리에 건 접이식 손잡이',[(x,d,.36+ht),(x,d,.4+ht),(x+.023,d,.42+ht),(x+.05,d,.412+ht),(x+.053,d,.388+ht)],.008,'charcoal',6)
b=part('bins');sub(b,'종이박스와 직조 손잡이 바구니')
def carton(x,d,z,w,dep,h,col='card'):
    B('박스 바닥',x,d,z,w,dep,.012,col)
    for ds in [-1,1]:B('상자 긴 옆판',x,d+ds*(dep/2-.005),z+.01,w,.014,h,'edge',.002)
    for xs in [-1,1]:B('상자 짧은 옆판',x+xs*(w/2-.005),d,z+.01,.014,dep,h,col,.002)
def basket(x,d,z,w,dep,h):
    for i in range(11):
        xx=x+(i-5)*w/11
        for dd in [-1,1]:tube('바구니 세로살',[(xx*.99+(x*.01),d+dd*(dep*.42),z),(xx,d+dd*dep*.5,z+h)],.0055,'brown',5)
    for j in range(6):
        f=j/5;wx=w*(.88+.12*f)/2;dy=dep*(.84+.16*f)/2;zj=z+h*f
        rodloop('직조 바구니의 가로 둘레',[(x-wx,d-dy,zj),(x+wx,d-dy,zj),(x+wx,d+dy,zj),(x-wx,d+dy,zj)],.0075,'oak' if j%2 else 'brown')
    for side in [-1,1]:
        pts=[(x+side*w*.36,d+dep*.40*cos(k*pi/18),z+h+.14*sin(k*pi/18)) for k in range(19)]
        tube('바구니 손잡이',pts,.012,'brown')
def packets(x,d,z,cols,rows,span):
    for j in range(rows):
        for i in range(cols):
            xx=x+(i-(cols-1)/2)*span;dd=d+(j-(rows-1)/2)*.084;zz=z+.018*((i+j)%3);co=('cream','navy','mint','peach','paper','yellow')[(i+2*j)%6]
            B('생활 소품 개별 팩',xx,dd,zz,.073,.078,.09+.013*(i%3),co,.007)
            B('인쇄 라벨',xx,dd-.040,zz+.041,.047,.0018,.024,'paper')
for i,(x,d,z,w,dep,h) in enumerate([(-.19,-.43,.05,.56,.48,.22),(.20,.17,.07,.56,.47,.23),(-.19,.63,.04,.61,.49,.23),(-.15,-.02,.39,.55,.42,.20)]):
    carton(x,d,z,w,dep,h);packets(x,d,z+h-.056,5,3,.094)
basket(.27,-.17,.30,.43,.30,.17)
for i in range(7):
    x=.27+(i%3-1)*.089;d=-.15+(i//3-1)*.068
    tube('포장 위로 보이는 조리도구 손잡이',[(x,d,.37),(x+.025,d,.59)],.0075,'metal',6)
    ellipse('오목한 주방 계량 스푼',x+.027,d,.625,.020,.007,.034,'chrome',11,6)
for x,d in [(-.20,-.675),(.19,-.08),(-.19,.374)]:
    B('매대 손글씨 안내 카드',x,d,.164,.225,.004,.096,'paper')
    text('카드 붉은 안내','생활용품',x,d-.003,.21,.038,'red',font)
v=part('trays');sub(v,'선반의 꽃무늬 쟁반과 겹친 도기 그릇')
for h in [.13,.58,.96]:B('철제 매대의 선반',0,.15,h,.93,.61,.028,'charcoal',.006)
for x in [-.434,.434]:
    for d in [-.125,.425]:
        B('금속 매대 기둥',x,d,.055,.026,.026,.956,'chrome',.003);ellipse('선반 바퀴',x,d,.043,.032,.012,.033,'charcoal',9,5)
def rounded(w,h,r):
    p=[]
    for a,b,off in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,pi/2),(-w/2+r,-h/2+r,pi),(w/2-r,-h/2+r,pi*1.5)]:
        for j in range(5):
            t=off+j*pi/8;p.append((a+r*cos(t),b+r*sin(t)))
    return p
def tray(x,d,z,w,h,tilt,color,decor=False):
    # Facing the open aisle. Inclined stock sits behind the horizontal stacks.
    def pt(xx,yy,zz):return(x+xx,d+yy*cos(tilt)+zz*sin(tilt),z-yy*sin(tilt)+zz*cos(tilt))
    pts=[];fs=[];n=20
    for j,(f,zz) in enumerate([(.97,0),(1,.012),(.965,.019),(.85,.004)]):
        pts.extend(pt(a,b,zz) for a,b in rounded(w*f,h*f,.033))
        if j:
            for i in range(n):
                k=(j-1)*n;fs.append((k+i,k+(i+1)%n,k+n+(i+1)%n,k+n+i))
    fs.append(tuple(n*3+i for i in range(n)));m.piece('라운드 사각의 깊은 쟁반',pts,fs,color)
    if decor:
        outer=[pt(a,b,.0195) for a,b in rounded(w*.967,h*.967,.032)];rodloop('쟁반 테두리 장식',outer,.0025,'mint')
        for cx,cy in [(-w*.17,h*.15),(w*.20,-h*.12),(0,-.01)]:
            for j in range(7):
                a=tau*j/7
                poly=[pt(cx,cy,.0065),pt(cx+.018*cos(a-.5),cy+.018*sin(a-.5),.0065),pt(cx+.033*cos(a),cy+.032*sin(a),.0065),pt(cx+.017*cos(a+.5),cy+.017*sin(a+.5),.0065)]
                m.piece('쟁반에 인쇄된 꽃잎',poly,[(0,1,2,3)],'petal' if cx<0 else 'leaf')
for i in range(7):tray(-.195,.03,1.001+i*.014,.39,.298,0,'paper' if i%2==0 else 'mint',i==6)
for i in range(5):tray(.20,.045,.625+i*.013,.34,.283,0,'cream',i==4)
tray(.20,.295,1.21,.345,.424,-1.34,'paper',True)
for j,(x,d,z,rad) in enumerate([(-.19,.09,.618,.132),(.22,.0,.996,.11),(-.03,.14,.167,.15),(.29,.18,.166,.102)]):
    for i in range(4):
        C('겹쳐 쌓은 도기 그릇',x,d,z+i*.029,[(rad*.46,0),(rad*.53,.012),(rad*.92,.078),(rad,.098),(rad*.99,.105),(rad*.93,.104),(rad*.72,.055),(rad*.49,.026)],'ivory' if i%2 else 'cyan',23)
    if j==1:
        for i in range(8):
            a=tau*i/8;ellipse('도기 둘레의 작은 청색 꽃',x+.097*cos(a),d+.097*sin(a),z+.16,.007,.006,.005,'blue',8,4)
sub(s,'매장 앞의 종이 상품표와 클립')
for x,d,z,w,word in [(-1.26,-.075,1.88,.47,'돋보기'),(-.81,-.067,1.97,.40,'포장상품'),(.81,-.072,2.00,.38,'생활용품'),(1.49,-.060,1.92,.33,'도매전문')]:
    for xx in [x-w*.37,x+w*.37]:tube('종이 안내 매다는 가는 줄',[(xx,d,2.24),(xx,d,z+.18)],.0025,'charcoal',4)
    B('종이 상품 안내',x,d,z,w,.007,.174,'paper')
    text('붉은색 상품 안내 글자',word,x,d-.006,z+.093,.069,'red',font)
sub(c,'부드러운 패브릭 진열과 포장 상자')
# The wall hanging behind the front tables has a broad ornamental border in the shop photo.
xx,dd,zz=-1.50,2.82,.275;w=.65;ht=1.68;n=14
def fabric(x,z):
    f=(z-zz)/ht;u=(x-xx)/w
    return(x,dd+.022*cos(f*pi*1.6)+.035*cos(u*pi*2.1),z)
vs=[fabric(xx+w*(i/n-.5),zz+ht*j/18) for j in range(19) for i in range(n+1)]
fs=[(j*(n+1)+i,j*(n+1)+i+1,(j+1)*(n+1)+i+1,(j+1)*(n+1)+i) for j in range(18) for i in range(n)]
smooth(m.piece('세운 금사무늬 장식 직물',vs,fs,'cream'))
for k in range(3):
    wx=w/2-.014-k*.019;bottom=zz+.027+k*.019;top=zz+ht-.02-k*.019
    coords=[(xx-wx,bottom),(xx+wx,bottom),(xx+wx,top),(xx-wx,top),(xx-wx,bottom)]
    tube('장식 직물의 짙은 테두리',[(a,b-.005,z) for a,b,z in [fabric(x,z) for x,z in coords]],.0043,'olive' if k%2==0 else 'gold',5)
for j in range(5):
    z=zz+.23+j*.31
    loop=[]
    for k in range(41):
        a=tau*k/40;r=.098+.013*cos(a*6);v=fabric(xx+r*cos(a),z+r*1.29*sin(a));loop.append((v[0],v[1]-.008,v[2]))
    tube('패브릭의 자수 장미 무늬',loop,.0058,'olive',5)
# Stacked sacks and cloth packs behind the front displays.
for j in range(4):
    for i in range(3):
        x=.89+i*.28;d=3.32+.14*(j%2);h=.05+j*.14
        B('포개 놓은 패브릭 포장',x,d,h,.27,.39,.102,('paper','denim','lilac','cream','rose')[(i+2*j)%5],.026)
        B('접힌 천의 종이 띠',x,d-.006,h+.095,.072,.36,.012,'paper',.004)
sub(b,'입구까지 이어지는 낮은 묶음 상품')
for i,(x,d,co) in enumerate([(-.07,-1.65,'rose'),(.14,-1.29,'navy'),(-.12,-1.04,'yellow')]):
    carton(x,d,.043,.57,.35,.18)
    for j in range(6):
        xx=x+(j%2-.5)*.20;dd=d+(j//2-1)*.09
        B('테두리가 접힌 타월 묶음',xx,dd,.17+.010*(j%2),.19,.086,.077,co if j%3 else 'paper',.012)
        B('타월의 얇은 두 줄 장식',xx+.045,dd,.247+.011*(j%2),.012,.077,.003,'cream')
    B('박스 앞 손글씨 종이',x,d-.183,.087,.28,.004,.089,'paper')
    text('잡화 판매 표찰','생활 잡화',x,d-.188,.133,.044,'red',font)
sub(sources['trays'],'금속 조리기구와 작은 병 묶음')
for j in range(4):
    x=-.20+.124*(j%2);d=-.09+.178*(j//2)
    C('스테인리스 계량컵',x,d,.168,[(.031,0),(.037,.004),(.053,.079),(.055,.084),(.050,.085),(.046,.019)],'chrome',16)
    loop=[(x+.045,d,.222),(x+.068,d,.245),(x+.081,d,.237),(x+.081,d,.211),(x+.051,d,.204)]
    tube('계량컵 금속 손잡이',loop,.0034,'chrome',5)
for j in range(5):
    x=.23+(j%3-1)*.070;d=.28+.085*(j//3)
    C('선반의 소스 병',x,d,.61,[(.032,0),(.035,.007),(.035,.130),(.022,.149),(.021,.171)],'brown',12)
    C('작은 유리병 라벨',x,d,.648,[(.0355,0),(.0355,.072)],'paper',12)
    C('병의 나사 뚜껑',x,d,.781,[(.023,0),(.023,.018)],'gold',12)
