"""Classic Kettle, single-wall titanium mug and hanging Home & Camp lantern, in metres."""
from math import atan2,cos,pi,sin
from mathutils import Matrix,Vector
import bpy

ATLAS=(1024,768)
RECTS={'body':(12,12,998,465),'mug':(12,503,623,245),'caps':(655,503,352,244)}
NEUTRAL=(.996,.996)

class CampKitchen:
    def __init__(self,part,tube,root):
        def steel_part(*args,**kwargs):
            ob=part(*args,**kwargs);ob['vesselPart']=True;return ob
        def steel_tube(*args,**kwargs):
            ob=tube(*args,**kwargs);ob['vesselPart']=True;return ob
        self.part=steel_part
        self.tube=steel_tube
        self.root=root
        self.images={}
        for key,filename in [('colour','vessel-colour.png'),('response','vessel-response.png')]:
            im=bpy.data.images.load(str(root/filename));im.pack();im.filepath='//'+filename
            if key=='response':im.colorspace_settings.name='Non-Color'
            self.images[key]=im
        self.surface=self.paint_material('Snow Peak · steel and titanium')

    def paint_material(self,name):
        m=bpy.data.materials.new(name);m.use_nodes=True
        tree=m.node_tree;bs=tree.nodes['Principled BSDF'];tx=tree.nodes.new('ShaderNodeTexImage')
        tx.image=self.images['colour'];tree.links.new(tx.outputs['Color'],bs.inputs['Base Color'])
        orm=tree.nodes.new('ShaderNodeTexImage');orm.image=self.images['response']
        sep=tree.nodes.new('ShaderNodeSeparateRGB');tree.links.new(orm.outputs['Color'],sep.inputs['Image'])
        tree.links.new(sep.outputs['G'],bs.inputs['Roughness']);tree.links.new(sep.outputs['B'],bs.inputs['Metallic'])
        return m

    def project(self,ob,uvs,which):
        left,top,w,h=RECTS[which];me=ob.data;uv=me.uv_layers.new(name='Metal finish')
        for f in me.polygons:
            us=[uvs[me.loops[i].vertex_index][0] for i in f.loop_indices]
            seam=max(us)-min(us)>.6
            for i in f.loop_indices:
                u,v=uvs[me.loops[i].vertex_index]
                if seam and u<.4:u+=1
                uv.data[i].uv=((left+max(0,min(u,1))*w)/ATLAS[0],1-(top+(1-max(0,min(v,1)))*h)/ATLAS[1])
        ob.data.materials.clear();ob.data.materials.append(self.surface);ob['vesselPaint']=which
        return ob

    def lathe(self,name,center,profile,col,n=40,which=None):
        x,y,z=center
        pts=[];uvs=[];lo=min(h for r,h in profile);span=max(h for r,h in profile)-lo
        for r,h in profile:
            for j in range(n):
                ang=j*2*pi/n-pi/2
                pts.append((x+r*cos(ang),y+r*sin(ang),z+h))
                uvs.append(((j/n+.5)%1,(h-lo)/max(span,.00001)))
        faces=[tuple(reversed(range(n)))]
        for k in range(len(profile)-1):
            for j in range(n):
                a=k*n+j;b=k*n+(j+1)%n;faces.append((a,b,b+n,a+n))
        faces.append(tuple((len(profile)-1)*n+j for j in range(n)))
        ob=self.part(name,pts,faces,col)
        for f in ob.data.polygons:f.use_smooth=len(f.vertices)==4
        if which:self.project(ob,uvs,which)
        return ob

    def cap(self,name,coords,thickness,col):
        pts=[(x,y,z+dz) for dz in (0,thickness) for x,y,z in coords]
        n=len(coords);faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]
        faces.extend([(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)])
        return self.part(name,pts,faces,col,min(.00055,thickness*.35))

    def kettle(self,x,y,z,opened=False):
        def pos(a,b,c):return (x+a,y+b,z+c)
        def wire(name,ps,r=.0014,col='silver',n=8):
            return self.tube(name,[pos(*p) for p in ps],r,col,n)
        p=(x,y,z)
        body=[(.044,.0008),(.0546,0),(.0574,.0023),(.0575,.0053),(.0564,.0077),(.0564,.011),
              (.0538,.084),(.0518,.151),(.0501,.201),(.0512,.2045),(.052,.2052),
              (.052,.2072),(.0507,.2077),(.0497,.2056),(.0495,.200),(.0512,.15),(.0552,.012),
              (.0547,.008),(.0530,.007),(.043,.007)]
        self.lathe('클래식 케틀 · 말린 림과 비어 있는 1.8L 몸통',p,body,'silver',56,'body')
        # The lid lifts back around the small hinge opposite the spout.
        lidparts=[]
        def lid(ob):lidparts.append(ob);return ob
        lid(self.lathe('경첩 뚜껑과 얕은 돔',p,[(.0467,.2053),(.0499,.2052),(.0517,.2069),(.0519,.2086),
          (.0501,.2095),(.046,.2101),(.037,.2115),(.027,.2134),(.005,.2142)],'silver',48,'caps'))
        # A flat, folded steel strip forms the lid pull with a wide loop and small feet.
        handle=[(-.017,.214),(-.012,.214),(-.0101,.216),(-.011,.231),(-.009,.237),
                (-.006,.2394),(.006,.2394),(.009,.237),(.011,.231),(.0101,.216),(.012,.214),(.017,.214)]
        coords=[]
        for a,h in handle:coords.extend([pos(a,-.0035,h),pos(a,.0035,h)])
        lid(self.part('납작한 뚜껑 손잡이',coords,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(len(handle)-1)],'silver'))
        for dx in [-.014,.014]:
            lid(self.lathe('뚜껑 손잡이 고정점',pos(dx,0,.2143),[(.0016,0),(.0014,.0008)],'steel',12))
        for dx,dy in [(.032,.013),(-.024,.028)]:
            lid(self.lathe('뚜껑의 증기구 음영',pos(dx,dy,.2121),[(.00115,0),(.00118,.00015)],'graphite',12))
        hinge=[(.038,-.014,.210),(.047,-.016,.210),(.062,-.013,.209),(.065,-.007,.209),(.063,.010,.210),(.043,.014,.212)]
        lid(self.cap('덮개 경첩의 원형 어깨',[pos(*v) for v in hinge],.0012,'silver'))
        for dy in (-.008,.008):
            lid(self.lathe('뚜껑 경첩 리벳',pos(.050,dy,.212),[(.0018,0),(.0016,.0009)],'silver',14))
        wire('뚜껑 경첩핀',[(.0608,-.014,.208),(.0608,.014,.208)],.00265)
        # Rectangular steel strap folds out, unlike the round wire on the mug.
        sidepath=[(.052,.180),(.106,.185),(.112,.182),(.137,.076),(.133,.072),(.057,.037)]
        for sy in [-.008,.009]:
            verts=[]
            for dx,h in sidepath:
                verts.extend([pos(dx,sy-.0018,h),pos(dx,sy+.0018,h),pos(dx+.0011,sy+.0018,h),pos(dx+.0011,sy-.0018,h)])
            faces=[]
            for i in range(len(sidepath)-1):
                for j in range(4):faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
            self.part('양쪽 접이식 판손잡이',verts,faces,'silver')
        for dx,h in [(.053,.18),(.056,.037)]:
            wire('손잡이 피벗의 말린 슬리브',[(dx,-.013,h),(dx,.013,h)],.0029,'steel')
            self.cap('스폿용접 손잡이 받침',[pos(dx-.0012,-.011,h-.013),pos(dx+.001,-.011,h-.013),
                pos(dx+.001,.011,h+.013),pos(dx-.0012,.011,h+.013)],.001,'silver')
        # Sloped sheet-metal spout has a hollow triangular mouth, bead and independent flip cover.
        rings=[]
        for cx,cy,h,w,d in [(-.046,0,.102,.018,.002),(-.052,0,.119,.0185,.006),
             (-.061,0,.153,.0165,.011),(-.071,0,.181,.014,.012),(-.0765,0,.189,.014,.012)]:
            rings.append([pos(cx+d,cy-w,h),pos(cx+d,cy+w,h),pos(cx-d,cy+w*.62,h),pos(cx-d,cy-w*.62,h)])
        verts=sum(rings,[]);faces=[(k*4+j,k*4+(j+1)%4,(k+1)*4+(j+1)%4,(k+1)*4+j)for k in range(4)for j in range(4)]
        self.part('접어 이은 삼각 주둥이',verts,faces,'silver',.00055)
        self.tube('주둥이 입술',rings[-1]+[rings[-1][0]],.00105,'silver',7)
        self.cap('따르는 덮개',[pos(a,b,.1912) for a,b in [(-.093,-.008),(-.076,-.013),(-.063,-.013),(-.063,.013),(-.076,.013),(-.093,.008)]],.0010,'silver')
        wire('따르는 덮개 경첩',[(-.061,-.015,.1911),(-.061,.015,.1911)],.0021,'steel')
        wire('말아 올린 주둥이 덮개 탭',[(-.089-.005*sin(j*pi/12),0,.194-.005*cos(j*pi/12)) for j in range(17)],.00155)
        # The photograph shows the bail on the two riveted sections at the front and rear.
        for sy in (-1,1):
            posys=sy*.052
            verts=[pos(a,posys,b)for a,b in [(-.016,.170),(-.014,.175),(-.006,.181),(-.003,.183),(.003,.183),(.006,.181),(.014,.175),(.016,.170),(.013,.168),(.004,.173),(-.004,.173),(-.013,.168)]]
            self.part('세 개 리벳을 단 초승달형 들손 브래킷',verts,[tuple(range(len(verts)))],'silver')
            for dx,h in [(-.012,.172),(.012,.172),(0,.178)]:
                wire('브래킷 둥근 리벳',[(dx,posys,h),(dx,posys+sy*.0016,h)],.00145,'steel')
            wire('들손을 고정하는 돌기',[(0,sy*.050,.183),(0,sy*.0568,.183)],.0026)
        if not opened:
            wire('세워 놓은 반원형 들손',[(0,.0565*cos(j*pi/32),.182+.146*sin(j*pi/32)) for j in range(33)],.00135)
        else:
            wire('옆으로 눕힌 들손',[(-.118*sin(j*pi/32),.0565*cos(j*pi/32),.182+.024*sin(j*pi/32))for j in range(33)],.00135)
            pivot=Vector(pos(.0608,0,.208));rotation=Matrix.Translation(pivot) @ Matrix.Rotation(1.65,4,'Y') @ Matrix.Translation(-pivot)
            for ob in lidparts:ob.data.transform(rotation)
            # An arched internal strainer panel has real perforations, visible through the open lid.
            zs=[.130+i*.009 for i in range(7)];ys=[-.0115,0,.0115];verts=[];faces=[]
            for h in zs:
                for yy in ys:
                    start=len(verts);r=.0034
                    for radius in [None,r]:
                        for j in range(12):
                            a=2*pi*j/12;cy,cz=cos(a),sin(a)
                            scale=1/max(abs(cy),abs(cz))
                            dy=cy*(.00575*scale if radius is None else radius);dz=cz*(.0045*scale if radius is None else radius)
                            py=yy+dy;xoff=-.0468+.0034*((py/.02)**2)
                            verts.append(pos(xoff,py,h+dz))
                    for j in range(12):faces.append((start+j,start+(j+1)%12,start+12+(j+1)%12,start+12+j))
            self.part('주둥이 안쪽 21공 거름판',verts,faces,'steel')
            self.cap('거름판 위쪽 반달 받침',[pos(-.043+.0002*i,-.025+i*.002,.196) for i in range(25)]+
                [pos(-.043+.016*sin(pi*i/24),.023-i*.002,.196) for i in range(25)],.00085,'silver')

    def mug(self,x,y,z):
        pos=lambda a,b,c:(x+a,y+b,z+c)
        self.lathe('티타늄 싱글 450 · 테이퍼 몸통과 말린 입술',(x,y,z),[(.034,.0005),(.039,.0005),(.040,.002),(.0403,.006),
          (.0415,.086),(.0422,.0886),(.043,.0900),(.0430,.0912),(.0421,.0920),(.0408,.0918),(.0405,.09),(.0393,.0057),(.0355,.0037)],'tin',48,'mug')
        for shift in (-.007,.007):
            pts=[(.040,shift,.077),(.047,shift,.077),(.053,shift,.080),(.064,shift,.080),(.071,shift,.077),(.073,shift,.070),(.072,shift,.063),
                (.069,shift,.052),(.059,shift,.035),(.052,shift,.026),(.046,shift,.024),(.040,shift,.024)]
            self.tube('티타늄 머그의 접이식 곡선 손잡이',[pos(*p) for p in pts],.00165,'silver',7)
        for h in (.024,.077):
            self.tube('접힌 손잡이 피벗', [pos(.0408,-.010,h),pos(.0408,.010,h)],.0027,'tin',8)
        return

    def lantern(self,x,y,z):
        p=x,y,z
        # Bottom of the lamp to top of its raised bail is .250 m.
        self.lathe('아이보리 배터리 베이스',p,[(.0275,0),(.0298,.0015),(.0310,.0035),(.0310,.062),(.0318,.067),(.037,.069)],'ivory',40)
        self.lathe('반투명한 PC 확산통',p,[(.033,.065),(.039,.070),(.041,.078),(.0415,.082),(.044,.085),(.0455,.171),(.0450,.177),(.0430,.181)],'light',48)
        self.lathe('우산형 디퓨저 갓과 물방울 테두리',p,[(.043,.178),(.0608,.180),(.0620,.1824),(.0612,.184),(.042,.1883),(.034,.191),
            (.033,.197),(.032,.199),(.021,.1994)],'ivory',48)
        a=.84
        for sy in (-1,1):
            self.tube('확산통 아래 철제 손잡이 피벗',[(x-sy*d*sin(a),y+sy*d*cos(a),z+.081)for d in (.040,.046)],.0028,'silver',8)
        points=[(0,-.044,.081),(0,-.047,.085),(0,-.0475,.092),(0,-.0475,.230),(0,-.0465,.238),
          (0,-.044,.242),(0,-.039,.244),(0,-.010,.244),(0,-.004,.246),(0,-.001,.248),(0,.002,.248),
          (0,.006,.246),(0,.011,.244),(0,.039,.244),(0,.045,.242),(0,.0475,.237),(0,.0475,.090),(0,.0465,.085),(0,.044,.081)]
        # Turn the bail partly towards the public aisle so its shape reads against the diffuser.
        for key,(dx,dy,h) in enumerate(points):points[key]=(x+dx*cos(a)-dy*sin(a),y+dx*sin(a)+dy*cos(a),z+h)
        self.tube('중앙 걸림 홈이 있는 각형 행어',points,.00145,'silver',8)
        # A low oval key and three inset indicator windows are on the body.
        pts=[(x+.0015+.008*cos(j*pi/9),y-.0311,z+.051+.0037*sin(j*pi/9))for j in range(18)]
        self.part('전원과 밝기 버튼',pts,[tuple(range(18))],'honey')
        for j in range(3):
            pts=[(x+.014+.0011*cos(i*pi/6),y-.0283,z+.054-j*.004+.0011*sin(i*pi/6)) for i in range(12)]
            self.part('세 점 충전 표시',pts,[tuple(range(12))],'ivory')
