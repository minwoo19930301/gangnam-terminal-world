"""Re-export the last saved edits to the boarding-hall furniture."""
from pathlib import Path
import runpy
import subprocess
import bpy

here = Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here/'pack.mjs'),str(here/'waiting-benches.glb')],check=True)
