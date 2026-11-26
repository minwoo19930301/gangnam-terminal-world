"""Author editable buckwheat strands and project their wet surface into a UV atlas."""

from math import pi, cos, sin
import bpy
import numpy as np

SIZE = 640
ATLAS = 896
RADIUS = 0.142
WATER = 0.081
TAU = 2 * pi


def strands():
    rng = np.random.default_rng(39122)
    result = []
    for side in [-1, 1]:
        for family in range(21):
            phases = rng.uniform(-pi, pi, 6)
            wind = rng.uniform(0.78, 1.26)
            offset = rng.uniform(-1, 1)
            angle = rng.uniform(-0.45, 0.40) + side * 0.16
            span = 0.082 + rng.uniform(-0.020, 0.016)
            width = 0.028 + rng.uniform(-0.014, 0.011)
            rise = rng.uniform(-0.006, 0.003)
            family_y = rng.uniform(-0.013, 0.009)
            for strand in range(4):
                t = np.linspace(
                    phases[0] - 0.10 * strand,
                    phases[0] + TAU * wind + 0.05 * strand,
                    112,
                )
                # Neighbouring turns share a fold, then diverge with slack
                # around the ends. This produces relaxed bundles, not random coils.
                u = (
                    width * np.cos(t)
                    + offset * 0.024
                    + 0.010 * np.sin(2 * t + phases[1])
                    + 0.0045 * np.cos(3 * t + phases[2])
                )
                v = (
                    span * np.sin(t)
                    + 0.007 * np.sin(3 * t + phases[3])
                    + 0.006 * np.cos(2 * t + phases[4])
                )
                du = np.gradient(u)
                dv = np.gradient(v)
                length = np.maximum(1e-8, np.hypot(du, dv))
                spread = (strand - 1.5) * 0.0035 * (
                    0.5 + 0.5 * np.cos(t + phases[1])
                ) + 0.0037 * np.sin(3.4 * t + strand * 0.72 + phases[2])
                u += spread * dv / length
                v -= spread * du / length
                slack = rng.uniform(-pi, pi)
                u += 0.0038 * np.sin(5.2 * t + slack) + 0.0030 * np.sin(
                    8.1 * t + slack * 0.7
                )
                v += 0.0038 * np.cos(4.6 * t + slack) + 0.0028 * np.sin(
                    7.8 * t + slack * 0.8
                )
                curled = np.exp(-(((np.cos(t + phases[4]) - 0.94) / 0.40) ** 2))
                u += 0.009 * curled * np.cos(6.5 * t + slack * 0.35)
                v += 0.008 * curled * np.sin(6.5 * t + slack * 0.35)
                x = side * 0.052 + u * cos(angle) - v * sin(angle)
                y = 0.007 + u * sin(angle) + v * cos(angle) + family_y
                radius = np.hypot(x, y)
                scale = np.minimum(1, 0.134 / np.maximum(radius, 1e-6))
                x *= scale
                y *= scale
                envelope = np.maximum(
                    0, 1 - ((x - side * 0.05) / 0.080) ** 2 - ((y - 0.008) / 0.110) ** 2
                )
                z = (
                    0.064
                    + 0.052 * envelope
                    + rise
                    + 0.0038 * np.sin(2 * t + phases[5])
                    + 0.0016 * np.sin(5 * t + strand * 0.4 + phases[3])
                )
                # Both ends sink into the broth; only sections reaching the
                # surface receive the sharp wet highlight.
                descent = np.exp(-(((t - t[0]) / 0.33) ** 2)) + np.exp(
                    -(((t - t[-1]) / 0.33) ** 2)
                )
                z -= 0.012 * descent
                r = rng.uniform(0.00117, 0.00148) * (
                    1 + 0.045 * np.sin(t * 4 + phases[3])
                )
                tint = rng.uniform(0.91, 1.065)
                result.append((np.stack((x, y, z), axis=1), r, tint))
    # Loose ends behind the main folds remain visible through the broth near
    # the bowl wall and bridge the two mounds in front of the garnish.
    for j in range(24):
        t = np.linspace(-1, 1, 86)
        ang = rng.uniform(-pi, pi)
        start = rng.uniform(-0.07, 0.06)
        off = rng.uniform(0.066, 0.109)
        a = 0.09 * t + start + 0.013 * np.sin(4 * t + ang)
        b = (
            off
            - 0.039 * t * t
            + 0.016 * np.sin(4 * t + ang)
            + 0.008 * np.cos(9 * t + ang)
        )
        x = a * cos(ang) - b * sin(ang)
        y = a * sin(ang) + b * cos(ang)
        m = np.minimum(1, 0.137 / np.maximum(np.hypot(x, y), 0.001))
        x *= m
        y *= m
        z = 0.058 + 0.010 * (1 - t * t) + 0.005 * np.sin(3 * t + ang)
        r = np.ones_like(t) * rng.uniform(0.0011, 0.0014)
        result.append((np.stack((x, y, z), axis=1), r, rng.uniform(0.88, 0.99)))
    return result


