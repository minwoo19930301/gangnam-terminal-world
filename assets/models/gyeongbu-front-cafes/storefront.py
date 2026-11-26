"""Two photographed public store fronts, in metres. The origin is the outer terrace at u87.5."""
import math
import bpy
from geometry import Part
from wordmarks import signage

WEST,EAST,JOIN=-11.6,10.74,4.16
HEIGHTS=[(0,0),(2.44,3.14),(3.58,4.44),(6.03,6.45),(7.26,7.67)]

def vertical(z):
    for (a,aa),(b,bb) in zip(HEIGHTS,HEIGHTS[1:]):
        if z<=b:return aa+(z-a)*(bb-aa)/(b-a)
    return z+.41

def pendant(body,lamps,x,d,h,r):
    body.box(x,d,h+.11,.017,.017,.46,7,.62)
    ring=[(math.cos(i*math.tau/14),math.sin(i*math.tau/14)) for i in range(14)]
    for i,(a,b) in enumerate(ring):
        c,e=ring[(i+1)%len(ring)]
        body.face([(x+a*r,d+b*r,h),(x+c*r,d+e*r,h),(x+c*r*.36,d+e*r*.36,h+.15),(x+a*r*.36,d+b*r*.36,h+.15)],3,(a+c,b+e,.30),.81)
    lamps.face([(x+a*r*.84,d+b*r*.84,h+.005) for a,b in ring],6,(0,0,-1),(.98,.89,.71))

def reveals(body,a,b,front,back,h0,h1,swatch,tint):
    for x,n in [(a,1),(b,-1)]:
        body.face([(x,front,h0),(x,back,h0),(x,back,h1),(x,front,h1)],swatch,(n,0,0),tint)

class DistantFrames(Part):
    def box(self,x,d,h,w,deep,high,swatch,tint=1.):
        if deep<.44 and (w<.17 or high<.14):
            self.front(x-w/2,h,x+w/2,h+high,d+deep/2,swatch,tint)
        else:super().box(x,d,h,w,deep,high,swatch,tint)

def arch_outline(cx,r,low=False):
    num=6 if low else 16
    return [(cx-r,3.57),(cx+r,3.57)]+[(cx+r*math.cos(a*math.pi/num),5.36+.61*math.sin(a*math.pi/num)) for a in range(num+1)]

