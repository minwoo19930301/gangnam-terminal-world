"""Bake evaluated shop meshes, editable colour swatches and the packed paper print to one surface."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy
here=Path(__file__).resolve().parent
graph=bpy.context.evaluated_depsgraph_get()
vs,faces,colors,coords=[],[],[],[]
for source in sorted(bpy.data.collections['VanLeeuwen'].all_objects,key=lambda o:o.name):
    if source.type!='MESH':continue
    ob=source.evaluated_get(graph);mesh=ob.to_mesh()
    try:
        offset=len(vs);vs.extend(ob.matrix_world@v.co for v in mesh.vertices)
        uv=mesh.uv_layers.get('Artwork')
        for p in mesh.polygons:
            faces.append([offset+i for i in p.vertices])
            color=mesh.materials[p.material_index].diffuse_color[:]
            if uv:
                code=source['paper_tint']
                rgb=[int(code[i:i+2],16)/255 for i in (0,2,4)]
                color=tuple(((s+.055)/1.055)**2.4 if s>.04045 else s/12.92 for s in rgb)+(1,)
            colors.append((color,p.use_smooth))
            coords.extend(uv.data[l].uv[:] if uv else (.985,.015) for l in p.loop_indices)
    finally:ob.to_mesh_clear()
data=bpy.data.meshes.new('Combined counter');data.from_pydata(vs,[],faces);data.update()
data.uv_layers.new(name='Print');data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
uv=data.uv_layers['Print'];colour=data.color_attributes['Finish']
for p,(color,smooth) in zip(data.polygons,colors):
    p.use_smooth=smooth
    for loop in p.loop_indices:
        colour.data[loop].color=color;uv.data[loop].uv=coords[loop]
material=bpy.data.materials.new('Shop colours and print');material.use_nodes=True
tree=material.node_tree;texture=tree.nodes.new('ShaderNodeTexImage')
texture.image=bpy.data.images['Cup, bag and counter print']
tree.links.new(texture.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
data.materials.append(material)
bpy.ops.object.select_all(action='DESELECT');part=bpy.data.objects.new('Surface',data)
bpy.context.scene.collection.objects.link(part);part.select_set(True)
scripts=here.parents[2]/'tools'
with TemporaryDirectory() as tmp:
    target=Path(tmp)/'display.glb'
    bpy.ops.export_scene.gltf(filepath=str(target),use_selection=True,export_animations=False,export_materials='EXPORT',
        export_vertex_color='NAME',export_vertex_color_name='Finish',export_texcoords=True,
        export_image_format='JPEG',export_jpeg_quality=88,export_image_quality=88)
    subprocess.run(['node',str(scripts/'pack_display.mjs'),str(target),'.52','.00070'],check=True)
    subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(target),str(here/'display.glb')],check=True)
