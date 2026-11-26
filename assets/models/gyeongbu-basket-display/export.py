"""Export current edited source, combining all basket objects into a single draw."""
from pathlib import Path
import subprocess,tempfile
import bpy

here=Path(__file__).resolve().parent
parts=[o for o in bpy.data.collections['FlowerMarketWicker'].objects if o.type=='MESH']
for ob in parts:ob.select_set(True)
bpy.context.view_layer.objects.active=parts[0]
bpy.ops.object.join()
bpy.context.active_object.name='FlowerMarketWicker'
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'baskets.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_vertex_color='ACTIVE',export_materials='NONE')
    subprocess.run(['node',str(here.parent/'gyeongbu-flower-bank/pack.mjs'),str(raw),str(here/'baskets.glb')],check=True)
