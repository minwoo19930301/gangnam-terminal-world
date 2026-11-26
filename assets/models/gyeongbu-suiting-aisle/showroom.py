"""Two crowded rail fronts on the public seventh-floor passage."""
import math
from garments import Detail, Display, tube
from aisle import floors, corridor_run, side
from tailoring import TailoredPart,jacket


def shop_frame(case,steel,low):
    for x,direction in [(-4.80,1),(4.80,-1)]:
        side(case,x,-3.13,3.13,.07,2.79,2,direction,.82)
        for d in [-3.14,3.14]:
            case.box(x+direction*1.1,d,.07,2.24,.09,2.73,3,.82)
    for side_x in [-1,1]:
        for d in [-2.56,.04,2.57]:
            x=side_x*2.03
            if low:steel.box(x,d,.10,.047,.057,2.64,4,.86)
            else:
                tube(steel,[(x,d,.10),(x,d,2.78)],.023,4,.93,8)
                for h in [1.58,2.67]:
                    tube(steel,[(x,d,h),(side_x*1.70,d,h)],.019,4,n=7)
                    steel.box(x,d,h-.033,.07,.058,.065,4,.87)
                steel.box(x,d,.073,.28,.13,.025,4,.84)
        for h in [1.58,2.67]:
            if low:steel.box(side_x*1.70,.035,h-.016,.035,5.56,.032,4,.94)
            else:tube(steel,[(side_x*1.70,-2.77,h),(side_x*1.70,2.79,h)],.019,4,.94,9)
        # Rear display in each booth remains open through the customer-facing front.
        for d in [-2.09,0,2.09]:
            if not low:
                tube(steel,[(side_x*4.76,d,2.32),(side_x*4.32,d,2.29)],.014,4,n=6)
        if not low:tube(steel,[(side_x*4.32,-2.90,2.29),(side_x*4.32,2.90,2.29)],.017,4,n=7)
    # One short floor-standing rail at each display head. The customer can pass between the feet.
    for x,d in [(-1.52,-2.82),(1.61,-2.72)]:
        for dx in [-.32,.32]:
            steel.box(x+dx,d,.102,.039,.055,1.69,4,.90)
            steel.box(x+dx,d,.066,.059,.40,.040,4,.84)
            if not low:
                for dd in [-.173,.173]:steel.box(x+dx,d+dd,.052,.049,.053,.040,6,.78)
        steel.box(x,d,1.81,.73,.046,.043,4,.96)


def support(hooks,at,top,detail,low):
    if low:return
    # The hook reaches the transverse rail. A dark full-width hanger remains above the higher shoulders.
    hanger=[(-.205,0,top-.112),(-.158,0,top-.087),(-.028,0,top-.032),(0,0,top-.026),(.157,0,top-.086),(.204,0,top-.11)]
    if detail:
        tube(hooks,[at.p(*v) for v in hanger],.012,6,.88,5)
        tube(hooks,[at.p(0,0,top-.027),at.p(.001,0,top+.003),at.p(.019,.002,top+.025),
                    at.p(.015,.002,top+.045),at.p(-.004,.001,top+.047),at.p(-.019,.003,top+.030)],.0047,4,.94,5)
    else:
        hooks.face([at.p(-.184,0,top-.090),at.p(0,0,top-.014),at.p(.184,0,top-.090),
                    at.p(.14,.001,top-.080),at.p(0,.001,top-.039),at.p(-.14,.001,top-.080)],6,at.n(0,1,0),.87)
        hooks.face([at.p(-.007,0,top+.035),at.p(.006,0,top+.034),at.p(.006,0,top-.035),
                    at.p(-.006,0,top-.033)],4,at.n(0,1,0),.89)


