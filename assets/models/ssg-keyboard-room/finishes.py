"""Original product surface atlas for the two photographed winter plush displays."""

from math import pi
import bpy
import numpy as np
import mosaic

WIDTH = 1024
HEIGHT = 704
TILE = 192
SWATCHES = {
    "plain": (774, 12),
    "fleece": (0, 480),
    "blackfur": (192, 480),
    "knit": (384, 480),
    "nylon": (576, 480),
    "lacquer": (768, 480),
}
IMAGE_NAMES = (
    "스누피 플레이스 · 제품과 타일",
    "스누피 플레이스 · 섬유 요철",
    "스누피 플레이스 · 소재 거칠기",
)
TILE_UV = (
    0.5 / WIDTH,
    0.5 / HEIGHT,
    (mosaic.COLS * 10 - 0.5) / WIDTH,
    (mosaic.ROWS * 10 - 0.5) / HEIGHT,
)


def add_fibres(relief, rng, amount, dark):
    # Lay short fibres over a slowly changing nap. Light and shadow straddle
    # each filament so the thread direction stays legible at close range.
    h, w = relief.shape
    for _ in range(amount):
        x = rng.uniform(0, w)
        y = rng.uniform(0, h)
        angle = (
            0.86 + 0.72 * np.sin(y / 42) + 0.42 * np.cos(x / 35) + rng.normal(0, 0.39)
        )
        length = rng.uniform(2.2, 6.7 if dark else 4.5)
        dx, dy = length * np.cos(angle), length * np.sin(angle)
        a = max(0, int(min(x, x + dx) - 2))
        b = min(w, int(max(x, x + dx) + 3))
        c = max(0, int(min(y, y + dy) - 2))
        d = min(h, int(max(y, y + dy) + 3))
        yy, xx = np.mgrid[c:d, a:b]
        u = xx - x
        v = yy - y
        t = np.clip((u * dx + v * dy) / length**2, 0, 1)
        rr = (u - t * dx) ** 2 + (v - t * dy) ** 2
        relief[c:d, a:b] += (
            rng.uniform(0.17, 0.56)
            * np.exp(-rr / 0.46)
            * (0.62 + 0.38 * np.sin(t * pi))
        )


def surface(key, rng):
    yy, xx = np.mgrid[:TILE, :TILE]
    u = xx / TILE
    v = yy / TILE
    noise = rng.normal(0, 1, u.shape)
    h = np.zeros_like(u)
    c = np.ones_like(u)
    rough = {
        "plain": 0.64,
        "fleece": 0.93,
        "blackfur": 0.89,
        "knit": 0.86,
        "nylon": 0.40,
        "lacquer": 0.46,
    }[key]
    if key in ("fleece", "blackfur"):
        add_fibres(h, rng, 6800, key == "blackfur")
        soft = 0.60 * np.sin(
            2 * pi * (2 * u + v + 0.10 * np.sin(9 * v))
        ) + 0.52 * np.cos(2 * pi * (u - 2 * v))
        c = 0.942 + 0.065 * (h - 0.22) + 0.017 * soft + 0.009 * noise
        h += 0.05 * noise
    elif key == "knit":
        # Each stitch comprises two yarn legs meeting in a V. Offset courses
        # put the crossing yarn under the next loop.
        col = u * 15
        row = v * 19
        phase = col % 1
        course = row % 1
        center = 0.48 + 0.035 * np.sin(2 * pi * row)
        path = np.minimum(
            abs((phase - center) - (0.09 + 0.34 * course)),
            abs((phase - center) + (0.09 + 0.34 * course)),
        )
        yarn = np.exp(-((path / 0.115) ** 2))
        twist = 0.5 + 0.5 * np.cos(2 * pi * (course * 5 + phase * 1.8))
        h = (
            0.58 * yarn
            + 0.12 * yarn * twist
            + 0.08 * np.sin(2 * pi * course)
            + 0.04 * noise
        )
        c = 0.80 + 0.20 * yarn + 0.034 * twist + 0.010 * noise
    elif key == "nylon":
        ribs = 0.5 + 0.5 * np.cos(2 * pi * (u * 53 + 0.09 * np.sin(17 * v)))
        cross = 0.5 + 0.5 * np.cos(2 * pi * (v * 56 + 0.10 * np.sin(12 * u)))
        h = 0.16 * ribs + 0.09 * cross + 0.045 * noise
        c = (
            0.96
            + 0.017 * ribs
            + 0.012 * cross
            + 0.018 * np.sin(2 * pi * (u + v))
            + 0.007 * noise
        )
    elif key == "lacquer":
        h = 0.035 * noise
        c = 0.98 + 0.008 * noise
    dy, dx = np.gradient(h)
    normal = np.stack((-0.71 * dx, -0.71 * dy, np.ones_like(u)), axis=2)
    normal = 0.5 + 0.5 * normal / np.linalg.norm(normal, axis=2)[:, :, None]
    return (
        np.repeat(np.clip(c, 0, 1)[:, :, None], 3, axis=2),
        normal,
        np.clip(rough + 0.024 * h, 0, 1),
    )


