"""Export edited native collections as four meshes in a single compressed GLB."""
from pathlib import Path
import subprocess
import tempfile
import bpy

here = Path(__file__).resolve().parent
for name in ['GardenSteel','GardenGlass','GardenLight','GardenFloor']:
    parts=list(bpy.data.collections[name].objects)
    bpy.ops.object.select_all(action='DESELECT')
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    bpy.context.object.name=name
floor=bpy.data.objects['GardenFloor']
# glTF combines the baked linear vertex tint with the packed pile sample.
floor_mat=bpy.data.materials.new('Carpet area and stone');floor_mat.use_nodes=True
p=floor_mat.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.92
tex=floor_mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images['carpet.png']
floor_mat.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
floor.data.materials.clear();floor.data.materials.append(floor_mat)
with tempfile.TemporaryDirectory() as directory:
    raw=Path(directory)/'window.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),export_vertex_color='ACTIVE',export_materials='EXPORT')
    subprocess.run(['node',str(here.parent/'gyeongbu-flower-bank/pack.mjs'),
                    str(raw),str(here/'window.glb')],check=True)
