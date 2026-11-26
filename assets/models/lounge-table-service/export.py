"""Export the active editable tea service. Bake its assembled lighting into vertex colours and preserve the atlas UVs."""
from pathlib import Path
import sys
sys.dont_write_bytecode=True;sys.path.insert(0,str(Path(__file__).resolve().parent))
from tempfile import TemporaryDirectory
import subprocess,json
import bpy
import numpy as np

def berry_lod(source):
    from math import sin,cos,pi,tau
    from mathutils import Vector
    from finishes import SURFACES,COLS,ROWS
    x,d,z,r,tilt,half=source['web_berry'];n=22 if not half else 15;nrow=13
    index=list(SURFACES).index('berryGame');verts=[];uv=[];faces=[]
    for j in range(nrow+1):
        t=j/nrow;radius=r*max(.007,max(0,sin(pi*t))**.56*(.63+.64*t))
        for k in range(n+1):
            a=-pi+((pi if half else tau)*k/n)
            verts.append(source.matrix_world@Vector((x+radius*cos(a)+r*tilt*(1-t),-d-radius*sin(a),z+t*r*2.35)))
            uv.append(((index%COLS+.025+.95*((a+pi)/tau))/COLS,1-(index//COLS+.025+.95*(1-t))/ROWS))
    for j in range(nrow):
        for k in range(n):
            i=j*(n+1)+k;faces.append((i+n+1,i+n+2,i+1,i))
    return verts,faces,uv

def joined(coll):
    graph=bpy.context.evaluated_depsgraph_get();verts=[];faces=[];uvs=[];indices=[];smooth=[];mats=[];shine=[]
    for source in sorted(coll.objects,key=lambda o:o.name):
        if source.type!='MESH' or source.get('seeds_on_berry_atlas'):continue
        if source.get('web_berry'):
            v,f,uv=berry_lod(source);off=len(verts);verts.extend(v);mat=bpy.data.materials['berry']
            if mat not in mats:mats.append(mat)
            for face in f:
                faces.append(tuple(off+i for i in face));smooth.append(True);indices.append(mats.index(mat))
                for i in face:uvs.extend(uv[i]);shine.append(mat['browser_reflectance'])
            continue
        ob=source.evaluated_get(graph);src=ob.to_mesh()
        try:
            offset=len(verts);verts.extend(ob.matrix_world@p.co for p in src.vertices)
            uv=src.uv_layers.active
            for p in src.polygons:
                faces.append(tuple(offset+i for i in p.vertices));smooth.append(p.use_smooth)
                mat=src.materials[p.material_index]
                if mat not in mats:mats.append(mat)
                indices.append(mats.index(mat));spec=mat.get('browser_reflectance',.14)
                for i in p.loop_indices:uvs.extend(uv.data[i].uv if uv else (.035,.96));shine.append(spec)
        finally:ob.to_mesh_clear()
    mesh=bpy.data.meshes.new('테이블의 UV와 표면 결');mesh.from_pydata(verts,[],faces);mesh.update()
    for m in mats:mesh.materials.append(m.copy())
    mesh.polygons.foreach_set('material_index',indices);mesh.polygons.foreach_set('use_smooth',smooth)
    mesh.uv_layers.new(name='Table materials').uv.foreach_set('vector',uvs)
    return mesh,np.asarray(shine,dtype=np.float32)

def pack(here,ob,key):
    scripts=here.parents[2]/'tools'
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    with TemporaryDirectory() as tmp:
        path=Path(tmp)/(key+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(path),use_selection=True,export_format='GLB',export_yup=True,
            export_materials='NONE',export_vertex_color='ACTIVE',export_texcoords=True,export_animations=False)
        ratio=.42 if key in ['sweets','baskets','scones','flowers'] else .52
        subprocess.run(['node',str(scripts/'pack_display.mjs'),str(path),str(ratio),'.00185'],check=True)
        subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(path),str(here/(key+'.glb'))],check=True)

def export(here,groups,keys=None):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48
    scene.cycles.use_adaptive_sampling=False;scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=2;scene.cycles.seed=22
    for key,coll in groups.items():
        if keys is not None and key not in keys:continue
        visible=next(ob for ob in scene.objects if ob.instance_collection==coll)
        mesh,shine=joined(coll);ob=bpy.data.objects.new('Lounge_'+key,mesh);scene.collection.objects.link(ob)
        ob.matrix_world=visible.matrix_world.copy();visible.hide_render=True
        mats=list(mesh.materials)
        try:
            colored=mesh.color_attributes.new(name='Baked light',type='FLOAT_COLOR',domain='CORNER')
            mesh.color_attributes.active_color=colored
            for mat in mats:
                shader=mat.node_tree.nodes.get('Principled BSDF')
                for k,val in [('Metallic',0),('Roughness',.7),('Transmission Weight',0),('Subsurface Weight',0),('Coat Weight',0)]:
                    shader.inputs[k].default_value=val
            bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
            bpy.context.view_layer.update()
            if key.endswith('Glass'):
                light=np.ones((len(shine),3),dtype=np.float32)
            else:
                bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},target='VERTEX_COLORS',use_clear=True)
                samples=np.empty(len(colored.data)*4,dtype=np.float32);colored.data.foreach_get('color',samples)
                light=samples.reshape(-1,4)[:,:3]
            # The table continues to receive the game's own warm indoor fill. Keep contact
            # shadows and a little tint from the actual arrangement without clipping its highlights.
            # Cycles returns one stochastic estimate for every face corner. At a joined
            # vertex those estimates describe the same local fill; average them before
            # quantization to preserve indexed geometry and remove speckle.
            vi=np.empty(len(mesh.loops),dtype=np.int32);mesh.loops.foreach_get('vertex_index',vi)
            counts=np.maximum(1,np.bincount(vi,minlength=len(mesh.vertices)))
            mean=np.stack([np.bincount(vi,weights=light[:,c],minlength=len(counts))/counts for c in range(3)],axis=1)
            per_vertex=np.clip(.48+.36*np.sqrt(np.maximum(mean,0)),.45,1.32)/1.32
            gain=np.round(per_vertex*63)[vi]/63
            mesh.color_attributes.remove(colored)
            attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
            attr.data.foreach_set('color',np.column_stack([gain,shine]).astype(np.float32).ravel())
            mesh.color_attributes.active_color=attr;mesh.materials.clear()
            for f in mesh.polygons:f.material_index=0
            ob.matrix_world.identity();ob.location=(0,0,0);ob.rotation_euler=(0,0,0);ob.scale=(1,1,1);bpy.context.view_layer.update()
            print('EXPORT',key,len(mesh.polygons),'native evaluated faces, light percentiles',np.percentile(light,[10,50,90]).round(3),flush=True)
            pack(here,ob,key)
        finally:
            visible.hide_render=False;bpy.data.objects.remove(ob,do_unlink=True);bpy.data.meshes.remove(mesh)
            for mat in mats:bpy.data.materials.remove(mat)

def registry(here):
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {parts,rows,centers,prefix} from './layout.js';console.log(JSON.stringify({parts,rows,centers,prefix}));"],cwd=here))

if __name__=='__main__':
    here=Path(__file__).resolve().parent;cfg=registry(here)
    groups={key:bpy.data.collections[cfg['prefix']+d[0]] for key,d in cfg['parts'].items()}
    import sys
    only=set(sys.argv[sys.argv.index('--parts')+1:]) if '--parts' in sys.argv else None
    export(here,groups,only)
