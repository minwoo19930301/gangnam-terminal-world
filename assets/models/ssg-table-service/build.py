"""평양면옥 강남점 식탁. 미터 단위, +Y는 식탁 안쪽이다."""
from pathlib import Path
from math import cos, sin, pi
from random import Random
import sys
import bpy

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import noodle_bake
import garnishes
import geometry
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_PyongyangMyeonok')
bpy.context.scene.collection.children.link(col)
rng = Random(176)
tau = 2*pi

def finish(name, value, batch='MyeonokTable'):
    vals = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba
    p.inputs['Roughness'].default_value=.29 if batch=='MyeonokSteel' else .58
    if batch=='MyeonokSteel':
        p.inputs['Metallic'].default_value=.48
    m['batch']=batch
    return m

mesh,rings,tube=geometry.constructors(col)

def turn(name,x,y,z,profile,mat,n=48,band=False):
    if band:profile=[*profile,profile[0]]
    return rings(name,[[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z+h) for i in range(n)] for r,h in profile],mat,cap=not band)

def panel(name,x,y,z,w,d,h,mat,rad=.012):
    r=min(rad,w/2-.0001,d/2-.0001)
    def outline(shrink,high):
        v=[]
        for corner,(sx,sy) in enumerate(((1,1),(-1,1),(-1,-1),(1,-1))):
            for i in range(5):
                a=(corner+i/4)*pi/2
                v.append((x+sx*(w/2-r)+(r-shrink)*cos(a),y+sy*(d/2-r)+(r-shrink)*sin(a),z+high))
        return v
    b=min(r/3,h/4,.005)
    return rings(name,[outline(b,0),outline(0,b),outline(0,h-b),outline(b,h)],mat,False)

oak=finish('꿀빛 참나무','bf905c')
grain=finish('나뭇결','ac7d4e')
edge=finish('단면','99683f')
steel=finish('새틴 스테인리스','bfc4c5','MyeonokSteel')
dark=finish('덮개 틈','424546')
light=finish('백자','faf3e4')
broth=finish('면수와 육수','ac987e')
noodles=[finish('메밀 면발 '+str(i),c) for i,c in enumerate(['c0a685','b99d7c','cdb397','b4977b'])]
meat=finish('편육 살코기','b48a79')
fat=finish('편육 지방','e0c6a7')
yellow=finish('노른자','edbc37')
white=finish('흰자','f4ecd7')
red=finish('김칫국물','ce713c')
radish=finish('얇게 썬 무','edc596')
leaf=finish('절인 배추','eda85b')
stalk=finish('배추 줄기','f1cb87')
pepper=finish('고춧가루','a14426')
black=finish('먹색 인쇄','34302d')
paper=finish('미색 메뉴지','f3e6cf')
cover=finish('책 표지','513f35')
top=.776
panel('식탁 상판',0,0,top-.035,.93,1.24,.035,oak,.019)
panel('상판 아래 테',0,0,.682,.86,1.17,.06,edge)
for sx in [-1,1]:
    for sy in [-1,1]:
        panel('식탁 다리',sx*.394,sy*.55,0,.058,.058,.71,oak)
# Subtle long pores in the varnished top, grouped as editable veneer inlay.
vs=[];fs=[]
for i in range(90):
    x=rng.uniform(-.45,.45);y=rng.uniform(-.57,.34);length=rng.uniform(.045,.23)
    start=len(vs)
    for j in range(6):
        u=j/5;px=x+.0017*sin(4*u+i);w=.00065*sin(pi*u)
        vs.extend([(px-w,y+u*length,top+.0002),(px+w,y+u*length,top+.0002)])
        if j:fs.append(tuple(start+k for k in [2*j-2,2*j-1,2*j+1,2*j]))
