"""Sync an open world to Seoul time. In background mode this sets the frame once."""

import bpy
import datetime
import json
import runpy
import subprocess
from pathlib import Path

here = Path(__file__).resolve().parent
seoul = datetime.timezone(datetime.timedelta(hours=9))
apply_sky = runpy.run_path(str(here / "lighting.py"))["apply_sky"]


def update():
    now = datetime.datetime.now(seoul)
    scene = bpy.data.scenes.get("반포 · 도시 전경") or bpy.context.scene
    if scene.get("Seoul solar date") != now.date().isoformat() or "Seoul apartment night" not in scene:
        curve = subprocess.check_output(["node", str(here / "lighting.mjs")], text=True)
        apply_sky(scene, json.loads(curve))
    scene.frame_set(now.hour * 60 + now.minute, subframe=now.second / 60)
    return 60 - now.second


update()
if not bpy.app.background:
    bpy.app.timers.register(update, first_interval=5)
