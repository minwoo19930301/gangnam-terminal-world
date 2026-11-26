"""Export the editable display in the open blend file."""
from pathlib import Path
from math import exp
import bpy

out=Path(__file__).resolve().parent
collection=bpy.data.collections["SSG_9F_Gatevision"]
base=.53
for group in ('Cabinet','Shell','Liner'):
    parts=[o for o in collection.objects if o.data.materials[0].get('batch')==group]
    shared=bpy.data.materials.new('Gatevision '+group);shared.use_nodes=True
    bs=shared.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value={'Cabinet':.48,'Shell':.31,'Liner':.72}[group]
    color=shared.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='Tint'
    shared.node_tree.links.new(color.outputs['Color'],bs.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        tint=o.data.materials[0].diffuse_color[:]
        attr=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        # Soft display lighting, including the partial shadow cast by the bonnet
        # inside the globe. Native objects retain their own editable materials.
        normals=o.matrix_world.to_3x3().inverted_safe().transposed()
        for vertex,value in zip(o.data.vertices,attr.data):
            n=(normals @ vertex.normal).normalized()
            point=o.matrix_world @ vertex.co
            diffuse=.77+.18*n.z-.09*n.x-.08*n.y
            spec=0
            if group=='Shell':
                diffuse=.57+.33*n.z-.13*n.x-.12*n.y
                spec=.092*exp(-((n.x+.41)/.20)**2-((n.z-.67)/.27)**2)
            elif group=='Liner':
                diffuse=.77+.13*n.z-.12*n.x
                if o.name.startswith('Concave rotating'):
                    diffuse *= .74+.28*(point.z-base)
            value.color=tuple(min(1,max(0,c*diffuse+spec)) for c in tint[:3])+(1,)
        o.data.materials.clear();o.data.materials.append(shared);o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    bpy.context.object.name='GatevisionLR4'+group
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'boutique.glb'),export_format='GLB',export_animations=False,export_yup=True,export_texcoords=False)
