"""Customer's meal of minced pork, fried aubergine and rice at Ho Kyung Jeon.

Dimensions are in metres. The white plate and servings form one table setting;
the side dishes occupy the edge of the table away from the seated guest.
"""
from math import atan2,cos,exp,pi,sin,sqrt
from pathlib import Path
from random import Random
import subprocess,tempfile
import bpy
from mathutils import Matrix,Vector
OUT=Path(__file__).resolve().parent
WEDGES=[
    (-.010,.072,-.41,.053,.032,.018,True),(.027,.077,.83,.043,.033,.021,True),
    (.055,.058,-.23,.060,.024,.020,False),(.080,.031,1.13,.066,.031,.023,False),
    (.090,-.010,-1.13,.065,.029,.022,True),(.065,-.048,.32,.050,.034,.025,False),
    (.061,-.077,.48,.066,.027,.018,False),(.022,-.058,1.26,.066,.033,.024,True),
    (.013,-.011,1.63,.058,.031,.020,False),(-.012,-.067,1.10,.045,.028,.023,True),
    (-.013,.034,-.07,.049,.026,.017,False),(.039,.023,.08,.040,.026,.016,True)]
BATCH='HokyungEggplantRice'
FRAME=Matrix.Translation((-1.83,-.23,.765))@Matrix.Rotation(pi/2,4,'Z')
PORCELAIN,RICE,SAUCE,FLESH,SKIN,GREEN,CHILLI,PORK,STOCK,RADISH,PICKLE,STEEL,BLACK,SCALLION,ONION,TEA=range(16)
def coord(tile,u,v):
    return ((tile%4+.025+.95*max(0,min(1,u)))/4,1-(tile//4+.025+.95*(1-max(0,min(1,v))))/4)
class Food:
    def __init__(self,collection,matrix):
        self.collection=collection;self.placement=matrix;self.random=Random(279118)
        self.surface=bpy.data.materials.new(BATCH);self.surface.use_nodes=True
        tree=self.surface.node_tree;shader=tree.nodes['Principled BSDF']
        with tempfile.TemporaryDirectory()as d:
            subprocess.run(['node',str(OUT/'meal_atlas.mjs'),d],check=True)
            for filename in ('table-food','table-finish','food-grain'):
                f=Path(d)/(filename+'.png');im=bpy.data.images.load(str(f));im.pack();im.filepath='//'+f.name
                tex=tree.nodes.new('ShaderNodeTexImage');tex.image=im
                if filename=='table-food':
                    colour=tree.nodes.new('ShaderNodeVertexColor');colour.layer_name='Glaze'
                    mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
                    tree.links.new(tex.outputs['Color'],mix.inputs[1]);tree.links.new(colour.outputs['Color'],mix.inputs[2])
                    tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
                else:
                    im.colorspace_settings.name='Non-Color'
                    if filename=='table-finish':
                        sep=tree.nodes.new('ShaderNodeSeparateRGB');tree.links.new(tex.outputs['Color'],sep.inputs[0])
                        tree.links.new(sep.outputs[1],shader.inputs['Roughness']);tree.links.new(sep.outputs[2],shader.inputs['Metallic'])
                    else:
                        normal=tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.66
                        tree.links.new(tex.outputs['Color'],normal.inputs['Color']);tree.links.new(normal.outputs['Normal'],shader.inputs['Normal'])
    def part(self,name,vertices,faces,tiles,smooth=True):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
        ob=bpy.data.objects.new(name,mesh);self.collection.objects.link(ob);ob.matrix_world=self.placement.copy()
        ob['retailPackage']='HokyungMeal';mesh.materials.append(self.surface)
        attr=mesh.color_attributes.new(name='Glaze',type='BYTE_COLOR',domain='POINT')
        for c in attr.data:c.color=(1,1,1,1)
        uv=mesh.uv_layers.new(name='Paint and finish')
        xyz=list(zip(*vertices));bb=[(min(l),max(l)-min(l))for l in xyz]
        for i,f in enumerate(mesh.polygons):
            f.use_smooth=smooth
            axes=(0,1)
            tile=tiles[i]if isinstance(tiles,list)else tiles
            for loop,idx in zip(f.loop_indices,f.vertices):
                p=vertices[idx];a,b=axes;uv.data[loop].uv=coord(tile,(p[a]-bb[a][0])/max(bb[a][1],.0001),(p[b]-bb[b][0])/max(bb[b][1],.0001))
        return ob
    def lathe(self,name,cx,cy,profile,tile,n=80):
        vs=[];fs=[]
        for rad,z in profile:
            for j in range(n):
                a=j*2*pi/n;vs.append((cx+rad*cos(a),cy+rad*sin(a),z))
        for r in range(len(profile)-1):
            for j in range(n):
                a=r*n+j;b=r*n+(j+1)%n;fs.append((a,b,b+n,a+n))
        return self.part(name,vs,fs,tile)
    def food_disc(self,name,cx,cy,loops,tile,n=72):
        vs=[(cx,cy,loops[0][1])];fs=[]
        for r,h in loops[1:]:
            for j in range(n):vs.append((cx+r*cos(2*pi*j/n),cy+r*sin(2*pi*j/n),h))
        fs.extend((0,1+j,1+(j+1)%n)for j in range(n))
        for k in range(len(loops)-2):
            a=1+k*n;b=a+n
            fs.extend((a+j,b+j,b+(j+1)%n,a+(j+1)%n)for j in range(n))
        self.part(name,vs,fs,tile)
    def crockery(self):
        self.lathe('백자 · 오목한 덮밥 접시',0,-.018,[(.0001,.0038),(.061,.0038),(.063,.0015),(.067,.0015),(.068,.006),(.099,.011),(.126,.023),(.142,.031),(.143,.033),(.141,.0345),(.130,.0305),(.113,.020),(.081,.010),(.055,.0084),(.0001,.0084)],PORCELAIN,112)
        for name,x,y,r,height in [('맑은 국 잔',.182,.002,.048,.040),('단무지 종지',-.087,.150,.044,.019),('짜사이 종지',.019,.153,.045,.021)]:
            self.lathe(name,x,y,[(.0001,.002),(.48*r,.002),(.53*r,.003),(.66*r,.014 if height>.03 else .006),(r,height-.002),(r+.0005,height),(.965*r,height+.0004),(.80*r,height*.69),(.57*r,.007),(.0001,.005)],PORCELAIN,76)
        self.food_disc('맑은 황금빛 육수',.182,.002,[(0,.032),(.033,.032),(.041,.0322),(.0424,.0327)],STOCK)
    def oval_data(self,verts,faces,tiles,cx,cy,z,rx,ry,rz,theta,tile,noise=0,n=8):
        start=len(verts);s,c=sin(theta),cos(theta)
        for ring in range(5):
            ang=-pi*.5+pi*ring/4
            for j in range(n):
                a=2*pi*j/n;f=1+noise*self.random.uniform(-1,1)
                x=rx*cos(ang)*cos(a)*f;y=ry*cos(ang)*sin(a)*f
                verts.append((cx+c*x-s*y,cy+s*x+c*y,z+rz*sin(ang)*f))
        for k in range(4):
            for j in range(n):
                i=start+k*n+j;nj=start+k*n+(j+1)%n;faces.append((i,nj,nj+n,i+n));tiles.append(tile)
    def oval_group(self,name,shapes,n=8):
        vs=[];fs=[];ts=[]
        for one in shapes:self.oval_data(vs,fs,ts,*one,n=n)
        if vs:self.part(name,vs,fs,ts)
    def boundary(self,y):
        return -.032+.008*sin(y*55+.7)+.005*sin(y*118)
    def rice_z(self,x,y):
        taper=max(0,min(1,(self.boundary(y)+.020-x)/.034))
        radial=sqrt(max(0,1-(x/.117)**2-(y/.107)**2))
        plate=.009+max(0,sqrt(x*x+y*y)-.071)*.27
        return plate+.0175*taper*radial+.0015*radial*sin(x*90+y*34)
    def pool(self,x,y):
        return .0164+.005*max(0,1-((x-.024)/.13)**2-(y/.126)**2)+.0013*sin(85*x+11*y)+.0010*cos(131*y-31*x)
    def sauce_z(self,x,y):
        cling=0
        for cx,cy,angle,length,width,height,skin in WEDGES:
            dx=x-cx;dy=y-cy;u=dx*cos(angle)+dy*sin(angle);v=dy*cos(angle)-dx*sin(angle)
            cling=max(cling,height*.40*exp(-((u/(length*.59))**4+(v/(width*.70))**4)))
        return self.pool(x,y)+cling
    def servings(self):
        ox,oy=0,-.018
        vx=[];fs=[];rows,cols=56,33
        for kind in ('rice','sauce'):
            verts=[];faces=[]
            for j in range(rows+1):
                phi=(j/rows-.5)*pi*.983;y=(.101 if kind=='rice'else .109)*sin(phi)
                span=(.116 if kind=='rice'else .117)*cos(phi);split=self.boundary(y)
                if kind=='rice':a,b=-span,min(span,split+.015)
                else:a,b=max(-span,split-.009+.003*sin(y*228)+.002*cos(y*520)),span
                if a>b:
                    if kind=='rice':b=a
                    else:a=b
                for i in range(cols+1):
                    x=a+(b-a)*i/cols;z=self.rice_z(x,y)if kind=='rice'else self.sauce_z(x,y)
                    verts.append((x+ox,y+oy,z))
            for j in range(rows):
                for i in range(cols):
                    k=j*(cols+1)+i;faces.append((k,k+1,k+cols+2,k+cols+1))
            # Fold the visible outer edge down into the porcelain so the rice and
            # gravy do not read as two suspended wafers in a low walking view.
            border=list(range(cols+1))+[j*(cols+1)+cols for j in range(1,rows+1)]+[rows*(cols+1)+i for i in range(cols-1,-1,-1)]+[j*(cols+1)for j in range(rows-1,0,-1)]
            start=len(verts)
            for idx in border:
                xx,yy,zz=verts[idx];rr=sqrt(xx*xx+(yy-oy)**2)
                verts.append((xx*.985,oy+(yy-oy)*.985,.008+max(0,rr-.071)*.23))
            for j,k in enumerate(border):
                l=(j+1)%len(border);faces.append((k,start+j,start+l,border[l]))
            self.part('밥알 아래 찐쌀'if kind=='rice'else '윤기 나는 볶음 소스',verts,faces,RICE if kind=='rice'else SAUCE)
        # Individual grains are arranged in loose clumps across the exposed crescent.
        for band in range(9):
            grains=[]
            for j in range(6):
                y=-.099+(band*6+j)*.0038
                if abs(y)>=.100:continue
                limit=.115*sqrt(max(0,1-(y/.102)**2))
                x=-limit+.0015
                while x<min(limit,self.boundary(y)+.003):
                    px=x+self.random.uniform(-.0017,.0017);py=y+self.random.uniform(-.0019,.0019)
                    grains.append((px,py+oy,self.rice_z(px,py)+self.random.uniform(.0001,.0018),
                        self.random.uniform(.00225,.00365),self.random.uniform(.00122,.00172),self.random.uniform(.00105,.00155),
                        .35*sin(px*52+py*77)+self.random.uniform(-1.5,1.5),RICE,.13))
                    x+=self.random.uniform(.0031,.0049)
            self.oval_group('쌀알 · 열 %02d'%(band+1),grains,n=6)
        rim=[]
        for i in range(108):
            y=self.random.uniform(-.093,.091);x=self.boundary(y)+self.random.uniform(-.011,.006)
            rim.append((x,y+oy,max(self.rice_z(x,y),self.sauce_z(x,y))+.0008,.0028,.0014,.0012,self.random.uniform(-pi,pi),RICE if i%4==0 else ONION,.14))
        self.oval_group('밥과 양념 사이 배어든 쌀알',rim,n=6)
        self.wedges()
        groups={'볶은 간 돼지고기':[],'홍고추와 피망':[],'다진 마늘과 대파':[]}
        for i in range(550):
            y=self.random.uniform(-.102,.102);x=self.random.uniform(-.040,.114)
            if (x/.113)**2+(y/.103)**2>1 or x<self.boundary(y)+.001:continue
            z=self.sauce_z(x,y)+.001
            if i%4 in (0,1):name='볶은 간 돼지고기';tile=PORK;r=self.random.uniform(.0011,.0032)
            elif i%4==2:name='홍고추와 피망';tile=GREEN if i%9<7 else CHILLI;r=self.random.uniform(.0024,.0062)
            else:name='다진 마늘과 대파';tile=ONION if i%9<5 else SCALLION;r=self.random.uniform(.0014,.0028)
            if name=='홍고추와 피망':
                self.dice(name,x,y+oy,z,r*.82,r*1.07,r*.64,self.random.uniform(-pi,pi),tile)
            else:groups[name].append((x,y+oy,z,r,r*self.random.uniform(.58,1),r*.62,self.random.uniform(-pi,pi),tile,.23))
        for name,shapes in groups.items():self.oval_group(name,shapes,n=7)
    def dice(self,name,x,y,z,rx,ry,rz,angle,tile):
        c,s=cos(angle),sin(angle)
        profile=[(-.73,-1),(.67,-1),(1,-.68),(.92,.68),(.63,1),(-.74,.93),(-1,.62),(-1,-.73)]
        verts=[];faces=[];n=len(profile)
        for level,sz in [(0,.79),(.2,1),(.77,.98),(1,.74)]:
            for a,b in profile:
                u=a*rx*sz;v=b*ry*sz;verts.append((x+u*c-v*s,y+u*s+v*c,z+level*rz))
        for k in range(3):
            for j in range(n):faces.append((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j))
        faces.append(tuple(3*n+k for k in range(n)));self.part(name,verts,faces,tile,False)
    def wedges(self):
        # Each wedge has an irregular curved purple skin and two separate golden cut faces.
        # Fractions follow the photographed arrangement on the right of the white plate.

        for index,(x,y,angle,length,width,height,skinup)in enumerate(WEDGES):
            c,s=cos(angle),sin(angle);verts=[];faces=[];tiles=[]
            # Around a transverse slice, the skin traces the rounded outer shoulder.
            if skinup:
                section=[(-.95,-.47),(-1,-.16),(-.91,.37),(-.63,.81),(-.16,1),(.27,.94),(.65,.67),(.94,.28),(1,-.09),(.69,-.31),(.20,-.53),(-.40,-.63)]
                peel=set(range(1,8))
            else:
                section=[(-.91,-.44),(-1,.05),(-.87,.53),(-.63,.73),(-.38,.83),(.02,.95),(.41,.76),(.71,.59),(.96,.24),(.82,-.16),(.29,-.53),(-.26,-.62)]
                peel={0,1,2,8,9,10,11}
            n=len(section);m=15
            for i in range(m):
                u=i/(m-1);l=(u-.5)*length
                size=(.27+.73*sin(pi*u)**.64)*(1+.13*sin(7*u+index))
                bend=.18*width*sin(pi*u+index*.38);lift=.16*height*sin(pi*u+index)
                for j,(a,b)in enumerate(section):
                    imper=.035*sin(1.44*j+u*13+index)+.026*sin(3.1*j-u*17)
                    v=(a+imper)*width*.5*size+bend
                    shift=length*.12*(2*u-1)*(b*.59-a*.38)*abs(2*u-1)**3
                    h=self.pool(x,y)-.0018+lift+(b+.48+imper)*height*.65*size
                    verts.append((x+(l+shift)*c-v*s,y-.018+(l+shift)*s+v*c,h))
            for i in range(m-1):
                for j in range(n):
                    k=i*n+j;nxt=i*n+(j+1)%n
                    faces.append((k,k+n,nxt+n,nxt));tiles.append(SKIN if j in peel else FLESH)
            faces.extend([tuple(range(n)),tuple((m-1)*n+i for i in range(n-1,-1,-1))]);tiles.extend([FLESH,FLESH])
            wedge=self.part('튀긴 가지 %02d · 껍질과 단면'%(index+1),verts,faces,tiles)
            colours=wedge.data.color_attributes['Glaze']
            stuck=[]
            for num,(vx,vy,vz) in enumerate(verts):
                u=(num//n)/(m-1);j=num%n;a,b=section[j]
                film=min(1,max(0,.29+.29*sin(index*.8+u*10+a*2)+.23*sin(index*.3+u*18+a*4)+.12*cos(u*27+b*5)))
                lower=max(0,min(1,(.18-b)*1.5))
                colours.data[num].color=(1-.26*film-.09*lower,1-.54*film-.15*lower,1-.63*film-.21*lower,1)
                if b>.53 and 1<num//n<m-2 and self.random.random()<.115:
                    grain=self.random.uniform(.00065,.0020)
                    stuck.append((vx,vy,vz+.0005,grain*1.5,grain,grain*.7,self.random.uniform(-pi,pi),PORK if self.random.random()<.64 else ONION,.27))
            self.oval_group('소스에 붙은 마늘과 돼지고기',stuck,n=6)
            glaze=[]
            for segment in range(6):
                column=3+segment
                row=3 if skinup else 6
                v=verts[column*n+row];glaze.append((v[0],v[1],v[2]+.0003))
            self.ribbon('가지를 타고 흐른 볶음 양념',glaze,lambda u:.00042+.00078*sin(pi*u),TEA,7,.45)
    def ribbon(self,name,path,radius,tile,n=8,flat=1):
        verts=[];faces=[]
        for i,p in enumerate(path):
            rr=radius(i/(len(path)-1))if callable(radius)else radius
            t=(Vector(path[min(len(path)-1,i+1)])-Vector(path[max(0,i-1)])).normalized()
            ref=Vector((0,0,1))if abs(t.z)<.88 else Vector((1,0,0))
            side=t.cross(ref).normalized();up=side.cross(t).normalized()
            for j in range(n):verts.append(tuple(Vector(p)+rr*(cos(2*pi*j/n)*side+flat*sin(2*pi*j/n)*up)))
        for i in range(len(path)-1):
            for j in range(n):
                a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
        faces.extend([tuple(range(n-1,-1,-1)),tuple((len(path)-1)*n+i for i in range(n))])
        self.part(name,verts,faces,tile)
    def sides(self):
        # Crisp half-moons have a cut edge separate from the rounded radish arc.
        for i,(x,y,a)in enumerate([(-.092,.148,-.3),(-.085,.147,.14),(-.079,.149,.29)]):
            vs=[];fs=[];n=28;c,s=cos(a),sin(a)
            pts=[(.031*cos(-pi*.08+j*pi*1.16/(n-1)),.024*sin(-pi*.08+j*pi*1.16/(n-1))-.008)for j in range(n)]
            for z,k in [(.007+i*.003,.94),(.0078+i*.003,1),(.0103+i*.003,1),(.011+i*.003,.95)]:
                for u,v in pts:vs.append((x+(c*u-s*v)*k,y+(s*u+c*v)*k,z+u*.035))
            for r in range(3):
                for j in range(n):f=r*n+j;fs.append((f,r*n+(j+1)%n,(r+1)*n+(j+1)%n,f+n))
            fs.append(tuple(3*n+j for j in range(n)));self.part('노란 단무지 반달 '+str(i+1),vs,fs,RADISH,False)
        for i in range(27):
            r=self.random;theta=r.uniform(-pi,pi);cx=.019+r.uniform(-.016,.016);cy=.153+r.uniform(-.012,.012)
            length=r.uniform(.016,.042);phase=r.uniform(0,pi*2);e=r.uniform(.003,.007)
            curve=[]
            for j in range(9):
                u=j/8-.5;w=e*sin(u*4.8+phase)
                curve.append((cx+length*u*cos(theta)-w*sin(theta),cy+length*u*sin(theta)+w*cos(theta),
                    .009+.00029*i+.0021*sin(3*u+phase)))
            self.ribbon('짜사이 · 절인 채소',curve,lambda t:.0017+.0016*sin(t*pi)**.65,PICKLE if i%5 else CHILLI,6,.60)
        for cx,cy,angle,size in[(.172,.006,.43,.0025),(.184,-.011,.66,.0032),(.197,.003,-.61,.0019)]:
            pts=[(cx+size*cos(j*.15*pi)*cos(angle)-size*.43*sin(j*.15*pi)*sin(angle),
                cy+size*cos(j*.15*pi)*sin(angle)+size*.43*sin(j*.15*pi)*cos(angle),.0323)for j in range(12)]
            self.ribbon('육수에 뜬 실파',pts,.00055,SCALLION,6,.66)
        for x in [.229,.236]:
            self.ribbon('검은 젓가락',[(x,-.105,.0022),(x-.003,.001,.0024),(x-.006,.108,.0030)],lambda t:.00135+.0016*t,BLACK,8)
        # Polished spoon: separate inner and outer dish, rolled rim and tapered stem.
        vs=[];fs=[];n=36;x=.186;y=-.068
        for r,h in [(.02,.002),(.38,.003),(.65,.005),(.90,.009),(1,.0115),(1,.0123),(.90,.0104),(.59,.0066),(.02,.0043)]:
            for j in range(n):
                a=2*pi*j/n;w=.0145*(1-.14*sin(a));vs.append((x+r*w*cos(a),y+r*.0200*sin(a),h+.0005*r*cos(a)))
        for k in range(8):
            for j in range(n):a=k*n+j;b=k*n+(j+1)%n;fs.append((a,b,b+n,a+n))
        self.part('스테인리스 숟가락 오목한 면',vs,fs,STEEL)
        self.ribbon('숟가락 손잡이',[(x,-.085,.0116),(x+.003,-.106,.008),(x+.014,-.137,.003),(x+.022,-.163,.0036)],lambda t:.0021+.0019*t,STEEL,10,.38)

def make(collection,matrix=None):
    meal=Food(collection,matrix if matrix is not None else Matrix.Identity(4));meal.crockery();meal.servings();meal.sides()
    return meal.surface
