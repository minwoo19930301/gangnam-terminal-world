"""Export the editable shopping plaza fixtures."""
from pathlib import Path
import bpy
import sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
for label,key in [('흰 곡면 화단 벤치','Seat'),('수경 화단의 바위와 늘어진 잎','Planting'),
                  ('휴게광장 접이식 유아차','Stroller')]:
    # The overlapping leaves can tolerate a larger error than the machined bench and stroller.
    reduction=(.50,.0028) if key=='Planting' else None
    bake_collection(bpy.data.collections['고투몰 · '+label],'GoToPlaza'+key,
                    here/(key.lower()+'.glb'),simplification=reduction,preserve_smoothing=key=='Planting')
