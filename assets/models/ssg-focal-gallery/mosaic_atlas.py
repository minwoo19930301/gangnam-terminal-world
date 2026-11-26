"""Render the native 8 mm cell finishes and bevels into one close-view PBR material."""
from pathlib import Path
import bpy
import numpy as np
from mosaic_pattern import W,H
from mosaic_model import TRIM
STEP=5;AW=W*STEP+40;AH=H*STEP
def encoded_image(name,rgb,noncolour=False):
    h,w=rgb.shape[:2];im=bpy.data.images.new(name,width=w,height=h,alpha=False)
    rgba=np.ones((h,w,4),np.float32);rgba[:,:,:3]=np.clip(rgb,0,1)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(rgba.ravel());im.pack()
    return im
def bake(modules):
    # Read the *edited* native polygons. Repainting a tile or changing its
    # backlight in Blender survives re-export without rerunning the generator.
    field=np.zeros((H,W,3),np.float32);lights=np.zeros((H,W),np.int32)
    for ob in modules:
        px,py=ob['moduleGrid'];m=ob.data;attr=m.color_attributes['Brick colour'];strength=m.attributes['Backlight']
        colour=np.empty(len(attr.data)*4,np.float32);attr.data.foreach_get('color',colour)
        native=colour.reshape(16,16,8,4)[:,:,4,:3]
        srgb=np.where(native<=.0031308,12.92*native,1.055*np.maximum(native,.0031308)**(1/2.4)-.055)
        field[py*16:py*16+16,px*16:px*16+16]=srgb
        emission=np.array([strength.data[i*5+4].value if m.polygons[i*5+4].material_index==1 else 0 for i in range(256)],np.int32)
        lights[py*16:py*16+16,px*16:px*16+16]=emission.reshape(16,16)
    base=np.zeros((AH,AW,3),np.float32);emit=np.zeros_like(base);norm=np.zeros_like(base);norm[:,:,0:2]=.5;norm[:,:,2]=1
    y,x=np.meshgrid(np.arange(AH),np.arange(W*STEP),indexing='ij');gx=x//STEP;gy=y//STEP
    fx=x%STEP;fy=y%STEP;col=field[gy,gx];glow=lights[gy,gx]
    seam=np.where((fx==0)|(fy==0),.53,1.)
    seam*=np.where(((gx%16==0)&(fx==0))|((gy%16==0)&(fy==0)),.65,1.)
    sheen=np.where((fx==1)|(fy==STEP-1),.095,0) - np.where((fx==STEP-1)|(fy==1),.055,0)
    jitter=1.+np.sin(gx*2.67+gy*4.48)*.021
    base[:,:W*STEP]=np.clip(col*(seam*jitter)[:,:,None]+sheen[:,:,None]*np.sqrt(col),0,1)
    emit[:,:W*STEP]=col*(np.minimum(1,glow*.35)*seam)[:,:,None]
    nx=np.where(fx==1,-.44,np.where(fx==STEP-1,.40,0))
    ny=np.where(fy==1,-.40,np.where(fy==STEP-1,.44,0))
    nz=np.sqrt(np.maximum(.05,1-nx*nx-ny*ny))
    norm[:,:W*STEP]=np.stack([.5+.5*nx,.5+.5*ny,.5+.5*nz],axis=2)
    for i,(hexcode,rough)in enumerate(TRIM.values()):
        c=[int(hexcode[j:j+2],16)/255 for j in(0,2,4)]
        base[i*36:(i+1)*36,W*STEP:]=c
    return [encoded_image('Brick portrait '+name,img)for name,img in [('colour',base),('light',emit),('bevel',norm)]]
