"""Room envelope, photographed ceiling, heart and customer dining sets."""
room=part('room');section(room,'회색 바닥 타일과 붉은 벽의 하부 벽돌')
W,D=5.53,6.15
B('검은 줄눈',0,3.075,.008,W,D,.019,'floor')
for j in range(10):
    for i in range(9):B('푸른빛 회색 석재 타일',(i-4)*.6137,(j+.5)*.614,.027,.610,.61,.011,'tile' if (i+j*3)%5 else 'tile2')
B('벽돌색으로 칠한 왼쪽 벽',2.735,2.10,.04,.055,4.20,2.73,'red')
B('흰색 오른쪽 벽',-2.735,3.075,.04,.055,D,2.73,'wall')
outline=spec['outline']
# The unmeasured back line uses the registered total area, the drawn dogleg and the game's building limit.
# The part beyond the photographed service hatch carries no invented equipment.
a,b,c,e,f,g=outline
panels=[
    [(-W/2,D),(W/2,D),(W/2,4.20),(e[0],4.20),tuple(f),tuple(g)],
]
def flat_slab(label,points,lo,hi,color):
    n=len(points);verts=[(x,d,z) for z in (lo,hi) for x,d in points]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    return m.piece(label,verts,faces,color)
for pts in panels:
    flat_slab('공단 도면의 뒤쪽 반환부 바닥',pts,.010,.037,'tile')
    flat_slab('등록 면적에 맞춘 후방 천장',pts,2.766,2.828,'wall')
def boundary(label,p,q):
    dx=q[0]-p[0];dd=q[1]-p[1];L=sqrt(dx*dx+dd*dd);sx=-dd*.029/L;sd=dx*.029/L
    xy=[(p[0]-sx,p[1]-sd),(q[0]-sx,q[1]-sd),(q[0]+sx,q[1]+sd),(p[0]+sx,p[1]+sd)]
    flat_slab(label,xy,.04,2.77,'wall')
for p,q in [(c,e),(e,f),(f,g),(g,(-W/2,D))]:boundary('도면과 면적에서 근사한 후방 외벽',p,q)
B('회색 천장',0,3.075,2.766,W,D,.062,'wall')
for side in [-1,1]:
    extent=4.20 if side>0 else 5.80
    B('벽돌 밑의 밝은 줄눈',2.699*side,extent/2,.05,.029,extent,.59,'grout')
    for j in range(4):
        for i in range(15):
            dd=-.11+i*.40+(j%2)*.18;start=max(.01,dd);end=min(dd+.393,extent)
            if end>start:B('거친 하부 흰 벽돌',2.677*side,(start+end)/2,.069+j*.135,.031,end-start,.129,'stone' if (i+j)%5 else 'wall',.003)
    B('벽돌 윗 테두리',2.672*side,extent/2,.631,.042,extent,.023,'white')
for i in range(5):
    for x in [-1.81,-.65,.65,1.82]:
        d=.47+i*1.19;C('천장 매입 원형 다운라이트',x,d,2.756,[(.064,0),(.065,.011)],'white',14)
B('사각형 천장 냉난방 유닛',.20,2.41,2.728,.83,.79,.039,'stone',.029)
for side in [-1,1]:
    B('냉난방기 송풍구 좌우 홈',.20+side*.34,2.41,2.723,.048,.58,.008,'inside')
    B('냉난방기 송풍구 앞뒤 홈',.20,2.41+side*.318,2.723,.56,.042,.008,'inside')
B('천장 중앙 막힌 흡입 패널',.20,2.41,2.719,.48,.45,.014,'wall',.026)
for d in [.79,3.75]:
    C('원형 천장 환기구',-1.08,d,2.739,[(.13,0),(.135,.018),(.116,.021),(.108,.004)],'darksteel',22)
    C('원형 환기구 안쪽',-1.08,d,2.736,[(.095,0),(.094,.006)],'stone',20)
