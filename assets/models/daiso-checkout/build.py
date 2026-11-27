"""Customer side of the Gangnam Express Bus Terminal Daiso self checkout."""
from math import cos, sin, pi
from pathlib import Path
import runpy
import sys
import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '다이소 · 셀프 계산대'
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new('DaisoPackingCheckout')
scene.collection.children.link(group)
m.group = group
colors = {
    'case':'eeeae1', 'edge':'9fa29d', 'steel':'b7bab6', 'frame':'e3e5dd',
    'screen':'1d2425', 'display':'f4f1e8', 'ink':'303734', 'soft':'a0a59a',
    'rule':'aaa89c', 'teal':'4da8ad', 'charcoal':'485051', 'red':'b62b32',
    'yellow':'eab763', 'blush':'ead7d0', 'paper':'e0d8c8', 'news':'f0eadd',
    'print':'545657', 'bag':'f3f2e6', 'fold':'d3d3c9', 'white':'faf7ef',
}
for name, value in colors.items():
    m.palette[name] = m.material(name, value, .23 if name in ('steel','edge') else 0)
B, rod, piece = m.block, m.rod, m.piece

# All lettering is model geometry. Keep the native file portable without a font dependency.
def text(label, x, d, z, width, color, flat=False):
    curve = bpy.data.curves.new(label, 'FONT')
    curve.body = label
    curve.align_x = curve.align_y = 'CENTER'
    curve.resolution_u = 2
    curve.font = font
    obj = bpy.data.objects.new(label, curve)
    group.objects.link(obj)
    obj.data.materials.append(m.palette[color])
    obj.location = (x, -d, z)
    obj.rotation_euler = (0 if flat else pi/2, 0, pi)
    bpy.context.view_layer.update()
    xs = [p[0] for p in obj.bound_box]
    size = width / (max(xs) - min(xs))
    obj.scale = (size, size, size)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)

