"""Bake the west granite seats, fittings, glazing and inlays independently."""
from pathlib import Path
import bpy
import sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
for title,key in [('두 줄 석재의 곡선 벤치','Seat'),('기둥 금속틀과 식재','Column'),
                  ('기둥의 곡면 유리','Glass'),('바닥의 밝은 석재 상감','Inlay')]:
    bake_collection(bpy.data.collections['고투몰 서편 · '+title],'GoToWest'+key,here/(key.lower()+'.glb'),
                    preserve_smoothing=key=='Column')
