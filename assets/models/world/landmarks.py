"""Distant public facades from the existing place modules, in their map frames."""

from math import cos, hypot, pi, sin

import bpy


PALETTE = {
    "granite": 0xC4B3B2,
    "rose": 0x825D58,
    "joint": 0xAB9590,
    "stone": 0xD6CAB6,
    "cream": 0xE5DFD0,
    "shadow": 0x847A70,
    "slate": 0x56666E,
    "glass": 0x739499,
    "hotel_glass": 0x42576C,
    "mullion": 0x4A5152,
    "timber": 0x76564D,
    "gold": 0xB59A64,
    "steel": 0xBABCB4,
    "concrete": 0xCDC7B9,
    "dark": 0x303937,
    "teal": 0x487875,
    "red": 0x914452,
    "brick": 0x905847,
    "bricklight": 0xB27D62,
    "orange": 0xC97641,
    "burgundy": 0x88473B,
    "panel": 0xCCCAC0,
    "ochre": 0xB49B7B,
    "shopglass": 0x62787B,
    "greenroof": 0x547868,
    "travertine": 0xD5C6AE,
    "mint": 0x95B8AA,
    "asphalt": 0x777977,
    "blueglass": 0x86A9AD,
    "signpanel": 0xDDD9C8,
}


def material(key):
    name = "LANDMARK · " + key
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    srgb = [((PALETTE[key] >> n) & 255) / 255 for n in (16, 8, 0)]
    linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in srgb]
    mat.diffuse_color = (*linear, 1)
    evening = {
        "glass": (0.085, 0.13, 0.14),
        "hotel_glass": (0.19, 0.145, 0.105),
        "shopglass": (0.19, 0.16, 0.11),
        "blueglass": (0.105, 0.16, 0.17),
        "gold": (0.8, 0.42, 0.13),
        "signpanel": (0.27, 0.245, 0.19),
    }.get(key)
    if evening:
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = mat.diffuse_color
        shader.inputs["Emission Color"].default_value = (*evening, 1)
        level = mat.node_tree.nodes.new("ShaderNodeValue")
        level.name = "Seoul window illumination"
        mat.node_tree.links.new(level.outputs[0], shader.inputs["Emission Strength"])
    return mat


class Skin:
    def __init__(self, parent, building):
        self.parent = parent
        self.cx, self.cz, _ = building["origin"]
        self.vertices, self.faces, self.slots, self.materials = [], [], [], []
        self.indices = {}

    def face(self, points, colour):
        indices = []
        for x, z, y in points:
            v = (round(x - self.cx, 5), round(self.cz - z, 5), round(y, 5))
            if v not in self.indices:
                self.indices[v] = len(self.vertices)
                self.vertices.append(v)
            indices.append(self.indices[v])
        if len(set(indices)) < 3:
            return
        if colour not in self.materials:
            self.materials.append(colour)
        self.faces.append(indices)
        self.slots.append(self.materials.index(colour))

    def volume(self, ring, low, high, wall, roof=None):
        ring = clockwise(ring)
        for a, b in edges(ring):
            self.face([(*a, low), (*b, low), (*b, high), (*a, high)], wall)
        self.face([(*p, high) for p in ring], roof or wall)

    def finish(self):
        mesh = bpy.data.meshes.new(self.parent.name + " · 입면")
        mesh.from_pydata(self.vertices, [], self.faces)
        for key in self.materials:
            mesh.materials.append(material(key))
        for poly, slot in zip(mesh.polygons, self.slots):
            poly.material_index = slot
        mesh.update()
        child = bpy.data.objects.new(mesh.name, mesh)
        self.parent.users_collection[0].objects.link(child)
        child.parent = self.parent
        child["shell_part"] = True
        return child


def edges(ring):
    return zip(ring, ring[1:] + ring[:1])


def clockwise(ring):
    # Game Z runs south. Clockwise game coordinates give positive Blender Z.
    return (
        ring
        if sum(a[0] * b[1] - b[0] * a[1] for a, b in edges(ring)) < 0
        else ring[::-1]
    )


def rect(point, left, front, right, back):
    return [
        point(left, front),
        point(right, front),
        point(right, back),
        point(left, back),
    ]