SOURCE_COLLECTION = "평양면옥 · 메밀 면발 원형"


def source_curves(parent, paths, center, top, neutral, noodles):
    controls = bpy.data.collections.new(SOURCE_COLLECTION)
    parent.children.link(controls)
    controls["center"] = [*center, top]
    controls["shellMaterial"] = neutral.name
    controls["strandMaterials"] = [m.name for m in noodles]
    for mat in [neutral, *noodles]:
        mat.use_fake_user = True
    for order, (side, items) in enumerate(
        (("왼쪽", paths[:84]), ("오른쪽", paths[84:168]), ("육수에 잠긴", paths[168:]))
    ):
        data = bpy.data.curves.new(side + " 면발 묶음", "CURVE")
        data.dimensions = "3D"
        data.resolution_u = 1
        data.bevel_resolution = 1
        data.bevel_depth = 0.0014
        for points, radii, _ in items:
            spline = data.splines.new("POLY")
            spline.points.add(len(points) - 1)
            values = np.ones((len(points), 4))
            values[:, :3] = points
            spline.points.foreach_set("co", values.ravel())
            spline.points.foreach_set("radius", radii / data.bevel_depth)
        ob = bpy.data.objects.new(data.name, data)
        controls.objects.link(ob)
        ob.location = (*center, top)
        ob["strandPigments"] = [tint for _, _, tint in items]
        ob["groupOrder"] = order
    controls.hide_render = True
    controls.hide_viewport = True
    return controls


def read_curves(controls):
    center = np.asarray(controls["center"])
    result = []
    for ob in sorted(
        controls.objects, key=lambda obj: (obj.get("groupOrder", 99), obj.name)
    ):
        if ob.type != "CURVE":
            continue
        pigments = ob.get("strandPigments", [])
        world = np.asarray(ob.matrix_basis)
        for i, spline in enumerate(ob.data.splines):
            if spline.type != "POLY" or len(spline.points) < 2:
                continue
            pts = np.empty(len(spline.points) * 4, dtype=np.float32)
            spline.points.foreach_get("co", pts)
            positions = pts.reshape((-1, 4)) @ world.T
            radius = np.empty(len(spline.points), dtype=np.float32)
            spline.points.foreach_get("radius", radius)
            result.append(
                (
                    positions[:, :3] - center,
                    radius.astype(float) * ob.data.bevel_depth,
                    pigments[i] if i < len(pigments) else 1.0,
                )
            )
    return result


def strand_field(paths):
    # Rasterize the visible cylinder surface, keeping the highest intersecting
    # strand and its radial normal. The packed image includes the submerged ends.
    step = 2 * RADIUS / (SIZE - 1)
    yy, xx = np.mgrid[:SIZE, :SIZE]
    x = xx * step - RADIUS
    y = yy * step - RADIUS
    z = np.full((SIZE, SIZE), -0.1)
    normal = np.zeros((SIZE, SIZE, 3))
    normal[:, :, 2] = 1
    pigment = np.ones((SIZE, SIZE))
    for points, radii, tint in paths:
        for i, (a, b) in enumerate(zip(points, points[1:])):
            radius = (radii[i] + radii[i + 1]) * 0.5
            minimum = np.minimum(a[:2], b[:2]) - radius
            maximum = np.maximum(a[:2], b[:2]) + radius
            lo = np.maximum(0, np.floor((minimum + RADIUS) / step).astype(int))
            hi = np.minimum(SIZE, np.ceil((maximum + RADIUS) / step).astype(int) + 1)
            tile = np.s_[lo[1] : hi[1], lo[0] : hi[0]]
            u = x[tile] - a[0]
            v = y[tile] - a[1]
            d = b - a
            d2 = d[0] * d[0] + d[1] * d[1]
            f = np.clip((u * d[0] + v * d[1]) / max(d2, 1e-12), 0, 1)
            dx = u - f * d[0]
            dy = v - f * d[1]
            rr = dx * dx + dy * dy
            dz = np.sqrt(np.maximum(0, radius * radius - rr))
            new_z = a[2] + f * d[2] + dz
            selected = (rr < radius * radius) & (new_z > z[tile])
            if not np.any(selected):
                continue
            z[tile][selected] = new_z[selected]
            pigment[tile][selected] = tint
            for c, value in enumerate((dx, dy, dz)):
                normal[tile][:, :, c][selected] = value[selected] / radius
    return x, y, z, normal, pigment