def dolly(brick,frame,glass,interior,lamps,low):
    # A navy folded cornice runs over five arched openings, with a lower painted belt.
    brick.box((WEST+JOIN)/2,.135,6.03,JOIN-WEST,.45,1.12,0,.90)
    frame.box((WEST+JOIN)/2,.27,7.15,JOIN-WEST,.32,.105,7,1)
    brick.box((WEST+JOIN)/2,.09,2.61,JOIN-WEST,.45,.46,0,.95)
    frame.box((WEST+JOIN)/2,.27,3.02,JOIN-WEST,.34,.08,7,.92)
    count=5;span=(JOIN-WEST-.32)/count;r=span*.382
    for i in range(count):
        cx=WEST+.16+(i+.5)*span
        left,right=cx-span/2,cx+span/2
        brick.front(left,3.08,right,3.60,.104,1,.91+.008*i)
        brick.front(left,3.51,cx-r-.108,6.03,.104,1,.92)
        brick.front(cx+r+.108,3.51,right,6.03,.104,1,.94)
        num=6 if low else 16
        for j in range(num):
            p=j*math.pi/num;q=(j+1)*math.pi/num
            inner=lambda t:(cx+r*math.cos(t),5.36+.61*math.sin(t))
            outer=lambda t:(cx+(r+.118)*math.cos(t),5.36+.728*math.sin(t))
            op,oq=outer(p),outer(q);ip,iq=inner(p),inner(q)
            brick.face([(op[0],.104,op[1]),(oq[0],.104,oq[1]),(oq[0],.104,6.11),(op[0],.104,6.11)],1,(0,1,0),.94)
            def arcface(a,b,c,d,depth):return [(x,depth,z) for x,z in (a,b,c,d)]
            brick.face(arcface(ip,iq,oq,op,.126),1,(0,1,0),.86+(j*3+i)%7*.023)
            if not low:
                brick.face([(ip[0],.126,ip[1]),(iq[0],.126,iq[1]),(iq[0],-.11,iq[1]),(ip[0],-.11,ip[1])],3,(0,0,-1),.66)
        for x in [cx-r-.055,cx+r+.055]:brick.box(x,.046,3.55,.107,.16,1.82,1,.87)
        edge=arch_outline(cx,r,low)
        target=brick if low else glass
        target.face([(x,-.066,z) for x,z in edge],5,(0,1,0),(.61,.64,.62))
        # The actual reveal is deep enough to read the brick jamb and sill edge-on.
        frame.box(cx,.124,3.48,r*2+.30,.27,.105,3,.82)
        if low:continue
        for dx in [-r,-r*.333,r*.333,r]:frame.box(cx+dx,-.028,3.58,.045,.056,1.80,7,.72)
        frame.box(cx,-.014,5.36,r*2,.060,.055,7,.68)
        frame.box(cx,-.014,4.34,r*2,.060,.043,7,.77)
        # Street reflections are deliberately weak so silhouettes remain visible through the glazing.
        glass.face([(cx-r+.03,-.058,4.47),(cx+r-.03,-.058,4.13),(cx+r-.03,-.058,4.30),(cx-r+.03,-.058,4.65)],5,(0,1,0),(.73,.76,.82))
        interior.front(left,3.52,right,6.04,-2.11,3,(.96,.90,.84))
        interior.top(left,-2.14,right,.015,6.008,3,(.76,.70,.60),True)
        interior.front(left,6.01,right,6.76,-2.10,3,(.84,.78,.69))
        reveals(interior,left,right,-.045,-2.15,3.52,6.05,3,(.95,.85,.74))
        paneltones=[(.69,.63,.56),(.91,.78,.60),(.78,.69,.55),(.69,.59,.44),(.88,.73,.57)]
        interior.front(cx-r*.81,4.41,cx+r*.51,5.68,-2.04,6,paneltones[i])
        for j in range(4):
            interior.box(cx-r*.80+j*.39,-2.01,4.39,.025,.047,1.31,3,.73)
        interior.box(cx,-1.02,4.01,1.25,.64,.104,6,(.84,.72,.55))
        for dx in [-.60,.57]:
            interior.box(cx+dx,-1.40,3.58,.057,.068,.42,7,.69)
            interior.box(cx+dx,-1.06,3.85,.31,.10,.32,6,(.75,.63,.49))
        pendant(interior,lamps,cx+.18*(i%3-1),-1.03,5.34+.07*(i%3),.23 if i in [1,3] else .14)
    for x in [WEST+.08,JOIN-.08]:brick.box(x,.135,3.07,.155,.43,2.99,1,.86)
    # Recessed shop openings below the dining-room front, with masonry piers and their own glazing.
    bays=[(WEST+.10,WEST+3.55),(WEST+3.9,WEST+8.0),(WEST+8.33,WEST+11.56),(WEST+11.90,JOIN-.10)]
    for i,(a,b) in enumerate(bays):
        midpoint=(a+b)/2
        brick.box(a-.088,.022,0,.18,.46,2.63,1,.81)
        (brick if low else glass).front(a+.04,.11,b-.04,2.58,-.25,5,(.58,.62,.65))
        if low:continue
        for x in [a+.035,midpoint,b-.035]:frame.box(x,-.215,.12,.055,.068,2.46,7,.74)
        frame.box(midpoint,-.215,2.17,b-a,.065,.05,7,.68)
        interior.front(a,.06,b,2.63,-1.87,3,(.73,.70,.65))
        interior.top(a,-1.91,b,-.208,2.58,3,(.77,.74,.68),True)
        interior.front(a,2.56,b,3.10,-1.87,3,(.76,.72,.65))
        reveals(interior,a,b,-.19,-1.91,.055,2.63,3,(.89,.83,.78))
        if i in [1,2]:
            width=b-a
            interior.front(a+.12,.15,b-.12,2.40,-1.82,4,(.56,.53,.47) if i==1 else (.50,.48,.45))
            for j in range(3):
                ax=a+.23+j*(width-.46)/3
                interior.front(ax,.29,ax+(width-.53)/3,2.23,-1.78,5,(.65,.66,.62) if i==1 else (.55,.58,.60))
            for z in [.25,.98,2.17]:interior.box(midpoint,-1.74,z,width-.42,.064,.046,3,.90)
            if i==2:
                for j in range(4):
                    x=a+.32+.48*j
                    interior.box(x,-1.16,.64,.35,.43,.048,6,(.80,.75,.61))
                    interior.box(x,-1.16,.17,.04,.27,.47,7,.71)
        pendant(interior,lamps,midpoint+.27,-.98,2.23,.13)
        if i in [0,3]:
            for j in [0,1,2]:interior.box(midpoint,-1.41,.40+j*.39,b-a-.29,.28,.065,3,.89)
            for j in range(8):
                wid=.16+.07*((j+i)%3)
                x=a+.35+j*(b-a-.7)/7;z=.49+(.39 if j%2 else 0)
                sw=[6,4,7,6,3,4,6,3][j]
                interior.box(x,-1.38,z,wid,.16,.21+(j%3)*.058,sw,(.91,.86,.75))
                interior.front(x-wid*.45,z+.06,x+wid*.45,z+.10,-1.289,4,(.78,.74,.63))

