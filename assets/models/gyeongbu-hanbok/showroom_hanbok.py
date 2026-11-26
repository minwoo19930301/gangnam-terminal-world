"""The public side of the fourth-floor fitting and fabric display."""
import math
from garments import Detail,tube
from tailoring import TailoredPart
from hangul import letters as common_letters,path,oval
from hanbok import Form,ensemble

LETTER={
 **common_letters,
 '한':[path(.16,.89,.39,.89),path(.07,.77,.49,.77),oval(.28,.62,.16,.11),
       path(.69,.47,.69,.91),path(.69,.73,.91,.73),path(.19,.38,.19,.13,.85,.13)],
 '복':[path(.22,.93,.22,.64,.77,.64,.77,.93),path(.23,.78,.76,.78),
       path(.50,.61,.50,.46),path(.08,.45,.92,.45),path(.20,.34,.80,.34,.80,.11)],
 '명':[path(.08,.90,.47,.90,.47,.55,.08,.55,.08,.90),path(.54,.81,.80,.81),
       path(.54,.65,.80,.65),path(.81,.49,.81,.93),oval(.47,.28,.245,.15)],
 '대':[path(.46,.80,.10,.80,.10,.24,.46,.24),path(.58,.13,.58,.91),
       path(.58,.55,.84,.55),path(.85,.12,.85,.91)],
 '여':[oval(.29,.53,.205,.30),path(.52,.65,.80,.65),path(.52,.42,.80,.42),path(.81,.11,.81,.92)],
}


def glyph(part,char,x,z,size,depth,sw):
    for line in LETTER[char]:
        pts=[(x+(u-.5)*size,z+(v-.5)*size) for u,v in line]
        part.stroke(pts,size*.068,depth,depth+.0035,sw,.98)


def shell(floor,walls,rails,sign,low):
    floor.box(0,0,.012,5.14,2.58,.033,0,.78)
    if not low:
        for j in range(5):
            for i in range(8):
                a=-2.56+i*.64;d=-1.28+j*.51
                floor.top(a+.004,d+.004,a+.636,d+.507,.047,0,.86+.06*math.cos(i*5+j))
    if not low:
        for cx,cd,rx,rd in [(-1.86,.91,.515,.375),(-.91,.89,.515,.375),(-1.92,-.27,.439,.315),
                             (-1.34,-.61,.439,.315),(-.49,-.48,.439,.315),(.33,-.47,.439,.315),(1.05,-.37,.439,.315)]:
            for k in range(16):
                a=k*math.tau/16;b=(k+1)*math.tau/16
                for r0,r1,c0,c1 in [(.01,.64,.62,.68),(.64,.86,.68,.83),(.86,1,.83,.88)]:
                    polar=[(a,r0,c0),(a,r1,c1),(b,r1,c1),(b,r0,c0)]
                    points=[(cx+rx*r*math.cos(t),cd+rd*r*math.sin(t),.050) for t,r,_ in polar]
                    shade={q:col for q,(_,_,col) in zip(points,polar)}
                    floor.face(points,0,(0,0,1),lambda x,d,h:shade[(x,d,h)])
    walls.box(0,-1.275,.043,5.18,.068,2.80,1,.90)
    for side in [-1,1]:walls.box(side*2.558,-.03,.043,.065,2.56,2.80,1,.92)
    walls.box(0,-.035,2.817,5.18,2.59,.070,1,.93)
    walls.box(0,1.218,2.47,5.18,.17,.375,4,.77)
    sign.front(-2.53,2.49,2.53,2.81,1.310,7,.98)
    if low:
        sign.front(-.62,2.60,.62,2.67,1.318,6,.89)
    else:
        for x,c in zip([-.65,-.35,-.05,.35,.65],'한복의명가'):glyph(sign,c,x,2.674,.265,1.318,6)
        # The board in the visitor photograph spans units 21–23. Preserve
        # the band below the lettering without adding a contact number.
        sign.front(-.69,2.529,.73,2.536,1.318,6,.74)
    sign.box(-2.33,1.213,2.007,.224,.115,.636,14,.92)
    if not low:
        for i,c in enumerate('한복대여'):glyph(sign,c,-2.33,2.535-i*.148,.116,1.277,7)
    for x in [-1.72,-.34,1.28]:
        rails.box(x,-.10,2.785,.033,2.18,.030,4,.80)
        for d in [-.78,.60]:
            tube(rails,[(x,d,2.80),(x,d,2.73)],.012,4,.80,5)
            tube(rails,[(x,d,2.74),(x+.028,d+.024,2.625)],.038,7,.92,6 if low else 10)
            if not low:rails.top(x-.003,d-.004,x+.059,d+.055,2.624,15,.93,down=True)
    # The public shop photograph has upper and lower rails. Keep their
    # legs in the shop, behind the two mannequins at the threshold.
    for d,h in [(-1.08,2.52),(-.79,1.69)]:
        tube(rails,[(-2.32,d,h),(2.29,d,h)],.020,4,.94,6 if low else 9)
        for x in [-2.31,0,2.27]:tube(rails,[(x,d,1.2 if h>2 else .07),(x,d,h+.013)],.018,4,.90,6)
    for d in [-1.01,-.25,.52]:
        tube(rails,[(2.31,d,.07),(2.31,d,1.78)],.017,4,.88,6)
    tube(rails,[(2.31,-1.06,1.78),(2.31,.63,1.78)],.020,4,.91,7)


