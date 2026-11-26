"""Bake and compress a separate single-draw GLB for each editable display."""
from pathlib import Path
import runpy
import subprocess
import bpy

here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
for name in ['quilt-shop','drapery-shop']:
    subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/(name+'.glb'))],check=True)
