"""Overlay renderer for the map audit (PIL only). Reads docs/map-audit/.cache/{draw,analysis}.json and findings.json.
North is up (z increases downward), 1 px = 1/scale m, same frame for OSM, built outlines and aerial tiles.
Outputs docs/map-audit/*.png. Aerial crops use only tiles already cached in refs/tiles (nothing is downloaded)."""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs/map-audit'); CACHE = os.path.join(OUT, '.cache')
osm = json.load(open(os.path.join(ROOT, 'data/osm.json')))
draw = json.load(open(os.path.join(CACHE, 'draw.json')))
ana = json.load(open(os.path.join(CACHE, 'analysis.json')))
fnd = json.load(open(os.path.join(OUT, 'findings.json'))) if os.path.exists(os.path.join(OUT, 'findings.json')) else {'findings': []}
def font(n):
    for p in ('/System/Library/Fonts/AppleSDGothicNeo.ttc', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'):
        try: return ImageFont.truetype(p, n)
        except Exception: pass
    return ImageFont.load_default()
COL = {'gotomall': (200, 60, 30), 'gotomall_b1': (200, 60, 30), 'station': (0, 90, 200), 'station_B1': (0, 150, 255), 'station_B2': (0, 170, 120), 'station_B3': (170, 0, 170), 'station_B4': (230, 150, 0), 'shinsegae': (200, 0, 60), 'jwmarriott': (120, 40, 160), 'centralcity': (0, 140, 90),
       'famille': (200, 120, 0), 'gyeongbu': (0, 110, 200), 'banpo_shoppingtown': (150, 90, 20), 'hangang': (0, 150, 170), 'gyeongbu_east': (120, 60, 20), 'newcore': (60, 60, 60),
       'banwon': (230, 110, 0), 'jamwon_hangang': (40, 140, 40), 'lebon': (170, 130, 20), 'onebailey': (200, 0, 150), 'streets': (90, 90, 90)}
RC = {'primary': (240, 170, 60), 'trunk': (240, 170, 60), 'secondary': (245, 200, 110), 'tertiary': (200, 200, 200), 'residential': (205, 205, 205), 'service': (225, 225, 225), 'busway': (230, 120, 120)}
class View:
    def __init__(s, ext, scale, title=None):
        s.x0, s.z0, s.x1, s.z1 = ext; s.sc = scale; s.W = int((s.x1 - s.x0) * scale); s.H = int((s.z1 - s.z0) * scale)
        s.im = Image.new('RGB', (s.W, s.H), (252, 252, 250)); s.d = ImageDraw.Draw(s.im, 'RGBA'); s.f = font(max(11, int(scale * 3.2))); s.title = title
    def P(s, x, z): return ((x - s.x0) * s.sc, (z - s.z0) * s.sc)
    def vis(s, pts, m=20): return any(s.x0 - m < x < s.x1 + m and s.z0 - m < z < s.z1 + m for x, z in pts)
    def base(s, roads=True, osm_bld=True, rail=False):
        d = s.d
        for a in osm['areas']:
            c = {'natural:water': (170, 205, 240, 255), 'leisure:park': (214, 236, 200, 255), 'landuse:grass': (224, 240, 208, 255), 'amenity:parking': (232, 232, 232, 255)}.get(a['kind'])
            if c and s.vis(a['poly'], 0): d.polygon([s.P(*p) for p in a['poly']], fill=c)
        if roads:
            for r in osm['roads']:
                if r['tunnel'] or not s.vis(r['pts'], 0): continue
                col = RC.get(r['hw']); w = r['width'] if r['hw'] in RC else 1.5
                if col is None: col = (215, 160, 160) if r['hw'] in ('footway', 'steps', 'path', 'pedestrian', 'cycleway') else (200, 200, 200)
                d.line([s.P(*p) for p in r['pts']], fill=col + (255,), width=max(1, int(w * s.sc)), joint='curve')
        if osm_bld:
            for b in osm['buildings']:
                if not s.vis(b['poly'], 0): continue
                pts = [s.P(*p) for p in b['poly']]
                if b['layer'] < 0: d.polygon(pts, outline=(210, 120, 120, 255)); continue
                d.polygon(pts, fill=(170, 170, 170, 255), outline=(110, 110, 110, 255))
        if rail:
            for r in osm['rail']:
                if r['kind'] == 'subway' and s.vis(r['pts'], 0):
                    col = {'3호선': (240, 120, 30), '7호선': (110, 130, 0), '9호선': (170, 140, 90)}.get(r['name'], (120, 120, 255))
                    d.line([s.P(*p) for p in r['pts']], fill=col + (255,), width=max(2, int(1.2 * s.sc)))
    def built(s, mods=None, width=2):
        for k, segs in draw['outlines'].items():
            if mods and k not in mods: continue
            c = COL.get(k, (0, 0, 0)) + (255,)
            for a, b, c2, e in segs:
                if max(a, c2) < s.x0 - 5 or min(a, c2) > s.x1 + 5 or max(b, e) < s.z0 - 5 or min(b, e) > s.z1 + 5: continue
                s.d.line([s.P(a, b), s.P(c2, e)], fill=c, width=width)
    def grid(s, step=50):
        f = font(11)
        for gx in range(int(math.ceil(s.x0 / step) * step), int(s.x1), step):
            s.d.line([s.P(gx, s.z0), s.P(gx, s.z1)], fill=(0, 0, 0, 40)); s.d.text((s.P(gx, s.z0)[0] + 2, 2), f'x{gx}', fill=(60, 60, 60, 255), font=f)
        for gz in range(int(math.ceil(s.z0 / step) * step), int(s.z1), step):
            s.d.line([s.P(s.x0, gz), s.P(s.x1, gz)], fill=(0, 0, 0, 40)); s.d.text((2, s.P(s.x0, gz)[1] + 2), f'z{gz}', fill=(60, 60, 60, 255), font=f)
    def exits(s, vectors=True):
        for e in ana['exits']:
            if not (s.x0 < e['x'] < s.x1 and s.z0 < e['z'] < s.z1): continue
            x, y = s.P(e['x'], e['z']); h = e['nearestHead']
            if h and vectors and h['distM'] < 60:
                hx, hy = s.P(h['x'], h['z']); s.d.line([(x, y), (hx, hy)], fill=(220, 0, 0, 255), width=2); s.d.ellipse([hx - 3, hy - 3, hx + 3, hy + 3], fill=(30, 90, 220, 255))
            s.d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(255, 140, 0, 255), outline=(0, 0, 0, 255))
            lab = e['ref'] + (f" {h['distM']}m" if h and h['distM'] < 60 else ' (no head)')
            s.d.text((x + 7, y - 7), lab, fill=(150, 60, 0, 255), font=s.f)
    def junctions(s):
        for j in ana['junctions']:
            if j['widthM'] if 'widthM' in j else True:
                (ax, az), (bx, bz) = j['pa'], j['pb']
                if not (s.x0 < ax < s.x1 and s.z0 < az < s.z1): continue
                s.d.line([s.P(ax, az), s.P(bx, bz)], fill=(160, 0, 200, 255), width=3); s.d.text((s.P(ax, az)[0] + 4, s.P(ax, az)[1] + 2), j['id'], fill=(120, 0, 160, 255), font=font(12))
    def legend(s, items):
        f = font(14); y = 8; w = 10 + max(s.d.textlength(t, font=f) for t, _ in items) + 30
        s.d.rectangle([s.W - w - 8, 4, s.W - 8, 8 + 20 * len(items)], fill=(255, 255, 255, 230), outline=(80, 80, 80, 255))
        for t, c in items:
            s.d.rectangle([s.W - w, y + 2, s.W - w + 14, y + 14], fill=c + (255,)); s.d.text((s.W - w + 20, y), t, fill=(0, 0, 0, 255), font=f); y += 20
    def furniture(s, title):
        f = font(15); s.d.rectangle([0, s.H - 22, s.W, s.H], fill=(255, 255, 255, 220)); s.d.text((6, s.H - 20), f'{title}   north up, 1 px = {1/s.sc:.2f} m, x east / z south, origin = 고속터미널역', fill=(0, 0, 0, 255), font=f)
        sx, sy = s.W - 50, 40; s.d.polygon([(sx, sy - 30), (sx - 8, sy), (sx + 8, sy)], fill=(0, 0, 0, 255)); s.d.text((sx - 5, sy), 'N', fill=(0, 0, 0, 255), font=font(14))
        L = 50 if (s.x1 - s.x0) > 150 else 10; s.d.line([(12, s.H - 36), (12 + L * s.sc, s.H - 36)], fill=(0, 0, 0, 255), width=4); s.d.text((14, s.H - 56), f'{L} m', fill=(0, 0, 0, 255), font=font(13))
    def text(s, x, z, t, fill=(0, 0, 0, 255), size=None):
        s.d.text(s.P(x, z), t, fill=fill, font=size or s.f)
    def save(s, name): s.im.save(os.path.join(OUT, name), optimize=True); print('wrote', name, s.im.size)