def main_ranks(navy,earth,hooks,low):
    for side_x,part in [(-1,navy),(1,earth)]:
        sequence=([6,9,6,9,8,6,9,6,12,8,6,9,13,6] if side_x<0 else [2,11,8,12,10,11,2,8,12,8,11,12,2,8])
        for level,rail in enumerate([1.58,2.67]):
            count=14 if not low else 10
            for j in range(count):
                t=j/(count-1);d=-2.42+5.03*t
                j_ref=round(t*13);seed=j_ref+level*17+(31 if side_x==1 else 0)
                d+=.023*math.sin(seed*4.8)
                x=side_x*(1.70+.044*math.sin(seed*2.9))
                angle=-1.41+.095*math.sin(seed*.83)+.042*math.cos(seed*1.74)
                length=(.90 if level==0 else .78)+.053*math.sin(seed*2.17)
                if j_ref%5==2:length+=.10
                height=rail-.065
                at=Display(x,d,height-length,-side_x,angle)
                color=sequence[(j_ref+level*3)%len(sequence)]
                if side_x==1 and level==0:
                    color=[6,12,13,6,2,9,8,13,6,12,2,9,6,12][j_ref]
                hero=(j_ref in [2,8] and level==1) or (j_ref in [0,6] and level==0)
                jacket(part,hooks,at,length,color,seed,detailed=hero and not low,coat=j_ref%5==2,shirt=j_ref%4==1,low=low)
                support(hooks,at,length,hero,low)
                if not low and j<count-1:
                    extra_length=length*(.96+.03*math.cos(seed*.95))
                    extra=Display(x+side_x*.017,d+.15+.053*math.cos(seed*3.8),height-extra_length,-side_x,angle+.11)
                    jacket(part,hooks,extra,extra_length,sequence[(j_ref+level+3)%14],seed+14,low=True)


def shop_heads(focus,hooks,low):
    # The operator's photograph has a patterned knitted article at the dark rack and camel / olive on the facing rail.
    for x,d,face,angle,top,height,sw,n,coat,shirt in [
        (-1.52,-2.82,1,-1.39,1.76,.91,8,16,False,True),
        (1.61,-2.72,-1,-1.36,1.76,1.02,10,28,True,True),
        (-1.79,2.61,1,1.15,1.55,.89,9,43,False,False),
        (1.71,2.66,-1,1.12,1.54,.97,13,51,True,False)]:
        at=Display(x,d,top-height,face,angle)
        jacket(focus,hooks,at,height,sw,n,detailed=not low,coat=coat,shirt=shirt,low=low)
        support(hooks,at,height,True,low)
    # Knit scarf with two hanging ends over the first checked jacket.
    at=Display(-1.52,-2.82,1.76-.91,1,-1.39)
    for s in [-1,1]:
        previous=None
        for step,(x,q,h,w) in enumerate([(.077,.062,.952,.036),(.106,.081,.855,.039),(.084,.10,.74,.043),(.121,.094,.635,.047)]):
            row=[at.p(s*x+z*w,q+.004*math.cos(z*3+step),h*.91) for z in [-1,0,1]]
            if previous:
                for i in range(2):
                    focus.face([previous[i],previous[i+1],row[i+1],row[i]],12 if s<0 else 14,at.n(0,1,0),.96,
                               [(.12+i*.32,.91-(step-1)*.26),(.44+i*.32,.91-(step-1)*.26),
                                (.44+i*.32,.91-step*.26),(.12+i*.32,.91-step*.26)])
            previous=row