def lower_or_raise_base(obj, building, new_height, colour):
    delta = new_height - building["height"]
    for v in obj.data.vertices:
        if v.co.z >= building["height"] - 0.001:
            v.co.z += delta
    obj.data.materials[0] = material(colour)
    obj.data.update()


class Elevation:
    """Outward facing x/height details along one clockwise map edge."""

    def __init__(self, skin, a, b):
        self.skin, self.a = skin, a
        dx, dz = b[0] - a[0], b[1] - a[1]
        self.length = hypot(dx, dz)
        self.tx, self.tz = dx / self.length, dz / self.length

    def p(self, x, height, outset):
        return (
            self.a[0] + x * self.tx - outset * self.tz,
            self.a[1] + x * self.tz + outset * self.tx,
            height,
        )

    def panel(self, left, right, low, high, colour, outset=0.04):
        self.skin.face(
            [
                self.p(left, low, outset),
                self.p(right, low, outset),
                self.p(right, high, outset),
                self.p(left, high, outset),
            ],
            colour,
        )

    def ledge(self, low, high, colour, projection, left=0, right=None):
        right = self.length if right is None else right
        self.panel(left, right, low, high, colour, projection)
        self.skin.face(
            [
                self.p(left, high, projection),
                self.p(right, high, projection),
                self.p(right, high, 0),
                self.p(left, high, 0),
            ],
            colour,
        )
        self.skin.face(
            [
                self.p(left, low, 0),
                self.p(right, low, 0),
                self.p(right, low, projection),
                self.p(left, low, projection),
            ],
            colour,
        )


def shin(s, b):
    # Same bilinear trapezoid and public north facade proportions as shinsegae.js.
    def p(u, v):
        a, f = u / 67, v / 84.7
        return (
            -107.07 + 62.61 * a + 30.43 * f - 0.32 * a * f,
            -24.31 - 23.77 * a + 79.03 * f + 0.13 * a * f,
        )

    lower_or_raise_base(s.parent, b, 7, "granite")
    s.volume(rect(p, 0, 8, 67, 84.7), 7, 50.2, "granite", "shadow")
    s.volume(rect(p, 0, 33, 67, 84.7), 50.2, 55, "granite", "shadow")
    for lo, hi in [(0, 23), (44, 67)]:
        s.volume(rect(p, lo, 0, hi, 8), 7, 50.2, "granite")
    for lo, hi, top in [(0, 18.5, 55), (48.5, 67, 57.4)]:
        ring = rect(p, lo, -0.035, hi, 18.5)
        s.volume(ring, 0, top, "rose", "joint")
        for a, c in edges(clockwise(ring)):
            e = Elevation(s, a, c)
            for h in [7, 16.6, 26.2, 35.8, 45.4, top - 0.3]:
                e.panel(0, e.length, h, h + 0.085, "joint")
    # Recessed curtain wall and narrow curved central bay: no arch across the shoulders.
    s.volume(rect(p, 23, 7.91, 44, 8), 7, 50.19, "glass")
    arc = [(33.5 - 6 * cos(i * pi / 12), 8 - 6 * sin(i * pi / 12)) for i in range(13)]
    ring = [p(u, v) for u, v in arc]
    for low, high, colour in [(7, 20, "glass"), (20, 24, "dark"), (24, 50.2, "glass")]:
        s.volume(ring, low, high, colour)
    for a, c in edges(clockwise(ring)):
        e = Elevation(s, a, c)
        if e.length > 6:
            continue
        e.panel(0, 0.105, 7, 50.2, "mullion")
        for h in [11.8, 16.6, 26.2, 31, 35.8, 40.6, 45.4]:
            e.panel(0, e.length, h, h + 0.12, "mullion")


