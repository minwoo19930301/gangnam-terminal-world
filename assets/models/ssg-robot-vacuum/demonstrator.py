"""Visible public Roborock counter details. Local -Y points toward the customer."""
from math import atan2,cos,pi,sin,sqrt
from mathutils import Vector
import surfaces

def showroom(z,x,y,helpers,mats):
    box,bar,mesh,rev=(helpers[k] for k in ('box','bar','mesh','revolved'))
    ivory,white,gray,dark,rubber,silver,atlas=(mats[k] for k in ('ivory','white','grey','dark','rubber','silver','atlas'))
    champagne=helpers['finish']('새틴 샴페인 전면','bdb7ab',.26,.61,'Optics')
    enamel=helpers['finish']('진회색 도크 입구','222128',.33,.10,'Optics')
    gold=helpers['finish']('황동 로고 테두리','a78e52',.34,.61,'Optics')
    soft=helpers['finish']('검은색 실리콘 가스켓','26272b',.67)
    def decal(name,p,right,up,key,w,h):
        return surfaces.decal(name,p,right,up,key,w,h,mesh,atlas)
    def ramp(cx,cy,low):
        # Sloped corners and fluting follow the dark injection-moulded mat in the photograph.
        base=[(-.154,-.231),(.154,-.231),(.203,-.179),(.203,.188),(.193,.197),(-.193,.197),(-.203,.188),(-.203,-.179)]
        pts=[(cx+a,cy+b,z+h) for h in (.001,.014) for a,b in base]
        faces=[tuple(range(7,-1,-1)),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)]
        mesh('팔각 도킹 램프 · 낮은형' if low else '팔각 도킹 램프 · 물통형',pts,faces,rubber)
        for side in [-1,1]:
            for i in range(12):
                off=.126+i*.0055
                front=-.228+max(0,off-.151)*1.15
                bar('램프 미끄럼방지 리브',(cx+side*off,cy+front,z+.015),(cx+side*off,cy+.048,z+.023),.00165,soft)
            box('본체 가이드 턱',(cx+side*.188,cy-.018,z+.036),(.022,.298,.044),dark,.009)
        for i in range(15):
            bar('세척판 배수구 빗살',(cx-.133+i*.019,cy+.038,z+.018),(cx-.133+i*.019,cy+.139,z+.019),.0021,enamel)
    def dock(cx,cy,tall):
        h=.470 if tall else .298
        ramp(cx,cy,not tall)
        for side in [-1,1]:
            box('세척 입구 일체형 측벽',(cx+side*.188,cy+.030,z+h*.50),(.035,.278,h-.007),ivory,.014)
            box('세척 입구 검정 가이드',(cx+side*.177,cy-.098,z+.082),(.026,.044,.106),enamel,.006)
        box('도크 물걸레 세척실',(cx,cy+.092,z+.12),(.382,.124,.221),enamel,.012)
        for side in [-1,1]:
            box('충전 접점',(cx+side*.083,cy+.026,z+.071),(.041,.008,.018),silver,.004)
        f=cy-.120
        lo=.140 if tall else .124
        hi=.301 if tall else h-.028
        box('흡입함·도크 외함',(cx,cy+.025,z+(h+.118)/2),(.407,.294,h-.118),ivory,.025)
        box('금속 전면 검정 둘레',(cx,f-.005,z+(lo+hi)/2),(.409,.033,hi-lo+.010),enamel,.014)
        box('도크 먼지함 사틴 덮개',(cx,f-.018,z+(lo+hi)/2),(.399,.026,hi-lo-.004),champagne,.012)
        # Pressed sheet metal bows outward toward the centre. The short radius at
        # the sides brings out the satin front even with diffuse showroom lighting.
        cols,rows=34,12
        verts=[]
        for iv in range(rows+1):
            v=iv/rows; vz=lo+.008+(hi-lo-.016)*v
            for iu in range(cols+1):
                u=iu/cols; bx=(u-.5)*.391
                by=f-.032-.0045*(1-(2*u-1)**4)-.006*(1-(2*v-1)**4)
                verts.append((cx+bx,by,z+vz))
        faces=[(j*(cols+1)+i,j*(cols+1)+i+1,(j+1)*(cols+1)+i+1,(j+1)*(cols+1)+i) for j in range(rows) for i in range(cols)]
        pressed=mesh('미세하게 굽힌 샴페인색 덮개',verts,faces,champagne)
        pressed["satinFront"]=True
        for face in pressed.data.polygons:face.use_smooth=True
        if tall:
            # Separate clean and waste tank lids. One folding handle is raised to the customer.
            for side in [-1,1]:
                ax=cx+side*.099
                box('탈착 물통 뚜껑 밑그림자',(ax,cy+.011,z+h-.012),(.191,.241,.014),gray,.007)
                box('탈착 물통 둥근 덮개',(ax,cy+.01,z+h-.004),(.190,.239,.016),white,.010)
                basey=cy-.014
                for sign in [-1,1]:
                    apex=(ax+sign*.073,basey+(.010 if side<0 else .075),z+h+(.107 if side<0 else .009))
                    pivot=(ax+sign*.073,basey,z+h+.004)
                    bar('접이식 손잡이 측선',pivot,apex,.0045,gray)
                    pin=rev('물통 손잡이 힌지 핀',pivot,[(-.004,.006),(.004,.006)],silver,20)
                    pin.rotation_euler.y=pi/2
                apy=basey+(.010 if side<0 else .075);apz=z+h+(.107 if side<0 else .009)
                bar('접이식 손잡이 잡이',(ax-.070,apy,apz),(ax+.070,apy,apz),.0065,white)
            for high in [.224,.395]:
                py=f-.045 if high<.30 else f-.0155
                box('공식 매장형 설명 카드 받침',(cx,py,z+high),(.343,.007,.112),white,.004)
                decal('매장형 붉은 제품 설명 카드',(cx,py-.0036,z+high),(1,0,0),(0,0,1),'dealer',.339,.109)
        else:
            # The lower dock carries one small round red sticker, with literature on top.
            badge=rev('원형 매대 시연 배지',(cx+.145,f-.0435,z+.235),[(0,.019),(.001,.019)],mats['red'],30)
            badge.rotation_euler.x=pi/2
            bx,by=cx-.072,cy+.024
            p0=(bx,by,z+h+.065)
            right=Vector((1,0,0));up=Vector((0,.36,.933))
            card=box('지점 제품 사양서 프레임',p0,(.168,.006,.122),white,.003)
            card.rotation_euler.x=-.368
            decal('시연용 제품 사양서',(bx,by-.0033,z+h+.066),right,up,'spec',.164,.117)
            box('사양서 접은 발',(bx,by+.033,z+h+.006),(.161,.055,.006),white,.002)
        return f
    dock(x,y,True)
    dock(-.59,.183,False)
    # The branch uses a long pill-shaped plaque with a round gold symbol, behind the docks.
    cx,cy,cz=-.82,.368,z+.409
    for side in [-1,1]:
        box('브랜드 푯말 받침',(cx+side*.129,cy,cz-.110),(.021,.042,.085),gold,.005)
    def pill(name,w,h,depth,col,oy):
        a=.5*(w-h);r=h/2
        pts=[(cx+(a if i<13 else -a)+r*cos(-pi/2+i*pi/12 if i<13 else pi/2+(i-13)*pi/12),
              cz+r*sin(-pi/2+i*pi/12 if i<13 else pi/2+(i-13)*pi/12)) for i in range(26)]
        vs=[(px,cy+oy+dep,pz) for dep in (depth/2,-depth/2) for px,pz in pts];n=len(pts)
        mesh(name,vs,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],col)
    pill('브랜드 배지 황동 테두리',.408,.118,.031,gold,0)
    pill('브랜드 배지 아이보리 표면',.400,.110,.005,ivory,-.017)
    coin=rev('황동 로고 원판',(cx-.138,cy-.021,cz),[(0,.032),(.003,.032)],gold,36)
    coin.rotation_euler.x=pi/2
    helpers['label']('Z',(cx-.138,cy-.025,cz-.012),.032,white)
    helpers['label']('roborock',(cx+.025,cy-.021,cz-.019),.056,gold)

