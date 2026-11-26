"""Capture the public B1 shell or export an edit of its east cross-aisle width."""
import bpy
import json
from mathutils import Vector, Quaternion
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
NATIVE = HERE / "public-shell.blend"
COLLECTION = "Shinsegae_B1_Cinema_Public_Shell"
CONTROL = "East cross-aisle floor"
WEST_FLOOR = "원형 광장 옆 통로 · floor"
args = sys.argv[sys.argv.index("--")+1:]
command = ["node", str(HERE / "shell.mjs")]

def finish(key):
    colors = {"megabox_plaza_stone":0xBFB3A2, "ssg_ceil":0xEBE6DC}
    color = colors.get(key, key if isinstance(key,int) else 0xCCBFAE)
    name = f"Shell · {color:06X}"
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    rgb = [(color >> shift & 255)/255 for shift in (16,8,0)]
    material.diffuse_color = (*[((c+.055)/1.055)**2.4 if c>.04045 else c/12.92 for c in rgb],1)
    return material

def mesh_object(name, points, faces, parent, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    mesh.materials.append(finish(mat))
    parent.objects.link(obj)
    return obj

def capture():
    data = json.loads(subprocess.check_output(command+["read"]))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(root)
    def group(name):
        value = bpy.data.collections.new(name)
        root.children.link(value)
        return value
    floors, ceilings, walls = [group(n) for n in ("Public floors", "Ceilings and soffits", "Partitions and lintels")]
    for surface in data["surfaces"]:
        obj = mesh_object(surface["name"], surface["points"], surface["faces"],
                          floors if surface["up"] else ceilings, surface["mat"])
        obj.hide_select = obj.name not in {CONTROL, WEST_FLOOR}
        obj["game_y_m"] = surface["y"]
        if surface["up"]:
            obj["walkable_y_m"] = surface["support"]
    # The production wall calls use the same full thickness on the inside and
    # outside of each threshold. Keep the gaps between the actual wall segments.
    faces = [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    by_finish = {}
    for wall in data["walls"]:
        points, indices = by_finish.setdefault(wall["mat"],([],[]))
        offset = len(points)
        indices.extend([offset+i for i in face] for face in faces)
        points.extend(wall["points"])
    for mat,(points,indices) in by_finish.items():
        obj=mesh_object(f"Partition · {mat:06X}",points,indices,walls,mat)
        obj.hide_select=True
    # Show the floor immediately in this file. A linked master collection still
    # contains every ceiling; its own view layer controls visibility.
    bpy.context.view_layer.layer_collection.children[root.name].children[ceilings.name].hide_viewport=True
    bpy.context.scene.unit_settings.system='METRIC'
    west=bpy.data.objects[WEST_FLOOR]
    west.vertex_groups.new(name="Event wall corner").add([data["westCornerIndex"]], 1, "REPLACE")
    west["editable_boundary"]="Move the Event wall corner horizontally to adjust its floor, ceiling and wall together."
    control=bpy.data.objects[CONTROL]
    control["editable_boundary"]="Move the North edge vertex group horizontally, then export and recapture."
    control.vertex_groups.new(name="North edge").add([0,1,2],1,'REPLACE')
    bpy.context.view_layer.objects.active=control
    control.select_set(True)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                view=area.spaces.active.region_3d
                view.view_location=sum((v.co for o in floors.objects for v in o.data.vertices),Vector())/sum(len(o.data.vertices) for o in floors.objects)
                view.view_rotation=Quaternion((1,0,0,0))
                view.view_distance=77
                view.view_perspective='ORTHO'
                area.spaces.active.shading.color_type='MATERIAL'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args[1]).resolve() if len(args)>1 else NATIVE),compress=True)

def export(control_name, action):
    control=bpy.data.collections[COLLECTION].all_objects[control_name]
    vertices=[control.matrix_world @ v.co for v in control.data.vertices]
    source=json.loads(subprocess.check_output(command+["read"]))
    original=next(s for s in source["surfaces"] if s["name"]==control_name)
    topology={tuple(sorted(p.vertices)) for p in control.data.polygons}
    if len(vertices)!=len(original["points"]) or topology!={tuple(sorted(f)) for f in original["faces"]}:
        raise ValueError("Preserve the floor's original vertices and face topology.")
    if any(abs(v.z-p[2])>.001 for v,p in zip(vertices,original["points"])):
        raise ValueError("Move the floor boundary horizontally. Recapture will update its terrain height.")
    subprocess.run(command+[action]+args[1:],input=json.dumps([(v.x,-v.y) for v in vertices]),text=True,check=True)

if args[0]=="import": capture()
elif args[0]=="export": export(CONTROL,"write")
elif args[0]=="export-west": export(WEST_FLOOR,"write-west")
else: raise ValueError("Expected import, export or export-west.")
