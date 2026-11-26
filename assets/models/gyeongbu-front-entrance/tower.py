"""Street-side ceramic gables, the original vertical channel name and directory."""
import math
from geometry import Part
from hangul import letters


def clipped(poly,fn):
    out=[]
    for i,a in enumerate(poly):
        b=poly[(i+1)%len(poly)];fa,fb=fn(*a),fn(*b)
        if fa>=0:out.append(a)
        if (fa<0)!=(fb<0):
            t=fa/(fa-fb)
            out.append(tuple(q+(r-q)*t for q,r in zip(a,b)))
    return out


def name(part,text,first,baseline,size,pitch,vertical=False,low=False):
    # Keep this diagrammatic industrial lettering separate from the operator's
    # modern horizontal logotype. The physical return, cap and its shadow matter.
    for i,c in enumerate(text):
        x,h=(first,baseline-i*pitch) if vertical else (first+i*pitch,baseline)
        for path in letters[c]:
            pts=[(x+(px-.5)*size,h+py*size) for px,py in path]
            thick=size*(.093 if vertical else .106)
            if low:
                for a,b in zip(pts,pts[1:]):
                    dx,dz=b[0]-a[0],b[1]-a[1];r=thick/(2*math.hypot(dx,dz));ox,oz=-dz*r,dx*r
                    part.face([(a[0]+ox,.391,a[1]+oz),(b[0]+ox,.391,b[1]+oz),
                               (b[0]-ox,.391,b[1]-oz),(a[0]-ox,.391,a[1]-oz)],7,(0,1,0),(.86,.94,1))
                continue
            back=.165 if vertical else .142
            front=.387 if vertical else .249
            part.stroke(pts,thick,back,front,7,(.88,.952,1),5)
            part.stroke(pts,thick*.73,front,front+.012,7,(.94,.98,1),7)


