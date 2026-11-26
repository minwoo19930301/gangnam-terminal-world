"""Original canvas, metal, reflector and wood finishes on one shared UV sheet."""

from math import pi
import bpy
import numpy as np

TILE = 160
NAMES = (
    "plain",
    "metal",
    "satin",
    "paint",
    "rubber",
    "canvas",
    "blackcanvas",
    "webbing",
    "oak",
    "reflector",
    "ceramic",
    "leather",
)
PBR = (
    (0.57, 0),
    (0.27, 0.64),
    (0.37, 0.38),
    (0.32, 0.10),
    (0.81, 0.01),
    (0.93, 0),
    (0.84, 0),
    (0.78, 0.02),
    (0.49, 0),
    (0.25, 0.24),
    (0.36, 0),
    (0.60, 0.02),
)
DEFAULTS = {
    "chrome": "metal",
    "silver": "satin",
    "steel": "satin",
    "nickel": "metal",
    "alloy": "metal",
    "chainSteel": "metal",
    "darkChain": "metal",
    "brass": "metal",
    "rubber": "rubber",
    "treadBlack": "rubber",
    "leaf": "paint",
    "flapTan": "canvas",
    "bagTan": "canvas",
    "wovenGreen": "blackcanvas",
    "strapBlack": "webbing",
    "oakHoney": "oak",
    "oakLight": "oak",
    "ceramic": "ceramic",
    "reflectAmber": "reflector",
}
MAP_NAMES = (
    "브롬톤 · 제품 표면",
    "브롬톤 · 재봉과 금속 요철",
    "브롬톤 · 거칠기와 금속성",
)


def make_images():
    shape = (3 * TILE, 4 * TILE, 3)
    base = np.ones(shape)
    normals = np.zeros(shape) + [0.5, 0.5, 1]
    orm = np.ones(shape)
    yy, xx = np.mgrid[:TILE, :TILE]
    u = xx / TILE
    v = yy / TILE
    for i, name in enumerate(NAMES):
        rng = np.random.default_rng(8054 + i)
        noise = rng.normal(0.0, 1, u.shape)
        relief = np.zeros_like(u)
        val = np.ones_like(u)
        rough, metal = PBR[i]
        if name in ("canvas", "blackcanvas", "webbing"):
            # Alternating warp/weft (basketweave on the dark roll top,
            # longitudinal ribs on the black buckle tape).
            nx, ny = {"canvas": (41, 38), "blackcanvas": (32, 30), "webbing": (29, 13)}[
                name
            ]
            warp = u * nx + 0.06 * np.sin(7 * v) + 0.025 * np.sin(29 * v)
            weft = v * ny + 0.06 * np.cos(9 * u) + 0.026 * np.cos(27 * u)
            order = ((np.floor(warp) + np.floor(weft)) % 2) == 0
            hi = np.cos(2 * pi * warp)
            cross = np.cos(2 * pi * weft)
            relief = np.where(order, 0.66 * hi + 0.18 * cross, 0.65 * cross + 0.19 * hi)
            if name == "webbing":
                relief = (
                    0.82 * hi
                    + 0.23 * cross
                    + 0.13 * np.sin(2 * pi * (weft + warp * 0.25))
                )
            slub = np.exp(
                -(((warp - 23.2 - 0.09 * np.sin(v * 40)) / 0.16) ** 2)
            ) * np.exp(-(((v - 0.63) / 0.12) ** 2))
            relief += 0.18 * slub + 0.08 * noise
            val = 0.91 + 0.049 * relief + 0.018 * np.sin(7 * u + 3 * v) + 0.016 * noise
        elif name in ("metal", "satin"):
            lines = u * 68 + 0.15 * np.sin(6 * v) + 0.05 * np.sin(16 * v)
            relief = 0.08 * np.sin(2 * pi * lines) + 0.025 * noise
            val = 0.94 + 0.044 * np.cos(7 * u + 1.8 * v) + 0.006 * noise
        elif name == "oak":
            rings = 11 * u + 0.6 * np.sin(4 * v + u) + 0.18 * np.sin(8 * v - 2 * u)
            tight = (0.5 + 0.5 * np.sin(2 * pi * (49 * u + 0.17 * np.sin(v * 13)))) ** 7
            relief = (0.5 + 0.5 * np.sin(2 * pi * rings)) ** 5 + 0.28 * tight
            val = 0.97 - 0.091 * relief - 0.026 * tight + 0.012 * noise
        elif name == "rubber":
            relief = 0.09 * noise + 0.075 * np.sin(2 * pi * (34 * u + 9 * v))
            val = 0.92 + 0.012 * noise + 0.016 * np.sin(6 * u + 2 * v)
        elif name == "reflector":
            # Fine alternating prismatic facets behind the amber lens.
            a = np.abs(((u * 10 + v * 6) % 1) * 2 - 1)
            b = np.abs(((u * 10 - v * 6) % 1) * 2 - 1)
            relief = np.minimum(a, b)
            val = 0.71 + 0.23 * relief + 0.045 * np.sin(u * 40)
        elif name == "leather":
            cells = np.sin(2 * pi * (v * 18 + 0.37 * np.cos(23 * u))) + np.cos(
                2 * pi * (u * 25 + 0.42 * np.sin(19 * v))
            )
            relief = 0.11 * cells + 0.18 * noise
            val = 0.94 + 0.024 * cells + 0.01 * noise
        elif name == "paint":
            relief = 0.04 * noise
            val = 0.97 + 0.015 * np.cos(2 * pi * u) + 0.008 * noise
        color = np.repeat(np.clip(val, 0, 1)[:, :, None], 3, axis=2)
        if name == "canvas":
            color[:, :, 2] *= 0.985
        off_x = i % 4 * TILE
        off_y = i // 4 * TILE
        tile = np.s_[off_y : off_y + TILE, off_x : off_x + TILE]
        base[tile] = color
        dy, dx = np.gradient(relief)
        n = np.stack((-0.64 * dx, -0.64 * dy, np.ones_like(u)), axis=2)
        normals[tile] = 0.5 + 0.5 * n / np.linalg.norm(n, axis=2)[:, :, None]
        orm[tile] = np.stack(
            (
                np.ones_like(u),
                np.clip(rough + np.abs(relief) * 0.034, 0, 1),
                np.ones_like(u) * metal,
            ),
            axis=2,
        )
    result = []
    for i, (name, values) in enumerate(zip(MAP_NAMES, (base, normals, orm))):
        image = bpy.data.images.new(name, shape[1], shape[0], alpha=False)
        if i:
            image.colorspace_settings.name = "Non-Color"
        rgba = np.ones((shape[0], shape[1], 4), np.float32)
        rgba[:, :, :3] = values
        image.pixels.foreach_set(rgba.ravel())
        image.pack()
        image.use_fake_user = True
        result.append(image)
    return result


