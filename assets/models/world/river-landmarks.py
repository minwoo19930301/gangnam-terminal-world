"""Art-scale exteriors of Banpo Bridge, Jamsu Bridge and Some Sevit in the city scene."""

import json
import math
from pathlib import Path

import bpy
from mathutils import Vector

ISLETS = {305677067: "가빛", 270550732: "채빛", 305677071: "솔빛", 305692221: "예빛"}
BUILDINGS = {414267182: "가빛", 320797228: "채빛", 320797229: "솔빛"}
PIERS = (848771871, 850389024, 850389025, 850389026, 850389027, 850389028, 851471280)
UPPER = [
    (-521.6, -441.74, 0),
    (-552.5, -557.4, 15),
    (-577.9, -624.7, 15),
    (-651.2, -813.2, 15),
    (-779.1, -1140.6, 15),
    (-920.5, -1500.5, 15),
    (-944.5, -1586.4, 15),
    (-1003.65, -1959.55, 0),
]
A = (-614, -710)
B = (-694.02, -920.79)
AB = math.dist(A, B)
LOWER = [
    (-590.01, -647.54, 0),
    (*A, 0.1),
    (A[0] + 120 * (B[0] - A[0]) / AB, A[1] + 120 * (B[1] - A[1]) / AB, 0.1),
    (*B, 1.6),
    (-762.57, -1098.77, 1.6),
    (-800, -1196, 5.3),
    (-831, -1277, 5.3),
    (-866, -1367, 1.6),
    (-912.02, -1486.06, 1.6),
    (-931.69, -1540.58, 0),
]
COLORS = {
    "asphalt": 0x646B6B,
    "walk": 0xC6B4A0,
    "cycle": 0x99796E,
    "concrete": 0xACA9A0,
    "fascia": 0x6C7D7D,
    "steel": 0x879391,
    "white": 0xD8D9CD,
    "ochre": 0xC7A65A,
    "wood": 0xA39B87,
    "pontoon": 0x788780,
    "gavit": 0x6E9A93,
    "chavit": 0x658993,
    "solbit": 0x63899A,
    "roof": 0x93A7A6,
    "frame": 0xA8B6B2,
    "bronze": 0x514A3B,
    "bronze_trim": 0xA58A59,
    "shadow": 0x485B5C,
    "screen": 0x29485B,
}


def paint(name):
    key = "수변 외관 · " + name
    mat = bpy.data.materials.get(key)
    if mat:
        return mat
    mat = bpy.data.materials.new(key)
    rgb = [((COLORS[name] >> s & 255) / 255) ** 2.2 for s in (16, 8, 0)]
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    p = mat.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*rgb, 1)
    p.inputs["Metallic"].default_value = (
        0.36
        if name in ("gavit", "chavit", "solbit", "steel", "frame", "roof")
        else 0.03
    )
    p.inputs["Roughness"].default_value = (
        0.23 if name in ("gavit", "chavit", "solbit") else 0.68
    )
    return mat


