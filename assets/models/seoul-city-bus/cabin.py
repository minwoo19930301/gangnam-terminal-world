"""Editable low-floor passenger cabin, viewed through the glazing from the public stop."""
from math import sin,cos,pi,tau
import blender_shop_mesh as m
from body import ring

B,R,P=m.block,m.rod,m.piece
seat_number=0

def seat(x,d,z,colour,backward=False):
    global seat_number
    original=set(m.group.objects)
    # Shell, soft centre and stainless supports keep their own materials.
    f=-1 if backward else 1
    B('좌석 다리 · 한쪽 지지대',x,d,z,.073,.093,.268,'steel',.012)
    B('플라스틱 좌판',x,d,z+.268,.417,.387,.072,'seat-base',.030)
    B('시트 중앙 방석',x,d+.010*f,z+.321,.360,.322,.040,colour,.017)
    back=d-.175*f
    levels=[(z+.292,.197,back),(z+.460,.196,back-.022*f),(z+.652,.205,back-.065*f),
            (z+.747,.168,back-.075*f)]
    vs=[]
    for h,w,y in levels:
        vs.extend([(x-w,y+.027*f,h),(x+w,y+.027*f,h),(x+w,y-.026*f,h),(x-w,y-.026*f,h)])
    faces=[(0,1,2,3),(12,13,14,15)]+[(k*4+i,k*4+(i+1)%4,(k+1)*4+(i+1)%4,(k+1)*4+i)
                                      for k in range(3)for i in range(4)]
    P('좌석의 등을 받치는 사출 셸',vs,faces,'seat-base',.008)
    patch=[(x+u,back+v*f,z+h)for u,v,h in [(-.172,.025,.364),(.172,.025,.364),
           (.178,-.028,.652),(.135,-.041,.699),(-.135,-.041,.699),(-.178,-.028,.652)]]
    P('사출 시트 등받이 색면',patch,[tuple(range(6))],colour)
    R('시트 뒤쪽 둥근 손잡이',[(x-.142,back-.073*f,z+.701),(x-.133,back-.077*f,z+.768),
           (x-.097,back-.083*f,z+.795),(x+.100,back-.083*f,z+.795),
           (x+.136,back-.077*f,z+.766),(x+.140,back-.073*f,z+.701)],.017,'seat-cap',8)
    for obj in set(m.group.objects)-original:
        obj['seat_number']=seat_number;obj['seat_position']=(x,d,z);obj['seat_yaw']=pi if backward else 0
        obj['seat_colour']=colour
    seat_number+=1

def grip(x,d,z):
    B('천장 손잡이 고정띠',x,d,z+.09,.028,.048,.150,'strap',.003)
    pts=[(x,d-.062,z+.091),(x,d+.060,z+.091),(x,d+.082,z+.061),(x,d+.061,z-.060),
         (x,d+.036,z-.084),(x,d-.037,z-.084),(x,d-.062,z-.059),(x,d-.081,z+.057),(x,d-.062,z+.091)]
    R('입석 손잡이 · 삼각 고리',pts,.015,'grip',8)