def hanging_skirt(part,metal,at,tone,phase,low):
    # Skirts hang from a square white waistband. Their free edges ripple
    # independently at ankle level, which leaves gaps between their hems.
    if low:
        part.face([at.p(-.27,.028,.16),at.p(.27,.028,.16),at.p(.19,.028,1.16),at.p(-.19,.028,1.16)],7,at.n(0,1,0),tone)
        part.face([at.p(-.19,.028,1.16),at.p(.19,.028,1.16),at.p(.19,.028,1.32),at.p(-.19,.028,1.32)],7,at.n(0,1,0),.93)
        return
    def point(t,s,back):
        width=.196+.090*(1-s)
        return at.p(t*width,back+.026*math.sin(t*7+phase)*(.44+.56*(1-s)),.16+1.16*s+.013*(1-s)*math.cos(phase+t*5))
    for front in [True,False]:
        q=.029 if front else -.026;direction=1 if front else -1
        ts=[-1,0,1] if low else [-1,-.70,-.36,-.08,.24,.61,1]
        ss=[0,.83,1] if low else [0,.11,.49,.79,.84,1]
        for a,b in zip(ts,ts[1:]):
            for s,t in zip(ss,ss[1:]):
                pairs=[(a,s),(b,s),(b,t),(a,t)]
                if (s+t)*.5>.83:sw=7;shade=.93
                else:sw=7;shade=tuple(c*(.93+.05*math.cos(phase+4*a))*(1 if front else .84) for c in tone)
                part.face([point(u,v,q) for u,v in pairs],sw,at.n(0,direction,0),shade,
                          [((u+1)*.48+.02,v*.95+.02) for u,v in pairs])
    if not low:
        for t in [-.64,.64]:tube(metal,[point(t,.96,.025),at.p(t*.19,.023,1.423)],.006,7,.94,4)
        tube(metal,[at.p(-.20,0,1.407),at.p(.2,0,1.407)],.011,4,.85,5)
        tube(metal,[at.p(0,0,1.408),at.p(0,0,1.445),at.p(0,-.02,1.463),at.p(0,-.034,1.440)],.005,4,.91,5)


def hung_jacket(part,rails,x,d,phase,sw,low):
    at=Form(x,d,1.90,-.92+.10*math.cos(phase))
    if low:
        outline=[(-.14,0),(.14,0),(.25,.13),(.21,.49),(.06,.55),(-.06,.55),(-.21,.49),(-.25,.13)]
        part.face([at.p(xx,.047,h) for xx,h in outline],sw,at.n(0,1,0),.91)
        return
    # A short, loose jacket drapes from its hanger. The sleeve hangs across
    # the front edge; a separate folded collar catches a narrow white highlight.
    vs=[(-1,.012),(-.68,.022),(-.34,.015),(0,.012),(.34,.019),(.68,.011),(1,.014)]
    def body(t,h,front):
        width=.146+.033*h+.035*math.sin(h*math.pi)
        height=(.54-.052*abs(t)**1.4-.036*max(0,1-abs(t)*3))*h+.007*math.sin(phase+t*3)*(1-h)
        depth=(.032 if front else -.031)*(1-.38*t*t)+(.012 if front else -.009)*math.cos(6*t+phase*.5)*(1-h)
        return at.p(t*width,depth,height)
    for facing in [True,False]:
        for (a,_),(b,_) in zip(vs,vs[1:]):
            for z,zz in [(0,.16),(.16,.61),(.61,1)]:
                pairs=[(a,z),(b,z),(b,zz),(a,zz)]
                part.face([body(v,h,facing) for v,h in pairs],sw,at.n(0,1 if facing else -1,0),
                          (.92+.045*math.cos((a+b)*3+phase)) if facing else .77,
                          [(.50+.45*v,.03+.94*h) for v,h in pairs])
    for sign in [-1,1]:
        outline=[(.123,.463),(.185,.493),(.217,.437),(.242,.17),(.157,.137),(.145,.266)]
        points=[at.p(sign*a,.048+(.43-h)*.092,h) for a,h in outline]
        part.face(points,sw,at.n(sign*.3,1,0),.91)
        part.face([at.p(sign*a,-.029,h) for a,h in outline],sw,at.n(sign*.3,-1,0),.81)
        for j in range(len(points)):
            a,h=outline[j];b,hh=outline[(j+1)%len(points)]
            part.face([points[j],points[(j+1)%len(points)],at.p(sign*b,-.029,hh),at.p(sign*a,-.029,h)],
                      sw,at.n(sign*(hh-h),0,a-b),.81)
        cuff=[at.p(sign*.158,.077,.147),at.p(sign*.240,.073,.181)]
        tube(part,cuff,.0029,7,.93,4)
    for outline,shade in [([(-.071,.503),(-.039,.520),(.087,.385),(.064,.356)],.99),
                          ([(.058,.507),(.039,.519),(-.016,.460),(.007,.442)],.88)]:
        part.face([at.p(xx,.046,h) for xx,h in outline],7,at.n(0,1,.08),shade)
    part.face([at.p(.069,.05,.383),at.p(.079,.051,.381),at.p(.064,.053,.242),at.p(.052,.052,.244)],
              sw,at.n(0,1,0),.82)
    tube(rails,[at.p(-.18,0,.498),at.p(0,0,.575),at.p(.17,0,.500)],.008,5,.88,5)
    tube(rails,[at.p(0,0,.563),at.p(0,0,.595),at.p(0,.018,.617),at.p(0,.031,.596)],.004,4,.9,4)



