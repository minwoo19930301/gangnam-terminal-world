"""Author the Gangnam COMF-PRO study display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_10F_ComfPro')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
batch = 'ComfProStudyGallery'
pieces = {}
palette = {
    'chalk':'F5EEE2','linen':'E6DCCB','shell':'D2ADA0','oak':'B28769',
    'walnut':'815C4F','ink':'39343D','steel':'777681','black':'282A30',
    'coral':'DB3C51','raspberry':'E83A81','blush':'F5A5B8','lemon':'DFC06C',
    'teal':'649C96','indigo':'414B72','cream':'EBDCC3','rubber':'E8E5D9',
    'sole':'8D2837','red':'BA2834','clay':'BF7659','mint':'C1D8C8','gold':'C59756',
    'orange':'F28535','white':'FBF8EC','shadow':'60383C','rose':'C98792'
}
materials = {}
def linear(c):
    s = int(c,16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def finish(name):
    if name not in materials:
        rgb = palette[name]
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*[linear(rgb[i:i+2]) for i in (0,2,4)],1)
        m.use_nodes = True
        node=m.node_tree.nodes.get('Principled BSDF')
        node.inputs['Base Color'].default_value=m.diffuse_color
        node.inputs['Roughness'].default_value=.49
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    ob.matrix_world=transform.copy()
    pieces.setdefault(batch,[]).append(ob)
    return ob

def skins(name, rings, color, bevel=0, cap=True):
    n=len(rings[0])
    faces=[list(reversed(range(n)))] if cap else []
    for k in range(len(rings)-1):
        for i in range(n):
            a=k*n+i
            b=k*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    if cap:
        faces.append([n*(len(rings)-1)+i for i in range(n)])
    return part(name,[p for ring in rings for p in ring],faces,color,bevel)

def outline(w,d,r):
    pts=[]
    for x,y,a in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        steps=1 if r<.006 else 3 if r<.020 else 5
        for j in range(steps+1):
            t=radians(a+90*j/steps)
            pts.append((x*(w/2-r)+r*cos(t),y*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,r,col):
    loop=outline(w,d,r)
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.004,h*.14) if min(w,d,h)>.014 else 0)

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(t*pi/4),r*sin(t*pi/4),0)) for t in range(8)]
    return skins(name,[[p+v for v in ring] for p in [a,b]],col)

def lettering(body,x,y,z,size,col,bold=False):
    font=bpy.data.curves.new(body,'FONT')
    font.body=body
    font.size=size
    font.align_x='CENTER'
    font.resolution_u=3
    fontfile='Arial Bold.ttf' if bold else 'AppleGothic.ttf'
    font.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/'+fontfile,check_existing=True)
    obj=bpy.data.objects.new(body,font)
    gallery.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    text=bpy.data.objects.new(body,mesh)
    gallery.objects.link(text)
    text.matrix_world=obj.matrix_world.copy()
    mesh.materials.append(finish(col))
    pieces.setdefault(batch,[]).append(text)
    bpy.data.objects.remove(obj,do_unlink=True)


palette.update(porcelain='F7F5ED', frame='E4E1D6', blue='ADBFC8', pink='E8A7BB',
               salmon='BD786D', petrol='427073', sage='566D60', brass='C5AE81',
               nickel='ACAAA3', mustard='E5B63F', paper='FFFBEF', grey='A19A93')

def panel(name,x,y,z,w,d,h,col,r=.014):
    return plate(name,x,y,z,w,d,h,min(r,w*.47,d*.47),col)

def path(name,pts,r,col):
    for a,b in zip(pts,pts[1:]):
        rod(name,a,b,r,col)

def oval(name,x,y,z,w,d,h,col):
    rings=[]
    for dz,factor in [(0,.80),(.20,1),(.70,1),(1,.84)]:
        rings.append([(x+w*.5*factor*cos(i*pi/16),y+d*.5*factor*sin(i*pi/16),z+h*dz)
                      for i in range(32)])
    return skins(name,rings,col)

def caster(x,y):
    rod('바퀴 축',(x,y,.079),(x,y,.134),.017,'nickel')
    for side in [-1,1]:
        xx=x+side*.021
        rod('쌍바퀴',(xx-.010,y,.056),(xx+.010,y,.056),.042,'grey')
    rod('허브',(x-.034,y,.056),(x+.034,y,.056),.017,'frame')

def chair(x,y,angle,color,loop):
    global transform,batch
    transform=Matrix.Translation((x,y,0))@Matrix.Rotation(radians(angle),4,'Z')
    batch='ComfProEnamel'
    # Oval rolling chassis with an open centre and an inset ribbed foot platform.
    rim=[(.282*cos(i*pi/16),.267*sin(i*pi/16),.14) for i in range(33)]
    path('타원형 하부 프레임',rim,.033,'frame')
    for xx in [-.205,.205]:
        for yy in [-.175,.175]:
            caster(xx,yy)
    panel('미끄럼 방지 발판',0,.10,.139,.46,.28,.035,'frame',.075)
    panel('발판 고무 패드',0,.118,.174,.38,.204,.008,'grey',.054)
    for j in range(8):
        panel('발판 가로 리브',0,.052+j*.019,.182,.32,.005,.004,'nickel')
    for xx in [-.09,.09]:
        path('좌판 썰매형 레일',[(xx,-.19,.15),(xx,-.19,.27),(xx,-.065,.424),(xx,.15,.424)],.024,'nickel')
    # The exposed rear spine follows the seat carriage up to its height knob.
    rod('등 높이 조절 지주',(0,-.244,.16),(0,-.292,.98),.026,'frame')
    rod('슬라이딩 지주',(0,-.254,.35),(0,-.276,.70),.040,'porcelain')
    for h in [.32,.60,.78]:
        rod('조임 손잡이',(0,-.268,h),(0,-.329,h),.036,'nickel')
    batch='ComfProStudyGallery'
    oval('좌판 하부 쉘',0,0,.421,.485,.441,.054,'frame')
    oval('패브릭 좌방석',0,.008,.461,.486,.449,.084,color)
    # A pierced, rounded triangular back like the rose chair in the branch photo.
    if loop:
        rings=[]
        for w,h,cy,cz in [(.252,.245,-.226,.778),(.259,.251,-.25,.778),
                           (.245,.24,-.279,.778),(.140,.146,-.279,.774),
                           (.129,.139,-.242,.774),(.140,.146,-.215,.774)]:
            ring=[]
            for i in range(64):
                t=2*pi*i/64
                ring.append((w*cos(t)*(1-.30*sin(t)),cy+.041*cos(t)**2,cz+h*sin(t)))
            rings.append(ring)
        skins('고리형 등쿠션',rings+[rings[0]],color,cap=False)
        for side in [-1,1]:
            for i in range(11):
                t=radians(-63+i*11)
                path('등판 성형 골',[(side*r*cos(t)*(1-.30*sin(t)),-.279+.041*cos(t)**2-.001,.776+h*sin(t))
                    for r,h in [(.153,.153),(.225,.22)]],.0025,'rose')
    else:
        for j in range(23):
            xx=(j-11)*.018
            path('통풍 등판 탄성 살',[(xx*.66,-.192,.56),(xx*.88,-.254,.66),
                 (xx,-.243,.838),(xx*.90,-.215,.98-.046*(xx/.21)**2)],.0075,'porcelain')
        for h,f,yy in [(.56,.66,-.192),(.98,.90,-.215)]:
            path('등판 테두리',[(i*.018*f,yy,h-(.046*(i/11)**2 if h>.9 else 0))
                                for i in range(-11,12)],.014,'frame')
    transform=Matrix.Identity(4)

def desk(cx,cy,col,tilt):
    global batch
    batch='ComfProEnamel'
    for xx in [cx-.56,cx+.56]:
        panel('라운드 T자 발',xx,cy,.043,.085,.707,.062,'frame',.040)
        for yy in [cy-.282,cy+.282]:
            oval('수평 조절발',xx,yy,.018,.085,.078,.035,'grey')
        panel('외부 승강 기둥',xx,cy+.09,.103,.086,.146,.33,'frame')
        panel('텔레스코픽 내부 기둥',xx,cy+.09,.427,.062,.112,.246,'nickel')
        for j in range(6):
            panel('높이 눈금',xx,cy+.032,.458+j*.022,.028 if j%3==0 else .015,.003,.003,'ink')
        panel('받침 레일',xx,cy,.654,.087,.64,.047,'frame')
        rod('상판 회전축',(xx-.047,cy-.215,.712),(xx+.047,cy-.215,.712),.039,'nickel')
        rod('기울기 조절 링크',(xx,cy+.02,.67),(xx,cy+.13,.755+tilt*.26),.016,'nickel')
    panel('후면 가로 보강대',cx,cy+.145,.57,1.12,.065,.079,'frame')
    panel('후면 고정 상판',cx,cy+.285,.70,1.41,.242,.039,'porcelain',.027)
    panel('오른쪽 고정 날개',cx+.531,cy-.021,.70,.35,.36,.039,'porcelain')
    # Worktop and matching pencil stop pivot together around the front edge.
    def slope(name,xc,yc,zc,w,d,h,col,r):
        pts=outline(w,d,r)
        return skins(name,[[(xc+xx,yc+yy,zc+dz+(yc+yy-cy+.29)*tilt) for xx,yy in pts]
                           for dz in [0,h]],col)
    slope('분할 경사 상판',cx-.18,cy-.067,.715,1.014,.534,.032,col,.033)
    slope('전면 연필 받침턱',cx-.18,cy-.294,.747,.325,.028,.012,'nickel',.010)
    # Rounded mobile pedestal with two independent drawer faces and seat pad.
    px=cx+.775
    for side in [-.121,.121]:
        for d in [-.14,.14]: caster(px+side,cy+d)
    panel('이동 서랍 본체',px,cy,.112,.37,.437,.431,'frame',.036)
    for j in range(2):
        panel('서랍 앞판',px,cy-.22,.123+j*.202,.352,.031,.192,'porcelain',.014)
        panel('서랍 손 걸림',px,cy-.239,.287+j*.202,.093,.008,.013,'grey')
    panel('보조 좌판',px,cy,.541,.374,.443,.055,col,.037)
    return cx,cy

def books(cx,cy,z):
    for j,c in enumerate(['blue','coral','cream','petrol','rose']):
        x=cx+j*.037
        panel('책 표지',x,cy,z,.031,.12,.176+j%3*.025,c)
        panel('책등 띠',x,cy-.061,z+.035,.021,.002,.007,'paper')
    oval('필통',cx+.28,cy,z,.075,.075,.077,'mustard')
    for j,c in enumerate(['blue','salmon','petrol','oak','rose']):
        a=j*pi*.4
        start=(cx+.28+.016*cos(a),cy+.016*sin(a),z+.069)
        end=(cx+.28+.029*cos(a),cy+.029*sin(a),z+.147+j*.005)
        rod('색연필',start,end,.004,c)
        rod('깎은 연필촉',end,(end[0],end[1],end[2]+.008),.002,'oak')

# Two rugs reproduce the blocks, stripes and triangles under the displays.
panel('카펫 바탕',0,-.04,.009,4.46,2.21,.009,'linen')
for i in range(8):
    for j in range(4):
        x=-2.23+i*.5575;y=-1.145+j*.5525;z=.0183
        A=(x,y,z);B=(x+.5575,y,z);C=(x+.5575,y+.5525,z);D=(x,y+.5525,z)
        colors=['grey','linen','steel','cream','ink','salmon','walnut']
        part('직조 삼각 무늬',[A,B,C],[(0,1,2)],colors[(i*3+j*2)%7])
        part('직조 삼각 무늬',[A,C,D],[(0,1,2)],colors[(i+2*j+1)%7])
        if i in [0,2] and j%2==0:
            for k in range(9):
                xx=x+.024+k*.061
                part('러그 줄무늬',[(xx,y,z+.001),(xx+.018,y,z+.001),(xx+.018,C[1],z+.001),(xx,C[1],z+.001)],[(0,1,2,3)],'linen')
for cx,cy,col,tilt in [(-1.22,.13,'blue',.42),(.78,-.04,'pink',.52)]:
    desk(cx,cy,col,tilt)
    books(cx-.51,cy+.29,.739)
chair(-1.49,-.53,-23,'petrol',False)
chair(.53,-.69,13,'salmon',True)

# Green bunk with maple guardrail, as seen behind the desks in Gangnam.
batch='ComfProStudyGallery'
for xx in [-1.96,-.16]:
    for yy in [.90,1.60]:
        panel('침대 기둥',xx,yy,.022,.078,.078,1.73,'sage')
for h in [.24,1.28]:
    panel('침대 프레임',-1.06,1.25,h,1.87,.76,.12,'sage')
    panel('매트리스',-1.06,1.25,h+.12,1.75,.68,.091,'linen',.07)
    oval('베개',-1.70,1.25,h+.207,.34,.50,.081,'cream')
for xx in [-1.87+i*.098 for i in range(18)]:
    panel('단풍나무 안전 난간',xx,.905,1.465,.043,.042,.225,'oak')
for h in [1.45,1.68]:
    panel('원목 난간 가로대',-1.06,.903,h,1.83,.061,.053,'oak')
# Coloured bins in the white-framed shelving at the rear of the photo.
for xx in [.05,1.91]:
    for yy in [1.06,1.54]: panel('철제 수납 프레임',xx,yy,.025,.028,.028,1.81,'frame')
for h in [.17,.72,1.18,1.67]:
    panel('수납 선반',.98,1.30,h,1.91,.53,.032,'porcelain')
for j,c in enumerate(['mustard','mint','rose','blue']):
    x=.305+j*.447
    panel('색상 수납함',x,1.29,1.22,.41,.397,.242,c,.027)
    panel('수납함 손잡이',x,1.088,1.403,.119,.008,.013,'walnut')
panel('진열 안내판',.98,1.025,1.71,1.72,.032,.28,'sage')
lettering('COMF-PRO',.98,1.007,1.772,.176,'porcelain',True)
for j in range(3): books(.23+j*.52,1.14,.752)
# The photographed white perforated stationery board rises behind the blue desk.
panel('문구 걸이판',-1.22,.501,.744,1.30,.038,.54,'porcelain',.018)
for row in range(6):
    for col in range(20):
        xx=-1.80+col*.061; zz=.801+row*.080
        pts=[(xx+.005*cos(j*pi/4),.4815,zz+.005*sin(j*pi/4)) for j in range(8)]
        part('걸이판 타공 음영',pts,[tuple(range(8))],'grey')
for xx,zz in [(-1.52,1.02),(-.94,1.105)]:
    for dx in [-.047,.047]:
        path('걸이 고리',[(xx+dx,.482,zz),(xx+dx,.452,zz),(xx+dx,.452,zz-.046)],.004,'nickel')
    panel('걸이 수납컵',xx,.435,zz-.122,.133,.076,.083,'blue')
# Rest an open notebook on the tilted blue panel; each half has its own gutter.
for side in [-1,1]:
    x=-1.40+side*.078; yc=.086
    def pagepoint(dx,dy):
        return (x+dx,yc+dy,.753+(yc+dy-.13+.29)*.42+.009*(1-side*dx/.078))
    corners=[pagepoint(dx,dy) for dx,dy in [(-.077,-.101),(.077,-.101),(.077,.101),(-.077,.101)]]
    part('펼친 공책',corners,[(0,1,2,3)],'paper')
    for row in range(6):
        yy=-.067+row*.026
        aa=pagepoint(-.057,yy); bb=pagepoint(.052,yy)
        rod('공책 줄',aa,bb,.0009,'blue')
# An illustrated display panel on the fixed strip, independent of the moving lid.
panel('제품 설명판',1.25,.284,.74,.31,.036,.37,'porcelain')
lettering('컴프프로',1.25,.264,1.044,.052,'ink')
for row,(title,c) in enumerate([('높이 조절','blue'),('각도 조절','pink')]):
    z=.913-row*.103
    panel('안내 색띠',1.25,.263,z,.276,.006,.077,c)
    lettering(title,1.25,.258,z+.020,.043,'ink')
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.31 if batch=='ComfProEnamel' else .76
    colors=nodes.new('ShaderNodeVertexColor'); colors.layer_name='Finish'
    merged.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        mesh=obj.data
        rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data: item.color=rgba
        mesh.materials.clear(); mesh.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
