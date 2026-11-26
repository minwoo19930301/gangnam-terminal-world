"""Build the public café's flared walnut posts, attached sconces and pendant lanterns."""
import bpy
import json
import math
import re
import runpy
import sys
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
COLUMNS = json.loads(re.search(r'const columns = (\[.*?\]);', (HERE/'model.js').read_text()).group(1))
bpy.ops.wm.read_factory_settings(use_empty=True)
group=bpy.data.collections.new('파미에파크R · 목재 기둥과 구형 조명')
bpy.context.scene.collection.children.link(group)
group['export_model']='coffee-trees'
group['preview_origin']=(0,0,0)

def material(name, rgb):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*[max(0, (c/255+.055)/1.055)**2.4 for c in rgb],1)
    return m

timber_colors=[
    (127,72,47),(139,81,53),(152,93,62),(146,86,54),(128,72,47),
    (111,61,43),(155,97,62),(135,78,49),(158,99,67),(146,82,52)]
wood=[material(f'호두나무 무늬목 {i}',rgb) for i,rgb in enumerate(timber_colors)]
black=material('철제 이음과 조명 케이스',(46,39,37))
ink=material('짙은 양각 글자',(56,42,34))
cream=material('직조 갓의 유백색 확산면',(247,230,198))
cord=material('갓의 옅은 나선 짜임',(205,178,143))
lit=material('벽등의 따뜻한 발광창',(255,229,164))
gold=material('벽등 받침의 황동',(181,130,74))

def obj(name,v,f,mats,mi=None):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(v,[],f);mesh.update()
    o=bpy.data.objects.new(name,mesh);group.objects.link(o)
    for m in mats:mesh.materials.append(m)
    if mi:
        for p,i in zip(mesh.polygons,mi):p.material_index=i
    return o

def cylinder(name,start,end,r,mat,sides=12):
    a,b=Vector(start),Vector(end)
    n=(b-a).normalized()
    u=n.cross(Vector((0,1,0)) if abs(n.y)<.95 else Vector((1,0,0))).normalized()
    t=n.cross(u)
    v=[p+r*(u*math.cos(i*math.tau/sides)+t*math.sin(i*math.tau/sides)) for p in (a,b) for i in range(sides)]
    f=[(i,(i+1)%sides,sides+(i+1)%sides,sides+i) for i in range(sides)]
    return obj(name,v,f+[tuple(reversed(range(sides))),tuple(range(sides,2*sides))],[mat])

def lantern(x,y,z,r):
    # Woven shell photographs show a broad oblique spiral across the pale diffuser.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=r,location=(x,y,z))
    o=bpy.context.object;o.name='낮게 달린 구형 확산 갓'
    for c in list(o.users_collection):c.objects.unlink(o)
    group.objects.link(o);o.data.materials.append(cream);o['woven']=True
    for poly in o.data.polygons:poly.use_smooth=True
    for i in range(2):
        verts=[];faces=[]
        for j in range(30):
            a=.08+math.pi*.94*j/29
            theta=math.pi*i+2.6*a
            for side in (-.06,.06):
                verts.append((x+(r+.005)*math.sin(a)*math.cos(theta+side),
                              y+(r+.005)*math.sin(a)*math.sin(theta+side),z+(r+.005)*math.cos(a)))
            if j:faces.append((j*2,j*2+1,j*2-1,j*2-2))
        obj('등갓의 비스듬한 감김',verts,faces,[cord])
    cylinder('검은 소켓',(x,y,z+r-.012),(x,y,z+r+.07),.041,black)

