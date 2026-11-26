"""Export the case, its four editable recipes and each pack's placement."""
import json
from math import pi
from pathlib import Path
import runpy

import bpy
from mathutils import Matrix

here = Path(__file__).resolve().parent
bake = runpy.run_path(str(here.parents[2] / 'tools/blender_display_export.py'))['bake_collection']
case = bpy.data.collections['SeafoodCase']
bake(case, case.name, here / 'counter.glb', simplification=(.82, .0006))

goods = bpy.data.collections['SeafoodPacks']
recipes = sorted({item.instance_collection for item in goods.objects}, key=lambda c: c.name)
bake(recipes[0], 'MarketPack' + recipes[0].name, here / 'bento.glb', simplification=(.60, .0006),
     additional=[(recipe, 'MarketPack' + recipe.name) for recipe in recipes[1:]])

basis = Matrix.Rotation(-pi / 2, 4, 'X')
poses = {}
for item in sorted(goods.objects, key=lambda obj: obj.name):
    matrix = basis @ item.matrix_world @ basis.inverted()
    values = [round(matrix[row][col], 6) for col in range(4) for row in range(4)]
    poses.setdefault(item.instance_collection.name, []).append(values)
(here / 'stock-layout.js').write_text('// Generated from the stock instances in counter.blend.\n'
    + 'export const poses = ' + json.dumps(poses, separators=(',', ':')) + ';\n')
