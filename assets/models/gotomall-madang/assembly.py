"""Actual store anchors for a second native editing scene, including each repeated dining set."""
preview=bpy.data.scenes.new('G-010 마당 · 식당과 배식대');preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('지하 식당의 확산광');preview.world.use_nodes=True
bg=preview.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.72,.72,.67,1);bg.inputs[1].default_value=.23
for key,(name,x,d,z) in parts.items():
    group=subjects[key];origins=[(tx,td,z) for tx,td in tables] if key in ('table','tools') else [(x,d,z)]
    for i,(xx,dd,zz) in enumerate(origins):
        ob=bpy.data.objects.new(name+(' '+str(i+1) if len(origins)>1 else ''),None);ob.instance_type='COLLECTION';ob.instance_collection=group
        ob.location=Vector((xx,-dd,zz))-Vector(group['preview_origin']);ob.empty_display_size=.12;ob['web_part']=key;preview.collection.objects.link(ob)
def area(n,at,aim,e,tint,size):
    l=bpy.data.lights.new(n,'AREA');l.energy=e;l.color=tint;l.shape='DISK';l.size=size
    ob=bpy.data.objects.new(n,l);preview.collection.objects.link(ob);x,d,z=at;ob.location=(x,-d,z);x,d,z=aim;ob.rotation_euler=(Vector((x,-d,z))-ob.location).to_track_quat('-Z','Y').to_euler()
for j in range(4):
    for x in [-1.75,-.20,1.53]:area('천장에 매입된 흰색 조명',(x,.53+j*1.45,2.71),(x,.58+j*1.45,.42),20,(1,.94,.84),.29)
area('후드 아래 작업 조명',(0,5.12,2.04),(0,5.35,.78),25,(.90,.96,1),2.73)
area('입구 복도에서 들어오는 빛',(0,-2.1,2.24),(0,1.61,1.01),95,(.91,.95,1),3.8)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        sp=a.spaces.active;sp.shading.color_type='MATERIAL';target=Vector((0,-2.94,1.04));sp.region_3d.view_location=target
        sp.region_3d.view_distance=8.38;sp.region_3d.view_rotation=(target-Vector((.40,3.92,2.28))).to_track_quat('-Z','Y')
