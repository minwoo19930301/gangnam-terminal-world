"""Rebuild both native entrance studies and their runtime / distance meshes."""
import math
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from geometry import Part
from authoring import create
from surfaces import make_image,COLOURS
from portal import silhouette
from tower import facade

def english(low):
    curve=bpy.data.curves.new('Found letters · road-view capitalization','FONT')
    curve.body='SEOUL EXPRESS BUS TERMINAL'
    curve.align_x='CENTER'
    curve.align_y='CENTER'
    curve.size=.55
    curve.space_character=1.065
    curve.resolution_u=2 if low else 3
    curve.extrude=0 if low else .023
    curve.bevel_depth=0 if low else .006
    curve.bevel_resolution=0
    obj=bpy.data.objects.new('Editable inscription · SEOUL EXPRESS BUS TERMINAL',curve)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.update()
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=evaluated.to_mesh()
    mesh.calc_loop_triangles()
    span=max(v.co.x for v in mesh.vertices)-min(v.co.x for v in mesh.vertices)
    size=7.44/span
    metal=Part('06 · Individual raised English metal letters','Metal')
    for tri in mesh.loop_triangles:
        n=tri.normal
        if low and n.z<.8:continue
        points=[mesh.vertices[i].co for i in tri.vertices]
        metal.face([(.84+p.x*size,2.638+p.z*size,6.441+p.y*size) for p in points],6,(n.x,n.z,n.y),(.99,.991,.986))
    evaluated.to_mesh_clear()
    if low:bpy.data.objects.remove(obj,do_unlink=True)
    else:
        obj.location=(.84,-2.638,6.441)
        obj.rotation_euler.x=math.pi/2
        obj.scale=(size,size,size)
        obj.hide_viewport=True
        obj.hide_render=True
    return metal

def entrance(low=False):
    return [*silhouette(low),english(low)]

if __name__=='__main__':
    with TemporaryDirectory(prefix='gb-entrance-') as tmp:
        texture=Path(tmp)/'surface.png';make_image(texture)
        create('portal','정문 · 경사 기둥과 영문 채널 문자',entrance,texture,HERE,COLOURS,(1.20,-18.2,1.65),(.50,0,4.25),27)
        create('tower','정면 명판탑 · 입체 글자와 적갈색 외벽',facade,texture,HERE,COLOURS,(5,-48,1.65),(0,0,22),31)
