"""Layered hanging knits, patterned blouses and clip-hung pleated trousers."""
import math
from mathutils import Vector
from garments import tube
from tailoring import disk

TAU=math.tau
TS=[-1,-.77,-.51,-.28,0,.28,.51,.77,1]
SS=[0,.048,.24,.46,.68,.85,1]


def garment(part,hardware,at,height,width,swatch,variant, *, outer=None,vest=False,low=False):
    phase=.68*variant
    def point(t,s,front=True,layer=0):
        shoulder=1-.145*abs(t)**1.40-.083*math.exp(-((t/.29)**2))
        hem=.017*(.5+.5*math.cos(t*5.2+phase))+.007*t
        wx=width*(1.05-.105*math.sin(s*math.pi)+.015*s)*t
        folds=.0175*math.sin(t*9.4+phase+.65*s)*(.95-.55*s)+.005*math.sin(16*t+s*1.4+phase*.73)
        chest=.047+.038*(1-t*t)*(.69+.31*math.sin(s*math.pi))
        q=folds+(chest if front else -.72*chest)+layer*(1-.28*t*t)
        return at.p(wx,q,hem+s*(height*shoulder-hem))
    if low:
        for direction in [1,-1]:
            fabric=outer if outer is not None else swatch
            shape=[(-.88,.04),(.89,.035),(.95,.68),(.89,.91),(.27,.99),(-.27,.99),(-.89,.91),(-.95,.68)]
            part.face([point(t,s,direction>0) for t,s in shape],fabric,at.n(0,direction,0),.93 if direction>0 else .81)
            if outer is not None and direction==1:
                strip=[(-.10,.07),(.13,.07),(.39,.88),(.19,.98),(-.18,.98),(-.39,.87)]
                part.face([point(t,s,True,.006) for t,s in strip],swatch,at.n(0,1,0),.98)
        for side in [-1,1]:
            path=[(.81,.90),(1.15,.84),(1.29,.20),(1.04,.19)] if not vest else [(.80,.91),(1.08,.84),(1.01,.71),(.83,.71)]
            part.face([point(side*t,s,True) for t,s in path],outer if outer is not None else swatch,at.n(0,1,0),.91)
        return

    def normal(t,s,front,layer):
        step=.003
        horizontal=point(t+step,s,front,layer)-point(t-step,s,front,layer)
        vertical=point(t,s+step,front,layer)-point(t,s-step,front,layer)
        result=horizontal.cross(vertical)
        if result.dot(at.n(0,1 if front else -1,0))<0:result.negate()
        return result.normalized()
    def panel(corners,front,sw,layer,shade):
        values=[point(t,s,front,layer) for t,s in corners]
        normals=[normal(t,s,front,layer) for t,s in corners]
        uv=[(.055+.89*(t+1)/2,.06+.87*s) for t,s in corners]
        part.curved(values,sw,normals,shade,uv)

    for front in [True,False]:
        for a,b in zip(TS,TS[1:]):
            for lo,hi in zip(SS,SS[1:]):
                panel([(a,lo),(b,lo),(b,hi),(a,hi)],front,swatch if front or outer is None else outer,0,.97 if front else .87)
    for t in [-1,1]:
        for lo,hi in zip(SS,SS[1:]):
            part.face([point(t,lo,False),point(t,lo),point(t,hi),point(t,hi,False)],outer if outer is not None else swatch,at.n(t,0,0),.84)
    for a,b in zip(TS,TS[1:]):
        part.face([point(a,0,False),point(b,0,False),point(b,0),point(a,0)],swatch,at.n(0,0,-1),.78)
        if a>=.28 or b<=-.28:
            part.face([point(a,1,False),point(b,1,False),point(b,1),point(a,1)],outer if outer is not None else swatch,at.n(0,0,1),.88)
    neck=[point(t,1,True,.003) for t in [-.36,-.24,-.12,0,.12,.24,.36]]
    tube(part,neck,.007,7 if outer is not None else swatch,.96,5)
    sleeve_fabric=outer if outer is not None else swatch
    for side in [-1,1]:
        if not vest:sleeve(part,at,height,width,side,sleeve_fabric,variant)
        else:
            brim=[point(side*t,s,True,.008) for t,s in [(.78,.96),(.97,.89),(1.00,.79),(.97,.73)]]
            tube(part,brim,.009,sleeve_fabric,.92,6)
    if outer is not None:
        def inner(s):return .11+.18*math.sin(s*math.pi*.79)+.12*s*s
        for side in [-1,1]:
            for j,(lo,hi) in enumerate(zip(SS,SS[1:])):
                for a,b in zip([0,.34,.71],[.34,.71,1]):
                    def t(s,f):return side*(inner(s)+(1-inner(s))*f)
                    panel([(t(lo,a),lo),(t(lo,b),lo),(t(hi,b),hi),(t(hi,a),hi)],True,outer,.022,.98)
            trim=[point(side*inner(s),s,True,.026) for s in SS]
            tube(part,trim,.009,outer,.87,6)
            if side<0:
                for s in [.16,.31,.46,.61]:
                    center=point(-inner(s)-.042,s,True,.029)
                    circle=[center+at.width*(.0075*math.cos(k*TAU/8))+Vector((0,0,.0075*math.sin(k*TAU/8))) for k in range(8)]
                    hardware.face(circle,5,at.n(0,1,0),.88)
        # The collar of the botanical blouse rises through the orange cardigan.
        for side in [-1,1]:
            collar=[(side*.013,.95),(side*.065,1.00),(side*.112,.90),(side*.062,.845)]
            part.face([at.p(x,.103,height*s) for x,s in collar],swatch,at.n(0,1,.10),.99,
                      [(.10,.85),(.35,.97),(.46,.50),(.18,.41)])
    if vest:
        hem=[point(t,.038,True,.002) for t in TS]
        tube(part,hem,.008,swatch,.84,6)


