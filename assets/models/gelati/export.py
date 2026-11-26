"""Export individual visitor-facing parts and the real protective glass from the native file."""
from pathlib import Path
from mathutils import Vector,Matrix
import bpy,json,sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
parts={'shell':'검은 액자와 원형 펜던트','stock':'목제 유리장 속 겹친 와플콘','bar':'돌상판과 황동 난간 주문대',
       'wells':'스테인리스 뚜껑과 맛 이름표','menu':'황동 고정 메뉴와 스무 맛','brand':'청록 상호와 두 색 콘 심벌',
       'back':'에스프레소 머신과 뒤 작업대','packs':'포장 컵·보냉 상자와 계산대','lights':'유백 구형 펜던트의 빛','serve':'두 맛 컵과 와플콘·젤라또라떼'}
def export_stock(c):
    # Artists can move, rotate and scale individual linked stacks. When the stock is edited
    # into nonidentical shapes or custom components, publish the whole editable collection.
    units={}
    for ob in c.all_objects:
        group=units.setdefault(ob.get('stock_unit'),{})
        kind=ob.get('stock_part')
        if kind in group:return []
        group[kind]=ob
    if None in units or not units:return []
    units=[ob for _,ob in sorted(units.items())];first=units[0]
    if set(first)!={'cones','waffle'}:return []
    def sig(o):return (o.data,tuple(m.material for m in o.material_slots))
    for unit in units:
        if set(unit)!=set(first) or any(sig(unit[k])!=sig(first[k]) or len(unit[k].modifiers) for k in first):return []
        if any(abs(a-b)>1e-6 for va,vb in zip(unit['cones'].matrix_world,unit['waffle'].matrix_world) for a,b in zip(va,vb)):return []
    temp=bpy.data.collections.new('콘 원형 임시 웹 출력');bpy.context.scene.collection.children.link(temp);copies=[]
    try:
        for kind,ob in first.items():
            item=ob.copy();item.matrix_world=Matrix.Identity(4);temp.objects.link(item);copies.append(item)
            if kind=='cones':
                mod=item.modifiers.new('서가에서 보이는 콘의 굴곡','DECIMATE');mod.ratio=.27
        bpy.context.view_layer.update()
        bake_collection(temp,'Gelati_stock_unit',here/'stock.glb',preserve_smoothing=True)
    finally:
        for ob in copies:bpy.data.objects.remove(ob,do_unlink=True)
        bpy.data.collections.remove(temp)
    frame=Matrix(((1,0,0,0),(0,0,1,0),(0,-1,0,0),(0,0,0,1)))
    inv=frame.inverted();offset=Matrix.Translation(-Vector(c['preview_origin']))
    poses=[]
    for unit in units:
        mat=frame@offset@unit['cones'].matrix_world@inv
        if all(abs(mat[i][j]-float(i==j))<1e-6 for i in range(3) for j in range(3)):
            poses.append([round(v,6) for v in mat.translation])
        else:poses.append([round(mat[i][j],7) for j in range(4) for i in range(4)])
    return poses

for key,name in parts.items():
    c=bpy.data.collections['젤라띠 · '+name]
    if key=='stock':
        poses=export_stock(c)
        (here/'stock-layout.js').write_text('// Native shop cabinet placements, in metres.\nexport const poses='+json.dumps(poses,separators=(',',':'))+';\n')
        if poses:continue
    mods=[]
    for ob in c.all_objects:
        if key in ['back','packs'] and any(k in ob.name for k in ['격자','컵의 흰 입술','줄무늬 아이스크림 컵','금속 콘 거치대']):
            mod=ob.modifiers.new('작은 기물 웹 정리','DECIMATE');mod.ratio=.36;mods.append((ob,mod))
        if key=='wells' and any(k in ob.name for k in ['금속 손잡이','덮개 손잡이 밑동']):
            mod=ob.modifiers.new('손잡이 웹 정리','DECIMATE');mod.ratio=.47;mods.append((ob,mod))
    try:
        bpy.context.view_layer.update()
        config={'stock':(.38,.0025),'shell':(.46,.003),'bar':(.53,.0018),'back':(.45,.0025),'packs':(.55,.0016),'serve':(.64,.00058),'wells':(.47,.0013)}
        bake_collection(c,'Gelati_'+key,here/(key+'.glb'),simplification=config.get(key),preserve_smoothing=True,color_attribute='reflections' if key=='wells' else None)
    finally:
        for ob,mod in mods:ob.modifiers.remove(mod)
c=bpy.data.collections['젤라띠 · 주문대 보호유리'];origin=Vector(c['preview_origin']);verts=[];indices=[]
for ob in c.all_objects:
    mesh=ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).data;mesh.calc_loop_triangles();n=len(verts)//3
    for pt in mesh.vertices:
        q=ob.matrix_world@pt.co-origin;verts.extend(round(a,6) for a in (q.x,q.z,-q.y))
    for tri in mesh.loop_triangles:indices.extend(n+i for i in tri.vertices)
(here/'glass.js').write_text('// Native shop counter glazing in metres.\nexport const glass='+json.dumps({'vertices':verts,'indices':indices},separators=(',',':'))+';\n')
