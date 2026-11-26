"""Build the public Tamayura counter collections, native showroom and streaming meshes.
blender -b --factory-startup --python-exit-code 1 -P assets/models/tamayura/build.py
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import sys,subprocess,json
from math import pi
import bpy
from mathutils import Matrix,Vector

here=Path(__file__).resolve().parent
tools=here.parents[2]/'tools'
sys.dont_write_bytecode=True
sys.path[:0]=[str(here),str(tools)]
import blender_shop_mesh as m
import finishes,joinery,tableware,floor,entrance,room
from lighting import LIT,bake_room
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['restaurant']='JW Marriott Hotel Seoul · Tamayura · 2F'
scene['reference']='https://tamayura.jwmarriottseoul.com/ko/photos'
scene['proportion']='Official 8 sushi / 8 teppanyaki / 6 tea seats. Object and counter spacing is fitted to the game.'
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts,furniture} from './layout.js';console.log(JSON.stringify({parts,furniture}));"],cwd=here))
rows=data['furniture']
image=finishes.new_atlas(here);finishes.prepare_native(m,image)
creators={'sushi':joinery.sushi_bar,'teppan':joinery.teppan_bar,'tea':joinery.tea_bar,'chair':joinery.armchair,
          'teaChair':joinery.tea_chair,'setting':tableware.setting,'sushiDish':tableware.sushi_dish,
          'teppanDish':tableware.teppan_dish,'teaSet':tableware.tea_set,'floor':floor.tile_floor,'entry':entrance.build,'room':room.build}
groups={}

from exporter import packed as pack_mesh
def packed(mesh,key):
    pack_mesh(here,mesh,key)

def textured(group,key):
    vs=[];polys=[];uvs=[];shading=[];smooth=[]
    graph=bpy.context.evaluated_depsgraph_get()
    for orig in sorted(group.objects,key=lambda o:o.name):
        obj=orig.evaluated_get(graph);mesh=obj.to_mesh()
        try:
            offset=len(vs);vs.extend(obj.matrix_world @ v.co for v in mesh.vertices)
            src_uv=mesh.uv_layers.active.data
            for f in mesh.polygons:
                polys.append(tuple(offset+v for v in f.vertices));smooth.append(f.use_smooth)
                uvs.extend(tuple(src_uv[i].uv) for i in f.loop_indices)
                material=mesh.materials[f.material_index].name
                # Large occluded faces are gently darkened. Native lighting and the game sky remain dynamic.
                value=1 if material=='cove' else .91+.065*max(0,f.normal.z)-.065*max(0,-f.normal.z)
                shading.extend([value]*len(f.loop_indices))
        finally:obj.to_mesh_clear()
    mesh=bpy.data.meshes.new(key);mesh.from_pydata(vs,[],polys);mesh.update()
    mesh.polygons.foreach_set('use_smooth',smooth)
    uv=mesh.uv_layers.new(name='SurfaceAtlas');uv.uv.foreach_set('vector',[c for p in uvs for c in p])
    color=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    color.data.foreach_set('color',[c for v in shading for c in (v,v,v,1)])
    packed(mesh,key)

for key,create in creators.items():
    coll=bpy.data.collections.new('타마유라 · '+data['parts'][key][0]);groups[key]=coll
    scene.collection.children.link(coll);coll['preview_origin']=[0,0,0]
    m.group=coll;create();finishes.project_uvs(coll);bpy.context.view_layer.update()
    if key=='floor':packed(floor.bake(here,rows),key)
    elif key not in LIT:textured(coll,key)
# The editable source collections stay at local origin. A separate scene lays out linked copies
# using the very same transforms as the public restaurant. Selecting a source reveals each component.
source_scene=bpy.data.scenes.new('편집 · 카운터와 의자 원본')
for coll in groups.values():
    scene.collection.children.unlink(coll);source_scene.collection.children.link(coll)
scene.name='타마유라 · 공개 카운터 세 곳'
arranged=bpy.data.collections.new('실제 게임의 타마유라 배치');scene.collection.children.link(arranged)
for p in rows:
    key=p['key'];ob=bpy.data.objects.new(data['parts'][key][0],None)
    ob.instance_type='COLLECTION';ob.instance_collection=groups[key];ob.empty_display_size=.06
    ob.location=(p['u']-floor.U,floor.V-p['v'],p['h']);ob.rotation_euler.z=p['turn'];arranged.objects.link(ob)
studio=bpy.data.collections.new('검수 · 조명과 카메라');scene.collection.children.link(studio)
def at(u,v,z):return Vector((u-floor.U,floor.V-v,z))
def point(ob,position,target):
    ob.location=position;ob.rotation_euler=(target-position).to_track_quat('-Z','Y').to_euler()
def lamp(name,power,size,position,target,tint):
    l=bpy.data.lights.new(name,'AREA');l.energy=power;l.shape='DISK';l.size=size;l.color=tint
    ob=bpy.data.objects.new(name,l);studio.objects.link(ob);point(ob,at(*position),at(*target))
lamp('현관 황동 글자 위 매입등',99,.61,(18.43,42.35,2.88),(18.43,42.92,1.17),(1,.85,.66))
lamp('화병을 비추는 현관 불빛',80,.72,(21.91,42.01,2.76),(21.86,42.64,.70),(1,.88,.71))
lamp('스시 바의 나무 천장 간접광',312,4.1,(21.1,52,2.99),(21.3,52.6,.7),(1,.85,.69))
lamp('스시 패널과 좌석을 비추는 빛',286,3.4,(20.2,50.05,2.8),(22,52.6,.99),(1,.91,.80))
lamp('철판 조리 작업등',165,2.5,(19.81,47.12,2.24),(19.81,47.02,.78),(1,.84,.65))
lamp('후드와 금속 벽에 비친 빛',260,3.0,(21.75,44.5,2.52),(19.81,47.92,1.48),(1,.90,.78))
lamp('차실 상판과 도자기',166,2.4,(24,46.6,2.55),(24.49,46.45,.80),(1,.83,.65))
lamp('건너편 천장 불빛',370,4.6,(21.9,49.7,3.75),(23.6,46.6,.7),(1,.95,.88))
def camera(name,pos,target,lens):
    cam=bpy.data.cameras.new(name);cam.lens=lens;cam.clip_start=.008
    ob=bpy.data.objects.new(name,cam);studio.objects.link(ob);point(ob,at(*pos),at(*target));return ob
cameras=[
    camera('스시 바', (17.65,49.85,1.63),(21.38,52.58,1.15),25),
    camera('데판야키', (21.72,43.96,1.58),(19.70,47.25,1.31),25),
    camera('티 바', (22.05,43.57,1.60),(24.67,46.19,1.26),29),
    camera('니기리 상차림', (20.82,51.80,1.16),(20.94,52.36,.86),44),
    camera('차선과 다관',(23.51,46.04,1.18),(24.27,46.49,.875),44),
    camera('철판 한우',(20.03,46.13,1.10),(20.22,46.54,.84),47),
]
scene.camera=cameras[0]
scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.36
world=bpy.data.worlds.new('실내의 중성 반사광');world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.57,.52,.48,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.34;scene.world=world
scene.render.engine='CYCLES';scene.cycles.samples=26;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=620;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
bpy.context.preferences.filepaths.save_version=0
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(here/'tamayura.blend'),compress=True)

if '--geometry-only' not in sys.argv:
    bake_room(here,groups,packed)
