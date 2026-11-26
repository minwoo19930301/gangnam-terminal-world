"""A square coffer insert, viewed from below. Origin at the insert's ceiling plane."""
from math import cos, sin, tau
from pathlib import Path
import runpy
import subprocess
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
group = bpy.data.collections.new('오픈 스테이지 · 코퍼 몰딩')
bpy.context.scene.collection.children.link(group)
group['export_model'] = 'coffer'
group['preview_origin'] = (0, 0, 0)

def plaster(name, rgb):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*[((v / 255 + .055) / 1.055) ** 2.4 for v in rgb], 1)
    return material

chalk = plaster('백색 석고', (248, 244, 233))
cream = plaster('상아색 면', (232, 226, 213))
reveal = plaster('몰딩 안쪽 홈', (194, 185, 169))
bronze = plaster('매입등 테두리', (148, 139, 120))

def moulding(name, profile, surface, sides=64, square=False, center=(0,0), flutes=0):
    vertices, faces = [], []
    for radius, depth, relief in profile:
        for k in range(sides):
            a = tau*k/sides
            if square:
                x, y = [(1,1),(-1,1),(-1,-1),(1,-1)][k]
            else:
                x, y = cos(a), sin(a)
            vertices.append((center[0]+radius*x, center[1]+radius*y,
                             -depth-relief*(1+cos(flutes*a))/2))
    # Profile runs from the outside to the inside. Wind toward the visitor below.
    for row in range(len(profile)-1):
        for k in range(sides):
            i, j = row*sides+k, row*sides+(k+1)%sides
            faces.append((i,i+sides,j+sides,j))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    group.objects.link(obj)
    mesh.materials.append(surface)
    return obj

# Cyma, stepped fascia and a narrow shadow line sit inside the coarse beam.
moulding('사각 안쪽 회반죽 돌림띠',[(2.26,.17,0),(2.22,.18,0),(2.18,.14,0),(2.15,.11,0),(2.10,.095,0),(2.06,.044,0)],chalk,4,True)
moulding('사각 턱 그림자 홈',[(2.06,.044,0),(2.035,.04,0),(2.01,.055,0)],reveal,4,True)
moulding('사각 속 테두리',[(2.01,.055,0),(1.985,.067,0),(1.955,.053,0),(1.935,.020,0)],cream,4,True)
moulding('중앙 원형 몰딩',[(.72,.012,0),(.70,.043,0),(.675,.062,0),(.65,.065,0),(.628,.034,0)],chalk)
moulding('원형 음각 홈',[(.628,.034,0),(.61,.03,0),(.595,.047,0)],reveal)
moulding('부채꼴 얕은 석고 주름',[(.595,.047,0),(.55,.060,.018),(.45,.07,.040),(.33,.077,.025),(.25,.095,0)],cream,96,flutes=24)
moulding('중앙 원형 보스',[(.25,.095,0),(.235,.12,0),(.21,.127,0),(.193,.098,0),(.165,.109,0),(.12,.15,0),(.015,.17,0),(.001,.17,0)],chalk)
for x in (-1.9,1.9):
    for y in (-1.9,1.9):
        moulding('매입등 원형 베젤',[(.12,.13,0),(.115,.158,0),(.097,.165,0),(.078,.157,0),(.068,.15,0)],bronze,32,center=(x,y))

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'coffer.blend'),compress=True)
runpy.run_path(str(here.parent/'interior-architecture'/'export.py'),run_name='__main__')

subprocess.run(['node',str(here.parents[2]/'tools'/'pack_display.mjs'),str(here/'coffer.glb'),'.65','.00065'],check=True)
