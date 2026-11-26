"""Six gathered Tianjin bao, flat pan-fried dumplings and stir-fried chow mein."""
from mathutils import noise

def dish(name,x,d,z,rx,rd,tone='porcelain',n=44):
    levels=[(.65,0),(.73,.003),(.90,.011),(.99,.022),(1,.027),(.98,.030),(.89,.022),(.71,.012),(.06,.011)]
    verts=[(x+rx*f*cos(i*tau/n),d+rd*f*sin(i*tau/n),z+h) for f,h in levels for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(levels)-1) for i in range(n)]
    faces.append(tuple((len(levels)-1)*n+i for i in range(n)));return smooth(m.piece(name,verts,faces,tone))
def tint(ob,rows):
    attr=ob.data.color_attributes.new(name='요리의 표면',type='BYTE_COLOR',domain='POINT')
    for i,rgb in enumerate(rows):attr.data[i].color=tuple(rgb)+(1,)
def mixed(a,b,t):
    c=m.palette[a].diffuse_color;e=m.palette[b].diffuse_color;t=max(0,min(1,t))
    return tuple(c[i]*(1-t)+e[i]*t for i in range(3))
buns=part('buns');child(buns,'얇게 겹친 대나무 테와 통기성 받침')
r=.178
for rad,height,bottom,col in [(r,.071,.005,'bamboo'),(r+.004,.012,.008,'bamboo2'),(r+.003,.009,.026,'rattan'),(r+.0015,.006,.072,'bamboo2')]:
    ring('둥글게 휜 대나무 띠',0,0,bottom,rad,height,.0045,col,46)
smooth(C('통기 시트 바닥',0,0,.024,[(r-.005,0),(r-.006,.004)],'linen',44))
for j in range(-21,22):
    x=j*.0077;span=sqrt(max(0,(r-.009)**2-x*x))
    if span<.008:continue
    B('바닥 시트의 가는 날줄',x,0,.0282,.0013,2*span,.0014,'bamboo2')
    B('바닥 시트의 가는 씨줄',0,x,.0293,2*span,.0013,.0009,'bamboo2')
for a in [.94,4.08]:
    for j in range(3):
        phi=a+j*.019;points=[((r+.006)*cos(phi+du),(r+.006)*sin(phi+du),zz) for du,zz in [(-.012,.016),(.004,.031),(.012,.052)]]
        tube('찜통을 조인 대나무 매듭',points,.0017,'knot',5)
child(buns,'도톰하게 모은 맨 위 꼭지와 몸통의 주름')
for ix,(x,d,ang) in enumerate([(-.062,-.089,-.3),(.065,-.086,.83),(-.115,.02,.1),(.002,.019,.54),(.115,.037,-.37),(.023,.114,.7)]):
    folds=12+(ix%3);n=folds*7
    levels=[(0,.62,.00),(.06,.84,.00),(.18,.97,.01),(.32,1,.024),(.50,.95,.073),(.65,.83,.126),(.77,.66,.160),
            (.86,.48,.18),(.90,.34,.12),(.95,.32,.095),(1,.28,.12),(1.036,.22,.22),(1.041,.064,.01)]
    vs=[];fs=[];colors=[];rx=.0365*(1+.036*sin(ix));rd=.036*(1+.049*cos(ix));h=.052*(1+.094*sin(1+ix))
    for z,radius,amp in levels:
        for k in range(n):
            a=tau*k/n;phase=folds*(a+.17*z*z+ang)+.15*sin(a*3+ix)
            groove=((1+cos(phase))/2)**3.2
            radial=radius*(1-amp*groove)*(1+.030*sin(a*3.0+ix)+.017*cos(a*2-ix))
            pinch=max(0,(z-.82)/.22)
            vs.append((x+rx*radial*cos(a)+.0048*pinch,d+rd*radial*sin(a)-.0031*pinch,.0303+h*z+.0015*pinch*sin(a*3)))
            colors.append(mixed('doughLit','fold',.085+.55*groove*min(1,amp/.11)+.090*(1-z)))
    for j in range(len(levels)-1):
        for k in range(n):fs.append((j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k))
    fs.extend([tuple(reversed(range(n))),tuple(range((len(levels)-1)*n,len(levels)*n))])
    ob=smooth(m.piece('기울어진 꼭지로 손주름을 모은 포자 '+str(ix+1),vs,fs,'doughLit'));tint(ob,colors)
    for k in range(3):
        aa=ang+k*1.36;points=[]
        for q in range(7):
            tt=q/6;rad=.0095-.006*tt;points.append((x+.0045+rad*cos(aa+.63*tt),d-.003+rad*sin(aa+.63*tt),.0303+h*(.90+.145*tt)))
        tube('꼭지에 남은 피 접힘',points,.00075,'doughLit',5)

