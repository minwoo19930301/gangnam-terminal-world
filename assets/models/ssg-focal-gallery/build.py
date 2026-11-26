"""Build the Gangnam opening display. Coordinates in metres, customer at -Y."""
import bpy
import math
import random
from collections import defaultdict
from pathlib import Path
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_10F_LEGO_Gangnam')
scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
rng = random.Random(40649)
parts = defaultdict(list)

def linear(c):
    return c / 12.92 if c < .04045 else ((c + .055) / 1.055) ** 2.4

def rgba(hexcode):
    return tuple(linear(int(hexcode[i:i+2],16)/255) for i in (0,2,4)) + (1,)

white='f8f6ec'; cream='ebe5d8'; dark='22252a'; red='cb202d'
blue='0667ac'; yellow='ffcf23'; green='179857'; steel='b8c5ce'

def material(name, roughness, texture=None):
    m=bpy.data.materials.new(name); m.use_nodes=True
    nodes=m.node_tree.nodes; links=m.node_tree.links
    shader=nodes.get('Principled BSDF'); shader.inputs['Roughness'].default_value=roughness
    vc=nodes.new('ShaderNodeVertexColor'); vc.layer_name='Finish'
    if texture:
        tex=nodes.new('ShaderNodeTexImage'); tex.image=texture
        mix=nodes.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'; mix.inputs[0].default_value=1
        links.new(vc.outputs['Color'],mix.inputs[1]); links.new(tex.outputs['Color'],mix.inputs[2])
        links.new(mix.outputs[0],shader.inputs['Base Color'])
    else: links.new(vc.outputs['Color'],shader.inputs['Base Color'])
    return m

# A tile of staggered four-stud courses. The two bright edges and dark groove
# make the glued sculpture's seams readable without extruding every joint.
size=256
ys,xs=np.mgrid[0:size,0:size]
row=ys//128
sx=(xs+row*128)%256
dy=ys%128
value=np.ones((size,size),dtype=float)
value[dy<5]=.73;value[(dy>=5)&(dy<10)]=.91
value[sx<4]=.80;value[(sx>=4)&(sx<9)]=.94
pix=np.ones((size,size,4),dtype=np.float32);pix[:,:,:3]=value[:,:,None]
tile=bpy.data.images.new('브릭 이음새',width=size,height=size)
tile.pixels.foreach_set(pix.ravel());tile.pack()
BATCH_SCULPT='GangnamLegoPuuvilla'
BATCH_GOODS='GangnamLegoEditions'
BATCH_CASE='GangnamLegoCabinet'
mats={BATCH_SCULPT:material('유광 조립 브릭',.29,tile),
      BATCH_GOODS:material('제품과 인쇄',.31),BATCH_CASE:material('진열 집기',.52)}
batch=BATCH_CASE

def finish(o,name,color):
    o.name=name
    mesh=o.data
    mesh.materials.append(mats[batch]); parts[batch].append(o)
    attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    attr.data.foreach_set('color',np.tile(rgba(color),len(mesh.loops)).astype(np.float32))
    return o

def poly(name,verts,faces,color):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj)
    return finish(obj,name,color)

def box(name,xyz,dims,color,bevel=0,angle=0):
    x,y,z=xyz;w,d,h=dims
    verts=[(i*w/2,j*d/2,k*h/2) for k in (-1,1) for j in (-1,1) for i in (-1,1)]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)]
    o=poly(name,verts,faces,color);o.location=xyz;o.rotation_euler.z=angle
    if bevel:
        mod=o.modifiers.new('모서리','BEVEL');mod.width=bevel;mod.segments=2
    return o

def cyl(name,center,r,depth,color,axis=(0,0,1),segments=24,r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=segments,radius1=r,radius2=r if r2 is None else r2,depth=depth,location=center)
    o=bpy.context.object;o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler()
    for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
    return finish(o,name,color)

def rod(name,a,b,r,color,segments=12):
    v=Vector(b)-Vector(a)
    return cyl(name,(Vector(a)+Vector(b))/2,r,v.length,color,v,segments)

