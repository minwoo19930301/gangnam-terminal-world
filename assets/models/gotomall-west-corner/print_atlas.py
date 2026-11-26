"""Orthographically print the original flat artwork onto individual textured photo papers for the web."""
from pathlib import Path
from tempfile import TemporaryDirectory
from mathutils import Vector
import bpy, json, subprocess

def export_papers(src,here):
    origin=Vector(src['preview_origin']);items=[];papers=[]
    def srgb(v):return round(255*(12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055))
    for ob in sorted(src.all_objects,key=lambda o:o.name):
        points=[]
        for pt in ob.data.vertices:
            x,y,z=ob.matrix_world@pt.co-origin;points.append((x,-y,z))
        if ob.name.startswith('인화지의 흰 가장자리'):
            papers.append([min(p[0] for p in points),max(p[0] for p in points),min(p[2] for p in points),max(p[2] for p in points),min(p[1] for p in points)])
        for poly in ob.data.polygons:
            verts=[points[i] for i in poly.vertices]
            if max(p[1] for p in verts)-min(p[1] for p in verts)>.00028:continue
            mat=ob.data.materials[poly.material_index];rgb=''.join('%02x'%srgb(c) for c in mat.diffuse_color[:3])
            items.append([sum(p[1] for p in verts)/len(verts),rgb,[[p[0],p[2]] for p in verts]])
    papers.sort(key=lambda p:(p[4],p[2],p[0]))
    tiles=[[] for p in papers]
    for d,c,points in sorted(items,key=lambda r:-r[0]):
        x=sum(p[0] for p in points)/len(points);z=sum(p[1] for p in points)/len(points)
        for i,(a,b,lo,hi,front) in enumerate(papers):
            if a-.0001<=x<=b+.0001 and lo-.0001<=z<=hi+.0001 and abs(d-front)<.021:
                tiles[i].append([c,[[round((px-a)/(b-a),5),round((hi-pz)/(hi-lo),5)] for px,pz in points]])
                break
    with TemporaryDirectory() as temp:
        data=Path(temp)/'cut-paper.json';data.write_text(json.dumps([papers,tiles],separators=(',',':')))
        subprocess.run(['node',str(here/'print-atlas.mjs'),str(data),str(here/'samples.glb')],check=True)
