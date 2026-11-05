"""OSM raw (Overpass JSON) -> data/osm.json (local meters).

Coordinate system used by the whole project:
  x = east (+), z = south (+)  (so north is -z, like three.js looking down -z)
  1 unit = 1 m, origin = 고속터미널역 (Overpass station node).
Run:  uv run --with shapely python tools/osm_process.py
"""
import json, math, os
from shapely.geometry import Polygon, LineString, box, MultiPolygon
from shapely.ops import unary_union, polygonize, linemerge

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAT0, LON0 = 37.504905, 127.004958  # refined below from station node if present
KX = 111320 * math.cos(math.radians(37.5049))
KZ = 110540
BBOX = (-1900, -2100, 1000, 700)  # x0,z0,x1,z1 in meters

def load(p):
    return json.load(open(os.path.join(ROOT, p)))['elements']

els = load('data/raw/osm-core.json') + load('data/raw/osm-extra.json') + load('data/raw/osm-river.json')
nodes, ways, rels = {}, {}, {}
for e in els:
    t = e['type']
    if t == 'node':
        if e['id'] in nodes and 'tags' in nodes[e['id']] and 'tags' not in e:
            continue
        nodes[e['id']] = e
    elif t == 'way':
        if e['id'] in ways and 'tags' in ways[e['id']] and 'tags' not in e:
            continue
        ways[e['id']] = e
    else:
        if e['id'] in rels and 'tags' in rels[e['id']] and 'tags' not in e:
            continue
        rels[e['id']] = e

for n in nodes.values():
    tg = n.get('tags', {})
    if tg.get('railway') == 'station' and tg.get('name') == '고속터미널':
        LAT0, LON0 = n['lat'], n['lon']
        break

def P(lat, lon):
    return (round((lon - LON0) * KX, 2), round(-(lat - LAT0) * KZ, 2))

def wpts(w):
    return [P(nodes[i]['lat'], nodes[i]['lon']) for i in w['nodes'] if i in nodes]

def num(v, d=None):
    if v is None:
        return d
    try:
        return float(str(v).replace('m', '').split(';')[0].strip())
    except Exception:
        return d

clip = box(*BBOX)

def ring_out(poly):
    poly = poly.buffer(0)
    out = []
    geoms = poly.geoms if isinstance(poly, MultiPolygon) else [poly]
    for g in geoms:
        if g.is_empty or g.area < 1:
            continue
        g = g.simplify(0.15)
        ext = [[round(x, 2), round(z, 2)] for x, z in list(g.exterior.coords)[:-1]]
        holes = [[[round(x, 2), round(z, 2)] for x, z in list(h.coords)[:-1]] for h in g.interiors]
        out.append((ext, holes))
    return out

def rel_polys(r):
    outers, inners = [], []
    for m in r.get('members', []):
        if m['type'] != 'way' or m['ref'] not in ways:
            continue
        pts = wpts(ways[m['ref']])
        if len(pts) < 2:
            continue
        (inners if m.get('role') == 'inner' else outers).append(LineString(pts))
    def build(lines):
        if not lines:
            return None
        u = unary_union(lines)
        try:
            merged = linemerge(u) if u.geom_type == 'MultiLineString' else u
        except Exception:
            merged = u
        polys = list(polygonize(merged))
        return unary_union(polys) if polys else None
    o = build(outers)
    if o is None:
        return None
    i = build(inners)
    if i is not None:
        o = o.difference(i)
    return o

LEVEL_H = {'apartments': 2.9, 'residential': 2.9, 'hotel': 4.2, 'commercial': 4.2, 'retail': 4.5,
           'school': 3.6, 'hospital': 4.0, 'church': 5.0}

out = {'origin': {'lat': LAT0, 'lon': LON0, 'kx': KX, 'kz': KZ}, 'bbox': BBOX,
       'buildings': [], 'parts': [], 'roads': [], 'areas': [], 'rail': [], 'barriers': [],
       'pois': [], 'exits': [], 'trees': [], 'nodes': []}

