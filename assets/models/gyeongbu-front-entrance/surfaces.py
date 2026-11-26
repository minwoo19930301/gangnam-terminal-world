"""One original 256px repeat per finish; no source-photo pixels."""
import math
import struct
import zlib
import numpy as np

COLOURS=[(111,115,119),(73,78,83),(190,137,128),(116,87,77),
         (224,220,210),(72,82,91),(222,226,222),(108,151,172)]
N=256

def make_image(file):
    yy,xx=np.mgrid[0:N,0:N]/N
    tiles=[]
    for k,base in enumerate(COLOURS):
        rnd=np.random.default_rng(194+k)
        def cloud():
            f=np.zeros_like(xx)
            for freq,amp in [(1,1.9),(2,1.0),(4,.6),(11,.44),(15,.29)]:
                fx,fy=rnd.integers(1,4,2);angle=rnd.uniform(0,math.tau)
                f+=amp*np.sin(math.tau*freq*(fx*xx+fy*yy)+angle)
            return f
        grain=cloud() + rnd.normal(0,.96,(N,N))
        if k in [0,1]:grain=cloud()*.16+rnd.normal(0,1.15,(N,N))
        if k==2:
            grain=cloud()*.39+rnd.normal(0,.97,(N,N))
            # Fine vertically laid red ceramic slips. Mortar recedes into a
            # quiet field at street distance, as in the January road view.
            sx=np.mod(xx*8,.99999);sy=np.mod(yy*4+np.floor(xx*8)%2*.5,1)
            grain+=(sx<.029)*-3.4+(sy<.027)*-3.1+(sx>.97)*1.7
        if k==3:
            sx=np.mod(xx*3 + np.floor(yy*10)%2*.5,1);sy=np.mod(yy*10,1)
            grain-=np.maximum(sx<.023,sy<.064)*8.2
        if k==6:grain=grain*.6+rnd.normal(0,.85,(N,1))
        tiles.append(np.clip(np.array(base)+grain[:,:,None],0,255).astype(np.uint8))
    pixels=np.vstack((np.hstack(tiles[4:]),np.hstack(tiles[:4])))
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d))
    raw=b''.join(b'\0'+row.tobytes() for row in pixels)
    file.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',4*N,2*N,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,8))+chunk(b'IEND',b''))
