"""Export the edited hood and derive its coarse outdoor silhouette from the same pane mesh."""
import bpy
import json
import runpy
from pathlib import Path

root=Path(bpy.data.filepath).resolve().parent
skin=next(o for o in bpy.data.collections["GangnamNorthGateCanopy"].objects if o.get("canopy_columns"))
cols,steps=skin["canopy_columns"],skin["canopy_steps"]
if len(skin.data.vertices)!=(steps+1)*cols:
    raise ValueError("The silhouette needs the authored glazing grid topology")
rows=list(range(0,steps+1,steps//4))
points=[]
for row in rows:
    for i in range(cols):
        x,y,z=skin.matrix_world @ skin.data.vertices[row*cols+i].co
        points.extend(round(coord*1000) for coord in (x,z,-y))
colors=[]
for row in rows[:-1]:
    for col in range(cols-1):
        face=skin.data.polygons[(row+1)*(cols-1)+col]
        rgb=skin.data.materials[face.material_index].diffuse_color
        channels=[round(255*(12.92*v if v<.0031308 else 1.055*v**(1/2.4)-.055)) for v in rgb[:3]]
        colors.append((channels[0]<<16)|(channels[1]<<8)|channels[2])
with (root/"silhouette.js").open("w") as out:
    out.write("// Generated from the edited exterior glazing mesh in north-gate.blend. Millimetres.\n")
    for name,value in [("columns",cols),("points",points),("colors",colors)]:
        out.write("export const "+name+" = "+json.dumps(value,separators=(',',':'))+";\n")
runpy.run_path(str(root.parent/"interior-architecture/export.py"),run_name="__main__")
