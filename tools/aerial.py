"""Reference aerial mosaic (Esri World Imagery tiles) in the world's local coordinates.

Output (git-ignored, reference only): refs/aerial/<name>.jpg  — north up, 1 px = RES m, with a 10 m grid,
50 m labelled lines and OSM footprints of claimed buildings outlined.  Use it to check roofs, parking
layouts, bus bays, canopies and colours against the model.

usage: uv run -q --with pillow python tools/aerial.py name x0 z0 x1 z1 [res=0.25]
"""
import json, math, os, sys, io, urllib.request
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
osm = json.load(open(os.path.join(ROOT, 'data/osm.json')))
O = osm['origin']; LAT0, LON0, KX, KZ = O['lat'], O['lon'], O['kx'], O['kz']
name, x0, z0, x1, z1 = sys.argv[1], *map(float, sys.argv[2:6]); RES = float(sys.argv[6]) if len(sys.argv) > 6 else 0.25
Z = 19
def ll(x, z): return LAT0 - z / KZ, LON0 + x / KX
def txy(lat, lon):
    n = 2 ** Z; return (lon + 180) / 360 * n * 256, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n * 256
cache = os.path.join(ROOT, 'refs/tiles'); os.makedirs(cache, exist_ok=True)
tiles = {}
def tile(tx, ty):
    if (tx, ty) in tiles: return tiles[(tx, ty)]
    f = os.path.join(cache, f'{Z}_{tx}_{ty}.jpg')
    if not os.path.exists(f):
        req = urllib.request.Request(f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{Z}/{ty}/{tx}', headers={'User-Agent': 'gangnam-terminal-world-ref'})
        open(f, 'wb').write(urllib.request.urlopen(req, timeout=30).read())
    im = Image.open(f).convert('RGB'); tiles[(tx, ty)] = im; return im
W, H = int((x1 - x0) / RES), int((z1 - z0) / RES)
out = Image.new('RGB', (W, H))
src = out.load()
# sample: for each output pixel find the source pixel (nearest) — local plane is ~conformal at this scale
for j in range(H):
    z = z0 + (j + 0.5) * RES
    for i in range(W):
        x = x0 + (i + 0.5) * RES
        px, py = txy(*ll(x, z)); tx, ty = int(px // 256), int(py // 256)
        src[i, j] = tile(tx, ty).getpixel((int(px) % 256, int(py) % 256))
d = ImageDraw.Draw(out, 'RGBA')
try: font = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 14)
except Exception: font = ImageFont.load_default()
P = lambda x, z: ((x - x0) / RES, (z - z0) / RES)
for gx in range(int(math.ceil(x0 / 10) * 10), int(x1), 10):
    major = gx % 50 == 0; d.line([P(gx, z0), P(gx, z1)], fill=(255, 255, 0, 110 if major else 40), width=1)
    if major: d.text((P(gx, z0)[0] + 2, 2), f'x{gx}', fill=(255, 255, 0, 255), font=font)
for gz in range(int(math.ceil(z0 / 10) * 10), int(z1), 10):
    major = gz % 50 == 0; d.line([P(x0, gz), P(x1, gz)], fill=(255, 255, 0, 110 if major else 40), width=1)
    if major: d.text((2, P(x0, gz)[1] + 2), f'z{gz}', fill=(255, 255, 0, 255), font=font)
for b in osm['buildings']:
    pts = [P(x, z) for x, z in b['poly']]
    if any(x0 - 50 < x < x1 + 50 and z0 - 50 < z < z1 + 50 for x, z in b['poly']):
        d.line(pts + [pts[0]], fill=(0, 255, 255, 150), width=1)
os.makedirs(os.path.join(ROOT, 'refs/aerial'), exist_ok=True)
fn = os.path.join(ROOT, f'refs/aerial/{name}.jpg'); out.save(fn, quality=88)
print(fn, W, H, 'tiles', len(tiles))
