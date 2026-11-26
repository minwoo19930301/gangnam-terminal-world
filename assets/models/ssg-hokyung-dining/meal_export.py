"""Bake only the tabletop setting, back to its table-local coordinates."""
from pathlib import Path
import json,struct
import bpy
OUT=Path(__file__).resolve().parent
def write(collection,matrix):
    pieces=[ob for ob in collection.objects if ob.get('retailPackage')=='HokyungMeal']
    if not pieces:raise ValueError('Missing customer meal in the supplied collection')
    bpy.ops.object.select_all(action='DESELECT')
    inv=matrix.inverted()
    for ob in pieces:ob.matrix_world=inv@ob.matrix_world;ob.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join()
    ob=bpy.context.object;ob.name='HokyungEggplantRice';bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    f=OUT/'meal.glb'
    bpy.ops.export_scene.gltf(filepath=str(f),export_format='GLB',use_selection=True,export_animations=False)
    raw=f.read_bytes();l=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+l]);buf=bytearray(raw[28+l:])
    # Blender 3.6 may substitute white when roughness and metalness share one atlas.
    img=next(i for i in doc['images']if 'table-finish'in i['name']);v=doc['bufferViews'][img['bufferView']]
    png=bpy.data.images['table-finish.png'].packed_file.data;v.update(byteOffset=len(buf),byteLength=len(png));buf.extend(png);buf.extend(bytes((-len(buf))%4));doc['buffers'][0]['byteLength']=len(buf)
    j=json.dumps(doc,ensure_ascii=False,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
    f.write_bytes(struct.pack('<4sIII4s',b'glTF',2,28+len(j)+len(buf),len(j),b'JSON')+j+struct.pack('<I4s',len(buf),b'BIN\0')+buf)

if __name__=='__main__':
    import sys
    sys.dont_write_bytecode=True
    sys.path.insert(0,str(OUT))
    from meal_model import FRAME
    write(bpy.data.collections['SSG_11F_Hokyung_Dining'],FRAME)
