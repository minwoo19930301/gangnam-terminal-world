from pathlib import Path
import runpy
import bpy

here=Path(__file__).resolve().parent
bake=runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection']
for name,slug in [('JewelryShadowbox','showcase'),('RetailPortrait','screen'),('SquareDownlightPair','lights')]:
    bake(bpy.data.collections[name],name,here/(slug+'.glb'),simplification=(.88,.00015))
