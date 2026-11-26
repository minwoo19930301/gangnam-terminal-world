"""Baby Dior at Shinsegae Gangnam. Metres, front -Y, Z up."""
import math
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
import numpy as np
from mathutils import Matrix, Vector
from math import sin, cos, pi

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
collection = bpy.data.collections.new("SSG_10F_BabyDior")
bpy.context.scene.collection.children.link(collection)
bpy.context.scene.unit_settings.system = 'METRIC'
frame = Matrix.Identity(4)
batches = {}
colors = dict(ivory='FFF4DE', stone='E8D7BD', milk='FFFCED', inset='EBDECD',
              shadow='AA917F', brass='C9A266', edge='E7C994', ink='362B29',
              pearl='FFF7E8', coral='EA877B', blush='E6AAB2', rose='C98894',
              navy='30313F', biscuit='BA9673', gold='CBAD79', pink='F6E3DF',
              mannequin='EEE8DD', green='849576', olive='53664B', red='AC554E')
lit='BabyDiorNicheLight'
solid, metal, knit, printcloth = 'BabyDiorSalon','BabyDiorBrass','BabyDiorCardigans','BabyDiorToile'
materials = {}

def linear(value):
    c = int(value,16)/255
    return c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4

# Draw the fibre loops and a small original botanical print into two seamless tiles.
def swatch(name, botanical=False):
    w=192
    yy,xx=np.mgrid[:w,:w]/w
    if botanical:
        rgb=np.ones((w,w,3)) * [1,.98,.955]
        def stroke(points,radius,tint):
            for (x,y),(u,v) in zip(points,points[1:]):
                dx,dy=u-x,v-y
                t=np.clip(((xx-x)*dx+(yy-y)*dy)/(dx*dx+dy*dy+1e-12),0,1)
                dist=np.sqrt((xx-x-t*dx)**2+(yy-y-t*dy)**2)
                alpha=np.clip((radius-dist)*w+.6,0,1)[:,:,None]
                rgb[:]=rgb*(1-alpha)+np.array(tint)*alpha
        for cx,cy,s,flip in [(.26,.12,.52,1),(.76,.49,.38,-1),(.10,.73,.22,1)]:
            pts=[(cx+flip*.065*sin(i*pi/12),cy+s*i/12) for i in range(13)]
            stroke(pts,.005,[.74,.46,.51])
            for j in (2,4,6,8,10):
                x,y=pts[j]; k=flip*(1 if j%4 else -1)
                leaf=[(x+k*.11*sin(t*pi/2)+k*.018*sin(2*pi*t),y+.063*t+.027*sin(2*pi*t)) for t in np.linspace(0,1,14)]
                stroke(leaf,.005,[.80,.54,.57])
                stroke([(x,y),(x+k*.109,y+.062),(x+k*.042,y+.013),(x,y)],.004,[.79,.55,.59])
    else:
        x,y=xx*8,yy*8
        # Each pair of slanting arms is a loop of stocking stitch.
        arm=np.abs(((x-.5*(np.abs(2*(y%1)-1))+.5)%1)-.5)
        tone=.90+.086*np.exp(-(arm/.14)**2)+.012*np.sin(2*pi*(13*x+17*y))
        rgb=np.stack([tone,tone,tone],axis=2)
    im=bpy.data.images.new(name,width=w,height=w,alpha=False)
    im.pixels.foreach_set(np.dstack((rgb,np.ones((w,w)))).astype('float32').ravel())
    with TemporaryDirectory() as td:
        im.filepath_raw=str(Path(td)/(name+'.png')); im.file_format='PNG'; im.save(); im.pack()
    return im

tiles={knit:swatch('Stocking_stitch'),printcloth:swatch('Rose_sprigs',True)}

def material(batch,color):
    key=batch,color
    if key in materials: return materials[key]
    m=bpy.data.materials.new(batch+' '+color); m.use_nodes=True
    rgb=colors[color]; rgba=tuple(linear(rgb[i:i+2]) for i in (0,2,4))+(1,)
    m.diffuse_color=rgba
    shader=m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=rgba
    shader.inputs['Roughness'].default_value={metal:.32,knit:.91,printcloth:.79,lit:.62,solid:.56}[batch]
    shader.inputs['Metallic'].default_value=.56 if batch==metal else 0
    if batch==lit:
        shader.inputs['Emission'].default_value=(1,.82,.59,1);shader.inputs['Emission Strength'].default_value=.72
    if batch in tiles:
        nodes=m.node_tree.nodes; links=m.node_tree.links
        tex=nodes.new('ShaderNodeTexImage');tex.image=tiles[batch]
        mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        mix.inputs[1].default_value=rgba
        links.new(tex.outputs['Color'],mix.inputs[2]);links.new(mix.outputs[0],shader.inputs['Base Color'])
    materials[key]=m
    return m