def blurred(a, rounds):
    for _ in range(rounds):
        a = (
            4 * a
            + np.roll(a, 2, 0)
            + np.roll(a, -2, 0)
            + np.roll(a, 2, 1)
            + np.roll(a, -2, 1)
        ) / 8
    return a


def bowl_finish(paths):
    x, y, z, n, tint = strand_field(paths)
    rng = np.random.default_rng(887)
    noise = rng.standard_normal(x.shape)
    occupied = z > 0
    above = z >= WATER
    depth = np.maximum(0, WATER - z)
    rad = np.hypot(x, y) / RADIUS
    bed = np.maximum(z, 0.061)
    # Surface-to-surface contact shades crossings. Broad kitchen light strips
    # reflect off each narrow parallel strand in addition to the soft room fill.
    neighbor = blurred(bed, 4)
    contact = np.clip((neighbor - bed) * 75, 0, 0.35)
    facing = np.clip(0.42 * n[:, :, 0] - 0.30 * n[:, :, 1] + 0.84 * n[:, :, 2], 0, 1)
    highlight = (
        np.clip(0.37 * n[:, :, 0] - 0.13 * n[:, :, 1] + 0.922 * n[:, :, 2], 0, 1) ** 23
    )
    second = (
        np.clip(-0.64 * n[:, :, 0] + 0.17 * n[:, :, 1] + 0.75 * n[:, :, 2], 0, 1) ** 29
    )
    grain_noise = 0.012 * noise + 0.011 * np.sin(
        x * 2400 + y * 510 + 1.1 * np.sin(y * 95)
    )
    noodle = (
        0.68
        + 0.23 * facing
        - 0.75 * contact
        + 0.068 * highlight
        + 0.045 * second
        + grain_noise
    ) * tint
    noodles = (
        noodle[:, :, None] * [0.84, 0.776, 0.684]
        + (highlight * 0.058 + second * 0.040)[:, :, None]
    )
    grey = (
        0.625 + 0.063 * y / RADIUS + 0.035 * np.cos(2 * pi * x / 0.218) + 0.005 * noise
    )
    broth = grey[:, :, None] * [0.95, 0.842, 0.712]
    # Behind a greater depth of cloudy broth, contrast and color fall away.
    transmission = np.where(occupied, np.exp(-depth * 47), 0.0)
    color = broth * (1 - transmission[:, :, None]) + noodles * transmission[:, :, None]
    # Floor colour remains visible through water between the submerged strands.
    shadow = np.clip(blurred(occupied.astype(float), 8), 0, 1) * 0.075
    color -= shadow[:, :, None] * np.where(occupied, 0.25, 1)[:, :, None]
    light = (
        np.exp(
            -(((x - 0.026 + 0.17 * (y + 0.105)) / 0.007) ** 2)
            - ((y + 0.105) / 0.0049) ** 2
        )
        * 0.25
        + np.exp(-(((x + 0.044) / 0.014) ** 2) - ((y - 0.120) / 0.0027) ** 2) * 0.29
    )
    light += (
        0.08 * np.exp(-(((rad - 0.972) / 0.012) ** 2)) * np.clip(0.7 + y / RADIUS, 0, 1)
    )
    reflection = 0.027 * np.exp(
        -(((x + 0.08 - 0.21 * y) / 0.012) ** 2)
    ) + 0.041 * np.exp(-(((x - 0.063 + 0.24 * y) / 0.020) ** 2))
    color += (light + reflection)[:, :, None] * (~above)[:, :, None]
    color = 0.76 * color + 0.06 * (
        np.roll(color, 1, axis=0)
        + np.roll(color, -1, axis=0)
        + np.roll(color, 1, axis=1)
        + np.roll(color, -1, axis=1)
    )
    # Submerged and exposed noodles share the same continuous surface height.
    # Fine normals account for rounding without thousands of separate GPU tubes.
    normal = n.copy()
    normal[:, :, :2] *= np.where(occupied, 0.65 * np.exp(-depth * 41), 0)[:, :, None]
    normal[:, :, 2] = np.where(occupied, 0.65 + 0.35 * n[:, :, 2], 1)
    normal /= np.linalg.norm(normal, axis=2)[:, :, None]
    smooth = blurred(np.maximum(z, WATER), 13)
    return np.clip(color, 0, 1), normal * 0.5 + 0.5, smooth


