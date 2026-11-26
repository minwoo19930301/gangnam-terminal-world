"""Export three draw batches from the native editable material collections."""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import bpy

here=Path(__file__).resolve().parent
graph=bpy.context.evaluated_depsgraph_get()
batches=[]
for name in ['HearthMasonry','HearthIron','HearthEmbers']:
    verts=[];faces=[];colors=[];uvs=[];smooth=[]
    for source in sorted(bpy.data.collections[name].objects,key=lambda ob:ob.name):
        ob=source.evaluated_get(graph);mesh=ob.to_mesh()
        offset=len(verts)
        verts.extend(tuple(ob.matrix_world@v.co) for v in mesh.vertices)
        tint=mesh.color_attributes['Tint']
        uv=mesh.uv_layers.active
        for face in mesh.polygons:
            faces.append(tuple(offset+i for i in face.vertices));smooth.append(face.use_smooth)
            colors.extend(tint.data[i].color[:] for i in face.vertices)
            if name=='HearthMasonry':
                uvs.extend(uv.data[i].uv[:] for i in face.loop_indices)
        ob.to_mesh_clear()
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    mesh.polygons.foreach_set('use_smooth',smooth)
    tint=mesh.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='CORNER')
    tint.data.foreach_set('color',[a for col in colors for a in col])
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(1,1,1,1)
    shader.inputs['Roughness'].default_value=.96 if name=='HearthMasonry' else .54
    if name=='HearthMasonry':
        # Retain tiled UVs under meshopt normalised UV quantisation.
        mesh.uv_layers.new(name='Aggregate').data.foreach_set('uv',[a/64+.5 for pair in uvs for a in pair])
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images['aggregate.png']
        src=mat.node_tree.nodes.new('ShaderNodeTexCoord')
        mapping=mat.node_tree.nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(64,64,1)
        mat.node_tree.links.new(src.outputs['UV'],mapping.inputs['Vector'])
        mat.node_tree.links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
        mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    if name=='HearthEmbers':
        shader.inputs['Alpha'].default_value=.96;mat.surface_render_method='DITHERED'
    ob=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(ob)
    mesh.materials.append(mat);batches.append(ob)
bpy.ops.object.select_all(action='DESELECT')
for ob in batches:ob.select_set(True)
with TemporaryDirectory() as directory:
    target=Path(directory)/'hearth.glb'
    bpy.ops.export_scene.gltf(filepath=str(target),use_selection=True,export_vertex_color='ACTIVE')
    subprocess.run(['node',str(here.parents[2]/'tools/pack_display.mjs'),str(target),'.77','.00036'],check=True)
    subprocess.run(['node',str(here.parents[2]/'tools/optimize_model.mjs'),str(target),str(here/'hearth.glb')],check=True)