def facade(low=False):
    gable=Part('01 · Opposing terracotta gables and the street plinth')
    board=Part('02 · Ceramic sign field and folded sill returns')
    stairs=Part('03 · Fluted stair glazing and segmented fan crown')
    metal=Part('04 · Blue return-channel Hangul and red emblem','Metal')
    hardware=Part('05 · Letter standoffs, rail shadows and face fixings','Metal')
    base=3.25
    # The current road view shows a second narrower wedge beyond the white sign.
    for direction,start,width,top in [(-1,-4.50,18.00,45.0),(1,3.0,12.70,42.75)]:
        reach=width*(1-base/top)
        def edge(z):return width*(1-z/top)
        if low:
            gable.face([(start,-2.58,base),(start+direction*reach,-2.58,base),(start,-2.58,top)],2,(0,1,0),1)
        else:
            for i in range(math.ceil(reach/1.85)):
                for j in range(math.ceil((top-base)/1.65)):
                    a=i*1.85;b=min(reach,(i+1)*1.85)
                    h0=base+j*1.65;h1=min(top,base+(j+1)*1.65)
                    patch=clipped([(a,h0),(b,h0),(b,h1),(a,h1)],lambda dx,h:edge(h)-dx)
                    if len(patch)<3:continue
                    def tone(x,d,z):
                        streak=.008*math.sin(x*1.8)+.006*math.sin(x*5.17+z*.028)
                        k=.989+streak-.067*(1-(z-base)/(top-base))**2
                        return k,k*.992,k*.99
                    gable.face([(start+direction*x,-2.58,h) for x,h in patch],2,(0,1,0),tone)
            a=start+direction*reach
            gable.face([(start,-2.59,base),(a,-2.59,base),(a,-2.21,base-.055),(start,-2.21,base-.055)],3,(0,0,-1),.85)
            gable.face([(start,-2.58,top),(a,-2.58,base),(a,-2.14,base),(start,-2.14,top)],2,(direction,0,.35),.835)
    # Only skin the existing facade beside the portal. Leave the recorded
    # public entry bays at u38 and u60 open to their recessed glass doors.
    for a,b in [(-21.2,-18.8),(-14.0,-4.52),(3.0,3.3),(7.9,14.8)]:
        if low:
            gable.front(a,-.40,b,base-.03,-3.41,3,.78)
            continue
        n=max(1,math.ceil((b-a)/1.2))
        for i in range(n):
            left=a+(b-a)*i/n;right=a+(b-a)*(i+1)/n
            gable.front(left,-.40,right,base-.031,-3.41,3,.88)
        gable.box((a+b)/2,-3.39,-.12,b-a,.10,.28,1,.76)
    for a,b in [(-18.8,-14.0),(3.3,7.9)]:
        gable.front(a,2.80,b,base-.031,-3.41,3,.86)
        for x in [a+.035,b-.035]:gable.box(x,-3.43,-.14,.066,.16,2.96,1,.83)
    board.front(-2.87,.01,2.87,44.52,.065,4,.94)
    board.front(-2.87,.01,2.87,3.21,.095,0,.83)
    if not low:
        for j in range(25):
            z=.05+j*1.775
            for i in range(4):
                a=-2.865+i*1.432
                b=a+1.432
                value=.954+.012*math.sin(1.16*j+i*.83)
                board.front(a+.003,z+.006,b-.003,min(44.56,z+1.765),.084,4,value)
            # Very light weathering gathers along the old horizontal joints.
            board.front(-2.86,z,2.86,z+.013,.087,4,.82)
            if 2<j<24 and j%2==0:
                for x in [-2.71,2.68]:
                    hardware.front(x-.015,z+.035,x+.015,z+.059,.098,6,.87)
        for x in [-2.89,2.89]:board.box(x,.064,.03,.032,.058,44.48,6,.76)
    # The dark glazed stair strip flanks the lettering in the same plane as
    # the fan cap. Original boxes behind the new skin still form the tower.
    stairs.front(-4.46,.04,-2.93,42.38,-.006,5,(.71,.76,.80))
    if not low:
        for j in range(21):
            z=.08+j*2.04
            stairs.front(-4.46,z,-2.932,min(42.39,z+1.98),.004,5,(.65+.011*(j%4),.71,.77))
            stairs.box(-3.695,.037,z+1.985,1.56,.058,.048,6,.81)
        for x in [-4.48,-2.93]:stairs.box(x,.028,.08,.048,.059,42.26,6,.75)
    cx,cz=-3.42,42.35;rx,rz=2.06,2.12
    slices=12 if low else 32
    for i in range(slices):
        a,b=i*math.pi/slices,(i+1)*math.pi/slices
        def fan(t,r):return (cx+r*rx*math.cos(t),.105,cz+r*rz*math.sin(t))
        stairs.face([(cx,.105,cz),fan(a,1),fan(b,1)],5,(0,1,0),(.63,.71,.8))
        if not low:
            p0,p1=fan(a,1),fan(b,1)
            hardware.stroke([(p0[0],p0[2]),(p1[0],p1[2])],.052,.109,.16,6,.79)
    if not low:
        for a in [0,math.pi*.17,math.pi*.34,math.pi*.50,math.pi*.66,math.pi*.83,math.pi]:
            hardware.stroke([(cx,cz),(cx+rx*math.cos(a),cz+rz*math.sin(a))],.056,.106,.155,6,.81)
    # The nine syllables run downward. The lower storey directory reads 678층.
    name(metal,'서울고속버스터미널',0,36.79,2.83,3.08,True,low)
    name(metal,'의류도매상가',-2.22,9.24,.83,.882,False,low)
    name(metal,'678층',-1.60,7.88,1.04,1.05,False,low)
    if not low:
        for i in range(9):
            h=36.79-i*3.08
            for x,dh in [(-.77,.65),(.71,2.05)]:
                hardware.box(x,.130,h+dh,.115,.109,.13,5,.73)
    # Two unequal oval strokes are visible above the characters on the
    # installed red emblem. Trace the photographed outline, independent of CI.
    hoop=[(.48+1.10*math.cos(a*math.tau/30),40.48+.87*math.sin(a*math.tau/30)) for a in range(31)]
    sweep=[(-1.30,39.85),(-.33,41.46),(.05,41.03),(.64,39.87)]
    for curve in [hoop,sweep]:
        metal.stroke(curve,.16,.175,.349,2,(.86,.51,.48),3)
    return [p for p in [gable,board,stairs,metal,hardware] if p.faces]
