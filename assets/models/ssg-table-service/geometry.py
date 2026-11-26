"""Small metric mesh constructors shared by the editable table and source rebake."""

from math import cos, sin, tau
import bpy
from mathutils import Vector


def constructors(col):
    def mesh(name, vs, fs, mat, smooth=False):
        me = bpy.data.meshes.new(name)
        me.from_pydata(vs, [], fs)
        me.materials.append(mat)
        for p in me.polygons:
            p.use_smooth = smooth
        obj = bpy.data.objects.new(name, me)
        col.objects.link(obj)
        return obj

    def rings(name, loops, mat, smooth=True, cap=True):
        n = len(loops[0])
        faces = [
            (i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j)
            for i in range(len(loops) - 1)
            for j in range(n)
        ]
        if cap:
            faces.extend(
                [
                    tuple(reversed(range(n))),
                    tuple(range(n * (len(loops) - 1), n * len(loops))),
                ]
            )
        return mesh(name, [p for row in loops for p in row], faces, mat, smooth)

    def tube(name, points, r, mat, n=8):
        loops = []
        for i, p in enumerate(points):
            tangent = (
                Vector(points[min(i + 1, len(points) - 1)])
                - Vector(points[max(i - 1, 0)])
            ).normalized()
            v = tangent.cross(
                Vector((1, 0, 0)) if abs(tangent.x) < 0.85 else Vector((0, 1, 0))
            ).normalized()
            w = tangent.cross(v)
            loops.append(
                [
                    Vector(p) + r * (v * cos(tau * j / n) + w * sin(tau * j / n))
                    for j in range(n)
                ]
            )
        return rings(name, loops, mat)

    return mesh, rings, tube