class Skin:
    def __init__(self, coll, name):
        self.coll, self.name = coll, name
        self.vertices, self.faces, self.materials, self.slots = [], [], [], []

    def face(self, points, finish):
        n = len(self.vertices)
        self.vertices.extend((x, -z, y) for x, z, y in points)
        self.faces.append(tuple(range(n, n + len(points))))
        if finish not in self.materials:
            self.materials.append(finish)
        self.slots.append(self.materials.index(finish))

    def bar(self, a, b, width, depth, finish):
        # Cross section is horizontal across a sloping handrail or lane centreline.
        a, b = Vector(a), Vector(b)
        along = (b - a).normalized()
        side = Vector((-along.y, along.x, 0))
        if side.length < 0.001:
            side = Vector((1, 0, 0))
        side.normalize()
        up = along.cross(side).normalized()
        left = [
            a + side * (u * width / 2) + up * (v * depth / 2)
            for u, v in [(-1, -1), (1, -1), (1, 1), (-1, 1)]
        ]
        right = [v + b - a for v in left]
        for i in range(4):
            j = (i + 1) % 4
            self.face([left[i], right[i], right[j], left[j]], finish)

    def solid(self, ring, bottom, top, sides, cap):
        # Geometric rings arrive in x-east/z-south order. Reverse positive x/z
        # area so the top normal points up after conversion to Blender.
        ring = list(ring)
        if (
            sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:] + ring[:1]))
            > 0
        ):
            ring.reverse()
        low = [(*p, bottom) for p in ring]
        high = [(*p, top) for p in ring]
        self.face(high, cap)
        self.face(list(reversed(low)), sides)
        for i in range(len(ring)):
            j = (i + 1) % len(ring)
            self.face([low[i], low[j], high[j], high[i]], sides)

    def finish(self):
        data = bpy.data.meshes.new(self.name)
        data.from_pydata(self.vertices, [], self.faces)
        for key in self.materials:
            data.materials.append(paint(key))
        for p, i in zip(data.polygons, self.slots):
            p.material_index = i
        data.update()
        obj = bpy.data.objects.new(self.name, data)
        self.coll.objects.link(obj)
        return obj


def terrain(grid, x, z):
    # Same triangle diagonal as the city's 25-m display grid.
    u = max(0, min(grid["width"] - 1.000001, (x - grid["x"]) / grid["step"]))
    v = max(0, min(grid["height"] - 1.000001, (z - grid["z"]) / grid["step"]))
    i, j = math.floor(u), math.floor(v)
    u -= i
    v -= j
    w = grid["width"]
    rows = grid["rows"]
    a = rows[j * w + i]
    b = rows[j * w + i + 1]
    c = rows[(j + 1) * w + i]
    d = rows[(j + 1) * w + i + 1]
    return (
        a + (b - a) * u + (c - a) * v
        if u + v <= 1
        else d + (c - d) * (1 - u) + (b - d) * (1 - v)
    )


def along(x, z, a, b):
    return ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / math.dist(
        a[:2], b[:2]
    )


def spans(controls):
    distances = [math.dist(a[:2], b[:2]) for a, b in zip(controls, controls[1:])]

    def at(s, off=0):
        for i, length in enumerate(distances):
            if s <= length or i == len(distances) - 1:
                a, b = controls[i : i + 2]
                t = max(0, min(1, s / length))
                dx = (b[0] - a[0]) / length
                dz = (b[1] - a[1]) / length
                return (
                    a[0] + (b[0] - a[0]) * t - dz * off,
                    a[1] + (b[1] - a[1]) * t + dx * off,
                    a[2] + (b[2] - a[2]) * t,
                )
            s -= length

    return at, distances


