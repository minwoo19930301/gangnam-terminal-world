"""Author the two-seat Milhwa dining table. All dimensions in metres."""
import bpy, math, random
import numpy as np
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi, tau

OUT = Path(__file__).resolve().parent
rng = random.Random(41)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
coll = bpy.data.collections.new('SSG_11F_Milhwa')
scene.collection.children.link(coll)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[coll.name]
wood, food, steel = 'MilhwaWalnut', 'MilhwaGangnamGuksuJeongol', 'MilhwaTableMetal'
mats = {}
for name, rough, metal in [(wood,.39,0),(food,.36,0),(steel,.28,.46)]:
    m = bpy.data.materials.new(name)
    mats[name] = m
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    if name != wood:
        v = m.node_tree.nodes.new('ShaderNodeVertexColor')
        v.layer_name = 'Color'
        m.node_tree.links.new(v.outputs[0], bs.inputs['Base Color'])
    else:
        # Synthesise longitudinal grain and pores in veneer UV space.
        h,w = 256,512
        y,x = np.mgrid[0:h,0:w] / np.array([h,w])[:,None,None]
        wave = y*27 + .49*np.sin(tau*x+.8*np.sin(tau*y)) + .19*np.cos(tau*(2*x+y))
        grain = .026*np.sin(tau*wave)+.012*np.cos(tau*wave*3)+.014*np.sin(tau*wave*7)
        grain += np.random.default_rng(41).normal(0,.012,(h,w))
        rgba = np.ones((h,w,4),np.float32)
        rgba[:,:,:3] = np.array([.41,.261,.167])+grain[:,:,None]*[1,.85,.61]
        im=bpy.data.images.new('호두색 목재 무늬',w,h,alpha=False)
        im.pixels.foreach_set(rgba.ravel()); im.pack()
        tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
        m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])

def linear(v):
    v=v/255
    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4

def finish(o,n,color,mat):
    o.name=n
    o.data.materials.append(mats[mat])
    if mat!=wood:
        a=o.data.color_attributes.new(name='Color',type='BYTE_COLOR',domain='POINT')
        rgb=tuple(linear(int(color[i:i+2],16)) for i in (0,2,4))
        a.data.foreach_set('color',list((*rgb,1))*len(a.data))
    return o

def mesh(n,v,f,col,mat=food,smooth=False):
    data=bpy.data.meshes.new(n);data.from_pydata(v,[],f);data.update()
    o=bpy.data.objects.new(n,data);coll.objects.link(o)
    if smooth:
        for p in data.polygons:p.use_smooth=True
    return finish(o,n,col,mat)

