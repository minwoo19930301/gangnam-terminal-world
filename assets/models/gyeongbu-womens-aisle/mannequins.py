"""Linen neck forms, a quilted coat with fur-trimmed hood and a long red wool sample."""
import math
from mathutils import Vector
from garments import tube
from tailoring import disk

TAU=math.tau


def curved_tube(part,at,levels,swatch,n,tint,low=False):
    rings=[]
    for h,wx,depth,center_x,q,bulge in levels:
        rings.append([at.p(center_x+wx*math.sin(k*TAU/n)*bulge,q+depth*math.cos(k*TAU/n)*bulge,h) for k in range(n)])
    for j in range(len(rings)-1):
        for k in range(n):
            kk=(k+1)%n
            face=[rings[j][k],rings[j][kk],rings[j+1][kk],rings[j+1][k]]
            normals=[at.n(math.sin(i*TAU/n)/max(.04,levels[j][1]),math.cos(i*TAU/n)/max(.04,levels[j][2]),.05) for i in [k,kk,kk,k]]
            uv=[(.06+.86*k/n,.05+.88*j/(len(rings)-1)),(.06+.86*(k+1)/n,.05+.88*j/(len(rings)-1)),
                (.06+.86*(k+1)/n,.05+.88*(j+1)/(len(rings)-1)),(.06+.86*k/n,.05+.88*(j+1)/(len(rings)-1))]
            if low:part.face(face,swatch,normals[0],tint)
            else:part.curved(face,swatch,normals,tint,uv)
    part.face(rings[0],swatch,at.n(0,0,-1),.76);part.face(rings[-1],swatch,at.n(0,0,1),tint)


