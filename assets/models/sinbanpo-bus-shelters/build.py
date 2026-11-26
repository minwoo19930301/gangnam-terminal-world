"""Build the two public median shelters from street photographs and the city stop register."""
from pathlib import Path
from math import pi,cos,sin,tau
from tempfile import TemporaryDirectory
import sys,subprocess
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
tools=here.parents[2]/'tools'
sys.dont_write_bytecode=True
sys.path[:0]=[str(here),str(tools)]
import blender_shop_mesh as m
from prints import make_print,render_print
from finishes import swatches,merged_frame
from header import bake_header
from night import prepare_lights,bake_lighting
from native_clocks import add_clocks
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['subject']='신반포로 고속터미널 중앙 정류소 22-019 · 22-020'
scene['streetview']='https://map.naver.com/p?p=lHsXW6lxT97x-yAj0PFdXA,0,0,80,Float'
scene['city_register']='https://data.seoul.go.kr/dataList/OA-21288/S/1/datasetView.do'
fonts={}
for key,options in {
 'ko':['/System/Library/Fonts/AppleSDGothicNeo.ttc','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'],
 'serif':['/System/Library/Fonts/Supplemental/Georgia Italic.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'],
 'latin':['/System/Library/Fonts/Supplemental/Arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'],
}.items():
    path=next((p for p in options if Path(p).exists()),None)
    if path:fonts[key]=bpy.data.fonts.load(path,check_existing=True)
def material(key,code,metal=0,rough=.58):
    mat=m.material(key,code,metal);m.palette[key]=mat
    mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=rough
    return mat
for args in [('강재 · 흑청 분체도장','343b3d',.30,.60),('아노다이징 · 모서리','515b5a',.56,.44),
 ('고무 · 줄눈','242b2a',.03,.72),('아연 · 접합판','77817e',.59,.40),('알루미늄 · 볼트','969c94',.62,.37),
 ('좌판 · 훈증목','89694d',.02,.54),('좌판 · 짙은 결','805e46',.02,.57),('좌판 · 밝은 결','98795b',.02,.53),
 ('하부 그늘','282c2a',.04,.71),('등갓 · 유백색','eee4c9',.01,.37),('부드러운 백색','e4e7df',.01,.52),
 ('안내 청색','355784',.10,.46),('안내 보라','65567e',.04,.50),('안내 초록','4a8665',.03,.53),
 ('안내 적색','b24b49',.03,.55),('안내 황색','e0a83b',.05,.49),('유리 모서리','9baaa3',.28,.28)]:
    material(*args)
frame_c='강재 · 흑청 분체도장';ed='아노다이징 · 모서리';gap='고무 · 줄눈';zn='아연 · 접합판';bolt='알루미늄 · 볼트'
def collection(label,preview=(0,0,0)):
    group=bpy.data.collections.new('중앙차로 승차대 · '+label);scene.collection.children.link(group)
    group['preview_origin']=(preview[0],-preview[1],preview[2]);m.group=group;return group
B=m.block;R=m.rod
def lettering(label,x,d,h,size,pigment,face=1,font='ko'):
    curve=bpy.data.curves.new('승차대 글자','FONT');curve.body=label;curve.size=size;curve.align_x='CENTER';curve.align_y='CENTER'
    if font in fonts:curve.font=fonts[font]
    curve.resolution_u=4;curve.extrude=.00018
    obj=bpy.data.objects.new(label,curve);m.group.objects.link(obj);obj.location=(x,-d,h)
    # A person looking at +d reads the back face. A person looking toward -d reads the boarding face.
    obj.rotation_euler=(pi/2,0,0 if face==1 else pi)
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    done=bpy.data.objects.new('활자 · '+label,mesh);m.group.objects.link(done)
    done.matrix_world=obj.matrix_world.copy();mesh.materials.append(m.palette[pigment]);bpy.data.objects.remove(obj,do_unlink=True)

