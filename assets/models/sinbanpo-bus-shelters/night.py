"""Bake the six linear luminaires, illuminated cases and seat shadows into the public paving footprint."""
from pathlib import Path
from tempfile import TemporaryDirectory
from math import pi
import struct,zlib,subprocess
import bpy,numpy as np
from mathutils import Vector

here=Path(__file__).resolve().parent
def prepare_lights(scene):
    col=bpy.data.collections.new('중앙차로 승차대 · 차양등과 보도 빛')
    col['preview_origin']=(0,0,0);scene.collection.children.link(col)
    def lamp(label,loc,size,power,direction,tint):
        light=bpy.data.lights.new(label,'AREA');light.shape='RECTANGLE';light.size,light.size_y=size
        light.energy=power;light.color=tint;obj=bpy.data.objects.new(label,light);col.objects.link(obj);obj.location=loc
        obj.rotation_euler=Vector(direction).to_track_quat('-Z','Y').to_euler()
    for x in [-2.24,0,2.24]:
        for d in [-.51,.603]:
            lamp('차양 아래 · 선형 LED',(x,-d,2.662),(2.07,.044),15,(0,0,-1),(1,.955,.846))
    for x in [-2.66,2.66]:
        lamp('광고등 · 앞 유리',(x,.744,1.116),(1.10,1.80),10,(0,-1,-.04),(1,.96,.88))
        lamp('광고등 · 뒤 유리',(x,1.003,1.116),(1.10,1.80),7,(0,1,-.06),(1,.95,.86))
    return col

def bake_lighting(frame,lamps,target):
    scene=bpy.data.scenes.new('저녁 차양 · 실제 등과 좌판의 그림자')
    scene.collection.children.link(frame);scene.collection.children.link(lamps)
    previous=bpy.context.window.scene;bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=144;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=3
    nx,ny=896,464;w,h=8.40,4.35
    scene.render.resolution_x=nx;scene.render.resolution_y=ny;scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('밤 · 외부 광원 제외');scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=0
    # Cast real contact and area shadows while measuring only the received light.
    for obj in frame.objects:obj.visible_camera=False
    receiver=bpy.data.meshes.new('보도 · 수광면')
    receiver.from_pydata([(-w/2,-h/2,0),(w/2,-h/2,0),(w/2,h/2,0),(-w/2,h/2,0)],[],[(0,1,2,3)])
    receiver.update();o=bpy.data.objects.new('보도 수광면',receiver);scene.collection.objects.link(o)
    mat=bpy.data.materials.new('밝은 회색 포장면');mat.use_nodes=True
    bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.43,.45,.44,1)
    bs.inputs['Roughness'].default_value=.95;bs.inputs['Specular IOR Level'].default_value=.10;receiver.materials.append(mat)
    lens=bpy.data.cameras.new('수광도 정사 투영');lens.type='ORTHO';lens.ortho_scale=w
    cam=bpy.data.objects.new('실제 조명 보행 시뮬레이션',lens);scene.collection.objects.link(cam);cam.location=(0,0,5)
    cam.rotation_euler=(0,0,0);scene.camera=cam
    with TemporaryDirectory(prefix='sinbanpo-light-') as folder:
        temp=Path(folder)
        scene.render.image_settings.file_format='OPEN_EXR';scene.render.image_settings.color_depth='16';scene.render.image_settings.color_mode='RGB'
        scene.render.filepath=str(temp/'lighting.exr');bpy.ops.render.render(write_still=True)
        image=bpy.data.images.load(str(temp/'lighting.exr'),check_existing=False)
        data=np.empty((ny,nx,4),dtype='f4');image.pixels.foreach_get(data.ravel())
        # Make adjacent bays continuous and fade away near the platform kerb.
        # A floating light decal must not spill across its own edge or obscure the tactile tiles.
        yy,xx=np.mgrid[:ny,:nx];x=np.abs((xx+.5)/nx-.5)*w;d=np.abs((yy+.5)/ny-.5)*h
        fade=np.clip((w*.5-x)/.95,0,1)*np.clip((h*.5-d)/.62,0,1)
        fade=fade*fade*(3-2*fade)
        # Preserve the small mineral grains and staggered granite joints under the lamps.
        # Their contrast is locally illuminated, even away from the scene's sunlight.
        px=(xx+.5)*w/nx;py=(yy+.5)*h/ny
        grout=np.minimum(np.mod(px+(np.floor(py/.46)%2)*.40,.8),.8-np.mod(px+(np.floor(py/.46)%2)*.40,.8))
        cross=np.minimum(np.mod(py,.46),.46-np.mod(py,.46))
        narrow=np.clip(1-np.minimum(grout,cross)/.008,0,1)
        rng=np.random.default_rng(121000020)
        stone=.87-.19*narrow+rng.normal(0,.027,(ny,nx))+.034*np.sin(2*px+py)
        linear=np.clip(data[:,:,:3]*.97*stone[:,:,None]*fade[:,:,None],0,.35)
        encoded=np.where(linear<.0031308,12.92*linear,1.055*linear**(1/2.4)-.055)
        pix=np.rint(255*encoded[::-1]).astype('uint8')
        # Upper margin is outside the clipped platform. The LED diffuser faces sample this swatch.
        pix[2:12,2:12,:]=255
        def ch(tag,b):return struct.pack('>I',len(b))+tag+b+struct.pack('>I',zlib.crc32(tag+b)&0xffffffff)
        raw=b''.join(b'\x00'+row.tobytes() for row in pix)
        path=temp/'map.png'
        path.write_bytes(bytes.fromhex('89504e470d0a1a0a')+ch(b'IHDR',struct.pack('>2I5B',nx,ny,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw,7))+ch(b'IEND',b''))
        subprocess.run(['cwebp','-quiet','-q','92',str(path),'-o',str(target)],check=True)
        print('Paving light in linear space',linear.mean(axis=(0,1)),linear.max(),flush=True)
    for obj in frame.objects:obj.visible_camera=True
    bpy.context.window.scene=previous;bpy.data.scenes.remove(scene)
