"""The photographed Gangnam Modern House catware shelving, modelled in metres."""
from pathlib import Path
from math import sin,cos,pi
import bpy

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bank=bpy.data.collections.new('ModernHouseCatTableware');bpy.context.scene.collection.children.link(bank)
mats={}
def paint(tone):
    if tone in mats:return mats[tone]
    m=bpy.data.materials.new(tone)
    rgb=[int(tone[k:k+2],16)/255 for k in (0,2,4)]
    m.diffuse_color=tuple(c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)
    m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=m.diffuse_color
    bs.inputs['Roughness'].default_value=.29 if tone in ('F1E6CF','DDD3B9','423B36','AE7854') else .61
    mats[tone]=m;return m
def mesh(name,vs,fs,tone,smooth=False):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update()
    ob=bpy.data.objects.new(name,data);bank.objects.link(ob);data.materials.append(paint(tone))
    if smooth:
        for f in data.polygons:f.use_smooth=True
    return ob
def box(name,x,y,z,w,d,h,tone):
    vs=[(x+dx*w/2,y+dy*d/2,z+dz*h) for dz in (0,1) for dx,dy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,vs,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,4+(i+1)%4,4+i) for i in range(4)],tone)
def lathe(name,x,y,z,profile,tone,n=24,aspect=1,lobes=False):
    vs=[];fs=[]
    for r,h,ear in profile:
        for i in range(n):
            a=2*pi*i/n
            rise=ear*max(0,1-abs(sin(a)-.82)*6) if lobes and cos(a)**2>.08 else 0
            mod=(1+.06*cos(3*a)+.035*sin(5*a)) if lobes else 1
            vs.append((x+r*mod*cos(a),y+aspect*r*mod*sin(a),z+h+rise))
    for row in range(len(profile)-1):
        for i in range(n):
            a=row*n+i;b=row*n+(i+1)%n
            fs.append((a,b,b+n,a+n))
    return mesh(name,vs,fs,tone,True)