def add_building(eid, tags, poly, kind='buildings'):
    poly = poly.intersection(clip) if poly is not None else None
    if poly is None or poly.is_empty:
        return
    lv = num(tags.get('building:levels'))
    h = num(tags.get('height'))
    mh = num(tags.get('min_height'), 0)
    mlv = num(tags.get('building:min_level'), 0)
    btype = tags.get('building') or tags.get('building:part') or 'yes'
    lh = LEVEL_H.get(btype, 3.4)
    if h is None:
        h = lv * lh if lv else (9 if btype in ('yes', 'commercial', 'retail') else 6)
    for ext, holes in ring_out(poly):
        out[kind].append({'id': eid, 'name': tags.get('name'), 'type': btype,
                          'levels': lv, 'ug': num(tags.get('building:levels:underground')),
                          'height': round(h, 1), 'minHeight': mh or (mlv * lh if mlv else 0),
                          'layer': num(tags.get('layer'), 0), 'poly': ext, 'holes': holes,
                          'tags': {k: v for k, v in tags.items() if k in (
                              'amenity', 'shop', 'tourism', 'building:colour', 'roof:shape',
                              'roof:colour', 'building:material', 'addr:housenumber', 'brand')}})

HW_W = {'motorway': 22, 'trunk': 22, 'trunk_link': 7, 'primary': 20, 'primary_link': 7,
        'secondary': 14, 'secondary_link': 6, 'tertiary': 10, 'tertiary_link': 5,
        'residential': 7, 'unclassified': 7, 'service': 5, 'living_street': 5,
        'pedestrian': 6, 'footway': 2.5, 'path': 2, 'cycleway': 2.5, 'steps': 2.5,
        'corridor': 3, 'track': 3, 'construction': 6}

for w in ways.values():
    tg = w.get('tags')
    if not tg:
        continue
    pts = wpts(w)
    if len(pts) < 2:
        continue
    closed = w['nodes'][0] == w['nodes'][-1] and len(pts) >= 4
    if 'building' in tg and closed:
        add_building(w['id'], tg, Polygon(pts))
    elif 'building:part' in tg and closed:
        add_building(w['id'], tg, Polygon(pts), 'parts')
    elif 'highway' in tg and not (tg.get('area') == 'yes' and closed):
        hw = tg['highway']
        if hw in ('proposed', 'platform', 'elevator', 'bus_stop'):
            continue
        ls = LineString(pts).intersection(clip)
        if ls.is_empty:
            continue
        lanes = num(tg.get('lanes'))
        width = num(tg.get('width')) or ((lanes * 3.3 + 1) if lanes else HW_W.get(hw, 6))
        segs = [ls] if ls.geom_type == 'LineString' else [g for g in getattr(ls, 'geoms', []) if g.geom_type == 'LineString']
        for g in segs:
            out['roads'].append({'id': w['id'], 'name': tg.get('name'), 'hw': hw,
                                 'lanes': lanes, 'width': round(width, 1),
                                 'oneway': tg.get('oneway') == 'yes',
                                 'layer': num(tg.get('layer'), 0),
                                 'bridge': tg.get('bridge') not in (None, 'no'),
                                 'tunnel': tg.get('tunnel') not in (None, 'no'),
                                 'covered': tg.get('covered') == 'yes',
                                 'footway': tg.get('footway'), 'surface': tg.get('surface'),
                                 'level': tg.get('level'),
                                 'pts': [[round(x, 2), round(z, 2)] for x, z in g.coords]})
    elif 'railway' in tg:
        ls = LineString(pts).intersection(clip)
        if ls.is_empty or ls.geom_type != 'LineString':
            continue
        out['rail'].append({'id': w['id'], 'kind': tg['railway'], 'name': tg.get('name'),
                            'tunnel': tg.get('tunnel') not in (None, 'no'), 'layer': num(tg.get('layer'), 0),
                            'pts': [[round(x, 2), round(z, 2)] for x, z in ls.coords]})
    elif 'barrier' in tg and not closed:
        out['barriers'].append({'id': w['id'], 'kind': tg['barrier'], 'pts': [[round(x, 2), round(z, 2)] for x, z in pts]})
    elif closed and any(k in tg for k in ('landuse', 'leisure', 'natural', 'amenity', 'man_made', 'area:highway', 'place', 'tourism', 'highway', 'bridge')):
        kind = (('landuse:' + tg['landuse']) if 'landuse' in tg else ('leisure:' + tg['leisure']) if 'leisure' in tg else
                ('natural:' + tg['natural']) if 'natural' in tg else ('amenity:' + tg['amenity']) if 'amenity' in tg else
                ('man_made:' + tg['man_made']) if 'man_made' in tg else ('area:highway:' + tg['area:highway']) if 'area:highway' in tg else
                ('place:' + tg['place']) if 'place' in tg else ('tourism:' + tg['tourism']) if 'tourism' in tg else
                ('highway:' + tg['highway']) if 'highway' in tg else 'bridge')
        poly = Polygon(pts).intersection(clip)
        for ext, holes in ring_out(poly):
            out['areas'].append({'id': w['id'], 'kind': kind, 'name': tg.get('name'),
                                 'parking': tg.get('parking'), 'layer': num(tg.get('layer'), 0),
                                 'poly': ext, 'holes': holes})

