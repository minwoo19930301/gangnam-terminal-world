"""Export the copper display, transparent glazing and light sources as one GLB."""
from pathlib import Path
import runpy
import subprocess
import bpy

here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/'chocolatier.glb')],check=True)
