"""Fit the two existing pedestrian pictograms and hoods to the yellow two-module case."""
from pathlib import Path
from math import pi
from mathutils import Matrix
import runpy
import sys
import bpy

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='신반포로 · 보행 신호기'
scene.unit_settings.system='METRIC'
housing='고터사거리 · 세 칸 보행등과 차광판'
optics='고터사거리 · 보행 그림의 점광원과 숫자면'
with bpy.data.libraries.load(str(here.parent/'goter-crossing/signals.blend')) as (_,load):
    load.collections=[housing,optics]
group=bpy.data.collections.new('SinbanpoPedestrianHead')
scene.collection.children.link(group)
m.group=group
m.palette={k:m.material(k,v,.10) for k,v in
           [('황색 강판','d39d3e'),('도장 기둥','494b46'),('회색 금속','848781'),('검은 이음','2a2c2a')]}
for category,source in [('head',housing),('lens',optics)]:
    collection=bpy.data.collections[source]
    for src in collection.objects:
        use=src.name.startswith(('보행등 2단','보행등 3단','힌지 나사')) if category=='head' else src.name.startswith(('서 있는 사람','걷는 사람'))
        if not use:
            continue
        obj=src.copy()
        obj.data=src.data.copy()
        # This collection faces along local +Z in Three; the donor faces -Z.
        obj.data.transform(Matrix.Rotation(pi,4,'Z'))
        group.objects.link(obj)
        obj.location.y-=.215+(.119 if category=='lens' else 0)
        obj.location.z+=1.85+(.055 if category=='lens' else 0)
        if '뒷덮개' in obj.name:
            obj.data.materials.clear()
            obj.data.materials.append(m.palette['황색 강판'])
for label,z in [('하단',2.27),('상단',2.72)]:
    m.block(label+' 등기구 고정 쇠',0,.09,z,.083,.17,.05,'회색 금속',.006)
    m.profile(label+' 고정 띠',0,0,z-.02,[(.064,0),(.065,.045)],'검은 이음',16)
m.profile('받침과 강관',0,0,0,[(.096,0),(.096,.055),(.075,.10),(.062,.22),(.058,2.88),(.051,2.91)],'도장 기둥',20)
# Drop the unselected comparison collections and the separate countdown.
for name in [housing,optics]:
    bpy.data.collections.remove(bpy.data.collections[name])
bpy.data.orphans_purge(do_recursive=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'signal.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
