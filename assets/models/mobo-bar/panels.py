"""Photograph two original Blender displays for distant views, preserving their open spaces."""
from pathlib import Path
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
def photograph(collection,name,pixels,frame_width,eye_height,slope,samples):
    coll=bpy.data.collections['모보 바 · '+collection]
    origin=Vector(coll['preview_origin'])
    scene=bpy.data.scenes.new('모보 바 · '+collection+' 원거리')
    scene.collection.children.link(coll)
    bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=samples;scene.cycles.use_denoising=True
    scene.render.resolution_x,scene.render.resolution_y=pixels
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='WEBP';scene.render.image_settings.color_mode='RGBA'
    scene.render.image_settings.quality=87;scene.render.filepath=str(here/(name+'-front.webp'))
    world=bpy.data.worlds.new('중성 반사 환경');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.74,.70,.64,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.72
    scene.world=world
    focus=origin+Vector((0,0,eye_height))
    for position,size,energy in [((-.9,1.2,1.4),1.25,48),((1,-.75,1.25),.8,39)]:
        data=bpy.data.lights.new('소프트박스','AREA');data.energy=energy;data.size=size
        obj=bpy.data.objects.new('소프트박스',data);scene.collection.objects.link(obj)
        obj.location=focus+Vector(position)
        obj.rotation_euler=(focus-obj.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.cameras.new('정면 촬영')
    cam.type='ORTHO';cam.ortho_scale=frame_width*max(1,pixels[1]/pixels[0])
    obj=bpy.data.objects.new('정면 촬영',cam);scene.collection.objects.link(obj)
    obj.location=focus+Vector((0,6.7,slope));obj.rotation_euler=(focus-obj.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=obj
    bpy.ops.render.render(write_still=True)

photograph('증류주 병과 유리잔','bottles',(672,142),2.90,.286,.12,24)
photograph('철제 선반의 허브 화분','herbs',(350,510),2.32,1.68,.06,32)
