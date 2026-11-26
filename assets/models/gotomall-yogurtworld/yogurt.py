"""Two bowls photographed at this branch. Granola, blueberry crowns and broken comb cells have editable geometry."""
from mathutils import noise
import math
def tint(ob,values):
    a=ob.data.color_attributes.new(name='음식과 식물 표면',type='BYTE_COLOR',domain='POINT')
    for pt,val in zip(a.data,values):pt.color=(*val,1)
def mix(a,b,f):
    return tuple(m.palette[a].diffuse_color[i]*(1-f)+m.palette[b].diffuse_color[i]*f for i in range(3))
def cup(paper,printed=False):
    smooth(C('종이 컵의 안쪽과 말린 림',0,0,.002,[(.045,0),(.054,0),(.070,.058),(.073,.064),(.074,.067),(.073,.069),(.071,.069),(.0695,.065),(.052,.006),(.046,.005)],paper,64))
    if not printed:return
    for row in range(2):
        for k in range(11):
            a=tau*(k+.47*row)/11;z=.020+.023*row
            if .8*pi<a<1.39*pi:continue
            pts=[];n=14
            for i in range(n):
                t=tau*i/n;aa=a+.081*cos(t);h=z+.0058*sin(t);r=.054+.016*h/.058+.0003
                pts.append((r*cos(aa),r*sin(aa),h))
            m.piece('하늘색 컵의 작은 분홍 열매',pts,[tuple(range(n))],'pink')
    B('컵 앞 브랜드 패치',0,-.063,.021,.048,.002,.025,'white',.005)
    text('컵 앞의 요거트월드','YOGURT',0,-.065,.037,.008,'navy',depth=.00018)
    text('컵 앞의 WORLD','WORLD',0,-.065,.028,.007,'navy',depth=.00018)
def granular(seed,count,keep,height):
    rand=Random(seed);clusters=[([],[],[]) for _ in range(5)]
    for _ in range(count):
        for attempt in range(45):
            x=rand.uniform(-.067,.067);d=rand.uniform(-.065,.063)
            if x*x+d*d<.0649**2 and keep(x,d):break
        else:continue
        h=height(x,d)+rand.uniform(-.002,.002);idx=rand.randrange(5)
        vs,fs,cs=clusters[idx];start=len(vs);p=rand.random()*tau
        rx=rand.uniform(.0015,.0045);rd=rx*rand.uniform(.42,.88);rz=rx*rand.uniform(.44,1.04);n=5+(idx%2)
        for j,(ring,z) in enumerate([(.64,-.63),(1,-.08),(.72,.62),(.16,1)]):
            for i in range(n):
                t=tau*i/n+.16*j;xx=ring*rx*cos(t);dd=ring*rd*sin(t)
                vs.append((x+xx*cos(p)-dd*sin(p),d+xx*sin(p)+dd*cos(p),h+rz*z))
                cs.append(mix('grain','seed',rand.uniform(.20,.92)))
        for j in range(3):
            for i in range(n):
                k=start+j*n;fs.append((k+i,k+(i+1)%n,k+n+(i+1)%n,k+n+i))
        fs.append(tuple(start+3*n+i for i in range(n)))
    for j,(vs,fs,cs) in enumerate(clusters):
        if vs:tint(m.piece('귀리·그래놀라의 굵은 조각 '+str(j+1),vs,fs,'oat'),cs)
def scoop(label,x,d,h,rx,rd,rz,a,b,rough,seed,n=38,nk=19):
    vs=[];fs=[];cs=[]
    for j in range(nk+1):
        lat=-pi/2+pi*j/nk
        for i in range(n):
            t=tau*i/n;l=cos(lat);xx=l*cos(t);dd=l*sin(t);zz=sin(lat)
            fine=noise.noise(Vector((xx*8+seed,dd*8+.23,zz*8+.71)))
            coarse=noise.noise(Vector((xx*2.8,dd*2.8+seed,zz*2.8)))
            scale=1+rough*(fine*.31+coarse*.72);vs.append((x+rx*xx*scale,d+rd*dd*scale,h+rz*zz*scale))
            cs.append(mix(a,b,max(0,min(1,.49+coarse*.51+fine*.38))))
    for j in range(nk):
        for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    ob=smooth(m.piece(label,vs,fs,b));tint(ob,cs);return ob
