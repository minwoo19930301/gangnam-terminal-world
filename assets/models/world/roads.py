"""Build editable road ribbons, kerbs and lane paint from the project's surface roads."""

import math


# Detailed exterior decks are built in river-landmarks.py.
RIVER_DECKS = {37928409, 674432572, 1091571409, 1091571410, 596516315,604527964,1232132154,1232132187}


def build_roads(context, seed, mesh_object, material, surfaces):
    traffic_paint = material("흰색 노면표시", (0.78, 0.78, 0.73))
    center_paint = material("황색 중앙선", (0.74, 0.48, 0.11))
    kerb = material("연석", (0.52, 0.51, 0.46))
    strips = {}

    def elevation(x, z, fallback):
        grid = next((g for k, g in seed["groundGrids"].items() if k != "city"
                     and g["x"] <= x < g["x"]+(g["width"]-1)*g["step"]
                     and g["z"] <= z < g["z"]+(g["height"]-1)*g["step"]), seed["ground"])
        u = (x - grid["x"]) / grid["step"]
        v = (z - grid["z"]) / grid["step"]
        i, j = math.floor(u), math.floor(v)
        if not (0 <= i < grid["width"] - 1 and 0 <= j < grid["height"] - 1):
            return fallback
        u -= i
        v -= j
        index = j * grid["width"] + i
        row = grid["rows"]
        w = grid["width"]
        a, b, c, d = [row[k] for k in (index, index + 1, index + w + 1, index + w)]
        return (
            a + (b - a) * u + (d - a) * v
            if u + v <= 1
            else c * (u + v - 1) + b * (1 - v) + d * (1 - u)
        )

    for road in seed["roads"]:
        if road["id"] in RIVER_DECKS:
            continue
        kind = road["hw"]
        road_name = road["name"] or kind
        walk = kind in ("pedestrian", "cycleway", "footway", "steps", "path", "track")
        highway = kind in ("motorway", "trunk", "primary", "secondary", "tertiary")
        material_index = (
            3
            if kind == "cycleway"
            else 2
            if walk
            else 0
            if highway or kind.endswith("_link")
            else 1
        )
        width = road["width"]
        lanes = min(8, max(1, road.get("lanes") or round(width / 3.45)))
        delta = (
            7.5 * road["layer"] if road["layer"] > 0 else 1.5 if road["bridge"] else 0
        ) + 0.075
        station = 0
        for p, q in zip(road["pts"], road["pts"][1:]):
            dx, dz = q[0] - p[0], q[1] - p[1]
            length = math.hypot(dx, dz)
            if length < 0.01:
                continue
            ux, uz = dx / length, dz / length

            def point(t, side, lift):
                x = p[0] + ux * t - uz * side
                z = p[1] + uz * t + ux * side
                return (
                    x,
                    -z,
                    elevation(x, z, p[2] + (q[2] - p[2]) * t / length - delta)
                    + delta
                    + lift,
                )

            def strip(lo, hi, a, b, lift, slot):
                if hi - lo < 0.005:
                    return
                vertices, faces = strips.setdefault(
                    (road_name, material_index), ([], [])
                )
                k = len(vertices)
                vertices.extend(
                    [
                        point(lo, a, lift),
                        point(lo, b, lift),
                        point(hi, b, lift),
                        point(hi, a, lift),
                    ]
                )
                faces.append((slot, (k, k + 1, k + 2, k + 3)))

            if road.get("footway") == "crossing":
                lo = -(station % 0.92)
                while lo < length:
                    strip(max(0, lo), min(length, lo + 0.46), -1.7, 1.7, 0.115, 1)
                    lo += 0.92
                station += length
                continue
            count = max(1, math.ceil(length / 7))
            for n in range(count):
                a, b = length * n / count, length * (n + 1) / count
                strip(a, b, -width / 2, width / 2, 0, 0)
                if highway and not road["bridge"]:
                    for side in (-1, 1):
                        strip(
                            a,
                            b,
                            side * width / 2 - 0.12,
                            side * width / 2 + 0.12,
                            0.055,
                            3,
                        )
                if highway and not road["oneway"] and lanes >= 2:
                    strip(a, b, -0.08, 0.08, 0.025, 2)
            if highway and lanes >= 2:
                for lane in range(1, lanes):
                    side = width * (lane / lanes - 0.5)
                    if abs(side) < 0.11 and not road["oneway"]:
                        continue
                    lo = -(station % 10)
                    while lo < length:
                        strip(
                            max(0, lo),
                            min(length, lo + 3),
                            side - 0.065,
                            side + 0.065,
                            0.03,
                            1,
                        )
                        lo += 10
            station += length
    for (name, typ), (vertices, faces) in strips.items():
        obj = mesh_object(
            context,
            name,
            vertices,
            [f for _, f in faces],
            [surfaces[typ], traffic_paint, center_paint, kerb],
        )
        for f, (slot, _) in zip(obj.data.polygons, faces):
            f.material_index = slot
