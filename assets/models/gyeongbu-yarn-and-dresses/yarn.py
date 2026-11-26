"""Colour-sorted stock with recessed wound ends, crossed strands and separate paper belly bands."""
import math
import random
from mathutils import Vector
from tailoring import TailoredPart
from garments import tube

TAU = math.tau
ROWS = [
    ['e84f82','f187a9','df5288','ef8f9e','edb9ab','ecb385','c98279','c86977'],
    ['f3afb9','f4cbc3','f2d6b1','e5bc7c','eacb81','d6b36c','b8a281','b09c83'],
    ['c5e2b5','b4d7a6','70c192','8bc4b6','95babe','6ba2ad','94c3d1','7aaccf'],
    ['b8acd2','b4b8df','9a9dc5','b49ec0','d2a6c5','ccadd0','c3abc3','ad91b2'],
    ['e9dba7','ced5ba','cfdbbf','a9c2a1','b1afa0','c6c3ad','d1c7ae','eadaba'],
    ['f2e7d2','eddccc','ddd1bf','c6c0b7','a5a099','918f8e','817e79','696b69'],
]


def tone(code,factor=1):
    return tuple(min(1,int(code[i:i+2],16)*factor/255) for i in (0,2,4))


def skein(stock,labels,cx,depth,height,length,r,heading,color,seed,low=False,band=True,tail=False,detail=True):
    c,s=math.cos(heading),math.sin(heading)
    def point(x,v,h):
        return Vector((cx+x*c-v*s,depth+x*s+v*c,height+h))
    def normal(x,v,h):
        return Vector((x*c-v*s,x*s+v*c,h)).normalized()
    scale=1+.07*math.sin(seed*8)
    profile=[(-1,.19),(-.88,.68),(-.63,.96),(-.28,1.02),(0,.88),(.29,1.02),(.63,.97),(.89,.65),(1,.19)]
    if low:
        # Six vertices outline the two rounded ends of a bundle in the distant view.
        front=[(-1,0),(-.68,.76),(.60,.83),(1,.21),(.87,-.55),(-.48,-.72),(-.94,-.45)]
        points=[point(x*length*.5,.45*r,z*r) for x,z in front]
        stock.face(points,0,normal(0,1,0),color)
        return
    if not detail:profile=[(-1,.24),(-.71,.86),(0,.93),(.71,.86),(1,.24)]
    n=12 if tail else 9 if detail else 7
    slopes=[]
    for i in range(len(profile)):
        a,ra=profile[max(0,i-1)];b,rb=profile[min(len(profile)-1,i+1)]
        slopes.append(-(rb-ra)*r/((b-a)*length*.5))
    def sample(t,rr,a):
        bulge=1+.050*math.sin(3*a+2*t+seed)+.033*math.cos(5*a-1.7*t+seed)
        return point(t*length*.5,rr*r*bulge*math.cos(a),rr*r*bulge*.86*scale*math.sin(a)+.009*(1-abs(t))*math.sin(seed))
    for j,((t,rr),(u,ss)) in enumerate(zip(profile,profile[1:])):
        for i in range(n):
            a,b=i*TAU/n,(i+1)*TAU/n
            coords=[(t,rr,a),(t,rr,b),(u,ss,b),(u,ss,a)]
            pts=[sample(*q) for q in coords]
            norms=[normal(slopes[level],math.cos(phi),math.sin(phi)*1.14) for (_,_,phi),level in zip(coords,[j,j,j+1,j+1])]
            stock.curved(pts,seed%2,norms,color,
                [((v+1)*.5,.02+.96*phi/TAU) for v,rr,phi in coords])
    # These small dark hollows and their spiral lips distinguish a wound skein from a smooth oval.
    for sign in [1,-1] if detail else [1]:
        for i in range(n):
            a,b=i*TAU/n,(i+1)*TAU/n
            far=[sample(sign,.19,phi) for phi in (a,b)]
            near=[point(sign*.47*length,.08*r*math.cos(phi),.08*r*math.sin(phi)) for phi in (b,a)]
            stock.face([*far,*near],2,normal(sign,0,0),tuple(v*.61 for v in color))
        stock.face([point(sign*.465*length,.084*r*math.cos(k*TAU/n),.084*r*math.sin(k*TAU/n)) for k in range(n)],
                   2,normal(sign,0,0),tuple(v*.38 for v in color))
    if band:
        for i in range(n):
            a,b=i*TAU/n,(i+1)*TAU/n
            strip=[point(t*length*.5,.998*r*math.cos(phi),.91*r*scale*math.sin(phi)+.013*math.sin(seed))
                   for t,phi in [(-.22,a),(-.22,b),(.22,b),(.22,a)]]
            labels.face(strip,3,normal(0,math.cos((a+b)/2),math.sin((a+b)/2)),
                       (.97,.965,.90),[(0,(i%3)/3),(0,((i%3)+1)/3),(1,((i%3)+1)/3),(1,(i%3)/3)])
    if tail:
        points=[point(.30*length,.70*r,.27*r),point(.45*length,.80*r,.05*r),
                point(.58*length,.92*r,-.63*r),point(.64*length,1.18*r,-.67*r),
                point(.69*length,1.07*r,-.69*r)]
        tube(labels,points,.0027,0,color,n=4)


