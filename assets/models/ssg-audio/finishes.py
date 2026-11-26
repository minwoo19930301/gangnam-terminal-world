"""Original UV swatches for the public Gangnam listening display."""

from math import pi
from zlib import crc32
import bpy
import numpy as np

TILE = 160
COLUMNS = 4
ROWS = 3
NAMES = (
    "plain",
    "walnut",
    "terra",
    "mokara",
    "z02",
    "z06",
    "phonix",
    "gold",
    "suede",
    "metalmesh",
    "leather",
    "backlight",
)
FINISHES = (
    (0.49, 0.00),
    (0.46, 0.00),
    (0.18, 0.29),
    (0.20, 0.31),
    (0.22, 0.14),
    (0.24, 0.22),
    (0.16, 0.42),
    (0.28, 0.75),
    (0.86, 0.00),
    (0.32, 0.71),
    (0.66, 0.00),
    (0.58, 0.00),
)


def packed(name, values, data=False):
    image = bpy.data.images.new(name, values.shape[1], values.shape[0], alpha=False)
    if data:
        image.colorspace_settings.name = "Non-Color"
    rgba = np.ones((*values.shape[:2], 4), dtype="float32")
    rgba[:, :, :3] = np.clip(values, 0, 1)
    image.pixels.foreach_set(rgba.ravel())
    image.pack()
    image.use_fake_user = True
    return image


def textures():
    # The first swatch is white so the original headphones retain their vertex colors.
    size = (ROWS * TILE, COLUMNS * TILE, 3)
    color = np.ones(size)
    normal = np.zeros(size) + [0.5, 0.5, 1]
    factors = np.ones(size)
    yy, xx = np.mgrid[0:TILE, 0:TILE]
    x = xx / TILE
    y = yy / TILE
    for i, key in enumerate(NAMES):
        rnd = np.random.default_rng(150 + i)
        noise = rnd.normal(0, 1, x.shape)
        h = np.zeros_like(x)
        c = np.ones((*x.shape, 3))
        rough, metal = FINISHES[i]
        if key == "walnut":
            # Cathedral figure and tight diffuse pores running with the end grain.
            contours = 13 * x + 1.34 * np.cos(3 * y) + 0.4 * np.sin(5 * y + 9 * x)
            late = (0.5 + 0.5 * np.cos(2 * pi * contours)) ** 4
            pores = (
                np.maximum(0, np.cos(2 * pi * (79 * x + 0.52 * np.sin(6 * y))))
            ) ** 9
            h = 0.22 * late + 0.12 * pores + 0.08 * noise
            shade = 0.94 - 0.14 * late - 0.055 * pores + 0.019 * noise
            c = shade[:, :, None] * [0.71, 0.50, 0.35]
        elif key in ("terra", "mokara", "z02", "z06"):
            palettes = {
                "terra": [
                    (0.01, 0.10, 0.11),
                    (0.055, 0.30, 0.22),
                    (0.13, 0.69, 0.51),
                    (0.24, 0.78, 0.23),
                    (0.024, 0.21, 0.59),
                    (0.92, 0.66, 0.13),
                    (0.80, 0.25, 0.09),
                ],
                "mokara": [
                    (0.065, 0.043, 0.10),
                    (0.31, 0.14, 0.48),
                    (0.52, 0.23, 0.74),
                    (0.41, 0.40, 0.83),
                    (0.07, 0.61, 0.43),
                    (0.40, 0.75, 0.30),
                    (0.83, 0.69, 0.39),
                ],
                "z02": [
                    (0.035, 0.030, 0.043),
                    (0.15, 0.08, 0.19),
                    (0.22, 0.13, 0.27),
                    (0.31, 0.28, 0.34),
                    (0.16, 0.13, 0.205),
                ],
                "z06": [
                    (0.085, 0.023, 0.023),
                    (0.26, 0.035, 0.041),
                    (0.42, 0.067, 0.054),
                    (0.11, 0.051, 0.036),
                    (0.31, 0.12, 0.055),
                ],
            }
            palette = np.array(palettes[key])
            c[:] = palette[0]
            # Seeded multi-scale angular inclusions, drawn in the faceplate itself.
            for count, radius in [(120, 7), (230, 3.5), (280, 1.6)]:
                for _ in range(count):
                    px, py = rnd.uniform(1, TILE - 1, 2)
                    r = radius * rnd.uniform(0.55, 1.5)
                    angle = rnd.uniform(0, pi)
                    x0 = max(0, int(px - r * 1.8))
                    x1 = min(TILE, int(px + r * 1.8) + 1)
                    y0 = max(0, int(py - r * 1.8))
                    y1 = min(TILE, int(py + r * 1.8) + 1)
                    xs = xx[y0:y1, x0:x1] - px
                    ys = yy[y0:y1, x0:x1] - py
                    u = xs * np.cos(angle) + ys * np.sin(angle)
                    v = -xs * np.sin(angle) + ys * np.cos(angle)
                    mask = np.abs(u) / r + np.abs(v) / (0.64 * r) < 1
                    tint = palette[rnd.integers(0, len(palette))] * rnd.uniform(
                        0.76, 1.13
                    )
                    c[y0:y1, x0:x1][mask] = tint
                    h[y0:y1, x0:x1][mask] = rnd.uniform(0.0, 0.35)
            c *= np.expand_dims(1 + 0.035 * noise, 2)
        elif key == "phonix":
            # The domed ruby face catches the dark, diagonally woven backing.
            h = (0.5 + 0.5 * np.cos(2 * pi * (x * 24 - y * 14))) ** 3
            c = (0.75 + 0.22 * h + 0.05 * y)[:, :, None] * [0.54, 0.105, 0.125]
        elif key == "gold":
            holes = (np.cos(2 * pi * 18 * x) * np.cos(2 * pi * 24 * y)) > 0.48
            h = np.where(holes, 0.05, 0.50)
            c = (0.38 + 0.55 * h + 0.14 * np.cos((x - y) * 3))[:, :, None] * [
                1.0,
                0.81,
                0.40,
            ]
        elif key == "suede":
            h = 0.30 + 0.08 * noise + 0.22 * np.cos(6 * x - 8 * y + 0.5 * np.sin(7 * x))
            c = (0.18 + 0.15 * h + 0.012 * noise)[:, :, None] * [1.08, 0.98, 1.0]
        elif key == "metalmesh":
            u = (x * 28 + (np.floor(y * 30) % 2) * 0.5) % 1 - 0.5
            v = (y * 30) % 1 - 0.5
            field = (u / 0.35) ** 2 + (v / 0.34) ** 2
            h = np.clip((field - 0.55) * 1.2, 0, 1)
            c = (0.105 + 0.33 * h + 0.16 * y)[:, :, None] * [0.98, 1.0, 1.04]
        elif key == "leather":
            h = 0.32 + 0.18 * noise + 0.085 * np.sin(46 * x + 1.5 * np.sin(15 * y))
            c = (0.14 + 0.14 * h)[:, :, None] * [1.04, 0.98, 0.96]
        elif key == "backlight":
            pool = (
                0.65
                + 0.22 * y
                + 0.17
                * np.exp(-(((y - 0.85) / 0.14) ** 2))
                * (1 - 0.55 * (2 * x - 1) ** 2)
            )
            c = pool[:, :, None] * [0.91, 0.68, 0.47]
        row, col = divmod(i, COLUMNS)
        tile = np.s_[row * TILE : (row + 1) * TILE, col * TILE : (col + 1) * TILE]
        dy, dx = np.gradient(h)
        n = np.stack((-0.48 * dx, -0.48 * dy, np.ones_like(x)), axis=2)
        color[tile] = c
        normal[tile] = 0.5 + 0.5 * n / np.linalg.norm(n, axis=2)[:, :, None]
        factors[tile] = [1, rough, metal]
    return (
        packed("청음대 · 마감 색", color),
        packed("청음대 · 마감 요철", normal, True),
        packed("청음대 · 거칠기와 금속성", factors, True),
    )


