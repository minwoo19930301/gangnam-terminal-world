"""Child-sized wire-grid displays, with open collars, short sleeves and folded stock."""
import math
from mathutils import Vector
from geometry import Part

class Detail(Part):
    rows=4

def tube(part,path,r,sw,light=.91,n=6):
    points=[Vector(p) for p in path]
    rings=[]
    for i,p in enumerate(points):
        tangent=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        a=tangent.cross(Vector((0,0,1)) if abs(tangent.z)<.87 else Vector((0,1,0))).normalized()
        b=tangent.cross(a)
        rings.append([p+r*(a*math.cos(k*math.tau/n)+b*math.sin(k*math.tau/n)) for k in range(n)])
    for i in range(len(points)-1):
        for j in range(n):
            k=(j+1)%n;normal=(rings[i][j]+rings[i][k])*.5-points[i]
            part.face([rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j]],sw,normal,light)

class Display:
    def __init__(self,x,d,z,face,angle=0):
        c,s=math.cos(angle),math.sin(angle)
        self.origin=Vector((x,d,z));self.width=Vector((s,-face*c,0));self.front=Vector((face*c,s,0))
    def p(self,t,q,h):return self.origin+t*self.width+q*self.front+Vector((0,0,h))
    def n(self,t,q,h):return t*self.width+q*self.front+Vector((0,0,h))

def hanger(part,at,top,w,light,low=False):
    line=lambda v:[at.p(*p) for p in v]
    if low:
        tube(part,line([(-w,.006,top-.09),(0,.006,top+.008),(w,.006,top-.09)]),.009,light,n=4)
        return
    tube(part,line([(-w,0,top-.11),(-w*.87,0,top-.078),(-.043,0,top-.018),(0,0,top+.001),
                    (.041,0,top-.015),(w*.87,0,top-.078),(w,0,top-.11),(-w,0,top-.11)]),.0074,light,n=6)
    tube(part,line([(0,0,top+.001),(0,0,top+.036),(.028,-.002,top+.056),(.027,-.004,top+.079),
                    (.010,-.005,top+.091),(-.010,-.004,top+.087),(-.019,-.003,top+.073)]),.0048,4,n=5)

def sleeve(part,at,side,H,W,sw,trim,long=False):
    points=[(W*.74,H*.874),(W*1.02,H*.817),(W*1.24,H*(.61 if long else .706)),(W*1.29,H*(.46 if long else .641))]
    rings=[]
    count=10
    for i,(t,h) in enumerate(points):
        p=points[max(0,i-1)];q=points[min(i+1,len(points)-1)]
        dx=side*(q[0]-p[0]);dz=q[1]-p[1];length=math.hypot(dx,dz)
        nx,nz=-dz/length,dx/length
        width=W*[.395,.365,.30,.295][i]
        rings.append([at.p(side*t+nx*width*math.cos(k*math.tau/count),.008+.041*math.sin(k*math.tau/count),h+nz*width*math.cos(k*math.tau/count)) for k in range(count)])
    for i in range(len(rings)-1):
        for j in range(count):
            k=(j+1)%count
            # The front/back silhouette remains generous at the shoulder and narrows at the cuff.
            a,b=rings[i][j],rings[i][k]
            normal=(a+b)*.5-at.p(side*points[i][0],.008,points[i][1])
            part.face([a,b,rings[i+1][k],rings[i+1][j]],trim if i==2 else sw,normal,.93,
                      [(.03+.09*j/count,.08),(.03+.09*(j+1)/count,.08),(.03+.09*(j+1)/count,.21),(.03+.09*j/count,.21)])
    part.face(rings[-1],6,at.n(side*.38,0,-.8),.73)

