"""Export the artist's current IQBOX meshes as one UV-mapped retail draw."""
import bpy
from pathlib import Path
import sys
OUT=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(OUT))
import print_surfaces as surface
collection=bpy.data.collections['SSG_10F_IQBOX']
objects=list(collection.objects)
runtime=bpy.data.materials.new('IQBOX goods, wood and paint');runtime.use_nodes=True
surface.mapped(runtime,[bpy.data.images['IQBOX print'],bpy.data.images['IQBOX response']],True)
bpy.ops.object.select_all(action='DESELECT')
for obj in objects:
    data=obj.data
    attr=data.color_attributes.new(name='Paint',type='BYTE_COLOR',domain='CORNER')
    ink=obj.get('printArea')
    if not ink:
        layer=data.uv_layers.active or data.uv_layers.new(name='ToyPrint');layer.name='ToyPrint'
    for face in data.polygons:
        mat=data.materials[face.material_index]
        rgba=(1,1,1,1) if ink else mat.diffuse_color[:]
        kind=mat.get('surfaceKind','matte')
        for loop in face.loop_indices:
            attr.data[loop].color=rgba
            if not ink:layer.data[loop].uv=surface.blank(kind)
    data.materials.clear();data.materials.append(runtime);obj.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join();bpy.context.object.name='IQBoxGangnamBrioWorkshop'
bpy.ops.export_scene.gltf(filepath=str(OUT/'workshop.glb'),export_format='GLB',export_animations=False)
