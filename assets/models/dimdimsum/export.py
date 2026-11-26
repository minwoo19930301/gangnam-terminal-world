"""Bake five independently streamed DimDimSum native collections."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

for name,label,file in [
    ('대기 접수대와 유아의자','DimDimSumWaiting','welcome'),
    ('유리블록과 대나무 조명','DimDimSumDiningHall','dining'),
    ('목제 식탁과 곡목 의자','DimDimSumTable','table'),
    ('찜기 세 가지와 차','DimDimSumSteamerService','steamers'),
    ('피기 커스터드 번','DimDimSumPiggyBuns','piggy'),
]:
    bake_collection(bpy.data.collections['딤딤섬 · '+name],label,here/(file+'.glb'))