def ring(name,x,y,z,outer,inner,thickness,lo,hi,color,n=24):
    # Annular sector in the XZ plane, useful for open minifigure hands.
    verts=[];faces=[]
    for i in range(n+1):
        a=lo+(hi-lo)*i/n
        for dy,r in [(-thickness/2,outer),(-thickness/2,inner),(thickness/2,inner),(thickness/2,outer)]:
            verts.append((x+r*math.cos(a),y+dy,z+r*math.sin(a)))
    for i in range(n):
        for j in range(4):faces.append((4*i+j,4*i+(j+1)%4,4*i+4+(j+1)%4,4*i+4+j))
    faces.extend([(3,2,1,0),tuple(4*n+j for j in range(4))])
    return poly(name,verts,faces,color)

def font_path(paths):
    return next((bpy.data.fonts.load(p) for p in paths if Path(p).exists()),None)
hangul=font_path(['/System/Library/Fonts/Supplemental/AppleGothic.ttf','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'])
latin=font_path(['/System/Library/Fonts/Supplemental/Arial Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'])
def lettering(body,x,y,z,height,color,korean=False):
    curve=bpy.data.curves.new(body,'FONT');curve.body=body;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=height;curve.resolution_u=3
    face=hangul if korean else latin
    if face:curve.font=face
    o=bpy.data.objects.new(body,curve);collection.objects.link(o);o.location=(x,y,z);o.rotation_euler.x=math.pi/2
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');finish(o,body,color);o.select_set(False)

# Silhouette sampled on a regular brick lattice. Each height course remains an
# independent editable mesh. Only external faces survive, including the back.
batch=BATCH_SCULPT
step=.018;rise=.015
ix,iy,iz=np.meshgrid(np.arange(-40,41),np.arange(-33,34),np.arange(114),indexing='ij')
X=ix*step;Y=iy*step;Z=(iz+.5)*rise
field=np.zeros(X.shape,np.uint8)
palette=['000000',white,'211f23','cf2133','158f53','ffcf0c','1261b1','ec452b']
def ell(x,y,z,rx,ry,rz):
    return ((X-x)/rx)**2+((Y-y)/ry)**2+((Z-z)/rz)**2<=1
def fill(mask,idx):field[mask]=idx
for sign in [-1,1]:
    fill(ell(sign*.19,-.02,.125,.155,.20,.176),1)
fill(ell(0,.025,.58,.438,.342,.55),1)
fill(ell(0,.012,.91,.318,.274,.277),1)
for sign in [-1,1]:
    ax=sign*(.345+.39*(.87-Z))
    fill(((X-ax)/.106)**2+((Y+.02)/.112)**2+((Z-.71)/.305)**2<=1,1)
fill(ell(0,-.006,1.255,.35,.281,.302),1)
fill(ell(0,-.191,1.245,.274,.202,.172),1)
for sign in [-1,1]:
    fill(ell(sign*.245,.021,1.479,.088,.075,.116),2)
    # Small widely set printed-looking eyes visible on the flanks of the muzzle.
    fill(ell(sign*.206,-.212,1.338,.026,.035,.029),2)
nose=(abs(X)<.076)&(abs(X)<(.032+(Z-1.26)*.89))&(Z>1.229)&(Z<1.311)
fill(nose&ell(0,-.374,1.274,.091,.03,.053),2)
# Neck kerchief forms a dipped V in front, with loose, tapering separate tails.
scarf_z=1.045-.092*np.maximum(-Y,0)/.27+.03*abs(X)
scarf=(((X/.316)**2+((Y-.005)/.269)**2)<1)&(abs(Z-scarf_z)<.048)
fill(scarf,3)
for sign,low in [(-1,.66),(1,.745)]:
    t=np.clip((.98-Z)/(.98-low),0,1)
    cx=sign*(.022+.112*t);width=.023+.026*np.sin(np.pi*t)
    front=.025-.342*np.sqrt(np.maximum(.001,1-(X/.438)**2-((Z-.58)/.55)**2))
    fill((Z>low)&(Z<.982)&(abs(X-cx)<width)&(abs(Y-front)<.029),3)
