"""Compare the linked native collection to the ordinary game's unfiltered render."""
import json
from pathlib import Path
import runpy
import subprocess
from tempfile import TemporaryDirectory

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
world = here.parent / 'world'
with TemporaryDirectory() as tmp:
    path = Path(tmp) / 'street.json'
    subprocess.run(['node', here / 'capture.mjs', path, '--verify'], check=True)
    packet = json.loads(path.read_text())
rows = json.loads(subprocess.check_output(['node', world / 'indoor-layout.mjs']))
row, = [r for r in rows if r['id'] == 'streets/FamilleParkingRamp/1']
layout = runpy.run_path(str(world / 'indoor-layout.py'))
# Exercise the normal city placer in a throwaway sibling directory layout.
workspace = TemporaryDirectory()
temporary = Path(workspace.name)
(temporary / here.name).symlink_to(here, target_is_directory=True)
(temporary / 'world').mkdir()
bpy.context.scene.name = '반포 · 도시 전경'
bpy.ops.wm.save_as_mainfile(filepath=str(temporary / 'world' / 'check.blend'))
scene = layout['sync_layout'](world, [row])
bpy.context.window.scene = scene
bpy.context.view_layer.update()
anchor, = [o for o in scene.objects if o.get(layout['KEY']) == row['id']]
child, = anchor.children
assert child.name in bpy.data.scenes['반포 · 도시 전경'].objects
collection = child.instance_collection
used = set()
worst = 0
count = 0
for part in packet['pieces']:
    order = part['indices']
    candidates = [o for o in collection.objects if o.name.split('.')[0] == part['name'] and o not in used]
    # Two road meshes share an identical topology but contain opposite slab faces.
    for obj in candidates:
        dg = bpy.context.evaluated_depsgraph_get()
        transform = child.evaluated_get(dg).matrix_world @ obj.evaluated_get(dg).matrix_world
        mesh = obj.data
        if len(mesh.loops) != len(order):
            continue
        error = max((transform @ mesh.vertices[l.vertex_index].co - Vector(part['vertices'][v])).length
                    for l, v in zip(mesh.loops, order))
        if error < .0001:
            break
    else:
        raise AssertionError(part['name'])
    for i, vertex in enumerate(order):
        assert (mesh.uv_layers['Game UV'].data[i].uv - Vector(part['uvs'][vertex])).length < .0001
        assert (Vector(mesh.color_attributes['Game tint'].data[i].color[:3]) -
                Vector(part['colors'][vertex])).length < .00001
    used.add(obj)
    worst = max(worst, error)
    count += len(mesh.polygons)
    if part['name'].endswith('화살표'):
        # Check each paint mark's point, not just whether the road slopes.
        for group in (False, True):
            def station(v):
                return (v[0] - 71.26) * .89563 + (-v[1] - 143.25) * -.4448
            verts = [v for v in part['vertices'] if (station(v) > -43) == group]
            sign = 1 if part['name'].startswith('하행') else -1
            tip_station = max(sign * station(v) for v in verts)
            tail_station = min(sign * station(v) for v in verts)
            tips = {tuple(v) for v in verts if tip_station - sign * station(v) < .01}
            tails = {tuple(v) for v in verts if sign * station(v) - tail_station < .01}
            assert len(tips) >= 1 and len(tails) >= 2, part['name']
            # Terrain clipping may insert another vertex on the flat rear edge.
            assert max((Vector(a)-Vector(b)).length for a in tails for b in tails) > .23
            assert max((Vector(a)-Vector(b)).length for a in tips for b in tips) < .02
            rise = next(iter(tips))[2] - sum(v[2] for v in tails) / 2
            assert rise * sign < -.30, rise
assert len(used) == len(collection.objects)
assert all(image.packed_file for image in bpy.data.images if image.library and image.source == 'FILE')
print(f'{count} matching oriented game triangles, {len(used)} editable meshes, four arrows. Max error {worst:.8f}m')