def ediya(body,frame,glass,interior,lamps,low):
    width=EAST-JOIN;mid=(JOIN+EAST)/2
    # Brushed silvery shop crown, white lettering, and the photographed saturated blue spandrel.
    body.box(mid,.13,6.045,width,.46,1.13,4,(.61,.63,.67))
    frame.box(mid,.265,7.17,width+.07,.30,.11,7,1.0)
    frame.box(mid,.26,6.04,width+.03,.29,.067,7,.86)
    body.box(mid,.15,2.44,width,.43,1.03,2,.95)
    for i in range(4):
        a=JOIN+i*width/4;b=JOIN+(i+1)*width/4
        if not low:
            body.front(a+.016,2.51,b-.014,3.42,.382,2,(.80+.035*i,.91+.02*i,1))
        for x in [a]:frame.box(x,.199,2.44,.041,.38,1.04,7,.72)
    for x in [JOIN+.054,mid-width/6,mid+width/6,EAST-.054]:frame.box(x,.235,3.46,.07,.25,2.59,7,.72)
    for h in [3.47,5.93]:frame.box(mid,.226,h,width,.21,.064,7,.70)
    target=body if low else glass
    for i in range(3):
        a=JOIN+.07+i*(width-.14)/3;b=JOIN+.07+(i+1)*(width-.14)/3
        target.front(a,3.50,b,6.01,.149,5,(.64,.71,.77))
        if low:continue
        glass.face([(a+.01,.16,4.48),(b-.02,.16,4.83),(b-.02,.16,5.07),(a+.01,.16,4.69)],5,(0,1,0),(.66,.77,.86))
        interior.front(a,3.49,b,6.05,-1.86,3,(.99,.90,.79))
        interior.top(a,-1.91,b,.14,5.996,3,(.85,.81,.71),True)
        interior.front(a,5.99,b,6.69,-1.86,3,(.81,.76,.67))
        reveals(interior,a,b,.12,-1.89,3.48,6.04,3,(.92,.83,.73))
        interior.front(a+.08,4.20,b-.09,5.58,-1.80,6,(.75,.66,.50))
        interior.front(a+.21,4.37,b-.21,5.42,-1.77,3,(.79,.74,.67))
        for j in range(3):interior.box(a+.22+j*(b-a-.42)/2,-1.75,4.38,.030,.054,1.04,6,.76)
        x=(a+b)/2
        interior.box(x,-.92,4.055,.91,.57,.079,3,1.0)
        interior.box(x,-.92,3.52,.099,.085,.55,7,.73)
        for dx in [-.55,.54]:
            interior.box(x+dx,-.96,3.56,.30,.29,.047,6,.83)
            interior.box(x+dx,-1.07,3.59,.30,.055,.41,3,.87)
        if i<2:
            interior.box(x+.31,-1.0,5.57,.018,.018,.46,7,.64)
            lamps.box(x+.31,-1.0,5.52,.078,.072,.05,6,(1,.89,.71))
    # The current physical 3 m public entrance passes between x6..9. Do not skin the opening.
    for a,b in [(JOIN+.02,5.98),(9.03,EAST-.02)]:
        target.front(a,.10,b,2.40,.038,5,(.58,.72,.88))
        frame.box((a+b)/2,.064,.095,b-a,.11,.085,7,.82)
        frame.box((a+b)/2,.064,2.19,b-a,.11,.055,7,.77)
        frame.box(a+.024,.063,.10,.051,.11,2.34,7,.69)
        frame.box(b-.024,.063,.10,.051,.11,2.34,7,.69)
        if not low:
            interior.front(a,.10,b,2.42,-1.61,2,(.64,.72,.75))
            interior.box((a+b)/2,-.75,.75,b-a-.16,.45,.09,3,.89)
    frame.box(mid,.25,2.422,width,.29,.085,7,.81)
    for x in [JOIN+.047,EAST-.047]:frame.box(x,.16,0,.083,.32,6.06,7,.76)
    if not low:
        # Paired sliding door leaves are represented stacked against the fixed side lites.
        for x in [5.89,9.10]:
            frame.box(x,.108,.07,.030,.073,2.24,6,.84)
            frame.box(x,.094,1.01,.047,.089,.33,6,.93)

