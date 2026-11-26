"""Export one visible shop per file from the editable three-floor library."""
from pathlib import Path
import runpy
import subprocess
import bpy

here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
for name in ['childrenswear','tailoring','outerwear']:
    subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/(name+'.glb'))],check=True)
