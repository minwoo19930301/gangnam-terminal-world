"""Open nylon hoods, zip guards, elastic hems and puckered short-sleeve blouses."""
import math
from mathutils import Vector
from apparel import dim
from garments import tube

TAU=math.tau


def panel_shape(part,at,style,col,seed):
    parka=style=='parka'
    levels=[(0,.196,.040),(.024,.195,.042),(.06,.213,.048),(.23,.225,.061),
            (.46,.225,.070),(.68,.219,.072),(.795,.232,.065),(.87,.218,.052),
            (.935,.161,.045),(.977,.096,.042),(1,.069,.034)]
    if not parka:
        levels=[(0,.225,.042),(.024,.225,.043),(.08,.220,.044),(.30,.215,.057),(.54,.211,.065),
                (.73,.215,.067),(.82,.223,.061),(.884,.200,.053),(.94,.153,.043),
                (.977,.090,.033),(1,.066,.028)]
    H=.696 if parka else .575
    sw=4 if parka else 5
    n=24
    def v(i,a):
        t,w,dep=levels[i]
        wav=(math.sin(a*7.0+t*1.55+seed)+.38*math.sin(a*13.0-t*2.4+seed*.75))
        amp=.012+(.052 if parka else .044)*(1-t)
        z=H*t+.007*(1-t)*math.sin(5*a+seed)-.025*t**8*max(0,math.cos(a))
        # Broad folds on a light nylon shell turn diagonally from the armpits
        # to the hem. A puckered cotton blouse falls more vertically.
        face=max(0,abs(math.cos(a))-.10)
        wrinkle=(.0115 if parka else .0058)*math.sin(7*a+2.65*t+seed+.70*math.sin(4.4*t))*(1-.55*t)
        q=dep*math.cos(a)*(1+.65*amp*wav)+amp*.058*wav+face*wrinkle
        return at.p(w*math.sin(a)*(1+amp*wav),q,z)
    def normal(i,a):
        d=(v(i,a+.002)-v(i,a-.002)).cross(v(min(len(levels)-1,i+1),a)-v(max(0,i-1),a))
        if d.dot(at.n(math.sin(a),math.cos(a),0))<0:d.negate()
        return d.normalized()
    for i in range(len(levels)-1):
        for j in range(n):
            corners=[(i,j/n),(i,(j+1)/n),(i+1,(j+1)/n),(i+1,j/n)]
            points=[v(ii,t*TAU) for ii,t in corners]
            shades={tuple(point):dim(col,.942+(.061 if parka else .039)*math.cos(t*TAU*7+levels[ii][0]*2.55+seed))
                    for point,(ii,t) in zip(points,corners)}
            part.curved(points,7 if parka and i==0 else sw,[normal(ii,t*TAU) for ii,t in corners],
                        lambda x,d,h:shades[(x,d,h)],[(t,.025+.95*levels[ii][0]) for ii,t in corners])
    for i,r in [(0,.0026),(len(levels)-1,.006 if not parka else .004)]:
        path=[v(i,k*TAU/n) for k in range(n+1)]
        tube(part,path,r,7 if i else sw,dim(col,.90),5)
    if parka:
        zipline=[v(i,.008)+at.front*.003 for i in range(1,len(levels))]
        tube(part,zipline,.0045,7,dim(col,.66),6)
        tube(part,[p+at.right*.005 for p in zipline],.0025,4,dim(col,.95),5)
        slider=zipline[-2];tube(part,[slider,slider+at.n(.004,.004,-.027),slider+at.n(.011,.004,-.029)],.0022,2,.91,5)
        for side in [-1,1]:
            # Sewn zipper pocket lies diagonally on the lower front.
            path=[at.p(side*x,q,h) for x,q,h in [(.114,.062,.154),(.130,.061,.206),(.151,.057,.260)]]
            tube(part,path,.0046,7,dim(col,.61),5)
            tube(part,[path[0]+at.right*side*.006,path[1]+at.right*side*.006,path[2]+at.right*side*.006],.0027,4,dim(col,1.02),5)
    return H


def sleeve(part,at,style,col,seed,side):
    parka=style=='parka'
    if parka:
        levels=[(.152,.002,.555,.087,.061),(.205,-.002,.531,.090,.067),(.225,-.004,.491,.089,.065),
                (.237,-.007,.421,.078,.058),(.254,-.005,.302,.064,.053),
                (.259,.010,.207,.062,.047),(.269,.030,.088,.048,.041),
                (.269,.031,.058,.040,.033),(.269,.031,.045,.040,.033)]
    else:
        levels=[(.142,-.001,.473,.075,.055),(.180,.001,.470,.081,.063),(.213,.002,.455,.091,.069),
                (.248,.007,.439,.102,.073),(.265,.011,.383,.103,.073),
                (.265,.016,.328,.083,.057),(.262,.019,.307,.066,.047),
                (.262,.019,.291,.065,.046)]
    n=16;sw=4 if parka else 5
    def p(j,a):
        tx,qd,h,r,rq=levels[j]
        prev=levels[max(0,j-1)];nxt=levels[min(len(levels)-1,j+1)]
        dx=nxt[0]-prev[0];dz=nxt[2]-prev[2];length=math.hypot(dx,dz)
        ripple=1+(.041 if parka else .085)*math.sin(a*7+seed+.55*j)
        return at.p(side*(tx-dz/length*r*math.cos(a)*ripple),qd+rq*math.sin(a)*ripple,
                    h+dx/length*r*math.cos(a)*ripple)
    for j in range(len(levels)-1):
        for k in range(n):
            corners=[(j,k/n),(j,(k+1)/n),(j+1,(k+1)/n),(j+1,k/n)]
            normals=[]
            for ii,t in corners:
                x,q,h,_,_=levels[ii]
                normals.append((p(ii,t*TAU)-at.p(side*x,q,h)).normalized())
            points=[p(i,t*TAU) for i,t in corners]
            shades={tuple(pt):dim(col,.946+.039*math.cos(t*TAU*7+seed+.55*i)) for pt,(i,t) in zip(points,corners)}
            part.curved(points,7 if j==len(levels)-2 else sw,normals,lambda x,d,h:shades[(x,d,h)],
                        [(t,.02+.96*i/(len(levels)-1)) for i,t in corners])
    # Cap the front edge of the gathered shoulder where it enters the body.
    # Empty hangers leave a gap above the projected shoulder if this is left open.
    first=[p(0,i*TAU/n) for i in range(n)]
    part.face(first,sw,at.n(-side*.35,0,.94),dim(col,.93))
    end=[p(len(levels)-1,i*TAU/n) for i in range(n)]
    part.face(end,sw,at.n(side*.13,0,-1),dim(col,.58))
    tube(part,end+[end[0]],.0028,7,dim(col,.89),5)