LEG = [(k, COL[k]) for k in ('gotomall', 'station', 'shinsegae', 'jwmarriott', 'centralcity', 'famille', 'gyeongbu', 'banpo_shoppingtown', 'gyeongbu_east', 'newcore', 'banwon', 'lebon', 'onebailey')]
def overview(name, ext, scale, mods=None, title='', rail=False):
    v = View(ext, scale); v.base(rail=rail); v.grid(50 if (ext[2] - ext[0]) > 300 else 25); v.built(mods, 2); v.junctions(); v.exits()
    v.legend(LEG + [('OSM building (grey)', (170, 170, 170)), ('OSM underground (pink outline)', (210, 120, 120)), ('exit + error vector', (255, 140, 0)), ('junction pa-pb', (160, 0, 200))])
    v.furniture(title); v.save(name)
# ------------- aerial -------------
LAT0, LON0, KX, KZ = osm['origin']['lat'], osm['origin']['lon'], osm['origin']['kx'], osm['origin']['kz']
TILES = os.path.join(ROOT, 'refs/tiles'); Z = 19
def txy(lat, lon):
    n = 2 ** Z; return (lon + 180) / 360 * n * 256, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n * 256
_tc = {}
def tile(tx, ty):
    k = (tx, ty)
    if k in _tc: return _tc[k]
    f = os.path.join(TILES, f'{Z}_{tx}_{ty}.jpg'); _tc[k] = Image.open(f).convert('RGB') if os.path.exists(f) else None; return _tc[k]
