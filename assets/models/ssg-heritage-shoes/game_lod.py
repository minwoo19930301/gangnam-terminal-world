"""Reduce hidden tread walls and sub-millimetre stitching only in the game copy."""
import bpy
import bmesh
from mathutils import Vector


def simplify_threads(obj):
    source=obj.data;n=obj["stitchSection"]
    if len(source.vertices)%(n*3):
        return  # An artist replaced the mesh topology; keep their geometry.
    verts=[];faces=[]
    for k in range(0,len(source.vertices),n*3):
        a=[source.vertices[k+i].co.copy() for i in range(n)]
        b=[source.vertices[k+2*n+i].co.copy() for i in range(n)]
        axis=(sum(b,Vector())-sum(a,Vector())).normalized()
        center_a=sum(a,Vector())/n;center_b=sum(b,Vector())/n
        width=(a[0]-center_a)
        cross=axis.cross(width)
        for v in [width,cross]:
            i=len(verts);verts.extend([center_a-v,center_a+v,center_b+v,center_b-v])
            faces.append((i,i+1,i+2,i+3))
    game=bpy.data.meshes.new(obj.name+" · stitch ribbons")
    game.from_pydata(verts,[],faces);game.update()
    game.materials.append(source.materials[0]);obj.data=game
    if not source.users:bpy.data.meshes.remove(source)
    # These stitches are smaller than a screen pixel in normal play. The
    # original thread paths, widths and dye come from the edited native copy.
    return True


def simplify_tread(obj):
    mesh=obj.data
    if len(mesh.polygons)%5:return
    bm=bmesh.new();bm.from_mesh(mesh);bm.faces.ensure_lookup_table()
    hidden=[f for f in bm.faces if f.index%5!=4]
    bmesh.ops.delete(bm,geom=hidden,context="FACES")
    bm.to_mesh(mesh);bm.free();mesh.update()
