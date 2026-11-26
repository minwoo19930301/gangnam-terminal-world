"""Export the currently saved editable shop, including relighting the original placements.
blender -b assets/models/newcore-golf/golf-shop.blend --python-exit-code 1 -P assets/models/newcore-golf/export_saved.py
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import sys,json,subprocess
import bpy
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True
sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import bake
from export import sweater
from blender_display_export import bake_collection

data=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {catalog,prefix} from './layout.js';console.log(JSON.stringify({catalog,prefix}));"],cwd=here))
groups={key:bpy.data.collections[data['prefix']+entry[0]] for key,entry in data['catalog'].items()}
# Match native object evaluation to the authoring file before baking product shaders.
scene=bpy.context.scene;source=bpy.data.scenes['편집 가능한 제품 · 원형']
bpy.context.window.scene=source;bpy.context.view_layer.update()
for key,coll in groups.items():
    if key in ['wine','foldWine']:sweater(here,coll,'sweater' if key=='wine' else 'folded')
    elif key not in bake.SIZES and key not in ['ice','black','foldIce','foldBlack']:
        bake_collection(coll,key,here/(key+'.glb'),simplification=(.82,.00022),preserve_smoothing=True)
bpy.context.window.scene=scene;bpy.context.view_layer.update()
with TemporaryDirectory() as tmp:
    for key in ['wine','ice','black']:
        image=bpy.data.images['트레포일 니트 · '+key];png=Path(tmp)/(key+'.png')
        # Paint edits in the native image take precedence over the original packed file.
        if image.is_dirty:
            image.file_format='PNG';image.filepath_raw=str(png);image.save()
        else:png.write_bytes(image.packed_file.data)
        subprocess.run(['node','--input-type=module','-e',
            "import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:90,effort:6}).toFile(process.argv[2]);",
            str(png),str(here/('knit-'+key+'.webp'))],cwd=here.parents[2],check=True)
bake.sales_floor(here,groups)
