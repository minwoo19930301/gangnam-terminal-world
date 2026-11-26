"""A native three-quarter and interior camera, with a separate studio scene for the artist."""
from math import radians
import bpy
from mathutils import Vector

def prepare(source,groups):
    studio=bpy.data.scenes.new('검수 · 시내버스 스튜디오')
    studio.unit_settings.system='METRIC';studio.render.engine='CYCLES';studio.cycles.samples=32
    studio.cycles.use_denoising=True;studio.render.resolution_x=1152;studio.render.resolution_y=660;studio.render.resolution_percentage=100
    for group in groups:studio.collection.children.link(group)
    studio.world=bpy.data.worlds.new('스튜디오 · 중성 회색');studio.world.use_nodes=True
    studio.world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.38,.46,1)
    studio.world.node_tree.nodes['Background'].inputs[1].default_value=.52
    def camera(name,loc,target,lens,world=studio):
        data=bpy.data.cameras.new(name);data.lens=lens;ob=bpy.data.objects.new(name,data);world.collection.objects.link(ob)
        ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();return ob
    studio.camera=camera('정류장 쪽에서 본 전면',(-13,-12,5.0),(0,-.1,1.45),48)
    camera('차창 뒤 승객석',(-.35,-3.43,1.81),(0,3.80,1.48),23)
    camera('차대와 뒤쪽 차륜',(-4.44,4.60,1.16),(-.78,2.28,.68),47)
    for label,loc,power,size,color in [('창가 키라이트',(-5,-6,8),1500,7,(1,.91,.83)),
          ('차체 측면 긴 빛',(4,1,5),1250,8,(.77,.88,1)),('후미 림라이트',(-3,6,7),1200,4,(.89,.93,1))]:
        data=bpy.data.lights.new(label,'AREA');data.energy=power;data.shape='RECTANGLE';data.size=size;data.size_y=size*.69;data.color=color
        o=bpy.data.objects.new(label,data);studio.collection.objects.link(o);o.location=loc
        o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
    floor=bpy.data.meshes.new('스튜디오 받침면')
    floor.from_pydata([(-100,-100,-.006),(100,-100,-.006),(100,100,-.006),(-100,100,-.006)],[],[(0,1,2,3)])
    base=bpy.data.objects.new('검수용 받침 · 게임 제외',floor);studio.collection.objects.link(base)
    material=bpy.data.materials.new('검수용 회색 바닥');material.diffuse_color=(.23,.25,.28,1);floor.materials.append(material)
    source.camera=camera('보행자 눈높이',(-11,-9,2.35),(0,0,1.52),41,source)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                space=area.spaces.active;space.region_3d.view_distance=15;space.region_3d.view_location=(0,0,1.49)
                space.region_3d.view_rotation=studio.camera.rotation_euler.to_quaternion();space.clip_end=300
                space.shading.color_type='MATERIAL';space.shading.show_cavity=True
    return studio
