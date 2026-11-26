"""Hand-modelled porcelain bonbonnière; the removable figure and hollow cushion base stay editable."""
from math import sin,cos,pi,sqrt,atan2
from pathlib import Path
import sys,subprocess,tempfile
from mathutils import Matrix,Vector
import bpy
OUT=Path(__file__).resolve().parent
NAME='RoyalPrincessPea'
FRAME=Matrix.Translation((.115,-.213,.8985))
TAU=pi*2
def uv(row,u=.5,v=.5):
    if isinstance(row,str):
        k=int(row[1:]);return ((k+.5)/16,.0625)
    return (min(.9998,max(.0002,u)),1-(row+.015+min(.97,max(0,1-v)))/8)
class Glaze:
    def __init__(self,col,frame):
        self.col=col;self.frame=frame;self.section='Base'
        self.mat=bpy.data.materials.new(NAME+' enamel');self.mat.use_nodes=True
        tree=self.mat.node_tree;bs=tree.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.23;bs.inputs['Clearcoat'].default_value=.35;bs.inputs['Clearcoat Roughness'].default_value=.14
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['node',str(OUT/'figurine_paint.mjs'),d],check=True)
            fn=Path(d)/'figurine-enamel.png';im=bpy.data.images.load(str(fn));im.pack();im.filepath='//'+fn.name
        t=tree.nodes.new('ShaderNodeTexImage');t.image=im;tree.links.new(t.outputs['Color'],bs.inputs['Base Color'])
    def mesh(self,n,vs,fs,row,uvs=None,smooth=True):
        me=bpy.data.meshes.new(n);me.from_pydata(vs,[],fs);me.update()
        ob=bpy.data.objects.new(n,me);self.col.objects.link(ob);ob.matrix_world=self.frame.copy();ob['retailPackage']='RoyalPea';ob['bonbonnierePart']=self.section;me.materials.append(self.mat)
        layer=me.uv_layers.new(name='Overglaze painting')
        for i,f in enumerate(me.polygons):
            f.use_smooth=smooth
            for j,li in enumerate(f.loop_indices):
                u,v=uvs[i][j]if uvs else (.5,.5);layer.data[li].uv=uv(row,u,v)
        return ob
    def rings(self,n,profiles,row,nv=64,uvstart=0,smooth=True,caps=True):
        strips=[[(x,y,z)for x,y,z in profile]for profile in profiles];vs=sum(strips,[]);fs=[];uvs=[]
        for i in range(len(strips)-1):
            v=i/(len(strips)-1);w=(i+1)/(len(strips)-1)
            for j in range(nv):
                k=(j+1)%nv;a=i*nv;fs.append((a+j,a+k,a+k+nv,a+j+nv))
                u=j/nv;z=(j+1)/nv;uvs.append(((u,v),(z,v),(z,w),(u,w)))
        if caps:
            fs.extend([tuple(range(nv-1,-1,-1)),tuple((len(strips)-1)*nv+j for j in range(nv))])
            uvs.extend([[(.5,.01)]*nv,[(.5,.99)]*nv])
        return self.mesh(n,vs,fs,row,uvs,smooth)
    def round(self,n,profile,row,nv=48,k=1,twist=0):
        rows=[]
        for z,rx,ry,cy in profile:
            rowv=[]
            for j in range(nv):
                a=TAU*j/nv-pi/2;v=cos(a);w=sin(a);x=(1 if v>=0 else -1)*abs(v)**k*rx;y=(1 if w>=0 else -1)*abs(w)**k*ry
                rowv.append((x*cos(twist)-y*sin(twist),cy+x*sin(twist)+y*cos(twist),z))
            rows.append(rowv)
        return self.rings(n,rows,row,nv)
    def ell(self,n,center,r,row,angle=0,seg=20):
        x,y,z=center;rx,ry,rz=r;rows=[]
        for i in range(13):
            b=-pi*.5+.001+i*(pi-.002)/12;line=[]
            for j in range(seg):
                a=TAU*j/seg-pi/2;u=rx*cos(a)*cos(b);v=ry*sin(a)*cos(b)
                line.append((x+u*cos(angle)-v*sin(angle),y+u*sin(angle)+v*cos(angle),z+rz*sin(b)))
            rows.append(line)
        return self.rings(n,rows,row,seg)
    def tube(self,n,path,r,row,sides=9):
        cv=[Vector(v)for v in path];rows=[];axis=None
        for i,p in enumerate(cv):
            tangent=(cv[min(i+1,len(cv)-1)]-cv[max(i-1,0)]).normalized()
            if axis is None:axis=tangent.cross(Vector((0,0,1))if abs(tangent.z)<.8 else Vector((0,1,0))).normalized()
            else:axis=(axis-tangent*axis.dot(tangent)).normalized()
            up=tangent.cross(axis).normalized();rad=r[i]if isinstance(r,list)else r
            rows.append([tuple(p+rad*(axis*cos(TAU*j/sides)+up*sin(TAU*j/sides)))for j in range(sides)])
        return self.rings(n,rows,row,sides)
    def base(self):
        # An octagonal recessed plinth. Lower edges lift into shallow arches between its feet.
        rows=[];n=96
        for z,r,arch in [(0,.13,.013),(.003,.13,.013),(.008,.129,.011),(.018,.129,.003),(.022,.128,0),(.024,.126,0),(.061,.092,0),(.070,.089,0)]:
            pts=[]
            for j in range(n):
                fac=(j%12)/12;ang=TAU*(j//12)/8-pi*.375;b=ang+pi/4
                x=((1-fac)*cos(ang)+fac*cos(b))*r;y=((1-fac)*sin(ang)+fac*sin(b))*r
                pts.append((x,y,z+arch*sin(pi*fac)**.75))
            rows.append(pts)
        self.rings('팔각 받침의 금박 아치와 뿌리',rows[:5],'s1',n,smooth=False)
        self.rings('여덟 면에 회화가 있는 도자기 받침',rows[4:],0,n,smooth=False)
        for idx,(z,r)in enumerate([(.019,.129),(.023,.127),(.061,.092),(.068,.090)]):
            ps=[(x,y,z)for x,y,h in rows[4 if idx<2 else -1]]
            ps=[(x*r/(.128 if idx<2 else .089),y*r/(.128 if idx<2 else .089),h)for x,y,h in ps]
            self.tube('금장 받침의 띠',ps+[ps[0]],.00125,'s1',7)
        for j in range(5):
            # The top cushion comes off with the figure, as on the museum example.
            self.section='Lid' if j==4 else 'Base'
            z=.067+j*.029;r=.098-j*.0039;rot=(-.1+.077*j)*(-1)**j;n=64;rs=[]
            for h,sz in [(0,.77),(.003,.88),(.009,.98),(.017,1),(.023,.93),(.029,.79),(.031,.67)]:
                pts=[]
                for i in range(n):
                    a=TAU*i/n-pi/2;ca,sa=cos(a),sin(a);cx=(1 if ca>=0 else -1)*abs(ca)**.65*r*sz;cy=(1 if sa>=0 else -1)*abs(sa)**.65*r*sz
                    lift=.0029*cos(4*a+1.9*j)+.0013*cos(7*a+j)
                    pts.append((cx*cos(rot)-cy*sin(rot),cx*sin(rot)+cy*cos(rot),z+h+lift))
                rs.append(pts)
            self.rings('채색 방석 %d'%(j+1),rs,1+j%4,n,caps=j!=3)
            for k in range(4):
                a=pi/4+k*pi/2+rot;x=r*.88*cos(a)/.707;y=r*.88*sin(a)/.707
                self.tube('금사 태슬 고리',[(x*.91,y*.91,z+.018),(x*.98,y*.98,z+.016),(x,y,z+.010)],.00095,'s1')
                self.tube('원뿔형 금박 태슬',[(x,y,z+.010),(x,y,z+.008),(x*1.012,y*1.012,z-.002)], [.0014,.0020,.0035],'s15',12)
        self.section='Base'
        lip=[(.181,.069,.069),(.184,.067,.067),(.185,.061,.061),(.182,.057,.057),(.150,.053,.053),(.142,.045,.045),(.139,.001,.001)]
        self.rings('안쪽이 빈 보석함의 금박 입술',[[(rx*cos(TAU*j/64),ry*sin(TAU*j/64),z)for j in range(64)]for z,rx,ry in lip],'s1',64,caps=False)
    def lid(self):
        self.section='Lid'
        # The fluted ivory petticoat shows in the open front of the outer brocade.
        gown=[]
        for z,rx,ry,cy in [(.203,.059,.054,0),(.211,.068,.060,0),(.222,.072,.066,-.002),(.241,.069,.061,-.003),(.268,.053,.043,0),(.287,.039,.030,.001),(.304,.031,.024,.002),(.322,.025,.017,0)]:
            line=[]
            for i in range(64):
                a=TAU*i/64-pi/2;pleat=1+.046*cos(18*a+z*16)+.028*cos(11*a-z*25)
                line.append((rx*pleat*cos(a),cy+ry*pleat*sin(a),z+.0017*cos(10*a)))
            gown.append(line)
        self.rings('진주빛 주름 속치마',gown,'s7')
        profile=[(.208,.072,.065,.85),(.216,.077,.070,.84),(.230,.077,.068,.68),(.249,.067,.058,.59),(.269,.054,.044,.50),(.285,.050,.037,.42),(.304,.042,.028,.39),(.322,.032,.020,.34),(.328,.018,.014,.40)]
        cape=[];faces=[];coords=[];nv=56
        for j,(z,rx,ry,gap)in enumerate(profile):
            row=[]
            for i in range(nv+1):
                f=i/nv;a=-pi/2+gap+(TAU-2*gap)*f;fold=1+.037*cos(12*a+z*22)
                row.append((rx*cos(a)*fold,ry*sin(a)*fold,z+.004*(1-cos(a+pi/2))+.0016*cos(9*a)))
            cape.append(row)
        for j in range(len(cape)-1):
            for i in range(nv):
                n=j*(nv+1)+i;faces.append((n,n+1,n+nv+2,n+nv+1))
                u=i/nv;v=j/(len(cape)-1);s=(i+1)/nv;t=(j+1)/(len(cape)-1);coords.append(((u,v),(s,v),(s,t),(u,t)))
        self.mesh('꽃넝쿨이 채색된 먹빛 겉옷',sum(cape,[]),faces,5,coords)
        for edge in [0,-1]:
            path=[line[edge]for line in cape]
            self.tube('망토의 연지빛 안감',path,.0025,'s8')
            self.tube('금실 테두리',[(x*1.018,y*1.013,z+.0005)for x,y,z in path],.00075,'s1')
        self.tube('양어깨에 둘러진 뒤쪽 깃',cape[-1],.0028,'s8')
        self.round('목과 여밈',[(.320,.012,.012,0),(.329,.011,.010,-.001),(.341,.009,.009,-.005)],'s3',32)
        for side in [-1,1]:
            self.tube('양옆에 떨어지는 소매',[(side*.022,0,.323),(side*.027,-.006,.311),(side*.029,-.012,.300),(side*.026,-.020,.295)], [.010,.010,.008,.0065],5,18)
            self.tube('황금빛 소맷단',[(side*.026,-.019,.295),(side*.025,-.021,.296)],.007,'s1',16)
            self.tube('턱으로 올라오는 팔',[(side*.025,-.021,.296),(side*.022,-.024,.301),(side*.014,-.028,.314),(side*.010,-.028,.323)], [.0057,.0058,.0047,.0033],'s3',16)
            self.ell('포개진 손바닥',(side*.0075,-.028,.3265),(.0052,.0036,.0068),'s3',seg=16)
            for f in range(4):
                dx=f*.00165;z=.327+.0008*(2-abs(1-f))
                self.tube('턱 아래 가는 손가락',[(side*(.0088-dx),-.030,z),(side*(.008-dx*.86),-.0313,z+.0048),(side*(.0052-dx*.50),-.0294,z+.0088-.0008*abs(f-1))], [.00125,.00125,.00068],'s3',8)
        self.round('볼과 이마를 빚은 얼굴',[(.332,.003,.004,-.011),(.335,.007,.0075,-.010),(.341,.012,.011,-.008),(.350,.0155,.0142,-.0066),(.360,.016,.015,-.005),(.369,.014,.014,-.003),(.375,.011,.011,-.002)],'s3',48)
        for side in [-1,1]:
            self.ell('귀',(side*.015,-.005,.3515),(.0026,.0033,.005),'s3',seg=14)
            ex=side*.0069
            def eyelid(dx):return -.0066-.0142*sqrt(max(.07,1-(dx/.0155)**2))-.00022
            xs=[ex+side*d for d in [-.0034,-.0015,.0008,.0030]]
            self.tube('짙은 붓끝의 눈매',[(x,eyelid(x),.3524+.00052*sin(pi*j/3)+j*.00018)for j,x in enumerate(xs)],[.00028,.00048,.00053,.00022],'s5',8)
            self.tube('얇은 눈썹',[(x,eyelid(x)+.00015,.3553+.0006*sin(pi*j/3)+j*.00018)for j,x in enumerate(xs)],[.00019,.00038,.00034,.00012],'s13',8)
        self.tube('콧대와 코끝',[(0,-.0195,.354),(0,-.0206,.350),(0,-.0224,.347),(0,-.0226,.3458)],[.0013,.00135,.0020,.00115],'s3',14)
        self.tube('연지 입술',[(-.0025,-.0192,.342),(-.0007,-.0200,.3418),(0,-.0201,.34165),(.0010,-.0199,.3419),(.0026,-.0192,.3421)],[.00028,.00062,.00065,.00054,.00022],'s6',9)
        # The white front and red silk-like back meet at a piped side seam.
        hat=[(.359,.0174,.0150,-.002),(.367,.0188,.0172,-.001),(.376,.0181,.0169,.0015),(.389,.0160,.0171,.007),(.404,.0137,.0155,.014),(.415,.0097,.0121,.019),(.4208,.0048,.0071,.0235),(.423,.0028,.0025,.027)]
        self.round('치켜올린 진주빛 관모 앞면',hat,'s7',56)
        shell=[];width=36
        for z,rx,ry,off in hat:
            line=[]
            for j in range(width+1):
                a=-.08+(pi+.16)*j/width;flute=1+.025*sin(7*a+z*35)
                line.append((rx*1.035*cos(a)*flute,off+ry*1.045*sin(a)*flute,z+.00022))
            shell.append(line)
        vs=sum(shell,[]);fs=[];uvs=[]
        for i in range(len(shell)-1):
            for j in range(width):
                k=i*(width+1)+j;fs.append((k,k+1,k+width+2,k+width+1))
                u=j/width;v=i/(len(shell)-1);a=(j+1)/width;b=(i+1)/(len(shell)-1);uvs.append(((u,v),(a,v),(a,b),(u,b)))
        self.mesh('점박이 산호빛 관모의 부푼 뒷면',vs,fs,6,uvs)
        self.ell('관모 정수리 흑진주',(0,.028,.424),(.0035,.0045,.0042),'s5',seg=16)
        for side in [-1,1]:
            edge=[line[0 if side==1 else -1]for line in shell]
            start=(side*.0151,-.0030,.341);arc=[start,(side*.0173,-.007,.344),(side*.0185,-.006,.350),(side*.0177,-.004,.359)]+edge[1:]
            self.tube('관모 옆 테두리의 흰 직물',arc,.00195,'s0')
            self.tube('관모 옆 솔기의 코발트 띠',[(x*1.06,y+.001,z)for x,y,z in arc],.00065,'s12')
            self.ell('빰 옆으로 내려온 산호색 귀 장식',(side*.0159,-.005,.3495),(.00135,.0062,.0095),6,seg=20)
            eyelet=[(side*.0171,-.002,.360),(side*.016,-.010,.362),(side*.014,-.011,.375),(side*.010,-.010,.389),(side*.006,-.011,.383),(0,-.0135,.381)]
            self.tube('이마 옆의 백금 진주 줄',eyelet,.00062,'s7',8)
            for b in range(len(eyelet)-1):
                p0=Vector(eyelet[b]);p1=Vector(eyelet[b+1])
                steps=max(1,round((p1-p0).length/.0026))
                for j in range(steps):
                    at=p0.lerp(p1,j/steps);self.ell('도자기 진주 알',at,(.00097,)*3,'s0',seg=8)
            self.tube('목덜미의 흰 머리',[(side*.013,.001,.346),(side*.012,.003,.341),(side*.012,.004,.334)], [.003,.003,.0014],'s7',12)
        self.ell('이마에 붙인 푸른 보석',(0,-.0136,.3807),(.0015,.0008,.0021),'s12',seg=10)
def make(col,frame=FRAME):
    artist=Glaze(col,frame);artist.base();artist.lid()
