# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "numpy==2.5.5", "shapely==2.2.0", "pyproj==3.8.0",
#   "rasterio==1.5.2", "pillow==13.0.0",
# ]
# ///
"""Audit three Naver ruler readings against the live Banpo model and source DEM.

Install the project's Node dependencies with npm ci, then run from the repo root:
    uv run --python 3.12 tools/check_hangang_gis.py

The first run fetches missing source tiles into the terrain importer's cache.
The only output is a JSON report on stdout.
"""
import json
import math
import subprocess
import warnings
from functools import lru_cache

import numpy as np
import rasterio
import shapely
from pyproj import Geod, Transformer
from rasterio.errors import NotGeoreferencedWarning
from rasterio.transform import from_origin, rowcol
from shapely.geometry import LineString, Polygon

from import_terrain import BASE, ROOT, SIZE, ZOOM, tile_path

KOREA = Transformer.from_crs("EPSG:4326", "EPSG:5179", always_xy=True)
WEB = Transformer.from_crs("EPSG:5179", "EPSG:3857", always_xy=True)
GEOD = Geod(ellps="WGS84")
WORLD_EDGE = math.pi * 6378137
TILE_SPAN = 2 * WORLD_EDGE / 2**ZOOM
READING_TOLERANCE_M = 4


def ground_outline(ring, origin):
    """Undo the game's x-east, z-south linearization before projecting to metres."""
    x, z = np.asarray(ring).T
    lon = origin["lon"] + x / origin["kx"]
    lat = origin["lat"] - z / origin["kz"]
    polygon = Polygon(np.column_stack(KOREA.transform(lon, lat)))
    if not polygon.is_valid or polygon.is_empty or polygon.area <= 0:
        raise ValueError(f"Unusable outline: {shapely.is_valid_reason(polygon)}")
    return polygon


def coverage(before, after):
    overlap = before.intersection(after).area
    removed = before.difference(after).area
    added = after.difference(before).area
    np.testing.assert_allclose([overlap + removed, overlap + added], [before.area, after.area],
                               rtol=0, atol=0.001)
    return {k: round(v, 2) for k, v in [
        ("osm_clipped_m2", before.area), ("runtime_zone_m2", after.area),
        ("overlap_m2", overlap), ("osm_only_m2", removed), ("runtime_only_m2", added),
    ]}


def intersect_section(polygon, extended_line):
    cut = polygon.intersection(extended_line)
    if cut.is_empty or cut.geom_type != "LineString" or cut.length <= 0:
        raise ValueError(f"Expected one continuous crossing, found {cut.wkt}")
    return cut.length


@lru_cache(maxsize=8)
def terrain_tile(tx, ty):
    # The PNG itself has no geotransform. Its XYZ address supplies its EPSG:3857 bounds.
    key = f"{ZOOM}/{tx}/{ty}.png"
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", NotGeoreferencedWarning)
        with rasterio.open(tile_path(key)) as dem, rasterio.open(tile_path("mask/" + key)) as mask:
            if dem.shape != (SIZE, SIZE) or mask.shape != dem.shape or (dem.count, mask.count) != (3, 1):
                raise ValueError(f"Unexpected Terrain-RGB or validity mask layout in {key}")
            rgb = dem.read().astype(np.int32)
            valid = mask.read(1) == 255
    height = (65536 * rgb[0] + 256 * rgb[1] + rgb[2]) * 0.1 - 10000
    affine = from_origin(-WORLD_EDGE + tx * TILE_SPAN, WORLD_EDGE - ty * TILE_SPAN,
                         TILE_SPAN / SIZE, TILE_SPAN / SIZE)
    return height, valid, affine


def terrain_profile(start, end):
    points = np.linspace(start, end, 9)
    xs, ys = WEB.transform(points[:, 0], points[:, 1])
    values, keys = [], set()
    for x, y in zip(xs, ys):
        tx = math.floor((x + WORLD_EDGE) / TILE_SPAN)
        ty = math.floor((WORLD_EDGE - y) / TILE_SPAN)
        height, valid, affine = terrain_tile(tx, ty)
        row, col = rowcol(affine, x, y)
        if not 0 <= row < SIZE or not 0 <= col < SIZE:
            raise ValueError("Sample lies outside the addressed XYZ tile")
        keys.add(f"{ZOOM}/{tx}/{ty}")
        values.append(round(float(height[row, col]), 1) if valid[row, col] else None)
    return {"tile_xyz": sorted(keys), "valid_samples": sum(v is not None for v in values),
            "north_to_south_source_height_m": values}


