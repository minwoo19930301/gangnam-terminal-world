"""Link the normal city manifest into an empty project and compare all face corners to the kit."""
import json
from pathlib import Path
import runpy
import subprocess
from tempfile import TemporaryDirectory

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
world = here.parent / 'world'
layout = runpy.run_path(str(world / 'indoor-layout.py'))
with TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    (tmp / here.name).symlink_to(here, target_is_directory=True)
    (tmp / 'world').mkdir()
    bpy.ops.wm.save_as_mainfile(filepath=str(tmp / 'world' / 'check.blend'))
    path = tmp / 'parts.json'
    subprocess.run(['node', here / 'capture.mjs', path], check=True)
    packet = json.loads(path.read_text())
    manifest = json.loads(subprocess.check_output(['node', world / 'indoor-layout.mjs']))
    rows = [r for r in manifest if r['library'] == here.name + '/landings.blend']
    expected = {'6F', '7F', '8F', '9F', '10F'}
    assert set(packet['floors']) == expected
    assert {r['floor'] for r in rows} == expected and len(rows) == len(expected)
    assert any('ssg-lift-directory/' in r['library'] for r in manifest)
    scene = layout['sync_layout'](world, rows)
    bpy.context.window.scene = scene
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    for row in rows:
        floor = row['floor']
        anchor, = [o for o in scene.objects if o.get(layout['KEY']) == row['id']]
        child, = anchor.children
        collection = child.instance_collection
        pieces = packet['floors'][floor]['pieces']
        assert len(collection.objects) == len(pieces)
        used = set()
        worst = 0
        count = 0
        for piece in pieces:
            indices = piece['indices']
            for obj in collection.objects:
                if obj in used or obj.name.split('.')[0] != piece['name']:
                    continue
                mesh = obj.data
                if len(mesh.loops) != len(indices):
                    continue
                transform = child.evaluated_get(graph).matrix_world @ obj.evaluated_get(graph).matrix_world
                heights = Vector((0, 0, row['terrain']))
                error = max((transform @ mesh.vertices[loop.vertex_index].co -
                             (Vector(piece['vertices'][vertex]) + heights)).length
                            for loop, vertex in zip(mesh.loops, indices))
                if error < .0001:
                    break
            else:
                raise AssertionError(piece['name'])
            for i, j in enumerate(indices):
                assert (mesh.uv_layers['Game UV'].data[i].uv - Vector(piece['uvs'][j])).length < .0001
                assert (Vector(mesh.color_attributes['Game tint'].data[i].color[:3]) - Vector(piece['colors'][j])).length < .00001
            used.add(obj)
            count += len(mesh.polygons)
            worst = max(worst, error)
        walls = packet['floors'][floor]['wallCount']
        assert len({p['name'] for p in pieces}) == walls + 2
        print(f'{floor}: two cars, {walls} wall returns, {count} triangles, {len(used)} meshes, maximum {worst:.8f} m')
