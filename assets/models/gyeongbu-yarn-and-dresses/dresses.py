"""Short party dresses with flared pleats, scalloped petticoats and folded ribbon bows."""
import math
from mathutils import Vector
from tailoring import TailoredPart
from garments import tube
from yarn import tone

TAU=math.tau


def dress(fabric,trim,hardware,x,d,hem,height,scale,rot,palette,number,low):
    c,s=math.cos(rot),math.sin(rot)
    p=lambda a,b,z:Vector((x+scale*(a*c-b*s),d+scale*(a*s+b*c),hem+z*height))
    n=lambda a,b,z:Vector((a*c-b*s,a*s+b*c,z)).normalized()
    shade,band,lace=map(tone,palette)
    sk=10 if number%3==0 else 9 if number%3==1 else 8
    flare=.245*(1+.10*math.sin(number))
    count=12 if low else 48
    pleats=7+number%4
    def ring(t,frac,layer):
        phi=t*TAU;fold=math.cos(pleats*phi+.41*math.sin(2*phi+number)+frac*.65)
        r=flare*(.42+.58*(1-frac)**1.01)*(1+(.093-.041*frac)*fold)
        h=.014+.555*frac+.012*(1-frac)*math.sin(3*phi+number)+(.010 if layer else 0)*math.cos(phi*pleats*1.5)
        if layer:r*=1.026;h+=.095*(.91+.14*math.sin(phi*5+number))
        return p(r*math.cos(phi),r*(.57+.03*math.cos(number))*math.sin(phi),h)
    for layer in ([0] if low else [0,1]):
        levels=[0,1] if low else [0,.09,.37,.65,1] if not layer else [0,.11,.49,.82]
        for a,b in zip(levels,levels[1:]):
            for i in range(count):
                pts=[(i/count,a),((i+1)/count,a),((i+1)/count,b),(i/count,b)]
                coords=[ring(t,z,layer) for t,z in pts]
                normals=[]
                for t,z in pts:
                    tangent=ring(t+.001,z,layer)-ring(t-.001,z,layer)
                    vertical=ring(t,min(1,z+.004),layer)-ring(t,max(0,z-.004),layer)
                    normals.append(tangent.cross(vertical).normalized())
                col=lace if layer else shade
                light=(.93 if layer else .88)+.055*math.cos(TAU*(i+.5)/count*pleats+.10)
                fabric.curved(coords,10 if layer else sk,normals,tuple(min(1,v*light) for v in col),
                    [(t,z*(.85 if layer else 1)) for t,z in pts])
        if not low:
            for i in range(count):
                t=i/count;tt=(i+1)/count
                v,w=ring(t,0,layer),ring(tt,0,layer)
                lower=[v+Vector((0,0,-.011-.004*math.sin(t*TAU*pleats))),w+Vector((0,0,-.011-.004*math.sin(tt*TAU*pleats)))]
                trim.face([v,w,lower[1],lower[0]],11,n(math.cos(TAU*(t+tt)/2),math.sin(TAU*(t+tt)/2),0),
                          lace if layer else band)
    # Use a shoulder/neckline grid; the folded front remains correctly triangulated
    # at every viewing angle, including the two little armholes above the waist.
    span=[-1,-.84,-.65,-.45,-.27,0,.27,.45,.65,.84,1]
    tops=[.79,.91,.96,.97,.906,.881,.907,.97,.96,.91,.79]
    if number%2:tops=[.757,.805,.947,.973,.906,.874,.906,.973,.947,.805,.757]
    def panel(j,v,face):
        u=span[j]
        hw=.109+.056*math.sin(v*math.pi*.64)
        chest=.041+.031*math.sin(v*math.pi)
        return p(u*hw,face*chest*(1-.70*u*u)+.004*math.sin(u*7+number)*(1-v),.555+v*(tops[j]-.555))
    for sign in [-1,1]:
        for v,next_v in [(0,.41),(.41,.80),(.80,1)]:
            for i in range(len(span)-1):
                indices=[(i,v),(i+1,v),(i+1,next_v),(i,next_v)]
                nodes=[panel(j,r,sign) for j,r in indices]
                normals=[n(span[j]*.36,sign,.035) for j,r in indices]
                fabric.curved(nodes,sk,normals,shade if sign>0 else tuple(v*.81 for v in shade),
                              [(.5+.45*span[j],.05+.90*r) for j,r in indices])
    for i in range(len(span)-1):
        fabric.face([panel(i,1,-1),panel(i+1,1,-1),panel(i+1,1,1),panel(i,1,1)],8,n(0,0,1),lace)
    for j,side in [(0,-1),(-1,1)]:
        fabric.face([panel(j,0,-1),panel(j,1,-1),panel(j,1,1),panel(j,0,1)],8,n(side,0,0),shade)
    if number%3==1:
        # Ruched cap sleeves sit proud of the bodice and narrow towards the armhole.
        for side in [-1,1]:
            cap=[(.823,.034),(.847,.054),(.889,.066),(.927,.049),(.945,.018)]
            for (a,ra),(b,rb) in zip(cap,cap[1:]):
                for k in range(12):
                    shape=[(k/12,a,ra),((k+1)/12,a,ra),((k+1)/12,b,rb),(k/12,b,rb)]
                    pts=[];normals=[]
                    for t,z,r in shape:
                        angle=t*TAU
                        bump=1+.070*math.cos(6*angle)
                        pts.append(p(side*.142+r*bump*math.cos(angle),.008+r*.83*bump*math.sin(angle),z))
                        normals.append(n(math.cos(angle),math.sin(angle),.25))
                    fabric.curved(pts,9,normals,shade,[(t,(r-.01)*13) for t,z,r in shape])
    if not low and number%3==2:
        for side in [-1,1]:
            collar=[(.014,.878),(.060,.933),(.103,.955),(.116,.922),(.092,.887),(.038,.856)]
            trim.face([p(side*a,.055+.012*(1-abs(a)/.13),z) for a,z in collar],9,n(0,1,.12),lace)
        for z in [.665,.725,.778]:
            trim.face([p(.010*math.cos(k*TAU/9),.078,z+.012*math.sin(k*TAU/9)) for k in range(9)],6,n(0,1,0),(.98,.97,.88))
    def ribbon(a,b,radius,sw,color):
        for k in range(14):
            aa=k*TAU/14;bb=(k+1)*TAU/14
            pts=[p(radius*math.cos(t),.070*math.sin(t),h) for t,h in [(aa,a),(bb,a),(bb,b),(aa,b)]]
            trim.face(pts,sw,n(math.cos((aa+bb)/2),math.sin((aa+bb)/2),0),color)
    ribbon(.545,.605,.114,11,band)
    if not low:
        # Bow loops have rolled lips and a narrower pinched centre.
        for side in [-1,1]:
            rows=[(0,.013,.064),(.040,.026,.084),(.087,.042,.097),(.104,.032,.087),(.089,.013,.072),(.032,.007,.062)]
            last=None
            for w,r,q in rows:
                pair=[p(side*w,q,.586-r),p(side*w,q+.004,.586+r)]
                if last:trim.face([*last,pair[1],pair[0]],11,n(0,1,.1),band)
                last=pair
            trim.face([p(side*.008,.081,.575),p(side*.025,.080,.568),p(side*.066,.096,.436),p(side*.042,.088,.451)],11,n(0,1,.06),band)
        trim.box(x,d+.092*scale,hem+height*.574,.023*scale,.016,.028*height,11,band)
        if number%3!=2:
            # Embroidered rosettes trace the neckline and parts of the skirt.
            for k in range(3):
                aa=(-.043+k*.041);zz=.807+.018*abs(k-1)
                for petal in range(5):
                    angle=TAU*petal/5
                    vv=[p(aa,.055,zz)]
                    for j in range(6):
                        phi=TAU*j/5
                        vv.append(p(aa+.010*math.cos(angle)+.008*math.cos(phi),.063,zz+.014*math.sin(angle)+.011*math.sin(phi)))
                    trim.face(vv[1:],9,n(0,1,0),lace)
    wire=[p(-.153,0,.945),p(-.105,0,.980),p(-.017,0,1.021),p(.017,0,1.021),p(.105,0,.980),p(.153,0,.945)]
    tube(hardware,wire,.0065*scale,6,.96,n=4 if low else 6)
    if not low:tube(hardware,[p(0,0,1.020),p(0,0,1.055),p(.027,0,1.087),p(.024,0,1.112),p(0,0,1.121),p(-.018,0,1.100)],.0043,4,.96,n=5)


