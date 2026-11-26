"""Bake static showroom colours from the editable retail furniture for the window's low-cost optical material."""
from math import cos,pi,sin
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

# Blender coordinates relative to the model origin. Texture +X is longitude zero.
EYE=np.array([-2.85,-7.68,1.57],dtype=np.float64)
NAME='Berluti · showroom reflections'
def bake(collection):
    vertices=[];faces=[];colors=[]
    bpy.context.view_layer.update()
    for ob in collection.objects:
        if ob.get('retailPackage')=='frontage':continue
        me=ob.data;offset=len(vertices);vertices.extend(tuple(ob.matrix_world@v.co) for v in me.vertices)
        a=me.color_attributes.active_color
        for poly in me.polygons:
            faces.append(tuple(offset+j for j in poly.vertices))
            indices=poly.vertices if a and a.domain=='POINT' else poly.loop_indices
            c=a.data[indices[0]].color if a and len(indices) else (.35,.29,.22,1)
            colors.append(c[:3])
    bvh=BVHTree.FromPolygons(vertices,faces)
    # The softly lit envelope has the warm floor and pale ceiling visible in the
    # retailer's photograph. Rays that meet built merchandise take its actual colour.
    w,h=448,224
    lat=((np.arange(h)+.5)/h-.5)*pi
    lon=((np.arange(w)+.5)/w-.5)*2*pi
    lat,lon=np.meshgrid(lat,lon,indexing='ij')
    vx=np.cos(lat)*np.cos(lon);vy=np.cos(lat)*np.sin(lon);vz=np.sin(lat)
    dirs=np.stack((vx,vy,vz),axis=2)
    bounds=[(-6.3,6.3),(-15.2,1.56),(0,3.54)]
    with np.errstate(divide='ignore'):
        lengths=np.stack([np.where(dirs[:,:,axis]>0,(b-EYE[axis])/dirs[:,:,axis],(a-EYE[axis])/dirs[:,:,axis]) for axis,(a,b) in enumerate(bounds)],axis=2)
    face=np.argmin(lengths,axis=2);dist=np.min(lengths,axis=2);hit=EYE+dirs*dist[:,:,None]
    x,y,z=hit[:,:,0],hit[:,:,1],hit[:,:,2]
    img=np.empty((h,w,3),dtype=np.float32)
    img[:]=(.68,.61,.51)
    floor=(face==2)&(vz<0);ceiling=(face==2)&~floor
    zig=np.where((np.floor((x+6.5)*1.8)%2)==0,y+.55*x,y-.55*x)
    wood=.90+.08*np.sin(zig*25+.42*np.sin(x*4))+.035*np.cos(zig*83)+.035*np.sin(zig*151)
    public=(y< -7.75)
    for k,(inside,outside) in enumerate(zip((.48,.325,.208),(.70,.645,.55))):img[:,:,k][floor]=(np.where(public,outside,inside)*wood)[floor]
    line=np.maximum(np.exp(-((x+4.9)/.12)**2),np.exp(-((x-4.25)/.14)**2))
    dots=np.exp(-((np.mod(x+6.5,2.68)-1.34)/.075)**2-((np.mod(y+15,2.35)-1.175)/.08)**2)
    for k,b in enumerate((.78,.74,.65)):img[:,:,k][ceiling]=(b+line*.22+dots*.72)[ceiling]
    side=(face==0);panel=((np.floor((y+15.2)/1.75)%4)==1)
    far=(face==1)&(vy<0)
    for k,(light,dark) in enumerate(zip((.64,.56,.45),(.175,.11,.068))):
        img[:,:,k][side]=np.where(panel,dark,light)[side]
        shelves=((np.floor((x+6.2)/1.3)%3)==1)&(z> .47)&(z<2.71)
        img[:,:,k][far]=np.where(shelves,dark*.76,light)[far]
    # BVH intersections are restricted to the sight cone of the actual shop furniture.
    for j,i in zip(*np.nonzero((vy>.13)&(vz<.45)&(vz>-.50))):
        d=dirs[j,i];p,n,idx,length=bvh.ray_cast(Vector(EYE),Vector(d),float(dist[j,i]))
        if p is not None:
            tint=np.asarray(colors[idx]);light=.70+.40*max(0,n.z)+.11*max(0,-n.y)
            img[j,i]=np.clip(tint*light+.014,0,1)
    # bpy image.pixels are bottom-up. Our increasing latitude already matches this layout.
    rgba=np.ones((h,w,4),np.float32);rgba[:,:,:3]=np.clip(img,.012,1)
    im=bpy.data.images.new(NAME,width=w,height=h,alpha=False)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(rgba.ravel());im.pack()
    return im