b=part('blueberry');section(b,'종이 볼의 블루베리·그릭요거트·그래놀라');cup('white')
scoop('그릭요거트 바닥',0,0,.044,.064,.061,.011,'milk','yogurt',.045,3)
scoop('한 스쿱 떠 올린 그릭요거트',-.018,.014,.053,.033,.031,.025,'milk','yogurt',.21,13,44,21)
for j in range(5):
    t0=1.15*j;pts=[]
    for k in range(7):
        t=t0+k*.075;rad=.016+.004*cos(t*2+j);pts.append((-.018+rad*cos(t),.014+rad*sin(t),.073+.003*sin(2.4*t+j)))
    tube('스쿱에서 생긴 작은 요거트 결',pts,.0011,'yogurt',5)
granular(86,242,lambda x,d:d<-.008+.29*x,lambda x,d:.045+.010*max(0,1-(x*x+(d+.026)**2)/.063**2))
for j,(x,d,r) in enumerate([(.027,.037,.0121),(.043,.019,.0117),(.042,-.002,.0104),(.023,.014,.0110),(.014,.038,.0103),(.048,.032,.0075)]):
    z=.052+.002*(j%3)
    scoop('검푸른 블루베리 '+str(j+1),x,d,z,r,r*.97,r*.91,'midnight','bloom',.07,20+j,20,12)
    crown=[];turn=j*.736
    for k in range(11):
        a=tau*k/10+turn;rad=(.0023 if k%2 else .0047)*(r/.012)
        crown.append((x+.0012+rad*cos(a),d+rad*sin(a),z+r*.885+(.0002 if k%2 else .0008)))
    tube('열매 꼭지의 별모양 꽃받침',crown,.00059,'midnight',5)
h=part('honey');section(h,'프린트 컵과 검게 빛나는 벌집꿀·망고');cup('sky',True)
scoop('바닥에 담은 흰 요거트 아이스크림',0,0,.044,.064,.062,.022,'milk','yogurt',.11,113)
granular(115,202,lambda x,d:d<-.004+.15*x,lambda x,d:.047+.007*max(0,1-(x*x+d*d)/.066**2))
# Three separate broken slabs of open wax cells. Each cell has a concave amber floor with a bright wax rim.
def comb(x,d,z,w,dep,heading,tilt,seed):
    rand=Random(seed);step=.00325;vs=[];fs=[];colors=[]
    c,s=cos(heading),sin(heading)
    def point(xx,dd,hh):return(x+xx*c-dd*s,d+xx*s+dd*c,z+hh+tilt*dd+.12*xx)
    # Wax fracture around the perimeter gives each chunk a continuous amber side.
    outline=[(-.48,-.35),(-.30,-.51),(.06,-.53),(.37,-.48),(.50,-.26),
             (.48,.24),(.29,.49),(-.18,.53),(-.49,.35),(-.52,-.09)]
    n=len(outline)
    for layer,(scale,level) in enumerate([(.88,-.0054),(1,-.0028),(.98,.0014),(.95,.0037)]):
        for i,(ux,ud) in enumerate(outline):
            ridge=.00065*sin(2.13*i)
            vs.append(point(ux*w*scale,ud*dep*scale,level+ridge))
            colors.append(mix('honey','wax',(.17,.31,.54,.73)[layer]+.10*sin(i)))
        if layer:
            k=(layer-1)*n
            for i in range(n):
                j=(i+1)%n;fs.append((k+i,k+j,k+n+j,k+n+i))
    fs.append(tuple(2*n+i for i in range(n)))
    for j in range(-6,7):
        for i in range(-12,13):
            gx=i*1.50*step;gd=(j+(i%2)*.50)*sqrt(3)*step
            if abs(gx)>w/2 or abs(gd)>dep/2 or abs(gx)/(w/2)+abs(gd)/(dep/2)>1.78:continue
            top=.006+rand.uniform(-.0017,.0022);floor=.0018+rand.uniform(-.0008,.0011);offset=len(vs)
            for num,(r,hh) in enumerate([(step*1.01,top),(step*.83,top+.00018),(step*.71,floor),(step*.24,floor-.0003)]):
                for q in range(6):
                    a=q*tau/6;xx=gx+r*cos(a);dd=gd+r*sin(a);vs.append(point(xx,dd,hh))
                    colors.append(mix('wax','gold',.56+rand.random()*.37) if num<2 else mix('honey','amber',.20+rand.random()*.42))
            for ring in range(3):
                for q in range(6):
                    k=offset+6*ring;fs.append((k+q,k+(q+1)%6,k+6+(q+1)%6,k+6+q))
            fs.append(tuple(offset+18+q for q in range(6)))
    tint(m.piece('찢어진 벌집의 육각 밀랍과 꿀',vs,fs,'amber'),colors)
    for j in range(5):
        xx=(j-2)*w*.145;dd=dep*.41*sin(1.5*j)
        p=point(xx,dd,.008)
        ball('밀랍 가장자리 밝은 꿀방울',*p,.0011,.0009,.0018,'gold',8,5)
