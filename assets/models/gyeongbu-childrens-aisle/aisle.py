"""One public aisle, two facing children's stalls and their low suspended shop ceiling."""
import math
from garments import Detail,Display,tee,shorts,hanger,folded,draped,tube

def side(part,x,a,b,lo,hi,sw,face=1,light=1.,uv=None):
    part.face([(x,a,lo),(x,b,lo),(x,b,hi),(x,a,hi)],sw,(face,0,0),light,uv)

def floors(floor,cap,low):
    a,b,near,far=-5.0,5.04,-4.15,4.15
    if low:
        floor.top(a,near,b,far,.053,0,.94)
        for x,d,w,h in [(-.1,-2.87,.70,1.19),(.55,1.95,.70,.59)]:floor.top(x,d,x+w,d+h,.056,1,.92)
        cap.top(a,near,b,far,2.96,3,.94,True)
        for d in [-2.75,0,2.75]:cap.top(-.20,d-.61,.20,d+.61,2.935,15,1,True)
        return
    floor.top(a,near,b,far,.044,6,.62)
    nx,nd=16,14
    greens={(6,1),(6,2),(7,2),(8,6),(9,9),(10,10),(9,10),(5,12),(7,13),(13,4)}
    for i in range(nx):
        for j in range(nd):
            x0=a+(b-a)*i/nx;x1=a+(b-a)*(i+1)/nx
            d0=near+(far-near)*j/nd;d1=near+(far-near)*(j+1)/nd
            mat=1 if (i,j) in greens else 0
            t=.96+.027*math.sin(i*23.71+j*34.92)
            # A faint baked contact darkening follows the stall edge; the clear walking strip keeps its sheen.
            def tone(x,d,h):
                k=t-.093*math.exp(-((abs(x)-1.66)/.36)**2)*math.exp(-max(0,abs(d)-2.64)*3)
                return k,k,k*.993
            uv=[(.02,.02),(.97,.02),(.97,.97),(.02,.97)]
            if j%2:uv.reverse()
            floor.face([(x0+.0022,d0+.0022,.052),(x1-.0022,d0+.0022,.052),(x1-.0022,d1-.0022,.052),(x0+.0022,d1-.0022,.052)],mat,(0,0,1),tone,uv)
    cap.top(a,near,b,far,2.975,4,(.68,.69,.67),True)
    nc,nd=12,13
    for i in range(nc):
        for j in range(nd):
            x0=a+(b-a)*i/nc;x1=a+(b-a)*(i+1)/nc;d0=near+(far-near)*j/nd;d1=near+(far-near)*(j+1)/nd
            cap.top(x0+.009,d0+.008,x1-.009,d1-.008,2.962,3,.94+.041*math.cos(i*15+j*4.9),True)
    for x in [-3.50,-.08,3.12]:
        for k,d in enumerate([-2.74,0,2.73]):
            cap.box(x,d,2.928,.42,1.13,.027,4,.80)
            cap.top(x-.18,d-.521,x+.18,d+.521,2.923,15,(.97,.99,1),True)
            for dx in [-.053,.056]:cap.top(x+dx-.003,d-.52,x+dx+.003,d+.52,2.921,4,.82,True)
    for x,d in [(-.93,1.41),(2.06,-1.82)]:
        cap.top(x-.21,d-.20,x+.21,d+.20,2.934,4,.76,True)
        for k in range(6):cap.top(x-.165,d-.13+k*.049,x+.165,d-.114+k*.049,2.93,6,.80,True)
    for d in [near,far]:cap.box((a+b)/2,d,2.955,b-a,.055,.092,3,.79)