def hotel(s, b):
    # Match jwmarriott.js: the single 144 m OSM envelope contains a much smaller tower.
    def p(u, v):
        return (
            -23.6925 + u * 0.933337 + v * 0.359001,
            99.5825 - u * 0.359001 + v * 0.933337,
        )

    lower_or_raise_base(s.parent, b, 11.5, "stone")
    podium = rect(p, -33.31, 0, 33.31, 60.5)
    s.volume(podium, 11.5, 30.5, "stone", "shadow")
    for a, c in edges(clockwise(podium)):
        e = Elevation(s, a, c)
        for h in [14.1, 18.7, 23.3, 27.8]:
            for i in range(2, int(e.length) - 1, 6):
                e.panel(i, i + 1.35, h, h + 1.35, "slate")
        e.ledge(29.9, 30.7, "cream", 0.35)
    tower = rect(p, -8, 6, 16, 58)
    s.volume(tower, 30.5, 135.8, "hotel_glass")
    s.volume(tower, 135.8, 144, "cream", "concrete")
    for a, c in edges(clockwise(tower)):
        e = Elevation(s, a, c)
        for i in range(2, int(e.length), 3):
            e.panel(i, i + 0.10, 30.5, 135.8, "mullion")
        for h in [35.5, 41, 45, 49] + [53 + i * 3.6 for i in range(23)]:
            e.ledge(h - 0.25, h + 0.49, "cream", 0.19)
        if e.length < 30:
            mid = e.length / 2
            e.panel(mid - 1.46, mid + 1.46, 125.7, 137.0, "slate", 0.26)
            e.panel(mid - 1.63, mid + 1.63, 137.25, 140.51, "gold", 0.26)


def terminal(s, b):
    # The eastern bus-side yard has straight glazing and stepped terraces.
    # Only the west, road-facing face receives the broad diagonal cream struts.
    def p(u, v):
        return (2.3 + u * 0.9348 + v * 0.3552, -59.24 - u * 0.3552 + v * 0.9348)

    lower_or_raise_base(s.parent, b, 8.4, "stone")
    levels = [6, 11, 16, 20.5, 25, 29.5, 34, 38.5, 43]
    west = [10, 10, 8, 6.4, 4.8, 3.2, 1.6, 0, -1.6]
    east = [75.7, 71.7, 67.7, 64.7, 61.7, 58.7, 55.7, 52.7, 50.7]
    for i, (low, high) in enumerate(zip(levels, levels[1:])):
        lo, hi = west[i + 1], east[i + 1]
        cut = max(2.5, 18 - (75.7 - hi - 4) * 0.72)
        q = [(lo, 0), (hi, 0), (hi, 154), (hi - cut, 159), (lo + cut, 159), (lo, 154)]
        ring = [p(u, v) for u, v in q]
        s.volume(ring, low, high, "concrete", "shadow")
        for a, c in edges(clockwise(ring)):
            e = Elevation(s, a, c)
            e.ledge(high - 0.78, high + 0.12, "cream", 0.63)
            if e.length > 152:
                continue
            if e.length > 12:
                e.panel(1.3, e.length - 1.3, low + 0.9, high - 1.1, "timber")
        # Recessed west window bank capped by a projecting slab at each level.
        e = Elevation(s, p(lo, 0), p(lo, 154))
        e.panel(0.22, 153.78, low + 0.42, high - 0.65, "slate", 0.15)
        for v in range(2, 154, 6):
            foot = p(west[i] - 0.18, v - 0.34)
            foot2 = p(west[i] - 0.18, v + 0.34)
            head = p(lo - 0.38, v + 0.34)
            head2 = p(lo - 0.38, v - 0.34)
            # Game south along frontage, outward is local -u.
            s.face(
                [
                    (*foot, low + 0.1),
                    (*foot2, low + 0.1),
                    (*head, high - 0.68),
                    (*head2, high - 0.68),
                ],
                "cream",
            )
        e = Elevation(s, p(hi, 154), p(hi, 0))
        for v in range(1, 152, 6):
            e.panel(v, v + 4.8, low + 1.0, low + 2.05, "slate", 0.06)