def build():
    for a,b,w in [(-3.60,-3.30,2.34),(-3.30,-2.10,1.38),(-2.10,2.10,2.34),(2.10,3.30,1.38),(3.30,5.16,2.34)]:
        B('낮은 객실 통로 · 미끄럼 방지 바닥',0,(a+b)/2,.347,w,b-a,.037,'floor',.006)
    B('뒤쪽 높아지는 바닥',0,-4.26,.722,2.33,2.15,.077,'floor',.014)
    for i in range(3):
        d=-3.26+i*.22
        B('뒷좌석으로 오르는 단',0,d,.347,.78,.221,.356-.109*i,'floor')
        B('계단 황색 코',0,d+.099,.692-i*.109,.78,.026,.022,'yellow')
    for x in [-.87,.87]:
        for d in [-2.70,2.70]:
            # The passenger-side wall is inboard of the tyre. Leave the outer
            # face open, so the wheel arch shows the rim all the way to its crown.
            side=1 if x>0 else -1
            line=[(d-.58,.366)]+[(d-.58*cos(pi*i/20),.479+.58*sin(pi*i/20)) for i in range(21)]+[(d+.58,.366)]
            vertices=[(side*a,y,h)for a in [.704,1.215]for y,h in line]
            n=len(line);faces=[tuple(range(n))]
            faces.extend((i,i+1,n+i+1,n+i)for i in range(n-1))
            P('회색 휠하우스 · 열린 외측 아치',vertices,faces,'wheel-cover')
            B('좌석 아래 받침',side*.84,d,1.062,.24,.32,.06,'wheel-cover',.012)
    # The standard layout provides 27 passenger seats and an open centre aisle.
    for x in [-.93,-.467,.467,.93]:
        for i,d in enumerate([-4.92,-4.22,-3.52,-2.76]):
            seat(x,d,.80 if i<3 else 1.062,'seat-grey' if i%2==0 else 'seat-teal')
    for x,d,shade,back in [(.93,-1.92,'seat-teal',False),(.48,-1.92,'seat-teal',False),
                (-.92,-1.85,'seat-grey',False),(-.47,-1.85,'seat-grey',False),
                (.91,-.94,'seat-yellow',False),(.91,-.23,'seat-yellow',False),
                (.91,.51,'seat-pink',False),(.91,1.24,'seat-grey',False),
                (-.91,1.37,'seat-yellow',False),(-.92,2.62,'seat-grey',True),(.92,2.62,'seat-grey',True)]:
        seat(x,d,1.059 if abs(d-2.62)<.02 else .383,shade,back)
    for s in [-1,1]:
        x=s*.502
        R('천장 장대 · 세로 방향',[(x,-4.88,2.367),(x,4.13,2.367)],.024,'steel',10)
        for d in [-4.6,-2.85,-1.45,.70,2.60,3.88]:
            R('세로 기둥 · 넓어지는 상부',[(x,d,.425),(x,d,2.18),(x+s*.13,d,2.36),(x+s*.15,d,2.64)],.024,'pole',10)
            for z in [.57,1.19,2.09]:B('손잡이 파란 연결구',x,d,z,.057,.060,.060,'blue-joint',.012)
        for d in [-3.98,-3.55,-2.18,-1.83,-.89,-.39,.08,1.31,1.75,3.07,3.49]:
            grip(x,d,2.11)
        for d in [-3.89,-1.85,.30,2.35,4.05]:
            B('객실 천장 엘이디 확산판',s*.64,d,2.649,.09,1.38,.020,'ceiling-lamp',.009)
        for d in [-3.12,-1.49,1.42,3.12]:
            B('하차벨 검은 받침',s*1.163,d,1.614,.054,.106,.155,'black',.018)
            B('적색 하차벨',s*1.128,d,1.632,.044,.070,.109,'brake',.020)
    B('휠체어 공간 · 등받이 보호대',-.992,-.18,.78,.133,.636,.294,'wheel-cover',.044)
    R('휠체어 구획의 노란 손잡이',[(-1.09,-.66,.54),(-1.09,-.66,1.08),(-1.09,-.55,1.15),
        (-1.09,.23,1.15),(-1.09,.31,1.08)],.027,'yellow',10)
    R('출입문 옆 승차 손잡이',[(-.91,3.64,.36),(-.91,3.64,1.17),(-.96,3.64,1.44),
          (-.96,3.64,2.40)],.027,'yellow',10)
    B('교통카드 단말기 거치대',-.85,3.77,1.20,.072,.112,.36,'steel',.017)
    B('승차용 교통카드 단말기',-.85,3.81,1.47,.196,.145,.273,'terminal',.030)
    B('단말기 액정',-.85,3.891,1.582,.149,.006,.093,'terminal-lit',.006)
    B('교통카드 인식 영역',-.85,3.890,1.488,.084,.007,.064,'yellow',.007)
    B('운전석 단',.721,4.21,.366,.87,1.69,.115,'floor',.014)
    seat(.71,4.19,.542,'driver')
    B('낮은 대시보드',.622,4.921,.757,.969,.474,.279,'underframe',.039)
    B('계기판 상단',.648,4.808,1.027,.594,.232,.146,'black',.026)
    wheel=[(.727+.190*cos(tau*i/24),4.67+.076*sin(tau*i/24),1.180+.124*sin(tau*i/24))for i in range(25)]
    R('운전대',wheel,.021,'black',8)
    for i in [0,8,16]:R('운전대 살',[(.727,4.67,1.18),wheel[i]],.020,'gasket',8)
    B('천장 · 승객 통로',0,.03,2.670,2.245,10.41,.047,'cabin-ceiling',.013)
