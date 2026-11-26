"""Editable signal casings, pressed lift jambs, grooved sill and call plate."""

import bpy
import math
from pathlib import Path

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"


def group(name, x):
    global active, origin
    active = bpy.data.collections.new(name)
    scene.collection.children.link(active)
    origin = x
    active["origin"] = [x, 0, 0]
    active["bundle"] = "hardware"


def material(name, s):
    values = [int(s[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    m = bpy.data.materials.new(name)
    m.diffuse_color = [
        v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in values
    ] + [1]
    return m


def finish(obj, name, mat):
    obj.name = name
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    active.objects.link(obj)
    obj.location.x += origin
    obj.data.materials.append(mat)


def case(name, x, z, depth, width, height, thick, mat, bevel=0):
    # depth increases toward the street / passenger (Blender -Y).
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -depth, z))
    obj = bpy.context.object
    for v in obj.data.vertices:
        v.co.x *= width
        v.co.y *= thick
        v.co.z *= height
    if bevel:
        mod = obj.modifiers.new("Folded corner radius", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    finish(obj, name, mat)


def visor(name, x, z, d, radius, length, mat):
    # Open-bottom weather hood with an extended brow and shorter cheeks.
    angles = [math.radians(-52 + 284 * i / 10) for i in range(11)]
    verts = []
    for front in (False, True):
        for a in angles:
            reach = length * (0.45 + 0.55 * max(0, math.sin(a))) if front else 0
            verts.append(
                (x + radius * math.cos(a), -d - reach, z + radius * math.sin(a))
            )
    faces = [(i, i + 1, 12 + i, 11 + i) for i in range(10)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    obj = bpy.data.objects.new(name, mesh)
    finish(obj, name, mat)
    mod = obj.modifiers.new("Sheet thickness", "SOLIDIFY")
    mod.thickness = 0.008


anthracite = material("Graphite enamel", "253238")
black = material("Black powder coat", "172126")
dark = material("Rear enclosure", "343F43")
steel = material("Brushed steel", "A8B1B3")
satin = material("Satin lift panel", "BBC1C1")
shadow = material("Recess and rubber", "647278")
highlight = material("Polished return", "D2D6D3")
indigo = material("Button glass", "464F56")

group("TrafficHousing", 0)
case("Rear mounting tongue", 0, 0.345, 0, 0.06, 0.30, 0.06, steel)
case("Rounded backplate", 0, 0, -0.18, 1.49, 0.64, 0.045, black, 0.019)
for i in range(4):
    x = (i - 1.5) * 0.30
    case("Cast signal module", x, 0, 0, 0.304, 0.42, 0.30, anthracite, 0.036)
    case("Lens bezel", x, 0, 0.147, 0.272, 0.285, 0.018, black, 0.008)
    visor("Rolled visor", x, 0, 0.16, 0.133, 0.24, black)
for x in (-0.49, 0.49):
    case("Rear rib", x, 0, -0.20, 0.036, 0.40, 0.038, dark, 0.008)

group("WalkHousing", 2.2)
case("Pedestrian backplate", 0, 0, -0.01, 0.44, 0.84, 0.045, black, 0.021)
for z in (-0.17, 0.17):
    case("Sealed module", 0, z, 0.13, 0.35, 0.355, 0.23, anthracite, 0.031)
    visor("Shallow pictogram visor", 0, z, 0.249, 0.153, 0.105, black)

group("LiftJamb", 3.4)
case("Steel return", 0, 1.20, 0, 0.075, 2.40, 0.09, steel, 0.006)
case("Fine raised bead", -0.019, 1.20, 0.048, 0.014, 2.39, 0.013, highlight, 0.004)
case("Recessed edge", 0.025, 1.2, 0.046, 0.008, 2.38, 0.01, shadow, 0.002)

group("LiftHead", 4)
case("Folded lintel", 0, 2.42, 0, 1, 0.08, 0.09, satin, 0.006)
case("Header bead", 0, 2.394, 0.049, 0.99, 0.01, 0.014, highlight, 0.003)
case("Threshold", 0, 0.006, 0, 1, 0.012, 0.18, steel, 0.005)
for d in (-0.057, -0.023, 0.011, 0.045):
    case("Sill groove", 0, 0.012, d, 0.992, 0.004, 0.008, shadow)

group("LiftCallPlate", 5.4)
case("Recess shadow", 0, 1.12, 0.007, 0.161, 0.302, 0.031, shadow, 0.013)
case("Stainless bezel", 0, 1.12, 0.026, 0.151, 0.289, 0.031, satin, 0.012)
case("Dark button field", 0, 1.12, 0.045, 0.126, 0.237, 0.013, indigo, 0.006)
for z in (0.994, 1.246):
    case("Flush screw", 0, z, 0.043, 0.015, 0.006, 0.007, shadow)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "street-and-lift.blend"), compress=True)
