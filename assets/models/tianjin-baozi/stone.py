"""Carved civil officials at the two sides of the photographed entrance."""
from mathutils import noise

def sculpt(key,side,seed):
    group=part(key);random=Random(seed)
    child(group,'청흑색 방형 대좌')
    B('대좌 아랫단',0,0,.032,.762,.656,.035,'plinth',.008)
    B('금속 대좌 몸체',0,0,.065,.751,.649,.24,'plinth',.008)
    B('돌 기둥을 받치는 천판',0,0,.303,.760,.656,.033,'graphite',.006)
    stones=[]
    def profile(label,rings,tone='sand',n=60,spacing=.033,exp=.82):
        levels=[]
        for lower,upper in zip(rings,rings[1:]):
            lines=max(1,round(abs(upper[0]-lower[0])/spacing))
            for l in range(lines):
                t=l/lines;levels.append(tuple(a+(b-a)*t for a,b in zip(lower,upper)))
        levels.append(rings[-1]);verts=[];faces=[]
        for k,(z,rx,rd,cd,cx) in enumerate(levels):
            for j in range(n):
                a=j*tau/n;c0,s0=cos(a),sin(a);c=(1 if c0>=0 else -1)*abs(c0)**exp;s=(1 if s0>=0 else -1)*abs(s0)**exp
                xx=cx+rx*c;dd=cd+rd*s
                p=Vector((xx*13.3+seed,dd*13.3+.4,z*13.3))
                rough=.0065*noise.noise(p)+.0033*noise.noise(p*2.30)+.0016*noise.noise(p*4.21)
                verts.append((xx+rough*c,dd+rough*s,z+rough*.26))
            if k:
                for j in range(n):faces.append(((k-1)*n+j,(k-1)*n+(j+1)%n,k*n+(j+1)%n,k*n+j))
        faces.extend([tuple(reversed(range(n))),tuple((len(levels)-1)*n+i for i in range(n))])
        ob=smooth(m.piece(label,verts,faces,tone));stones.append(ob);return ob
    def lump(name,x,d,z,r,rd,h,tone='sand',n=22,k=11):
        ob=ell(name,x,d,z,r,rd,h,tone,n,k,.027,seed+len(stones)*3);stones.append(ob);return ob
    def fold(name,points,width,tone='sand'):
        ob=tube(name,points,width,tone,10);stones.append(ob);return ob
    child(group,'풍화된 돌옷과 어깨')
    bias=.013*side
    profile('돌 몸체와 도포의 주름 바탕',[
      (.334,.278,.223,0,0),(.366,.306,.246,0,0),(.445,.307,.241,0,0),(.562,.291,.235,.004,.005*side),
      (.79,.28,.236,0,.004*side),(1.01,.269,.221,0,-.004*side),(1.25,.28,.233,.008,-.009*side),
      (1.45,.307,.234,.009,-.009*side),(1.57,.319,.222,.013,0),(1.657,.273,.202,.019,0),(1.692,.199,.162,.017,bias)])
    for k in [-1,1]:
        lump('아랫단에 드러난 돌신',k*.148,-.18,.390,.126,.108,.059,'sand',22,10)
        fold('길게 내려온 소맷단과 옷 주름',[(k*.238,-.118,1.328),(k*.245,-.142,1.145),(k*.219,-.166,.965),
           (k*.175,-.181,.810),(k*.133,-.197,.678),(k*.074,-.218,.551)],.037)
        fold('도포의 하부 접힘',[(k*.252,-.102,.744),(k*.231,-.148,.607),(k*.206,-.179,.51),(k*.188,-.205,.449)],.017)
    # The broad diagonals are integral cuts in the robe instead of painted lines.
    fold('가슴 앞 교차하는 긴 옷깃',[(-.179,-.135,1.628),(-.096,-.191,1.56),(.021,-.229,1.445),
       (.138,-.198,1.312),(.192,-.181,1.244)],.043)
    fold('반대쪽 접힌 옷깃',[(.175,-.118,1.644),(.109,-.181,1.551),(.021,-.218,1.49),(-.062,-.223,1.435)],.032)
    child(group,'겹쳐 모은 소매와 의식용 홀')
    for k in [-1,1]:
        a=.020*k*side
        fold('둥글게 자른 팔꿈치와 소매',[(k*.241,-.141,1.493),(k*.264,-.155,1.433),(k*.253,-.193,1.336),
             (k*.164,-.244,1.286+a),(k*.072,-.277,1.288+a)],.066)
        lump('옷소매에 반쯤 가린 돌손',k*.082,-.247,1.342+a,.083,.083,.068,'sand')
        for j in range(3):
            fold('손등에서 마모된 가는 융기',[(k*.10,-.307,1.305+j*.022+a),(k*.057,-.320,1.307+j*.022+a),
                 (k*.023,-.313,1.319+j*.022+a)],.010)
    tablet=B('가슴 앞에 세로로 든 홀',0,-.277,1.090,.092,.052,.367,'sand',.017);stones.append(tablet)
    child(group,'관모를 쓴 돌얼굴')
    profile('짧은 목에서 이마까지 한 덩이',[(1.612,.138,.132,.005,bias),(1.667,.174,.154,.010,bias),(1.719,.194,.160,.008,bias),
        (1.807,.219,.183,.014,bias),(1.902,.226,.193,.013,bias),(1.995,.218,.197,.013,bias),(2.06,.217,.176,.011,bias)],exp=.83)
    for k in [-1,1]:
        lump('이마 아래 광대',bias+k*.11,-.112,1.853,.089,.065,.085,'sand')
        lump('마모된 귓바퀴',bias+k*.211,.011,1.855,.047,.075,.083,'sand')
        fold('관모 아래 낮은 눈썹',[(bias+k*.022,-.187,1.948),(bias+k*.069,-.197,1.954+.002*k*side),
              (bias+k*.120,-.174,1.953),(bias+k*.165,-.143,1.940)],.021)
        fold('눈꺼풀의 짧은 음각',[(bias+k*.053,-.181,1.917),(bias+k*.088,-.186,1.914),(bias+k*.132,-.164,1.916)],.007,'stoneDark')
        fold('눈 아래 마모된 가장자리',[(bias+k*.047,-.181,1.905),(bias+k*.084,-.186,1.904),(bias+k*.127,-.165,1.905)],.009)
    lump('코의 다리',bias,-.190,1.876,.047,.052,.086);lump('낮은 콧끝',bias,-.222,1.837,.060,.051,.041)
    for k in [-1,1]:lump('콧방울',bias+k*.041,-.197,1.833,.031,.046,.023)
    lump('입과 턱으로 이어지는 수염',bias,-.141,1.761,.103,.056,.087,'sand',26,12)
    fold('다문 입술 중앙선',[(bias-.061,-.187,1.795),(bias-.013,-.201,1.788),(bias+.045,-.193,1.793)],.008,'stoneDark')
    fold('턱 아래 긴 수염',[ (bias-.03,-.177,1.749),(bias-.004,-.166,1.696),(bias+.023,-.154,1.669)],.025)
    child(group,'낮은 돌출 띠와 관모의 문양')
    profile('관모 본체',[(1.994,.251,.207,.005,bias),(2.016,.269,.225,.007,bias),(2.06,.276,.228,.011,bias),
        (2.117,.269,.218,.016,bias),(2.218,.272,.218,.020,bias),(2.266,.265,.213,.017,bias),(2.28,.243,.192,.019,bias)],exp=.57)
    profile('모자 둘레의 돌출 가로 띠',[(2.02,.267,.223,.005,bias),(2.03,.277,.234,.005,bias),(2.064,.278,.231,.004,bias),(2.075,.268,.223,.007,bias)],spacing=.016,exp=.63)
    for j in range(2):
        k=(-1 if j==0 else 1);cx=bias+k*.131;p=[]
        for q in range(31):
            angle=tau*q/30*1.33;rr=.046*(1-q*.021);p.append((cx+rr*cos(angle),-.211,2.131+rr*sin(angle)))
        fold('관모에 남은 낮은 소용돌이 새김',p,.009,'stone')
    # Native vertex colours provide the dark flecks of the stone even without a bitmap or additional draw.
    for ob in stones:
        mesh=ob.data;tint=mesh.color_attributes.new(name='돌 표면',type='BYTE_COLOR',domain='POINT')
        base=mesh.materials[0].diffuse_color
        for point in mesh.vertices:
            co=point.co;pm=Vector((co.x*30+seed,co.y*30,co.z*30))
            grains=.16*noise.noise(pm*.39)+.24*noise.noise(pm*1.97)+.11*noise.noise(pm*4.38)
            v=.99+grains-(.21 if noise.noise(pm*1.32)>.38 else 0)
            tint.data[point.index].color=tuple(max(0,min(1,c*v)) for c in base[:3])+(1,)
sculpt('keeperL',1,39)
sculpt('keeperR',-1,56)
