from pathlib import Path
import sys
import bpy
HERE=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(HERE))
from figurine_model import FRAME,NAME
def write(col):
    pieces=[ob for ob in col.objects if ob.get('retailPackage')=='RoyalPea']
    assert pieces
    bpy.ops.object.select_all(action='DESELECT')
    for ob in pieces:
        ob.matrix_world=FRAME.inverted() @ ob.matrix_world
        ob.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join()
    combined=bpy.context.object
    combined.name=NAME
    combined.data.name=NAME
    combined['nativePartCount']=len(pieces)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bpy.ops.export_scene.gltf(filepath=str(HERE/'figurine.glb'),export_format='GLB',export_yup=True,export_animations=False,use_selection=True)
    bpy.data.objects.remove(combined,do_unlink=True)
if __name__=='__main__':
    write(bpy.data.collections['SSG_9F_RoyalCopenhagen'])
