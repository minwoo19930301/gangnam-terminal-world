"""Packed colour and material-response sheets shared by the editable display and the single game draw."""
import subprocess
import tempfile
from pathlib import Path
import bpy
from mathutils import Vector

W,H=1280,1024
REGIONS={'ground':(0,0,1280,544),'brio':(0,548,512,288),'carton':(516,548,512,196),
         'cartonTop':(516,746,512,138),'tyre':(4,843,176,176),'fin':(1053,549,216,192),
         'nose':(1041,752,160,160),'tail':(536,893,240,80),'clock':(790,916,294,88)}
BLANK={'matte':(1208,972),'paint':(1226,973),'plated':(1226,997),'rubber':(1251,973)}

def construct(directory):
    result=[]
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['node',str(directory/'labels.mjs'),td],check=True)
        for nm,mode in [('print','sRGB'),('response','Non-Color')]:
            im=bpy.data.images.load(str(Path(td)/(nm+'.png')))
            im.name='IQBOX '+nm;im.colorspace_settings.name=mode;im.pack();result.append(im)
    return result

def mapped(mat,images,vertex=False):
    mat.use_nodes=True;nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get('Principled BSDF')
    col=nodes.new('ShaderNodeTexImage');col.image=images[0];orm=nodes.new('ShaderNodeTexImage');orm.image=images[1]
    color=col.outputs['Color']
    if vertex:
        v=nodes.new('ShaderNodeVertexColor');v.layer_name='Paint';mult=nodes.new('ShaderNodeMixRGB');mult.blend_type='MULTIPLY';mult.inputs[0].default_value=1
        links.new(color,mult.inputs[1]);links.new(v.outputs['Color'],mult.inputs[2]);color=mult.outputs[0]
    links.new(color,bs.inputs['Base Color'])
    unpack=nodes.new('ShaderNodeSeparateColor');links.new(orm.outputs[0],unpack.inputs[0])
    links.new(unpack.outputs['Green'],bs.inputs['Roughness']);links.new(unpack.outputs['Blue'],bs.inputs['Metallic'])

def blank(key):
    p=BLANK[key];return (p[0]/W,1-p[1]/H)
def uv(key,u,v):
    x,y,w,h=REGIONS[key];return ((x+1+(w-2)*u)/W,1-(y+1+(h-2)*(1-v))/H)

def unwrap(obj,key,points):
    layer=obj.data.uv_layers.active or obj.data.uv_layers.new(name='ToyPrint')
    layer.name='ToyPrint'
    for face in obj.data.polygons:
        for i in face.loop_indices:
            layer.data[i].uv=uv(key,*points[obj.data.loops[i].vertex_index])
    obj['printArea']=key

def board(name,c,right,up,width,height,key,part):
    c,right,up=Vector(c),Vector(right).normalized(),Vector(up).normalized()
    q=[(0,0),(1,0),(1,1),(0,1)]
    o=part(name,[c+right*((u-.5)*width)+up*((v-.5)*height) for u,v in q],[(0,1,2,3)],'print')
    unwrap(o,key,q)
    return o