def newcore(s, b):
    site = b["id"]
    ring = clockwise(b["poly"])
    park = site == 413372931
    top = 12.8 if park else 10.8 if site == 443718139 else 23
    lower_or_raise_base(s.parent, b, top, "shadow" if park else "stone")
    for a, c in edges(ring):
        e = Elevation(s, a, c)
        if park:
            for h in [0, 3.2, 6.4, 9.6]:
                e.ledge(h + 0.1, h + 1, "cream", 0.15)
            for x in range(1, int(e.length), 6):
                e.panel(x, x + 0.52, 0, top, "stone", 0.075)
        elif top > 12:
            e.ledge(10.15, 10.45, "cream", 0.21)
            e.ledge(19.52, 19.83, "cream", 0.21)
            for x in range(1, int(e.length), 4):
                e.panel(x, x + 1.12, 10.52, top - 0.42, "cream")
        e.ledge(top - 0.20, top + 0.12, "cream", 0.30)
    if park:
        return
    # The current game places the public retail row on the p[2] to p[1] edge.
    a, c = b["poly"][2], b["poly"][1]
    e = Elevation(s, c, a)
    count = max(2, round((e.length - 8) / 8.5))
    width = (e.length - 8) / count
    for i in range(count):
        x = 4 + (i + 0.5) * width
        r = (width - 1.45) / 2
        spring = 9.55 - r
        shade = "glass" if site == 413372930 else "slate"
        e.panel(x - r, x + r, 0.35, spring, shade, 0.065)
        for j in range(12):
            t0 = j * pi / 12
            t1 = (j + 1) * pi / 12

            def pt(t, radius, out):
                return e.p(x + radius * cos(t), spring + radius * sin(t), out)

            s.face([e.p(x, spring, 0.065), pt(t0, r, 0.065), pt(t1, r, 0.065)], shade)
            s.face(
                [
                    pt(t0, r, 0.22),
                    pt(t0, r + 0.42, 0.22),
                    pt(t1, r + 0.42, 0.22),
                    pt(t1, r, 0.22),
                ],
                "cream",
            )
        for dx in [-r, r]:
            e.panel(x + dx - 0.19, x + dx + 0.19, 0.22, spring, "cream", 0.22)
        for dx in [-r * 0.47, 0, r * 0.47]:
            h = spring + (r * r - dx * dx) ** 0.5
            e.panel(x + dx - 0.055, x + dx + 0.055, 0.4, h, "mullion", 0.15)
        awning = "dark" if site != 443718139 else ("dark", "red", "teal", "dark")[i % 4]
        s.face(
            [
                e.p(x - r, 2.85, 1.40),
                e.p(x + r, 2.85, 1.40),
                e.p(x + r, 3.65, 0.20),
                e.p(x - r, 3.65, 0.20),
            ],
            awning,
        )
        e.panel(x - r, x + r, 2.68, 2.85, awning, 1.40)


# Low-rise shopfronts use the horizontal and vertical rhythms from their place
# modules. Face details are visual only; they never declare an indoor layout.
BLOCK_NUMBERS = {
    413280003: 1,
    131327730: 2,
    131327731: 3,
    413372923: 4,
    413372924: 5,
    413372925: 6,
    413372927: 7,
    413372928: 8,
}


def frontages(s, b):
    return [Elevation(s, a, c) for a, c in edges(clockwise(b["poly"]))]


def upper_face(s, points, colour):
    ring = [(x, z) for x, z, _ in points]
    if sum(a[0] * b[1] - b[0] * a[1] for a, b in edges(ring)) > 0:
        points = points[::-1]
    s.face(points, colour)


def windows(
    e, left, right, low, high, count, frame="steel", glazing="slate", margin=0.38
):
    if right - left < 1:
        return
    step = (right - left) / count
    for i in range(count):
        x0 = left + i * step + min(margin, step * 0.19)
        x1 = left + (i + 1) * step - min(margin, step * 0.19)
        m = (x0 + x1) * 0.5
        e.panel(x0, x1, low, high, glazing, 0.055)
        e.panel(m - 0.055, m + 0.055, low, high, frame, 0.085)
        e.panel(x0 - 0.055, x1 + 0.055, low - 0.09, low + 0.025, frame, 0.08)


def roof_finish(obj, colour):
    obj.data.materials[1] = material(colour)