cap=ell(0,-.025,1.49,.189,.178,.144)&(Z>1.481)
sectors=((np.arctan2(Y+.025,X)+math.pi)/(math.pi/3)).astype(int)%6
for s,c in enumerate([7,5,6,7,5,6]):fill(cap&(sectors==s),c)
fill(ell(0,-.115,1.49,.196,.178,.019),4)
fill(ell(0,-.026,1.626,.042,.04,.025),4)
origin=(-.27,-.07,.035)
# Rotate the mascot slightly, like the three-quarter view in the release.
turn=-.26
def mascot_point(i,j,k):
    x=(i-40-.5)*step;y=(j-33-.5)*step
    return (origin[0]+x*math.cos(turn)-y*math.sin(turn),origin[1]+x*math.sin(turn)+y*math.cos(turn),origin[2]+k*rise)
directions=[(0,-1),(0,1),(1,-1),(1,1),(2,-1),(2,1)]
padded=np.pad(field,1)
visible=[]
for axis,sign in directions:
    sl=[slice(1,-1)]*3;sl[axis]=slice(2,None) if sign==1 else slice(None,-2)
    visible.append(np.where(padded[tuple(sl)]==0,field,0))
for k in range(field.shape[2]):
    verts=[];faces=[];colors=[];uvs=[]
    def quad(corners,idx,tex):
        start=len(verts);verts.extend(mascot_point(*p) for p in corners);faces.append(tuple(range(start,start+4)));colors.append(idx);uvs.extend(tex)
    for (axis,sign),arr in zip(directions,visible):
        plane=arr[:,:,k]
        if axis==2:
            # Greedy rectangles on the exposed upper/lower horizontal terraces.
            mask=plane.copy()
            for i,j in zip(*np.nonzero(plane)):
                c=mask[i,j]
                if not c:continue
                end=i+1
                while end<mask.shape[0] and mask[end,j]==c:end+=1
                far=j+1
                while far<mask.shape[1] and np.all(mask[i:end,far]==c):far+=1
                mask[i:end,j:far]=0
                h=k+int(sign>0);corners=[(i,j,h),(end,j,h),(end,far,h),(i,far,h)]
                if sign<0:corners.reverse()
                quad(corners,c,[(.48,.48)]*4)
        else:
            for fixed,line in enumerate(plane if axis==0 else plane.T):
                boundaries=np.flatnonzero(np.diff(np.r_[0,line,0]))
                for a,b in zip(boundaries,boundaries[1:]):
                    c=line[a]
                    if not c:continue
                    loc=fixed+int(sign>0)
                    coords=[(a,k),(b,k),(b,k+1),(a,k+1)]
                    if (axis==0 and sign<0) or (axis==1 and sign>0):coords.reverse()
                    corners=[(loc,t,h) if axis==0 else (t,loc,h) for t,h in coords]
                    quad(corners,c,[(t/4,h/2) for t,h in coords])
    if not faces:continue
    o=poly('푸빌라 · %03d단'%(k+1),verts,faces,white)
    uv=o.data.uv_layers.new(name='브릭 단');uv.data.foreach_set('uv',np.asarray(uvs,dtype=np.float32).ravel())
    # Slight baked contact shading follows the recessed surfaces where the
    # muzzle, neckerchief and limbs overlap under diffuse shop lighting.
    coords=np.asarray(verts,dtype=np.float32)
    dx=coords[:,0]-origin[0];dy=coords[:,1]-origin[1];zh=coords[:,2]-origin[2]
    sx=dx*math.cos(turn)+dy*math.sin(turn);sy=-dx*math.sin(turn)+dy*math.cos(turn)
    neck=np.exp(-((zh-1.09)/.058)**2)*.16
    muzzle=np.exp(-((zh-1.152)/.054)**2)*np.clip((-sy-.14)/.10,0,1)*.18
    inner_arm=np.exp(-((abs(sx)-.31)/.045)**2-((zh-.74)/.21)**2)*.13
    feet=np.clip((.24-zh)/.24,0,1)*.17
    tone=1-neck-muzzle-inner_arm-feet-.085*np.clip(sx/.42,0,1)
    colors_per_corner=np.repeat(np.array([rgba(palette[c]) for c in colors],dtype=np.float32),4,axis=0)
    colors_per_corner[:,:3]*=tone[:,None]
    attr=o.data.color_attributes.get('Finish')
    attr.data.foreach_set('color',colors_per_corner.ravel())

