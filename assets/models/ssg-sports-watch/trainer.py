"""Tacx NEO Bike Smart showroom model, in metres, with the fan end toward -X."""
from math import pi,sin,cos
from mathutils import Vector

TAU=2*pi


def make(part,skins,plate,rod,mark):
    def prism(name,profile,width,shade,bevel=.004,offset=0):
        # Side profiles define both walls of the bent monocoque.
        pts=[(x,offset+s*width/2,h) for s in [-1,1] for x,h in profile]
        n=len(profile);fs=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
        fs.extend((j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n))
        return part(name,pts,fs,shade,bevel)
    def tube(name,coords,radius,colour,n=10,closed=False):
        coords=[Vector(v) for v in coords]
        rows=[]
        for i,p in enumerate(coords):
            lo,hi=max(i-1,0),min(i+1,len(coords)-1)
            if closed:lo,hi=(i-1)%len(coords),(i+1)%len(coords)
            axis=(coords[hi]-coords[lo]).normalized()
            u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.85 else Vector((1,0,0))).normalized()
            v=axis.cross(u);rows.append([p+radius*(u*cos(TAU*j/n)+v*sin(TAU*j/n)) for j in range(n)])
        if closed:rows.append(rows[0])
        ob=skins(name,rows,colour,cap=not closed)
        for f in ob.data.polygons:f.use_smooth=len(f.vertices)==4
        return ob
    def turn(name,origin,axis,profile,col,n=44,cap=True):
        center=Vector(origin);axis=Vector(axis).normalized()
        u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.85 else Vector((1,0,0))).normalized()
        v=axis.cross(u)
        rows=[[center+axis*h+r*(u*cos(j*TAU/n)+v*sin(j*TAU/n)) for j in range(n)] for h,r in profile]
        ob=skins(name,rows,col,cap=cap)
        for p in ob.data.polygons:p.use_smooth=len(p.vertices)==4
        return ob
    def beam(name,a,b,ra,rb,col):
        a,b=Vector(a),Vector(b);direction=(b-a).normalized()
        u=direction.cross(Vector((0,1,0)) if abs(direction.y)<.90 else Vector((0,0,1))).normalized()
        v=direction.cross(u);rows=[]
        for q,(w,h) in [(a,ra),(b,rb)]:
            ch=min(w,h)*.21
            rows.append([q+u*dw+v*dh for dw,dh in [(w-ch,h),(-w+ch,h),(-w,h-ch),(-w,-h+ch),(-w+ch,-h),(w-ch,-h),(w,-h+ch),(w,h-ch)]])
        return skins(name,rows,col)
    outline=[(-.267,.870),(-.186,.874),(-.061,.510),(-.016,.475),(.060,.458),(.125,.496),
        (.218,.890),(.297,.890),(.289,.827),(.267,.770),(.280,.712),(.315,.688),
        (.590,.616),(.660,.601),(.704,.417),(.716,.355),(.674,.299),(.648,.262),
        (.660,.222),(.544,.181),(.450,.172),(.386,.132),(.330,.135),(.162,.178),
        (.111,.176),(.031,.170),(-.030,.248),(-.072,.263),(-.141,.222),(-.251,.352),(-.237,.410)]
    prism('탁스 · 일체형 스텝스루 프레임',outline,.098,'basalt',.009)
    inner=[(-.240,.865),(-.209,.865),(-.049,.495),(.014,.474),(.066,.472),(.139,.511),(.233,.887),
           (.255,.887),(.161,.493),(.078,.446),(-.008,.449),(-.071,.477)]
    prism('프레임 목의 검은 반환면',inner,.101,'ink',.003)
    # Front blades splay from one shoulder to separate contact patches.
    for side in [-1,1]:
        rows=[]
        for x,y,h,depth,w in [(-.205,side*.033,.368,.067,.031),(-.279,side*.069,.240,.053,.034),
                              (-.435,side*.132,.071,.063,.044),(-.497,side*.170,.021,.045,.043)]:
            rows.append([(x+dx,y+dy,h+dz) for dx,dy,dz in [(-depth,-w,.008),(depth,-w,-.007),(depth,w,-.007),(-depth,w,.008)]])
        skins('앞쪽으로 벌어진 긴 지지발',rows,'basalt',.004)
        plate('전면 지지발 미끄럼 방지 패드',-.498,side*.170,.002,.103,.078,.014,.007,'ink')
        # Rear blue-edged outriggers are lighter than the deep front blades.
        start=(.541,side*.041,.215);end=(.659,side*.337,.040)
        beam('후면 너비 조절식 받침 다리',start,end,(.052,.030),(.058,.038),'basalt')
        beam('뒤 다리의 청색 테',(.548,side*.050,.190),(.659,side*.343,.024),(.042,.009),(.052,.009),'tacxBlue')
        plate('후면 고무 받침',.66,side*.340,.002,.116,.070,.024,.011,'ink')
        # The disc is fixed in a broad opening of the rear frame, not a spoked wheel.
        axis=(0,side,0);origin=(.435,side*.047,.438)
        turn('플라이휠 주변 무광 링',origin,axis,[(0,.148),(.006,.153),(.012,.152),(.015,.140)],'ink',60)
        turn('플라이휠 은색 판',origin,axis,[(.014,.139),(.019,.140),(.022,.134),(.024,.087),(.022,.059)],'silver',60)
        turn('플라이휠 축 덮개',origin,axis,[(.023,.062),(.030,.059),(.037,.047),(.039,.024)],'charcoal',36)
        for j in range(6):
            a=TAU*j/6+.31
            turn('원판의 접시 나사',(.435+.102*cos(a),side*.072,.438+.102*sin(a)),axis,
                 [(0,.0076),(.0018,.0069)],'steel',12)
        cover=[(.116,.271),(.071,.282),(.051,.309),(.050,.350),(.079,.391),(.109,.405),(.402,.482),
               (.440,.492),(.479,.478),(.500,.442),(.495,.407),(.469,.379),(.433,.360),(.169,.279)]
        prism('크랭크와 뒷축을 잇는 커버',cover,.026,'charcoal',.004,side*.080)
        turn('크랭크 베어링',(.116,side*.080,.334),axis,[(0,.056),(.017,.057),(.024,.047),(.027,.021)],'ink')
        # One crank is at six o'clock while the opposite arm returns upward.
        ax=.116-.076*side;az=.334-.136*side
        beam('조절식 금속 크랭크',(.116,side*.111,.334),(ax,side*.125,az),(.022,.009),(.016,.008),'steel')
        for q in [0,.15,.28]:
            t=1-q
            turn('크랭크 길이 선택공',(.116-.076*side*t,side*.135,.334-.136*side*t),axis,
                 [(0,.005),(.001,.0045)],'ink',12)
        rod('페달 나사축',(ax,side*.115,az),(ax,side*.197,az),.008,'steel')
        # Form the two lightening holes rather than making a solid block.
        for ss in [-1,1]:
            beam('페달 앞뒤 모서리',(ax+ss*.043,side*.146,az),(ax+ss*.043,side*.211,az),
                 (.007,.006),(.007,.006),'ink')
        for sy in [.147,.182,.212]:
            beam('페달 가로 리브',(ax-.042,side*sy,az),(ax+.042,side*sy,az),(.006,.007),(.006,.007),'charcoal')
    # Adjustable saddle tower with a continuous fore-and-aft rail, clamps and anatomical saddle.
    beam('안장 사다리꼴 슬리브',(.244,0,.754),(.286,0,.9),(.042,.049),(.039,.048),'ink')
    beam('안장 눈금 포스트',(.265,0,.853),(.323,0,1.066),(.026,.033),(.024,.033),'steel')
    for j in range(6):
        x=.278+j*.0042;z=.903+j*.014
        beam('안장 높이 눈금',(x-.009,-.0334,z),(x+.005,-.0334,z),(.0009,.001),(.0009,.001),'paper')
    plate('안장 전후 슬라이더',.365,0,1.048,.267,.067,.028,.005,'ink')
    for side in [-1,1]:
        tube('안장 하부 레일',[(.245,side*.015,1.116),(.290,side*.025,1.083),(.371,side*.032,1.082),(.426,side*.044,1.115)],.0043,'steel')
    saddle=[]
    for x,w,h,rise in [(.178,.008,.010,0),(.189,.014,.013,0),(.236,.018,.013,-.003),(.300,.029,.016,-.006),
                        (.359,.049,.020,-.004),(.405,.071,.021,0),(.439,.071,.022,.006),(.462,.057,.016,.010),
                        (.470,.032,.010,.012)]:
        saddle.append([(x,w*cos(j*TAU/16),1.127+rise+h*sin(j*TAU/16)) for j in range(16)])
    ob=skins('폭이 넓어지는 패딩 안장',saddle,'ink')
    for f in ob.data.polygons:f.use_smooth=True
    for side in [-1,1]:
        tube('안장 가장자리 봉제선',[(.213,side*.013,1.134),(.297,side*.026,1.132),
             (.364,side*.047,1.142),(.413,side*.061,1.150),(.454,side*.045,1.154)],.0011,'slate',6)
    # Front mast and road-style drops with both lever hoods and tape ridges.
    beam('핸들 높이 슬리브',(-.238,0,.795),(-.274,0,.892),(.041,.049),(.039,.048),'ink')
    beam('은빛 핸들 포스트',(-.250,0,.849),(-.314,0,1.061),(.026,.032),(.024,.031),'steel')
    plate('핸들 전후 조절대',-.343,0,1.048,.190,.072,.031,.006,'charcoal')
    for side in [-1,1]:
        hood=[(-.344,0,1.078),(-.355,side*.110,1.081),(-.371,side*.184,1.073),
            (-.422,side*.202,1.069),(-.462,side*.202,1.054),(-.480,side*.198,1.020),
            (-.479,side*.197,.981),(-.455,side*.199,.948),(-.416,side*.204,.931),(-.374,side*.204,.923)]
        tube('감긴 테이프 드롭 핸들',hood,.012,'ink',12)
        solid=[(-.460,1.052),(-.459,1.098),(-.446,1.128),(-.431,1.129),(-.424,1.103),(-.413,1.087),(-.415,1.062)]
        prism('변속 버튼 후드',solid,.027,'charcoal',.004,side*.197)
        tube('곡선형 브레이크 레버',[(-.452,side*.206,1.079),(-.477,side*.205,1.048),(-.482,side*.206,1.023),(-.475,side*.207,1.006)],.0046,'steel')
        for k in range(6):
            x=-.421+k*.0075
            tube('그립 테이프의 얇은 겹침',[(x-.001,side*.212,.932), (x,side*.213,.927),
                (x+.001,side*.207,.919)],.0010,'slate',5)
    # The branch photo has twin fans, a tilted tablet cradle, two thin cables
    # and a central console in front of the bars.
    beam('팬 브리지 받침',(-.403,0,1.077),(-.663,0,1.164),(.014,.018),(.011,.017),'charcoal')
    for side in [-1,1]:
        rod('팬 가로 연결대',(-.645,0,1.168),(-.666,side*.234,1.209),.0085,'slate')
        axis=Vector((1,-side*.18,-.12)).normalized()
        center=Vector((-.655,side*.223,1.219))
        turn('송풍팬 검은 덕트',center,axis,[(-.038,.055),(-.034,.065),(-.024,.069),(.013,.070),(.018,.064),(.017,.057)],'charcoal',48,False)
        u=axis.cross(Vector((0,0,1))).normalized();v=axis.cross(u)
        def fanpoint(rad,a,dep):return center+axis*dep+u*(rad*cos(a))+v*(rad*sin(a))
        # An opaque recessed cavity is backed by an impeller, half-shadowed.
        turn('송풍기 뒤쪽 검은 망',center,axis,[(.0180,.056),(.0181,.056)],'ink',44)
        for j in range(7):
            a=TAU*j/7;points=[]
            for rad,s,t in [(.012,0,.44),(.031,.15,.63),(.048,.36,.67),(.056,.50,.61)]:
                points.extend([fanpoint(rad,a+s,.0208),fanpoint(rad,a+t,.0228)])
            ob=part('일곱 날개 팬 임펠러',points,[(k,k+1,k+3,k+2) for k in (0,2,4)],'slate')
            for f in ob.data.polygons:f.use_smooth=True
        for rr in [.025,.041,.056,.062]:
            tube('팬 보호 그릴 원형선',[fanpoint(rr,TAU*j/36,.026) for j in range(36)],.00115,'charcoal',5,True)
        for j in range(9):
            a=TAU*j/9
            tube('팬 보호 그릴 방사선',[fanpoint(.008,a-.04,.027),fanpoint(.033,a,.030),fanpoint(.061,a+.045,.026)],.0013,'charcoal',5)
        turn('팬 중심 캡',center,axis,[(.023,.012),(.030,.013),(.033,.010)],'ink',24)
        for rr in [.024,.042,.057]:
            tube('팬 흡입구 뒤쪽 보호망',[fanpoint(rr,TAU*j/36,-.036) for j in range(36)],.00115,'slate',5,True)
        for j in range(6):
            a=TAU*j/6+.33
            tube('흡입구 방사 리브',[fanpoint(.009,a,-.039),fanpoint(.034,a+.08,-.039),fanpoint(.059,a+.105,-.035)],.0014,'charcoal',5)
        turn('흡입구 축 마개',center,axis,[(-.041,.011),(-.037,.014)],'ink',20)
        tube('팬 전원 케이블',[(-.67,side*.20,1.189),(-.67,side*.162,1.133),(-.605,side*.086,1.106),
            (-.523,side*.057,1.098),(-.425,side*.043,1.077)],.0022,'ink',6)
    def panel(name,cx,cz,w,d,angle,col):
        # Thin screen in the Y direction, tilted upward toward the rider.
        n=Vector((cos(angle),0,sin(angle)));v=Vector((-sin(angle),0,cos(angle)));u=Vector((0,1,0));c=Vector((cx,0,cz))
        outer=[(-w/2,-d/2+.007),(-w/2+.007,-d/2),(w/2-.007,-d/2),(w/2,-d/2+.007),
               (w/2,d/2-.007),(w/2-.007,d/2),(-w/2+.007,d/2),(-w/2,d/2-.007)]
        ob=skins(name,[[c+u*a+v*b+n*e for a,b in outer] for e in [-.007,.006]],col)
        return c,n,u,v
    c,n,u,v=panel('팬 사이의 태블릿 거치대',-.697,1.225,.219,.156,.32,'ink')
    mark('태블릿 가상 코스 예시',[c+n*.0068+u*a+v*b for a,b in
         [(-.096,-.064),(.096,-.064),(.096,.064),(-.096,.064)]],'training')
    beam('콘솔 밑 지지목',(-.526,0,1.115),(-.524,0,1.147),(.017,.014),(.016,.014),'ink')
    c,n,u,v=panel('4.5인치 훈련 콘솔',-.516,1.165,.115,.083,.72,'charcoal')
    screen=[c+n*.0067+u*a+v*b for a,b in [(-.048,-.029),(.048,-.029),(.048,.029),(-.048,.029)]]
    mark('트레이너 표시창 예시',screen,'console')
    for side in [-1,1]:
        lever=[(.243,side*.061,.845),(.229,side*.091,.846),(.215,side*.095,.835),(.183,side*.102,.829)]
        tube('안장 조절 잠금 레버',lever,.0054,'ink')
        rod('핸들 잠금 손잡이',(-.252,side*.052,.870),(-.247,side*.097,.851),.0051,'ink')
    # Translucent blue bottle sits down in an open wire cradle as in the store photograph.
    axis=Vector((-.33,0,1)).normalized();base=Vector((-.039,0,.528))
    turn('체험용 물통',base,axis,[(0,.022),(.005,.029),(.017,.031),(.098,.031),(.106,.028),(.112,.031),(.136,.030),(.146,.022),(.152,.016)],'steel',28)
    turn('물통 청록 띠',base,axis,[(.103,.031),(.112,.032)],'tacxBlue',28)
    turn('물통 뚜껑',base,axis,[(.148,.021),(.158,.021),(.162,.013),(.169,.012)],'ink',24)
    for side in [-1,1]:
        tube('물통 고정 와이어',[(-.076,side*.024,.541),(-.063,side*.039,.561),(-.088,side*.039,.624),
             (-.109,side*.029,.669),(-.117,side*.015,.657)],.0034,'charcoal',8)
