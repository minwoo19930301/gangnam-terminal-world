"""Build the offline exterior vegetation layer from public EO data and the project's OSM.

uv run --with rasterio --with scipy --with shapely --with numpy python tools/import_parcel_cover.py
To use locally cached GeoTIFFs (including georeferenced crops), pass --rasters DIR
containing canopy.tif, red.tif, nir.tif and scl.tif. See data/research/parcel-cover.md.
"""
import argparse
import json
import math
from pathlib import Path

import numpy as np
import rasterio
from affine import Affine
from rasterio.features import rasterize, shapes
from rasterio.warp import reproject, Resampling, transform_bounds
from rasterio.windows import from_bounds, Window
from scipy import ndimage
from shapely import get_parts, make_valid, set_precision, union_all
from shapely.geometry import LineString, Point, Polygon, shape
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parents[1]
SENTINEL = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/52/S/CG/2025/7/S2C_52SCG_20250710_0_L2A/'
URL = {
    'canopy': 'https://dataforgood-fb-data.s3.amazonaws.com/forests/v2/global/dinov3_global_chm_v2_ml3/chm/1321103201.tif',
    'red': SENTINEL + 'B04.tif', 'nir': SENTINEL + 'B08.tif', 'scl': SENTINEL + 'SCL.tif',
}
PARCEL = {'landuse:residential', 'amenity:school', 'landuse:commercial', 'place:square'}
# These precincts replaced older buildings after the canopy imagery epoch.
REBUILT = ('트리니원','원펜타스','원베일리','오티에르','메이플','반포르엘','센트럴자이','아스테리움','라클라스')
PIXEL = 2


def read_band(path, grid, dims, categorical=False):
    west, south, east, north = rasterio.transform.array_bounds(*dims, grid)
    with rasterio.open(path) as src:
        bounds = transform_bounds('EPSG:4326', src.crs, west, south, east, north)
        w = from_bounds(*bounds, src.transform)
        # Include interpolation neighbours, and read only the city window.
        w = Window(math.floor(w.col_off)-2, math.floor(w.row_off)-2, math.ceil(w.width)+5, math.ceil(w.height)+5)
        band = src.read(1, window=w, boundless=True, fill_value=0)
        dest = np.zeros(dims, dtype=np.float32)
        reproject(band, dest, src_transform=src.window_transform(w), src_crs=src.crs,
                  dst_transform=grid, dst_crs='EPSG:4326',
                  resampling=Resampling.nearest if categorical else Resampling.bilinear)
        return dest


def polygon(feature):
    return make_valid(Polygon(feature['poly'], feature.get('holes', [])))


def rings(p):
    return [[[round(x, 1), round(z, 1)] for x, z in list(r.coords)[:-1]]
            for r in (p.exterior, *p.interiors)]


