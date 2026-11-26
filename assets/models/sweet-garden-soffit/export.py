from pathlib import Path
import runpy
import bpy
here=Path(__file__).resolve().parent
runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection'](
    bpy.data.collections['SweetGardenBankSoffit'],'Surface',here/'soffit.glb',simplification=(.58,.0015),preserve_smoothing=True)
