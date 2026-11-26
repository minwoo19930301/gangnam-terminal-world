"""Draw original lobed leaves, persistent twigs and grey bark for five street-view seasons."""
import math
import random
import struct
import zlib
import numpy as np

TILE=64
SS=3
SIZE=TILE*SS
SUMMER,AUTUMN,RETAINED,BARE,BUD=range(5)
PHASES=[(0,RETAINED),(301,BARE),(405,BUD),(501,SUMMER),(1001,AUTUMN),(1120,RETAINED)]
# RGB swatches observed in shade and direct light, without using source photograph pixels.
PALETTE=[
    ('3b5b30','547641','70914a','385736','809f51'),
    ('536a36','879347','b58b45','9b653e','7b823e','74543a'),
    ('6e4b39','925e41','a7724e','886141','b78355','79503c'),
    ('897158',),
    ('789344','9aaa59','a4b763','7d944f','b9c173'),
]
BASE=['536b3e','8b783e','956747','6a594c','94a44d']


def rgb(text):
    return np.array([int(text[i:i+2],16) for i in (0,2,4)],dtype=np.float64)


def polygon(image, points, color):
    p=np.asarray(points)*SS
    x0=max(0,math.floor(p[:,0].min()));x1=min(SIZE,math.ceil(p[:,0].max()+1))
    y0=max(0,math.floor(p[:,1].min()));y1=min(SIZE,math.ceil(p[:,1].max()+1))
    if x0>=x1 or y0>=y1:return
    y,x=np.mgrid[y0:y1,x0:x1]+.5
    inside=np.zeros(x.shape,dtype=bool)
    for (ax,ay),(bx,by) in zip(p,np.roll(p,-1,axis=0)):
        if abs(ay-by)<1e-9:continue
        inside^=((ay>y)!=(by>y))&(x<(bx-ax)*(y-ay)/(by-ay)+ax)
    image[y0:y1,x0:x1][inside]=color


def stroke(image, a, b, r0, r1, color):
    ax,ay=a;bx,by=b
    length=math.hypot(bx-ax,by-ay)
    if length<.0001:return
    nx,ny=-(by-ay)/length,(bx-ax)/length
    polygon(image,[(ax+nx*r0,ay+ny*r0),(bx+nx*r1,by+ny*r1),
                   (bx-nx*r1,by-ny*r1),(ax-nx*r0,ay-ny*r0)],color)


def mix(a,b,t):
    return (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)


# The narrower notches separate the pointed lobes of the oak leaf.
OUTLINE=[(0,0),(.17,.13),(.27,.47),(.37,.21),(.42,.60),(.50,.46),(.53,.19),
         (.65,.53),(.69,.32),(.78,.22),(.84,.28),(1,0),(.81,-.16),(.74,-.34),
         (.67,-.36),(.61,-.16),(.55,-.48),(.48,-.58),(.39,-.21),(.31,-.36),(.18,-.12)]


def leaf(image, base, direction, length, width, tone):
    unit=(math.cos(direction),math.sin(direction));perp=(-unit[1],unit[0])
    points=[(base[0]+x*length*unit[0]+y*width*perp[0],base[1]+x*length*unit[1]+y*width*perp[1]) for x,y in OUTLINE]
    color=np.clip(tone,0,255).astype(np.uint8)
    polygon(image,points,(*color,255))
    end=(base[0]+unit[0]*length*.82,base[1]+unit[1]*length*.82)
    line=np.clip(tone*1.12+3,0,255).astype(np.uint8)
    stroke(image,base,end,.20,.065,(*line,255))