def build(local_dir):
    osm = json.loads((ROOT / 'data/osm.json').read_text())
    west, top, east, bottom = osm['bbox']
    dims = (math.ceil((bottom-top)/PIXEL), math.ceil((east-west)/PIXEL))
    local = Affine(PIXEL, 0, west, 0, PIXEL, top)
    origin = osm['origin']
    # Geographic affine is exact for this project's east/south tangent grid.
    geo = Affine(PIXEL/origin['kx'], 0, origin['lon'] + west/origin['kx'],
                 0, -PIXEL/origin['kz'], origin['lat'] - top/origin['kz'])
    bands = {name: read_band(local_dir / (name+'.tif') if local_dir else path, geo, dims, name=='scl')
             for name, path in URL.items()}
    nir, red = bands['nir'], bands['red']
    # This Earth Search COG has already applied the BOA offset (STAC item).
    ndvi = (nir-red) / np.maximum(1, nir+red)
    clear = np.isin(bands['scl'], [4, 5])
    hard = [polygon(b).buffer(1.5) for b in osm['buildings'] if (b.get('layer') or 0)>=0]
    hard.extend(LineString(r['pts']).buffer(r['width']/2 + .6, cap_style=2)
                for r in osm['roads'] if len(r['pts'])>1 and not r['tunnel'] and not r['bridge']
                and not (r['level'] or '').startswith('-') and r['hw']!='corridor')
    hard.extend(polygon(a) for a in osm['areas'] if a['kind'] not in PARCEL
                and not a['kind'].startswith(('landuse:military','landuse:retail'))
                and not a.get('layer') and a.get('parking') not in ('underground','multi-storey'))
    hard = [p for p in hard if not p.is_empty]
    hard_tree = STRtree(hard)
    buildings_or_paths = rasterize(hard, out_shape=dims, transform=local, dtype='uint8')
    vegetation = clear & (ndvi >= .42) & (buildings_or_paths==0)
    # Intersect current vegetation with local maxima of older high-resolution
    # canopy estimates. Never infer trunks from red/NIR alone.
    h = ndimage.gaussian_filter(bands['canopy'], sigma=.8)
    peaks = (h >= 4.5) & (h == ndimage.maximum_filter(h, size=7)) & vegetation
    blocked_points = [Point(*p) for p in osm['trees']]
    mapped_trees = STRtree(blocked_points)
    output = {}
    for a in osm['areas']:
        if a['kind'] not in PARCEL:
            continue
        parcel = polygon(a)
        if parcel.area < 50:
            continue
        left, north, right, south = parcel.bounds
        c0, r0 = max(0, int((left-west)/PIXEL)), max(0, int((north-top)/PIXEL))
        c1 = min(dims[1], int((right-west)/PIXEL)+1)
        r1 = min(dims[0], int((south-top)/PIXEL)+1)
        if c1<=c0 or r1<=r0:
            continue
        grid = local * Affine.translation(c0,r0)
        mask = rasterize([parcel], out_shape=(r1-r0,c1-c0), transform=grid, dtype='uint8').astype(bool)
        crop = np.s_[r0:r1,c0:c1]
        green = vegetation[crop] & mask
        vegetation_polys = []
        for geom, value in shapes(green.astype('uint8'), mask=green, transform=grid):
            raw = shape(geom)
            if raw.area < 45:
                continue
            # Smooth 2m raster stair-stepping without letting grass spread onto
            # paths or buildings. Keep courtyards and interior exclusions.
            p = raw.simplify(1.4).buffer(-1.3,quad_segs=2).buffer(1,quad_segs=2).simplify(.9)
            if not p.is_empty:
                vegetation_polys.append(p)
        green_rings = []
        if vegetation_polys:
            blocked = union_all([hard[i] for i in hard_tree.query(parcel, predicate='intersects')])
            patches = union_all(vegetation_polys).intersection(parcel).difference(blocked)
            for p in get_parts(set_precision(patches.simplify(.25), .2)):
                if p.geom_type=='Polygon' and p.area>=40:
                    green_rings.append(rings(p))
        locations = []
        if not any(word in (a['name'] or '') for word in REBUILT):
            rr, cc = np.nonzero(peaks[crop] & mask)
            selected = set()
            for i in np.argsort(-h[rr+r0, cc+c0], kind='stable'):
                r,c = rr[i],cc[i]
                x,z = grid * (c+.5,r+.5)
                key = (math.floor(x/12), math.floor(z/12))
                if key in selected or len(mapped_trees.query(Point(x,z),predicate='dwithin',distance=5)):
                    continue
                height = round(float(h[r+r0,c+c0]))
                locations.append([round(x),round(z),height])
                selected.add(key)
        if green_rings or locations:
            output[a['id']] = {'green':green_rings, 'trees':locations}
    output_path = ROOT / 'js' / 'parcel_cover.js'
    with output_path.open('w') as f:
        f.write('// Generated by tools/import_parcel_cover.py. Source credits in data/research/parcel-cover.md.\n')
        f.write('export const parcelCover = {\n')
        for key, value in sorted(output.items()):
            f.write(f'  {key}: '+json.dumps(value,separators=(',',':'))+',\n')
        f.write('};\n')
    print(f'{len(output)} parcels; {sum(len(v["green"]) for v in output.values())} planting patches; '
          f'{sum(len(v["trees"]) for v in output.values())} canopy peaks; {output_path.stat().st_size} bytes')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rasters', type=Path)
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', GDAL_HTTP_TIMEOUT='30'):
        build(parser.parse_args().rasters)
