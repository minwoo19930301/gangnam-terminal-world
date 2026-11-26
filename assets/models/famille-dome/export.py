"""Export the editable underside and bronze framing as one vertex-coloured mesh."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
target=Path(args[0]).resolve() if args else here
target.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection

bake_collection(bpy.data.collections['파미에 돔 · 삼각 천장'],'FamilleDomeLining',target/'lining.glb')

# Keep a few real timber and opal panes in the first frame while the profiles load.
# Dimensions and colours come from the edited collection, in centimetres and sRGB.
import base64
import json
import struct
packet=bytearray()
colors=[]
for obj in bpy.data.collections['파미에 돔 · 삼각 천장'].objects:
    if obj.type!='MESH' or '삼각 패널' not in obj.name:continue
    for index,face in enumerate(obj.data.polygons):
        if index%3:continue
        mat=obj.data.materials[face.material_index]
        rgb=tuple(round(255*(12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055)) for c in mat.diffuse_color[:3])
        if rgb not in colors:colors.append(rgb)
        xyz=[]
        for vertex in face.vertices:
            x,y,z=obj.matrix_world @ obj.data.vertices[vertex].co
            xyz.extend(round(c*100) for c in [x,z,-y])
        if len(xyz)==9:packet.extend(struct.pack('<9hB',*xyz,colors.index(rgb)))
palette=[(r<<16)|(g<<8)|b for r,g,b in colors]
(target/'proxy.js').write_text('// Generated from the editable pavilion lining by export.py.\nexport const colors='+json.dumps(palette)+';\nexport const panes="'+base64.b64encode(packet).decode()+'";\n')
