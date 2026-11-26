"""Bake local occlusion into editable vertex attributes for the fixed shop fixtures."""
from math import cos, pi, sin, sqrt
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

LAYER='Shop contact'


def bake(collections):
    graph=bpy.context.evaluated_depsgraph_get()
    solids=[ob for c in collections for ob in c.objects if ob.type=='MESH']
    vertices=[];polygons=[]
    for source in solids:
        obj=source.evaluated_get(graph);mesh=obj.to_mesh();offset=len(vertices)
        vertices.extend(obj.matrix_world @ v.co for v in mesh.vertices)
        polygons.extend(tuple(i+offset for i in face.vertices) for face in mesh.polygons)
        obj.to_mesh_clear()
    tree=BVHTree.FromPolygons(vertices,polygons)
    # A deterministic cosine-weighted hemisphere, restricted to local contacts.
    rays=[]
    for i in range(14):
        zz=sqrt((i+.5)/14);rr=sqrt(1-zz*zz);angle=i*pi*(3-sqrt(5))
        rays.append((rr*cos(angle),rr*sin(angle),zz))
    for source in solids:
        mesh=source.data;world=source.matrix_world;normal_matrix=world.to_3x3().inverted().transposed()
        values=[]
        for vertex in mesh.vertices:
            normal=(normal_matrix @ vertex.normal).normalized()
            if normal.length_squared<.5:
                values.extend((1,1,1,1));continue
            side=normal.cross(Vector((0,0,1) if abs(normal.z)<.84 else (1,0,0))).normalized()
            cross=normal.cross(side)
            origin=world @ vertex.co+normal*.006
            shade=0
            for a,b,n in rays:
                distance=tree.ray_cast(origin,side*a+cross*b+normal*n,.48)[3]
                if distance is not None:shade+=(1-distance/.48)**1.2
            light=1-.63*shade/len(rays)
            values.extend((light,light,light,1))
        attr=mesh.color_attributes.get(LAYER) or mesh.color_attributes.new(name=LAYER,type='BYTE_COLOR',domain='POINT')
        attr.data.foreach_set('color',values)


def show_native(materials):
    for mat in materials:
        tree=mat.node_tree
        shader=tree.nodes.get('Principled BSDF')
        base=shader.inputs['Base Color']
        source=base.links[0].from_socket if base.is_linked else None
        mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        if source:tree.links.new(source,mix.inputs[1])
        else:mix.inputs[1].default_value=mat.diffuse_color
        attr=tree.nodes.new('ShaderNodeVertexColor');attr.layer_name=LAYER
        tree.links.new(attr.outputs['Color'],mix.inputs[2])
        tree.links.new(mix.outputs['Color'],base)
