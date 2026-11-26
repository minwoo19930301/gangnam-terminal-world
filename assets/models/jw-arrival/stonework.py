"""Limestone paving, bronze gallery fins, and the garment visible beside the bell desk."""
from math import sin,cos,pi,tau
from random import Random
import blender_shop_mesh as m

def make_stonework(group):
    B,R=m.block,m.rod;rng=Random(11583195)
    group('paving')
    # Each fitted bay repeats 4 by 6 pieces at the same joint pitch and retains continuous walking support.
    w,d=4.37,6.48
    B('석판 아래 얇은 줄눈',0,0,0,w,d,.006,'grout')
    for j in range(6):
        for k in range(4):
            x=(k-1.5)*w/4;v=(j-2.5)*d/6
            B('꿀빛 석회석 판',x,v,.006,w/4-.0065,d/6-.0065,.008,'floor'+str((k*2+j*7)%5),.0014)
            for stripe in range(4):
                xx=x+rng.uniform(-.31,.30);dd=v+rng.uniform(-.32,.32)
                points=[(xx+n*.016,dd+.004*cos(n*.7+j)+n*.011,.0142) for n in range(8)]
                R('천연 석회석 결',points,.0008+rng.random()*.0006,'vein',4)
    group('fins')
    B('후면 짙은 목재',0,.083,0,1.69,.066,1.56,'recess',.002)
    B('띠조명의 작은 틈',0,.015,.065,1.69,.074,.058,'warm')
    for i in range(13):
        x=(i-6)*.128
        B('무늬목 핀',x,-.003,.104,.040,.126,1.441,'walnut',.0017)
        B('브론즈 날의 빛받는 선',x,-.067,.105,.039,.005,1.438,'brushed',.0007)
    for h in [0,1.527]:B('수평 멀리언',0,-.016,h,1.69,.147,.034,'rail',.002)
    group('columnShoe')
    m.profile('원주 아래 화강암 굽',0,0,0,[(.568,0),(.657,.007),(.673,.022),(.671,.082),(.649,.108),(.599,.157),(.584,.168)],'rail',76)
    m.profile('목재와 석재 사이의 얇은 띠',0,0,.162,[(.577,0),(.589,.004),(.588,.014)],'shadow',72)
    group('column')
    m.profile('짙은 원주 속면',0,0,0,[(.562,0),(.562,10.955)],'recess',80)
    for j in range(8):
        lo=tau*j/8+.0009;hi=tau*(j+1)/8-.0009;n=9
        for h0,h1 in [(0,2.68),(2.689,5.29),(5.299,8.02),(8.029,10.951)]:
            verts=[(.572*cos(lo+(hi-lo)*k/n),.572*sin(lo+(hi-lo)*k/n),h) for h in [h0,h1] for k in range(n+1)]
            faces=[(k,k+1,n+2+k,n+1+k) for k in range(n)]
            o=m.piece('둥글게 가공한 월넛 무늬목',verts,faces,'veneer'+str((j+int(h1))%4))
            for f in o.data.polygons:f.use_smooth=True
    group('coats')
    # Two draped dark garments hang behind the chrome porter cart in the August visitor photograph.
    for j,(zz,mat) in enumerate([(-.03,'charcloth'),(.18,'bluecloth')]):
        n=28;rings=[(.105,.025,1.0),(.226,.05,.94),(.246,.081,.79),(.185,.102,.63),(.184,.103,.36),(.207,.114,.018)]
        vs=[];faces=[]
        for ri,(ww,dd,h) in enumerate(rings):
            for i in range(n):
                a=i*tau/n;fold=1+.115*sin(6*a+.29*j)+.066*sin(10*a+.21*ri)
                vs.append(((j-.6)*.086+ww*fold*cos(a),zz+dd*fold*sin(a),h+.012*sin(5*a+j)*max(0,1-h)))
        for i in range(n):
            for k in range(len(rings)-1):faces.append((k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i))
        o=m.piece('늘어진 모직 코트',vs,faces,mat)
        for f in o.data.polygons:f.use_smooth=True
        x=(j-.6)*.086
        for s in [-1,1]:
            R('라펠 접힘',[(x+s*.052,zz-.036,.97),(x+s*.107,zz-.062,.899),(x+s*.064,zz-.094,.768),(x,zz-.101,.655)],.007,'handle',7)
            R('겹쳐진 소매',[(x+s*.167,zz,.893),(x+s*.192,zz-.047,.715),(x+s*.210,zz-.078,.441)],.044,mat,12)
        for h in [.60,.48]:
            R('코트 단추',[(x+.018,zz-.099,h),(x+.018,zz-.109,h)],.009,'button',8)