def mesh(name,verts,faces,color,batch,smooth=False,uv=None):
    m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
    o=bpy.data.objects.new(name,m);collection.objects.link(o);o.matrix_world=frame.copy()
    m.materials.append(material(batch,color));batches.setdefault(batch,[]).append(o)
    if smooth:
        for p in m.polygons:p.use_smooth=len(p.vertices)==4
    if uv:
        layer=m.uv_layers.new(name='Weave')
        for poly,coords in zip(m.polygons,uv):
            for i,coord in zip(poly.loop_indices,coords):layer.data[i].uv=coord
    return o

def loft(name,rings,col,batch=solid,smooth=True,repeats=(1,1)):
    n=len(rings[0]); f=[tuple(reversed(range(n)))]; uv=[[(0,0)]*n]
    for j in range(len(rings)-1):
        for i in range(n):
            v=j*n+i;k=j*n+(i+1)%n
            f.append((v,k,k+n,v+n))
            uv.append([(ii/n*repeats[0],jj/(len(rings)-1)*repeats[1]) for ii,jj in [(i,j),(i+1,j),(i+1,j+1),(i,j+1)]])
    f.append(tuple(range((len(rings)-1)*n,len(rings)*n)));uv.append([(0,0)]*n)
    return mesh(name,[v for row in rings for v in row],f,col,batch,smooth,uv if batch in tiles else None)

def form(name,rows,col,batch=solid,n=24,ripple=0,repeats=(2,1)):
    rings=[]
    for x,y,z,rx,ry in rows:
        ring=[]
        for i in range(n):
            t=2*pi*i/n;s=1+ripple*cos(t*8)
            ring.append((x+rx*s*cos(t),y+ry*s*sin(t),z))
        rings.append(ring)
    return loft(name,rings,col,batch,repeats=repeats)

def oval(name,x,y,z,rx,ry,rz,col,batch=solid,tilt=0):
    rows=[]
    segments=5 if max(rx,ry)<.035 else 9
    for j in range(segments+1):
        a=-pi*.499+pi*.998*j/segments
        rows.append((x+tilt*sin(a),y,z+rz*sin(a),rx*cos(a),ry*cos(a)))
    return form(name,rows,col,batch,n=9 if segments==5 else 18)

def box(name,x,y,z,w,d,h,col,batch=solid):
    # Tiny chamfers catch light on the face and on both returns.
    b=min(.012,w*.12,h*.12,d*.12)
    def ring(zz,e):
        a=w/2-e;c=d/2-e;r=min(b,a*.4,c*.4)
        return [(x+i,y+j,zz) for i,j in [(a-r,c),(-a+r,c),(-a,c-r),(-a,-c+r),(-a+r,-c),(a-r,-c),(a,-c+r),(a,c-r)]]
    return loft(name,[ring(z,b),ring(z+b,0),ring(z+h-b,0),ring(z+h,b)],col,batch,False)

def rod(name,a,b,r,col,batch=metal,n=10):
    p,q=Vector(a),Vector(b);rot=(q-p).to_track_quat('Z','Y')
    ring=[rot@Vector((r*cos(2*pi*i/n),r*sin(2*pi*i/n),0)) for i in range(n)]
    return loft(name,[[c+v for v in ring] for c in [p,q]],col,batch)

def disc(name,x,y,z,rx,ry,h,col,batch=solid):
    return form(name,[(x,y,z,rx*.98,ry*.98),(x,y,z+.008,rx,ry),(x,y,z+h-.008,rx,ry),(x,y,z+h,rx*.98,ry*.98)],col,batch,40)

def place(x,y,z,angle=0,scale=1):
    return Matrix.Translation((x,y,z))@Matrix.Rotation(angle,4,'Z')@Matrix.Scale(scale,4)

