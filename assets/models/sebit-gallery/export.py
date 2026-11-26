"""Re-export native fixtures and the illustrated screen programme."""
from pathlib import Path
import json,runpy,sys
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
scene=bpy.data.scenes['피카소 벽화길 · 공공 집기'];bpy.context.window.scene=scene
for group in scene.collection.children:
    key=group.get('game_part')
    if not key:continue
    if key!='film':
        bake_collection(group,'SebitGallery_'+key,here/(key+'.glb'),simplification=(.65,.0007),
          color_attribute='확산판 연속 색' if key=='striplamp' else None,preserve_smoothing=True)
        continue
    ob=next(o for o in group.all_objects if o.type=='MESH');origin=Vector(group['preview_origin']);geo=ob.data;geo.calc_loop_triangles()
    pts=[];uv=[]
    for tri in geo.loop_triangles:
        for j in tri.loops:
            coord=ob.matrix_world@geo.vertices[geo.loops[j].vertex_index].co-origin
            pts.extend(round(n,6) for n in (coord.x,coord.z,-coord.y));uv.extend(round(n,6) for n in geo.uv_layers.active.data[j].uv)
    (here/'screen.js').write_text('// From the native programme surface.\nexport const screen='+json.dumps({'vertices':pts,'uv':uv},separators=(',',':'))+';\n')
runpy.run_path(str(here/'program.py'))['render_program'](here)
