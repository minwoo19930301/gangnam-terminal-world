"""Customer-facing matcha station and its dark glazed shopfront."""
import bpy,json,math,random,sys,tempfile
from pathlib import Path
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here))
import atlas
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('OsullocGangnamMatchaStation')
bpy.context.scene.collection.children.link(collection)
rng=random.Random(305)
with tempfile.TemporaryDirectory() as tmp:
    texture=Path(tmp)/'Gangnam onyx and tea.png'
    atlas.write(texture);image=bpy.data.images.load(str(texture));image.pack()
image.name='강남 말차 스테이션 · 오닉스와 마감'
mat=bpy.data.materials.new('오닉스 · 스테인리스 · 입면');mat.use_nodes=True
nt=mat.node_tree;shader=nt.nodes.get('Principled BSDF');tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image
vcol=nt.nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
mixed=nt.nodes.new('ShaderNodeMixRGB');mixed.blend_type='MULTIPLY';mixed.inputs[0].default_value=1
nt.links.new(vcol.outputs['Color'],mixed.inputs[1]);nt.links.new(tex.outputs['Color'],mixed.inputs[2]);nt.links.new(mixed.outputs[0],shader.inputs['Base Color'])
shader.inputs['Roughness'].default_value=.38
def uv(p):return ((p[0]+.5)/atlas.WIDTH,1-(p[1]+.5)/atlas.HEIGHT)
def tile(region,u,v):
    x,y,r,b=region
    return uv((x+(r-x)*u,b-(b-y)*v))
vs=[];fs=[];colors=[];uvs=[]
def face(points,color,coords=None):
    i=len(vs);vs.extend(points);fs.append(tuple(range(i,i+len(points))));colors.append(color)
    uvs.extend(coords or [uv(atlas.WHITE)]*len(points))
def attach(mesh):
    mesh.materials.clear();mesh.materials.append(mat)
