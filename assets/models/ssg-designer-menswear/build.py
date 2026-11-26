"""Author the Gangnam Brunello Cucinelli menswear display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_6F_Brunello_Cucinelli')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'CucinelliInterior'
palette = dict(plaster='D9D3C7', niche='F0E9DF', ivory='ECE5D6', oak='AEA18C',
    base='7F7567', metal='ABA597', gold='B69968', espresso='514539', linen='B6AFA1',
    paper='F7F0E3', foliage='62734E', moss='98A178', blue='89969D', sepia='9F8C75',
    sand='B59D7F', lapel='C4AB8E', seam='927A63', ink='23262C', navy='62718A',
    rib='52617A', trim='B6A187', suede='6E5446', hood='645F58', tape='413B36',
    teeth='C9B59B', horn='655345', walnut='8E694E')
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
        node.inputs['Roughness'].default_value={'sand':.76,'lapel':.76,'suede':.89,'hood':.94,'navy':.98,'rib':.98,'metal':.30}.get(name,.57)
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel and not prefix:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(prefix+name,mesh)
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
        steps=2 if prefix else 4
        for j in range(steps+1):
            t=radians(a+90*j/steps)
            pts.append((x*(w/2-r)+r*cos(t),y*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,r,col):
    loop=outline(w,d,r)
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.004,h*.14))

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(t*pi/4),r*sin(t*pi/4),0)) for t in range(8)]
    return skins(name,[[p+v for v in ring] for p in [a,b]],col)


from math import sqrt
def oval(name, levels, color, n=32, ribs=0, amplitude=0, folds=0):
    # Edge-on stock keeps the shoulder and cuff profiles with half the rib count.
    if prefix and abs(transform[0][0]) < .55 and n >= 80:
        n//=2
        ribs//=2
    rings=[]
    for cx,cy,z,w,d in levels:
        ring=[]
        for i in range(n):
            t=i*2*pi/n
            wave=1+amplitude*cos(ribs*t) + folds*cos(7*t+.65*z)
            ring.append((cx+w*cos(t)*wave,cy+d*sin(t)*wave,z))
        rings.append(ring)
    obj=skins(name,rings,color)
    if ribs and amplitude:
        # Store yarn-valley shading in the native mesh as well as in the export.
        attr=obj.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        rgba=finish(color).diffuse_color
        for i,item in enumerate(attr.data):
            factor=.76+.24*cos(ribs*(i%n)*2*pi/n)
            item.color=(*[channel*factor for channel in rgba[:3]],1)
        material=finish(color+' 골지') if color+' 골지' in palette else None
        if material is None:
            palette[color+' 골지']=palette[color]
            material=finish(color+' 골지')
            colors=material.node_tree.nodes.new('ShaderNodeVertexColor')
            colors.layer_name='Finish'
            shader=material.node_tree.nodes.get('Principled BSDF')
            shader.inputs['Roughness'].default_value=.96
            material.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
        obj.data.materials[0]=material
    for p in obj.data.polygons:
        p.use_smooth=len(p.vertices)==4
    return obj

def path(name,points,radius,color):
    for a,b in zip(points,points[1:]):
        rod(name,a,b,radius,color)

def face_patch(name,coords,col,thick=.005):
    # The front seam is offset from the lining by a small physical edge.
    return skins(name,[[(x,y+dy,z) for x,y,z in coords] for dy in [0,thick]],col)

def garment(kind,x,y,angle=0,scale=1):
    global transform,prefix,batch
    transform=Matrix.Translation((x,y,0)) @ Matrix.Rotation(radians(angle),4,'Z') @ Matrix.Diagonal((scale,scale,scale,1))
    prefix=['재킷 · ','니트 · ','점퍼 · '][kind]
    batch=['CucinelliTailoring','CucinelliCashmere','CucinelliSuede'][kind]
    # Relative to the same 2.02 m rail, the three hems hang at different heights.
    top=1.89
    bottom=[1.08,1.16,1.19][kind]
    widths=[(.243,.245,.210,.239,.243,.206,.102),(.210,.244,.238,.246,.255,.214,.096),
            (.204,.249,.241,.257,.248,.203,.105)][kind]
    heights=[bottom,bottom+.055,bottom+.22,1.63,1.76,1.82,top]
    depths=[.083,.091,.099,.120,.114,.090,.051]
    col=['sand','navy','suede'][kind]
    torso=oval('몸판',[(0,0,h,w,d) for h,w,d in zip(heights,widths,depths)],col,
         160 if kind==1 else 40,40 if kind==1 else 0,.022 if kind==1 else 0,.026)
    def surface(a,h):
        for i in range(1,len(heights)):
            if h<=heights[i]: break
        f=max(0,min(1,(h-heights[i-1])/(heights[i]-heights[i-1])))
        w=widths[i-1]*(1-f)+widths[i]*f
        d=depths[i-1]*(1-f)+depths[i]*f
        return -d*sqrt(max(.03,1-(a/w)**2))-.010
    def front(a,h,over=.003):
        return (a,surface(a,h)-over,h)
    def patch(name,points,colour,over=.004):
        face_patch(name,[front(a,h,over) for a,h in points],colour)
    def stitch(name,points,colour,r=.003):
        path(name,[front(a,h,.012) for a,h in points],r,colour)
    sleeveCol='hood' if kind==2 else col
    for side in [-1,1]:
        levels=[(.307,-.030,bottom+.025,.055,.052),(.310,-.026,bottom+.087,.061,.057),
                (.304,-.016,bottom+.20,.062,.063),(.289,.004,1.48,.064,.068),
                (.287,.009,1.51,.067,.068),(.277,.008,1.54,.066,.069),
                (.252,.013,1.69,.074,.079),(.222,.003,1.754,.073,.078),
                (.207,.001,1.795,.052,.064),(.190,0,1.816,.028,.037)]
        levels=[(side*a,b,h,w,d) for a,b,h,w,d in levels]
        oval('소매',levels,sleeveCol,24 if kind==0 else 80,20,.027 if kind else 0,.035)
        oval('소맷단',[(side*.309,-.030,bottom+.022,.056,.054),(side*.310,-.026,bottom+.078,.061,.058)],
             sleeveCol,40,10,.023)
        if kind==1:
            oval('배색 끝단',[(side*.309,-.030,bottom+.034,.057,.055),(side*.309,-.030,bottom+.041,.058,.055)],'trim')
        if kind==0:
            for j in range(4):
                a=side*(.340-j*.001)
                rod('소매 뿔단추',(a,-.068,bottom+.061+.015*j),(a,-.073,bottom+.061+.015*j),.006,'horn')
        if kind!=1:
            pocket=[(side*.102,bottom+.199),(side*.209,bottom+.215)] if kind==0 else [(side*.135,bottom+.115),(side*.20,bottom+.263)]
            stitch('주머니 입술',pocket,'seam' if kind==0 else 'tape',.006)
            if kind==0:
                a,h=pocket[0];b,k=pocket[1]
                patch('포켓 덮개',[(a,h),(b,k),(b,k-.039),(a,h-.039)],'lapel',.012)
    # Carved shoulder hanger tapers outwards from the neck and wraps around the rail.
    path('목제 옷걸이',[(-.206,.018,1.795),(-.087,.018,1.854),(0,.018,1.879),(.087,.018,1.854),(.206,.018,1.795)],.017,'walnut')
    path('옷걸이 갈고리',[(0,.018,1.875),(0,.018,1.96),(0,-.019,1.995),(0,-.020,2.024),(0,.001,2.045),(0,.029,2.042),(0,.045,2.021)],.005,'metal')
    if kind==0:
        patch('안쪽 목과 안감',[(-.098,1.883),(0,1.905),(.096,1.883),(.053,1.69),(0,1.49)],'espresso')
        for side in [-1,1]:
            coords=[(.064,1.887),(.155,1.830),(.118,1.809),(.153,1.811),(.128,1.757),(.014,1.498)]
            patch('노치 라펠',[(side*a,h) for a,h in coords],'lapel',.023)
            stitch('깃선',[(side*.063,1.886),(side*.095,1.83),(side*.015,1.50)],'seam',.002)
        stitch('가슴 포켓',[(.086,1.688),(.186,1.71)],'lapel',.006)
        stitch('티켓 포켓',[(.134,1.345),(.208,1.356)],'lapel',.005)
        for h in [1.486,1.402,1.317]:
            a=.012
            rod('뿔단추',front(a,h,.012),front(a,h,.019),.010,'horn')
        for s in [-1,1]:
            path('뒤트임',[(s*.126,.075,bottom+.005),(s*.125,.084,bottom+.14)],.003,'seam')
    if kind==1:
        # An annular neckline reveals the hanger under the collar.
        rings=[]
        for w,d,h in [(.110,.067,1.867),(.106,.065,1.889),(.077,.042,1.893),(.076,.041,1.877)]:
            rings.append([(w*cos(t*pi/24),d*sin(t*pi/24),h+.033*min(0,sin(t*pi/24))) for t in range(48)])
        # Cut the neckline below the front collar, exposing the darker inside.
        for vert in torso.data.vertices:
            if vert.co.z>1.888:
                vert.co.z-=.019+.045*max(0,-vert.co.y/.051)
        skins('둥근 골지 목둘레',rings,'rib',cap=False)
        face_patch('목 안쪽 그늘',[(.076*cos(t*pi/24),.041*sin(t*pi/24),1.879+.034*min(0,sin(t*pi/24))) for t in range(48)],'ink',.001)
        oval('골지 허릿단',[(0,0,bottom-.002,.212,.085),(0,0,bottom+.053,.244,.093)],'rib',120,30,.023)
    if kind==2:
        oval('니트 허릿단',[(0,0,bottom-.004,.207,.087),(0,0,bottom+.054,.247,.096)],'hood',104,26,.025)
        # Hollow cowl, taller at the back, rolls forward on either side of the neck.
        rings=[]
        for w,d,h in [(.106,.094,1.82),(.145,.116,1.90),(.135,.109,1.945),(.105,.085,1.942),(.094,.077,1.86)]:
            rings.append([(w*cos(t*pi/20),.025+d*sin(t*pi/20),h+.062*sin(t*pi/20)) for t in range(40)])
        skins('안감 있는 후드',rings,'hood',cap=False)
        stitch('앞 지퍼 테이프',[(0,h) for h in heights],'tape',.010)
        stitch('지퍼 체인',[(0,h) for h in heights],'teeth',.003)
        for j in range(52):
            h=bottom+.016+j*.0127
            stitch('지퍼 이빨',[(-.004,h),(.004,h+.003)],'teeth',.0016)
        for h in [bottom+.03,1.838]:
            a,b,c=front(0,h,.022),front(.009,h-.022,.027),front(0,h-.037,.030)
            path('양방향 지퍼 손잡이',[a,b,c,front(-.006,h-.02,.027),a],.0028,'metal')
        for s in [-1,1]:
            stitch('가슴 절개선',[(s*.023,1.69),(s*.11,1.696),(s*.216,1.70)],'hood',.0025)
    transform=Matrix.Identity(4);prefix='';batch='CucinelliInterior'

# Two recessed wall displays and a framed still life echo the opening photograph.
for center,width in [(0,3.12),(3.03,2.52)]:
    plate('벽감 뒷판',center,.49,.018,width,.115,2.73,.008,'niche')
    for sx in [-1,1]:
        plate('벽감 기둥',center+sx*(width/2-.057),.21,.018,.115,.64,2.74,.012,'plaster')
    for h,thick in [(.025,.098),(2.22,.048),(2.67,.094)]:
        plate('진열 선반',center,.207,h,width,.64,thick,.012,'oak' if h<.2 else 'ivory')
    rod('행거 봉',(center-width/2+.09,.018,2.021),(center+width/2-.09,.018,2.021),.016,'metal')
    for delta in [-.35,.35]:
        rod('선반 아래 지지대',(center+width*delta,.018,2.03),(center+width*delta,.018,2.22),.009,'metal')
for k,x in enumerate([-.92,0,.92]):
    garment(k,x,0,[8,-5,-12][k])
for k,x in enumerate([2.21,2.52,2.84,3.16,3.49,3.80]):
    garment(k%3,x,0,-65)

def frame(cx,cy,z,w,h):
    plate('액자 테두리',cx,cy,z,w,.035,h,.005,'gold')
    plate('액자 여백',cx,cy-.018,z+.013,w-.026,.012,h-.026,.001,'paper')
    for layer,col in enumerate(['blue','moss','sepia']):
        lo=z+.042; amp=h*(.43-layer*.093)
        pts=[(cx-w*.375,cy-.027-layer*.001,lo),(cx+w*.375,cy-.027-layer*.001,lo)]
        for j in reversed(range(9)):
            pts.append((cx+w*(-.375+.75*j/8),cy-.027-layer*.001,lo+amp*(.78+.22*sin(j*1.21+layer*1.9))))
        face_patch('풍경 판화',pts,col,.001)
frame(-.87,.31,2.272,.39,.29)
frame(2.75,.31,2.272,.30,.34)
# Folded cashmere, a turned ceramic vase and branch foliage on the top shelf.
for j,col in enumerate(['trim','navy','ivory']):
    plate('접은 니트',.88,.19,2.27+j*.041,.43-j*.012,.26,.041,.02,col)
def vase(cx,cy,z):
    oval('자기 화병',[(cx,cy,z,.050,.05),(cx,cy,z+.03,.068,.068),(cx,cy,z+.096,.058,.058),(cx,cy,z+.145,.033,.033)],'ivory')
    for i in range(7):
        t=i*2.4
        end=(cx+.103*cos(t),cy+.070*sin(t),z+.24+.064*cos(i))
        rod('꽃가지',(cx,cy,z+.13),end,.0028,'foliage')
        for j in [-1,1]:
            a,b,h=end
            face_patch('잎',[(a,b,h-.014),(a+j*.018,b-.011,h+.01),(a+j*.046,b,h+.026),(a+j*.022,b+.003,h-.004)],'moss',.002)
vase(.12,.14,2.27)
# Low upholstered lounge chair at the side, outside the viewing path.
cx,cy=-2.22,-.41
plate('라운지 의자 받침',cx,cy,.035,.72,.72,.12,.08,'base')
plate('라운지 의자 좌판',cx,cy,.14,.85,.79,.26,.085,'linen')
plate('좌방석',cx,cy-.035,.39,.65,.63,.114,.065,'ivory')
plate('낮은 등받이',cx,cy+.337,.34,.84,.157,.44,.065,'linen')
for s in [-1,1]:
    plate('팔걸이',cx+s*.36,cy-.005,.33,.14,.72,.32,.058,'linen')
# Brand wordmark on the fascia uses Blender's bundled font.
font=bpy.data.curves.new('상호','FONT');font.body='B R U N E L L O   C U C I N E L L I'
font.align_x='CENTER';font.size=.082;font.extrude=.0005;font.resolution_u=3
obj=bpy.data.objects.new('상호',font);gallery.objects.link(obj)
obj.location=(0,-.118,2.692);obj.rotation_euler.x=pi/2
bpy.context.view_layer.update()
mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
label=bpy.data.objects.new('상호 글자',mesh);gallery.objects.link(label);label.matrix_world=obj.matrix_world.copy()
mesh.materials.append(finish('espresso'));pieces[batch].append(label)
bpy.data.objects.remove(obj,do_unlink=True)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value={'CucinelliTailoring':.76,'CucinelliSuede':.89,'CucinelliCashmere':.98,'CucinelliInterior':.57}[batch]
    colors=nodes.new('ShaderNodeVertexColor'); colors.layer_name='Finish'
    merged.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        mesh=obj.data
        rgba=mesh.materials[0].diffuse_color[:]
        if mesh.color_attributes.get('Finish') is None:
            attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for item in attr.data: item.color=rgba
        mesh.materials.clear(); mesh.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
