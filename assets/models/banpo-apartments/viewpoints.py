"""Equip the editable apartment file with the same public sidewalk views and solar clock as the game."""
from math import cos, radians, sin, tan
from pathlib import Path
import json
import runpy
import subprocess

import bpy
from mathutils import Vector


def install_viewpoints(scene):
    here = Path(__file__).resolve().parent
    data = json.loads(subprocess.check_output(["node", str(here / "viewpoints.mjs")], text=True))
    scene.world = scene.world or bpy.data.worlds.new("서울 · 아파트 외관")
    if "서울 태양" not in scene.objects:
        sun = bpy.data.objects.new("서울 태양", bpy.data.lights.new("서울 태양", "SUN"))
        scene.collection.objects.link(sun)
    runpy.run_path(str(here.parent / "world" / "lighting.py"))["apply_sky"](scene, data["sky"])
    for view in data["views"]:
        name = view["name"] + " · 보도 카메라"
        camera = scene.objects.get(name)
        if camera is None:
            camera = bpy.data.objects.new(name, bpy.data.cameras.new(name))
            # The editable exteriors are linked individually into the city. Keep this rig in the library scene.
            scene.collection.objects.link(camera)
        camera.data.sensor_fit = "VERTICAL"
        camera.data.lens = camera.data.sensor_height / (2 * tan(radians(72) / 2))
        camera.data.clip_start = .08
        camera.data.clip_end = 4000
        camera.location = (view["x"], view["north"], view["height"])
        yaw, pitch = radians(view["yaw"]), radians(view["pitch"])
        direction = Vector((-sin(yaw) * cos(pitch), cos(yaw) * cos(pitch), sin(pitch)))
        camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        if scene.camera is None:
            scene.camera = camera
    # The asset file has no district paving. A neutral patch of the game's survey
    # receives shadows at the original elevations. It belongs only to this scene.
    terrain_name = "세 단지 표고 · 렌더 바닥"
    if terrain_name not in scene.objects:
        ground = data["ground"]
        points, columns = ground["points"], ground["columns"]
        faces = []
        for i in range(len(points) - columns):
            if (i + 1) % columns:
                faces.extend([(i, i + columns, i + 1), (i + 1, i + columns, i + columns + 1)])
        mesh = bpy.data.meshes.new(terrain_name)
        mesh.from_pydata(points, [], faces)
        mesh.update()
        mat = bpy.data.materials.new("표고 확인용 · 회색 흙")
        mat.diffuse_color = (.18, .185, .175, 1)
        mesh.materials.append(mat)
        scene.collection.objects.link(bpy.data.objects.new(terrain_name, mesh))
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
