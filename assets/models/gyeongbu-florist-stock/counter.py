"""Pale oak shop cabinets, open brass branches and hollow cut-glass florist vessels."""
import math
from mathutils import Vector
from garments import tube
from tailoring import TailoredPart

TAU=math.tau


def turned(part,x,d,z,profile,sw,tone,steps,*,corrugation=0,flutes=8,faceted=False):
    # Profiles include a return down the inside of the mouth for open forms.
    for j,((h0,r0),(h1,r1)) in enumerate(zip(profile,profile[1:])):
        for k in range(steps):
            pts=[];norms=[];uv=[]
            for i,h,r in [(k,h0,r0),(k+1,h0,r0),(k+1,h1,r1),(k,h1,r1)]:
                a=i*TAU/steps
                radius=r*(1+corrugation*math.cos(flutes*a))
                pts.append(Vector((x+radius*math.cos(a),d+radius*math.sin(a),z+h)))
                angle=a if not faceted else (k+.5)*TAU/steps
                tang=-corrugation*flutes*math.sin(flutes*angle) if not faceted else 0
                norms.append(Vector(((math.cos(angle)+tang*math.sin(angle))*(h1-h0),(math.sin(angle)-tang*math.cos(angle))*(h1-h0),r0-r1)).normalized())
                uv.append((i/steps,h/max(p[0] for p in profile)))
            if faceted:part.face(pts,sw,sum(norms,Vector((0,0,0))).normalized(),tone,uv)
            else:part.curved(pts,sw,norms,tone,uv)


def candle_holder(brass,x,d,z,height,arms,low,kind):
    h=height;scale=.88+h*.18;sw=8
    if low:
        points=[(-.09,0),(.09,0),(.096,.015),(.026,.051),(.012,.080),(.009,h*.79),(.029,h*.82),(.035,h*.89),(-.035,h*.89),(-.029,h*.82),(-.009,h*.79),(-.012,.080),(-.026,.051),(-.096,.015)]
        brass.face([(x+xx,d,z+hh) for xx,hh in points],8,(0,1,0),.92)
        for side in [-1,1] if arms else []:
            brass.face([(x,d,z+h*.59),(x+side*.13,d,z+h*.72),(x+side*.15,d,z+h*.86),(x+side*.12,d,z+h*.79)],8,(0,1,0),.93)
        return
    foot=[(0,.084),(.008,.098),(.017,.096),(.022,.084),(.027,.083),(.034,.058),(.048,.044),(.072,.029),(.087,.020),(.108,.020)]
    stem=[(.10,.020),(.116,.032),(.136,.032),(.161,.018),(h*.71,.010),(h*.78,.019),(h*.82,.014)]
    for profile in [foot,stem]:turned(brass,x,d,z,[(a,r*scale) for a,r in profile],sw,.98,24)
    def cup(cx,cd,hh,size=1):
        p=[(0,.013),(.009,.024),(.015,.046),(.023,.050),(.028,.050),(.028,.025),(.039,.018),(.074,.025),(.079,.027),(.079,.0185),(.042,.015)]
        turned(brass,cx,cd,hh,[(v*size,r*size) for v,r in p],sw,.99,18)
    cup(x,d,z+h*.82,1.23 if arms else 1.0)
    for i in range(arms):
        a=i*TAU/arms+(.65 if kind%2 else .25);c=math.cos(a);s=math.sin(a)
        radius=.173 if arms==4 else .118
        # Polished curved arms first dip, then lift the socket above the stem joint.
        points=[]
        for k in range(13):
            t=k/12;r=t*radius
            points.append((x+c*r,d+s*r,z+h*(.58+.23*t-.15*math.sin(math.pi*t))))
        tube(brass,points,.010*scale,sw,.93,9)
        cup(x+c*radius,d+s*radius,z+h*.81,.85)


