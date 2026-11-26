"""Floor fixtures, folded stock, wooden hangers and the two window looks."""
import math
from apparel import folded,jersey,wood_hanger,CREAM,INK,PALE,DENIM,MOSS,ROSE,PEACH,BURGUNDY
from garments import tube
from hanbok import Form
from tailoring import TailoredPart
from window_looks import looks

TAU=math.tau


def card(part,at,width,height,sw):
    points=[at.p(-width/2,0,0),at.p(width/2,0,0),at.p(width/2,-.029,height),at.p(-width/2,-.029,height)]
    part.face(points,sw,at.n(0,1,.12),.97,[(0,0),(1,0),(1,1),(0,1)])


def tables(part,labels,low):
    # The oak shelves step down at the end shown in the customer photographs.
    for w,d,h,dh,cd in [(1.39,3.14,.18,.065,0),(1.39,3.14,.54,.055,0),
                         (1.37,2.25,.93,.052,-.438),(1.38,.84,.795,.043,1.154)]:
        part.box(0,cd,h,w,d,dh,0,.96)
    for x in [-.63,.63]:
        for d in [-1.48,.56,1.43]:
            if low:part.box(x,d,.035,.033,.048,.89 if d<1 else .75,2,.85)
            else:
                for xx in [x-.010,x+.010]:part.box(xx,d,.029,.014,.045,.90 if d<1 else .75,2,.88)
                part.box(x,d,.025,.081,.069,.018,9,.89)
    # A straight twin-upright rail is screwed to the top, with a solid metal foot at each end.
    for d in [-1.265,.485]:
        part.box(-.42,d,.987,.21,.18,.013,2,.88)
        tube(part,[(-.42,d,.993),(-.42,d,1.874),(-.402,d,1.893),(.014,d,1.893)],.014,2,.87,6 if low else 10)
    tube(part,[(.014,-1.285,1.891),(.014,.503,1.891)],.014,2,.87,7 if low else 12)
    # The floor platform replaces the closest existing rack, at the same footprint.
    part.box(-3.50,4.00,.03,3.51,.80,.20,1,.95)
    part.box(-3.50,4.00,.226,3.54,.82,.017,1,.98)
    if low:return
    for x,d,h,rot,w in [(-.38,1.593,.859,0,.42),(.64,-.06,1.003,math.pi/2,.45),(-.64,-.81,1.016,-math.pi/2,.43)]:
        at=Form(x,d,h,rot);card(labels,at,w,.20,11)
        tube(part,[at.p(-w/2,0,.002),at.p(w/2,0,.002)],.009,2,.87,7)
    card(labels,Form(-4.74,4.375,.248,-.05),.38,.23,11)


def stock(fabric,rail):
    # Clothing is filed by style and colour on each shelf. The top of each pile
    # has the actual construction detail available to a visitor standing beside it.
    swatches=[CREAM,MOSS,BURGUNDY,INK,PALE,ROSE,DENIM,CREAM]
    group=0
    for h in [.245,.599]:
        for ix,x in enumerate([-.408,0,.408]):
            for j,d in enumerate([-1.19,-.66,-.135,.385,.905,1.30]):
                # Leave breathing room at the small step in the front shelf.
                if j==5 and (h<.3 or ix==1):continue
                count=3+(j+ix+int(h*10))%3
                col=swatches[(j*2+ix+int(h*10))%len(swatches)]
                for k in range(count):
                    seed=group*7+k
                    at=Form(x+.009*math.sin(seed),d+.008*math.cos(seed*1.2),h+.038*k,.023*math.sin(seed*.71))
                    folded(fabric,at,col,seed,w=.374+.008*math.sin(seed),depth=.343 if j>=4 else .418,
                           denim=j in [2,5],featured=k==count-1 and (j in [0,3,5] or ix in [0,2]))
                group+=1
    # Pale trousers and stonewash denim on the open front step have visible
    # return folds, stitched patch pockets, topstitch and hanging size labels.
    for ix,x in enumerate([-.402,0,.402]):
        for row,d in enumerate([.950,1.361]):
            col=[(.91,.86,.72),(.63,.73,.81),(.48,.63,.74)][ix]
            for k in range(4+row):
                seed=52+ix*7+k*3+row
                at=Form(x+.009*math.sin(seed),d+.007*math.cos(seed),.840+k*.040,.047*math.sin(seed))
                folded(fabric,at,col,seed,w=.385,depth=.348,denim=True,featured=k==3+row)
    # The front white crew neck is fully separated from the neighbouring colours.
    for i,(d,col) in enumerate(zip([.410,.200,-.008,-.23,-.45,-.67,-.89,-1.10],
                                    [CREAM,PALE,(.81,.75,.60),MOSS,PEACH,(.37,.46,.55),INK,BURGUNDY])):
        at=Form(.012,d,1.134,.075*math.sin(.73*i)+.012)
        jersey(fabric,at,col,length=.633,seed=1+i*.66)
        wood_hanger(rail,at,.636)


