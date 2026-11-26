# /// script
# dependencies = ["matplotlib>=3.9,<4", "numpy>=2,<3"]
# ///
"""Run with uv run tools/plot_terminal_survey.py; needs Node for the repository DEM."""
import json
import subprocess
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.tri as tri
import numpy as np
from matplotlib.collections import LineCollection, PolyCollection
from matplotlib.lines import Line2D
from matplotlib.ticker import FuncFormatter

ROOT = Path(__file__).resolve().parents[1]
osm = json.loads((ROOT / "data/osm.json").read_text())
out = ROOT / "docs/map-audit/network"
origin = osm["origin"]
xmin, xmax, zmin, zmax = -440, 560, -465, 340
source = """import {samples,x0,z0,width,height,step,terminalSurveyHeight} from './js/banpo_dem.js';
console.log(JSON.stringify({samples:Array.from(samples),x0,z0,width,height,step,terminalSurveyHeight}));"""
dem = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", source], cwd=ROOT))
grid = np.reshape(dem["samples"], (dem["height"], dem["width"])) + dem["terminalSurveyHeight"]
xs = dem["x0"] + np.arange(dem["width"]) * dem["step"]
zs = dem["z0"] + np.arange(dem["height"]) * dem["step"]
ix = np.where((xs >= xmin-25) & (xs <= xmax+25))[0]
iz = np.where((zs >= zmin-25) & (zs <= zmax+25))[0]
x, z = np.meshgrid(xs[ix], zs[iz])
values = grid[np.ix_(iz, ix)].ravel()
# Match the diagonal and linear interpolation in js/banpo_relief.js.
ids = np.arange(x.size).reshape(x.shape)
nw, ne, sw, se = [v.ravel() for v in [ids[:-1,:-1], ids[:-1,1:], ids[1:,:-1], ids[1:,1:]]]
surface = tri.Triangulation(x.ravel(), z.ravel(), np.vstack([np.column_stack([nw,ne,sw]),np.column_stack([ne,se,sw])]))

fig, ax = plt.subplots(figsize=(11, 9))
fig.subplots_adjust(left=.075, right=.975, bottom=.13, top=.88)
ax.set_aspect("equal")
ax.set_xlim(xmin,xmax)
ax.set_ylim(zmax,zmin)
ax.tricontourf(surface, values, levels=np.arange(0,65,2), cmap="YlGn", alpha=.24, extend="both")
buildings = [b["poly"] for b in osm["buildings"] if (b.get("layer") or 0) >= 0]
ax.add_collection(PolyCollection(buildings, facecolor="#e0dfd9", edgecolor="#b7b3ab", linewidth=.32, zorder=2))
roadlines = [r["pts"] for r in osm["roads"] if r["hw"] in ("primary","secondary","tertiary") and not r["tunnel"]]
ax.add_collection(LineCollection(roadlines, colors="#505e69", linewidths=.9, zorder=3))
contours = ax.tricontour(surface, values, levels=np.arange(2,64,2), colors="#97784e", linewidths=.72, zorder=4)
ax.clabel(contours, fmt="%d m", fontsize=7, inline_spacing=3)
signals = np.array([(n["x"],n["z"]) for n in osm["nodes"] if n["k"]=="traffic_signals" or n["crossing"]=="traffic_signals"])
ax.scatter(*signals.T, s=16, marker="s", c="#db543d", edgecolors="white", linewidths=.45, zorder=5)
for e in osm["exits"]:
    if not (xmin<e["x"]<xmax and zmin<e["z"]<zmax): continue
    ax.scatter(e["x"],e["z"],s=24,c="#1f4673",edgecolors="white",linewidths=.5,zorder=6)
    ax.annotate(e["ref"],(e["x"],e["z"]),xytext=(4,3),textcoords="offset points",color="#102e58",fontsize=8,zorder=7)
for bid,label in [(309352819,"Gyeongbu terminal"),(159117108,"Shinsegae"),(413372929,"NewCore"),(413280002,"Le Bon City")]:
    p = next(b["poly"] for b in osm["buildings"] if b["id"]==bid)
    ax.text(*np.mean(p,axis=0),label,ha="center",va="center",fontsize=8,zorder=8,bbox=dict(facecolor="white",alpha=.85,pad=1.8,edgecolor="none"))
ax.plot([-410,-310],[315,315],lw=2.5,color="#193346")
ax.text(-360,308,"100 m",ha="center",fontsize=8,color="#193346")
ax.xaxis.set_major_formatter(FuncFormatter(lambda a,_: f"{origin['lon'] + a/origin['kx']:.3f}° E"))
ax.yaxis.set_major_formatter(FuncFormatter(lambda a,_: f"{origin['lat'] - a/origin['kz']:.3f}° N"))
ax.tick_params(labelsize=8,colors="#54616c")
fig.text(.075,.955,"Seoul Express Bus Terminal",fontsize=23,fontweight="bold",color="#192e42")
fig.text(.075,.916,"Ground elevation and street controls   /   2 m contours from the 25 m grid",fontsize=12,color="#485a68")
fig.legend(handles=[Line2D([],[],color="#97784e",label="Ground contour"),Line2D([],[],color="#505e69",label="Main road"),Line2D([],[],linestyle="none",marker="s",color="#db543d",label="Mapped signal / signalised crossing"),Line2D([],[],linestyle="none",marker="o",color="#1f4673",label="Subway entrance")],loc="lower center",bbox_to_anchor=(.5,.046),ncols=4,frameon=False,fontsize=9)
fig.text(.075,.029,"OSM contributors (ODbL) · Seoul contour / spot-height DEM · Ground surface only. Signal symbols represent map nodes.",fontsize=8,color="#54616c")
fig.savefig(out / "contours.png",dpi=145,facecolor="#ffffff")
