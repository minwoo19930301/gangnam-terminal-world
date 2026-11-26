"""Small repeatable timber and textile images for the editable and exported materials."""
from math import cos, pi, sin
from pathlib import Path
import random
import struct
import zlib
import bpy

HERE=Path(__file__).resolve().parent


def png(name, sample, size=128):
    data=bytearray()
    for y in range(size):
        data.append(0)
        for x in range(size):
            value=max(0,min(255,round(sample(x/size,y/size,x,y))))
            data.extend([value,value,value])
    def chunk(key, content):
        return struct.pack('>I',len(content))+key+content+struct.pack('>I',zlib.crc32(key+content))
    raw=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(data,9))+chunk(b'IEND',b'')
    path=HERE/name
    path.write_bytes(raw)
    image=bpy.data.images.load(str(path),check_existing=True)
    image.pack()
    return image


def textures():
    rng=random.Random(802)
    def timber(u,v,x,y):
        # Long open pores, broad growth rings and a slow figure around the grain.
        phase=2*pi*(u*6+.27*sin(2*pi*v)+.11*sin(4*pi*v+2*pi*u))
        pores=(.5+.5*cos(2*pi*(u*46+.31*sin(2*pi*v)+.12*sin(6*pi*v))))**11
        rings=(.5+.5*cos(phase))**5
        return 247-8*rings-9*pores+1.4*sin(phase)+rng.uniform(-2,2)
    def textile(u,v,x,y):
        crossing=(x//2+y//2)%2
        warp=sin(2*pi*(x%4)/4)
        weft=sin(2*pi*(y%4)/4)
        return 241+7*(warp if crossing else weft)+rng.uniform(-4,4)
    return {'BrownyardOak':png('oak.png',timber),'BrownyardCloth':png('weave.png',textile)}


def uv(mesh, world, batch, horizontal=False):
    texture=mesh.uv_layers.new(name='Finish')
    for poly in mesh.polygons:
        # Face projection keeps the timber end and long faces at their own scale.
        axis=max(range(3),key=lambda i:abs(poly.normal[i]))
        for index in poly.loop_indices:
            x,y,z=world @ mesh.vertices[mesh.loops[index].vertex_index].co
            if axis==2:a,b=x,y
            else:a,b=(y if axis==0 else x),z
            if horizontal:a,b=b,a
            texture.data[index].uv=(a*2.0,b*1.25) if batch=='BrownyardOak' else (a*6.2,b*6.2)


def native_texture(material,img):
    nodes=material.node_tree.nodes
    p=nodes.get('Principled BSDF')
    tex=nodes.new('ShaderNodeTexImage');tex.image=img
    mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    mix.inputs[1].default_value=material.diffuse_color
    material.node_tree.links.new(tex.outputs['Color'],mix.inputs[2])
    material.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])
