"""Editable public sales furniture, fitted to the existing House of Shinsegae retail shell."""
from math import cos, pi, sin
from pathlib import Path
import runpy
import sys
import bpy
from mathutils import Vector

folder = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(folder.parents[2] / 'tools'))
import blender_shop_mesh as shop

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene['reference'] = 'Shinsegae Group Newsroom, House of Shinsegae, 18 June 2024. General wine shop and oak-panel inscription photographs.'
scene['scale'] = 'Retail fixtures are a visual interpretation fitted to the game floor. Merchandise is representative.'
for name, code, metal in [
    ('oak','885437',0), ('honey','A67654',0), ('walnut','67412D',0), ('walnutLight','754A32',0), ('letter','7C6043',.64), ('grain','805035',0), ('shadow','50382D',0),
    ('stone','E5DBC9',0), ('vein','878079',0), ('brass','C49C67',.62), ('bronze','76543A',.56),
    ('glow','FFEDC6',0), ('globe','FFF2D3',0), ('glass','405442',.18), ('red','67543F',.16),
    ('olive','77784E',.18), ('amber','8C6342',.18), ('ivory','F1E3C4',0), ('parchment','D2B695',0),
    ('burgundy','855454',0), ('foil','A88B61',.43), ('black','433D38',.14),
]:
    shop.palette[name] = shop.material(name,code,metal)
for name in ('glow','globe'):
    shader = shop.palette[name].node_tree.nodes.get('Principled BSDF')
    shader.inputs['Emission Color'].default_value = shop.palette[name].diffuse_color
    shader.inputs['Emission Strength'].default_value = 1.6
