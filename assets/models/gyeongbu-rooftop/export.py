"""Export the restaurant furniture separately from a single close-view tabletop."""
import sys
from pathlib import Path
import bpy
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

for collection,name,file in [('포석정 · 옥상 점포와 좌석','PoseokjeongTerrace','terrace.glb'),
                             ('포석정 · 불판과 상차림','PoseokjeongMeal','tabletop.glb'),
                             ('포석정 · 공용 4인 식탁과 의자','PoseokjeongTables','dining-set.glb'),
                             ('청색 옥상 대형 간판','TerminalRoofLetters','sign.glb')]:
    bake_collection(bpy.data.collections[collection],name,here/file)