def material(name, images):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_fake_user = True
    tree = mat.node_tree
    nodes = tree.nodes
    link = tree.links.new
    bsdf = nodes.get("Principled BSDF")
    tex = []
    for image in images:
        node = nodes.new("ShaderNodeTexImage")
        node.image = image
        tex.append(node)
    vert = nodes.new("ShaderNodeVertexColor")
    vert.layer_name = "Finish"
    mult = nodes.new("ShaderNodeMixRGB")
    mult.blend_type = "MULTIPLY"
    mult.inputs[0].default_value = 1
    link(tex[0].outputs[0], mult.inputs[1])
    link(vert.outputs[0], mult.inputs[2])
    link(mult.outputs[0], bsdf.inputs["Base Color"])
    bump = nodes.new("ShaderNodeNormalMap")
    bump.inputs["Strength"].default_value = 0.70
    link(tex[1].outputs[0], bump.inputs["Color"])
    link(bump.outputs[0], bsdf.inputs["Normal"])
    split = nodes.new("ShaderNodeSeparateColor")
    link(tex[2].outputs[0], split.inputs[0])
    link(split.outputs["Green"], bsdf.inputs["Roughness"])
    link(split.outputs["Blue"], bsdf.inputs["Metallic"])
    return mat


def unwrap(obj, mat):
    mesh = obj.data
    original = mesh.materials[0]
    key = obj.get("finishTile", DEFAULTS.get(original.name, "plain"))
    idx = NAMES.index(key)
    ox = idx % 4
    oy = idx // 4
    tint = mesh.color_attributes.new(name="Finish", type="BYTE_COLOR", domain="POINT")
    rgba = original.diffuse_color[:]
    for item in tint.data:
        item.color = rgba
    uv = mesh.uv_layers.new(name="제품 표면 UV")
    uv.active_render = True
    sample = (
        ("finishTile" in obj)
        and key not in ("plain", "ceramic")
        and not obj.get("chainJoints")
    )
    grid = obj.get("gridSize")
    if sample:
        coords = np.array([v.co[:] for v in mesh.vertices])
        mins = coords.min(axis=0)
        span = np.maximum(coords.max(axis=0) - mins, 0.00001)
    for face in mesh.polygons:
        axis = max(range(3), key=lambda i: abs(face.normal[i]))
        axes = [i for i in range(3) if i != axis]
        if sample and key in ("oak", "webbing") and span[axes[0]] > span[axes[1]]:
            axes.reverse()
        for k in face.loop_indices:
            if grid:
                vertex = mesh.loops[k].vertex_index
                u = (vertex % grid[0]) / (grid[0] - 1)
                v = (vertex // grid[0]) / (grid[1] - 1)
            elif sample:
                p = coords[mesh.loops[k].vertex_index]
                u, v = [(p[j] - mins[j]) / span[j] for j in axes]
            else:
                u = v = 0.5
            inset = 2 / TILE
            uv.data[k].uv = (
                (ox + inset + u * (1 - 2 * inset)) / 4,
                (oy + inset + v * (1 - 2 * inset)) / 3,
            )
    if key != "plain":
        obj["원래 재질"] = original.name
        mesh.materials.clear()
        mesh.materials.append(mat)
