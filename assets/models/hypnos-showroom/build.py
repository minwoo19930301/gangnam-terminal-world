"""Rebuild the 9F bedding showroom from the brand's Gangnam branch photographs."""
import math
from pathlib import Path
import runpy

import bpy
import numpy as np
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
root = bpy.data.collections.new('히프노스 · 신세계 강남 9층')
scene.collection.children.link(root)
root['source'] = 'https://hypnoskorea.co.kr/article/store-info/17/4097/'
root['model_space'] = 'X along storefront, Y into shop, Z up, 3.7723 × 6.3423 m illustrated guide cell.'
materials = {}
sin, cos, pi, tau = math.sin, math.cos, math.pi, math.tau


def collection(name):
    group = bpy.data.collections.new(name)
    root.children.link(group)
    return group


def mat(name, hexcode, finish='cloth'):
    m = bpy.data.materials.new(name)
    rgb = [((hexcode >> shift) & 255)/255 for shift in (16,8,0)]
    linear = [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb] + [1]
    m.diffuse_color = linear
    m['finish'] = finish
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = linear
    rough, metallic = {'cloth':(.86,0),'wood':(.52,0),'metal':(.32,.58),'light':(.55,0)}[finish]
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    m.roughness, m.metallic = rough, metallic
    if finish == 'light':
        bsdf.inputs['Emission Color'].default_value = linear
        bsdf.inputs['Emission Strength'].default_value = .65
    return m


navy = mat('남색 벨벳',0x243851)
welt = mat('벨벳 코딩',0x46566d)
navy_dark = mat('단추 그림자',0x1d2c43)
ivory = mat('아이보리 직조 면',0xe5dfca)
linen = mat('매트리스 벨기에산 직조면 색',0xe8e3d3)
seam = mat('재봉실',0xb7ada0)
milk = mat('밀크화이트 베개',0xf4eee1)
grey = mat('회갈색 파이핑',0x8e877c)
pattern = mat('잿빛 매트리스 체크',0xaaa99d)
olive = mat('세이지 베개 프린트',0x7c8961)
sage = mat('연두색 꽃잎',0xa8ab85)
rust = mat('구리빛 원단 견본',0xb16c41)
dark_oak = mat('짙은 호두나무',0x69503b,'wood')
oak = mat('오크 엣지',0x987452,'wood')
metal = mat('새틴 황동',0xb79b70,'metal')
steel = mat('폴리시드 크롬',0xb5b8af,'metal')
paper = mat('아이보리 타공판',0xe4decf,'wood')
panel = mat('따뜻한 회벽',0xddd1b9,'wood')
rug = mat('모래색 울 러그',0xcac0aa)
rug_lines = mat('러그 자카드',0xb0a590)
lit = mat('확산형 조명 커버',0xfff1d9,'light')


def mesh(name, positions, faces, material, smooth=False):
    m = bpy.data.meshes.new(name)
    m.from_pydata(positions, [], faces)
    m.update()
    obj = bpy.data.objects.new(name, m)
    group.objects.link(obj)
    m.materials.append(material)
    if smooth:
        for p in m.polygons: p.use_smooth=True
    return obj


def loft(name,rings,material,smooth=True,caps=True):
    n = len(rings[0])
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)
           for j in range(len(rings)-1) for i in range(n)]
    if caps: faces += [tuple(reversed(range(n))), tuple(range((len(rings)-1)*n,len(rings)*n))]
    return mesh(name,[v for ring in rings for v in ring],faces,material,smooth)


def outline(x,y,w,d,r,n=4):
    pts=[]
    for cx,cy,phase in [(x+w/2-r,y+d/2-r,0),(x-w/2+r,y+d/2-r,pi/2),
                         (x-w/2+r,y-d/2+r,pi),(x+w/2-r,y-d/2+r,3*pi/2)]:
        pts.extend([(cx+r*cos(phase+j*pi/2/n),cy+r*sin(phase+j*pi/2/n)) for j in range(n+1)])
    return pts


