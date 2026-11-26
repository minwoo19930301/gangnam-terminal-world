"""Create editable trim where the existing two B1 hall shells meet the public lift."""
from pathlib import Path

import bpy

folder = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
trim = bpy.data.collections.new("CentralTerminalB1Landing")
scene.collection.children.link(trim)


def finish(name, color, metal=0):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = material.diffuse_color
    shader.inputs["Metallic"].default_value = metal
    shader.inputs["Roughness"].default_value = .48
    return material


def panel(name, x, depth, height, width, length, thickness, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -depth, height + thickness / 2))
    item = bpy.context.object
    item.name = name
    item.dimensions = (width, length, thickness)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    item.data.materials.append(material)
    for owner in list(item.users_collection):
        owner.objects.unlink(item)
    trim.objects.link(item)


steel = finish("승강기 · 새틴 스테인리스", (.43, .46, .46), .62)
stone = finish("문턱 · 밝은 회갈색 석재", (.50, .45, .37))
joint = finish("홈과 줄눈 · 고무", (.046, .047, .043))
# The floor collision and doorway width stay in the shared terminal floor plan.
panel("문턱 판석", 0, .39, .008, 1.55, .98, .012, stone)
panel("승강기 은색 문턱", 0, -.27, .010, 1.55, .32, .013, steel)
for index, depth in enumerate((-.37, -.32, -.27, -.22, -.17), 1):
    panel(f"은색 문턱 · 홈 {index}", 0, depth, .023, 1.48, .009, .002, joint)
for side, label in ((-1, "왼쪽"), (1, "오른쪽")):
    panel(label + " 안쪽 단면", side * .762, 0, .02, .032, .42, 2.42, steel)
    panel(label + " 앞쪽 접힘", side * .794, .225, .02, .096, .025, 2.42, steel)
panel("상부 스테인리스 접힘", 0, .225, 2.44, 1.68, .025, .048, steel)
panel("입구 덮개 밑면", 0, 0, 2.443, 1.55, .43, .024, steel)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(folder / "landing.blend"), compress=True)
