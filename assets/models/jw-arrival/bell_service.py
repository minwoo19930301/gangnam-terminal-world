"""Brass hotel bell cart, four swivel wheel forks, removable luggage and garment hangers."""
from math import sin,cos,pi,tau
import blender_shop_mesh as m

def build_bell(group,toptext):
    B,R,P=m.block,m.rod,m.profile
    def rim(name,x,d,z,w,l,rad,pipe,mat):
        pts=[]
        for j,(sx,sd) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for k in range(7):
                a=(j+k/6)*pi/2
                pts.append((x+sx*(w/2-rad)+rad*cos(a),d+sd*(l/2-rad)+rad*sin(a),z))
        R(name,pts+[pts[0]],pipe,mat,9)
    def wheel(name,x,d,z,rad,width,col):
        # Tyre and bright pressed-metal hub are coaxial along the axle.
        n=22;rings=[(-width/2,.86),(-width*.35,1),(width*.35,1),(width/2,.86)]
        verts=[(x+a,d+rad*r*cos(k*tau/n),z+rad*r*sin(k*tau/n)) for a,r in rings for k in range(n)]
        faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(3) for j in range(n)]
        faces.extend([tuple(reversed(range(n))),tuple(range(3*n,4*n))]);return m.piece(name,verts,faces,col)
    group('trolley')
    B('중앙 플랫폼',0,0,.175,.83,1.03,.062,'brushed',.034)
    B('음각 카펫 받침',0,0,.228,.794,.996,.025,'carpet',.019)
    for j in range(31):
        d=(j-15)*.029;R('카펫의 짧은 가로 리브',[(-.366,d,.254),(.366,d,.254)],.0017,'leather',4)
    rim('고무 충격 방지 테두리',0,0,.184,.856,1.072,.083,.022,'rubber')
    rim('옆면 황동 파이프',0,0,.222,.842,1.051,.079,.016,'brass')
    for x in [-.315,.315]:
        for d in [-.416,.416]:
            P('회전 축 베어링',x,d,.139,[(.035,0),(.04,.007),(.04,.022),(.027,.032)],'brushed',18)
            wheel('고무 캐스터',x,d+.020,.073,.071,.048,'rubber')
            for s in [-1,1]:
                wheel('바퀴 축 허브',x+s*.027,d+.020,.073,.034,.009,'brass')
                B('캐스터 포크',x+s*.035,d+.017,.07,.014,.058,.078,'brushed',.006)
                wheel('육각 축 머리',x+s*.044,d+.020,.073,.012,.006,'shiny')
    # Arched hoops in front and rear join the longitudinal garment rail.
    for d in [-.424,.424]:
        for x in [-.352,.352]:
            P('관 고정 플랜지',x,d,.249,[(.037,0),(.038,.013),(.024,.024)],'shiny',22)
            R('황동 지주',[(x,d,.264),(x,d,1.473)],.022,'brass',12)
            for h in [.281,1.422]:P('연결 칼라',x,d,h,[(.026,0),(.028,.008),(.025,.018)],'shiny',18)
        R('굽힌 황동 지붕관',[(.352*cos(j*pi/28),d,1.47+.32*sin(j*pi/28)) for j in range(29)],.023,'brass',12)
    R('상부 가로 봉',[(0,-.435,1.79),(0,.435,1.79)],.02,'shiny',12)
    for d in [-.432,.432]:
        P('둥근 피니얼',0,d,1.795,[(.023,0),(.028,.01),(.025,.025),(.006,.039)],'shiny',20)
    for x in [-.354,.354]:
        R('밀대 손잡이',[(x,-.415,.94),(x,-.367,.96),(x,.367,.96),(x,.415,.94)],.017,'brass',10)
    group('bags')
    for j,(x,d,w,l,h,mat) in enumerate([(-.188,.017,.338,.58,.691,'bag1'),(.172,.065,.304,.53,.542,'bag2')]):
        B('모서리를 둥글린 캐리어',x,d,.026,w,l,h,mat,.039)
        for s in [-1,1]:
            for k in range(7):
                dd=d+(k-3)*l/9
                R('프레스한 케이스 골',[(x+s*(w/2-.015),dd,.081),(x+s*(w/2+.001),dd,.101),(x+s*(w/2+.001),dd,h-.055),(x+s*(w/2-.015),dd,h-.035)],.006,'fabric' if j==0 else 'leather',7)
            for dd in [-.19,.19]:
                wheel('가방 이중 바퀴',x+s*(w*.39),d+dd,.029,.026,.022,'rubber')
        rim('둘레 맞물림',x,d,h*.48,w+.004,l+.003,.036,.0065,'handle')
        rim('지퍼 두 줄',x,d,h*.48+.009,w+.003,l+.004,.036,.0023,'brushed')
        for off in [-.038,.038]:
            R('접히는 운반 손잡이',[(x+off,d-.075,h+.022),(x+off,d-.058,h+.049),(x+off,d+.060,h+.049),(x+off,d+.077,h+.022)],.009,'handle',8)
        for k in range(2):
            R('지퍼 손잡이',[(x+w/2,d-.17+k*.032,h*.48+.007),(x+w/2+.008,d-.188+k*.032,h*.48-.02)],.0034,'shiny',6)
        B('가죽 이름표',x,d-.158,h+.027,.052,.084,.007,'leather',.005)
        B('이름표 창',x,d-.158,h+.035,.039,.057,.0018,'cream')
        R('이름표 고리',[(x,d-.112,h+.03),(x+.009,d-.094,h+.038),(x,d-.071,h+.044)],.0026,'leather',6)
    group('handles')
    for j,d in enumerate([-.19,.02,.18]):
        R('크롬 걸이',[(.052*cos(a*pi/15),d,.296+.055*sin(a*pi/15)) for a in range(-5,26)]+[(0,d,.213)],.006,'shiny',9)
        R('옷걸이 어깨',[(0,d,.218),(-.045,d,.203),(-.219,d,.124),(-.244,d,.102),(-.234,d,.09),(.229,d,.089),(.243,d,.102),(.216,d,.125),(.045,d,.203),(0,d,.218)],.014,'walnut' if j%2 else 'leather',10)
        R('바지걸이 봉',[(-.209,d,.095),(.209,d,.095)],.007,'brass',9)