def bridges(coll, grid, water):
    high = water + 20 - 14.6

    def datum(x, z, lower):
        if lower:
            blend = max(
                0,
                min(
                    1,
                    (along(x, z, A, B) - 120) / 70,
                    along(x, z, LOWER[-1], LOWER[-2]) / 50,
                ),
            )
            return (1 - blend) * terrain(grid, x, z) + blend * (water + 2.7 - 1.6)
        for start, end in [(UPPER[0], UPPER[1]), (UPPER[-1], UPPER[-2])]:
            t = max(0, along(x, z, start, end)) / math.dist(start[:2], end[:2])
            if t < 1:
                ground = terrain(grid, *start[:2]) + 0.06
                return max(
                    ground + (high - ground) * t, terrain(grid, x, z) + 0.06 - 15 * t
                )
        return high

    for lower, controls, name in [
        (False, UPPER, "반포대교 · 상판과 난간"),
        (True, LOWER, "잠수교 · 하부 굴곡과 보행면"),
    ]:
        skin = Skin(coll, name)
        at, dist = spans(controls)
        length = sum(dist)
        half = 9 if lower else 12.5

        def point(s, o=0, h=0):
            x, z, y = at(s, o)
            return (x, z, datum(x, z, lower) + y + h)

        # Keep all original centreline joints and add intermediate samples on the land tie-ins.
        breaks = [0.0]
        total = 0.0
        for d in dist:
            n = math.ceil(d / 17)
            breaks.extend(total + d * j / n for j in range(1, n + 1))
            total += d
        for a, b in zip(breaks, breaks[1:]):
            skin.face(
                [point(a, -half), point(a, half), point(b, half), point(b, -half)],
                "asphalt",
            )
            for side in (-1, 1):
                o = side * half
                skin.face(
                    [point(a, o), point(b, o), point(b, o, -0.72), point(a, o, -0.72)],
                    "fascia",
                )
                skin.bar(point(a, o, 1.12), point(b, o, 1.12), 0.095, 0.11, "steel")
                skin.bar(point(a, o, 0.59), point(b, o, 0.59), 0.055, 0.06, "steel")
                for n in range(math.ceil((b - a) / 4.0)):
                    s = a + (b - a) * n / math.ceil((b - a) / 4.0)
                    skin.bar(point(s, o), point(s, o, 1.12), 0.085, 0.085, "steel")
            if lower:
                for left, right, finish in [(-8.84, -3, "walk"), (-3.0, -1.2, "cycle")]:
                    skin.face(
                        [
                            point(a, left, 0.025),
                            point(a, right, 0.025),
                            point(b, right, 0.025),
                            point(b, left, 0.025),
                        ],
                        finish,
                    )
            else:
                for o in [-8.8, -3.0, 3.0, 8.8]:
                    skin.bar(
                        point(a, o, -0.97), point(b, o, -0.97), 0.33, 1.23, "concrete"
                    )
        if not lower:
            for s in range(1, int(length) - 4, 10):
                for o in (-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6):
                    skin.bar(
                        point(s, o, 0.028),
                        point(s + 4, o, 0.028),
                        0.15,
                        0.012,
                        "ochre" if not o else "white",
                    )
        skin.finish()
    piers = Skin(coll, "수변 교각 · 하층 가장자리의 콘크리트 문틀")
    at, dist = spans(LOWER)
    for s in range(85, int(sum(dist) - 45), 34):
        x, z, _ = at(s)
        p = at(s + 1)
        dx = p[0] - x
        dz = p[1] - z

        def point(off, height, fore=0):
            xx, zz, _ = at(s, off)
            return xx + fore * dx, zz + fore * dz, height

        piers.bar(
            point(-12.5, high + 12.9), point(12.5, high + 12.9), 2.15, 1.6, "concrete"
        )
        for side in [-1, 1]:
            xx, zz, _ = at(s, side * 10.15)
            foot = min(water - 1, terrain(grid, xx, zz) - 2.2)
            piers.bar(
                point(side * 10.15, foot),
                point(side * 10.15, high + 12.1),
                1.60,
                2.08,
                "concrete",
            )
    piers.finish()


