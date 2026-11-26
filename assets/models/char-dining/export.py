"""One streamed surface per visible fixture. The granite draws its packed native texture in a single call."""
from pathlib import Path
from mathutils import Vector
import bpy,json,sys,subprocess
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
from blender_furnished_light import bake_furnished
parts=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts} from './layout.js';console.log(JSON.stringify(parts))"],cwd=here))
bpy.context.window.scene=bpy.data.scenes['차알 FP218 · 편집 집기'];mods=[]
try:
    for key,(label,*_) in parts.items():
        if key in ('room','mirrors'):continue
        col=bpy.data.collections[label]
        if key in ('granite','menu'):
            ob=next(o for o in col.all_objects if o.type=='MESH');old=ob.location.copy()
            try:
                bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
                ob.location=old-Vector(col['preview_origin']);bpy.context.view_layer.update()
                bpy.ops.export_scene.gltf(filepath=str(here/(key+'.glb')),export_format='GLB',use_selection=True,export_image_format='WEBP',export_image_quality=84,export_image_webp_fallback=False,export_yup=True)
            finally:ob.location=old;bpy.context.view_layer.update()
            continue
        for ob in col.all_objects:
            ratio=.26 if ob.name.startswith(('볶은 쌀알','육수 표면 기름','튀김의 갈색','상아빛 매화 꽃잎','꽃술')) else .45 if ob.name.startswith(('속에 들어간 새우살','달걀 조각과')) else 1
            if ratio<1:
                mod=ob.modifiers.new('게임용 작은 식재료 축약','DECIMATE');mod.ratio=ratio;mods.append((ob,mod))
        bpy.context.view_layer.update();bake_collection(col,'FP218_'+key,here/(key+'.glb'),simplification=(.48,.0011 if key in ('mala','rice','eggplant','setting') else .0013),preserve_smoothing=True)
    bake_furnished(here,'FP218 · 차알 식사 공간',[('room',parts['room'][0],768)])
finally:
    for ob,mod in mods:ob.modifiers.remove(mod)

from runpy import run_path
run_path(str(here/'reflection.py'),init_globals={'here':here,'parts':parts})
