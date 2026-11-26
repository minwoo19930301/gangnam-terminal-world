"""Capture the gloss of chocolate, stainless steel and the black enamel base in Blender."""
from pathlib import Path
from mathutils import Vector
from tempfile import TemporaryDirectory
import bpy,subprocess

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.name='디저트 시료의 곡면 반사'
s.render.engine='CYCLES';s.cycles.samples=36;s.cycles.use_denoising=True;s.cycles.max_bounces=5
s.world=bpy.data.worlds.new('짙은 주방 주변');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.30,.32,.30,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.37
s.view_settings.view_transform='AgX';s.render.resolution_x=256;s.render.resolution_y=256;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.film_transparent=True
cam=bpy.data.cameras.new('면광원 시료 카메라');ob=bpy.data.objects.new(cam.name,cam);s.collection.objects.link(ob);s.camera=ob;ob.location=(0,-4,0)
ob.rotation_euler=Vector((0,1,0)).to_track_quat('-Z','Y').to_euler();cam.type='ORTHO';cam.ortho_scale=2.04
def area(name,co,size,sizey,power,col):
    light=bpy.data.lights.new(name,'AREA');light.shape='RECTANGLE';light.size=size;light.size_y=sizey;light.energy=power;light.color=col
    o=bpy.data.objects.new(name,light);s.collection.objects.link(o);o.location=co;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
area('천장 긴 다운라이트',(-1.8,-2.6,3.2),2.3,.57,195,(1,.90,.75))
area('오른쪽 유리 반사',(.90,-2.6,1.5),.46,1.54,140,(1,.95,.87))
area('디저트 진열장 왼쪽 빛',(-2.5,.7,-.1),.34,2.88,120,(.80,.89,1))
area('검은 받침의 따뜻한 반사',(2.3,1.0,-.65),1.56,.53,114,(1,.73,.48))
bpy.ops.mesh.primitive_uv_sphere_add(segments=72,ring_count=40);orb=bpy.context.object
for p in orb.data.polygons:p.use_smooth=True
mat=bpy.data.materials.new('소재');mat.use_nodes=True;orb.data.materials.append(mat);surface=mat.node_tree.nodes['Principled BSDF']
def linear(s):
    return tuple(((v/255+.055)/1.055)**2.4 if v/255>.04045 else v/255/12.92 for v in bytes.fromhex(s))
with TemporaryDirectory() as t:
    files=[]
    for key,code,metal,rough,coat in [('chocolate','803e1e',0,.196,.49),('stainless','a8a7a0',.90,.159,.04),('enamel','202222',.07,.236,.35)]:
        surface.inputs['Base Color'].default_value=(*linear(code),1);surface.inputs['Metallic'].default_value=metal;surface.inputs['Roughness'].default_value=rough
        surface.inputs['Coat Weight'].default_value=coat;surface.inputs['Coat Roughness'].default_value=.172
        f=Path(t)/(key+'.png');s.render.filepath=str(f);bpy.ops.render.render(write_still=True);files.append(str(f))
    code="""import sharp from 'sharp';const [out,...f]=process.argv.slice(1);const layers=await Promise.all(f.map(async(v,i)=>({input:await sharp(v).flatten({background:'#39342d'}).removeAlpha().png().toBuffer(),left:i*256,top:0})));await sharp({create:{width:768,height:256,channels:3,background:'#39342d'}}).composite(layers).webp({quality:94}).toFile(out);"""
    subprocess.run(['node','--input-type=module','-e',code,str(here/'gloss.webp'),*files],check=True,cwd=here.parents[2])
