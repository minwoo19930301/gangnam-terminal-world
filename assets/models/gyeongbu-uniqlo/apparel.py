"""Curved jersey and twill with open crew necks, open hems and folded edges."""
import math
from mathutils import Vector
from garments import tube

TAU=math.tau
CREAM=(.95,.93,.86)
INK=(.22,.26,.31)
PALE=(.76,.82,.85)
DENIM=(.44,.59,.70)
MOSS=(.59,.68,.58)
ROSE=(.81,.58,.56)
PEACH=(.87,.61,.44)
BURGUNDY=(.50,.25,.28)


def dim(col,factor):
    return tuple(v*factor for v in col)


def loft(part,at,rows,sw,colour,n=18,*,ripple=0,seed=0,cap=True):
    """Cross-sections in (right, forward, height) order, with optional cloth fluting."""
    def vertex(j,a):
        cx,q,h,rx,rd=rows[j]
        amp=ripple*(.52+.48*(1-j/(len(rows)-1)))
        w=1+amp*(math.sin(5*a+.53*j+seed)+.32*math.cos(9*a+seed))
        return at.p(cx+rx*w*math.sin(a),q+rd*w*math.cos(a),h)
    def normal(j,a):
        tangent=vertex(j,a+.002)-vertex(j,a-.002)
        vertical=vertex(min(j+1,len(rows)-1),a)-vertex(max(j-1,0),a)
        normal=tangent.cross(vertical)
        if normal.dot(at.n(math.sin(a),math.cos(a),0))<0:normal.negate()
        return normal.normalized()
    for j in range(len(rows)-1):
        for k in range(n):
            corners=[(j,k/n),(j,(k+1)/n),(j+1,(k+1)/n),(j+1,k/n)]
            part.curved([vertex(r,t*TAU) for r,t in corners],sw,[normal(r,t*TAU) for r,t in corners],
                        colour,[(t,.03+.94*r/(len(rows)-1)) for r,t in corners])
    if cap:
        for r,h in [(0,-1),(len(rows)-1,1)]:
            part.face([vertex(r,k*TAU/n) for k in range(n)],sw,at.n(0,0,h),colour)


def short_sleeve(part,at,colour,w,length,sign):
    # Rings run normal to the sloping shoulder, so each open cuff falls
    # at an angle over the arm rather than ending in a horizontal cap.
    levels=[(.76,.865,.093,.065),(.92,.826,.102,.069),(1.06,.752,.098,.066),
            (1.16,.648,.085,.054),(1.18,.614,.084,.053)]
    def sleeve(j,t):
        tx,h,rw,rq=levels[j];a=TAU*t
        prev=levels[max(0,j-1)];nxt=levels[min(len(levels)-1,j+1)]
        dx=(nxt[0]-prev[0])*w;dz=(nxt[1]-prev[1])*length;unit=math.hypot(dx,dz)
        return at.p(sign*(tx*w-dz/unit*rw*math.cos(a)),rq*math.sin(a),
                    length*h+dx/unit*rw*math.cos(a))
    for j in range(len(levels)-1):
        for k in range(14):
            coords=[(j,k/14),(j,(k+1)/14),(j+1,(k+1)/14),(j+1,k/14)]
            normals=[]
            for ii,t in coords:
                tx,h,_,_=levels[ii]
                normals.append((sleeve(ii,t)-at.p(sign*tx*w,0,h*length)).normalized())
            part.curved([sleeve(ii,t) for ii,t in coords],4,normals,dim(colour,.95 if j==3 else .985),
                        [(t,.05+.90*ii/(len(levels)-1)) for ii,t in coords])
    edge=[sleeve(len(levels)-1,k/14) for k in range(14)]
    part.face(edge,4,at.n(sign*.25,0,-.88),dim(colour,.68))
    tube(part,edge+[edge[0]],.0021,8,dim(colour,.94),4)


def worn_jersey(part,at,colour,w,length,seed):
    sections=[(0,.72,.089),(.024,.74,.091),(.14,.80,.096),(.32,.82,.099),
              (.55,.87,.108),(.72,.94,.112),(.80,1.00,.104),(.87,.98,.092),
              (.923,.81,.073),(.960,.56,.061),(1,.332,.051)]
    count=30
    def p(j,a):
        s,frac,dep=sections[j]
        hem=(1-s)*.003*math.sin(4*a+seed)
        neck=(s**10)*(.026*max(0,math.cos(a))+.004*max(0,-math.cos(a)))
        shape=1+.021*(1-s)*math.sin(6*a+seed+s*.75)
        return at.p(w*frac*math.sin(a)*shape,dep*math.cos(a)*shape,hem+s*length-neck)
    def n(j,a):
        norm=(p(j,a+.002)-p(j,a-.002)).cross(p(min(j+1,len(sections)-1),a)-p(max(j-1,0),a))
        if norm.dot(at.n(math.sin(a),math.cos(a),0))<0:norm.negate()
        return norm.normalized()
    for j in range(len(sections)-1):
        for k in range(count):
            corners=[(j,k/count),(j,(k+1)/count),(j+1,(k+1)/count),(j+1,k/count)]
            points=[p(jj,t*TAU) for jj,t in corners]
            shades={tuple(point):dim(colour,.965+.022*math.cos(t*TAU*6+seed))
                    for point,(jj,t) in zip(points,corners)}
            part.curved(points,4,[n(jj,t*TAU) for jj,t in corners],lambda x,d,h:shades[(x,d,h)],
                        [(t,.03+.94*sections[jj][0]) for jj,t in corners])
    rim=[p(len(sections)-1,k*TAU/count) for k in range(count+1)]
    tube(part,rim,.0075,8,dim(colour,.93),6)
    for side in [-1,1]:short_sleeve(part,at,colour,w,length,side)


