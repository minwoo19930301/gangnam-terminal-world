"""Publish the evaluated geometry from the open staircase.blend."""
import json
from pathlib import Path
import bpy

here=Path(bpy.data.filepath).resolve().parent
result={}
graph=bpy.context.evaluated_depsgraph_get()
for obj in bpy.context.scene.objects:
    name=obj.get('stair_profile')
    if name not in ('step','rail'):continue
    evaluated=obj.evaluated_get(graph);mesh=evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        # Object placement separates the two profiles for editing. Bake object
        # rotation, scale and modifiers, while keeping that display offset local.
        linear=evaluated.matrix_world.to_3x3()
        normal_matrix=linear.inverted_safe().transposed()
        vertices=[[round(float(v),6) for v in linear @ vert.co] for vert in mesh.vertices]
        faces=[]
        for face in mesh.polygons:
            role=mesh.materials[face.material_index]['surface_role'];n=[round(float(v),6) for v in (normal_matrix @ face.normal).normalized()]
            pieces=[list(face.vertices)] if len(face.vertices)<=4 else [list(t.vertices) for t in mesh.loop_triangles if t.polygon_index==face.index]
            faces.extend([role,n,p] for p in pieces)
        dimensions={k:float(obj[k]) for k in obj.keys() if k not in ('stair_profile',) and isinstance(obj[k],(int,float))}
        result[name]={'dimensions':dimensions,'vertices':vertices,'faces':faces}
    finally:evaluated.to_mesh_clear()
if set(result)!={'step','rail'}:raise ValueError('Both step and rail profiles are required')
(here/'profiles.js').write_text('// Exported from staircase.blend. Units are metres.\nexport const profiles = '+json.dumps(result,sort_keys=True,separators=(',',':'))+';\n')
