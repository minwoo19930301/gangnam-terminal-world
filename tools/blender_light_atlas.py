"""Compress Cycles diffuse irradiance into a bounded, denoised game light atlas."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import struct
import zlib

import numpy as np

def game_image(path,image):
    w,h=image.size
    pixels=np.empty(w*h*4,dtype=np.float32);image.pixels.foreach_get(pixels)
    light=pixels.reshape(h,w,4)[:,:,:3];hit=np.max(light,axis=2)>.00001
    # The runtime still supplies its indoor fill, direct highlights and the night clock. Scale those
    # by the spatial variation from this real bake, reserving headroom above the neutral midpoint.
    print('LIGHT',path.stem, np.quantile(light[hit],[.05,.25,.5,.75,.95,.99]).round(3).tolist(),flush=True)
    gain=np.clip(.38+.72*np.power(np.maximum(0,light),.66),.36,1.94)
    # A bounded bilateral pass removes Monte Carlo grain on smooth plaster while
    # keeping the dark reveals between relief panels and their cast shadows.
    for stride in (1,1,2,2):
        total=gain.copy();weight=np.ones(gain.shape[:2],dtype=np.float32)
        for dx,dy,spatial in [(1,0,.88),(-1,0,.88),(0,1,.88),(0,-1,.88),(1,1,.67),(-1,1,.67),(1,-1,.67),(-1,-1,.67)]:
            shifted=np.roll(gain,(dy*stride,dx*stride),(0,1))
            delta=np.mean((gain-shifted)**2,axis=2)
            wgt=spatial*np.exp(-delta/.045)
            total+=shifted*wgt[:,:,None];weight+=wgt
        gain=total/weight[:,:,None]
    rgb=np.rint(gain[::-1]*127.5).astype(np.uint8)
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
    with TemporaryDirectory() as tmp:
        png=Path(tmp)/'light.png'
        png.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(b'\0'+row.tobytes() for row in rgb),7))+chunk(b'IEND',b''))
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:88}).toFile(process.argv[2]);",str(png),str(path)],cwd=path.parent.parents[2],check=True)