def vessel(part,x,d,z,h,r,style,low):
    if style=='footed':
        profile=[(0,.60),(.025,.72),(.05,.66),(.085,.26),(.34,.12),(.36,.19),(.41,.18),(.52,.50),(.66,.80),(.91,.94),(.98,1),(1,1),(.992,.90),(.90,.84),(.66,.70),(.49,.33)]
        flutes=10
    elif style=='fluted':
        profile=[(0,.70),(.017,.78),(.044,.78),(.077,.69),(.11,.67),(.42,.84),(.90,.98),(.972,1),(1,.99),(.998,.915),(.956,.906),(.54,.76),(.11,.53)]
        flutes=12
    elif style=='bowl':
        profile=[(0,.49),(.04,.58),(.085,.59),(.12,.48),(.22,.47),(.39,.56),(.72,.88),(.93,1),(1,1),(.993,.94),(.84,.88),(.50,.61),(.28,.47)]
        flutes=9
    else:
        profile=[(0,.64),(.04,.76),(.12,.71),(.36,.84),(.66,.99),(.81,.91),(.91,.67),(.985,.66),(1,.70),(.995,.60),(.91,.58),(.80,.78),(.65,.87),(.22,.61)]
        flutes=7
    if low:
        profile=profile[::2];n=8
    else:n=flutes*(2 if style in ['footed','urn'] else 3)
    turned(part,x,d,z,[(zz*h,rr*r) for zz,rr in profile],9,(.98,1,.99),n,
           corrugation=.035 if low else .095 if style in ['fluted','bowl'] else .07,flutes=flutes,faceted=True)


