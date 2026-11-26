"""Editable porcelain cells for the entrance sign photographed at the Gangnam shop."""

import bpy
import numpy as np

COLS = 75
ROWS = 44
PITCH = 0.03
ORIGIN = (-1.116, -2.385, 0.0582)
LETTERS = {
    "S": ("01111", "10000", "10000", "01110", "00001", "00001", "11110"),
    "N": ("10001", "11001", "11001", "10101", "10011", "10011", "10001"),
    "O": ("01110", "10001", "10001", "10001", "10001", "10001", "01110"),
    "P": ("11110", "10001", "10001", "11110", "10000", "10000", "10000"),
    "Y": ("10001", "10001", "01010", "00100", "00100", "00100", "00100"),
    "L": ("10000", "10000", "10000", "10000", "10000", "10000", "11111"),
    "A": ("01110", "10001", "10001", "11111", "10001", "10001", "10001"),
    "C": ("01111", "10000", "10000", "10000", "10000", "10000", "01111"),
    "E": ("11111", "10000", "10000", "11110", "10000", "10000", "11111"),
}


def pattern():
    grid = np.zeros((ROWS, COLS), dtype=bool)
    grid[[0, -1], :] = True
    grid[:, [0, -1]] = True

    def stroke(path):
        for (x1, y1), (x2, y2) in zip(path, path[1:]):
            n = max(abs(x2 - x1), abs(y2 - y1))
            if not n:
                continue
            a = np.linspace(0, 1, n + 1)
            x = np.rint(x1 + (x2 - x1) * a).astype(int)
            y = np.rint(y1 + (y2 - y1) * a).astype(int)
            grid[y, x] = True

    # Hand-drawn stepped silhouette in the same left-facing pose as the inlay.
    stroke(
        [
            (17, 13),
            (19, 12),
            (21, 12),
            (22, 10),
            (25, 10),
            (27, 8),
            (30, 8),
            (32, 6),
            (37, 6),
            (39, 7),
            (43, 7),
            (47, 5),
            (53, 5),
            (55, 6),
            (58, 7),
            (61, 10),
            (62, 14),
            (63, 17),
            (63, 21),
            (62, 25),
            (60, 27),
            (56, 28),
            (53, 27),
            (51, 25),
            (47, 27),
            (42, 27),
            (40, 26),
            (38, 26),
            (36, 24),
            (32, 23),
            (30, 21),
            (27, 21),
            (25, 20),
            (22, 19),
            (21, 17),
            (19, 16),
            (17, 16),
            (17, 13),
        ]
    )
    grid[13:16, 17:21] = True
    grid[12:14, 20:22] = True
    grid[12:14, 36] = True
    grid[14, 37] = True
    ear = {
        14: (56, 58),
        15: (54, 61),
        16: (54, 61),
        17: (53, 62),
        18: (52, 62),
        19: (52, 61),
        20: (51, 61),
        21: (51, 61),
        22: (51, 61),
        23: (51, 60),
        24: (52, 60),
        25: (52, 59),
        26: (53, 57),
    }
    for row, (a, b) in ear.items():
        grid[row, a : b + 1] = True
    grid[16, 57] = False
    grid[17, 58] = False
    grid[24, 59] = False
    grid[25, 57:59] = False
    words = "SNOOPYPLACE"
    width = len(words) * 6 - 1
    left = (COLS - width) // 2
    for i, ch in enumerate(words):
        for y, line in enumerate(LETTERS[ch]):
            for x, filled in enumerate(line):
                if filled == "1":
                    grid[33 + y, left + i * 6 + x] = True
    return grid