# Actual exposed studs are restricted to broad upward-facing shelves of brick,
# with all studs in each course independently editable as connected components.
batch=BATCH_GOODS
for k in range(2,field.shape[2]):
    verts=[];faces=[];colors=[]
    for i,j in zip(*np.nonzero(visible[5][:,:,k])):
        if (i+j)%2 or (k%2 and field[i,j,k]==1):continue
        x,y,z=mascot_point(i+.5,j+.5,k+1);r=.0049
        start=len(verts);n=8
        for h in [0,.0027]:
            for q in range(n):
                a=q*2*math.pi/n;verts.append((x+r*math.cos(a),y+r*math.sin(a),z+h))
        faces.extend(tuple(start+t for t in (q,(q+1)%n,n+(q+1)%n,n+q)) for q in range(n))
        faces.append(tuple(start+n+q for q in range(n)));colors.extend([palette[field[i,j,k]]]*(n*4+n))
    if faces:
        o=poly('푸빌라 돌기 · %03d단'%k,verts,faces,white)
        o['stud_course']=k
        o.data.color_attributes['Finish'].data.foreach_set('color',np.array([rgba(c) for c in colors],dtype=np.float32).ravel())

batch=BATCH_CASE
box('조형물 좌대',(-.27,-.07,.023),(1.14,.93,.046),'e0d7c6',.014)
# Low open sales counter opposite the sculpture, and a freestanding shelf
# behind both, set across part of the bay to preserve an aisle at the right.
box('백색 전시대 하부',(.77,-.065,.395),(.68,.58,.79),cream,.012)
box('노랑 전시대 띠',(.77,-.065,.772),(.72,.62,.056),'eab416',.009)
box('제품 전시 상판',(.77,-.065,.823),(.74,.64,.054),white,.009)
for x in [-1.45,1.05]:box('상품장 측판',(x,1.27,1.15),(.065,.46,2.30),white,.01)
box('황색 배면',(-.20,1.465,1.15),(2.5,.061,2.26),'efbf25')
for z in [.13,.65,1.17,1.69,2.21]:
    box('흰 선반',(-.20,1.25,z),(2.52,.48,.055),white,.008)
    box('선반 아래 조명 띠',(-.20,1.019,z-.021),(2.48,.013,.012),'fff3c8')
box('상단 간판',(-.20,1.25,2.37),(2.57,.48,.30),'fff9e7',.018)
box('상표 바탕',(-1.11,.998,2.37),(.26,.02,.235),'c51c29',.009)
lettering('LEGO',-1.11,.982,2.37,.075,white)
lettering('레고스토어',-.13,.998,2.37,.142,dark,True)

# Two assembled pieces shown beside their cartons. Work in product coordinates
# and then rotate the complete editable groups onto the customer-facing plinth.
batch=BATCH_GOODS
def relocate(objects,pos,angle):
    bpy.context.view_layer.update()
    transform=Matrix.Translation(pos)@Matrix.Rotation(angle,4,'Z')
    for o in objects:o.matrix_world=transform@o.matrix_world

start=len(parts[batch])
for sign in [-1,1]:
    x=sign*.025
    box('미니피겨 바지',(x,0,.048),(.047,.046,.091),blue,.002)
    box('미니피겨 발',(x,-.011,.014),(.047,.068,.028),blue,.002)
    cyl('고관절',(x,0,.084),.027,.046,blue,(1,0,0))
    for dx in [-.011,.011]:
        cyl('발 돌기',(x+dx,-.033,.028),.004,.003,blue,segments=10)
