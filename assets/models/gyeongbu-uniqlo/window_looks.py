"""Two clothed window models interpreted from the branch's photographed display."""
import math
from apparel import loft,jersey,dim,CREAM,ROSE,PEACH
from garments import tube
from hanbok import Form

TAU=math.tau


def at_offset(at,x,d,h):
    p=at.p(x,d,h)
    return Form(p.x,p.y,p.z,math.atan2(at.front.x,at.front.y))


def body(part,at,shorts):
    # Egg-shaped featureless plastic heads with a chin, a flat crown and short neck.
    head=[(0,.007,1.52,.058,.049),(0,.016,1.555,.054,.055),(0,.035,1.57,.049,.060),
          (0,.032,1.604,.067,.085),(0,.012,1.665,.085,.094),(0,-.004,1.729,.083,.092),
          (0,-.006,1.768,.059,.071),(0,-.007,1.783,.015,.022)]
    loft(part,at,head,3,(.99,.99,.96),n=26)
    loft(part,at,[(0,0,1.355,.099,.036),(0,0,1.407,.095,.038),(0,0,1.452,.076,.038),
                  (0,.001,1.485,.053,.041),(0,.004,1.556,.052,.049)],3,(.97,.97,.94),n=22)
    for side in [-1,1]:
        # One arm bends gently back and the other lies closer to the bag strap.
        rows=[(side*.242,.030,.786,.018,.021),(side*.246,.041,.805,.029,.025),
              (side*.252,.037,.848,.033,.026),(side*.246,.017,.913,.026,.025),
              (side*.254,-.004,1.045,.040,.035),(side*.250,-.022,1.135,.036,.034),
              (side*.227,-.014,1.283,.052,.052),(side*.201,-.010,1.367,.060,.061)]
        loft(part,at,rows,3,(.96,.96,.94),n=14)
        if shorts:
            leg=[(side*.118,.011,.085,.036,.044),(side*.114,-.003,.213,.037,.041),
                 (side*.112,-.016,.34,.057,.065),(side*.109,-.009,.474,.053,.059),
                 (side*.108,.016,.514,.055,.059),(side*.104,.003,.64,.074,.080),
                 (side*.097,-.002,.79,.087,.093)]
            loft(part,at,leg,3,(.97,.97,.95),n=18)
        # Elongated leather toe, heel and an inset outsole.
        for h,rx,rd,off in [(.014,.052,.103,.036),(.030,.055,.112,.046),
                              (.047,.051,.105,.039),(.060,.045,.082,.017),(.087,.037,.052,-.007)]:
            if h==.014:shoe=[]
            shoe.append((side*.118,off,h,rx,rd))
        loft(part,at,shoe,8,(.92,.92,.87),14)
        for h,q,w in [(.067,.035,.030),(.063,.057,.030)]:
            tube(part,[at.p(side*.118-w,q,h),at.p(side*.118+w,q,h+.002)],.0024,8,(.85,.84,.81),5)


def bottoms(part,at,shorts):
    colour=(.96,.87,.81) if shorts else (.99,.98,.93)
    hem=.616 if shorts else .075
    for side in [-1,1]:
        rows=[(side*.124,.007,hem,.110 if shorts else .104,.095 if shorts else .090),
              (side*.124,.008,hem+.015,.111 if shorts else .105,.096 if shorts else .090),
              (side*.117,.008,hem+(.875-hem)*.32,.098,.089),
              (side*.110,.003,hem+(.875-hem)*.67,.106,.098),
              (side*.097,0,.852,.114,.106),
              (side*.088,0,.924,.114,.103)]
        loft(part,at,rows,6,colour,18,ripple=.033,seed=side+.8)
        line=[at.p(cx+side*rx*.92,q+rd*.40,z) for cx,q,z,rx,rd in rows]
        tube(part,line,.0024,8,dim(colour,.84),5)
    loft(part,at,[(0,0,.842,.195,.105),(0,0,.922,.183,.109),(0,0,.962,.164,.103),
                   (0,0,.982,.166,.105),(0,0,1.005,.164,.107)],6,colour,24,ripple=.023)
    for sign in [-1,1]:
        path=[at.p(sign*x,.100-q,h) for x,q,h in [(.136,.028,.945),(.152,.022,.907),(.165,.032,.865)]]
        tube(part,path,.0028,8,dim(colour,.83),5)


