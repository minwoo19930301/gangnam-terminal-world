"""Editable front optics, rear markers and a Cycles bake of the dipped road beams."""
from pathlib import Path
import bpy,numpy as np
from math import radians
from mathutils import Vector
import struct,zlib,subprocess
import blender_shop_mesh as m
from body import ring

# The beam card spans 7 × 8 m ahead of the front bumper.
WIDTH,LENGTH,CENTRE=7.0,8.0,8.95

def build():
    col=m.group
    for s in [-1,1]:
        for u,z,r in [(.900,.767,.046),(.785,.639,.029)]:
            ring('전조등 켠 렌즈',(s*u,5.500,z),'d',[(.025,r),(.033,r*.87),(.039,.002)],'lamp',16)
        m.rod('전조등의 하얀 테두리',[(s*.697,5.496,.62),(s*.766,5.489,.73),(s*.979,5.475,.925)],.009,'lamp',6)
        for z in [.590,1.124]:
            c=(s*.988,-5.488,z);ring('뒤 원형 적색 미등',c,'d',[(-.030,.047),(-.038,.04),(-.042,.002)],'brake',18)
        for d in [-4.80,-1.40,2.0,4.95]:
            m.block('밤 옆면 차폭등',s*1.275,d,.581,.005,.089,.024,'amber')
        data=bpy.data.lights.new('하향 전조등','SPOT');data.energy=115
        data.color=(.91,.95,1);data.spot_size=radians(67);data.spot_blend=.75;data.shadow_soft_size=.075
        light=bpy.data.objects.new('노면을 비추는 실제 하향등',data);col.objects.link(light);light.location=(s*.90,-5.514,.767)
        light.rotation_euler=Vector((s*.065,-1,-.165)).to_track_quat('-Z','Y').to_euler()
    return col

def bake(frame,lamps,tmp,target):
    prev=bpy.context.window.scene
    scene=bpy.data.scenes.new('하향 전조등 · 신반포로 노면 수광');scene.collection.children.link(frame)
    scene.collection.children.link(lamps);bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True;scene.cycles.max_bounces=2
    nx,ny=308,352;scene.render.resolution_x=nx;scene.render.resolution_y=ny;scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('검은 측광실');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[1].default_value=0
    mesh=bpy.data.meshes.new('전조등 수광판');mesh.from_pydata([(-6,-1,0),(6,-1,0),(6,-17,0),(-6,-17,0)],[],[(3,2,1,0)])
    receiver=bpy.data.objects.new('정류장 앞 노면',mesh);scene.collection.objects.link(receiver)
    mat=bpy.data.materials.new('거친 아스팔트 · 수광 측정');mat.use_nodes=True
    bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.26,.26,.24,1);bs.inputs['Roughness'].default_value=.93
    bs.inputs['Specular IOR Level'].default_value=.15;mesh.materials.append(mat)
    for g in [frame,lamps]:
        for obj in g.objects:
            if obj.type=='MESH':obj.visible_camera=False
    camera=bpy.data.cameras.new('노면 광분포 정사 투영');camera.type='ORTHO';camera.ortho_scale=LENGTH
    obj=bpy.data.objects.new('노면 광분포 카메라',camera);scene.collection.objects.link(obj);obj.location=(0,-CENTRE,4);obj.rotation_euler=(0,0,0);scene.camera=obj
    scene.render.image_settings.file_format='OPEN_EXR';scene.render.image_settings.color_depth='16';scene.render.image_settings.color_mode='RGB'
    scene.render.filepath=str(tmp/'headlight.exr');bpy.ops.render.render(write_still=True)
    img=bpy.data.images.load(str(tmp/'headlight.exr'));data=np.empty((ny,nx,4),dtype='f4');img.pixels.foreach_get(data.ravel())
    iy,ix=np.mgrid[:ny,:nx];fx=(ix+.5)/nx;fy=(iy+.5)/ny
    # The map's nearest edge is just behind the bumper; zero at all four borders.
    fade=np.clip(np.minimum(fx,1-fx)*8,0,1)*np.clip(np.minimum(fy,1-fy)*7,0,1)
    fade=fade*fade*(3-2*fade);noise=np.random.default_rng(142360).normal(.91,.045,(ny,nx))
    out=np.clip(data[:,:,:3]*fade[:,:,None]*noise[:,:,None]*.85,0,.55)
    encoded=np.where(out<.0031308,out*12.92,1.055*np.power(out,1/2.4)-.055)
    pixels=np.rint(255*encoded[::-1]).astype('uint8')
    def chunk(tag,raw):return struct.pack('>I',len(raw))+tag+raw+struct.pack('>I',zlib.crc32(tag+raw)&0xffffffff)
    raw=b''.join(b'\x00'+row.tobytes() for row in pixels);path=tmp/'beams.png'
    path.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',nx,ny,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,7))+chunk(b'IEND',b''))
    subprocess.run(['cwebp','-quiet','-q','92',str(path),'-o',str(target)],check=True)
    for g in [frame,lamps]:
        for obj in g.objects:
            if obj.type=='MESH':obj.visible_camera=True
    bpy.context.window.scene=prev;bpy.data.scenes.remove(scene)
    print('Headlamps ground luminance',out.max(),out.mean(),flush=True)
