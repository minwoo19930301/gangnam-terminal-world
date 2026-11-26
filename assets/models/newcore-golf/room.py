"""Public retail fixtures, the tiled sales floor, lower sweater stacks and fitting-room curtain."""
import math
from math import cos,sin,tau,pi
import blender_shop_mesh as m
from typography import word
from sweater import panel,lathe_panel,uv_rib

def envelope():
    w=5.70;depth=8.70
    # The grout and beveled rectified porcelain remain individual editable parts in Blender.
    m.block('바닥 줄눈 아래 받침',0,0,.001,w,depth,.011,'grout')
    for ix in range(7):
        for iz in range(11):
            tw=w/7;th=depth/11
            m.block('얇은 회색 포세린 바닥 타일',(ix-3)*tw,(iz-5)*th,.012,tw-.004,th-.004,.007,
                    ['tileWarm','tileCool','tilePlain'][(ix*3+iz+ix*iz)%3],.0007)
    for side in [-1,1]:
        m.block('매장 측면 회백색 도장',side*(w/2-.026),0,0,.052,depth,3.45,'paint',.002)
        m.block('측벽 하단의 가느다란 걸레받이',side*(w/2-.058),0,.028,.017,depth-.03,.074,'trim',.002)
    m.block('매장 안쪽 후벽',0,depth/2-.032,.009,w,.064,3.44,'paint',.003)
    m.block('후벽 하단 걸레받이',0,depth/2-.072,.028,w-.14,.019,.074,'trim',.002)
    for side in [-1,1]:
        m.block('상부의 먹색 조명 레일',side*1.68,-.07,3.35,.049,depth-.55,.049,'ink',.008)
        for d in [-3.63,-2.41,-.61,.83,2.47,3.79]:
            base=(side*1.68,d,3.36);end=(side*(1.68-.087),d+.066,3.14)
            m.rod('트랙등 관절',[(base[0],base[1],base[2]),(base[0],base[1],3.24)],.018,'steel',9)
            m.rod('트랙등의 비스듬한 하우징',[(base[0],base[1],3.26),end],.053,'ink',28)
            m.rod('트랙등 원형 확산 유리',[end,(end[0]-.003*side,end[1]+.003,end[2]-.006)],.045,'warmLight',28)

def size_shelf():
    m.block('두 단 수납장의 후판',0,.18,.052,3.63,.065,1.73,'stoneB',.020)
    m.block('받침 혼합 합판',0,-.014,.073,3.65,.47,.075,'oak',.007)
    for i in range(4):
        x=(i-1.5)*.89
        m.block('수납장 바닥 서랍',x,-.018,.152,.861,.43,.37,'stoneA',.010)
        m.block('서랍 속으로 들어간 손잡이',x,-.236,.423,.13,.005,.017,'ink',.002)
    for h in [.57,1.15,1.73]:
        m.block('접은 니트를 받치는 선반',0,-.022,h,3.65,.46,.033,'oak',.005)
        for x in [-1.66,-.55,.55,1.66]:
            m.rod('선반 아래 사선 받침 철물',[(x,.114,h-.13),(x,-.14,h-.013)],.008,'steel',8)
    word('GOLF APPAREL','선반 상호',0,.140,1.55,.088,'ink')

def folding_bench():
    m.block('피팅실 앞 낮은 현무암색 받침',0,.15,.014,2.0,.74,.084,'stoneA',.027)
    for x in [-.69,.69]:
        m.block('벤치 참나무 다리',x,-.10,.087,.095,.40,.31,'oak',.017)
    m.block('둥근 코너의 벤치 좌판',0,-.10,.392,1.72,.44,.085,'blackKnit',.037)
    for k in range(11):
        x=-.77+k*.154
        m.rod('좌판의 가는 가로상침',[(x,-.28,.467),(x,-.1,.479),(x,.077,.467)],.0018,'nylonSeam',5)
    m.rod('커튼 상단 레일',[(-1.0,.283,2.55),(1.0,.283,2.55)],.016,'steel',14)
    # Translucency is unnecessary for this opaque woven fitting curtain.
    n=163;rows=[];faces=[]
    for i in range(16):
        h=i/15
        for j in range(n):
            t=j/(n-1);x=(t-.5)*1.89
            d=.241+.052*cos(t*tau*12+.3*(1-h)*sin(t*8))+.007*sin(t*tau*24+h*.18)
            z=.103+h*2.36+.008*sin(t*tau*12)*(1-h)
            rows.append((x,d,z))
            if i and j:
                a=i*n+j;faces.append((a-n-1,a-n,a,a-1))
    curtain=m.piece('접힌 골이 보이는 회색 직물 커튼',rows,faces,'curtain')
    for f in curtain.data.polygons:f.use_smooth=True
    for j in range(13):
        x=-.945+j*1.89/12
        loop=[(x,.281+.023*cos(tau*i/14),2.511+.043*sin(tau*i/14)) for i in range(15)]
        m.rod('상단 커튼 금속 링',loop,.003,'steel',7)

def fold(key):
    # A stack of three jumpers. UVs follow the printed faces around each folded edge.
    for j in range(3):
        cx=[.006,-.009,.004][j];cd=[.004,-.003,.0][j];z0=.014+j*.060;w=.306-j*.004;l=.30-j*.005
        around=[];uv=[]
        for row,(z,sx,sd) in enumerate([(0,.92,.93),(.006,.985,.98),(.021,1,1),(.043,1,1),(.057,.98,.986),(.062,.935,.93)]):
            edge=[]
            for i in range(57):
                a=tau*i/56;c=cos(a);s=sin(a)
                x=w*.5*math.copysign(abs(c)**.26,c)*sx;d=l*.5*math.copysign(abs(s)**.26,s)*sd
                edge.append((x+cx,d+cd,z0+z+.0019*sin(3*a+j)))
                uv.append((.17+.26*x/w,.52+.13*(d/l)+.18*(z/.062)))
            around.extend(edge)
        faces=[(r*57+i,r*57+i+1,(r+1)*57+i+1,(r+1)*57+i) for r in range(5) for i in range(56)]
        panel('아래로 접힌 니트 몸판 '+str(j+1),around,faces,'jacquard'+key,uv)
        pts=[(cx,cd,z0+.067)]+around[-57:]
        tuv=[(.365+.365*(x-cx)/w,.55+.40*(d-cd)/l) for x,d,z in pts]
        panel('살짝 부푼 접은 옷 윗면',pts,[(0,i+1,i+2) for i in range(56)],'jacquard'+key,tuv)
        # One cuff wraps over the top, the three yarn stripes remain visible at its edge.
        for k in range(7):
            stripe=k in [1,3,5];xa=cx+.023+k*.012
            points=[(xa,cd-.118,z0+.066),(xa+.012,cd-.118,z0+.066),(xa+.008,cd-.043,z0+.071),(xa-.004,cd-.043,z0+.071)]
            panel('접힌 소맷단 상침',points,[(0,1,2,3)],('stripe' if stripe else 'rib')+key,
                [uv_rib(t*tau,z0,stripe) for t in [.12,.28,.28,.12]])
