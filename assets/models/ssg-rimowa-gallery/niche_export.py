"""Export only the customisation niche in its own visitor-facing local coordinates."""
from pathlib import Path
import json,struct
import bpy
from mathutils import Matrix
out=Path(__file__).resolve().parent
import sys
sys.dont_write_bytecode=True;sys.path.insert(0,str(out))
from niche_model import SOLID,GLASS

def write(collection,placement):
    obs=[o for o in collection.objects if o.get('retailPackage')=='RimowaNiche']
    if not obs:raise ValueError('No RIMOWA niche in the supplied native collection')
    inverse=placement.inverted()
    for ob in obs:ob.matrix_world=inverse@ob.matrix_world
    bpy.context.view_layer.update()
    # Clear acrylic uses the normal alpha pass in the game, preserving the metal
    # display behind it without a screen-sized transmission pass.
    mat=bpy.data.materials[GLASS];bs=mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Transmission'].default_value=0;bs.inputs['Alpha'].default_value=.17;bs.inputs['Metallic'].default_value=.08
    mat.blend_method='BLEND';mat.use_backface_culling=True
    joined=[]
    groups={name:[ob for ob in obs if ob.data.materials[0].name==name] for name in [SOLID,GLASS]}
    for name,group in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for ob in group:ob.select_set(True)
        bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();ob=bpy.context.object;ob.name=name
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);joined.append(ob)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in joined:ob.select_set(True)
    f=out/'niche.glb';bpy.ops.export_scene.gltf(filepath=str(f),export_format='GLB',export_animations=False,use_selection=True)
    # Keep the roughness and metalness channels of the native edit. Blender
    # 3.6 can emit a white placeholder when packing a single SeparateRGB node.
    raw=f.read_bytes();a=struct.unpack_from('<I',raw,12)[0];root=json.loads(raw[20:20+a]);buf=bytearray(raw[28+a:])
    img=next(im for im in root['images']if 'niche-metal' in im['name']);v=root['bufferViews'][img['bufferView']]
    pixels=bpy.data.images['niche-metal.png'].packed_file.data;v.update(byteOffset=len(buf),byteLength=len(pixels));buf.extend(pixels);buf.extend(bytes((-len(buf))%4))
    root['buffers'][0]['byteLength']=len(buf);j=json.dumps(root,ensure_ascii=False,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
    f.write_bytes(struct.pack('<4sIII4s',b'glTF',2,28+len(j)+len(buf),len(j),b'JSON')+j+struct.pack('<I4s',len(buf),b'BIN\0')+buf)
if __name__=='__main__':
    from niche_model import FRAME
    write(bpy.data.collections['SSG_6F_RIMOWA_GALLERY'],FRAME)
