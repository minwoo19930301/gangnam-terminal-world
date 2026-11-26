"""Build the editable Sinbanpo electric bus, its native paint and compressed game parts."""
from pathlib import Path
from tempfile import TemporaryDirectory
from math import sin,cos,tau
import sys,subprocess,base64,struct
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
tools=here.parents[2]/'tools'
sys.dont_write_bytecode=True
sys.path[:0]=[str(here),str(tools)]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from contact import ground_shadow
import body,cabin,headlamps,studio,instances
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['차량']='신반포로 간선버스 · 현대 일렉시티 일반형 공개 제원에 맞춘 정차 차량'
scene['형태 참고']='https://www.hyundai.com/kr/ko/c/products/bus/elec-city'
scene['서울 도색 참고']='https://map.naver.com/p?p=lHsXW6lxT97x-yAj0PFdXA,0,0,80,Float'
pigments={
 'blue':'2167A8','cyan':'428AB4','skyblue':'9FD6E8','black':'1D292F','rubber':'24282B','gasket':'222D31',
 'belt':'BCD4DE','roof':'EAEDEB','roof-line':'89999E','rubber-edge':'323B3D','groove':'1B1E20',
 'rim':'B1BEC2','rim-hole':'444D50','steel':'9FAEB0','underframe':'374245','panel-edge':'465C6B',
 'amber':'E4A02F','yellow':'E2B747','lamp':'DCF0E8','brake':'AC383A','reverse':'D3D7D1',
 'indicator':'D58538','plate':'E7AE42','mirror':'839EAA','glass':'98B6BC','seat-base':'596969',
 'seat-grey':'57727A','seat-teal':'547D89','seat-cap':'96A4A3','seat-yellow':'CBAD51','seat-pink':'AC6A82',
 'floor':'545F62','wheel-cover':'899292','pole':'BDC7C6','strap':'546767','grip':'DECF90',
 'blue-joint':'547B90','ceiling-lamp':'E7EEE5','terminal':'354A55','terminal-lit':'97C7BE',
 'driver':'5E676B','cabin-ceiling':'D8DDD6','far-glass':'344B58'}
for n,hexcol in pigments.items():
    metal=.55 if n in ['steel','rim','mirror'] else .20 if n in ['blue','roof','skyblue'] else .015
    mat=m.material(n,hexcol,metal)
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.26 if n in ['blue','rim','lamp','glass','mirror']else .55
    m.palette[n]=mat
def group(name):
    c=bpy.data.collections.new('간선버스 · '+name);scene.collection.children.link(c);c['preview_origin']=(0,0,0);m.group=c;return c
hull=group('도장 차체와 경량 휠')
body.shell();body.running_gear();body.surrounds()
lamps=group('전조등과 차폭등');headlamps.build()
interior=group('저상 승객석과 입석 손잡이')
cabin.build()
windows=group('곡면 유리와 출입문');body.windshield()
mat=m.palette['glass'];bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Alpha'].default_value=.24;mat.diffuse_color=(*mat.diffuse_color[:3],.24);mat.surface_render_method='BLENDED'
far=group('원거리 차체')
body.wrap('멀리서 보이는 차체', [(-5.48,1.068,.322,2.87),(-5.15,1.245,.315,3.0),(5.03,1.245,.315,2.98),(5.48,1.07,.366,2.80)],'blue')
body.wrap('멀리서 보이는 흰 지붕', [(-5.07,1.10,2.94,3.06),(-4.55,1.13,2.95,3.34),(4.33,1.13,2.95,3.34),(5.05,1.10,2.94,3.05)],'roof')
for side in [-1,1]:
    body.band('멀리서 보이는 연속 유리',side,-5.11,5.05,1.34,1.28,'far-glass',.015)
    body.band('창 밑 밝은 띠',side,-5.11,5.05,1.23,.06,'belt',.016)
    for a,b in body.window_bays(side):
        m.block('창 기둥',side*1.264,a,1.34,.028,.040,1.29,'black')
    for d in body.AXLES:
        body.ring('차륜 바깥쪽',(side*1.15,d,.479),'x',[(side*.08,.005),(side*.08,.465),(side*.138,.465),(side*.138,.005)],'rubber',12)
        body.ring('은색 휠',(side*1.15,d,.479),'x',[(side*.139,.005),(side*.139,.255),(side*.145,.255),(side*.145,.005)],'rim',12)
