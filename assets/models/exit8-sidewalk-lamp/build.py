"""Blender -b --python build.py; reopen lamp.blend and append -- --export-current for edits."""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
NAME = 'Exit8_Sidewalk_Lamp'


def finish(name, hexcolor, night_strength=0):
    rgb = [int(hexcolor[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    color = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = .42
    if night_strength:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        # Read the same per-scene solar factor used by the linked city windows.
        nodes = mat.node_tree.nodes
        solar = nodes.new('ShaderNodeAttribute')
        solar.attribute_type = 'VIEW_LAYER'
        solar.attribute_name = 'Seoul apartment night'
        solar.location = (-480,-240)
        strength = nodes.new('ShaderNodeMath')
        strength.operation = 'MULTIPLY'
        strength.inputs[1].default_value = night_strength
        strength.location = (-240,-240)
        mat.node_tree.links.new(solar.outputs['Fac'], strength.inputs[0])
        mat.node_tree.links.new(strength.outputs[0], shader.inputs['Emission Strength'])
        mat['street_lens'] = True
    return mat


def component(name, material):
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    assembly.objects.link(obj)
    return obj


def tube(name, a, b, radius, material, sides=8):
    axis = Vector(b) - Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=radius, depth=axis.length,
                                        location=(Vector(a) + Vector(b)) * .5)
    obj = component(name, material)
    obj.rotation_euler = axis.to_track_quat('Z', 'Y').to_euler()


def box(name, centre, size, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=centre)
    component(name, material).scale = size


def ellipse(name, rings, material):
    sides = 16
    verts = [(rx * math.cos(i*math.tau/sides), 1.05 + ry * math.sin(i*math.tau/sides), z)
             for rx, ry, z in rings for i in range(sides)]
    faces = [tuple(reversed(range(sides)))]
    for layer in range(len(rings)-1):
        a = layer*sides
        for i in range(sides):
            j = (i+1) % sides
            faces.append((a+i, a+j, a+j+sides, a+i+sides))
    faces.append(tuple(range(len(verts)-sides, len(verts))))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    assembly.objects.link(obj)
    mesh.materials.append(material)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    assembly = bpy.data.collections.new(NAME)
    bpy.context.scene.collection.children.link(assembly)
    steel = finish('도장 강재', '48545d')
    rim = finish('회색 금속 테두리', '737e84')
    rubber = finish('렌즈 테두리', '354048')
    road_lens = finish('차도등 확산 커버', 'ffedc2', 105)
    sidewalk_lens = finish('보도등 확산 커버', 'ffedc2', 105*.23)
    tube('기존 등주', (0,0,0), (0,0,7.5), .11, steel)
    # Surveyed game relief at the two original light registrations, relative to
    # the pole. The previous street batches followed that grade along the arms.
    lower_lift = .059539
    upper_lift = -.102067
    tube('차도 쪽 기존 상부 팔', (0,0,7.3), (0,-1.7,7.5 + upper_lift*1.7/1.8), .07, steel, 6)
    box('차도 쪽 등기구', (0,-1.8,7.495 + upper_lift), (.5,1.1,.15), steel)
    box('차도 쪽 발광 렌즈', (0,-1.8,7.4125 + upper_lift), (.4,.9,.025), road_lens)
    tube('보도 수평 암', (0,.12,4.1), (0,.91,4.1 + lower_lift*.91/1.05), .031, steel)
    tube('상부 대각 버팀대', (0,.12,4.31), (0,.61,4.115 + lower_lift*.61/1.05), .021, steel)
    for z in (4.1,4.31):
        tube('기둥 고정 밴드', (0,0,z-.032), (0,0,z+.032), .124, rim)
    ellipse('보도등 얕은 반사갓', [(.139,.251,4.054),(.15,.26,4.070),(.13,.231,4.110),(.060,.13,4.145)], rim)
    ellipse('커버 밀착부', [(.13,.239,4.047),(.14,.251,4.054)], rubber)
    ellipse('보도 쪽 발광 렌즈', [(.103,.19,4.025),(.13,.237,4.047)], sidewalk_lens)
    for name in ['보도등 얕은 반사갓', '커버 밀착부', '보도 쪽 발광 렌즈']:
        bpy.data.objects[name].location.z = lower_lift
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lamp.blend'), compress=True)

# Compact, millimetre-precision triangles for one static placement. The game can
# submit this small mesh in its existing street steel and luminous lens batches.
assembly = bpy.data.collections[NAME]
graph = bpy.context.evaluated_depsgraph_get()
parts = []
for original in sorted(assembly.all_objects, key=lambda o:o.name):
    if original.type != 'MESH':
        continue
    obj = original.evaluated_get(graph)
    mesh = obj.to_mesh()
    try:
        mesh.calc_loop_triangles()
        points = []
        for vertex in mesh.vertices:
            x,y,z = obj.matrix_world @ vertex.co
            points.append([round(x*1000), round(z*1000), round(-y*1000)])
        by_material = {}
        for tri in mesh.loop_triangles:
            by_material.setdefault(tri.material_index, []).append(list(tri.vertices))
        for index, faces in sorted(by_material.items()):
            mat = mesh.materials[index] if index < len(mesh.materials) else None
            rgba = mat.diffuse_color if mat else (.4,.4,.4,1)
            encoded = [12.92*v if v <= .0031308 else 1.055*v**(1/2.4)-.055 for v in rgba[:3]]
            rgb = [max(0,min(255,round(255*v))) for v in encoded]
            color = (rgb[0]<<16) + (rgb[1]<<8) + rgb[2]
            parts.append([color, bool(mat and mat.get('street_lens')), points, faces])
    finally:
        obj.to_mesh_clear()
(HERE/'mesh.js').write_text('// Millimetres, exported from lamp.blend by build.py.\nexport const parts = '+json.dumps(parts,separators=(',',':'))+';\n')