def image(name, values, noncolor=False):
    old = bpy.data.images.get(name)
    if old:
        old.name = name + " · 이전"
    h, w, _ = values.shape
    im = bpy.data.images.new(name, w, h, alpha=False)
    if noncolor:
        im.colorspace_settings.name = "Non-Color"
    rgba = np.ones((h, w, 4), np.float32)
    rgba[:, :, :3] = np.clip(values, 0, 1)
    im.pixels.foreach_set(rgba.ravel())
    im.pack()
    im.use_fake_user = True
    if old:
        old.user_remap(im)
        bpy.data.images.remove(old)
    return im


TILES = {
    "bowl": (0, 0, 640, 640),
    "plain": (640, 0, 128, 128),
    "beef": (640, 128, 256, 128),
    "pork": (640, 256, 256, 128),
    "yolk": (640, 384, 192, 192),
    "egg": (640, 576, 128, 64),
    "oak": (0, 640, 384, 256),
    "leaf": (384, 640, 256, 256),
    "radish": (640, 640, 256, 256),
}


def swatch(key, w, h):
    yy, xx = np.mgrid[:h, :w]
    u = xx / w
    v = yy / h
    rng = np.random.default_rng(247 + list(TILES).index(key))
    noise = rng.normal(0, 1, u.shape)
    value = np.ones_like(u)
    relief = np.zeros_like(u)
    color = np.ones((*u.shape, 3))
    if key == "oak":
        phase = 14 * u + 0.66 * np.sin(5 * v) + 0.24 * np.sin(5 * v + 8 * u)
        pores = (0.5 + 0.5 * np.sin(TAU * (59 * u + 0.17 * np.cos(8 * v)))) ** 6
        relief = (0.5 + 0.5 * np.cos(TAU * phase)) ** 3 + pores * 0.3
        value = 0.98 - 0.09 * relief - 0.028 * pores + 0.012 * noise
        color = value[:, :, None] * [1.04, 1.01, 0.96]
    elif key in ("beef", "pork"):
        coral = key == "beef"
        angle = 0.47 if coral else -0.29
        a = u * cos(angle) + v * sin(angle)
        b = v * cos(angle) - u * sin(angle)
        grain = (
            a * 45
            + 0.72 * np.sin(b * 17)
            + 0.37 * np.sin(12 * a + 8 * b)
            + 0.24 * np.sin(33 * a + 27 * b)
        )
        seams = (0.5 + 0.5 * np.cos(TAU * grain)) ** 7
        clusters = (0.5 + 0.5 * np.sin(TAU * (12 * a + 0.32 * np.sin(21 * b)))) ** 4
        branching = np.exp(
            -(((b - 0.45 - 0.14 * np.sin(6 * a) - 0.027 * np.sin(27 * a)) / 0.022) ** 2)
        )
        relief = 0.41 * seams + 0.21 * clusters + 0.30 * branching + 0.09 * noise
        if coral:
            color = (0.88 - 0.16 * seams - 0.13 * clusters + 0.025 * noise)[
                :, :, None
            ] * [0.64, 0.43, 0.34] + branching[:, :, None] * [0.23, 0.26, 0.22]
        else:
            color = (0.97 - 0.09 * seams - 0.05 * clusters + 0.018 * noise)[
                :, :, None
            ] * [0.92, 0.79, 0.70] + branching[:, :, None] * [0.06, 0.09, 0.105]
    elif key in ("yolk", "egg"):
        rind = key == "egg"
        coarse = np.sin(TAU * (u * 14 + v * 8 + 0.27 * np.cos(v * 17))) * np.sin(
            TAU * (v * 19 + 0.22 * np.sin(u * 18))
        )
        relief = 0.22 * coarse + 0.26 * noise if not rind else 0.045 * noise
        color = (0.99 + 0.04 * coarse + 0.029 * noise)[:, :, None] * (
            [0.98, 0.797, 0.22] if not rind else [0.99, 0.978, 0.906]
        )
    elif key == "leaf":
        # Napa veins branch diagonally away from a broad, nearly white midrib.
        rib = np.exp(-(((v - 0.50 - 0.055 * np.sin(7 * u)) / 0.14) ** 2))
        branching = (
            0.5
            + 0.5
            * np.cos(TAU * (7 * u + 3.8 * abs(v - 0.5) + 0.25 * np.sin(19 * v + 2 * u)))
        ) ** 13
        flange = np.clip(1 - u + 0.13 * np.sin(8 * v) + 0.11 * np.sin(8 * u), 0, 1)
        relief = (
            0.38 * rib + 0.19 * branching + 0.16 * np.cos(23 * u + 9 * v) + 0.06 * noise
        )
        normal_leaf = np.array([0.86, 0.72, 0.41]) + np.expand_dims(
            0.23 * flange, 2
        ) * [0.15, 0.59, 0.22]
        white_color = np.array([0.99, 0.95, 0.79])
        weight = np.clip(0.48 * rib + 0.3 * branching + 0.34 * u, 0, 1)
        color = (
            normal_leaf * (1 - weight[:, :, None]) + white_color * weight[:, :, None]
        )
        color *= np.expand_dims(0.98 + 0.035 * noise, 2)
    else:
        veins = (
            0.5
            + 0.5
            * np.cos(TAU * (30 * np.hypot(u - 0.58, v - 0.38) + 0.30 * np.sin(11 * u)))
        ) ** 6
        relief = 0.11 * veins + 0.06 * noise
        color = (0.98 - 0.043 * veins + 0.012 * noise)[:, :, None] * [0.98, 0.84, 0.63]
    if key in ("leaf", "radish"):
        # Red pepper fragments sit between the folded leaf and salted radish.
        for _ in range(115 if key == "leaf" else 52):
            x0, y0 = rng.integers(1, w - 3), rng.integers(1, h - 3)
            r = rng.integers(1, 3)
            weight = rng.uniform(0.30, 0.72)
            color[y0 : y0 + r, x0 : x0 + 1 + r] = (1 - weight) * color[
                y0 : y0 + r, x0 : x0 + 1 + r
            ] + weight * np.array([0.76, 0.18, 0.065])
    dy, dx = np.gradient(relief)
    norm = np.stack((-0.33 * dx, -0.33 * dy, np.ones_like(u)), axis=2)
    return np.clip(color, 0, 1), 0.5 + 0.5 * norm / np.linalg.norm(norm, axis=2)[
        :, :, None
    ]


