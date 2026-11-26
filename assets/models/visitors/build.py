"""Two low-poly passenger poses. Each editable collection has one runtime tint."""

import bpy
import math
from pathlib import Path
from mathutils import Vector

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"


def finish(name, value):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (value, value, value, 1)
    return mat


base = finish("Base tint", 1)
seam = finish("Fabric folds", 0.69)
detail = finish("Piped or ribbed trim", 0.42)


def group(key):
    global layer
    layer = bpy.data.collections.new(key)
    layer["bundle"] = "visitors"
    layer["origin"] = [offset, 0, 0]
    scene.collection.children.link(layer)


def mesh(name, vertices, faces, mat=base, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.materials.append(mat)
    obj = bpy.data.objects.new(name, data)
    obj.location.x = offset
    layer.objects.link(obj)
    for p in data.polygons:
        p.use_smooth = smooth


def loft(name, rings, mat=base, sides=8, smooth=False):
    vertices = []
    for x, z, forward, rx, ry in rings:
        vertices.extend(
            [
                (
                    x + rx * math.cos(i * math.tau / sides),
                    -forward + ry * math.sin(i * math.tau / sides),
                    z,
                )
                for i in range(sides)
            ]
        )
    faces = [list(reversed(range(sides)))]
    for row in range(len(rings) - 1):
        for i in range(sides):
            a = row * sides + i
            b = row * sides + (i + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    faces.append(list(range(len(vertices) - sides, len(vertices))))
    mesh(name, vertices, faces, mat, smooth)


def tube(name, points, radius, mat=base, sides=5):
    positions = [Vector((x, -d, z)) for x, z, d in points]
    verts = []
    for i, p in enumerate(positions):
        t = (
            positions[min(i + 1, len(points) - 1)] - positions[max(0, i - 1)]
        ).normalized()
        axis = t.cross(Vector((0, 1, 0)))
        if axis.length < 0.01:
            axis = t.cross(Vector((1, 0, 0)))
        axis.normalize()
        other = t.cross(axis)
        verts.extend(
            [
                p
                + radius
                * (
                    axis * math.cos(j * math.tau / sides)
                    + other * math.sin(j * math.tau / sides)
                )
                for j in range(sides)
            ]
        )
    faces = [
        (
            i * sides + j,
            i * sides + (j + 1) % sides,
            (i + 1) * sides + (j + 1) % sides,
            (i + 1) * sides + j,
        )
        for i in range(len(points) - 1)
        for j in range(sides)
    ]
    mesh(name, verts, faces, mat)


for sit in (False, True):
    offset = 2.1 if sit else 0

    def part(name):
        group("sit" + name[0].upper() + name[1:] if sit else name)

    dz = -0.31 if sit else 0
    part("legs")
    for s in (-1, 1):
        x = s * 0.087
        if sit:
            loft(
                "Trouser leg",
                [
                    (x, 0.07, 0.39, 0.055, 0.061),
                    (x, 0.24, 0.38, 0.059, 0.07),
                    (x, 0.415, 0.36, 0.064, 0.082),
                    (x, 0.51, 0.32, 0.073, 0.076),
                ],
                seam,
            )
            loft(
                "Bent thigh",
                [
                    (x, 0.418, 0.17, 0.076, 0.203),
                    (x, 0.51, 0.16, 0.082, 0.207),
                    (x, 0.55, 0.11, 0.077, 0.14),
                ],
            )
        else:
            loft(
                "Trouser leg",
                [
                    (x, 0.07, 0.014, 0.060, 0.058),
                    (x, 0.14, 0.015, 0.067, 0.072),
                    (x, 0.43, 0.018, 0.057, 0.061),
                    (x, 0.48, 0.008, 0.065, 0.073),
                    (x, 0.64, -0.008, 0.078, 0.078),
                    (x, 0.84, -0.012, 0.080, 0.09),
                ],
            )
    loft(
        "Waistband",
        [(0, 0.77 + dz, -0.01, 0.145, 0.09), (0, 0.86 + dz, -0.01, 0.15, 0.09)],
        seam,
    )
    part("shoes")
    for s in (-1, 1):
        x = s * 0.087
        d = 0.415 if sit else 0
        loft(
            "Moulded heel and toe",
            [
                (x, 0.008, d + 0.032, 0.061, 0.127),
                (x, 0.030, d + 0.032, 0.068, 0.135),
                (x, 0.061, d + 0.029, 0.064, 0.128),
                (x, 0.095, d - 0.009, 0.056, 0.068),
            ],
            sides=8,
        )
        tube(
            "Vamp seam",
            [
                (x - 0.045, 0.068, d + 0.074),
                (x, 0.077, d + 0.084),
                (x + 0.045, 0.068, d + 0.074),
            ],
            0.004,
            seam,
        )
    part("top")
    loft(
        "Jacket body",
        [
            (0, 0.81 + dz, -0.012, 0.16, 0.096),
            (0, 0.86 + dz, 0, 0.165, 0.105),
            (0, 1.04 + dz, -0.006, 0.143, 0.096),
            (0, 1.24 + dz, 0, 0.176, 0.112),
            (0, 1.35 + dz, -0.006, 0.169, 0.095),
            (0, 1.41 + dz, -0.003, 0.075, 0.068),
        ],
    )
    for s in (-1, 1):
        wrist = 0.97 if sit else 0.845
        rows = [
            (s * 0.228, wrist + dz, 0.255 if sit else 0.037, 0.044, 0.044),
            (s * 0.237, 1.045 + dz, 0.17 if sit else 0.029, 0.051, 0.051),
            (s * 0.21, 1.25 + dz, 0.022, 0.062, 0.068),
            (s * 0.166, 1.355 + dz, 0, 0.060, 0.069),
        ]
        loft("Tailored sleeve", rows)
        loft(
            "Knit cuff",
            [(x, z - 0.025, d, rx * 0.94, ry * 0.94) for x, z, d, rx, ry in [rows[0]]]
            + [rows[0]],
            seam,
        )
        mesh(
            "Collar fold",
            [
                (s * 0.042, -0.058, 1.395 + dz),
                (s * 0.116, -0.055, 1.35 + dz),
                (s * 0.065, -0.089, 1.265 + dz),
                (s * 0.017, -0.099, 1.30 + dz),
            ],
            [(0, 1, 2, 3), (3, 2, 1, 0)],
            seam,
        )
    part("skin")
    loft(
        "Neck",
        [(0, 1.382 + dz, 0, 0.044, 0.045), (0, 1.491 + dz, 0.006, 0.044, 0.048)],
        sides=7,
        smooth=True,
    )
    loft(
        "Cheeks and chin",
        [
            (0, 1.453 + dz, 0.020, 0.050, 0.065),
            (0, 1.487 + dz, 0.017, 0.078, 0.083),
            (0, 1.552 + dz, 0.013, 0.093, 0.101),
            (0, 1.628 + dz, 0.001, 0.093, 0.093),
            (0, 1.666 + dz, -0.003, 0.066, 0.069),
        ],
        sides=10,
        smooth=True,
    )
    for s in (-1, 1):
        z = 0.975 + dz if sit else 0.844
        d = 0.255 if sit else 0.037
        loft(
            "Hand",
            [
                (s * 0.230, z - 0.092, d + 0.014, 0.025, 0.037),
                (s * 0.229, z - 0.053, d + 0.008, 0.033, 0.043),
                (s * 0.228, z - 0.012, d, 0.030, 0.031),
            ],
            sides=7,
            smooth=True,
        )
    part("hair")
    loft(
        "Combed crown",
        [
            (0, 1.565 + dz, -0.024, 0.090, 0.076),
            (0, 1.606 + dz, -0.010, 0.099, 0.096),
            (-0.012, 1.648 + dz, 0.005, 0.091, 0.09),
            (-0.021, 1.685 + dz, -0.004, 0.066, 0.061),
            (-0.021, 1.698 + dz, -0.006, 0.029, 0.024),
        ],
        sides=10,
        smooth=True,
    )
    if not sit:
        part("bag")
        loft(
            "Gusseted shopping bag",
            [
                (0.269, 0.444, 0.027, 0.112, 0.047),
                (0.269, 0.46, 0.028, 0.122, 0.051),
                (0.269, 0.742, 0.028, 0.125, 0.054),
                (0.269, 0.753, 0.028, 0.117, 0.044),
            ],
            sides=4,
        )
        for d in (0.01, 0.053):
            tube(
                "Cord handle",
                [
                    (0.205, 0.749, d),
                    (0.218, 0.795, d),
                    (0.243, 0.824, d),
                    (0.273, 0.824, d),
                    (0.303, 0.795, d),
                    (0.320, 0.749, d),
                ],
                0.008,
                detail,
            )
# Linked low-detail copies follow edits to the source mesh. Simplify each
# component before merging to retain separate hands, feet and fabric seams.
for source in list(scene.collection.children):
    far = bpy.data.collections.new(source.name + "Far")
    scene.collection.children.link(far)
    far["bundle"] = "visitors"
    far["origin"] = [source["origin"][0], 3, 0]
    for part in source.objects:
        duplicate = part.copy()
        far.objects.link(duplicate)
        duplicate.location.y += 3
        modifier = duplicate.modifiers.new("Distant silhouette", "DECIMATE")
        modifier.ratio = 0.32
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "visitors.blend"), compress=True)
