"""Photograph the original header type and pictograms; keep outlines in the editable source."""
import bpy
from mathutils import Vector

PRINTED_PREFIXES=('활자 ·','색띠 ·','픽토그램 ·','승차대 표지 ·')
def bake_header(frame,path):
    old=bpy.context.window.scene
    scene=bpy.data.scenes.new('승차대 행선 안내 · 인쇄 분판');bpy.context.window.scene=scene
    inks={}
    for obj in frame.objects:
        if not obj.name.startswith((*PRINTED_PREFIXES,'행선 안내 · 검정 바탕')):continue
        copy=obj.copy();copy.data=obj.data.copy();scene.collection.objects.link(copy)
        for i,material in enumerate(copy.data.materials):
            if material.name not in inks:
                ink=bpy.data.materials.new('인쇄 · '+material.name);ink.use_nodes=True;ink.node_tree.nodes.clear()
                out=ink.node_tree.nodes.new('ShaderNodeOutputMaterial');sh=ink.node_tree.nodes.new('ShaderNodeEmission')
                sh.inputs[0].default_value=material.diffuse_color;ink.node_tree.links.new(sh.outputs[0],out.inputs[0])
                inks[material.name]=ink
            copy.data.materials[i]=inks[material.name]
    lens=bpy.data.cameras.new('행선 안내 촬영');lens.type='ORTHO';lens.ortho_scale=6.57
    camera=bpy.data.objects.new('앞면 인쇄',lens);scene.collection.objects.link(camera)
    camera.location=(0,-1,2.3625);camera.rotation_euler=Vector((0,1,0)).to_track_quat('-Z','Y').to_euler();scene.camera=camera
    scene.render.engine='CYCLES';scene.cycles.samples=6
    scene.render.resolution_x=1536;scene.render.resolution_y=75;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='Standard';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True);bpy.context.window.scene=old;bpy.data.scenes.remove(scene)