mesh('긴 나뭇결',vs,fs,grain)
for side in [-1,1]:
    cx=.67*side
    panel('의자 좌판',cx,0,.415,.42,.43,.035,oak,.035)
    for dx in [-1,1]:
        for dy in [-1,1]:
            tube('의자 다리',[(cx+dx*.20,dy*.20,.012),(cx+dx*.165,dy*.164,.42)],.021,edge)
    for dy in [-1,1]:
        tube('등받이 지지대',[(cx+side*.17,dy*.18,.42),(cx+side*.225,dy*.18,.835)],.022,oak)
    for yy in [-.105,-.035,.035,.105]:
        tube('등받이 세로살',[(cx+side*.17,yy,.44),(cx+side*.222,yy,.797)],.013,oak)
    panel('등받이 윗대',cx+side*.22,0,.773,.048,.414,.070,oak)
# The inset steel lid and its dark lifting hole are prominent behind the bowl.
turn('매립 덮개 받침',0,.086,top,[(.178,0),(.178,.004),(.17,.006)],dark)
turn('원형 덮개',0,.086,top+.004,[(.169,0),(.169,.003),(.157,.007),(.125,.011),(.08,.012)],steel)
turn('손가락 구멍',0,.159,top+.016,[(.011,0),(.010,.001)],dark,18)

def oval(name,x,y,z,rx,ry,rz,mat,tilt=0):
    loops=[]
    for j in range(13):
        a=-pi/2+.002+(pi-.004)*j/12
        loops.append([(x+rx*cos(a)*cos(t), y+ry*cos(a)*sin(t)*cos(tilt)-rz*sin(a)*sin(tilt),
                       z+rz*sin(a)*cos(tilt)+ry*cos(a)*sin(t)*sin(tilt)) for t in [tau*i/32 for i in range(32)]])
    return rings(name,loops,mat)
bx,by=-.066,-.323
neutral=finish('음식 표면','ffffff')
scallion=finish('파 조각','72913c')
turn('냉면기 굽과 말린 테',bx,by,top,[(.068,0),(.072,.004),(.07,.014),(.082,.017),(.114,.037),(.141,.067),(.153,.096),(.155,.102),(.152,.105),(.149,.102),(.140,.077),(.12,.048),(.08,.025)],steel,72)
controls=noodle_bake.source_curves(col,noodle_bake.strands(),(bx,by),top,neutral,noodles)
source=noodle_bake.read_curves(controls)
images,heights=noodle_bake.bake(source)
noodle_bake.runtime_bowl(mesh,tube,source,heights,neutral,noodles,(bx,by),top)
garnishes.meat_slices(mesh,(bx,by),top,neutral,fat)
garnishes.egg(mesh,rings,(bx,by),top,neutral)
# Twin rectangular wells share a porcelain rim and a raised centre divider.
xx,yy=-.045,-.056
panel('두 칸 찬기 바닥',xx,yy,top+.018,.235,.108,.009,light)
for sy in [-1,1]:panel('찬기 긴 테',xx,yy+sy*.051,top+.022,.237,.009,.018,light,.004)
for sx in [-1,0,1]:panel('찬기 칸막이',xx+sx*.114,yy,top+.022,.009,.108,.018,light,.004)
garnishes.pickle_juice(mesh,(xx,yy),top,red)
garnishes.sides(mesh,rings,(xx,yy),top,neutral,scallion)
def cup(x,y):
    turn('면수 잔',x,y,top,[(.032,0),(.037,.009),(.046,.080),(.046,.085),(.043,.087),(.041,.081),(.032,.013)],steel)
    turn('면수',x,y,top+.067,[(.040,0),(.040,.001)],broth)
cup(.208,-.176)
for i in range(2):
    tube('납작한 쇠젓가락',[(.19+i*.013,-.47,top+.004),(.24+i*.013,-.273,top+.006)],.0024,steel,6)
tube('숟가락 자루',[(.279,-.46,top+.005),(.290,-.29,top+.012)],.0042,steel)
oval('숟가락 술',.293,-.267,top+.010,.017,.029,.005,steel)
# The visitor photographed the paper list of noodles and dumplings. Re-typeset
# verified dish names in a small open booklet, leaving prices out.
from os import environ
font_path=Path(environ.get('GTW_KOREAN_FONT','/System/Library/Fonts/Supplemental/AppleMyungjo.ttf'))
font=bpy.data.fonts.load(str(font_path))
def lettering(words,x,y,z,size,mat):
    curve=bpy.data.curves.new(words,'FONT');curve.body=words;curve.font=font
    curve.size=size;curve.align_x='CENTER';curve.resolution_u=2
    obj=bpy.data.objects.new(words,curve);col.objects.link(obj);obj.location=(x,y,z)
    curve.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
