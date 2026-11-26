"""Bent plywood and chrome chairs, the return unit and the counter visible through the corner window."""
tab=part('tables');section(tab,'스테인리스 받침의 사각 라미네이트 상판')
B('둥근 모서리 흰 상판',0,0,.712,.812,.601,.039,'white',.032)
B('목재 상판 단면',0,0,.706,.795,.583,.012,'pale',.014)
C('기둥 발 받침',0,0,.049,[(.045,0),(.065,.002),(.063,.652),(.071,.655)],'steel',26)
B('납작한 사각 스테인리스 발',0,0,.043,.363,.329,.012,'chrome',.008)
def chair(sign):
    cx=0;d=sign*.506
    def pd(x,v,h):return(cx+x,d+sign*v,h)
    # Seven depth sections raise the lip at the sides and behind the seat centre.
    xx=[-.192,-.156,-.085,0,.085,.156,.192];dd=[-.184,-.152,-.069,.015,.105,.166,.189]
    def curved(zbase,vs,xs,back=False):
        pts=[]
        for zoff in [0,-.013]:
            for j,v in enumerate(vs):
                for i,x in enumerate(xs):
                    if back:
                        u=j/(len(vs)-1);a=abs(x)/.21
                        pts.append(pd(x,.165+.047*u+.026*(1-a*a),.516+v-.018*a*a*(1-u)+zoff))
                    else:
                        side=(x/.201)**2;rear=v>0 and (v/.20)**2 or 0
                        pts.append(pd(x,v,zbase+.014*side+.009*rear-.008*(1-side)*cos(v/.18*pi/2)+zoff))
        n=len(xs);h=len(vs);off=n*h;faces=[]
        for k in [0,1]:
            for j in range(h-1):
                for i in range(n-1):
                    a=k*off+j*n+i;q=(a,a+1,a+1+n,a+n);faces.append(q if k==0 else q[::-1])
        rim=[*range(n)]+[j*n+n-1 for j in range(1,h)]+[off-2-i for i in range(n-1)]+[j*n for j in range(h-2,0,-1)]
        for i,a in enumerate(rim):
            b=rim[(i+1)%len(rim)];faces.append((a+off,b+off,b,a))
        return smooth(m.piece('옆과 뒤가 살짝 들린 합판 좌판' if not back else '등의 곡선을 따라 휘어진 합판 등받이',pts,faces,'oak'))
    curved(.464,dd,xx);curved(.535,[0,.039,.109,.172,.191],[-.206,-.179,-.074,0,.074,.179,.206],True)
    for x in [-.146,.146]:
        tube('좌판 밑에서 등으로 올라가는 금속 다리',[pd(x*1.19,.177,.050),pd(x,.138,.412),pd(x,.135,.46),pd(x,.143,.516),pd(x,.163,.634)],.0095,'chrome')
        tube('앞다리와 좌판 받침',[pd(x*1.19,-.159,.052),pd(x,-.133,.425),pd(x,-.111,.442),pd(x,.119,.442)],.0095,'chrome')
        for v in [-.159,.177]:B('다리 고무 마개',*pd(x*1.19,v,.044),.022,.023,.014,'dark',.003)
    tube('좌판 아래 가로 띠',[pd(-.157,.10,.430),pd(.157,.10,.430)],.0105,'steel')
for sign in [-1,1]:chair(sign)

station=part('service')
B('퇴식대 흰 몸통',0,0,.043,.620,.663,.814,'porcelain',.009)
B('물받이 상판',0,0,.846,.637,.678,.026,'white',.009)
B('벽쪽 수저통 받침',0,.167,.871,.593,.259,.202,'white',.006)
def rim(n,x,d,z,r,th,colour):
    rings=[(r-th,0),(r,0),(r+.001,.008),(r-th,.010),(r-th,0)]
    vs=[(x+rr*cos(i*tau/32),d+rr*sin(i*tau/32),z+h) for rr,h in rings for i in range(32)]
    fs=[(j*32+i,j*32+(i+1)%32,(j+1)*32+(i+1)%32,(j+1)*32+i) for j in range(4) for i in range(32)]
    smooth(m.piece(n,vs,fs,colour))
for i in range(3):
    x=(i-1)*.174;d=.165;C('깊은 원통 수저통 속',x,d,1.066,[(.060,.001),(.061,.004)],'dark',24);rim('세 개의 스테인리스 원형 투입구',x,d,1.069,.069,.009,'chrome')
    if i==0:
        for j in range(7):
            a=j*2.4;r=.021+.018*(j%2)
            tube('금속 스푼 손잡이',[(x+r*cos(a),d+r*sin(a),1.070),(x+r*cos(a)+.008*cos(a),d+r*sin(a)+.01*sin(a),1.151+.008*(j%3))],.003,'chrome',5)
