"""Furnished restaurant with editable lights and the same repeated tables as the game."""
preview=bpy.data.scenes.new('FP218 · 차알 식사 공간');preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('2층 홀의 색온도');preview.world.use_nodes=True
bg=preview.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.76,.71,.64,1);bg.inputs[1].default_value=.28
for key,(name,x,d,z) in parts.items():
    col=subjects[key];coords=tables if key in ('seat','granite','setting') else spec['lamps'] if key=='lamp' else [[x,d]]
    for i,(xx,dd) in enumerate(coords):
        ob=bpy.data.objects.new(name+(' '+str(i+1) if len(coords)>1 else ''),None);ob.instance_type='COLLECTION';ob.instance_collection=col
        ob.location=Vector((xx,-dd,z))-Vector(col['preview_origin']);ob.empty_display_size=.14;ob['web_part']=key;preview.collection.objects.link(ob)
def area(label,loc,aim,power,tint,sz):
    light=bpy.data.lights.new(label,'AREA');light.energy=power;light.color=tint;light.shape='DISK';light.size=sz
    ob=bpy.data.objects.new(label,light);preview.collection.objects.link(ob);x,d,z=loc;ob.location=(x,-d,z);x,d,z=aim;ob.rotation_euler=(Vector((x,-d,z))-ob.location).to_track_quat('-Z','Y').to_euler()
for x,d in spec['lamps']:area('분기형 샹들리에 아래로 비추는 빛',(x,d,2.82),(x,d,.76),47,(1,.83,.62),.64)
for x in [-4.8,-2.5,0,2.6,4.9]:
    for d in [1.16,4.92]:area('천장의 다운라이트',(x,d,3.36),(x,d+.19,.84),24,(1,.94,.80),.23)
area('회랑 쪽 점포 조명',(-.87,-3.7,2.85),(0,2.78,1.19),136,(.92,.96,1),4.9)
area('노란 벽을 비추는 간접등',(0,4.0,2.93),(0,5.88,1.72),34,(1,.88,.68),2.75)
# The cropped public gallery is visible inside the three mirror frames while rendering the local reflections.
context=bpy.data.collections.new('거울에 비치는 파미에 회랑');preview.collection.children.link(context);m.group=context
B('회랑 반사용 바닥',0,-1.65,.012,13.3,3.35,.026,'granite');B('경계 너머 복도 천장',0,-1.65,3.43,13.3,3.35,.12,'black')
B('복도 건너편의 벽 마감',0,-3.34,.032,13.5,.14,3.40,'cream')
for j in range(-6,7):
    if j not in [-3,-2]:B('회랑 앞 어두운 세로 봉',j,.021,.046,.046,.047,1.04,'black')
for x0,x1 in [(-6.15,-3.26),(-2.03,6.14)]:B('회랑 낮은 철제 난간',(x0+x1)/2,.02,1.02,x1-x0,.045,.054,'black')
for j in range(3):
    for k in range(5):B('맞은편 안내판의 작은 황동 명패',.24+k*.63,-3.253,1.07+j*.49,.52,.031,.37,'brass',.007)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        sp=a.spaces.active;sp.shading.color_type='MATERIAL';target=Vector((-.35,-2.86,1.15));sp.region_3d.view_location=target;sp.region_3d.view_distance=11.3
        sp.region_3d.view_rotation=(target-Vector((-2.88,4.31,2.67))).to_track_quat('-Z','Y')
