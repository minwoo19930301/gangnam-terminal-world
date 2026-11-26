"""Re-export edits made in the native ceiling collection."""
from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / 'tools'))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections['본관 에스컬레이터 · 천장 프레임'], 'FramedAtriumCeiling', here / 'ceiling.glb', color_attribute='Ceiling lens')
