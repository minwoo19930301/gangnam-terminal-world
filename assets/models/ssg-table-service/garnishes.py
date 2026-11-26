"""Edible surfaces visible in the customer's photograph of the Gangnam cold noodles."""

from math import cos, sin, pi, exp
from mathutils import Vector

TAU = 2 * pi


def tagged(obj, swatch):
    obj["음식 UV"] = swatch
    return obj


def meat_slices(mesh, center, top, mat, fat):
    bx, by = center
    for j, (name, swatch, angle, rx, ry, ox, oy, level) in enumerate(
        [
            ("소 편육", "beef", -0.27, 0.045, 0.031, -0.003, 0.005, 0.1145),
            ("돼지 편육", "pork", 0.28, 0.051, 0.032, 0.009, 0.007, 0.1305),
        ]
    ):
        vs = []
        fs = []
        nx = 16
        ny = 10
        for side in range(2):
            for b in range(ny + 1):
                v = b / ny * 2 - 1
                for a in range(nx + 1):
                    u = a / nx * 2 - 1
                    # Irregular cut ends and a folded lip over the lower slice.
                    xx = (
                        u * rx * (1 - 0.10 * v * v)
                        + 0.0019 * cos(v * 4 + j)
                        + 0.0013 * sin(8 * u + 10 * v + j)
                    )
                    yy = (
                        v * ry * (1 - 0.13 * u * u)
                        + 0.0028 * sin(4 * u + j)
                        + 0.0018 * cos(9 * u - 4 * v)
                    )
                    zz = (
                        0.0027 * cos(3 * u - 2 * v)
                        + 0.0022 * sin(2.8 * v + 0.6)
                        + 0.0053 * exp(-(((u + 0.87) / 0.25) ** 2)) * cos(3 * v)
                    )
                    zz += 0.0017 * sin(4 * u + 6 * v) * abs(v) ** 4 + 0.0028 * side
                    vs.append(
                        (
                            bx + ox + xx * cos(angle) - yy * sin(angle),
                            by + oy + xx * sin(angle) + yy * cos(angle),
                            top + level + zz,
                        )
                    )
        total = (nx + 1) * (ny + 1)
        for b in range(ny):
            for a in range(nx):
                k = b * (nx + 1) + a
                loop = (k, k + 1, k + nx + 2, k + nx + 1)
                fs.append(tuple(reversed(loop)))
                fs.append(tuple(n + total for n in loop))
        loop = [
            *range(nx + 1),
            *[(b + 1) * (nx + 1) + nx for b in range(ny)],
            *range(total - 2, total - nx - 2, -1),
            *[(ny - b) * (nx + 1) for b in range(1, ny)],
        ]
        for k, l in zip(loop, loop[1:] + loop[:1]):
            fs.append((k, l, l + total, k + total))
        tagged(mesh(name + " 살결과 눌린 가장자리", vs, fs, mat, True), swatch)
        if j == 1:
            # Irregular pale fat strip along one edge of the boiled pork.
            strip = []
            faces = []
            for a in range(nx + 1):
                k = total + a
                p = Vector(vs[k])
                q = Vector(vs[k + nx + 1])
                p.z += 0.00021
                q = p.lerp(q, 0.28 + 0.15 * sin(a * 0.8))
                q.z += 0.00022
                strip.extend([p, q])
                if a:
                    faces.append((2 * a - 2, 2 * a, 2 * a + 1, 2 * a - 1))
            mesh("제육 가장자리의 얇은 지방", strip, faces, fat, True)


