from pathlib import Path
import runpy
import bpy
here=Path(__file__).resolve().parent
bake=runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection']
bake(bpy.data.collections['GangnamCoffeebar'],'Surface',here/'coffeebar.glb')