def tee(part,at,H,W,sw,raglan,variant,low=False):
    def vertex(t,s,front):
        top=H*(1-.105*abs(t)**1.38-.117*max(0,1-(abs(t)/.40)**1.8))
        hem=.009*math.sin(t*5.4+variant*.74)+.004*t*t
        half=W*(.98-.075*math.sin(s*math.pi)+.02*s)
        folds=.0085*math.sin(t*8.2+variant*.79+.72*s)*(.34+.66*(1-s))
        depth=.009+(.033 if front else -.031)*(1-.70*t*t)+(.007 if front else -.005)+folds
        return at.p(t*half,depth,hem+s*(top-hem))
    if low:
        for front in [True,False]:
            path=[(-.25,.99),(-.91,.95),(-1.22,.70),(-1.05,.56),(-.84,.63),(-.91,.02),(.91,.02),(.84,.63),(1.05,.56),(1.22,.70),(.91,.95),(.25,.99)]
            part.face([vertex(t,s,front) for t,s in path],sw,at.n(0,1 if front else -1,0),.97)
        return
    ts=[-1,-.78,-.54,-.36,-.17,0,.17,.36,.54,.78,1]
    ss=[0,.045,.22,.46,.68,.85,1]
    for front in [True,False]:
        for i,(t0,t1) in enumerate(zip(ts,ts[1:])):
            for j,(s0,s1) in enumerate(zip(ss,ss[1:])):
                uv=[((t+1)*.44+.06,.055+s*.89) for t,s in [(t0,s0),(t1,s0),(t1,s1),(t0,s1)]]
                shade=(.945+.043*math.cos((t0+t1)*4+variant*.74)) if front else .80
                part.face([vertex(t0,s0,front),vertex(t1,s0,front),vertex(t1,s1,front),vertex(t0,s1,front)],sw,at.n(0,1 if front else -1,0),shade,uv)
    for t in [-1,1]:
        for s0,s1 in zip(ss,ss[1:]):
            part.face([vertex(t,s0,False),vertex(t,s0,True),vertex(t,s1,True),vertex(t,s1,False)],sw,at.n(t,0,0),.82,
                      [(.01,.05),(.05,.05),(.05,.15),(.01,.15)])
    for t0,t1 in zip(ts,ts[1:]):
        part.face([vertex(t0,0,False),vertex(t1,0,False),vertex(t1,0,True),vertex(t0,0,True)],sw,at.n(0,0,-1),.79,
                  [(.01,.01),(.15,.01),(.15,.03),(.01,.03)])
        # Connect the shoulder tops but leave a physical opening between the two collar edges.
        if t0>=.36 or t1<=-.36:
            part.face([vertex(t0,1,False),vertex(t1,1,False),vertex(t1,1,True),vertex(t0,1,True)],raglan,at.n(0,0,1),.91)
    trims=[vertex(t,1,True)+at.front*.002 for t in [-.41,-.33,-.23,-.12,0,.12,.23,.33,.41]]
    tube(part,trims,.0075,raglan,.98)
    tube(part,[vertex(t,1,False) for t in [-.4,-.22,0,.22,.4]],.0055,raglan,.83)
    for side in [-1,1]:sleeve(part,at,side,H,W,raglan,7 if variant%3==0 else raglan,variant%6==3)
    if variant%6==1:
        for side in [-1,1]:
            part.face([at.p(side*.005,.049,H*.891),at.p(side*.061,.029,H*.978),at.p(side*.092,.053,H*.849),at.p(side*.044,.062,H*.802)],raglan,at.n(0,1,.2),.95)
        part.face([at.p(-.012,.054,H*.815),at.p(.012,.054,H*.815),at.p(.012,.057,H*.665),at.p(-.012,.057,H*.665)],raglan,at.n(0,1,0),.87)
        for hh in [.72,.78]:part.face([at.p(.006*math.cos(k*math.tau/7),.06,H*hh+.006*math.sin(k*math.tau/7)) for k in range(7)],7,at.n(0,1,0),.97)
    # A small folded neck tag is seen above the front binding.
    part.face([at.p(-.019,-.014,H*.93),at.p(.019,-.014,H*.93),at.p(.017,-.008,H*.897),at.p(-.016,-.008,H*.898)],7,at.n(0,1,0),.93)

