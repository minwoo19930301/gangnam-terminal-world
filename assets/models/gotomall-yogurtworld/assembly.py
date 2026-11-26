"""Arrange the window, fixtures and bowls on their game anchors before baking the public room."""
preview=bpy.data.scenes.new('G-012 · 요거트월드 서편 코너');preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('서편 지하상가의 실내광');preview.world.use_nodes=True
world=preview.world.node_tree.nodes.get('Background');world.inputs[0].default_value=(.66,.69,.70,1);world.inputs[1].default_value=.19
for key,value in anchors.items():
    collection=subjects[key]
    positions=[[*p,0] for p in layout['tablePositions']] if key=='tables' else [value]
    for i,(x,d,z) in enumerate(positions):
        o=bpy.data.objects.new(names[key]+(' '+str(i+1) if len(positions)>1 else ''),None);o.instance_type='COLLECTION';o.instance_collection=collection
        o.location=Vector((x,-d,z))-Vector(collection['preview_origin']);o['web_part']=key;o.empty_display_size=.12;preview.collection.objects.link(o)
def area(name,point,aim,power,tint,size):
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.color=tint;light.shape='DISK';light.size=size
    ob=bpy.data.objects.new(name,light);preview.collection.objects.link(ob)
    x,d,z=point;ob.location=(x,-d,z)
    x,d,z=aim;ob.rotation_euler=(Vector((x,-d,z))-ob.location).to_track_quat('-Z','Y').to_euler()
for i,d in enumerate([.81,2.57,4.47,5.75]):
    for x in [-1.07,1.04]:area('천장 매입 조명 '+str(i+1),(x,d,2.771),(x,d,.3),12,(1,.95,.84),.21)
area('오른쪽 벽 간접광',(-2.03,2.56,1.038),(-2.14,2.55,2.12),42,(1,.78,.50),2.1)
area('외부 복도에서 들어오는 빛',(3.66,2.11,1.64),(.03,2.77,1.26),79,(.84,.92,1),3.4)
area('입구 통로의 확산광',(0,-1.79,2.12),(0,1.85,.84),58,(.96,.94,.83),3.0)
area('근무대 위의 흰 빛',(.20,5.55,2.67),(-.37,5.34,.91),25,(.92,.96,1),1.35)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        sp=a.spaces.active;sp.shading.color_type='MATERIAL';p=Vector((0,-2.12,1.0))
        sp.region_3d.view_location=p;sp.region_3d.view_distance=9.1;sp.region_3d.view_rotation=(p-Vector((5.23,4.42,2.93))).to_track_quat('-Z','Y')
