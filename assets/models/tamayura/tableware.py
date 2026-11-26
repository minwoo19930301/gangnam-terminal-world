"""Original dishes sized as hand-held objects, based on the restaurant's public menu photos."""
from math import cos, sin, pi, tau
from random import Random
import blender_shop_mesh as m
from joinery import cup, pot

B,R,V,F=m.block,m.rod,m.profile,m.piece
rng=Random(20261126)

def pebble(name,x,d,z,rx,rd,rz,tone,n=16):
    rings=[(0,-.95),(.57,-.79),(.94,-.35),(1,.09),(.84,.56),(.50,.86),(.06,.98)]
    ob=V(name,x,d,z,[(max(.0001,rx*r),rz*h) for r,h in rings],tone,n,rd/rx)
    for poly in ob.data.polygons:poly.use_smooth=True
    return ob

def rect_plate(name,x,d,z,w,l,tone):
    # slightly pinched corners and an upturned rim
    verts=[];n=40
    for radius,h in [(.83,0),(.96,.003),(1,.013),(.993,.016),(.92,.012),(.83,.006)]:
        for i in range(n):
            a=tau*i/n;c=cos(a);s=sin(a)
            verts.append((x+w*.5*radius*(1 if c>=0 else -1)*abs(c)**.43,
                          d+l*.5*radius*(1 if s>=0 else -1)*abs(s)**.46,z+h))
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(5) for i in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range(5*n,6*n))])
    return F(name,verts,faces,tone)

def setting():
    B('엷은 회백색 개인 매트',-.013,-.004,.001,.394,.245,.0018,'tile_edge',.001)
    rect_plate('젓가락 받침 옆 개인 접시',-.044,-.002,.003,.238,.175,'porcelain')
    verts=[(-.123,-.054,.018),(.039,-.057,.018),(.048,.051,.019),(-.125,.054,.018),
           (-.119,-.048,.028),(.041,-.046,.030),(.038,.055,.042),(-.118,.050,.040)]
    F('두 겹으로 접은 흰 리넨',verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],'linen',.0016)
    R('냅킨 끝의 바느질',[(-.115,.041,.040),(-.055,.044,.041),(.034,.046,.041)],.0007,'ivory_edge',5)
    B('젓가락 받침',.144,.043,.004,.049,.023,.010,'porcelain',.002)
    for x in [.134,.146]:
        R('칠기 젓가락',[(x,-.103,.006),(x+.003,.046,.017),(x+.005,.116,.019)],.0028,'blackwood',8)
        R('젓가락 윗단 칠 띠',[(x+.005,.102,.018),(x+.005,.114,.019)],.0031,'cream_gold',8)
    cup('작은 소스 종지',.116,.107,.004,.027,.018,'porcelain')
    V('종지 안 간장',.116,.107,.019,[(.020,0),(.020,.0008)],'blackwood',18)

