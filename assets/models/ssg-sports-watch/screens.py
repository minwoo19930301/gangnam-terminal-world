"""Packed, editable watch and trainer displays with a shared emissive map."""
from pathlib import Path
import subprocess
import tempfile
import bpy

COLOUR='가민 · 시계와 트레이너 화면'
EMISSION='가민 · OLED와 반사형 LCD 발광'
W,H=1024,768
AREAS={'runner':(0,0,384,384),'fenix':(384,0,384,384),'console':(775,7,234,145),'training':(775,165,234,145),'rim-runner':(0,384,384,384),'rim-fenix':(384,384,384,384)}


def construct(directory):
    with tempfile.TemporaryDirectory() as temp:
        subprocess.run(['node',str(directory/'dial-art.mjs'),temp],check=True)
        images=[]
        for filename,name in [('screen-art.png',COLOUR),('screen-light.png',EMISSION)]:
            im=bpy.data.images.load(str(Path(temp)/filename));im.name=name;im.pack();images.append(im)
    return images


def shade(mat,images,vertex=False,glow=True):
    ns=mat.node_tree.nodes;links=mat.node_tree.links;p=ns['Principled BSDF']
    col=ns.new('ShaderNodeTexImage');col.image=images[0]
    
    if vertex:
        tint=ns.new('ShaderNodeVertexColor');tint.layer_name='Finish'
        mix=ns.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        links.new(col.outputs['Color'],mix.inputs[1]);links.new(tint.outputs['Color'],mix.inputs[2])
        links.new(mix.outputs['Color'],p.inputs['Base Color'])
    else:links.new(col.outputs['Color'],p.inputs['Base Color'])
    if glow:
        em=ns.new('ShaderNodeTexImage');em.image=images[1]
        links.new(em.outputs['Color'],p.inputs['Emission']);p.inputs['Emission Strength'].default_value=.72
    p.inputs['Roughness'].default_value=.40


def coord(area,u,v):
    x,y,w,h=AREAS[area];return ((x+1+(w-2)*u)/W,1-(y+1+(h-2)*(1-v))/H)


def map_uv(ob,area,coords):
    layer=ob.data.uv_layers.new(name='Display')
    for loop in ob.data.loops:
        layer.data[loop.index].uv=coord(area,*coords[loop.vertex_index])
    ob['displayPanel']=area
