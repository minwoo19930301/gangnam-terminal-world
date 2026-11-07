"""The user's own walk photos -> private copies + a route manifest in world coordinates.

usage: python3 tools/photo_route.py <source dir> [--out refs/user_walk/<date>] [--glob 'IMG_*.HEIC']

Copies every photo as a 1600 px JPEG into the git-ignored refs/user_walk/<date>/ (never published) and writes
manifest.json there: one entry per photo, sorted by capture time, with
  t (ISO, local KST), lat, lon, alt (m), bearing (compass deg, 0 = north, 90 = east), speed (m/s),
  x, z (world metres: x east, z south, origin = 고속터미널역, from data/osm.json origin),
  yawDeg (world camera yaw: 0 = north, 90 = west, 180 = south, 270 = east), file, src.
Metadata comes from Spotlight (mdls). JPEG conversion uses pillow-heif (applies the HEIC rotation; sips does not):
  uv run -q --with pillow --with pillow-heif python tools/photo_route.py ~/Downloads   (--force re-converts)
"""
import json, os, subprocess, sys, glob, datetime, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
if not args: print(__doc__); sys.exit(1)
src = os.path.expanduser(args[0])
pat = args[args.index('--glob') + 1] if '--glob' in args else 'IMG_*.HEIC'
osm = json.load(open(os.path.join(ROOT, 'data/osm.json')))
O = osm['origin']
KEYS = ['kMDItemContentCreationDate', 'kMDItemLatitude', 'kMDItemLongitude', 'kMDItemAltitude', 'kMDItemImageDirection', 'kMDItemSpeed', 'kMDItemPixelWidth', 'kMDItemPixelHeight']

def meta(f):
    out = subprocess.run(['mdls'] + sum([['-name', k] for k in KEYS], []) + [f], capture_output=True, text=True).stdout
    m = {}
    for line in out.splitlines():
        k, _, v = line.partition('=')
        k, v = k.strip(), v.strip()
        if v in ('(null)', ''): continue
        m[k] = v.strip('"')
    return m

files = sorted(glob.glob(os.path.join(src, pat)))
rows = []
for f in files:
    m = meta(f)
    if 'kMDItemContentCreationDate' not in m: continue
    t = datetime.datetime.strptime(m['kMDItemContentCreationDate'][:19], '%Y-%m-%d %H:%M:%S').replace(tzinfo=datetime.timezone.utc)
    t = t.astimezone(datetime.timezone(datetime.timedelta(hours=9)))
    r = {'src': os.path.basename(f), 't': t.isoformat()}
    if 'kMDItemLatitude' in m:
        lat, lon = float(m['kMDItemLatitude']), float(m['kMDItemLongitude'])
        r.update(lat=lat, lon=lon, x=round((lon - O['lon']) * O['kx'], 1), z=round((O['lat'] - lat) * O['kz'], 1))
    if 'kMDItemAltitude' in m: r['alt'] = round(float(m['kMDItemAltitude']), 1)
    if 'kMDItemImageDirection' in m:
        b = float(m['kMDItemImageDirection']); r['bearing'] = round(b, 1); r['yawDeg'] = round((360 - b) % 360, 1)
    if 'kMDItemSpeed' in m: r['speed'] = round(float(m['kMDItemSpeed']), 2)
    rows.append(r)
rows.sort(key=lambda r: r['t'])
date = rows[0]['t'][:10].replace('-', '') if rows else 'unknown'
out = args[args.index('--out') + 1] if '--out' in args else os.path.join('refs/user_walk', date)
out = os.path.join(ROOT, out); os.makedirs(out, exist_ok=True)
for i, r in enumerate(rows):
    r['i'] = i
    r['file'] = os.path.relpath(os.path.join(out, os.path.splitext(r['src'])[0] + '.jpg'), ROOT)
    dst = os.path.join(ROOT, r['file'])
    if '--force' in args or not os.path.exists(dst):
        from PIL import Image, ImageOps
        import pillow_heif; pillow_heif.register_heif_opener()
        im = ImageOps.exif_transpose(Image.open(os.path.join(src, r['src']))).convert('RGB'); im.thumbnail((1600, 1600)); im.save(dst, quality=82)
json.dump({'note': "the user's own photos (private, never publish)", 'count': len(rows), 'photos': rows}, open(os.path.join(out, 'manifest.json'), 'w'), ensure_ascii=False, indent=1)
print(f'{len(rows)} photos -> {os.path.relpath(out, ROOT)} ({rows[0]["t"] if rows else "-"} .. {rows[-1]["t"] if rows else "-"})')