def cardigan(col,striped=False):
    # Separate body, sleeve taper and narrow doubled rib bands.
    rows=[(0,0,z,x,y) for z,x,y in [(0,.165,.096),(.038,.168,.098),(.12,.173,.107),(.25,.181,.115),(.323,.194,.098),(.357,.143,.078),(.373,.088,.061)]]
    form('가디건 몸판',rows,col,knit,repeats=(8,4))
    def interpolate(z):
        for r,s in zip(rows,rows[1:]):
            if z<=s[2]:
                t=(z-r[2])/(s[2]-r[2]);return r[3]*(1-t)+s[3]*t,r[4]*(1-t)+s[4]*t
    if striped:
        for z in [.066,.104,.142,.180,.218,.256]:
            w,d=interpolate(z);w2,d2=interpolate(z+.007)
            form('가로 줄무늬',[(0,0,z,w+.0015,d+.0015),(0,0,z+.007,w2+.0015,d2+.0015)],'blush',knit,repeats=(8,1))
    form('목둘레 골지',[(0,0,.363,.094,.068),(0,0,.389,.085,.064),(0,0,.389,.070,.051)],col,knit)
    for side in (-1,1):
        sleeve=[(side*x,-.008,z,rx,ry) for x,z,rx,ry in [(.278,.057,.043,.043),(.274,.09,.048,.049),(.244,.16,.052,.057),(.216,.242,.063,.068),(.178,.306,.066,.072),(.155,.327,.046,.058)]]
        form('래글런 소매',sleeve,col,knit,repeats=(4,3))
        for j in range(8):
            a=2*pi*j/8
            rod('소맷단 골', (side*.278+.043*cos(a),-.008+.043*sin(a),.058),(side*.273+.048*cos(a),-.008+.049*sin(a),.087),.0017,col,knit)
        if striped:
            for j in range(1,5):
                a,b=sleeve[j],sleeve[j+1]
                r=tuple((v+w)/2 for v,w in zip(a,b))
                form('소매 줄무늬',[(r[0],r[1],r[2],r[3]+.002,r[4]+.002),(r[0]-side*.002,r[1],r[2]+.007,r[3]+.002,r[4]+.002)],'blush',knit)
    for r,s in zip(rows,rows[1:]):
        rod('앞단 파이핑',(-.012,-r[4],r[2]),(-.012,-s[4],s[2]),.003,col,knit)
    for z in [.048,.119,.190,.261,.326]:
        _,d=interpolate(z)
        oval('흰 장식 단추',.006,-d-.004,z,.010,.004,.010,'pearl')
        for i in [-.0028,.0028]:
            # Tiny dark openings lie flush with the face of the domed button.
            cx=.006+i
            mesh('단추 구멍',[(cx-.0014,-d-.0081,z),(cx,-d-.0081,z-.0016),(cx+.0014,-d-.0081,z),(cx,-d-.0081,z+.0016)],[(0,1,2,3)],'shadow',solid)
    for i in range(26):
        a=i*2*pi/26
        rod('허리 골지',(cos(a)*.165,sin(a)*.096,.003),(cos(a)*.168,sin(a)*.098,.033),.002,col,knit)

def dress(col):
    form('주름치마',[(0,0,z,w,d) for z,w,d in [(0,.222,.134),(.018,.226,.135),(.23,.150,.095),(.263,.125,.083),(.30,.126,.08)]],col,printcloth,48,.060,(4,1.8))

def shoe(x,y,z):
    oval('밑창',x,y-.031,z+.023,.061,.114,.023,'biscuit')
    oval('가죽 갑피',x,y-.030,z+.046,.059,.112,.036,'gold',metal)
    oval('발등 끈',x,y-.012,z+.075,.054,.016,.012,'pearl')

def mannequin(x,y,angle,striped):
    global frame
    frame=place(x,y,0,angle)
    disc('마네킹 받침',0,0,.012,.35,.275,.052,'stone')
    for s in [-1,1]:
        shoe(s*.09,0,.061)
        form('마네킹 다리',[(s*.09,.013,.135,.037,.042),(s*.082,.016,.29,.049,.052),(s*.073,0,.49,.06,.065)],'mannequin')
    base=frame.copy()
    frame=base@place(0,0,.39);dress('milk')
    frame=base@place(0,0,.647);cardigan('ivory' if striped else 'coral',striped)
    for s in (-1,1):
        oval('손 모형',s*.282,-.008,.028,.036,.035,.053,'mannequin',tilt=-s*.009)
    frame=base
    oval('목',0,0,1.055,.056,.055,.08,'mannequin')
    form('아동 두상',[(0,y0,z,w,d) for y0,z,w,d in [(-.021,1.075,.047,.052),(-.012,1.102,.087,.085),(0,1.175,.113,.103),(.006,1.24,.111,.101),(.009,1.29,.080,.076),(.009,1.317,.009,.01)]],'mannequin',n=32)
    frame=Matrix.Identity(4)

