"""Encode one complete seat profile and independent game transforms for the whole native cabin."""
import json,subprocess
from pathlib import Path
import bpy
from blender_display_export import bake_collection

def export(cabin,tmp):
    here=Path(__file__).resolve().parent
    plain=bpy.data.collections.new('웹 · 공용 객실')
    frame=bpy.data.collections.new('웹 · 좌석 프레임')
    pad=bpy.data.collections.new('웹 · 좌석 쿠션')
    rows={}
    for obj in cabin.objects:
        if 'seat_number' not in obj:
            plain.objects.link(obj)
            continue
        key=obj['seat_number'];x,d,z=obj['seat_position'];yaw=obj['seat_yaw'];material=obj['seat_colour']
        rows[key]=[round(x,4),round(z,4),round(d,4),round(yaw,8),material]
        if key!=0:continue
        collection=pad if obj.data.materials[0].name==material else frame
        collection['preview_origin']=(x,-d,z);collection.objects.link(obj)
    chairs=[rows[k]for k in sorted(rows)]
    assert len(chairs)==28 and all(v not in [None,'']for row in chairs for v in row)
    pigments={}
    for r in chairs:
        mat=bpy.data.materials[r[-1]]
        srgb=lambda a:round(255*(a*12.92 if a<=.0031308 else 1.055*a**(1/2.4)-.055))
        pigments[r[-1]]='#'+''.join(f'{srgb(c):02x}'for c in mat.diffuse_color[:3])
    (here/'seat-places.js').write_text('// Native seat centres in bus-local metres: x, floor, depth, yaw and upholstery.\nexport const seatColours='+
        json.dumps(pigments,sort_keys=True)+';\nexport const seatPlaces=['+',\n'.join(json.dumps(row)for row in chairs)+'];\n')
    bake_collection(plain,'PassengerCabin',here/'cabin.glb',(.83,.0008),preserve_smoothing=True)
    bake_collection(frame,'SeatShell',tmp/'frame.glb',preserve_smoothing=True)
    bake_collection(pad,'SeatPad',tmp/'pad.glb',preserve_smoothing=True)
    subprocess.run(['node',str(here/'seats.mjs'),str(tmp/'frame.glb'),str(tmp/'pad.glb'),str(here/'seats.glb')],check=True)
    for c in [plain,frame,pad]:bpy.data.collections.remove(c)
