"""Export the editable pavilion frame and the shared sliding door leaf."""

from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
from blender_display_export import bake_collection

args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
target = Path(args[0]) if args else here
target.mkdir(exist_ok=True, parents=True)
for name, filename in [
    ("Exit4LiftPavilion", "pavilion.glb"),
    ("Exit4LiftLeaf", "leaf.glb"),
]:
    bake_collection(bpy.data.collections[name], name, target / filename)
