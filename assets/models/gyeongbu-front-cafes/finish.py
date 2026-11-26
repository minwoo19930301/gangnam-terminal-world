"""Eight original storefront finishes, including fired brick and two types of folded steel."""
import math
import struct
import zlib
import numpy as np

PALETTE=[(55,73,92),(163,110,87),(57,103,178),(78,67,56),(225,226,222),(103,122,126),(199,173,125),(62,70,73)]

def make_image(file):
    n=256
    y,x=np.mgrid[:n,:n]
    random=np.random.default_rng(193601)
    tiles=[]
    for i,rgb in enumerate(PALETTE):
        grain=random.normal(0,.95,(n,n))+.38*np.sin(x*.095+y*.027)
        if i==0:
            grain+=.85*np.cos(math.tau*x/6.4)+1.3*(x%32==1)-1.3*(x%32==0)
        if i==1:
            # Staggered long slips, contrasting fired faces, worn mortar and small sand grains.
            row=y//16
            shifted=(x+(row%2)*32)%256;col=shifted//64
            bed=np.minimum(y%16,15-y%16);head=np.minimum(shifted%64,63-shifted%64)
            edge=np.minimum(bed,head)
            value=random.normal(0,7.5,(16,4))[row,col]
            pulse=1.7*np.sin(.13*x+.15*y)+1.7*np.cos(.27*x-.10*y)
            raw=np.array(rgb)+((value+pulse+random.normal(0,2.5,(n,n)))[:,:,None])
            joint=np.array((131,119,103))+grain[:,:,None]
            raw=np.where((edge<.8)[:,:,None],joint,raw)
            raw+=((edge==1)*2.2-(edge==2)*1.4)[:,:,None]
        else:
            if i==2:grain+=1.08*np.cos(math.tau*x/88)-1.5*(x%64==0)
            if i==3:grain+=1.5*np.sin(x*.64+.85*np.cos(y*.034))+.7*np.sin(x*1.24)
            if i==5:grain=2.0*np.cos(math.tau*(x*.22+y*.44)/256)+random.normal(0,.34,(n,n))
            if i==6:grain=.42*grain+random.normal(0,.60,(n,1))
            raw=np.array(rgb)+grain[:,:,None]
        tiles.append(np.clip(raw,0,255).astype(np.uint8))
    canvas=np.vstack((np.hstack(tiles[4:]),np.hstack(tiles[:4])))
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d))
    raw=b''.join(b'\0'+a.tobytes() for a in canvas)
    file.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',1024,512,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,8))+chunk(b'IEND',b''))