def glaze_stack(obj,profile,r,ears,tone):
    # Occluded seams between the nested ceramics and the hollow inside retain
    # their relative values under both the store lamps and the native preview.
    data=obj.data;layer=data.color_attributes.new(name='Ceramic glaze',type='FLOAT_COLOR',domain='POINT')
    ivory=paint(cream).diffuse_color[:3];mark=paint(tone).diffuse_color[:3]
    n=len(data.vertices)//len(profile)
    for i,(radius,height,ear) in enumerate(profile):
        inner=i>=len(profile)-4
        if inner:shade=[.99,.91,.79,.76][i-len(profile)+4]
        elif radius<.90*r:shade=.61
        elif radius>=.999*r:shade=.92
        else:shade=.99
        for j in range(n):
            a=2*pi*j/n
            patch=ears and i>=len(profile)-6 and (abs(a-.96)<.28 or abs(a-2.37)<.23)
            pigment=mark if patch else ivory
            layer.data[i*n+j].color=tuple(c*shade for c in pigment)+(1,)
    # When the material is used on objects without the glaze attribute it must
    # continue to use its unpainted source colour.
    name='상감 도자기'
    mat=bpy.data.materials.get(name)
    if mat is None:
        mat=paint(cream).copy();mat.name=name
        attr=mat.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='Ceramic glaze'
        mat.node_tree.links.new(attr.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    obj.data.materials[0]=mat
def oval(name,x,y,z,rx,ry,rz,tone):
    vs=[];fs=[]
    sectors,rings=(14,5) if rx>.035 else (10,4) if rx>.012 else (8,3)
    for j in range(rings+1):
        p=-pi/2+j*pi/rings
        for i in range(sectors):
            a=2*pi*i/sectors;vs.append((x+rx*cos(a)*cos(p),y+ry*sin(a)*cos(p),z+rz*sin(p)))
    for j in range(rings):
        for i in range(sectors):
            a=j*sectors+i;b=j*sectors+(i+1)%sectors;fs.append((a,b,b+sectors,a+sectors))
    return mesh(name,vs,fs,tone,True)

dark='423B36';cream='F1E6CF';ochre='AE7854'
def cat(x,y,z,r,tone):
    # Shallow ceramic applique sitting on the inside of the top dish.
    oval('누운 고양이 · 몸',x,y,z,.53*r,.25*r,.14*r,cream)
    oval('등의 얼룩',x-.14*r,y+.02*r,z+.087*r,.25*r,.17*r,.078*r,tone)
    oval('꼬리 끝',x+.43*r,y-.08*r,z+.052*r,.18*r,.096*r,.06*r,tone)
    hx=x-.34*r;hy=y-.08*r;hz=z+.12*r
    oval('고양이 얼굴',hx,hy,hz,.23*r,.19*r,.17*r,cream)
    for sign in [-1,1]:
        pts=[(hx+sign*.08*r,hy-.006*r,hz+.08*r),(hx+sign*.25*r,hy+.01*r,hz+.08*r),
             (hx+sign*.22*r,hy+.05*r,hz+.31*r),(hx+sign*.13*r,hy-.08*r,hz+.11*r)]
        mesh('작은 삼각 귀',pts,[(0,1,2),(0,2,3),(1,3,2)],tone)
        oval('감은 눈',hx+sign*.096*r,hy-.166*r,hz+.035*r,.042*r,.014*r,.013*r,dark)

def stack(x,y,z,r,count,tone,ears):
    # Nested pieces show narrow, individually rounded rims. Only the highest
    # dish needs an interior, so the hidden inner shells are not duplicated.
    high=.55*r if not ears else .28*r; spacing=.17*r if ears else .25*r
    profile=[(.48*r,0,0),(.57*r,.055*r,0)]
    for layer in range(count):
        level=high+layer*spacing
        profile.extend([(.87*r,level-.09*r,.19*r if ears else 0),(r,level-.022*r,.19*r if ears else 0),
                        (.992*r,level,.19*r if ears else 0)])
    level=profile[-1][1]
    profile.extend([(.925*r,level-.006*r,.19*r if ears else 0),(.78*r,level-.19*r,.055*r if ears else 0),
                    (.39*r,level-.27*r,0),(0,level-.28*r,0)])
    dish=lathe('귀가 올라온 겹접시' if ears else '포개진 유약 밥공기',x,y,z,profile,cream,24,.83 if ears else 1,ears)
    glaze_stack(dish,profile,r,ears,tone)
    cat(x+.12*r,y+.21*r,z+level-.11*r,r,tone)

shelf='625F59';wood='BA9D77'
box('회색 매대 상판',0,0,.747,2.25,.78,.053,shelf)
box('아래쪽 열린 선반',0,0,.265,2.19,.72,.035,shelf)
for side in [-1,1]:
    box('수직 지지판',side*1.075,.015,0,.072,.71,.747,shelf)
box('뒤쪽 나무 받침',0,.217,.8,2.08,.308,.108,wood)
for i,(x,w,h) in enumerate([(-.84,.29,.39),(-.51,.31,.44),(-.15,.34,.42),(.21,.32,.44),(.54,.29,.43),(.83,.24,.38)]):
    box('세워 둔 크라프트 포장',x,.32,1.092,w,.075,h,['B6A080','C1A98B','B8A17E'][i%3])
    box('포장의 눌림 접합선',x,.279,1.092+h*.77,w*.82,.003,.003,'968367')
    for k in range(2):
        box('포장 위 작은 인쇄선',x-w*.14,.278,1.092+h*.51-k*.015,w*(.36-.10*k),.002,.004,'97856D')
for x in [-.91,-.67,.66,.90]:
    for j in range(2):
        box('아래칸 납작한 포장상자',x,-.005,.30+.068*j,.232,.31,.064,'BB9E7A')
        box('상자 뚜껑 이음선',x,-.163,.344+.068*j,.227,.003,.006,'8D785E')
for i in range(6):
    x=-.84+i*.32
    # The cup packs stand on the front half of this riser; short cartons behind
    # them leave each base supported instead of intersecting the stacked bowls.
    cy,depth=(.294,.118) if x>-.44 else (.235,.194)
    box('무지 선물 상자',x,cy,.908,.302,depth,.164,'B99B70')
    box('선물 상자 뚜껑',x,cy,1.072,.311,depth+.006,.023,'C4AA82')
    box('포장 인쇄',x-.047,cy-depth/2-.002,1.023,.142,.0015,.007,'867459')

for x,y,r,n,tone,ears in [(-.66,-.215,.119,3,'BEA683',False),(-.33,-.20,.124,3,ochre,False),
    (.00,-.20,.107,2,dark,True),(.315,-.198,.109,5,ochre,True),(.64,-.20,.115,5,dark,True),
    (-.64,.025,.117,2,'B99D76',True),(-.28,.04,.104,6,ochre,True),(.05,.05,.109,6,dark,True)]:
    stack(x,y,.8,r,n,tone,ears)
for x in [-.43,-.14,.19]:
    stack(x,-.08,.301,.107,2,'9C8C71',False)

def tray(name,cx,cy,cz,w,h,tone):
    from mathutils import Vector
    across=Vector((1,0,0));up=Vector((0,.25,.968));out=Vector((0,-.968,.25))
    origin=Vector((cx,cy,cz))
    def pt(xx,yy,d):return origin+across*xx+up*yy+out*d
    def band(hw,hh,r,d):
        verts=[]
        for ax,ay,a0 in [(hw-r,hh-r,0),(-hw+r,hh-r,pi/2),(-hw+r,-hh+r,pi),(hw-r,-hh+r,3*pi/2)]:
            for k in range(5):
                a=a0+k*pi/8;verts.append(pt(ax+r*cos(a),ay+r*sin(a),d))
        return verts
    loops=[band(w/2,h/2,.021,.013),band(w/2-.007,h/2-.007,.016,.016),band(w/2-.018,h/2-.018,.012,0)]
    rim=[];faces=[]
    for loop in loops:rim+=loop
    for j in range(2):
        for i in range(20):
            a=j*20+i;b=j*20+(i+1)%20;faces.append((a,b,b+20,a+20))
    mesh(name+' · 둥근 굽 테두리',rim,faces,cream)
    mesh(name+' · 파스텔 바탕',loops[-1],[tuple(range(20))],tone)
    # An individually painted curled cat appears in the corner of each tray.
    for dx,dy,sc,ink in [(.19,.22,.17,cream),(.13,.20,.08,dark),(.27,.25,.065,ochre),(.22,.32,.07,cream)]:
        offset=.002 if ink==cream else .0027
        verts=[pt(w*dx+sc*w*cos(i*pi/8),h*dy+sc*h*.48*sin(i*pi/8),offset) for i in range(16)]
        mesh('쟁반 모서리의 고양이 무늬',verts,[tuple(range(16))],ink)
    for sign in [-1,1]:
        verts=[pt(w*(.22+sign*.03),h*.33,.004),pt(w*(.22+sign*.07),h*.35,.004),pt(w*(.22+sign*.05),h*.395,.004)]
        mesh('쟁반 고양이 귀 무늬',verts,[(0,1,2)],dark)
tray('분홍 사각 트레이',.46,.233,.908+.40*.968/2,.28,.40,'E7AA9B')
tray('노란 사각 트레이',.78,.234,.908+.39*.968/2,.28,.39,'E9CA88')
lathe('낮은 분홍 원접시',-.918,-.056,.800,[(.052,0,0),(.156,.018,0),(.157,.024,0),(.148,.027,0),(.123,.014,0),(0,.010,0)],'DEA79B',32)
def plate_cat(x,y,scale,pigment):
    def patch(dx,dy,rx,ry,ink):
        zz=.815 if ink==cream else .8157
        vs=[(x+scale*(dx+rx*cos(i*pi/8)),y+scale*(dy+ry*sin(i*pi/8)),zz) for i in range(16)]
        mesh('분홍 접시 고양이 인쇄',vs,[tuple(range(16))],ink)
    patch(0,0,.44,.20,cream);patch(.25,.12,.21,.18,cream)
    patch(-.12,.04,.17,.14,pigment);patch(.32,.16,.08,.10,pigment)
    mesh('인쇄 고양이의 귀',[(x+.10*scale,y+.17*scale,.818),(x+.20*scale,y+.17*scale,.818),
                          (x+.11*scale,y+.34*scale,.818)],[(0,1,2)],pigment)
plate_cat(-.959,-.108,.15,'AE7854')
plate_cat(-.872,-.006,.13,'423B36')
for x,tone,col in [(-.27,'D9AF73','A0BCA9'),(-.087,'D68A73','ABC176')]:
    lathe('포장된 컵 네 개',x,.156,.908,[(.063,0,0),(.075,.195,0),(.076,.216,0),(.071,.219,0),(.068,.176,0),(0,.174,0)],tone,24)
    lathe('컵의 파스텔 입술',x,.156,1.108,[(.075,0,0),(.076,.053,0),(.072,.055,0)],col,24)
    lathe('컵의 흰색 유약 안쪽',x,.156,1.108,[(.074,.0554,0),(.071,.0554,0),(.066,.020,0),(.046,.008,0),(0,.008,0)],cream,24)
# A dark price sticker is actually readable in the source close-up.
x=-.27
box('가격 띠 · 사진 표기',x,.0784,1.062,.088,.004,.032,'4B453B')
box('4P 포장 라벨',x,.0795,1.027,.051,.004,.027,'4B453B')
fonts=[Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf'),Path('/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf')]
label_font=next((bpy.data.fonts.load(str(f)) for f in fonts if f.exists()),None)
def mark(label,z,width,height,depth):
    cu=bpy.data.curves.new(label,'FONT');cu.body=label;cu.align_x='CENTER';cu.align_y='CENTER';cu.resolution_u=6
    if label_font:cu.font=label_font
    ob=bpy.data.objects.new(label,cu);bank.objects.link(ob);cu.materials.append(paint('F8F3DB'))
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
    ob.scale=(width/ob.dimensions.x,height/ob.dimensions.y,1);ob.rotation_euler.x=pi/2;ob.location=(x,depth,z)
mark('15,900',1.078,.072,.019,.0757)
mark('4P',1.041,.034,.019,.0769)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'catware.blend'),compress=True)
