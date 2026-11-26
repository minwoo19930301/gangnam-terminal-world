"""Export this saved .blend using the project's collection/vertex-colour exporter."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).resolve().parents[1] / "architectural-retail" / "export.py"))
