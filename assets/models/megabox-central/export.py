"""Bake an editable native entrance to one vertex-painted, indexed game surface."""
import base64
import json
from pathlib import Path
import zlib
import subprocess
import tempfile
import bpy
out=Path(bpy.data.filepath).parent
# Only the entrance surface needs to be readable before the full GLB arrives.
# Project the editable lettering, windows and stonework onto their front faces.

group = bpy.data.collections['MegaboxBoutiquePublicFront']
packed_vertices = {}
palette = {}
triangles = []
for obj in group.objects:
    lettering = obj.name == '입체 문자 · MEGABOX'
    if not lettering and not obj.name.startswith(('반원형 유리와 금속 문틀 ', '석재 판재 ')):
        continue
    mesh = obj.data
    mesh.calc_loop_triangles()
    paint = mesh.color_attributes.active_color
    front = max(v.co.z for v in mesh.vertices) if lettering else None
    normal_matrix = obj.matrix_world.to_3x3().inverted().transposed()
    for tri in mesh.loop_triangles:
        if lettering:
            if any(mesh.vertices[v].co.z < front - .0001 for v in tri.vertices):
                continue
        elif abs((normal_matrix @ tri.normal).normalized().y) < .94:
            continue
        for vertex, loop in zip(tri.vertices, tri.loops):
            x, north, height = obj.matrix_world @ mesh.vertices[vertex].co
            color = paint.data[loop if paint.domain == 'CORNER' else vertex].color
            rgb = tuple(round(c * 255) for c in color[:3])
            tint = palette.setdefault(rgb, len(palette))
            key = (round(x * 1000), round(height * 1000), round(-north * 1000), tint)
            triangles.append(packed_vertices.setdefault(key, len(packed_vertices)))

# Adjacent front-face vertices share depth and nearby window/letter coordinates.
# Delta-code each axis and the index list before deflating. This is lossless at
# the same millimetre precision as the exported front.
payload=bytearray()
def unsigned(n):
    while n>=128:
        payload.append((n&127)|128)
        n >>= 7
    payload.append(n)
def deltas(values):
    previous=0
    for value in values:
        difference=value-previous
        unsigned(abs(difference)*2-(difference<0))
        previous=value
if not triangles or len(packed_vertices)>65535 or len(palette)>256:
    raise ValueError('Invalid entry mesh')
unsigned(len(packed_vertices))
unsigned(len(triangles))
for axis in range(3):
    deltas(p[axis] for p in packed_vertices)
payload.extend(p[3] for p in packed_vertices)
deltas(triangles)
(out/'arrival-front.js').write_text(
    '// Generated from entrance.blend by export.py. Positions in millimetres, palette in linear RGB.\n'
    +'export const palette='+json.dumps(list(palette),separators=(',',':'))+';\n'
    +'export const packed='+json.dumps(base64.b64encode(zlib.compress(payload,9)).decode())+';\n')
bpy.ops.object.select_all(action='DESELECT')
objs=list(bpy.data.collections['MegaboxBoutiquePublicFront'].objects)
for obj in objs:
    obj.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'entrance.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out.parent/'ssg-market-entrance'/'pack.mjs'),str(raw),str(out/'entrance.glb')],check=True)
