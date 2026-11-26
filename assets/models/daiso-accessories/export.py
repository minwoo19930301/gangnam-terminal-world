"""Bake the two edited aisle ends independently so the other section stays unloaded."""
from pathlib import Path
import sys
import bpy
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

for name,file,mesh in [('머리띠와 집게핀·헤어롤 진열','hair','DaisoHairStand'),('손잡이 청소솔과 틈새 브러시 진열','brushes','DaisoBrushStand')]:
    bake_collection(bpy.data.collections['다이소 · '+name],mesh,here/(file+'.glb'),
                    preserve_smoothing=True,simplification=(.63,.0009))