def egg(mesh, rings, center, top, mat):
    bx, by = center
    angle = 0.35

    def to_world(x, y, h):
        return (
            bx - 0.007 + x,
            by + 0.008 + y * cos(angle) - h * sin(angle),
            top + 0.148 + y * sin(angle) + h * cos(angle),
        )

    loops = []
    steps = 56
    for j in range(12):
        a = 0.02 + (pi / 2 - 0.02) * j / 11
        loop = []
        for k in range(steps):
            t = TAU * k / steps
            loop.append(
                to_world(
                    0.0270 * sin(a) * cos(t) * (1 - 0.105 * sin(t)),
                    0.0355 * sin(a) * sin(t),
                    -0.026 * cos(a),
                )
            )
        loops.append(loop)
    obj = rings("삶은 달걀 흰자와 둥근 겉면", loops, mat, True, False)
    tagged(obj, "egg")
    # The photographed yolk protrudes slightly above the cut white. The white
    # has a shallow recess, with a moist curved collar instead of two flat discs.
    top_rings = []
    for scale, h in [
        (1.0, 0),
        (0.88, 0.0004),
        (0.70, 0.0002),
        (0.51, -0.0007),
        (0.42, -0.0028),
        (0.12, -0.0030),
    ]:
        top_rings.append(
            [
                to_world(
                    0.027 * scale * cos(t) * (1 - 0.105 * sin(t)),
                    -0.0005 + 0.0355 * scale * sin(t),
                    h + 0.00022 * sin(t * 3) * scale,
                )
                for t in [TAU * k / steps for k in range(steps)]
            ]
        )
    tagged(rings("흰자 절단면과 노른자 가장자리", top_rings, mat, True), "egg")
    levels = [
        (1, -0.0004),
        (1.02, 0.0018),
        (0.99, 0.004),
        (0.92, 0.005),
        (0.78, 0.0055),
        (0.56, 0.0056),
        (0.31, 0.0055),
        (0.07, 0.0055),
    ]
    yolk = []
    for scale, h in levels:
        yloop = []
        for k in range(steps):
            t = TAU * k / steps
            edge = (
                1 + 0.035 * sin(t * 5 + 0.3) + 0.019 * cos(t * 9) + 0.014 * sin(t * 18)
            )
            grain = 0.00042 * (sin(4 * t + scale * 19) + 0.45 * sin(10 * t + scale * 8))
            yloop.append(
                to_world(
                    0.0178 * scale * edge * cos(t),
                    -0.002 + 0.0195 * scale * edge * sin(t),
                    h + grain * scale,
                )
            )
        yolk.append(yloop)
    tagged(rings("보슬한 노른자 단면", yolk, mat, True), "yolk")


def pickle_juice(mesh, center, top, mat):
    # The shallow sauce leaves white porcelain visible around both portions.
    # Narrow edges take on the colour of porcelain below the liquid.
    xx, yy = center
    for side in [-1, 1]:
        x = xx + side * 0.057
        y = yy + 0.002
        verts = [(x, y, top + 0.0280)]
        faces = []
        colors = [(0.66, 0.255, 0.055, 1) if side > 0 else (0.84, 0.57, 0.24, 1)]
        steps = 48
        for k, (frac, elevation) in enumerate(
            [(0.67, 0.02795), (0.95, 0.02785), (1.0, 0.02765)]
        ):
            for j in range(steps):
                a = TAU * j / steps
                ca, sa = cos(a), sin(a)
                r = 1 + 0.049 * cos(3 * a + side) + 0.025 * sin(7 * a - side)
                rx, ry = (0.049, 0.040) if side > 0 else (0.043, 0.037)
                dx = rx * frac * r * (1 if ca >= 0 else -1) * abs(ca) ** 0.72
                dy = ry * frac * r * (1 if sa >= 0 else -1) * abs(sa) ** 0.72
                verts.append((x + dx, y + dy, top + elevation))
                base = (0.67, 0.235, 0.040) if side > 0 else (0.84, 0.60, 0.258)
                mix = (0.08, 0.24, 0.81)[k]
                colors.append(
                    tuple(
                        a + (b - a) * mix for a, b in zip(base, (0.975, 0.913, 0.770))
                    )
                    + (1,)
                )
                first = 1 + k * steps
                idx = first + j
                nxt = first + (j + 1) % steps
                faces.append(
                    (0, idx, nxt) if k == 0 else (idx - steps, idx, nxt, nxt - steps)
                )
        obj = mesh("찬기 바닥의 얕은 절임 국물", verts, faces, mat, True)
        tint = obj.data.color_attributes.new(
            name="Tint", type="BYTE_COLOR", domain="POINT"
        )
        for item, c in zip(tint.data, colors):
            item.color = c