def jersey(part,at,colour,*,w=.246,length=.64,worn=False,seed=0):
    if worn:
        worn_jersey(part,at,colour,w,length,seed)
        return
    # Both panels slope into the ribbed neck. A visible hole separates the
    # front edge and the raised back edge, including on the empty hanger.
    ts=[-1,-.78,-.51,-.34,-.18,0,.18,.34,.51,.78,1]
    ss=[0,.027,.22,.52,.78,.90,1]
    def p(t,s,front=True):
        neckline=math.exp(-((t/.285)**2))
        top=length*(1-.15*abs(t)**1.5-(.11 if front else .036)*neckline)
        half=w*(1.01-.068*math.sin(s*math.pi)+.035*(1-s))
        body=.044+.001*math.sin((.20+s*.75)*math.pi)
        depth=(body if front else -.78*body)*(1-.62*t*t)
        folds=(.008+.007*(1-s))*math.sin(9.8*t+s*.86+seed)+.004*math.cos(17.7*t+seed*.7)
        hem=.007*math.sin(6.5*t+seed)+.003*t
        return at.p(t*half,depth+folds,hem+s*(top-hem))
    def normal(t,s,front):
        n=(p(t+.003,s,front)-p(t-.003,s,front)).cross(p(t,s+.003,front)-p(t,s-.003,front))
        if n.dot(at.n(0,1 if front else -1,0))<0:n.negate()
        return n.normalized()
    for front in [True,False]:
        for t0,t1 in zip(ts,ts[1:]):
            for s0,s1 in zip(ss,ss[1:]):
                corners=[(t0,s0),(t1,s0),(t1,s1),(t0,s1)]
                light=(.965 if front else .84)*(.94 if s0==0 else 1)
                points=[p(t,s,front) for t,s in corners]
                shaded={tuple(point):dim(colour,light*(.89+.08*math.cos(t*9.8+s*.86+seed)
                         +.017*math.cos(t*16+s*2-seed)*(.95-.52*s))) for point,(t,s) in zip(points,corners)}
                part.curved(points,4,[normal(t,s,front) for t,s in corners],
                            lambda x,d,h:shaded[(x,d,h)],[(.02+.96*(t+1)/2,.02+s*.96) for t,s in corners])
    for t0,t1 in zip(ts,ts[1:]):
        if t0>=.34 or t1<=-.34:
            part.face([p(t0,1),p(t1,1),p(t1,1,False),p(t0,1,False)],4,at.n(0,0,1),dim(colour,.93))
    for sign in [-1,1]:
        for a,b in zip(ss[:4],ss[1:4]):
            part.face([p(sign,a),p(sign,b),p(sign,b,False),p(sign,a,False)],4,at.n(sign,0,0),dim(colour,.83))
        # The cuff looks open from below. A cuff ring overlaps the fabric at its seam.
        tube(part,[p(sign*.98,.035),p(sign*.65,.028),p(sign*.32,.026),p(0,.029)],.0016,8,dim(colour,.89),4)
        short_sleeve(part,at,colour,w,length,sign)
    neck=[p(t,1) for t in [-.34,-.245,-.15,-.07,0,.07,.15,.245,.34]]
    neck.extend(p(t,1,False) for t in [.34,.23,.1,0,-.1,-.23,-.34])
    tube(part,neck+[neck[0]],.0095,8,dim(colour,.93),7)
    if not worn:
        part.face([p(-.068,.976,False)+at.front*.010,p(.068,.976,False)+at.front*.010,
                   p(.068,.932,False)+at.front*.010,p(-.068,.932,False)+at.front*.010],10,at.n(0,1,0),.91,
                  [(0,.60),(1,.60),(1,1),(0,1)])


def wood_hanger(part,at,height=.65):
    outline=[(-.228,height-.116),(-.209,height-.080),(-.057,height-.029),(-.030,height+.012),
             (.030,height+.012),(.057,height-.029),(.209,height-.080),(.228,height-.116),
             (.175,height-.111),(.022,height-.062),(-.022,height-.062),(-.175,height-.111)]
    for side in [-1,1]:
        part.face([at.p(x,side*.014,h) for x,h in outline],14,at.n(0,side,0),.95)
    for i,(x,h) in enumerate(outline):
        xx,hh=outline[(i+1)%len(outline)]
        part.face([at.p(x,-.014,h),at.p(x,.014,h),at.p(xx,.014,hh),at.p(xx,-.014,hh)],
                  14,at.n(hh-h,0,x-xx),.87)
    pts=[(0,0,height+.011),(0,0,height+.057),(.024,0,height+.075),
         (.030,0,height+.099),(.016,0,height+.119),(-.008,0,height+.122),(-.021,0,height+.102)]
    tube(part,[at.p(*v) for v in pts],.004,2,.99,6)


