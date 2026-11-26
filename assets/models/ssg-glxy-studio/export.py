from pathlib import Path
import runpy
import bpy
root=Path(__file__).resolve().parent
runpy.run_path(str(root.parents[2]/'tools/blender_display_export.py'))['bake_collection'](
    bpy.data.collections['SSG_7F_GLXY_Studio'],'GLXYStudio',root/'gallery.glb',
    simplification=(.76,.00038),preserve_smoothing=True,color_attribute='Studio colour')
