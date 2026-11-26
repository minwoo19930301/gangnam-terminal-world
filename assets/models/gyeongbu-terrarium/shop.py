"""The photographed public counter, air-plant entrance and shop's cut-wood assortment."""
import math
import random
from mathutils import Vector
from tailoring import TailoredPart
from garments import tube
from branches import bark,hanging_arch
from leaves import rosette,palm,hanging_vine,spanish_moss,shield_clump,succulent

TAU=math.tau


def pot(part,x,d,z,r,height,sw,tone,low):
    levels=[(0,.68),(.045,.78),(.110,.78),(.136,.73),(.81,.94),(.85,1),(.98,1),(1,.92),(.82,.88)]
    if low:levels=[levels[i] for i in [0,6]]
    n=6 if low else 20
    for (h,rr),(hh,rrr) in zip(levels,levels[1:]):
        for k in range(n):
            a=k*TAU/n;b=(k+1)*TAU/n
            def p(a,rad,level):return (x+rad*r*math.cos(a),d+rad*r*math.sin(a),z+level*height)
            norm=Vector(((hh-h)*height*math.cos((a+b)/2),(hh-h)*height*math.sin((a+b)/2),(rr-rrr)*r)).normalized()
            part.face([p(a,rr,h),p(b,rr,h),p(b,rrr,hh),p(a,rrr,hh)],sw,norm,tone,[(k/n,h),((k+1)/n,h),((k+1)/n,hh),(k/n,hh)])
    ring=[(x+r*.86*math.cos(k*TAU/n),d+r*.86*math.sin(k*TAU/n),z+height*.83) for k in range(n)]
    part.face(ring,11,(0,0,1),(.69,.70,.63),[(.5+.49*math.cos(k*TAU/n),.5+.49*math.sin(k*TAU/n)) for k in range(n)])


def arch(low=False):
    arch=TailoredPart('01 · Three winding timber stems and branching vine arch')
    cradle=TailoredPart('02 · Small baskets, hanging wires and split cork pedestals')
    moss=TailoredPart('03 · Individual silver moss strands and air-plant rosettes')
    trailing=TailoredPart('04 · Trailing stems and suspended fern leaves')
    hanging_arch(arch,low)
    for i,(x,d,z,s,kind) in enumerate([(-.64,1.13,1.92,.77,'moss'),(-.32,1.17,2.05,1.02,'moss'),(-.14,1.15,2.12,.58,'silver'),
                                          (.23,1.16,2.08,1.00,'vine'),(.53,1.13,1.96,.92,'vine'),(.70,1.09,1.75,.48,'silver')]):
        h=.030+s*.065;pot(cradle,x,d,z-s*.08,.090*s,h,9,(.55,.57,.47),low)
        if not low:
            for k in range(3):
                a=k*TAU/3;tube(cradle,[(x+s*.079*math.cos(a),d+s*.079*math.sin(a),z-.016),(x,d,z+.30*s)],.0018,10,(.70,.73,.69),4)
        if kind=='moss':
            spanish_moss(moss,x,d,z-.02,s,1856+i,low);rosette(moss,x,d,z+.021,s*.57,242+i,'silver',low)
        elif kind=='silver':rosette(moss,x,d,z+.02,s*.85,120+i,'silver',low)
        else:hanging_vine(trailing,x,d,z+.025,s,495+i,low)
    return [arch,cradle,moss,trailing]


def shelf(part,x,d,w,depth,levels,low):
    for sx in [-1,1]:
        for sd in [-1,1]:
            ux=x+sx*(w/2-.017);vd=d+sd*(depth/2-.014)
            part.box(ux,vd,.012,.029,.030,max(levels)+.06,10,.96)
            if not low:
                # Perforations read on the face of the enamel angle, without cutting dozens of holes.
                for i in range(int(max(levels)/.066)):
                    z=.10+i*.063;part.front(ux-.004,z,ux+.004,z+.018,vd+.0155,9,(.47,.49,.46))
    for level in levels:
        part.box(x,d,level,w,.052,.030,10,.88)
        part.box(x,d,level+.028,w,depth,.018,10,.95)
        part.box(x,d+depth/2-.016,level-.004,w-.05,.017,.022,10,.91)
        if not low and level>.35:part.box(x,d,level-.01,w-.07,.037,.012,15,.99)


