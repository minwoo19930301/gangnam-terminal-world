"""Cut crystal profiles for the two red-stopper Baccarat decanters, in metres."""

from math import atan2, cos, exp, pi, sin, sqrt
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def ring_mesh(points):
    vertices = [p for ring in points for p in ring]
    faces = [tuple(reversed(range(len(points[0]))))]
    start = 0
    for lower, upper in zip(points, points[1:]):
        a_count, b_count = len(lower), len(upper)
        upper_start = start + a_count
        i = j = 0
        # Keep many samples on the flutes but few on round collars. Advance
        # each ring to the next angular boundary; aligned steps remain quads.
        while i < a_count or j < b_count:
            a = start + i % a_count
            b = upper_start + j % b_count
            next_a = start + (i + 1) % a_count
            next_b = upper_start + (j + 1) % b_count
            lower_angle = (i + 1) * b_count
            upper_angle = (j + 1) * a_count
            if lower_angle == upper_angle:
                faces.append((a, next_a, next_b, b))
                i += 1
                j += 1
            elif lower_angle < upper_angle:
                faces.append((a, next_a, b))
                i += 1
            else:
                faces.append((a, next_b, b))
                j += 1
        start = upper_start
    faces.append(tuple(range(start, len(vertices))))
    return vertices, faces


def round_ring(z, radius, count, exponent=2, groove=0, channels=24, scallop=0, phase=0):
    ring = []
    for j in range(count):
        theta = 2 * pi * j / count + phase
        # A rounded square with narrow continuous channels around its side.
        outer = radius / (
            abs(cos(theta)) ** exponent + abs(sin(theta)) ** exponent
        ) ** (1 / exponent)
        cut = (0.5 + 0.5 * cos(channels * theta)) ** 1.65
        r = outer - groove * cut
        ring.append((r * cos(theta), r * sin(theta), z + scallop * cut))
    return ring


def environment(direction):
    # Two broad white gallery lights, a dark lacquer tabletop and the red wall
    # form an original illumination study. No product photograph is baked in.
    x, y, z = direction
    az = atan2(y, x)
    base = 0.29 + 0.48 * max(0, z) + 0.31 * max(0, -y)
    if z < -0.12:
        base = 0.075 + 0.23 * (1 + z)
    side = (0.5 + 0.5 * cos(3 * az - 0.75)) ** 15
    lintel = (0.5 + 0.5 * cos(16 * az + 1)) ** 24
    strip = exp(-(((z - 0.16) / 0.095) ** 2))
    ceiling = exp(-(((z - 0.68) / 0.14) ** 2)) * (0.5 + 0.5 * cos(2 * az + 1)) ** 3
    white = base + 0.64 * side + 0.27 * strip + 0.12 * lintel + 0.45 * ceiling
    reflected_red = exp(-(((az - 0.8) / 0.30) ** 2) - 0.5 * ((z - 0.24) / 0.45) ** 2)
    return [
        max(0.009, min(1, white * f + reflected_red * d))
        for f, d in [(1.00, 0.21), (0.98, -0.12), (0.975, -0.10)]
    ]


def refract(direction, outward, ratio):
    n = outward if direction.dot(outward) < 0 else -outward
    cosine = -direction.dot(n)
    k = 1 - ratio * ratio * (1 - cosine * cosine)
    if k < 0:
        return None
    return (direction * ratio + n * (ratio * cosine - sqrt(k))).normalized()


def optical_tint(point, normal, view, bvh, ruby):
    incident = (point - view).normalized()
    n = normal if incident.dot(normal) < 0 else -normal
    cosine = max(0, -incident.dot(n))
    fresnel = 0.046 + 0.954 * (1 - cosine) ** 5
    reflection = environment(incident.reflect(n))
    direction = refract(incident, n, 1 / 1.54)
    distance = 0
    if direction is not None:
        tip = point + direction * 0.00002
        for _ in range(4):
            hit, out, _, length = bvh.ray_cast(tip, direction, 0.5)
            if hit is None:
                break
            distance += length
            outside = refract(direction, out, 1.54)
            if outside is not None:
                direction = outside
                break
            direction = direction.reflect(out).normalized()
            tip = hit + direction * 0.00002
    light = environment(direction if direction is not None else incident)
    # Ruby has a long red transmission window and strong green/blue absorption.
    attenuation = [7, 148, 105] if ruby else [1.9, 1.0, 0.85]
    shade = [
        fresnel * reflection[i]
        + (1 - fresnel) * light[i] * exp(-attenuation[i] * distance)
        for i in range(3)
    ]
    if ruby:
        # Ruby-red transmitted light and a neutral polished front reflection
        # coexist on the stopper. Preserve the clear strip highlights.
        reflected = incident.reflect(n)
        azimuth = atan2(reflected.y, reflected.x)
        strip = (0.5 + 0.5 * cos(2.5 * azimuth - 0.65)) ** 36
        strip *= 0.32 + 0.56 * max(0, reflected.z)
        shade = [
            0.047 + shade[0] * 0.66 + strip,
            0.004 + shade[1] * 0.19 + strip * 0.96,
            0.011 + shade[2] * 0.26 + strip * 0.96,
        ]
    else:
        shade = [0.07 + 0.85 * c for c in shade]
    # Clear head-on faces transmit the shelf's back panel. At grazing angles
    # a near-solid reflective rim outlines the open neck and the glass floor.
    opacity = 0.96 if ruby else 0.17 + 0.63 * (1 - cosine) ** 1.3 + 0.17 * max(shade)
    return tuple(max(0.007, min(1, c)) for c in shade) + (opacity,)


