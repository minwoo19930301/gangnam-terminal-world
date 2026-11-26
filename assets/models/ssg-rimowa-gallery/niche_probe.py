"""Bake the public display's oak, satin metal and lighting as seen by the case."""
from math import pi
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def bake(collection,frame):
    points=[];faces=[];colours=[]
    keep=('오크','금속 안쪽','헤어라인','브러시드','확산','조명','렌즈')
    origin=Vector((0,-.245,1.095))
    inv=frame.inverted()
    for ob in collection.objects:
        if ob.type!='MESH':continue
        hero=ob.get('retailPackage')=='RimowaNiche'
        if hero and not ob.name.startswith(keep):continue
        m=inv@ob.matrix_world;offset=len(points)
        points.extend(tuple(m@v.co)for v in ob.data.vertices)
        if hero:
            if ob.name.startswith('오크'):rgb=(.48,.32,.19)
            elif '조명' in ob.name or '확산' in ob.name or '렌즈' in ob.name:rgb=(1.7,1.61,1.42)
            else:rgb=(.74,.71,.67)
        else:rgb=ob.data.materials[0].diffuse_color[:3]
        for f in ob.data.polygons:
            faces.append(tuple(offset+i for i in f.vertices));colours.append(rgb)
    tree=BVHTree.FromPolygons(points,faces)
    w,h=384,192
    lon,lat=np.meshgrid(((np.arange(w)+.5)/w-.5)*2*pi,((np.arange(h)+.5)/h-.5)*pi)
    dz=np.sin(lat);dx=np.cos(lat)*np.cos(lon);dy=np.cos(lat)*np.sin(lon)
    direction=np.stack((dx,dy,dz),axis=2)
    stripe=np.maximum(0,np.cos(lon*4-.45))**8
    room=np.where(dz>.31,.90,np.where(dz<-.17,.68,.78-.47*stripe))
    strip=np.exp(-((dz-.64-.13*np.cos(lon*3))/.12)**2)
    env=np.stack((room*1.03,room,room*.95),axis=2)+.28*strip[:,:,None]
    for j in range(h):
        for i in range(w):
            hit,normal,index,dist=tree.ray_cast(origin,Vector(direction[j,i]),12)
            if hit is not None:
                bounce=.64+.28*max(0,normal.z)+.10*max(0,-normal.y)
                env[j,i]=np.asarray(colours[index])*bounce+.095
    env=np.clip(env,.012,1.);env=np.where(env<=.0031308,12.92*env,1.055*env**(1/2.4)-.055)
    rgba=np.ones((h,w,4),np.float32);rgba[:,:,:3]=env
    image=bpy.data.images.new('Rimowa oak and steel reflection',width=w,height=h,alpha=False)
    image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(rgba.ravel());image.pack()
    return image
