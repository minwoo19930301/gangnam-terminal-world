"""Bake the two large surfaces in the furnished Waraku scene."""
from blender_furnished_light import bake_furnished

def bake(here,names):
    targets=[(key,'와라쿠 · '+names[key],size) for key,size in [('room',640),('table',512)]]
    bake_furnished(here,'114호 · 조명과 앞쪽 두 자리',targets,mesh_prefix='와라쿠_웹_')
