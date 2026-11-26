"""Rebuild both native entrance studies and their runtime / distance meshes."""
import math
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from mathutils import Vector

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from geometry import Part,write_proxy
from surfaces import make_image
from portal import silhouette
from tower import facade

def english(low):
    curve=bpy.data.curves.new('Found letters · road-view capitalization','FONT')
    curve.body='SEOUL EXPRESS BUS TERMINAL'
    curve.align_x='CENTER'
    curve.align_y='CENTER'
    curve.size=.55
    curve.space_character=1.065
    curve.resolution_u=2 if low else 3
    curve.extrude=0 if low else .023
    curve.bevel_depth=0 if low else .006
    curve.bevel_resolution=0
    obj=bpy.data.objects.new('Editable inscription · SEOUL EXPRESS BUS TERMINAL',curve)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.update()
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=evaluated.to_mesh()
    mesh.calc_loop_triangles()
    span=max(v.co.x for v in mesh.vertices)-min(v.co.x for v in mesh.vertices)
    size=7.44/span
    metal=Part('06 · Individual raised English metal letters','Metal')
    for tri in mesh.loop_triangles:
        n=tri.normal
        if low and n.z<.8:continue
        points=[mesh.vertices[i].co for i in tri.vertices]
        metal.face([(.84+p.x*size,2.638+p.z*size,6.441+p.y*size) for p in points],6,(n.x,n.z,n.y),(.99,.991,.986))
    evaluated.to_mesh_clear()
    if low:bpy.data.objects.remove(obj,do_unlink=True)
    else:
        obj.location=(.84,-2.638,6.441)
        obj.rotation_euler.x=math.pi/2
        obj.scale=(size,size,size)
        obj.hide_viewport=True
        obj.hide_render=True
    return metal

def make_material(name,image,baked):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear()
    tex=nodes.new('ShaderNodeTexImage');tex.image=image
    tex.location=(-650,120)
    value=tex.outputs['Color']
    if baked:
        shade=nodes.new('ShaderNodeVertexColor');shade.layer_name='Finish tint';shade.location=(-650,-80)
        multiply=nodes.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1
        multiply.location=(-370,40)
        mat.node_tree.links.new(value,multiply.inputs[1]);mat.node_tree.links.new(shade.outputs['Color'],multiply.inputs[2]);value=multiply.outputs[0]
    if name=='Lamps':
        shader=nodes.new('ShaderNodeEmission');mat.node_tree.links.new(value,shader.inputs['Color'])
    else:
        shader=nodes.new('ShaderNodeBsdfPrincipled')
        rough,metal={'Stone':(.77,.025),'Metal':(.46,.10),'Glass':(.25,.08)}[name]
        shader.inputs['Roughness'].default_value=rough
        shader.inputs['Metallic'].default_value=metal
        mat.node_tree.links.new(value,shader.inputs['Base Color'])
        if name=='Glass':
            shader.inputs['Alpha'].default_value=.29
            mat.surface_render_method='DITHERED'
    shader.location=(-60,55)
    out=nodes.new('ShaderNodeOutputMaterial');out.location=(255,55)
    mat.node_tree.links.new(shader.outputs[0],out.inputs['Surface'])
    mat.use_backface_culling=True
    return mat

def collection(name):
    col=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col

def create(key,title,source,texture):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version=0
    scene=bpy.context.scene;scene.unit_settings.system='METRIC'
    scene['site']='Seoul Express Bus Terminal, public Sinbanpo-ro frontage'
    scene['references']='Naver street view mEuEgCESVhlx5M-gkmmdWQ (Jan 2026), Film Korea Gyeongbu location photos 11458 and 11459'
    scene['registration']='Portal and tower surveyed separately in the existing game frame. Profiles and dimensions are interpreted from public photographs.'
    image=bpy.data.images.load(str(texture));image.name='Public front · original material atlas';image.pack();image.filepath='//surface.png'
    types=['Stone','Metal','Glass','Lamps']
    mats={t:make_material(t,image,True) for t in types}
    edit=collection(title)
    parts=source(False)
    coarse=source(True)
    if key=='portal':
        parts.append(english(False))
        coarse.append(english(True))
    objects=[p.mesh(edit,mats) for p in parts]
    far=collection('Distant silhouette')
    for p in coarse:p.mesh(far,mats)
    far.hide_viewport=True;far.hide_render=True
    write_proxy(coarse,HERE/(key+'-proxy.js'))
    eye=(1.20,-18.2,1.65) if key=='portal' else (5,-48,1.65)
    look=(.50,0,4.25) if key=='portal' else (0,0,22)
    cam=bpy.data.objects.new('Public street camera',bpy.data.cameras.new('Street view'))
    scene.collection.objects.link(cam);cam.location=eye;cam.rotation_euler=(Vector(look)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.lens=27 if key=='portal' else 31;scene.camera=cam
    sun=bpy.data.objects.new('Street daylight',bpy.data.lights.new('Street daylight','SUN'))
    sun.data.energy=3.0;sun.rotation_euler=(math.radians(33),math.radians(-27),math.radians(-28));scene.collection.objects.link(sun)
    scene.view_settings.view_transform='Standard'
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/(key+'.blend')),compress=True)
    # Export one material/draw per finish. Preserve the take-apart native file.
    runtime={t:make_material(t,image,False) for t in types}
    for finish in types:
        subset=[o for p,o in zip(parts,objects) if p.finish==finish]
        if not subset:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in subset:o.data.materials[0]=runtime[finish];o.select_set(True)
        bpy.context.view_layer.objects.active=subset[0]
        if len(subset)>1:bpy.ops.object.join()
        subset[0].name=key+'_'+finish
    bpy.ops.object.select_all(action='DESELECT')
    for o in edit.objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(HERE/(key+'.glb')),export_format='GLB',use_selection=True,export_texcoords=True,
                              export_materials='EXPORT',export_vertex_color='ACTIVE',export_image_format='WEBP',export_image_quality=87,
                              export_cameras=False,export_lights=False,export_yup=True,export_animations=False,export_normals=True)

with TemporaryDirectory(prefix='gb-entrance-') as tmp:
    texture=Path(tmp)/'surface.png';make_image(texture)
    create('portal','정문 · 경사 기둥과 영문 채널 문자',silhouette,texture)
    create('tower','정면 명판탑 · 입체 글자와 적갈색 외벽',facade,texture)
