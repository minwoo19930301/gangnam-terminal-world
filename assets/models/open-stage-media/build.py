"""Editable four-face LED cabinet trim, at the finished plaza floor datum."""
import bpy
from pathlib import Path
import runpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
group = bpy.data.collections.new('오픈 스테이지 · 미디어 기둥 외장')
bpy.context.scene.collection.children.link(group)
group['export_model'] = 'cabinet'
group['preview_origin'] = (0, 0, 0)


def square_profile(name, rings, color):
    verts = [(x*r, y*r, h) for r, h in rings
             for x, y in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    faces = [(4*j+i, 4*j+(i+1)%4, 4*(j+1)+(i+1)%4, 4*(j+1)+i)
             for j in range(len(rings)-1) for i in range(4)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    group.objects.link(obj)
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*[((v/255+.055)/1.055)**2.4 for v in color], 1)
    mesh.materials.append(mat)


square_profile('하부 검정 받침과 턱', [(.77,.005),(.77,.07),(.798,.075),(.805,.085),(.805,.75),(.80,.765)], (37,37,42))
square_profile('화면 상부 무광 검정 외장', [(.8,4.43),(.805,4.44),(.805,5.26),(.80,5.27),(.56,5.27)], (34,34,39))
square_profile('밝은 사각 구조 기둥', [(.565,5.27),(.565,6.2)], (226,224,218))

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'cabinet.blend'), compress=True)
runpy.run_path(str(here.parent/'interior-architecture'/'export.py'), run_name='__main__')
