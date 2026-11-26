"""Bake editable pharmacy, glass and lit surfaces into one compact GLB."""
from pathlib import Path
import runpy
import subprocess
import bpy
here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/'corner-pharmacy.glb')],check=True)
