"""Mino paper and bent cedar shade for the Spacecraft pendant, in metres."""
from math import cos, sin, pi
import numpy as np
from mathutils import Vector


def paper_field():
    """A repeatable pulp field with faint, short fibres and the ribs' penumbra."""
    n=512
    rng=np.random.RandomState(61126)
    y,x=np.mgrid[:n,:n]
    # Several lengths of randomly oriented fibres, without copying a photograph.
    freq=np.fft.fftfreq(n)
    fx,fy=np.meshgrid(freq,freq)
    def pulp(sx,sy):
        kernel=np.exp(-2*pi*pi*((sx*fx)**2+(sy*fy)**2))
        layer=np.fft.ifft2(np.fft.fft2(rng.normal(size=(n,n)))*kernel).real
        return layer/np.std(layer)
    surface=1.7*pulp(8,6)+1.3*pulp(2.8,1.2)+.8*pulp(.7,.65)
    for _ in range(2950):
        cx,cy=rng.uniform(0,n,2)
        length=rng.uniform(2,11)
        angle=rng.uniform(-pi,pi)
        k=np.arange(0,length,.65)
        curve=.06*k*np.sin(k/length*pi)
        xx=(cx+k*cos(angle)-curve*sin(angle)).astype(int)%n
        yy=(cy+k*sin(angle)+curve*cos(angle)).astype(int)%n
        surface[yy,xx]+=rng.uniform(-4,2)
    u=(x+.5)/n
    v=(y+.5)/n
    rib=np.minimum((u*2)%1,1-(u*2)%1)
    # Behind each slat paper receives less direct light. The bottom return
    # at the open rim is slightly darker than the belly of the shade.
    seam=np.exp(-(rib/.037)**2)
    lift=4.6*np.cos((v-.58)*pi)-4.8*seam
    rgb=np.array([239.,220.,184.])+surface[:,:,None]+lift[:,:,None]*[.75,1,1.35]
    return np.clip(rgb,0,255)


def bend_profile(points):
    # Interpolate the measured sections by arc length. A monotone tangent
    # avoids bulges beyond the widest ring and keeps the cedar bend smooth.
    points=np.asarray(points,dtype=float)
    spans=np.linalg.norm(np.diff(points,axis=0),axis=1)
    slopes=np.diff(points,axis=0)/spans[:,None]
    tangent=np.zeros_like(points)
    tangent[0]=slopes[0];tangent[-1]=slopes[-1]
    for j in range(1,len(points)-1):
        for axis in range(2):
            a=slopes[j-1,axis];b=slopes[j,axis]
            if a*b>0:tangent[j,axis]=2*a*b/(a+b)
    result=[]
    for j,L in enumerate(spans):
        result.extend([points[j],.5*(points[j]+points[j+1])+.125*L*(tangent[j]-tangent[j+1])])
    return result+[points[-1]]


def shade(profile,z0,paper,cedar,skin):
    profile=bend_profile(profile)
    ribs=16
    divisions=5
    sides=ribs*divisions
    def angle(i,r,h):
        waist=(1-r/.44)
        return 2*pi*i/ribs+.027*cos(pi*i)*waist
    rings=[]
    arc=[0.]
    for j,(r,h) in enumerate(profile):
        if j:
            pr,ph=profile[j-1]
            arc.append(arc[-1]+((r-pr)**2+(h-ph)**2)**.5)
        row=[]
        for i in range(sides):
            rib=i//divisions;f=i%divisions/divisions
            a0=angle(rib,r,h);a1=angle(rib+1,r,h)
            a=a0+(a1-a0)*f
            # Hand-pasted paper spans the frame rather than following a rigid drum.
            radius=r*(1-.017*sin(pi*f)**2)
            row.append((radius*cos(a),radius*sin(a),z0+h))
        rings.append(row)
    ob=skin('Spacecraft · 손으로 붙인 미노 화지',rings,paper,cap=False)
    layer=ob.data.uv_layers.new(name='화지 결 · 두 칸 반복')
    for poly in ob.data.polygons:
        j,i=divmod(poly.index,sides)
        uv=[(i/(2*divisions),arc[j]/arc[-1]),((i+1)/(2*divisions),arc[j]/arc[-1]),
            ((i+1)/(2*divisions),arc[j+1]/arc[-1]),(i/(2*divisions),arc[j+1]/arc[-1])]
        for loop,coord in zip(poly.loop_indices,uv):
            layer.data[loop].uv=coord
    for i in range(ribs):
        points=[]
        section=[(-.0045,-.0010),(-.0047,.0003),(-.0038,.0014),(.0038,.0014),
                 (.0047,.0003),(.0045,-.0010),(.0035,-.0015),(-.0035,-.0015)]
        for j,(r,h)in enumerate(profile):
            a=angle(i,r,h)
            prev=profile[max(0,j-1)];nxt=profile[min(len(profile)-1,j+1)]
            dr=nxt[0]-prev[0];dh=nxt[1]-prev[1]
            normal=Vector((dh*cos(a),dh*sin(a),-dr)).normalized()
            tangent=Vector((-sin(a),cos(a),0))
            mid=Vector((r*cos(a),r*sin(a),z0+h))+normal*.0018
            points.append([tuple(mid+width*tangent+depth*normal)for width,depth in section])
        skin('Spacecraft · 납작하게 휜 아키타 삼나무',points,cedar)
    for h,r in [(0.,.12),(.449,.143)]:
        # Raised outer edge and an inner return show the open end's thickness.
        section=[(r-.009,0),(r+.002,0),(r+.003,.0013),(r+.003,.006),
                 (r+.001,.008),(r-.008,.008),(r-.010,.006),(r-.010,.0015),(r-.009,0)]
        ring=[[(rr*cos(2*pi*j/64),rr*sin(2*pi*j/64),z0+h+hh)for j in range(64)]for rr,hh in section]
        skin('Spacecraft · 안쪽 턱이 있는 마감 고리',ring,cedar,cap=False)