def ties_on_ring(ties,steel,low):
    x,d,z=-1.46,-1.98,2.03
    radius=.215
    tube(steel,[(-1.73,d,z+.12),(x,d,z+.12),(x,d,z)],.014,4,.97,6)
    circle=[(x+radius*math.cos(i*math.tau/20),d+radius*math.sin(i*math.tau/20),z) for i in range(21)]
    tube(steel,circle,.009,4,.95,4 if low else 6)
    for a in [0,2.09,4.19]:
        tube(steel,[(x,d,z),(x+radius*math.cos(a),d+radius*math.sin(a),z)],.0055,4,n=4)
    colours=[(.82,.16,.22),(.17,.31,.51),(.82,.61,.22),(.72,.43,.55),(.31,.69,.59),
             (.75,.26,.25),(.48,.37,.62),(.25,.42,.58),(.86,.63,.35),(.59,.27,.42),(.64,.69,.73),(.27,.59,.62),
             (.95,.58,.15),(.64,.68,.32),(.65,.23,.33),(.67,.62,.76)]
    for i,tint in enumerate(colours):
        a=math.tau*i/len(colours)-.12
        center_x=x+math.cos(a)*radius;center_d=d+math.sin(a)*radius
        width=.035+.005*(i%3);length=.49+.063*math.cos(i*1.5)
        def point(t,h):
            size=.72+.28*math.sin(h*math.pi)
            outward=.005+.013*math.sin(h*3+i)*h
            return (center_x-t*width*size*math.sin(a)+outward*math.cos(a),
                    center_d+t*width*size*math.cos(a)+outward*math.sin(a),
                    z-.012-h*length)
        normal=(math.cos(a),math.sin(a),0)
        profile=[(-.62,0),(.62,0),(.95,.095),(1,.87),(0,1),(-1,.87),(-.95,.095)]
        points=[point(t,h) for t,h in profile]
        ties.face(points,7,normal,tint)
        reverse=[(tx-.0035*normal[0],td-.0035*normal[1],tz) for tx,td,tz in points]
        ties.face(reverse,7,(-normal[0],-normal[1],0),tuple(v*.83 for v in tint))
        if low:continue
        if i%4!=1:
            for k in range(6):
                h=.13+k*.12
                band=[(-.90,h+.055),(.90,h),(.92,h+.020),(-.90,h+.076)]
                stripe=[point(t,h) for t,h in band]
                # Shift the coloured silk tucks clear of the face carrying the base colour.
                stripe=[(tx+.002*normal[0],td+.002*normal[1],tz) for tx,td,tz in stripe]
                ties.face(stripe,7,normal,(.85,.78,.60) if i%2==0 else (.28,.31,.40))
        tube(steel,[(center_x,center_d,z-.016),(center_x,center_d,z+.010),
                    (center_x-.014*normal[0],center_d-.014*normal[1],z+.012)],.0035,4,n=4)


def rear_wall(stock,hooks,low):
    for side_x in [-1,1]:
        for j in range(4):
            d=-2.15+j*1.45
            length=[.92,1.05,.80,.92][j]
            at=Display(4.32*side_x,d,2.23-length,-side_x,.10*math.sin(j*3))
            sw=([9,6,8,12] if side_x<0 else [10,2,13,11])[j]
            jacket(stock,hooks,at,length,sw,65+j,detailed=False,coat=j==1,shirt=j in [0,2],low=low)
            support(hooks,at,length,False,low)
            if not low and j<3:
                for k in [1,2,3]:
                    at=Display(4.33*side_x,d+k*.335,2.22-length,-side_x,-.84+.10*math.cos(j*4+k))
                    jacket(stock,hooks,at,length,([8,6,9] if side_x<0 else [11,12,10])[k-1],j+k,low=True)


def sections(low=False):
    floor=Detail('01 · Polished dark linoleum tiles and green inserts')
    cap=Detail('02 · Continuous low ceiling and fluorescent lenses')
    booth=Detail('03 · Rear walls and open public shop returns')
    steel=Detail('04 · Double-tier telescopic rails and independent end stands')
    navy=TailoredPart('05 · Midnight pinstripe and charcoal jacket ranks')
    earth=TailoredPart('06 · Checked, camel and birdseye jacket ranks')
    heads=TailoredPart('07 · Front-facing wool ensembles, scarf and rear display')
    hooks=Detail('08 · Cuff tickets, hanger hooks, lapel and sleeve fasteners')
    floors(floor,cap,low);corridor_run(floor,cap,low)
    shop_frame(booth,steel,low);main_ranks(navy,earth,hooks,low)
    shop_heads(heads,hooks,low);rear_wall(heads,hooks,low);ties_on_ring(heads,steel,low)
    return [p for p in [floor,cap,booth,steel,navy,earth,heads,hooks] if p.faces]
