"""Two open aisle-facing retail bays from the operator's floor-specific photographs."""
from pathlib import Path
import math
import sys

import bpy
from mathutils import Vector
sys.dont_write_bytecode=True
here=Path(__file__).resolve().parent
for folder in ['gyeongbu','gyeongbu-front-entrance','gyeongbu-childrens-aisle','gyeongbu-suiting-aisle','gyeongbu-womens-aisle']:
    sys.path.insert(0,str(here.parent/folder))
from market_authoring import save_display
from garments import Detail, Display, tube
from tailoring import TailoredPart, jacket
from showroom import support
from knits import garment,pants
import textiles
import wool

def rail(part,a,b,r=.018):
    tube(part,[a,b],r,4,.96,8)

def store_shell(p,h):
    p.box(1.30,0,0,.12,5.12,2.94,3,.87)
    for d in [-2.53,2.53]:p.box(0,d,0,2.58,.09,2.94,3,.91)
    p.box(0,0,2.88,2.62,5.14,.09,3,.94)
    p.box(0,0,0,2.62,5.14,.025,2,.99)
    # The fluorescent batten behind the front bar is visible between garments.
    for d in [-1.56,0,1.56]:
        p.box(-.39,d,2.79,.25,1.33,.065,4,.90)
        for offset in [-.055,.055]:
            rail(h,(-.39+offset,d-.61,2.765),(-.39+offset,d+.61,2.765),.020)
            p.box(-.39+offset,d,2.744,.036,1.16,.022,15,.99)

def steel_run(h,x,d1,d2,heights,low):
    for d in [d1,d2]:
        h.box(x,d,.027,.38,.11,.041,4,.82)
        rail(h,(x,d,.062),(x,d,max(heights)+.05),.022)
    for z in heights:
        rail(h,(x,d1-.07,z),(x,d2+.07,z))
        if not low:
            for d in [d1,d2]:h.box(x,d,z-.036,.069,.070,.077,4,.82)

def form_neck(h,at,top):
    rail(h,at.p(0,0,top-.07),at.p(0,0,top+.105),.056)
    h.face([at.p(-.061,-.046,top+.087),at.p(.061,-.046,top+.087),at.p(.061,.046,top+.087),at.p(-.061,.046,top+.087)],5,(0,0,1),.92)

