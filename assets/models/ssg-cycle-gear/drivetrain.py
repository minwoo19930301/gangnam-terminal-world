"""Closed roller chain, spider crank and pedals for the street-facing display cycle."""

from math import atan2, cos, pi, sin, sqrt, tau
from mathutils import Vector
import numpy as np


def chain_centers(centers, radii):
    # Positive radii turn around a sprocket; the fixed guide bends the chain
    # in the opposite direction. Exact common tangents meet the circular wraps.
    c = np.asarray(centers, float)
    r = np.asarray(radii, float)
    contacts = []
    for i, a in enumerate(c):
        j = (i + 1) % len(c)
        d = c[j] - a
        dist = np.linalg.norm(d)
        e = d / dist
        k = (r[i] - r[j]) / dist
        normal = k * e + sqrt(1 - k * k) * np.array([e[1], -e[0]])
        contacts.append((a + r[i] * normal, c[j] + r[j] * normal))
    track = []
    for i, a in enumerate(c):
        incoming = contacts[i - 1][1] - a
        out = contacts[i][0] - a
        start = atan2(incoming[1], incoming[0])
        end = atan2(out[1], out[0])
        sweep = (end - start) % tau if r[i] > 0 else -((start - end) % tau)
        angle = np.linspace(
            start, start + sweep, max(3, round(abs(sweep) * 43)), endpoint=True
        )
        track.extend(a + abs(r[i]) * np.stack((np.cos(angle), np.sin(angle)), axis=1))
    track = np.asarray([*track, track[0]])
    distance = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(track, axis=0), axis=1))]
    # Round to pairs so inner and outer links continue through the closing joint.
    links = 2 * round(distance[-1] / (0.0127 * 2))
    samples = np.arange(links) * distance[-1] / links
    return np.stack(
        [np.interp(samples, distance, track[:, i]) for i in range(2)], axis=1
    )