def mannequin(part,metal,at,height,swatch,number,quilted,low=False):
    # Real display necks are fabric-covered with turned wood caps. The floor stand stays inside the shop.
    n=10 if low else 24
    curved_tube(metal,at,[(height*.91,.106,.078,0,-.013,1),(height+.092,.074,.067,0,-.020,1),
                          (height+.139,.083,.072,0,-.025,1)],7,n,.99,low)
    curved_tube(metal,at,[(height+.132,.084,.073,0,-.025,1),(height+.153,.085,.074,0,-.025,1),
                          (height+.165,.073,.064,0,-.025,1)],5,n,.96,low)
    base_height=at.origin.z
    curved_tube(metal,at,[(.062-base_height,.16,.125,0,-.03,1),(.082-base_height,.162,.126,0,-.03,1),
                          (.098-base_height,.13,.107,0,-.03,1)],4,12,.90,low)
    tube(metal,[at.p(0,-.025,.09-base_height),at.p(0,-.025,height*.88)],.017 if not low else .022,4,.84,6)
    if low:
        levels=[(0,.258,.142,0,0,1),(height*.51,.219,.11,0,-.004,1),
                (height*.81,.24,.147,0,-.011,1),(height*.91,.226,.114,0,-.019,1),(height*.989,.087,.078,0,-.012,1)]
        curved_tube(part,at,levels,swatch,10,.94,True)
    else:
        def silhouette(s):
            widths=[(0,.264,.140),(.20,.250,.136),(.49,.202,.114),(.71,.229,.144),(.86,.247,.151),
                    (.92,.214,.125),(.972,.127,.092),(1,.080,.074)]
            for (a,w,q),(b,ww,qq) in zip(widths,widths[1:]):
                if s<=b+.0001:
                    t=(s-a)/(b-a);return w+(ww-w)*t,q+(qq-q)*t
        sections=[]
        if quilted:
            for j in range(7):
                for phase in [0,.22,.61,.86]:
                    sections.append(((j+phase)/7,.023*math.sin(phase*math.pi)**.72))
            sections.append((1,0))
        else:sections=[(s,0) for s in [0,.035,.18,.38,.55,.71,.84,.92,.972,1]]
        def vertex(a,s,puff):
            w,dep=silhouette(s)
            if not quilted:
                # Open the wool collar enough for the layers of the ivory inner top to show.
                spread=.075+.27*max(0,(s-.62)/.38)+.06*max(0,(.30-s)/.30)
                a=a+spread*math.sin((math.pi-a)/2)
            # Chevron-tilted quilt seams turn up slightly at each side of the chest.
            h=height*s+(.019 if quilted else .006)*math.sin(a)**2*math.sin(s*math.pi)
            q=(dep+puff)*math.cos(a)-.016*s
            x=(w+puff*.75)*math.sin(a)+.008*math.sin(a*3+number+s)*math.sin(math.pi*s)
            return at.p(x,q,h)
        sides=22 if quilted else 18
        angles=[.065+(TAU-.13)*k/sides for k in range(sides+1)]
        for j,((s0,p0),(s1,p1)) in enumerate(zip(sections,sections[1:])):
            for k,(a,b) in enumerate(zip(angles,angles[1:])):
                coords=[(a,s0,p0),(b,s0,p0),(b,s1,p1),(a,s1,p1)]
                normals=[]
                for angle,s,puff in coords:
                    horiz=vertex(angle+.005,s,puff)-vertex(angle-.005,s,puff)
                    lo=max(0,s-.012);hi=min(1,s+.012)
                    p_hi=.023*math.sin((hi*7%1)*math.pi)**.72 if quilted else 0
                    p_lo=.023*math.sin((lo*7%1)*math.pi)**.72 if quilted else 0
                    direction=horiz.cross(vertex(angle,hi,p_hi)-vertex(angle,lo,p_lo))
                    if direction.dot(at.n(math.sin(angle),math.cos(angle),0))<0:direction.negate()
                    normals.append(direction.normalized())
                points=[vertex(*p) for p in coords]
                if quilted:
                    shades={}
                    for pt,(angle,s,puff) in zip(points,coords):
                        t=(s*7)%1
                        # A puckered channel and slightly lighter puff face stay legible under diffuse indoor light.
                        value=.72+.26*math.sin(t*math.pi)**.63+.015*math.cos(angle*4+number)
                        shades[tuple(pt)]=(value*.99,value,value*1.01)
                    rgba=lambda x,y,z:shades[(x,y,z)]
                else:rgba=.96
                part.curved(points,swatch,normals,rgba,
                            [(.06+.88*k/sides,.055+.88*s0),(.06+.88*(k+1)/sides,.055+.88*s0),
                             (.06+.88*(k+1)/sides,.055+.88*s1),(.06+.88*k/sides,.055+.88*s1)])
        for side in [-1,1]:
            if quilted:
                path=[vertex(.067 if side>0 else TAU-.067,s,puff) for s,puff in sections]
                tube(metal,path,.0048,4,.81,4)
            else:
                lapel=[(side*.048,.982),(side*.174,.908),(side*.121,.878),(side*.156,.847),(side*.034,.620)]
                face=[at.p(x,.153-.70*abs(x*x),height*s) for x,s in lapel]
                part.face(face,swatch,at.n(0,1,.05),.77)
                tube(part,[face[1],face[2],face[3],face[4]],.0032,swatch,.96,4)
                collar=[at.p(side*.040,.114,height*.972),at.p(side*.087,.065,height*1.015),
                        at.p(side*.18,.112,height*.931),face[2]]
                part.face(collar,swatch,at.n(0,1,.12),.94)
                for s in [.38,.52,.66]:disk(metal,at,side*.071,.147,height*s,.009,6)
            pocket=[at.p(side*.12,.133,height*.375),at.p(side*.17,.124,height*.420),
                    at.p(side*.181,.114,height*.402),at.p(side*.128,.134,height*.353)]
            part.face(pocket,swatch,at.n(0,1,0),.71)
    for side in [-1,1]:
        rows=[]
        levels=4 if low else 12 if quilted else 7
        for j in range(levels):
            s=j/(levels-1)
            h=height*(.91-.64*s)
            r=.089-.031*s
            bump=1 if low or not quilted else 1+.084*math.sin(s*4*math.pi)**2
            rows.append((h,r,r*.88,side*(.199+.106*math.sin(s*math.pi/2)),.02+.032*s,bump))
        curved_tube(part,at,list(reversed(rows)),swatch,6 if low else 12,.94,low)
    if quilted:fur_hood(part,at,height,number,low)
    elif not low:
        curved_tube(part,at,[(height*.03,.185,.074,0,0,1),(height*.55,.158,.095,0,.007,1),
                    (height*.77,.188,.123,0,.006,1),(height*.91,.121,.109,0,.003,1),
                    (height*.978,.065,.073,0,-.005,1)],7,16,.96)
        for sign in [-1,1]:
            pts=[at.p(sign*.006,.117,height*.925),at.p(sign*.07,.065,height*.988),
                 at.p(sign*.093,.105,height*.894),at.p(sign*.046,.120,height*.862)]
            part.face(pts,7,at.n(0,1,.15),.86)



