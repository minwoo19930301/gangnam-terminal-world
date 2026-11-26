"""Batch-export edited Blender collections and apply the project's lossless meshoptimizer pipeline."""
import bpy
import json
import subprocess
import tempfile
from pathlib import Path
from mathutils import Vector

ROOT=Path(bpy.data.filepath).resolve().parent
REPO=ROOT.parents[2]


def write_vault_contacts(coll, target):
    deps = bpy.context.evaluated_depsgraph_get()
    origin = Vector(coll['preview_origin'])
    # Preserve the edited vault underside, including the pitched glazing.
    # Store one Blender bay in local metres. The last game instance is shorter.
    points, indices, triangles = [], {}, []
    for source in sorted(coll.all_objects, key=lambda obj: obj.name):
        if not source.get('gallery_soffit'):
            continue
        evaluated = source.evaluated_get(deps)
        data = evaluated.to_mesh()
        try:
            data.calc_loop_triangles()
            for face in data.loop_triangles:
                triangle = []
                for vertex in face.vertices:
                    position = evaluated.matrix_world @ data.vertices[vertex].co - origin
                    key = tuple(round(float(axis), 5) for axis in position)
                    if key not in indices:
                        indices[key] = len(points)
                        points.append(key)
                    triangle.append(indices[key])
                triangles.append(triangle)
        finally:
            evaluated.to_mesh_clear()
    if not triangles:
        raise ValueError('The gallery roof has no tagged undersides')
    content = '// Generated from the tagged soffit faces in interiors.blend.\n'
    for name, rows in [('vaultPoints', points), ('vaultTriangles', triangles)]:
        content += 'export const ' + name + ' = [\n'
        content += ''.join('  ' + json.dumps(row,separators=(',', ':')) + ',\n' for row in rows)
        content += '];\n'
    target.write_text(content)


def export_models():
    deps=bpy.context.evaluated_depsgraph_get()
    with tempfile.TemporaryDirectory() as tmp:
        for coll in sorted([c for c in bpy.data.collections if c.get('export_model')],key=lambda c:c.name):
            file=coll['export_model']
            origin=Vector(coll['preview_origin'])
            if file == 'gallery-rib':
                write_vault_contacts(coll, ROOT / 'vault-contact.js')
            selected=[]
            for lit in (False,True):
                verts,faces,colors,smooth=[],[],[],[]
                for source in sorted(coll.all_objects,key=lambda o:o.name):
                    if source.type != 'MESH': continue
                    ev=source.evaluated_get(deps)
                    data=ev.to_mesh()
                    try:
                        remap={}
                        for face in data.polygons:
                            m=data.materials[face.material_index]
                            if bool(m.get('lit_face')) != lit: continue
                            indices=[]
                            for idx in face.vertices:
                                if idx not in remap:
                                    remap[idx]=len(verts)
                                    verts.append((ev.matrix_world @ data.vertices[idx].co)-origin)
                                indices.append(remap[idx])
                            faces.append(indices)
                            colors.append((*m.diffuse_color[:3], 0.0 if m.get("skylight") else m.diffuse_color[3]))
                            smooth.append(face.use_smooth)
                    finally: ev.to_mesh_clear()
                if not faces:continue
                name='Diffuser' if lit else 'Surface'
                data=bpy.data.meshes.new(name)
                data.from_pydata(verts,[],faces)
                data.update()
                attr=data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
                for face,color,smoothed in zip(data.polygons,colors,smooth):
                    face.use_smooth=smoothed
                    for idx in face.loop_indices:attr.data[idx].color=color
                item=bpy.data.objects.new(name,data)
                bpy.context.scene.collection.objects.link(item)
                selected.append(item)
            bpy.ops.object.select_all(action='DESELECT')
            for item in selected:item.select_set(True)
            raw=Path(tmp)/(file+'.glb')
            bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,
                export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
            subprocess.run(['node',str(REPO/'tools/optimize_model.mjs'),str(raw),str(ROOT/(file+'.glb'))],check=True,cwd=REPO)
            for item in selected:bpy.data.objects.remove(item,do_unlink=True)


if __name__ == '__main__':
    export_models()