def bake(paths):
    color = np.ones((ATLAS, ATLAS, 3))
    normal = np.zeros_like(color) + [0.5, 0.5, 1]
    sauce, small, heights = bowl_finish(paths)
    color[:SIZE, :SIZE] = sauce
    normal[:SIZE, :SIZE] = small
    for key, (x0, y0, w, h) in TILES.items():
        if key in ("plain", "bowl"):
            continue
        col, n = swatch(key, w, h)
        color[y0 : y0 + h, x0 : x0 + w] = col
        normal[y0 : y0 + h, x0 : x0 + w] = n
    return (
        image("평양면옥 · 음식과 나뭇결", color),
        image("평양면옥 · 면과 단면 요철", normal, True),
    ), heights


def shader(images):
    mat = bpy.data.materials.new("MyeonokTable finish")
    mat.use_nodes = True
    mat.use_fake_user = True
    mat["batch"] = "MyeonokTable"
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    p = nodes.get("Principled BSDF")
    p.inputs["Roughness"].default_value = 0.40
    col, nor = [nodes.new("ShaderNodeTexImage") for _ in images]
    col.image, nor.image = images
    vertex = nodes.new("ShaderNodeVertexColor")
    vertex.layer_name = "Tint"
    mix = nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 1
    links.new(col.outputs[0], mix.inputs[1])
    links.new(vertex.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], p.inputs["Base Color"])
    bump = nodes.new("ShaderNodeNormalMap")
    bump.inputs["Strength"].default_value = 0.65
    links.new(nor.outputs[0], bump.inputs["Color"])
    links.new(bump.outputs[0], p.inputs["Normal"])
    return mat


