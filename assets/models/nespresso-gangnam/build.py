"""Build the public Nespresso machine and capsule display in local metres."""
from pathlib import Path
from math import cos, sin, pi
import bpy
import json

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("GangnamNespressoDisplay")
bpy.context.scene.collection.children.link(collection)

def surface(name, vertices, faces, color):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    mat = bpy.data.materials.get(color)
    if not mat:
        mat = bpy.data.materials.new(color)
        values = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
        mat.diffuse_color = (*[((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in values], 1)
    mesh.materials.append(mat)
    return obj

def box(name, x, d, z, w, depth, height, color):
    corners=[(x+a*w/2,d+b*depth/2,z+c*height) for c in (0,1) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return surface(name,corners,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],color)

def turned(name,x,d,z,rings,color,depth=1):
    n=20
    verts=[(x+r*cos(2*pi*i/n),d+depth*r*sin(2*pi*i/n),z+h) for h,r in rings for i in range(n)]
    faces=[tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    faces.extend((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n))
    return surface(name,verts,faces,color)

box("Graphite brand fascia",0,.25,2.59,5.94,.14,.76,"272625")
# SVG contours with their counters triangulated before Blender import.
logo=json.loads((here/"wordmark-mesh.json").read_text())
scale=3.1/551
surface("Official Nespresso 2021 wordmark",
        [((x-275.5)*scale,.16,2.97+(50.265-z)*scale) for x,z in logo["vertices"]],
        [tuple(reversed(face)) for face in logo["faces"]],"FFFFFA")
box("Capsule sleeve library",1.45,1.31,.16,2.48,.23,2.68,"392E27")
palette=["936941","B57638","C59858","8D383D","804867","38384B","516858","6E8682"]
for col,color in enumerate(palette):
    for row in range(12):
        box("Coffee sleeve",.44+col*.286,1.145,.36+row*.19,.25,.17,.15,color)
        box("Sleeve end label",.44+col*.286,1.054,.398+row*.19,.09,.006,.013,"DED3B2")
for i in range(4): box("Shelf edge",1.45,1.09,.26+i*.58,2.43,.27,.035,"B29B79")
box("Tasting counter",-1.34,.86,.02,2.85,.65,.91,"976E50")
box("Stone worktop",-1.34,.83,.93,2.95,.74,.065,"DECFB7")
for x,color in [(-2.27,"4B5145"),(-1.51,"BE674D")]:
    turned("Drip tray",x,.65,1,[(0,.141),(.035,.141)],"363635",1.25)
    turned("Machine rear",x,.84,1,[(0,.127),(.23,.127)],"343533",1.15)
    turned("Vertuo Pop rounded head",x,.79,1.23,[(0,.147),(.05,.153),(.11,.141),(.15,.113),(.165,.067)],color,1.30)
    turned("Coffee outlet",x,.65,1.20,[(0,.018),(.035,.025)],"292724")
    turned("Espresso cup",x,.65,1.035,[(0,.027),(.06,.038),(.069,.039)],"EEE3D1")
    turned("Crema",x,.65,1.104,[(0,.033),(.001,.033)],"A26F3D")
for i,color in enumerate(palette[:5]):
    turned("Vertuo dome sample",-.91+i*.105,.65,1,[(0,.045),(.006,.045),(.011,.04),(.03,.033),(.038,.021),(.04,.011)],color)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/"display.blend"),compress=True)
