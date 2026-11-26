"""Small, individually streamed public dining fixtures and two furnished Cycles light atlases."""
from pathlib import Path
import bpy,json,subprocess,sys
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
from blender_furnished_light import bake_furnished
parts=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts} from './layout.js';console.log(JSON.stringify(parts))"],cwd=here))
bpy.context.window.scene=bpy.data.scenes['마당 G-010 · 편집 집기']
# The native scene retains two-segment brick bevels and individually modeled grains and seeds.
# A millimetre of cavity detail is already below a pixel at the public dining aisle.
bevels=[];decimates=[]
try:
    for ob in bpy.data.collections[parts['room'][0]].all_objects:
        if ob.name.startswith('거친 하부 흰 벽돌'):
            for mod in ob.modifiers:
                if mod.type=='BEVEL':bevels.append((mod,mod.segments));mod.segments=1
    for key,(name,*_) in parts.items():
        if key in ('room','kitchen'):continue
        src=bpy.data.collections[name]
        for ob in src.all_objects:
            ratio=(.26 if ob.name.startswith(('낱알이 드러난 밥','작은 깨알')) else
                   .53 if ob.name.startswith(('채소·나물의 가는 채','오목하게 눌러 만든 숟가락 볼','포개 놓은 무광 스테인리스 물컵')) else 1)
            if ratio<1:
                mod=ob.modifiers.new('게임용 곡면 축약','DECIMATE');mod.ratio=ratio;decimates.append((ob,mod))
        bpy.context.view_layer.update()
        bake_collection(src,'G010_'+key,here/(key+'.glb'),simplification=(.44,.0013 if key in ('bibimbap','tools','plates') else .0011),preserve_smoothing=True)
    bake_furnished(here,'G-010 마당 · 식당과 배식대',[(key,parts[key][0],res) for key,res in [('room',640),('kitchen',384)]])
finally:
    for ob,mod in decimates:ob.modifiers.remove(mod)
    for mod,segments in bevels:mod.segments=segments
