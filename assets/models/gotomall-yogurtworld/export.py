"""Export independently visible fixtures from the edited original."""
from pathlib import Path
from mathutils import Vector
import bpy,sys,subprocess,json
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
from blender_furnished_light import bake_furnished
names=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {names} from './layout.js';console.log(JSON.stringify(names))"],cwd=here))
bpy.context.window.scene=bpy.data.scenes['G-012 · 편집할 점포 집기']
for key,name in names.items():
    if key in ('room','counter'):continue
    group=bpy.data.collections['요거트월드 · '+name]
    if key=='glass':
        offset=Vector(group['preview_origin']);coords=[];triangles=[]
        for o in sorted(group.all_objects,key=lambda o:o.name):
            start=len(coords)//3;o.data.calc_loop_triangles()
            for v in o.data.vertices:
                x,y,z=o.matrix_world@v.co-offset;coords.extend([round(x,6),round(z,6),round(-y,6)])
            for face in o.data.loop_triangles:triangles.extend(start+j for j in face.vertices)
        (here/'glass.js').write_text('// From the G-012 corner glazing in g012.blend.\nexport const glass='+json.dumps({'positions':coords,'indices':triangles},separators=(',',':'))+';\n')
    else:
        fine=key in ('honey','blueberry','plants')
        # The native granola flakes and wax cells are mm-wide on a 148 mm bowl.
        # Reduce only the food surface tessellation for the standing-height game view.
        modifiers=[]
        try:
            if key in ('blueberry','honey'):
                for ob in group.all_objects:
                    ratio=(.27 if ob.name.startswith('귀리·그래놀라') else .51 if ob.name.startswith(
                        ('검푸른','한 스쿱','바닥에 담은','그릭요거트 바닥','황금색 망고','찢어진 벌집')) else 1)
                    if ratio<1:
                        mod=ob.modifiers.new('웹용 작은 요철 축약','DECIMATE');mod.ratio=ratio;modifiers.append((ob,mod))
                bpy.context.view_layer.update()
            simplification=(.51,.00069) if key in ('blueberry','honey') else (.54,.00068 if fine else .0012)
            bake_collection(group,'G012_'+key,here/(key+'.glb'),simplification=simplification,
                            preserve_smoothing=True,color_attribute='음식과 식물 표면' if fine else None)
        finally:
            for ob,mod in modifiers:ob.modifiers.remove(mod)
preview=bpy.data.scenes['G-012 · 요거트월드 서편 코너']
glass=next(o for o in preview.objects if o.get('web_part')=='glass')
saved=glass.hide_render
try:
    glass.hide_render=True
    bake_furnished(here,preview.name,[(k,'요거트월드 · '+names[k],n) for k,n in [('room',640),('counter',384)]])
finally:glass.hide_render=saved
