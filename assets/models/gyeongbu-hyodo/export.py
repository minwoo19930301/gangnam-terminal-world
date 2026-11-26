from pathlib import Path
import runpy
import bpy
root=Path(__file__).resolve().parent
runpy.run_path(str(root.parents[2]/'tools/blender_display_export.py'))['bake_collection'](
    bpy.data.collections['GB_HyodoDiningFront'],'Surface',root/'shop.glb',simplification=(.78,.00032))