class Display:
    def __init__(self, collection, material, silver, light):
        self.collection = collection
        self.material = material
        self.silver = silver
        self.light = light

    def cut(self, name, vertices, faces, origin, ruby=False):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        self.collection.objects.link(obj)
        obj.location = origin
        mesh.materials.append(self.material)
        profile = BVHTree.FromPolygons(vertices, faces, all_triangles=False)
        colors = mesh.color_attributes.new(
            name="Tint", type="BYTE_COLOR", domain="CORNER"
        )
        eye = Vector((-0.20, -0.84, -0.05 if origin[2] > 1.4 else 0.69))
        for face in mesh.polygons:
            center = face.center
            normal = face.normal
            if normal.length_squared < 0.001:
                continue
            # Trace at the facet centre and towards its four corners to preserve
            # light bands across a broad polished plane in the lightweight GLB.
            for index in face.loop_indices:
                point = center.lerp(
                    mesh.vertices[mesh.loops[index].vertex_index].co, 0.63
                )
                colors.data[index].color = optical_tint(
                    point, normal, eye, profile, ruby
                )
        return obj

    def glints(self, name, triangles, origin, light=False):
        # Small polished-edge reflections remain visible against the dark wood.
        # Geometry follows each bevel; the per-facet energy comes from the
        # product study and shares the cabinet's existing highlight batches.
        if not triangles:
            return
        vertices = []
        faces = []
        colors = []
        for coords, intensity, ruby in triangles:
            k = len(vertices)
            vertices.extend(coords)
            faces.append((k, k + 1, k + 2))
            colors.append(
                (
                    intensity,
                    intensity * (0.20 if ruby else 0.99),
                    intensity * (0.17 if ruby else 1.04),
                    1,
                )
            )
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        self.collection.objects.link(obj)
        obj.location = origin
        mesh.materials.append(self.light if light else self.silver)
        attribute = mesh.color_attributes.new(
            name="Tint", type="BYTE_COLOR", domain="CORNER"
        )
        for face in mesh.polygons:
            for i in face.loop_indices:
                attribute.data[i].color = colors[face.index]

    def profile(self, name, rings, origin, ruby=False):
        return self.cut(name, *ring_mesh(rings), origin, ruby)

    def harmonie(self, x, y, z):
        origin = (x, y, z)
        sections = [
            (0, 0.042, 5.8, 0, 0),
            (0.002, 0.046, 5.8, 0, 0),
            (0.006, 0.047, 6.1, 0.0007, 0),
            (0.013, 0.047, 6.3, 0.0022, 0),
            (0.071, 0.048, 6.8, 0.0024, 0.0004),
            (0.132, 0.048, 6.9, 0.0021, 0.0020),
            (0.139, 0.047, 6.5, 0.0007, 0.0031),
            (0.144, 0.045, 6.0, 0, 0.0011),
            (0.149, 0.034, 4.2, 0, 0),
            (0.156, 0.024, 3.2, 0, 0),
            (0.165, 0.020, 2.3, 0, 0),
            (0.177, 0.0178, 2, 0, 0),
            (0.187, 0.019, 2, 0, 0),
            (0.192, 0.022, 2, 0, 0),
            (0.195, 0.027, 2, 0, 0),
            (0.198, 0.0275, 2, 0, 0),
            (0.199, 0.024, 2, 0, 0),
            (0.198, 0.0176, 2, 0, 0),
            (0.192, 0.0168, 2, 0, 0),
            (0.167, 0.0156, 2, 0, 0),
            (0.149, 0.030, 3.6, 0, 0),
            (0.137, 0.044, 5.4, 0, 0),
            (0.018, 0.042, 5.5, 0, 0),
            (0.013, 0.039, 5.5, 0, 0),
        ]
        rings = [
            round_ring(h, r, 96 if row < 9 else 24, square, depth, 24, edge, pi / 4)
            for row, (h, r, square, depth, edge) in enumerate(sections)
        ]
        self.profile("하모니 2817113 · 세로 골과 속이 빈 몸체", rings, origin)

        def stripe(height, angle):
            radius = 0.0485 / (abs(cos(angle)) ** 6.5 + abs(sin(angle)) ** 6.5) ** (
                1 / 6.5
            )
            radius -= 0.0019 * (0.5 + 0.5 * cos(24 * angle)) ** 1.65
            return (radius * cos(angle), radius * sin(angle), height)

        reflected, glowing = [], []
        for channel in range(24):
            angle = 2 * pi * channel / 24 + 0.032
            top = 0.134 + 0.003 * sin(3 * angle)
            energy = (0.5 + 0.5 * cos(angle * 2 - 0.21)) ** 4
            # A bright bevel stands beside the near-black reflected side of the flute.
            for offset, width, strength, batch in [
                (-0.035, 0.016, 0.052 + 0.06 * energy, reflected),
                (
                    0,
                    0.030,
                    0.45 + 0.48 * energy,
                    glowing if energy > 0.76 else reflected,
                ),
            ]:
                a = angle + offset
                corners = [
                    stripe(0.011, a),
                    stripe(top, a + 0.002),
                    stripe(top - 0.003, a + width),
                    stripe(0.015, a + width * 0.64),
                ]
                batch.append(([corners[0], corners[1], corners[2]], strength, False))
                batch.append(
                    ([corners[0], corners[2], corners[3]], strength * 0.92, False)
                )
        self.glints("하모니 세로 절삭면의 가는 반사", reflected, origin)
        self.glints("하모니 세로 골의 밝은 모서리", glowing, origin, True)
        self.profile(
            "하모니 2817113 · 절삭한 레드 마개",
            [
                round_ring(h, r, 8, e, phase=pi / 8)
                for h, r, e in [
                    (0.167, 0.013, 2),
                    (0.170, 0.015, 2),
                    (0.192, 0.017, 2),
                    (0.198, 0.014, 2),
                    (0.209, 0.0125, 2),
                    (0.218, 0.016, 2),
                    (0.228, 0.025, 3.8),
                    (0.232, 0.034, 4.5),
                    (0.237, 0.034, 4.5),
                    (0.245, 0.022, 4.8),
                ]
            ],
            origin,
            True,
        )

    def louxor(self, x, y, z):
        origin = (x, y, z)
        # Lower four courses have individually planar pyramids and a polished
        # platform at each apex. The shared edges form narrow recessed channels.
        columns, rows = 14, 4
        vs = []
        fs = []
        flashes = []

        def point(t, h, r):
            return (r * cos(t), r * sin(t), h)

        for j in range(rows):
            lo = 0.005 + j * 0.0215
            for i in range(columns):
                t0 = 2 * pi * i / columns
                da = 2 * pi / columns
                rim = [(0, 0), (1, 0), (1, 1), (0, 1)]
                start = len(vs)
                for shrink, radius in [(1, 0.0475), (0.85, 0.0486), (0.13, 0.05525)]:
                    for u, v in rim:
                        u = 0.5 + (u - 0.5) * shrink
                        v = 0.5 + (v - 0.5) * shrink
                        vs.append(point(t0 + da * u, lo + 0.0215 * v, radius))
                for ring in [0, 4]:
                    for n in range(4):
                        a = start + ring + n
                        b = start + ring + (n + 1) % 4
                        fs.append((a, b, b + 4, a + 4))
                fs.append((start + 8, start + 9, start + 10, start + 11))
                # The museum-style strip lights catch alternating sides of the
                # pyramid. Leave its valley and the opposite dark facets clear.
                peak = Vector(point(t0 + da * 0.5, lo + 0.01075, 0.05530))
                for side in range(4):
                    n0 = start + 4 + side
                    n1 = start + 4 + (side + 1) % 4
                    q0 = Vector(vs[n0])
                    q1 = Vector(vs[n1])
                    mid = (q0 + q1) * 0.5
                    at = t0 + da * 0.5
                    energy = (0.5 + 0.5 * cos(at * 2.3 + side * 1.63 + j * 0.51)) ** 2.8
                    if energy < 0.24:
                        continue
                    a = q0.lerp(mid, 0.15)
                    b = q1.lerp(mid, 0.42)
                    c = peak.lerp(mid, 0.28 + 0.25 * (1 - energy))
                    flashes.append(([a, b, c], 0.33 + 0.60 * energy, False))
        self.cut("룩소르 2817103 · 네 줄 피라미드 절삭", vs, fs, origin)
        # Split the brightest, narrowest streaks into the fixtures' existing
        # illumination batch. Keep most facets glass, with no extra draw.
        exposed = [
            (coords, energy, ruby) for coords, energy, ruby in flashes if energy > 0.80
        ]
        reflected = [
            (coords, energy, ruby) for coords, energy, ruby in flashes if energy <= 0.80
        ]
        self.glints("룩소르 피라미드 연마면의 반사", reflected, origin)
        self.glints("룩소르 피라미드 모서리의 빛", exposed, origin, True)
        n = 72
        body = [
            round_ring(h, r, n)
            for h, r in [
                (0, 0.044),
                (0.003, 0.050),
                (0.005, 0.051),
                (0.006, 0.0474),
                (0.090, 0.0474),
                (0.093, 0.051),
            ]
        ]

        def thumbprint_radius(height, angle):
            cuts = 0
            for mid, phase in [(0.102, 0), (0.124, pi / 12)]:
                oval = (0.5 + 0.5 * cos(12 * (angle - phase))) ** 1.35
                cuts += 0.0037 * oval * exp(-(((height - mid) / 0.012) ** 2))
            return 0.050 + 0.004 * (height - 0.095) / 0.042 - cuts

        for row in range(15):
            height = 0.095 + row * 0.003
            angles = [2 * pi * i / n for i in range(n)]
            body.append(
                [point(a, height, thumbprint_radius(height, a)) for a in angles]
            )

        # Each shallow oval catches a short crescent along its curved lower edge.
        arcs = []
        for height, offset in [(0.103, 0), (0.125, pi / 12)]:
            for lens in range(12):
                center = 2 * pi * lens / 12 + offset
                previous = None
                for step in range(8):
                    angle = -pi * 0.83 + step * pi / 9
                    a = center + 0.163 * cos(angle)
                    h = height + 0.0094 * sin(angle)
                    width = 0.00075 * sin(pi * step / 7)
                    pair = [
                        point(a, edge, thumbprint_radius(edge, a) + 0.00065)
                        for edge in (h - width, h + width)
                    ]
                    if previous:
                        gloss = (
                            0.26 + 0.63 * (0.5 + 0.5 * cos(center + step * 0.09)) ** 2
                        )
                        arcs.extend(
                            [
                                ([*previous, pair[1]], gloss, False),
                                ([previous[0], pair[1], pair[0]], gloss, False),
                            ]
                        )
                    previous = pair
        self.glints("룩소르 둥근 렌즈 컷의 초승달 반사", arcs, origin)
        body.extend(
            round_ring(h, r, 36 if h < 0.15 else 24)
            for h, r in [
                (0.141, 0.054),
                (0.144, 0.051),
                (0.149, 0.038),
                (0.155, 0.023),
                (0.162, 0.019),
                (0.174, 0.018),
                (0.189, 0.0185),
                (0.194, 0.020),
                (0.197, 0.027),
                (0.201, 0.029),
                (0.204, 0.0265),
                (0.204, 0.018),
                (0.198, 0.016),
                (0.163, 0.015),
                (0.145, 0.043),
                (0.138, 0.047),
                (0.015, 0.044),
                (0.010, 0.040),
            ]
        )
        vertices, faces = ring_mesh(body)
        # The separately cut exterior replaces this entire band of the shell.
        # Retain the interior, floor and shoulder so the hollow body stays legible.
        del faces[1 + 3 * n : 1 + 4 * n]
        self.cut("룩소르 2817103 · 렌즈 컷과 두꺼운 바닥", vertices, faces, origin)
        self.profile(
            "룩소르 2817103 · 마개 코르크",
            [
                round_ring(h, r, 32)
                for h, r in [
                    (0.177, 0.013),
                    (0.181, 0.016),
                    (0.202, 0.017),
                    (0.208, 0.021),
                    (0.212, 0.026),
                    (0.216, 0.032),
                ]
            ],
            origin,
            True,
        )
        # Two offset polygonal edges cut a ring of diamonds around the red top.
        rings = [
            round_ring(h, r, 16, phase=phase)
            for h, r, phase in [
                (0.215, 0.030, 0),
                (0.220, 0.034, 0),
                (0.232, 0.038, pi / 16),
                (0.242, 0.033, 0),
                (0.243, 0.028, 0),
            ]
        ]
        vs = [v for ring in rings for v in ring]
        fs = []
        for j in range(4):
            for i in range(16):
                a = 16 * j + i
                b = 16 * j + (i + 1) % 16
                fs.extend([(a, b, b + 16), (a, b + 16, a + 16)])
        fs += [tuple(reversed(range(16))), tuple(range(64, 80))]
        self.cut("룩소르 2817103 · 루비색 마름모 마개", vs, fs, origin, True)
