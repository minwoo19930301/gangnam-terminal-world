"""Keep the packed colour atlas and merge the editable cabinet into one draw."""
import bpy
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

here=Path(__file__).resolve().parent
sources=bpy.data.collections['MarketLaneBeanCase'].objects
bpy.ops.object.select_all(action='DESELECT')
for source in sources:
    duplicate=source.copy()
    duplicate.data=source.data.copy()
    bpy.context.scene.collection.objects.link(duplicate)
    duplicate.select_set(True)
    bpy.context.view_layer.objects.active=duplicate
bpy.ops.object.join()
result=bpy.context.object
result.name='Coffee display'
result.data.name='Market Lane whole-bean cabinet'
tools=here.parents[2]/'tools'
with TemporaryDirectory() as tmp:
    path=Path(tmp)/'coffee.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),use_selection=True,export_materials='EXPORT',
        export_animations=False,export_texcoords=True,export_image_format='WEBP',export_image_quality=78,export_image_webp_fallback=False)
    subprocess.run(['node',str(tools/'pack_display.mjs'),str(path),'.58','.00085'],check=True)
    subprocess.run(['node',str(tools/'optimize_model.mjs'),str(path),str(here/'coffee.glb')],check=True)