def model(part, skins, tubing, rod, plate, smooth, cx, cy, cz, rear):
    rx, _, rz = rear
    y = cy - 0.057
    c = [(cx, cz), (rx, rz), (rx + 0.046, rz - 0.040), (rx + 0.091, rz - 0.019)]
    radii = [0.0127 / (2 * sin(pi / 50)), 0.0127 / (2 * sin(pi / 13)), -0.0163, 0.0196]
    pts = chain_centers(c, radii)

    def tagged(ob, tile):
        ob["finishTile"] = tile
        return ob

    def band(name, x, z, axis_y, outside, inside, d, col, steps=80, phase=0):
        rows = []
        for radius, plane in [
            (outside, axis_y - d / 2),
            (inside, axis_y - d / 2),
            (inside, axis_y + d / 2),
            (outside, axis_y + d / 2),
        ]:
            rows.append(
                [
                    (
                        x
                        + radius(tau * i / steps + phase)
                        * cos(tau * i / steps + phase),
                        plane,
                        z
                        + radius(tau * i / steps + phase)
                        * sin(tau * i / steps + phase),
                    )
                    for i in range(steps)
                ]
            )
        vs = [pt for row in rows for pt in row]
        faces = [
            (
                j * steps + i,
                j * steps + (i + 1) % steps,
                ((j + 1) % 4) * steps + (i + 1) % steps,
                ((j + 1) % 4) * steps + i,
            )
            for j in range(4)
            for i in range(steps)
        ]
        return part(name, vs, faces, col)

    def sprocket(name, x, z, pitch_radius, n, plane, color):
        # The roller seats between flat-topped teeth, with the wide root blend
        # left from a stamped steel ring. The central opening is true geometry.
        def outer(a):
            t = (a / tau * n) % 1
            return pitch_radius + (
                0.0013
                if t < 0.30
                else -0.0029
                if t < 0.57
                else -0.0031
                if t < 0.79
                else 0.0012
            )

        return band(
            name,
            x,
            z,
            plane,
            outer,
            lambda _: pitch_radius * 0.85,
            0.0023,
            color,
            n * 5,
        )

    sprocket("오십 톱니 체인링", cx, cz, radii[0], 50, y, "chainSteel")
    sprocket("뒤 허브 톱니", rx, rz, radii[1], 13, y, "chainSteel")
    # Black integrated chain guard stands proud of the drive links.
    band(
        "검은 체인가드 · 안쪽 파인 테",
        cx,
        cz,
        y - 0.0061,
        lambda a: 0.106 + 0.0004 * cos(5 * a),
        lambda a: 0.091 + 0.0044 * cos(5 * a + 0.5),
        0.0029,
        "strapBlack",
        100,
    )
    for j in range(5):
        a = tau * j / 5 + 0.34
        rows = []
        for radius, width, thick, sweep in [
            (0.012, 0.013, 0.0036, 0),
            (0.026, 0.011, 0.004, 0.015),
            (0.041, 0.009, 0.0037, 0.054),
            (0.064, 0.0080, 0.0030, 0.088),
            (0.079, 0.0103, 0.0028, 0.12),
            (0.090, 0.0095, 0.0025, 0.14),
        ]:
            t = a + sweep
            dr = Vector((cos(t), 0, sin(t)))
            across = Vector((-sin(t), 0, cos(t)))
            v = Vector((cx, y - 0.0029, cz)) + radius * dr
            rows.append(
                [
                    v + across * width * u + Vector((0, h, 0))
                    for u, h in [
                        (-0.82, -thick),
                        (0.82, -thick),
                        (1, -0.0009),
                        (0.85, thick),
                        (-0.85, thick),
                        (-1, -0.0009),
                    ]
                ]
            )
        tagged(smooth(skins("곡선으로 뻗는 단조 스파이더 암", rows, "alloy")), "metal")
        t = a + 0.12
        xx = cx + 0.079 * cos(t)
        zz = cz + 0.079 * sin(t)
        tagged(
            rod(
                "체인링 고정 볼트",
                (xx, y - 0.0053, zz),
                (xx, y - 0.008, zz),
                0.0051,
                "nickel",
            ),
            "metal",
        )
        rod("육각 소켓 홈", (xx, y - 0.0082, zz), (xx, y - 0.0085, zz), 0.0025, "ink")
    # Each pair of side plates connects adjoining pins at alternate chain widths.
    # Group plates and pin ends by type as editable meshes.
    plates = [([], []), ([], [])]
    rollers = ([], [])
    pins = ([], [])

    def prism(arr, profile, ya, yb):
        v, f = arr
        k = len(v)
        n = len(profile)
        v.extend([(x, level, z) for level in (ya, yb) for x, z in profile])
        f.append(tuple(k + i for i in range(n - 1, -1, -1)))
        f.append(tuple(k + n + i for i in range(n)))
        f.extend(
            (k + i, k + (i + 1) % n, k + n + (i + 1) % n, k + n + i) for i in range(n)
        )

    def circle(x, z, r, segments):
        return [
            (x + r * cos(tau * i / segments), z + r * sin(tau * i / segments))
            for i in range(segments)
        ]

    for i, p in enumerate(pts):
        q = pts[(i + 1) % len(pts)]
        direction = q - p
        length = np.linalg.norm(direction)
        direction /= length
        normal = np.array([-direction[1], direction[0]])
        u = 0.00372 if i % 2 else 0.00347
        outline = [
            (-0.0028, -u * 0.65),
            (-0.00350, 0),
            (-0.00270, u * 0.72),
            (0, u),
            (length * 0.28, u * 0.81),
            (length * 0.50, u * 0.59),
            (length * 0.73, u * 0.81),
            (length, u),
            (length + 0.0027, u * 0.72),
            (length + 0.0035, 0),
            (length + 0.0027, -u * 0.72),
            (length, -u),
            (length * 0.70, -u * 0.80),
            (length * 0.5, -u * 0.60),
            (length * 0.28, -u * 0.81),
            (0, -u),
        ]
        poly = [tuple(p + direction * a + normal * b) for a, b in outline]
        width = 0.0027 if i % 2 == 0 else 0.0039
        for side in [-1, 1]:
            prism(plates[i % 2], poly, y + side * width, y + side * (width + 0.00075))
        prism(rollers, circle(*p, 0.00255, 8), y - 0.00275, y + 0.00275)
        prism(pins, circle(*p, 0.00155, 8), y - 0.00482, y + 0.00480)
    for (vers, faces), name, col in (
        (plates[0], "안쪽 체인 플레이트", "darkChain"),
        (plates[1], "바깥 체인 플레이트", "chainSteel"),
        (rollers, "체인 롤러", "steel"),
        (pins, "체인 핀과 리벳 끝", "nickel"),
    ):
        ob = tagged(part(name, vers, faces, col), "metal")
        ob["chainJoints"] = len(pts)
        ob["chainPlane"] = y
    # Two guide rollers on the sprung tensioner. The pressed cage sits behind it.
    for j in (2, 3):
        a, b = c[j]
        r = abs(radii[j])
        sprocket("텐셔너 가이드 풀리", a, b, r, 9, y, "strapBlack")
        band(
            "풀리 축받이",
            a,
            b,
            y + 0.0006,
            lambda _: r * 0.85,
            lambda _: r * 0.31,
            0.006,
            "ink",
            30,
        )
        rod("풀리 축 핀", (a, y - 0.0032, b), (a, y + 0.013, b), r * 0.25, "nickel")
    # The catalogue close-up shows a rear pivot below the hub and the sprung
    # pulley forward. Its flat black arm partly covers the fixed middle guide.
    pivot = (rx - 0.011, rz - 0.031)
    arm = [
        (pivot[0] + 0.014 * cos(t), pivot[1] + 0.014 * sin(t))
        for t in np.linspace(pi / 2, 3 * pi / 2, 12)
    ]
    arm.extend(
        [
            (c[3][0] + 0.012 * cos(t), c[3][1] + 0.012 * sin(t))
            for t in np.linspace(3 * pi / 2, 5 * pi / 2, 12)
        ]
    )
    arr = ([], [])
    prism(arr, arm, y - 0.0092, y - 0.013)
    part("장력 조절 암 · 바깥 판", *arr, "strapBlack")
    rod(
        "장력 조절 암 피벗",
        (pivot[0], y - 0.014, pivot[1]),
        (pivot[0], y + 0.012, pivot[1]),
        0.0055,
        "nickel",
    )
    tubing(
        "고정 가이드 케이지",
        [
            (rx, y + 0.008, rz),
            (rx + 0.025, y + 0.010, rz - 0.022),
            (c[2][0], y + 0.009, c[2][1]),
        ],
        0.006,
        "charcoal",
        8,
    )

    def pedal(x, z, sign):
        side = cy + sign * 0.073
        # The forged arm widens around both machined bores.
        axis = Vector((x - cx, 0, z - cz)).normalized()
        cross = Vector((-axis.z, 0, axis.x))
        rows = []
        for u, w, h in [
            (-0.06, 0.010, 0.006),
            (0, 0.020, 0.008),
            (0.10, 0.019, 0.009),
            (0.23, 0.014, 0.008),
            (0.51, 0.012, 0.007),
            (0.77, 0.0105, 0.006),
            (0.92, 0.013, 0.006),
            (1, 0.013, 0.006),
            (1.07, 0.007, 0.004),
        ]:
            ctr = Vector((cx + (x - cx) * u, side, cz + (z - cz) * u))
            rows.append(
                [
                    ctr + cross * (w * a) + Vector((0, h * b, 0))
                    for a, b in [
                        (-0.75, -1),
                        (0.75, -1),
                        (1, -0.4),
                        (0.92, 0.70),
                        (0.68, 1),
                        (-0.72, 1),
                        (-1, 0.55),
                        (-1, -0.45),
                    ]
                ]
            )
        tagged(smooth(skins("단조 크랭크와 페달 나사 보스", rows, "alloy")), "metal")
        tagged(
            rod(
                "크랭크 축마개",
                (cx, side - 0.009, cz),
                (cx, side + 0.009, cz),
                0.010,
                "nickel",
            ),
            "metal",
        )
        rod(
            "크랭크 고정 볼트 홈",
            (cx, side + sign * 0.009, cz),
            (cx, side + sign * 0.010, cz),
            0.0045,
            "ink",
        )
        tagged(
            rod("페달 축", (x, side, z), (x, side + sign * 0.093, z), 0.0069, "nickel"),
            "metal",
        )
        center = side + sign * 0.055
        if sign > 0:
            for d in [-0.014, 0.014]:
                tagged(
                    rod(
                        "접이 페달 힌지 귀",
                        (x + d, side + sign * 0.007, z),
                        (x + d, side + sign * 0.029, z),
                        0.009,
                        "alloy",
                    ),
                    "metal",
                )
            rod(
                "스프링식 잠금바",
                (x - 0.016, side + sign * 0.025, z + 0.004),
                (x + 0.016, side + sign * 0.025, z + 0.004),
                0.0034,
                "ink",
            )
        # The front and rear rails surround two open slots and the center sleeve.
        for d in [-0.033, 0.033]:
            tagged(
                plate(
                    "페달 케이지 앞뒤 난간",
                    x + d,
                    center,
                    z - 0.006,
                    0.007,
                    0.079,
                    0.014,
                    0.0028,
                    "pedalGrey",
                ),
                "satin",
            )
            for k in range(7):
                yy = center + (k - 3) * 0.0107
                levels = [
                    [
                        (x + d + sx * w, yy + sy * depth, z + h)
                        for sx, sy in [(1, 1), (-1, 1), (-1, -1), (1, -1)]
                    ]
                    for w, depth, h in [
                        (0.0040, 0.0024, 0.006),
                        (0.0033, 0.0018, 0.010),
                    ]
                ]
                skins("페달 그립 돌기", levels, "pedalGrey")
            tagged(
                plate(
                    "호박색 격자 반사판",
                    x + d * 1.13,
                    center,
                    z - 0.004,
                    0.0025,
                    0.052,
                    0.009,
                    0.0011,
                    "reflectAmber",
                ),
                "reflector",
            )
        for d in [-0.036, 0.036]:
            tagged(
                plate(
                    "페달 바깥 가로대",
                    x,
                    center + d,
                    z - 0.006,
                    0.068,
                    0.007,
                    0.014,
                    0.0021,
                    "pedalGrey",
                ),
                "satin",
            )
        tagged(
            plate(
                "페달 중앙 축통",
                x,
                center,
                z - 0.007,
                0.013,
                0.070,
                0.016,
                0.004,
                "pedalGrey",
            ),
            "satin",
        )

    angle = 0.54
    for sign in (-1, 1):
        pedal(cx + sign * 0.167 * cos(angle), cz + sign * 0.167 * sin(angle), sign)


