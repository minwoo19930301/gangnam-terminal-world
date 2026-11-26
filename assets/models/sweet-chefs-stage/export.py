"""Export the edited customer island signs from counter.blend."""
from pathlib import Path
import sys
import bpy
out=Path(__file__).resolve().parent
sys.path.insert(0,str(out.parents[2]/'tools'))
from blender_display_export import bake_collection
bake_collection(bpy.data.collections['SweetPark_ChefsStage'],'SweetParkChefsStage',out/'counter.glb', simplification=(.65,.001))
