"""Export the five independently visible or reusable FP212 fixtures."""
from pathlib import Path
import sys
import bpy
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
# The wall's baked lighting needs continuous vertex interpolation on a planar surface.
# Island appliances and small baked goods can use a larger error tolerance.
budgets={'arches':(1,.00065),'bar':(.48,.0016),'pastry':(.46,.0015),'latte':(.47,.0013),'seats':(.52,.0012)}
for label,file in [('갈색 아치와 청색 커피 벽','arches'),('흰 곡면 커피바와 추출 장비','bar'),
                   ('각진 스툴과 창가 금속 벤치','seats'),('버터바와 약과 쿠키 진열장','pastry'),
                   ('버터크림라떼와 바통 휘낭시에','latte')]:
    bake_collection(bpy.data.collections['하프커피 · '+label],'Halff'+file.capitalize(),here/(file+'.glb'),
                    simplification=budgets[file],
                    preserve_smoothing=True,color_attribute='ShopLight')
