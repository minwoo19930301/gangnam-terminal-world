"""Project the two stops' six original game views into a small four-row glass reflection atlas."""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
source=Path(sys.argv[1]);dest=Path(sys.argv[2])
w,h=320,160
a,p=np.meshgrid(2*np.pi*((np.arange(w)+.5)/w-.5),np.pi*(.5-(np.arange(h)+.5)/h))
ray=np.stack((np.cos(p)*np.cos(a),np.sin(p),np.cos(p)*np.sin(a)),axis=-1)
canvas=Image.new('RGB',(w,h*4));row=0
for route in ['142','360']:
    for mode in ['day','night']:
        pixels=np.zeros((h,w,3),dtype=np.uint8);best=np.zeros((h,w))
        for i in range(6):
            file=source/f'{route}-{mode}-{i}'
            matrix=np.asarray(json.loads(file.with_suffix('.matrix').read_text())).reshape(4,4).T[:3,:3]
            local=ray@matrix.T;depth=-local[:,:,2]
            active=depth>best
            safe=np.where(active,depth,1)
            img=np.asarray(Image.open(file.with_suffix('.png')).convert('RGB'));size=img.shape[0]
            x=np.clip((size*(.5+.5*local[:,:,0]/safe)).astype('int32'),0,size-1)
            y=np.clip((size*(.5-.5*local[:,:,1]/safe)).astype('int32'),0,size-1)
            pixels[active]=img[y[active],x[active]];best[active]=depth[active]
        panorama=Image.fromarray(pixels).filter(ImageFilter.GaussianBlur(1.35))
        canvas.paste(panorama,(0,row*h));row+=1
canvas.save(dest,quality=86,method=6)
