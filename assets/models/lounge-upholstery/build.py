"""The Lounge's cream corner seating, shaped back cushions, piping and loose pillows."""
import math
from pathlib import Path
import runpy
import subprocess
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
g=bpy.data.collections.new('더 라운지 · 크림색 코너 소파')
scene.collection.children.link(g)
g['export_model']='corner-sofa'
g['preview_origin']=(0,0,0)


def mat(name,hexcode):
    m=bpy.data.materials.new(name)
    v=[int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
    m.diffuse_color=(*[(c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4) for c in v],1)
    return m


cream=mat('오트밀 · 직물 좌판','D7C7AD')
back=mat('아이보리 · 등받이','E0D2BC')
edge=mat('봉제 파이핑','B7A68F')
shade=mat('하부 감싸개','BAAA94')
oak=mat('다크 오크 받침','52443C')
silk=[mat(n,c) for n,c in [('코냑','A46043'),('브릭','99553E'),('와인','784842'),('샴페인','C2AC93')]]
trim=[mat('쿠션 테 '+str(i),c) for i,c in enumerate(['794B38','794936','583B38','978575'])]


def object_(name,vs,fs,m,smooth=False):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update()
    ob=bpy.data.objects.new(name,data);g.objects.link(ob)
    data.materials.append(m)
    if smooth:
        for f in data.polygons:f.use_smooth=True
    return ob


# Design coordinates are metres from the inside corner. The native origin is
# near the middle of the whole arrangement so distance checks cover both ends.
def coord(x,v,z):
    return Vector((x-2.70,3.0-v,z))


def section(lateral,depth,z,along,c):
    if along=='east': return coord(c+ lateral,depth,z)
    return coord(depth,c+lateral,z)


def tube(name,points,r,m,sides=5):
    vs=[];fs=[]
    for i,p in enumerate(points):
        d=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        n=d.cross(Vector((0,0,1)) if abs(d.z)<.9 else Vector((0,1,0))).normalized()
        b=d.cross(n)
        for k in range(sides):
            t=math.tau*k/sides;vs.append(p+r*(n*math.cos(t)+b*math.sin(t)))
        if i:
            base=i*sides
            fs.extend((base-sides+k,base-sides+(k+1)%sides,base+(k+1)%sides,base+k) for k in range(sides))
    return object_(name,vs,fs,m,True)


def softbox(name,along,c,depth,z,w,d,h,rad,m):
    # Rounded rectangular rings give the seating platform a continuous welt.
    vs=[];fs=[];steps=5
    def ring(width,deep,r,zz):
        arr=[]
        for x,y,a in [(width/2-r,deep/2-r,0),(-width/2+r,deep/2-r,90),
                      (-width/2+r,-deep/2+r,180),(width/2-r,-deep/2+r,270)]:
            for k in range(steps):
                f=math.radians(a+90*k/(steps-1));arr.append(section(x+math.cos(f)*r,depth+y+math.sin(f)*r,zz,along,c))
        return arr
    layers=[(.95,.94,.62,0),(1,1,1,.17),(1,1,1,.74),(.987,.979,.91,.93),(.955,.946,.69,1)]
    for sx,sy,sr,hf in layers:
        vs+=ring(w*sx,d*sy,min(rad*sr,d*sy/2-.001,w*sx/2-.001),z+h*hf)
    n=4*steps
    for j in range(len(layers)-1):
        fs.extend((j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for k in range(n))
    fs.extend([tuple(reversed(range(n))),tuple(range(len(vs)-n,len(vs)))])
    ob=object_(name,vs,fs,m,True)
    if h>.12 and m in [cream,back]:
        hem=ring(w*.994,d*.99,min(rad,.1),z+h*.83)
        tube('좌판 둘레 파이핑',hem+hem[:1],.0044,edge)
    return ob


def pillow(name,along,c,depth,z,w,h,d,m,hem,lean,roll,shape=0):
    # Two broad sewn faces, inflated between pinched tips. The relaxed upper
    # corners and small diagonal creases distinguish loose cushions from blocks.
    n=9
    def point(s,t,side):
        x=s*w*.5*(1-.057*abs(t)**6)
        zz=t*h*.5*(1-.044*abs(s)**6)
        puff=(max(0,1-abs(s)**3)*max(0,1-abs(t)**3))**.44
        local_edge=min(1-abs(s),1-abs(t))
        wrinkle=.009*math.sin(20*t+3*s+shape)*math.exp(-max(0,local_edge)*9)*math.sin(math.pi*(t+1)*.5)
        dd=side*(d*.5*(.08+.92*puff)+wrinkle)
        rx=x*math.cos(roll)-zz*math.sin(roll)
        rz=x*math.sin(roll)+zz*math.cos(roll)
        return section(rx,depth+dd*math.cos(lean)-rz*math.sin(lean),z+dd*math.sin(lean)+rz*math.cos(lean),along,c)
    vs=[];fs=[]
    for side in [1,-1]:
        for j in range(n+1):
            for i in range(n+1):vs.append(point(i*2/n-1,j*2/n-1,side))
        start=0 if side==1 else (n+1)**2
        for j in range(n):
            for i in range(n):
                k=start+j*(n+1)+i;f=(k,k+1,k+n+2,k+n+1)
                fs.append(f if side==1 else tuple(reversed(f)))
    border=[(i,0) for i in range(n)]+[(n,j) for j in range(n)]+[(i,n) for i in range(n,0,-1)]+[(0,j) for j in range(n,0,-1)]
    flat=[j*(n+1)+i for i,j in border]
    off=(n+1)**2
    for i,k in enumerate(flat):
        k1=flat[(i+1)%len(flat)];fs.append((k,k1,k1+off,k+off))
    object_(name,vs,fs,m,True)
    piping=[(point(i*2/n-1,j*2/n-1,1)+point(i*2/n-1,j*2/n-1,-1))*.5 for i,j in border]
    tube('쿠션 봉제선',piping+piping[:1],.004,hem)


# The arms meet only at the elbow. The long seat faces east, the shorter seat faces south.
for along,start,end in [('south',-.15,7.02),('east',.45,5.90)]:
    span=end-start;c=(start+end)/2
    softbox('낮은 목재 받침',along,c,0,.035,span-.10,.76,.083,.048,oak)
    softbox('직물로 감싼 좌대',along,c,0,.101,span,.91,.174,.073,shade)
    softbox('세로 등받이의 둥근 윗면',along,c,-.351,.247,span,.22,.482,.065,cream)
    seats=6 if along=='south' else 5
    pitch=span/seats
    for i in range(seats):
        xc=start+(i+.5)*pitch
        softbox('분리 좌방석',along,xc,.050,.263,pitch-.012,.745,.179,.072,cream)
        pillow('크림색 등쿠션',along,xc,-.235,.626,pitch-.04,.517,.174,back,edge,
               .165+.016*math.sin(i),.012*math.cos(2.3*i),i)
    # Throw pillows sit on the inside of the seat instead of intersecting the back.
    extras=[(.12,2,.12),(.32,0,-.12),(.59,3,.06),(.77,1,-.14),(.91,0,.13)] if along=='south' else [(.18,2,-.13),(.46,0,.15),(.74,3,-.1),(.92,1,.10)]
    for i,(ratio,index,roll) in enumerate(extras):
        pillow('테라코타 장식 쿠션',along,start+span*ratio,-.068,.675,.47,.469,.167,silk[index],trim[index],
               .29+.02*math.cos(i),roll,i+3)
    # Terminal arm with piped, upholstered cap.
    softbox('끝 팔걸이',along,end-.068,.006,.218,.165,.91,.405,.057,cream)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=9.0
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'sofa.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'corner-sofa.glb')],check=True)
