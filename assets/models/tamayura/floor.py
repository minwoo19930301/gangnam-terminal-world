"""Bake floor tile, joints and near-contact shadows without drawing every tile in the game."""
import struct
import zlib
from tempfile import TemporaryDirectory
from pathlib import Path
import subprocess
import bpy
import numpy as np
import blender_shop_mesh as m

WIDTH,DEPTH=10.40,12.38
U,V=22.24,49.24

def tile_floor():
    m.block('정사각 타일 아래의 줄눈',0,0,.014,WIDTH,DEPTH,.006,'grout')
    for j in range(16):
        for k in range(13):
            w=WIDTH/13;l=DEPTH/16;x=(k-6)*w;d=(j-7.5)*l
            m.block('스시 바의 밝은 석재' if j>=9 else '차와 철판 바의 짙은 석재',
                    x,d,.020,w-.004,l-.004,.006,'light_tile' if j>=9 else 'dark_tile')

def bake(here,rows):
    w,h=768,912
    yy,xx=np.mgrid[:h,:w];x=(xx+.5)/w*WIDTH-WIDTH/2;d=(yy+.5)/h*DEPTH-DEPTH/2
    cx=np.floor((x+WIDTH/2)/(WIDTH/13));cy=np.floor((d+DEPTH/2)/(DEPTH/16))
    rng=np.random.default_rng(98117)
    noise=rng.normal(0,1.7,(h,w))
    phase=2.7*x+.84*np.sin(d*1.6)+.35*np.sin(x*3.5+d*6)
    stone=2.7*np.cos(phase*2+d*2)+1.8*np.sin(phase*6+d*5)+noise+2.5*np.sin(cx*1.7+cy*3.4)
    tone=np.where((cy>=9)[:,:,None],np.array([183,171,157]),np.array([81,77,73])).astype(float)
    joint=np.minimum.reduce([np.mod(x+WIDTH/2,WIDTH/13),WIDTH/13-np.mod(x+WIDTH/2,WIDTH/13),
                             np.mod(d+DEPTH/2,DEPTH/16),DEPTH/16-np.mod(d+DEPTH/2,DEPTH/16)])
    light=1-.19*np.exp(-(joint/.006)**2)
    for p in rows:
        key=p['key'];a=p['turn'];ca=np.cos(a);sa=np.sin(a);dx=x-p['u']+U;dd=d-p['v']+V
        lx=ca*dx-sa*dd;lz=sa*dx+ca*dd
        if key in ('sushi','teppan','tea'):
            width,length,zoff={'sushi':(6.48,.50,.07),'teppan':(3.32,1.83,.18),'tea':(3.6,.57,.03)}[key]
            dist=np.hypot(np.maximum(0,np.abs(lx)-width/2),np.maximum(0,np.abs(lz-zoff)-length/2))
            light*=1-.35*np.exp(-(dist/.25)**1.4)
        elif key in ('chair','teaChair'):
            light*=1-.17*np.exp(-((lx/.31)**2+(lz/.31)**2))
            for side in [-1,1]:
                for end in [-1,1]:
                    light*=1-.30*np.exp(-(((lx-side*.205)/.053)**2+((lz-end*.182)/.052)**2))
    rgb=np.clip((tone+stone[:,:,None])*light[:,:,None],0,255).astype(np.uint8)
    def chunk(k,body):return struct.pack('>I',len(body))+k+body+struct.pack('>I',zlib.crc32(k+body)&0xffffffff)
    with TemporaryDirectory() as tmp:
        png=Path(tmp)/'stone.png'
        png.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(b'\0'+line.tobytes() for line in rgb),7))+chunk(b'IEND',b''))
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:85}).toFile(process.argv[2]);",str(png),str(here/'stone.webp')],cwd=here.parents[2],check=True)
    mesh=bpy.data.meshes.new('타마유라 · 바닥 한 면')
    mesh.from_pydata([(-WIDTH/2,DEPTH/2,.026),(WIDTH/2,DEPTH/2,.026),(WIDTH/2,-DEPTH/2,.026),(-WIDTH/2,-DEPTH/2,.026)],[],[(3,2,1,0)]);mesh.update()
    uv=mesh.uv_layers.new(name='방 전체의 돌 바닥')
    for p in mesh.polygons:
        for li,vi in zip(p.loop_indices,p.vertices):uv.data[li].uv=[(0,1),(1,1),(1,0),(0,0)][vi]
    return mesh
