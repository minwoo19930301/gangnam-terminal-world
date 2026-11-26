"""Export the editable native collection library and the individual floor downloads."""
from pathlib import Path
import runpy
import subprocess
here=Path(__file__).resolve().parent
runpy.run_path(str(here.parent/'architectural-retail'/'export.py'))
subprocess.run(['node',str(here/'split.mjs')],check=True)
