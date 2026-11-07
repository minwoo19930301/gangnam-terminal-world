"""Draw the user's photo walk on the map as numbered arrows, for the user to confirm before the photos are used.

usage: uv run -q --with matplotlib python tools/route_map.py refs/user_walk/<date> [out.png]

Reads <dir>/manifest.json (tools/photo_route.py) and, if present, <dir>/places.json — the per-photo place reading
{"photos": [{"i", "place", "floor", "x", "z", "confidence", "note"}]} — which overrides the GPS position (GPS drifts
indoors and underground). Consecutive photos at the same place collapse into one stop; arrows join the stops in time
order, coloured by floor (B1 blue, 1F orange, 2F+ purple, outdoors green). GPS fixes are drawn as small grey dots.
"""
import json, os, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MP, FancyArrowPatch
plt.rcParams['font.family'] = 'AppleGothic'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d_dir = os.path.join(ROOT, sys.argv[1]) if len(sys.argv) > 1 else None
if not d_dir: print(__doc__); sys.exit(1)
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(d_dir, 'route_map.png')
man = json.load(open(os.path.join(d_dir, 'manifest.json')))['photos']
pl = {}
if os.path.exists(os.path.join(d_dir, 'places.json')):
    for p in json.load(open(os.path.join(d_dir, 'places.json')))['photos']: pl[p['i']] = p
osm = json.load(open(os.path.join(ROOT, 'data/osm.json')))

pts = []
for r in man:
    p = pl.get(r['i'], {})
    x, z = p.get('x', r.get('x')), p.get('z', r.get('z'))
    if x is None: continue
    pts.append({'i': r['i'], 't': r['t'][11:16], 'x': x, 'z': z, 'gx': r.get('x'), 'gz': r.get('z'),
                'place': p.get('place', ''), 'floor': p.get('floor', ''), 'conf': p.get('confidence', '')})
# stops: runs of the same place (or, without places.json, GPS points closer than 12 m)
stops = []
for p in pts:
    s = stops[-1] if stops else None
    same = s and ((p['place'] and p['place'] == s['place'] and p['floor'] == s['floor']) or
                  (not p['place'] and not s['place'] and abs(p['x'] - s['x']) + abs(p['z'] - s['z']) < 12))
    if same: s['ids'].append(p['i']); s['t1'] = p['t']
    else: stops.append({**p, 'ids': [p['i']], 't0': p['t'], 't1': p['t']})
COL = lambda f: '#2f6fd6' if f.startswith('B') else '#e07b1f' if f == '1F' else '#8a4bd1' if f[:1].isdigit() and f != '1F' else '#2e9e4f'

xs = [s['x'] for s in stops] + [p['gx'] for p in pts if p['gx'] is not None]
zs = [s['z'] for s in stops] + [p['gz'] for p in pts if p['gz'] is not None]
pad = 60
xr = [min(xs) - pad, max(xs) + pad]; zr = [min(zs) - pad, max(zs) + pad]
w = 16; h = max(6, min(22, w * (zr[1] - zr[0]) / (xr[1] - xr[0])))
fig, ax = plt.subplots(figsize=(w, h))
for a in osm['areas']:
    c = {'natural:water': '#cfe3f5', 'leisure:park': '#e2f0d6', 'landuse:grass': '#e6f2da', 'amenity:parking': '#ececec'}.get(a['kind'])
    if c: ax.add_patch(MP(a['poly'], closed=True, fc=c, ec='none', zorder=1))
for r in osm['roads']:
    if r['tunnel']: continue
    ax.plot([q[0] for q in r['pts']], [q[1] for q in r['pts']], color='#d8d8d8' if r['hw'] in ('footway', 'steps', 'path', 'cycleway') else '#c4c4c4', lw=max(0.6, r['width'] / 4), zorder=2, solid_capstyle='round')
for b in osm['buildings']:
    under = b['layer'] < 0
    ax.add_patch(MP(b['poly'], closed=True, fc='#f3d9d9' if under else '#e4e0d8', ec='#9a948a', lw=0.5, alpha=0.7, zorder=3))
    cx = sum(q[0] for q in b['poly']) / len(b['poly']); cz = sum(q[1] for q in b['poly']) / len(b['poly'])
    if b['name'] and xr[0] < cx < xr[1] and zr[0] < cz < zr[1]:
        ax.text(cx, cz, b['name'], fontsize=8, color='#6b665e', ha='center', va='center', zorder=4, clip_on=True)
for p in pts:
    if p['gx'] is not None: ax.plot(p['gx'], p['gz'], '.', color='#9a9a9a', ms=3, zorder=5)
for a, b in zip(stops, stops[1:]):
    ax.add_patch(FancyArrowPatch((a['x'], a['z']), (b['x'], b['z']), arrowstyle='-|>', mutation_scale=16, lw=2.2,
                                 color=COL(b['floor'] or ''), zorder=6, shrinkA=6, shrinkB=6))
for k, s in enumerate(stops):
    ax.plot(s['x'], s['z'], 'o', ms=13, mfc='white', mec=COL(s['floor'] or ''), mew=2, zorder=7)
    ax.text(s['x'], s['z'], str(k + 1), fontsize=7, ha='center', va='center', zorder=8, weight='bold')
    lab = ' '.join(x for x in [s['place'], s['floor']] if x) or f"#{s['ids'][0]}"
    ax.text(s['x'] + 4, s['z'] - 4, f"{lab}\n{s['t0']}" + (f"–{s['t1']}" if s['t1'] != s['t0'] else ''), fontsize=7, zorder=8,
            bbox=dict(boxstyle='round,pad=0.2', fc='white', ec='none', alpha=0.8))
ax.set_xlim(xr); ax.set_ylim(zr[1], zr[0]); ax.set_aspect('equal')
ax.set_title(f"사진 {len(man)}장 · {man[0]['t'][11:16]}–{man[-1]['t'][11:16]} · 정차점 {len(stops)}개 (위=북, 화살표=이동 순서; 파랑 지하 · 주황 1층 · 보라 2층 이상 · 초록 바깥)", fontsize=11)
ax.tick_params(labelsize=7)
fig.tight_layout(); fig.savefig(out, dpi=110); print(out, len(stops), 'stops')
