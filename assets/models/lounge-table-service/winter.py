"""Winter Bliss three-tier stand, plated sweets, scones, tea and the photographed evergreen posy."""
from math import pi,tau,sin,cos,sqrt
import random
import blender_shop_mesh as m
from pastry import rounded,disc,parfait,round_cake,raspberry,eclair,mousse,slider,taco,roe_tart
from porcelain import spun,saucer,tea_pot,teacup,plate_oblong,highball

TIERS=(.045,.192,.34)
def stand():
    w=.368;d=.218
    for x in [-w/2,w/2]:
        for zz in [-d/2,d/2]:
            m.block('황동 프레임의 얇은 수직 각봉',x,zz,.006,.0051,.0051,.465,'gold',.0008)
            m.block('바닥에 닿는 황동 발',x,zz,.002,.013,.012,.005,'darkGold',.001)
    for z in [.012,*[h-.004 for h in TIERS],.467]:
        for x in [-w/2,w/2]:m.block('랙의 짧은 가로대',x,0,z,.0049,d,.0043,'gold',.0007)
        for zz in [-d/2,d/2]:m.block('가는 금속 선',0,zz,z,w,.0049,.0043,'gold',.0007)
    for i,h in enumerate(TIERS):
        # Pale removable ceramic trays extend slightly beyond the four fine brass uprights.
        m.block('분리되는 아이보리색 직사각 트레이 '+str(i+1),0,0,h,.405,.254,.0063,'ivory',.0029)
        for x in [-.145,.145]:m.block('트레이 밑 황동 받침',x,0,h-.004,.004,.214,.005,'darkGold',.0008)

def plate_item(fn,x,d,z,scale=1.16):
    from mathutils import Matrix
    before=set(m.group.objects);fn(x,d,z)
    transform=Matrix.Translation((x,-d,z))@Matrix.Scale(scale,4)@Matrix.Translation((-x,d,-z))
    for ob in set(m.group.objects)-before:ob.matrix_world=transform@ob.matrix_world

def sweets():
    z=TIERS[2]+.0065
    for side in [-1,1]:
        plate_item(round_cake,side*.145,-.040,z);plate_item(parfait,side*.101,.039,z)
        plate_item(raspberry,side*.030,-.014,z,1.22)
    z=TIERS[1]+.0065
    for side in [-1,1]:
        plate_item(mousse,side*.153,-.047,z);plate_item(eclair,side*.119,.047,z)
        plate_item(slider,side*.037,-.005,z,1.21)
    z=TIERS[0]+.0065
    for side in [-1,1]:
        plate_item(taco,side*.145,-.03,z,1.20);plate_item(roe_tart,side*.04,-.035,z,1.23)
        # The savoury course also uses shallow white tasting dishes.
        saucer(side*.104,.059,z,.030,.005,'ivory');rounded('작은 흰 종지의 부드러운 가니시',side*.104,.059,z+.014,.014,.009,.007,'lobster',16,8)

def scones():
    # The low glass bowl holds two golden scones; the jars are closed, with different fillings visible.
    saucer(.004,0,0,.070,.009,'clearGlaze')
    spun('스콘 볼의 맑은 벽',.004,0,.008,[(.056,0),(.066,.007),(.071,.021),(.070,.024),(.068,.022),(.064,.009)],'glass',60)
    rng=random.Random(811)
    for cx,cd in [(-.026,-.002),(.025,.003)]:
        r=.026
        spun('톱니처럼 갈라진 스콘 빵 껍질',cx,cd,.016,[(.019,0),(.024,.004),(.026,.013),(.025,.024),(.020,.03),(.006,.032)],'scone',60,11)
        for k in range(51):
            a=rng.random()*tau;rr=.023*sqrt(rng.random());h=.046+.003*(1-rr/.026)
            rounded('스콘 위 밀가루와 갈색 크럼',cx+rr*cos(a),cd+rr*sin(a),h,rng.uniform(.0011,.0022),.0014,.001,
                    'crumb' if k%4 else 'sconeCrust',7,4)
    plate_oblong('미니 잼 병 흰 받침',-.174,-.004,.001,.145,.045,'ivory')
    for j in range(3):
        x=-.219+j*.045
        spun('미니 잼과 크림 병',x,-.004,.008,[(.012,0),(.015,.002),(.015,.021),(.012,.024),(.012,.028)],
             ['cream','marmalade','jam'][j],32)
        ring=[(.014,.028),(.016,.029),(.016,.034),(.014,.035),(.012,.035)]
        spun('색이 다른 미니 병 뚜껑',x,-.004,.008,ring,['mintTin','silver','gold'][j],28)
        m.block('작은 흰 종이 병 라벨',x,-.019,.016,.013,.0008,.009,'milk',.0006)