for d in [1.10,2.82,4.52]:
    B('레일 조명 받침',-2.35,d,2.722,.09,.15,.036,'white')
    tube('트랙 조명의 짧은 팔',[(-2.35,d,2.72),(-2.34,d,2.62),(-2.37,d+.04,2.59)],.012,'steel')
    sphere('작은 흰 트랙 조명 헤드',-2.365,d+.046,2.57,.047,.064,.046,'white')
h=part('heart');section(h,'흰 하트 장식과 황동 종')
# Curve from the photographed large white wall heart. The thickness casts a separate shadow.
def heartCurve(size):
    pts=[]
    for i in range(70):
        a=tau*i/70;y=16*sin(a)**3;z=13*cos(a)-5*cos(2*a)-2*cos(3*a)-cos(4*a)
        pts.append((y*size/32,(z+.5)*size/32))
    return pts
panel('붉은 벽의 흰 하트',-.011,0,1.60,heartCurve(.93),'white','side',.025)
B('튜브를 받치는 브래킷',-.046,-.018,1.613,.065,.07,.19,'gold',.006)
tube('종 위에 뻗은 짧은 고리',[(-.054,-.018,1.768),(-.123,-.018,1.768),(-.133,-.018,1.732)],.012,'gold')
C('황동 종의 벌어진 아랫단',-.125,-.018,1.553,[(.075,0),(.080,.006),(.078,.014),(.056,.035),(.042,.072),(.036,.112),(.026,.125),(.016,.13)],'gold',26)
tube('작은 종의 당김 끈',[(-.126,-.018,1.56),(-.133,-.014,1.475),(-.143,-.002,1.422)],.004,'wood',5)
sphere('끈 끝 매듭',-.143,-.002,1.415,.012,.011,.015,'wood',10,6)
t=part('table');section(t,'밝은 나무 식탁과 붉은 방석이 달린 의자')
B('연한 원목 상판',0,0,.713,1.25,.72,.046,'oak',.015)
B('테두리 원목 띠',0,0,.685,1.24,.713,.030,'edge',.010)
for sx in [-1,1]:
    for sd in [-1,1]:
        B('검은 네모 테이블 다리',sx*.548,sd*.279,.046,.047,.047,.644,'black',.004)
B('상판 안에 매립된 불판 테두리',.16,.012,.759,.54,.397,.004,'darksteel',.007)
B('불판 덮개',.16,.012,.763,.511,.368,.004,'wood',.005)
for xx in [-.001,.31]:B('불판 덮개 이음',xx,.012,.767,.002,.37,.001,'edge')
for s in [-1,1]:
    cd=s*.558
    # Three-ply bent back on a wood chair, broad red cushion with a rolled seam.
    B('붉은색 각진 쿠션',-.015,cd,.417,.421,.369,.043,'cushion',.021)
    B('의자 원목 틀',-.015,cd,.386,.432,.38,.037,'wood',.012)
    for sx in [-1,1]:
        for sd in [-1,1]:
            tube('의자 원목 다리',[(sx*.187-.015,cd+sd*.156,.392),(sx*.197-.015,cd+sd*.170,.047)],.018,'wood',7)
        tube('등받이를 지탱하는 기둥',[(sx*.187-.015,cd+s*.160,.394),(sx*.196-.015,cd+s*.204,.817)],.019,'oak',7)
    vs=[];fs=[];n=12
    for side in [-1,1]:
        for row,(ht,dep) in enumerate([(.632,.185),(.809,.206)]):
            for i in range(n+1):
                u=i/n*2-1;vs.append((u*.211-.015,cd+s*(dep+.025*(1-u*u))+side*.013,ht+.009*(1-u*u)))
    for i in range(n):
        fs.extend([(i,i+1,n+2+i,n+1+i),(n*2+2+i,n*3+3+i,n*3+4+i,n*2+3+i),(n+1+i,n+2+i,3*n+4+i,3*n+3+i)])
    m.piece('의자 상부의 굽은 원목 등판',vs,fs,'oak')
