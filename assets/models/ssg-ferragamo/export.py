"""Export the Ferragamo menswear display."""
from pathlib import Path
import sys
import bpy
out=Path(__file__).resolve().parent
sys.path.insert(0,str(out.parents[2]/'tools'))
from blender_display_export import bake_collection
bake_collection(bpy.data.collections['FerragamoGangnamMens'],'FerragamoMensDisplay',out/'display.glb', simplification=(.72,.0004), preserve_smoothing=True)
