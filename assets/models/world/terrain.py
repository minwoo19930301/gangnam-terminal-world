"""Clip the DEM triangles to mapped shorelines and parks with Shapely / GEOS."""

import json
import sys
from pathlib import Path

from shapely import constrained_delaunay_triangles, make_valid, union_all
from shapely.geometry import Polygon, box
from shapely.prepared import prep

path = Path(sys.argv[1])
data = json.loads((path / "seed.json").read_text())
grid = data["ground"]
land = data["land"]


def polygons(geometry):
    if geometry.is_empty:
        return
    if geometry.geom_type == "Polygon":
        yield geometry
    elif hasattr(geometry, "geoms"):
        for part in geometry.geoms:
            yield from polygons(part)


def cover(wet):
    pieces = []
    for area in land:
        if (area["kind"] == "natural:water") != wet:
            continue
        pieces.extend(polygons(make_valid(Polygon(area["outline"], area["holes"]))))
    return union_all(pieces)


water = cover(True)
parks = cover(False).difference(water)
boundary = union_all([parks.boundary, water.boundary])
edges, grass, wet = map(prep, [boundary, parks, water])
coords = []
lookup = {}
faces = []
width, height = grid["width"], grid["height"]
step = grid["step"]


def vertex(x, z, y):
    point = (round(x, 3), round(z, 3), round(y, 3))
    if point not in lookup:
        lookup[point] = len(coords)
        coords.append(point)
    return lookup[point]


fine = data["groundGrids"]["garden"]
for grid in [data["ground"], fine]:
    width, height, step = grid["width"], grid["height"], grid["step"]
    for j in range(height - 1):
        for i in range(width - 1):
            x, z = grid["x"] + i * step, grid["z"] + j * step
            if (
                grid is not fine
                and fine["x"] <= x < fine["x"] + (fine["width"] - 1) * fine["step"]
                and fine["z"] <= z < fine["z"] + (fine["height"] - 1) * fine["step"]
            ):
                continue
            heights = [
                grid["rows"][a * width + b] - 0.08
                for a, b in [(j, i), (j + 1, i), (j + 1, i + 1), (j, i + 1)]
            ]
            corners = [(x, z), (x, z + step), (x + step, z + step), (x + step, z)]
            tile = box(x, z, x + step, z + step)
            if not edges.intersects(tile):
                if not wet.covers(tile.centroid):
                    nodes = [vertex(*p, y) for p, y in zip(corners, heights)]
                    for ids in ((0, 1, 3), (1, 2, 3)):
                        faces.append(
                            [int(grass.covers(tile.centroid)), *[nodes[k] for k in ids]]
                        )
                continue
            for ids in [(0, 1, 3), (1, 2, 3)]:
                p, q, r = (corners[k] for k in ids)
                a, b, c = (heights[k] for k in ids)
                tri = Polygon([p, q, r])
                xy = tri.difference(water) if wet.intersects(tri) else tri
                if xy.is_empty:
                    continue
                fragments = (
                    [(0, xy.difference(parks)), (1, xy.intersection(parks))]
                    if grass.intersects(xy)
                    else [(0, xy)]
                )

                def altitude(e, n):
                    u, v = (e - x) / step, (n - z) / step
                    return (
                        a + (b - a) * v + (c - a) * u
                        if ids[0] == 0
                        else b * (u + v - 1) + a * (1 - u) + c * (1 - v)
                    )

                for material, fragment in fragments:
                    for poly in polygons(fragment):
                        for t in constrained_delaunay_triangles(poly).geoms:
                            pts = list(t.exterior.coords)[:3]
                            if t.area < 0.00001:
                                continue
                            # Game z points south. Clockwise in (x,z) faces up in Blender.
                            if t.exterior.is_ccw:
                                pts.reverse()
                            faces.append(
                                [
                                    material,
                                    *[vertex(e, n, altitude(e, n)) for e, n in pts],
                                ]
                            )
with (path / "landscape.json").open("w") as file:
    json.dump([coords, faces], file, separators=(",", ":"))
print(
    f"Clipped DEM with {len(coords):,} vertices and {len(faces):,} land and park faces"
)
