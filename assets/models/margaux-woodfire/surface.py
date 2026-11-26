"""A small original seamless aggregate sample for the photographed firebrick."""
from math import floor
import random
import struct
import zlib
import bpy

def make(path,collection):
    n=128
    rng=random.Random(736)
    grids={step:[[rng.uniform(-1,1) for _ in range(n//step)] for _ in range(n//step)] for step in (4,12,32)}
    def noise(x,y,step):
        grid=grids[step];k=len(grid);xx=x*k/n;yy=y*k/n
        i=floor(xx);j=floor(yy);x=xx-i;y=yy-j;x=x*x*(3-2*x);y=y*y*(3-2*y)
        return (grid[j][i]*(1-x)+grid[j][(i+1)%k]*x)*(1-y)+(grid[(j+1)%k][i]*(1-x)+grid[(j+1)%k][(i+1)%k]*x)*y
    raw=bytearray()
    for y in range(n):
        raw.append(0)
        for x in range(n):
            deep=noise(x,y,12);speck=rng.random()
            val=round(min(255,max(130,229+13*noise(x,y,32)+14*deep+10*noise(x,y,4)+rng.uniform(-7,8)
                                  -(rng.uniform(18,42) if speck<.044 else 0))))
            raw.extend((val,min(val+1,255),min(val+2,255)))
    def chunk(k,b):
        return struct.pack('>I',len(b))+k+b+struct.pack('>I',zlib.crc32(k+b))
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',n,n,8,2,0,0,0))+
                     chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    image=bpy.data.images.load(str(path));image.pack()
    materials=set()
    for ob in collection.objects:
        mesh=ob.data;uv=mesh.uv_layers.new(name='Aggregate')
        for face in mesh.polygons:
            nx,ny,nz=map(abs,face.normal)
            for loop in face.loop_indices:
                x,y,z=mesh.vertices[mesh.loops[loop].vertex_index].co
                a,b=(x,z) if ny>=max(nx,nz) else (y,z) if nx>=nz else (x,y)
                uv.data[loop].uv=(a*3.5+1.65,b*3.5+.61)
        materials.add(mesh.materials[0])
    for mat in materials:
        tree=mat.node_tree;tex=tree.nodes.new('ShaderNodeTexImage');tex.image=image
        mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        attr=next(node for node in tree.nodes if node.type=='VERTEX_COLOR')
        tree.links.new(attr.outputs['Color'],mix.inputs[1]);tree.links.new(tex.outputs['Color'],mix.inputs[2])
        tree.links.new(mix.outputs[0],tree.nodes.get('Principled BSDF').inputs['Base Color'])
