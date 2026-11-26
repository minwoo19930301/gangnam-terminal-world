"""Pack an editable public market display and export one material / one runtime draw."""
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from mathutils import Vector
from geometry import write_proxy
from authoring import collection


def atlas_material(name, images, editor):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    link = material.node_tree.links.new

    def image(key, position):
        node = nodes.new('ShaderNodeTexImage')
        node.image = images[key]
        node.location = position
        return node.outputs['Color']

    source = image('surface', (-760, 180))
    orm = image('metal-rough', (-760, -120))
    emit = image('lamp', (-760, -400))
    if editor:
        vc = nodes.new('ShaderNodeVertexColor')
        vc.layer_name = 'Finish tint'
        vc.location = (-760, 405)
        mix = nodes.new('ShaderNodeMixRGB')
        mix.blend_type = 'MULTIPLY'
        mix.inputs[0].default_value = 1
        mix.location = (-460, 220)
        link(source, mix.inputs[1])
        link(vc.outputs['Color'], mix.inputs[2])
        source = mix.outputs[0]
    channels = nodes.new('ShaderNodeSeparateColor')
    channels.location = (-470, -90)
    link(orm, channels.inputs['Color'])
    shader = nodes.new('ShaderNodeBsdfPrincipled')
    shader.location = (-120, 90)
    link(source, shader.inputs['Base Color'])
    link(channels.outputs['Green'], shader.inputs['Roughness'])
    link(channels.outputs['Blue'], shader.inputs['Metallic'])
    link(emit, shader.inputs['Emission Color'])
    shader.inputs['Emission Strength'].default_value = .95
    if 'weave-normal' in images:
        normal = nodes.new('ShaderNodeNormalMap')
        normal.inputs['Strength'].default_value = .55
        normal.location = (-465, -530)
        link(image('weave-normal', (-760, -650)), normal.inputs['Color'])
        link(normal.outputs[0], shader.inputs['Normal'])
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (220, 105)
    link(shader.outputs[0], output.inputs['Surface'])
    material.use_backface_culling = True
    return material


def save_display(directory, stem, edit_name, item_name, attributes, make_maps, palette, sections):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    for key,value in attributes.items(): scene[key] = value
    with TemporaryDirectory(prefix=stem+'-') as temporary:
        folder = Path(temporary)
        make_maps(folder)
        images = {}
        for image_file in sorted(folder.glob('*.png')):
            key = image_file.stem
            im = bpy.data.images.load(str(image_file))
            im.name = stem+' · '+key
            if key in ['metal-rough','weave-normal']: im.colorspace_settings.name = 'Non-Color'
            im.pack()
            im.filepath = '//'+image_file.name
            images[key] = im

    native = atlas_material('Editable woven cloth and shop finishes', images, True)
    edit = collection(edit_name)
    objects = [part.mesh(edit, {'Stone':native}) for part in sections()]
    distant = collection('Distant silhouette')
    low = sections(True)
    for part in low: part.mesh(distant, {'Stone':native})
    distant.hide_viewport = True
    distant.hide_render = True
    write_proxy(low,directory/'proxy.js',palette)

    camera = bpy.data.objects.new('Visitor at the aisle entrance', bpy.data.cameras.new('Visitor'))
    scene.collection.objects.link(camera)
    camera.location = (.09, 4.90, 1.63)
    camera.rotation_euler = (Vector((-.15,-.50,1.28))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens = 24
    scene.camera = camera
    for index,depth in enumerate([-2.74,0,2.73]):
        lamp = bpy.data.objects.new('Fluorescent '+str(index+1),bpy.data.lights.new('Ceiling warm white','AREA'))
        lamp.data.energy = 75
        lamp.data.shape = 'RECTANGLE'
        lamp.data.size = .57
        lamp.data.size_y = 1.25
        lamp.location = (0,-depth,2.84)
        scene.collection.objects.link(lamp)
    scene.view_settings.view_transform = 'Standard'
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_perspective = 'CAMERA'
            area.spaces.active.shading.type = 'MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(directory/(stem+'.blend')),compress=True)

    # COLOR_0 multiplies the glTF texture; the editor's shader exposes that mix explicitly.
    runtime = atlas_material('Runtime woven cloth and shop finishes',images,False)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.data.materials[0] = runtime
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    objects[0].name = item_name
    bpy.ops.export_scene.gltf(filepath=str(directory/(stem+'.glb')),export_format='GLB',use_selection=True,
        export_texcoords=True,export_materials='EXPORT',export_vertex_color='ACTIVE',export_image_format='WEBP',
        export_image_quality=91,export_cameras=False,export_lights=False,export_yup=True,export_animations=False)
