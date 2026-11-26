"""Regenerate four independently streamed, single-material meshes from the editable FP216 source."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

for name,label,file in [
    ('제과 진열대 · 목재와 상품','KervanShowcase','showcase'),
    ('제과 진열대 · 투명 덮개','KervanGlass','covers'),
    ('케르반 · 청록색 주방창','KervanKitchenWindow','kitchen-window'),
    ('케르반 · 모자이크 등','KervanMosaicLantern','lantern'),
    ('케르반 · 라바시와 차 한 상','KervanTeaTable','tea-table'),
]:
    bake_collection(bpy.data.collections[name],label,here/(file+'.glb'))
