"""Export an editable Blender collection to one compressed vertex-coloured display mesh."""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import bpy
from mathutils import Vector


def _mesh_from_collection(src, name, preserve_smoothing, color_attribute):
    origin=Vector(src.get('preview_origin',(0,0,0)))
    graph = bpy.context.evaluated_depsgraph_get()
    v, f, colors = [], [], []
    smooth_faces = []
    corner_colors = {}
    for source in sorted(src.all_objects,key=lambda o:o.name):
        if source.type != 'MESH':
            continue
        o = source.evaluated_get(graph)
        mesh = o.to_mesh()
        try:
            n = len(v)
            v.extend(o.matrix_world @ pt.co - origin for pt in mesh.vertices)
            source_color = mesh.color_attributes.get(color_attribute) if color_attribute else None
            for poly in mesh.polygons:
                f.append(tuple(n+j for j in poly.vertices))
                colors.append(mesh.materials[poly.material_index].diffuse_color[:])
                if source_color is not None:
                    indices = poly.vertices if source_color.domain == 'POINT' else poly.loop_indices
                    corner_colors[len(f)-1] = [source_color.data[index].color[:] for index in indices]
                if preserve_smoothing:
                    smooth_faces.append(poly.use_smooth)
        finally:
            o.to_mesh_clear()
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(v, [], f)
    if preserve_smoothing:
        mesh.polygons.foreach_set('use_smooth', smooth_faces)
    mesh.update()
    tint=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly, col in zip(mesh.polygons,colors):
        custom = corner_colors.get(poly.index)
        if custom is not None:
            for loop, value in zip(poly.loop_indices,custom):
                tint.data[loop].color=value
        else:
            for loop in poly.loop_indices:
                tint.data[loop].color=col
    item=bpy.data.objects.new(name,mesh)
    bpy.context.scene.collection.objects.link(item)
    return item


def bake_collection(src, name, target, simplification=None, preserve_smoothing=False, color_attribute=None,
                    additional=(), lit_surfaces=None):
    # Transparent glass can share the file while retaining a separate runtime material.
    parts = [(src, name), *additional]
    if lit_surfaces:
        parts.append((lit_surfaces, 'BakedSurfaceSamples'))
    items = [_mesh_from_collection(collection, label, preserve_smoothing, color_attribute)
             for collection, label in parts]
    bpy.ops.object.select_all(action='DESELECT')
    for item in items:
        item.select_set(True)
    with TemporaryDirectory() as temp:
        out=Path(temp)/target.name
        bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,
                                  export_normals=True,export_texcoords=False,export_materials='NONE',
                                  export_vertex_color='ACTIVE',export_yup=True)
        scripts=Path(__file__).resolve().parent
        if lit_surfaces:
            subprocess.run(['node',str(scripts/'pack_lit_display.mjs'),str(out),str(target),
                            name,'BakedSurfaceSamples'],check=True)
        else:
            pack=['node',str(scripts/'pack_display.mjs'),str(out)]
            if simplification is not None:
                ratio,error=simplification
                pack.extend([str(ratio),str(error)])
            subprocess.run(pack,check=True)
            subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(out),str(target)],check=True)

    for item in items:
        mesh = item.data
        bpy.data.objects.remove(item, do_unlink=True)
        bpy.data.meshes.remove(mesh)
