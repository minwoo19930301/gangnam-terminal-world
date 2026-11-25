"""Build the Chavit outer crown and diagonal ribs from the measured hull outline."""
import bpy
import json
import math
import runpy
from mathutils import Vector
from pathlib import Path

bpy.ops.wm.read_factory_settings(use_empty=True)
dest = Path(__file__).resolve().parent
osm = json.loads((dest.parents[2] / "data/osm.json").read_text())
foot = next(v["poly"] for v in osm["buildings"] if v["id"] == 320797228)
centre = (-790, -820)
outline = [Vector((x-centre[0], -(z-centre[1]))) for x,z in foot]
lengths = [(outline[(i+1)%len(outline)]-p).length for i,p in enumerate(outline)]
perimeter = sum(lengths)
def outline_at(t):
    remain = (t % 1) * perimeter
    for i, length in enumerate(lengths):
        if remain <= length:
            return outline[i].lerp(outline[(i+1)%len(outline)], remain/length)
        remain -= length
    return outline[0]

def skin(t, height):
    bow = 1.018 + .068*math.sin(math.pi*(height-1)/20)
    if height > 17: bow -= .13*((height-17)/4)**1.25
    v=outline_at(t)*bow
    return Vector((v.x,v.y,height))

class Mesh:
    def __init__(self,name,colour):
        self.name,self.colour=name,colour
        self.vertices,self.faces=[],[]
    def bar(self,a,b,r):
        tangent=(b-a).normalized()
        normal=tangent.cross(Vector((0,0,1)))
        if normal.length<.01: normal=tangent.cross(Vector((1,0,0)))
        normal.normalize()
        side=tangent.cross(normal)
        idx=len(self.vertices)
        for p in [a,b]:
            for j in range(4):
                angle=(j+.5)*math.pi/2
                self.vertices.append(p+r*(math.cos(angle)*normal+math.sin(angle)*side))
        for j in range(4):
            k=(j+1)%4
            self.faces.append((idx+j,idx+k,idx+4+k,idx+4+j))
    def finish(self):
        data=bpy.data.meshes.new(self.name)
        data.from_pydata(self.vertices,[],self.faces)
        obj=bpy.data.objects.new(self.name,data)
        bpy.context.collection.objects.link(obj)
        m=bpy.data.materials.new(self.name)
        m.diffuse_color=(*self.colour,1)
        data.materials.append(m)
        data.calc_loop_triangles()
        return {"p":[round(n,3) for v in self.vertices for n in (v.x,v.z,-v.y)],"i":[j for tri in data.loop_triangles for j in tri.vertices]}

ribs=Mesh("외피 교차 트러스",(.43,.48,.49))
rims=Mesh("은색 지붕 테두리",(.65,.69,.68))
# The eastern end and the northern return are open crisscross ribs in the operator's photo.
# The glazed entrance at the southern tip remains clear to head height.
lanes=32
for i in range(lanes):
    t=i/lanes
    east=.12<t<.64
    bottom=1.8 if east else 15.7
    top=19.1+1.9*(.5+.5*math.sin((t-.17)*math.tau*2))
    top_next=19.1+1.9*(.5+.5*math.sin((t+1/lanes-.17)*math.tau*2))
    rims.bar(skin(t,top),skin(t+1/lanes,top_next),.20)
    for j in range(3):
        lo=bottom+(top-bottom)*j/3
        hi=bottom+(top-bottom)*(j+1)/3
        ribs.bar(skin(t,lo),skin(t+1/lanes,hi),.115)
        ribs.bar(skin(t+1/lanes,lo),skin(t,hi),.115)
    if east:
        rims.bar(skin(t,2),skin(t+1/lanes,2),.13)
        # Curved roof purlins join the paired raised metal edges.
        a=skin(t,top);b=skin(t,19.05)
        b.x*=.68;b.y*=.68
        rims.bar(a,b,.12)

runtime={"ribs":ribs.finish(),"rims":rims.finish()}
# Restore the shared verified lightmap atlas without external packages.
runpy.run_path(str(dest/'chavit_uv.py'))['apply_saved_layout']()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(dest/"chavit-crown.blend"),compress=True)
(dest/"chavit-crown.js").write_text("// Chavit exterior profiles. Rebuild with build_chavit.py in Blender.\nexport const chavitCrown="+json.dumps(runtime,separators=(',',':'))+";\n")