frame=collection('검은 강재 차양과 승객 벤치')
# Posts are located along the glazing. Their thin caps and gaskets leave the view through the bay open.
for x in [-3.30,-2.02,-.67,.67,2.02,3.30]:
    B('베이스 · 회색 발판',x,-.89,.006,.168,.171,.026,zn,.004)
    for off in [-.055,.055]:
        for dv in [-.052,.052]:
            m.profile('앵커 · 육각 머리',x+off,-.89+dv,.032,[(.011,0),(.011,.010),(.009,.012)],bolt,6)
    B('기둥 · 검은 직사각 강관',x,-.89,.03,.087,.132,2.57,frame_c,.005)
    B('기둥 · 앞쪽 모따기',x,-.812,.087,.054,.014,2.48,ed,.0025)
    B('기둥 · 검은 압착 가스켓',x,-.970,.122,.022,.016,2.41,gap,.002)
    for z in [.204,1.214,2.365]:
        m.profile('기둥 · 유리 누름쇠 캡',x-.029,-.973,z,[(.009,0),(.009,.008)],bolt,8)
    # The roof cantilevers over the seats from the glazing posts.
    m.piece('차양 · 테이퍼 외팔 받침',[(x+i*.039,d,z) for i in [-1,1] for d,z in [(-.986,2.401),(-.986,2.716),(.996,2.745),(.996,2.662)]],
            [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],frame_c,.006)
for v in [-1.08,.997]:
    B('차양 · 검은 전면 빗물턱',0,v,2.706,6.88,.076,.088,frame_c,.009)
    B('차양 · 아노다이징 테두리',0,v,2.776,6.88,.085,.018,ed,.004)
for sign in [-1,1]:
    B('지붕 측면 마감',sign*3.410,-.04,2.707,.047,2.12,.083,frame_c,.006)
for i in range(9):
    x=(i-4)*.750
    B('캐노피 · 접힌 금속 지붕판',x,-.03,2.738,.745,2.069,.032,frame_c,.005)
    B('패널 이음 · 돌출 리브',x-.373,-.03,2.768,.014,2.047,.024,ed,.003)
    B('하부 흡음 라이너',x,.069,2.702,.734,1.510,.033,'하부 그늘',.004)
for d in [-.510,.603]:
    for x in [-2.24,0,2.24]:
        B('천장 · 알루미늄 라인등 프레임',x,d,2.677,2.16,.064,.025,ed,.004)
        B('천장 · 좁은 선형 확산판',x,d,2.673,2.098,.039,.012,'등갓 · 유백색',.003)
# Parallel dark rails, seals and the two thin lightbox cabinets sit on the same straight rear line.
for z in [.11,2.112,2.511]:
    B('수평 창틀 · 실리콘과 금속 채널',0,-.89,z,6.61,.098,.047 if z<2 else .069,frame_c,.004)
for x in [-2.66,2.66]:
    B('광고등 박스 · 뒤판',x,-.875,.089,1.235,.163,2.147,frame_c,.012)
    for sign in [-1,1]:
        B('광고등 박스 · 양옆의 돌출 프레임',x+sign*.589,-.879,.163,.046,.198,1.926,ed,.006)
    for z in [.174,2.056]:
        B('광고등 박스 · 상하 고무 패킹',x,-.877,z,1.164,.201,.032,gap,.002)
    for xx in [-.525,.525]:
        for z in [.245,1.975]:
            B('교체식 패널 · 작은 잠금쇠',x+xx,-.981,z,.021,.009,.029,bolt,.002)
    for i in range(13):
        B('광고 패널 집기 · 하부 통풍 슬롯',x+(i-6)*.071,-.971,.113,.046,.004,.008,gap)
# A bench has individual timber slats, rounded edges, feet, mounting brackets and raised armrests.
for sign in [-1,1]:
    x=sign*1.49
    B('벤치 다리 · 장방형 발판',x,-.41,.023,.192,.553,.032,zn,.010)
    for d in [-.596,-.239]:
        B('벤치 다리 · 코팅 강관',x,d,.055,.082,.082,.344,frame_c,.005)
    B('벤치 · 너도밤나무 밑 받침',x,-.415,.376,.129,.507,.040,ed,.007)
    for off in [-.066,.066]:
        for d in [-.611,-.229]:
            m.profile('벤치 발판 · 육각 볼트',x+off,d,.050,[(.011,0),(.011,.012)],bolt,6)
