"""Re-export only the saved source. Preserve its editable objects and native finishes."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy

here=Path(__file__).resolve().parent
graph=bpy.context.evaluated_depsgraph_get()
batches=['BrownyardOak','BrownyardCloth','BrownyardDisplay','BrownyardGlass','BrownyardLight']
output=[]
for batch in batches:
    verts=[];faces=[];colors=[];texcoords=[];smooth=[]
    for source in sorted(bpy.data.collections[batch].objects,key=lambda o:o.name):
        obj=source.evaluated_get(graph);mesh=obj.to_mesh(preserve_all_data_layers=True,depsgraph=graph)
        start=len(verts);verts.extend(obj.matrix_world @ v.co for v in mesh.vertices)
        uv=mesh.uv_layers.active
        shade=mesh.color_attributes.get('Shop contact')
        for poly in mesh.polygons:
            faces.append(tuple(start+j for j in poly.vertices))
            smooth.append(poly.use_smooth)
            mat=mesh.materials[poly.material_index]
            if shade:
                for vertex in poly.vertices:
                    contact=shade.data[vertex].color[0]
                    colors.append(tuple(contact*c for c in mat.diffuse_color[:3])+(1,))
            else:
                colors.extend([mat.diffuse_color[:]]*len(poly.vertices))
            if batch in ('BrownyardOak','BrownyardCloth'):
                texcoords.extend(uv.data[k].uv[:] if uv else (0,0) for k in poly.loop_indices)
        obj.to_mesh_clear()
    mesh=bpy.data.meshes.new(batch)
    mesh.from_pydata(verts,[],faces);mesh.update();mesh.polygons.foreach_set('use_smooth',smooth)
    paint=mesh.color_attributes.new(name='Color',type='BYTE_COLOR',domain='CORNER')
    paint.data.foreach_set('color',[v for value in colors for v in value])
    if texcoords:mesh.uv_layers.new(name='Finish').data.foreach_set('uv',[v for pair in texcoords for v in [pair[0]/64+.5,pair[1]/64+.5]])
    material=bpy.data.materials.new(batch);material.use_nodes=True
    node=material.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value=(1,1,1,1)
    node.inputs['Roughness'].default_value={'BrownyardOak':.47,'BrownyardCloth':.93,'BrownyardGlass':.15}.get(batch,.5)
    if batch in ['BrownyardOak','BrownyardCloth']:
        pic=material.node_tree.nodes.new('ShaderNodeTexImage')
        pic.image=bpy.data.images['oak.png' if batch=='BrownyardOak' else 'weave.png']
        coords=material.node_tree.nodes.new('ShaderNodeTexCoord')
        mapping=material.node_tree.nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(64,64,1)
        material.node_tree.links.new(coords.outputs['UV'],mapping.inputs['Vector'])
        material.node_tree.links.new(mapping.outputs['Vector'],pic.inputs['Vector'])
        material.node_tree.links.new(pic.outputs['Color'],node.inputs['Base Color'])
    if batch=='BrownyardGlass':
        node.inputs['Alpha'].default_value=.17
        material.surface_render_method='DITHERED'
    if batch=='BrownyardLight':
        node.inputs['Emission Color'].default_value=(1,.92,.77,1)
        node.inputs['Emission Strength'].default_value=.52
    obj=bpy.data.objects.new(batch,mesh);bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(material);output.append(obj)
bpy.ops.object.select_all(action='DESELECT')
for obj in output:obj.select_set(True)
with TemporaryDirectory() as temp:
    raw=Path(temp)/'gallery.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_vertex_color='ACTIVE')
    subprocess.run(['node',str(here.parents[2]/'tools/pack_display.mjs'),str(raw),'.70','.00055'],check=True)
    subprocess.run(['node',str(here.parents[2]/'tools/optimize_model.mjs'),str(raw),str(here/'gallery.glb')],check=True)