for end in [-1,1]:
    m.block('전후면 유리',0,5.482*end,1.12,2.083,.024,1.461,'far-glass')
    for sx in [-1,1]:
        m.block('전후면 등',sx*.907,5.498*end,.64,.177,.008,.108,'lamp'if end>0 else'brake')

def export_proxy(src):
    # Centimetre positions and sRGB bytes are enough for sub-pixel distant detail.
    graph=bpy.context.evaluated_depsgraph_get();verts={};tris=[]
    for obj in src.all_objects:
        ev=obj.evaluated_get(graph);mesh=ev.to_mesh()
        try:
            mesh.calc_loop_triangles()
            for tri in mesh.loop_triangles:
                color=mesh.materials[mesh.polygons[tri.polygon_index].material_index].diffuse_color
                rgb=tuple(round(255*(12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055))for c in color[:3])
                for i in tri.vertices:
                    x,y,z=ev.matrix_world@mesh.vertices[i].co
                    v=(round(x*100),round(z*100),round(-y*100),*rgb)
                    if v not in verts:verts[v]=len(verts)
                    tris.append(verts[v])
        finally:ev.to_mesh_clear()
    def b64(raw):return base64.b64encode(raw).decode()
    data=b''.join(struct.pack('<hhhBBB',*v)for v in verts)
    (here/'distant.js').write_text("// Generated from the editable distant bus collection, in centimetres.\nexport const vertexData='"+b64(data)+"';\nexport const indexData='"+b64(struct.pack('<'+'H'*len(tris),*tris))+"';\n")

def decals(route,image):
    group_=group(route+'번 노선 표시')
    mat=bpy.data.materials.new(route+'번 노선 원화');mat.use_nodes=True;shade=mat.node_tree.nodes.get('Principled BSDF')
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
    mat.node_tree.links.new(tex.outputs['Color'],shade.inputs['Base Color'])
    shade.inputs['Roughness'].default_value=.48
    vs=[];indices=[];coords=[];emissive=[]
    def patch(points,rect,illum=False):
        emissive.append(illum)
        n=len(vs);vs.extend((x,-d,z)for x,d,z in points);indices.append(tuple(range(n,n+4)))
        left,top,right,bottom=rect
        coords.extend([(left/1024,1-bottom/1024),(right/1024,1-bottom/1024),(right/1024,1-top/1024),(left/1024,1-top/1024)])
    for side in [-1,1]:
        # Local right direction from a viewer looking toward the side of the vehicle.
        def on_side(start,stop,lo,hi,uv,illum=False,across=1.259):
            a,b=(stop,start)if side>0 else(start,stop)
            patch([(side*across,a,lo),(side*across,b,lo),(side*across,b,hi),(side*across,a,hi)],uv,illum)
        on_side(.68,1.52,.722,1.083,(4,204,313,369))
        on_side(1.56,2.46,1.068,1.220,(12,532,1004,645))
        on_side(-4.08,-.91,1.075,1.633,(3,784,1019,1005),across=1.287)
        # The street-facing LED box sits behind a side window.
        on_side(-4.79,-3.99,2.249,2.405,(4,386,1010,513),True)
        if side<0:
            on_side(4.07,4.48,.969,1.061,(284,672,542,753))
            on_side(-.47,-.04,.969,1.061,(672,672,949,753))
    for side in [-1,1]:
        w=.925;d=(5.334 if side>0 else 5.338)*side
        patch([(-w*side,d,2.600),(w*side,d,2.600),(w*side,d,2.834),(-w*side,d,2.834)],(2,1,1021,193),True)
    mesh=bpy.data.meshes.new(route+'번 · 광고와 안내 표면');mesh.from_pydata(vs,[],indices);mesh.update();uv=mesh.uv_layers.new(name='노선 표시 영역')
    mat.node_tree.links.new(tex.outputs['Alpha'],shade.inputs['Alpha'])
    led=mat.copy();led.name=route+'번 · 발광 행선판'
    ls=led.node_tree.nodes.get('Principled BSDF')
    led.node_tree.links.new(led.node_tree.nodes[tex.name].outputs['Color'],ls.inputs['Emission Color'])
    ls.inputs['Emission Strength'].default_value=1
    mesh.materials.append(mat);mesh.materials.append(led)
    for face,lit in zip(mesh.polygons,emissive):
        face.material_index=int(lit)
        for li in face.loop_indices:uv.data[li].uv=coords[mesh.loops[li].vertex_index]
    obj=bpy.data.objects.new('Route'+route,mesh);group_.objects.link(obj)
    return group_,obj