def shopping_town(s, b):
    n = BLOCK_NUMBERS[b["id"]]
    wall = "brick" if n >= 6 else "ochre" if n == 5 else "stone" if n >= 3 else "panel"
    lower_or_raise_base(s.parent, b, 18, wall)
    for e in frontages(s, b):
        # Positive local v faces Sinbanpo-ro. Chamfered ends do not acquire a full shop row.
        street = e.tx > 0.5 and e.length > 17
        if not street:
            for low in [4, 7.5, 11, 14.5]:
                windows(
                    e,
                    0.58,
                    e.length - 0.58,
                    low + 0.8,
                    low + 2.38,
                    max(1, round(e.length / 5.6)),
                    margin=0.72,
                )
            continue
        bays = max(3, round(e.length / 4.3))
        step = (e.length - 0.8) / bays
        for j in range(bays):
            x = 0.4 + j * step
            e.panel(x, x + step - 0.10, 0.28, 2.85, "dark", 0.055)
            e.panel(x + step * 0.51, x + step * 0.51 + 0.12, 0.32, 2.77, "steel", 0.09)
            e.panel(
                x,
                x + step - 0.10,
                2.86,
                3.68,
                ("teal", "panel", "ochre", "burgundy", "dark")[(j + n) % 5],
                0.13,
            )
        for low in [4, 7.5, 11, 14.5]:
            windows(
                e,
                0.23,
                e.length - 0.23,
                low + 0.39,
                low + 2.79,
                bays,
                margin=0.23,
                glazing="shopglass",
            )
            e.ledge(low + 0.035, low + 0.32, "panel" if n < 6 else "brick", 0.17)
        for k in range(bays + 1):
            x = 0.4 + k * step
            e.panel(x - 0.12, min(e.length, x + 0.18), 3.76, 18.48, wall, 0.19)
        e.ledge(17.8, 18.44, wall, 0.21)


def banwon(s, b):
    lower_or_raise_base(s.parent, b, 8.4, "panel")
    roof_finish(s.parent, "greenroof")
    for e in frontages(s, b):
        count = max(3, round(e.length / 5.8))
        windows(e, 0.4, e.length - 0.4, 1.48, 3.88, count, glazing="shopglass")
        windows(e, 0.5, e.length - 0.5, 5.12, 7.85, count, glazing="slate")
        e.ledge(4.05, 4.67, "cream", 0.27)
        e.ledge(8.12, 8.65, "panel", 0.24)
    # Existing north and east canvas by the corner of Hanshin Chicken.
    R = hypot(40.68, 14.39)
    c = 40.68 / R
    t = 14.39 / R

    def p(u, v):
        return (-152.28 + u * c + v * t, -419.62 - u * t + v * c)

    for a, z in [(p(43.15, 0), p(24, 0)), (p(43.15, 16), p(43.15, 0))]:
        e = Elevation(s, a, z)
        upper_face(
            s,
            [
                e.p(0, 3.48, 2.5),
                e.p(e.length, 3.48, 2.5),
                e.p(e.length, 4.26, 0.12),
                e.p(0, 4.26, 0.12),
            ],
            "orange",
        )
        e.panel(0, e.length, 3.23, 3.48, "burgundy", 2.5)
        for x in range(0, int(e.length), 3):
            e.panel(x, x + 0.10, 1.22, 3.26, "steel", 2.46)


def lebon(s, b):
    lower_or_raise_base(s.parent, b, 38, "travertine")
    for e in frontages(s, b):
        count = 7 if e.length > 42 else 6
        for h in [0, 5.5, 10.4, 15, 19.6, 24.2, 28.8, 33.4]:
            windows(
                e,
                1.6,
                e.length - 1.6,
                h + 1.55,
                h + 3.34,
                count,
                frame="cream",
                glazing="shopglass",
                margin=0.92,
            )
            e.ledge(h + 3.69, h + 3.88, "cream", 0.12)
    # Roof LED from lebon.js: a black surround, pale display face and two short mounts.
    ang = 105 * pi / 180
    u = (cos(ang), -sin(ang))
    normal = (sin(ang), cos(ang))

    def p(a, d):
        return (-224 + a * u[0] + d * normal[0], 6 + a * u[1] + d * normal[1])

    s.volume(rect(p, -5.8, -0.24, 5.8, 0.24), 39, 46, "dark")
    e = Elevation(s, p(-5.5, 0.26), p(5.5, 0.26))
    e.panel(0, 11, 39.25, 45.75, "signpanel", 0.025)
    for x in [-3.7, 3.7]:
        s.volume(rect(p, x - 0.14, -0.2, x + 0.14, 0.2), 38, 39.1, "steel")


