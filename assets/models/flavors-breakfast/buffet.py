"""Open bamboo steamers, tilted porcelain salad bowls, slicer and the photographed juice arrangement."""
from math import sin,cos,tau,pi
from kitchen import B,P,R,rng,sphere,ring,platter,card
import blender_shop_mesh as m

def buffet(group):
    group('rail')
    B('긴 음료 트레이의 접힌 틀',0,0,.001,3.62,.86,.032,'brass',.008)
    B('깊은 흑색 배수판',0,0,.025,3.59,.834,.013,'black',.005)
    for j in range(102):
        x=(j-50.5)*.0348
        R('배수 트레이의 세로 홈',[(x,-.410,.038),(x,.410,.038)],.0028,'iron',5)
    flavors=[('망고','MANGO','mango'),('오렌지','ORANGE','orange'),('케일','KALE','kale'),('자몽','GRAPEFRUIT','grapefruit'),('용과','PITAYA','pitaya')]
    def positions():
        for i in range(10):
            ix=i%5;row=i//5;x=(ix-2)*.604+.11*(row-.5);d=(row-.5)*.251
            yield i,x,d,flavors[(ix+row)%5],.91+(i*7%4)*.036
    group('juice')
    for i,x,d,(kr,en,mat),scale in positions():
        # A rectangular wooden coaster under each curving glass carafe.
        B('각진 원목 받침',x,d,0,.191,.190,.018,'grain',.004)
        P('주스가 차오른 카라페',x,d,.026,[(.057,0),(.066,.010),(.067,.052),(.062,.089),(.049,.144),(.041,.191),(.042,.246*scale),(.038,.248*scale)],mat,34)
        ring('수면의 메니스커스',x,d,.026+.248*scale,.039,.0015,mat,27)
    group('glass')
    for i,x,d,(kr,en,mat),scale in positions():
        # Shell has a true inner lip and stable foot; its renderer sorts back and front faces for colored contents.
        P('얇게 불어 만든 유리병',x,d,.021,[(.056,0),(.067,.006),(.071,.022),(.072,.053),(.067,.094),(.053,.151),(.045,.197),(.044,.251),(.051,.309),(.061,.354*scale),(.060,.361*scale),(.056,.360*scale),(.052,.344*scale),(.041,.251),(.042,.197),(.050,.152),(.064,.094),(.068,.052),(.066,.020),(.057,.012)],'glass',44)
        ring('둥글게 말린 주둥이',x,d,.021+.359*scale,.058,.0024,'glass',36)
    group('cards')
    for i,x,d,(kr,en,mat),scale in positions():
        if i>=5:continue
        card(x,.117,.004,.171,.087,en,kr)
    group('cups')
    for j in range(12):
        x=(j%4-1.5)*.157;d=(j//4-1)*.140
        P('뒤집어 쌓은 텀블러',x,d,.008,[(.044,0),(.045,.002),(.040,.099),(.034,.113),(.031,.114),(.030,.111),(.039,.011)],'tumbler',25)
        ring('두꺼운 유리 바닥',x,d,.115,.031,.0024,'glass',22)
    for x in [-.459,.462]:
        B('낮은 나무 냅킨 통',x,.002,0,.217,.234,.061,'grain',.004)
        for j in range(9):B('접은 냅킨',x+(j%2)*.003,.002,.063+j*.002,.183,.195,.002,'paper')
    group('steamers')
    centers=[(-.52,-.11),(-.03,.12),(.49,-.08)]
    for i,(x,d) in enumerate(centers):
        r=.227 if i==0 else .204
        for stack in range(2 if i!=1 else 3):
            z=stack*.084
            P('대나무로 휜 찜기 몸통',x,d,z,[(r-.014,0),(r-.005,.005),(r,.017),(r,.077),(r-.005,.084),(r-.016,.086),(r-.020,.020)],'bamboo',46)
            for h in [.012,.074]:ring('테를 묶은 대나무 띠',x,d,z+h,r+.001,.0039,'straw',45)
            for k in range(21):
                a=tau*k/21;R('바깥으로 드러난 이음',[(x+(r+.001)*cos(a),d+(r+.001)*sin(a),z+.018),(x+(r+.001)*cos(a+.05),d+(r+.001)*sin(a+.05),z+.067)],.0016,'darkbamboo',5)
        z=(2 if i!=1 else 3)*.084-.046
        for j in range(-9,10):
            dd=j*.020;xx=max(0,(r-.024)**2-dd*dd)**.5
            R('찜기 바닥 대나무살',[(x-xx,d+dd,z),(x+xx,d+dd,z)],.0052,'straw',6)
    group('dimsum')
    for i,(x,d) in enumerate(centers):
        total=14 if i==1 else 10
        for j in range(total):
            a=j*2.39996+.25*i;r=.144*(j/(total-1))**.54
            xx=x+cos(a)*r;dd=d+sin(a)*r;zz=.015 if i!=1 else .098
            rad=(.041 if i!=1 else .044)*(1+.12*sin(j*7.7))
            n=32;loft=[(.55,0),(.88,.004),(1,.019),(.96,.033),(.72,.046),(.38,.056),(.20,.053),(.08,.050)]
            verts=[];faces=[]
            for k,(scale,h) in enumerate(loft):
                for l in range(n):
                    angle=tau*l/n
                    squash=1+.085*(k/7)*cos(9*angle+j)+.045*cos(3*angle+j*.83)
                    verts.append((xx+rad*scale*squash*cos(angle),dd+rad*scale*squash*sin(angle)*(.86 if i==0 else .98),zz+h+.002*sin(6*angle)*k/7))
            for k in range(len(loft)-1):faces.extend([(k*n+l,k*n+(l+1)%n,(k+1)*n+(l+1)%n,(k+1)*n+l) for l in range(n)])
            o=m.piece('둥글게 부푼 만두피',verts,faces,'lightbud' if i==1 else 'bun' if i==0 else 'dumpling')
            for f in o.data.polygons:f.use_smooth=True
            for k in range(11 if i==1 else 8):
                ang=k*tau/(11 if i==1 else 8)+j*.14
                R('빚으며 살짝 꼬인 피의 주름',[(xx+rad*.89*cos(ang),dd+rad*.83*sin(ang),zz+.023),(xx+rad*.67*cos(ang+.25),dd+rad*.64*sin(ang+.25),zz+.043),(xx+rad*.21*cos(ang+.38),dd+rad*.20*sin(ang+.38),zz+.054)],.00145,'cream',5)
    group('bowls')
    for i in range(8):
        x=(i%4-1.5)*.58;d=(i//4-.5)*.412
        # Each dish rests on a slatted timber riser, with the back lip higher than the front.
        for k in range(4):B('작은 목재 살',x+(k-1.5)*.091,d,0,.029,.340,.033,'oak',.002)
        r=.210;n=44;vs=[];fs=[];profile=[(.39,0),(.54,.01),(.76,.055),(.965,.122),(1,.148),(.978,.155),(.91,.13),(.72,.072),(.42,.029),(.05,.024)]
        for rr,h in profile:
            for j in range(n):
                a=tau*j/n;dd=r*rr*sin(a)*.87;vs.append((x+r*rr*cos(a),d+dd,.045+h-dd*.27))
        for k in range(len(profile)-1):fs.extend([(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j) for j in range(n)])
        o=m.piece('앞으로 기운 백자 볼',vs,fs,'white');[setattr(p,'use_smooth',True) for p in o.data.polygons]
    group('salad')
    for i in range(8):
        x=(i%4-1.5)*.58;d=(i//4-.5)*.412
        count=124 if i in [1,2] else 60
        for k in range(count):
            a=k*2.39996+i;rr=.137*(k/count)**.57
            xx=x+rr*cos(a);dd=d+rr*sin(a)*.78;z=.090+.042*(1-rr/.14)-rr*sin(a)*.20
            if i==1:sphere('빛을 받는 검은 곡물',xx,dd,z,.0095,.007,.006,'bean' if k%4 else 'purple',10,5)
            elif i==2:sphere('작은 분홍색 알 고명',xx,dd,z,.008,.008,.0062,'roe' if k%3 else 'roe2',9,5)
            elif i in [3,6]:
                a+=.3;vx,vd=cos(a),sin(a);q=.014
                verts=[(xx-vx*q,dd-vd*q,z),(xx+vd*.014,dd-vx*.014,z+.009),(xx+vx*.032,dd+vd*.032,z+.016),(xx-vd*.012,dd+vx*.012,z+.014),(xx,dd,z+.017)]
                m.piece('접힌 잎채소',verts,[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],'seaweed' if i==3 else 'green' if k%2 else 'kale')
            elif i in [0,5]:
                pts=[(xx-.019,dd,z),(xx-.008,dd+.012,z+.013),(xx+.009,dd+.005,z+.004),(xx+.025,dd-.008,z+.014)]
                R('고춧가루가 묻은 김치의 접힌 결',pts,.006 if i==5 else .004,['pepper','kimchi','tomato'][k%3],6)
            else:R('가늘게 손질한 채소',[(xx-.019,dd,z),(xx,dd+.005,z+.008),(xx+.024,dd-.002,z+.011)],.004 if i==4 else .005,'carrot' if i==4 else 'green',6)
    group('servers')
    for i in range(8):
        x=(i%4-1.5)*.58;d=(i//4-.5)*.412
        R('길게 뻗은 서빙 손잡이',[(x+.038,d+.045,.082),(x+.08,d+.103,.109),(x+.14,d+.18,.175),(x+.16,d+.19,.198)],.0064,'chrome',9)
        sphere('서빙 스푼의 볼',x+.027,d+.027,.088,.030,.041,.008,'steel',20,6)
    group('slicer')
    B('주철 슬라이서 바닥',0,0,0,.70,.48,.061,'red',.031)
    for x in [-.255,.252]:
        for d in [-.165,.165]:P('미끄럼 방지발',x,d,0,[(.029,0),(.034,.029)],'rubber',16)
    B('곡선의 기기 몸체',-.10,0,.056,.34,.335,.253,'red',.050)
    B('미끄러지는 식재 트레이',.19,-.045,.26,.376,.346,.026,'steel',.011)
    for x in [.07,.276]:R('길이 조절 가이드',[(x,-.208,.270),(x,.137,.270)],.011,'chrome',12)
    for name,x,d,z,r,mat in [('회전하는 원형칼',-.027,-.103,.392,.208,'steel'),('안쪽의 붉은 덮개',-.03,-.130,.396,.177,'red'),('외부 조절 휠',-.20,.198,.245,.145,'red')]:
        pts=[(x+r*cos(k*tau/45),d,z+r*sin(k*tau/45)) for k in range(46)];R(name,pts,.012 if '휠' in name else .006,mat,9)
        if '휠' not in name:m.piece(name+' 원판',pts[:-1]+[(x,d,z)],[(k,(k+1)%45,45) for k in range(45)],mat)
        else:
            for j in range(6):R('휠 스포크',[(x,d,z),pts[j*7]],.007,'red')
    P('슬라이서의 다이얼 받침',.24,.02,.293,[(.029,0),(.031,.024)],'steelDark',22)
    for h in [.31,.37,.46]:
        B('캐리지의 기울어진 누름판',.172,-.026,h,.152,.144,.018,'chrome',.005)
    R('압착 레버와 검은 손잡이',[(.225,-.058,.296),(.229,-.060,.51),(.195,-.060,.56),(.111,-.060,.58)],.012,'chrome',10)
    R('압착 레버 그립',[(.152,-.060,.57),(.074,-.060,.582)],.021,'rubber',12)
    for k in range(11):
        xx=-.237+k*.025
        B('빨간 모터 주물의 냉각 리브',xx,.162,.094,.008,.016,.134,'red',.003)
    for k in range(28):
        a=k*tau/28
        R('칼날의 가공 흔적',[(-.027+.199*cos(a),-.108,.393+.199*sin(a)),(-.027+.207*cos(a+.011),-.108,.393+.207*sin(a+.011))],.0013,'steelDark',5)
    group('ham')
    for i,x in enumerate([-.265,.258]):
        platter('차가운 시식 접시',x,0,.005,.242,'white',1.34)
        for k in range(12):
            d=(k-5.5)*.030
            if i:
                B('얇은 치즈',x+(.014 if k%2 else 0),d,.030+k*.0007,.218,.095,.005,'cheese',.002)
            else:
                sphere('얇게 자른 햄',x+.012*sin(k),d,.034+k*.0008,.10,.060,.006,'ham',24,6)
                R('절단면의 얇은 흰 지방결',[(x-.07+n*.014,d+.007*sin(n*.52+k),.0394+k*.0008) for n in range(9)],.0015,'fat',5)