def export_surfaces(obj,file,temp):
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    stage=temp/(file.stem+'-raw.glb')
    bpy.ops.export_scene.gltf(filepath=str(stage),use_selection=True,export_format='GLB',export_image_format='WEBP',
        export_image_quality=94,export_animations=False,export_lights=False)
    subprocess.run(['node',str(tools/'optimize_model.mjs'),str(stage),str(file)],check=True)

with TemporaryDirectory(prefix='sinbanpo-citybus-') as cache:
    tmp=Path(cache);subprocess.run(['node',str(here/'livery.mjs'),str(tmp)],check=True)
    signs=[]
    for route in ['142','360']:
        img=bpy.data.images.load(str(tmp/(route+'.webp')));img.name=route+'번 · 자체 제작 행선판과 차체 도색';img.pack()
        g,obj=decals(route,img);signs.append(g);export_surfaces(obj,here/(route+'.glb'),tmp)
    ground_shadow(hull,tmp,here/'contact.webp')
    headlamps.bake(hull,lamps,tmp,here/'beams.webp')
    beam=bpy.data.images.load(str(here/'beams.webp'));beam.name='두 하향 전조등의 노면 광분포';beam.pack();beam.use_fake_user=True
    bake_collection(lamps,'LitLenses',here/'lamps.glb')
    reflection=bpy.data.images.load(str(here/'reflections.webp'));reflection.name='신반포로 양방향 · 낮밤 차창 반사 원본'
    reflection.pack();reflection.use_fake_user=True
    occlusion=bpy.data.images.load(str(here/'contact.webp'));occlusion.name='차륜과 차대 · 보도 가림';occlusion.pack();occlusion.use_fake_user=True
    export_proxy(far)
    scene.name='신반포로 · 정차 중인 간선버스'
    studio.prepare(scene,[hull,interior,windows,lamps,signs[0]])
    for unused in [far,signs[1]]:
        scene.view_layers[0].layer_collection.children[unused.name].exclude=True
    bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(here/'city-bus.blend'),compress=True)
    # Keep the authoring bevels in the saved master. The smallest pressed edges
    # are smaller than a pixel from the kerb and need just one chamfer segment.
    for c in [interior,hull]:
        for obj in c.objects:
            for bevel in obj.modifiers:
                if bevel.type=='BEVEL' and bevel.width<=.031:
                    bevel.segments=1
                    if bevel.width<=.006:bevel.show_viewport=False
    bpy.context.view_layer.update()
    bake_collection(hull,'CityBody',here/'body.glb',(.90,.0004),preserve_smoothing=True)
    instances.export(interior,tmp)
    bake_collection(windows,'ShapedGlazing',here/'glass.glb')
