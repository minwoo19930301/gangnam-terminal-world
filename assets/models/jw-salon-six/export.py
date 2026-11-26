"""Rebuild the streamed surface and fitted collision rectangles from the edited native."""
import json
import runpy
from pathlib import Path
import bpy

here=Path(bpy.data.filepath).resolve().parent
tables=[]
for name in ('Left','Right','Return'):
    obj=bpy.data.objects['Black linen · '+name]
    p=[obj.matrix_world @ v.co for v in obj.data.vertices]
    x=[v.x for v in p]
    z=[-v.y for v in p]
    # The three linen runs are aligned with the existing room axes. Keep the
    # full artist-edited surface, including its hem, inside the physical table.
    tables.append([round(v,3) for v in ((min(x)+max(x))/2,(min(z)+max(z))/2,
                                        max(x)-min(x),max(z)-min(z),max(v.z for v in p))])
(here/'table-layout.js').write_text('// Generated from the three linen runs in salon-six.blend.\n'+
    'export const tableRuns = '+json.dumps(tables,separators=(',',':'))+';\n')
runpy.run_path(str(here.parent/'interior-architecture/export.py'),run_name='__main__')
