"""Recheck map nodes and terrain against the pinned Seoul tiles, Seoul F002 and OSM.
uv run --with numpy --with pillow --with shapely --with pyproj --with pyshp python tools/check_network_elevations.py
"""
import csv
import hashlib
import io
import json
import math
import subprocess
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

import numpy as np
import shapefile
from pyproj import CRS, Geod, Transformer
sys.dont_write_bytecode = True
from import_terrain import ROOT, REVISION, read_heights

SURVEY_HASH = "4fbe3c7e061b5974e7403ec116855304ed8ae321eebcc0d12c31ca8fb7be30bf"
SURVEY_URL = "https://datafile.seoul.go.kr/bigfile/iot/inf/nio_download.do?&useCache=false"
HIGHLIGHTS = [3146856929, 3146849231, 3146849197, 436864998, 1132502920, 11641428833, 436843824]
BBOX = [-200, -250, 530, 340]  # local east/south metres; central terminal and perimeter
geod = Geod(ellps="WGS84")
origin = json.loads((ROOT / "data/osm.json").read_text())["origin"]


def xy(lon, lat):
    return (lon-origin["lon"])*origin["kx"], (origin["lat"]-lat)*origin["kz"]


def sample_points(records):
    points = np.array([[r["x"],r["z"]] for r in records])
    raster = read_heights(points[:,0], points[:,1], origin)
    if not np.isfinite(raster).all():
        raise ValueError("At least one comparison point has no supported source height")
    js = """
        import fs from 'node:fs';
        import {surveyElevation,relief} from './js/banpo_relief.js';
        import {terminalSurveyHeight as datum} from './js/banpo_dem.js';
        const points = JSON.parse(fs.readFileSync(0,'utf8'));
        console.log(JSON.stringify(points.map(([x,z])=>[surveyElevation(x,z)+datum,relief(x,z)+datum])));
    """
    coarse_and_final = json.loads(subprocess.check_output(
        ["node","--input-type=module","-e",js],input=json.dumps(points.tolist()),text=True,cwd=ROOT))
    for r, source, (coarse, final) in zip(records, raster, coarse_and_final):
        r.update(tile=source, grid=coarse, final=final)


def summary(values):
    a = np.asarray(values)
    return {"n":len(a),"mae":float(abs(a).mean()),"rmse":float(np.sqrt(np.mean(a*a))),
            "max_abs":float(np.max(abs(a)))}


def map_controls():
    controls = list(csv.DictReader((ROOT/"docs/map-audit/network/controls.csv").open()))
    by_xy = {}
    for file in sorted((ROOT/"data/raw").glob("osm-*.json")):
        for n in json.loads(file.read_text())["elements"]:
            tags=n.get("tags",{})
            if n["type"]!="node":continue
            kind=tags.get("highway")
            if tags.get("railway")=="subway_entrance" or tags.get("entrance") and tags.get("ref"):
                kind="entrance"
            if kind not in ("traffic_signals","crossing","entrance"):continue
            x,z=xy(n["lon"],n["lat"])
            by_xy.setdefault((round(x,2),round(z,2),kind),set()).add(n["id"])
    for r in controls:
        r["x"],r["z"]=float(r["x"]),float(r["z"])
        ids=by_xy[r["x"],r["z"],r["type"]]
        if len(ids)!=1:raise ValueError(f"Ambiguous OSM node at {r}")
        r["id"]=next(iter(ids))
    api="https://api.openstreetmap.org/api/0.6/nodes.json?nodes="
    live={}
    for start in range(0,len(controls),50):
        ids=",".join(str(r["id"]) for r in controls[start:start+50])
        result=json.load(urlopen(Request(api+ids,headers={"User-Agent":"gangnam-terminal-world coordinate check"}),timeout=40))
        live.update({n["id"]:n for n in result["elements"]})
    for r in controls:
        n=live.get(r["id"])
        if n is None:
            r["horizontal_m"]=None
            continue
        lon=origin["lon"]+r["x"]/origin["kx"]
        lat=origin["lat"]-r["z"]/origin["kz"]
        r.update(osm_version=n["version"],horizontal_m=geod.inv(lon,lat,n["lon"],n["lat"])[2])
    return controls


def official_spots(zip_path):
    if not zip_path.exists():
        zip_path.parent.mkdir(parents=True,exist_ok=True)
        req=Request(SURVEY_URL,data=b"infId=OA-22241&seqNo=&seq=2&infSeq=1")
        with urlopen(req,timeout=120) as resp: payload=resp.read()
        if hashlib.sha256(payload).hexdigest()!=SURVEY_HASH:raise ValueError("Official ZIP revision changed")
        zip_path.write_bytes(payload)
    if hashlib.sha256(zip_path.read_bytes()).hexdigest()!=SURVEY_HASH:raise ValueError("Official ZIP hash mismatch")
    with ZipFile(zip_path) as files:
        def part(ext):
            name=next(k for k in files.namelist() if k.endswith(f"/N3P_F002.{ext}"))
            return io.BytesIO(files.read(name))
        crs=CRS.from_wkt(part("prj").getvalue().decode())
        assert crs.to_epsg()==5174
        project=Transformer.from_crs(crs,4326,always_xy=True)
        reader=shapefile.Reader(shp=part("shp"),dbf=part("dbf"),shx=part("shx"),encoding="cp949")
        result=[]
        for sr in reader.iterShapeRecords():
            lon,lat=project.transform(*sr.shape.points[0]);x,z=xy(lon,lat)
            if BBOX[0]<=x<=BBOX[2] and BBOX[1]<=z<=BBOX[3]:
                result.append(dict(x=x,z=z,lon=lon,lat=lat,id=sr.record.UFID,official=sr.record.HEIGHT))
    return result


def main():
    cache=Path.home()/".cache/gtw-seoul-survey/OA-22241-seq2.zip"
    spots=official_spots(Path(sys.argv[1]) if len(sys.argv)>1 else cache)
    controls=map_controls()
    sample_points(controls+spots)
    print("Tile revision",REVISION)
    for label, records, ref in [("control / tile",controls,"tile"),("F002 / official",spots,"official")]:
        for key in ("tile","grid","final"):
            if ref!=key:print(label,key,summary([r[key]-r[ref] for r in records]))
    live=[r for r in controls if r["horizontal_m"] is not None]
    print("horizontal / live OSM",summary([r["horizontal_m"] for r in live]),"missing",len(controls)-len(live))
    for n in HIGHLIGHTS:
        c=next(r for r in controls if r["id"]==n)
        nearest=min(spots,key=lambda r:math.hypot(r["x"]-c["x"],r["z"]-c["z"]))
        print("node",json.dumps(c,ensure_ascii=False))
        print("nearest spot in sample bbox",round(math.hypot(nearest["x"]-c["x"],nearest["z"]-c["z"]),2),json.dumps(nearest,ensure_ascii=False))
    for r in sorted(spots,key=lambda q:abs(q["final"]-q["official"]),reverse=True)[:4]:
        print("largest model / F002",json.dumps(r))
    for r in sorted(controls,key=lambda q:abs(q["grid"]-q["tile"]),reverse=True)[:2]:
        print("largest grid / tile",json.dumps(r,ensure_ascii=False))
    print("largest final / tile",json.dumps(max(controls,key=lambda q:abs(q["final"]-q["tile"])),ensure_ascii=False))
    for r in sorted(live,key=lambda q:q["horizontal_m"],reverse=True)[:2]:
        print("largest horizontal",json.dumps(r,ensure_ascii=False))

if __name__=="__main__":main()
