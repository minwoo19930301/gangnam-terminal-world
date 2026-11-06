"""Side-by-side: Kakao roadview frame (left) vs the model rendered from the matching camera (right).

Viewpoints live in refs/roadview/viewpoints.json: {"name": {"ref": "refs/roadview/...jpg", "cam": [x, y, z, yawDeg, pitchDeg]}}
usage: uv run -q --with pillow python tools/refcompare.py out_dir [name ...]
Renders with `node tests/shot.mjs --gpu` (full world) and writes <out_dir>/cmp_<group>.png sheets (4 rows each).
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vp = json.load(open(os.path.join(ROOT, 'refs/roadview/viewpoints.json')))
out = sys.argv[1]; names = sys.argv[2:] or list(vp)
views = ';'.join(f"{n}:{','.join(str(v) for v in vp[n]['cam'])}" for n in names)
subprocess.run(['node', 'tests/shot.mjs', '--gpu', '--out', out, '--views', views], cwd=ROOT, check=True)
for g in range(0, len(names), 4):
    grp = names[g:g + 4]; sheet = Image.new('RGB', (1600, 450 * len(grp)), 'white'); d = ImageDraw.Draw(sheet)
    for i, n in enumerate(grp):
        a = Image.open(os.path.join(ROOT, vp[n]['ref'])).convert('RGB'); a = a.resize((int(a.width * 450 / a.height), 450)).crop((0, 0, 800, 450))
        b = Image.open(os.path.join(ROOT, out, n + '.png')).convert('RGB').resize((800, 450))
        sheet.paste(a, (0, i * 450)); sheet.paste(b, (800, i * 450))
        d.rectangle([0, i * 450, 260, i * 450 + 20], fill='black'); d.text((6, i * 450 + 4), 'ROADVIEW ' + n, fill='yellow')
        d.rectangle([800, i * 450, 1060, i * 450 + 20], fill='black'); d.text((806, i * 450 + 4), 'MODEL ' + n, fill='yellow')
    fn = os.path.join(ROOT, out, f'cmp_{g // 4 + 1}.png'); sheet.save(fn); print(fn)