def part(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update();attach(mesh)
    attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    layer=mesh.uv_layers.new(name='강남 매장 마감')
    for pol,tone in zip(mesh.polygons,colors):
        shades=[tone]*len(pol.loop_indices) if isinstance(tone,str) else tone
        for loop,code in zip(pol.loop_indices,shades):
            attr.data[loop].color_srgb=tuple(int(code[i:i+2],16)/255 for i in [0,2,4])+(1,)
            layer.data[loop].uv=uvs[loop]
    collection.objects.link(bpy.data.objects.new(name,mesh))
    vs.clear();fs.clear();colors.clear();uvs.clear()
def rect(x,y,z,w,d,h,color,region=None):
    base=[(x+a*w/2,y+b*d/2,z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    top=[(a,b,z+h)for a,b,_ in base]
    if region:
        corners=[tile(region,0,0),tile(region,1,0),tile(region,1,1),tile(region,0,1)]
    else:corners=None
    face(top,color,corners);face(base[::-1],color,corners)
    for i in range(4):
        k=(i+1)%4;face([base[i],base[k],top[k],top[i]],color,corners)
def panel(x,y,z,w,h,region,color='ffffff'):
    q=[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)]
    face(q,color,[tile(region,0,0),tile(region,1,0),tile(region,1,1),tile(region,0,1)])
def rod(a,b,r,s,color,n=12):
    a,b=Vector(a),Vector(b);u=(b-a).normalized();ref=Vector((0,0,1)) if abs(u.z)<.9 else Vector((0,1,0))
    v=u.cross(ref).normalized();w=u.cross(v)
    lo,hi=[[tuple(p+rad*(v*math.cos(i*math.tau/n)+w*math.sin(i*math.tau/n))) for i in range(n)] for p,rad in [(a,r),(b,s)]]
    face(lo[::-1],color);face(hi,color)
    for i in range(n):face([lo[i],lo[(i+1)%n],hi[(i+1)%n],hi[i]],color)
def lathe(x,y,profile,n=20):
    previous=None
    for z,r,color in profile:
        ring=[(x+r*math.cos(i*math.tau/n),y+r*math.sin(i*math.tau/n),z) for i in range(n)]
        if previous:
            for i in range(n):face([previous[i],previous[(i+1)%n],ring[(i+1)%n],ring[i]],color)
        previous=ring
    face(previous,profile[-1][2])
def outline(x,y,z,w,h,line,metal):
    rect(x,y,z,w,.035,line,metal);rect(x,y,z+h-line,w,.035,line,metal)
    for k in [-1,1]:rect(x+k*(w-line)/2,y,z+line,line,.035,h-2*line,metal)
# The two fixed shopfront wings flank the central clear opening. Rounded parted
# lights are open in the middle so products can be seen through the frames.
def door(cx):
    rect(cx,.16,.055,.626,.145,.86,'302a25')
    outline(cx,.077,.12,.55,.72,.025,'55473a')
    x1,x2=cx-.30,cx+.30;z1,z2=.945,2.695
    points=[(x1+.10,z1),(x2-.10,z1),(x2-.10,z1+.045),(x2-.035,z1+.072),
      (x2,z1+.15),(x2,z2-.16),(x2-.035,z2-.075),(x2-.10,z2-.046),(x2-.10,z2),
      (x1+.10,z2),(x1+.10,z2-.046),(x1+.035,z2-.075),(x1,z2-.16),
      (x1,z1+.15),(x1+.035,z1+.072),(x1+.10,z1+.045)]
    for i,(xx,zz) in enumerate(points):
        xx2,zz2=points[(i+1)%len(points)]
        # Project onto the rectangular field around the cut-out, leaving
        # matching solid corners and the warm recessed metal bead.
        def outer(a,b):
            dx,dz=a-cx,b-(z1+z2)/2
            t=min(.332/max(abs(dx),.00001),.925/max(abs(dz),.00001))
            return cx+dx*t,(z1+z2)/2+dz*t
        oa,ob=outer(xx,zz),outer(xx2,zz2)
        face([(xx,.061,zz),(xx2,.061,zz2),(ob[0],.061,ob[1]),(oa[0],.061,oa[1])],'392f28')
        face([(xx,.061,zz),(xx2,.061,zz2),(xx2,.156,zz2),(xx,.156,zz)],'ae9574')
    rect(cx,.14,2.745,.667,.15,.044,'584b40')
for side in [-1,1]:
    for cx in [2.44,3.12]:door(side*cx)
    for cx in [1.96,3.61]:
        x=cx*side
        rect(x,.13,.02,.26,.30,3.20,'372f29')
        rect(x,.12,0,.30,.32,.095,'51463b')
        for j in range(4):rect(x+(j-1.5)*.043,-.027,.20,.014,.022,2.56,'6b5947')
        rect(x,-.032,2.79,.23,.046,.36,'433931')
        rod((x,-.072,2.968),(x,-.086,2.968),.073,.064,'ad9470',16)
        rod((x,-.087,2.968),(x,-.103,2.968),.047,.036,'ffefba',16)
    rect(2.79*side,.13,2.78,1.41,.21,.40,'39312c')
    outline(2.79*side,.015,2.84,1.27,.285,.013,'947e65')
    part('쇼윈도 · 고정 유리문과 세로 홈 '+str(side))
rect(0,.12,2.75,3.71,.20,.46,'332d29')
outline(0,.011,2.79,3.59,.365,.015,'9c8870')
rect(0,.14,3.21,7.60,.36,.055,'9d8b78')
part('중앙 현판과 처마')
# Existing wordmark traced from the operator image at 460×69. Keep outlines
# editable as separate native letters, including the counters of the O glyphs.
def painted_text(obj,color):
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
    obj=bpy.context.object;attach(obj.data)
    for old in list(obj.data.uv_layers):obj.data.uv_layers.remove(old)
    a=obj.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER');layer=obj.data.uv_layers.new(name='강남 매장 마감')
    for el in a.data:el.color_srgb=tuple(int(color[k:k+2],16)/255 for k in [0,2,4])+(1,)
    for el in layer.data:el.uv=uv(atlas.WHITE)

def wordmark(x,y,z,width,color):
    paths=json.loads((here/'wordmark.json').read_text())
    curve=bpy.data.curves.new('OSULLOC 원본 윤곽','CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.resolution_u=1
    for pts in paths:
        spline=curve.splines.new('POLY');spline.points.add(len(pts)-1);spline.use_cyclic_u=True
        for v,(px,py) in zip(spline.points,pts):v.co=((px-230)*width/460,(34.5-py)*width/460,0,1)
    obj=bpy.data.objects.new('OSULLOC · 상호',curve);collection.objects.link(obj);obj.location=(x,y,z);obj.rotation_euler.x=math.pi/2
    painted_text(obj,color)
wordmark(0,-.004,2.974,1.05,'fff8eb')

# The photo's pale onyx counter has a shallow, stainless recessed display
# along its left face and continues to full height at the staffed right end.
rect(.46,1.47,0,3.75,.84,.071,'90948a')
rect(.46,1.47,.070,3.76,.85,.66,'ffffff',atlas.STONE)
rect(1.53,1.47,.727,1.62,.85,.30,'ffffff',atlas.STONE)
rect(-1.219,1.47,.727,.40,.85,.30,'ffffff',atlas.STONE)
rect(-.14,1.73,.728,1.78,.32,.298,'edf4f1',atlas.STEEL)
rect(-.14,1.42,.726,1.79,.51,.027,'c4d0c8',atlas.STEEL)
rect(-.14,1.82,1.006,1.79,.14,.018,'c5d2ca')
rect(-.14,1.068,1.001,1.79,.019,.013,'d6e1da')
for x in [-1.00,.715]:rect(x,1.45,1.001,.016,.77,.013,'d6e1da')
for x in [-1.00,.715]:rect(x,1.056,.753,.011,.018,.248,'e7eee7')
part('연녹색 오닉스 카운터와 매립 진열')
# Concession-size samples and tea gift boxes in the shallow front niche.
shades=['7c965a','a9ad69','ab875e','bedea6','4f775d','78694a']
for i in range(8):
    x=-.90+i*.21
    if i in [0,1,5,6]:
        rect(x,1.33,.757,.125,.102,.154,shades[i%6])
        rect(x,1.276,.805,.087,.005,.052,'e2dec6')
    else:
        lathe(x,1.33,[(.757,.051,'77856c'),(.767,.052,'8b9278'),(.854,.051,shades[i%6]),(.875,.037,'b3c1b5'),(.888,.037,'9b9e8d')],12)
# A boxed stainless mill: inverted funnel, short neck, drum, motor vent and
# sloping discharge chute. The photo shows a clear protective enclosure.
cx,cy=-1.09,1.50
rect(cx,cy,1.03,.40,.35,.36,'d9dfd8',atlas.STEEL)
for i in range(6):rect(cx-.070+i*.029,cy-.178,1.092,.009,.007,.12,'5b6461')
lathe(cx,cy,[(1.38,.16,'bac3bd'),(1.40,.16,'929c96'),(1.50,.13,'bdc6bd'),(1.53,.13,'80908b'),(1.55,.045,'b1bbb7'),(1.65,.033,'a2aba7'),(1.79,.165,'e1e6df'),(1.808,.17,'a9b3ad')])
for x in [cx-.25,cx+.25]:
    for d in [cy-.23,cy+.23]:rect(x,d,1.034,.015,.015,.82,'bec9c2')
    rect(x,cy,1.85,.02,.48,.022,'d8e0d9')
for d in [cy-.23,cy+.23]:rect(cx,d,1.85,.52,.02,.022,'c2cbc5')
rod((cx+.19,cy,1.46),(cx+.29,cy-.10,1.18),.032,.047,'a2aca4',4)
part('말차 그라인더 · 호퍼와 스테인리스 케이스')

# Backlit display artwork is newly drawn for the model. The operator's 2025
# photograph shows a green drink with the white shop mark on the tall panel.
rect(-.46,2.44,1.02,.80,.10,1.73,'7c8d85')
panel(-.46,2.381,1.06,.752,1.65,atlas.POSTER)
wordmark(-.46,2.374,2.55,.58,'fffcf4')
# The right hand tablet rests on a tilt, just above the solid stone end.
face([(1.19,1.09,1.04),(1.82,1.09,1.04),(1.82,1.26,1.37),(1.19,1.26,1.37)],'3b423d')
face([(1.24,1.096,1.065),(1.77,1.096,1.065),(1.77,1.233,1.335),(1.24,1.233,1.335)],'ffffff',
     [tile(atlas.TABLET,0,0),tile(atlas.TABLET,1,0),tile(atlas.TABLET,1,1),tile(atlas.TABLET,0,1)])
# Dark coasters and a tasting spoon are visible below the photographed pair.
rect(.985,1.44,1.029,.52,.29,.016,'38373d')
for x in [.865,1.095]:lathe(x,1.45,[(1.045,.078,'262829'),(1.049,.078,'303033')],24)
rod((.995,1.352,1.052),(1.144,1.349,1.052),.003,.0039,'b6beb4',8)
lathe(.985,1.352,[(1.049,.012,'8c978f'),(1.054,.016,'d1d8ca')],12)
def tint_rgb(rgb,k):
    return ''.join('%02x'%min(255,max(0,round(n*k))) for n in rgb)
def wavy_cup(cx,cy,levels,n=28):
    rings=[]
    for z,r,ripple,rgb in levels:
        ring=[]
        for i in range(n):
            a=math.tau*i/n
            height=z+ripple*(.57*math.sin(3*a+z*2)+.30*math.cos(7*a)+.13*math.sin(12*a))
            bright=1+.11*math.cos(a*3+.2)+.09*math.sin(a*6+3.1)
            ring.append(((cx+r*math.cos(a),cy+r*math.sin(a),height),tint_rgb(rgb,bright)))
        rings.append(ring)
    for lo,hi in zip(rings,rings[1:]):
        for i in range(n):
            quad=[lo[i],lo[(i+1)%n],hi[(i+1)%n],hi[i]]
            face([q[0] for q in quad],[q[1] for q in quad])
    face([q[0] for q in rings[-1]],rings[-1][0][1])
def rim(cx,cy,z,r,t,shade,n=28):
    for i in range(n):
        a,b=math.tau*i/n,math.tau*(i+1)/n
        face([(cx+k*math.cos(t0),cy+k*math.sin(t0),z)for k,t0 in [(r,a),(r,b),(r-t,b),(r-t,a)]],shade)
def mound(cx,cy,base,levels,colors,lobes=1,phase=0,n=14):
    prev=None
    for j,(h,r) in enumerate(levels):
        rr=[r*(1+.15*math.cos(lobes*k*math.tau/n+phase+j*.25)) for k in range(n)]
        pts=[(cx+rr[k]*math.cos(k*math.tau/n),cy+rr[k]*math.sin(k*math.tau/n),base+h)for k in range(n)]
        if prev:
            for k in range(n):face([prev[k],prev[(k+1)%n],pts[(k+1)%n],pts[k]],colors[(k//3+j)%len(colors)])
        prev=pts
    face(prev,colors[0])

cx,cy=.865,1.44
wavy_cup(cx,cy,[(1.05,.047,0,(183,193,176)),(1.055,.048,0,(147,50,58)),
  (1.093,.053,.012,(167,49,57)),(1.104,.053,.014,(187,163,128)),
  (1.127,.056,.020,(119,158,101)),(1.18,.06,.012,(72,119,70)),
  (1.235,.065,.002,(105,153,87)),(1.238,.065,.001,(165,191,133))])
rim(cx,cy,1.053,.050,.003,'b9c8bb');rim(cx,cy,1.259,.069,.0032,'cbd7c9')
for k in range(9):
    a=rng.random()*math.tau;r=.047*rng.random()
    x,d=cx+r*math.cos(a),cy+r*math.sin(a)
    mound(x,d,1.235,[(0,.011),(.006,.012),(.010,.006)],['bad4a1','d0dfb6','aac99a'],2,k,7)
for a in [-2.64,-.66]:
    rod((cx+math.cos(a)*.048,cy+math.sin(a)*.048,1.056),(cx+math.cos(a)*.069,cy+math.sin(a)*.069,1.258),.0017,.0014,'c1d1bb',5)

cx,cy=1.095,1.45
lathe(cx,cy,[(1.05,.058,'c5cfc3'),(1.055,.061,'dbe2d8'),(1.060,.030,'acb8ae'),
  (1.070,.012,'cbd5c8'),(1.098,.011,'d7dfd2'),(1.108,.023,'b6c1b6')],24)
wavy_cup(cx,cy,[(1.105,.019,0,(186,199,182)),(1.12,.036,0,(124,154,98)),
 (1.161,.058,.003,(154,176,123)),(1.183,.064,.002,(228,226,201)),(1.210,.066,.003,(232,220,192)),
 (1.218,.066,.002,(183,147,86))])
for k in range(45):
    a=rng.random()*math.tau;r=.058*math.sqrt(rng.random())
    x,d=cx+r*math.cos(a),cy+r*math.sin(a);rr=rng.uniform(.0034,.0077)
    mound(x,d,1.217,[(0,rr),(.005,rr),(.010,rr*.42)],[rng.choice(['b48b55','c7a16a','ddbc7c','ab8249'])],1,k,5)
rim(cx,cy,1.247,.067,.002,'dce3d5')
mound(cx-.013,cy+.005,1.225,[(0,.036),(.009,.050),(.026,.047),(.036,.033),(.044,.038),(.06,.029),(.067,.021),(.084,.014),(.094,.003)],['91a86e','95ae74','8ca368'],4,1,20)
mound(cx+.031,cy+.001,1.233,[(0,.024),(.015,.027),(.032,.021),(.047,.014),(.061,.001)],['f0e1c2','eadcc0','e8d5b4'],6,0,16)
for dx,dz in [(-.031,.080),(.020,.088)]:
    x=cx+dx;z=1.232+dz
    face([(x-.016,cy,z-.010),(x-.008,cy-.007,z+.015),(x+.017,cy,z+.009),(x+.011,cy+.006,z-.016)],'624432')
rod((cx+.010,cy+.015,1.291),(cx+.046,cy+.038,1.354),.006,.006,'b17f51',8)
rod((cx-.005,cy+.017,1.313),(cx-.076,cy-.010,1.347),.006,.006,'bf9665',8)
part('시음대 · 레드베리 말차와 아이스크림 파르페')

# Cool stainless display shelving, with integrated shelf light and tea packs.
for i in range(3):
    x=-2.51+i*.77
    rect(x,2.92,.08,.75,.20,2.53,'e4eeed',atlas.STEEL)
    rect(x,2.60,.02,.76,.66,.54,'d4dcd6',atlas.STEEL)
    for level in range(4):
        z=.57+level*.47
        rect(x,2.67,z,.75,.47,.039,'adb9b8')
        rect(x,2.443,z+.02,.72,.012,.013,'edf9fb')
        for k in range(4):
            px=x+(k-1.5)*.164
            col=['829f85','f0dcbd','486f71','ceb977','b4c7a6','e3d5ca','8f8877'][(i*11+k+level*3)%7]
            h=.16+.03*((k+i)%3)
            rect(px,2.58,z+.039,.128,.108,h,col)
            rect(px,2.520,z+.07,.079,.008,.061,'dedbc4')
            rect(px,2.514,z+.103,.047,.003,.008,'69846c')
            face([(px-.026,2.513,z+.076),(px+.018,2.513,z+.077),(px+.029,2.513,z+.097)],'94a97d')
    rect(x-.374,2.67,.54,.021,.49,2.07,'697c7a')
part('조명 선반과 차 상자')
# The brand detail photo singles out loose leaves in clear specimen jars.
# Preserve the view through the jars with thin rims and glass highlights.
rect(-2.31,1.82,.03,1.01,.58,.71,'d1dad5',atlas.STEEL)
rect(-2.31,1.82,.74,1.035,.60,.037,'b4c1bb')
for i,(cx,cy,r,h) in enumerate([(-2.62,1.83,.087,.30),(-2.38,1.81,.100,.35),(-2.10,1.82,.081,.24)]):
    z=.778
    lathe(cx,cy,[(z,r,'c7d4c9'),(z+.013,r,'d8e1d7'),(z+.03,r*.92,'aebfae')],16)
    lathe(cx,cy,[(z+h-.009,r,'c9d6cd'),(z+h,r*1.01,'dfe8dd'),(z+h+.004,r*.83,'c6d0c2')],16)
    for off in [-.82,.86]:rod((cx+r*off,cy-r*.43,z+.014),(cx+r*off,cy-r*.43,z+h-.008),.0025,.0025,'c8d6ce',5)
    for j in range(26):
        theta=rng.random()*math.tau;rr=r*.75*math.sqrt(rng.random())
        x=cx+rr*math.cos(theta);d=cy+rr*math.sin(theta)
        zz=z+.025+(j/26)*h*(.48 if i==1 else .40)
        col=rng.choice(['43543a','526c41','667946','4a6442'])
        face([(x-.019,d,zz),(x-.006,d-.012,zz+.007),(x+.022,d+.002,zz+.015),(x+.001,d+.010,zz+.012)],col)
part('차 진열 · 유리 표본 병과 말린 찻잎')
rect(1.39,3.02,.06,3.23,.11,2.68,'e4eeea',atlas.STEEL)
for x in [.06,.74,1.45,2.17,2.91]:
    rect(x,2.959,.08,.009,.008,2.65,'9aa7a5')
rect(1.44,2.74,.05,3.08,.57,.84,'d2d9d2',atlas.STEEL)
rect(1.44,2.69,.89,3.13,.68,.044,'e3e8e0')
part('후면 스테인리스 작업대')
# Three lines appear on the panel in the operator's 2025 photograph. Keep
# the contemporary graphic on the panel instead of inventing menu prices.
rect(1.97,2.94,1.18,1.93,.032,1.49,'c4cdcf')
part('벽면 · 은회색 그래픽 패널')
fontdata=bpy.data.curves.new('티샵 벽의 문구','FONT')
fontdata.body='Pause Your Busy Day\nGet Your Matcha\nOSULLOC is for Every Day'
fontdata.align_x='LEFT';fontdata.align_y='CENTER';fontdata.resolution_u=2;fontdata.space_line=1.10
for fp in ['/System/Library/Fonts/Supplemental/Georgia.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf']:
    if Path(fp).is_file():fontdata.font=bpy.data.fonts.load(fp);break
words=bpy.data.objects.new('은회색 패널의 문구',fontdata);collection.objects.link(words)
bpy.context.view_layer.update()
scale=.99/max(.01,words.dimensions.x);words.scale=(scale,scale,scale)
words.rotation_euler.x=math.pi/2;words.location=(1.15,2.917,1.91)
painted_text(words,'363e3c')

# Pale squared floor tiles continue from the shop sill to the public counter.
for row in range(4):
    for col in range(7):
        x=-2.97+col*.93
        d=.48+row*.73
        if x< -2.8 and d>2.64:continue
        rect(x,d,.023,.926,.726,.009,['d7d8d4','d4d6d2','dadad5'][(col+row*2)%3])
part('밝은 회색 매장 바닥 타일')
for x in [-2.54,-.92,1.08,2.74]:
    rect(x,1.54,3.14,.048,2.66,.032,'8c9190')
    rect(x,1.54,3.126,.022,2.55,.015,'fff9ea')
rect(.02,1.68,3.175,6.49,2.95,.08,'d8dbd7')
part('천장 매입 선형등')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'station.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
