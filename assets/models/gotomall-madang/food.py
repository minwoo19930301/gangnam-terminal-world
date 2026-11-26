"""Visible table contents and a food sample based on the bowl illustrated in the store's menu."""
tools=part('tools');section(tools,'숟가락과 긴 금속 젓가락·포개 쌓은 물컵')
def spoon(x,d,z,sg,tilt):
    # Concave pressed bowl, turned on edge as it sits in the stainless utensil holder.
    pts=[];faces=[];n=20
    for j,rad in enumerate([.035,.62,1,.96,.55,.035]):
        off=[.0018,.001,.0,-.0007,-.0035,-.0045][j]
        for i in range(n):
            a=tau*i/n;xx=.0135*rad*cos(a)*(1+.12*sin(a));zz=.022*rad*sin(a);pts.append((x+xx+tilt*zz,d+off+sg*.16*xx,z+zz))
        if j:
            for i in range(n):
                p=(j-1)*n;faces.append((p+i,p+(i+1)%n,p+n+(i+1)%n,p+n+i))
    smooth(m.piece('오목하게 눌러 만든 숟가락 볼',pts,faces,'bright'))
    tube('숟가락 손잡이',[(x-.015*tilt,d,z-.016),(x-.022,d+.006,z-.081),(x-.027,d+.007,z-.139)],.0036,'steel',6)
x,d=-.425,-.155
smooth(C('수저가 담긴 스테인리스 원통',x,d,.004,[(.036,0),(.046,.003),(.049,.093),(.051,.101),(.049,.104),(.046,.102),(.044,.013)],'steel',27))
for i in range(7):
    a=2.39*i;xx=x+.030*cos(a);dd=d+.022*sin(a);h=.188+.012*(i%3)
    spoon(xx+.013*cos(a),dd,h,i%2-0.5,.20*cos(a))
for i in range(11):
    a=i*2.39+.24;rr=.014+.011*(i%3);xx=x+rr*cos(a);dd=d+rr*sin(a)
    tube('납작한 금속 젓가락',[(xx-.006*cos(a),dd-.007*sin(a),.041),(xx+.004*cos(a),dd+.004*sin(a),.108),(xx+.025*cos(a),dd+.027*sin(a),.201+.023*(i%4))],.0023,'bright',5)
C('테이블 번호대의 둥근 발',-.477,-.177,0,[(.034,0),(.036,.005),(.023,.008)],'steel',13)
tube('테이블 번호 세움대',[(-.477,-.177,.006),(-.477,-.177,.234)],.0034,'steel',5)
frame=[]
for i in range(36):
    a=tau*i/36;rad=.040+.0038*cos(5*a);frame.append((rad*cos(a),rad*sin(a)))
panel('꽃모양 테이블 번호 카드',-.477,-.198,.280,frame,'cream','front',.007)
B('컵 받침 사각 접시',.44,.199,.003,.170,.143,.009,'white',.015)
for i in range(4):
    smooth(C('포개 놓은 무광 스테인리스 물컵',.44,.199,.013+i*.022,[(.029,0),(.036,.007),(.042,.088),(.0435,.092),(.043,.096),(.040,.095),(.034,.016)],'steel',24))
dish=part('bibimbap');section(dish,'메뉴 그림을 참고한 돌솥과 달걀 비빔밥')
C('검정 돌솥 아래 받침',0,0,.004,[(.089,0),(.115,.005),(.119,.011),(.113,.017),(.081,.018)],'wood',32)
smooth(C('두꺼운 검은 돌솥',0,0,.015,[(.068,0),(.082,.008),(.096,.031),(.108,.077),(.111,.086),(.109,.092),(.101,.091),(.097,.078),(.077,.021)],'black',47))
def riceBase(x,d,z,r):
    sphere('밥의 하얀 바탕',x,d,z,r,r*.95,.015,'rice',28,13)
    rng=Random(180)
    for j in range(75):
        a=tau*rng.random();rr=r*sqrt(rng.random())*.96;xx=x+rr*cos(a);dd=d+rr*sin(a)
        sphere('낱알이 드러난 밥',xx,dd,z+.013*sqrt(max(0,1-(rr/r)**2)),.0042,.0018,.0016,'rice' if j%4 else 'toast',8,4)