def sushi_dish():
    rect_plate('긴 초밥 접시',0,0,.001,.394,.185,'porcelain')
    for i,(x,d,tone) in enumerate([(-.146,.009,'seaweed'),(-.081,-.003,'tuna'),(-.020,.004,'whitefish'),(.042,-.003,'salmon'),(.107,.001,'whitefish')]):
        if tone=='seaweed':
            V('군함말이 · 구운 김띠',x,d,.016,[(.022,0),(.026,.008),(.027,.034),(.025,.042),(.023,.044)],'seaweed',26,1.18)
            for j in range(19):
                a=rng.uniform(0,tau);rad=.019*rng.random()**.50
                pebble('군함 위 주황색 어란',x+rad*cos(a),d+.97*rad*sin(a),.060+rng.uniform(0,.006),.004,.004,.004,'ikura',8)
            continue
        pebble('스시 밥의 타원형 몸체',x,d,.028,.026,.019,.011,'rice',20)
        for j in range(19):
            a=tau*j/19
            pebble('스시 옆면 쌀알',x+.023*cos(a),d+.017*sin(a),.027+.004*sin(a*3),.0036,.0022,.0021,'rice',8)
        # Taper the fish to a less regular tail and let both sides fall over the oval rice.
        def fish_point(t,q):
            shape=1-.48*abs(t)**2+.07*sin(t*4+i)
            xlocal=.030*t+.002*q+.0014*sin(q*2+t*3+i)
            dlocal=.021*q*shape+.0025*sin(t*2+i)
            top=.048+.0016*sin(3*t+i)-.012*abs(t)**2-.016*abs(q)**2.7
            return x+xlocal,d+dlocal,top
        nx,nd=13,11
        pts=[fish_point(-1+2*a/(nx-1),-1+2*b/(nd-1)) for a in range(nx) for b in range(nd)]
        faces=[(a*nd+b,(a+1)*nd+b,(a+1)*nd+b+1,a*nd+b+1) for a in range(nx-1) for b in range(nd-1)]
        perimeter=[a*nd for a in range(nx)]+[(nx-1)*nd+b for b in range(1,nd)]+[a*nd+nd-1 for a in range(nx-2,-1,-1)]+list(range(nd-2,0,-1))
        start=len(pts)
        for vi in perimeter:
            px,pd,pz=pts[vi];pts.append((px,pd,pz-.0028))
        for j,vi in enumerate(perimeter):
            nxt=(j+1)%len(perimeter);faces.append((vi,start+j,start+nxt,perimeter[nxt]))
        faces.append(tuple(reversed(range(start,len(pts)))))
        ob=F('밥을 감싸듯 늘어뜨린 생선 포',pts,faces,tone)
        for poly in ob.data.polygons:poly.use_smooth=True
        for k in range(6 if tone=='salmon' else 4):
            pts=[]
            for j in range(11):
                q=-.89+1.78*j/10;t=-.78+k*(1.49/(5 if tone=='salmon' else 3))+.22*q+.04*sin(5*q+k)
                px,pd,pz=fish_point(t,q);pts.append((px,pd,pz+.00021))
            R('생선의 굽은 지방 결과 손질 단면',pts,.00046 if tone=='whitefish' else .00065,'vein',5)
        if i==4:
            for j in range(4):
                px,pd,pz=fish_point(-.25+.16*j,.15*cos(j))
                pebble('흰살생선의 가는 파 고명',px,pd,pz+.001,.0009,.0023,.0008,'stem',7)
    for j in range(3):pebble('절인 생강 얇은 조각',.158+j*.004,-.026+j*.008,.022+j*.003,.012,.009,.003,'ginger',14)
    pebble('갠 고추냉이',.159,.033,.023,.012,.009,.010,'wasabi',12)