def native(part, materials):
    mask = pattern()
    x0, y0, z = ORIGIN
    verts = []
    faces = []
    ink = []
    for row in range(ROWS):
        for col in range(COLS):
            # Stored order is the view from the public entrance, top row first.
            xx = x0 + PITCH * (col + 0.5)
            yy = y0 + PITCH * (ROWS - row - 0.5)
            base = len(verts)
            for r, h in [(PITCH * 0.489, 0), (PITCH * 0.460, 0.00105)]:
                verts.extend(
                    (xx + sx * r, yy + sy * r, z + h)
                    for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]
                )
            faces.append((base + 4, base + 5, base + 6, base + 7))
            for k in range(4):
                faces.append(
                    (base + k, base + (k + 1) % 4, base + 4 + (k + 1) % 4, base + 4 + k)
                )
            ink.extend([int(mask[row, col])] * 5)
    ob = part("입구 스누피 모자이크 · 개별 타일", verts, faces, "tileIvory")
    ob.data.materials.append(materials["tileInk"])
    ob.data.polygons.foreach_set("material_index", ink)
    ob["tileGrid"] = [COLS, ROWS]
    ob["pitch"] = PITCH
    ob["corner"] = list(ORIGIN)
    return ob


def native_colors(ob):
    mesh = ob.data
    # The first face in each five-face cell is its upper glazed surface. Use the
    # artist's assigned Blender material rather than re-drawing the default mask.
    if len(mesh.polygons) != ROWS * COLS * 5:
        raise ValueError("Mosaic colour export expects the native five faces per tile")
    colors = np.array([m.diffuse_color[:3] for m in mesh.materials])
    return colors[np.array([p.material_index for p in mesh.polygons])[::5]].reshape(
        ROWS, COLS, 3
    )


def paint(ob, pixels=10):
    world_colors = native_colors(ob)[::-1]
    grid = np.repeat(np.repeat(world_colors, pixels, axis=0), pixels, axis=1)
    rows, cols = grid.shape[:2]
    y, x = np.mgrid[:rows, :cols]
    dist = np.minimum.reduce(
        (x % pixels, pixels - 1 - x % pixels, y % pixels, pixels - 1 - y % pixels)
    ).astype(float)
    rng = np.random.default_rng(163)
    color_noise = rng.uniform(0.964, 1.0, (ROWS, COLS))
    variation = np.repeat(np.repeat(color_noise, pixels, axis=0), pixels, axis=1)
    color = grid * variation[:, :, None]
    # Ceramic glaze and dark grout remain distinguishable when the plaque
    # becomes a single surface at a walking distance.
    grout = np.array([0.43, 0.41, 0.37])
    weight = np.clip((0.82 - dist) / 1.05, 0.0, 0.8)
    color = color * (1 - weight[:, :, None]) + grout * weight[:, :, None]
    color += ((dist == 1) * 0.019)[:, :, None]
    edge = np.clip(dist / 2.3, 0, 1)
    dy, dx = np.gradient(edge)
    norm = np.stack((-0.42 * dx, -0.42 * dy, np.ones_like(x)), axis=2)
    norm /= np.linalg.norm(norm, axis=2)[:, :, None]
    return color, 0.5 + 0.5 * norm


def proxy(ob, atlas_uv):
    cols, rows = ob["tileGrid"]
    pitch = ob["pitch"]
    x, y, z = ob["corner"]
    z += 0.00105
    v = [
        (x, y, z),
        (x + cols * pitch, y, z),
        (x + cols * pitch, y + rows * pitch, z),
        (x, y + rows * pitch, z),
    ]
    m = bpy.data.meshes.new(ob.name + " · 게임 표면")
    m.from_pydata(v, [], [(0, 1, 2, 3)])
    m.update()
    old = ob.data
    ob.data = m
    if not old.users:
        bpy.data.meshes.remove(old)
    uv = m.uv_layers.new(name="제품 UV")
    left, bottom, right, top = atlas_uv
    for item, coord in zip(
        uv.data, [(left, bottom), (right, bottom), (right, top), (left, top)]
    ):
        item.uv = coord
    tint = m.color_attributes.new(name="Paint", type="BYTE_COLOR", domain="POINT")
    for item in tint.data:
        item.color = (1, 1, 1, 1)
