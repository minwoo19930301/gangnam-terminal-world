"""Export the public shop fixtures and close relief separately."""
from pathlib import Path
import sys
import bpy
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
bake_collection(bpy.data.collections['한가람 반포 · 액자 코너'],'HangaramFraming',here/'frame-room.glb')
bake_collection(bpy.data.collections['근접 · 몰딩 새김과 그림'],'HangaramInlay',here/'frame-inlay.glb')
