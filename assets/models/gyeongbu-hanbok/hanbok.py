"""Layered chima, crossover jeogori, dongjeong, goreum and shop display busts."""
import math
from mathutils import Vector
from garments import tube

TAU = math.tau


class Form:
    def __init__(self,x,d,h,angle,scale=1):
        self.origin=Vector((x,d,h));self.scale=scale
        self.right=Vector((math.cos(angle),-math.sin(angle),0))
        self.front=Vector((math.sin(angle),math.cos(angle),0))

    def p(self,x,d,h):
        return self.origin+self.scale*self.n(x,d,h)

    def n(self,x,d,h):
        return x*self.right+d*self.front+Vector((0,0,h))


def lathe(part,at,profile,swatch,tone,steps):
    rings=[]
    for z,rx,ry,q in profile:
        rings.append([at.p(rx*math.sin(k*TAU/steps),q+ry*math.cos(k*TAU/steps),z) for k in range(steps)])
    for j in range(len(rings)-1):
        for k in range(steps):
            kk=(k+1)%steps
            angles=[k,kk,kk,k]
            points=[rings[j][k],rings[j][kk],rings[j+1][kk],rings[j+1][k]]
            part.curved(points,swatch,[at.n(math.sin(a*TAU/steps),math.cos(a*TAU/steps),.03) for a in angles],tone,
                        [(k/steps,j/(len(rings)-1)),((k+1)/steps,j/(len(rings)-1)),
                         ((k+1)/steps,(j+1)/(len(rings)-1)),(k/steps,(j+1)/(len(rings)-1))])
    part.face(rings[-1],swatch,at.n(0,0,1),tone)