def deck(s, b, top, levels, colour="concrete"):
    lower_or_raise_base(s.parent, b, top, "shadow")
    roof_finish(s.parent, "asphalt")
    for e in frontages(s, b):
        for h in levels:
            e.ledge(h - 0.36, h + 0.62, colour, 0.24)
            if h + 1 < top:
                e.panel(0, e.length, h + 0.74, h + 0.90, "steel", 0.15)
        if e.length >= 5:
            for x in range(1, int(e.length), 7):
                e.panel(x, x + 0.55, 0, top, "concrete", 0.075)


def barrel(s, p, start, end, mid, half, base, rise, glass_band=False):
    segments = 14

    def arc(x, j, extra=0):
        a = j * pi / segments
        return (*p(x, mid - half * cos(a)), base + rise * sin(a) + extra)

    for j in range(segments):
        colour = "cream" if glass_band and (j < 4 or j >= 10) else "blueglass"
        upper_face(
            s, [arc(start, j), arc(end, j), arc(end, j + 1), arc(start, j + 1)], colour
        )
        for k in range(round(start), round(end), 4):
            upper_face(
                s,
                [
                    arc(k, j, 0.045),
                    arc(k + 0.14, j, 0.045),
                    arc(k + 0.14, j + 1, 0.045),
                    arc(k, j + 1, 0.045),
                ],
                "steel",
            )
    for x in (start, end):
        # The faired outline closes the roof at each end.
        points = [arc(x, j) for j in range(segments + 1)]
        if x == start:
            points.reverse()
        s.face(points, "blueglass")


def famille(s, b):
    # The claimed east parcel is the car deck. The project's adjoining public
    # restaurant gallery has a cream barrel with a glazed crown in its own frame.
    deck(s, b, 9, [0, 5, 9])
    h = hypot(62, 24)
    c = 62 / h
    t = 24 / h

    def p(u, v):
        return (29 - c * u + t * v, 144 + t * u + c * v)

    gallery = rect(p, 22, 0, 70.56, 11.5)
    s.volume(gallery, 0, 8, "ochre", "cream")
    for a, d in edges(clockwise(gallery)):
        e = Elevation(s, a, d)
        if e.length < 20:
            continue
        windows(
            e,
            0.6,
            e.length - 0.6,
            0.35,
            4.3,
            max(2, round(e.length / 5.7)),
            frame="timber",
            glazing="shopglass",
        )
        e.ledge(4.44, 4.75, "cream", 0.36)
        e.ledge(7.75, 8, "cream", 0.28)
    barrel(s, p, 22, 70.56, 5.75, 5.75, 8, 3, True)


def atrium(s, b):
    # Sixteen segments, two green glazed tiers and the small lantern as in famille_atrium_art.js.
    lower_or_raise_base(s.parent, b, 11.7, "stone")
    for e in frontages(s, b):
        e.panel(0.22, e.length - 0.22, 5.6, 10.8, "teal", 0.07)
        e.ledge(10.9, 11.73, "cream", 0.27)
    rings = [
        (18.5, 11.7),
        (16.85, 12.51),
        (12.1, 15.1),
        (11.93, 15.48),
        (4.65, 20.95),
        (4.65, 22.8),
        (0.01, 23.4),
    ]

    def point(j, r, h, extra=0):
        return (-47 + r * cos(j * pi / 8), 214.6 + r * sin(j * pi / 8), h + extra)

    for j in range(16):
        for n, ((r0, h0), (r1, h1)) in enumerate(zip(rings, rings[1:])):
            pts = [
                point(j, r0, h0),
                point(j + 1, r0, h0),
                point(j + 1, r1, h1),
                point(j, r1, h1),
            ]
            if r0 == r1:
                pts.reverse()
            upper_face(s, pts, ("teal", "mint", "teal", "mint", "teal", "greenroof")[n])
            upper_face(
                s,
                [
                    point(j, r0, h0, 0.07),
                    point(j + 0.048, r0, h0, 0.07),
                    point(j + 0.048, r1, h1, 0.07),
                    point(j, r1, h1, 0.07),
                ],
                "steel",
            )


