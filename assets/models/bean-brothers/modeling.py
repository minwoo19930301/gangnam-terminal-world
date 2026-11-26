"""Editable mesh primitives in shop coordinates (x across the frontage, d toward the rear)."""
from math import cos, sin, tau
import bpy
from mathutils import Vector

group = None
palette = {}


def material(name, code, metal=0):
    m = bpy.data.materials.new(name)
    rgb = tuple(int(code[i:i + 2], 16) / 255 for i in (0, 2, 4))
    color = tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metal
    return m


def piece(name, vertices, faces, color, bevel=0):
    mesh = bpy.data.meshes.new(name)
    # Our depth coordinate is opposite Blender Y. Reverse the face order once.
    mesh.from_pydata([(x, -d, z) for x, d, z in vertices], [], [f[::-1] for f in faces])
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    group.objects.link(obj)
    mesh.materials.append(palette[color])
    if bevel:
        mod = obj.modifiers.new('가공한 모서리', 'BEVEL')
        mod.width, mod.segments = bevel, 2
    return obj


def block(name, x, d, z, w, depth, height, color, bevel=0):
    a, b = w / 2, depth / 2
    return piece(name, [(x+i*a,d+j*b,z+k*height) for k in (0,1) for j in (-1,1) for i in (-1,1)],
                 [(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)], color, bevel)


def profile(name, x, d, z, rings, color, seg=20, scale_d=1):
    verts = [(x+r*cos(tau*i/seg),d+r*sin(tau*i/seg)*scale_d,z+h) for r,h in rings for i in range(seg)]
    faces = [(j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i)
             for j in range(len(rings)-1) for i in range(seg)]
    faces.append(tuple(reversed(range(seg))))
    faces.append(tuple(range((len(rings)-1)*seg,len(rings)*seg)))
    return piece(name, verts, faces, color)


def rod(name, points, rad, color, seg=8):
    points = [Vector(p) for p in points]
    vertices = []
    for i,p in enumerate(points):
        direction = (points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        ref = Vector((0,0,1)) if abs(direction.z)<.9 else Vector((0,1,0))
        a = direction.cross(ref).normalized()
        b = direction.cross(a)
        vertices.extend(tuple(p+rad*(a*cos(tau*j/seg)+b*sin(tau*j/seg))) for j in range(seg))
    faces = [(k*seg+j,k*seg+(j+1)%seg,(k+1)*seg+(j+1)%seg,(k+1)*seg+j)
             for j in range(seg) for k in range(len(points)-1)]
    faces += [tuple(reversed(range(seg))),tuple(range((len(points)-1)*seg,len(points)*seg))]
    return piece(name,vertices,faces,color)