def skirt(part,at,swatch,phase,brocade,low,front):
    # Full skirts flare gently over a circular underskirt. The six knife pleats
    # gather above the waistband and soften until their edges reach the hem.
    n=12 if low else 48 if front else 30
    levels=[0,.075,.265,.435,.560,.78,1] if brocade else [0,.055,.26,.53,.77,.91,1]
    if not low:levels=sorted(set(levels+[.015,.11,.34,.68,.86,.97]))
    def point(a,s):
        lower=1-s
        profile=[(0,.438,.335),(.15,.460,.355),(.45,.405,.310),(.64,.334,.255),
                 (.745,.258,.191),(.805,.187,.122),(.85,.143,.088),(.92,.128,.076),(1,.123,.075)]
        for (a0,w0,d0),(a1,w1,d1) in zip(profile,profile[1:]):
            if s<=a1+.0001:
                t=(s-a0)/(a1-a0);widths=w0+(w1-w0)*t;depth=d0+(d1-d0)*t;break
        pleat=math.sin(6*a+phase+.28*s)
        fold=.026*(.35+.65*math.sin(s*math.pi))*pleat+.011*math.cos(12*a+phase*.75+.55*s)
        edge=max(0,1-abs(math.sin(3*a+phase*.50))/.28)
        fold=(fold+.013*edge*(.45+.55*s))*min(1,max(.04,(.92-s)/.10))
        height=.055+s*1.145+.011*math.sin(a*6+phase)*lower**2
        return at.p((widths+fold)*math.sin(a),(depth+fold*.79)*math.cos(a)-.010*s,height)
    for j,(s,t) in enumerate(zip(levels,levels[1:])):
        sw=8 if brocade and (.075<=(s+t)/2<=.265 or .435<=(s+t)/2<=.56) else swatch
        for k in range(n):
            a=k*TAU/n;b=(k+1)*TAU/n
            pairs=[(a,s),(b,s),(b,t),(a,t)]
            points=[point(angle,v) for angle,v in pairs];normals=[]
            for angle,v in pairs:
                radial=at.n(math.sin(angle),math.cos(angle),.12)
                nrm=(point(angle+.006,v)-point(angle-.006,v)).cross(point(angle,min(1,v+.012))-point(angle,max(0,v-.012)))
                if nrm.dot(radial)<0:nrm.negate()
                normals.append(nrm.normalized())
            tones={}
            for p,(angle,v) in zip(points,pairs):
                pleat=(.5+.5*math.cos(angle*6+phase+.28*v))
                value=.79+.195*pleat+.016*math.cos(angle*3.1+.23)
                tones[tuple(p)]=(value,value,value)
            cell=max(1,n//6);u0=(k%cell)/cell;u1=(k%cell+1)/cell
            start=.075 if s<.28 else .435
            uv=[(u0,(s-start)/(.19 if s<.28 else .125)),(u1,(s-start)/(.19 if s<.28 else .125)),
                (u1,(t-start)/(.19 if s<.28 else .125)),(u0,(t-start)/(.19 if s<.28 else .125))] if sw==8 else [(u0,s),(u1,s),(u1,t),(u0,t)]
            if low:part.face(points,sw,normals[0],.91)
            else:part.curved(points,sw,normals,lambda x,d,z:tones[(x,d,z)],uv)
    if not low and front:
        tube(part,[point(k*TAU/48,0) for k in range(49)],.0025*at.scale,swatch,.76,4)


def ribbon(part,at,profile,sw,normal=(0,1,.12),shade=.96):
    for lo,hi in zip(profile,profile[1:]):
        x,d,z,w=lo;xx,dd,zz,ww=hi
        part.face([at.p(x-w,d,z),at.p(x+w,d,z),at.p(xx+ww,dd,zz),at.p(xx-ww,dd,zz)],
                  sw,at.n(*normal),shade,[(0,0),(1,0),(1,1),(0,1)])


def jeogori(part,at,sw,embroidery,low,front=True):
    shoulder=1.469
    # The actual display dresses have short crossover bodices and the empty
    # sleeves laid inwards, with their large, square cuffs directly over the skirt.
    bodice=[(1.025,.168,.105,.007),(1.12,.165,.109,0),(1.31,.168,.118,-.008),
            (1.424,.191,.110,-.006),(shoulder,.179,.085,-.012),(1.522,.066,.064,-.006)]
    lathe(part,at,bodice,sw,.97,12 if low else 26)

    def surface(x,z):
        for (h,rx,ry,d),(hh,rxx,ryy,dd) in zip(bodice,bodice[1:]):
            if z<=hh+.0001:
                w=max(0,min(1,(z-h)/(hh-h)));r=rx+(rxx-rx)*w
                return d+(dd-d)*w+(ry+(ryy-ry)*w)*math.sqrt(max(.016,1-(x/r)**2))
        return .05

    def centre_band(path,width,swatch,tone,shift=0,depth=.006):
        # The collar follows the round chest. Neither half floats on a flat
        # plane; one flap ends where the longer white neckband crosses it.
        strips=[]
        for i,(x,z) in enumerate(path):
            x0,z0=path[max(0,i-1)];x1,z1=path[min(i+1,len(path)-1)]
            dx=x1-x0;dz=z1-z0;l=math.hypot(dx,dz);nx=-dz/l;nz=dx/l
            pair=[]
            for w in [shift-width/2,shift+width/2]:
                xx=x+w*nx;zz=z+w*nz
                pair.append(at.p(xx,surface(xx,zz)+depth,zz))
            strips.append(pair)
        for left,right in zip(strips,strips[1:]):
            part.face([left[0],left[1],right[1],right[0]],swatch,at.n(0,1,.12),tone)
    short=[(-.058,1.517),(-.056,1.494),(-.039,1.463),(-.011,1.430),(.010,1.414)]
    long=[(.060,1.518),(.058,1.492),(.045,1.462),(.023,1.431),(-.005,1.401),(-.044,1.367),(-.088,1.329),(-.127,1.303)]
    for path in [short,long]:
        centre_band(path,.040,sw,.82,depth=.008)
        centre_band(path,.019,7,.995,shift=.008,depth=.010)
    if embroidery and sw==7 and not low:
        def chest(x,h):return at.p(x,surface(x,h)+.012,h)
        # Shape the applique along the breast instead of flattening a square across it.
        corners=[(.012,1.280),(.078,1.278),(.134,1.312),(.159,1.393),(.130,1.444),(.087,1.455),(.058,1.408),(.024,1.364)]
        mid=(.087,1.371)
        for i,a in enumerate(corners):
            b=corners[(i+1)%len(corners)];pts=[mid,a,b]
            part.face([chest(x,h) for x,h in pts],9,at.n(0,1,.10),.975,
                      [((x-.008)/.153,(h-1.274)/.188) for x,h in pts])
    if not low:
        # The horizontal hem casts a narrow shadow where the skirt tucks under the jacket.
        hem=[at.p(x,surface(x,1.037)+.004,1.035+.009*abs(x)/.15) for x in [-.154,-.113,-.073,-.036,0,.036,.073,.113,.154]]
        tube(part,hem,.0037*at.scale,sw,.76,4)
    for side in [-1,1]:
        shape=[(1.458,.167,-.006,.072,.059),(1.418,.205,.009,.085,.061),
               (1.296,.222,.047,.091,.055),(1.168,.172,.105,.090,.049),
               (1.078,.117,.146,.077,.041),(1.013,.078,.169,.073,.033)]
        if low:shape=[shape[j] for j in [0,2,4,5]]
        n=6 if low else 12
        rings=[]
        for z,offset,forward,w,h in shape:
            rings.append([at.p(side*offset+w*math.sin(k*TAU/n),forward+h*math.cos(k*TAU/n),
                               z+.034*side*math.sin(k*TAU/n)) for k in range(n)])
        for j in range(len(rings)-1):
            for k in range(n):
                kk=(k+1)%n
                points=[rings[j][k],rings[j][kk],rings[j+1][kk],rings[j+1][k]]
                normal=[at.n(math.sin(idx*TAU/n),math.cos(idx*TAU/n),.08) for idx in [k,kk,kk,k]]
                swatch=7 if j==len(rings)-2 and sw!=7 else sw
                part.curved(points,swatch,normal,.92 if j==len(rings)-2 else .98,
                            [(k/n,j/(len(rings)-1)),((k+1)/n,j/(len(rings)-1)),
                             ((k+1)/n,(j+1)/(len(rings)-1)),(k/n,(j+1)/(len(rings)-1))])
        part.face(rings[-1],sw,at.n(0,.25,-1),.66)
        if not low and front:
            tube(part,rings[-1]+[rings[-1][0]],.0022*at.scale,7,.95,4)
            # Raised cuff seam above the opening. It follows the slant of the
            # empty sleeve laid over the opposite wrist in the shop photograph.
            seam=[r*.78+s*.22 for r,s in zip(rings[-1],rings[-2])]
            tube(part,seam+[seam[0]],.0024*at.scale,sw,.83,4)
            for nudge in [-.017,.022]:
                crease=[at.p(side*(.176+nudge),.169,1.147),
                        at.p(side*(.140+nudge*.50),.184,1.102),at.p(side*(.103+nudge*.15),.198,1.078)]
                tube(part,crease,.0027*at.scale,sw,.90,4)
    colour=(7 if sw==7 else sw)
    ribbon(part,at,[(-.105,.128,1.323,.011),(-.148,.139,1.312,.020),(-.169,.135,1.284,.015),(-.108,.148,1.303,.011)],colour)
    ribbon(part,at,[(-.108,.143,1.314,.013),(-.118,.148,1.247,.017),(-.128,.166,1.122,.016),(-.134,.172,.967,.014)],colour)
    if not low:
        ribbon(part,at,[(-.108,.147,1.312,.013),(-.096,.151,1.253,.015),(-.058,.171,1.146,.014),
                        (-.064,.18,1.081,.016)],colour,shade=.85)


def ensemble(part,at,sk,top,phase,*,brocade=False,embroidery=False,low=False,front=False):
    if low:
        steps=8 if front else 6
        levels=[(0,.43,.33),(.075,.45,.345),(.265,.44,.33),(.435,.414,.30),(.56,.37,.26),
                (1,.15,.105)] if brocade else [(0,.43,.33),(.30,.446,.33),(1,.15,.105)]
        rings=[[at.p(rx*math.sin(k*TAU/steps),ry*math.cos(k*TAU/steps),.06+1.14*s)
                for k in range(steps)] for s,rx,ry in levels]
        for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
            sw=8 if brocade and j in [1,3] else sk
            for k in range(steps):
                kk=(k+1)%steps
                part.face([lo[k],lo[kk],hi[kk],hi[k]],sw,at.n(math.sin(k*TAU/steps),math.cos(k*TAU/steps),.12),.92)
        for side in [-1,1]:
            part.face([at.p(-.16,side*.08,1.045),at.p(.16,side*.08,1.045),
                       at.p(.204,side*.064,1.437),at.p(.066,side*.05,1.525),
                       at.p(-.066,side*.05,1.525),at.p(-.204,side*.064,1.437)],top,at.n(0,side,0),.95)
            part.face([at.p(side*.184,.066,1.452),at.p(side*.278,.085,1.304),
                       at.p(side*.131,.171,1.022),at.p(side*.014,.175,1.051)],top,at.n(0,1,0),.88)
        part.face([at.p(-.058,.025,1.508),at.p(.058,.025,1.508),at.p(.054,.025,1.655),at.p(-.054,.025,1.655)],
                  7,at.n(0,1,0),.84)
        return
    lathe(part,at,[(1.45,.085,.072,-.008),(1.548,.059,.056,-.006),(1.64,.060,.055,-.004)],7,.86,10 if low else 18)
    lathe(part,at,[(1.638,.061,.056,-.004),(1.65,.061,.056,-.004),(1.657,.054,.050,-.004)],7,(.78,.61,.38),10 if low else 18)
    skirt(part,at,sk,phase,brocade,low,front)
    jeogori(part,at,top,embroidery,low,front)
