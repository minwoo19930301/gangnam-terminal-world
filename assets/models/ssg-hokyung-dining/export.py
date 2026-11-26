"""Batch a copy of the already saved editable collection, in memory only."""
from pathlib import Path
from math import sin,cos
import bpy
import bmesh
folder=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_11F_Hokyung_Dining']
# The authored kernels intersect a solid toasted biscuit. Cull only faces
# completely enclosed by that convex core, retaining the outer silhouette.
for piece in collection.objects:
    if 'crisp_core' not in piece:continue
    x,y,z,w,h,angle,lean=piece['crisp_core']
    def inside(v):
        dx,dy,dz=v.co.x-x,v.co.y-y,v.co.z-z
        return (0<dz<h*.96 and abs(dx*cos(angle)+dy*sin(angle))<w*.48 and
                abs(-dx*sin(angle)+dy*cos(angle)+lean*dz)<.006)
    bm=bmesh.new();bm.from_mesh(piece.data)
    hidden=[face for face in bm.faces if all(inside(v) for v in face.verts)]
    bmesh.ops.delete(bm,geom=hidden,context='FACES')
    bm.to_mesh(piece.data);bm.free()
for mat in sorted({o.data.materials[0] for o in collection.objects},key=lambda m:m.name):
    parts=[o for o in collection.objects if o.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
    bpy.context.object.name=mat.name
bpy.ops.export_scene.gltf(filepath=str(folder/'gallery.glb'),export_format='GLB',export_animations=False)