def slab(name,x,y,z,w,d,h,r,material):
    edge=outline(x,y,w,d,r) if r else [(x-w/2,y-d/2),(x+w/2,y-d/2),(x+w/2,y+d/2),(x-w/2,y+d/2)]
    return loft(name,[[(a,b,z) for a,b in edge],[(a,b,z+h) for a,b in edge]],material,False)


def tube(name,path,r,material,sides=6,loop=False):
    pts = list(map(Vector,path))
    if loop and (pts[0]-pts[-1]).length < .0001: pts.pop()
    rings=[]
    for i,p in enumerate(pts):
        prev=pts[(i-1)%len(pts)] if loop else pts[max(0,i-1)]
        nxt=pts[(i+1)%len(pts)] if loop else pts[min(len(pts)-1,i+1)]
        t=(nxt-prev).normalized()
        ref=Vector((0,0,1)) if abs(t.z)<.87 else Vector((0,1,0))
        u=t.cross(ref).normalized()*r;v=t.cross(u)
        rings.append([p+u*cos(tau*j/sides)+v*sin(tau*j/sides) for j in range(sides)])
    if loop: rings.append(rings[0])
    return loft(name,rings,material,True,not loop)


def turned(name,x,y,profile,material,n=16,caps=True):
    return loft(name,[[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z) for i in range(n)] for r,z in profile],material,True,caps)


def grid(name, n, m, point, material):
    verts=[point(j/n,i/m) for i in range(m+1) for j in range(n+1)]
    faces=[(i*(n+1)+j,i*(n+1)+j+1,(i+1)*(n+1)+j+1,(i+1)*(n+1)+j)
           for i in range(m) for j in range(n)]
    return mesh(name,verts,faces,material,True)