def sleeve(part,at,height,width,side,fabric,variant):
    radii=[(.86,.84,.098,-.005),(.76,1.06,.082,0),(.53,1.14,.066,.014),(.27,1.17,.061,.027),(.18,1.19,.042,.031)]
    n=8
    rings=[]
    for s,w,r,q in radii:
        row=[]
        for j in range(n):
            a=j*TAU/n
            bump=(1+.065*math.sin(3*a+variant+s))
            row.append(at.p(side*w*width+r*math.cos(a)*bump,q+.75*r*math.sin(a)*bump,height*s+.010*math.cos(a+side)))
        rings.append(row)
    for i in range(len(rings)-1):
        for j in range(n):
            k=(j+1)%n
            normals=[at.n(math.cos(v*TAU/n),math.sin(v*TAU/n),.04) for v in [j,k,k,j]]
            part.curved([rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j]],fabric,normals,.95 if i<3 else .87,
                        [(.06+.81*j/n,.87-i*.14),(.06+.81*(j+1)/n,.87-i*.14),
                         (.06+.81*(j+1)/n,.73-i*.14),(.06+.81*j/n,.73-i*.14)])
    part.face(rings[-1],6,at.n(0,0,-1),.74)


def pants(part,hardware,at,length,sw,variant,low=False):
    width=.198+.009*math.sin(variant)
    def vertex(x,q,h):return at.p(x,q,h*length)
    if low:
        for direction in [-1,1]:
            q=direction*.035
            for side in [-1,1]:
                outline=[(side*.010,.995),(side*width,.99),(side*(width+.034),.69),
                         (side*(width+.012),.015),(side*.044,.01),(side*.015,.62)]
                part.face([vertex(x,q,h) for x,h in outline],sw,at.n(0,direction,0),.95 if direction>0 else .82)
        return
    for side in [-1,1]:
        levels=[(.012,.109,.074,.064),(.08,.108,.077,.066),(.38,.112,.084,.069),
                (.66,.109,.103,.081),(.82,.096,.109,.081),(.96,.094,.104,.067),(.996,.095,.102,.058)]
        n=10;rings=[]
        for h,c,r,d in levels:
            row=[]
            for j in range(n):
                a=TAU*j/n
                fold=.010*math.sin(3*a+variant*.78+h)*(.72-.28*h)
                row.append(vertex(side*(c+.008*math.sin(h*4+side*.91))+r*math.cos(a),
                                  d*math.sin(a)+fold+.008*side,h+.005*math.sin(a*2+variant)))
            rings.append(row)
        for i in range(len(rings)-1):
            for j in range(n):
                k=(j+1)%n
                ns=[at.n(math.cos(v*TAU/n),math.sin(v*TAU/n),0) for v in [j,k,k,j]]
                part.curved([rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j]],sw,ns,.91+.04*math.sin(j*2+variant),
                            [(.06+.80*j/n,.02+.88*levels[i][0]),(.06+.80*(j+1)/n,.02+.88*levels[i][0]),
                             (.06+.80*(j+1)/n,.02+.88*levels[i+1][0]),(.06+.80*j/n,.02+.88*levels[i+1][0])])
        part.face(rings[0],6,at.n(0,0,-1),.71)
        seam=[vertex(side*.170,.063,.92),vertex(side*.156,.073,.89),vertex(side*.127,.082,.851)]
        tube(part,seam,.0028,sw,.71,4)
    for side in [-1,1]:
        for x in [.061,.158]:
            pts=[vertex(side*(x-.006),.064,.943),vertex(side*(x+.006),.064,.943),
                 vertex(side*(x+.006),.064,.994),vertex(side*(x-.006),.064,.994)]
            part.face(pts,sw,at.n(0,1,0),.82)
    fly=[vertex(0,.086,.947),vertex(.016,.089,.901),vertex(.016,.092,.858),vertex(.008,.092,.84)]
    tube(part,fly,.0025,sw,.69,4)
    disk(hardware,at,0,.072,.98*length,.0065,4)
    tube(hardware,[vertex(-width*.83,0,1.052),vertex(width*.83,0,1.052)],.007,4,.91,6)
    for side in [-1,1]:
        x=width*.73*side
        hardware.face([vertex(x-.015,.067,.98),vertex(x+.015,.067,.98),vertex(x+.019,.023,1.060),vertex(x-.019,.023,1.060)],4,at.n(0,1,.25),.97)
