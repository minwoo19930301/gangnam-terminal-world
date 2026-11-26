"""Three customer dishes from the branch's published menu and diner photographs."""
rand=Random(218)
def ring(n,x,d,z,rad,tubeR,c,steps=37):
    return tube(n,[(x+rad*cos(i*tau/steps),d+rad*sin(i*tau/steps),z) for i in range(steps+1)],tubeR,c,6)
def patterned(n,r,z,w):
    # A whole border is an editable mesh instead of dozens of separate draw surfaces.
    vertices=[];faces=[]
    for j in range(46):
        a=j*tau/46
        for k in range(3):
            dp=(k-1)*.021;rr=r-.0038*abs(k-1);id=len(vertices)
            for da,dr in [(-.021,0),(0,-w),(.021,0),(0,w*.32)]:
                aa=a+da+dp;ra=rr+dr;vertices.append((ra*cos(aa),ra*sin(aa),z-1.15*(r-ra)))
            faces.append(tuple(range(id,id+4)))
    m.piece(n,vertices,faces,'blue')
def scallion(x,d,z,r):
    n=8;v=[];f=[]
    for radius,h in [(r,.002),(r,.006),(r*.55,.006),(r*.58,.001)]:
        for j in range(n):
            a=j*tau/n;v.append((x+radius*cos(a),d+.84*radius*sin(a),z+h+.001*cos(a)))
    for j in range(3):
        for i in range(n):k=j*n;f.append((k+i,k+(i+1)%n,k+n+(i+1)%n,k+n+i))
    m.piece('둥근 속이 빈 파 조각',v,f,'onion' if rand.random()>.3 else 'peas')
noodles=part('mala');section(noodles,'푸른 무늬 도자기와 붉은 국물의 차돌 마라탕면')
smooth(C('깊은 면기',0,0,.003,[(.046,0),(.049,.007),(.054,.014),(.082,.035),(.109,.066),(.131,.096),(.145,.113),(.147,.119),(.146,.124),(.141,.126),(.136,.122),(.100,.078),(.052,.024)],'porcelain',55))
ring('면기 안쪽의 남색 테두리',0,0,.124,.143,.0019,'blue',58);patterned('청화 덩굴 무늬',.141,.122,.0055)
smooth(C('붉은 마라 육수',0,0,.111,[(.129,0),(.132,.002),(.129,.003)],'stock',47))
for i in range(21):
    a=rand.uniform(0,tau);r=rand.uniform(.051,.113);end=rand.uniform(.66,2.5);p=[]
    for k in range(16):
        t=k/15;b=a+end*t;rr=r+sin(t*6+i)*.009;p.append((rr*cos(b),rr*sin(b),.114+.0035*sin(t*2*pi+i)))
    tube('육수 위로 보이는 굽은 면 가닥',p,.0025+.0006*(i%3),'noodle',6)
for j in range(52):
    a=rand.random()*tau;r=.129*sqrt(rand.random());sphere('육수 표면 기름 방울',r*cos(a),r*sin(a),.115,.0012+rand.random()*.0047,.0009+rand.random()*.0033,.0005,'oil' if j%4 else 'chili',7,3)
# Curled thin slices with a wavy fat-strip edge, consistent with the photographed sliced brisket.
for j in range(18):
    a=rand.random()*tau;rad=rand.uniform(.005,.061);cx=rad*cos(a);cd=rad*sin(a);z=.119+(.057-rad)*.25+.002*(j%3);turn=rand.random()*tau;l=rand.uniform(.039,.076);w=rand.uniform(.019,.036);v=[];f=[]
    for i in range(10):
        t=i/9;xx=(t-.5)*l;shade=sin(t*pi);off=.004*sin(t*pi*2+j)
        for k in range(5):
            q=k/4;dd=(q-.5)*w*(.52+.48*shade)+off;hh=z+.009*sin(q*1.61*pi+j*.49)+.005*sin(t*2*pi+2*q+j)+.002*cos(3.5*t*pi+j)
            v.append((cx+xx*cos(turn)-dd*sin(turn),cd+xx*sin(turn)+dd*cos(turn),hh))
            if k and i:
                start=(i-1)*5+k-1;f.append((start,start+1,start+6,start+5))
    ob=m.piece('지방 가장자리가 접힌 차돌박이',v,f,'pork' if j%4 else 'beef');ob.data.materials.append(m.palette['fat'])
    for i,face in enumerate(ob.data.polygons):face.use_smooth=True;face.material_index=1 if i%4==0 or (i+j)%16==4 else 0
