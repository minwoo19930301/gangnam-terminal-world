"""Set the native Blender sun and sky from the game's Seoul timeline."""

from math import asin, degrees
from mathutils import Vector
import bpy


LAMP_MATERIAL = "서울 가로등 · 하향 발광"


def lamp_material():
    material = bpy.data.materials.get(LAMP_MATERIAL)
    if material is None:
        material = bpy.data.materials.new(LAMP_MATERIAL)
        material.use_nodes = True
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = (.68, .74, .76, 1)
        shader.inputs["Emission Color"].default_value = (1, .81, .60, 1)
    return material


def shade_street_lenses(scene):
    # Realize only the linked lens, before instancing the complete luminaire.
    # A moved placement point carries the emitting surface and its pool of light.
    for obj in scene.objects:
        if obj.get("street_layout_kind") != "roadLamp":
            continue
        tree = next(mod.node_group for mod in obj.modifiers if mod.type == "NODES")
        if tree.nodes.get(LAMP_MATERIAL):
            continue
        lens = next(node for node in tree.nodes if node.type == "COLLECTION_INFO"
                    and node.inputs["Collection"].default_value.get("model") == "roadLampLens")
        outgoing, = list(lens.outputs["Instances"].links)
        target = outgoing.to_socket
        tree.links.remove(outgoing)
        realize = tree.nodes.new("GeometryNodeRealizeInstances")
        assign = tree.nodes.new("GeometryNodeSetMaterial")
        assign.name = LAMP_MATERIAL
        assign.inputs["Material"].default_value = lamp_material()
        tree.links.new(lens.outputs["Instances"], realize.inputs["Geometry"])
        tree.links.new(realize.outputs["Geometry"], assign.inputs["Geometry"])
        tree.links.new(assign.outputs["Geometry"], target)


def apply_sky(scene, model):
    sun = scene.objects["서울 태양"]
    world = scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    scene.frame_start, scene.frame_end = 0, 1439
    scene["Seoul solar date"] = model["day"]
    scene["Seoul timeline"] = "1 frame = 1 minute KST"
    for marker in list(scene.timeline_markers):
        if marker.name.startswith(("아침 ·", "낮 ·", "노을 ·", "밤 ·")):
            scene.timeline_markers.remove(marker)
    for name, minute in model["events"].items():
        scene.timeline_markers.new(name, frame=minute)
    lights = [
        m.node_tree.nodes.get("Seoul window illumination")
        for m in bpy.data.materials
        if not m.library and m.use_nodes
    ]
    emission = lamp_material().node_tree.nodes.get("Principled BSDF").inputs["Emission Strength"]
    prior = None
    for minute, direction, color, energy, sky, fill in model["keys"]:
        x, up, south = direction
        altitude = degrees(asin(max(-1.0, min(1.0, up))))
        scene["Seoul apartment night"] = max(0.0, min(1.0, (-altitude - 2) / 8))
        scene.keyframe_insert(data_path='["Seoul apartment night"]', frame=minute)
        rotation = Vector((-x, south, -up)).to_track_quat("-Z", "Y")
        if prior and rotation.dot(prior) < 0:
            rotation.negate()
        sun.rotation_mode = "QUATERNION"
        sun.rotation_quaternion = rotation
        sun.keyframe_insert("rotation_quaternion", frame=minute)
        prior = rotation.copy()
        for node in lights:
            if node is not None:
                node.outputs[0].default_value = (
                    max(0, min(1, (-up + 0.07) / 0.13)) * 0.78
                )
                node.outputs[0].keyframe_insert("default_value", frame=minute)
        emission.default_value = 105 * max(0, min(1, (-up + .015) / .10))
        emission.keyframe_insert("default_value", frame=minute)
        sun.data.color = color
        sun.data.energy = energy * 2.3
        sun.data.keyframe_insert("color", frame=minute)
        sun.data.keyframe_insert("energy", frame=minute)
        background.inputs["Color"].default_value = (*sky, 1)
        background.inputs["Color"].keyframe_insert("default_value", frame=minute)
        background.inputs["Strength"].default_value = fill * 0.5
        background.inputs["Strength"].keyframe_insert("default_value", frame=minute)
    scene.frame_set(750)
