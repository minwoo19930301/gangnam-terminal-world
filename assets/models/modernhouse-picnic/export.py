"""Export the edited native rack using its existing collection and materials."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

rack=bpy.data.collections['모던하우스 · 딸기와 데이지 러그']
bake_collection(rack,'PicnicRugs',here/'rugs.glb',simplification=(.9,.0008),preserve_smoothing=True)
