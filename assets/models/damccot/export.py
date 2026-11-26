"""Export the artist-edited FP204 cabinet, furniture and table service."""
from pathlib import Path
import sys
import bpy
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

for name,label,file in [
    ('담꽃 · 다기와 보자기 진열장','DamccotTeaCabinet','tea-cabinet'),
    ('담꽃 · 백색 주문대와 검은 의자','DamccotCounterAndSeating','furniture'),
    ('담꽃 · 밤대추팥빙수 한 상','DamccotBingsu','bingsu'),
]:
    bake_collection(bpy.data.collections[name],label,here/(file+'.glb'))