def sides(mesh, rings, center, top, mat, green):
    xx, yy = center
    # Salted napa leaves are supple sheets. Thick stalks taper into a darker,
    # corrugated blade with separate folded edges on the serving side.
    cx = xx - 0.057
    for j in range(4):
        vs = []
        fs = []
        nx = 15
        ny = 8
        ang = (-0.17, 0.12, -0.26, 0.06)[j]
        for b in range(ny + 1):
            v = 2 * b / ny - 1
            for a in range(nx + 1):
                u = a / nx
                xx0 = (u - 0.5) * 0.081 + 0.0025 * sin(7 * v + 2 * j) * (
                    (1 - u) ** 4 + u**4
                )
                yy0 = (
                    v * (0.012 + 0.006 * sin(pi * u))
                    + 0.0045 * sin(4 * u + j)
                    + 0.0018 * sin(13 * u + j) * abs(v) ** 3
                )
                z = (
                    0.0018 * cos(6 * u + 2 * v + j)
                    + 0.0040 * exp(-(((v - 0.11 * sin(u * 7)) / 0.34) ** 2))
                    + 0.005 * (1 - u) ** 2 * max(0, v)
                    + 0.003 * v * v * cos(5 * u + j)
                )
                vs.append(
                    (
                        cx + xx0 * cos(ang) - yy0 * sin(ang),
                        yy + (j - 1.5) * 0.010 + xx0 * sin(ang) + yy0 * cos(ang),
                        top + 0.032 + j * 0.0026 + z,
                    )
                )
                if a < nx and b < ny:
                    k = b * (nx + 1) + a
                    fs.append((k, k + 1, k + nx + 2, k + nx + 1))
        tagged(mesh("접힌 배추 겉잎과 줄기", vs, fs, mat, True), "leaf")
    for j in range(2):
        x = cx + 0.016 + j * 0.008
        y = yy + 0.025
        z = top + 0.044
        verts = [
            (x - 0.004, y - 0.003, z),
            (x + 0.006, y - 0.004, z + 0.001),
            (x + 0.004, y + 0.006, z + 0.002),
            (x - 0.003, y + 0.004, z + 0.0004),
        ]
        mesh("배추에 붙은 파 조각", verts, [(0, 1, 2, 3)], green)
    cx = xx + 0.057
    for j, (ang, dx, dy) in enumerate(
        [(-0.15, -0.002, 0.006), (0.32, 0.005, -0.010), (-0.40, -0.006, 0.005)]
    ):
        rows = []
        for scale, z in [(0.97, 0), (1, 0.0010), (0.976, 0.0020)]:
            row = []
            for k in range(48):
                t = TAU * k / 48
                # Wide, thin half-moons have an almost straight cut edge.
                px = 0.043 * cos(t) * (1 + 0.026 * sin(5 * t + j))
                py = 0.026 * sin(t) if sin(t) > 0 else 0.014 * sin(t)
                px *= scale
                py *= scale
                h = 0.0016 * sin(t * 2 + ang) + 0.0011 * cos(t * 3 + j)
                row.append(
                    (
                        cx + dx + px * cos(ang) - py * sin(ang),
                        yy + dy + px * sin(ang) + py * cos(ang),
                        top + 0.033 + j * 0.0035 + z + h,
                    )
                )
            rows.append(row)
        tagged(rings("반달처럼 썬 무김치", rows, mat, True), "radish")
