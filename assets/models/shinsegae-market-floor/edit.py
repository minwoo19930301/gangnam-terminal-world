"""Blender background entrypoint. See README for import and export commands."""
import bpy
from mathutils import Vector, Quaternion
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
NATIVE = HERE / "market-floor.blend"
COLLECTION = "Shinsegae_B1_Market_Floor"
NAME = "Market sales floor"
args = sys.argv[sys.argv.index("--") + 1:]
action = args[0]
cmd = ["node", str(HERE / "plan.mjs")]

if action == "import":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    collection = bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(collection)
    vertices = json.loads(subprocess.check_output(cmd + ["read"]))
    mesh = bpy.data.meshes.new(NAME)
    mesh.from_pydata([(x, -z, -6) for x, z in vertices], [], [list(range(len(vertices)))])
    mesh.update()
    if mesh.polygons[0].normal.z < 0:
        mesh.flip_normals()
    obj = bpy.data.objects.new(NAME, mesh)
    collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.preferences.filepaths.save_version = 0
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                area.spaces.active.region_3d.view_location = sum((v.co for v in mesh.vertices), Vector()) / len(vertices)
                area.spaces.active.region_3d.view_rotation = Quaternion((1, 0, 0, 0))
                area.spaces.active.region_3d.view_distance = 68
                area.spaces.active.region_3d.view_perspective = 'ORTHO'
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[1]).resolve() if len(args) > 1 else NATIVE), compress=True)
elif action == "export":
    obj = bpy.data.collections[COLLECTION].objects[NAME]
    mesh = obj.data
    if len(mesh.vertices) != 9 or len(mesh.polygons) != 1 or len(mesh.edges) != 9:
        raise ValueError("Preserve the single nine-corner floor face.")
    if {tuple(sorted(edge.vertices)) for edge in mesh.edges} != {
        tuple(sorted((i, (i+1) % 9))) for i in range(9)
    }:
        raise ValueError("Keep the original boundary edges and vertex indices.")
    coords = [obj.matrix_world @ vertex.co for vertex in mesh.vertices]
    if any(abs(vertex.z + 6) > .001 for vertex in coords):
        raise ValueError("Keep all floor vertices at elevation -6 m.")
    subprocess.run(cmd + ["write"], input=json.dumps([(v.x, -v.y) for v in coords]), text=True, check=True)
else:
    raise ValueError("Expected import or export.")
