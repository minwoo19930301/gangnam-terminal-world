"""Export the garment floor's separate interior and visitor-facing shopfront."""
from pathlib import Path
import sys
import bpy
out=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(out))
import frontage
col=bpy.data.collections['SSG_6F_Berluti']
for ob in list(col.objects):
    if ob.get('shelf_sample') and ob.name.startswith(('몸판 가장자리 봉제','손잡이 안쪽 솔기','손잡이 받침 박음질')):
        bpy.data.objects.remove(ob,do_unlink=True)
def groupfile(names,filename):
    combined=[]
    for name in names:
        mat=bpy.data.materials[name];pieces=[o for o in col.objects if o.data.materials[0]==mat]
        bpy.ops.object.select_all(action='DESELECT')
        for o in pieces:o.select_set(True)
        bpy.context.view_layer.objects.active=pieces[0]
        if len(pieces)>1:bpy.ops.object.join()
        joined=bpy.context.object;joined.name=name;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);combined.append(joined)
    bpy.ops.object.select_all(action='DESELECT')
    for o in combined:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(out/filename),export_format='GLB',export_animations=False,use_selection=True)
groupfile(['BerlutiVeneziaPatina','BerlutiWalnut','BerlutiGalleryFinish','BerlutiPalladium'],'gallery.glb')
# The native material retains physical refraction. The web edition uses tinted
# alpha glass and Fresnel highlights, avoiding a full-scene transmission pass.
m=bpy.data.materials[frontage.SCREEN];bs=m.node_tree.nodes['Principled BSDF']
bs.inputs['Transmission'].default_value=0;bs.inputs['Metallic'].default_value=.14
m.node_tree.links.new(next(n for n in m.node_tree.nodes if n.type=='VERTEX_COLOR').outputs['Alpha'],bs.inputs['Alpha'])
m.blend_method='BLEND';m.use_backface_culling=True
groupfile([frontage.JOINERY,frontage.SCREEN],'frontage.glb')