def shaded_grid(obj,n,m,palette,sample):
    # A continuous point colour tracks velvet nap and ticking depth across welded quads.
    # The saved material reads the same colours in Blender's material preview.
    attribute=obj.data.color_attributes.new(name='Shade',type='BYTE_COLOR',domain='POINT')
    for i,data in enumerate(attribute.data):
        row,col=divmod(i,n+1)
        strength=max(0,min(1,sample(col/n,row/m)))
        low,high=palette
        rgb=[((low>>k)&255)*(1-strength)/255+((high>>k)&255)*strength/255 for k in (16,8,0)]
        data.color_srgb=[*rgb,1]
    material=obj.data.materials[0].copy()
    material.name=obj.name+' · 버텍스 음영'
    node=material.node_tree.nodes.new('ShaderNodeVertexColor')
    node.layer_name='Shade'
    material.node_tree.links.new(node.outputs['Color'],material.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    obj.data.materials[0]=material


def pillow(x,y,z,w,h,front_color, motif=False):
    # Pillow leans back on its seam. Sides puff out between lightly pinched corners.
    def point(s,t):
        sx,sz=2*s-1,2*t-1
        dom=(1-abs(sx)**2.4)*(1-abs(sz)**2.4)
        xx=x+sx*w*.5*(1-.11*abs(sz)**6)
        zz=z+t*h+.017*sin(pi*s)
        return xx,y+.12*t-.109*max(0,dom)**.72,zz
    grid('볼륨 베개',12,8,point,front_color)
    edge=[point(s,0) for s in np.linspace(0,1,13)]+[point(1,t) for t in np.linspace(.12,1,8)]
    edge+= [point(s,1) for s in np.linspace(.92,0,12)]+[point(0,t) for t in np.linspace(.88,.12,7)]
    tube('베개 둘레 박음선',edge,.005,seam if front_color==milk else welt,5,True)
    def decal(s,t):
        xx,yy,zz=point(s,t)
        return xx,yy-.002,zz
    if motif:
        for i in range(5):
            s=.13+i*.15;t=.22+.20*(i%2)
            tube('베개 · 꽃대', [decal(s,t),decal(s+.038,t+.19),decal(s+.072,t+.35)],.0019,olive,5)
            for j in range(4):
                ss=s+.018*j;tt=t+.082*j;l=(-1)**j
                verts=[decal(ss,tt),decal(ss+l*.02,tt+.06),decal(ss+l*.073,tt+.10),decal(ss+l*.04,tt+.025)]
                mesh('베개 · 식물 프린트',verts,[(0,1,2,3)],olive if j%2 else sage)
    elif front_color==navy:
        # A discreet horizontal woven label on the smaller scatter cushions.
        grid('직조 장식 띠',8,1,lambda s,t:decal(.30+.40*s,.43+.028*t),seam)
    return point


def mattress(x,y,w,d,z):
    h=.30
    profiles=[(-.022,.002),(-.009,.014),(0,.032),(.008,.16),(.002,h-.025),(-.012,h)]
    rings=[[(a,b,z+height) for a,b in outline(x,y,w+2*delta,d+2*delta,.08)] for delta,height in profiles]
    loft('매트리스 · 완만하게 부푼 옆면',rings,linen)
    for zz in [z+.018,z+.061,z+.234,z+.29]:
        tube('매트리스 코딩 및 재봉선',[(a,b,zz) for a,b in outline(x,y,w+.008,d+.008,.084)],.0039,grey,5,True)
    # A contrasting woven grid is visible on the front of the exposed mattresses.
    # Put flat woven strips above the widest part of the rounded ticking.
    yf = y-d/2-.011
    for xx in np.arange(x-w/2+.066,x+w/2-.045,.068):
        for offset,half in [(0,.0019),(.009,.0010)]:
            a=xx+offset
            mesh('매트리스 · 수직 체크 직조',
                 [(a-half,yf,z+.065),(a+half,yf,z+.065),(a+half,yf,z+.230),(a-half,yf,z+.230)],
                 [(0,1,2,3)],pattern)
    for j in range(4):
        zz=z+.078+j*.044
        mesh('매트리스 · 수평 체크 직조',
             [(x-w/2+.061,yf-.0004,zz-.0016),(x+w/2-.061,yf-.0004,zz-.0016),
              (x+w/2-.061,yf-.0004,zz+.0016),(x-w/2+.061,yf-.0004,zz+.0016)],[(0,1,2,3)],pattern)
    for side in [-1,1]:
        xs=x+side*(w/2+.009)
        for yy in [y-.50,y+.46]:
            tube('이동 손잡이',[(xs,yy-.088,z+.185),(xs+side*.026,yy-.066,z+.147),
                (xs+side*.026,yy+.066,z+.147),(xs,yy+.088,z+.185)],.011,ivory,6)
    def quilt(s,t):
        xx=x+(s-.5)*(w-.038);yy=y+(t-.5)*(d-.038)
        bulge=sin(pi*s)*sin(pi*t)
        top=z+h+.006+.037*bulge+.012*(1-cos(tau*6*s)*cos(tau*8*t))*bulge
        return xx,yy,top
    cover=grid('퀼트 상면 · 솜이 올라온 칸',25,33,quilt,linen)
    shaded_grid(cover,25,33,(0xe2ddcd,0xeee8da),lambda s,t:(1-cos(6*tau*s)*cos(8*tau*t))*.5)
    for i in range(1,6):
        for j in range(1,8,2):
            xx,yy,zz=quilt(i/6,j/8)
            tube('매트리스 솜 고정점',[(xx-.011,yy,zz+.001),(xx,yy+.003,zz+.004),(xx+.011,yy,zz+.001)],.0018,seam,5)
    return z+h


def headboard(x,y,w,h,fabric,buttons):
    # The photographed navy wingback has alternating recessed diamond tufts.
    # For the lighter bed, use broad pillow-like vertical channels.
    bottom=.31
    spots=[((i+.5*(j%2))/8,.12+j*.181) for j in range(5) for i in range(1,8)]
    def folds(s,t):
        near=min(((s-a)*w/.077)**2+((t-b)*h/.079)**2 for a,b in spots)
        diag=min(abs(sin(pi*(8*s+(t-.12)/.362))),abs(sin(pi*(8*s-(t-.12)/.362))))
        return math.exp(-near), math.exp(-(diag/.19)**2)
    def face(s,t):
        sx=s*2-1
        front=.026+.13*abs(sx)**8
        if buttons:
            tuft, crease=folds(s,t)
            front+=.062*(1-tuft)-.014*crease
        else:
            front+=.036*(.5-.5*cos(6*tau*s))
        return x+(s-.5)*w,y-front,bottom+t*h+.045*abs(sx)**4
    cloth=grid('윙백 헤드보드 · 단추술' if buttons else '크림 세로 골 헤드보드',56,36,face,fabric)
    if buttons:
        def nap(s,t):
            tuft,crease=folds(s,t)
            return .68-.64*tuft-.31*crease+.17*cos(8*tau*s+pi*t)*sin(pi*t)
        shaded_grid(cloth,56,36,(0x20364e,0x3c526a),nap)
    front_edge=[face(s,0) for s in np.linspace(0,1,26)]+[face(1,t) for t in np.linspace(.06,1,16)]
    front_edge+= [face(s,1) for s in np.linspace(.96,0,25)]+[face(0,t) for t in np.linspace(.94,.06,15)]
    back_edge=[(xx,y+.045,zz) for xx,yy,zz in front_edge]
    loft('헤드보드 · 둘레 덮개',[front_edge,back_edge],fabric,False,False)
    tube('윙백 둘레 파이핑',front_edge,.007,welt if buttons else seam,5,True)
    if buttons:
        for s,t in spots:
            xx,yy,zz=face(s,t)
            p=[(xx+.014*cos(tau*j/8),yy-.005,zz+.014*sin(tau*j/8)) for j in range(8)]
            mesh('패브릭 싸개 단추',p,[tuple(range(8))],navy_dark)


def bed(x,y,w,d,fabric,buttoned):
    for a in [-1,1]:
        for b in [-1,1]:
            turned('낮은 침대발',x+a*(w/2-.12),y+b*(d/2-.13),[(.034,.028),(.043,.14)],metal,10)
    slab('패브릭 디반 받침',x,y,.126,w,d,.255,.037,fabric)
    for yy in [y-d/2+.002,y+d/2-.002]:
        tube('디반 중앙 이음',[(x,yy,.139),(x,yy,.372)],.0035,navy_dark if buttoned else seam,5)
    top=mattress(x,y,w-.018,d-.014,.383)
    headboard(x,y+d/2-.015,w+.075,1.19 if buttoned else 1.02,fabric,buttoned)
    for i in [-1,1]:
        pillow(x+i*w*.23,y+d/2-.27,top+.020,w*.43,.38,milk)
        pillow(x+i*w*.22,y+d/2-.39,top+.025,w*.37,.22,navy if buttoned else ivory,not buttoned)
    if not buttoned:
        # A navy runner drapes at the foot of the ivory display bed.
        def runner(s,t):
            xx=x+(s-.5)*(w+.025)
            if t<.30:
                q=t/.30
                yy=y-d/2-.025-.006*sin(q*pi)
                z=top-.13+.198*q
            else:
                q=(t-.30)/.70
                yy=y-d/2-.025+.49*q
                z=top+.069+.003*sin(pi*q)
            z+=.003*cos(7*pi*s+.6*t)
            return xx,yy,z
        grid('남색 풋 러너',16,20,runner,navy)
        for tt in [.70,.735]:
            tube('러너의 가는 장식선',[runner(s,tt) for s in np.linspace(.025,.975,18)],.002,seam,5)


group=collection('짙은 벨벳 윙백과 매트리스')
bed(1.91,4.86,1.60,2.05,navy,True)
group=collection('앞쪽 크림 침대 · 꽃무늬 베개')
bed(.93,1.68,1.29,1.90,ivory,False)

group=collection('후면 · 브랜드 벽과 램프')
slab('베이지 뒤벽 마감',1.886,6.10,.025,3.40,.105,3.20,.012,panel)
for side_x in [.205,3.55]:
    slab('후면 코너에서 돌아오는 짧은 측벽',side_x,5.49,.025,.065,1.22,3.20,.006,panel)
slab('뒤벽 하부 걸레받이',1.886,6.035,.025,3.39,.035,.080,.004,oak)
for x in [.74,3.04]:
    slab('협탁 다리',x,5.69,.025,.40,.36,.50,.015,dark_oak)
    slab('둥근 모서리 상판',x,5.69,.526,.46,.42,.025,.025,oak)
    turned('스탠드 받침',x,5.69,[(.116,.556),(.119,.563),(.108,.576),(.075,.588)],metal)
    turned('황동 기둥과 소켓',x,5.69,[(.022,.584),(.015,.602),(.013,.993),(.026,1.01),(.031,1.04)],metal,12)
    turned('린넨 갓',x,5.69,[(.167,.98),(.132,1.191),(.124,1.196)],lit,24,False)
    for zz,r in [(.98,.167),(1.19,.132)]:
        tube('갓 위아래 테',[(x+r*cos(tau*i/24),5.69+r*sin(tau*i/24),zz) for i in range(24)],.0035,ivory,5,True)
    for i in range(14):
        a=tau*i/14
        tube('갓의 직조 세로골',[(x+.166*cos(a),5.69+.166*sin(a),.983),(x+.132*cos(a),5.69+.132*sin(a),1.19)],.0015,ivory,5)

# Lettering is modelled typography from the rear wall, without inferring an official vector crest.
text=bpy.data.curves.new('HYPNOS · 후면 문자','FONT')
text.body='HYPNOS';text.align_x='CENTER';text.align_y='CENTER';text.size=.215;text.extrude=.0028
font_path=Path('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
if font_path.is_file():
    text.font=bpy.data.fonts.load(str(font_path))
    text.font.pack()
sign=bpy.data.objects.new('HYPNOS',text);group.objects.link(sign)
sign.rotation_euler=(pi/2,0,0);sign.location=(1.91,6.037,2.23)
text.materials.append(navy)

group=collection('측면 · 호두나무 원단 견본장')
# The branch photographs show pale swatches in a dark-stained wall cabinet.
sx=.205;sy=3.55
slab('견본장 옆벽',sx,sy,.026,.06,2.39,2.82,.008,panel)
slab('견본장 안쪽',sx+.046,sy,1.28,.054,1.96,1.27,.007,dark_oak)
for yy in [sy-.98,sy,sy+.98]:
    slab('견본장 칸막이',sx+.16,yy,1.285,.25,.036,1.29,.003,oak)
for z in [1.285,1.70,2.12,2.55]:
    slab('견본 선반',sx+.17,sy,z,.29,1.97,.038,.007,oak)
for row in range(3):
    for bay in [-1,1]:
        yy=sy+.46*bay
        for i in range(3):
            zz=1.328+row*.416+i*.073
            col=[ivory,grey,linen,paper,rust,navy][(row+2*i+(bay+1)//2)%6]
            slab('겹친 패브릭 견본',sx+.17,yy-.026*i,zz,.18,.59-i*.033,.063,.024,col)
            tube('폴딩 견본 모서리',[(sx+.258,yy-.24,zz+.033),(sx+.258,yy+.24,zz+.033)],.0033,seam,5)
slab('상담 테이블',.64,4.30,.74,.62,.86,.044,.030,dark_oak)
turned('상담 테이블 지주',.64,4.30,[(.17,.027),(.17,.044),(.033,.070),(.027,.735)],metal)
# A small rust headboard fabric sample takes the colour of the third bed in the photos.
slab('프레임용 번트 오렌지 원단',sx+.06,2.64,.34,.09,.33,.64,.018,rust)

group=collection('측면 · 타공 가림막과 베딩 선반')
# The powder-coated screen has actual leaf-shaped openings. Each window shares
# a rectangular outer boundary with its neighbour and has an edge through its thickness.
xb=3.55; y0=.83; z0=.20; cols=7; rows=9
cw,ch=.283,.260
segments=12
points=[];faces=[]
for row in range(rows):
    for col in range(cols):
        yc=y0+(col+.5)*cw;zz=z0+(row+.5)*ch
        jitter_y=.033*sin(row*7.3+col*4.9);jitter_z=.025*cos(row*3.66-col*4.14)
        theta=(-.65 if (row+col)%2 else .65)+.2*sin(2.1*row+col)
        ry=.070+.021*(.5+.5*sin(row*2.7+col))
        rz=.045+.012*(.5+.5*cos(col*2.2-row))
        outside=[];inside=[]
        for i in range(segments):
            t=pi/4+i*tau/segments
            c,s=cos(t),sin(t)
            factor=1/max(abs(c),abs(s))
            outside.append((yc+cw*.5*c*factor,zz+ch*.5*s*factor))
            aa=ry*c*(1+.13*s);bb=rz*s
            inside.append((yc+jitter_y+cos(theta)*aa-sin(theta)*bb,zz+jitter_z+sin(theta)*aa+cos(theta)*bb))
        start=len(points)
        for xx,ring in [(xb-.012,outside),(xb-.012,inside),(xb+.012,inside),(xb+.012,outside)]:
            points.extend([(xx,yy,z) for yy,z in ring])
        for i in range(segments):
            k=(i+1)%segments
            for r in range(3):
                faces.append((start+segments*r+i,start+segments*r+k,start+segments*(r+1)+k,start+segments*(r+1)+i))
mesh('분체 도장한 유기형 타공판',points,faces,paper)
for yy in [y0-.008,y0+cols*cw+.008]:
    slab('타공판 브론즈 프레임',xb,yy,z0-.014,.05,.028,ch*rows+.028,.002,metal)
for zz in [z0-.014,z0+ch*rows]:
    slab('타공판 수평 프레임',xb,y0+cols*cw/2,zz,.05,cols*cw+.04,.026,.002,metal)
# Compact shelving faces the aisle beside the pale panel, as in the branch image.
xx=3.43;cy=4.17
for yy in [cy-.50,cy+.50]:
    for xs in [xx-.17,xx+.11]:
        slab('베딩 선반 · 가는 금속 기둥',xs,yy,.025,.025,.026,2.18,.003,navy_dark)
for j,z in enumerate([.38,.86,1.34,1.83]):
    slab('베딩 선반',xx-.032,cy,z,.33,1.04,.03,.012,dark_oak)
    for k in range(2):
        slab('진열한 접은 베딩',xx-.055,cy+.03*k,z+.03+k*.088,.27,.77-.045*k,.086,.034,milk if (j+k)%2 else ivory)
        tube('베딩 둘레 선',[(xx-.193,cy-.30,z+.079+k*.088),(xx-.193,cy+.30,z+.079+k*.088)],.003,seam,5)

group=collection('중앙 · 둥근 조명과 직조 러그')
slab('잔잔한 베이지 러그',1.89,4.72,.028,2.93,2.87,.010,.065,rug)
for inset in [.05,.075]:
    ring=outline(1.89,4.72,2.93-2*inset,2.87-2*inset,.047)
    tube('러그 가장자리',[(x,y,.040) for x,y in ring],.0039,rug_lines,5,True)
for side in [-1,1]:
    for i in range(12):
        x=1.89+side*(1.04+.09*(i%3));y=3.42+i*.187
        path=[(x+.045*sin(3.5*t+i),y+.11*t,.040) for t in np.linspace(0,1,7)]
        tube('러그의 잎가지',path,.0035,rug_lines,5)
        for s in [-1,1]:
            leaf=[(x,y+.038,.041),(x+s*.041,y+.045,.041),(x+s*.059,y+.078,.041),(x+s*.029,y+.062,.041)]
            mesh('러그의 작은 잎',leaf,[(0,1,2,3)],rug_lines)
canx,cany=1.89,4.40
slab('천장 · 타원형 확산 커버',canx,cany,3.088,2.66,2.98,.028,.66,lit)
for yy in np.arange(cany-1.36,cany+1.38,.16):
    edge=max(0,abs(yy-cany)-(.5*2.98-.66))
    half=2.66/2-.66+math.sqrt(max(0,.66**2-edge**2))
    slab('조명 가로 루버',canx,yy,3.065,2*half-.055,.017,.024,.005,paper)
edge=outline(canx,cany,2.69,3.01,.67,7)
tube('천장 조명 몰딩',[(x,y,3.089) for x,y in edge],.019,panel,6,True)

bpy.context.view_layer.update()
scene['notes']='Actual branch photographs show the beds, lamps, aperture screen, shelves and canopy. Two photographed beds fit this approximate guide cell; all sizes and in-game positions are reconstructed.'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hypnos.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'),run_name='__main__')