def rounded_hull(points):
    def half(p):
        out = []
        for c in p:
            while len(out) >= 2:
                a, b = out[-2:]
                if (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0:
                    break
                out.pop()
            out.append(c)
        return out

    ordered = [Vector((x, z)) for x, z in sorted(points)]
    hull = half(ordered)[:-1] + half(ordered[::-1])[:-1]
    n = len(hull)
    result = []
    for i in range(n):
        a, b, c, d = (hull[(i + k) % n] for k in (-1, 0, 1, 2))
        knots = [0]
        for u, v in [(a, b), (b, c), (c, d)]:
            knots.append(knots[-1] + max(0.00001, (u - v).length ** 0.5))

        def lerp(p, q, t, lo, hi):
            return p + (q - p) * ((t - lo) / (hi - lo))

        t0, t1, t2, t3 = knots
        for j in range(4):
            t = t1 + (t2 - t1) * j / 4
            p = lerp(a, b, t, t0, t1)
            q = lerp(b, c, t, t1, t2)
            r = lerp(c, d, t, t2, t3)
            result.append(lerp(lerp(p, q, t, t0, t2), lerp(q, r, t, t1, t3), t, t1, t2))
    return result


def island_shell(coll, site, outline, ground):
    if site == "가빛":
        cx, cz = -880.5, -736
        points = [
            (cx + (p.x - cx) * 1.018, cz + (p.y - cz) * 1.018)
            for p in rounded_hull(outline)
        ]
        levels = [(0, 1), (5, 1), (10.6, 1), (17.55, 1)]
        levels += [
            (
                17.55 + 9.45 * math.sin(j * math.pi / 12),
                0.6 + 0.4 * math.cos(j * math.pi / 12),
            )
            for j in range(1, 7)
        ]
        glass = "gavit"
    else:
        points = []
        for a, b in zip(outline, outline[1:] + outline[:1]):
            n = max(1, math.ceil(math.dist(a, b) / 2.8))
            points.extend(
                (a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n)
                for j in range(n)
            )
        cx = sum(x for x, _ in points) / len(points)
        cz = sum(z for _, z in points) / len(points)
        levels = [(v, 1) for v in ([0, 7, 14, 19] if site == "채빛" else [0, 6, 11])]
        glass = "chavit" if site == "채빛" else "solbit"
    if (
        sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1]))
        > 0
    ):
        points.reverse()
    pane = Skin(coll, site + "섬 · 유리 외피와 창틀")

    def ring(h, r):
        return [(cx + (x - cx) * r, cz + (z - cz) * r, ground + h) for x, z in points]

    rings = [ring(h, r) for h, r in levels]
    for bottom, top in zip(rings, rings[1:]):
        for i, a in enumerate(bottom):
            j = (i + 1) % len(points)
            pane.face([a, bottom[j], top[j], top[i]], glass)
            pane.bar(a, top[i], 0.115, 0.115, "frame")
            pane.bar(top[i], top[j], 0.18, 0.13, "frame")
    pane.face(rings[-1], "roof")
    if site == "솔빛":
        # The glass occupied floors sit inside a much taller bronze shell. Its dome,
        # circular base and framed glazing bands are distinct in the game exterior.
        profile = [
            (-1.1, 1),
            (2.6, 1),
            (6.6, 1.03),
            (10.6, 1.03),
            (15, 0.97),
            (20, 0.78),
            (24, 0.45),
            (26.3, 0.13),
            (26.6, 0.01),
        ]

        def sol(i, h, r):
            a = -math.tau * i / 48
            return (
                -890 + 17.7 * r * math.cos(a),
                -828 + 13.2 * r * math.sin(a),
                ground + h,
            )

        for (h, r), (hi, ri) in zip(profile, profile[1:]):
            for i in range(48):
                # Eastern entry cut through the drum. Bronze and open glazing bays
                # follow the existing game silhouette but use a coarser mesh.
                if (i < 2 or i > 46) and h < 3.6:
                    continue
                a, b = sol(i, h, r), sol(i + 1, h, r)
                c, d = sol(i + 1, hi, ri), sol(i, hi, ri)
                glass_bay = (i <= 2 or i >= 46) and h < 15
                pane.face(
                    [a, b, c, d],
                    "concrete" if h < 2 else "solbit" if glass_bay else "bronze",
                )
                if h >= 2:
                    if i % 2 == 0:
                        pane.bar(a, d, 0.115, 0.11, "bronze_trim")
                    for f in (0.5, 1):
                        mid = lambda u, v: tuple(a + (b - a) * f for a, b in zip(u, v))
                        pane.bar(mid(a, d), mid(b, c), 0.13, 0.12, "bronze_trim")
    pane.finish()


def chavit_collection(coll, world_dir, level):
    path = (Path(world_dir).parent / "hangang/chavit-crown.blend").resolve()
    names = ["외피 교차 트러스", "은색 지붕 테두리"]

    def existing():
        return {
            o.name: o
            for o in bpy.data.objects
            if o.library
            and Path(bpy.path.abspath(o.library.filepath)).resolve() == path
            and o.name in names
        }

    objs = existing()
    if set(names) - objs.keys():
        with bpy.data.libraries.load(str(path), link=True, relative=True) as (
            src,
            load,
        ):
            load.objects = [name for name in names if name not in objs]
        objs = existing()
    group = bpy.data.collections.new("채빛섬 · 연결 외피 원본")
    for name in names:
        group.objects.link(objs[name])
    inst = bpy.data.objects.new("채빛섬 · Blender 외피와 지붕 격자", None)
    inst.instance_type = "COLLECTION"
    inst.instance_collection = group
    inst.location = (-790, 820, level)
    inst.empty_display_size = 0.30
    coll.objects.link(inst)


