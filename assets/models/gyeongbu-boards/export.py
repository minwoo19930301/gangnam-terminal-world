"""Export the native housings and lightbox prints as two finishes in one compact GLB."""
from pathlib import Path
import runpy
import subprocess
import bpy

here=Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(here/'print-proxy.py'))
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here.parent/'gyeongbu-seating'/'pack.mjs'),str(here/'departure-portal.glb')],check=True)