def shelf_stock(low=False):
    body=TailoredPart('01 · Finished shelves, pigeonhole edges and low counter')
    stock=TailoredPart('02 · Cotton and wool skeins with indented, wound ends')
    bands=TailoredPart('03 · Paper belly bands and loose ends')
    w=2.14;centre=1.26;back=-.97
    body.box(centre,back,.14,w,.045,2.12,6,(.84,.80,.68))
    for pos in [centre-w/2,centre,centre+w/2]:
        body.box(pos,-.74,.13,.036,.51,2.15,6,.94)
    for j,level in enumerate([.16,.51,.86,1.21,1.56,1.91,2.25]):
        body.box(centre,-.74,level,w+.06,.53,.029,6,.97)
        body.box(centre,-.466,level+.003,w+.06,.015,.026,5,.86)
    # The lower serving table carries a denser stack with its short ends facing the aisle.
    body.box(1.24,.62,.11,1.99,.55,.64,5,(.82,.76,.67))
    body.box(1.24,.63,.75,2.03,.64,.041,6,.94)
    body.box(1.24,.89,.13,1.88,.036,.54,6,(.84,.82,.75))
    rng=random.Random(606)
    for row in range(6):
        for col in range(8):
            x=.34+.262*col+.009*rng.uniform(-1,1);base=.192+row*.35
            for level in range(2):
                if row==5 and level==1 and col%3==1:continue
                colour=tone(ROWS[(row+3)%6][col],.96+.04*rng.random())
                direction=math.pi*.5+rng.uniform(-.14,.14) if (row+col)%4!=1 else rng.uniform(-.14,.10)
                length=.31 if abs(math.sin(direction))>.7 else .245
                skein(stock,bands,x+(level-.4)*.007,-.681+.015*rng.random(),base+.070+level*.132,
                      length,.098,direction,colour,row*36+2*col+level,low,band=(row+col+level)%3==1,detail=False)
    for row in range(5):
        for col in range(3):
            x,d,z=packet_center(row,col)
            colour=ROWS[[0,2,3,1,4][row]][col*2+(row%2)]
            for j in range(2):
                for k in range(2):
                    sx=x+(j-.50)*.281
                    sd=d+(k-.50)*.216
                    skein(stock,bands,sx,sd,z+.067,.288,.079,.035*rng.uniform(-1,1),tone(colour,.96+.04*rng.random()),
                          509+row*29+col*6+j*2+k,low,band=(k==1 and (row+col+j)%3!=1),detail=k==1)
    # Unwrapped counter samples rest on the uppermost packets.
    for i,code in enumerate(['d88ca5','d8aa72','a3b5a1']):
        x,d,z=packet_center(4,i)
        skein(stock,bands,x+.025,d+.03,z+.209,.321,.089,-.23+i*.19,tone(code),142+i,low,tail=True)
    return [p for p in [body,stock,bands] if p.faces]


def packet_center(row,col):
    return (.573+col*.651+.011*math.sin(row*2+col),.618+.016*math.sin(row*.9+col*3),.798+row*.142)


def stock_wrap(low=False):
    film=TailoredPart('01 · Crimped clear sleeves enclosing four individual skeins')
    seam=TailoredPart('02 · Folded film corners and pressure seal')
    for row in range(5):
        for col in range(3):
            x,d,z=packet_center(row,col);w=.614;depth=.463;height=.144
            # The seal follows the squashed shoulders and valleys between the skeins.
            count=4 if low else 10
            for face in [-1,1]:
                def front(j,level):
                    t=j/count;end=abs(t-.5)*2
                    bulge=(1-end**4)*(.007+.009*math.cos(t*12+row))-.008*math.cos(t*13)
                    return (x+(t-.5)*w,d+face*(depth*.5+bulge*math.sin(level*math.pi)),z+height*level)
                for j in range(count):
                    for h,q in [(0,.19),(.19,.59),(.59,.86),(.86,1)]:
                        film.face([front(j,h),front(j+1,h),front(j+1,q),front(j,q)],12,(0,face,0),.94)
            for side in [-1,1]:
                # An inward crease meets two crimped ears at each end of the sealed sleeve.
                for v in [-1,1]:
                    a=(x+side*w/2,d+v*depth*.5,z+.008);b=(a[0],a[1],z+height-.005)
                    c=(x+side*(w*.5-.018),d+.026*v,z+height*.51)
                    seam.face([a,b,c],12,(side,0,0),.92)
                seam.box(x+side*(w*.5-.008),d,z+height*.50,.017,depth*.80,.004,12,.92)
            for band in range(count):
                left=(band/count-.5)*w;right=((band+1)/count-.5)*w
                h=lambda t:z+height+.004+.006*math.cos(t*20+row)
                film.face([(x+left,d-depth*.5,h(left)),(x+right,d-depth*.5,h(right)),
                           (x+right,d+depth*.5,h(right)),(x+left,d+depth*.5,h(left))],12,(0,0,1),.97)
    return [film,seam]
