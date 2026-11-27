"""Rebuild the runtime model from the edited A-008 Blender collection."""
from pathlib import Path
import sys
import bpy
directory=Path(bpy.data.filepath).resolve().parent
sys.path.insert(0,str(directory.parents[2]/'tools'))
from blender_display_export import bake_collection
bake_collection(bpy.data.collections['AnytimeApparel'],'apparel',directory/'anytime.glb',(.37,.0028))