def audit():
    osm = json.loads((ROOT / "data/osm.json").read_text())
    study = json.loads((ROOT / "data/research/hangang.json").read_text())["waterfront_review_20261126"]
    baseline = next(a for a in osm["areas"] if a["id"] == 418249072)
    if baseline.get("holes"):
        raise ValueError("The baseline now has interior rings; include these before comparing.")
    before = ground_outline(baseline["poly"], osm["origin"])
    output = subprocess.check_output(["node", "tools/export_hangang_outline.mjs"], cwd=ROOT, text=True)
    after = ground_outline(json.loads(output), osm["origin"])
    sections, errors = [], []
    for record in study["북단에서_남단_단면"]:
        latlon = record["양단_WGS84_위도경도"]
        (lat1, lon1), (lat2, lon2) = latlon
        geodesic = GEOD.inv(lon1, lat1, lon2, lat2)[2]
        a, b = np.array(KOREA.transform(lon1, lat1)), np.array(KOREA.transform(lon2, lat2))
        projected = np.linalg.norm(b - a)
        # Extend on BOTH sides: clipping just the ruler segment would hide oversized geometry.
        pad = 300 * (b - a) / projected
        line = LineString([a - pad, b + pad])
        old, new = intersect_section(before, line), intersect_section(after, line)
        naver = record["네이버_m"]
        errors.append([old - naver, new - naver])
        if abs(new - naver) > READING_TOLERANCE_M or abs(geodesic - naver) > READING_TOLERANCE_M:
            raise ValueError(f"{record['위치']}: exceeds the map-reading tolerance")
        sections.append({
            "site": record["위치"], "north_south_wgs84_lat_lon": latlon, "naver_ruler_m": naver,
            "wgs84_geodesic_m": round(geodesic, 2), "epsg5179_segment_m": round(projected, 2),
            "osm_crossing_m": round(old, 2), "runtime_crossing_m": round(new, 2),
            "runtime_minus_naver_m": round(new - naver, 2), "dem": terrain_profile(a, b),
        })
    if len(sections) != 3:
        raise ValueError("Expected the three documented Naver ruler readings")
    rmse = np.sqrt(np.mean(np.square(errors), axis=0))
    return {
        "reproduce": "uv run --python 3.12 tools/check_hangang_gis.py",
        "naver_aerial": study["지도"], "observed": study["날짜"],
        "method": "WGS84 측지선과 Korea 2000 / Unified CS(EPSG:5179) 직선. 게임 좌표를 경위도로 되돌린 뒤 같은 투영에서 각 폴리곤과 연장 단면을 교차했다.",
        "scope": "OSM way 418249072의 게임 범위 내 조각과 현재 공원 HUD 외곽. 세 단면은 네이버 영상으로 보정했던 동일 지점의 계산 검산이다. 지도 경계 판독 오차 ±4 m. 서울시 전체 공원 면적이나 현장 측량값과 별개다.",
        "outlines_valid": {"osm": before.is_valid, "runtime": after.is_valid},
        "area_epsg5179": coverage(before, after),
        "width_rmse_against_naver_m": {"osm": round(rmse[0], 2), "runtime": round(rmse[1], 2)},
        "terrain_tiles": BASE,
        "terrain_source": "https://data.seoul.go.kr/dataList/OA-22241/F/1/datasetView.do",
        "terrain_sampling": "서울시 등고선·표고점에서 보간한 z14 Terrain-RGB 원타일. 각 단면 양 끝을 포함해 8등분한 9개 위치의 픽셀을 읽고 유효성 마스크 255만 채택했다. 이 위도에서 픽셀 한 변은 약 7.6 m. 높이 기준면은 원자료에 명시되지 않았으며 물가선·다리 상판 높이 판별에 쓰지 않았다.",
        "sections": sections,
    }


if __name__ == "__main__":
    print(json.dumps(audit(), ensure_ascii=False, indent=2, allow_nan=False))