def block(n,x,y,z,w,d,h,col,mat=food,bevel=.004):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    o=bpy.context.object
    for v in o.data.vertices:
        v.co.x*=w;v.co.y*=d;v.co.z*=h
    if bevel:
        b=o.modifiers.new('둥근 모서리','BEVEL');b.width=bevel;b.segments=3
        bpy.ops.object.modifier_apply(modifier=b.name)
        if hasattr(o.data,'use_auto_smooth'):o.data.use_auto_smooth=True
        b=o.modifiers.new('면 법선','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=b.name)
    if mat==wood:
        uv=o.data.uv_layers.active
        for p in o.data.polygons:
            for j in p.loop_indices:
                v=o.data.vertices[o.data.loops[j].vertex_index].co
                uv.data[j].uv=(v.y+.5+x if abs(p.normal.z)>.65 else v.x+v.z*1.3,v.x+.5+y if abs(p.normal.z)>.65 else v.y+v.z*.17)
    return finish(o,n,col,mat)

def vessel(n,x,y,z,profile,col,mat=food,seg=64,power=1):
    v=[];f=[]
    for r,h in profile:
        for j in range(seg):
            a=tau*j/seg
            v.append((x+r*math.copysign(abs(cos(a))**power,cos(a)),y+r*math.copysign(abs(sin(a))**power,sin(a)),z+h))
    for i in range(len(profile)-1):
        for j in range(seg):
            k=(j+1)%seg; a=i*seg
            f.append((a+j,a+k,a+k+seg,a+j+seg))
    f.extend([tuple(reversed(range(seg))),tuple(range(len(v)-seg,len(v)))])
    o=mesh(n,v,f,col,mat,True)
    if mat==steel:
        # Low-frequency reflected dining-room tones, especially along the rolled lip.
        attr=o.data.color_attributes['Color']
        for idx,vert in enumerate(v):
            ring,j=divmod(idx,seg)
            a=tau*j/seg
            hi=(.5+.5*cos(3*a+.42))**6
            sweep=.72+.14*cos(2*a-.52)+.14*hi
            if ring in (5,7,8):sweep+=.18
            if ring==9:sweep-=.16
            tint=tuple(linear(min(255,int(col[k:k+2],16)*sweep)) for k in (0,2,4))
            attr.data[idx].color=(*tint,1)
    elif n in ('백자 찬기','타원형 샐러드 접시','물잔'):
        # Warm glaze and the contact shadow inside each recessed well.
        attr=o.data.color_attributes['Color']
        for idx in range(len(v)):
            ring,j=divmod(idx,seg)
            shade=(.79,.83,.87,.93,1,.99,1,.89,.83,.91)[min(9,ring)]
            shade+=.018*cos(tau*j/seg+1)
            attr.data[idx].color=tuple(linear(min(255,int(col[k:k+2],16)*shade)) for k in (0,2,4))+(1,)
    return o

def tube(n,points,r,col,mat=food,sides=8):
    v=[];f=[]
    for i,p in enumerate(points):
        t=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])).normalized()
        ref=Vector((0,0,1)) if abs(t.z)<.92 else Vector((0,1,0))
        a=t.cross(ref).normalized();b=t.cross(a)
        for j in range(sides):v.append(Vector(p)+r*(a*cos(tau*j/sides)+b*sin(tau*j/sides)))
    for i in range(len(points)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides;f.append((a,b,b+sides,a+sides))
    f.extend([tuple(reversed(range(sides))),tuple(range(len(v)-sides,len(v)))])
    return mesh(n,v,f,col,mat,True)

def oval(n,x,y,z,rx,ry,rz,col,mat=food,angle=0):
    if rx<.005:
        # The lower hemisphere of stock foam and seeds is submerged. A cap
        # with a single raised ring keeps their highlights at walking distance.
        v=[(x,y,z+rz)]
        for j in range(7):
            a=tau*j/7
            v.append((x+rx*cos(a),y+ry*sin(a),z))
        return mesh(n,v,[(0,j+1,(j+1)%7+1) for j in range(7)],col,mat,True)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(x,y,z))
    o=bpy.context.object;o.scale=(rx,ry,rz);o.rotation_euler.z=angle
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,n,col,mat)

# Two dining chairs with gently bowed backs, seat cushions and exposed stretchers.
block('전골 식탁',0,0,.746,1.08,1.35,.052,'',wood,.015)
for s in [-1,1]:
    for t in [-1,1]:
        block('식탁 다리',s*.467,t*.596,.366,.057,.057,.732,'',wood)
    block('식탁 옆막이',s*.465,0,.69,.042,1.2,.087,'',wood)
    x=s*.78
    block('의자 좌판',x,0,.432,.451,.459,.047,'',wood,.017)
    block('앉는 방석',x,0,.461,.429,.437,.034,'59473c',bevel=.016)
    for dx in [-1,1]:
        for dy in [-1,1]:
            outer=dx==s
            leg=block('등받이 기둥' if outer else '의자 앞다리',x+dx*.189,dy*.192,.435 if outer else .21,.038,.040,.87 if outer else .42,'',wood)
            if outer:leg.rotation_euler.y=s*.04
    for dy in [-1,1]:block('가로대',x,dy*.19,.212,.38,.023,.032,'',wood)
    for yy in [-.14,-.07,0,.07,.14]:
        o=block('의자 등살',x+s*(.199+.023*cos(yy*9)),yy,.67,.022,.040,.365,'',wood)
        o.rotation_euler.y=s*.09
    block('등받이 윗대',x+s*.220,0,.847,.049,.438,.068,'',wood,.015)

