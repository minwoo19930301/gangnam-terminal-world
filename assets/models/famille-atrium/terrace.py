"""Make the powder-coated terrace set using real bent-tube centre lines."""
from math import cos, sin, tau, pi
from mathutils import Vector


def build_terrace(group, colour, object_for, box):
    red=colour('분체도장 · 고추 빨강', 'BC3D38', .22)
    bright=colour('테와 모서리 · 주홍', 'D14A40', .20)
    dark=colour('프레임 이음', '86342F', .20)
    rubber=colour('다리 끝 캡', '484441')

    def tube(name,points,r,mat,sides=8):
        path=[Vector(p) for p in points]
        verts=[]
        for i,p in enumerate(path):
            axis=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
            # Frame points stay continuous around the curved planar chair runners.
            guide=Vector((1,0,0)) if abs(axis.x)<.84 else Vector((0,1,0))
            side=axis.cross(guide).normalized()
            up=axis.cross(side)
            verts.extend(p+r*(cos(tau*k/sides)*side+sin(tau*k/sides)*up) for k in range(sides))
        faces=[tuple(reversed(range(sides))),tuple(range(len(verts)-sides,len(verts)))]
        faces.extend((i*sides+k,i*sides+(k+1)%sides,(i+1)*sides+(k+1)%sides,(i+1)*sides+k)
                     for i in range(len(path)-1) for k in range(sides))
        return object_for(group,name,verts,faces,mat,True)

    def ringrect(w,d,r):
        points=[]
        for cx,cy,a0 in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,pi/2),
                          (-w/2+r,-d/2+r,pi),(w/2-r,-d/2+r,3*pi/2)]:
            for i in range(5):
                a=a0+i*pi/8
                points.append((cx+r*cos(a),cy+r*sin(a)))
        return points

    # Rolled underside and radiused corners on the square bistro top.
    rim=ringrect(.72,.72,.036)
    n=len(rim)
    v=[(x,y,z) for z in [.719,.742] for x,y in rim]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    object_for(group,'접은 철판 상판',v,faces,red)
    for x in [-.27,.27]:
        for y in [-.27,.27]:
            tube('상다리',[(x*1.08,y*1.08,.014),(x,y,.695),(x*.9,y*.9,.719)],.016,red)
            tube('바닥 마감',[(x*1.08,y*1.08,.003),(x*1.08,y*1.08,.022)],.018,rubber)
    for y in [-.24,.24]:
        tube('상판 아래 버팀대',[(-.27,y,.675),(0,y,.701),(.27,y,.675)],.012,dark)

    # The same chair is flipped on the far side of the table.
    for face in (-1,1):
        def p(x,y,z):return (x*face,(y+.64)*face,z)
        for side in [-1,1]:
            tube('좌판 옆 연속 프레임',[p(side*.226,-.21,.014),p(side*.206,-.19,.372),
                 p(side*.207,-.175,.416),p(side*.207,-.151,.428),p(side*.207,.15,.428),
                 p(side*.208,.184,.417),p(side*.222,.207,.363),p(side*.249,.238,.014)],.013,red)
            for xx,yy in [(side*.226,-.21),(side*.249,.238)]:
                tube('미끄럼방지 발',[p(xx,yy,.003),p(xx,yy,.022)],.014,rubber)
            tube('등받이 기둥',[p(side*.202,.149,.387),p(side*.205,.199,.585),p(side*.202,.25,.783)],.013,red)
        for i in range(6):
            y=-.149+i*.056
            # A shallow dish across each pressed steel seat slat.
            tube('가로 좌판 살',[p(-.196,y,.437),p(-.14,y,.428),p(0,y,.42),p(.14,y,.428),p(.196,y,.437)],.022,bright,10)
        for h in [.641,.723,.782]:
            tube('둥근 등받이 살',[p(-.21,.21,h-.02),p(-.16,.24,h),
                 p(0,.268,h+.012),p(.16,.24,h),p(.21,.21,h-.02)],.020,red,10)
        for x in [-.14,.14]:
            tube('좌판 밑 지지대',[p(x,-.19,.404),p(x,.18,.404)],.011,dark)
