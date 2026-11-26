"""Export each sightline independently, including the glazing from the edited native collections."""
import bpy,json,sys
from mathutils import Vector
from pathlib import Path
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
for file,label in [('entry','체크 바닥과 검은 상호 외벽'),('gifts','물결 선반과 선물 상자'),('counter','둥근 주문대와 사선 견본장'),
                   ('chocolates','통초콜릿과 잘라 보인 단면'),('pops','개별 포장 롤리팝과 사탕'),('stand','둥근 전시대의 포장 선물')]:
    root=bpy.data.collections['씨즈캔디 · '+label]
    # Fractional-millimetre box bevels on small packages have subpixel width in the aisle.
    # The saved native models keep the full working bevels, foil folds and package lettering.
    bevels=[];modifiers=[]
    for obj in root.all_objects:
        if file=='stand' and any(key in obj.name for key in ['초콜릿 알','투명 봉지의 능선','두 선반 사이','원통 장 하부']):
            mod=obj.modifiers.new('화면용 작은 포장 단순화','DECIMATE');mod.ratio=.46;modifiers.append((obj,mod))
        if file=='pops' and any(key in obj.name for key in ['롤리팝 막대','포장지 끝','은박·호일 개별 포장']):
            mod=obj.modifiers.new('화면용 포장 주름 단순화','DECIMATE');mod.ratio=.54;modifiers.append((obj,mod))
        for mod in obj.modifiers:
            if mod.type=='BEVEL' and mod.width<.011 and mod.segments>1:
                bevels.append((mod,mod.segments));mod.segments=1
    try:
        bpy.context.view_layer.update()
        detail={'stand':(.36,.003),'gifts':(.42,.0025),'chocolates':(.51,.0016),'pops':(.48,.002)}
        bake_collection(root,'Sees_'+file,here/(file+'.glb'),preserve_smoothing=True,simplification=detail.get(file))
    finally:
        for obj,mod in modifiers:obj.modifiers.remove(mod)
        for mod,n in bevels:mod.segments=n
glazing={}
for key,label in [('windows','둥근 정면 쇼윈도 유리'),('case','견본장의 사선 보호유리')]:
    coll=bpy.data.collections['씨즈캔디 · '+label];offset=Vector(coll['preview_origin']);coords=[];indices=[]
    for obj in sorted(coll.all_objects,key=lambda o:o.name):
        mesh=obj.evaluated_get(bpy.context.evaluated_depsgraph_get()).data
        mesh.calc_loop_triangles();n=len(coords)//3
        for vertex in mesh.vertices:
            v=obj.matrix_world @ vertex.co-offset
            coords.extend(round(val,6) for val in (v.x,v.z,-v.y))
        for tri in mesh.loop_triangles:indices.extend(n+i for i in tri.vertices)
    glazing[key]={'positions':coords,'indices':indices}
(here/'glass.js').write_text('// Exported from the FP-104 Blender window and case glass.\nexport const glazing='+
        json.dumps(glazing,separators=(',',':'))+';\n')
