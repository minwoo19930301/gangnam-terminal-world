"""Publish each reachable view from the edited restaurant."""
import bpy,json,sys,subprocess
from mathutils import Vector
from pathlib import Path
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
from blender_furnished_light import bake_furnished
names=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {names} from './layout.js';console.log(JSON.stringify(names));"],cwd=here))
bpy.context.window.scene=bpy.data.scenes['파미에 116호 · 천진포자']
glazing=[]
for key,name in names.items():
    if key in ('shell','communal'):continue
    col=bpy.data.collections['천진포자 · '+name]
    if key in ('glass','coolerGlass'):
        origin=Vector(col['preview_origin']);pts=[];indices=[]
        for obj in col.all_objects:
            obj.data.calc_loop_triangles();offset=len(pts)//3
            for pt in obj.data.vertices:
                v=obj.matrix_world@pt.co-origin;pts.extend(round(c,6) for c in (v.x,v.z,-v.y))
            for tri in obj.data.loop_triangles:indices.extend(offset+j for j in tri.vertices)
        glazing.append('export const '+key+'='+json.dumps({'vertices':pts,'indices':indices},separators=(',',':'))+';')
        continue
    colour='돌 표면' if key.startswith('keeper') else '요리의 표면' if key in ('buns','fried') else None
    error=.00065 if key in ('buns','fried','noodles','keeperL','keeperR') else .0012
    # The thin tubular strands are sub-pixel at full standing height. Keep their editable paths in the source.
    modifiers=[]
    try:
        if key=='noodles':
            for obj in col.all_objects:
                if obj.name.startswith(('구불거리는 볶음면과 숙주','위에 얹은 쪽파와 채소')):
                    mod=obj.modifiers.new('게임용 면발 단순화','DECIMATE');mod.ratio=.42
                    modifiers.append((obj,mod))
            bpy.context.view_layer.update()
        bake_collection(col,'Tianjin_'+key,here/(key+'.glb'),simplification=(.57,error),preserve_smoothing=True,color_attribute=colour)
    finally:
        for obj,mod in modifiers:obj.modifiers.remove(mod)
(here/'glass.js').write_text('// From the editable shop glazing.\n'+'\n'.join(glazing)+'\n')
room='116호 · 손님 홀과 조명'
clear=[obj for obj in bpy.data.scenes[room].objects if obj.get('skip_irradiance_bake')]
previous=[obj.hide_render for obj in clear]
try:
    for obj in clear:obj.hide_render=True
    bake_furnished(here,room,[(key,'천진포자 · '+names[key],size) for key,size in [('shell',768),('communal',512)]])
finally:
    for obj,hidden in zip(clear,previous):obj.hide_render=hidden
