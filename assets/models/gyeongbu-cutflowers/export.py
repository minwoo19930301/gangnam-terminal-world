"""Bake the editable buckets into reusable vertex-coloured meshes."""
from pathlib import Path
import runpy
import subprocess
import bpy

here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/'cutflowers.glb')],check=True)