box('파란 허리',(0,0,.103),(.101,.051,.019),blue,.002)
verts=[(sgn*w/2,y,z) for z,w,d in [(.112,.099,.054),(.194,.078,.046)] for y in [-d/2,d/2] for sgn in [-1,1]]
poly('붉은 사다리꼴 몸통',verts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(2,6,7,3),(2,0,4,6)],red)
for s in [-1,1]:
    rod('붉은 어깨',(s*.044,0,.184),(s*.060,-.001,.151),.013,red)
    rod('굽힌 팔',(s*.060,-.001,.151),(s*.065,-.015,.128),.012,red)
    rod('손목',(s*.065,-.015,.128),(s*.068,-.016,.121),.007,yellow)
    ring('손의 열린 집게',s*.068,-.017,.116,.014,.007,.017,-.18,math.pi*1.51,yellow,16)
cyl('노란 목',(0,0,.200),.021,.015,yellow)
cyl('머리 하단',(0,0,.211),.026,.009,yellow,r2=.031)
cyl('미니피겨 얼굴',(0,0,.228),.031,.032,yellow,segments=36)
for s in [-1,1]:cyl('눈',(s*.009,-.0293,.23),.0022,.0015,dark,(0,-1,0),12)
ring('웃음',0,-.031,.224,.0085,.007,.001,3.65,5.78,dark,12)
for zi,r1,r2 in [(.245,.034,.034),(.251,.034,.033),(.258,.033,.029),(.265,.029,.022),(.270,.022,.012),(.273,.012,.002)]:
    cyl('파란 모자', (0,0,zi),r1,.007,blue,segments=24,r2=r2)
box('앞챙',(0,-.019,.244),(.068,.051,.005),blue,.002)
relocate(parts[batch][start:],(.94,.036,.85),-.18)

start=len(parts[batch])
body='ce252b';shadow='9d1a23';chrome='b5bfc4'
box('콜벳 섀시',(0,0,.036),(.113,.303,.023),dark,.006)
box('차체',(0,.006,.054),(.123,.296,.032),body,.008)
box('긴 보닛',(0,-.085,.074),(.099,.128,.016),body,.006)
box('뒤 트렁크',(0,.114,.073),(.104,.076,.017),body,.007)
for s in [-1,1]:
    box('펜더 상단',(s*.055,-.084,.069),(.021,.140,.018),body,.008)
    box('뒤 펜더',(s*.055,.110,.066),(.020,.078,.028),body,.009)
    box('문 윗선',(s*.057,.022,.072),(.011,.115,.010),body,.004)
    box('흰색 측면 인서트',(s*.062,-.002,.058),(.003,.122,.012),white,.001)
    box('측면 손잡이',(s*.063,.055,.070),(.004,.016,.003),chrome,.001)
    for yp in [-.098,.096]:
        cyl('타이어',(s*.057,yp,.029),.029,.018,dark,(1,0,0),32)
        cyl('흰 타이어 링',(s*.067,yp,.029),.021,.002,white,(1,0,0))
        cyl('은색 휠 허브',(s*.069,yp,.029),.014,.003,chrome,(1,0,0))
        for k in range(10):
            a=k*math.tau/10
            cyl('휠 슬롯',(s*.071,yp+.010*math.cos(a),.029+.010*math.sin(a)),.0013,.0006,dark,(1,0,0),8)
    for dx in [.037,.052]:
        cyl('헤드라이트 테두리',(s*dx,-.154,.069),.007,.005,chrome,(0,1,0),16)
        cyl('원형 전조등',(s*dx,-.157,.069),.0051,.0015,white,(0,1,0),16)
    cyl('빨간 후미등',(s*.052,.156,.067),.004,.002,'ef5447',(0,1,0),12)
    box('좌석',(s*.023,.039,.073),(.034,.043,.008),dark,.003)
    box('등받이',(s*.023,.058,.083),(.034,.009,.028),dark,.004)
    rod('앞 유리 기둥',(s*.052,-.022,.080),(s*.044,-.009,.107),.0025,chrome)
    box('범퍼 끝',(s*.048,-.154,.046),(.022,.012,.005),chrome,.002)
rod('앞 유리 프레임',(-.044,-.009,.107),(.044,-.009,.107),.0025,chrome)
# Tinted tapered windshield, with a narrow central reflection on the cowl.
poly('곡면 윈드실드',[(-.052,-.022,.08),(-.043,-.029,.08),(.043,-.029,.08),(.052,-.022,.08),
                  (-.044,-.009,.105),(-.038,-.017,.108),(.038,-.017,.108),(.044,-.009,.105)],
     [(0,1,5,4),(1,2,6,5),(2,3,7,6)],'a9c6d0')
