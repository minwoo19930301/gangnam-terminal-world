"""Bake a small panorama from the editable tent and furniture for the game's polished kettle."""
from math import pi
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def bake(collection):
    origin=Vector((-.035,-1.075,.625))
    points=[];faces=[];colours=[]
    bpy.context.view_layer.update()
    for ob in collection.objects:
        if ob.get('vesselPart'):continue
        offset=len(points);points.extend(tuple(ob.matrix_world@v.co)for v in ob.data.vertices)
        colour=ob.data.materials[0].diffuse_color[:3]
        for f in ob.data.polygons:
            faces.append(tuple(offset+n for n in f.vertices));colours.append(colour)
    bvh=BVHTree.FromPolygons(points,faces)
    w,h=384,192
    lon,lat=np.meshgrid(((np.arange(w)+.5)/w-.5)*2*pi,((np.arange(h)+.5)/h-.5)*pi)
    dz=np.sin(lat);dx=np.cos(lat)*np.cos(lon);dy=np.cos(lat)*np.sin(lon)
    dirs=np.stack([dx,dy,dz],axis=2);top=dz>.215;floor=dz<-.095
    edge=np.maximum(0,np.cos(lon*4.0+.35))**24
    bounce=.025*np.sin(lon*16+np.sin(lat*3))
    envelope=np.where(top,.83+.065*np.cos(lon*2),np.where(floor,.40,.72-.51*edge))+bounce
    strip=np.exp(-((dz-.60+.121*np.sin(lon*3))/.032)**2)
    env=np.stack((envelope*1.03, envelope*.995, envelope*.94),axis=2)+strip[:,:,None]*.46
    for j in range(h):
        for i in range(w):
            p,n,idx,dist=bvh.ray_cast(origin,Vector(dirs[j,i]),10)
            if p is not None:
                c=np.array(colours[idx]);illum=.46+.47*max(0,n.z)+.19*max(0,-n.y)
                env[j,i]=np.maximum(.025,c*illum+.045)
    # This image is colour data. bpy.pixels in this generated image are saved as
    # raw sRGB bytes, then sampled as an sRGB colour texture by Three.
    env=np.clip(env,.008,1);rgb=np.where(env<=.0031308,12.92*env,1.055*env**(1/2.4)-.055)
    rgba=np.ones((h,w,4),np.float32);rgba[:,:,:3]=rgb
    im=bpy.data.images.new('Snow Peak · tent reflection',width=w,height=h,alpha=False)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(rgba.ravel());im.pack()
    return im
