"""One UV sheet for the oak, printed information, and woven mop demonstration."""
import subprocess
import tempfile
import bpy
from pathlib import Path
from mathutils import Vector

W,H=1024,768
BANDS={'wood':(0,0,1024,256),'cloth':(0,256,1024,256),'dealer':(0,512,512,128),
       'spec':(512,512,512,128),'buttons':(0,640,256,128),'lidmark':(256,640,256,128),
       'underlabel':(512,640,256,128),'roller':(768,640,256,128)}

def uv(key,u,v):
    x,y,w,h=BANDS[key]
    return ((x+1.5+(w-3)*u)/W,1-(y+1.5+(h-3)*(1-v))/H)

def prepare(directory,material):
    with tempfile.TemporaryDirectory() as temporary:
        subprocess.run(['node',str(directory/'atlas.mjs'),temporary],check=True)
        texs=[]
        for name,semantic in [('retail-print','sRGB'),('retail-normal','Non-Color')]:
            im=bpy.data.images.load(str(Path(temporary)/(name+'.png')))
            im.name=name;im.colorspace_settings.name=semantic;im.pack()
            tex=material.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;texs.append(tex)
    bs=material.node_tree.nodes.get('Principled BSDF')
    material.node_tree.links.new(texs[0].outputs['Color'],bs.inputs['Base Color'])
    norm=material.node_tree.nodes.new('ShaderNodeNormalMap')
    norm.inputs['Strength'].default_value=.52
    material.node_tree.links.new(texs[1].outputs['Color'],norm.inputs['Color'])
    material.node_tree.links.new(norm.outputs['Normal'],bs.inputs['Normal'])

def unwrap(obj, key, points):
    layer=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Showroom')
    layer.name='Showroom'
    for polygon in obj.data.polygons:
        for index in polygon.loop_indices:
            vertex=obj.data.loops[index].vertex_index
            layer.data[index].uv=uv(key,*points[vertex])

def decal(name,center,right,up,key,width,height,mesh,mat):
    c,r,u=Vector(center),Vector(right).normalized(),Vector(up).normalized()
    corners=[(0,0),(1,0),(1,1),(0,1)]
    pts=[c+r*((x-.5)*width)+u*((y-.5)*height) for x,y in corners]
    o=mesh(name,pts,[(0,1,2,3)],mat)
    unwrap(o,key,corners)
    return o
