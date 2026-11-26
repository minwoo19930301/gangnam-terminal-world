"""Bake the Blender bottle rack into a single distant-view front panel."""
from pathlib import Path
from mathutils import Vector
import bpy

here=Path(__file__).resolve().parent
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=12
scene.cycles.use_denoising=True
scene.render.resolution_x,scene.render.resolution_y=640,794
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP'
scene.render.image_settings.quality=88
scene.render.film_transparent=False
scene.render.filepath=str(here/'rack-front.webp')
world=bpy.data.worlds.new('셀러 촬영 환경')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.47,.42,.39,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.38
scene.world=world
def lamp(name,location,target,energy,size,color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy;data.shape='DISK';data.size=size;data.color=color
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj)
    obj.location=location;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
lamp('넓은 선반 앞 조명',(-1.45,-3.55,3.8),(0,0,1.35),130,2.4,(1.0,.89,.78))
lamp('병목 반사판',(2.6,-2.05,2.2),(0,0,1.32),82,1.7,(.82,.89,1.0))
cam=bpy.data.cameras.new('정면 투영')
cam.type='ORTHO';cam.ortho_scale=2.437
eye=bpy.data.objects.new('정면 촬영점',cam);scene.collection.objects.link(eye)
eye.location=(0,-5.1,1.22)
eye.rotation_euler=(Vector((0,0,1.22))-eye.location).to_track_quat('-Z','Y').to_euler()
scene.camera=eye
bpy.ops.render.render(write_still=True)
