"""Bake the editable shop and product lettering to a single web draw."""
from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections['FortnumSweetPark'], 'TeaShop', here/'tea-shop.glb',
                simplification=(.65,.0003))
