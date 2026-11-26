"""Three upright rolls of dress leather in the maker's copper-brown gift box."""

from math import cos, pi, sin
from mathutils import Matrix, Vector
from boots import section, tag, thread


def rolled(x,y,z,tone,bright,end_angle,work):
    """A 30 mm strip with a tan lining and burnished edges on a genuine spiral."""
    n=162
    turns=2.83
    start=end_angle+2*pi*turns
    length=2*pi*turns*.049
    centers=[.040+i*.024/length for i in range(5)]
    radius_hole=.00175
    ts=sorted(set([i/n for i in range(n+1)]+
                  [c+radius_hole/length*cos(j*pi/8) for c in centers for j in range(9)]))
    rows=[];outer_lines=[[],[]];hole_rows=[]
    for t in ts:
        a=start-2*pi*turns*t
        radius=.0430+.0040*turns*t+.009*max(0,(t-.91)/.09)**2
        rx=radius*(1+.018*sin(a+.4));rz=radius*(1-.034*cos(a))
        center=Vector((x+rx*cos(a),y+.0028*sin(a*.8)*t,z+rz*sin(a)))
        normal=Vector((cos(a),0,sin(a))).normalized()
        twist=min(1,max(0,(t-.905)/.095))
        twist=(twist*twist*(3-2*twist))*.96
        width_axis=Vector((0,cos(twist),0))+normal*sin(twist)
        surface_normal=normal*cos(twist)-Vector((0,sin(twist),0))
        outer=center+surface_normal*.0017;inner=center-surface_normal*.0017
        width=.0017+.0133*min(1,(t/.038)**.49)
        dist=min(abs(t-c)*length for c in centers)
        gap=(max(0,radius_hole**2-dist**2))**.5
        widths=[-width,-gap,gap,width]
        rows.append([outer+width_axis*v for v in widths]+
                    [inner+width_axis*v for v in widths])
        hole_rows.append(gap)
        for j,dy in enumerate([-.0123,.0123]):
            outer_lines[j].append(outer+width_axis*dy)
    for name,side,swatch,col in [
        ("Polished calf grain facing",(0,1),"leather",tone),("Polished calf grain facing",(2,3),"leather",tone),
        ("Dark burnished upper edge",(3,7),"edge","423127"),
        ("Natural lining inside the spiral",(7,6),"lining","A38061"),("Natural lining inside the spiral",(5,4),"lining","A38061"),
        ("Dark burnished lower edge",(4,0),"edge","3C2D25")]:
        section(name,[[row[j] for j in side] for row in rows],swatch,col,work,lambda u,v:(v,u))
    for aa,bb in [(1,5),(6,2)]:
        section("Burnished inside five punched adjustment holes",[[r[aa],r[bb]] for r in rows],"edge","44362D",work,
                skip=lambda j,i:hole_rows[j]+hole_rows[j+1]<.000001)
    for line in outer_lines:
        thread(line[int(len(line)*.72):],"71523B" if bright else "494039","Fine saddle stitching along the exposed belt",work,.00029,.0036)
    tip=rows[-1]
    tag(work["part"]("Finished belt end",[tip[i] for i in (0,3,7,4)],[(0,1,2,3)],tone),"edge")
    # The frame follows the tangent to the outer turn. The keeper sits behind
    # the hinge bar, with a movable prong passing through the opening.
    a=end_angle
    normal=Vector((cos(a),0,sin(a))).normalized()
    tangent=Vector((sin(a),0,-cos(a))).normalized()
    width=Vector((0,cos(.96),0))+normal*sin(.96)
    normal=normal*cos(.96)-Vector((0,sin(.96),0))
    origin=(tip[0]+tip[3])*.5+normal*.0012
    def point(u,v,h=0):
        return origin+tangent*u+width*v+normal*h
    profile=[(0,-.0168),(.020,-.0174),(.031,-.0163),(.035,-.0135),(.036,-.0095),
             (.036,.0095),(.035,.0134),(.031,.0164),(.020,.0175),(0,.0167)]
    metal="D1BE91" if bright else "D7D8D3"
    tag(work["tube"]("Rounded tongue buckle frame",[point(u,v,.002+.0013*sin(pi*u/.036)) for u,v in profile],.00165,metal,8),"metal")
    tag(work["tube"]("Buckle hinge roller",[point(0,-.0167,.002),point(0,.0167,.002)],.0019,metal,10),"metal")
    tag(work["tube"]("Hinged buckle tongue",[point(-.001,0,.001),point(.0028,0,.0041),
                  point(.018,0,.0062),point(.032,0,.0049),point(.0378,0,.0015)],.00105,metal,8),"metal")
    ring=[]
    for u in [-.0145,-.009]:
        edges=[(-.0158,-.001),(-.0162,.0038),(-.0138,.0065),(.0138,.0065),(.0162,.0038),(.0158,-.001)]
        ring.append([point(u,v,h) for v,h in edges])
    section("Stitched calfskin keeper",ring,"leather",tone,work)


def corner_box(name,cx,cy,z,w,d,h,tone,work):
    make=work["slab"]
    tag(make(name+" · base",cx,cy,z,w,d,.0031,.003,tone),"box")
    tag(make(name+" · cream inset",cx,cy,z+.0030,w-.004,d-.004,.0018,.002,"BAA48B"),"lining")
    for yy in [cy-d/2+.0016,cy+d/2-.0016]:
        tag(make(name+" · long folded wall",cx,yy,z+.003,w,.0032,h,.0012,tone),"box")
    for xx in [cx-w/2+.0016,cx+w/2-.0016]:
        tag(make(name+" · short folded wall",xx,cy,z+.003,.0032,d-.004,h,.0012,tone),"box")


def gift(work):
    make=work["slab"]
    # A compact dark lacquered tray keeps the case entirely on an existing
    # shelf in play. The branch's detached belt-box lid leans alongside it.
    tag(make("Black lacquered shell tray",0,0,0,.41,.203,.008,.061,"352F2C",.002),"lacquer")
    corner_box("Copper brown Berwick belt case",.039,.015,.008,.18,.166,.033,"9F6246",work)
    for i,(tone,gold) in enumerate([("49362E",True),("29282A",False),("5D402F",False)]):
        rolled(.040+(i-1)*.0029,.015+(i-1)*.043,.073+(i-1)*.0008,tone,gold,.78+.19*i,work)
    tip=Matrix.Translation((-.122,-.012,.068))@Matrix.Rotation(.89,4,"X")@Matrix.Rotation(-.13,4,"Z")
    origin=work["basis"]()
    def around(obj):
        obj.matrix_world=origin@tip@origin.inverted()@obj.matrix_world
        return obj
    lid=make("Embossed lid on the angled copper gift box",0,0,.001,.143,.138,.012,.003,"B47C59",.0014)
    around(tag(lid,"box"))
    # Moulded paper return and the recessed shadow around the inner lid.
    for yy in [-.066,.066]:
        around(tag(make("Gift lid folded return",0,yy,-.004,.137,.003,.006,.001,"905C40"),"box"))
    for xx in [-.069,.069]:
        around(tag(make("Gift lid folded return",xx,0,-.004,.0025,.129,.006,.0009,"905C40"),"box"))
    for words,cy,size in [("Berwick",-.004,.024),("1707",-.025,.0082)]:
        obj=work["lettering"](words,0,0,0,size,"F2D79E")
        obj.matrix_world=origin@tip@Matrix.Translation((0,cy,.0140))
        tag(obj,"foil")