def upper_details(x,y,z,helpers,mats):
    mesh,box,bar,r=(helpers[k] for k in ('mesh','box','bar','revolved'))
    atlas,gray,white,silver,dark=(mats[k] for k in ('atlas','grey','white','silver','dark'))
    def on_top(n,loc,key,w,h):
        return surfaces.decal(n,loc,(1,0,0),(0,1,0),key,w,h,mesh,atlas)
    # Embossed lid line wraps the sensor tower then follows the upper edge of the bumper.
    points=[(-.165,.002),(-.151,.003),(-.121,.007),(-.092,.011),(-.066,.010),(-.050,.008)]
    for side in (-1,1):
        for (a,b),(c,d) in zip(points,points[1:]):
            bar('상판 탈착 덮개 이음선',(x+side*a,y+b,z+.085),(x+side*c,y+d,z+.086),.0008,gray)
    on_top('청소·도크·지정 청소 버튼 픽토그램',(x,y-.091,z+.08715),'buttons',.069,.029)
    on_top('윗면 은회색 로고',(x,y+.109,z+.0862),'lidmark',.055,.020)
    # A green-rimmed dealer sticker is visible beside the tower on the demo unit.
    lime=helpers['finish']('매장 견본의 초록 배지','4DBC72',.41)
    badge=(x-.081,y+.047,z+.0868)
    r('매장 견본 원형 배지',badge,[(0,.017),(.0007,.017)],lime,32)
    r('초록 배지 가운데',(badge[0],badge[1],badge[2]+.00072),[(0,.0138),(.00035,.0138)],dark,32)
    top=(x,y+.021,z+.111)
    surf=r('라이다 금속 원판',top,[(0,.036),(.0008,.036)],silver,50)
    for a,b in [((-.008,.006),(.008,.006)),((.007,.005),(-.006,-.006)),((-.006,-.006),(.007,-.005))]:
        bar('레이저 센서탑 Z 표식',(top[0]+a[0],top[1]+a[1],top[2]+.0011),(top[0]+b[0],top[1]+b[1],top[2]+.0011),.0009,dark)
    for side in [-1,1]:
        box('범퍼 절개선',(x+side*.132,y-.109,z+.044),(.003,.008,.035),gray,.0012)

