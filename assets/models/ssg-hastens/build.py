"""Rebuild the editable blue-check sample bed with sewn edges and a tufted topper."""
from pathlib import Path
from math import pi, cos, sin
import sys
import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new('SSG_9F_Hastens')
scene.collection.children.link(group)
m.group = group
m.palette = {key:m.material(key, value) for key,value in {
    'ivory':'e9e5d8','warp':'76849d','weft':'a4aebe','navy':'253b60',
    'linen':'eeeae2','stitch':'c8c2b4','oak':'a88867'}.items()}

def fabric(name, rows, cols, sample, shade):
    verts = [sample(i/cols,j/rows) for j in range(rows+1) for i in range(cols+1)]
    faces = []
    for j in range(rows):
        for i in range(cols):
            k=j*(cols+1)+i
            faces.append((k,k+1,k+cols+2,k+cols+1))
    obj=m.piece(name,verts,faces,'ivory')
    colors=['ivory','warp','weft','navy','linen']
    for col in colors[1:]:
        obj.data.materials.append(m.palette[col])
    for j in range(rows):
        for i in range(cols):
            poly=obj.data.polygons[j*cols+i]
            poly.material_index=shade(i,j)
            poly.use_smooth=True

def course(name,z,height):
    # Four facings share the same check size and rounded, upholstered corners.
    width,depth,radius=1.70,1.98,.07
    path=[]
    for x,y,turn in [(1,-1,-pi/2),(1,1,0),(-1,1,pi/2),(-1,-1,pi)]:
        cx=x*(width/2-radius);cy=y*(depth/2-radius)
        arc=[(cx+radius*cos(turn+k*pi/8),cy+radius*sin(turn+k*pi/8)) for k in range(5)]
        path.extend(arc)
    for a,b in zip(path,path[1:]+path[:1]):
        dx=b[0]-a[0];dy=b[1]-a[1];count=max(1,round((dx*dx+dy*dy)**.5/.114))
        def surface(u,v):
            bulge=.017*sin(pi*v)
            x=a[0]+dx*u;y=a[1]+dy*u
            mag=max(.001,(dx*dx+dy*dy)**.5)
            return (x+bulge*dy/mag,y-bulge*dx/mag,z+v*height)
        def pattern(i,j):
            x,y,_=surface((i+.5)/count,.5)
            column=round((x if abs(dx)>=abs(dy) else y)/.114)
            return (column%2)+2*(j%2)
        fabric(name,max(2,round(height/.11)),count,surface,pattern)
    for h in [z+.008,z+height-.008]:
        m.rod('매트리스 둘레 파이핑',[(x,y,h) for x,y in path+[path[0]]],.008,'stitch',6)

for x in [-.72,.72]:
    for y in [-.84,.84]:
        m.profile('오크 다리',x,y,0,[(.045,0),(.047,.01),(.061,.135)],'oak',12)
course('하단 체크 베이스',.135,.27)
course('상단 체크 매트리스',.412,.24)
course('덧매트리스 옆단',.659,.085)

def top(u,v):
    x=(u-.5)*1.69;y=(v-.5)*1.97
    # Inset the corners to carry the rounded perimeter of the courses below.
    if abs(x)>.77 and abs(y)>.913:
        k=min(1,.075/max(.001,((abs(x)-.77)**2+(abs(y)-.913)**2)**.5))
        x=(.77+k*(abs(x)-.77))*(1 if x>0 else -1)
        y=(.913+k*(abs(y)-.913))*(1 if y>0 else -1)
    edge=min(1,8*min(u,v,1-u,1-v))
    depression=.021*(cos((u-.5)*pi*6)*cos((v-.5)*pi*8))**8
    return (x,y,.741+edge*(.018-depression))
fabric('누빔 매트리스 윗면',48,48,top,lambda i,j:4)
for x in [-.41,.41]:
    def pillow(u,v):
        return (x+(u-.5)*.71*(.91+.09*sin(pi*v)),.665+(v-.5)*.39*(.9+.1*sin(pi*u)),
                .760+.106*(sin(pi*u)*sin(pi*v))**.55)
    fabric('리넨 베개',12,20,pillow,lambda i,j:4)
# The 2020 operator photo shows a check headboard framing the pillows.
m.block('헤드보드 쿠션 몸체',0,1.015,.42,1.76,.125,.99,'navy',.045)
for side in [-1,1]:
    def headboard(u,v):
        x=(u-.5)*1.72
        z=.49+.90*v-.035*abs(2*u-1)**12
        return (x,1.015+side*(.063+.013*sin(pi*v)*sin(pi*u)),z)
    fabric('체크 헤드보드 앞뒤 원단',8,16,headboard,lambda i,j:i%2+2*(j%2))
# A short folded blue-check throw makes the weave legible from the foot.
fabric('발치의 접은 체크 천',4,16,
       lambda u,v:((u-.5)*1.66,-.92+.42*v,.77+.012*sin(pi*v)-.01*abs(2*u-1)**8),
       lambda i,j:i%2+2*(j%2))
# A wide navy folded end follows the foreground bed in the historic branch photo.
m.block('발치의 남색 접이 담요',0,-.84,.773,1.68,.34,.060,'navy',.024)
# Illustrative product card on the foot throw, sized to the game camera.
card_y,card_z=-.81,.837
m.block('판매대 상호 카드 받침',0,card_y,card_z,.56,.12,.012,'navy',.004)
m.block('양면 네이비 상호 카드',0,card_y,card_z+.012,.55,.012,.135,'navy',.006)
for side in [-1,1]:
    curve=bpy.data.curves.new('HÄSTENS','FONT')
    curve.body='HÄSTENS';curve.align_x='CENTER';curve.align_y='CENTER';curve.size=.091
    obj=bpy.data.objects.new('상호 원문',curve);group.objects.link(obj)
    obj.location=(0,-card_y+side*.007,card_z+.085)
    obj.rotation_euler=(pi/2,0,0 if side<0 else pi)
    curve.materials.append(m.palette['ivory'])
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    lettering=bpy.data.objects.new('HÄSTENS · 양면 상호',mesh);group.objects.link(lettering)
    lettering.matrix_world=obj.matrix_world.copy()
    bpy.data.objects.remove(obj,do_unlink=True)
scene.world=bpy.data.worlds.new('편집용 배경')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gallery.blend'),compress=True)
bake_collection(group,'HastensBlueCheck',here/'gallery.glb',preserve_smoothing=True)
