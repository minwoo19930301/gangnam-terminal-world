"""Export the actual mirror panes and three colour-managed native reflections into one small strip."""
import bpy,subprocess,json
from tempfile import TemporaryDirectory
from pathlib import Path
from math import pi
from mathutils import Vector
src=bpy.data.collections[parts['mirrors'][0]];origin=Vector(src['preview_origin']);vertices=[];indices=[];slots=[];probes=[]
for slot,ob in enumerate(sorted(src.all_objects,key=lambda ob:ob['probe_X'])):
    start=len(vertices)//3;probes.append(ob['probe_X']);ob.data.calc_loop_triangles()
    for v in ob.data.vertices:
        x,y,z=ob.matrix_world@v.co-origin;vertices.extend((round(x,6),round(z,6),round(-y,6)));slots.append(slot)
    for tri in ob.data.loop_triangles:indices.extend(start+i for i in tri.vertices)
(here/'mirror-panes.js').write_text('// Authored pane vertices and panorama slots from the native FP218 collection.\nexport const mesh='+json.dumps([vertices,indices,slots],separators=(',',':'))+';\n')
scene=bpy.data.scenes['FP218 · 차알 식사 공간'];bpy.context.window.scene=scene
cam=bpy.data.cameras.new('동일 눈높이의 세 반사 탐침');cam.type='PANO';cam.panorama_type='EQUIRECTANGULAR';eye=bpy.data.objects.new('반사 탐침',cam);scene.collection.objects.link(eye)
eye.rotation_euler=(pi/2,0,0);scene.camera=eye;glass=next(ob for ob in scene.objects if ob.get('web_part')=='mirrors');glass.hide_render=True
scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True;scene.render.resolution_x=768;scene.render.resolution_y=384;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
try:
    with TemporaryDirectory() as tmp:
        for i,x in enumerate(probes):
            eye.location=(x,-5.64,1.94);scene.render.filepath=str(Path(tmp)/(str(i)+'.png'));bpy.ops.render.render(write_still=True,scene=scene.name)
        # Three equirectangular views share mip levels and one texture request. Padding at the sampling limit avoids cross-tile bleed.
        script="import sharp from 'sharp';const [tmp,out]=process.argv.slice(1);await sharp({create:{width:768,height:1152,channels:3,background:'black'}}).composite([0,1,2].map(i=>({input:tmp+'/'+i+'.png',left:0,top:384*i}))).webp({quality:81}).toFile(out)"
        subprocess.run(['node','--input-type=module','-e',script,tmp,str(here/'reflections.webp')],cwd=here.parents[2],check=True)
finally:
    glass.hide_render=False;bpy.data.objects.remove(eye,do_unlink=True);bpy.data.cameras.remove(cam)
