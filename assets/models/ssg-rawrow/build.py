"""Open luggage fixtures as photographed by RAWROW at Shinsegae Gangnam."""
from math import pi, sin, cos
from pathlib import Path
from mathutils import Matrix
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("RawrowGangnamDisplay")
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
def roundcase(name,x,y,z,w,d,h,tint,rad=.05):
    vs=[]
    for zz,k in [(0,.94),(.015,1),(h-.015,1),(h,.94)]:
        for cx,cy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
            for j in range(5):
                a=(start+j*22.5)*pi/180
                vs.append((x+k*(cx*(w/2-rad)+rad*cos(a)),y+k*(cy*(d/2-rad)+rad*sin(a)),z+zz))
    n=20;fs=[tuple(reversed(range(n))),tuple(range(3*n,4*n))]
    fs += [(r*n+i,r*n+(i+1)%n,(r+1)*n+(i+1)%n,(r+1)*n+i) for r in range(3) for i in range(n)]
    return mesh(name,vs,fs,tint)
def trunk(x,y,z,color,h):
    # Luggage stands sideways along the wall so the narrow guide cell stays open.
    start=len(collection.objects)
    w,d=.235,.42
    roundcase('둥근 모서리 트렁크',x,y,z+.05,w,d,h,color)
    for dy in [-.16,.16]:
        roundcase('검은 바퀴',x,y+dy,z,.18,.061,.084,'292c2c',.024)
    roundcase('여닫이 프레임',x,y,z+.057,.037,d+.005,h-.014,'545451',.014)
    for dy in [-.078,.078]:
        box('인출 손잡이 봉',x,y+dy,z+h+.05,.018,.018,.077,'acaaa0')
    box('손잡이',x,y,z+h+.112,.030,.18,.023,'2a2926')
    for dy in [-.13,.13]:
        box('측면 잠금장치',x,y+dy,z+h+.044,.052,.033,.014,'d7d5c5')
    # Rotate the display cases on the shelf, exposing the broad coloured
    # panel from the public aisle while keeping the cases inside the bay.
    for dy in [-.125,.125]:
        box('측면 리벳',x+w/2,y+dy,z+h*.82,.008,.016,.016,'cacac3')
    box('측면 주황 손잡이',x+w/2+.008,y,z+h*.52,.022,.09,.025,'bd702c')
    pivot=Matrix.Translation((x,y,0))
    transform=pivot@Matrix.Rotation((-.54 if x<0 else .54),4,'Z')@pivot.inverted()
    for obj in list(collection.objects)[start:]:
        obj.data.transform(transform)
def bag(x,y,z,color):
    roundcase('매달린 가방 몸체',x,y,z,.19,.28,.32,color,.066)
    roundcase('바깥 주머니',x+.04,y,z+.025,.14,.215,.13,'373b38',.05)
    for d in [-.074,.074]:
        box('가방 스트랩',x,y+d,z+.30,.018,.023,.12,'3c403b')
    box('가방 손잡이',x,y,z+.413,.018,.16,.021,'3c403b')
# A pair of open, slim framed display racks. Their long axis follows the aisle.
for side,y0,stock in [(-1,-.82,['b2c8c6','d1a742','454541']),(1,1.29,['edb532','d5d3bc','9faaa3'])]:
    x=side*.73
    for dy in [-.86,.86]:
        for dx in [-.175,.175]:
            box('사각 금속 선반 기둥',x+dx,y0+dy,.055,.025,.025,2.17,'a9aca9')
    for z in [.07,1.08,2.16]:
        box('얇은 실버 선반',x,y0,z,.375,1.76,.031,'c8cac5')
    for i,color in enumerate(stock):
        trunk(x,y0+(i-1)*.52,1.111,color,.67+i*.025)
    if side<0:
        for i,color in enumerate(['becaca','3f4647','efe2c4']):
            trunk(x,y0+(i-1)*.52,.102,color,.56)
    else:
        box('흰 라멜 하부 수납장',x,y0,.101,.36,1.62,.42,'bbbeb9')
        for i in range(8):
            box('수납장 수평 루버',x-.185,y0,.13+i*.047,.022,1.57,.018,'656a67')
        for i,color in enumerate(['3b3e3a','52483d','3f4142','55564c']):
            bag(x,y0+(i-1.5)*.35,.63,color)
# Restrict the orange red brand bar to the rear, as in the branch photograph.
box('안쪽 주홍색 R 표찰',0,2.48,2.21,1.74,.07,.33,'ed4c2d')
lettering('R',.69,2.437,2.37,.17,.228,'fffaf1')
box('매장명 회색 헤더',-.56,-1.67,1.91,.66,.047,.22,'9e9f9a')
lettering('RAWROW',-.56,-1.698,2.025,.56,.103,'fffaf1')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
