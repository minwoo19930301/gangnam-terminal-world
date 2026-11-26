"""Bake a few broad colour masses from the editable poster faces for first paint."""
import bpy
import json
from pathlib import Path

here=Path(__file__).resolve().parent
parts=[]
def srgb(v):
    return round(255*(12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055))
for obj in sorted(bpy.data.collections['Lightboxes'].objects,key=lambda obj: obj.name):
    background='반투명 전면' in obj.name
    if not background and not any(s in obj.name for s in ('하늘색 띠','오른쪽 인쇄 · 푸른 면','오른쪽 인쇄 · 떠 있는 면','왼쪽 인쇄 · 건물')):
        continue
    if not background and obj.name.endswith(('.001','.003','.005')):continue
    mesh=obj.data
    # The backgrounds are boxes. Only the public-facing front catches the backlight.
    for poly in mesh.polygons:
        corners=[obj.matrix_world@mesh.vertices[i].co for i in poly.vertices]
        if background and max(v.y for v in corners)>-.84:continue
        mat=mesh.materials[poly.material_index]
        tint=''.join(f'{srgb(c):02x}' for c in mat.diffuse_color[:3])
        outline=[n for v in corners for n in (round(v.x*1000),round(v.z*1000))]
        parts.append([round(-corners[0].y*1000),tint,outline])
parts.sort(key=lambda p:p[0])
file=here/'model.js';s=file.read_text()
a=s.index('  // BEGIN NATIVE PRINT')+len('  // BEGIN NATIVE PRINT');b=s.index('  // END NATIVE PRINT',a)
file.write_text(s[:a]+'\n  const ink='+json.dumps(parts,separators=(',',':'))+';\n'+s[b:])