for r in rels.values():
    tg = r.get('tags')
    if not tg:
        continue
    poly = rel_polys(r)
    if poly is None:
        continue
    if 'building' in tg:
        add_building(r['id'], tg, poly)
    elif tg.get('natural') == 'water' or tg.get('waterway') == 'riverbank' or 'leisure' in tg or 'landuse' in tg:
        kind = 'natural:water' if tg.get('natural') == 'water' else ('leisure:' + tg['leisure']) if 'leisure' in tg else ('landuse:' + tg['landuse'])
        for ext, holes in ring_out(poly.intersection(clip)):
            out['areas'].append({'id': r['id'], 'kind': kind, 'name': tg.get('name'), 'poly': ext, 'holes': holes, 'layer': 0})

for n in nodes.values():
    tg = n.get('tags')
    if not tg:
        continue
    x, z = P(n['lat'], n['lon'])
    if not (BBOX[0] <= x <= BBOX[2] and BBOX[1] <= z <= BBOX[3]):
        continue
    if tg.get('railway') == 'subway_entrance' or (tg.get('entrance') and tg.get('ref')):
        out['exits'].append({'id': n['id'], 'x': x, 'z': z, 'ref': tg.get('ref'), 'name': tg.get('name'),
                             'kind': tg.get('railway') or 'entrance:' + tg.get('entrance', '')})
    elif tg.get('natural') == 'tree':
        out['trees'].append([x, z])
    elif tg.get('highway') in ('crossing', 'traffic_signals', 'bus_stop', 'street_lamp'):
        out['nodes'].append({'k': tg['highway'], 'x': x, 'z': z, 'name': tg.get('name'),
                             'crossing': tg.get('crossing')})
    elif 'name' in tg:
        out['pois'].append({'id': n['id'], 'x': x, 'z': z, 'name': tg['name'],
                            'kind': tg.get('shop') or tg.get('amenity') or tg.get('tourism') or tg.get('leisure') or tg.get('railway') or tg.get('public_transport') or tg.get('highway') or tg.get('place') or '',
                            'level': tg.get('level'), 'ref': tg.get('ref')})

# de-dup pois by (name, rounded pos)
seen = set(); ded = []
for p in out['pois']:
    k = (p['name'], round(p['x']), round(p['z']))
    if k in seen:
        continue
    seen.add(k); ded.append(p)
out['pois'] = ded
os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'data/osm.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print({k: len(v) for k, v in out.items() if isinstance(v, list)}, 'origin', LAT0, LON0)
