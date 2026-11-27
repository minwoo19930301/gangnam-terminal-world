"""Export edited checkout meshes as a single vertex-coloured draw."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections['DaisoPackingCheckout'],'DaisoPackingCheckout',here/'counter.glb')
