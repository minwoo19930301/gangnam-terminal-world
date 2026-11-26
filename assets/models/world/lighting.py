"""Set the native Blender sun and sky from the game's Seoul timeline."""

from mathutils import Vector
import bpy


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
    prior = None
    for minute, direction, color, energy, sky, fill in model["keys"]:
        x, up, south = direction
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
        sun.data.color = color
        sun.data.energy = energy * 2.3
        sun.data.keyframe_insert("color", frame=minute)
        sun.data.keyframe_insert("energy", frame=minute)
        background.inputs["Color"].default_value = (*sky, 1)
        background.inputs["Color"].keyframe_insert("default_value", frame=minute)
        background.inputs["Strength"].default_value = fill * 0.5
        background.inputs["Strength"].keyframe_insert("default_value", frame=minute)
    scene.frame_set(750)
