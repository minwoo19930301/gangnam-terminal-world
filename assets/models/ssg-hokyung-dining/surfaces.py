"""Paint wood, leather, stone and framed folding fans into a single packed atlas."""
from math import pi
import bpy
import numpy as np

NAMES = ('walnut','leather','fan','fan-red','set-table')
def paint():
    w,h=768,256
    j,i=np.mgrid[0:h,0:w]
    u=(i+.5)/w; v=(j+.5)/h
    rng=np.random.default_rng(58)
    noise=rng.normal(0,1,(h,w))
    def rgb(base,gain):
        return np.array(base)[None,None,:]+gain[:,:,None]
    # Flow offsets and nested annual rings run along the long side of each board.
    wander=np.sin(u*3.9+v*9)+.37*np.sin(u*13+v*16)
    warp=v*39+1.16*wander+.13*np.sin(u*37+v*25)
    rings=np.cos(warp*2*pi)
    wood=rgb([113,65,44],2.8*rings-6*np.maximum(rings,0)**11+
             1.6*np.sin(2*pi*(warp*4+u*.7))+noise*2.5+
             3*np.sin(v*24+1.2*wander)+1.9*np.cos(u*4+v*7))
    placed=wood.copy()
    # Local ambient occlusion from dishes, the pot and the napkin holder.
    xx=(u-.5)*1.25; yy=(v-.5)*.98
    for x,y,wx,wy in [(.055,.205,.19,.155),(-.315,-.18,.068,.071),
                       (-.334,.024,.04,.04),(.423,-.21,.04,.04),
                       (.313,-.124,.065,.065),(.46,-.124,.065,.065),
                       (-.37,-.365,.11,.06),(.02,-.36,.085,.038)]:
        dist=((xx-x-.006)/wx)**2+((yy-y+.008)/wy)**2
        placed*=1-.29*np.exp(-dist**2)[:,:,None]
    leather=rgb([45,38,34],noise*3.8+1.4*np.cos((u*w+v*h)*2))
    def fan(red):
        # A hand-drawn half-open fan, paper folded around a low pivot.
        x=(u-.5)*2; y=(v-.15)*1.1
        r=np.hypot(x,y); a=np.arctan2(x,y)
        bg=rgb([137,122,104],noise*2.5+3*np.cos(v*12))
        shape=(r<.86)&(r>.10)&(abs(a)<1.32)
        folds=(np.cos(a*60)+1)/2
        paper=rgb([170,73,59] if red else [213,182,174],folds*19+noise*2)
        ribs=(folds>.972)&(r<.78)
        paper[ribs]=[131,91,65]
        paper[(r<.34)&(folds<.7)]=[83,69,55]
        for k in range(13):
            cx=.41*np.sin(k*19.4);cy=.42+.15*np.cos(k*4.7)
            t=np.arctan2(y-cy,x-cx);d=np.hypot(x-cx,y-cy)
            flower=d<(.027+.013*np.cos(t*5))
            paper[flower]=[230,202,160] if red else [152,88,76]
        bg[shape]=paper[shape]
        return bg
    atlas=np.concatenate([wood,leather,fan(False),fan(True),placed])
    rgba=np.ones((*atlas.shape[:2],4),np.float32)
    rgba[:,:,:3]=np.clip(atlas/255,0,1)
    image=bpy.data.images.new('호경전 목리와 부채 그림',width=w,height=h*len(NAMES),alpha=False)
    image.pixels.foreach_set(rgba.ravel()); image.pack()
    return image

def uv(section,u,v):
    return (.002+.996*u,(NAMES.index(section)+.008+.984*v)/len(NAMES))
