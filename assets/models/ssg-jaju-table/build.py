"""Editable public-facing November JAJU Table setting. Blender coordinates in metres."""
import math
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
import numpy as np
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
collection = bpy.data.collections.new("SSG_9F_JajuTable")
scene.collection.children.link(collection)
pi = math.pi
sin, cos = math.sin, math.cos
rng = np.random.default_rng(59)


def linear(value):
    c = value / 255
    return c / 12.92 if c < .04045 else ((c + .055) / 1.055) ** 2.4


def rgba(color):
    return tuple(linear(int(color[i:i + 2], 16)) for i in (0, 2, 4)) + (1,)


def material(name, rough, metal=0, color=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value = rough
    shader.inputs['Metallic'].default_value = metal
    if color:
        shader.inputs['Base Color'].default_value = rgba(color)
    else:
        attr = m.node_tree.nodes.new('ShaderNodeVertexColor')
        attr.layer_name = 'Tint'
        m.node_tree.links.new(attr.outputs['Color'], shader.inputs['Base Color'])
    return m


props = material('JajuGangnamSetting', .62)
glaze = material('JajuGangnamNewMoonPorcelain', .13)
slate = material('JajuGangnamManufactureRock', .82, color='353433')
steel = material('JajuGangnamPolishedMetal', .21, .66)
glass = material('JajuGangnamStemware', .12, .13, 'dae5df')
gs = glass.node_tree.nodes.get('Principled BSDF')
gs.inputs['Alpha'].default_value = .26
glass.blend_method = 'BLEND'

# Periodic ridges that fork and terminate like cleft slate, in tangent space.
size = 384
t, s = np.mgrid[:size, :size] * (2*pi / size)
warp = 1.7*np.sin(s+t) + .72*np.sin(3*s-2*t) + .24*np.sin(6*s+t)
ridge = np.cos(11*t + 3*s + warp*2.4 + .52*np.sin(4*s-3*t))
relief = .6*np.tanh(5*ridge) + .23*np.sin(23*t + 8*s + warp*3)
relief += .13*np.sin(9*s-3*t) + rng.normal(0,.035,(size,size))
dx = (np.roll(relief, -1, axis=1)-np.roll(relief, 1, axis=1))*.61
dy = (np.roll(relief, -1, axis=0)-np.roll(relief, 1, axis=0))*.61
normal = np.stack((-dx,-dy,np.ones_like(dx)), axis=2)
normal /= np.linalg.norm(normal, axis=2)[:,:,None]


def embed_texture(name, rgb, noncolor):
    height,width=rgb.shape[:2]
    image = bpy.data.images.new(name, width=width, height=height, alpha=False)
    if noncolor:
        image.colorspace_settings.name = 'Non-Color'
    pixels = np.concatenate([rgb, np.ones((height,width,1))], axis=2)
    image.pixels.foreach_set(pixels.astype(np.float32).ravel())
    with TemporaryDirectory() as work:
        image.filepath_raw = str(Path(work) / (name+'.png'))
        image.file_format = 'PNG'
        image.save()
        image.pack()
    return image


nodes = slate.node_tree.nodes
links = slate.node_tree.links
bs = nodes.get('Principled BSDF')
relief_tex = nodes.new('ShaderNodeTexImage')
relief_tex.image = embed_texture('Rock-cleft-normal', normal*.5+.5, True)
bump = nodes.new('ShaderNodeNormalMap')
links.new(relief_tex.outputs['Color'],bump.inputs['Color'])
links.new(bump.outputs['Normal'],bs.inputs['Normal'])
tone = np.clip((58 + 12*relief + 4*np.sin(3*s-t))/255,.05,.35)
pigment = nodes.new('ShaderNodeTexImage')
pigment.image = embed_texture('Rock-graphite', np.stack([tone*1.02,tone,tone*.96],axis=2), True)
# PNG contains display-encoded pigment.
pigment.image.colorspace_settings.name = 'sRGB'
modulate=nodes.new('ShaderNodeMixRGB')
modulate.blend_type='MULTIPLY'
modulate.inputs[0].default_value=1
attr=nodes.new('ShaderNodeVertexColor')
attr.layer_name='Tint'
links.new(pigment.outputs['Color'],modulate.inputs[1])
links.new(attr.outputs['Color'],modulate.inputs[2])
links.new(modulate.outputs[0],bs.inputs['Base Color'])


def finish(obj, name, mat, tint):
    obj.name = name
    for group in list(obj.users_collection):
        group.objects.unlink(obj)
    collection.objects.link(obj)
    obj.data.materials.append(mat)
    if mat in (props, steel, glaze, slate):
        attr = obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        data = np.tile(rgba(tint), (len(attr.data),1)).astype(np.float32)
        attr.data.foreach_set('color',data.ravel())
    return obj


def mesh(name, vertices, faces, mat=props, tint='ffffff', smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.update()
    obj = bpy.data.objects.new(name,data)
    if smooth:
        data.polygons.foreach_set('use_smooth',np.ones(len(faces), dtype=bool))
    if mat == slate:
        uv = data.uv_layers.new(name='Cleft')
        for loop in data.loops:
            v = data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv = ((v.x+.30*v.z)/.115,(v.y+.70*v.z)/.115)
    return finish(obj,name,mat,tint)


def box(name,xyz,dimensions,tint,bevel=.005,mat=props):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    o = bpy.context.object
    o.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        m=o.modifiers.new('Rounded edges','BEVEL')
        m.width=bevel
        m.segments=2
        bpy.ops.object.modifier_apply(modifier=m.name)
        o.data.use_auto_smooth=True
        m=o.modifiers.new('Face normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=m.name)
    return finish(o,name,mat,tint)


def rings(name,xyz,profile,mat=glaze,tint='ffffff',segments=48,shape=None,smooth=True):
    vertices=[]
    for j,(r,h) in enumerate(profile):
        for i in range(segments):
            a=2*pi*i/segments
            x,y,z=r*cos(a),r*sin(a),h
            if shape:
                x,y,z=shape(j,a,x,y,z)
            vertices.append((x,y,z))
    faces=[(j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i)
           for j in range(len(profile)-1) for i in range(segments)]
    faces.extend([tuple(reversed(range(segments))),tuple(range(len(vertices)-segments,len(vertices)))])
    o=mesh(name,vertices,faces,mat,tint,smooth)
    if mat==slate:
        colors=o.data.color_attributes['Tint']
        high=max(h for _,h in profile)
        radius=max(r for r,_ in profile)
        for j,(r,h) in enumerate(profile):
            for i in range(segments):
                angle=2*pi*i/segments
                light=.60+.36*h/max(high,.001)+.13*cos(angle+.5)
                if j>len(profile)/2 and r<radius*.85:light*=.69
                colors.data[j*segments+i].color=(light,light,light,1)
    o.location=xyz
    return o


def wire(name,points,r,mat=steel,tint='c9c8be',sides=8):
    verts=[]
    for i,p in enumerate(points):
        axis=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        ref=Vector((0,0,1)) if abs(axis.z)<.85 else Vector((0,1,0))
        u=axis.cross(ref).normalized(); v=axis.cross(u)
        for j in range(sides):
            a=2*pi*j/sides
            verts.append(tuple(Vector(p)+r*(u*cos(a)+v*sin(a))))
    f=[(i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j)
       for i in range(len(points)-1) for j in range(sides)]
    f.extend([tuple(reversed(range(sides))),tuple(range(len(verts)-sides,len(verts)))])
    return mesh(name,verts,f,mat,tint,True)


def plate(name,xyz,r,moon=True,depth=.019,angle=0):
    # The upper well shifts toward one edge; the wider side rises into a crescent.
    # Build both skins from the same offset contours. A rotated shallow well must
    # clear its underside even at the narrow end where the crescent disappears.
    if moon:
        upper=[(.025,.13,.005),(.34,.13,.0052),(.58,.13,.0055),(.72,.11,.0065),
               (.80,.085,.009),(.89,.05,.013),(.964,.018,.017),(.992,.003,.0195),(1,0,.02)]
    else:
        upper=[(.025,0,.005),(.42,0,.005),(.54,0,.0058),(.59,0,.008),
               (.63,0,.015),(.68,0,.019),(.82,0,.0195),(.99,0,.02),(1,0,.0195)]
    thickness=min(.0027,depth*.16)
    skin=[(rr,off,h,False) for rr,off,h in upper[1:]]+[(rr,off,h,True) for rr,off,h in reversed(upper)]
    def cross(j,a,x,y,z):
        rr,off,h,inside=skin[j]
        x+=off*r
        z+=(max(0,(rr-.66)/.34)**1.5*(1-cos(a))*.044*r if moon else 0)
        if not inside:z-=thickness
        return x,y,z
    n=64 if r>.09 and moon else 40
    o=rings(name,xyz,[(rr*r,h*depth/.02) for rr,off,h,inside in skin],
            glaze if moon else slate,segments=n,shape=cross)
    if moon:
        colors=o.data.color_attributes['Tint']
        for j,(rr,off,h,inside) in enumerate(skin):
            for i in range(n):
                a=2*pi*i/n
                band=math.exp(-((rr-.82)/.11)**2)
                shade=.97-band*(.055+.20*(1-cos(a))*.5) if inside else .78+.10*rr
                shade+=.10*math.exp(-((rr-.965)/.034)**2)*max(0,cos(2*a-.8))**5
                colors.data[j*n+i].color=(min(1,shade*.995),min(1,shade*.99),min(1,shade),1)
    o.rotation_euler.z=angle
    return o


def bowl(name,x,y,z,r,h,mat):
    return rings(name,(x,y,z),[(q*r,k*h) for q,k in [
        (.38,0),(.49,.04),(.50,.12),(.67,.22),(.83,.41),(.96,.76),(1,.98),
        (.99,1),(.955,1),(.92,.78),(.78,.45),(.60,.25),(.37,.18),(.04,.17)]],mat,segments=32)


def cup(x,y,z,mat,direction):
    plate('찻잔 받침',(x,y,z),.077,mat==glaze,.009)
    z+=.006
    rings('찻잔 · 얇은 입술과 굽',(x,y,z),[(.022,0),(.027,.002),(.028,.006),(.034,.017),
          (.039,.040),(.04,.059),(.039,.062),(.0368,.062),(.0367,.058),(.035,.039),
          (.029,.017),(.022,.009),(.004,.009)],mat,segments=48)
    points=[(x+direction*(.035+.023*sin(i*pi/16)),y,z+.038+.017*cos(i*pi/16)) for i in range(17)]
    wire('귀 손잡이',points,.0033,mat)


def lettering(name,body,point,size,tint,font=None):
    curve=bpy.data.curves.new(name,'FONT')
    curve.body=body;curve.size=size;curve.align_x='CENTER';curve.resolution_u=4
    if font: curve.font=font
    o=bpy.data.objects.new(name,curve);collection.objects.link(o)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o.location=point;o.rotation_euler.x=pi/2
    finish(o,name,props,tint)
    o.select_set(False)
    return o


def load_font(name):
    path=Path('/System/Library/Fonts/Supplemental')/name
    if path.exists():return bpy.data.fonts.load(str(path))
    raise RuntimeError('Install '+name+' or set the equivalent font path in load_font()')


serif=load_font('Georgia.ttf')
ko=load_font('AppleGothic.ttf')
# Public display table: tailored hem hangs off all four sides, with extra material at each corner.
top=.83
box('탁자 상판',(0,0,top-.025),(1.66,.83,.043),'826047',.018)
for x in (-.70,.70):
    for y in (-.32,.32):
        box('식탁 다리',(x,y,.40),(.068,.068,.80),'68503d')
verts=[];faces=[]
# Corresponding points on successive rounded rectangles create soft diagonal corner folds.
for level,(hx,hy,rad,z) in enumerate([(.82,.40,.045,top),(.851,.431,.040,top),
                                      (.86,.44,.039,top-.009),(.864,.444,.039,top-.032),
                                      (.877,.457,.04,top-.12),(.885,.465,.047,top-.24),
                                      (.887,.467,.048,top-.246)]):
    edge=[]
    for corner in range(4):
        a0=corner*pi/2
        cx=(hx-rad)*(1 if corner in (0,3) else -1)
        cy=(hy-rad)*(1 if corner in (0,1) else -1)
        points=[(cx+rad*cos(a0+j*pi/16),cy+rad*sin(a0+j*pi/16)) for j in range(9)]
        end=points[-1]
        next_start=[(-hx+rad,hy),(-hx,-hy+rad),(hx-rad,-hy),(hx,hy-rad)][corner]
        points += [(end[0]+(next_start[0]-end[0])*j/16,end[1]+(next_start[1]-end[1])*j/16) for j in range(1,16)]
        for j,(x,y) in enumerate(points):
            fold=max(0,(level-2)/4)
            corner_weight=max(0,(abs(x)/hx+abs(y)/hy-1.53)/.47)
            ripple=fold*(.0025+.020*corner_weight)*sin(j*.9+corner)
            edge.append((x+ripple*x/hx,y+ripple*y/hy,z-fold*(.007+.083*corner_weight)))
    verts+=edge
count=len(edge)
faces.append(tuple(range(count)))
for row in range(6):
    for i in range(count):
        j=(i+1)%count
        faces.append((row*count+j,row*count+i,(row+1)*count+i,(row+1)*count+j))
linen=material('JajuGangnamWovenLinen',.92,color='ffffff')
cloth=mesh('아이보리 식탁보 · 접힌 모서리와 밑단',verts,faces,linen,smooth=True)
# Planar tabletop UVs extend along the drop for a continuous woven hem.
uv=cloth.data.uv_layers.new(name='Linen')
for loop in cloth.data.loops:
    x,y,z=cloth.data.vertices[loop.vertex_index].co
    d=max(0,top-z)
    if abs(x)/.86 > abs(y)/.44:x+=math.copysign(d,x)
    else:y+=math.copysign(d,y)
    uv.data[loop.index].uv=(.5+x/2.5,.5+y/1.65)
yy,xx=np.mgrid[:512,:768]
x=(xx/768-.5)*2.5;y=(yy/512-.5)*1.65
tone=np.ones_like(x)*.945
for cx,cy,rx,ry in [(-.56,-.216,.157,.157),(.56,-.195,.16,.16),(0,-.253,.148,.148),
    (.645,.218,.14,.14),(-.665,.21,.137,.137),(-.27,.225,.067,.067),(-.403,.21,.044,.044),
    (.4,.049,.077,.077),(-.63,-.007,.078,.078),(0,-.04,.164,.061),
    (.016,.249,.20,.13),(-.273,-.10,.068,.018),(.275,.091,.07,.02)]:
    distance=((x-cx-.013)/rx)**2+((y-cy-.013)/ry)**2
    tone-=.21*np.exp(-distance**3*.78)
tone+=.006*np.cos(xx*pi)+.005*np.cos(yy*pi)+rng.normal(0,.0025,x.shape)
tone-=.022*np.sin(19*x+3*y)**2*np.clip(4*(abs(y)-.36),0,1)
linen_tex=linen.node_tree.nodes.new('ShaderNodeTexImage')
linen_tex.image=embed_texture('Linen-weave-and-contact',np.stack([tone,tone*.989,tone*.965],axis=2),True)
linen_tex.image.colorspace_settings.name='sRGB'
linen.node_tree.links.new(linen_tex.outputs['Color'],linen.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

# The press set shows three white upright plates resting in small clear holders.
box('백색 전시 단상',(.016,.249,top+.061),(.36,.254,.122),'e5d9ca',.005)
for i,(r,depth) in enumerate([(.146,.021),(.127,.019),(.094,.015)]):
    y=.306-i*.084
    pivot=top+.122+.011
    o=plate('뉴문 · 전시용 접시 '+str(i+1),(.016,y,pivot+r*.973),r,True,depth,-.36+i*.35)
    o.rotation_euler.x=math.radians(77)
    o.location.x+=(i-1)*.012
    for dx in (-r*.48,r*.48):
        wire('접시 받침 발',[(.016+dx,y-.031,pivot+.022),(.016+dx,y-.032,pivot-.007),
                           (.016+dx,y+.05,pivot-.007),(.016+dx,y+.073,pivot+.095)],.0038,glass)
# Contrasting nested settings, shallow serving dishes and the trio on a two-tone tray.
for x,y,black in [(-.56,-.216,False),(.56,-.195,True)]:
    plate('매뉴팩처 락 · 서비스 접시',(x,y,top+.002),.158,False,.016)
    plate('디너 접시',(x,y,top+.016),.126,not black,.023,.68)
    bowl('낮은 검정 찬기',x,y,top+.032,.074,.035,slate)
plate('뉴문 · 흰 서빙 접시',(0,-.253,top+.002),.149,True,.025,.82)
plate('뉴문 · 오른쪽 서빙 접시',(.645,.218,top+.003),.14,True,.024,-.72)
plate('검정 테두리와 흰 접시',(-.665,.21,top+.002),.137,False,.014)
plate('흰 겹접시',(-.665,.21,top+.014),.132,True,.018,2.16)
box('검은 직사각 받침',(0,-.042,top+.006),(.335,.13,.012),'393837',.008)
box('안쪽 백자 판',(0,-.042,top+.014),(.285,.11,.008),'fff7e8',.006)
for i,mat in enumerate([slate,glaze,slate]):
    bowl('소스 볼',-.09+i*.09,-.042,top+.019,.036,.030,mat)
cup(.40,.049,top+.003,glaze,1)
cup(-.63,-.007,top+.003,slate,-1)

# Porcelain bud vases: curved shoulder, lip and hollow neck.
for x,y,r,h,mat in [(-.27,.225,.071,.164,glaze),(-.403,.21,.045,.108,slate)]:
    rings('화병 · 좁은 목과 열린 입구',(x,y,top),[(q*r,k*h) for q,k in [
        (.55,0),(.79,.025),(.94,.11),(1,.32),(.96,.5),(.79,.67),(.60,.79),
        (.49,.91),(.49,.99),(.48,1),(.42,1),(.41,.975),(.42,.91),(.45,.84),(.35,.66),(.04,.62)]],mat)

def goblet(x,y,cut):
    z=top+.002
    profile=[(.004,0),(.028,.001),(.031,.002),(.030,.004),(.015,.006),
             (.004,.010),(.003,.065),(.009,.073),(.008,.082),(.016,.088)]
    def glint(name,points,width,color):
        wire(name,[(x+px,y+py,z+pz) for px,py,pz in points],width,props,color,5)
    if cut:
        facets=[]; facet_faces=[]
        # Small opposed facets catch different highlights under the same ceiling.
        for row in range(4):
            for col in range(12):
                a=(col+(row%2)*.5)*2*pi/12
                h=.099+row*.0125
                r=.025+row*.0019
                corners=[(a-.098,h),(a,h+.0052),(a+.094,h),(a,h-.0052)]
                start=len(facets)
                facets.extend([(x+(r+.0011)*cos(b),y+(r+.0011)*sin(b),z+k) for b,k in corners])
                facet_faces.append(tuple(range(start,start+4)))
        facets_obj=mesh('커트 잔 · 빛이 맺힌 마름모',facets,facet_faces,props,'dedbcb')
        tint=facets_obj.data.color_attributes['Tint']
        for i,face in enumerate(facet_faces):
            color=['bdc1b6','f7f3df','9fa599','e0e3d9','eae7d4'][i%5]
            for v in face:tint.data[v].color=rgba(color)
        # Alternating angular rows make the cut-glass diamond facets visible in profile.
        verts=[];faces=[];n=20
        for j,(r,h) in enumerate([(.015,.084),(.024,.097),(.027,.109),(.029,.121),(.031,.133),(.032,.147),(.032,.152)]):
            for i in range(n):
                a=(i+(j%2)*.5)*2*pi/n
                verts.append((x+r*cos(a),y+r*sin(a),z+h))
        for j in range(6):
            for i in range(n):
                a=j*n+i;b=j*n+(i+1)%n;c=a+n;d=b+n
                faces.extend([(a,b,c),(b,d,c)] if j%2==0 else [(a,b,d),(a,d,c)])
        mesh('컷 글라스 · 교차 면',verts,faces,glass)
        rings('컷 글라스 · 입술',(x,y,z+.151),[(.032,0),(.032,.002),(.030,.002),(.030,0)],glass,segments=40)
    else:
        profile += [(.026,.096),(.039,.112),(.043,.13),(.042,.146),(.038,.167),(.032,.19),
                    (.031,.195),(.030,.195),(.031,.19),(.037,.167),(.041,.142),(.041,.128),(.036,.113),(.016,.092)]
    if not cut:
        for angle in [-1.96,-.42,1.33]:
            glint('유리 곡면 반사광',[(rr*cos(angle),rr*sin(angle),hh) for rr,hh in
                  [(.037,.110),(.042,.126),(.043,.137),(.041,.15),(.038,.166)]],.00095,'f6f0de')
    lip=.032 if cut else .031
    height=.153 if cut else .195
    glint('유리 입술 반사광',[(lip*cos(a),lip*sin(a),height) for a in np.linspace(-2.8,1.44,21)],.00085,'dfddd4')
    glint('가느다란 잔대',[(.001,-.001,.009),(.001,-.001,.067)],.0011,'dcded5')
    rings('와인 잔' if not cut else '컷 글라스 · 마디 굽',(x,y,z),profile,glass,segments=36)
for x,y,cut in [(-.49,.16,False),(.465,.218,False),(.72,-.014,True),(-.79,-.021,True)]:
    goblet(x,y,cut)


def flatware(x,y,kind,angle=0):
    # Sections along each utensil give a waisted handle, raised neck and shaped business end.
    contours=[(-.102,.003,.003),(-.099,.007,.003),(-.087,.008,.003),(-.048,.006,.004),
              (-.006,.0035,.006),(.018,.003,.009)]
    if kind=='포크':
        contours += [(.031,.009,.010),(.041,.013,.011),(.052,.012,.012)]
    elif kind=='나이프':
        contours += [(.027,.007,.008),(.055,.008,.007),(.088,.006,.004),(.101,.001,.003)]
    else:
        contours += [(.029,.006,.009),(.042,.014,.006),(.055,.020,.005),
                     (.071,.021,.005),(.085,.015,.008),(.093,.002,.010)]
    verts=[];faces=[]
    for along,w,h in contours:
        for k in range(10):
            a=2*pi*k/10
            off=cos(a)*w
            curve=(off/max(w,.001))**2*.007 if kind=='스푼' and along>.03 else 0
            verts.append((off,along,h+.0014*sin(a)+curve))
    for j in range(len(contours)-1):
        for k in range(10):
            faces.append((j*10+k,(j+1)*10+k,(j+1)*10+(k+1)%10,j*10+(k+1)%10))
    faces.extend([tuple(range(10)),tuple(reversed(range(len(verts)-10,len(verts))))])
    o=mesh(kind,verts,faces,steel,'c8c9c5',True)
    tint=o.data.color_attributes['Tint']
    # Long reflections wrap around both sides of the waisted metal handle.
    for j in range(len(contours)):
        for k in range(10):
            value=[115,158,238,249,167,93,82,138,209,155][k]
            color=tuple(linear(min(255,value+shift)) for shift in (2,1,0))
            tint.data[j*10+k].color=(*color,1)
    o.location=(x,y,top+.003);o.rotation_euler.z=angle
    if kind=='포크':
        for t in (-.009,-.003,.003,.009):
            tine=wire('포크 날',[(t,.049,.012),(t*1.10,.069,.012),(t*.97,.091,.016)],.00145)
            tine.location=o.location;tine.rotation_euler.z=angle
for x,t in [(-.764,'포크'),(-.358,'스푼'),(-.323,'나이프'),(.365,'포크'),(.754,'나이프')]:
    flatware(x,-.228,t,.035 if x<0 else -.045)

# Dark blue tent card and a small freestanding event menu, as in the press photographs.
box('남색 안내 카드',(.275,.091,top+.032),(.145,.010,.064),'20294c',.002)
lettering('제조사 카드','Villeroy & Boch',(.275,.085,top+.027),.016,'f4e9cb',serif)
box('행사 안내판',(-.273,-.099,top+.093),(.128,.011,.186),'46405a',.002)
box('행사 인쇄지',(-.273,-.105,top+.09),(.113,.002,.151),'f2e7d2',.0005)
lettering('안내 제목','자주테이블',(-.273,-.107,top+.151),.013,'342d39',ko)
lettering('안내 부제','빌레로이앤보흐',(-.273,-.107,top+.037),.010,'38323a',ko)
# Small menu illustrations avoid inventing a dish or readable price.
for i,(x,z,r) in enumerate([(-.284,.102,.032),(-.243,.081,.015),(-.309,.070,.013)]):
    o=rings('인쇄된 상차림',(x,-.1065,top+z),[(r,0),(r,.0003)],props,'b39477',segments=20)
    o.rotation_euler.x=pi/2
    for j in range(3):
        a=j*2*pi/3
        o=rings('인쇄 장식',(x+r*.35*cos(a),-.1072,top+z+r*.32*sin(a)),
                [(r*.28,0),(r*.28,.0003)],props,['a95637','7e8657','c38e55'][j],segments=12)
        o.rotation_euler.x=pi/2

# The ivory counter lip, narrow dark timber flutes and lit wordmark locate the setting.
box('카운터 몸체',(0,2.02,.53),(3.42,.70,1.06),'4f3023',.017)
for i in range(64):
    box('카운터 · 세로 목재 살',(-1.68+i*.0533,1.663,.53),(.047,.029,1.005),
        ['7b4931','75452e','69402b','814d33'][i%4],0)
box('카운터 · 크림색 상판',(0,2.02,1.082),(3.49,.77,.095),'e1d2bd',.012)
box('상호 벽면',(.44,3.27,1.42),(3.2,.09,2.84),'b7a78d',.012)
for label,z,sz in [('JAJU',2.10,.35),('TABLE',1.94,.088)]:
    lettering('상호 후광',label,(.67,3.218,z-.005),sz*1.03,'ffdc92')
    lettering('벽면 상호',label,(.67,3.211,z),sz,'392d24')
for x in [-1.61,-.63]:
    for y in [1.90,2.28]:
        box('검은 선반 기둥',(x,y,1.90),(.025,.025,1.55),'342f29',.002)
for h in [1.54,1.91,2.29,2.64]:
    box('카운터 개방 선반',(-1.12,2.09,h),(1.03,.43,.036),'39342d',.003)
for j in range(2):
    for i in range(7):
        rings('선반 유리 잔',(-1.52+i*.131,2.04,1.56+j*.37),[(.025,0),(.027,.006),(.032,.091),
              (.031,.094),(.029,.093),(.028,.088)],glass,segments=16)

# Save independent editable pieces first, then bake world matrices into one runtime mesh per material.
bpy.ops.object.select_all(action='DESELECT')
scene.unit_settings.system='METRIC'
scene.render.engine='CYCLES'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'jaju-table.blend'),compress=True)
print('Editable objects:',len(collection.objects))
for mat in (props,glaze,slate,steel,glass,linen):
    objects=[obj for obj in collection.objects if obj.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    o=bpy.context.object
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    o.name=mat.name
    o.data.name=mat.name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True,
                          export_normals=True)
