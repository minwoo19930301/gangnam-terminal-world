"""Tall green and golden floral arrangement behind the two necklaces in the June lobby photograph."""
from math import cos,sin,tau,pi
from random import Random
import blender_shop_mesh as m

def foyer_flowers(group):
    rng=Random(20260628);P,R=m.profile,m.rod
    group('vessel')
    P('검은 원형 테이블 신발',0,0,.005,[(.39,0),(.45,.015),(.438,.037),(.30,.058)],'shadow',64)
    P('둥근 탁자 중앙대',0,0,.062,[(.26,0),(.19,.04),(.145,.13),(.145,.62),(.22,.685),(.39,.699)],'stone',60)
    P('짙은 석재 테이블 판',0,0,.744,[(.606,0),(.647,.012),(.658,.031),(.646,.052),(.60,.059)],'shadow',80)
    P('검은 유약 화병',0,0,.804,[(.19,0),(.237,.016),(.238,.048),(.276,.08),(.321,.19),(.328,.28),(.303,.371),(.246,.442),(.190,.50),(.189,.523),(.177,.530),(.167,.522),(.169,.487)],'glaze',76)
    P('병 안쪽의 물',0,0,1.299,[(.160,0),(.166,.002)],'water',56)
    leafs=[];sprays=[]
    group('branches')
    for i in range(67):
        a=i*2.39996+rng.uniform(-.28,.28);radius=.22+.94*(i/66)**.56
        h=1.18+.82*(1-radius/1.20)+.36*rng.random()
        if i%9==0:h+=.45
        x,d=cos(a)*radius,sin(a)*radius
        points=[]
        for j in range(7):
            t=j/6;w=.09+.91*t**1.27
            points.append((w*x+.042*sin(3*t+i)*t,w*d+.037*cos(3*t+i)*t,1.22+t*h-.11*sin(pi*t)))
        R('물을 지나 뻗는 가지',points,.006+rng.random()*.006,'bark',7)
        for j in range(2,7):
            bx,bd,bh=points[j]
            for sign in [-1,1]:
                la=a+sign*(.42+rng.random()*.63);l=.11+rng.random()*.16
                xx=bx+l*cos(la);dd=bd+l*sin(la);yy=bh+rng.uniform(-.10,.13)
                R('갈라진 잔가지',[(bx,bd,bh),((bx+xx)/2,(bd+dd)/2,bh+.04),(xx,dd,yy)],.0021,'twig',5)
                for k in range(3):
                    t=(k+1)/3
                    leafs.append((bx+(xx-bx)*t,bd+(dd-bd)*t,bh+(yy-bh)*t,la+(-1)**k*.77,rng.uniform(.073,.159),rng.uniform(.017,.035)))
        if i%4==1 or i%11==0:sprays.append((x,d,1.22+h))
    group('leaves')
    for n,(x,d,z,a,l,w) in enumerate(leafs):
        vx,vd=cos(a),sin(a);rows=[(0,.025),(.23,.72),(.53,1),(.78,.65),(1,.008)]
        vertices=[]
        for j,(t,q) in enumerate(rows):
            for side in [-1,0,1]:
                vertices.append((x+vx*l*t-vd*side*w*q,d+vd*l*t+vx*side*w*q,z+.047*sin(pi*t)+.023*t-.037*t*t+.014*(1-abs(side))*q))
        faces=[(i*3+k,i*3+k+1,(i+1)*3+k+1,(i+1)*3+k) for i in range(4) for k in range(2)]
        m.piece('접힌 잎',vertices,faces,'green'+str(n%6))
    group('golden')
    for n,(x,d,z) in enumerate(sprays):
        for k in range(9):
            a=k*2.39996+n;r=.018+.100*(k/8)**.5
            xx=x+r*cos(a);dd=d+r*sin(a);zz=z+.012+.078*(1-k/9)
            R('작은 꽃받침과 줄기',[(x,d,z-.045),(xx,dd,zz-.012)],.0023,'twig',5)
            # Eight scooped petals folded around a darker disk.
            vertices=[];faces=[]
            for j in range(8):
                q=tau*j/8+n;v=len(vertices)
                for L,W,Z in [(.002,0,0),(.011,-.006,.002),(.022,-.004,.010),(.025,0,.013),(.021,.006,.011),(.009,.006,.003)]:
                    vertices.append((xx+L*cos(q)-W*sin(q),dd+L*sin(q)+W*cos(q),zz+Z))
                faces.extend([(v,v+1,v+2,v+3),(v,v+3,v+4,v+5)])
            m.piece('금빛 꽃잎',vertices,faces,'petal'+str((k+n)%4))
            P('황갈색 꽃의 중심',xx,dd,zz,[(.007,0),(.006,.005),(.003,.007)],'pollen',8)