riceBase(0,0,.088,.095)
def leafPiece(label,x,d,z,length,width,a,col,bend):
    v=[];f=[]
    for j in range(8):
        t=j/7;xx=(t-.5)*length;dd=bend*sin(pi*t);w=width*.5*sin(pi*t)**.7
        for k in [-1,0,1]:
            y=dd+k*w;v.append((x+xx*cos(a)-y*sin(a),d+xx*sin(a)+y*cos(a),z+.0035*sin(pi*t)-abs(k)*w*.21))
        if j:
            i=(j-1)*3;f.extend([(i,i+1,i+4,i+3),(i+1,i+2,i+5,i+4)])
    m.piece(label,v,f,col)
rand=Random(210)
for sectionIndex,(cx,cd,color) in enumerate([(-.056,-.020,'green'),(.004,-.055,'carrot'),(.057,-.015,'stalk'),(.045,.034,'miso'),(-.051,.032,'leaves')]):
    for j in range(27):
        x=cx+rand.uniform(-.021,.021);d=cd+rand.uniform(-.019,.019)
        z=.098+rand.uniform(-.001,.008);length=.019+rand.random()*.023;a=(sectionIndex*.8)+rand.uniform(-.92,.92)
        leafPiece('채소·나물의 가는 채',x,d,z,length,.0028+rand.random()*.0039,a,color,.003+rand.random()*.005)
# Fried egg with an uneven edge, softly domed yolk and a few toasted sesame seeds.
vs=[];fs=[];n=33
for ring,rad in enumerate([.10,.52,.88,1]):
    for i in range(n):
        a=tau*i/n;wig=(1+.09*sin(3*a+.8)+.047*sin(7*a));vs.append((.003+.042*rad*wig*cos(a),.014+.035*rad*wig*sin(a),.109+(.0035*(1-rad))+.001*sin(4*a)*rad))
    if ring:
        for i in range(n):
            j=(ring-1)*n;fs.append((j+i,j+(i+1)%n,j+n+(i+1)%n,j+n+i))
fs.append(tuple(range(n)));smooth(m.piece('가장자리 얇은 달걀 흰자',vs,fs,'white'))
sphere('봉긋한 달걀 노른자',.004,.015,.112,.018,.017,.008,'yolk',24,10)
for j in range(19):
    a=rand.random()*tau;r=.035+rand.random()*.041
    sphere('작은 깨알',r*cos(a),r*sin(a),.108+rand.random()*.002,.0017,.00065,.0006,'cream',7,4)
tray=part('plates');section(tray,'배식대에 놓인 납작한 철판과 노란 전')
B('배식대 위의 긴 사각 금속 쟁반',.06,.01,.003,.65,.345,.012,'bright',.015)
for side in [-1,1]:
    B('금속 쟁반의 들린 옆면',.06+side*.315,.01,.013,.012,.334,.018,'steel',.005)
    B('금속 쟁반 앞뒤의 얕은 턱',.06,.01+side*.163,.013,.624,.009,.017,'steel',.004)
rand=Random(311)
for j in range(8):
    x=.06+(j%4-1.5)*.135;d=.012+(j//4-.5)*.119;vs=[];fs=[];n=21
    for ring,(rad,zz) in enumerate([(.83,.017),(1,.021),(.97,.025),(.60,.029),(.01,.031)]):
        for i in range(n):
            a=tau*i/n;f=1+.054*sin(3*a+j)+.065*sin(5*a+.73*j)
            vs.append((x+.067*rad*f*cos(a),d+.054*rad*f*sin(a),zz+.0018*sin(4*a+j)))
        if ring:
            for i in range(n):
                k=(ring-1)*n;fs.append((k+i,k+(i+1)%n,k+n+(i+1)%n,k+n+i))
    smooth(m.piece('노릇한 전 한 장',vs,fs,'batter' if j%3 else 'fry'))
    for k in range(7):
        a=tau*rand.random();r=.037*sqrt(rand.random());xx=x+r*cos(a);dd=d+r*sin(a)
        leafPiece('전의 부추와 구운 자국',xx,dd,.0295,.013,.0028,a,'green' if k%4 else 'carrot',.0024)
