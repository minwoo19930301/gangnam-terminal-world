"""Two-sided freestanding rails with shelf lips, timber hangers and garment tickets."""
import math
from tailoring import TailoredPart
from garments import tube
from apparel import wood_hanger,dim
from hanbok import Form
from outerwear import garment,hanging_silhouette

TAU=math.tau
SHELL=[(.99,.98,.94),(.49,.52,.53),(.34,.41,.50),(.74,.79,.78),(.28,.31,.35),(.47,.57,.66)]
COTTON=[(.98,.97,.93),(.25,.29,.35),(.90,.85,.75),(.84,.67,.69),(.79,.81,.85),(.65,.73,.69)]


def card(part,at,w,h,sw):
    points=[at.p(-w/2,0,-h/2),at.p(w/2,0,-h/2),at.p(w/2,0,h/2),at.p(-w/2,0,h/2)]
    part.face(points,sw,at.n(0,1,0),.98,[(0,0),(1,0),(1,1),(0,1)])


def rack(frame,wood,sign):
    for h in [.105,.975,2.015]:
        wood.box(0,0,h,3.52,.80,.040,0,.96)
        for d in [-.397,.397]:frame.box(0,d,h+.002,3.52,.018,.019,1,.86)
    for x in [-1.71,-.57,.57,1.71]:
        for d in [-.333,.333]:
            frame.box(x,d,.035,.038,.039,2.09,2,.87)
            frame.box(x,d,.031,.083,.078,.022,9,.85)
    for d in [-.219,.219]:
        for h in [.919,1.916]:
            tube(frame,[(-1.70,d,h),(1.70,d,h)],.012,2,.91,10)
    frame.box(0,0,2.064,3.50,.055,.322,1,.90)
    for side in [-1,1]:
        angle=0 if side>0 else math.pi
        card(sign,Form(-.43,side*.037,2.218,angle),.68,.287,11)
        card(sign,Form(.14,side*.037,2.218,angle),.32,.281,13)
        card(sign,Form(1.49,side*.037,2.218,angle),.21,.21,12)
        for x in [-1.18,0,1.18]:
            # Angle shelf-edge cards toward a visitor looking down the aisle.
            card(sign,Form(x,side*.410,1.006,angle),.158,.062,10)


def price_tag(part,at,offset):
    q=.081;h=.525
    path=[at.p(offset-.015,.063,.595),at.p(offset+.002,q,.547),at.p(offset+.008,q,.526)]
    tube(part,path,.0013,6,.85,4)
    corners=[at.p(offset-.018,q,h-.079),at.p(offset+.031,q+.010,h-.075),
             at.p(offset+.026,q+.003,h),at.p(offset-.019,q-.004,h-.004)]
    part.face(corners,10,at.n(0,1,0),.96,[(0,0),(1,0),(1,1),(0,1)])


def top_row(fabric,hardware,style):
    parka=style=='parka';colours=SHELL if parka else COTTON;H=.696 if parka else .575
    base=1.916-H-.122
    for side in [-1,1]:
        direction=0 if side>0 else math.pi
        for j,x in enumerate([-1.10,0,1.10]):
            colour=colours[j if side>0 else j+3]
            front=Form(x,side*.278,base,direction+side*.031*math.sin(j+.37))
            garment(fabric,front,style,colour,.71+j*1.6+side*.41)
            wood_hanger(hardware,front,H);price_tag(hardware,front,.068)
            # A second size in the bay sits further back on the short arm; its sleeve
            # and hem remain visible from the ends of the fixture.
            behind=Form(x+.039,side*.146,base-.012,direction+side*.09)
            hanging_silhouette(fabric,behind,style,colour,H)
            wood_hanger(hardware,behind,H)
        for x in [-1.66,-.55,.55,1.66]:
            tube(hardware,[(x,0,1.916),(x,side*.314,1.916)],.012,2,.89,6)
        # Garments under the timber shelf turn sideways on the long rail.
        # Densely packed sizes share a silhouette with the same hem, hood or cuff.
        for j in range(15):
            x=-1.52+3.04*j/14
            tone=colours[(j//3+(1 if side<0 else 0))%len(colours)]
            at=Form(x,side*.217,.143,direction+side*(1.30+.13*math.sin(j*.76)))
            hanging_silhouette(fabric,at,style,tone,.640)
            wood_hanger(hardware,at,.648)


def distant(style):
    frame=TailoredPart('원거리 목재·철제 행거')
    profiles=TailoredPart('원거리 행거 앞·뒤 상품 색과 소매')
    palette=SHELL if style=='parka' else COTTON
    for h in [.12,.990,2.035]:frame.box(0,0,h,3.50,.79,.033,0,.94)
    for x in [-1.71,-.56,.56,1.71]:frame.box(x,0,.030,.036,.043,2.34,2,.82)
    frame.box(0,0,2.066,3.48,.046,.315,1,.91)
    for side in [-1,1]:
        direction=0 if side>0 else math.pi
        for j,x in enumerate([-1.1,0,1.1]):
            at=Form(x,side*.301,1.105,direction)
            h=.68 if style=='parka' else .575
            outline=[(-.08,h),(-.23,h-.093),(-.303,.09 if style=='parka' else .34),
                     (-.218,.061 if style=='parka' else .31),(-.202,.009),(.206,.009),
                     (.219,.061 if style=='parka' else .31),(.299,.09 if style=='parka' else .34),
                     (.23,h-.093),(.08,h)]
            profiles.face([at.p(xx,0,hh) for xx,hh in outline],4 if style=='parka' else 5,at.n(0,1,0),palette[j+(0 if side>0 else 3)])
            if style=='parka':
                profiles.face([at.p(-.10,.002,h-.01),at.p(.10,.002,h-.01),at.p(.06,-.013,h+.085),at.p(-.04,-.02,h+.096)],
                              6,at.n(0,1,0),dim(palette[j],.78))
        for j in range(8):
            x=-1.45+2.90*j/7
            profiles.box(x,side*.20,.147,.23,.31,.54,6,dim(palette[(j//2+1)%6],.86))
    return [frame,profiles]


def sections(style,low=False):
    if low:return distant(style)
    metal=TailoredPart('철제 양면 선반·지지대')
    planks=TailoredPart('목재 상·하 선반')
    clothes=TailoredPart('후드 파카와 옆걸이 재고' if style=='parka' else '시어서커 블라우스와 옆걸이 재고')
    signs=TailoredPart('상품 그림·상단 안내·사이즈 표')
    rack(metal,planks,signs);top_row(clothes,metal,style)
    return [metal,planks,clothes,signs]
