from pathlib import Path
import sys, bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
from blender_display_export import bake_collection

bake_collection(
    bpy.data.collections["BAKE furniture"],
    "GangnamBakeCounter",
    here / "counter.glb",
    additional=[(bpy.data.collections["BAKE glazing"], "Glass")],
    preserve_smoothing=True,
    color_attribute="Baking",
)