top=.772
vessel('매립 화구 테두리',0,0,top,[(.218,0),(.223,.004),(.222,.012),(.211,.015),(.207,.009),(.177,.009)],'a5a3a0',steel)
vessel('화구 안쪽',0,0,top+.009,[(.205,0),(.205,.006),(.195,.01),(.15,.012)],'242224')
# Flared stainless stockpot with a rolled lip and two loop handles riveted at four lugs.
pz=.797
vessel('국수전골 스테인리스 냄비',0,0,pz,[(.128,0),(.148,.005),(.17,.021),(.19,.058),(.202,.105),(.204,.117),(.207,.119),(.207,.123),(.202,.126),(.198,.122),(.195,.106),(.183,.061),(.161,.026),(.13,.012)],'c2bfba',steel,96)
for s in [-1,1]:
    pts=[]
    for i in range(31):
        a=pi*i/30;pts.append((s*(.193+.067*sin(a)**.78),.065*cos(a),pz+.077+.072*sin(a)**.82))
    tube('황동 고리 손잡이',pts,.006,'c29e55',steel,12)
    for t in [-1,1]:
        oval('손잡이 리벳',s*.185,t*.063,pz+.082,.008,.009,.009,'c2b89a',steel)
broth=pz+.087
# Broken patches of fat and darker stock meet the curved inner wall.
stock_v=[(0,0,broth+.004)];stock_f=[];stock_c=[(.45,.24,.07,1)]
for ri in range(1,30):
    for j in range(96):
        a=tau*j/96
        r=.193*ri/29
        x,y=r*cos(a),r*sin(a)
        v=.5+.24*sin(74*x+2*sin(82*y))+.18*cos(155*y+3*sin(61*x))+.07*sin(125*x+180*y)
        edge=(ri/29)**5
        stock_v.append((x,y,broth+.004+.0008*v))
        rgb=(147+40*v-25*edge,95+51*v-28*edge,42+38*v-20*edge)
        stock_c.append(tuple(linear(k) for k in rgb)+(1,))
        k=1+(ri-1)*96+j;kn=1+(ri-1)*96+(j+1)%96
        stock_f.append((0,k,kn) if ri==1 else (k-96,k,kn,kn-96))
stock=mesh('끓는 육수의 기름 무늬',stock_v,stock_f,'af7940',smooth=True)
stock.data.color_attributes['Color'].data.foreach_set('color',[c for rgb in stock_c for c in rgb])
for j in range(132):
    a=rng.random()*tau;r=rng.uniform(.08,.185);x,y=r*cos(a),r*sin(a)
    size=rng.uniform(.0014,.0042)
    # Cluster the foam along the edges and between the toppings.
    oval('육수의 잔거품',x,y,broth+.005,size,size,.0016,rng.choice(['d7b871','e4c991','cda86a']))

# Folded leaves and beef slivers use a double-sided corrugated ribbon with a tapered end.
def leaf(n,x,y,z,L,W,angle,col,crinkle=.004):
    v=[];f=[];phase=rng.random()*tau
    for i in range(11):
        t=i/10;w=W*(.16+.84*sin(pi*t)**.65)
        for j in range(5):
            u=(j-2)/2;dx=(t-.5)*L;dy=w*u+.1*W*sin(t*tau+phase)
            h=crinkle*(sin(8*t+phase+u)*1.3+abs(u)*sin(13*t+2*u)+u*u)
            v.append((x+dx*cos(angle)-dy*sin(angle),y+dx*sin(angle)+dy*cos(angle),z+h))
    for i in range(10):
        for j in range(4):
            a=i*5+j;f.append((a,a+5,a+6,a+1))
    o=mesh(n,v,f,col,smooth=True)
    return o

