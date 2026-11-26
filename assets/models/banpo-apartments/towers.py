"""Re-home complete source tower surfaces without moving their footprint in the city."""
from collections import defaultdict
import bpy


def distance_sq(x, z, poly):
    inside = False
    nearest = float("inf")
    a, b = poly[-1]
    for c, d in poly:
        if (b > z) != (d > z) and x < a + (c-a)*(z-b)/(d-b):
            inside = not inside
        dx, dz = c-a, d-b
        if dx or dz:
            t = max(0, min(1, ((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)))
            nearest = min(nearest, (x-a-t*dx)**2+(z-b-t*dz)**2)
        a, b = c, d
    return 0 if inside else nearest


def assign_towers(originals, buildings, claims):
    # Four towers were included in the neighbouring publisher's GLB. The other
    # three original files already contain exactly their own physical towers.
    source_ids = {key: list(ids) for key, ids in claims.items()}
    for donor, recipient, towers in [
        ("apt-a10024913", "apt-a10023673", [1137867806, 1137867802, 1137867807]),
        ("apt-a13790929", "apt-a10024913", [839649714]),
    ]:
        for tower in towers:
            source_ids[recipient].remove(tower)
            source_ids[donor].append(tower)
    surfaces = defaultdict(list)
    for source, obj in originals.items():
        for face in obj.data.polygons:
            x, z = obj.location.x+face.center.x, -obj.location.y-face.center.y
            distance, tower = min((distance_sq(x, z, buildings[t]["poly"]), t) for t in source_ids[source])
            if distance > 15**2:
                raise ValueError(f"Source triangle {source}/{face.index} is too far from tower {tower}: {distance**.5:.1f} m")
            surfaces[tower].append((obj, face.index))
    result = {}
    for estate, ids in claims.items():
        base = originals[estate]
        base["tower_sources"] = {
            str(tower): surfaces[tower][0][0]["estate_id"] for tower in ids
        }
        points, faces, slots, colours = [], [], [], []
        for tower in ids:
            if not surfaces[tower]:
                raise ValueError(f"Empty tower: {tower}")
            for obj, index in surfaces[tower]:
                old = obj.data
                face = old.polygons[index]
                first = len(points)
                # Blender X=east, Y=north. Both estate base locations use the
                # published game anchors; keep every triangle in world space.
                delta = obj.location-base.location
                points.extend(old.vertices[i].co + delta for i in face.vertices)
                faces.append(tuple(range(first,len(points))))
                slots.append(face.material_index)
                layer = old.color_attributes.active_color
                colours.extend(channel for loop in face.loop_indices for channel in layer.data[loop].color)
        mesh = bpy.data.meshes.new(base.name+" · 동별 외관")
        mesh.from_pydata(points, [], faces)
        mesh.update()
        for mat in base.data.materials:
            mesh.materials.append(mat)
        mesh.polygons.foreach_set("material_index", slots)
        layer = mesh.color_attributes.new(name=base.data.color_attributes.active_color.name,type="FLOAT_COLOR",domain="CORNER")
        layer.data.foreach_set("color", colours)
        mesh.color_attributes.active_color=layer
        mesh.color_attributes.render_color_index=0
        result[estate] = mesh
    for estate, obj in originals.items():
        old=obj.data
        obj.data=result[estate]
        bpy.data.meshes.remove(old)