def timber(x,y,h,rotation):
    # Three veneered cheeks from each trunk open outward, leaving deep V-shaped joints.
    for k in range(3):
        a=rotation+k*math.tau/3
        angles=[a+(j/8-.5)*(math.tau/3-.033) for j in range(9)]
        v=[];f=[];idx=[]
        levels=[(.02,.245),(.095,.246),(h*.56,.237),(h*.70,.236),(h*.79,.26),(h*.86,.33),(h*.92,.48),(h*.97,.75),(h,1.09)]
        # The photographed sconces throw a soft double wash onto their own wood.
        # Bake it in narrow veneer bands; all three columns share one runtime material.
        levels.sort()
        for z in [1.57+j*.105 for j in range(17)]:
            if any(abs(z-h0)<.045 for h0,r0 in levels):continue
            for n in range(1,len(levels)):
                lo,rlo=levels[n-1];hi,rhi=levels[n]
                if lo<z<hi:
                    levels.insert(n,(z,rlo+(rhi-rlo)*(z-lo)/(hi-lo)));break
        for row,(z,rad) in enumerate(levels):
            for j,base_angle in enumerate(angles):
                # Crown lobes broaden toward their tips; inner edges remain visibly separate.
                bend=max(0,(z/h-.72)/.28)
                angle=a+(base_angle-a)*(1-.46*bend)
                r=rad*(1-bend*.12*abs((j-4)/4))
                v.append((x+r*math.cos(angle),y+r*math.sin(angle),z-bend*.07*abs((j-4)/4)))
            if row:
                for j in range(8):
                    a0=(row-1)*9+j
                    f.append((a0,a0+1,a0+10,a0+9))
                    idx.append((k*3+[0,1,3,2,1,0,3,4][j])%10)
        # The cap is deep, bounded wood rather than an infinitely thin surface.
        n=len(v);v.extend([(x+(vx-x)*.88,y+(vy-y)*.88,vz-(.013+.067*max(0,(vz/h-.85)/.15))) for vx,vy,vz in v])
        for row in range(len(levels)-1):
            for j in [0,8]:
                a0=row*9+j;f.append((a0,a0+9,a0+9+n,a0+n));idx.append(5)
            if levels[row+1][0]>h*.70:
                for j in range(8):
                    a0=row*9+j;f.append((a0+n,a0+9+n,a0+10+n,a0+1+n));idx.append(0)
        start=(len(levels)-1)*9
        for j in range(8):f.append((start+j,start+j+n,start+j+1+n,start+j+1));idx.append(3)
        cheek=obj('벌어진 나무 기둥의 집성목 면',v,f,wood,idx)
        cheek['veneer']=(x,y,rotation,a)
        for face in list(cheek.data.polygons)[:8*(len(levels)-1)]:face.use_smooth=True
    cylinder('검은 걸레받이',(x,y,.005),(x,y,.07),.252,black,32)
    cylinder('중앙 이음 속재',(x,y,.03),(x,y,h*.78),.219,wood[5],24)
    for a in (rotation+.3,rotation+.3+math.pi):
        dx,dy=math.cos(a),math.sin(a)
        sx,sy=x+dx*.32,y+dy*.32
        cylinder('철제 벽등 받침',(x+dx*.22,y+dy*.22,2.35),(sx,sy,2.35),.062,gold)
        for lo,hi,m,r in [(2.04,2.09,lit,.054),(2.09,2.47,black,.066),(2.47,2.51,lit,.054),(2.51,2.75,black,.064)]:
            cylinder('위아래로 빛나는 원통 벽등',(sx,sy,lo),(sx,sy,hi),r,m)

def lettering(x,y,z,value,size,font,normal):
    cu=bpy.data.curves.new(value,'FONT');cu.body=value;cu.font=font;cu.size=size
    cu.align_x='CENTER';cu.align_y='CENTER';cu.extrude=.0016 if size>.05 else 0;cu.resolution_u=3
    o=bpy.data.objects.new(value,cu);group.objects.link(o);o.location=(x,y,z)
    o.rotation_euler=(math.pi/2,0,normal+math.pi/2)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.data.materials.append(ink);o.select_set(False)
    for vertex in o.data.vertices:
        u,v,d=vertex.co
        angle=u/.243
        vertex.co=(math.sin(angle)*(.243+d),v,math.cos(angle)*(.243+d)-.243)

script=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Brush Script.ttf')
sans=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial.ttf')
for i,(x,south,h) in enumerate(COLUMNS):
    y=-south
    timber(x,y,h,[.15,.8,.36][i])
    if i==2:
        # The visitor close-up shows individual dark letters fixed directly to the timber.
        normal=4.04;dx,dy=math.cos(normal),math.sin(normal)
        for z,s,sz,font in [(1.92,'800th',.121,script),(1.81,'Store',.109,script),(1.70,'STARBUCKS COFFEE',.029,sans),(1.66,'KOREA',.029,sans)]:
            lettering(x+dx*.244,y+dy*.244,z,s,sz,font,normal)
    if i in [0,2]:
        # A dark projecting arm and two unequal drops, above the seating/service area.
        dx,dy=([-.82,-.57] if i==0 else [.12,.99])
        arm_z=h-.44
        cylinder('검은 수평 등걸이',(x,y,arm_z),(x+dx*1.7,y+dy*1.7,arm_z),.022,black)
        for d,z,r in [(.92,3.08,.245),(1.62,2.84,.325)]:
            gx,gy=x+dx*d,y+dy*d
            cylinder('매단 줄',(gx,gy,z+r),(gx,gy,arm_z),.009,black,8)
            lantern(gx,gy,z,r)

sys.dont_write_bytecode=True;sys.path.insert(0,str(HERE))
from counter import build_bar
from finishes import paint
build_bar(group,obj,cylinder,material)
paint(list(group.all_objects))
bpy.ops.object.select_all(action='DESELECT')
target=Vector((3.0,1.1,2.0))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active
        space.shading.color_type='VERTEX'
        space.region_3d.view_location=target
        space.region_3d.view_distance=28
        space.region_3d.view_rotation=(target-Vector((-7,-24,9))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'coffee-trees.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'),run_name='__main__')
