"""Editable suspended retail directory. Local +Y faces the lower landing."""
from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new('본관 에스컬레이터 · 혼수와 홈패션')
scene.collection.children.link(group)
image = bpy.data.images.load(sys.argv[sys.argv.index('--')+1])
image.name = '혼수와 홈패션 · 지상층 안내판'
image.pack()
material = bpy.data.materials.new('회갈색 금속 · 흰 문자')
material.use_nodes = True
bs = material.node_tree.nodes['Principled BSDF']
tex = material.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = image
material.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = .65

def part(name,x,y,z,w,d,h,swatch,print_face=False):
    verts=[(x+dx*w/2,y+dy*d/2,z+dz*h/2)
           for dz in [-1,1] for dx,dy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    layer=mesh.uv_layers.new(name='인쇄와 금속')
    for poly in mesh.polygons:
        for loop in poly.loop_indices:
            co=mesh.vertices[mesh.loops[loop].vertex_index].co
            layer.data[loop].uv=(((.5-(co.x-x)/w)*980+2)/1024,.5+(co.z-z)/h*.96) if print_face and poly.index==4 else (1000/1024,1-(30+swatch*55)/256)
    mesh.materials.append(material)
    group.objects.link(bpy.data.objects.new(name,mesh))

# Origin at the centre of the print. Rails stay above standing head height.
part('접힌 안내판 케이스',0,0,0,3.10,.10,.71,0)
part('한글 · 영문 인쇄',0,.054,0,3.066,.012,.681,0,True)
for z in [-.35,.35]:
    part('접힌 수평 가장자리',0,0,z,3.118,.107,.018,1)
for x in [-1.55,1.55]:
    part('끝단 이음',x,0,0,.016,.109,.693,2)
# Two straight hanger stems and ferrules receive the board at its folded top.
for x in [-1.04,1.04]:
    part('매달림 봉',x,0,.49,.022,.022,.27,1)
    part('안내판 체결부',x,0,.38,.065,.068,.07,3)
    part('천장 받침',x,0,.62,.11,.10,.025,2)
# Folded entrance soffit just before the moving treads. The photographed dark
# reveal meets the existing acoustic ceiling at 3.30 m; it is open underneath.
part('금속 소핏 · 안쪽 면',0,-.12,.628,4.03,.62,.026,2)
part('접힌 바깥 턱',0,.185,.615,4.04,.035,.07,0)
for x in [-2.015,2.015]:
    part('측면 마감',x,-.12,.62,.027,.62,.065,1)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'directory.blend'),compress=True)