def padded_jacket(part,trim,x,d,hem,length,angle,base,low):
    ca,sa=math.cos(angle),math.sin(angle)
    def p(a,b,h):return Vector((x+ca*a-sa*b,d+sa*a+ca*b,hem+h))
    def n(a,b,h):return Vector((ca*a-sa*b,sa*a+ca*b,h)).normalized()
    w=.141
    count=8 if low else 16
    rings=[(0,.89,.058),(.06,1,.076),(.21,.97,.077),(.39,.92,.082),(.60,.98,.085),(.82,1.02,.081),(.90,.88,.071),(.98,.38,.044),(1,.34,.045)]
    for i,((h,r,q),(hh,rr,qq)) in enumerate(zip(rings,rings[1:])):
        if i<6 and not low:
            levels=[(h,r,q),((h+hh)/2,(r+rr)/2+.065,(q+qq)/2+.011),(hh,rr,qq)]
        else:levels=[(h,r,q),(hh,rr,qq)]
        for (h,r,q),(hh,rr,qq) in zip(levels,levels[1:]):
            for k in range(count):
                coords=[(k/count,r,q,h),((k+1)/count,r,q,h),((k+1)/count,rr,qq,hh),(k/count,rr,qq,hh)]
                pts=[p(r*w*math.cos(t*TAU),q*math.sin(t*TAU),height*length) for t,r,q,height in coords]
                norms=[n(math.cos(t*TAU),math.sin(t*TAU)*1.25,.08) for t,r,q,height in coords]
                colour=base if i<5 else tone('364556') if i<7 else tone('526779')
                part.curved(pts,11,norms,colour,[(t,height) for t,r,q,height in coords])
    for side in [-1,1]:
        tube(part,[p(side*.109,.008,length*.85),p(side*.160,.015,length*.735),
                   p(side*.179,.037,length*.51),p(side*.196,.047,length*.31)],.045,11,base,6 if low else 10)
    if not low:
        tube(trim,[p(.003,.064,.023),p(.002,.084,length*.55),p(.001,.079,length*.80),p(.001,.041,length*.987)],.0055,4,.88,5)
        for sign in [-1,1]:
            tube(trim,[p(sign*.065,.082,length*.26),p(sign*.105,.073,length*.40)],.0065,11,tone('424c50'),4)