for k in range(5):
    d=-.643+k*.100
    B('벤치 · 모서리를 둥글린 나무 좌판',0,d,.412,3.55,.094,.051,['좌판 · 훈증목','좌판 · 짙은 결','좌판 · 밝은 결'][k%3],.012)
    for x in [-1.49,1.49]:
        m.profile('벤치 · 목재 고정 나사',x,d,.459,[(.006,0),(.006,.004)],zn,10)
for x in [-1.74,0,1.74]:
    points=[(x,-.655,.427),(x,-.652,.554),(x,-.634,.610),(x,-.59,.637),
          (x,-.295,.637),(x,-.247,.603),(x,-.224,.550),(x,-.224,.440)]
    R('좌석 사이 · 완만하게 굽힌 팔걸이',points,.0154,ed,10)
    for d in [-.655,-.224]:B('팔걸이 · 부착 브래킷',x,d,.46,.055,.053,.021,zn,.006)
# Narrow public route headings on both faces of the top fascia.
B('행선 안내 · 검정 바탕',0,-.89,2.202,6.57,.114,.321,frame_c,.004)
for face in [-1,1]:
    d=-.89+face*.060
    XX=lambda x: x if face==1 else -x
    lettering('고속터미널',XX(-1.335),d,2.385,.127,'부드러운 백색',face)
    lettering('Express Bus Terminal',XX(-1.335),d,2.268,.047,'부드러운 백색',face,'latin')
    for j,(h,c) in enumerate([(2.418,'안내 청색'),(2.352,'안내 초록'),(2.286,'안내 적색')]):
        x=XX(.305);B('색띠 · 노선 계열',x,d+.002*face,h-.015,.94,.005,.043,c)
        lettering(['간선','지선','광역'][j],x,d+.009*face,h+.004,.038,'부드러운 백색',face)
    lettering('버스 승차장',XX(2.625),d,2.383,.077,'부드러운 백색',face)
    lettering('BUS STOP',XX(2.625),d,2.277,.044,'부드러운 백색',face,'latin')
    B('승차대 표지 · 청록색 도안',XX(2.119),d+.003*face,2.241,.190,.005,.232,'안내 청색',.003)
    # Coach pictogram with two windows and a pair of circular wheels.
    x=XX(2.119)
    B('픽토그램 · 버스 윤곽',x,d+.008*face,2.315,.149,.004,.087,'부드러운 백색',.011)
    for du in [-.033,.034]:
        B('픽토그램 · 차창',x+du,d+.012*face,2.356,.053,.004,.029,'안내 청색',.002)
        B('픽토그램 · 바퀴',x+du,d+.009*face,2.301,.026,.009,.025,'부드러운 백색',.005)
# The brochure photograph shows a succession of short, aligned frosted blocks
# on three clear bays. The alpha image keeps the central views open.
import struct,zlib,numpy as np
def rgba_png(path,pixels):
    h,w=pixels.shape[:2]
    def ch(tag,data):return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
    data=b''.join(b'\x00'+row.tobytes() for row in pixels)
    path.write_bytes(bytes.fromhex('89504e470d0a1a0a')+ch(b'IHDR',struct.pack('>2I5B',w,h,8,6,0,0,0))+ch(b'IDAT',zlib.compress(data,8))+ch(b'IEND',b''))
