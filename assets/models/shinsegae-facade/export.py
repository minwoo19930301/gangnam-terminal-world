"""Export the saved Blender sign faces and their positions on the existing north elevation."""
import json
from pathlib import Path
import runpy

import bpy

here = Path(bpy.data.filepath).resolve().parent
runpy.run_path(str(Path(__file__).resolve().parents[1] / "architectural-retail/export.py"))
signs = sorted((g.name, g["tower_u"], g["base_height"]) for g in bpy.data.collections
               if g.get("bundle") == "signs")
(here / "mounts.js").write_text("// Exported from north-signs.blend.\nexport const mounts = " +
                                json.dumps(signs, separators=(",", ":")) + ";\n")