def flower():
    winter_blooms()
    spun('세로 골이 선 둥근 유리 화병',0,0,0,[(.018,.002),(.028,.006),(.036,.019),(.037,.031),(.030,.050),(.016,.059),(.014,.074),(.016,.080),(.014,.080),(.012,.072)],'clearGlaze',80,23)
    rng=random.Random(290)
    v=[];f=[]
    for k in range(8):
        theta=k*2.40;dx=cos(theta);dz=sin(theta);reach=.034+.011*(k%3);height=.12+.013*(k%4)
        m.rod('상록수 가지',[(0,0,.035),(dx*.010,dz*.010,.085),(dx*reach,dz*reach,height)],.0014,'twig',6)
        for i in range(52):
            t=i/52;xx=dx*reach*t;dd=dz*reach*t;zz=.081+(height-.081)*t;s=(-1 if i%2 else 1)
            length=.013*(1-.5*t)*rng.uniform(.6,1.1);vx=-dz*s;vd=dx*s
            base=len(v);v.extend([(xx-.0006*dx,dd-.0006*dz,zz),(xx+.0006*dx,dd+.0006*dz,zz),
                                   (xx+length*vx+.004*dx,dd+length*vd+.004*dz,zz+.009)])
            f.append((base,base+1,base+2))
    m.piece('상록수 바늘잎',v,f,'pine')
    for k in range(4):
        a=k*1.84+.69;s=sin(a);c=cos(a);h=.149+.017*k
        m.rod('가느다란 겨울 열매 줄기',[(0,0,.055),(.018*c,.014*s,.099),(.042*c,.039*s,h)],.0011,'twig',6)
        for j in range(8):
            t=(j+1)/9;x=c*.033+(j%3-1)*.007;d=s*.029+(j%2-.5)*.009;z=h*t+.083*(1-t)
            rounded('붉은 겨울 열매',x,d,z,.0044,.0044,.0048,'velvet',12,8)
    for k in range(2):
        cx=.024*cos(3*k);cd=.023*sin(3*k);cz=.099+.006*k
        for i in range(38):
            a=i*2.4;h=i/38;r=.011*sin(pi*(.10+h*.85))
            rounded('솔방울 비늘',cx+r*cos(a),cd+r*sin(a),cz+.030*h,.0052,.004,.0037,'coneScale' if i%3 else 'sconeCrust',9,5)

def winter_blooms():
    for x,d,z,k in [(.010,-.017,.141,0),(.030,-.005,.122,1)]:
        # A tight, many-petalled winter rose is the solid pink note among the needles in the hotel photograph.
        rng=random.Random(k+9817)
        for layer in range(4):
            count=7+3*layer
            for i in range(count):
                a=tau*i/count+layer*.59;radius=.0026+.0021*layer;width=.0033+.0012*layer
                h=.008+.0021*layer;pts=[];faces=[]
                for r in range(5):
                    t=r/4
                    for j in range(7):
                        s=j/3-1;w=width*s*(.30+.70*sin(pi*.77*t))
                        rr=radius+t*(.0010+.0032*layer)+.0018*s*s*t
                        pts.append((x+rr*cos(a)-w*sin(a),d+rr*sin(a)+w*cos(a),z+h*t-.0022*s*s*t*t))
                        if r and j:vi=r*7+j;faces.append((vi-8,vi-7,vi,vi-1))
                ob=m.piece('분홍 라넌큘러스의 겹꽃잎',pts,faces,'roseCream' if (layer+i)%4==0 else 'velvet')
                for f in ob.data.polygons:f.use_smooth=True
