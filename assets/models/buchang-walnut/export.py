"""Export the edited shop parts, one material, their UVs and the packed finish image."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy

here=Path(__file__).resolve().parent
collection=bpy.data.collections['BuchangWalnutCounter']
image=bpy.data.images['부창제과 · 포장과 판매대 마감']
sources=sorted(collection.all_objects,key=lambda ob:ob.name)
bpy.ops.object.select_all(action='DESELECT')
for source in sources:
    if source.type!='MESH':continue
    copy=source.copy();copy.data=source.data.copy();bpy.context.scene.collection.objects.link(copy)
    copy.select_set(True)
# Join under a mesh at the local origin; the GLB can then use the same
# world transform as the editable Blender collection.
anchor=bpy.data.objects.new('Walnut counter',bpy.data.meshes.new('Combined surfaces'))
bpy.context.scene.collection.objects.link(anchor);anchor.select_set(True)
bpy.context.view_layer.objects.active=anchor;bpy.ops.object.join()
anchor.name='Surface'
for layer in list(anchor.data.uv_layers):
    if layer.name!='Shop finish':anchor.data.uv_layers.remove(layer)
material=bpy.data.materials.new('부창제과 · 게임 마감');material.use_nodes=True
tree=material.node_tree;bsdf=tree.nodes.get('Principled BSDF');texture=tree.nodes.new('ShaderNodeTexImage')
texture.image=image;tree.links.new(texture.outputs['Color'],bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value=.40
anchor.data.materials.clear();anchor.data.materials.append(material)
for face in anchor.data.polygons:face.material_index=0
anchor.data.color_attributes.active_color=anchor.data.color_attributes['Finish']
scripts=here.parents[2]/'tools'
with TemporaryDirectory() as tmp:
    path=Path(tmp)/'counter.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),use_selection=True,export_animations=False,export_materials='EXPORT',
        export_vertex_color='NAME',export_vertex_color_name='Finish',export_all_vertex_colors=False,export_texcoords=True,
        export_image_format='JPEG',export_jpeg_quality=86,export_image_quality=86)
    subprocess.run(['node',str(scripts/'pack_display.mjs'),str(path),'.66','.00050'],check=True)
    subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(path),str(here/'counter.glb')],check=True)
