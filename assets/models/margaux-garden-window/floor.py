"""Photograph-based warm carpet inset and pale stone service aisle."""
import math
import random
import struct
import zlib
import bpy


def floor_finish(here, group, material, rgb):
    # Generate an original seamless pile sample. The little paired fibres
    # stand out close to the guest; the surrounding stone has coarser grain.
    rng=random.Random(71);size=128;raw=bytearray()
    for j in range(size):
        raw.append(0)
        for i in range(size):
            coarse=3*math.sin(4*math.pi*i/size+math.sin(2*math.pi*j/size))
            fibre=3.6*math.cos(math.pi*(i+j//2))+.8*math.sin(2*math.pi*j/4)
            g=min(255,round(244+coarse+fibre+rng.uniform(-6,6)))
            raw.extend([g,g,g])
    def chunk(key,data):
        return struct.pack('>I',len(data))+key+data+struct.pack('>I',zlib.crc32(key+data))
    path=here/'carpet.png'
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',size,size,8,2,0,0,0))+
                     chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    image=bpy.data.images.load(str(path));image.pack()
    m=material('Carpet pile and stone',rough=.92)
    nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
    mult=nodes.new('ShaderNodeMixRGB');mult.blend_type='MULTIPLY';mult.inputs[0].default_value=1
    attr=next(n for n in nodes if n.type=='VERTEX_COLOR')
    m.node_tree.links.new(attr.outputs['Color'],mult.inputs[1])
    m.node_tree.links.new(tex.outputs['Color'],mult.inputs[2])
    m.node_tree.links.new(mult.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
    c,_=group('GardenFloor',m)

    def surface(name,patches):
        v=[];colors=[];faces=[];uv=[]
        for x0,d0,x1,d1,h,color,repeat in patches:
            a=len(v)
            for x,d in [(x0,d1),(x1,d1),(x1,d0),(x0,d0)]:
                v.append((x,-d,h));colors.extend(rgb(color));uv.extend([x*repeat,d*repeat])
            faces.append((a,a+1,a+2,a+3))
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],faces);mesh.update()
        mesh.color_attributes.new(name='Color',type='BYTE_COLOR',domain='POINT').data.foreach_set('color',colors)
        mesh.uv_layers.new(name='Pile').data.foreach_set('uv',uv)
        obj=bpy.data.objects.new(name,mesh);c.objects.link(obj);mesh.materials.append(m)

    # A single soft brown carpet surrounds the existing dining chairs and
    # leaves the circulation strip between tables and the open kitchen free.
    surface('다이닝 좌석 아래 카펫', [(-11.82,-8.53,5.01,8.59,.028,'b59279',1.73)])
    tiles=[]
    for i in range(16):
        for j in range(12):
            a=-11.86+i*1.477;b=-8.91+j*1.481
            if a+1.477<5.01 and b> -8.53 and b+1.481 <8.59:continue
            tiles.append((a+.0015,b+.0015,a+1.475,b+1.479,.022,
                          ['cec1ae','c7b6a5','cfbcaa','c9b9a8'][(i*5+j*3)%4],.16))
    surface('통로의 밝은 석재 판',tiles)
