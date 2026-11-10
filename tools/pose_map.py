"""Top-down walkability map of one floor with the user's photo poses drawn on it.

usage: uv run -q --with pillow python tools/pose_map.py <y> <x0> <z0> <x1> <z1> <out.png> [--mods a,b,c] [--floors pose_floor.json] [--dir refs/user_walk/<date>] [--scale 6]

Runs tests/floormap.mjs (white = walkable, pink = blocked, grey = no floor, green = reachable, walls coloured by module) and
draws every photo whose floor is within 1.2 m of <y>: a dot at the pose and a short line in the viewing direction.
Blue = stands on a floor, orange = inside a wall/object, red = no floor there. Every 3rd photo number is printed.
Use it to tell a registration offset (all dots shifted the same way) from a missing build (red dots) or a bad pose (one odd dot).
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
if len(a) < 6: print(__doc__); sys.exit(1)
y, x0, z0, x1, z1 = map(float, a[:5]); out = os.path.join(ROOT, a[5])
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
d = os.path.join(ROOT, opt('--dir', 'refs/user_walk/20261107')); scale = int(opt('--scale', '6'))
pf_path = os.path.join(ROOT, opt('--floors')) if opt('--floors') else os.path.join(d, 'pose_floor.json')
os.makedirs(os.path.dirname(out), exist_ok=True)
cmd = ['node', 'tests/floormap.mjs', str(y), str(x0), str(z0), str(x1), str(z1), os.path.relpath(out, ROOT), str((x0 + x1) / 2), str((z0 + z1) / 2)]
if opt('--mods'): cmd.append(opt('--mods'))
subprocess.run(cmd, cwd=ROOT, check=True, capture_output=True)
im = Image.open(out).convert('RGB'); W, H = im.size
im = im.resize((W * scale // 4, H * scale // 4), Image.NEAREST); W, H = im.size
sx, sz = W / (x1 - x0), H / (z1 - z0); dr = ImageDraw.Draw(im)
pf = json.load(open(pf_path)) if os.path.exists(pf_path) else {}
LV = {'B2': -11, 'B1': -6, '1F': 0, '1M': 3.6, '2F': 5, 'out': 0}
n = 0
for p in json.load(open(os.path.join(d, 'places.json')))['photos']:
    if p.get('x') is None or not (x0 < p['x'] < x1 and z0 < p['z'] < z1): continue
    f = pf.get(str(p['i']), {}); py = f.get('y', LV.get(p['floor'], 0))
    if abs(py - y) > 1.2 and abs(LV.get(p['floor'], 0) - y) > 1.2: continue
    X, Z = (p['x'] - x0) * sx, (p['z'] - z0) * sz
    col = (255, 0, 0) if not f.get('floor', True) else (255, 140, 0) if not f.get('free', True) else (0, 90, 255)
    yaw = math.radians(p.get('yawDeg') or 0)
    dr.line([X, Z, X - math.sin(yaw) * 2.5 * sx, Z - math.cos(yaw) * 2.5 * sz], fill=col, width=2)
    dr.ellipse([X - 3, Z - 3, X + 3, Z + 3], fill=col)
    if p['i'] % 3 == 0: dr.text((X + 4, Z - 5), str(p['i']), fill=(0, 0, 0))
    n += 1
for gx in range(int(math.ceil(x0 / 10) * 10), int(x1) + 1, 10): dr.text(((gx - x0) * sx + 2, 2), str(gx), fill=(120, 0, 120))
for gz in range(int(math.ceil(z0 / 10) * 10), int(z1) + 1, 10): dr.text((2, (gz - z0) * sz + 2), str(gz), fill=(120, 0, 120))
im.save(out); print(out, f'{n} poses; purple numbers = world x (top) and z (left), metres')