def corridor_run(floor,cap,low):
    # Continue the common circulation finish past both display fronts.
    for a,b in [(-12.80,-4.15),(4.15,20.80)]:
        left,right=-2.45,2.45
        floor.top(left,a,right,b,.044,0,.85)
        cap.top(left,a,right,b,2.974,3,.91,True)
        rows=round((b-a)/.61)
        if not low:
            for j in range(rows):
                d0=a+(b-a)*j/rows;d1=a+(b-a)*(j+1)/rows
                for i in range(8):
                    x=left+i*(right-left)/8;xx=x+(right-left)/8
                    green=(j+int(b))%13==i and i in [2,4,5]
                    floor.top(x+.0022,d0+.0022,xx-.0022,d1-.0022,.052,1 if green else 0,.96+.023*math.sin(j*37+i*4))
                if j%2==0:
                    for i in range(6):
                        x=left+i*(right-left)/6;xx=x+(right-left)/6
                        cap.top(x+.009,d0+.009,xx-.009,min(b,d0+2*(b-a)/rows)-.009,2.963,3,.93,True)
        for j in range(round((b-a)/2.87)):
            d=a+(j+.53)*((b-a)/round((b-a)/2.87))
            cap.top(-.26,d-.52,.11,d+.52,2.925,15,.98,True)
            if low:floor.top(-.71,d+.39,-.11,d+.95,.052,1,.83)

def screen(panel,grid,x,face,low):
    a,b=-2.70,2.70;z0,z1=.12,2.65
    side(panel,x,a,b,z0,z1,2,face,.85)
    if not low:
        for j in range(44):
            lo=z0+j*(z1-z0)/44;hi=z0+(j+1)*(z1-z0)/44
            for y0,y1,q0,q1,shade in [(lo,lo+.015,.005,.017,.93),(lo+.015,hi-.011,.017,.016,.97),(hi-.011,hi,.016,.001,.74)]:
                panel.face([(x+face*q0,a,y0),(x+face*q0,b,y0),(x+face*q1,b,y1),(x+face*q1,a,y1)],2,(face,0,(q0-q1)*face),shade)
    grid.box(x,a-.02,.08,.075,.094,2.66,4,.83);grid.box(x,b+.02,.08,.075,.094,2.66,4,.83)
    if low:return
    # The mesh and ribbed shutter are independent layers. Clothing hangs from the horizontal rails.
    fx=x+.124*face
    for i in range(49):
        d=a+.085+i*(b-a-.17)/48
        side(grid,fx,d-.0041,d+.0041,.23,2.50,4,face,.86)
    for j in range(21):
        z=.23+j*(2.50-.23)/20
        side(grid,fx-.006*face,a+.08,b-.08,z-.0040,z+.0040,4,face,.87)
    for h in [1.233,2.228]:
        tube(grid,[(x+.19*face,a+.055,h),(x+.19*face,b-.055,h)],.015,4,.95,n=8)
        for d in [-2.45,-1.24,0,1.23,2.45]:tube(grid,[(x+.014*face,d,h-.028),(x+.19*face,d,h)],.011,4,n=6)

def stock_wall(parts,low):
    panel,grid,goods,hooks=parts
    screen(panel,grid,-1.81,1,low)
    colors=[14,9,8,13,12,10,14,11,13,8,9,10,6,12,8,14]
    ds=[-2.24,-1.59,-.96,-.33,.31,.97,1.61,2.24]
    for row,rail in enumerate([2.228,1.233]):
        for j,d in enumerate(ds):
            idx=8*row+j
            H=[.47,.51,.46,.55,.49,.50,.54,.46][(j+row*3)%8]
            W=[.183,.198,.175,.205,.191][(idx+row)%5]
            at=Display(-1.56,d,rail-.084-H,1,.045*math.sin(idx*3.7))
            sw=colors[idx];trim=[7,6,8,7,6,7,9][idx%7]
            if row==1 and j in [1,4,6]:
                shortAt=Display(-1.56,d,rail-.084-.32,1,.027*math.sin(j*5))
                shorts(goods,shortAt,.17,.30,sw,j,low)
                if not low:hanger(hooks,shortAt,.35,.14,4)
            else:
                if not low and (row,j) in [(0,0),(0,2),(0,5),(1,3),(1,7)]:
                    under=Display(-1.64,d+.074,rail-.10-H,1,.013)
                    tee(goods,under,H*.98,W*1.04,colors[(idx+5)%16],trim,idx+2,True)
                tee(goods,at,H,W,sw,trim,idx,low)
                if not low:hanger(hooks,at,H,W*.84,4 if j%4==0 else 7)
    for d in [-2.81,2.81]:panel.box(-3.38,d,.075,3.18,.085,2.69,3,.89)
    side(panel,-4.94,-2.83,2.83,.08,2.77,3,1,.80)
    if not low:
        panel.box(-3.36,-2.80,2.59,3.18,.094,.13,4,.76)
        panel.box(-3.36,2.80,2.59,3.18,.094,.13,4,.76)
    # Return panels at the ends keep the hooked grid in place without sealing the neighbouring public cross aisle.
    for d in [-2.67,2.67]:panel.box(-1.824,d,.075,.16,.075,2.63,2,.82)

