"""Regenerate the outdoor grid from the Seoul contour/spot-height DEM.

    uv run --with numpy --with pillow --with shapely python tools/import_terrain.py

The pinned source is a TIN interpolation, not a surface survey of decks or ramps.
Source data: https://data.seoul.go.kr/dataList/OA-22241/F/1/datasetView.do
Only supported pixels from its separate validity mask are accepted. X/Z use the
same origin and scale as osm_process.py; Z increases south. Output heights are
relative to the terminal, in metres. The source vertical datum is unspecified.
"""
from __future__ import annotations

import base64
import json
import math
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.request import urlopen

import numpy as np
import shapely
from PIL import Image
from shapely.geometry import LineString, Polygon, box
from shapely.ops import polygonize

ROOT = Path(__file__).resolve().parents[1]
REVISION = "ede67d9f3909395d346ab67e492d63fd10142d08"
BASE = f"https://raw.githubusercontent.com/minwoo19930301/seoul-elevation-local/{REVISION}/public/data/terrain"
CACHE = Path.home() / ".cache/gtw-seoul-terrain" / REVISION
ZOOM = 14
SIZE = 256
STEP = 25
# Covers the clipped OSM world and the hand-modelled Jamwon bank extension.
XMIN, ZMIN, XMAX, ZMAX = -2000, -2900, 1550, 800
# The authored city/water code places the Han surface 1.4 m below its bank.
RIVER_DROP = 1.4


def tile_path(name):
    """Return a cached tile from the pinned source, fetching it on first use."""
    path = CACHE / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        with urlopen(f"{BASE}/{name}", timeout=25) as response:
            content = response.read()
        with NamedTemporaryFile(dir=path.parent, delete=False) as tmp:
            tmp.write(content)
        Path(tmp.name).replace(path)
    return path


def read_tile(key):
    tx, ty = key
    arrays = []
    for folder in ["", "mask/"]:
        path = tile_path(f"{folder}{ZOOM}/{tx}/{ty}.png")
        with Image.open(path) as image:
            if image.size != (SIZE, SIZE):
                raise ValueError(f"Unexpected tile size: {path}")
            arrays.append(np.array(image.convert("L" if folder else "RGB"), dtype="int32"))
    rgb, mask = arrays
    meters = (65536 * rgb[:,:,0] + 256 * rgb[:,:,1] + rgb[:,:,2]) * .1 - 10000
    return key, (meters, mask == 255)