for side in [-1,1]:
    cx=side*.091
    panel('책자 표지',cx,.372,top,.182,.261,.005,cover)
    panel('메뉴지',cx,.372,top+.005,.177,.256,.005,paper,.004)
    for j in [-1,1]:panel('메뉴 괘선',cx,.372+j*.099,top+.0102,.141,.001,.0006,edge,.0004)
lettering('평 양 면 옥',-.091,.38,top+.011,.045,black)
for word,yy,size in [('냉면 · 만두',.427,.033),('평양냉면',.374,.025),('비빔냉면',.337,.025),('접시만두',.300,.025)]:
    lettering(word,.091,yy,top+.011,size,black)
# Condiment cluster along the table edge, as seen next to the cutlery holder.
for j,(x,y,fill) in enumerate([(-.374,.343,pepper),(-.30,.342,dark)]):
    turn('양념통 몸통',x,y,top,[(.026,0),(.030,.006),(.029,.088),(.024,.098)],fill,24)
    turn('양념통 타공 뚜껑',x,y,top+.096,[(.029,0),(.032,.004),(.031,.019),(.023,.024)],steel,28)
    for k in range(7):
        a=k*tau/7;turn('뚜껑 구멍',x+.015*cos(a),y+.015*sin(a),top+.120,[(.002,0),(.002,.0008)],dark,6)
turn('겨자병',-.328,.216,top,[(.032,0),(.039,.01),(.038,.078),(.029,.094),(.021,.098)],radish,32)
turn('겨자병 마개',-.328,.216,top+.095,[(.025,0),(.026,.02),(.012,.023),(.005,.04)],cover,24)

food_shader=noodle_bake.shader(images)
steel_shader=steel.copy();steel_shader.name='MyeonokSteel finish';steel_shader.use_fake_user=True
v=steel_shader.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Tint'
steel_shader.node_tree.links.new(v.outputs['Color'],steel_shader.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
for obj in col.objects:
    data=obj.data;original=data.materials[0];batch=original['batch'];obj['displayBatch']=batch
    key=obj.get('음식 UV','oak' if original in (oak,edge) else 'plain')
    if batch=='MyeonokTable':
        noodle_bake.prepare_food(obj, key, food_shader, (bx,by))
        continue
    tint=data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for item in tint.data:item.color=original.diffuse_color
    if obj.name.startswith(('냉면기','원형 덮개','면수 잔')):
        # Fine satin-steel glints around the metal rim and the warm, hazy scene
        # reflected in its sides. The same tint travels with the native bowl.
        cx,cy=(bx,by) if obj.name.startswith('냉면기') else (.208,-.176) if obj.name.startswith('면수 잔') else (0,.086)
        from math import atan2,exp
        for vert in data.vertices:
            p=vert.co;angle=atan2(p.y-cy,p.x-cx);height=p.z-top
            sky=.62+.14*cos(angle*2-.5)+.13*cos(angle*3+.82)
            strip=exp(-((cos(angle-.35)-.93)/.055)**2)*.43+.27*exp(-((sin(angle+.60)-.74)/.073)**2)
            val=max(.19,min(1.0,sky+strip+.10*cos(height*100)))
            radius=((p.x-cx)**2+(p.y-cy)**2)**.5
            if obj.name.startswith('원형 덮개'):
                rim=max(0,min(1,(radius-.09)/.07))
                val=.56+(.62*rim+.08)*(val-.56)
            elif obj.name.startswith('냉면기') and abs(height-.077)<.003:
                val*=.55
            tint.data[vert.index].color=(val*.97,val*.95,val*.91,1)
        data.materials.clear();data.materials.append(steel_shader)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.outliner.orphans_purge(do_recursive=True)
print('EDITABLE MESHES',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'table.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
