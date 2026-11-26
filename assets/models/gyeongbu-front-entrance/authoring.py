"""Native editing collections, shared daylight materials and material-batched glTF for the public frontage."""
import math
import bpy
from mathutils import Vector
from geometry import write_proxy

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

def create(key,title,source,texture,directory,palette,eye,look,lens):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version=0
    scene=bpy.context.scene;scene.unit_settings.system='METRIC'
    scene['site']='Seoul Express Bus Terminal, public Sinbanpo-ro frontage'
    scene['references']='Naver street view mEuEgCESVhlx5M-gkmmdWQ (Jan 2026), Film Korea Gyeongbu location photos 11458 and 11459'
    scene['registration']='Registered to the existing public doorway. Materials, profiles and dimensions are interpreted from public photographs.'
    image=bpy.data.images.load(str(texture));image.name='Public front · original material atlas';image.pack();image.filepath='//surface.png'
    types=['Stone','Metal','Glass','Lamps']
    mats={t:make_material(t,image,True) for t in types}
    edit=collection(title)
    parts=source(False)
    coarse=source(True)
    objects=[p.mesh(edit,mats) for p in parts]
    far=collection('Distant silhouette')
    for p in coarse:p.mesh(far,mats)
    far.hide_viewport=True;far.hide_render=True
    write_proxy(coarse,directory/(key+'-proxy.js'),palette)
    cam=bpy.data.objects.new('Public street camera',bpy.data.cameras.new('Street view'))
    scene.collection.objects.link(cam);cam.location=eye;cam.rotation_euler=(Vector(look)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.lens=lens;scene.camera=cam
    sun=bpy.data.objects.new('Street daylight',bpy.data.lights.new('Street daylight','SUN'))
    sun.data.energy=3.0;sun.rotation_euler=(math.radians(33),math.radians(-27),math.radians(-28));scene.collection.objects.link(sun)
    scene.view_settings.view_transform='Standard'
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(directory/(key+'.blend')),compress=True)
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
    bpy.ops.export_scene.gltf(filepath=str(directory/(key+'.glb')),export_format='GLB',use_selection=True,export_texcoords=True,
                              export_materials='EXPORT',export_vertex_color='ACTIVE',export_image_format='WEBP',export_image_quality=87,
                              export_cameras=False,export_lights=False,export_yup=True,export_animations=False,export_normals=True)