C('퇴식구의 스테인리스 원판',-.153,-.132,.869,[(.107,0),(.109,.006)],'steel',36)
rim('음료와 쓰레기 퇴식구의 둥근 턱',-.153,-.132,.874,.119,.012,'chrome')
tube('스윙 뚜껑 중앙 경첩',[(-.259,-.132,.877),(-.048,-.132,.877)],.0029,'dark',6)
B('냅킨과 소품 정리 트레이',.145,-.121,.871,.234,.287,.047,'white',.006)
for i in range(8):B('잘 포개진 냅킨',.134,-.095,.918+i*.0017,.140,.072,.0012,'paper')
for i in range(5):B('낱개 포장한 물티슈',.108+i*.011,-.177,.918+i*.0026,.111,.047,.010,'leafB',.002)
for x in [.127,.180,.229]:
    C('소독제와 작은 펌프',x,.097,1.074,[(.017,0),(.022,.015),(.020,.073),(.012,.087),(.011,.101)],'porcelain',12)
    B('펌프 머리',x+.004,.097,1.173,.033,.014,.012,'steel',.002)

counter=part('counter')
B('흰 계산대 하부',0,.002,.044,4.080,.719,.857,'white',.007)
B('앞면 얇은 걸레받이',0,-.358,.046,4.046,.019,.066,'edge')
B('작업대 밝은 상판',0,-.003,.901,4.142,.782,.036,'porcelain',.012)
# The shop picture shows an espresso machine with fittings and a working shelf behind the public counter.
for x in [-.997,-.684]:
    B('커피 머신 받침 발',x,.14,.939,.062,.261,.037,'dark',.005)
B('에스프레소 머신 몸체',-.840,.20,.970,.615,.390,.348,'steel',.025)
B('커피 추출 헤드 윗단',-.839,-.025,1.187,.627,.106,.117,'chrome',.011)
B('커피 받침 트레이',-.842,-.089,.975,.570,.175,.035,'dark',.008)
for i in range(11):B('드립 트레이 평행 홈',-1.09+i*.051,-.103,1.005,.014,.139,.004,'chrome')
for x in [-1.015,-.780]:
    C('물 내리는 원형 헤드',x,-.081,1.140,[(.038,0),(.042,.049),(.045,.050)],'chrome',18)
    tube('검은 포터필터 손잡이',[(x,-.08,1.14),(x+.016,-.15,1.125),(x+.029,-.207,1.114)],.0105,'dark')
    smooth(C('데미타스 추출 잔',x,-.095,1.011,[(.026,0),(.041,.052),(.039,.055),(.032,.049),(.024,.008)],'white',18))
tube('스팀 노즐', [(-.577,-.005,1.17),(-.529,-.082,1.12),(-.535,-.124,1.045)],.0065,'chrome',8)
for x in [.84,1.115]:
    B('컵을 정리한 후면 선반 옆기둥',x,.179,.94,.02,.022,.440,'steel')
for h in [.94,1.157,1.361]:B('컵 선반판',.978,.119,h,.344,.274,.015,'chrome')
for j in range(3):
    for i in range(3):
        x=.884+i*.087;d=.086+.021*(j%2);z=.961+.129*j
        smooth(C('겹친 흰 컵',x,d,z,[(.026,0),(.039,.067),(.038,.073),(.034,.073),(.028,.021)],'white',16))
for i in range(5):
    x=-.020+.099*i;C('향 시럽 펌프 병',x,.174,.94,[(.026,0),(.036,.019),(.036,.160),(.019,.185),(.013,.23)],('coffee','amber','steel','brown','cream')[i],14)
    B('시럽 펌프',x+.007,.174,1.167,.048,.015,.009,'black',.002)
B('포스 장비 받침',-1.509,-.02,.941,.217,.196,.026,'dark',.004)
B('포스 기둥',-1.51,.013,.967,.058,.066,.17,'dark',.004)
B('진회색 고객용 디스플레이',-1.511,.009,1.116,.292,.069,.178,'dark',.012)
B('프런트 결제 화면',-1.511,-.027,1.129,.258,.006,.144,'midnight',.005)
for j in range(3):B('계산대에 늘어선 메뉴 파일',.466+j*.172,-.260,.945,.138,.032,.210,'white',.005)
screens=part('screens')
for j in range(2):
    x=(j-.5)*.87
    tube('천장 검정 모니터 봉',[(x,.02,2.755),(x,.02,2.486)],.014,'dark',8)
    B('매달린 와이드 디스플레이',x,.00,1.996,.850,.067,.472,'black',.015)
    B('화면',x,-.037,2.011,.823,.006,.443,'midnight' if j else 'paper',.003)
    if j==0:
        text('메뉴 모니터 제목','YOGURT WORLD',x,-.044,2.398,.053,'navy')
        for i in range(12):
            xx=x+(i%4-1.5)*.186;zz=2.303-(i//4)*.108
            ball('모니터의 요거트 그릇',xx,-.045,zz,.053,.002,.030,'white',10,5)
            for t in range(3):ball('메뉴의 세 가지 색 토핑',xx+(t-1)*.019,-.048,zz+.006,.014,.0018,.013,('mango','berry','pink','honey')[i%4],8,4)
    else:
        text('보조 디스플레이 상호','YOGURT WORLD',x,-.044,2.245,.079,'cyan')
        text('보조 디스플레이 안내','REFRESH YOUR WORLD',x,-.044,2.157,.044,'white')