def glass_sample(path):
    h,w=512,192
    y,x=np.mgrid[:h,:w];u=(x+.5)/w;v=1-(y+.5)/h
    rng=np.random.default_rng(22020)
    alpha=.055+.055*np.maximum((1-v)/1.5,0)+.018*np.cos(u*2.6+v*.7)
    colour=np.broadcast_to(np.array([189,210,210]),(h,w,3)).copy().astype(float)
    for lo,hi,a in [(.30,.414,.47),(.479,.592,.47),(.654,.770,.54),(.82,.866,.26)]:
        frost=(v>lo)&(v<hi)&(u>.095)&(u<.911)
        grain=rng.normal(0,.005,(h,w))
        alpha[frost]=a+grain[frost];colour[frost]=np.array([218,226,219])+rng.normal(0,1.1,(int(frost.sum()),1))
    # Grey lower rubbing line, and the very faint vertical edge of cut glass.
    alpha[(u<.009)|(u>.990)]=.32
    out=np.dstack([colour,np.clip(alpha*255,0,255)]).astype(np.uint8);rgba_png(path,out)
def linked_material(label,image,glazing=False):
    mat=bpy.data.materials.new(label);mat.use_nodes=True
    bs=mat.node_tree.nodes['Principled BSDF'];tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=image;mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value=.22 if glazing else .39
    if glazing:
        mat.node_tree.links.new(tex.outputs['Alpha'],bs.inputs['Alpha']);mat.surface_render_method='BLENDED'
    else:
        mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Emission Color']);bs.inputs['Emission Strength'].default_value=.35
    return mat
def face_mesh(label,faces,material):
    verts=[];indices=[];coords=[]
    for points,uv in faces:
        start=len(verts);verts.extend([(x,-d,h) for x,d,h in points]);indices.append(tuple(start+i for i in range(len(points))));coords.extend(uv)
    mesh=bpy.data.meshes.new(label);mesh.from_pydata(verts,[],indices);mesh.update()
    uv=mesh.uv_layers.new(name='면의 인쇄 좌표')
    uv.uv.foreach_set('vector',[c for pair in coords for c in pair])
    ob=bpy.data.objects.new(label,mesh);m.group.objects.link(ob);mesh.materials.append(material);return ob
def quad(x,d,b,w,h,face=1,left=0,right=1):
    x0=x-w/2;x1=x+w/2
    pts=[(x0,d,b),(x1,d,b),(x1,d,b+h),(x0,d,b+h)]
    if face<0:pts=pts[::-1]
    uv=[(left,0),(right,0),(right,1),(left,1)] if face>0 else [(right,1),(left,1),(left,0),(right,0)]
    return pts,uv
