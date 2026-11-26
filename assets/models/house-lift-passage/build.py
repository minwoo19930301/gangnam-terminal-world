"""Edit-ready counterpart of the hotel/House passage sign, in metres."""
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new('HouseLiftWayfinding')
scene.collection.children.link(group)
group['subject'] = '하우스 전용 승강기와 호텔 로비를 구분하는 게임 내 고객 안내'
group['source'] = 'https://an-clinic.com/sub/AN-CLINIC/Contact-Us'
with TemporaryDirectory(prefix='house-lift-wayfinding-') as directory:
    subprocess.run(['node', str(here/'bake.mjs'), directory], check=True)
    model = json.loads((Path(directory)/'fixture.json').read_text())
    image = bpy.data.images.load(str(Path(directory)/'face.png'))
    image.name = '승강기와 호텔 로비 · 양면 인쇄'
    image.pack()
    image.filepath = '//wayfinding.png'
    walnut_image = bpy.data.images.load(str(Path(directory)/'walnut.png'))
    walnut_image.name = 'JW 메리어트 1층 월넛 무늬'
    walnut_image.pack()
    walnut_image.filepath = '//walnut.png'

mat = bpy.data.materials.new('새틴 청동 · 밝은 안내 문자')
mat.use_nodes = True
bs = mat.node_tree.nodes['Principled BSDF']
bs.inputs['Metallic'].default_value = .15
bs.inputs['Roughness'].default_value = .56
bs.inputs['Emission Strength'].default_value = .24
tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = image
for key in ('Base Color', 'Emission Color'):
    mat.node_tree.links.new(tex.outputs['Color'], bs.inputs[key])

for part in model['parts']:
    data = part['vertices']
    vertices = [(data[i], -data[i+2], data[i+1]) for i in range(0,len(data),3)]
    indices = part['index']
    faces = [indices[i:i+3] for i in range(0,len(indices),3)]
    mesh = bpy.data.meshes.new(part['name'])
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv = mesh.uv_layers.new(name='안내판')
    for loop in mesh.loops:
        i = loop.vertex_index*2
        uv.data[loop.index].uv = part['uv'][i:i+2]
    mesh.materials.append(mat)
    group.objects.link(bpy.data.objects.new(part['name'], mesh))
# The runtime walls use K.wall. Link the same finish to the editing scene
# at the sign's origin, including the change of datum below the mezzanine.
lining = bpy.data.collections.new('HouseLiftWalnutLining')
scene.collection.children.link(lining)
wood = bpy.data.materials.new('호텔 연결통로 · 월넛')
wood.use_nodes = True
bs = wood.node_tree.nodes['Principled BSDF']
bs.inputs['Roughness'].default_value = .59
grain = wood.node_tree.nodes.new('ShaderNodeTexImage')
grain.image = walnut_image
wood.node_tree.links.new(grain.outputs['Color'], bs.inputs['Base Color'])
layout = model['layout']
mid = (layout['west'] + layout['east']) / 2
join = layout['join']
datum = 7 + (join-layout['low']) * (layout['lobbyY']-7) / (layout['high']-layout['low'])

for i, (a,b,c,d,bottom,top) in enumerate(model['walls']):
    ds, dt = c-a, d-b
    length = (ds*ds + dt*dt)**.5
    across, along = -.045*ds/length, .045*dt/length
    points = [(b-mid+across, -(a-join+along)), (d-mid+across, -(c-join+along)),
              (d-mid-across, -(c-join-along)), (b-mid-across, -(a-join-along))]
    vertices = [(x,y,h-datum) for h in (bottom,top) for x,y in points]
    faces = [(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7),(3,2,1,0)]
    mesh = bpy.data.meshes.new('월넛 패널과 절단면')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv = mesh.uv_layers.new(name='월넛 결')
    for poly in mesh.polygons:
        width = length if poly.index in (0,2,4,5) else .09
        height = top-bottom if poly.index < 4 else .09
        for loop, texcoord in zip(poly.loop_indices, [(0,0),(width/.65,0),(width/.65,height/3.2),(0,height/3.2)]):
            uv.data[loop].uv = texcoord
    mesh.materials.append(wood)
    lining.objects.link(bpy.data.objects.new(f'월넛 벽체 {i+1:02}', mesh))
scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'wayfinding.blend'),compress=True)