# Streaks along the veneer follow the long grain in the branch photograph.
for name in ('walnut','walnutLight','oak','honey'):
    mat=shop.palette[name]
    nodes=mat.node_tree.nodes
    links=mat.node_tree.links
    coord=nodes.new('ShaderNodeTexCoord')
    stretch=nodes.new('ShaderNodeVectorMath');stretch.operation='MULTIPLY'
    stretch.inputs[1].default_value=(16.2,2.4,.95)
    links.new(coord.outputs['Object'],stretch.inputs[0])
    noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=1.9
    noise.inputs['Detail'].default_value=1.8
    links.new(stretch.outputs[0],noise.inputs['Vector'])
    ramp=nodes.new('ShaderNodeValToRGB')
    for element,value,scale in zip(ramp.color_ramp.elements,(.2,.8),(.78,1.16)):
        element.position=value;element.color=(*[min(1,c*scale) for c in mat.diffuse_color[:3]],1)
    links.new(noise.outputs['Fac'],ramp.inputs[0])
    links.new(ramp.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
night = bpy.data.worlds.new('매장 실내 간접광')
night.use_nodes = True
night.node_tree.nodes['Background'].inputs[0].default_value = (.79,.75,.70,1)
night.node_tree.nodes['Background'].inputs[1].default_value = .40
scene.world = night
lamps = bpy.data.collections.new('편집용 매장 조명')
scene.collection.children.link(lamps)
def start_part(name, origin):
    global bx
    bx = origin
    coll = bpy.data.collections.new(name)
    scene.collection.children.link(coll)
    coll['preview_origin'] = (bx,0,0)
    shop.group = coll
    return coll

def block(name,x,d,z,w,depth,h,finish,bevel=0):
    return shop.block(name,bx+x,d,z,w,depth,h,finish,bevel)

def rod(name,points,r,finish,segments=8):
    return shop.rod(name,[(bx+x,d,z) for x,d,z in points],r,finish,segments)

def lathe(name,x,d,z,rings,finish,segments=12):
    return shop.profile(name,bx+x,d,z,rings,finish,segments)

def area(name,x,d,z,tx,td,tz,size,power,color=(1,.79,.53)):
    data = bpy.data.lights.new(name,'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name,data)
    lamps.objects.link(obj)
    obj.location = (bx+x,-d,z)
    aim = Vector((bx+tx,-td,tz))-obj.location
    obj.rotation_euler = aim.to_track_quat('-Z','Y').to_euler()

def panel(name,x0,x1,d,z0,z1,finish,step=.13):
    # A shallow mesh grid captures shelf shadows and the halo around each sconce.
    nx = max(1,round((x1-x0)/step))
    nz = max(1,round((z1-z0)/step))
    vertices = [(bx+x0+(x1-x0)*i/nx,d,z0+(z1-z0)*j/nz) for j in range(nz+1) for i in range(nx+1)]
    faces = [(j*(nx+1)+i,j*(nx+1)+i+1,(j+1)*(nx+1)+i+1,(j+1)*(nx+1)+i) for j in range(nz) for i in range(nx)]
    return shop.piece(name,vertices,faces,finish)

def bottle(name,x,d,z,tint,tag,angle=0):
    # The shoulders, foil and printed label are visible from the shopper side.
    shoulder = [(.037,.168),(.033,.190),(.017,.218)] if tint in ('glass','olive') else [(.038,.135),(.036,.158),(.031,.178),(.024,.197),(.017,.216)]
    rings=[(.031,0),(.037,.012),*shoulder,(.013,.23),(.013,.277),(.015,.281)]
    verts=[]; faces=[]; colors=[]
    def surface(profile,finish):
        head=len(verts)
        for radius,h in profile:
            for k in range(10):
                a=2*pi*k/10
                dd=radius*sin(a)
                verts.append((bx+x+radius*cos(a),d+dd*cos(angle)+h*sin(angle),z+h*cos(angle)-dd*sin(angle)))
        for level in range(len(profile)-1):
            for k in range(10):
                faces.append((head+level*10+k,head+level*10+(k+1)%10,head+(level+1)*10+(k+1)%10,head+(level+1)*10+k));colors.append(finish)
        faces.append(tuple(head+(len(profile)-1)*10+k for k in range(10)));colors.append(finish)
    surface(rings,tint)
    surface([(.0378,.047),(.0378,.133)],tag)
    surface([(.0137,.243),(.0156,.282),(.014,.285)],'foil' if tag=='ivory' else 'burgundy')
    # Two printed rules follow the front curve of the paper. No vintage or
    # producer name is assumed from a photograph that cannot resolve either.
    for h,spread,ink in [(.074,.70,'foil'),(.102,.48,'grain')]:
        head=len(verts)
        for height in (h,h+.004):
            for k in range(5):
                a=1.5*pi+spread*(k*.5-1)
                delta=.0382*sin(a)
                verts.append((bx+x+.0382*cos(a),d+delta*cos(angle)+height*sin(angle),z+height*cos(angle)-delta*sin(angle)))
        for k in range(4):
            faces.append((head+k,head+k+1,head+6+k,head+5+k));colors.append(ink)
    obj=shop.piece(name,verts,faces,tint)
    for col in dict.fromkeys(colors):
        mat=shop.palette[col]
        if obj.data.materials.find(mat.name)<0:obj.data.materials.append(mat)
    for f,col in zip(obj.data.polygons,colors):f.material_index=obj.data.materials.find(shop.palette[col].name)

def lettering(text,x,d,z,width,size):
    curve=bpy.data.curves.new(text,'FONT')
    curve.body=text
    curve.align_x='CENTER'
    curve.align_y='CENTER'
    curve.size=size
    curve.resolution_u=4
    curve.extrude=.006
    curve.bevel_depth=.0017
    curve.bevel_resolution=0
    obj=bpy.data.objects.new(text,curve)
    shop.group.objects.link(obj)
    obj.location=(bx+x,-d,z)
    obj.rotation_euler=(pi/2,0,pi)
    curve.materials.append(shop.palette['letter'])
    bpy.context.view_layer.update()
    if obj.dimensions.x>0:obj.scale.x=width/obj.dimensions.x
    obj.select_set(True)
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)

def globe(x,d,z):
    lathe('금속 받침',x,d,z,[(.105,0),(.105,.038),(.043,.05)],'brass')
    rings=[(.117*sin(pi*k/12),.046+.117*(1-cos(pi*k/12))) for k in range(13)]
    lathe('유백색 구형 등',x,d,z,rings,'globe',18)

# Straight wall cases in the public shop. Keep the glass faces recessed enough
# to read the bottle silhouettes without reflecting a flat wall across them.
start_part('WineSalesGallery',0)
x=0
panel('조명 아래 선반 뒷판',x-.84,x+.84,.218,.16,2.40,'honey')
for edge in (-.84,.84):
    block('원목 세로틀',x+edge,.023,.11,.080,.40,2.39,'oak',.009)
block('하단 수납',x,.022,.035,1.68,.40,.38,'oak',.018)
block('상부 금속 몰딩',x,.024,2.39,1.72,.41,.074,'brass',.006)
for row,h in enumerate((.423,.88,1.34,1.79)):
    block('진열 선반',x,.014,h,1.62,.38,.041,'honey',.006)
    block('선반 앞 황동 테두리',x,-.185,h+.005,1.62,.018,.024,'brass')
    block('선반 아래 선형등',x,-.143,h+.041,1.55,.021,.012,'glow')
    for k in range(7):
        tint=('glass','red','olive','amber')[(row+(k//3))%4]
        bottle('진열용 병',x+(k-3)*.199,-.040+.032*(k%2),h+.045,tint,
               ('ivory','parchment','burgundy')[(row+k//2)%3])
area('진열장 반사광',x,-.48,2.23,x,.18,1.15,1.24,28)
for x in (-.86,.86):
    block('목재 끝판',x,.037,.045,.085,.44,2.40,'shadow',.008)
area('매장 천장 확산광',0,-1.6,3.0,0,.02,.89,2.5,75,(1,.91,.76))

# The jamb photographed by Shinsegae has four lines of raised letters with a
# vertical tube light on either side, mounted on a shallow oak-panel curve.
start_part('WineInscription',14)
for i in range(9):
    x=(i-4)*.38
    depth=.090-.023*(abs(i-4)/4)**2
    panel('오크 판재',x-.188,x+.188,depth,.015,2.69,'walnut' if i%3 else 'walnutLight',.065)
    if i in (1,7):
        block('벽 패널 돌출 리브',x+.18,depth-.04,.015,.064,.08,2.67,'walnut',.012)
for x in (-1.04,1.04):
    for h in (.93,1.78):
        lathe('유리관 고정구',x,-.034,h,[(.052,0),(.050,.031)],'bronze')
        rod('등 브래킷',[(x,.04,h+.01),(x,-.039,h+.01)],.02,'brass')
    lathe('벽등 확산관',x,-.042,.965,[(.030,0),(.037,.025),(.037,.78),(.030,.811)],'glow',16)
    area('관 조명 목재 반사',x,-.18,1.39,x,.075,1.39,.68,11)
for word,h,w,size in [('HOUSE',1.75,.55,.16),('OF',1.58,.23,.15),('SHINSEGAE',1.41,.91,.16),('WINE CELLAR',1.21,.72,.095)]:
    lettering(word,0,.058,h,w,size)
area('간판 상부 스폿',.04,-.67,2.57,0,.06,1.40,.48,23)
area('입구 주변광',0,-1.15,2.25,0,.08,1.15,2.75,19,(1,.86,.70))

# Low oak display pods, inclined bottles and brass canopy posts from the
# general sales floor photograph. Native dimensions fit the game's arcade.
start_part('WineDisplayIsland',22)
for x in (-.67,.67):
    block('들여 댄 걸레받이',x,.027,.014,1.25,.43,.105,'shadow',.018)
    block('라운드 오크 진열대',x,0,.114,1.29,.53,.79,'oak',.033)
    for j in (-.37,-.10,.17,.43):
        block('목재 이음선',x+j,-.268,.148,.009,.005,.706,'grain')
    block('목재 상단 프레임',x,.002,.902,1.29,.54,.04,'honey',.018)
    for k in range(6):
        bottle('비스듬히 누운 병',x+(k-2.5)*.173,-.106,.942,'glass' if k%2 else 'amber',
               'ivory' if k%3 else 'burgundy',.91)
    for side in (-1,1):
        rod('섬세한 나무 기둥',[(x+side*.616,.206,.947),(x+side*.616,.206,2.66)],.022,'honey')
        lathe('황동 기둥 머리',x+side*.616,.206,2.58,[(.031,0),(.031,.08)],'brass')
block('얇은 금속 캐노피',0,.037,2.655,2.68,.56,.049,'brass',.014)
globe(0,.185,.94)
area('캐노피 조명',0,-.17,2.59,0,0,.82,1.4,48)
area('목재 앞면 반사광',0,-1.47,1.8,0,.12,.75,2.1,47,(1,.91,.78))

# Low marble sales counter and the pale ceiling panels with tiny inset lights.
start_part('WineMarbleDesk',28)
block('들여 댄 하부',0,.035,.035,1.80,.29,.14,'bronze',.018)
block('일체형 대리석 카운터',0,.015,.175,1.94,.37,.83,'stone',.025)
block('연마한 석재 상판',0,0,1.006,1.99,.41,.045,'stone',.014)
for i in range(12):
    x=-.95+i*.164
    v=.21+.69*((i*7)%11)/11
    line=[(x,-.172,v),(x+.05,-.174,v+.045),(x+.158,-.174,v+.041),(x+.205,-.174,v+.101)]
    rod('석맥',line,.0028+.0008*(i%2),'vein',5)
block('매장 단말기 받침',.42,.012,1.055,.18,.13,.052,'bronze',.008)
block('단말기 화면',.42,.036,1.108,.235,.038,.16,'black',.008)
globe(-.56,.003,1.055)
area('석재 상판 조명',0,-.68,2.35,0,0,.73,1.25,38,(1,.91,.80))

start_part('WineCeilingStrip',35)
block('얇은 샴페인 금속 테두리',0,0,0,2.0,.58,.018,'brass')
block('따뜻한 천장 판',0,0,-.004,1.98,.55,.017,'stone')
for x in (-.64,.64):
    lathe('작은 매입 조명 테두리',x,0,-.024,[(.047,0),(.048,.015)],'bronze',16)
    lathe('매입등 렌즈',x,0,-.026,[(.033,0),(.037,.012)],'glow',16)
area('천장 반사광',0,0,-1.4,0,0,0,2.0,32,(1,.90,.72))

for screen in bpy.data.screens:
    for area_view in screen.areas:
        if area_view.type=='VIEW_3D':
            view=area_view.spaces.active
            view.region_3d.view_location=(10,0,1.2)
            view.region_3d.view_distance=24
            view.region_3d.view_rotation=Vector((-.16,-1,-.25)).to_track_quat('-Z','Y')
            view.shading.color_type='MATERIAL'
scene.render.engine='CYCLES'
scene.cycles.samples=256
scene.cycles.max_bounces=3
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'wine-cellar.blend'),compress=True)
