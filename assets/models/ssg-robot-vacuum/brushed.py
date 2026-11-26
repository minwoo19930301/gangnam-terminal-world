"""Capture a soft local reflection of the fixed products on each satin door.

The native doors retain their physical metal finish. A few roughness-spread
rays per game vertex approximate the nearby merchandise in the web shader.
Only these two curved fronts receive the static component.
"""
import bpy
from math import cos,sin,pi,sqrt
from mathutils import Vector

def local_reflections(collection):
    candidates=[o for o in collection.objects if o.get('satinFront')]
    if not candidates:
        return {}
    bpy.context.view_layer.update()
    graph=bpy.context.evaluated_depsgraph_get()
    result={}
    for panel in candidates:
        values=[]
        center=sum((panel.matrix_world @ v.co for v in panel.data.vertices),Vector())/len(panel.data.vertices)
        eye=Vector((center.x-.14,center.y-.88,1.61))
        base=panel.data.materials[0].diffuse_color[:3]
        for v in panel.data.vertices:
            spot=panel.matrix_world@v.co
            n=(panel.matrix_world.to_3x3()@v.normal).normalized()
            ray=(spot-eye).normalized().reflect(n)
            u=ray.cross(Vector((0,0,1))).normalized(); w=u.cross(ray).normalized()
            reflected=Vector()
            for k in range(13):
                theta=k*pi*(3-sqrt(5)); radius=.140*sqrt(k/12)
                r=(ray+u*(radius*cos(theta))+w*(radius*sin(theta))).normalized()
                hit,_,_,face,ob,_=bpy.context.scene.ray_cast(graph,spot+n*.0016,r,distance=2.9)
                if hit and ob!=panel and ob.type=='MESH' and ob.data.materials:
                    mat=ob.data.materials[ob.data.polygons[face].material_index]
                    c=Vector(mat.diffuse_color[:3])
                else:
                    c=Vector((.82,.85,.89) if r.z>0 else (.56,.46,.35))
                reflected+=c/13
            tint=[min(.98,max(.016,.60*b+.41*r)) for b,r in zip(base,reflected)]
            values.append((*tint,1))
        result[panel.name]=values
    return result
