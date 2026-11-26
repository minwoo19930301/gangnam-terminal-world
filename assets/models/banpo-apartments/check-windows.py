"""Render just the city's linked exteriors and Seoul sky; compare the same exposure with lamps disabled."""
import bpy
import json
import runpy
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
target = Path(sys.argv[sys.argv.index("--") + 1])
target.mkdir(parents=True, exist_ok=True)
world_dir = here.parent / "world"
sky = runpy.run_path(str(world_dir / "lighting.py"))["apply_sky"]
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.world = bpy.data.worlds.new("서울")
sun = bpy.data.objects.new("서울 태양", bpy.data.lights.new("태양", "SUN"))
scene.collection.objects.link(sun)
with bpy.data.libraries.load(str(here / "banpo-apartments.blend"), link=True) as (source, linked):
    linked.collections = [name for name in source.collections if name.endswith(" · 외관")]
    linked.objects = [name for name in source.objects if name.endswith(" · 보도 카메라")]
for camera in linked.objects:
    scene.collection.objects.link(camera)
for coll in linked.collections:
    instance = bpy.data.objects.new(coll.name, None)
    instance.instance_type = "COLLECTION"
    instance.instance_collection = coll
    scene.collection.objects.link(instance)
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 480, 300
scene.render.resolution_percentage = 100
# Exercise the same season refresh used by the city's clock.
driver = """
import {dayCurve} from './assets/models/world/lighting.mjs';
import fs from 'node:fs';
console.log(JSON.stringify(dayCurve(Date.parse(process.argv[1]),JSON.parse(fs.readFileSync('data/osm.json')).origin)));
"""
for season in ("2026-06-21", "2026-12-21"):
    model = json.loads(subprocess.check_output(["node","--input-type=module","-e",driver,season],
                                               cwd=here.parents[2], text=True))
    sky(scene, model)
    for frame, expected in [(0, 1), (750, 0)]:
        scene.frame_set(frame)
        assert scene["Seoul apartment night"] == expected
    scene.frame_set(1120)
    assert scene["Seoul apartment night"] == (0.0 if season.endswith("06-21") else 1.0)
    print("Seasonal twilight", season, scene["Seoul apartment night"], flush=True)

def render(path):
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    image = bpy.data.images.load(str(path), check_existing=False)
    pixels = list(image.pixels[:])
    bpy.data.images.remove(image)
    return pixels

for name, estate in [("shinbanpo","신반포4차"), ("leel","반포르엘"), ("centralxi","반포센트럴자이")]:
    scene.camera = scene.objects[estate+" · 보도 카메라"]
    for frame, mode in [(750,"day"), (0,"night")]:
        scene.frame_set(frame)
        normal = render(target / f"{name}-{mode}.png")
        curve = scene.animation_data.action.fcurves.find('["Seoul apartment night"]')
        curve.mute = True
        scene["Seoul apartment night"] = 0.0
        scene.update_tag()
        unlit = render(target / f"{name}-{mode}-unlit.png")
        curve.mute = False
        differences = [max(normal[i+c]-unlit[i+c] for c in range(3)) for i in range(0,len(normal),4)]
        lit = sum(d > .04 for d in differences)
        print(name, mode, lit, "pixels above .04", flush=True)
        assert (lit > 100 if mode == "night" else max(differences) == 0)