box('대시보드',(0,-.011,.079),(.095,.019,.009),dark,.003)
ring('스티어링 휠',-.026,.002,.088,.009,.006,.002,0,math.tau,dark,20)
box('라디에이터 그릴',(0,-.154,.047),(.077,.004,.017),dark,.002)
for z in [.042,.048,.054]:rod('그릴 크롬 가로살',(-.040,-.158,z),(.040,-.158,z),.0014,chrome)
for x in [-.032,.032]:rod('범퍼 가드',(x,-.159,.036),(x,-.159,.056),.002,chrome)
rod('안테나',(.049,.113,.081),(.049,.116,.116),.0012,chrome,8)
relocate(parts[batch][start:],(.66,-.137,.851),-.91)

# Printed fronts use one atlas; carton thickness, spine, and rear are modeled.
BATCH_PRINT='GangnamLegoCartons'
batch=BATCH_PRINT
atlas=bpy.data.images.load(str(OUT/'cartons.png'));atlas.pack()
paper=bpy.data.materials.new('상품 상자 삽화');paper.use_nodes=True
tex=paper.node_tree.nodes.new('ShaderNodeTexImage');tex.image=atlas
sh=paper.node_tree.nodes.get('Principled BSDF');sh.inputs['Roughness'].default_value=.57
paper.node_tree.links.new(tex.outputs[0],sh.inputs['Base Color'])
mats[batch]=paper
def carton(x,y,z,w,d,h,idx):
    names=['대형 미니피겨','콜벳','디즈니 캐슬','엘도라도 요새']
    colors=['ecce59','20232b','253550','42859c']
    global batch
    batch=BATCH_GOODS
    box(names[idx]+' 상자',(x,y,z+h/2),(w,d,h),colors[idx],.002)
    batch=BATCH_PRINT
    f=y-d/2-.0007
    o=poly(names[idx]+' 표지',[(x-w/2,f,z),(x+w/2,f,z),(x+w/2,f,z+h),(x-w/2,f,z+h)],[(0,1,2,3)],white)
    uv=o.data.uv_layers.new(name='상자 표지')
    u=(idx%2)*.5;v=.5 if idx<2 else 0
    for loop,xy in zip(uv.data,[(.002,.002),(.498,.002),(.498,.498),(.002,.498)]):
        loop.uv=(u+xy[0],v+xy[1])
for row,shelf in enumerate([.158,.678,1.198,1.718]):
    x=-1.395
    orders=[[2,2,1,1,3,0],[0,3,3,1,2,0],[1,1,2,0,0,3],[0,2,3,0,1,1]][row]
    for i,idx in enumerate(orders):
        w=[.292,.407,.416,.384][idx];h=[.391,.281,.388,.326][idx]
        carton(x+w/2,1.18+.017*(i%2),shelf,w,.13,h,idx)
        x+=w+.018
carton(.63,.15,.85,.245,.083,.31,0)
batch=BATCH_CASE
for x,txt in [(.65,'콜벳'),(.95,'대형 미니피겨')]:
    box('제품명 카드',(x,-.383,.808),(.173,.007,.053),white,.002)
    lettering(txt,x,-.388,.809,.019,dark,True)
import sys
sys.dont_write_bytecode=True;sys.path.insert(0,str(OUT))
import mosaic_model,mosaic_export
mosaic_model.make(collection)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print('Editable pieces:',len(collection.objects))
mosaic_export.write(collection)
# Keep silhouette-changing brick terraces at every height. Lower-body studs
# are under a pixel in normal play. Retain representative courses there and
# more on the facial features, ears and cap. The source contains them all.
for o in list(parts[BATCH_GOODS]):
    k=o.get('stud_course')
    if k is not None and ((k<76 and k%4) or (k>=76 and k%2)):
        parts[BATCH_GOODS].remove(o)
        bpy.data.objects.remove(o,do_unlink=True)
# Apply modifiers on the runtime copies only. Keep the native display editable.
for batch,objects in parts.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join();bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
