"""Build the editable paver bay, or open plaza.blend and pass --export-current."""
import random
import sys
from pathlib import Path
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
TILE='PlazaGraniteSwatch'
JOINT='광장 판석 줄눈'
RNG=random.Random(802)
N=8
BAY=.24+7*.52


def linear(c):
    c=c/255
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4


def hex_color(mat):
    def to_srgb(c):
        return 12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055
    return '#'+''.join(f'{round(255*to_srgb(max(0,min(c,1)))):02x}' for c in mat.diffuse_color[:3])


def stone_material(name,hex_code):
    mat=bpy.data.materials.new(name)
    rgb=tuple(linear(hex_code>>shift&255) for shift in (16,8,0))
    mat.diffuse_color=(*rgb,1)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*rgb,1)
    shader.inputs['Roughness'].default_value=.76
    coords=nodes.new('ShaderNodeTexCoord')
    grain=nodes.new('ShaderNodeTexNoise')
    grain.inputs['Scale'].default_value=118
    grain.inputs['Detail'].default_value=2
    bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.14;bump.inputs['Distance'].default_value=.0015
    mat.node_tree.links.new(coords.outputs['Object'],grain.inputs['Vector'])
    mat.node_tree.links.new(grain.outputs['Fac'],bump.inputs['Height'])
    mat.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    return mat


def block(name,x0,y0,x1,y1,bottom,top,material):
    vertices=[(x,y,z) for z in (bottom,top) for x,y in ((x0,y0),(x1,y0),(x1,y1),(x0,y1))]
    polygons=[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],polygons);mesh.materials.append(material)
    obj=bpy.data.objects.new(name,mesh);group.objects.link(obj)
    return obj


def make_tile():
    joint=stone_material(JOINT,0x78766e)
    block('줄눈 바탕',0,0,BAY,BAY,-.045,-.003,joint)
    field=[stone_material('회색 판석 '+str(i+1),c) for i,c in enumerate((0xb7b6ac,0xafafa6,0xadada5,0xbcb8ac,0xabb0a8))]
    bands=[stone_material('장밋빛 띠 '+str(i+1),c) for i,c in enumerate((0xad8d7e,0xb19484,0xb79989))]
    cross=stone_material('교차점의 어두운 돌',0x706e65)
    divisions=[0,.24]+[.24+i*.52 for i in range(1,N)]
    for j,(y0,y1) in enumerate(zip(divisions,divisions[1:])):
        for i,(x0,x1) in enumerate(zip(divisions,divisions[1:])):
            mat=cross if (i,j)==(0,0) else RNG.choice(bands if i==0 or j==0 else field)
            obj=block(f'{mat.name} · {i+1}-{j+1}',x0+.004,y0+.004,x1-.004,y1-.004,-.03,0,mat)
            obj['paver']=True
            bevel=obj.modifiers.new('판석 모서리','BEVEL');bevel.width=.0017;bevel.segments=1
    group['tile_width']=BAY;group['tile_depth']=BAY


def export():
    group=bpy.data.collections[TILE]
    values={}
    for obj in group.objects:
        if not obj.get('paver'):continue
        pts=[obj.matrix_world@Vector(corner) for corner in obj.bound_box]
        rect=tuple(round(1000*q) for q in (min(p.x for p in pts),max(p.x for p in pts),min(p.y for p in pts),max(p.y for p in pts)))
        values[rect]=hex_color(obj.data.materials[0])
    xs=sorted({r[:2] for r in values});ys=sorted({r[2:] for r in values})
    if len(xs)*len(ys)!=len(values):raise ValueError('The paver bay needs a complete rectangular joint grid.')
    palette=sorted(set(values.values()))
    rows=[''.join(chr(65+palette.index(values[x+y])) for x in xs) for y in ys]
    import json
    data={'mm':[round(group['tile_width']*1000),round(group['tile_depth']*1000)],
          'x':[v for pair in xs for v in pair],'y':[v for pair in ys for v in pair],
          'joint':hex_color(bpy.data.materials[JOINT]),'palette':palette,'rows':rows}
    path=HERE.parents[2]/'js/places/centralcity.js';src=path.read_text()
    begin='    // BEGIN PLAZA SWATCH\n';end='    // END PLAZA SWATCH'
    if src.count(begin)!=1 or src.count(end)!=1:raise ValueError('Missing or ambiguous plaza swatch markers')
    lines=['    const swatch={']+['      '+key+':'+json.dumps(value,separators=(',',':'))+',' for key,value in data.items()]+['    };']
    output=src[:src.index(begin)+len(begin)]+'\n'.join(lines)+'\n'+src[src.index(end):]
    if output!=src:path.write_text(output)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    group=bpy.data.collections.new(TILE);bpy.context.scene.collection.children.link(group)
    make_tile()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'plaza.blend'),compress=True)
export()
