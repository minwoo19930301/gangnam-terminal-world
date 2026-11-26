"""Export the solid shop and transparent case panes in a single close-up file."""
from pathlib import Path
import bpy
import runpy
import sys
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

lit=runpy.run_path(str(here/'lighting.py'))['bake'](bpy.data.collections['BiscuiterieMO'],
                                            bpy.data.collections['MO glazing'],bpy.context.scene)
bake_collection(bpy.data.collections['BiscuiterieMO'], 'BiscuiterieBody', here/'biscuiterie.glb',
                preserve_smoothing=True, color_attribute='Showroom radiance', lit_surfaces=lit,
                additional=[(bpy.data.collections['MO glazing'],'Glass'),(bpy.data.collections['MO lit fittings'],'Lit')])

# The board can enter the aisle view while the GLB is in flight. Keep the
# wave from the native sign in the same cheap silhouette as the empty cabinet.
import json
sign=next(o for o in bpy.data.collections['MO lit fittings'].objects if o.name.startswith('Raised wave'))
sign.data.calc_loop_triangles()
points=[];lookup={};indices=[]
for tri in sign.data.loop_triangles:
    coords=[sign.matrix_world@sign.data.vertices[i].co for i in tri.vertices]
    if min(v.z for v in coords)<2.70:
        continue
    face=[]
    for v in coords:
        pt=(round(v.x*1000),round(v.z*1000))
        if pt not in lookup:
            lookup[pt]=len(points);points.append(pt)
        face.append(lookup[pt])
    if len(set(face))==3:
        # The proxy's unlit face is viewed from the public arcade at local +Z.
        a,b,c=[points[i] for i in face]
        if (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<0:
            face.reverse()
        indices.extend(face)
def packed(values):
    return json.dumps(values,separators=(',',':'))
(here/'arrival-mark.js').write_text('// Native raised wave, millimetres across the board and above the floor.\n'
    +'export const points='+packed([c for p in points for c in p])+';\n'
    +'export const triangles='+packed(indices)+';\n')