def folded(part,at,colour,seed,*,w=.40,depth=.40,denim=False,featured=False):
    # The continuous upper surface turns back under itself at the front edge.
    # Both side profiles reveal the hollow return, as in the branch trouser stacks.
    sw=5 if denim else 4
    radius=.020+.003*math.sin(seed*.67)
    front=depth/2-radius
    profile=[(-depth/2,.013),(front-.085,.012),(front,.012)]
    segments=8 if featured else 5
    for j in range(1,segments+1):
        a=-math.pi/2+math.pi*j/segments
        profile.append((front+radius*math.cos(a),.012+radius+radius*math.sin(a)))
    profile.extend([(front-.12,.012+2*radius+.003),(-depth/2+.009,.012+2*radius+.007)])
    across=[-1,-.55,0,.54,1] if featured else [-1,0,1]
    def point(t,j,inner=False):
        q,h=profile[j]
        wrinkle=.003*math.sin(t*6.7+seed+q*4)+.0019*t*t
        if inner:
            prev=profile[max(0,j-1)];nxt=profile[min(len(profile)-1,j+1)]
            dq=nxt[0]-prev[0];dh=nxt[1]-prev[1];size=math.hypot(dq,dh)
            if size>0:q-=.004*dh/size;h+=.004*dq/size
        corner=.010*abs(t)**8*(1 if q>0 else -1)
        return at.p(t*w/2+.009*q*math.sin(seed*.64),q+.006*math.sin(t*3.2+seed)-corner,h+wrinkle)
    for j in range(len(profile)-1):
        for a,b in zip(across,across[1:]):
            coords=[(a,j),(b,j),(b,j+1),(a,j+1)]
            edges=[point(t,k) for t,k in coords]
            delta=profile[j+1][0]-profile[j][0]
            climb=profile[j+1][1]-profile[j][1]
            normal=at.n(0,climb,-delta)
            part.face(edges,sw,normal,colour,[(.02+.96*(t+1)/2,.02+k/(len(profile)-1)*.96) for t,k in coords])
        for side in [-1,1]:
            part.face([point(side,j),point(side,j+1),point(side,j+1,True),point(side,j,True)],
                      sw,at.n(side,0,0),dim(colour,.74))
    for side in [-1,1]:
        # The inner roll sits just behind the lip. Keep its top and bottom
        # surfaces continuous instead of triangulating a concave end polygon.
        def inside(q,h):
            return at.p(side*(w/2-.005)+.008*q*math.sin(seed*.64),q+.004*math.sin(side*3.2+seed),h)
        contour=[(-depth/2+.012,.023),(front-.005,.022)]
        contour.extend([(front+(radius-.007)*math.cos(a),.012+radius+(radius-.007)*math.sin(a))
                        for a in [-math.pi/2+j*math.pi/segments for j in range(segments+1)]])
        contour.append((-depth/2+.021,.012+2*radius-.004))
        centre=inside(-depth*.20,.012+radius)
        for j in range(len(contour)-1):
            part.face([centre,inside(*contour[j]),inside(*contour[j+1])],sw,at.n(side,0,0),dim(colour,.73))
    last=len(profile)-1
    part.face([point(-1,0),point(1,0),point(1,last),point(-1,last)],sw,at.n(0,-1,0),dim(colour,.81))
    if not featured:return
    z=.012+radius*2+.011
    if denim:
        pocket=[(-.16,-.09),(-.030,-.107),(-.023,-.002),(-.082,.038),(-.155,-.001)]
        part.face([at.p(x,q,z+.004) for x,q in pocket],5,at.n(0,0,1),dim(colour,.98))
        tube(part,[at.p(x,q,z+.006) for x,q in pocket+[pocket[0]]],.0018,8,(.75,.66,.51),5)
        for side in [-1,1]:
            tube(part,[at.p(side*(w*.5-.010),q,z+.002) for q in [-depth*.44,-.04,depth*.26]],
                 .0018,8,dim(colour,1.06),5)
    else:
        collar=[at.p(.059*math.sin(a),-.117+.036*math.cos(a),z+.004) for a in [k*TAU/18 for k in range(19)]]
        part.face(collar[:-1],4,at.n(0,0,1),dim(colour,.60))
        tube(part,collar,.0056,8,dim(colour,.91),5)
    # Folded size label hangs over the cloth edge; the atlas is a new graphic.
    pts=[at.p(.062,.046,z+.013),at.p(.149,.044,z+.013),at.p(.154,.165,z+.010),at.p(.067,.169,z+.010)]
    part.face(pts,10,at.n(0,0,1),.96,[(0,1),(1,1),(1,0),(0,0)])