def spray(variant, phase):
    # Straight alpha keeps the fine pinnate outline clean in the single masked draw.
    image=np.empty((SIZE,SIZE,4),dtype=np.uint8)
    image[:,:,:3]=rgb(BASE[phase]);image[:,:,3]=0
    rng=random.Random(1031+variant*73)
    base=(30+rng.uniform(-3,3),63.2)
    middle=(31+rng.uniform(-4,4),34+rng.uniform(-2,2))
    tip=(30+rng.uniform(-8,8),3.5+rng.uniform(-1,1))
    wood=(88,71,55,255);lighter=(102,79,54,255)
    stroke(image,base,middle,.90,.55,wood);stroke(image,middle,tip,.56,.16,lighter)
    leaves=[]
    for k in range(13):
        f=(k+.65)/14
        stem=mix(base,middle,f*2) if f<.5 else mix(middle,tip,(f-.5)*2)
        side=-1 if (k+variant)%2 else 1
        reach=8+14*math.sin(f*math.pi)**.75+rng.uniform(-2,2)
        twig=(stem[0]+reach*side,stem[1]-rng.uniform(6,11))
        stroke(image,stem,twig,.55*(1-f*.55),.12,lighter)
        for j in range(4):
            t=(j+.5)/4.55
            at=mix(stem,twig,t)
            v=side*(.85 if j%2 else .44)
            ang=math.atan2(-(.70 if j%2 else .97),v)+rng.uniform(-.5,.5)
            leaves.append((at,ang,rng.uniform(5.6,10.1),rng.uniform(3.7,6.3),rng.random(),rng.random(),rng.random()))
    for at,angle,length,width,hold,hue,sheen in leaves:
        if phase==BARE or (phase==RETAINED and hold>.68) or (phase==BUD and hold>.56):continue
        if phase==RETAINED:
            angle+=.62 if math.cos(angle)>0 else -.62
            width*=.90;length*=.92
        if phase==BUD:
            length*=.59;width*=.56
        colors=PALETTE[phase]
        tone=rgb(colors[min(len(colors)-1,int(hue*len(colors)))])*(.92+.16*sheen)
        leaf(image,at,angle,length,width,tone)
    return downsample(image)


def downsample(high):
    sample=high.reshape(TILE,SS,TILE,SS,4).astype(np.float64)
    opacity=sample[:,:,:,:,3:4]/255
    avg_alpha=opacity.mean(axis=(1,3));avg_rgb=(sample[:,:,:,:,:3]*opacity).mean(axis=(1,3))
    out=np.empty((TILE,TILE,4),dtype=np.uint8)
    bg=sample[:,:,:,:,:3].mean(axis=(1,3))
    out[:,:,:3]=np.where(avg_alpha>.001,avg_rgb/np.maximum(.001,avg_alpha),bg).clip(0,255)
    out[:,:,3]=(avg_alpha[:,:,0]*255).round().astype(np.uint8)
    return out


def bark_tile():
    y,x=np.mgrid[0:TILE,0:TILE]
    # Fine, broken longitudinal ridges, no high-contrast crosshatching.
    drift=x+1.1*np.sin(y*.17+x*.16)+.6*np.cos(y*.31)
    shade=(4*np.sin(drift*.73)+3*np.sin(drift*1.54)+2*np.cos(y*.33+x*.81))
    base=np.array([100,91,78])[None,None,:]
    out=np.ones((TILE,TILE,4),dtype=np.uint8)*255
    out[:,:,:3]=np.clip(base+shade[:,:,None],0,255).astype(np.uint8)
    return out


def write_atlas(path):
    # Native UV y increases upward. GLTFLoader uses the inverted glTF V coordinate.
    atlas=np.zeros((TILE*8,TILE*4,4),dtype=np.uint8)
    bark=bark_tile()
    for phase in range(5):
        y=(7-phase)*TILE
        atlas[y:y+TILE,:TILE]=bark
        for i in range(1,4):
            atlas[y:y+TILE,i*TILE:(i+1)*TILE]=spray(i,phase)
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    h,w=atlas.shape[:2]
    rows=b''.join(b'\0'+row.tobytes() for row in atlas)
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(rows,9))+chunk(b'IEND',b''))
