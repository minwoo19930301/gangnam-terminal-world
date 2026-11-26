"""Photograph each editable Blender flower at three elevations for its middle-distance game appearance."""
from math import radians,cos,sin
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy
from mathutils import Vector

def photograph(group,here):
    # Each species is radially symmetric enough to use a single reference azimuth.
    # The game chooses an elevation independently for each tilted stem.
    unique={ob['web_flower']:ob.data for g in group for ob in g.objects if ob.get('web_flower') and ob['web_flower']!='pineBough'}
    if not unique:return
    current=bpy.context.window.scene;sc=bpy.data.scenes.new('거리별 절화 표면');sc.render.engine='CYCLES';sc.cycles.samples=18
    sc.world=bpy.data.worlds.new('절화의 중성 확산광');sc.world.use_nodes=True
    sc.world.node_tree.nodes.get('Background').inputs[0].default_value=(.76,.79,.79,1);sc.world.node_tree.nodes.get('Background').inputs[1].default_value=.72
    sc.render.film_transparent=True;sc.render.resolution_x=160;sc.render.resolution_y=160;sc.render.resolution_percentage=100
    sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.view_settings.view_transform='AgX';bpy.context.window.scene=sc
    cd=bpy.data.cameras.new('송이 정사영');cd.type='ORTHO';cd.ortho_scale=.155;cam=bpy.data.objects.new('송이 정사영',cd);sc.collection.objects.link(cam);sc.camera=cam
    target=Vector((0,0,.014))
    for p,energy in [((-.18,-.23,.30),1.32),((.2,.2,.32),.95)]:
        ld=bpy.data.lights.new('근접 확산광','AREA');ld.energy=energy;ld.size=.23
        o=bpy.data.objects.new(ld.name,ld);sc.collection.objects.link(o);o.location=p;o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
    try:
        for name,mesh in sorted(unique.items()):
            ob=bpy.data.objects.new('근접 촬영 상품',mesh);sc.collection.objects.link(ob)
            with TemporaryDirectory() as tmp:
                frames=[]
                for i,deg in enumerate([85,45,5]):
                    a=radians(deg);cam.location=target+Vector((0,-.37*cos(a),.37*sin(a)))
                    cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
                    image=Path(tmp)/str(i);sc.render.filepath=str(image)+'.png';bpy.ops.render.render(write_still=True);frames.append(str(image)+'.png')
                subprocess.run(['node','--input-type=module','-e',
                    "import sharp from 'sharp';const [a,b,c,out]=process.argv.slice(1);await sharp({create:{width:160,height:480,channels:4,background:'#00000000'}}).composite([a,b,c].map((input,i)=>({input,left:0,top:i*160}))).webp({quality:91,alphaQuality:98}).toFile(out)",
                    *frames,str(here/(name+'-views.webp'))],cwd=here.parents[2],check=True)
            bpy.data.objects.remove(ob,do_unlink=True);print('FLOWER SPRITE',name,flush=True)
    finally:bpy.context.window.scene=current