def graphic_tee(part,rack,x,d,z,scale,base,sleeves,low,variant):
    """Child-sized cotton jersey over the front rail; original bus/boat graphics."""
    def p(t,q,h):return (x+t*scale,d+q*scale,z+h*scale)
    bod=[(-.13,0),(-.13,.20),(-.19,.176),(-.217,.251),(-.150,.297),(-.064,.321),
         (-.042,.298),(0,.288),(.04,.298),(.066,.321),(.149,.297),(.217,.251),
         (.19,.176),(.13,.20),(.129,0)]
    for side in [-1,1]:
        for j in range(-2,2):
            a=j*.065;b=(j+1)*.065
            top=lambda u:.289+.021*min(1,abs(u)/.065)
            pts=[p(a,side*.022,0),p(b,side*.023,0),p(b,side*.022,top(b)),p(a,side*.022,top(a))]
            part.face(pts,8,(0,side,0),base)
        for sign in [-1,1]:
            pts=[p(sign*a,side*.022,h) for a,h in [(.122,.194),(.19,.175),(.217,.249),(.147,.296),(.121,.303)]]
            part.face(pts,8,(0,side,0),sleeves)
    if not low:
        tube(part,[p(t,.025,h) for t,h in [(-.063,.320),(-.042,.298),(0,.289),(.042,.298),(.064,.320)]],.007,11,sleeves,5)
        main=tone('d79048') if variant%2 else tone('738a88')
        graphic=[(-.074,.116),(-.052,.099),(.054,.099),(.079,.124),(-.074,.124)] if variant%2 else [(-.080,.113),(.080,.113),(.080,.164),(.060,.185),(-.069,.185),(-.080,.174)]
        part.face([p(a,.026,h) for a,h in graphic],6,(0,1,0),main)
        if variant%2:
            part.face([p(-.043,.026,.134),p(.007,.026,.217),p(.005,.026,.134)],6,(0,1,0),(.88,.78,.58))
            part.face([p(.017,.026,.136),p(.020,.026,.204),p(.067,.026,.140)],6,(0,1,0),(.49,.64,.66))
        else:
            for j in range(4):
                a=-.064+j*.035
                part.face([p(a,.027,.15),p(a+.025,.027,.15),p(a+.025,.027,.176),p(a,.027,.176)],6,(0,1,0),(.84,.87,.86))
            for a in [-.045,.050]:
                part.face([p(a+.015*math.cos(k*TAU/9),.027,.112+.016*math.sin(k*TAU/9)) for k in range(9)],6,(0,1,0),(.33,.35,.34))
    tube(rack,[p(-.13,0,.302),p(0,0,.346),p(.13,0,.302)],.005,6,.95,4)
    if not low:tube(rack,[p(0,0,.344),p(0,0,.365),p(.013,0,.379),p(.015,0,.396),p(0,0,.395)],.003,4,.95,4)