for i in range(30):
    a=rand.random()*tau;r=.065*sqrt(rand.random());scallion(r*cos(a),r*sin(a),.147-.16*r,rand.uniform(.0019,.0035))
meal=part('rice');section(meal,'푸른 점무늬 접시와 달걀·채소 볶음밥')
smooth(C('볶음밥의 평접시',0,0,.002,[(.078,0),(.085,.004),(.139,.009),(.161,.019),(.167,.025),(.162,.026),(.137,.018),(.095,.010)],'porcelain',55))
ring('접시 가장자리 푸른 테',0,0,.026,.164,.0017,'blue',64)
# Original pointed flecks, separately editable, around the dark blue-and-white rim.
verts=[];faces=[]
for row in range(6):
    nr=91-row*5;radius=.157-row*.0037
    for j in range(nr):
        a=(j+.5*(row%2))*tau/nr;idx=len(verts);z=.022-(.157-radius)*.43
        for aa,rr in [(a-.020,radius),(a,radius-.0027),(a+.020,radius),(a,radius+.0016)]:verts.append((rr*cos(aa),rr*sin(aa),z+(rr-radius)*.3))
        faces.append(tuple(range(idx,idx+4)))
m.piece('청색 작은 쌀알 문양 테두리',verts,faces,'blue');sphere('볶은 밥의 바탕',0,0,.021,.121,.106,.042,'rice',27,11)
for i in range(215):
    a=rand.random()*tau;r=sqrt(rand.random());x=.121*r*cos(a);d=.109*r*sin(a);z=.025+.041*sqrt(max(0,1-r*r));
    size=rand.uniform(.0029,.0053);c='rice' if i%8 else 'egg' if i%3 else 'carrot';sphere('볶은 쌀알',x,d,z,size,size*.49,size*.37,c,7,4)
for i in range(50):
    a=rand.random()*tau;r=sqrt(rand.random());x=.109*r*cos(a);d=.10*r*sin(a);z=.033+.036*sqrt(1-r*r)
    if i%4==1:scallion(x,d,z,.0032)
    else:sphere('달걀 조각과 잘게 썬 채소',x,d,z,.004+rand.random()*.003,.0045,.0028,['egg','peas','carrot'][i%3],8,4)
veg=part('eggplant');section(veg,'새우를 넣어 볶은 가지와 파채가 담긴 접시')
smooth(C('웍가지새우용 흰 타원 접시',0,0,.002,[(.081,0),(.091,.007),(.147,.021),(.164,.031),(.167,.032),(.162,.034),(.092,.014)],'porcelain',45,.83));
for j in range(9):
    aa=tau*j/8+.3;r=(.074 if j<8 else .0);x=r*cos(aa);d=r*.78*sin(aa);a=aa*.64+.31;z=.027+.011*(j%2);ell=.030+rand.random()*.011
    sphere('가지를 감싼 튀김 껍질',x,d,z+.014,ell,.026,.022,'batter',13,7)
    sphere('진보랏빛 가지 단면',x+.013*cos(a),d+.013*sin(a),z+.029,.022,.015,.008,'aubergine',11,5)
    for k in range(4):
        b=a+(k-1)*.62;sphere('속에 들어간 새우살',x+.015+.010*cos(b),d+.009*sin(b),z+.037,.009,.006,.005,'shrimp',9,5)
    for k in range(5):
        b=rand.random()*tau;sphere('튀김의 갈색 소스',x+.023*cos(b),d+.019*sin(b),z+.027,.006,.004,.003,'sauce',7,4)
for j in range(15):
    a=rand.random()*tau;r=rand.random()*.066;x=r*cos(a);d=.78*r*sin(a)
    tube('가늘고 긴 파채',[(x-.025,d,.063),(x-.008,d+.009,.074),(x+.013,d+.017,.077),(x+.031,d+.021,.067)],.0016,'leaf' if j%3 else 'peas',5)
