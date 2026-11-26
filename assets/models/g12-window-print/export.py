"""Repack the edited print grid for the two-triangle game decal."""
import base64
import bpy
import json
from pathlib import Path

art = bpy.data.collections["G12 유리창 점인쇄"]
cols, rows, pitch = art["columns"], art["rows"], art["pitch"]
palette, cells = [], bytearray((rows*cols+3)//4)
for ob in art.objects:
    for face in ob.data.polygons:
        point = ob.matrix_world @ face.center
        col = int(round(point.x/pitch+cols/2-.5))
        row = rows-1-int(round(point.z/pitch+rows/2-.5))
        if not (0 <= col < cols and 0 <= row < rows):
            raise ValueError(f"{ob.name}: dot outside print grid")
        color = ob.data.materials[face.material_index]["srgb"]
        if color not in palette:
            palette.append(color)
        code = 1+palette.index(color)
        if code > 3:
            raise ValueError("The two-bit print supports three inks and bare glass.")
        index = row*cols+col
        shift = 2*(index%4)
        if cells[index//4] & (3<<shift):
            raise ValueError("Overlapping dot centres in the same print cell")
        cells[index//4] |= code<<shift
info = {"columns":cols,"rows":rows,"pitch":pitch,"radius":art["radius"],
        "inks":palette,"packed":base64.b64encode(cells).decode("ascii")}
p = Path(__file__).resolve().parent/"print.js"
p.write_text("// Generated from print.blend by export.py.\nexport const print = "
             +json.dumps(info,separators=(",",":"))+";\n")