def nursery(side,low=False):
    frame=TailoredPart('01 · White steel shelves, warm soil trays and timber aisle boards')
    pots=TailoredPart('02 · Ribbed cachepots, nursery pots and exposed soil')
    blades=TailoredPart('03 · Ribbed snake plants, agaves and broad patterned leaves')
    fronds=TailoredPart('04 · Pinnate palm fronds and potted ferns')
    flowers=TailoredPart('05 · Small seasonal flowers in low nursery trays')
    for i in range(6):frame.box((i-2.5)*.139,-.29,.009,.135,2.54,.014,8,(.76,.73,.66) if i%2 else (.74,.72,.68))
    shelf(frame,-1.17,-.77,.75,1.54,[.13,.91,1.68],low);shelf(frame,1.17,-.17,.78,2.05,[.12,.69],low)
    frame.box(1.22,.965,.05,.65,.35,.046,8,(.80,.78,.70))
    plants=[
     # x, depth, root shelf elevation, pot radius/height, approximate foliage silhouette, scale
     (-1.18,-1.12,1.726,.133,.151,'snake',.98),(-1.18,-.46,1.726,.152,.114,'fernleaf',.71),(-1.14,-.16,1.726,.095,.118,'snake',.66),
     (-1.21,-1.01,.956,.117,.122,'flame',.67),(-1.19,-.59,.956,.099,.109,'palm',.65),(-1.17,-.23,.956,.104,.120,'calathea',.51),
     (-1.13,-.21,.176,.130,.168,'fernleaf',.81),(-1.16,-.77,.176,.144,.139,'calathea',.67),
     (1.21,-1.00,.736,.118,.101,'palm',.73),(1.22,-.64,.736,.145,.130,'fernleaf',.77),
     (1.28,-.24,.736,.122,.140,'flame',.65),(1.17,.15,.736,.133,.133,'calathea',.81),
     (1.28,.58,.736,.121,.129,'palm',.64),(1.11,-.61,.166,.125,.129,'agave',.62),
     (1.22,-.09,.166,.127,.122,'fernleaf',.59),(1.16,.45,.166,.121,.135,'calathea',.63),
     (-1.41,.44,.02,.197,.281,'flame',1.42),(-1.03,.48,.02,.157,.221,'agave',1.09),
     (.69,.53,.018,.124,.148,'shield',.87),(1.45,-1.22,.02,.158,.218,'flame',1.07),
     (-.80,.93,.02,.139,.148,'shield',.93),(1.49,-1.47,.018,.161,.29,'palm',1.78),
     (-1.48,-1.40,1.726,.088,.094,'fernleaf',.51),(-.92,-.69,1.726,.080,.081,'silver',.57),
     (1.42,-.81,.736,.11,.14,'snake',.88),(.91,-.33,.736,.107,.101,'shield',.78),
     (1.44,.32,.736,.115,.109,'fernleaf',.78),(.92,.51,.736,.087,.087,'agave',.51),
     (1.43,.65,.166,.118,.109,'shield',.59),(-1.47,-.34,.956,.092,.102,'fernleaf',.50),
    ]
    for i,(x,d,z,r,h,style,scale) in enumerate(plants):
        if side=='stand' or (x<0)!=(side=='left'):continue
        tint=[(.67,.66,.59),(.92,.89,.80),(.85,.66,.55),(.43,.48,.42)][i%4];sw=[9,10,13,9][i%4]
        pot(pots,x,d,z,r,h,sw,tint,low)
        if style=='palm':palm(fronds,x,d,z+h*.88,scale,766+i,low)
        elif style=='shield':shield_clump(blades,x,d,z+h*.87,scale,340+i,low)
        else:rosette(blades,x,d,z+h*.87,scale,380+i,style,low)
    # A slatted tray of small rosettes breaks up the right-hand display surface.
    frame.box(.93,-.92,.738,.218,.45,.044,8,.87)
    for sd in [-1,1]:frame.box(.93,-.92+sd*.224,.775,.229,.018,.082,8,.92)
    for sx in [-1,1]:frame.box(.93+sx*.105,-.92,.775,.015,.444,.081,8,.86)
    for i in range(8 if side=='right' else 0):
        x=.88+(i%2)*.097;d=-1.078+(i//2)*.105
        pot(pots,x,d,.783,.036,.048,9,(.49,.54,.45),low)
        succulent(blades,x,d,.824,.88,85+i,low)
    # Two levels of greenery occupy the rear corners while the central entrance stays open.
    for i,(x,d,h,scale) in enumerate([(-1.29,-1.32,2.15,.85),(1.29,-1.17,1.88,1.08)]):
        for k in range(3):
            a=k*TAU/3;tube(frame,[(x+.10*math.cos(a),d+.10*math.sin(a),h+.062),(x,d,2.55)],.0022,10,.78,4)
        if side=='stand' or (x<0)!=(side=='left'):continue
        pot(pots,x,d,h,.107,.093,9,(.57,.59,.50),low);hanging_vine(fronds,x,d,h+.084,scale,885+i,low)
    # Low nursery trays in the shop photograph carry intermittent bright flowers.
    for i in range(6 if side=='right' else 0):
        x=.939+(i%3)*.177;d=.871+(i//3)*.137;h=.097;pot(pots,x,d,.094,.058,h,9,(.44,.48,.40),low)
        rosette(flowers,x,d,.167,.23,73+i,'fernleaf',low)
        for k in range(2 if low else 4):
            a=k*TAU/4+i*.63;cx=x+.021*math.cos(a);cd=d+.019*math.sin(a);cz=.266+.016*math.sin(a)
            if not low:tube(flowers,[(x,d,.183),(cx,cd,cz)],.0026,12,(.54,.76,.43),4)
            for petal in range(4):
                b=petal*TAU/4+.26;out=Vector((math.cos(b),math.sin(b)*.72,.43));side=Vector((-math.sin(b),math.cos(b),.09));pt=Vector((cx,cd,cz))
                ring=[pt,pt+.020*out-.009*side,pt+.030*out,pt+.020*out+.009*side]
                flowers.face(ring,14,(0,.50,.86),(.99,.49,.57) if i%3 else (.95,.90,.77))
    if side=='stand':return [frame]
    return [p for p in [pots,blades,fronds,flowers] if p.faces]


def timber(low=False):
    racks=TailoredPart('01 · Slatted timber bins, price cards and log stands')
    birch=TailoredPart('02 · Pale logs with peeling lenticels and sawn end grain')
    drift=TailoredPart('03 · Irregular driftwood with knots, forks and deep bark ridges')
    rng=random.Random(18504)
    # Stock stays to the left side of the entrance. No timber projects into the main walking aisle.
    for cx,cd,w,d in [(-1.36,1.15,.67,.51),(-1.42,-1.35,.51,.49)]:
        racks.box(cx,cd,.012,w,d,.041,8,.77)
        for side in [-1,1]:
            racks.box(cx+side*(w/2-.012),cd,.045,.029,d,.18,8,.91)
            racks.box(cx,cd+side*(d/2-.011),.048,w,.026,.134,8,.84)
    for i in range(7 if low else 17):
        x=-1.60+(i%5)*.11;d=1.006+(i//5)*.085;h=.37+rng.uniform(0,.59);r=rng.uniform(.034,.061)
        dx=rng.uniform(-.065,.079);dd=rng.uniform(-.046,.039)
        bark(birch,[(x,d,.05),(x+dx*.20,d+dd*.45,h*.33),(x+dx*.72,d+dd*.83,h*.70),(x+dx,d+dd,h)],
             [r*1.13,r*1.05,r*.94,r*.90],i,1,(.94,.93,.89) if i%4 else (.90,.87,.78),7 if low else 13)
    for i in range(3 if low else 6):
        x=-1.59+(i%3)*.146;d=-1.42+math.floor(i/3)*.14;h=.27+rng.random()*.41;r=.06+rng.random()*.029
        path=[(x,d,.045),(x-.037,d+.042,h*.40),(x+.047,d+.036,h*.74),(x+.029,d+.063,h)]
        bark(drift,path,[r*1.12,r,r*.60,r*.40],i+12,0,(.79,.74,.65),7 if low else 13)
        bark(drift,[path[1],(x+.08,d+.037,h*.52),(x+.138,d+.062,h*.79)], [r*.57,r*.35,r*.16],i+33,0,(.78,.75,.68),6 if low else 10)
    # Broad cut-root burl facing the visitor, beside the pale straight birch stock.
    for i,(x,d,z,sz) in enumerate([(-1.15,1.40,.046,.76),(-1.64,1.45,.057,.65),(-1.45,1.51,.021,.46)]):
        root=Vector((x,d,z));pts=[root+Vector((dx*sz,dy*sz,h*sz)) for dx,dy,h in [(0,0,0),(-.038,.021,.14),(.026,.046,.25),(.087,.012,.40),(.066,.044,.55),(.125,.065,.78)]]
        bark(drift,pts,[r*sz for r in [.089,.14,.15,.094,.076,.036]],i+51,0,(.75,.68,.57),7 if low else 19)
        for j,(idx,dx,dy,h) in enumerate([(1,.13,.08,.25),(2,-.17,-.027,.30),(3,-.13,.013,.27)]):
            base=pts[idx];fork=[base,base+Vector((dx*.31,dy,h*.23))*sz,base+Vector((dx*.77,dy*.74,h*.71))*sz,base+Vector((dx,dy*.67,h))*sz]
            bark(drift,fork,[r*sz for r in [.067,.055,.035,.021]],i*3+j,0,(.79,.72,.60),6 if low else 12)
        if not low:
            for j in range(4):
                a=j*TAU/4+.42;start=pts[1]+Vector((.049*math.cos(a),.047*math.sin(a),.034))*sz
                bark(drift,[start,start+Vector((.059*math.cos(a),.060*math.sin(a),.008))*sz,start+Vector((.10*math.cos(a),.095*math.sin(a),-.026))*sz],
                     [.036*sz,.027*sz,.006*sz],i+j,0,(.75,.69,.60),7)
    # The tall naturally branching pale trunk is visible above the low stock in the operator photo.
    root=Vector((-1.41,.34,.022));trunk=[root+Vector(p) for p in [(0,0,0),(.042,0,.37),(-.073,.026,.70),(-.036,.03,1.06),(.017,.046,1.33),(-.028,.002,1.72),(.071,-.02,2.13)]]
    bark(drift,trunk,[.125,.101,.088,.073,.054,.037,.012],5,1,(.80,.75,.65),8 if low else 18)
    for j,(index,dx,dd,up) in enumerate([(2,-.174,.044,.81),(3,.18,-.043,.62),(3,-.18,-.020,.93),(4,.16,.047,.78),(5,-.066,.099,.43),(4,-.34,.04,.63)]):
        base=trunk[index];path=[base+Vector((dx*t+.023*math.sin(t*7+j)*t,dd*t,up*t)) for t in [0,.24,.56,.83,1]]
        bark(drift,path,[.047,.037,.028,.017,.006],j+45,1,(.85,.79,.68),6 if low else 11)
        if not low:bark(drift,[path[2],path[2]+Vector((dx*.28,-.067,.113)),path[2]+Vector((dx*.47,-.087,.237))],[.017,.010,.0036],j,1,(.83,.77,.68),7)
    return [racks,birch,drift]
