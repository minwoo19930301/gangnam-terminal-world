"""Export one small indexed web mesh from the editable plate and its UVs."""
import base64
import struct
from pathlib import Path
import bpy

here=Path(__file__).resolve().parent
vertices={}
triangles=[]
for obj in bpy.data.collections['GangnamMainLiftDirectory'].objects:
    mesh=obj.data
    mesh.calc_loop_triangles()
    uv=mesh.uv_layers.active
    for tri in mesh.loop_triangles:
        for loop in tri.loops:
            co=obj.matrix_world@mesh.vertices[mesh.loops[loop].vertex_index].co
            u,v=uv.data[loop].uv
            key=tuple(round(x*10000) for x in (co.x,co.z,-co.y))+tuple(round(x*8192) for x in (u,v))
            triangles.append(vertices.setdefault(key,len(vertices)))
verts=b''.join(struct.pack('<5h',*v) for v in vertices)
indices=struct.pack('<'+'H'*len(triangles),*triangles)
def encode(data):
    return base64.b64encode(data).decode('ascii')
(here/'surface.js').write_text('// Generated from directory.blend by export.py.\n'+
    'export const vertices="'+encode(verts)+'";\nexport const indices="'+encode(indices)+'";\n')
print('directory surface:',len(vertices),'vertices,',len(triangles)//3,'triangles')