font_path = next((Path(s) for s in ['/System/Library/Fonts/AppleSDGothicNeo.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if Path(s).exists()), None)
if not font_path:
    raise RuntimeError('Building the Korean screen labels requires a Korean typeface.')
font = bpy.data.fonts.load(str(font_path))

# Cabinet with open paper wells at knee height and stainless scan top.
B('받침 굽',0,0,.006,.86,.67,.078,'edge',.008)
B('중앙 캐비닛',.038,.025,.084,.39,.66,.71,'case',.010)
B('하부 선반',0,.01,.085,.89,.65,.033,'case')
B('상판 하부 몸체',0,.012,.71,.91,.715,.124,'case',.009)
B('스테인리스 상판',0,-.005,.830,.96,.76,.052,'steel',.009)
B('단말기 받침',.025,.093,.883,.29,.21,.35,'case',.012)
B('스캐너 투입구',.023,-.018,1.112,.186,.008,.065,'screen')
B('영수증 배출구',.023,-.018,.956,.177,.008,.018,'ink')
B('모니터 목',.03,.12,1.22,.17,.11,.116,'charcoal',.01)
B('터치 모니터 뒷덮개',.035,.125,1.309,.499,.076,.346,'case',.012)
B('모니터 검은 테두리',.035,.077,1.303,.51,.031,.351,'screen',.010)
B('밝은 시작 화면',.035,.058,1.331,.469,.004,.296,'display')
text('셀프계산',.044,.054,1.545,.247,'ink')
text('시작하기',.044,.054,1.461,.236,'ink')
B('시작 버튼',.044,.054,1.362,.134,.002,.048,'blush',.004)
text('START',.044,.051,1.387,.099,'ink')
B('카드 단말기 받침',-.199,.088,1.002,.141,.113,.121,'red',.009)
B('카드 단말기',-.199,.081,1.111,.148,.123,.029,'case',.007)
B('카드 단말 화면',-.199,.107,1.141,.112,.054,.002,'charcoal')
for row in range(2):
    for col in range(3):
        B('카드 단말 버튼',-.232+col*.032,.044+row*.018,1.141,.019,.009,.003,'soft')
B('검은 서명패드',.292,-.031,.885,.182,.161,.029,'screen',.008)
B('서명 액정',.292,-.029,.915,.153,.124,.004,'soft')
rod('손 바코드 리더 손잡이',[(-.185,-.162,.903),(-.176,-.108,.938),(-.153,-.063,1.014)],.021,'charcoal')
B('스캐너 광학부',-.151,-.044,1.001,.078,.081,.057,'screen',.012)
cable=[(-.184,-.165,.903),(-.19,-.21,.894)]
for i in range(57):
    a=i*pi/4
    cable.append((-.18+i*.0044,-.205+.011*cos(a),.902+.010*sin(a)))
cable.extend([(.085,-.195,.893),(.091,-.074,.894),(.093,-.032,.94)])
rod('코일 케이블',cable,.004,'charcoal',5)
for i,(x,word) in enumerate([(.309,'계산 전'),(0,'결제'),(-.309,'완료')],1):
    B('안내 카드',x,-.307,.883,.289,.118,.003,'charcoal')
    B('번호 바탕',x+.101,-.307,.887,.073,.118,.002,'teal')
    text(str(i),x+.101,-.303,.89,.035,'white',True)
    text(word,x-.038,-.307,.89,.115,'white',True)

# Folded newspaper has printed columns and lifts slightly near the fold.
for x in [-.293,.326]:
    for n in range(4):
        w=.235+.005*(n%2)
        B('접은 포장 신문',x+.003*(n%3),-.11,.118+n*.011,w,.36,.012,
          'paper' if n%2 else 'news',.002)
    for j in range(7):
        for col in range(2):
            B('신문 인쇄 단',x+(col-.5)*.096,-.223+j*.030,.166,.077-(j%3)*.009,.005,.001,'rule')
    B('신문 제목 띠',x,-.247,.166,.173,.012,.001,'print')
B('포장 신문 표지판',.337,-.317,.129,.198,.011,.068,'white')
text('신문지',.337,-.324,.166,.107,'ink')

# Two open wire pockets hold loose carrier bags. A bag is a folded sheet with two loop handles.
rack_x=-.655
for h in [.046,.465,.790]:
    for v in [-.22,.206]:
        rod('철망 선반 가로 테',[(rack_x-.168,v,h),(rack_x+.168,v,h)],.010,'frame')
    for x in [rack_x-.168,rack_x+.168]:
        rod('철망 선반 옆 테',[(x,-.22,h),(x,.206,h)],.010,'frame')
for x in [rack_x-.168,rack_x+.168]:
    for d in [-.22,.206]:
        rod('철제 다리',[(x,d,.03),(x,d,.924)],.011,'frame')
for h in [.046,.465]:
    for j in range(6):
        x=rack_x-.153+j*.061
        rod('선반과 앞 망',[(x,.202,h),(x,-.218,h),(x,-.218,h+.108)],.004,'frame',5)
    for j in range(6):
        d=-.2+j*.078
        for side in [-1,1]:
            x=rack_x+side*.168
            rod('측면 망',[(x,d,h),(x,d,h+.160)],.004,'frame',5)
    # Fluffed carrier bags fill the pockets up to the wire rim. Several folds
    # are visible above the label on the upper tier of the photographed rack.
    for i in range(7):
        z=h+.046+i*(.041 if h>.4 else .030)
        x=rack_x+((i%3)-1)*.006
        ridge=.052+.009*(i%3)
        sheet=[(x-.144,-.192,z+.009),(x-.046,-.188,z+.025),(x+.040,-.191,z+.005),(x+.139,-.171,z+.014),
               (x-.142,-.017,z+ridge),(x-.055,-.023,z+.021),(x+.046,.003,z+ridge),(x+.140,-.022,z+.037),
               (x-.129,.145,z+.061),(x-.045,.169,z+.102),(x+.064,.155,z+.049),(x+.129,.118,z+.092)]
        faces=[(row*4+j,row*4+j+1,(row+1)*4+j+1,(row+1)*4+j) for row in range(2) for j in range(3)]
        piece('펼친 봉투의 주름과 가장자리',sheet,faces,'bag' if i%3 else 'white')
        for sign in [-1,1]:
            hoop=[(x+sign*.069+.039*cos(a*pi/12),.092+.031*sin(a*pi/12),
                   z+.065+.088*sin(a*pi/12)) for a in range(13)]
            rod('봉투의 납작한 고리 손잡이',hoop,.007,'fold',5)
B('봉투함 앞판',rack_x,-.225,.61,.334,.013,.170,'case',.004)
text('친환경봉투 (소)',rack_x,-.235,.735,.248,'ink')
text('친환경봉투 (대)',rack_x,-.235,.672,.248,'ink')

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            view=area.spaces.active
            view.region_3d.view_distance=2.85
            view.region_3d.view_location=(-.18,0,.91)
            view.region_3d.view_rotation=Vector((.22,-1,-.20)).to_track_quat('-Z','Y')
            view.shading.color_type='MATERIAL'
bpy.data.fonts.remove(font)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'checkout.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
