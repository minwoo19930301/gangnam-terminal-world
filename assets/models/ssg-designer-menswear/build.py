"""Author the Gangnam Brunello Cucinelli menswear display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
import sys
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import fabric
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
    sand='E1D7C5', lapel='EAE2D1', seam='BAA991', ink='23262C', navy='384966',
    rib='3C4961', trim='B6A187', suede='A17152', hood='B8A688', wine='773A38', tape='413B36',
    teeth='C9B59B', horn='655345', suede_seam='825A43', jacket_lining='453C34', walnut='8E694E', upholstery='D9D2C2',piping='C1B8A7')
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
    if name in ('몸판','소매'):
        # More longitudinal rings on the three front garments capture the drape;
        # the edge-on rail keeps fewer profiles at this distance.
        levels=fabric.densify(levels,.060 if abs(transform[0][0])<.55 else .037)
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
            factor=.92+.08*cos(ribs*(i%n)*2*pi/n)
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
    first_part=len(pieces.get(batch,[]))
    # Relative to the same 2.02 m rail, the three hems hang at different heights.
    top=1.89
    bottom=[1.08,1.16,1.19][kind]
    widths=[(.243,.245,.210,.239,.243,.206,.102),(.210,.244,.238,.246,.255,.214,.096),
            (.204,.249,.241,.257,.248,.203,.105)][kind]
    heights=[bottom,bottom+.055,bottom+.22,1.63,1.76,1.82,top]
    depths=[.083,.091,.099,.120,.114,.090,.051]
    col=['sand','navy','suede'][kind]
    torso=oval('몸판',[(0,0,h,w,d) for h,w,d in zip(heights,widths,depths)],col,
         88 if kind==1 else 40,22 if kind==1 else 0,.008 if kind==1 else 0,.024)
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
        oval('소매',levels,sleeveCol,28 if kind==0 else 56,14,.010 if kind else 0,.025)
        oval('소맷단',[(side*.309,-.030,bottom+.022,.056,.054),(side*.310,-.026,bottom+.078,.061,.058)],
             sleeveCol,40,10,.011)
        if kind==1:
            oval('배색 끝단',[(side*.309,-.030,bottom+.034,.057,.055),(side*.309,-.030,bottom+.041,.058,.055)],'trim')
        if kind==0:
            for j in range(4):
                a=side*(.340-j*.001)
                rod('소매 뿔단추',(a,-.068,bottom+.061+.015*j),(a,-.073,bottom+.061+.015*j),.006,'horn')
        if kind!=1:
            pocket=[(side*.102,bottom+.199),(side*.209,bottom+.215)] if kind==0 else [(side*.135,bottom+.115),(side*.20,bottom+.263)]
            if kind==2:
                stitch('스웨이드 주머니 테두리',pocket,'suede_seam',.006)
                stitch('비스듬한 주머니 입구',[(a,h-.0014) for a,h in pocket],'espresso',.0024)
            else:
                stitch('주머니 입술',pocket,'seam',.006)
            if kind==0:
                a,h=pocket[0];b,k=pocket[1]
                patch('포켓 덮개',[(a,h),(b,k),(b,k-.039),(a,h-.039)],'lapel',.012)
    # Carved shoulder hanger tapers outwards from the neck and wraps around the rail.
    path('목제 옷걸이',[(-.206,.018,1.795),(-.087,.018,1.854),(0,.018,1.879),(.087,.018,1.854),(.206,.018,1.795)],.017,'walnut')
    path('옷걸이 갈고리',[(0,.018,1.875),(0,.018,1.96),(0,-.019,1.995),(0,-.020,2.024),(0,.001,2.045),(0,.029,2.042),(0,.045,2.021)],.005,'metal')
    if kind==0:
        # A faceted polygon across the entire chest cuts through the convex
        # torso. Lay the lining and the rolled lapels along its surface instead.
        lining=[];faces=[]
        for i,(h,w) in enumerate([(1.475,.004),(1.52,.015),(1.62,.037),(1.74,.064),(1.834,.080),(1.887,.085)]):
            row=[front(w*t,h,.018) for t in [-1,-.5,0,.5,1]]
            lining.extend(row)
            if i:
                for j in range(4):
                    k=(i-1)*5+j;faces.append((k,k+1,k+6,k+5))
        part('재킷 사이의 짙은 안감',lining,faces,'espresso')
        for side in [-1,1]:
            rows=[(1.887,.065,.102),(1.830,.053,.157),(1.810,.049,.115),
                  (1.804,.047,.151),(1.748,.038,.133),(1.635,.020,.085),
                  (1.521,.007,.033),(1.493,.005,.012)]
            verts=[];faces=[]
            for i,(h,inner,outer) in enumerate(rows):
                ridge=min(1.,(outer-inner)/.065)
                for dx,over in [(inner,.022),((inner+outer)/2,.025+.021*ridge),(outer,.021)]:
                    verts.append(front(side*dx,h,over))
                if i:
                    for k in (3*(i-1),3*(i-1)+1):faces.append((k,k+1,k+4,k+3))
            lapel=part('굴려 접은 노치 라펠',verts,faces,'lapel')
            for f in lapel.data.polygons:f.use_smooth=True
            for j in range(1,len(rows)):
                h0,_,w0=rows[j-1];h1,_,w1=rows[j]
                path('접힌 라펠 가장자리',[front(side*w0,h0,.020),front(side*w1,h1,.020)],.0017,'seam')
        patch('접은 버건디 포켓 스퀘어',[(.100,1.692),(.111,1.720),(.152,1.734),(.173,1.726),(.169,1.708)],'wine',.018)
        stitch('가슴 포켓',[(.086,1.688),(.186,1.71)],'lapel',.006)
        # The pick stitches sit just inside the lapel edge.
        for sign in (-1,1):
            for j in range(17):
                t=j/17
                a=sign*(.122-.104*t);h=1.754-.248*t
                stitch('라펠 피크 스티치',[(a,h),(a-sign*.0021,h-.0045)],'seam',.00085)
        stitch('티켓 포켓',[(.134,1.345),(.208,1.356)],'lapel',.005)
        for h in [1.486,1.402,1.317]:
            a=.012
            rod('뿔단추',front(a,h,.016),front(a,h,.024),.010,'horn')
            for dx in (-.0025,.0025):
                for dz in (-.0025,.0025):
                    cy=surface(a,h)-.0244
                    rod('뿔단추 구멍',(a+dx,cy,h+dz),(a+dx,cy-.0005,h+dz),.0015,'espresso')
            cy=surface(a,h)-.0245
            path('단추 실',[(a-.0025,cy,h-.0025),(a+.0025,cy-.0008,h+.0025)],.00055,'lapel')
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
        # Open both zip ends. A curved cloth panel follows the convex chest,
        # with each tape taking its own path above and below the closed middle.
        for ends in [[(1.637,.002),(1.691,.020),(1.76,.039),(1.825,.060),(1.886,.086)],
                     [(bottom,.051),(bottom+.04,.035),(bottom+.1,.011),(bottom+.131,.002)]]:
            panel=[];quads=[]
            for i,(h,w) in enumerate(ends):
                for factor in [-1,-.5,0,.5,1]:panel.append(front(w*factor,h,.020))
                if i:
                    for k in range(4):
                        q=5*(i-1)+k;quads.append((q,q+1,q+6,q+5))
            part('지퍼 안쪽 안감',panel,quads,'jacket_lining')
        # A folded hood hangs behind the neck. Asymmetric shoulders and a lower,
        # split front keep it distinct from the stand collar of a zip-up sweater.
        rings=[];lining=[]
        angles=[-pi/2+.38+i*(2*pi-.76)/39 for i in range(40)]
        for w,d,h in [(.123,.106,1.825),(.161,.132,1.89),(.155,.130,1.927),
                      (.134,.102,1.924),(.112,.096,1.855)]:
            row=[]
            for t in angles:
                back=max(0,sin(t))
                row.append((w*cos(t),.045+d*sin(t),h+.063*sin(t)-.025*back+.014*sin(2*t+.32)))
            rings.append(row)
        for k in range(len(rings)-1):
            vs=rings[k]+rings[k+1]
            shell=part('뒷목에 접혀 놓인 니트 후드',vs,[(i,i+1,41+i,40+i) for i in range(39)],'wine' if k>=3 else 'hood')
            for f in shell.data.polygons:f.use_smooth=True
        for sign in (-1,1):
            cheek=[front(sign*x,h,.026) for x,h in [(.064,1.806),(.064,1.831),(.082,1.86),(.115,1.883),(.138,1.895)]]
            path('후드의 접힌 앞단',cheek,.009,'hood')
            xcord=sign*.119
            ycord=surface(xcord,1.86)-.023
            rod('조임끈 고리',(xcord,ycord,1.858),(xcord,ycord-.005,1.858),.005,'metal')
            path('후드 조임끈',[(xcord,ycord-.006,1.858),(xcord+sign*.008,ycord-.013,1.837),
                (xcord+sign*.019,ycord-.012,1.843),(xcord+sign*.023,ycord-.008,1.861)],.0024,'hood')
            rod('조임끈 끝 금구',(xcord+sign*.023,ycord-.008,1.861),(xcord+sign*.023,ycord-.005,1.870),.0029,'metal')
        def zip_x(h):
            if h<bottom+.13:return .050*((bottom+.13-h)/.13)**1.4
            if h>1.637:return .087*((h-1.637)/(.25))**1.15
            return .0017
        for sign in (-1,1):
            samples=[bottom+i*(top-bottom)/22 for i in range(23)]
            points=[front(sign*zip_x(h),h,.023) for h in samples]
            path('분리되는 앞 지퍼 테이프',points,.0039,'suede_seam')
            path('앞 지퍼 금속 체인',[front(sign*(zip_x(h)-.0018),h,.025) for h in samples],.0015,'teeth')
        # On the tightly packed side rail the separate teeth are occluded by
        # the adjacent sleeves. Its continuous metal chain retains the profile.
        for j in range(55 if abs(transform[0][0])>.55 else 0):
            h=bottom+.015+j*.0125
            for sign in (-1,1):
                x=sign*zip_x(h)
                path('지퍼 이빨',[front(x,h,.026),front(x+sign*.0026,h+.0016,.025)],.00095,'teeth')
        for h in [bottom+.13,1.641]:
            a,b,c=front(0,h,.027),front(.009,h-.022,.031),front(0,h-.036,.034)
            path('양방향 지퍼 손잡이',[a,b,c,front(-.006,h-.02,.031),a],.0025,'metal')
        for s in [-1,1]:
            stitch('가슴 절개선',[(s*.035,1.682),(s*.11,1.695),(s*.216,1.722)],'suede_seam',.0019)
    for ob in pieces[batch][first_part:]:
        fabric.drape(ob,kind,bottom)
        ob.data.update()
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
def upholstery(name, x,y,z,w,d,h,corner, cloth, crown, back_slope=0):
    # A sewn cover swells between the base and welt line. Successive loops form
    # a soft crown all the way to the centre of the cushion.
    rings=[]
    for scale,level in [(.92,0),(.98,.09),(1,.25),(1,.64),(.98,.87),(.94,.96),
                        (.80,1),(.59,1),(.33,1),(.08,1)]:
        row=[]
        for dx,dy in outline(w*scale,d*scale,corner*scale):
            dome=crown*(1-scale**2) if level>=.96 else 0
            row.append((x+dx,y+dy+back_slope*level,z+h*level+dome))
        rings.append(row)
    pad=skins(name,rings,cloth)
    for face in pad.data.polygons:face.use_smooth=len(face.vertices)==4
    seam=outline(w*.952,d*.952,corner*.952)
    tube=[]
    for i,(dx,dy) in enumerate(seam):
        a=seam[i-1];b=seam[(i+1)%len(seam)]
        normal=Vector((b[1]-a[1],a[0]-b[0],0)).normalized()
        p=Vector((x+dx,y+dy+.93*back_slope,z+.93*h))
        tube.append([p+.0034*(normal*cos(j*pi/3)+Vector((0,0,sin(j*pi/3)))) for j in range(6)])
    skins(name+' · 파이핑',tube+[tube[0]],'piping',cap=False)

plate('라운지 의자 목재 받침',cx,cy,.035,.72,.72,.12,.08,'walnut')
upholstery('라운지 의자 좌판',cx,cy,.14,.85,.79,.26,.085,'linen',.008)
upholstery('좌방석',cx,cy-.035,.386,.65,.63,.111,.070,'upholstery',.027)
upholstery('낮은 등받이',cx,cy+.327,.34,.84,.157,.42,.06,'linen',.012,.025)
for side in (-1,1):
    upholstery('둥근 팔걸이',cx+side*.36,cy-.005,.33,.14,.72,.31,.056,'linen',.012)
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
# Store authored UVs and separate body parts in the artist library before joining.
maps=fabric.swatches()
for key,roughness in [('CucinelliInterior',.65),('CucinelliTailoring',.78),('CucinelliCashmere',.96),('CucinelliSuede',.88)]:
    native_material=fabric.response(key+' 원단',maps,roughness)
    for ob in pieces[key]:fabric.map_piece(ob,ob.data.materials[0],native_material)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for batch,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
