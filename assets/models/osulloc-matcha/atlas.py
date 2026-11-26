"""Small original finish atlas for the onyx, steel and illustrated drink panel."""
from pathlib import Path
import struct, zlib
import numpy as np

WIDTH,HEIGHT=512,384
STONE=(2,2,509,221)
POSTER=(5,230,131,380)
STEEL=(143,231,307,374)
TABLET=(316,234,498,351)
WHITE=(501,375)

def noise(x,y,seed):
    # Continuous value noise for warped mineral bands and crushed-ice fragments.
    def rand(i,j):
        a=np.sin(i*127.1+j*311.7+seed*18.37)*43758.5453
        return a-np.floor(a)
    i,j=np.floor(x),np.floor(y);u,v=x-i,y-j
    u=u*u*(3-2*u);v=v*v*(3-2*v)
    return (1-v)*((1-u)*rand(i,j)+u*rand(i+1,j))+v*((1-u)*rand(i,j+1)+u*rand(i+1,j+1))

def smooth(a,b,v):
    t=np.clip((v-a)/(b-a),0,1)
    return t*t*(3-2*t)
def mix(a,b,k):return np.asarray(a)*(1-k[...,None])+np.asarray(b)*k[...,None]

def write(path):
    img=np.full((HEIGHT,WIDTH,3),255.,dtype=float)
    yy,xx=np.mgrid[0:225,0:WIDTH]
    x=xx/108;y=yy/116
    a=noise(x*.82,y*.78,1)
    b=noise(x*2.3+a*1.7,y*2.4-a*.9,7)
    c=noise(x*4.6+b*.85,y*4.2+a*.95,19)
    edge=noise(x*1.6+c*.58+b*.94,y*1.9+b*.84-a*.73,23)
    fine=noise(x*13,y*11,9)
    shade=np.clip(.10+.48*a+.49*b+.18*c-.17*fine,0,1)
    base=mix([143,157,105],[228,230,194],shade)
    # Angular calcite junctions cut across the softer cloudy green layers.
    # A warped Voronoi boundary breaks into short facets at three scales.
    qx=x*1.92+.63*b+.21*c
    qy=y*2.22-.54*a+.14*noise(x*8,y*8,38)
    ix,iy=np.floor(qx),np.floor(qy)
    first=np.full(x.shape,100.);second=first.copy()
    for dx in [-1,0,1]:
        for dy in [-1,0,1]:
            gx,gy=ix+dx,iy+dy
            jx=noise(gx,gy,51);jy=noise(gx,gy,72)
            distance=np.hypot(gx+.16+.68*jx-qx,gy+.16+.68*jy-qy)
            second=np.minimum(second,np.maximum(first,distance));first=np.minimum(first,distance)
    fracture=second-first
    coarse=np.abs(edge+.085*noise(x*7,y*9,12)-.51)
    grains=noise(x*17,y*16,16)
    band=(1-smooth(.005,.066,coarse))*.49
    small=(1-smooth(.006,.052,fracture))*(.30+.59*grains)
    foliation=(1-smooth(.01,.052,np.abs(c+.105*grains-.49)))*.22
    marble=mix(base,[248,244,220],np.clip(band+small+foliation,0,.94))
    gold=(1-smooth(.018,.15,fracture))*.29*(1-b)
    img[:225]=mix(marble,[192,165,104],gold)+(grains[...,None]-.5)*4.5
    px0,py0,px1,py1=POSTER
    yy,xx=np.mgrid[0:py1-py0+1,0:px1-px0+1];u=xx/(px1-px0);v=yy/(py1-py0)
    grain=noise(u*91,v*97,5)
    paper=mix([57,128,107],[89,161,143],.58*u+.42*(1-v))
    left=.03+.111*v;right=.97-.102*v
    inside=(u>left)&(u<right)&(v>.225)
    field=noise(u*3.7,v*4.0,98);detail=noise(u*17,v*22,8)
    layer=smooth(.35,.81,v+.14*field-.085*np.sin(u*14+field*6))
    drink=mix([63,103,35],[222,229,206],layer)
    drink=mix(drink,[35,70,28],(1-layer)*.36*detail)
    # Bright edges of the transparent tumbler, crushed ice and its dark green rim.
    rim=np.square((u-.5)/.48)+np.square((v-.226)/.025)
    drink=mix(drink,[221,232,204],.64*np.exp(-np.square((u-left)/.014))+.15*np.exp(-np.square((u-right)/.018)))
    paper[inside]=drink[inside]
    paper=mix(paper,[42,82,39],1-smooth(.78,1.0,rim))
    rimline=(1-smooth(.04,.22,np.abs(rim-.9)))
    paper=mix(paper,[212,226,193],rimline*.7)
    pattern=noise(u*22,v*15,43)
    foam=inside&(v<.292)&(pattern>.50)
    paper[foam]=mix(paper,[171,192,111],np.full(v.shape,.58))[foam]
    img[py0:py1+1,px0:px1+1]=paper+(grain[...,None]-.5)*4
    x0,y0,x1,y1=STEEL
    yy,xx=np.mgrid[0:y1-y0+1,0:x1-x0+1];u=xx/(x1-x0);v=yy/(y1-y0)
    intensity=.06+.75*np.exp(-((v-.17)/.105)**2)+.47*np.exp(-((v-.86)/.19)**2)+.075*u
    finish=mix([94,108,113],[244,247,244],intensity)
    img[y0:y1+1,x0:x1+1]=finish+(noise(u*7,v*180,31)[...,None]-.5)*8
    # Original small illustrated drink menu on the inclined tablet. Three
    # layered glasses, rounded rims and shaded scoops remain legible up close.
    x0,y0,x1,y1=TABLET
    yy,xx=np.mgrid[0:y1-y0+1,0:x1-x0+1];u=xx/(x1-x0);v=yy/(y1-y0)
    tablet=mix([241,239,221],[255,249,226],u*.3+.32)
    for idx,cx in enumerate([.20,.50,.80]):
        dx=(u-cx)/.095
        tablet=mix(tablet,[164,167,145],.24*np.exp(-((dx/1.05)**2+((v-.80)/.047)**2)*2))
        shape=(v>.36)&(v<.79)&(np.abs(dx)<(.83-(v-.36)*.54))
        liquid=mix([105,143,78],[224,228,196],smooth(.48,.67,v+.045*np.sin(dx*4+idx)))
        base_color=([87,112,54],[178,62,66],[221,167,49])[idx]
        liquid=mix(liquid,base_color,smooth(.64,.71,v+.028*np.sin(dx*6+idx)))
        shine=.36*np.exp(-((dx+.57)/.055)**2)
        liquid=mix(liquid,[255,254,238],shine)
        tablet[shape]=liquid[shape]
        rr=(dx/.85)**2+((v-.36)/.030)**2
        tablet=mix(tablet,[98,129,81],1-smooth(.68,1.00,rr))
        for k in range(4):
            rr=((dx+(k-1.5)*.25)/.33)**2+((v-(.323+abs(k-1.5)*.014))/.047)**2
            tablet=mix(tablet,([165,184,108],[226,190,177],[211,202,125])[idx],.82*(1-smooth(.3,1.,rr)))
    img[y0:y1+1,x0:x1+1]=tablet
    data=np.uint8(np.clip(img,0,255));delta=data.copy();delta[:,1:]=data[:,1:]-data[:,:-1]
    raw=b''.join(b'\x01'+r.tobytes() for r in delta)
    def chunk(t,b):return struct.pack('!I',len(b))+t+b+struct.pack('!I',zlib.crc32(t+b)&0xffffffff)
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',WIDTH,HEIGHT,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
