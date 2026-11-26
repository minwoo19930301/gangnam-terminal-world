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

def moulding(name, profile, surface, sides=64, square=False):
    vertices, faces = [], []
    for radius, depth in profile:
        for k in range(sides):
            a = tau*k/sides
            if square:
                x, y = [(1,1),(-1,1),(-1,-1),(1,-1)][k]
            else:
                x, y = cos(a), sin(a)
            vertices.append((radius*x, radius*y, -depth))
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
moulding('사각 안쪽 회반죽 돌림띠',[(2.26,.17),(2.22,.18),(2.18,.14),(2.15,.11),(2.10,.095),(2.06,.044)],chalk,4,True)
moulding('사각 턱 그림자 홈',[(2.06,.044),(2.035,.04),(2.01,.055)],reveal,4,True)
moulding('사각 속 테두리',[(2.01,.055),(1.985,.067),(1.955,.053),(1.935,.020)],cream,4,True)
# The event photograph resolves concentric rings, but not a fluted pattern.
for radius, width, depth in [(1.25,.037,.025),(1.12,.029,.022),(.75,.025,.023),(.39,.04,.035),(.25,.03,.04)]:
    moulding('중앙 동심원 석고 띠',[(radius,.003),(radius-width*.3,depth),
             (radius-width*.7,depth),(radius-width,.003)],chalk)
moulding('중앙 원형 석고 마감',[(.2,.008),(.15,.035),(.06,.049),(.001,.052)],cream)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'coffer.blend'),compress=True)
runpy.run_path(str(here.parent/'interior-architecture'/'export.py'),run_name='__main__')

subprocess.run(['node',str(here.parents[2]/'tools'/'pack_display.mjs'),str(here/'coffer.glb'),'.65','.00065'],check=True)