fried=part('fried');child(fried,'타원 접시·중국식 지짐만두')
dish('긴 타원 백자 접시',0,0,0,.189,.113)
for i in range(6):
    x=-.107+i*.043;d=.010*sin(i*.81);phi=-.21+.08*sin(i*1.2);c,s=cos(phi),sin(phi);n=23
    levels=[(-1,.04,.001),(-.90,.42,.008),(-.68,.71,.022),(-.36,.93,.032),(0,1,.036),(.35,.91,.031),(.68,.68,.020),(.90,.37,.008),(1,.05,.001)]
    verts=[];fs=[];colour=[]
    for xp,r,top in levels:
        for j in range(n):
            a=tau*j/n;xx=r*.026*cos(a)+.013*(1-xp*xp);dd=xp*.065;up=max(0,sin(a))
            fold=.0015*sin(5*xp+i*1.37+2*a)*up
            zz=.014+(.003+top)*(sin(a)*.42+.55)+fold
            if sin(a)<-.6:zz=max(.013,zz)
            verts.append((x+c*xx-s*dd,d+s*xx+c*dd,zz))
            val=noise.noise(Vector((xx*78+i,dd*45+1.8,sin(a)*1.17)))+.29*up+.17*cos(2.7*xp+i)
            colour.append(mixed('gyoza','toast',min(1,max(0,(val-.05)*2.35))))
    for k in range(len(levels)-1):
        for j in range(n):fs.append((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j))
    fs.extend([tuple(reversed(range(n))),tuple(range((len(levels)-1)*n,len(levels)*n))])
    ob=smooth(m.piece('기름에 눌러 지진 만두 '+str(i+1),verts,fs,'gyoza'));tint(ob,colour)
    for k in range(3):
        dd=(k-1)*.026+.002;points=[(x+.008*c-(dd+v)*s,d+.008*s+(dd+v)*c,.032+h) for v,h in [(-.007,0),(-.003,.0027),(.003,.003),(.007,0)]]
        tube('접힌 만두피의 작은 모서리',points,.001,'paleToast',5)
noodles=part('noodles');child(noodles,'볶음면과 숙주·채소·고명')
dish('흰 차오면 접시',0,0,0,.164,.143)
ell('볶음면 안쪽 볼륨',0,0,.041,.109,.098,.031,'noodle',25,10)
rand=Random(8124)
for j in range(83):
    ang=rand.random()*tau;c,s=cos(ang),sin(ang);bias=rand.uniform(-.074,.074);phase=rand.random()*tau
    span=sqrt(max(.001,.121**2-bias**2))*rand.uniform(.62,1.01);pts=[]
    for k in range(23):
        u=k/22;xx=(2*u-1)*span;yy=bias+.012*sin(3.9*pi*u+phase)+.005*sin(8*pi*u+phase*.7)
        xx+=.005*sin(2*pi*u+phase);r2=(xx/.121)**2+(yy/.108)**2
        zz=.025+.056*max(0,1-r2)**.57+.0045*sin(2.7*pi*u+phase)+.0022*(j%4)
        pts.append((xx*c-yy*s,xx*s+yy*c,zz))
    tone='bean' if j%8==0 else 'carrot' if j%11==0 else 'noodle2' if j%3==0 else 'noodle'
    tube('구불거리는 볶음면과 숙주',pts,.0015 if tone=='carrot' else .0019+.0004*(j%3),tone,6)
for j in range(15):
    a=j*2.40;size=.044+rand.random()*.029;back=rand.uniform(-.022,.022)
    tube('위에 얹은 쪽파와 채소',[(cos(a)*size,sin(a)*size,.064),(cos(a)*size*.38,sin(a)*size*.38,.093+back*.3),
        (-cos(a)*size*.51,-sin(a)*size*.49,.082+back*.3)],.0023,'chive' if j%3 else 'carrot',5)
for x,d in [(-.218,-.041),(.203,.049)]:
    dish('곁들이는 작은 종지',x,d,.001,.048,.042)
    if x<0:
        smooth(C('고추 소스',x,d,.013,[(.031,0),(.033,.003)],'soy',20))
        for j in range(18):
            a=rand.random()*tau;r=.024*rand.random();ell('종지 안 고추 조각',x+cos(a)*r,d+sin(a)*r,.018,.004,.0026,.0026,'chilli',7,4)
    else:
        for j in range(3):
            B('얇게 썬 곁들임 채소',x+(j-1)*.010,d,.015+j*.002,.012,.043,.004,'gold',.002)
