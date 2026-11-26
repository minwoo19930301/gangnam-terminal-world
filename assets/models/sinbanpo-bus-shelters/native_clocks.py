"""Pack the two game clock faces and four minute-driven numerals in the editable city."""
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import bpy


def add_clocks(here):
    scene = bpy.context.scene
    with TemporaryDirectory(prefix='stop-clocks-') as directory:
        subprocess.run(['node', str(here / 'bake-clock.mjs'), directory], check=True)
        path = Path(directory)
        slots = json.loads((path / 'slots.json').read_text())
        images = {}
        for key in ['digits', '22019', '22020']:
            image = bpy.data.images.load(str(path / (key + '.png')))
            image.name = '승차섬 전광판 · ' + key
            image.pack()
            image.filepath = '//' + key + '.png'
            images[key] = image

    def panel(group, label, x, y, w, h, image, driver=None):
        # Same canvas-to-board transform as the passenger screen in model.js.
        def point(column, row):
            return ((column / 512 - .5) * 1.071, .2699 if driver else .270,
                    2.186 + (.5 - row / 128) * .251)

        mesh = bpy.data.meshes.new(label)
        mesh.from_pydata([point(x, y+h), point(x+w, y+h), point(x+w, y), point(x, y)], [], [(0,1,2,3)])
        mesh.update()
        uvs = mesh.uv_layers.new(name='전광판')
        extent = .1 if driver else 1
        for loop, uv in zip(uvs.data, [(0,0), (extent,0), (extent,1), (0,1)]):
            loop.uv = uv
        obj = bpy.data.objects.new(label, mesh)
        group.objects.link(obj)
        mat = bpy.data.materials.new(label)
        mesh.materials.append(mat)
        mat.use_nodes = True
        tree = mat.node_tree
        tree.nodes.clear()
        texture = tree.nodes.new('ShaderNodeTexImage')
        texture.image = image
        texture.extension = 'EXTEND'
        emission = tree.nodes.new('ShaderNodeEmission')
        output = tree.nodes.new('ShaderNodeOutputMaterial')
        tree.links.new(texture.outputs['Color'], emission.inputs['Color'])
        tree.links.new(emission.outputs[0], output.inputs['Surface'])
        if driver:
            coords = tree.nodes.new('ShaderNodeTexCoord')
            add = tree.nodes.new('ShaderNodeVectorMath')
            add.operation = 'ADD'
            tree.links.new(coords.outputs['UV'], add.inputs[0])
            tree.links.new(add.outputs[0], texture.inputs['Vector'])
            add.inputs[1].driver_add('default_value', 0).driver.expression = driver

    expressions = ['floor((frame%1440)/600)/10', '(floor((frame%1440)/60)%10)/10',
                   'floor((frame%60)/10)/10', '(floor(frame)%10)/10']
    for code in ['22019', '22020']:
        group = bpy.data.collections.new('중앙차로 승차대 · 전광판 ' + code)
        scene.collection.children.link(group)
        panel(group, code + ' · 정류소와 서울 시각', 0, 0, 512, 128, images[code])
        for i, (left, expression) in enumerate(zip(slots['slots'], expressions)):
            panel(group, code + ' · 숫자 ' + str(i+1), left, slots['top'], slots['cell'],
                  slots['height'], images['digits'], expression)
        # The source preview shows the first screen in the common hardware.
        # The city mounts each collection independently at its own boarding island.
        if code == '22020':
            group.instance_offset = (1.45, 0, 0)
            group['preview_origin'] = tuple(group.instance_offset)
            for obj in group.objects:
                obj.location.x += 1.45
    scene.frame_start, scene.frame_end = 0, 1439
    scene.frame_set(18*60+25)