def ribbon(part,at,row,half,sw,tint):
    for a,b in zip(row,row[1:]):
        points=[at.p(a[0]-half,a[1],a[2]),at.p(a[0]+half,a[1],a[2]),
                at.p(b[0]+half,b[1],b[2]),at.p(b[0]-half,b[1],b[2])]
        part.face(points,sw,at.n(0,1,0),tint)


def crossbody(part,at):
    ribbon(part,at,[(-.152,.045,1.485),(-.139,.096,1.449),(-.097,.117,1.386),
                    (-.041,.121,1.338),(.030,.132,1.280),(.105,.145,1.233),
                    (.173,.163,1.205)],.014,6,CREAM)
    # Crescent body hangs diagonally. Two zipper welts meet below the shoulder strap.
    def surface(s,t,front):
        x=-.138+.282*s
        centre=math.sin(s*math.pi)
        top=1.224-.064*centre-.009*s
        bottom=top-(.031+.105*centre**.69)
        width=.017+.031*centre
        q=.143+(width*(.72+.38*math.sin(t*math.pi)) if front else -.74*width)
        return at.p(x+.036,q,bottom+t*(top-bottom))
    n=20
    for front in [True,False]:
        for j in range(n):
            for lo,hi in [(0,.12),(.12,.36),(.36,.64),(.64,.86),(.86,1)]:
                coords=[(j/n,lo),((j+1)/n,lo),((j+1)/n,hi),(j/n,hi)]
                corners=[surface(s,t,front) for s,t in coords]
                normals=[]
                for s,t in coords:
                    ds=surface(min(1,s+.004),t,front)-surface(max(0,s-.004),t,front)
                    dt=surface(s,t+.003,front)-surface(s,t-.003,front)
                    norm=ds.cross(dt)
                    if norm.dot(at.n(0,1 if front else -1,0))<0:norm.negate()
                    normals.append(norm.normalized())
                tint=(.94,.90,.78) if front else (.81,.79,.69)
                part.curved(corners,6,normals,tint,coords)
    for t in [0,1]:
        for j in range(n):
            part.face([surface(j/n,t,True),surface((j+1)/n,t,True),
                       surface((j+1)/n,t,False),surface(j/n,t,False)],6,at.n(0,0,1 if t else -1),(.85,.82,.71))
    for t in [.92,.97]:
        tube(part,[surface(j/n,t,True)+at.front*.0015 for j in range(n+1)],.0023,8,(.79,.77,.67),5)
    end=surface(.84,.92,True)
    tube(part,[end,end+at.n(.005,.006,-.027)],.0032,2,.88,5)



def looks(forms,clothes,small):
    for index,x in enumerate([-4.05,-2.96]):
        at=Form(x,4.02,.245,[-.10,.14][index])
        shorts=index==0
        body(forms,at,shorts);bottoms(clothes,at,shorts)
        top=at_offset(at,0,0,.952)
        jersey(clothes,top,(.98,.82,.79) if shorts else (.998,.78,.59),w=.205,length=.565,worn=True,seed=.3+index)
        if shorts:
            # The dusty pink outfit has a turned-down shirt collar, cuff, buttons and drawstring.
            for sign in [-1,1]:
                coords=[(sign*.012,.095,1.443),(sign*.070,.079,1.514),
                        (sign*.110,.101,1.450),(sign*.061,.127,1.402)]
                small.face([at.p(*v) for v in coords],4,at.n(0,1,0),dim(ROSE,.94))
            tube(small,[at.p(0,.109,h) for h in [1.423,1.27,1.142,1.035]],.0045,8,dim(ROSE,.86),5)
            for h in [1.363,1.279,1.196,1.111]:
                pts=[at.p(.0035*math.cos(k*TAU/9),.117,h+.0035*math.sin(k*TAU/9)) for k in range(9)]
                small.face(pts,8,at.n(0,1,0),(.81,.79,.71))
            tube(small,[at.p(-.012,.104,.973),at.p(-.042,.114,.992),at.p(-.065,.118,.979),
                        at.p(-.031,.113,.965),at.p(-.012,.112,.966),at.p(-.033,.122,.890)],.0035,8,(.91,.85,.73),5)
        else:crossbody(small,at)
