"""Mount the same linked sign collections in the distant city model."""
import math
from pathlib import Path
import bpy


def mount_signs(city):
    building = next(o for o in city.objects if o.get("shell_key") == "159117108")
    path = Path(__file__).resolve().with_name("north-signs.blend")
    groups = [g for g in bpy.data.collections if g.library and g.get("bundle") == "signs"
              and Path(bpy.path.abspath(g.library.filepath)).resolve() == path]
    if not groups:
        raise ValueError("Link the Shinsegae sign library before mounting it in the city")
    existing = {o.instance_collection: o for o in building.children if o.instance_collection}
    for group in groups:
        if group in existing:
            existing[group]["shell_part"] = True
            continue
        obj = bpy.data.objects.new("북측 타워 간판 · " + group.name, None)
        building.users_collection[0].objects.link(obj)
        obj.instance_type = "COLLECTION"
        obj.instance_collection = group
        obj.empty_display_size = .2
        obj.parent = building
        obj["shell_part"] = True
        # Building-local north facade frame, shared with the detailed exterior.
        u = group["tower_u"]
        x = -107.07 + 62.61 * u / 67
        z = -24.31 - 23.77 * u / 67
        obj.location = (x - building.location.x, -z - building.location.y, group["base_height"])
        obj.rotation_euler.z = math.atan2(23.77, 62.61) + math.pi
