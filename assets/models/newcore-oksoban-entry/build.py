"""Public reception and illuminated shop crest of the Gangnam NewCore branch."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("NC_OksobanEntrance")
bpy.context.scene.collection.children.link(collection)
materials = {}
def finish(hexcode):
    if hexcode not in materials:
        m = bpy.data.materials.new(hexcode)
        rgb = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color = [c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
        materials[hexcode] = m
    return materials[hexcode]
def mesh(name,verts,faces,tint):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(finish(tint))
    return obj
def box(name,x,y,z,w,d,h,tint):
    verts=[(x+a*w/2,y+b*d/2,z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tint)
font=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
def lettering(label,x,y,z,width,height,tint):
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.font=font;c.align_x='CENTER';c.align_y='CENTER';c.resolution_u=4
    o=bpy.data.objects.new(label,c);collection.objects.link(o);c.materials.append(finish(tint))
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    o.scale=(width/max(.001,o.dimensions.x),height/max(.001,o.dimensions.y),1)
    o.rotation_euler.x=pi/2;o.location=(x,y,z)
def stroke(name,x,z,points,tint,thickness=.015):
    for (a,b),(c,d) in zip(points,points[1:]):
        length=((c-a)**2+(d-b)**2)**.5
        nx,nz=-(d-b)*thickness/length,(c-a)*thickness/length
        mesh(name,[(x+p,-.165,z+q) for p,q in [(a+nx,b+nz),(a-nx,b-nz),(c-nx,d-nz),(c+nx,d+nz)]],[(0,1,2,3)],tint)
box('검은 입구 천장',0,.45,2.98,7.8,1.28,.3,'34332f')
for x in [-3,-1,1,3]:
    box('매입등',x,.15,2.966,.13,.13,.016,'fff0ce')
box('적갈색 입구 벽',-1.26,.1,0,1.8,.34,3,'bc594c')
box('검은 로고판',-1.26,-.10,1.63,1.19,.10,1.15,'282826')
cyan='a0fdff'
stroke('청록 원형 조명',-1.26,2.26,[(.395*cos(i*pi/24),.395*sin(i*pi/24)) for i in range(49)],cyan)
stroke('겹친 그릇',-1.26,2.27,[(-.27,.025),(-.19,-.12),(0,-.18),(.19,-.12),(.27,.025),(-.27,.025)],cyan)
stroke('잎사귀',-1.26,2.27,[(0,.05),(.10,.19),(.22,.22),(.16,.10),(0,.05)],cyan)
stroke('김',-1.26,2.27,[(-.08,.07),(-.12,.15),(-.07,.24)],cyan)
lettering('THE FRESH',-1.26,-.17,1.78,.64,.10,'f2f1df')
lettering('옥소반',-1.26,-.084,1.30,1.15,.34,'302c28')
lettering('샤브샤브 & 스키야키',-1.26,-.084,.99,1.23,.09,'302c28')
for i in range(13):
    box('목재 격자 세로살',-3.8+i*.132,.38,0,.045,.08,1.51,'c08a53')
for z in [.11,.56,1,1.47]:
    box('목재 격자 가로살',-3.01,.38,z,1.66,.09,.05,'c08a53')
box('안내 카운터',2.7,.79,0,1.18,.60,1.05,'383531')
box('안내 상판',2.7,.79,1.05,1.23,.65,.045,'272825')
for i,(x,width) in enumerate([(-3.52,.49),(-2.96,.49),(-2.4,.49),(2.87,.58)]):
    yy=-.21
    box('메뉴 받침',x,yy,0,width*.86,.31,.035,'353531')
    box('메뉴 지주',x,yy,.035,.045,.05,.37,'43413c')
    box('메뉴 프레임',x,yy,.4,width,.055,.95,'332e2c')
    box('메뉴 지면',x,yy-.032,.43,width-.045,.007,.88,['ebe6cf','e9cdb4','f4e1d3','e4decc'][i])
    lettering(['샤브샤브','스키야키','옥소반','THE FRESH'][i],x,yy-.042,1.17,width*.72,.062,'493c31')
    for row in range(2):
        zz=.68+row*.27
        for radius,tint in [(.132,'ece6d4'),(.105,['ba7850','ae6948','ac885b','a67c59'][i])]:
            coords=[(x+radius*cos(j*pi/12),yy-.047-(.002 if radius<.12 else 0),zz+.68*radius*sin(j*pi/12)) for j in range(24)]
            mesh('메뉴 그릇 삽화',coords,[tuple(range(24))],tint)
        for j in range(4):
            box('그림의 채소와 고기',x+(j-1.5)*.039,yy-.054,zz+.016*sin(j),.033,.005,.027,['708850','dbaf93','72934d','d49b79'][j])
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'))