def shorts(part,at,w,h,sw,variant,low=False):
    shape=[(-w,h),(-w*.91,h+.012),(w*.91,h+.012),(w,h),(w*1.13,.025),
           (w*.22,0),(0,h*.40),(-w*.20,.005),(-w*1.13,.023)]
    for face in [1,-1]:
        verts=[at.p(x,face*(.026+.012*math.cos(x*12+variant)),z) for x,z in shape]
        if not low:
            # Concave crotch: split into two editable halves to keep the legs apart.
            for indices in [[0,1,2,3,6],[3,4,5,6],[6,7,8,0]]:
                part.face([verts[i] for i in indices],sw,at.n(0,face,0),.94 if face>0 else .81,[(.12+.70*(shape[i][0]+w)/(2*w),.09+.78*shape[i][1]/h) for i in indices])
        else:
            for ids in [[0,1,2,3,6],[3,4,5,6],[6,7,8,0]]:part.face([verts[i] for i in ids],sw,at.n(0,face,0),.94)
    if not low:
        for j,(x,z) in enumerate(shape):
            xx,zz=shape[(j+1)%len(shape)]
            part.face([at.p(x,-.022,z),at.p(xx,-.022,zz),at.p(xx,.024,zz),at.p(x,.024,z)],sw,at.n(zz-z,0,x-xx),.83)
        part.face([at.p(-w,.042,h-.025),at.p(w,.042,h-.025),at.p(w,.044,h+.011),at.p(-w,.044,h+.011)],6,at.n(0,1,0),.92)
        tube(part,[at.p(-w*.84,0,h+.051),at.p(w*.84,0,h+.051)],.006,4)
        for t in [-w*.75,w*.75]:part.face([at.p(t-.013,.015,h-.001),at.p(t+.013,.015,h-.001),at.p(t+.013,.015,h+.066),at.p(t-.013,.015,h+.066)],4,at.n(0,1,0),.93)

def folded(part,x,d,z,w,depth,sw,variant):
    # Raised back fold, rounded cloth corners and a slightly uneven lip over the table edge.
    rx,rz=min(.035,w*.10),min(.034,depth*.10)
    outline=[(-w/2+rx,-depth/2),(w/2-rx,-depth/2),(w/2,-depth/2+rz),(w/2,depth/2-rz),(w/2-rx,depth/2),
             (-w/2+rx,depth/2),(-w/2,depth/2-rz),(-w/2,-depth/2+rz)]
    thick=.016+.004*(variant%3)
    top=[(x+a,d+b,z+thick+.008*(a/w+.5)+.004*math.sin(b*15+variant)) for a,b in outline]
    bulge=[(x+a*1.025,d+b*1.015,z+thick*.51+.0018*math.sin(variant+4*b)) for a,b in outline]
    bottom=[(x+a,d+b,z) for a,b in outline]
    part.face(top,sw,(0,0,1),.97,[(.10+.80*(a/w+.50),.13+.72*(b/depth+.50)) for a,b in outline])
    for i,(a,b) in enumerate(outline):
        j=(i+1)%len(outline);aa,bb=outline[j]
        part.face([bottom[i],bottom[j],bulge[j],bulge[i]],sw,(bb-b,a-aa,-.12),.71,
                  [(.075,.09),(.89,.09),(.89,.135),(.075,.135)])
        part.face([bulge[i],bulge[j],top[j],top[i]],sw,(bb-b,a-aa,.12),.86,
                  [(.075,.09),(.89,.09),(.89,.135),(.075,.135)])

def draped(part,front,d,w,sw,phase):
    # A jersey lies on the table and rolls over its near edge. Its hem stays
    # visible to a shopper in the corridor; the folded goods behind still have depth.
    ts=[-1,-.73,-.45,-.23,0,.23,.45,.73,1]
    ss=[0,.12,.25,.39,.50,.61,.72,.86,1]
    def point(t,s):
        spread=.88+.34*math.exp(-((s-.18)/.14)**2)-.06*s
        dd=d+t*w*spread+.012*math.sin(s*6+phase)*t
        x=front+max(0,.44-s)*1.05
        h=.875-.031*s
        if s<.12:h+=.012*(1-t*t)
        if s>.44:
            step=min(1,(s-.44)/.12)
            x-=.035*math.sin(step*math.pi/2)
            h-=.052*(1-math.cos(step*math.pi/2))+.54*max(0,s-.53)
            x+=.016*(math.sin(6.5*t+phase)+.35*math.cos(11*t))*(.42+s)
        h+=.009*math.sin(6*t+phase+s*2)
        return (x,dd,h)
    for a,b in zip(ts,ts[1:]):
        for s0,s1 in zip(ss,ss[1:]):
            xy=[(a,s0),(b,s0),(b,s1),(a,s1)]
            part.face([point(t,s) for t,s in xy],sw,(-1 if s0>.43 else -.05,0,.07 if s0>.53 else 1),.96,
                      [(.06+.88*(t+1)/2,.93-.87*s) for t,s in xy])
