"""Bake local indirect shadows by ray-testing the editable underside and tyre profiles."""
from math import sqrt,cos,sin,pi
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import numpy as np
import struct,zlib,subprocess
from pathlib import Path
import bpy

def ground_shadow(frame,tmp,output):
    graph=bpy.context.evaluated_depsgraph_get();verts=[];faces=[]
    for ob in frame.all_objects:
        if ob.type!='MESH' or min(v[2] for v in ob.bound_box)>1.5:continue
        e=ob.evaluated_get(graph);mesh=e.to_mesh()
        try:
            off=len(verts);mesh.calc_loop_triangles()
            verts.extend(e.matrix_world@v.co for v in mesh.vertices)
            faces.extend(tuple(off+i for i in t.vertices)for t in mesh.loop_triangles)
        finally:e.to_mesh_clear()
    tree=BVHTree.FromPolygons(verts,faces,all_triangles=True)
    count=56;rays=[]
    for k in range(count):
        radius=sqrt((k+.5)/count);angle=2.399963229728653*k
        rays.append(Vector((radius*cos(angle),radius*sin(angle),sqrt(1-radius*radius))))
    # Centre the receiver around the two actual axles. Start above the road.
    w,h=144,320;img=np.zeros((h,w),dtype=np.uint8)
    for j in range(h):
        d=((j+.5)/h-.5)*14
        for i in range(w):
            x=((i+.5)/w-.5)*5.8
            o=Vector((x,-d,.008));occ=0
            for direction in rays:
                pt,_,_,length=tree.ray_cast(o,direction,2.1)
                if pt is not None:occ+=(1-length/2.1)**1.42
            img[j,i]=round(255*(1-.79*min(1,occ/count)))
    def chunk(k,d):return struct.pack('!I',len(d))+k+d+struct.pack('!I',zlib.crc32(k+d)&0xffffffff)
    stream=b''.join(b'\x00'+row.tobytes() for row in img)
    png=tmp/'contact.png';png.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,0,0,0,0))+chunk(b'IDAT',zlib.compress(stream,9))+chunk(b'IEND',b''))
    subprocess.run(['node',str(Path(__file__).with_name('contact.mjs')),str(png),str(output)],check=True)