def central(s, b):
    key = b["id"]
    if key == 593858530:
        return atrium(s, b)
    if key != 356127040:
        return deck(s, b, 9, [0, 4.5, 9])
    lower_or_raise_base(s.parent, b, 9, "stone")
    roof_finish(s.parent, "asphalt")
    for e in frontages(s, b):
        if e.length < 5:
            continue
        e.ledge(5.0, 5.36, "cream", 0.46)
        e.ledge(8.86, 9.40, "stone", 0.32)
        if e.length > 20:
            windows(
                e,
                0.9,
                e.length - 0.9,
                0.45,
                4.22,
                max(2, round(e.length / 6)),
                glazing="shopglass",
            )
    # Existing June 2026 west terminal screen and northern mint-glazed lantern.
    r = hypot(55, 140.8)
    ax, az = 55 / r, 140.8 / r

    def p(u, v):
        return (-135.7 + ax * u + az * v, 9.9 + az * u - ax * v)

    e = Elevation(s, p(-13, 0), p(147, 0))
    e.ledge(5.0, 5.65, "cream", 1.9)
    e.ledge(8.1, 8.45, "timber", 0.34)
    for j in range(2, 159, 5):
        e.panel(j, j + 0.45, 0.12, 5, "concrete", 1.65)
    front, back = -26.5, -20.5
    for t in (13.2, 25.8):
        s.volume(rect(p, front, t - 3, back, t + 3), 0, 11.8, "timber")
    s.volume(rect(p, front, 16.2, back, 22.8), 6, 10.2, "mint")
    upper_face(
        s,
        [
            (*p(front, 16.2), 10.22),
            (*p(front, 22.8), 10.22),
            (*p(back, 22.8), 10.60),
            (*p(back, 16.2), 10.60),
        ],
        "mint",
    )
    e = Elevation(s, p(front, 22.8), p(front, 16.2))
    for x in [0, 1.65, 4.95, 6.6]:
        e.panel(x - 0.06, x + 0.06, 6, 10.2, "mullion")
    for h in [6.0, 7.6, 9.2]:
        e.panel(0, 6.6, h, h + 0.10, "mullion")
    for i in range(20):
        a = i * pi / 10
        z = (i + 1) * pi / 10

        def medal(angle, radius, out):
            return e.p(3.3 + radius * cos(angle), 7.55 + radius * sin(angle), out)

        s.face(
            [e.p(3.3, 7.55, 0.19), medal(a, 1.46, 0.19), medal(z, 1.46, 0.19)], "dark"
        )
        if 2 <= i < 18:
            s.face(
                [
                    medal(a, 0.61, 0.22),
                    medal(a, 1.02, 0.22),
                    medal(z, 1.02, 0.22),
                    medal(z, 0.61, 0.22),
                ],
                "cream",
            )


def terminal_annex(s, b):
    key = b["id"]
    if key == 356129682:
        return deck(s, b, 6, [0, 6], "stone")
    if key == 1173093435:
        lower_or_raise_base(s.parent, b, 6.4, "teal")
        for e in frontages(s, b):
            for x in range(1, int(e.length), 3):
                e.panel(x, x + 0.15, 0.18, 6.35, "steel")
            for h in [0.08, 3.2, 6.25]:
                e.ledge(h, h + 0.15, "steel", 0.12)
        return
    lower_or_raise_base(s.parent, b, 14, "stone")

    def p(u, v):
        return (2.3 + u * 0.9348 + v * 0.3552, -59.24 - u * 0.3552 + v * 0.9348)

    for e in frontages(s, b):
        for y in [0, 3.5, 7, 10.5]:
            windows(
                e,
                0.55,
                e.length - 0.55,
                y + 0.86,
                y + 2.58,
                max(2, round(e.length / 4.0)),
                frame="steel",
                glazing="shopglass",
            )
            e.ledge(y + 3.27, y + 3.48, "concrete", 0.13)
    tile = rect(p, 93, 148.6, 105, 164.1)
    s.volume(tile, 14, 17.5, "stone", "shadow")
    for a, c in edges(clockwise(tile)):
        e = Elevation(s, a, c)
        e.panel(e.length * 0.4, e.length * 0.56, 14.05, 17.43, "teal")


