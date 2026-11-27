"""G11 south entrance, viewed from the central plaza. Dimensions approximate."""
import json
import sys
from pathlib import Path
import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / 'tools'))
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
materials = {}
proxies = {}
def collection(name):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    proxies[c.name] = []
    return c

frame = collection('G11 · 문틀과 당김봉')
glass = collection('G11 · 유리문과 고정창')

def finish(obj, name, group, tone):
    obj.name = name
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    group.objects.link(obj)
    if tone not in materials:
        m = bpy.data.materials.new(name=f'{tone:06x}')
        rgb = [((tone >> shift & 255)/255) for shift in (16,8,0)]
        linear = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
        m.diffuse_color = (*linear, .22 if group == glass else 1)
        materials[tone] = m
    obj.data.materials.append(materials[tone])

def box(name, group, x, y, z, w, h, d, tone):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x,-z,y+h/2))
    obj = bpy.context.object
    obj.dimensions = (w,d,h)
    finish(obj,name,group,tone)
    proxies[group.name].append([x,y,z,w,h,d,tone])

def tube(name, x, z, low, high, radius, tone):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius, depth=high-low,
                                        location=(x,-z,(low+high)/2))
    obj=bpy.context.object
    for f in obj.data.polygons:
        f.use_smooth=len(f.vertices)==4
    finish(obj,name,frame,tone)
    proxies[frame.name].append([x,low,z,2*radius,high-low,2*radius,tone])

bounds=[-2.2,-1.12,0,1.12,2.2]
for i,(left,right) in enumerate(zip(bounds,bounds[1:])):
    label=['좌측 고정창','좌측 문짝','우측 문짝','우측 고정창'][i]
    box(label,glass,(left+right)/2,.05,0,right-left-.06,2.35,.022,0xcbd6d4)
    for h in [.025,2.4]:
        box(label+' 금속 띠',frame,(left+right)/2,h,0,right-left,.055,.10,0x353735)
for x in bounds:
    box('세로 문틀',frame,x,.02,0,.054,2.45,.11,0x262827)
for x in [-.19,.19]:
    tube('긴 당김봉',x,-.143,.10,2.28,.026,0x373432)
    for y in [.24,2.12]:
        box('당김봉 연결대',frame,x,y,-.078,.032,.04,.10,0x444240)
        box('유리 고정판',frame,x,y-.012,-.028,.065,.064,.024,0x353332)
for x in [-1.125,1.125]:
    box('자주색 출구 안내판',frame,x,2.45,0,2.25,.60,.16,0xb84e70)
    for y in [2.45,3.025]:
        box('안내판 상하 프레임',frame,x,y,-.078,2.25,.025,.032,0x302e2d)
box('안내판 중앙 프레임',frame,0,2.45,-.078,.05,.60,.035,0x302e2d)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'g11.blend'),compress=True)
for group,file in [(frame,'frame'),(glass,'glass')]:
    bake_collection(group,'Surface',here/(file+'.glb'))
(here/'silhouette.js').write_text('export const silhouette = '+json.dumps(proxies,ensure_ascii=False,indent=2)+';\n')