def dress_stock(low=False):
    racks=TailoredPart('01 · Double garment rail and small hooked hangers')
    fabric=TailoredPart('02 · Pleated dress skirts, shaped bodices and underskirts')
    trim=TailoredPart('03 · Tiered scalloped hems, sash bows and embroidery')
    for x in [-2.37,-.21]:
        racks.box(x,-.66,.085,.06,.49,.065,4,.91)
        tube(racks,[(x,-.70,.10),(x,-.70,2.38)],.020,4,n=6 if low else 10)
    palettes=[
      ('efbcbb','c66d79','f3d2c8'),('ece4d5','d6bd89','fbf1d7'),('fff4ed','bd929e','efc8c7'),
      ('c9b5d6','927ba9','eee0eb'),('efd6a4','c1a572','fbebc6'),('efdad9','bd8d96','f8e2e4'),
      ('f0e6d5','abb9aa','dce5df'),('cfdceb','8399a9','edefe0')]
    for row,rail in enumerate([1.48,2.39]):
        d=-.65+(.37 if not row else 0)
        for x in [-2.35,-.25]:tube(racks,[(x,-.70,rail),(x,d+.055,rail)],.014,4,n=6)
        tube(racks,[(-2.39,d,rail),(-.18,d,rail)],.019,4,n=8)
        for i in range(5):
            height=(.69 if row==0 else .70)+.038*math.sin(i*2+row)
            x=-2.14+.426*i
            dress(fabric,trim,racks,x,d,.002+rail-height*1.10,height,.88+.06*math.cos(i),
                  .02+.14*math.sin(i+row*1.7),palettes[(i+row*3)%len(palettes)],i+5*row,low)
    coats=TailoredPart('04 · Short quilted outerwear between yarn and dresses')
    tube(racks,[(-.02,-.79,2.16),(-.02,.49,2.16)],.014,4,n=6)
    for index,(d,col,angle) in enumerate([(-.46,'ae4859',-.63),(-.25,'2a4c65',-.82),(-.03,'3988b1',-.50),(.22,'296d99',-.80)]):
        if low and index%2==0:continue
        height=.82+index*.035
        padded_jacket(coats,trim,-.015,d,1.96-height,height,angle,tone(col),low)
        if not low:tube(racks,[(-.12,d,1.92),(-.01,d,2.018),(-.01,d,2.112),(.01,d,2.16)],.006,4,.91,5)
    front=TailoredPart('05 · Printed cotton jerseys on the lower front rail')
    tube(racks,[(-2.38,.66,.862),(-.47,.66,.862)],.014,4,n=6)
    for x in [-2.31,-.54]:
        tube(racks,[(x,.54,.055),(x,.66,.08),(x,.66,.86)],.014,4,n=6)
        racks.box(x,.65,.035,.048,.44,.035,4,.86)
    for i,(c,s) in enumerate([('e2d5a8','d69d3d'),('487bb5','34518a'),('e7e1d2','a33d45'),
                               ('a5bbce','355b8a'),('ebd6c6','c7575a')]):
        graphic_tee(front,racks,-2.20+i*.382,.68,.443+.012*(i%2),1.06,tone(c),tone(s),low,i)
    return [p for p in [racks,fabric,trim,coats,front] if p.faces]
