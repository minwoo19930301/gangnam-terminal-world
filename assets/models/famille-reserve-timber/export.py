"""Export the editable native group with one packed finish and one draw surface."""
from pathlib import Path
import subprocess
import tempfile
import bpy

folder=Path(bpy.data.filepath).parent
collection=bpy.data.collections['파미에파크R · 목재 기둥과 구형 조명']
bpy.ops.object.select_all(action='DESELECT')
for source in collection.all_objects:
    duplicate=source.copy();duplicate.data=source.data.copy()
    bpy.context.scene.collection.objects.link(duplicate);duplicate.select_set(True)
anchor=bpy.data.objects.new('Surface',bpy.data.meshes.new('Reserve cafe'))
bpy.context.scene.collection.objects.link(anchor);anchor.select_set(True)
bpy.context.view_layer.objects.active=anchor;bpy.ops.object.join()
# glTF multiplies vertex colour by the material's texture automatically.
material=anchor.data.materials[0].copy();nodes=material.node_tree.nodes;links=material.node_tree.links
texture=next(n for n in nodes if n.type=='TEX_IMAGE');bsdf=nodes.get('Principled BSDF')
links.new(texture.outputs['Color'],bsdf.inputs['Base Color'])
anchor.data.materials.clear();anchor.data.materials.append(material)
for p in anchor.data.polygons:p.material_index=0
anchor.data.color_attributes.active_color=anchor.data.color_attributes['Finish']
scripts=folder.parents[2]/'tools'
with tempfile.TemporaryDirectory() as tmp:
    output=Path(tmp)/'cafe.glb'
    bpy.ops.export_scene.gltf(filepath=str(output),use_selection=True,export_animations=False,
        export_materials='EXPORT',export_vertex_color='NAME',export_vertex_color_name='Finish',
        export_all_vertex_colors=False,export_texcoords=True,export_image_format='WEBP',export_image_quality=83)
    subprocess.run(['node',str(scripts/'pack_display.mjs'),str(output),'.7','.0004'],check=True)
    subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(output),str(folder/'coffee-trees.glb')],check=True)
