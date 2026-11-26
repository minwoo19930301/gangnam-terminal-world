"""Build the editable outward-facing G12 printed dots in metres."""
import bpy
import math
import runpy
from pathlib import Path

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
art = bpy.data.collections.new("G12 유리창 점인쇄")
scene.collection.children.link(art)
pitch = .059
cols, rows = 84, 32
art["columns"], art["rows"], art["pitch"], art["radius"] = cols, rows, pitch, .025
art["reference"] = "https://map.naver.com/p?p=1-vcvyHd322boFpQwiCU_w,322,2,80,Float"
# Outlines of the three block characters visible on the public street panel;
# register the ink on a single grid across the vertical glass joints.
outlines = {
    "G": (0, 30, [(30,24),(30,21),(23,21),(23,24),(20,26),(10,26),(7,23),(7,8),(10,5),
                   (20,5),(23,8),(23,12),(15,12),(15,18),(30,18),(30,6),(23,0),(7,0),
                   (0,6),(0,25),(7,32),(23,32)]),
    "1": (34, 16, [(0,22),(0,27),(7,32),(16,32),(16,0),(9,0),(9,25),(2,21)]),
    "2": (54, 30, [(0,24),(7,32),(23,32),(30,25),(30,20),(26,15),(9,6),(30,6),(30,0),
                   (0,0),(0,6),(3,10),(21,20),(23,22),(23,25),(21,27),(10,27),(7,23),(7,21),(0,21)]),
}

def inside(x, y, loop):
    result = False
    for a, b in zip(loop, loop[1:] + loop[:1]):
        if (a[1] > y) != (b[1] > y) and x < a[0] + (y-a[1])*(b[0]-a[0])/(b[1]-a[1]):
            result = not result
    return result

def ink(label, rgb):
    mat = bpy.data.materials.new(label)
    mat["srgb"] = rgb
    def linear(k):
        v = int(rgb[k:k+2], 16)/255
        return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4
    mat.diffuse_color = tuple(linear(k) for k in (0,2,4))+(1,)
    mat.roughness = .78
    return mat

materials = [ink("상단의 차분한 분홍 인쇄","c98e94"), ink("흰 세라믹 인쇄","ecebe4"),
             ink("하단의 회색 인쇄","b3b7b0")]
for letter, (offset, width, outline) in outlines.items():
    vertices, faces, inks = [], [], []
    for r in range(rows):
        for c in range(width):
            if not inside(c+.5, r+.5, outline):
                continue
            x = (offset+c+.5-cols/2)*pitch
            z = (r+.5-rows/2)*pitch
            start = len(vertices)
            for k in range(10):
                angle = 2*math.pi*k/10
                vertices.append((x+art["radius"]*math.cos(angle),0,z+art["radius"]*math.sin(angle)))
            faces.append(tuple(range(start,start+10)))
            inks.append(0 if r >= rows-2 else 2 if r < 2 else 1)
    mesh = bpy.data.meshes.new("점망 "+letter)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    for material in materials:
        mesh.materials.append(material)
    for face, slot in zip(mesh.polygons, inks):
        face.material_index = slot
    art.objects.link(bpy.data.objects.new("도트 문자 "+letter,mesh))
source = HERE/"print.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(source), compress=True)
runpy.run_path(str(HERE/'export.py'))