def silhouettes():
    fixture=TailoredPart('원거리 목재 선반과 옷걸이 봉')
    clothes=TailoredPart('원거리 접힌 옷과 진열 토르소')
    tables(fixture,fixture,True)
    for j,d in enumerate([-.96,-.35,.33,.98]):
        for i,x in enumerate([-.4,0,.4]):
            for h in [.247,.599]:
                c=[CREAM,DENIM,MOSS,ROSE,INK,BURGUNDY][(j+i+int(h*20))%6]
                clothes.box(x,d,h,.37,.39,.17,4,c)
    for i,x in enumerate([-.39,0,.39]):
        clothes.box(x,1.20,.838,.37,.65,.17,5,[CREAM,PALE,DENIM][i])
    for d,c in zip([.41,-.07,-.54,-1.04],[CREAM,MOSS,PEACH,INK]):
        p=[(-.08,1.77),(-.24,1.72),(-.31,1.53),(-.22,1.50),(-.23,1.14),
           (.23,1.14),(.22,1.50),(.31,1.53),(.24,1.72),(.08,1.77)]
        clothes.prism(p,d-.033,d+.032,4,c)
    for x,top,bottom,hem in [(-4.05,ROSE,(.88,.80,.73),.60),(-2.96,PEACH,CREAM,.076)]:
        h=.244
        for side in [-1,1]:
            clothes.box(x+.111*side,4.02,h+.015,.09,.13,.81,3,.94)
            clothes.box(x+.111*side,4.02,h+hem,.20,.19,.95-hem,6,bottom)
        clothes.prism([(x-.184,h+.94),(x+.184,h+.94),(x+.21,h+1.39),(x+.07,h+1.49),
                       (x-.07,h+1.49),(x-.21,h+1.39)],3.93,4.10,4,top)
        clothes.prism([(x-.05,h+1.55),(x+.05,h+1.55),(x+.081,h+1.64),(x+.071,h+1.74),
                       (x,h+1.781),(x-.071,h+1.74),(x-.081,h+1.64)],3.98,4.075,3,.96)
    return [fixture,clothes]


def sections(low=False):
    if low:return silhouettes()
    fixture=TailoredPart('목재 단차 선반과 닫힌 사각 철제 받침')
    hangers=TailoredPart('목제 옷걸이·걸쇠와 철제 진열 봉')
    folded_stock=TailoredPart('접힌 치노·데님과 색별 코튼 크루넥')
    forms=TailoredPart('두 토르소의 머리·손·신발')
    clothes=TailoredPart('핑크 셔츠 셋업과 살구색 티·아이보리 팬츠')
    details=TailoredPart('반달형 숄더백·어깨 끈·셔츠 단추')
    labels=TailoredPart('상품 안내 탁상 카드')
    tables(fixture,labels,False);stock(folded_stock,hangers);looks(forms,clothes,details)
    return [fixture,hangers,folded_stock,forms,clothes,details,labels]