def material(images):
    result = bpy.data.materials.new("SchezadeHeadphones")
    result.use_nodes = True
    result.use_fake_user = True
    tree = result.node_tree
    shader = tree.nodes.get("Principled BSDF")
    base, norm, orm = [tree.nodes.new("ShaderNodeTexImage") for _ in images]
    for node, img in zip([base, norm, orm], images):
        node.image = img
    tint = tree.nodes.new("ShaderNodeVertexColor")
    tint.layer_name = "Finish"
    mix = tree.nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 1
    tree.links.new(base.outputs[0], mix.inputs[1])
    tree.links.new(tint.outputs[0], mix.inputs[2])
    tree.links.new(mix.outputs[0], shader.inputs["Base Color"])
    bump = tree.nodes.new("ShaderNodeNormalMap")
    tree.links.new(norm.outputs[0], bump.inputs["Color"])
    tree.links.new(bump.outputs[0], shader.inputs["Normal"])
    channels = tree.nodes.new("ShaderNodeSeparateRGB")
    tree.links.new(orm.outputs[0], channels.inputs[0])
    tree.links.new(channels.outputs["G"], shader.inputs["Roughness"])
    tree.links.new(channels.outputs["B"], shader.inputs["Metallic"])
    return result


def map_obj(obj, tile, mat):
    data = obj.data
    uv = data.uv_layers.new(name="상품과 목재 결")
    uv.active_render = True
    row, col = divmod(NAMES.index(tile), COLUMNS)
    coords = [v.co for v in data.vertices]
    bounds = [(min(p[k] for p in coords), max(p[k] for p in coords)) for k in range(3)]
    for face in data.polygons:
        axis = max(range(3), key=lambda k: abs(face.normal[k]))
        u_axis, v_axis = [k for k in range(3) if k != axis]
        if (
            tile == "walnut"
            and bounds[u_axis][1] - bounds[u_axis][0]
            > bounds[v_axis][1] - bounds[v_axis][0]
        ):
            u_axis, v_axis = v_axis, u_axis
        sample = crc32(obj.name.encode())
        for index in face.loop_indices:
            v = data.vertices[data.loops[index].vertex_index].co

            def coordinate(axis):
                low, high = bounds[axis]
                return (v[axis] - low) / max(0.00001, high - low)

            u = 0.5 if tile == "plain" else coordinate(u_axis)
            t = 0.5 if tile == "plain" else coordinate(v_axis)
            if tile == "walnut":
                u = (0.13 * ((sample % 101) / 100)) + 0.84 * (
                    u if sample % 2 else 1 - u
                )
                t = (0.16 * (((sample >> 8) % 101) / 100)) + 0.80 * (
                    t if sample % 3 else 1 - t
                )
            uv.data[index].uv = (
                (col * TILE + 2 + u * (TILE - 4)) / (COLUMNS * TILE),
                (row * TILE + 2 + t * (TILE - 4)) / (ROWS * TILE),
            )
    if tile != "plain":
        obj["마감 견본"] = tile
        data.materials.clear()
        data.materials.append(mat)
