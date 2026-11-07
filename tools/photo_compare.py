"""Render the model from every photo of the user's walk and put each render next to its photo.

usage: uv run -q --with pillow python tools/photo_compare.py refs/user_walk/<date> [out_dir] [--every N] [--modules a,b] [--redo i,j,...]

Reads <dir>/places.json (the approved, stitched place reading: i, place, module, floor, x, z, yawDeg) and <dir>/manifest.json,
renders one view per photo with tests/shot.mjs --gpu (y = that floor's level), and writes <out>/<module>_<k>.png sheets
(6 pairs per sheet, each photo | render; header = photo #, time, place, floor, pose) plus <out>/poses.json.
The photos are private (refs/ is git-ignored); the sheets go to shots/ (also ignored). Never publish either.
"""
import json, os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
if not args: print(__doc__); sys.exit(1)
d = os.path.join(ROOT, args[0])
out = os.path.join(ROOT, args[1] if len(args) > 1 and not args[1].startswith('--') else 'shots/user_walk')
every = int(args[args.index('--every') + 1]) if '--every' in args else 1
only = set(args[args.index('--modules') + 1].split(',')) if '--modules' in args else None
os.makedirs(out, exist_ok=True)
places = json.load(open(os.path.join(d, 'places.json')))['photos']
man = {r['i']: r for r in json.load(open(os.path.join(d, 'manifest.json')))['photos']}
LV = {'B2': -11, 'B1': -6, '1F': 0, '1M': 3.6, '2F': 7, 'out': 0}
MOD_LV = {'centralcity': {'2F': 5}}  # module-specific floor heights (js/places/<id>.js)
sel = [p for p in sorted(places, key=lambda p: p['i']) if p['i'] % every == 0 and p.get('module') not in ('car',)]
if only: sel = [p for p in sel if p.get('module') in only]
poses = []
for p in sel:
    y = MOD_LV.get(p.get('module'), {}).get(p['floor'], LV.get(p['floor'], 0))
    poses.append({'i': p['i'], 'name': f"uw_{p['i']:03d}", 'module': p.get('module') or 'outdoor', 'place': p['place'], 'floor': p['floor'],
                  'x': p['x'], 'y': y, 'z': p['z'], 'yawDeg': p.get('yawDeg', man[p['i']].get('yawDeg', 0)) or 0,
                  'photo': man[p['i']]['file'], 't': man[p['i']]['t'][11:19]})
by = {}
for q in poses: by.setdefault(q['module'], []).append(q)
PER = 6  # pairs per sheet: 3 columns x 2 rows, each pair = photo | render (300x400 each)
for mod, qs in by.items():
    for k, q in enumerate(qs): q['sheet'] = os.path.relpath(os.path.join(out, f"{mod}_{k // PER + 1}.png"), ROOT); q['render'] = os.path.relpath(os.path.join(out, q['name'] + '.png'), ROOT)
json.dump(poses, open(os.path.join(out, 'poses.json'), 'w'), ensure_ascii=False, indent=1)
if '--redo' in args:  # re-render these photo numbers (e.g. after pose fixes): --redo 12,40,341
    for i in map(int, args[args.index('--redo') + 1].split(',')):
        f = os.path.join(out, f'uw_{i:03d}.png')
        if os.path.exists(f): os.remove(f)
B = 80
for k in range(0, len(poses), B):  # shot.mjs in batches
    views = ';'.join(f"{q['name']}:{q['x']},{q['y']},{q['z']},{q['yawDeg']},0" for q in poses[k:k + B] if not os.path.exists(os.path.join(out, q['name'] + '.png')))
    if views: subprocess.run(['node', 'tests/shot.mjs', '--gpu', '--out', os.path.relpath(out, ROOT), '--views', views, '--w', '600', '--h', '800'], cwd=ROOT, check=False, capture_output=True)
    print('rendered', min(k + B, len(poses)), '/', len(poses), flush=True)
FONT = next((ImageFont.truetype(f, 11) for f in ['/System/Library/Fonts/AppleSDGothicNeo.ttc', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'] if os.path.exists(f)), None)
for mod, qs in by.items():
    for g in range(0, len(qs), PER):
        sheet = Image.new('RGB', (1830, 860), 'white'); dr = ImageDraw.Draw(sheet)
        for j, q in enumerate(qs[g:g + PER]):
            x0 = (j % 3) * 610; y0 = (j // 3) * 430
            ph = os.path.join(ROOT, q['photo'])
            if os.path.exists(ph):
                a = Image.open(ph).convert('RGB'); a.thumbnail((300, 400)); sheet.paste(a, (x0 + (300 - a.width) // 2, y0 + 26))
            rp = os.path.join(out, q['name'] + '.png')
            if os.path.exists(rp):
                b = Image.open(rp).convert('RGB'); b.thumbnail((300, 400)); sheet.paste(b, (x0 + 305 + (300 - b.width) // 2, y0 + 26))
            dr.rectangle([x0, y0, x0 + 605, y0 + 24], fill='black')
            dr.text((x0 + 3, y0 + 1), f"#{q['i']} {q['t']} {q['place']} {q['floor']}"[:60], fill='yellow', font=FONT)
            dr.text((x0 + 3, y0 + 12), f"PHOTO | MODEL {q['name']} ({q['x']},{q['y']},{q['z']}, yaw {q['yawDeg']})", fill='#9fe0ff', font=FONT)
        sheet.save(os.path.join(out, f"{mod}_{g // PER + 1}.png"))
print(out, {m: (len(v) + 5) // 6 for m, v in by.items()})