comb(-.003,-.038,.064,.064,.022,-.13,.38,5)
comb(.030,-.011,.065,.032,.024,.55,-.47,11)
comb(-.033,-.011,.064,.031,.023,-.51,.46,12)
for j,(x,d,rx,ry,h1) in enumerate([(-.026,.018,.027,.020,.014),(.005,.028,.027,.023,.020),(.032,.018,.024,.017,.013),(-.009,.001,.018,.014,.013),(.014,.013,.016,.015,.021)]):
    scoop('황금색 망고 과육 '+str(j+1),x,d,.055+.001*(j%2),rx,ry,h1,'fruit','mangoLit',.31,45+j,22,13)
for j in range(10):
    a=j*2.399;rx=.006+.024*(j/9)
    x=.001+rx*cos(a);d=.016+rx*.61*sin(a)
    tube('망고 표면의 짧은 과육 섬유',[(x,d,.070),(x+.002,d+.002,.071),(x+.006,d+.0025,.0705)],.00043,'mangoLit',4)
plants=part('plants');section(plants,'유리창 아래의 포인세티아와 녹색 잎 화분')
def leaf(label,base,tip,width,color):
    a=Vector(base);b=Vector(tip);direction=b-a;side=Vector((-direction.y,direction.x,0));side.normalize()
    vs=[];fs=[];cs=[]
    for j in range(8):
        u=j/7;center=a+direction*u+Vector((0,0,.031*sin(pi*u)));rad=width*sin(pi*u)**.69*(1+.12*sin(7*pi*u))
        for t in [-1,0,1]:
            v=center+side*t*rad+Vector((0,0,-.12*abs(t)*rad));vs.append(tuple(v))
            cs.append(mix(color,'vein' if color.startswith('leaf') else 'petal',.49 if t==0 else .13))
        if j:
            i=(j-1)*3;fs.extend([(i,i+1,i+4,i+3),(i+1,i+2,i+5,i+4)])
    tint(m.piece(label,vs,fs,color),cs)
for offset,poinsettia in [(-.425,False),(.31,True)]:
    r=.063 if poinsettia else .074
    smooth(C('창가의 흰 유약 화분' if not poinsettia else '포인세티아를 감싼 연둣빛 화분',0,offset,0,[(.049,0),(.055,.003),(r,.103),(r+.006,.111),(r+.004,.118),(r-.004,.117)],'white' if not poinsettia else 'leaf',24))
    C('표면의 짙은 흙',0,offset,.108,[(r*.91,0),(r*.92,.002)],'soil',18)
    for j in range(11 if poinsettia else 8):
        a=j*2.399;ht=(.18+.037*(j%3)) if poinsettia else .32+.095*(j%4)
        x=.041*cos(a);d=offset+.053*sin(a);foot=(.012*cos(a),offset+.015*sin(a),.108)
        tube('화분에서 솟은 줄기',[foot,(x*.61,offset+(d-offset)*.61,ht*.72),(x,d,ht)],.0025,'leafB',5)
        if poinsettia:
            for k in range(6):
                ang=a+k*tau/6;tip=(x+.055*cos(ang),d+.054*sin(ang),ht-.019+.022*(k%2));leaf('빨간 포인세티아의 포엽',(x,d,ht),tip,.016,'red' if k%2 else 'petal')
        else:
            for k in range(4):
                ang=a+1.8*k;start=(x*.8,offset+(d-offset)*.8,ht-.034*k)
                leaf('측창 화분의 좁은 타원 잎',start,(start[0]+.074*cos(ang),start[1]+.086*sin(ang),start[2]+.035),.025,'leaf' if k%2 else 'leafB')