def rabbit(x,y,z,size,angle):
    global frame
    frame=place(x,y,z,angle,size)
    oval('토끼 몸',0,0,.14,.097,.086,.134,'milk',printcloth)
    oval('토끼 머리',0,-.009,.307,.103,.09,.09,'milk',printcloth)
    for s in (-1,1):
        oval('늘어진 귀',s*.117,-.001,.228,.032,.032,.121,'milk',printcloth,-s*.040)
        oval('봉제 팔',s*.087,-.006,.128,.031,.040,.079,'milk',printcloth,-s*.020)
        oval('봉제 발',s*.063,-.064,.051,.056,.065,.050,'milk',printcloth)
        oval('눈 자수',s*.038,-.091,.317,.005,.0028,.005,'rose')
    oval('코 자수',0,-.101,.296,.012,.005,.008,'rose')
    frame=Matrix.Identity(4)

# Two adjacent cream-and-brass recesses, a continuous drawer base and raised shelves.
box('연속 크림색 벽체',0,1.56,.015,3.64,.16,2.71,'ivory')
for cx,width in [(-.87,1.68),(.86,1.68)]:
    box('벽감 등판',cx,1.42,.02,width,.105,2.49,'inset')
    for s in (-1,1):
        box('벽감 테두리',cx+s*(width/2-.035),1.32,.02,.07,.19,2.52,'ivory')
        box('안쪽 밝은 몰딩',cx+s*(width/2-.083),1.32,.11,.020,.104,2.33,'milk')
    for side in [-1,1]:
        box('벽감 세로 간접등',cx+side*.745,1.356,.45,.028,.025,1.98,'milk',lit)
    box('벽감 상부 간접등',cx,1.356,2.413,1.51,.025,.032,'milk',lit)
    # Fine diagonal tracery is recessed behind the garments.
    for side in [-1,1]:
        for j in range(-4,8):
            b=j*.24
            lo=max(-.70,(.50-b)/1.2);hi=min(.70,(1.70-b)/1.2)
            if hi-lo>.02:
                rod('벽감 사선 무늬',(cx+side*lo,1.359,b+1.2*lo),(cx+side*hi,1.359,b+1.2*hi),.0038,'stone',solid)
    box('상인방',cx,1.32,2.455,width,.19,.088,'ivory')
    box('서랍 받침',cx,1.10,.017,width-.11,.64,.40,'stone')
    for k in [-.5,.5]:
        dx=cx+k*(width-.16)/2
        box('서랍 전면',dx,.769,.079,(width-.18)/2,.045,.281,'ivory')
        rod('서랍 손잡이',(dx-.07,.739,.31),(dx+.07,.739,.31),.008,'brass')
    box('진열 상판',cx,1.08,.416,width-.06,.70,.044,'milk')
    for s in [-1,1]:
        rod('황동 기둥',(cx+s*.70,.91,.465),(cx+s*.70,.91,1.70),.014,'brass')
    rod('행거 가로봉',(cx-.71,.91,1.665),(cx+.71,.91,1.665),.016,'brass')
    box('인형 선반',cx,1.093,1.76,width-.22,.46,.043,'ivory')
    box('황동 선반 엣지',cx,.862,1.766,width-.24,.014,.012,'brass',metal)
# Slender wooden hangers and garments with alternating hems, front and side profiles.
for cx in [-.87,.86]:
    for i in range(5):
        x=cx+(i-2)*.257
        ang=[.85,.91,.94,1.02,.37][i]
        base=place(x,.908,1.557,ang)
        frame=base
        arc=[(.024*cos(t),0,.091+.026*sin(t)) for t in np.linspace(-.45,pi,8)]
        for a,b in zip(arc,arc[1:]):rod('옷걸이 고리',a,b,.0038,'brass')
        rod('고리 목',arc[-1],(0,0,.024),.004,'brass')
        for s in (-1,1):rod('옷걸이 어깨',(0,0,.025),(s*.151,0,-.042),.011,'biscuit',solid)
        frame=base@place(0,0,-.294,0,.79)
        cardigan((['navy','ivory','red','coral','ivory'] if cx<0 else ['blush','ivory','pink','blush','coral'])[i],striped=(i==4 and cx<0))
        if cx>0 and i%2==0:
            frame=base@place(0,0,-.48,0,.79);dress('milk')