def tables(cases,goods,hooks,low):
    side(cases,4.88,-2.82,2.83,.075,2.78,2,-1,.84)
    for d in [-2.83,2.83]:cases.box(3.44,d,.075,2.89,.085,2.69,3,.85)
    for center,length in [(-1.38,2.50),(1.53,2.18)]:
        x,w=1.87,1.14
        cases.box(x,center,.764,w,length,.074,5,.94)
        for xx in [x-w*.41,x+w*.41]:
            for d in [center-length*.43,center+length*.43]:cases.box(xx,d,.076,.048,.052,.695,4,.76)
        if not low:
            for xx in [x-w*.42,x+w*.42]:cases.box(xx,center,.62,.035,length*.86,.041,4,.79)
        for i in range(2):
            for j in range(4):
                xc=x-.258+i*.50;dc=center+(j-1.5)*(length-.31)/4
                n=3+(i*3+j+(center>0))%4
                if i==0 and j in [1,3]:
                    sw=([9,8] if center<0 else [11,14])[j//2]
                    if low:side(cases,x-w*.50-.025,dc-.20,dc+.20,.55,.85,sw,-1,.95)
                    else:draped(goods,x-w*.50,dc,.236,sw,j+center)
                    continue
                if low:
                    cases.box(xc,dc,.842,.38,.39,.022*n,[8,9,10,13,11,14][(j+2*i+int(center>0))%6],.95)
                    continue
                top=.841
                for k in range(n):
                    sw=[9,7,13,11,8,12,14,10,6][(i*3+j*2+k+int(center>0)*4)%9]
                    variant=i*13+j*6+k
                    folded(goods,xc+.010*math.sin(j*9+k),dc+.011*math.cos(k*13+i),top,.398-.005*(k%3),.415,sw,variant)
                    top+=.020+.004*(variant%3)
    # Above the folded stock, bright children's sets can be read against the shop's backing.
    for j,d in enumerate([-2.14,-1.30,-.46,.38,1.23,2.05]):
        H=.47+.025*(j%3)
        at=Display(4.49,d,2.20-.09-H,-1,-.045*math.cos(j*6))
        tee(goods,at,H,.193,[10,11,14,9,8,12][j],[7,6,9,7,8,7][j],j+19,low)
        if not low:hanger(hooks,at,H,.16,7)
        if j in [0,2,3,5]:
            small=Display(4.50,d,.91,-1)
            shorts(goods,small,.18,.295,[13,8,12,9][j%4],j+1,low)
    if not low:
        for h in [1.27,2.20]:
            tube(hooks,[(4.47,-2.52,h),(4.47,2.49,h)],.014,4,n=8)
            for d in [-2.32,0,2.3]:tube(hooks,[(4.86,d,h+.03),(4.47,d,h)],.010,4)
    else:side(cases,4.51,-2.55,2.55,2.17,2.22,4,-1,.91)

def sections(low=False):
    floor=Detail('01 · Worn charcoal tiles and isolated green insets')
    cap=Detail('02 · Lay-in acoustic ceiling and fluorescent lenses')
    shutter=Detail('03 · Corrugated shutter, guides and stall returns')
    mesh=Detail('04 · Double-height wire grid and chrome rails')
    jerseys=Detail('05 · Printed jerseys, open collars and elasticated shorts')
    hooks=Detail('06 · Open hanger hooks, plastic shoulders and clip bars')
    tableset=Detail('07 · Folding tables and the facing shop backing')
    fold=Detail('08 · Layered folded jersey stock and rear hanging sets')
    floors(floor,cap,low);corridor_run(floor,cap,low);stock_wall([shutter,mesh,jerseys,hooks],low);tables(tableset,fold,hooks,low)
    return [p for p in [floor,cap,shutter,mesh,jerseys,hooks,tableset,fold] if p.faces]
