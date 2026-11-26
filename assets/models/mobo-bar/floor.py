"""Bake the furniture contact shadows with Cycles, then map the limestone to one floor quad."""
from math import cos,pi
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import bpy
import numpy as np
from mathutils import Vector

here=Path(__file__).resolve().parent
scene=bpy.context.scene
stone=bpy.data.collections['모보 바 · 석재 바닥과 접촉 그림자']
# Hide the separately editable blocks; the receiver takes their top profile.
stone.hide_render=True
scene.render.engine='CYCLES';scene.cycles.samples=48
scene.cycles.use_denoising=True
world=bpy.data.worlds.new('바닥 베이크 · 균일광')
world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.8,.8,.8,1)
scene.world=world
w,d=15.74,23.57
cx,cy=.205,8
mesh=bpy.data.meshes.new('하나의 석회석 바닥')
mesh.from_pydata([(cx+u*w,cy+v*d,.024) for u,v in [(-.5,-.5),(.5,-.5),(.5,.5),(-.5,.5)]],[],[(0,1,2,3)])
mesh.update()
uv=mesh.uv_layers.new(name='바닥')
for loop,value in zip(mesh.loops,[(0,0),(1,0),(1,1),(0,1)]):uv.data[loop.index].uv=value
target=bpy.data.objects.new('접촉 베이크 수광면',mesh)
scene.collection.objects.link(target)
nx,ny=896,1344
image=bpy.data.images.new('Cycles contact occlusion',width=nx,height=ny,alpha=False,float_buffer=True)
material=bpy.data.materials.new('Bake receiver');material.use_nodes=True
tex=material.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
material.node_tree.nodes.active=tex
mesh.materials.append(material)
bpy.ops.object.select_all(action='DESELECT')
target.select_set(True);bpy.context.view_layer.objects.active=target
bpy.context.view_layer.update()
bpy.ops.object.bake(type='AO',target='IMAGE_TEXTURES',margin=0,use_clear=True)
rgba=np.empty(nx*ny*4,dtype=np.float32)
image.pixels.foreach_get(rgba)
ambient=rgba.reshape(ny,nx,4)[:,:,0].copy()
# Stone colour is made in original metric coordinates. Low-frequency noise is
# continuous across neighbouring pixels; the grout antialiases at oblique views.
def noise(rows,cols,rng):
    values=rng.standard_normal((rows+1,cols+1)).astype('f4')
    xx=np.linspace(0,cols,nx,endpoint=False);yy=np.linspace(0,rows,ny,endpoint=False)
    i=xx.astype(int);j=yy.astype(int);tx=xx-i;ty=(yy-j)[:,None]
    tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty)
    a=values[j[:,None],i]*(1-tx)+values[j[:,None],i+1]*tx
    b=values[j[:,None]+1,i]*(1-tx)+values[j[:,None]+1,i+1]*tx
    return a*(1-ty)+b*ty
rng=np.random.default_rng(718)
xx=(np.arange(nx)+.5)[None,:]*13/nx;yy=(np.arange(ny)+.5)[:,None]*20/ny
minedge=np.minimum(np.minimum(xx%1,1-xx%1)*w/13,np.minimum(yy%1,1-yy%1)*d/20)
joint=np.clip((.009-minedge)/.009,0,1)
# Tile-by-tile stone hue, continuous mineral clouds, fine mineral particles.
chip=rng.normal(0,.036,(20,13))[yy.astype(int),xx.astype(int)]
grain=.028*noise(18,11,rng)+.015*noise(59,37,rng)+.009*noise(131,88,rng)+rng.normal(0,.009,(ny,nx))
base=np.array([.535,.493,.428])[None,None,:]
tone=(1+chip+grain-.27*joint)*(.39+.61*ambient)
rgb=np.clip(base*tone[:,:,None],0,1).astype('f4')
# Store a regular sRGB texture. The game supplies its current daylight and
# electric light after sampling; no midday shadow is hard-coded in the stone.
with TemporaryDirectory() as folder:
    tmp=Path(folder)
    rgba=rgba.reshape(ny,nx,4);rgba[:,:,:3]=rgb;rgba[:,:,3]=1
    image.pixels.foreach_set(rgba.ravel());image.update()
    image.filepath_raw=str(tmp/'stone.png');image.file_format='PNG';image.save()
    subprocess.run(['cwebp','-quiet','-q','83',str(tmp/'stone.png'),'-o',str(tmp/'stone.webp')],check=True)
    # Make the GPU origin coincide with the same placement that the native master uses.
    for v in mesh.vertices:v.co-=Vector((cx,cy,0))
    bpy.ops.export_scene.gltf(filepath=str(tmp/'floor.glb'),export_format='GLB',use_selection=True,
                               export_materials='NONE',export_texcoords=True,export_yup=True)
    subprocess.run(['node',str(here/'floor-material.mjs'),str(tmp/'floor.glb'),str(tmp/'stone.webp'),str(here/'stone.glb')],check=True)
print('Cycles floor AO range and median',float(ambient.min()),float(np.median(ambient)),float(ambient.max()))