frame=Matrix.Identity(4)
for i,x in enumerate([.49,.92,1.31]):rabbit(x,1.07,1.806,[.82,.96,.75][i],[-.20,.17,-.27][i])
mannequin(-.94,-.51,-.13,True)
mannequin(-.39,-.77,.14,False)
# Round salon table with three thin brass uprights and a smaller riser.
disc('원탁 아래 링',.91,-.43,.025,.416,.416,.025,'brass',metal)
for i in range(3):
    a=2*pi*i/3
    rod('원탁 다리',(.91+.39*cos(a),-.43+.39*sin(a),.047),(.91+.39*cos(a),-.43+.39*sin(a),.68),.013,'brass')
disc('원탁',.91,-.43,.68,.52,.52,.047,'milk')
disc('소품 받침',1.06,-.37,.73,.20,.17,.057,'stone')
rabbit(1.06,-.37,.788,1.05,-.18)
for n in range(2):
    box('접은 니트',.67,-.51,.73+n*.035,.28,.19,.043,'blush' if n else 'ivory',knit)
# Clear silhouette of the florist's arrangement in the branch photograph:
# tapering vase, stems, lancet leaves and layered red buds on the table.
form('도자기 화병',[(.83,-.16,z,w,w) for z,w in [(.728,.064),(.748,.075),(.85,.044),(.92,.047),(.926,.05)]],'ivory')
for i in range(7):
    a=i*2.4; x=.83+.115*cos(a); y=-.16+.115*sin(a); z=1.09+.045*cos(2*a)
    rod('꽃줄기',(.83,-.16,.87),(x,y,z),.003,'olive',solid)
    for j in [-1,1]:
        oval('잎',x+j*.024,y,z-.054,.011,.015,.046,'green',tilt=j*.021)
    oval('꽃받침',x,y,z,.026,.023,.026,'olive')
    for j in range(4):
        b=j*pi/2
        oval('튤립 꽃잎',x+.012*cos(b),y+.012*sin(b),z+.025,.016,.015,.032,'red' if i%3 else 'blush',tilt=.005*cos(b))
# The opening photograph has a dark serif DIOR sign over the right-hand fittings.
font=bpy.data.curves.new('DIOR','FONT');font.body='DIOR';font.align_x='CENTER';font.size=.345
font.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
ob=bpy.data.objects.new('DIOR',font);collection.objects.link(ob);ob.location=(-.87,1.355,2.055);ob.rotation_euler.x=pi/2
bpy.context.view_layer.update()
letters=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
sign=bpy.data.objects.new('DIOR 간판',letters);collection.objects.link(sign);sign.matrix_world=ob.matrix_world.copy();letters.materials.append(material(solid,'ink'));batches[solid].append(sign);bpy.data.objects.remove(ob,do_unlink=True)
bpy.context.view_layer.update()
print('Editable pieces:',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# All pieces remain editable on disk. Each runtime surface uses just one draw.
for batch,objects in batches.items():
    m=bpy.data.materials.new(batch);m.use_nodes=True;nodes=m.node_tree.nodes;links=m.node_tree.links
    sh=nodes.get('Principled BSDF');sh.inputs['Roughness'].default_value={solid:.56,metal:.32,knit:.91,printcloth:.79,lit:.62}[batch]
    sh.inputs['Metallic'].default_value=.56 if batch==metal else 0
    if batch==lit:
        sh.inputs['Emission'].default_value=(1,.82,.59,1);sh.inputs['Emission Strength'].default_value=.72
    vc=nodes.new('ShaderNodeVertexColor');vc.layer_name='Finish'
    links.new(vc.outputs['Color'],sh.inputs['Base Color'])
    if batch in tiles:
        # glTF multiplies COLOR_0 and baseColorTexture automatically.
        tex=nodes.new('ShaderNodeTexImage');tex.image=tiles[batch]
        mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        links.new(tex.outputs['Color'],mix.inputs[1]);links.new(vc.outputs['Color'],mix.inputs[2]);links.new(mix.outputs[0],sh.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        data=ob.data;rgba=data.materials[0].diffuse_color[:]
        attr=data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data:item.color=rgba
        data.materials.clear();data.materials.append(m);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
