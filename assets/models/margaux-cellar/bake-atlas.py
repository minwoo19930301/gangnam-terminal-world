"""Map the baked brick and slate faces to one mipmapped atlas and a low-poly room shell."""
from pathlib import Path
import math
import struct
import subprocess
import zlib
import bpy
import numpy as np

# The upper half is the vault (long axis horizontal). The bottom half is slate.
# The white swatch below both is shared by the physically protruding arch ribs.
N=1536
LEFT,RIGHT=12,N-12
FLOOR_LO,FLOOR_HI=24,740
ROOF_LO,ROOF_HI=776,1516
HALF,RR,SPRING,RISE=6.83,3.34,2.53,1.17


def pixel(co,roof):
    x,y,z=co
    long=(y+HALF)/(2*HALF)
    span=math.atan2(max(0,(z-SPRING)/RISE),x/RR)/math.pi if roof else (x+RR)/(2*RR)
    lo,hi=(ROOF_LO,ROOF_HI) if roof else (FLOOR_LO,FLOOR_HI)
    return LEFT+long*(RIGHT-LEFT),lo+span*(hi-lo)


def write_png(file,linear):
    encoded=np.where(linear<=.0031308,linear*12.92,1.055*np.power(np.maximum(0,linear),1/2.4)-.055)
    rgb=np.rint(np.clip(encoded,0,1)*255).astype(np.uint8)[::-1]
    def chunk(tag,data):
        return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
    raw=b''.join(b'\0'+row.tobytes() for row in rgb)
    header=struct.pack('>2I5B',N,N,8,2,0,0,0)
    file.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',header)+chunk(b'IDAT',zlib.compress(raw,6))+chunk(b'IEND',b''))


def atlas_room(source,tags,colors,temp):
    pixels=np.ones((N,N,3),np.float32)
    # Source faces are ordered in Blender's editable object order. Paint the
    # mortar first so a pixel on a tile edge keeps the colour underneath it.
    stages={k:[] for k in ('backRoof','frontRoof','backFloor','frontFloor')}
    rest=[]
    for face,tag in zip(source.polygons,tags):
        if tag.startswith('곡면 조적 바탕'):stages['backRoof'].append(face)
        elif tag.startswith('엇갈린 벽돌'):stages['frontRoof'].append(face)
        elif tag.startswith(('큰 점판암 타일','점판암 바탕')):
            if face.normal.z>.96:stages['backFloor' if tag.startswith('점판암') else 'frontFloor'].append(face)
        else:rest.append(face)
    for stage,faces in stages.items():
        roof=stage.endswith('Roof')
        for face in faces:
            # The four corners are axis-aligned in cylindrical or floor UV coordinates.
            loops=face.loop_indices
            mapped=np.array([pixel(source.vertices[source.loops[i].vertex_index].co,roof) for i in loops])
            x0,y0=mapped.min(axis=0);x1,y1=mapped.max(axis=0)
            if x1-x0<.1 or y1-y0<.1:continue
            xi=np.arange(max(0,math.floor(x0)),min(N,math.ceil(x1)))
            yi=np.arange(max(0,math.floor(y0)),min(N,math.ceil(y1)))
            if not len(xi) or not len(yi):continue
            xx=np.clip((xi+.5-x0)/(x1-x0),0,1)[None,:,None]
            yy=np.clip((yi+.5-y0)/(y1-y0),0,1)[:,None,None]
            col=np.array([colors[i] for i in loops])
            corners=[col[np.argmin(np.sum((mapped-xy)**2,axis=1))] for xy in [(x0,y0),(x1,y0),(x0,y1),(x1,y1)]]
            shade=(1-yy)*((1-xx)*corners[0]+xx*corners[1])+yy*((1-xx)*corners[2]+xx*corners[3])
            maskx=np.maximum(0,np.minimum(xi+1,x1)-np.maximum(xi,x0))
            masky=np.maximum(0,np.minimum(yi+1,y1)-np.maximum(yi,y0))
            cover=(masky[:,None]*maskx[None,:])[:,:,None]
            old=pixels[yi[0]:yi[-1]+1,xi[0]:xi[-1]+1]
            old[:]=shade*cover+old*(1-cover)
    # Extend the strips into gutters so minification doesn't pick up white edges.
    for lo,hi in [(ROOF_LO,ROOF_HI),(FLOOR_LO,FLOOR_HI)]:
        pixels[lo:hi,:LEFT]=pixels[lo:hi,LEFT:LEFT+1]
        pixels[lo:hi,RIGHT:]=pixels[lo:hi,RIGHT-1:RIGHT]
        pixels[lo-8:lo,:,:]=pixels[lo:lo+1,:,:]
        pixels[hi:hi+8,:,:]=pixels[hi-1:hi,:,:]
    png=temp/'cellar.png'
    webp=temp/'cellar.webp'
    write_png(png,pixels)
    subprocess.run(['cwebp','-quiet','-q','87',str(png),'-o',str(webp)],check=True)
    verts,faces,uvs,rgba=[],[],[],[]
    swatch=(.5,.004)
    def face(verts_,tex,shade):
        first=len(verts);verts.extend(verts_)
        faces.append(tuple(range(first,first+len(verts_))))
        uvs.extend(tex);rgba.extend(shade)
    for f in rest:
        coords=[tuple(source.vertices[i].co) for i in f.vertices]
        face(coords,[swatch]*len(coords),[colors[i] for i in f.loop_indices])
    def main(coords,roof):
        face(coords,[(x/N,y/N) for x,y in [pixel(q,roof) for q in coords]],[(1,1,1)]*len(coords))
    for i in range(64):
        inside=lambda j,y:(RR*math.cos(j*math.pi/64),y,SPRING+RISE*math.sin(j*math.pi/64))
        main([inside(i,-HALF),inside(i+1,-HALF),inside(i+1,HALF),inside(i,HALF)],True)
    main([(-RR,-HALF,.028),(RR,-HALF,.028),(RR,HALF,.028),(-RR,HALF,.028)],False)
    mesh=bpy.data.meshes.new('Mipped cellar masonry')
    mesh.from_pydata(verts,[],faces);mesh.update()
    uv=mesh.uv_layers.new(name='Baked room')
    for loop in mesh.loops:uv.data[loop.index].uv=uvs[loop.vertex_index]
    tint=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for loop in mesh.loops:tint.data[loop.index].color=(*rgba[loop.vertex_index],1)
    mesh.color_attributes.active_color=tint
    mesh.color_attributes.render_color_index=mesh.color_attributes.find('COLOR_0')
    print('Baked atlas:',len(source.polygons),'original faces,',len(mesh.polygons),'runtime faces,',webp.stat().st_size,'texture bytes')
    return mesh,webp
