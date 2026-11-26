"""Paint the veneer and open cord weave once, as a small packed UV atlas."""
import math
import struct
import tempfile
import zlib
from pathlib import Path

import bpy
import numpy as np


def make_atlas():
    width,height=512,256
    iy,ix=np.mgrid[:height,:width]
    u,v=ix/248,iy/height
    rng=np.random.default_rng(800)
    noise=rng.uniform(-1,1,(height,width))
    flow=u+.011*np.sin(5*v+7*u)+.0025*np.sin(v*15+19*u)
    streak=(.5+.5*np.sin(math.tau*flow*37+.6*np.sin(flow*47)))**5
    fine=(.5+.5*np.sin(math.tau*flow*109+np.sin(v*23)))**12
    value=np.clip(249-18*streak-12*fine+4*noise,190,255)
    pixels=np.full((height,width,4),255,dtype=np.uint8)
    for c in range(3):pixels[:,:248,c]=np.clip(value[:,:248]-c*(streak[:,:248]+fine[:,:248]),0,255)
    # Crossed pale threads leave irregular openings between them. A broad
    # diagonal wrap remains solid where successive layers cross the inner bulb.
    a=(ix-263)/235;b=iy/height
    thread=np.zeros_like(a)
    for dx,dy,phase in [(34,15,.10),(-21,45,.23),(13,-28,.32),(39,40,.24),(-29,-18,.61)]:
        line=dx*a+dy*b+.68*np.sin(a*23+b*15+phase*8)+.26*np.sin(a*64-b*19)
        distance=np.abs((line+.5)%1-.5)
        thread=np.maximum(thread,np.clip((.17-distance)*8,0,1))
    diagonal=np.abs((b-.30-.19*np.sin(a*math.tau)+.5)%1-.5)<.042
    alpha=np.where(diagonal,255,np.clip(thread*340+noise*17,0,255))
    fiber=np.clip(197+51*thread+9*noise+15*diagonal,170,255)
    pixels[:,260:501,:3]=np.stack([fiber,fiber*.987,fiber*.954],axis=2)[:,260:501]
    pixels[:,260:501,3]=alpha[:,260:501]
    def chunk(key,data):
        return struct.pack('>I',len(data))+key+data+struct.pack('>I',zlib.crc32(key+data)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,6,0,0,0))
    png+=chunk(b'IDAT',zlib.compress(b''.join(b'\0'+row.tobytes() for row in pixels),9))+chunk(b'IEND',b'')
    with tempfile.TemporaryDirectory() as tmp:
        path=Path(tmp)/'walnut-and-woven-cord.png';path.write_bytes(png)
        image=bpy.data.images.load(str(path));image.pack()
    image.name='호두나무 결 · 구형 등갓의 성긴 짜임'
    return image


def paint(objects):
    image=make_atlas()
    material=bpy.data.materials.new('파미에파크R · 목재와 직조 등갓')
    material.use_nodes=True
    nodes=material.node_tree.nodes;links=material.node_tree.links
    tex=nodes.new('ShaderNodeTexImage');tex.image=image
    colors=nodes.new('ShaderNodeVertexColor');colors.layer_name='Finish'
    mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    links.new(tex.outputs['Color'],mix.inputs[1]);links.new(colors.outputs['Color'],mix.inputs[2])
    bsdf=nodes.get('Principled BSDF')
    links.new(mix.outputs[0],bsdf.inputs['Base Color']);links.new(tex.outputs['Alpha'],bsdf.inputs['Alpha'])
    bsdf.inputs['Roughness'].default_value=.54
    for ob in objects:
        mesh=ob.data
        previous=mesh.uv_layers.active
        spherical=[entry.uv[:] for entry in previous.data] if previous and ob.get('woven') else None
        for uv in list(mesh.uv_layers):mesh.uv_layers.remove(uv)
        uv=mesh.uv_layers.new(name='Store finishes')
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
        uv=mesh.uv_layers['Store finishes'];attr=mesh.color_attributes['Finish']
        trunk=ob.get('veneer')
        for poly in mesh.polygons:
            mat=mesh.materials[poly.material_index];rgb=mat.diffuse_color[:3]
            for loop in poly.loop_indices:
                color=(*rgb,1)
                if trunk:
                    x,y,rotation,midangle=trunk
                    px,py,h=mesh.vertices[mesh.loops[loop].vertex_index].co
                    theta=math.atan2(py-y,px-x)
                    around=(theta-midangle+math.pi)%(2*math.pi)-math.pi
                    u=.006+.468*(.5+around/(math.tau/3))
                    v=.006+.988*h/5.65
                    # Baked warm wall wash interpolates continuously across the native mesh.
                    angular=math.exp(-(math.asin(math.sin(theta-rotation-.3))/.36)**2)
                    height=max(math.exp(-((h-2.86)/.23)**2),math.exp(-((h-1.96)/.26)**2))
                    warm=angular*height
                    color=tuple(min(1,c+warm*t) for c,t in zip(rgb,(.44,.235,.062)))+(1,)
                elif spherical:
                    su,sv=spherical[loop];u=.516+su*.452;v=.007+sv*.986
                else:u,v=.991,.5
                uv.data[loop].uv=(u,v);attr.data[loop].color=color
        mesh.materials[0]=material
        for poly in mesh.polygons:poly.material_index=0
        mesh.color_attributes.active_color=attr
