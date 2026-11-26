"""Export the edited FP203 collection, in metres and with its material colours."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections['빈브라더스 · FP203 커피바와 좌석'],'BeanBrothersFP203',here/'fp203.glb')
