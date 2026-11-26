"""Re-export the two artist-editable collections without rebuilding the source."""
from pathlib import Path
import sys
import bpy
here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
from blender_display_export import bake_collection

for group,label,file in [
    ('고터·세빛 라운지 · 계단식 휴게 좌석','SebitTerrace','terrace'),
    ('고터·세빛 라운지 · 꽃이삭 화분','SebitPlumePlanter','plumes'),
    ('고터·세빛 라운지 · 벽면 투사와 조명 레일','SebitWallProjection','projection'),
]:
    bake_collection(bpy.data.collections[group],label,here/(file+'.glb'))