def teppan_dish():
    rect_plate('돌결 작은 철판요리 접시',0,0,.001,.265,.183,'glaze_dark')
    for j in range(4):
        x=-.080+j*.042;d=.008*sin(j*1.9);w=.037+rng.uniform(0,.006);l=.048+rng.uniform(0,.012)
        corners=[]
        for k in range(16):
            a=tau*k/16;c=cos(a);sn=sin(a);f=rng.uniform(.96,1.045)
            corners.append((w*.5*(1 if c>=0 else -1)*abs(c)**.47*f,l*.5*(1 if sn>=0 else -1)*abs(sn)**.53*f))
        rings=[(.78,.014),(.99,.017),(1,.036),(.96,.041),(.79,.045),(.43,.047),(.02,.0475)]
        verts=[(x+px*r+.0018*sin(j+h*95),d+pd*r,h+.0014*sin(px*80+pd*36+j)) for r,h in rings for px,pd in corners]
        faces=[(q*16+k,q*16+(k+1)%16,(q+1)*16+(k+1)%16,(q+1)*16+k) for q in range(len(rings)-1) for k in range(16)]
        faces.extend([tuple(reversed(range(16))),tuple(range((len(rings)-1)*16,len(rings)*16))])
        cut=F('모서리마다 다르게 구운 한우',verts,faces,'steak')
        cut.data.materials.append(m.palette['cut_beef']);cut.data.materials.append(m.palette['grill'])
        for i,poly in enumerate(cut.data.polygons):
            k=i%16;q=i//16
            if q in (0,1) and (k>=8 or k<=1):poly.material_index=1
            elif q in (2,3) and (k+2*j)%5==0:poly.material_index=2
            poly.use_smooth=q>=3
        for k in range(4):
            dd=d-.014+.010*k
            pts=[(x-.012+i*.004,dd+.0012*sin(i*.8+j),.047-.0012*(i-3)**2/9+.001*sin(j)) for i in range(7)]
            R('철판에 닿아 그을린 고기 결',pts,.00065,'grill',5)
        for k in range(3):
            B('자른 면의 옅은 지방 섬',x-.010+.009*k,d-l*.486,.023+.003*sin(k+j),.004,.0007,.0012,'vein',.0003)
    # A halved grilled mushroom and a few visibly blistered asparagus tips.
    pebble('구운 버섯 갓',.086,.032,.023,.021,.016,.011,'steak',18)
    for k in range(7):
        a=pi*k/6
        R('버섯 단면 주름',[(.087,.015,.022),(.087+.016*cos(a),.015+.006*sin(a),.024+.005*sin(a))],.0007,'ivory_edge',5)
    for j in range(2):
        d=-.058+j*.012
        R('구운 아스파라거스 줄기',[(-.063,d,.017),(.004,d+.004,.020),(.062,d+.008,.021)],.0047,'asparagus',10)
        for k in range(4):pebble('아스파라거스 끝 잎',.053+.005*k,d+.006+.001*k,.023,.0057,.0041,.005,'stem',9)
    for j in range(5):pebble('소금 알갱이',.09+.009*cos(j),.044+.010*sin(j),.016,.0018,.0018,.0013,'salt',6)

def tea_set():
    B('옻칠 차 쟁반',-.12,.006,.002,.49,.276,.012,'blackwood',.006)
    for d in [-.129,.141]:B('차 쟁반 턱',-.12,d,.014,.482,.009,.008,'walnut',.002)
    for x in [-.36,.12]:B('차 쟁반 짧은 턱',x,.006,.014,.009,.260,.008,'walnut',.002)
    pot('담청색 다관',-.209,.031,.016,1.04,'celadon')
    for x in [-.071,.043]:
        V('자기 잔받침',x,-.034,.016,[(.038,0),(.048,.003),(.052,.006),(.050,.007),(.031,.005)],'porcelain',22)
        cup('차를 따른 작은 백자 잔',x,-.034,.023,.030,.041,'porcelain')
        V('잔 안의 녹차',x,-.034,.059,[(.025,0),(.025,.0011)],'tea',23)
    cup('말차 공기',.206,.001,.002,.067,.059,'blueware')
    V('갠 말차 표면',.206,.001,.054,[(.056,0),(.058,.002)],'matcha',27)
    for i in range(18):
        a=rng.uniform(0,tau);rad=.05*rng.random()**.5
        pebble('말차 표면의 잔 거품',.206+rad*cos(a),.001+rad*sin(a),.056,.0014,.0014,.0008,'wasabi',6)
    V('차선 대나무 손잡이',.325,.019,.005,[(.010,0),(.012,.002),(.014,.064),(.020,.072)],'bamboo',18)
    V('차선 목을 맨 검은 실',.325,.019,.073,[(.019,0),(.019,.006)],'blackwood',20)
    for i in range(28):
        a=tau*i/28
        R('차선의 휜 대나무 살',[(.325+.017*cos(a),.019+.017*sin(a),.077),
                              (.325+.026*cos(a),.019+.026*sin(a),.095),
                              (.325+.029*cos(a),.019+.029*sin(a),.118),
                              (.325+.021*cos(a),.019+.021*sin(a),.130)],.00095,'bamboo',5)
