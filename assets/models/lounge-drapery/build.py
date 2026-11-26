"""Original pleated drapes, curved brass rail, and weighted hems in metres."""
import math
import runpy
import subprocess
from pathlib import Path
import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system='METRIC'
group = bpy.data.collections.new('더 라운지 · 묶은 주름 커튼')
scene.collection.children.link(group)
group['export_model']='gathered'
group['preview_origin']=(0,0,0)


def material(name,rgb):
    mat=bpy.data.materials.new(name)
    c=[int(rgb[i:i+2],16)/255 for i in (0,2,4)]
    mat.diffuse_color=(*[(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4) for v in c],1)
    return mat


cloth=[material('웜그레이 주름 원단 '+str(i+1),c) for i,c in enumerate(
    ['89797D','99898C','AA999D','B6A7A9','C1B1B1','C9BABC','CDBFBF'])]
thread=material('안쪽 바느질','AC989A')
cord=material('회갈색 태슬 끈','97807A')
brass=material('청동 레일과 워머','8D7560')
metal=material('레일 안쪽','483E3A')


def mesh(name,points,faces,mats,idx=None,smooth=False):
    data=bpy.data.meshes.new(name);data.from_pydata(points,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);group.objects.link(ob)
    for mat in mats:data.materials.append(mat)
    for i,face in enumerate(data.polygons):
        if idx:face.material_index=idx[i]
        face.use_smooth=smooth
    return ob


def tube(name,points,r,mat,sides=8):
    verts, faces=[],[]
    for i,point in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        a=tangent.cross(Vector((0,0,1)) if abs(tangent.z)<.88 else Vector((0,1,0))).normalized()
        b=tangent.cross(a)
        for j in range(sides):
            angle=math.tau*j/sides
            verts.append(Vector(point)+(a*math.cos(angle)+b*math.sin(angle))*r)
        if i:
            n=i*sides
            faces.extend((n-sides+j,n-sides+(j+1)%sides,n+(j+1)%sides,n+j) for j in range(sides))
    return mesh(name,verts,faces,[mat],smooth=True)


def smoothstep(t):
    return t*t*(3-2*t)


# At the floor the loose tail widens again. Most of the opening is at eye
# height. At the ceiling both curtains meet beneath the rail.
controls=[(.0,2.22,.92,.16),(.08,2.23,.90,.16),(.65,2.25,.69,.14),
          (1.36,2.28,.36,.086),(1.43,2.28,.35,.082),(1.56,2.27,.48,.10),
          (2.2,2.27,.77,.13),(3.1,2.28,1.18,.139),(4.14,2.28,1.73,.125),
          (4.86,2.28,2.18,.085),(5.025,2.28,2.29,.072),(5.065,2.28,2.30,.066)]


def profile(z):
    for a,b in zip(controls,controls[1:]):
        if z<=b[0]:
            t=smoothstep((z-a[0])/(b[0]-a[0]))
            return [a[j]+t*(b[j]-a[j]) for j in (1,2,3)]
    return controls[-1][1:]


def point(side,z,u,phase=0):
    out,w,depth=profile(z)
    t=z/5.065
    # Narrow triple creases at the heading soften into broad rolling folds
    # below it. Triangle normals are continuous across every sewing panel.
    wave=math.tau*(13*u+.055*math.sin(math.pi*t)*math.sin(math.tau*1.4*u+side))
    fold=math.sin(wave)+.18*math.sin(2*wave+.71)+.095*t**5*math.cos(3*wave)
    y=depth*fold+.032*math.sin(u*8+side)*math.sin(math.pi*t)
    x=side*(out-w*u)+side*.011*math.sin(wave*.5)*math.sin(math.pi*t)
    if z<.45:z+=.036*(.5+.5*math.cos(wave))*(1-z/.45)
    return (x,y+phase,z)


for side in [-1,1]:
    levels=sorted(set([b[0] for b in controls]+[i*.105 for i in range(1,48)]))
    steps=13*10
    verts=[point(side,z,i/steps) for z in levels for i in range(steps+1)]
    faces=[]; idx=[]
    for j,z in enumerate(levels[:-1]):
        for i in range(steps):
            n=j*(steps+1)+i
            f=(n,n+1,n+steps+2,n+steps+1)
            faces.append(f if side<0 else tuple(reversed(f)))
            u=(i+.5)/steps
            light=math.cos(math.tau*(13*u-.13)+.07*math.sin(z+.4))
            grain=.17*math.sin(u*33+z*.56)+.11*math.cos(17*u-z*.8)
            idx.append(max(0,min(6,round(3.35+1.72*light+grain))))
    mesh('왼쪽 주름 커튼' if side<0 else '오른쪽 주름 커튼',verts,faces,cloth,idx,True)
    for z in [.081,.098,4.944,5.002]:
        tube('접어 박은 커튼 단',[point(side,z,i/steps,-.003) for i in range(steps+1)],.0026,thread,5)
    for u in [.009,.995]:
        tube('세로 솔기',[point(side,z,u,-.0035) for z in levels],.0031,thread,6)
    # A double braided tie encircles the bundle, with two independent tassels.
    cx=side*(2.28-.355/2)
    for z in [1.398,1.427]:
        path=[(cx+.242*math.cos(t),.120*math.sin(t),z+.025*math.cos(t*2+.3))
              for t in [math.tau*i/44 for i in range(45)]]
        tube('꼰 장식끈',path,.014,cord)
    for k in [0,1]:
        ex=cx+side*(.14+k*.07)
        end=1.065-k*.079
        tube('태슬 매듭줄',[(cx+.10*side,-.104,1.42),(ex,-.161,1.27),(ex+.016,-.155,end+.08)],.010,cord)
        for i in range(14):
            t=math.tau*i/14
            tube('태슬 술',[(ex+.012*math.cos(t),-.16+.012*math.sin(t),end+.075),
                         (ex+.020*math.cos(t),-.16+.020*math.sin(t),end+.021),
                         (ex+.028*math.cos(t),-.16+.028*math.sin(t),end-.047+.009*math.cos(t*3))],.003,cord,5)
    for i in range(14):
        x=side*(2.28-i*2.25/13)
        tube('주름 상단 후크',[(x,.038,5.045),(x,.057,5.086),(x,.024,5.106)],.006,metal,6)
tube('천장 황동 트랙',[(-2.32,.033,5.09),(2.32,.033,5.09)],.018,brass,12)
for x in [-2.16,-.07,2.16]:
    tube('레일 천장 지지점',[(x,.035,5.105),(x,.035,5.16)],.018,metal,8)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_location=(0,0,2.6)
        area.spaces.active.region_3d.view_distance=8.3
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'drapes.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'gathered.glb')],check=True)