def read_heights(x, z, origin):
    lat = np.radians(origin["lat"] - z / origin["kz"])
    lon = origin["lon"] + x / origin["kx"]
    size = SIZE * (2 ** ZOOM)
    # Pixel centres sit at index + 0.5, including across adjacent tile edges.
    u = (lon + 180) / 360 * size - .5
    v = (1 - np.arcsinh(np.tan(lat)) / math.pi) * .5 * size - .5
    left, top = np.floor(u).astype(int), np.floor(v).astype(int)
    keys = {(tx, ty) for tx in range(left.min()//SIZE, (left.max()+1)//SIZE+1)
                      for ty in range(top.min()//SIZE, (top.max()+1)//SIZE+1)}
    with ThreadPoolExecutor(max_workers=6) as pool:
        tiles = dict(pool.map(read_tile, sorted(keys)))
    height, weight = np.zeros(x.shape), np.zeros(x.shape)
    for dy in [0, 1]:
        for dx in [0, 1]:
            px, py = left + dx, top + dy
            w = (1 - abs(u - px)) * (1 - abs(v - py))
            for (tx, ty), (tile, valid) in tiles.items():
                sel = (px//SIZE == tx) & (py//SIZE == ty)
                ix, iy = px[sel] % SIZE, py[sel] % SIZE
                coeff = w[sel] * valid[iy, ix]
                height[sel] += tile[iy, ix] * coeff
                weight[sel] += coeff
    return np.divide(height, weight, out=np.full_like(height, np.nan), where=weight > 0)


def han_river(origin):
    # The unclipped outer bank includes the continuation beyond z=-2100.
    # Floats and the modelled islands already have their own offset from water.
    items = json.loads((ROOT / "data/raw/osm-river.json").read_text())["elements"]
    nodes = {e["id"]: ((e["lon"] - origin["lon"]) * origin["kx"],
                       (origin["lat"] - e["lat"]) * origin["kz"]) for e in items if e["type"] == "node"}
    ways = {e["id"]: e["nodes"] for e in items if e["type"] == "way"}
    relation = next(e for e in items if e["type"] == "relation" and e["id"] == 152336)
    lines = [LineString([nodes[n] for n in ways[m["ref"]]]) for m in relation["members"]
             if m["type"] == "way" and m["role"] == "outer"]
    rings = list(polygonize(lines))
    if len(rings) != 1:
        raise ValueError("Han River shoreline does not form one continuous ring")
    return rings[0]


def remove_banpo_deck_return(x, z, heights, origin):
    # The elevated bridge creates an isolated TIN ridge through the Moonlight
    # Plaza footpaths (~10 m above both adjacent banks). The city's drone
    # photo shows the open paved plaza: https://hangang.seoul.go.kr/www/contents/663.do?mid=463
    # Reconstruct just that crossing from the two flanking ground profiles.
    ax, az = -614, -710
    ux, uz = np.array([-80.02, -210.79]) / math.hypot(80.02, 210.79)
    nx, nz = -uz, ux
    along = (x-ax)*ux + (z-az)*uz
    across = (x-ax)*nx + (z-az)*nz
    flank = 65
    use = (along > -30) & (along < 95) & (abs(across) < flank)
    cx, cz = ax + along[use]*ux, az + along[use]*uz
    left = read_heights(cx-flank*nx, cz-flank*nz, origin)
    right = read_heights(cx+flank*nx, cz+flank*nz, origin)
    if not np.isfinite(left).all() or not np.isfinite(right).all():
        raise ValueError("Missing ground evidence on a Banpo bridge flank")
    t = (across[use] + flank) / (2*flank)
    ground = (1-t)*left + t*right
    edge = np.clip(np.minimum.reduce([(along[use]+30)/25, (95-along[use])/25,
                                      (flank-abs(across[use]))/15]), 0, 1)
    lower = np.maximum(0, heights[use] - ground)
    heights[use] -= lower * edge*edge*(3-2*edge)


def build():
    origin = json.loads((ROOT / "data/osm.json").read_text())["origin"]
    x, z = np.meshgrid(np.arange(XMIN, XMAX+1, STEP), np.arange(ZMIN, ZMAX+1, STEP))
    heights = read_heights(x, z, origin)
    datum = float(heights[-ZMIN//STEP, -XMIN//STEP])
    if not math.isfinite(datum):
        raise ValueError("No valid source elevation at the terminal")
    # Interior river DEM pixels interpolate across banks. Estimate one bank
    # datum from supported low shoreline samples, retaining the model's bank
    # to water offset; neither that offset nor the resulting level is a gauge.
    river = han_river(origin)
    # The park extends north of the clipped osm.json scene. Preserve both
    # endpoints on its z=-2100 seam, including the far riverbank.
    extension = river.intersection(box(-198.12, -2850, 1450, -2100)).simplify(.8)
    if extension.geom_type != "Polygon" or len(extension.interiors):
        raise ValueError("Unexpected topology of the Jamwon river extension")
    shoreline = [[round(px, 2), round(pz, 2)] for px, pz in list(extension.exterior.coords)[:-1]]
    # Start at the SE seam and trace the bank northwards. GEOS can emit the
    # same ring with a different starting vertex or winding.
    seam = [i for i, (_, pz) in enumerate(shoreline) if pz == -2100]
    start = max(seam, key=lambda i: shoreline[i][0])
    shoreline = shoreline[start:] + shoreline[:start]
    if shoreline[1][1] == -2100:
        shoreline = shoreline[:1] + shoreline[:0:-1]
    points = shapely.points(x, z)
    river_distance = shapely.distance(points, river)
    shore = (river_distance > 0) & (river_distance <= 2*STEP) & np.isfinite(heights)
    bank = round(float(np.percentile(heights[shore], 25)), 2)
    # Pad by a grid diagonal so every triangle touching the water is level,
    # including over its floating structures. Transition on the land side.
    # The photographed floating shop in the Jamwon extension has a small
    # modelled inlet absent from the OSM ring. Match its dock, water and
    # short mouth to the same datum, leaving the exported OSM shore intact.
    inlet = Polygon([(1255,-2605), (1394,-2605), (1394,-2573), (1245,-2573)])
    distance = np.minimum(river_distance, shapely.distance(points, inlet))
    pad = math.sqrt(2) * STEP
    t = np.clip((distance - pad) / (2*STEP), 0, 1)
    blend = t*t*(3-2*t)
    unsupported = ~np.isfinite(heights)
    if np.any(unsupported & (blend > 0)):
        raise ValueError("Unsupported land elevation; check the pinned source and validity mask")
    heights[unsupported] = bank  # Only the level Han River needs a stand-in.
    remove_banpo_deck_return(x, z, heights, origin)
    result = (1-blend) * bank + blend * heights - datum
    cm = np.rint(result*100)
    if cm.min() < -32768 or cm.max() > 32767:
        raise ValueError("Grid exceeds signed Int16 range")
    payload = base64.b64encode(cm.astype("<i2").tobytes()).decode("ascii")
    width, height = len(x[0]), len(x)
    banner = f"""// Generated by tools/import_terrain.py from Seoul contours/spot heights.
// seoul-elevation-local {REVISION}, z{ZOOM} RGB + validity mask.
// Local reference: {datum:.3f} m at the OSM terminal origin. The grid runs east then south.
// The Han bank is levelled at {bank:.2f} m (shoreline estimate). Model water is {RIVER_DROP} m below it.
export const terminalSurveyHeight = {datum:.3f};
export const x0 = {XMIN}, z0 = {ZMIN}, step = {STEP}, width = {width}, height = {height};
export const waterHeight = {bank - RIVER_DROP - datum:.2f};
export const jamwonRiverExtension = {json.dumps(shoreline, separators=(',', ':'))};
"""
    output = banner + f'const bytes = atob("{payload}");\n' + """export const samples = new Float32Array(width * height);
for (let i = 0; i < samples.length; i++) {
  const value = bytes.charCodeAt(2*i) | (bytes.charCodeAt(2*i+1) << 8);
  samples[i] = (value >= 32768 ? value - 65536 : value) / 100;
}
"""
    (ROOT / "js/banpo_dem.js").write_text(output)
    print(f"{width} × {height} samples at {STEP} m, terminal {datum:.3f} m, Han bank {bank:.2f} m."
          f" Masked terrain points: {unsupported.sum()}, outside the levelled Han strip: {(unsupported & (blend>0)).sum()}.")


if __name__ == "__main__":
    build()
