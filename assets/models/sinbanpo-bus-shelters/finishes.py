"""Pack the shelter's editable metalwork and seat into one textured, shaded draw."""
from pathlib import Path
import struct, zlib, subprocess
import bpy
from mathutils import Vector
import numpy as np
from header import PRINTED_PREFIXES

def swatches(target):
    w,h=512,256;yy,xx=np.mgrid[:h,:w];rng=np.random.default_rng(222020)
    x=xx/w;y=yy[:h//2]/(h//2)
    # Long, irregular oak fibres, porosity and small cathedral patterns.
    xf=x[:h//2]
    phase=y*44+.79*np.sin(xf*8.1)+.36*np.sin(xf*24+y*9)
    grain=np.power(.5+.5*np.sin(phase*6.283),10)*21
    knot=(1-np.exp(-((xf-.36)**2/.008+(y-.47)**2/.09)))*4
    amber=np.clip(244-grain-knot+3*np.sin(y*47+xf*7)+rng.normal(0,2.7,xf.shape),0,255)
    wood=np.stack([amber,amber*.992,amber*.978],axis=-1)
    powder=np.clip(243+rng.normal(0,3.8,xf.shape)+rng.normal(0,.8,(h//2,1)),0,255)
    metal=np.repeat(powder[:,:,None],3,axis=2)
    pixels=np.vstack([metal,wood]).astype(np.uint8)
    pixels[2:12,2:12]=255
    def ch(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
    raw=b''.join(b'\0'+row.tobytes() for row in pixels)
    target.write_bytes(bytes.fromhex('89504e470d0a1a0a')+ch(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw,8))+ch(b'IEND',b''))

def surface_texture(image):
    m=bpy.data.materials.new('승차대 · 도장 금속과 나무 표면');m.use_nodes=True
    nodes=m.node_tree.nodes;links=m.node_tree.links;bs=nodes.get('Principled BSDF')
    img=nodes.new('ShaderNodeTexImage');img.image=image
    links.new(img.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.52
    return m

def merged_frame(collection,image,target,tmp,tools):
    v=[];faces=[];corners=[];origin=Vector(collection['preview_origin'])
    graph=bpy.context.evaluated_depsgraph_get()
    for part in sorted(collection.objects,key=lambda x:x.name):
        if part.type!='MESH' or part.name.startswith(PRINTED_PREFIXES):continue
        obj=part.evaluated_get(graph);mesh=obj.to_mesh()
        try:
            world=obj.matrix_world;start=len(v)
            pts=[world @ vertex.co-origin for vertex in mesh.vertices]
            v.extend(pts)
            for face in mesh.polygons:
                face_pts=[pts[i] for i in face.vertices];faces.append(tuple(start+i for i in face.vertices))
                material=mesh.materials[face.material_index];tint=material.diffuse_color[:3]
                is_wood=material.name.startswith('좌판')
                is_dull=material.name.startswith(('강재','도장','고무','아연','좌판','알루미늄','아노다이징'))
                normal=world.to_3x3() @ face.normal
                # Rounded corner normals and surface colour remain separate: sunlight
                # still turns with Seoul's clock on the exterior fixture.
                for p in face_pts:
                    if is_wood:
                        uv=(.03+.94*(p.x+2.13)/4.26,.025+.43*((-p.y+.99)/1.75))
                        shade=.90+.08*min(1,max(0,(p.z-.35)*3))
                    elif is_dull:
                        u=(p.x+3.55)/7.12 if abs(normal.x)<.7 else (-p.y+1.2)/2.45
                        t=p.z/3.03 if abs(normal.z)<.7 else (-p.y+1.2)/2.45
                        uv=(min(.986,max(.018,.018+u*.965)),min(.98,max(.52,.52+t*.46)))
                        shade=.83+.14*min(1,max(0,p.z/2.6))
                    else:
                        uv=(.012,.976);shade=1.
                    corners.append(((uv[0]/3,uv[1]*2/3),(*[c*shade for c in tint],1)))
        finally:obj.to_mesh_clear()
    # Match the geometry of both printed faces. The customer's reading direction
    # flips across the street side; the artwork reads normally on either side.
    for face in [-1,1]:
        offset=len(v);d=-.89+face*.067
        points=[(-3.28,-d,2.202),(3.28,-d,2.202),(3.28,-d,2.523),(-3.28,-d,2.523)]
        v.extend(points)
        order=[0,1,2,3] if face>0 else [1,0,3,2]
        faces.append(tuple(offset+i for i in order))
        lo=(384-14-75+.4)/384;hi=(384-14-.4)/384
        corners.extend(((uv,(1,1,1,1)) for uv in [(.0003,lo),(.9997,lo),(.9997,hi),(.0003,hi)]))
    geo=bpy.data.meshes.new('실제 부속 · 도장·좌판 한 표면');geo.from_pydata(v,[],faces);geo.update()
    uv=geo.uv_layers.new(name='도장과 나무결')
    uv.uv.foreach_set('vector',[v for a,_ in corners for v in a])
    rgba=geo.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for i,(_,col) in enumerate(corners):rgba.data[i].color=col
    item=bpy.data.objects.new('Frame',geo);bpy.context.scene.collection.objects.link(item)
    geo.materials.append(surface_texture(image))
    bpy.ops.object.select_all(action='DESELECT');item.select_set(True)
    stage=tmp/'frame.glb'
    bpy.ops.export_scene.gltf(filepath=str(stage),use_selection=True,use_active_scene=True,export_format='GLB',
        export_vertex_color='ACTIVE',export_yup=True,export_image_format='WEBP',export_image_quality=82,export_animations=False)
    subprocess.run(['node',str(tools/'pack_display.mjs'),str(stage),'.63','.00038'],check=True)
    subprocess.run(['node',str(tools/'optimize_model.mjs'),str(stage),str(target)],check=True)
    bpy.data.objects.remove(item,do_unlink=True)
    bpy.data.meshes.remove(geo)
