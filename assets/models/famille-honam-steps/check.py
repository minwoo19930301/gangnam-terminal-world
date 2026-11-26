"""Verify every native triangle against the gameplay batches after city placement."""
import json
from pathlib import Path
import runpy
import subprocess
from tempfile import TemporaryDirectory

import bpy
from mathutils import Matrix, Vector

here = Path(__file__).resolve().parent
world = here.parent/'world'
layout = runpy.run_path(str(world/'indoor-layout.py'))
with TemporaryDirectory() as tmp:
    path = Path(tmp)/'faces.json'
    subprocess.run(['node', here/'capture.mjs', path], check=True)
    packet = json.loads(path.read_text())
rows = json.loads(subprocess.check_output(['node', world/'indoor-layout.mjs']))
row, = [r for r in rows if r['id']=='centralcity/FamilleHonamSteps/1']
scene = layout['sync_layout'](world, [row])
bpy.context.window.scene = scene
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
anchor, = [o for o in scene.objects if o.get(layout['KEY'])==row['id']]
child, = anchor.children
source = child.instance_collection
world_matrix = child.evaluated_get(dg).matrix_world
game = Matrix([packet['frame'][i:i+4] for i in range(0,16,4)]).transposed()
source_frame = layout['Y_UP_TO_Z_UP'] @ game @ layout['Y_UP_TO_Z_UP'].transposed()
assert set(source.objects.keys()) == {p['name'] for p in packet['parts']}
worst = 0
triangles = 0
for p in packet['parts']:
    ob = source.objects[p['name']].evaluated_get(dg)
    mesh = ob.data
    assert len(mesh.polygons)==len(p['faces'])
    for triangle, face in zip(mesh.polygons,p['faces']):
        for v, j in zip(triangle.vertices, face):
            expected = source_frame @ Vector(p['positions'][j])
            observed = world_matrix @ (ob.matrix_world @ mesh.vertices[v].co-source.instance_offset)
            worst = max(worst,(observed-expected).length)
        triangles += 1
assert worst < .0001, worst
print('Verified',triangles,'game triangles in',len(source.objects),'editable meshes. Max world error:',worst)