for i in range(29):
    a=rng.random()*tau;r=rng.uniform(.022,.145);x=r*cos(a);y=r*sin(a)
    col=rng.choice(['e3d69d','c0b865','f0dc9e','92a14e'])
    leaf('배추와 대파',x,y,broth+.009+rng.random()*.014,rng.uniform(.043,.09),.014,a,col)
    tube('채소 줄기',[(x+(t-.5)*.055*cos(a),y+(t-.5)*.055*sin(a),broth+.016+.003*sin(t*pi)) for t in (0,.2,.4,.6,.8,1)],.0018,'e5dc9c')
for i in range(13):
    a=rng.random()*tau;r=rng.uniform(.05,.14)
    leaf('얇은 소고기',r*cos(a),r*sin(a),broth+.018,.056,.019,a,rng.choice(['98694e','bc9273','b78164']),.006)
for i in range(25):
    a=rng.random()*tau;r=rng.uniform(.022,.144);phase=rng.random()*tau
    pts=[]
    for j in range(20):
        t=j/19
        pts.append((r*cos(a)+.041*cos(t*4+phase),r*sin(a)+.028*sin(t*5+phase),broth+.011+.014*sin(t*pi)+.006*sin(phase+t*5)))
    # Flat knife-cut cross section with a soft edge.
    verts=[];faces=[]
    for j,(xx,yy,zz) in enumerate(pts):
        dx=pts[min(j+1,19)][0]-pts[max(j-1,0)][0];dy=pts[min(j+1,19)][1]-pts[max(j-1,0)][1]
        length=max(.00001,math.hypot(dx,dy))
        for k in range(6):
            w=.0035*cos(k*tau/6)
            verts.append((xx-w*dy/length,yy+w*dx/length,zz+.0017*sin(k*tau/6)))
    for j in range(19):
        for k in range(6):
            a=j*6+k;b=j*6+(k+1)%6;faces.append((a,b,b+6,a+6))
    mesh('칼국수 면발',verts,faces,'e9dab3',smooth=True)
for i in range(10):
    a=rng.random()*tau;r=rng.uniform(.035,.133)
    x=r*cos(a);y=r*sin(a)
    tube('버섯 대',[(x,y,broth+.015),(x+.009,y,broth+.04)],.004,'e5d3a7')
    oval('버섯 갓',x+.009,y,broth+.04,.015,.011,.006,'ad845f',angle=a)
# Four shallow ivory side dishes beyond the burner, including one rounded square.
def dish(n,x,y,r,square=False):
    return vessel(n,x,y,top,[(r*.47,0),(r*.51,.004),(r*.63,.006),(r*.93,.023),(r,.033),(r,.036),(r*.94,.038),(r*.89,.033),(r*.66,.016),(r*.42,.012)],'f2e7ce',seg=48,power=.34 if square else 1)
for i,(x,y) in enumerate([(-.322,.312),(-.116,.392),(.101,.397),(.304,.31)]):
    dish('백자 찬기',x,y,.092,i==3)
    for j in range([13,18,22,10][i]):
        a=rng.random()*tau;r=rng.uniform(.003,.045);cx=x+r*cos(a);cy=y+r*sin(a);z=top+.021+.009*(1-r/.045)+rng.random()*.008
        if i==0:
            leaf('배추김치',cx,cy,z,.054,.012,a,rng.choice(['bd4021','e67e3b','c45326','e7ae67']))
        elif i in (1,2):
            pts=[]
            for k in range(11):
                t=k/10-.5
                dx=t*.053;dy=.006*sin(4*t+a)+t*t*.014
                pts.append((cx+dx*cos(a)-dy*sin(a),cy+dx*sin(a)+dy*cos(a),z+.002*sin(k*.6)))
            tube('무생채' if i==1 else '멸치볶음 고추',pts,.0025,rng.choice(['eda549','e8ba6b'] if i==1 else ['5b6230','7d7540','49572b']),sides=6)
            if i==2 and j%2==0:
                leaf('볶은 잔멸치',cx,cy,z+.003,.025,.0024,a,'bbac88',.001)
        else:leaf('절임 채소',cx,cy,z,.042,.012,a,'d9c69a')

