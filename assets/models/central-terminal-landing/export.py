"""Export the edited sill, folded jambs and stone apron in a single draw."""
from pathlib import Path
import sys

import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections["CentralTerminalB1Landing"], "CentralTerminalB1Landing", here / "landing.glb")
