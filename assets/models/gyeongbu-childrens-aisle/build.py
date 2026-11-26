"""Author, save and export the sixth-floor public children's aisle in background Blender."""
import math
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from mathutils import Vector

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent;sys.path[:0]=[str(HERE),str(HERE.parent/'gyeongbu-front-entrance')]
from geometry import write_proxy
from authoring import collection
from atlas import maps,PALETTE
from aisle import sections

def material(images,editor):
    mat=bpy.data.materials.new('Cloth, glazed tiles, metal and fluorescent lenses');mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear();link=mat.node_tree.links.new
    def image(key,xy):
        node=nodes.new('ShaderNodeTexImage');node.image=images[key];node.location=xy;return node.outputs['Color']
    source=image('surface',(-760,180));orm=image('metal-rough',(-760,-120));emit=image('lamp',(-760,-400))
    if editor:
        vc=nodes.new('ShaderNodeVertexColor');vc.layer_name='Finish tint';vc.location=(-760,405)
        mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.location=(-460,220)
        link(source,mix.inputs[1]);link(vc.outputs['Color'],mix.inputs[2]);source=mix.outputs[0]
    channels=nodes.new('ShaderNodeSeparateColor');channels.location=(-470,-90);link(orm,channels.inputs['Color'])
    shader=nodes.new('ShaderNodeBsdfPrincipled');shader.location=(-120,90)
    link(source,shader.inputs['Base Color']);link(channels.outputs['Green'],shader.inputs['Roughness']);link(channels.outputs['Blue'],shader.inputs['Metallic'])
    link(emit,shader.inputs['Emission Color']);shader.inputs['Emission Strength'].default_value=.95
    out=nodes.new('ShaderNodeOutputMaterial');out.location=(220,105);link(shader.outputs[0],out.inputs['Surface'])
    mat.use_backface_culling=True;return mat

def load_maps(folder):
    result={}
    for key in ['surface','metal-rough','lamp']:
        image=bpy.data.images.load(str(folder/(key+'.png')));image.name='6F original · '+key
        if key=='metal-rough':image.colorspace_settings.name='Non-Color'
        image.pack();image.filepath='//'+key+'.png';result[key]=image
    return result

def write_scene(folder):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version=0
    scene=bpy.context.scene;scene.unit_settings.system='METRIC'
    scene['subject']='Public Gyeongbu 6F children’s clothing aisle'
    scene['references']='Korea Tourism Organization 1920596 and 1920595, terminal floor06.jpg; scene survey photographs include a 2014 anniversary banner'
    scene['registration']='Interpreted display in existing bays beside the sample stall. Floor contact, older finish colours and merchandise quantities are game dimensions.'
    images=load_maps(folder);native=material(images,True)
    parts=sections();low=sections(True)
    edit=collection('6층 아동복 · 철망 행거와 접은 상품');objects=[p.mesh(edit,{'Stone':native}) for p in parts]
    proxy=collection('Distant silhouette')
    for p in low:p.mesh(proxy,{'Stone':native})
    proxy.hide_viewport=True;proxy.hide_render=True
    write_proxy(low,HERE/'proxy.js',PALETTE)
    cam=bpy.data.objects.new('Visitor at the aisle entrance',bpy.data.cameras.new('Visitor'))
    scene.collection.objects.link(cam);cam.location=(.09,4.90,1.63)
    cam.rotation_euler=(Vector((-.15,-.50,1.28))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=24;scene.camera=cam
    for i,d in enumerate([-2.74,0,2.73]):
        lamp=bpy.data.objects.new('Fluorescent '+str(i+1),bpy.data.lights.new('Ceiling warm white','AREA'))
        lamp.data.energy=75;lamp.data.shape='RECTANGLE';lamp.data.size=.57;lamp.data.size_y=1.25
        lamp.location=(0,-d,2.84);scene.collection.objects.link(lamp)
    scene.view_settings.view_transform='Standard'
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'childrens-aisle.blend'),compress=True)
    # glTF multiplies its base map by COLOR_0; the editable material has an explicit vertex-colour node.
    game=material(images,False)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.data.materials[0]=game;o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='ChildrensAisle'
    bpy.ops.export_scene.gltf(filepath=str(HERE/'childrens-aisle.glb'),export_format='GLB',use_selection=True,
      export_texcoords=True,export_materials='EXPORT',export_vertex_color='ACTIVE',export_image_format='WEBP',
      export_image_quality=91,export_cameras=False,export_lights=False,export_yup=True,export_animations=False)

with TemporaryDirectory(prefix='gb-children-gallery-') as temp:
    folder=Path(temp);maps(folder);write_scene(folder)
