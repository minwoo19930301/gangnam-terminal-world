"""Export the coloured case and its separately shaded glass."""
from pathlib import Path
import runpy
import subprocess
import bpy

directory=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(directory.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(directory.parent/'gyeongbu-seating'/'pack.mjs'),str(directory/'scoop-parlor.glb')],check=True)
