from pathlib import Path
import runpy
import bpy

here = Path(__file__).resolve().parent
bake = runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection']
bake(bpy.data.collections['HouseEntryGallery'], 'Surface', here/'vestibule.glb', simplification=(.76,.0008), preserve_smoothing=True)
bake(bpy.data.collections['HouseEntryRampBay'], 'Surface', here/'bay.glb', simplification=(.85,.0005), preserve_smoothing=True)
