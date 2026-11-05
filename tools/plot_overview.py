"""Render docs/overview*.png from data/osm.json (agents use these to orient)."""
import json, sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MP
plt.rcParams['font.family'] = 'AppleGothic'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'data/osm.json')))
def render(fn, xr, zr, label_all=False, size=16):
    fig, ax = plt.subplots(figsize=(size, size * (zr[1]-zr[0]) / (xr[1]-xr[0])))
    for a in d['areas']:
        c = {'natural:water': '#9cc9f0', 'leisure:park': '#c8e6b0', 'landuse:grass': '#d4ecbc', 'amenity:parking': '#dddddd',
             'leisure:pitch': '#b6dca0', 'place:islet': '#e8d8a8', 'man_made:bridge': '#bbbbbb', 'man_made:pier': '#c0a080'}.get(a['kind'])
        if c: ax.add_patch(MP(a['poly'], closed=True, fc=c, ec='none', zorder=1))
    for r in d['roads']:
        xs = [p[0] for p in r['pts']]; zs = [p[1] for p in r['pts']]
        col = '#f2a33a' if r['hw'] in ('primary', 'trunk') else '#888' if r['hw'] not in ('footway', 'cycleway', 'steps', 'path') else '#c55'
        if r['tunnel']: col = '#7a7aff'
        ax.plot(xs, zs, color=col, lw=max(0.5, r['width'] / 6), zorder=2, alpha=0.8, ls='--' if r['tunnel'] else '-')
    for b in d['buildings']:
        fc = '#e88' if b['layer'] < 0 else '#b9b2a6'
        ax.add_patch(MP(b['poly'], closed=True, fc=fc, ec='#555', lw=0.5, alpha=0.6 if b['layer'] < 0 else 0.9, zorder=3))
        xs = [p[0] for p in b['poly']]; zs = [p[1] for p in b['poly']]
        cx, cz = sum(xs) / len(xs), sum(zs) / len(zs)
        if xr[0] < cx < xr[1] and zr[0] < cz < zr[1] and (b['name'] or label_all):
            ax.text(cx, cz, f"{b['name'] or ''}\n#{b['id']} L{b['levels'] or '?'} H{b['height']}", fontsize=6, ha='center', zorder=6, clip_on=True)
    for e in d['exits']:
        ax.plot(e['x'], e['z'], 'o', color='#e46f1d', zorder=7, clip_on=True); ax.text(e['x'] + 3, e['z'], e['ref'], fontsize=8, color='#c40', zorder=7, clip_on=True)
    named = {}
    for r in d['roads']:
        if r['name'] and r['hw'] in ('primary', 'secondary', 'trunk', 'tertiary') and r['name'] not in named:
            p = r['pts'][len(r['pts']) // 2]
            if xr[0] < p[0] < xr[1] and zr[0] < p[1] < zr[1]:
                named[r['name']] = 1; ax.text(p[0], p[1], r['name'], fontsize=9, color='#a50', weight='bold', zorder=8)
    ax.set_xlim(*xr); ax.set_ylim(zr[1], zr[0]); ax.set_aspect('equal'); ax.grid(True, lw=0.3)
    ax.set_title(f'x=east, z=south (north=up), meters, origin=고속터미널역  {fn}')
    fig.savefig(os.path.join(ROOT, 'docs', fn), dpi=110, bbox_inches='tight'); plt.close(fig)
render('overview.png', (-1900, 1000), (-2100, 700))
render('overview-core.png', (-350, 400), (-330, 330), label_all=True, size=18)
render('overview-park.png', (-1300, 100), (-1800, -450), label_all=False)
