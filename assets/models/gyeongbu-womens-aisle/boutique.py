"""Women's public shop fronts with a botanical knit and trouser rail facing hooded display forms."""
import math
from garments import Detail,Display,tube
from aisle import floors,corridor_run,side
from showroom import support
from tailoring import TailoredPart
from knits import garment,pants
from mannequins import mannequin


class DisplayPart(TailoredPart):
    def face(self,points,swatch,normal,tint=1.,uv=None):
        if swatch in [13,16]:
            if uv is None:
                a,b,c=map(abs,normal)
                coords=[(x,d) if c>=max(a,b) else (x,z) if b>=a else (d,z) for x,d,z in points]
                lo_x,lo_y=map(min,zip(*coords));hi_x,hi_y=map(max,zip(*coords))
                uv=[((x-lo_x)/max(.015,hi_x-lo_x),(y-lo_y)/max(.015,hi_y-lo_y)) for x,y in coords]
            uv=[(u,.60+.38*v if swatch==16 else .015+.52*v) for u,v in uv]
            swatch=13
        super().face(points,swatch,normal,tint,uv)


def frame(floor,walls,rails,low):
    floor.top(1.84,-3.15,4.86,3.13,.060,2,.97)
    if not low:
        for j in range(10):
            for k in range(5):
                x=1.85+k*.59;d=-3.14+j*.62
                floor.top(x+.003,d+.003,x+.586,d+.616,.064,2,.93+.047*math.cos(j*17+k))
    for x,f in [(-4.86,1),(4.86,-1)]:
        side(walls,x,-3.15,3.15,.075,2.82,3,f,.85)
        for d in [-3.15,3.15]:walls.box(x+f*1.13,d,.076,2.30,.076,2.70,3,.84)
    for x,direction in [(1.45,-1),(-2.75,1)]:
        for d in [-2.68,.01,2.71]:
            if low:rails.box(x,d,.08,.047,.052,2.58,4,.85)
            else:
                tube(rails,[(x,d,.09),(x,d,2.74)],.021,4,.94,8)
                rails.box(x,d,.065,.25,.14,.025,4,.85)
        for h in ([1.40,2.36] if x>0 else [1.75,2.43]):
            tube(rails,[(x-.02*direction,-2.73,h),(x-.02*direction,2.75,h)],.015,4,.95,5 if low else 8)
    for x in [-4.38,4.40]:
        tube(rails,[(x,-2.79,2.26),(x,2.79,2.26)],.015,4,n=5 if low else 7)
        if not low:
            for d in [-2.48,0,2.46]:tube(rails,[(x,d,2.26),((4.83 if x>0 else -4.83),d,2.30)],.012,4,n=5)


def textile_hanging(fabric,steel,x,d,sw,phase,low):
    # Broad textiles hang behind the short samples. The printed surface follows every fold.
    direction=-1 if x>0 else 1
    width=.37+.025*math.sin(phase);top=2.77;bottom=1.59+.10*math.cos(phase)
    ts=[-1,-.52,0,.52,1] if low else [-1,-.83,-.63,-.37,-.12,.14,.41,.64,.83,1]
    ss=[0,.50,1] if low else [0,.09,.29,.53,.78,1]
    def point(t,s):
        ripple=.038*math.sin(t*11.3+phase+.52*s)+.018*math.cos(t*5.7-phase)
        return (x+direction*ripple,d+t*width*(.92+.08*(1-s)),bottom+(top-bottom)*s+.019*(1-s)*math.sin(t*9+phase))
    for a,b in zip(ts,ts[1:]):
        for lo,hi in zip(ss,ss[1:]):
            pairs=[(a,lo),(b,lo),(b,hi),(a,hi)]
            fabric.face([point(t,s) for t,s in pairs],sw,(direction,0,0),.92+.045*math.cos((a+b)*4.4+phase),
                        [(.05+.89*(t+1)/2,.06+.88*s) for t,s in pairs])
    if not low:
        tube(steel,[(x,d-width*.97,top+.004),(x,d+width*.97,top+.004)],.014,5,.90,n=7)
        for t in [-.75,.75]:tube(steel,[point(t,.976),(x,d+t*width,top+.049)],.004,4,n=4)