# Oval lettuce salad plate with perilla dressing and fine shredded cabbage.
saladx,salady=0,-.406
salad=dish('타원형 샐러드 접시',0,0,.122);salad.scale.y=.79;salad.location.x=saladx;salad.location.y=salady
for j in range(17):
    a=rng.random()*tau;r=rng.uniform(.015,.071)
    leaf('샐러드 잎',r*cos(a),salady+r*.79*sin(a),top+.025,.069,.021,a,rng.choice(['afbf73','cdd396','dce2ad']),.006)
oval('들깨 드레싱',.012,salady,top+.040,.054,.040,.008,'d7c79d')
for j in range(33):
    a=rng.random()*tau;r=rng.uniform(.005,.039)
    oval('들깨 가루',.012+r*cos(a),salady+r*.72*sin(a),top+.048-r*.07,.0013,.001,.0006,'8b785c')
for j in range(18):
    x,y=rng.uniform(-.052,.003),salady+rng.uniform(-.025,.023)
    tube('샐러드 채',[(x+.019*t,y+.013*sin(t*4+j),top+.045+.009*sin(t*pi)) for t in (0,.2,.4,.6,.8,1)],.0013,'e9e5ce',sides=5)
# Brushed control surround, recessed dark knob and engraved index.
block('매립 조절부',-.335,.038,top+.003,.139,.164,.006,'918984',steel)
block('조절 손잡이 받침',-.335,.038,top+.008,.118,.14,.006,'443d3c')
vessel('검정 손잡이',-.335,.033,top+.012,[(.032,0),(.034,.007),(.025,.023),(.024,.026)],'302d2e',seg=32)
block('조절 눈금',-.335,.050,top+.039,.003,.014,.002,'cfac7c')
# Paper utensil rests and polished spoons. Mouth of cup, foot and inner tea surface are visible.
font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/AppleMyungjo.ttf') if Path('/System/Library/Fonts/Supplemental/AppleMyungjo.ttf').exists() else bpy.data.fonts.load('/System/Library/Fonts/Supplemental/AppleGothic.ttf')
for s in [-1,1]:
    x=s*.317;y=-.384
    block('수저 받침 종이',x,y,top+.001,.128,.322,.002,'fff6dc',bevel=.001)
    bpy.ops.object.text_add(location=(x,y-.102,top+.0028))
    o=bpy.context.object;o.data.body='밀화';o.data.font=font;o.data.size=.036;o.data.align_x='CENTER';o.data.align_y='CENTER'
    bpy.ops.object.convert(target='MESH');finish(bpy.context.object,'밀화 인쇄','985a25',food)
    for xx in [x+.019,x+.033]:
        tube('금속 젓가락',[(xx,y-.055,top+.005),(xx+.002,y+.135,top+.006)],.0019,'c4c0b9',steel)
    tube('숟가락 자루',[(x-.026,y-.065,top+.006),(x-.025,y+.055,top+.010),(x-.024,y+.082,top+.012)],.003,'bbb7ad',steel)
    spoon=vessel('숟가락 오목면',0,0,0,[(.005,0),(.017,.003),(.019,.007),(.017,.008),(.012,.005),(.005,.003)],'cdc9bd',steel,32)
    spoon.location=(x-.024,y+.101,top+.003);spoon.scale.y=1.45
    cx=s*.45;cy=-.17
    vessel('물잔',cx,cy,top,[(.029,0),(.032,.004),(.034,.009),(.043,.078),(.042,.082),(.038,.082),(.037,.077),(.029,.011)],'e7dec0',seg=40)
    vessel('잔 안쪽 물빛',cx,cy,top+.045,[(.033,0),(.034,.001)],'bfb191',seg=32)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='DESELECT')
print('Editable mesh count:',len(coll.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'milhwa.blend'),compress=True)
# Join by finish only after saving all editable parts.
for key,m in mats.items():
    parts=[o for o in coll.objects if o.data.materials[0]==m]
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
    bpy.context.object.name=key
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True,export_normals=True)
