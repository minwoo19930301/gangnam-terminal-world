"""Editable bronze gallery luminaires, LED casing and the original displayed artwork."""
from pathlib import Path
from math import pi, tau, sin, cos
import bpy
import runpy
import subprocess

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system='METRIC'
scene.name='설치 모형 · 파미에 광장'


def colour(name, value, metallic=0, lit=False):
    mat=bpy.data.materials.new(name)
    raw=[int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in raw]
    mat.diffuse_color=(*rgb,1)
    mat.use_nodes=True
    shader=mat.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value=(*rgb,1)
    shader.inputs['Metallic'].default_value=metallic
    shader.inputs['Roughness'].default_value=.38
    if lit:
        mat['lit_face']=True
        shader.inputs['Emission Color'].default_value=(*rgb,1)
        shader.inputs['Emission Strength'].default_value=1.2
    return mat


dark=colour('청동 · 짙은 갈색', '423B34', .7)
edge=colour('청동 · 닳은 테', '95816C', .7)
brass=colour('황동 · 조임쇠', 'B29770', .7)
milk=colour('유백색 유리 · 내부등', 'FFE1AC', lit=True)
matte=colour('미디어 캐비닛 · 측면', '4F524F', .45)
black=colour('스크린 주변 흑색 테', '20272A', .35)
aluminum=colour('아노다이징 · 모서리', 'A8A095', .7)


def section(name, file, offset):
    group=bpy.data.collections.new(name)
    scene.collection.children.link(group)
    group['export_model']=file
    group['preview_origin']=offset
    return group


def object_for(group, name, xyz, faces, mat, smooth=False):
    ox,oy,oz=group['preview_origin']
    data=bpy.data.meshes.new(name)
    data.from_pydata([(x+ox,y+oy,z+oz) for x,y,z in xyz], [], faces)
    data.update()
    for p in data.polygons: p.use_smooth=smooth
    obj=bpy.data.objects.new(name,data)
    group.objects.link(obj)
    data.materials.append(mat)
    return obj


def profile(group,name,outline,mat,n=32):
    v=[(r*cos(tau*j/n),r*sin(tau*j/n),z) for r,z in outline for j in range(n)]
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j)
           for i in range(len(outline)-1) for j in range(n)]
    return object_for(group,name,v,faces,mat,True)


def box(group,name,x,y,z,w,d,h,mat):
    v=[(x+a*w/2,y+b*d/2,z+c*h) for c in (0,1) for b in (-1,1) for a in (-1,1)]
    return object_for(group,name,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),
                                 (1,3,7,5),(3,2,6,7),(2,0,4,6)],mat)


lamp=section('광장 벽등 · 고리와 유백 갓','globe-lamp',(-2.4,0,0))
profile(lamp,'받침 주물',[(.118,0),(.118,.036),(.094,.042),(.077,.064),
                          (.072,.118),(.046,.135),(.044,.206)],dark)
profile(lamp,'테두리와 줄기 소켓',[(.071,.115),(.077,.123),(.073,.141),(.049,.159)],edge)
profile(lamp,'스탠드',[(.035,.147),(.026,1.95),(.038,1.978),(.039,2.028),(.04,2.05)],dark)
profile(lamp,'줄기 목',[(.041,1.96),(.049,1.976),(.048,1.995),(.031,2.009)],brass)
# A cast loop encloses the suspended opal hemisphere, with a gap beneath the crown.
outer,inner,cz=.236,.204,2.238
steps=60
v=[]
for j in range(steps):
    a=tau*j/steps
    v.extend((r*cos(a),depth,cz+r*sin(a))
             for r,depth in [(outer,-.024),(outer,.024),(inner,.024),(inner,-.024)])
faces=[(4*j+k,4*((j+1)%steps)+k,4*((j+1)%steps)+(k+1)%4,4*j+(k+1)%4)
       for j in range(steps) for k in range(4)]
object_for(lamp,'주물 행거 고리',v,faces,dark)
profile(lamp,'꼭지와 갓걸이',[(.019,2.335),(.026,2.35),(.017,2.41),(.019,2.443)],brass,20)
profile(lamp,'금속 갓',[(.171,2.248),(.174,2.26),(.162,2.281),(.12,2.307),(.032,2.339)],dark)
profile(lamp,'갓의 얇은 말림',[(.165,2.245),(.175,2.249),(.174,2.259)],edge)
profile(lamp,'유리 갓',[(.002,2.101),(.045,2.108),(.081,2.124),(.114,2.146),
                     (.139,2.172),(.155,2.208),(.16,2.247)],milk)
profile(lamp,'유리끝 장식',[(.006,2.094),(.015,2.1),(.012,2.107)],brass,16)

cab=section('세로형 전광판 · 캐비닛과 매체','portrait-cabinet',(2.4,0,0))
w,h=2.54,4.57
box(cab,'캐비닛 등판',0,.10,0,w,.18,h,matte)
box(cab,'검은 화면 밑판',0,-.018,.035,w-.05,.06,h-.07,black)
for side in (-1,1):
    box(cab,'산화피막 옆 테',side*(w/2-.018),-.012,0,.036,.097,h,aluminum)
    for i in range(3):
        box(cab,'측판 접힘새',side*(w/2+.0005),.095,(i+1)*h/4,.004,.16,.009,black)
for bottom in (0,h-.032):
    box(cab,'압출 모서리 캡',0,-.012,bottom,w,.097,.032,aluminum)

terrace=section('광장 포비 앞 · 빨간 비스트로 테이블','terrace-set',(5.4,0,0))
runpy.run_path(str(HERE/'terrace.py'))['build_terrace'](terrace,colour,object_for,box)

plant=section('광장 포비 앞 · 석재 화분과 관엽수','court-planter',(7.4,0,0))
runpy.run_path(str(HERE/'planting.py'))['build_planter'](plant,colour,object_for,profile)

# Editable original artwork and its packed render remain part of the Blender file.
runpy.run_path(str(HERE/'paving.py'))['render_paving'](HERE/'paving.webp')
poster=HERE/'arcade.webp'
runpy.run_path(str(HERE/'poster.py'))['render_poster'](poster)
image=bpy.data.images.load(str(poster)); image.pack()
media=bpy.data.materials.new('화면 콘텐츠 · FAMILLE STATION')
media.use_nodes=True
nodes=media.node_tree.nodes
pic=nodes.new('ShaderNodeTexImage'); pic.image=image
light=nodes.new('ShaderNodeEmission')
media.node_tree.links.new(pic.outputs['Color'], light.inputs['Color'])
media.node_tree.links.new(light.outputs[0], nodes.get('Material Output').inputs['Surface'])
content=bpy.data.collections.new('전광판 · 교체 가능한 화면 원화')
scene.collection.children.link(content)
ox=2.4
panel=bpy.data.meshes.new('설치용 미디어 출력면')
panel.from_pydata([(ox+x,-.051,z) for x,z in [(-1.218,.082),(1.218,.082),(1.218,4.488),(-1.218,4.488)]],[],[(0,1,2,3)])
panel.update()
uv=panel.uv_layers.new()
for loop,point in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]): loop.uv=point
ob=bpy.data.objects.new('설치용 미디어 출력면',panel)
content.objects.link(ob)
panel.materials.append(media)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'atrium-fittings.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')

subprocess.run(['node', str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'court-planter.glb')],check=True)