def section(mens,low):
    shell=Detail('점포 경계 · 천장과 형광등')
    hardware=Detail('크롬 행거와 상품 집게')
    marker=Detail('통로 쪽 돌출 표찰과 천장 지지대')
    cloth=TailoredPart('상단 신사복 행거와 소매 표찰' if mens else '긴 니트와 색상별 뒷줄')
    focus=TailoredPart('코트와 줄무늬 타이 맞춤 형태' if mens else '단추 카디건과 벽면 스카프')
    store_shell(shell,hardware)
    steel_run(hardware,-.70,-2.18,2.18,[1.50,2.58] if mens else [2.46],low)
    steel_run(hardware,.91,-2.12,2.12,[2.38],low)
    for i in range(12 if not low else 8):
        t=i/(11 if not low else 7);d=-1.99+3.98*t
        at=Display(.91,d,1.32,-1,1.35+.05*math.sin(i))
        if mens:jacket(cloth,hardware,at,.97,[9,8,12,6][i%4],i,low=True)
        else:garment(cloth,hardware,at,.98,.219,[9,14,7,11,6,8][i%6],i,outer=None,low=True)
        support(hardware,at,.98,False,True)
    if mens:
        for i in range(18 if not low else 11):
            t=i/(17 if not low else 10);d=-1.81+3.83*t
            at=Display(-.70,d,1.70,-1,1.26+.10*math.cos(i*.89))
            sw=[8,11,12,2,2,8,10][i%7]
            jacket(cloth,hardware,at,.80,sw,i,detailed=(i%4==0 and not low),coat=i%4==0,low=low)
            support(hardware,at,.80,False,low)
            if not low and i%3==0:
                for side in [-1,1]:
                    hardware.face([at.p(side*.065-.012,.072,.043),at.p(side*.065+.012,.072,.043),
                        at.p(side*.065+.012,.072,.10),at.p(side*.065-.012,.072,.10)],7,at.n(0,1,0),.93)
        for i in range(12 if not low else 8):
            d=-1.75+3.70*i/(11 if not low else 7)
            at=Display(-.70,d,.51,-1,1.14+.09*math.sin(i))
            jacket(cloth,hardware,at,.91,[6,9,6,8,13,6][i%6],i,low=low)
            support(hardware,at,.91,False,low)
        for d,sw,tilt in [(-2.17,10,.98),(2.15,13,-.99)]:
            at=Display(-1.12,d,.52,-1,tilt)
            jacket(focus,hardware,at,1.15,sw,8,detailed=True,coat=True,shirt=True,low=low)
            form_neck(hardware,at,1.15)
            if not low:
                for k in range(7):
                    z=.75+k*.04
                    focus.face([at.p(-.027,.105,z),at.p(.032,.105,z+.028),at.p(.032,.105,z+.036),at.p(-.027,.105,z+.008)],11,at.n(0,1,0),.90)
            hardware.box(-1.12,d,.028,.36,.34,.041,4,.87)
            rail(hardware,(-1.12,d,.06),(-1.12,d,.71),.019)
    else:
        for i in range(15 if not low else 9):
            d=-1.87+3.75*i/(14 if not low else 8)
            at=Display(-.69,d,.96,-1,1.17+.16*math.cos(i*1.43))
            outer=[11,9,14,7,6,9][i%6]
            garment(cloth,hardware,at,1.40,.225,[12,7,13,6][i%4],i,outer=outer,low=low)
            support(hardware,at,1.40,False,low)
        for d,sw,outer,tilt in [(-2.15,12,11,.73),(2.15,7,14,-.68)]:
            at=Display(-1.07,d,.68,-1,tilt)
            garment(focus,hardware,at,1.39,.265,sw,9,outer=outer,low=low)
            support(hardware,at,1.39,True,low)
            rail(hardware,(-.71,d,2.46),(-1.07,d,2.18),.018)
        # A low garment rail projects from under the longer knits. Two clips
        # catch each pair at the waistband; the shafts clear the draped hems.
        steel_run(hardware,-1.06,-1.15,1.07,[1.03],low)
        for i in range(8 if not low else 5):
            d=-1.05+1.99*i/(7 if not low else 4)
            at=Display(-1.06,d,.12,-1,1.18+.12*math.cos(i*2.4))
            pants(focus,hardware,at,.85,[7,13,6,12,13,6,7,6][i],i,low)
        # Long lengths hanging beside the upper stock: a different silhouette from the front-facing dress forms across the aisle.
        for i,sw in enumerate([9,13,11,14,12]):
            at=Display(.60,-2.43+i*.23,1.17,-1,.15)
            for j in range(8 if not low else 3):
                n=8 if not low else 3;t=-1+2*j/n;u=t+2/n
                def panel(s,z):return at.p(.13*s,.04*math.cos(7*s+i),z+.04*math.cos(s*2+i))
                focus.face([panel(t,0),panel(u,0),panel(u,1.35),panel(t,1.35)],sw,at.n(0,1,0),.89+.09*math.cos(j))
    cx,dd=-2.40,-1.48
    rail(hardware,(.72,dd,2.85),(cx-.34,dd,2.85),.018)
    if mens:
        shape=[(-.36,.058),(-.36,.177),(-.32,.23),(-.23,.23),(-.20,.178),(-.15,.16),
               (.15,.16),(.20,.178),(.23,.23),(.32,.23),(.36,.177),(.36,.058),(.32,.02),(.10,0),(-.10,0),(-.32,.02)]
        base=2.43
    else:
        shape=[(-.36,.035),(-.36,.17),(-.32,.20),(-.16,.20),(-.13,.245),(.13,.245),
               (.16,.20),(.32,.20),(.36,.17),(.36,.035),(.32,0),(-.32,0)]
        base=2.42
    marker.prism([(cx+x,base+z) for x,z in shape],dd-.023,dd+.023,7,(1.,.94,.69) if mens else (1.,.79,.34))
    if not mens:
        marker.box(cx,dd,base+.035,.54,.048,.116,7,.99)
    for dx in [-.22,.22]:rail(hardware,(cx+dx,dd,base+.18),(cx+dx,dd,2.85),.006)
    soffit=Detail('통로 형광등 금속 프레임과 환기 그릴')
    # Frame the three lenses already present in this run of the shared native
    # corridor ceiling. The metal edges and louvers sit below its lower plane.
    for i in range(3):
        d=109.5-12.80+(i+.53)*8.65/3-100.5
        x=38.0-.075-41.8
        for side in [-1,1]:
            soffit.box(x+side*.206,d,2.885,.017,1.12,.036,4,.86)
            soffit.box(x,d+side*.55,2.885,.424,.022,.036,4,.84)
        if not low:
            for dx in [-.060,.061]:soffit.box(x+dx,d,2.913,.006,1.04,.012,4,.74)
        vx=x+(.91 if i%2==0 else -.96);vd=d+.51
        soffit.box(vx,vd,2.904,.37,.37,.020,3,.66)
        if not low:
            for k in range(7):soffit.box(vx,vd-.13+k*.043,2.896,.29,.019,.012,4,.64)
    return [shell,hardware,cloth,focus,marker,soffit]

for side,stem,name,meshid,material in [('seven','tailored-front','7층 신사복 · 이단 모직 진열과 코트 전면','TailoredFront',wool),
                                       ('eight','knit-front','8층 여성복 · 긴 니트와 스카프 전면','KnitFront',textiles)]:
    save_display(here/side,stem,name,meshid,{'reference':'https://www.exterminal.co.kr/images/floor0'+('7' if side=='seven' else '8')+'.jpg',
        'registration':'Public wholesale sales exhibit. Tenant address, quantity and dimensions are unverified.'},
        material.maps,material.PALETTE,lambda low=False:section(side=='seven',low))