def pub(s, b):
    deck(s, b, 9.3, [0, 3.15, 6.3, 9.3])
    l = hypot(93.92, 46.63)

    def p(u, v):
        return (
            333.85 + u * 93.92 / l + v * 46.63 / l,
            16.3 - u * 46.63 / l + v * 93.92 / l,
        )

    base = 9.3
    hall = rect(p, 18, 1.0, 63, 16.1)
    s.volume(hall, base, base + 6.15, "brick", "greenroof")
    e = Elevation(s, p(18, 16.1), p(63, 16.1))
    bays = 7
    for i in range(bays):
        mid = (i + 0.5) * 45 / bays
        w = 1.84
        e.panel(mid - w, mid + w, base + 0.22, base + 3.65, "dark", 0.065)
        for j in range(9):
            a = j * pi / 9
            c = (j + 1) * pi / 9
            pt = lambda angle, delta: e.p(
                mid + (w + delta) * cos(angle),
                base + 3.65 + (w + delta) * sin(angle),
                0.12,
            )
            s.face([e.p(mid, base + 3.65, 0.12), pt(a, 0), pt(c, 0)], "shopglass")
            s.face([pt(a, 0), pt(a, 0.23), pt(c, 0.23), pt(c, 0)], "bricklight")
    e.ledge(base + 5.75, base + 6.05, "greenroof", 1.02)
    for edge, spring in [(0.95, 4), (16.9, 13.4)]:
        upper_face(
            s,
            [
                (*p(18, edge), base + 6.25),
                (*p(49.5, edge), base + 6.25),
                (*p(49.5, spring), base + 7.35),
                (*p(18, spring), base + 7.35),
            ],
            "greenroof",
        )
        upper_face(
            s,
            [
                (*p(18, spring), base + 8.65),
                (*p(49.5, spring), base + 8.65),
                (*p(49.5, 8.7), base + 10.35),
                (*p(18, 8.7), base + 10.35),
            ],
            "blueglass",
        )
        a, c = (
            (p(18, spring), p(49.5, spring))
            if spring > 8
            else (p(49.5, spring), p(18, spring))
        )
        e = Elevation(s, a, c)
        e.panel(0, e.length, base + 7.35, base + 8.65, "blueglass")
        for x in range(1, 31, 2):
            e.panel(x, x + 0.13, base + 7.35, base + 8.65, "steel", 0.08)
    barrel(s, p, 49.5, 63, 8.7, 7.25, base + 8.65, 3.3)


BUILDERS = {
    "shinsegae": {159117108: shin},
    "jwmarriott": {136986976: hotel},
    "gyeongbu": {
        309352819: terminal,
        **{key: terminal_annex for key in (356129682, 356129683, 1173093435)},
    },
    "banpo_shoppingtown": {key: shopping_town for key in BLOCK_NUMBERS},
    "banwon": {413354848: banwon},
    "lebon": {413280002: lebon},
    "famille": {414891732: famille},
    "gyeongbu_east": {414891734: pub},
    "centralcity": {
        key: central for key in (356127040, 593858530, 601356623, 1173096805)
    },
    "newcore": {key: newcore for key in (413372929, 413372930, 413372931, 443718139)},
}


def enhance_landmark(obj, b):
    """Return True for a modelled far shell. Original root retains the OSM id."""
    owner, site = b["owner"], b["id"]
    if owner == "newcore" and site == 6169292:
        # This relation repeats three way footprints exactly; one visible skin per building.
        obj.hide_render = True
        obj.hide_viewport = True
        obj["landmark_duplicate"] = True
        return False
    build = BUILDERS.get(owner, {}).get(site)
    if not build:
        return False
    if obj.get("landmark_facade") == owner and any(
        c.get("shell_part") for c in obj.children
    ):
        return True
    skin = Skin(obj, b)
    build(skin, b)
    facade = skin.finish()
    if site == 593858530:
        from pathlib import Path
        import runpy
        runpy.run_path(str(Path(__file__).resolve().parents[1] / "famille-dome" / "mount.py"))["open_pavilion"](obj, facade)
    obj["landmark_facade"] = owner
    return True
