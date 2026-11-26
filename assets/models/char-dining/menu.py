"""Build the seen-through-the-gallery menu from our own plated food, with a printable native material."""
from tempfile import TemporaryDirectory
scene=bpy.data.scenes.new('차알 요리 사진 촬영');scene.render.engine='CYCLES';scene.cycles.samples=12
scene.world=bpy.data.worlds.new('음식 인쇄를 위한 스튜디오 조명');scene.world.use_nodes=True
bg=scene.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.88,.84,.75,1);bg.inputs[1].default_value=.62
scene.render.resolution_x=296;scene.render.resolution_y=224;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX'
cam=bpy.data.cameras.new('인쇄용 음식 카메라');cam.type='ORTHO';cam.ortho_scale=.415
obj=bpy.data.objects.new('메뉴 촬영',cam);scene.collection.objects.link(obj);obj.location=(.21,-.58,.79);obj.rotation_euler=(Vector((0,0,.045))-obj.location).to_track_quat('-Z','Y').to_euler();scene.camera=obj
lights=[]
for loc,energy,area in [((-.4,.35,.73),13,.65),((.42,-.19,.68),7,.48)]:
    light=bpy.data.lights.new('인쇄물용 소프트박스','AREA');light.energy=energy;light.size=area
    ob=bpy.data.objects.new(light.name,light);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(-ob.location).to_track_quat('-Z','Y').to_euler();lights.append((ob,light))
with TemporaryDirectory() as folder:
    for key in ('mala','rice','eggplant'):
        group=subjects[key];scene.collection.children.link(group);scene.render.filepath=str(Path(folder)/(key+'.png'))
        bpy.ops.render.render(write_still=True,scene=scene.name);scene.collection.children.unlink(group)
    subprocess.run(['node',str(here/'menu-art.mjs'),folder],check=True)
    image=bpy.data.images.load(str(Path(folder)/'menu.png'));image.name='차알 식사 메뉴 · 직접 촬영한 세 가지 요리';image.pack();image.filepath='//menu.png'
world=scene.world;bpy.data.scenes.remove(scene)
for ob,light in lights:bpy.data.objects.remove(ob,do_unlink=True);bpy.data.lights.remove(light)
bpy.data.objects.remove(obj,do_unlink=True);bpy.data.cameras.remove(cam);bpy.data.worlds.remove(world)
bpy.context.window.scene=source
host=subjects['host'];section(host,'검은 금속 스탠드와 두 쪽짜리 메뉴 지지대')
# Relative to the native host console; the printed paper has its own close-view placement.
hx,hd,_=parts['host'][1:];x,d,_=parts['menu'][1:];dx=x-hx;dd=d-hd
B('낮은 사각 받침판',dx,dd+.032,.045,.436,.297,.029,'black',.009)
for sx in [-.205,.205]:
    tube('메뉴대의 가는 다리',[(dx+sx,dd+.041,.071),(dx+sx,dd+.041,1.019)],.014,'ink',9)
tube('상판 아래 가로 지지봉',[(dx-.36,dd+.03,.966),(dx+.36,dd+.03,.966)],.011,'black',9)
width=.842;height=.558;bottom=.986
def face(x,level,layer):return (x,-.037+level*.085+layer,bottom+level*height)
def board(name,cx,depth,w,layer,material):
    verts=[(dx+cx+xx,dd+zz,h) for off in [0,layer] for xx,zz,h in [face(-w/2,0,depth+off),face(w/2,0,depth+off),face(w/2,1,depth+off),face(-w/2,1,depth+off)]]
    return m.piece(name,verts,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],material)
board('얇은 두 장의 쪽을 받치는 검은 프레임',0,.009,width+.019,.025,'black')
for sx in [-.21,.21]:
    board('메뉴 뒷판에 혀처럼 얹힌 나무판',sx,.004,width/2-.003,.006,'walnut')
for sx in [-.358,0,.358]:
    B('인쇄물을 받치는 검은 하단 걸쇠',dx+sx,dd-.046,bottom-.008,.064,.027,.023,'black',.003)
col=part('menu');section(col,'블렌더 요리 사진과 한영 메뉴가 담긴 인쇄물')
material=m.material('얇은 아이보리 인쇄지','ffffff');shader=material.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.83
tex=material.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;material.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color']);m.palette['printed menu']=material
v=[face(-width/2,0,0),face(width/2,0,0),face(width/2,1,0),face(-width/2,1,0)]
sheet=m.piece('금속 틀 안의 차알 메뉴 두 쪽',v,[(0,1,2,3)],'printed menu')
uv=sheet.data.uv_layers.new(name='인쇄 면');coords=[(1,0),(0,0),(0,1),(1,1)]
for loop in sheet.data.loops:uv.data[loop.index].uv=coords[loop.vertex_index]