def uvmap(obj, key, center):
    data = obj.data
    uv = data.uv_layers.new(name="면과 고명 UV")
    uv.active_render = True
    left, bottom, w, h = TILES[key]
    coords = [v.co for v in data.vertices]
    extents = [(min(p[i] for p in coords), max(p[i] for p in coords)) for i in range(3)]
    for face in data.polygons:
        axis = max(range(3), key=lambda k: abs(face.normal[k]))
        axes = [k for k in range(3) if k != axis]
        if (
            key == "oak"
            and extents[axes[0]][1] - extents[axes[0]][0]
            > extents[axes[1]][1] - extents[axes[1]][0]
        ):
            axes.reverse()
        for li in face.loop_indices:
            v = data.vertices[data.loops[li].vertex_index].co
            if key == "bowl":
                u = (v.x - center[0] + RADIUS) / (2 * RADIUS)
                t = (v.y - center[1] + RADIUS) / (2 * RADIUS)
            elif key == "plain":
                u = t = 0.5
            else:
                u, t = [
                    (v[k] - extents[k][0]) / max(0.00001, extents[k][1] - extents[k][0])
                    for k in axes
                ]
            margin = 0.5 if key == "bowl" else 2
            uv.data[li].uv = (
                (left + margin + u * (w - 2 * margin)) / ATLAS,
                (bottom + margin + t * (h - 2 * margin)) / ATLAS,
            )


def prepare_food(obj, key, material, center):
    data = obj.data
    source = data.materials[0]
    obj["displayBatch"] = "MyeonokTable"
    has_painted_tint = bool(data.color_attributes.get("Tint"))
    if not has_painted_tint:
        tint = data.color_attributes.new(name="Tint", type="BYTE_COLOR", domain="POINT")
        for item in tint.data:
            item.color = source.diffuse_color
    uvmap(obj, key, center)
    if key != "plain" or has_painted_tint:
        obj["기존 표면"] = source.name
        data.materials.clear()
        data.materials.append(material)


def height_at(field, x, y):
    j = min(SIZE - 1, max(0, round((y + RADIUS) * (SIZE - 1) / (2 * RADIUS))))
    i = min(SIZE - 1, max(0, round((x + RADIUS) * (SIZE - 1) / (2 * RADIUS))))
    return float(field[j, i])


def runtime_bowl(mesh, tube, source, field, mat, noodle_mats, center, top):
    # The radial game shell follows the mound. Baked subsurface detail survives
    # minification. Exposed strands at the silhouettes retain real parallax.
    x, y = center
    steps = 80
    rows = 39
    verts = [(x, y, top + height_at(field, 0, 0))]
    faces = []
    for j in range(1, rows + 1):
        r = 0.142 * j / rows
        for i in range(steps):
            t = TAU * i / steps
            u = r * cos(t)
            v = r * sin(t)
            verts.append((x + u, y + v, top + height_at(field, u, v)))
            k = 1 + (j - 1) * steps + i
            l = 1 + (j - 1) * steps + (i + 1) % steps
            faces.append((0, k, l) if j == 1 else (k - steps, k, l, l - steps))
    dish = mesh("육수 표면과 메밀 면 위쪽", verts, faces, mat, True)
    dish["음식 UV"] = "bowl"
    dish["derivedNoodles"] = True
    for i, (points, radii, _) in enumerate(source):
        if i % 7:
            continue
        run = []
        for index, (u, v, z) in enumerate(points):
            exposed = z + float(radii[index]) > max(
                WATER + 0.001, height_at(field, u, v) - 0.0007
            )
            if exposed:
                run.append((x + u, y + v, top + z))
            if (not exposed or index == len(points) - 1) and run:
                if len(run) >= 4:
                    piece = tube(
                        "육수 위로 드러난 면발",
                        run,
                        float(np.mean(radii)),
                        noodle_mats[i % len(noodle_mats)],
                        6,
                    )
                    piece["derivedNoodles"] = True
                run = []


def rebake(col):
    from geometry import constructors

    controls = bpy.data.collections[SOURCE_COLLECTION]
    source = read_curves(controls)
    if not source:
        raise ValueError("At least one native poly spline with two points is required")
    _, heights = bake(source)
    for ob in list(col.objects):
        if ob.get("derivedNoodles"):
            mesh = ob.data
            bpy.data.objects.remove(ob, do_unlink=True)
            if not mesh.users:
                bpy.data.meshes.remove(mesh)
    x, y, top = controls["center"]
    base = bpy.data.materials[controls["shellMaterial"]]
    noodle_mats = [bpy.data.materials[name] for name in controls["strandMaterials"]]
    mesh, _, tube = constructors(col)
    runtime_bowl(mesh, tube, source, heights, base, noodle_mats, (x, y), top)
    shader = bpy.data.materials["MyeonokTable finish"]
    for obj in col.objects:
        if obj.get("derivedNoodles"):
            prepare_food(obj, obj.get("음식 UV", "plain"), shader, (x, y))
