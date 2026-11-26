from pathlib import Path
import sys
import bpy
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
bake_collection(bpy.data.collections['8-1 · 금속과 실내 마감'],'GotoExit81Opaque',here/'lift.glb')
