"""Export the saved artist-editable bricks and frame to one bounded game mesh."""
from pathlib import Path
import sys,bpy
from mathutils import Matrix
OUT=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(OUT))
from mosaic_model import FRAME,NAME,TRIM,WIDTH,HEIGHT,SILL
from mosaic_atlas import bake,AW,AH,STEP,W,H

def write(collection):
    source=[o for o in collection.objects if o.get('retailPackage')=='LegoRiverWall']
    modules=[o for o in source if o.get('moduleGrid') is not None]
    if len(modules)!=160:raise ValueError('Expected the 160 editable brick panels in the native collection')
    images=bake(modules);mat=bpy.data.materials.new(NAME+' Finish');mat.use_nodes=True
    nt=mat.node_tree;sh=nt.nodes['Principled BSDF'];sh.inputs['Roughness'].default_value=.35;sh.inputs['Emission Strength'].default_value=.9
    for idx,im in enumerate(images):
        t=nt.nodes.new('ShaderNodeTexImage');t.image=im
        if idx<2:
            nt.links.new(t.outputs['Color'],sh.inputs['Base Color' if idx==0 else 'Emission'])
        else:
            norm=nt.nodes.new('ShaderNodeNormalMap');norm.inputs['Strength'].default_value=.65
            nt.links.new(t.outputs['Color'],norm.inputs['Color']);nt.links.new(norm.outputs['Normal'],sh.inputs['Normal'])
    vs=[];fs=[];uvs=[]
    for ob in source:
        t=FRAME.inverted()@ob.matrix_world;m=ob.data
        if 'moduleGrid'in ob:
            px,py=ob['moduleGrid'];corners=[(0,0,0),(15,0,1),(15,15,2),(0,15,3)]
            ids=[];tex=[]
            for i,j,q in corners:
                pos=t@m.vertices[(j*16+i)*8+4+q].co
                pos.x+=(-.00052 if i==0 else .00052);pos.z+=(-.00052 if j==0 else .00052)
                ids.append(len(vs));vs.append(pos)
                tex.append(((px+(i>0))*16*STEP/AW,(py+(j>0))*16*STEP/AH))
            fs.append(ids);uvs.append(tex)
        else:
            base=len(vs);vs.extend([t@v.co for v in m.vertices])
            idx=list(TRIM).index(ob['frameFinish']);uv=((W*STEP+16)/AW,(idx*36+18)/AH)
            for f in m.polygons:
                fs.append([base+n for n in f.vertices]);uvs.append([uv]*len(f.vertices))
    mesh=bpy.data.meshes.new(NAME);mesh.from_pydata(vs,[],fs);mesh.update();mesh.materials.append(mat)
    uv=mesh.uv_layers.new(name='Baked brick portrait')
    for face,coords in zip(mesh.polygons,uvs):
        for li,point in zip(face.loop_indices,coords):uv.data[li].uv=point
    ob=bpy.data.objects.new(NAME,mesh);bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.export_scene.gltf(filepath=str(OUT/'mosaic.glb'),export_format='GLB',use_selection=True,export_animations=False)
    bpy.data.objects.remove(ob,do_unlink=True)
    for o in source:bpy.data.objects.remove(o,do_unlink=True)
if __name__=='__main__':
    write(bpy.data.collections['SSG_10F_LEGO_Gangnam'])