def fur_hood(part,at,height,seed,low):
    def path(a):
        return at.p(.188*math.sin(a),-.080*math.cos(a),height*(.891+.085*math.cos(a))+.015)
    if low:
        angles=[-2.35+4.7*i/10 for i in range(11)]
        tube(part,[path(a) for a in angles],.068,13,.52,n=5)
        return
    steps,count=36,10
    rings=[];orient=[]
    for i in range(steps+1):
        a=-2.36+4.72*i/steps
        center=path(a)
        along=at.n(math.cos(a),.49*math.sin(a),-.39*math.sin(a)).normalized()
        outward=at.n(math.sin(a),-.72*math.cos(a),.63).normalized()
        other=along.cross(outward).normalized()
        outward=other.cross(along).normalized()
        rings.append([]);orient.append([])
        for j in range(count):
            b=j*TAU/count
            n=(outward*math.cos(b)+other*math.sin(b)).normalized()
            radius=(.072+.008*math.sin(a*6.1)+.004*math.sin(b*3+a*6))* (.94+.06*math.cos(a))
            rings[i].append(center+n*radius);orient[i].append(n)
    for i in range(steps):
        for j in range(count):
            k=(j+1)%count
            pts=[rings[i][j],rings[i+1][j],rings[i+1][k],rings[i][k]]
            ns=[orient[i][j],orient[i+1][j],orient[i+1][k],orient[i][k]]
            t=i%9
            part.curved(pts,16,ns,.96,[(t/9,j/count),((t+1)/9,j/count),((t+1)/9,(j+1)/count),(t/9,(j+1)/count)])
    for i in range(131):
        a=-2.36+4.72*i/130
        root=path(a);along=at.n(math.cos(a),.54*math.sin(a),-.39*math.sin(a)).normalized()
        out=at.n(math.sin(a),-.59*math.cos(a),.51+.15*math.cos(i*3.7)).normalized()
        side=along.cross(out).normalized()
        for j in [0,1,2]:
            s_angle=(j-1)*.72+.29*math.sin(i*2.88+j)
            outward=(out*math.cos(s_angle)+side*math.sin(s_angle)).normalized()
            start=root+outward*(.063+.009*math.cos(i*4.09+j))
            tip=start+outward*(.012+.018*math.sin(i*4.8+j)**2)+along*(.022*math.sin(i*2.29+j))
            width=.005+.006*math.cos(i*3+j*.6)**2
            corners=[start-along*width,start+along*width,tip]
            direction=(corners[1]-corners[0]).cross(tip-corners[0]).normalized()
            shade=.63+.29*(.5+.5*math.sin(i*4.04+j*2))
            colour=(shade,shade*.99,shade*.97)
            uv=[(.10,.07),(.47,.12),(.39,.95)]
            part.face(corners,16,direction,colour,uv)
            part.face(corners,16,-direction,tuple(v*.84 for v in colour),uv)
