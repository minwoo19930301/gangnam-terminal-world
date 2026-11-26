"""One assembled room scene for editing, baking and the wavy silver mirror."""
preview=bpy.data.scenes.new('G-011 · G-013 서편 점포');preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('서편 상가 확산광');preview.world.use_nodes=True
bg=preview.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.72,.71,.66,1);bg.inputs[1].default_value=.28
for key,(name,x,d,z) in parts.items():
    c=sources[key];ob=bpy.data.objects.new(name+' 배치',None);ob.instance_type='COLLECTION';ob.instance_collection=c
    ob.location=Vector((x,-d,z))-Vector(c['preview_origin']);ob['web_part']=key;ob.empty_display_size=.12;preview.collection.objects.link(ob)
def area(label,at,aim,power,color,size):
    light=bpy.data.lights.new(label,'AREA');light.energy=power;light.color=color;light.shape='DISK';light.size=size
    ob=bpy.data.objects.new(label,light);preview.collection.objects.link(ob);x,d,z=at;ob.location=(x,-d,z);x,d,z=aim;ob.rotation_euler=(Vector((x,-d,z))-ob.location).to_track_quat('-Z','Y').to_euler()
for x0,dep in [(-4.23,4.14),(6.95,2.93)]:
    for x in [x0-1.10,x0+.85]:
        for d in [.52,dep-.57]:area('매장 천장 다운라이트',(x,d,2.71),(x,d,.17),27,(1,.94,.85),.46)
    area('공용 통로에서 들어오는 빛',(x0,-2.5,2.1),(x0,1.9,1.12),115,(.94,.96,1),3.9)
area('거울 테두리의 푸른 간접등',(6.87,2.74,1.12),(6.87,.90,1.22),7,(.55,.80,1),.78)
# This small editing collection supplies just the native surroundings visible in the mirror.
# The game already owns the common hall's floor and ceiling.
hall=bpy.data.collections.new('거울에 보이는 공용 통로');preview.collection.children.link(hall);m.group=hall
B('문 앞의 노란 보행 타일',3.3,-.53,.018,18,.76,.019,'strip')
B('반사되는 회색 공용 바닥',3.3,-4,.009,18,7.4,.018,'tile')
B('공용 지하상가 천장',3.3,-4,2.78,18,7.4,.075,'wall')
for x in [0,2.2,4.4,6.6,8.8,11]:
    for d in [-1.2,-3.7,-6.0]:C('복도 매입 조명',x,d,2.77,[(.077,0),(.077,.012)],'white',14)
B('맞은편 통로의 밝은 마감',3.3,-7.5,.027,18,.075,2.76,'ivory')
for x in [.6,4.5,8.2,11.0]:B('통로의 덧기둥',x,-7.41,.03,.33,.10,2.69,'cream')
area('복도의 천장 확산 조명',(6.71,-2.5,2.68),(6.87,-3,.11),95,(.98,.94,.85),3.2)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        v=a.spaces.active;v.shading.color_type='MATERIAL';p=Vector((1.38,-1.35,1.00));v.region_3d.view_location=p
        v.region_3d.view_distance=14.4;v.region_3d.view_rotation=(p-Vector((1.8,10,3.62))).to_track_quat('-Z','Y')