def export_part(source,mesh_name,dest,tmp):
    objs=[o for o in source.objects if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    # Only simple printed surfaces are exported here. Their editable UVs and
    # linked original images are retained unchanged in the native scene.
    stage=tmp/(mesh_name+'-raw.glb')
    bpy.ops.export_scene.gltf(filepath=str(stage),use_selection=True,use_active_scene=True,export_format='GLB',
        export_yup=True,export_image_format='WEBP',export_image_quality=92,export_animations=False,export_lights=False)
    subprocess.run(['node',str(tools/'optimize_model.mjs'),str(stage),str(dest)],check=True)

with TemporaryDirectory(prefix='sinbanpo-shelter-') as staging:
    tmp=Path(staging)
    # The two poster originals remain fully editable in the native Blender file.
    river=make_print(scene,'포스터 원화 · 달빛무지개분수','river',(0,5,0),fonts,m.palette)
    flowers=make_print(scene,'포스터 원화 · 서래섬 유채꽃','flowers',(2.1,5,0),fonts,m.palette)
    render_print(river,tmp/'river.webp')
    render_print(flowers,tmp/'flowers.webp')
    subprocess.run(['node',str(here/'posters.mjs'),str(tmp/'river.webp'),str(tmp/'flowers.webp'),str(tmp/'prints.webp')],check=True)
    img=bpy.data.images.load(str(tmp/'prints.webp'));img.name='반포 풍경 · 직접 그린 포스터 두 장';img.pack()
    art=linked_material('승차대 광고면 · 한강과 서래섬',img)
    prints=collection('한강과 서래섬 포스터')
    faces=[]
    for i,x in enumerate([-2.66,2.66]):
        for face in [-1,1]:
            faces.append(quad(x,-.875+face*.106,.208,1.132,1.824,face,(i+.0008)*.5,(i+.9992)*.5))
    face_mesh('Posters',faces,art)
    glass_sample(tmp/'glass.png');gimg=bpy.data.images.load(str(tmp/'glass.png'));gimg.name='강화유리 · 반투명 수평 블록';gimg.pack()
    glass=collection('강화유리와 반투명 수평 띠')
    faces=[quad(x,-.89,.164,1.268,1.941) for x in [-1.345,0,1.345]]
    face_mesh('Glazing',faces,linked_material('승차대 유리 · 부분 샌딩',gimg,True))
    # Leave a small independent group for the single LED information unit per platform.
    board=collection('승객 전광판과 안내함')
    for x in [-.445,.445]:
        B('행거 · 각형 스틸 현수대',x,-.426,2.358,.049,.052,.345,frame_c,.005)
        B('행거 · 베이스 나사판',x,-.426,2.651,.121,.101,.026,zn,.005)
    B('전광판 · 반사 방지 하우징',0,-.424,2.015,1.188,.142,.367,frame_c,.018)
    B('전광판 · 밝은 금속 테두리',0,-.33,2.037,1.131,.043,.309,ed,.009)
    B('전광판 · 검정 표시창',0,-.298,2.052,1.104,.029,.274,'하부 그늘',.007)
    for x in [-.534,.534]:
        for h in [2.061,2.313]:
            B('표시창 · 고정나사',x,-.277,h,.011,.008,.010,bolt,.002)
    lettering('서울시 버스정보',0,-.279,2.033,.026,'부드러운 백색')
    for k in range(14):B('전광판 · 뒤쪽 냉각 슬롯',(k-6.5)*.067,-.5,2.159,.043,.004,.057,gap)
    swatches(tmp/'finish.png');bake_header(frame,tmp/'header.png')
    subprocess.run(['node',str(here/'structural-atlas.mjs'),str(tmp/'finish.png'),str(tmp/'header.png'),str(tmp/'atlas.png')],check=True)
    steel=bpy.data.images.load(str(tmp/'atlas.png'))
    steel.name='승차대 · 금속 도장과 좌판 나무결';steel.pack()
    for part in frame.objects:
        if part.type=='MESH' and part.data.materials:
            mat=part.data.materials[0]
            if mat.name.startswith('좌판'):
                # Preview the same grain while editing boards individually.
                if not mat.node_tree.nodes.get('나무결'):
                    tex=mat.node_tree.nodes.new('ShaderNodeTexNoise');tex.name='나무결';tex.inputs['Scale'].default_value=77
                    coord=mat.node_tree.nodes.new('ShaderNodeTexCoord')
                    scale=mat.node_tree.nodes.new('ShaderNodeVectorMath');scale.operation='MULTIPLY'
                    scale.inputs[1].default_value=(.17,4,1)
                    mat.node_tree.links.new(coord.outputs['Generated'],scale.inputs[0])
                    mat.node_tree.links.new(scale.outputs[0],tex.inputs['Vector'])
                    b=mat.node_tree.nodes.new('ShaderNodeBump');b.inputs['Distance'].default_value=.0004;b.inputs['Strength'].default_value=.19
                    mat.node_tree.links.new(tex.outputs['Fac'],b.inputs['Height'])
                    mat.node_tree.links.new(b.outputs[0],mat.node_tree.nodes['Principled BSDF'].inputs['Normal'])
    lighting=prepare_lights(scene)
    add_clocks(here)
    scene.view_settings.view_transform='AgX'
    bpy.context.preferences.filepaths.save_version=0
    for ar in bpy.context.screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.region_3d.view_distance=8.2;ar.spaces.active.shading.color_type='MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(here/'shelters.blend'),compress=True)
    merged_frame(frame,steel,here/'frame.glb',tmp,tools)
    export_part(glass,'Glazing',here/'glass.glb',tmp)
    export_part(prints,'Posters',here/'posters.glb',tmp)
    bake_collection(board,'ArrivalUnit',here/'display.glb')
    bake_lighting(frame,lighting,here/'paving-light.webp')
