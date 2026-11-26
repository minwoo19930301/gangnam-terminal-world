"""The public red-and-blue yarn category sign and its two neighbouring sales fixtures."""
from math import cos,sin,tau
from tailoring import TailoredPart
from garments import tube

# Original open strokes for the seven glyphs in the photographed category sign.
CIRCLE=[(.5+.20*cos(k*tau/14),.79+.16*sin(k*tau/14)) for k in range(15)]
GLYPHS={
    '면':[[(.12,.51),(.12,.93),(.46,.93),(.46,.51),(.12,.51)],[(.80,.96),(.80,.45)],
         [(.57,.80),(.80,.80)],[(.57,.63),(.80,.63)],[(.21,.35),(.21,.11),(.86,.11)]],
    '사':[[(.37,.89),(.33,.66),(.23,.42),(.08,.25)],[(.30,.61),(.51,.27)],
         [(.71,.96),(.71,.09)],[(.71,.58),(.94,.58)]],
    '울':[CIRCLE,[(.09,.57),(.90,.57)],[(.50,.57),(.50,.42)],[(.16,.36),(.82,.36),(.82,.25),(.16,.25),(.16,.11),(.86,.11)]],
    '전':[[(.09,.91),(.53,.91)],[(.33,.89),(.29,.72),(.21,.59),(.08,.48)],[(.29,.72),(.51,.50)],
         [(.55,.73),(.79,.73)],[(.79,.97),(.79,.46)],[(.21,.36),(.21,.11),(.85,.11)]],
    '문':[[(.18,.68),(.18,.94),(.82,.94),(.82,.68),(.18,.68)],[(.08,.55),(.92,.55)],[(.50,.55),(.50,.40)],[(.20,.34),(.20,.10),(.85,.10)]],
    '도':[[(.81,.91),(.20,.91),(.20,.50),(.81,.50)],[(.51,.47),(.51,.18)],[(.08,.17),(.91,.17)]],
    '매':[[(.08,.24),(.08,.84),(.38,.84),(.38,.24),(.08,.24)],[(.58,.94),(.58,.10)],
         [(.58,.57),(.82,.57)],[(.83,.97),(.83,.08)]],
}


def booth(low=False):
    shell=TailoredPart('01 · Shop back walls, timber counter base and open sides')
    lights=TailoredPart('02 · Fascia, recessed shop lights and thin suspended fittings')
    text=TailoredPart('03 · Raised blue Hangul lettering on the category sign')
    shell.box(0,-1.31,.02,5.15,.076,2.88,6,(.81,.79,.72))
    for x in [-2.55,2.55]:
        shell.box(x,-.06,.028,.077,2.56,2.87,6,(.86,.84,.79))
    shell.box(0,-.02,2.87,5.16,2.60,.065,6,.95)
    # Bake broad contact shadows into the tile vertices. Furniture/garments receive
    # soft local fluorescent fill; darken the floor around their feet and wall edges.
    from math import exp
    def floor_tint(x,d,h):
        def fall(cx,cd,rx,rd):
            return exp(-((x-cx)/rx)**4-((d-cd)/rd)**4)
        ao=.19*fall(1.25,.59,1.16,.46)+.14*fall(-1.28,-.45,1.27,.39)+.12*fall(1.24,-.76,1.14,.41)
        ao+=.09*fall(-1.38,.51,1.0,.25)+.09*exp(-((d+1.31)/.15)**2)
        glow=.07+.075*max(0,(d+1.32)/2.7)
        return tuple(min(1,c+glow-ao) for c in [.76,.76,.71])
    nx=8 if low else 38;nd=5 if low else 23
    for i in range(nx):
        for j in range(nd):
            a=-2.57+5.14*i/nx;b=a+5.14/nx;c=-1.32+2.60*j/nd;d=c+2.60/nd
            shell.face([(a,c,.025),(a,d,.025),(b,d,.025),(b,c,.025)],7,(0,0,1),floor_tint)
    if not low:
        def wall_tint(x,d,z):
            behind=.21*exp(-((x+1.23)/1.32)**4-((z-1.42)/1.04)**4)
            edge=.14*exp(-((z-.07)/.20)**2)+.07*exp(-((abs(x)-2.55)/.21)**2)
            return tuple(min(1,c-behind-edge+.055*z) for c in [.91,.90,.84])
        for i in range(32):
            for j in range(14):
                a=-2.54+i*5.08/32;b=a+5.08/32;c=.03+j*2.81/14;h=c+2.81/14
                shell.face([(a,-1.268,c),(b,-1.268,c),(b,-1.268,h),(a,-1.268,h)],6,(0,1,0),wall_tint)
    if not low:
        for i in range(6):shell.box(-2.26+i*.84,-.02,.026,.007,2.58,.002,7,(.58,.59,.57))
        for d in [-1.14,-.55,.12,.79]:shell.box(0,d,.026,5.10,.006,.002,7,(.59,.60,.58))
        for x in [-1.87,-1.05,-.29,.52,1.36,2.13]:shell.box(x,-.02,2.861,.012,2.53,.009,13,(.78,.78,.74))
    for x in [-1.31,1.27]:
        for d in [-.56,.59]:
            lights.box(x,d,2.81,1.20,.28,.052,4,.92)
            for q in [-.066,.066]:lights.box(x,d+q,2.801,1.13,.051,.018,15,.99)
    a,b,base=.24,2.35,2.456
    lights.box((a+b)/2,1.175,base,b-a,.055,.364,6,.98)
    lights.box((a+b)/2,1.209,base+.266,b-a,.009,.095,6,(.71,.21,.28))
    for x in [a+.19,b-.19]:tube(lights,[(x,1.17,base+.36),(x,1.17,2.88)],.0045,4,n=5)
    if not low:
        word='면사 울사 전문도매';w=.187;advance=.213;x=.365
        for glyph in word:
            if glyph==' ':x+=.116;continue
            for path in GLYPHS[glyph]:
                coords=[(x+u*w,base+.020+v*.215) for u,v in path]
                text.stroke(coords,.0162,1.205,1.211,14,(.30,.55,.75))
            x+=advance
    return [p for p in [shell,lights,text] if p.faces]