def tyre_marks(part, x, y, z):
    # Shallow opposing grooves along the crown. A single mesh covers each tyre.
    verts = []
    faces = []
    for i in range(70):
        a = tau * i / 70
        for sign in [-1, 1]:
            row = []
            for k in range(5):
                t = k / 4
                s = sign * (0.002 + 0.014 * t)
                for dt in [-0.0024, 0.0024]:
                    angle = a + 0.040 * t + 0.006 * t * t + dt
                    r = 0.197 + sqrt(max(0.00001, 0.017**2 - s * s)) + 0.00022
                    row.append((x + r * cos(angle), y + s, z + r * sin(angle)))
            begin = len(verts)
            verts.extend(row)
            for k in range(4):
                j = begin + 2 * k
                faces.append((j, j + 1, j + 3, j + 2))
    ob = part("트레드 양쪽의 사선 홈", verts, faces, "treadBlack")
    ob["finishTile"] = "rubber"


def frame_decal(part, start, end, radius):
    # The boxed wordmark wraps slightly around the seat-end of the main tube.
    # Blank coloured frame remains visible within the outline, as in the photo.
    import bpy

    start = Vector(start)
    end = Vector(end)
    axis = (end - start).normalized()
    vertical = Vector((-axis.z, 0, axis.x))

    def surface(x, v):
        ctr = start + axis * x
        return (
            ctr
            + vertical * v
            + Vector((0, -sqrt(max(0.0, radius * radius - v * v)) - 0.00055, 0))
        )

    length = 0.125
    h = 0.0152
    th = 0.00105
    pts = []
    faces = []
    for a, b, c, d in [
        (0, length, h - th, h),
        (0, length, -h, -h + th),
        (0, th, -h, h),
        (length - th, length, -h, h),
    ]:
        k = len(pts)
        pts.extend([surface(a, c), surface(b, c), surface(b, d), surface(a, d)])
        faces.append((k, k + 1, k + 2, k + 3))
    part("메인 튜브 사각 데칼 테", pts, faces, "ink")
    curve = bpy.data.curves.new("프레임 상호 서체", "FONT")
    curve.body = "BROMPTON"
    curve.align_x = "LEFT"
    curve.resolution_u = 3
    source = bpy.data.objects.new("프레임 데칼 원형", curve)
    bpy.context.scene.collection.objects.link(source)
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(source.evaluated_get(graph))
    points = [v.co.copy() for v in mesh.vertices]
    xmin = min(v.x for v in points)
    xmax = max(v.x for v in points)
    ymin = min(v.y for v in points)
    ymax = max(v.y for v in points)
    pts = [
        surface(
            0.006 + (v.x - xmin) / (xmax - xmin) * (length - 0.012),
            -0.0075 + (v.y - ymin) / (ymax - ymin) * 0.017,
        )
        for v in points
    ]
    part(
        "메인 튜브 BROMPTON 글자",
        pts,
        [tuple(f.vertices) for f in mesh.polygons],
        "ink",
    )
    bpy.data.objects.remove(source, do_unlink=True)
    bpy.data.meshes.remove(mesh)
    bpy.data.curves.remove(curve)
