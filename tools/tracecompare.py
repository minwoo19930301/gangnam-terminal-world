"""Render every traced spot (data/research/<id>.json → modeling.trace: [{spot, photos, x, y, z, yawDeg}]) and place
it next to its blog photo(s).  usage: uv run -q --with pillow python tools/tracecompare.py out_dir [id ...]
Writes <out_dir>/<id>_N.png sheets (3 spots per sheet: photo left, render right)."""
import json, os, subprocess, sys, glob
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; ids = sys.argv[2:] or ['gyeongbu', 'centralcity', 'shinsegae', 'gotomall', 'station', 'jwmarriott', 'banpo_shoppingtown']
os.makedirs(os.path.join(ROOT, out), exist_ok=True)
def find_photo(name):
    if os.path.isabs(name) and os.path.exists(name): return name
    b = os.path.basename(name)
    for p in [os.path.join(ROOT, name)] + glob.glob(os.path.join(ROOT, 'refs/interior/*', b)) + glob.glob(os.path.join(ROOT, 'refs/interior/*', b + '*')) + glob.glob(os.path.join(ROOT, 'refs/walk/*', b)) + glob.glob(os.path.join(ROOT, 'refs/walk/*', b + '*')) + glob.glob(os.path.join(ROOT, 'refs/roadview', b)) + glob.glob(os.path.join(ROOT, 'refs/official/*', b)):
        if os.path.exists(p): return p
    return None
for mid in ids:
    try: tr = json.load(open(os.path.join(ROOT, f'data/research/{mid}.json'))).get('modeling', {}).get('trace', [])
    except Exception as e: print(mid, 'no research json', e); continue
    tr = [t for t in tr if all(k in t for k in ('x', 'y', 'z'))]
    if os.environ.get('TRACE_ONLY_WALK'):  # only cameras matched to virtual-walk video frames (refs/walk) or roadview
        tr = [t for t in tr if any(('refs/walk' in (find_photo(n) or '')) or ('refs/roadview' in (find_photo(n) or '')) for n in (t.get('photos') or []))]
    if os.environ.get('TRACE_PHOTO_RE'):  # only cameras whose resolved photo path matches this regex (e.g. 'ssg_food|s5_ssg')
        import re; rx = re.compile(os.environ['TRACE_PHOTO_RE'])
        tr = [t for t in tr if any(rx.search(find_photo(n) or '') for n in (t.get('photos') or []))]
    if not tr: print(mid, 'no trace entries'); continue
    views = ';'.join(f"{mid}_{i:02d}:{t['x']},{t['y']},{t['z']},{t.get('yawDeg', 0)},{t.get('pitchDeg', 0)}" for i, t in enumerate(tr))
    subprocess.run(['node', 'tests/shot.mjs', '--gpu', '--out', out, '--views', views], cwd=ROOT, check=False, capture_output=True)
    for g in range(0, len(tr), 3):
        sheet = Image.new('RGB', (1600, 1350), 'white'); d = ImageDraw.Draw(sheet)
        for i, t in enumerate(tr[g:g + 3]):
            k = g + i; y = i * 450
            ph = next((p for p in (find_photo(n) for n in (t.get('photos') or [])) if p), None)
            if ph:
                a = Image.open(ph).convert('RGB'); a.thumbnail((790, 450)); sheet.paste(a, (0, y))
            rp = os.path.join(ROOT, out, f'{mid}_{k:02d}.png')
            if os.path.exists(rp): sheet.paste(Image.open(rp).convert('RGB').resize((800, 450)), (800, y))
            d.rectangle([0, y, 790, y + 18], fill='black'); d.text((4, y + 3), f"PHOTO {os.path.basename(ph) if ph else '-'} | {t.get('spot', '')}"[:110], fill='yellow')
            d.rectangle([800, y, 1600, y + 18], fill='black'); d.text((804, y + 3), f"MODEL {mid}_{k:02d} ({t['x']},{t['y']},{t['z']},{t.get('yawDeg', 0)})", fill='yellow')
        fn = os.path.join(ROOT, out, f'{mid}_{g // 3 + 1}.png'); sheet.save(fn); print(fn)
