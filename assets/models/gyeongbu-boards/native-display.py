"""Native LCD from the game painter; minute-of-day follows the active city scene."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess
import bpy

here=Path(__file__).resolve().parent
scene=bpy.context.scene
collection=bpy.data.collections.new('DepartureLCD')
scene.collection.children.link(collection)
with TemporaryDirectory() as tmp:
    subprocess.run(['node',str(here/'bake-display.mjs'),tmp],check=True)
    def packed(name):
        image=bpy.data.images.load(str(Path(tmp)/(name+'.png')))
        image.name='승차홈 · '+name;image.pack()
        image.filepath='//'+name+'.png'
        return image
    face_image=packed('background')
    digit_image=packed('digits')
    slots=json.loads((Path(tmp)/'slots.json').read_text())
    captions=[packed('caption-'+str(i)) for i in range(len(slots['posters']))]

def emissive(mat):
    mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear()
    emission=nodes.new('ShaderNodeEmission')
    output=nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(emission.outputs[0],output.inputs['Surface'])
    return emission

for mat in {mat for obj in bpy.data.collections['Lightboxes'].objects for mat in obj.data.materials}:
    emission=emissive(mat)
    emission.inputs['Color'].default_value=mat.diffuse_color

def panel(name,image,left,top,width,height,depth,digit=None,caption=False):
    # Pixel rectangles refer to the 330 × 1100 game canvas, origin at top left.
    def point(x,y):
        if caption:return (x,-depth,-y)
        return ((x/330-.5)*.657,-depth,1.4115+(.5-y/1100)*2.201)
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([point(left,top+height),point(left+width,top+height),
                      point(left+width,top),point(left,top)],[],[(0,1,2,3)])
    mesh.update()
    uv=mesh.uv_layers.new(name='화면')
    extent=.1 if digit else 1
    for i,xy in enumerate([(0,0),(extent,0),(extent,1),(0,1)]):uv.data[i].uv=xy
    obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj)
    mat=bpy.data.materials.new(name);mesh.materials.append(mat)
    emission=emissive(mat);nodes=mat.node_tree.nodes;link=mat.node_tree.links.new
    texture=nodes.new('ShaderNodeTexImage');texture.image=image
    texture.extension='EXTEND';link(texture.outputs['Color'],emission.inputs['Color'])
    if caption:
        plain=nodes.new('ShaderNodeBsdfTransparent');mix=nodes.new('ShaderNodeMixShader')
        link(texture.outputs['Alpha'],mix.inputs[0]);link(plain.outputs[0],mix.inputs[1])
        link(emission.outputs[0],mix.inputs[2])
        link(mix.outputs[0],next(n for n in nodes if n.type=='OUTPUT_MATERIAL').inputs['Surface'])
    if digit:
        source=nodes.new('ShaderNodeTexCoord')
        offset=nodes.new('ShaderNodeVectorMath');offset.operation='ADD'
        link(source.outputs['UV'],offset.inputs[0]);link(offset.outputs['Vector'],texture.inputs['Vector'])
        driver=offset.inputs[1].driver_add('default_value',0).driver
        driver.expression=digit

panel('LCD · 예시 출발 안내',face_image,0,0,330,1100,.148)
for i,(left,expression) in enumerate(zip(slots['left'],[
        'floor((frame%1440)/600)/10','(floor((frame%1440)/60)%10)/10',
        'floor((frame%60)/10)/10','(floor(frame)%10)/10'],strict=True)):
    panel('LCD · 서울 시각 '+str(i+1),digit_image,left,slots['top'],slots['width'],slots['height'],.1487,expression)
for i,(info,image) in enumerate(zip(slots['posters'],captions,strict=True)):
    x,y,w,h=[info[k] for k in ('x','y','w','h')]
    panel('광고 인쇄 · '+('왼쪽' if i==0 else '오른쪽'),image,x-w/2,-y-h/2,w,h,.875,caption=True)
scene.frame_start=0;scene.frame_end=1439
scene.frame_set(14*60+8)
