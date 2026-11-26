from pathlib import Path
import runpy
import bpy
here=Path(__file__).resolve().parent
runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection'](
    bpy.data.collections['CamelCoffeeRotaryFront'],'Surface',here/'front.glb')