def fabrics(garments,rails,low):
    colours=[(.58,.67,.77),(.79,.65,.69),(.80,.64,.73),(.67,.80,.78),(.89,.84,.84),(.72,.76,.85),(.54,.56,.67)]
    for j in range(17 if not low else 9):
        x=-2.19+j*(4.27/(16 if not low else 8))
        at=Form(x,-.83,.256,-1.04+.10*math.sin(j))
        hanging_skirt(garments,rails,at,colours[j%len(colours)],j*.9,low)
    for j in range(14 if not low else 6):
        x=-2.13+j*4.20/(13 if not low else 5)
        hung_jacket(garments,rails,x,-1.04,j,[7,7,7,13,7,11,7][j%7],low)
    for j in range(8 if not low else 4):
        d=-.89+j*1.33/(7 if not low else 3)
        hanging_skirt(garments,rails,Form(2.33,d,.309,-.18+.09*math.cos(j)),colours[(j*3)%len(colours)],j+14,low)


def counter(body,details,low):
    x,d=1.61,.83
    body.box(x,d,.060,1.36,.66,.625,5,.83)
    body.box(x,d,.680,1.38,.68,.046,4,.79)
    body.top(x-.62,d-.269,x+.62,d+.269,.734,13,.77)
    for xx in [x-.65,x+.65]:
        body.box(xx,d,.719,.033,.66,.159,4,.81)
    for dd in [d-.306,d+.308]:
        body.box(x,dd,.719,1.31,.025,.152,4,.86)
        body.box(x,dd,.865,1.34,.031,.011,13,.97)
    if low:return
    for i in range(9):
        xx=x-.36+(i%5)*.18;dd=d+.03+(i//5)*.122
        details.box(xx,dd,.739,.142,.089,.008,7,.94)
        tr=i*.54
        tube(details,[(xx-.050+.01*k,dd+.012*math.sin(tr+k*.54),.754) for k in range(10)],.006,8,.89,5)
        for n in [-1,1]:
            details.box(xx+.027*n,dd-.016,.754,.019,.014,.010,8,.90)
    # A small yellow sample book with visible paper edges and a navy binder.
    for xx,dd,w,deep,tone,thick in [(x-.30,d+.08,.43,.31,(.95,.84,.29),.043),(x+.14,d-.04,.34,.25,(.42,.47,.52),.029)]:
        for i in range(3):
            details.box(xx+.005*i,dd-.006*i,.88+i*thick,w,deep,thick*.82,7,.87)
            details.box(xx+.005*i,dd-.006*i,.88+(i+.82)*thick,w+.011,deep+.009,thick*.18,7,tone)
        details.top(xx-.11,dd-.07,xx+.09,dd-.063,.881+3*thick,7,.97)


def sections(low=False):
    deck=Detail('01 · Pale floor and threshold')
    walls=Detail('02 · Open shop shell')
    steel=Detail('03 · Light tracks, shop rails and individual hangers')
    sign=Detail('04 · Blue shop lettering and suspended rental sign')
    front=TailoredPart('05 · Gold brocade and slate silk display mannequins')
    back=TailoredPart('06 · Pastel and embroidered occasion wear')
    stock=Detail('07 · Hanging skirts, white waistbands and jackets')
    wood=Detail('08 · Counter carcass and polished display edges')
    books=Detail('09 · Sample books and norigae counter trays')
    shell(deck,walls,steel,sign,low)
    ensemble(front,Form(-1.86,.91,.044,-.03,1.01),2,7,.20,brocade=True,low=low,front=True)
    ensemble(front,Form(-.91,.89,.044,.08,1.005),3,7,1.73,embroidery=True,low=low,front=True)
    for i,(x,d,sk,top,theta) in enumerate([(-1.92,-.27,11,7,.18),(-1.34,-.61,7,10,.09),
                                              (-.49,-.48,7,7,.03),(.33,-.47,13,12,-.08),
                                              (1.05,-.37,10,7,-.15)]):
        ensemble(back,Form(x,d,.053,theta,.87),sk,top,i+.64,embroidery=i in [1,2,3],low=low)
    fabrics(stock,steel,low);counter(wood,books,low)
    return [part for part in [deck,walls,steel,sign,front,back,stock,wood,books] if part.faces]