def cabinet(low=False):
    case=TailoredPart('01 · Ivory cabinets, oak uprights and shelf-edge lighting')
    stock=TailoredPart('02 · Wrapped florist stock, stacked ceramic cachepots and trays')
    metal=TailoredPart('03 · Turned brass candlesticks, curved arms and open sockets')
    # A low case with a timber-framed return on one side, as in the stall photograph.
    for x,w in [(-.72,1.37),(.685,1.39)]:
        case.box(x,-.017,.07,w,.54,.057,14,.92);case.box(x,-.220,.115,w,.040,.810,14,.84)
        for sign in [-1,1]:case.box(x+sign*(w/2-.024),-.012,.113,.048,.51,.802,14,.94)
        case.box(x,.00,.86,w,.55,.046,14,.97)
        case.box(x,.258,.842,w-.058,.022,.014,15,.99)
        if not low:
            for xx in [-.40,.40]:case.box(x+xx,-.009,.008,.043,.46,.072,14,.72)
    # Half-height vitrine with visible space beneath each shelf and a high display surface.
    for x in [-1.379,-.072]:
        for d in [-.208,.223]:case.box(x,d,.903,.049,.048,.800,12,.96)
    for z in [.917,1.318,1.726]:
        case.box(-.723,-.008,z,1.37,.515,.031,12,1)
        case.box(-.723,-.008,z+.029,1.35,.505,.009,14,.96)
        if not low:case.box(-.723,.221,z-.007,1.286,.024,.011,15,1)
    case.box(.684,-.179,.150,1.26,.028,.643,14,.91)
    for row in range(3 if not low else 2):
        for i in range(4):
            x=-1.23+i*.316;z=.129+row*.078
            # Soft square paper packs compress at the edges.
            stock.prism([(x-.14,z+.013),(x-.12,z),(x+.127,z+.003),(x+.145,z+.022),(x+.138,z+.063),(x-.14,z+.061)],-.187,.236,3,.96 if row%2 else .90)
    for layer in range(4):
        for i in range(4-layer//2):
            x=-1.194+i*.254+(layer%2)*.060
            stock.box(x,-.023,.365+layer*.085,.228,.364,.068,7,(.93,.94,.89))
    for i in range(7):
        x=-1.218+i*.178;h=.117+(i%2)*.023
        profile=[(0,.053),(.01,.059),(h*.84,.071),(h,.074),(h,.058),(h*.83,.057),(.019,.045)]
        turned(stock,x,-.112,1.763,profile,14,(.95,.81,.76) if i<4 else (.96,.92,.80),8 if low else 16)
    for i,(x,d,h,arms) in enumerate([(.80,.017,.72,4),(.16,-.068,.62,2),(1.207,-.092,.53,2),(.442,.157,.365,0),(.920,.164,.37,0),(1.238,.137,.32,0),(.08,.157,.34,0)]):
        candle_holder(metal,x,d,.909,h,arms,low,i)
    for i in range(9):
        x=.124+(i%5)*.25;d=.108-(i//5)*.19;h=.44+.075*math.sin(i*1.4)
        candle_holder(metal,x,d,.129,h,0,low,i)
    return [case,stock,metal]+([] if low else glass(edges=True))


def glass(low=False,edges=False):
    crystal=TailoredPart('04 · Open fluted vases, stemmed goblets and cut-glass bowls')
    lower=[(-1.225,.067,.28,.076,'footed'),(-.989,.090,.22,.077,'bowl'),(-.788,.068,.303,.065,'fluted'),(-.587,.081,.24,.084,'urn'),(-.382,.042,.265,.078,'footed'),(-.177,.069,.230,.071,'fluted')]
    def add(part,x,d,z,h,r,style,low):
        if low:
            # At aisle distance the rim, hollow mouth and stem define the shape.
            width=r if style!='urn' else r*.76
            outline=[(-width,h),(-r*.82,h*.61),(-r*.28,h*.27),(-r*.53,0),(r*.54,0),(r*.25,h*.27),(r*.84,h*.61),(width,h)]
            part.face([(x+xx,d,z+hh) for xx,hh in outline],9,(0,1,0),.88)
            return
        if not edges:
            vessel(part,x,d,z,h,r,style,False);return
        # Thick polished rims catch a broken reflection, with a second dark underside.
        # Fine slanted cuts against the clear wall give the facets a readable edge.
        rad=r*({'urn':.70}.get(style,1));n=24
        for edge,base,width in [(rad,z+h,.0024),(r*.62,z+.002,.002)]:
            for k in range(n):
                a=k*TAU/n;b=(k+1)*TAU/n;v=k%12
                tone=(.95,.99,.97) if v<4 or v>9 else (.43,.54,.52) if v<7 else (.73,.80,.79)
                pt=lambda radius,t,zz:(x+radius*math.cos(t),d+radius*math.sin(t),zz)
                part.face([pt(edge,a,base-width),pt(edge,b,base-width),pt(edge,b,base),pt(edge,a,base)],9,(math.cos((a+b)/2),math.sin((a+b)/2),.15),tone)
        if style not in ['fluted','bowl']:return
        # Intersecting diagonals are the thin ground facets visible on the photographed vases.
        profile=[(.22,.71),(.46,.86),(.67,.93)] if style=='fluted' else [(.39,.56),(.53,.69),(.74,.89)]
        for i in range(10):
            for sign in [-1,1]:
                for j in range(2):
                    a=i*TAU/10+sign*.215*j;b=a+sign*.215
                    h0,r0=profile[j];h1,r1=profile[j+1]
                    p=lambda t,w,zz:(x+(w*r+.001)*math.cos(t),d+(w*r+.001)*math.sin(t),z+zz*h)
                    part.face([p(a-.012,r0,h0),p(a+.012,r0,h0),p(b+.012,r1,h1),p(b-.012,r1,h1)],9,(math.cos((a+b)/2),math.sin((a+b)/2),.03),(.72,.80,.78) if (i+j)%3 else (.96,.99,.98))
    if edges:crystal.name='04 · Polished rims and diamond-wheel cut lines'
    for i,(x,d,h,r,sty) in enumerate(lower):
        add(crystal,x,d,.961,h,r,sty,low)
        add(crystal,x+.006,-.116,1.357,h*.93,r*.90,sty,low)
        if i%2==0:add(crystal,x+.083,.116,1.358,h*.71,r*.69,'footed',low)
    for i in range(6):
        x=-1.241+i*.202;h=.29+.13*math.sin(i*.76+.2)
        add(crystal,x,.100,1.766,h,.067 if i%2 else .089,'fluted' if i%2 else 'footed',low)
    for i in range(6):
        x=.158+i*.213;add(crystal,x,-.022,.128,.50+.2*math.sin(i*1.77),.049,'fluted',low)
    return [crystal]
