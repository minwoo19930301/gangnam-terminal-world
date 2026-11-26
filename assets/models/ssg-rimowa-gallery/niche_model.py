"""Editable Original Silver customisation display based on the Gangnam shop photograph."""
from math import atan2,ceil,cos,pi,sin,sqrt
from pathlib import Path
import subprocess
import tempfile
import bmesh
import bpy
from mathutils import Matrix,Vector

OUT=Path(__file__).resolve().parent
SOLID='RimowaNicheFinishes'
GLASS='RimowaNicheAcrylic'
SWATCHES={'silver':0,'rail':1,'rubber':2,'anodised':3,'ink':4,'light':5,'bronze':6,
          'rim':7,'acrylic edge':8,'wood edge':9,'polished':10,'gasket':11,'recess':12}
RECT={'oak':(8,8,328,530),'back':(350,8,245,530),'shell':(610,8,400,522),'koeln':(8,550,187,210),'seoul':(208,550,187,210)}
NATIVE_COLOURS={'silver':(.74,.76,.74),'rail':(.09,.085,.078),'rubber':(.018,.019,.021),'anodised':(.51,.52,.50),
    'ink':(.041,.039,.036),'light':(1,.96,.82),'bronze':(.35,.28,.19),'rim':(.66,.68,.66),'acrylic edge':(.83,.88,.83),
    'wood edge':(.39,.21,.09),'polished':(.88,.90,.88),'gasket':(.11,.10,.098),'recess':(.26,.25,.24)}
HALF=.194
LOW=.066
HIGH=.536
ROUND=.035
CASE_Z=.793
NAMES=(SOLID,GLASS)
FRAME=Matrix.Translation((-2.70,-.015,0))

def uv_image(key,u=.5,v=.5):
    if key in RECT:
        l,t,w,h=RECT[key];return ((l+max(.0001,min(.9999,u))*w)/1024,1-(t+(1-max(.0001,min(.9999,v)))*h)/768)
    return ((540+SWATCHES[key]*34+17)/1024,1-638/768)

def smoothstep(x):
    t=max(0,min(1,x));return t*t*(3-2*t)

def groove(x,z):
    # Moulded 15.2 mm channels with narrow rounded crowns, fading into the corner guards.
    slot=(x/.0239+.5)%1-.5
    shape=smoothstep((abs(slot)-.17)/.23)
    end=smoothstep((z-LOW-.015)/.041)*smoothstep((HIGH-z-.014)/.040)
    edge=smoothstep((HALF-abs(x)-.005)/.023)
    return .0063*shape*edge*end

def face_depth(x,z):
    t=max(0,(abs(x)-.158)/.036);b=max(0,(LOW+.032-z)/.032,(z-HIGH+.032)/.032)
    return .106+.0015*(1-(x/HALF)**2)-.0085*max(t**2,b**2)+groove(x,z)

def outline(hx,bottom,top,r,steps=8):
    return [(cx+r*cos(start+i*pi/(2*steps)),cz+r*sin(start+i*pi/(2*steps)))
        for cx,cz,start in [(hx-r,top-r,0),(-hx+r,top-r,pi/2),(-hx+r,bottom+r,pi),(hx-r,bottom+r,3*pi/2)]for i in range(steps+1)]

