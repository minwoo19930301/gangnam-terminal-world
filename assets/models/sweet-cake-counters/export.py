from pathlib import Path
import runpy
import bpy
here=Path(__file__).resolve().parent
export=runpy.run_path(str(here.parents[2]/'tools/blender_display_export.py'))['bake_collection']
for key,name in [('kitchen205','SweetKitchen205'),('shoto','SweetShoto')]:
    export(bpy.data.collections[name],name,here/(key+'.glb'),preserve_smoothing=True)
