"""The photograph's narrow return of wrapping stock, a daisy sleeve and cotton tote."""
import math
from mathutils import Vector
from garments import tube
from ribbon import dye


def roll(part,x,d,z,r,height,colour,phase,low):
    n=8 if low else 18
    # Sheet wrapping spirals past the lip; a cardboard tube shows in the recess.
    for k in range(n):
        a=math.tau*k/n;b=math.tau*(k+1)/n
        p=lambda ang,rad,h:(x+rad*math.cos(ang),d+rad*math.sin(ang),z+h)
        def top(ang):return height+.021*math.sin(ang+phase)+.018*((ang+phase)%math.tau)/math.tau
        norm=(math.cos((a+b)/2),math.sin((a+b)/2),0)
        part.face([p(a,r,0),p(b,r,0),p(b,r,top(b)),p(a,r,top(a))],7,norm,colour)
        if low:continue
        core=r*.57
        part.face([p(a,r,top(a)),p(b,r,top(b)),p(b,core,height-.012),p(a,core,height-.012)],7,(0,0,1),colour)
        part.face([p(a,core,height-.012),p(b,core,height-.012),p(b,core,height-.048),p(a,core,height-.048)],2,(-norm[0],-norm[1],.01),.78)
        if k==n-4:
            part.face([p(a,r+.001,0),p(a,r+.001,top(a)),p(a+.07,r+.001,top(a)),p(a+.07,r+.001,.004)],7,norm,tuple(i*.78 for i in colour))


def daisy(part,x,d,z,scale):
    center=Vector((x,d,z));xaxis=Vector((1,0,.14));zaxis=Vector((0,.36,.94));front=Vector((-.13,.94,-.34))
    for i in range(11):
        a=i*math.tau/11;direction=xaxis*math.cos(a)+zaxis*math.sin(a);side=-xaxis*math.sin(a)+zaxis*math.cos(a)
        petal=[center+direction*length*scale+side*off*scale+front*raise_*scale for length,off,raise_ in [(.13,0,0),(.41,-.145,.03),(.88,-.135,-.008),(1.,-.035,-.02),(.94,.115,-.011),(.43,.15,.02)]]
        part.face(petal,14,front,.99)
    for i in range(9):
        a=i*math.tau/9;b=(i+1)*math.tau/9
        ring=lambda t:center+scale*.30*(xaxis*math.cos(t)+zaxis*math.sin(t))+front*.001
        part.face([ring(a),ring(b),center+front*scale*.21],13,front,(1,.92,.48))


def accessories(part,blooms,low):
    # Rolling wire forebin and loose wrapping-paper packs sit behind the front rail.
    part.box(1.098,-.06,.060,.580,.46,.735,12,.77)
    part.box(1.098,.09,.082,.553,.12,.455,3,(.83,.79,.68))
    for i in range(14 if not low else 8):
        x=.875+(i%4)*.123;d=-.14+(i//4)*.095
        colours=['e6d7ad','bab99d','cbb292','f1e0c8','a3ab9e','e1c3b6','c7c2a1']
        roll(part,x,d,.68,.049+.003*math.cos(i*3),.68+.13*math.sin(i*2.3),dye(colours[i%7]),i*.51,low)
    # The hanging tote is a folded scoop; its mouth stays open and its handles arch away from the wall.
    cx=.807;depth=.274;h=.71
    ring=[]
    for i in range(14):
        a=i*math.tau/14;ring.append((cx+.127*math.cos(a),depth+.047*math.sin(a),h+.30+.027*abs(math.cos(a))))
    for i in range(len(ring)):
        j=(i+1)%len(ring);a=i*math.tau/14;b=j*math.tau/14
        bottom=lambda t:(cx+.105*math.cos(t)+.017,depth+.035*math.sin(t)+.021,h+.012*math.sin(t))
        part.face([bottom(a),bottom(b),ring[j],ring[i]],3,(math.cos((i+.5)*math.tau/14),math.sin((i+.5)*math.tau/14),.1),(.91,.90,.85))
    part.face(ring,3,(0,0,1),(.44,.44,.40))
    for d in [depth-.026,depth+.030]:
        pts=[(cx-.092*math.cos(i*math.pi/14),d+.02*math.sin(i*math.pi/14),h+.307+.24*math.sin(i*math.pi/14)) for i in range(15)]
        tube(part,pts,.010,3,.94,5)
    if low:return
    # The paper wraps the stems into a tapered bundle; individual daisies diverge above the sleeve.
    x=.793;d=.286;z=1.53
    for i in range(4):
        a=i*math.tau/4;b=a+1.74
        p=lambda a,r,h:(x+r*math.cos(a),d+r*math.sin(a),z+h)
        part.face([p(a,.016,-.12),p(b,.016,-.12),p(b,.115,.169),p((a+b)/2,.139,.234),p(a,.125,.185)],7,(math.cos((a+b)/2),math.sin((a+b)/2),.17),(.87,.76,.59))
    for i,(dx,dq,dz,s) in enumerate([(-.092,-.009,.30,.052),(-.002,.02,.393,.052),(.075,.011,.325,.061),(.121,-.023,.41,.039),(-.058,.043,.237,.045),(.028,.042,.28,.054)]):
        stem=[(x,d,z-.09),(x+dx*.32,d+dq+.008,z+.13),(x+dx,d+dq,z+dz)]
        tube(blooms,stem,.0034,10,.72,5);daisy(blooms,x+dx,d+dq,z+dz,s)
        side=1 if i%2 else -1
        blooms.face([(x+dx*.6,d+.01,z+.19),(x+dx+.021*side,d+.021,z+.263),(x+dx+.048*side,d+.02,z+.26),(x+dx*.6,d+.011,z+.172)],10,(0,1,.35),(.82,.92,.72))
