"""Oak sales floor and the white exposed service ceiling visible in the branch photos."""
import math
import random
from garments import tube


# Bounds use x across the sales floor, d along it. Keep the actual game stair
# opening out of every upper-floor plank, including its distant silhouette.
STAIR=(-3.5,-20.5,8.5,-15.5)


def pieces(x,d,r,e,upper):
    if not upper:
        yield x,d,r,e
        return
    left,back,right,front=STAIR
    if r<=left or x>=right or e<=back or d>=front:
        yield x,d,r,e
        return
    for q in [(x,d,min(left,r),e),(max(right,x),d,r,e),
              (max(x,left),d,min(r,right),min(e,back)),
              (max(x,left),max(d,front),min(r,right),e)]:
        if q[2]-q[0]>.0001 and q[3]-q[1]>.0001:yield q


def floor(wood,low,upper=False):
    shade=.96
    for rect in pieces(-6.48,-21.95,10.47,9.96,upper):
        wood.top(*rect,.039,0,shade if low else .77)
    if low:
        for k in range(16):
            x=-6.42+k*1.08
            for rect in pieces(x,-21.94,x+.016,9.945,upper):wood.top(*rect,.041,0,.80)
        return
    rng=random.Random(19455)
    half=.0024
    x=-6.475
    while x<10.46:
        width=.145+rng.random()*.036
        right=min(x+width,10.46)
        d=-21.944
        first=True
        while d<9.948:
            length=rng.uniform(.32,1.35) if first else rng.uniform(1.18,2.22)
            end=min(9.948,d+length);first=False
            if end-d>half*2 and right-x>half*2:
                shade=rng.uniform(.89,1.02)
                colour=(shade,shade*rng.uniform(.95,1.0),shade*rng.uniform(.86,.95))
                def plank_tone(xx,dd,h):
                    def distance(cx,cd,rx,rd):return math.hypot(max(0,abs(xx-cx)-rx),max(0,abs(dd-cd)-rd))
                    dist=min(distance(0,0,.65,1.52),distance(-3.50,4,1.71,.36))
                    factor=1-.15*math.exp(-dist*3.1)
                    return tuple(c*factor for c in colour)
                uvx=rng.uniform(.01,.17);uvy=rng.uniform(.02,.18);v=.35+rng.random()*.54
                for a,b,c,e in pieces(x+half,d+half,right-half,end-half,upper):
                    points=[(a,b,.041),(a,e,.041),(c,e,.041),(c,b,.041)]
                    uv=[(uvx+(.96-uvx)*(z-d-half)/(end-d-2*half),uvy+(v-uvy)*(w-x-half)/(right-x-2*half))
                        for w,z,_ in points]
                    if not upper:uv=[(uvx,uvy),(.96,uvy),(.96,v),(uvx,v)]
                    wood.face(points,0,(0,0,1),plank_tone,uv)
            d=end
        x=right


def spot(part,x,d,dx,dd,low):
    top=3.80;end=3.63
    tube(part,[(x,d,3.91),(x,d,top)],.011,2,.87,5)
    tube(part,[(x,d,top),(x+dx,d+dd,end)],.049,1,.94,8 if low else 12)
    if not low:
        from mathutils import Vector
        point=Vector((x+dx,d+dd,end))
        axis=Vector((dx,dd,end-top)).normalized()
        a=axis.cross(Vector((1,0,0))).normalized();b=axis.cross(a)
        ring=[point+.042*(a*math.cos(k*math.tau/14)+b*math.sin(k*math.tau/14)) for k in range(14)]
        part.face(ring,15,axis,.96)


def ceiling(part,low):
    # Leave the back stair's existing void fully open. These visible white
    # members and lights describe the sales area only.
    for d in [-10.8,-5.0,.8,6.6]:
        part.box(2,d,4.32,16.76,.31,.45,1,.91)
        if not low:
            part.box(2,d,4.30,16.79,.37,.035,1,.87)
    for x in [-5.82,-2.30,1.46,5.46,9.46]:
        part.box(x,-.88,4.47,.24,22.64,.27,1,.94)
    for x in [-5.25,.48,6.47]:
        part.box(x,-.87,4.24,.48,22.53,.30,1,.86)
        if not low:
            for z in [-10.12,-7.46,-4.8,-2.14,.52,3.18,5.84,8.49]:
                part.box(x,z,4.232,.50,.030,.321,1,.75)
    if low:return
    for d in [-8.7,-2.55,3.38,8.50]:
        for x in [-4.65,-.39,3.87,8.13]:
            part.box(x,d,3.91,3.84,.046,.043,1,.86)
            for offset in [-1.19,1.18]:
                tip=.062 if offset>0 else -.071
                spot(part,x+offset,d,tip,.060,False)
    for x in [-4.66,-.38,3.87,8.13]:
        for d in [-8.7,-2.55,3.38,8.5]:
            for offset in [-1.42,1.42]:
                tube(part,[(x+offset,d,3.955),(x+offset,d,4.49)],.006,2,.88,4)
