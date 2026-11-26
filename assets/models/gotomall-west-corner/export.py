"""Export single-draw detail parts, two furnished room bakes, and the real studio's offline mirror probe."""
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy,sys,subprocess,json,math
from mathutils import Vector
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
from blender_furnished_light import bake_furnished
parts=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts} from './layout.js';console.log(JSON.stringify(parts))"],cwd=here))
bpy.context.window.scene=bpy.data.scenes['서편 G열 · 진열 편집']
for key,(name,*unused) in parts.items():
    src=bpy.data.collections[name]
    if key in ('banShell','photoRoom'):continue
    if key=='samples':
        import runpy
        runpy.run_path(str(here/'print_atlas.py'))['export_papers'](src,here)
    elif key=='mirrorGlass':
        vs=[];indices=[];origin=Vector(src['preview_origin'])
        for ob in src.all_objects:
            offset=len(vs)//3;ob.data.calc_loop_triangles()
            for vertex in ob.data.vertices:
                x,y,z=ob.matrix_world@vertex.co-origin;vs.extend((round(x,6),round(z,6),round(-y,6)))
            for f in ob.data.loop_triangles:indices.extend(offset+i for i in f.vertices)
        (here/'mirror-pane.js').write_text('// Exact outline of the original silver pane in west-corner.blend.\nexport const pane='+json.dumps([vs,indices],separators=(',',':'))+';\n')
    else:
        bake_collection(src,'West_'+key,here/(key+'.glb'),simplification=(.55,.0009 if key in ('coats','shades','trays') else .0014),preserve_smoothing=True,color_attribute='점포 표면색' if key=='photoSign' else None)
preview=bpy.data.scenes['G-011 · G-013 서편 점포'];bpy.context.window.scene=preview
bake_furnished(here,preview.name,[(key,parts[key][0],512) for key in ('banShell','photoRoom')])
# Store one equirectangular panorama. It is sampled only on the nearby mirror's small glass area.
def reflection():
    cam=bpy.data.cameras.new('거울 중앙에서 본 점포의 실내광');cam.type='PANO';cam.panorama_type='EQUIRECTANGULAR'
    eye=bpy.data.objects.new('거울의 반사 탐침',cam);preview.collection.objects.link(eye)
    eye.location=(6.87,-2.845,1.04);eye.rotation_euler=(math.pi/2,0,0);preview.camera=eye
    # Looking from the mirror towards the front is +Y. The image centre faces game -Z and its right edge faces +X.
    glass=next(o for o in preview.objects if o.get('web_part')=='mirrorGlass');glass.hide_render=True
    preview.render.engine='CYCLES';preview.cycles.samples=8;preview.cycles.use_denoising=True
    preview.render.resolution_x=1024;preview.render.resolution_y=512;preview.render.resolution_percentage=100
    preview.render.image_settings.file_format='WEBP';preview.render.image_settings.quality=83;preview.render.film_transparent=False
    preview.view_settings.view_transform='AgX';preview.render.filepath=str(here/'mirror-room.webp')
    try:bpy.ops.render.render(write_still=True,scene=preview.name)
    finally:
        glass.hide_render=False;bpy.data.objects.remove(eye,do_unlink=True);bpy.data.cameras.remove(cam)
reflection()