def roof(body,rail,low):
    top=15.56;bottom=7.26;left=-4.53;right=3.59
    # Silhouette seen above the cafe: screened steelwork, pale end cheek, and a covered link.
    body.box((left+right)/2,-3.02,top,right-left+.32,3.19,.20,7,.72)
    body.box(left-.24,-3.03,bottom,.52,3.25,top-bottom+.28,4,.85)
    for x in [left+.06,right-.055]:rail.box(x,-1.55,bottom,.135,.18,top-bottom,7,.58)
    for z in [bottom+2.43,bottom+5.14,top-.10]:rail.box((left+right)/2,-1.54,z,right-left,.15,.12,7,.57)
    bars=9 if low else 29
    for i in range(1,bars):
        x=left+(right-left)*i/bars
        rail.box(x,-1.53,bottom,.042 if not low else .065,.07,top-bottom,7,.60)
        if not low and i%2:rail.box(x+.115,-3.61,bottom,.050,.064,top-bottom,7,.61)
    # Only the alternating broad visible silhouettes sit behind the screen.
    pts=[(left+.13,7.45),(right-.82,9.88),(left+.96,12.42),(right-.49,14.95)]
    for i in range(3):
        a,b=pts[i:i+2];poly=[a,b,(b[0],b[1]-.37),(a[0],a[1]-.37)]
        rail.prism(poly,-3.35,-2.38,7,.56)
        rail.box(b[0],-2.91,b[1]-.36,1.10,1.03,.36,7,.53)
        if not low:
            for j in range(13):
                t=(j+.5)/13;x=a[0]+(b[0]-a[0])*t;z=a[1]+(b[1]-a[1])*t
                rail.box(x,-2.96,z+.015,abs(b[0]-a[0])/13+.11,1.06,.065,7,.73)
                if j%2==0:rail.box(x,-2.43,z+.06,.033,.048,.63,7,.69)
            rail.prism([(a[0],a[1]+.64),(b[0],b[1]+.64),(b[0],b[1]+.70),(a[0],a[1]+.70)],-2.48,-2.41,7,.71)
    start,end=right,23.25;mid=(start+end)/2;length=end-start
    rail.box(mid,-3.67,13.60,length,2.44,.27,7,.60)
    body.box(mid,-3.66,15.08,length+.20,2.57,.16,3,.81)
    for x in [start+.13+j*(length-.28)/6 for j in range(7)]:
        rail.box(x,-2.49,13.86,.072,.09,1.23,7,.58)
    for z in [14.12,14.42,14.71]:rail.box(mid,-2.49,z,length,.07,.043,7,.72)
    if not low:
        for j in range(12):
            x=start+length*(j+.50)/12
            body.top(x-length/25,-4.90,x+length/25,-2.39,15.045,6,(.68,.60,.50),True)
        for x in [start+4.13,end-2.65]:rail.box(x,-3.92,7.27,.135,.15,6.33,7,.65)
    body.top(WEST,-4.92,EAST,.18,7.24,7,.86)

def facade(low=False):
    brick=Part('01 · Dining room masonry and folded cornices')
    ed=Part('02 · EDIYA crown and blue spandrels')
    rail=(DistantFrames if low else Part)('03 · Frames and screened structure','Metal')
    glass=Part('04 · Bronze and blue shop glazing','Glass')
    interior=Part('05 · Recessed window interiors')
    lamps=Part('06 · Interior pendant lenses','Lamps')
    cap=Part('07 · Screened silhouette and covered link roof')
    dolly(brick,rail,glass,interior,lamps,low)
    ediya(ed,rail,glass,interior,lamps,low)
    roof(cap,rail,low)
    parts=[p for p in [brick,ed,rail,glass,interior,lamps,cap,*signage(low)] if p.faces]
    # Register the display sill above the existing 4.2 m upper shop floor,
    # whilst the front cornice remains below the recessed 8.4 m car deck.
    for part in parts:
        for v in part.verts:v.z=vertical(v.z)
    if not low:
        for obj in bpy.context.scene.objects:
            if obj.type not in {'FONT','CURVE'}:continue
            z=obj.location.z
            obj.scale.y*=(vertical(z+.005)-vertical(z))/.005
            obj.location.z=vertical(z)
    return parts