def knit_shop(parts,low):
    knits,printed,slacks,metal=parts
    for i,(d,sw) in enumerate([(-2.03,9),(-1.22,12),(-.40,9),(.47,11),(1.38,9),(2.20,12)]):
        textile_hanging(printed,metal,2.88,d,sw,i+1,low)
    for i,(d,shirt,outer,vest) in enumerate([(-2.40,8,None,True),(-1.55,12,10,False),(-.68,9,None,False),
                (.19,11,None,False),(1.02,12,None,False),(1.84,8,None,True),(2.43,7,14,False)]):
        h=.63+.048*(i%3)
        at=Display(1.43,d,2.30-h,-1,-.24+.12*math.sin(i*2.7))
        garment(knits,metal,at,h,.215+.012*(i%2),shirt,31+i,outer=outer,vest=vest,low=low)
        support(metal,at,h,not low and i in [0,1,4],low)
    for i,d in enumerate([-2.38,-1.65,-.95,-.25,.42,1.09,1.76,2.39]):
        h=.91+.045*math.cos(i*1.75)
        at=Display(1.39,d,1.338-h,-1,-.20-.08*math.cos(i*2.3))
        pants(slacks,metal,at,h,[6,13,13,14,6,13,6,13][i],i+6,low=low)
        if not low and i in [0,2,4,6]:
            rear=Display(1.56,d+.089,1.337-h,-1,-.17)
            pants(slacks,metal,rear,h*.97,13 if i==0 else 6,i+19,low=True)
    for i,d in enumerate([-2.24,-1.31,-.38,.56,1.49,2.40]):
        at=Display(4.35,d,1.40,-1,-.08)
        garment(printed,metal,at,.78,.224,[9,11,12,8,14,9][i],i+64,low=True)
        if not low:support(metal,at,.78,False,False)


def coat_shop(parts,low):
    forms,rails,stock=parts
    for i,(x,d,sw,angle,quilted) in enumerate([(-1.21,-2.24,13,-.71,True),(-1.31,-1.10,14,-.57,False)]):
        at=Display(x,d,.42 if quilted else .33,1,angle)
        mannequin(forms,rails,at,1.065 if quilted else 1.15,sw,i+8,quilted,low)
    for i,d in enumerate([-.21,.14,.50,.85,1.20,1.55,1.91,2.28,2.58]):
        sw=[6,9,13,6,11,6,8,14,6][i]
        h=.88+.093*math.sin(i*2.21)
        at=Display(-2.69,d,1.69-h,1,-1.25+.10*math.cos(i))
        garment(stock,rails,at,h,.238,sw,82+i,low=low or i not in [0,5])
        if not low:support(rails,at,h,i==0,False)
    for i,d in enumerate([-2.18,-1.13,-.07,1.08,2.15]):
        sw=[11,9,6,12,14][i]
        at=Display(-4.34,d,1.34,1,.07*math.sin(i))
        garment(stock,rails,at,.86,.239,sw,94+i,low=True)
        if not low:support(rails,at,.86,False,False)
    for i,d in enumerate([-2.16,-1.28,-.40,.48,1.35,2.23]):
        if i in [1,2]:continue
        textile_hanging(stock,rails,-3.20,d,[11,9,14,11,6,14][i],i+19,low)


def sections(low=False):
    floor=Detail('01 · Dark gallery floor and honey-coloured shop threshold')
    cap=Detail('02 · Suspended shop ceiling with fluorescent trays')
    wall=Detail('03 · Open booth returns and public shop backings')
    metal=DisplayPart('04 · Rails, clip hangers, buttons and turned mannequin necks')
    knits=DisplayPart('05 · Embroidered vest and layered orange cardigan with botanical shirt')
    prints=DisplayPart('06 · Folded paisley lengths and hanging botanical textiles')
    pants_part=DisplayPart('07 · Pressed trousers, individual legs, waistband and pocket seams')
    forms=DisplayPart('08 · Quilted fur-trimmed coat and long red wool coat on display forms')
    stock=DisplayPart('09 · Additional public hanging knit and outerwear samples')
    floors(floor,cap,low);corridor_run(floor,cap,low);frame(floor,wall,metal,low)
    knit_shop([knits,prints,pants_part,metal],low);coat_shop([forms,metal,stock],low)
    return [p for p in [floor,cap,wall,metal,knits,prints,pants_part,forms,stock] if p.faces]