def build_river_landmarks(scene, seed, here):
    root = Path(here).resolve().parents[2]
    osm = json.loads((root / "data/osm.json").read_text())
    areas = {a["id"]: a["poly"] for a in osm["areas"] if a["id"] in {*ISLETS, *PIERS}}
    water = next(a["xyz"][0][2] for a in seed["land"] if a.get("id") == 152336)
    level = water + 1.4
    coll = bpy.data.collections.new("반포대교 · 잠수교 · 세빛섬 외관")
    scene.collection.children.link(coll)
    bridges(coll, seed["ground"], water)
    for site, name in ISLETS.items():
        deck = Skin(coll, name + "섬 · 부유 보행 데크")
        deck.solid(areas[site], level - 1.2, level + 0.045, "pontoon", "wood")
        deck.finish()
    for obj in list(scene.objects):
        try:
            key = int(obj.get("osm_id", "-1"))
        except ValueError:
            continue
        if key in BUILDINGS:
            obj.hide_viewport = True
            obj.hide_render = True
    for b in osm["buildings"]:
        if b["id"] in BUILDINGS:
            island_shell(coll, BUILDINGS[b["id"]], b["poly"], level)
    chavit_collection(coll, here, level)
    docks = Skin(coll, "세빛섬 · 연결 도교와 예빛 수상무대")
    for p in PIERS:
        if p not in (850389028, 850389025, 850389026):
            docks.solid(areas[p], level - 0.42, level + 0.035, "pontoon", "wood")
    for a, b, w in [
        ((-827.27, -669.485), (-855.25, -724.8), 6),
        ((-880.2, -779.2), (-890.4, -813.1), 4.3),
        ((-868.1, -833.8), (-824, -827.1), 4.3),
    ]:
        dx, dz = b[0] - a[0], b[1] - a[1]
        length = math.hypot(dx, dz)

        def pos(t, o):
            return a[0] + t * dx - dz * o / length, a[1] + t * dz + dx * o / length

        docks.solid(
            [pos(0, -w / 2), pos(1, -w / 2), pos(1, w / 2), pos(0, w / 2)],
            level - 0.38,
            level + 0.04,
            "pontoon",
            "wood",
        )
        if w == 6:
            for side in [-1, 1]:
                post = pos(24 / length, side * 2.92)
                docks.bar((*post, level), (*post, level + 4.6), 0.4, 0.4, "white")
                for reach in (6, 12, 18, 34, 41, 48):
                    docks.bar(
                        (*post, level + 4.35),
                        (*pos(reach / length, side * 2.92), level + 0.75),
                        0.10,
                        0.10,
                        "white",
                    )
        for side in [-1, 1]:
            o = side * w / 2
            docks.bar(
                (*pos(0, o), level + 1.08),
                (*pos(1, o), level + 1.08),
                0.075,
                0.075,
                "steel",
            )
            for j in range(math.ceil(length / 4) + 1):
                pt = pos(min(1, j * 4 / length), o)
                docks.bar((*pt, level), (*pt, level + 1.08), 0.07, 0.07, "steel")
    # The broad dark display stands on Yebit's actual floating OSM footprint.
    a = -0.66
    u = (math.cos(a), -math.sin(a))
    left = (-924 - u[0] * 11.5, -635 - u[1] * 11.5)
    right = (-924 + u[0] * 11.5, -635 + u[1] * 11.5)
    docks.bar((*left, level + 6), (*right, level + 6), 0.34, 12, "screen")
    docks.finish()
    coll["scope"] = (
        "공개 수변 외관의 원경 모델. 통행과 시설 운영은 게임의 기존 장소 모듈에서 처리합니다."
    )
    return coll