def store_image(name, values, data):
    old = bpy.data.images.get(name)
    if old:
        old.name = name + " · 이전"
    image = bpy.data.images.new(name, WIDTH, HEIGHT, alpha=False)
    if data:
        image.colorspace_settings.name = "Non-Color"
    rgba = np.ones((HEIGHT, WIDTH, 4), np.float32)
    rgba[:, :, :3] = values
    image.pixels.foreach_set(rgba.ravel())
    image.pack()
    image.use_fake_user = True
    if old:
        old.user_remap(image)
        bpy.data.images.remove(old)
    return image


def images(swatch_source):
    shape = (HEIGHT, WIDTH, 3)
    base = np.ones(shape)
    norm = np.zeros(shape) + [0.5, 0.5, 1]
    factors = np.zeros(shape) + [1, 0.64, 0]
    rgb, n = mosaic.paint(swatch_source)
    h, w = rgb.shape[:2]
    base[:h, :w] = rgb
    norm[:h, :w] = n
    factors[:h, :w, 1] = 0.51
    for index, (key, (x, y)) in enumerate(SWATCHES.items()):
        color, small, r = surface(key, np.random.default_rng(2956 + index))
        tile = np.s_[y : y + TILE, x : x + TILE]
        base[tile] = color
        norm[tile] = small
        factors[tile][:, :, 1] = r
    return [
        store_image(name, data, i > 0)
        for i, (name, data) in enumerate(zip(IMAGE_NAMES, (base, norm, factors)))
    ]


def shared(images):
    mat = bpy.data.materials.new("Paint, cloth and printed goods")
    mat.use_nodes = True
    mat.use_fake_user = True
    tree = mat.node_tree
    nodes = tree.nodes
    link = tree.links.new
    p = nodes["Principled BSDF"]
    tex = []
    for image in images:
        node = nodes.new("ShaderNodeTexImage")
        node.image = image
        tex.append(node)
    vertex = nodes.new("ShaderNodeVertexColor")
    vertex.layer_name = "Paint"
    mix = nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 1
    link(tex[0].outputs[0], mix.inputs[1])
    link(vertex.outputs[0], mix.inputs[2])
    link(mix.outputs[0], p.inputs["Base Color"])
    bump = nodes.new("ShaderNodeNormalMap")
    bump.inputs["Strength"].default_value = 0.72
    link(tex[1].outputs[0], bump.inputs["Color"])
    link(bump.outputs[0], p.inputs["Normal"])
    split = nodes.new("ShaderNodeSeparateColor")
    link(tex[2].outputs[0], split.inputs[0])
    link(split.outputs["Green"], p.inputs["Roughness"])
    return mat


def color_and_uv(obj, rgba, key):
    m = obj.data
    tint = m.color_attributes.new(name="Paint", type="BYTE_COLOR", domain="POINT")
    bands = obj.get("quiltBands")
    layout = obj.get("ringUV") or obj.get("clothUV")
    for i, item in enumerate(tint.data):
        if bands and layout:
            v = (i // layout[0]) / (layout[1] - 1)
            air = np.sin(pi * (v * bands + 0.07)) ** 2
            shade = 0.78 + 0.22 * air
            item.color = (*[c * shade for c in rgba[:3]], 1)
        else:
            item.color = rgba
    uv = m.uv_layers.new(name="제품 UV")
    uv.active_render = True
    x, y = SWATCHES[key]
    if key == "plain":
        value = ((x + TILE / 2) / WIDTH, (y + TILE / 2) / HEIGHT)
        arr = np.tile(value, len(m.loops))
        uv.data.foreach_set("uv", arr)
        return
    ring = obj.get("ringUV")
    grid = obj.get("clothUV")
    if not ring and not grid:
        pts = np.array([v.co[:] for v in m.vertices])
        low = pts.min(axis=0)
        span = np.maximum(0.0001, pts.max(axis=0) - low)
    for poly in m.polygons:
        seam = (
            ring
            and len(poly.vertices) == 4
            and max(v % ring[0] for v in poly.vertices)
            - min(v % ring[0] for v in poly.vertices)
            > ring[0] // 2
        )
        if not ring and not grid:
            axis = max(range(3), key=lambda j: abs(poly.normal[j]))
            dims = [j for j in range(3) if j != axis]
        for k in poly.loop_indices:
            j = m.loops[k].vertex_index
            if ring:
                a = (j % ring[0]) / ring[0]
                b = (j // ring[0]) / (ring[1] - 1)
                if seam and a == 0:
                    a = 1.0
            elif grid:
                a = (j % grid[0]) / (grid[0] - 1)
                b = (j // grid[0]) / (grid[1] - 1)
            else:
                a, b = [(pts[j][z] - low[z]) / span[z] for z in dims]
            uv.data[k].uv = (
                (x + 2 + a * (TILE - 4)) / WIDTH,
                (y + 2 + b * (TILE - 4)) / HEIGHT,
            )


def author(obj, mat):
    mesh = obj.data
    source = mesh.materials[0]
    key = obj.get("surfaceSwatch", "plain")
    color_and_uv(obj, source.diffuse_color[:], key)
    if key != "plain":
        obj["원래 재질"] = source.name
        mesh.materials.clear()
        mesh.materials.append(mat)
