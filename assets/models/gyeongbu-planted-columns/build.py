"""Author folded leaves and metal planter courses at metre scale."""
from pathlib import Path
from random import Random
from math import sin, cos, pi
import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
rng = Random(513)
material = bpy.data.materials.new("잎과 화분 · 정점색")
material.use_nodes = True
shader = material.node_tree.nodes["Principled BSDF"]
attribute = material.node_tree.nodes.new("ShaderNodeVertexColor")
attribute.layer_name = "색"
material.node_tree.links.new(attribute.outputs["Color"], shader.inputs["Base Color"])
shader.inputs["Roughness"].default_value = .81
vertices, faces, colors = [], [], []

def patch(points, panels, color):
    offset = len(vertices)
    vertices.extend(points)
    faces.extend([tuple(offset + i for i in panel) for panel in panels])
    colors.extend([color] * len(points))

def finish(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    tint = mesh.color_attributes.new(name="색", type="BYTE_COLOR", domain="POINT")
    for v, rgb in zip(tint.data, colors):
        v.color_srgb = (*(c / 255 for c in rgb), 1)
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    vertices.clear()
    faces.clear()
    colors.clear()

def course(width, depth, z, h, rgb):
    corners = [(-1,-1),(1,-1),(1,1),(-1,1)]
    patch([(a*width/2,b*depth/2,z+level*h) for level in (0,1) for a,b in corners],
          [(0,3,2,1),(4,5,6,7)]+[(i,(i+1)%4,4+(i+1)%4,4+i) for i in range(4)],rgb)

course(.55,.87,0,.19,(132,120,100))
course(.58,.90,.16,.052,(185,170,141))
course(.49,.79,.20,3.55,(52,70,45))
for height in (.23,1.09,1.95,2.81,3.67):
    course(.53,.83,height,.024,(102,101,78))
finish("01 · 청동빛 테두리와 식재 틀")

palette = [(75,109,61),(95,128,70),(114,141,72),(59,92,60),(124,146,79),(69,99,52)]
for face in range(4):
    theta = face*pi/2
    normal = Vector((cos(theta),sin(theta),0))
    across = Vector((-sin(theta),cos(theta),0))
    vertical = Vector((0,0,1))
    radius, span = (.25,.78) if face%2==0 else (.40,.47)
    for row in range(17):
        for tuft in range(4 if face%2==0 else 3):
            count = 4 if face%2==0 else 3
            start = normal*radius + across*((tuft+.4+rng.uniform(-.21,.21))/count-.5)*span
            start += vertical*(.40+row*.2+rng.uniform(-.055,.055))
            for side in (-1,0,1):
                length = rng.uniform(.14,.27)
                bend = rng.uniform(.06,.13)
                skew = side*rng.uniform(.07,.15)+rng.uniform(-.037,.037)
                width = rng.uniform(.032,.064)
                tip = start+normal*bend+across*skew-vertical*length
                mid = start.lerp(tip,.50)+normal*.038
                ridge = mid+normal*.019+vertical*.009
                base = rng.choice(palette)
                patch([start,mid-across*width,ridge,tip],[(0,1,2),(1,3,2)],base)
                patch([start,ridge,mid+across*width,tip],[(0,1,2),(1,3,2)],
                      tuple(min(255,int(c*1.14)) for c in base))
    finish(f"0{face+2} · 접힌 잎 군락")
bpy.context.scene.display.shading.color_type = 'VERTEX'
bpy.ops.wm.save_as_mainfile(filepath=str(out/"planted-column.blend"),compress=True)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.join()
bpy.context.object.name = "PlantedColumn"
bpy.ops.export_scene.gltf(filepath=str(out/"planted-column.glb"),export_format="GLB")