def underbody(helpers,mats):
    box,bar,mesh,r=(helpers[k] for k in ('box','bar','mesh','revolved'))
    ivory,white,gray,dark,rubber,silver,glass,red,atlas=(mats[k] for k in ('ivory','white','grey','dark','rubber','silver','glass','red','atlas'))
    def on_top(n,loc,key,w,h):
        return surfaces.decal(n,loc,(1,0,0),(0,1,0),key,w,h,mesh,atlas)
    # The crescent pad and a separate circular edge mop are distinct from the red brush flights.
    n=70
    points=[(-.145+i*.29/34,.035+.008*(1-(abs(-.145+i*.29/34)/.145)**2)) for i in range(35)]
    theta0=atan2(.035,.145)
    for i in range(1,n): 
        a=theta0+(pi-2*theta0)*i/n;points.append((.150*cos(a),.150*sin(a)))
    pts=[(px,py,h) for h in (.002,.010) for px,py in points];count=len(points)
    mesh('걸레판 고무 외곽',pts,[tuple(range(count-1,-1,-1)),tuple(range(count,2*count))]+[(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)],rubber)
    def matpad(name,points,z,uvscale):
        o=mesh(name,[(a,b,z) for a,b in points],[tuple(range(len(points)))],atlas)
        minx,miny=min(a for a,b in points),min(b for a,b in points)
        maxx,maxy=max(a for a,b in points),max(b for a,b in points)
        surfaces.unwrap(o,'cloth',[((a-minx)/(maxx-minx)*uvscale,(b-miny)/(maxy-miny)*uvscale) for a,b in points])
    matpad('진동 물걸레의 극세사 직조',[(a*.980,b*.979+.0013) for a,b in points],.011,1)
    for edge in (0,1):
        perimeter=[(a*(.970-edge*.018),b*(.968-edge*.018)+.002+edge*.0005,.0116) for a,b in points]
        for i in range(0,len(perimeter),2):
            bar('걸레 가장자리 봉제선',perimeter[i],perimeter[(i+1)%len(perimeter)],.00085,white if edge==0 else gray)
    ax,ay=.120,.060
    r('사이드 물걸레 모터',(ax,ay,.010),[(0,.025),(.004,.028),(.006,.026)],gray,32)
    circ=[(ax+.026*cos(i*2*pi/44),ay+.026*sin(i*2*pi/44)) for i in range(44)]
    matpad('독립 회전형 가장자리 패드',circ,.018,.42)
    # Rear steerable wheel, tread recesses, silver contact pads and service printing.
    r('전륜 회전 캐스터 하우징',(0,-.117,.0002),[(0,.023),(.004,.023),(.007,.020)],rubber,32)
    helpers['wheel']('분리형 캐스터 바퀴',(0,-.117,.013),.012,.019,gray)
    for sign in [-1,1]:
        box('광전자 낙하 감지 창',(sign*.066,-.132,.0021),(.040,.019,.008),glass,.004)
        box('충전 금속 플레이트',(sign*.064,-.099,.003),(.038,.019,.005),silver,.003)
        box('청소용 카세트 해제 탭',(sign*.103,-.039,.017),(.013,.036,.007),red,.003)
        for j in range(2):
            box('교체식 롤러 잠금 돌기',(sign*.103,-.048+j*.011,.021),(.012,.0016,.002),ivory,.0005)
        for j in range(5):
            yy=-.072+j*.013
            bar('구동축 보강 리브',(sign*.142,yy,.002),(sign*.153,yy+.005,-.002),.0015,gray)
    on_top('로보락 하판 모델 명판',(.052,-.066,.009),'underlabel',.044,.022)
    on_top('DuoRoller 분리 방향',(-.006,.019,.023),'roller',.082,.011)
    # A striped transparent window beside the pad and wheel is visible in product photography.
    for sign in [-1,1]:
        for i in range(4):
            bar('구동 바퀴 안쪽 가이드',(sign*.102,-.015+i*.011,.017),(sign*.106,-.010+i*.011,.021),.0011,gray)