def aerial(ext, res):
    x0, z0, x1, z1 = ext; W, H = int((x1 - x0) / res), int((z1 - z0) / res); im = Image.new('RGB', (W, H)); px = im.load()
    for j in range(H):
        z = z0 + (j + .5) * res
        for i in range(W):
            x = x0 + (i + .5) * res; X, Y = txy(LAT0 - z / KZ, LON0 + x / KX); t = tile(int(X // 256), int(Y // 256))
            if t is None: return None
            px[i, j] = t.getpixel((int(X) % 256, int(Y) % 256))
    return im
def crop(name, ext, title, mods, osm_ids=(), aerial_ok=True, mark=None):
    sc = min(6.0, 900 / max(ext[2] - ext[0], ext[3] - ext[1])); v = View(ext, sc); v.base(rail=any(m.startswith('station') for m in (mods or []))); v.grid(10 if (ext[2] - ext[0]) < 150 else 25); v.built(mods, 3); v.exits(); v.junctions()
    for h in draw['heads']:
        if ext[0] < h['x'] < ext[2] and ext[1] < h['z'] < ext[3]:
            x, y = v.P(h['x'], h['z']); v.d.rectangle([x - 4, y - 4, x + 4, y + 4], fill=(30, 90, 220, 255)); 
    if mark:
        x, y = v.P(*mark); v.d.line([x - 12, y, x + 12, y], fill=(255, 0, 255, 255), width=3); v.d.line([x, y - 12, x, y + 12], fill=(255, 0, 255, 255), width=3); v.d.text((x + 14, y + 4), 'finding', fill=(200, 0, 200, 255), font=v.f)
    v.furniture(title)
    for b in osm['buildings']:
        if b['id'] in osm_ids: v.d.polygon([v.P(*p) for p in b['poly']], outline=(0, 0, 0, 255))
    v.save(name)   # committed image: OSM + built overlay only, never aerial imagery
    ae = aerial(ext, 1 / sc) if aerial_ok else None   # aerial side-by-side stays LOCAL (docs/map-audit/_local, git-ignored)
    if ae is not None:
        ad = ImageDraw.Draw(ae, 'RGBA')
        for k, segs in draw['outlines'].items():
            if mods and k not in mods: continue
            for a, b, c2, e in segs: ad.line([((a - ext[0]) * sc, (b - ext[1]) * sc), ((c2 - ext[0]) * sc, (e - ext[1]) * sc)], fill=COL.get(k, (255, 0, 0)) + (255,), width=2)
        for b in osm['buildings']:
            if b['id'] in osm_ids: ad.polygon([((x - ext[0]) * sc, (z - ext[1]) * sc) for x, z in b['poly']], outline=(255, 255, 0, 255))
        both = Image.new('RGB', (v.W * 2 + 6, v.H), (255, 255, 255)); both.paste(v.im, (0, 0)); both.paste(ae.resize((v.W, v.H)), (v.W + 6, 0))
        ImageDraw.Draw(both).text((v.W + 14, 6), 'LOCAL ONLY - Esri aerial (z19 cache), yellow = OSM footprint, colour = built outline', fill=(255, 255, 0), font=font(14))
        os.makedirs(os.path.join(OUT, '_local'), exist_ok=True); both.save(os.path.join(OUT, '_local', name)); print('wrote _local/' + name)
if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else None
    if only in (None, 'overview'):
        overview('overview.png', (-440, -330, 560, 520), 2.4, title='Whole core: built outlines (colour) over OSM (grey)')
        overview('overview_core.png', (-160, -170, 160, 270), 5.0, title='Core: 신세계 · 센트럴시티 · JW · 고속터미널 · 고투몰', rail=False)
        overview('overview_gotomall_station.png', (-420, -300, 440, 40), 2.6, mods={'gotomall', 'gotomall_b1', 'station'}, title='B1 gotomall (outline) and station concourses')
        overview('overview_exits.png', (-230, -150, 100, 300), 4.0, mods={'station_B1', 'station_B2', 'station_B3', 'station_B4', 'gotomall_b1'}, title='Subway exits (station level outlines B1 blue / B2 green / B3 violet / B4 orange)  Subway exits (orange) with distance to nearest modelled stair head', rail=True)
        overview('overview_east.png', (60, -300, 460, 170), 2.4, mods={'gyeongbu', 'gyeongbu_east', 'gotomall_b1', 'banpo_shoppingtown', 'newcore', 'streets'}, title='East: 경부선 터미널 · 데블스도어 · 반포쇼핑타운')
        overview('overview_west.png', (-380, -310, -60, 80), 3.2, mods={'banpo_shoppingtown', 'lebon', 'onebailey', 'gotomall_b1', 'centralcity'}, title='West: 반포쇼핑타운 · 르본시티 · 원베일리 통로')
    if only in (None, 'findings'):
        nfp = 0
        for f in fnd['findings']:
            fp = f['category'] in ('footprint', 'built-outside-osm') and nfp < 10
            if fp: nfp += 1
            if f.get('crop') and (f['rank'] <= 10 or fp):
                crop(f"finding_{f['rank']:02d}_{f['category']}_{f['module']}.png", f['crop']['bbox'], f"#{f['rank']} {f['module']}: {f['title']}"[:110], set(f['crop'].get('mods', [f['module']])), f['crop'].get('osmIds', []), mark=(f['world']['x'], f['world']['z']) if f.get('world') and 'x' in f['world'] else None)
