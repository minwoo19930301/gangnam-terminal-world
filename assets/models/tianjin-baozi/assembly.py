"""Furnished instancing preview in the same local coordinates used by the game."""
preview=bpy.data.scenes.new('116호 · 손님 홀과 조명');preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('천진포자 홀의 바탕 조명');preview.world.use_nodes=True
world=preview.world.node_tree.nodes.get('Background');world.inputs[0].default_value=(.58,.56,.48,1);world.inputs[1].default_value=.16
for key,base in anchors.items():
    places=[base]
    if key in ('grille','glass'):places=[[x,0,0] for x in layout['panes']]
    elif key=='stool':places=[[anchors['communal'][0]+x,anchors['communal'][1]+d,0] for x,d in layout['stoolRows']]
    elif key=='walltable':places=[[x,d,0] for x,d in layout['wallTables']]
    for ix,(x,d,z) in enumerate(places):
        c=subjects[key];ob=bpy.data.objects.new(names[key]+(' '+str(ix+1) if len(places)>1 else ''),None)
        ob.instance_type='COLLECTION';ob.instance_collection=c;ob.location=Vector((x,-d,z))-Vector(c['preview_origin'])
        rotation=layout['rotations'].get(key,0)
        if rotation:
            pivot=Vector(c['preview_origin']);ob.rotation_euler.z=rotation
            ob.location=Vector((x,-d,z))-Matrix.Rotation(rotation,3,'Z')@pivot
        ob['web_part']=key;ob.empty_display_size=.14;preview.collection.objects.link(ob)
        # The runtime draws these as transparent. Glass behind the grille should not black out the daylight bake.
        if key in ('glass','jar','coolerGlass'):ob['skip_irradiance_bake']=True
def area(name,at,target,power,tint,size):
    light=bpy.data.lights.new(name,type='AREA');light.shape='DISK';light.energy=power;light.color=tint;light.size=size
    ob=bpy.data.objects.new(name,light);preview.collection.objects.link(ob);ob.location=(at[0],-at[1],at[2])
    direction=Vector((target[0],-target[1],target[2]))-ob.location;ob.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
for i,(x,d) in enumerate([(-4.28,2.34),(-4.28,5.02),(-4.28,7.72),(1.78,4.2),(1.78,6.18)]):
    area('황동 갓 아래 따뜻한 등 '+str(i+1),(x,d,2.460),(x,d,.66),28,(1,.82,.59),.43)
for i,(x,d) in enumerate([(-2.35,1.02),(0,4.12),(0,7.75),(4.92,1.02),(4.92,4.12),(4.92,7.75),(-2.35,7.75)]):
    area('다운라이트 '+str(i+1),(x,d,3.49),(x,d,.15),8.2,(1,.92,.76),.22)
area('앞쪽 천장에서 내려오는 확산광',(2.72,2.10,3.44),(2.3,2.75,.56),88,(1,.90,.76),3.5)
area('홀 안쪽 천장의 확산광',(-.68,6.27,3.44),(-.74,5.83,.52),105,(1,.92,.78),3.9)
area('회랑 유리와 열린 입구',(0,-1.26,2.41),(0,3.10,1.29),109,(.93,.94,1),4.5)
area('만두 조리창의 확산광',(5.07,5.82,2.525),(4.48,5.82,.92),21,(1,.93,.82),1.26)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        sp=a.spaces.active;sp.shading.color_type='MATERIAL'
        target=Vector((0,-3.71,1.2));sp.region_3d.view_location=target;sp.region_3d.view_distance=12.4
        sp.region_3d.view_rotation=(target-Vector((6.8,5.88,3.90))).to_track_quat('-Z','Y')
