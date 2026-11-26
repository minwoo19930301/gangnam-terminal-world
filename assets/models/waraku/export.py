"""Publish each public sightline independently, retaining the glass as three native panels."""
from pathlib import Path
from mathutils import Vector
import bpy
import json
import runpy
import sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
names={'entry':'목재 창살과 열린 현관','brand':'붓글씨 상호와 붉은 낙관','room':'회색 바닥과 짙은 타일 식사 공간',
       'lamps':'상부 간접 조명과 매입등','table':'맞은편 의자와 두 개별 인덕션','service':'냅킨·수저통·보온 물병',
       'pot':'쇠고기와 채소를 담은 스키야키 냄비','zaru':'대나무 발의 수타 우동과 별도 소고기','tempura':'새우 두 마리를 올린 에비텐 우동',
       'cabinet':'오른쪽 유리 견본장의 틀과 선반','samples':'쇼윈도의 미니어처 우동과 고기 견본','menu':'회랑 쪽의 메뉴 받침'}
bpy.context.window.scene=bpy.data.scenes['파미에 114호 · 와라쿠샤샤']
for key,label in names.items():
    if key in ('room','table'):continue
    c=bpy.data.collections['와라쿠 · '+label];mods=[]
    for ob in c.all_objects:
        if ob.name.startswith(('바삭한 튀김 부스러기','팽이 갓','가느다란 팽이','견본용 채소','국물에 보이는','접혀 포개진','유약 띠')):
            mod=ob.modifiers.new('근접 거리의 곡면','DECIMATE');mod.ratio=.53;mods.append((ob,mod))
    try:
        bpy.context.view_layer.update()
        error=.00060 if key in ('pot','zaru','tempura','samples','service') else .0014
        bake_collection(c,'Waraku_'+key,here/(key+'.glb'),simplification=(.55,error),preserve_smoothing=True)
    finally:
        for ob,mod in mods:ob.modifiers.remove(mod)
c=bpy.data.collections['와라쿠 · 현관 통창과 음식 견본장 유리']
origin=Vector(c['preview_origin']);points=[];indices=[]
for ob in c.all_objects:
    ob.data.calc_loop_triangles();start=len(points)//3
    for pt in ob.data.vertices:
        v=ob.matrix_world@pt.co-origin;points.extend(round(n,6) for n in (v.x,v.z,-v.y))
    for tri in ob.data.loop_triangles:indices.extend(start+k for k in tri.vertices)
(here/'glass.js').write_text('// Glass panels from the editable restaurant.\nexport const glass='+json.dumps({'vertices':points,'indices':indices},separators=(',',':'))+';\n')

runpy.run_path(str(here/'lighting.py'))['bake'](here,names)
