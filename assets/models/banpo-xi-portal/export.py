"""Re-export the edited full model and a coarse silhouette of the same front shell."""
import bpy
import json
import runpy
from pathlib import Path

here = Path(bpy.data.filepath).resolve().parent
source = bpy.data.objects['01 · Bent front silver shell']
verts = source.data.vertices
# Four silhouette corners from every fourth ring of the front shell.
rows = []
for i in range(0, len(verts)//10, 4):
    row = []
    for j in (1,3,6,8):
        p = source.matrix_world @ verts[i*10+j].co
        row.append([round(p.x,3),round(p.z,3),round(-p.y,3)])
    rows.append(row)
(here/'profile.js').write_text('// Generated from the editable front shell.\nexport const rings = '+json.dumps(rows,separators=(',',':'))+';\n')
runpy.run_path(str(here.parent/'interior-architecture/export.py'),run_name='__main__')
