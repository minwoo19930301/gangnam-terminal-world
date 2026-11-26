"""Bent woody stems with continuous bark, sawn end grain and tapered branch sockets."""
import math
from mathutils import Vector

TAU=math.tau


def bark(part,path,radii,seed,sw=0,tone=.91,steps=12,ends=True):
    points=[Vector(v) for v in path];rings=[];axis=None
    for j,(pt,radius) in enumerate(zip(points,radii)):
        along=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized()
        if axis is None:axis=Vector((0,1,0)) if abs(along.y)<.9 else Vector((1,0,0))
        axis=(axis-along*axis.dot(along)).normalized();side=along.cross(axis).normalized();ring=[]
        for k in range(steps):
            a=k*TAU/steps;s=math.sin(a);c=math.cos(a)
            warp=1+.105*math.sin(3*a+seed+j*.13)+.055*math.sin(5*a+seed*.83+j*.24)+.034*math.cos(8*a+j*.15)
            tangent=-.315*math.cos(3*a+seed+j*.13)-.275*math.cos(5*a+seed*.83+j*.24)+.272*math.sin(8*a+j*.15)
            radial=axis*c+side*s;norm=(radial+(axis*-s+side*c)*tangent*.63).normalized()
            ring.append((pt+radial*radius*warp,norm))
        rings.append(ring)
    for j in range(len(rings)-1):
        for i in range(steps):
            k=(i+1)%steps;coords=[rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]]
            uv=[(i/steps,j/(len(rings)-1)),((i+1)/steps,j/(len(rings)-1)),((i+1)/steps,(j+1)/(len(rings)-1)),(i/steps,(j+1)/(len(rings)-1))]
            part.curved([p for p,n in coords],sw,[n for p,n in coords],tone,uv)
    if not ends:return
    for j,normal in [(0,(points[0]-points[1]).normalized()),(-1,(points[-1]-points[-2]).normalized())]:
        ring=[p for p,n in rings[j]];uv=[(.5+.47*math.cos(i*TAU/steps),.5+.47*math.sin(i*TAU/steps)) for i in range(steps)]
        part.face(ring,2,normal,tuple(min(1,c*.96+.05) for c in tone) if isinstance(tone,tuple) else min(1,tone+.04),uv)


def hanging_arch(wood,low):
    # Three intertwining lengths of naturally tapered wood meet above the entrance.
    for lane in range(3):
        pts=[];r=[];count=13 if low else 33
        for i in range(count):
            a=i*math.pi/(count-1);phase=lane*TAU/3+a*4.2
            x=.97*math.cos(a)+.045*math.sin(phase)+.055*math.sin(3*a)
            z=.068+2.39*math.sin(a)**.74+.035*math.sin(phase+.9)*math.sin(a)
            d=1.10+.092*math.cos(a)+.042*math.cos(phase)+.10*math.sin(a*2.4)
            pts.append((x,d,z));r.append((.024+.009*abs(math.cos(a)))*(.87+.17*math.cos(2*a+lane)))
        bark(wood,pts,r,lane+2,0,(.80,.76,.68) if lane==1 else (.79,.78,.75),6 if low else 12)
    if low:return
    for i,(x,d,z,lean,up) in enumerate([(-.94,1.05,.36,-.25,.83),(-.88,1.02,.87,-.28,.49),(-.69,1.10,1.74,-.21,.24),(.92,1.07,.44,.27,.68),(.89,1.06,1.07,.22,.39),(.67,1.19,1.80,.29,.22),(-.26,1.21,2.32,.29,.18)]):
        bark(wood,[(x,d,z),(x+lean*.25,d+.03,z+up*.18),(x+lean*.69,d-.016,z+up*.56),(x+lean,d+.022,z+up)], [.039,.031,.019,.008],i,0,(.83,.79,.73),9)