class Niche:
    def __init__(self,collection,placement):
        self.collection=collection;self.placement=placement;self.parts=[]
        with tempfile.TemporaryDirectory() as directory:
            subprocess.run(['node',str(OUT/'niche_atlas.mjs'),directory],check=True)
            images=[]
            for filename in ('niche-colours.png','niche-metal.png'):
                im=bpy.data.images.load(str(Path(directory)/filename));im.pack();im.filepath='//'+filename;images.append(im)
        images[1].colorspace_settings.name='Non-Color'
        self.material=bpy.data.materials.new(SOLID);self.material.use_nodes=True
        tree=self.material.node_tree;bs=tree.nodes['Principled BSDF']
        for im,kind in zip(images,['colour','response']):
            tx=tree.nodes.new('ShaderNodeTexImage');tx.image=im
            if kind=='colour':tree.links.new(tx.outputs['Color'],bs.inputs['Base Color'])
            else:
                sep=tree.nodes.new('ShaderNodeSeparateRGB')
                tree.links.new(tx.outputs['Color'],sep.inputs['Image'])
                tree.links.new(sep.outputs['G'],bs.inputs['Roughness']);tree.links.new(sep.outputs['B'],bs.inputs['Metallic'])
        self.glass=bpy.data.materials.new(GLASS);self.glass.use_nodes=True
        gl=self.glass.node_tree.nodes['Principled BSDF'];gl.inputs['Base Color'].default_value=(.89,.94,.92,1)
        gl.inputs['IOR'].default_value=1.49;gl.inputs['Roughness'].default_value=.09;gl.inputs['Transmission'].default_value=.95

    def part(self,name,pts,faces,key,uv=None,smooth=False,bev=0):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(pts,[],faces);mesh.update()
        if bev:
            bm=bmesh.new();bm.from_mesh(mesh)
            bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
            bmesh.ops.bevel(bm,geom=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.45],offset=bev,segments=2,affect='EDGES',clamp_overlap=True)
            bm.to_mesh(mesh);bm.free()
        ob=bpy.data.objects.new(name,mesh);self.collection.objects.link(ob);ob.matrix_world=self.placement.copy();ob['retailPackage']='RimowaNiche'
        mesh.materials.append(self.glass if key=='glass' else self.material)
        if key!='glass':
            layer=mesh.uv_layers.new(name='Niche finish')
            for k in mesh.loops:
                co=mesh.vertices[k.vertex_index].co
                u,v=uv(co) if uv else (.5,.5)
                layer.data[k.index].uv=uv_image(key,u,v)
        if smooth:
            for face in mesh.polygons:face.use_smooth=len(face.vertices)<=4
        self.parts.append(ob);return ob

    def box(self,n,center,size,key,bev=0,uv=None):
        x,y,z=center;w,d,h=(v*.5 for v in size)
        pts=[(x+w*a,y+d*b,z+h*c)for c in (-1,1)for b in (-1,1)for a in (-1,1)]
        return self.part(n,pts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],key,uv,bev=bev)

    def tube(self,n,ps,r,key,sides=9):
        pts=[]
        for i,p in enumerate(ps):
            d=Vector(ps[min(len(ps)-1,i+1)])-Vector(ps[max(0,i-1)])
            d.normalize();up=Vector((0,0,1)) if abs(d.z)<.83 else Vector((0,1,0));right=d.cross(up).normalized();up=right.cross(d).normalized()
            pts.extend([Vector(p)+r*(right*cos(j*2*pi/sides)+up*sin(j*2*pi/sides)) for j in range(sides)])
        faces=[tuple(range(sides-1,-1,-1)),tuple((len(ps)-1)*sides+i for i in range(sides))]
        faces.extend([(k*sides+j,k*sides+(j+1)%sides,(k+1)*sides+(j+1)%sides,(k+1)*sides+j)for k in range(len(ps)-1)for j in range(sides)])
        return self.part(n,pts,faces,key,smooth=True)

    def text(self,word,center,size,col,systemfont=None):
        curve=bpy.data.curves.new(word,'FONT');curve.body=word;curve.size=size;curve.align_x='CENTER';curve.align_y='CENTER';curve.space_character=1.075
        if systemfont:
            for p in systemfont:
                if Path(p).is_file():curve.font=bpy.data.fonts.load(p,check_existing=True);break
        curve.extrude=.0006;curve.resolution_u=8
        obj=bpy.data.objects.new(word,curve);self.collection.objects.link(obj);obj.location=center;obj.rotation_euler.x=pi/2;bpy.context.view_layer.update()
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        pts=[tuple(obj.matrix_world@v.co)for v in mesh.vertices];faces=[tuple(f.vertices)for f in mesh.polygons]
        self.part('문자 · '+word,pts,faces,col)
        bpy.data.meshes.remove(mesh);bpy.data.objects.remove(obj,do_unlink=True);bpy.data.curves.remove(curve)

    def fixture(self):
        # Publicity photo four: an oak surround, brushed recess, luminous edging and a clear bent riser.
        inner=.34;outer=.695;sill=.574;head=2.235;front=-.249;depth=.35
        grain=lambda c:((c.x+.71)/1.42,(c.z+.04)/2.72)
        for sx in (-1,1):
            self.box('오크 측판',((outer+inner)*.5*sx,-.058,1.34),(outer-inner,.37,2.68),'oak',.003,grain)
            self.box('금속 안쪽 측벽',(sx*(inner-.003),-.087,(head+sill)/2),(.007,.31,head-sill),'rim',.0012)
        self.box('오크 하단 장식판',(0,-.058,sill/2),(inner*2,.37,sill),'oak',.003,grain)
        self.box('오크 상단 장식판',(0,-.058,(2.68+head)/2),(inner*2,.37,2.68-head),'oak',.003,grain)
        for h in (sill,head):
            self.box('헤어라인 가공 상하판',(0,-.083,h),(.671,.313,.011),'rim',.0016)
        self.box('브러시드 알루미늄 안쪽 배면',(0,.076,(head+sill)*.5),(.670,.017,head-sill-.008),'back',.001,lambda c:(c.x/.670+.5,(c.z-sill)/(head-sill)))
        for h in (head-.019,sill+.017):
            self.box('간접조명 선',(0,.058,h),(.654,.008,.009),'light',.0017)
        for sx in (-1,1):
            self.box('외측 창틀의 음영',(sx*.3485,front-.001,(sill+head)*.5),(.006,.005,head-sill+.021),'wood edge',.001)
            self.box('알루미늄 문선',(sx*.339,front-.005,(sill+head)*.5),(.014,.015,head-sill+.013),'anodised',.0015)
        for h in (sill-.0025,head+.0025):
            self.box('창틀 수평 이음',(0,front-.005,h),(.694,.013,.012),'anodised',.0015)
        self.box('투명 아크릴 상판',(0,-.100,CASE_Z-.005),(.523,.243,.008),'glass',.0023)
        for sx in (-1,1):
            self.box('아크릴 수직 받침',(sx*.257,-.100,(CASE_Z+sill+.012)*.5),(.008,.243,CASE_Z-sill-.014),'glass',.0023)
            self.box('받침의 연마한 앞 모서리',(sx*.257,-.222,(CASE_Z+sill+.012)*.5),(.0015,.0015,CASE_Z-sill-.016),'acrylic edge',.00035)
        self.box('아크릴 상단 앞 모서리',(0,-.222,CASE_Z-.004),(.520,.0018,.0012),'acrylic edge',.00036)
        self.tube('매립 조명의 원형 테두리',[(.010*cos(j*2*pi/28),-.135+.010*sin(j*2*pi/28),head-.007)for j in range(29)],.0012,'rim',6)
        self.part('하향등 렌즈',[(.009*cos(j*2*pi/24),-.135+.009*sin(j*2*pi/24),head-.0075)for j in range(24)],[tuple(range(23,-1,-1))],'light')
        self.text('RIMOWA',(0,.0658,head-.245),.117,'ink',['/System/Library/Fonts/Supplemental/Arial Unicode.ttf','/System/Library/Fonts/Supplemental/Arial.ttf'])

    def shell(self,sgn):
        nz=[LOW+(HIGH-LOW)*i/26 for i in range(27)]
        edge=[.0001,.002,.004,.007,.011,.016,.023,.032,.045,.06]
        zs=sorted(set(nz+[LOW+i for i in edge]+[HIGH-i for i in edge]))
        nx=147
        pts=[];fac=[]
        for z in zs:
            dz=max(0,LOW+ROUND-z,z-(HIGH-ROUND));hx=HALF-ROUND+sqrt(max(0,ROUND*ROUND-dz*dz))
            for j in range(nx):
                x=-hx+2*hx*j/(nx-1);d=face_depth(x,z)
                pts.append((x,sgn*d-.102,CASE_Z+z))
        for i in range(len(zs)-1):
            for j in range(nx-1):
                f=(i*nx+j,i*nx+j+1,(i+1)*nx+j+1,(i+1)*nx+j);fac.append(f if sgn<0 else f[::-1])
        self.part('프레스 성형한 알루미늄 전면' if sgn<0 else '알루미늄 후면',pts,fac,'shell',
            lambda c:(c.x/(HALF*2)+.5,(c.z-CASE_Z-LOW)/(HIGH-LOW)),smooth=True)
        contour=[]
        for j in range(nx):contour.append(pts[j])
        for i in range(1,len(zs)):contour.append(pts[i*nx+nx-1])
        contour += [pts[(len(zs)-1)*nx+j]for j in range(nx-2,-1,-1)]
        contour += [pts[i*nx]for i in range(len(zs)-2,0,-1)]
        # The stamped face rolls continuously over the top and sides into a central frame.
        profile=[(0,0,0),(.0022,.0021,.0018),(.0043,.0030,.0045),(.0058,.0024,.013),
                 (.0059,.0030,.047),(.0051,.0027,.082),(.0045,.0025,.094)]
        allpts=[]
        for side,vertical,retract in profile:
            for x,y,z in contour:
                q=(z-CASE_Z-(LOW+HIGH)/2)/((HIGH-LOW)/2)
                allpts.append((x+side*x/HALF,y-sgn*retract, z+vertical*q))
        n=len(contour);faces=[(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i)for k in range(len(profile)-1)for i in range(n)]
        self.part('접합 프레임까지 말린 셸의 모서리',allpts,faces,'anodised',smooth=True)

    def frame_band(self,n,cy,width,key,rise=.0015):
        ring=outline(HALF+.006+rise,CASE_Z+LOW-.0045-rise,CASE_Z+HIGH+.003+rise,.044,10)
        loops=[[(x,-.102+y,z)for x,z in ring]for y in (cy-width/2,cy+width/2)]
        m=len(ring);faces=[(i,(i+1)%m,(i+1)%m+m,i+m)for i in range(m)]
        self.part(n,loops[0]+loops[1],faces,key,smooth=True)

    def hub(self,x,y,z,rad,thick,sgn):
        # Cylindrical wheel oriented across the axle (Y), its six recesses are real holes.
        rings=[(rad*.72,-thick*.5),(rad*.96,-thick*.47),(rad,thick*-.30),(rad,thick*.30),(rad*.96,thick*.47),(rad*.73,thick*.50)]
        n=32
        def cyl(name,rings,key,cap=False):
            pts=[(x+r*cos(j*2*pi/n),y+d,z+r*sin(j*2*pi/n))for r,d in rings for j in range(n)]
            faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j)for k in range(len(rings)-1)for j in range(n)]
            if cap:faces+=[tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+j for j in range(n))]
            return self.part(name,pts,faces,key,smooth=True)
        cyl('이중 휠의 고무 타이어',rings,'rubber')
        d=thick*sgn*.53
        cyl('휠 안쪽의 검은 바탕',[(rad*.76,d*.74),(rad*.76,d*.91)],'gasket',True)
        p=[];faces=[]
        for j in range(6):
            a=2*pi*j/6;cx=x+rad*.47*cos(a);cz=z+rad*.47*sin(a);begin=len(p)
            # One angular sector per perforation, its outside points follow two circular radii.
            edge=[]
            for k in range(5):edge.append((x+rad*.755*cos(a-pi/6+k*pi/12),z+rad*.755*sin(a-pi/6+k*pi/12)))
            for k in range(5):edge.append((x+rad*.17*cos(a+pi/6-k*pi/12),z+rad*.17*sin(a+pi/6-k*pi/12)))
            for ex,ez in edge:p.append((ex,y+d,ez))
            for ex,ez in edge:
                ang=atan2(ez-cz,ex-cx);p.append((cx+rad*.126*cos(ang),y+d,cz+rad*.126*sin(ang)))
            for k in range(10):faces.append((begin+k,begin+(k+1)%10,begin+10+(k+1)%10,begin+10+k))
        self.part('은색 스포크 판에 성형된 여섯 구멍',p,faces,'polished')
        cyl('축 중심의 볼록한 커버',[(rad*.17,d),(rad*.141,d+sgn*.001)],'anodised',True)

    def trim(self):
        for sgn in (-1,1):
            for top in (-1,1):
                z=CASE_Z+(HIGH-.030 if top>0 else LOW+.020)
                x=sgn*(HALF-.018)
                # Aluminium front corner protectors curl around the shell and taper toward the ribs.
                profile=[(-.048,.028),(-.045,.038),(-.022,.040),(-.005,.035),(.012,.023),(.018,.005),(.019,-.021),(.011,-.029),(.005,-.022),(-.002,-.006),(-.015,.009),(-.034,.018)]
                f=[(x+sgn*dx,-.102-face_depth(x+sgn*dx,z-CASE_Z+top*dz)-.0013,z+top*dz)for dx,dz in profile]
                self.part('셸에 덧댄 성형 코너 캡',f,[tuple(range(len(f)))],'rim')
                for dx,dz in [(-.034,.029),(.009,-.013)]:
                    rx=x+sgn*dx;rz=z+top*dz;ry=-.102-face_depth(rx,rz-CASE_Z)-.0019
                    self.tube('코너 플레이트의 브러시드 리벳',[(rx,ry+.0008,rz),(rx,ry-.0007,rz)],.00205,'polished',12)
        # The small inset hallmark sits above the vertical flutes on the original shell.
        nameplate=[(-.041,.517),(-.039,.505),(-.033,.502),(.033,.502),(.039,.505),(.041,.517),(.041,.529),(-.041,.529)]
        self.part('상단의 눌러 만든 브랜드 명판',[(a,-.102-face_depth(a,b)-.0006,CASE_Z+b) for a,b in nameplate],[tuple(range(8))],'anodised')
        self.text('RIMOWA',(0,-.102-face_depth(0,.515)-.0012,CASE_Z+.516),.0071,'recess')
        for dx in (-.033,.033):
            h=.5105;dep=-.102-face_depth(dx,h)
            self.tube('명판의 두 체결점',[(dx,dep-.0008,CASE_Z+h),(dx,dep-.0013,CASE_Z+h)],.0014,'polished',10)
        for offset,width,key,r in [(-.008,.010,'anodised',.0003),(0,.0035,'gasket',.0014),(.008,.010,'rim',.0001)]:
            self.frame_band('중앙 알루미늄 맞댐 프레임',offset,width,key,r)
        # Folded telescopic carry handle and its paired metal feet.
        for sx in (-1,1):
            self.box('들손 달림쇠',(sx*.068,-.095,CASE_Z+HIGH+.0035),(.018,.037,.009),'rim',.003)
            self.box('들손 속 검은 완충받침',(sx*.060,-.093,CASE_Z+HIGH+.007),(.009,.018,.011),'gasket',.003)
        self.box('윗면 일자 손잡이',(0,-.094,CASE_Z+HIGH+.011),(.129,.016,.013),'silver',.005)
        self.box('뒤쪽 텔레스코픽 손잡이 함몰부',(0,-.036,CASE_Z+HIGH+.001),(.132,.043,.004),'gasket',.002)
        self.box('수납된 텔레스코픽 손잡이',(0,-.038,CASE_Z+HIGH+.0035),(.123,.026,.007),'anodised',.003)
        self.box('엄지로 누르는 텔레스코픽 버튼',(0,-.037,CASE_Z+HIGH+.0073),(.043,.011,.002),'rail',.0008)
        # The side handle and closures are only projected a few millimetres from the side face.
        x=HALF+.0045
        self.box('측면 손잡이 중앙 코어',(x+.002,-.102,CASE_Z+.302),(.011,.023,.105),'anodised',.004)
        for h in (.245,.358):
            self.box('측면 손잡이 받침',(x+.001,-.102,CASE_Z+h),(.009,.033,.021),'rim',.003)
        for h in (.151,.451):
            self.box('쉘 잠금쇠 외장',(x+.001,-.102,CASE_Z+h),(.009,.049,.039),'polished',.003)
            self.box('상자걸쇠의 음영',(x+.0061,-.111,CASE_Z+h),(.0018,.018,.022),'rail',.0006)
            for j in range(3):self.box('번호 다이얼',(x+.0072,-.110+(j-1)*.0053,CASE_Z+h),(.0018,.0037,.009),'anodised',.0004)
        for h in (.178,.319,.446):
            self.tube('힌지 핀',[(-HALF-.006,-.102,CASE_Z+h-.020),(-HALF-.006,-.102,CASE_Z+h+.020)],.0030,'silver')
            for s in (-1,1):self.box('힌지 판',(-HALF-.004,-.102+s*.008,CASE_Z+h),(.003,.013,.034),'rim',.0008)
        for sx in (-1,1):
            for sy in (-1,1):
                x=sx*.153;y=-.102+sy*.075
                self.box('멀티휠 하우징',(x,y,CASE_Z+.067),(.066,.049,.036),'recess',.008)
                self.box('방향 전환 축',(x,y,CASE_Z+.050),(.028,.026,.033),'rail',.006)
                for face in (-1,1):self.hub(x,y+face*.016,CASE_Z+.026,.026,.015,face)

    def sticker(self,key,cx,cz,width,height,angle):
        # Each label remains its own editable conforming vinyl sheet. Its UV artwork
        # follows the steel grooves instead of crossing them as a flat decal.
        n=46;rows=27;pts=[];uvs=[];faces=[]
        for k in range(rows+1):
            v=k/rows
            if key=='koeln':
                ew=.5 if v<.52 else max(.027,.50*sqrt(max(0,1-((v-.52)/.48)**2)))
            else:
                # Small indents in the Seoul ticket border and gently curved corners.
                ew=.48-.042*(abs(v-.5)*2)**12
            for j in range(n+1):
                u=.5+(j/n-.5)*2*ew
                dx=(u-.5)*width;dz=(v-.5)*height
                x=cx+dx*cos(angle)-dz*sin(angle);z=cz+dx*sin(angle)+dz*cos(angle)
                pts.append((x,-.102-face_depth(x,z)-(.0006 if key=='koeln' else .00105),CASE_Z+z))
                uvs.append((u,v))
        for k in range(rows):
            for j in range(n):
                i=k*(n+1)+j;faces.append((i,i+1,i+n+2,i+n+1))
        ob=self.part('비닐 스티커 · '+('쾰른'if key=='koeln'else'서울'),pts,faces,key)
        layer=ob.data.uv_layers.active
        for l in ob.data.loops:layer.data[l.index].uv=uv_image(key,*uvs[l.vertex_index])
        for f in ob.data.polygons:f.use_smooth=True
        return ob

def make(collection,placement=None):
    n=Niche(collection,placement if placement is not None else Matrix.Identity(4))
    n.fixture();n.shell(-1);n.shell(1);n.trim()
    n.sticker('koeln',.102,.391,.110,.149,.237)
    n.sticker('seoul',.101,.238,.115,.141,-.167)
    return n.parts