def hood(part,at,col,seed,H):
    # An unworn hood collapses backward into a shallow shell. The front rim
    # still has a visible cavity, a darker inner lining and a piped edge.
    count=24;samples=[0,.22,.53,.79,1]
    def p(t,a,inside):
        rimx=.117*math.sin(a)*(1+.035*math.cos(3*a+seed))
        rimz=H+.005+.110*math.cos(a)+.014*math.sin(a)
        rimd=.023-.012*math.cos(a)+.016*math.sin(2*a+seed)
        endz=H+.054
        return at.p(t*rimx,(-.118 if not inside else -.102)*(1-t)+rimd*t,
                    endz+(rimz-endz)*t+(.016*(1-t)*math.sin(t*math.pi) if not inside else 0))
    for inner in [False,True]:
        for j,(s,t) in enumerate(zip(samples,samples[1:])):
            for k in range(count):
                a=k*TAU/count;b=(k+1)*TAU/count
                coords=[(s,a),(t,a),(t,b)] if not s else [(s,a),(t,a),(t,b),(s,b)]
                points=[p(u,v,inner) for u,v in coords]
                normals=[]
                for u,v in coords:
                    # The outer shell turns out around the crown and sides.
                    # The lining faces the viewer at the bottom of the cavity.
                    radial=at.n(math.sin(v)*max(.05,u),-.84+.58*u,math.cos(v)*max(.05,u))
                    normals.append((-radial if inner else radial).normalized())
                shade=dim(col,(.53+.31*t if inner else .92+.045*t))
                part.curved(points,6 if inner else 4,normals,shade,
                            [(.5+.47*u*math.sin(v),.5+.47*u*math.cos(v)) for u,v in coords])
    edge=[p(1,k*TAU/count,False) for k in range(count+1)]
    tube(part,edge,.0038,7,dim(col,.91),6)
    for side in [-1,1]:
        cord=[at.p(side*.057,.040,H-.04),at.p(side*.064,.058,H-.086),at.p(side*.051,.062,H-.128)]
        tube(part,cord,.0021,7,dim(col,.64),5)
        tube(part,[cord[-1],cord[-1]+at.n(0,0,-.009)],.0028,9,.81,5)


def garment(part,at,style,col,seed):
    H=panel_shape(part,at,style,col,seed)
    for side in [-1,1]:sleeve(part,at,style,col,seed,side)
    if style=='parka':hood(part,at,col,seed,H)
    else:
        # A stitched band follows the cropped neckline of the seersucker blouse.
        band=[at.p(.060*math.sin(k*TAU/20),.029*math.cos(k*TAU/20),H-.002-.023*max(0,math.cos(k*TAU/20))) for k in range(21)]
        tube(part,band,.0045,7,dim(col,.91),5)
    return H


def hanging_silhouette(part,at,style,col,height):
    if style=='parka':
        outline=[(-.066,height),(-.174,height-.056),(-.225,height-.107),(-.278,.073),(-.223,.055),
                 (-.196,.190),(-.193,.019),(-.115,.002),(.139,.005),(.200,.023),(.202,.185),
                 (.239,.054),(.282,.073),(.225,height-.107),(.174,height-.056),(.066,height)]
    else:
        outline=[(-.064,height),(-.174,height-.048),(-.259,height-.103),(-.294,height-.204),
                 (-.266,height-.259),(-.212,height-.243),(-.212,.016),(-.15,.005),(.142,.003),
                 (.218,.015),(.213,height-.243),(.266,height-.259),(.294,height-.204),
                 (.259,height-.103),(.174,height-.048),(.064,height)]
    sw=4 if style=='parka' else 5
    for side in [-1,1]:
        part.face([at.p(x,.027*side+.009*math.cos(x*16),h) for x,h in outline],sw,at.n(0,side,0),dim(col,.90 if side>0 else .76))
    for j,(x,h) in enumerate(outline):
        xx,hh=outline[(j+1)%len(outline)]
        part.face([at.p(x,-.025,h),at.p(x,.025,h),at.p(xx,.025,hh),at.p(xx,-.025,hh)],sw,
                  at.n(hh-h,0,x-xx),dim(col,.77))
