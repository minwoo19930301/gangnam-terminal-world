"""Native bent cutlery, turned porcelain, and lacquered jars for the Gangnam display."""

from math import pi, sin, cos, exp, sqrt, radians
from random import Random
import bpy
import finishes

TAU=2*pi

def clamp(x):return min(1,max(0,x))


class Shop:
    def __init__(self,mesh,block,bar,mat,fixture,gray,green,petal,glass):
        self.mesh,self.block,self.bar=mesh,block,bar
        self.mat,self.fixture,self.gray,self.green,self.petal,self.glass=mat,fixture,gray,green,petal,glass

    def turned(self,name,position,profile,form,n=48,tilt=0):
        """Outward and inward profiles have separate samples on their shared lip."""
        verts=[];faces=[];face_tiles=[];tex=[]
        for row,(r,h,key,t) in enumerate(profile):
            for j in range(n+1):
                u=j/n;a=TAU*u;rad,z=form(r,h,a)
                verts.append((rad*cos(a),rad*sin(a),z));tex.append((u,t))
            if row:
                for j in range(n):
                    a=(row-1)*(n+1)+j
                    faces.append((a,a+1,a+n+2,a+n+1));face_tiles.append(profile[row-1][2])
        faces.extend([tuple(range(n-1,-1,-1)),tuple((len(profile)-1)*(n+1)+j for j in range(n))])
        face_tiles.extend((profile[0][2],profile[-1][2]))
        ob=self.mesh(name,verts,faces,self.mat,True);layer=ob.data.uv_layers.new(name='Craft')
        for poly,key in zip(ob.data.polygons,face_tiles):
            for loop in poly.loop_indices:
                u,v=tex[ob.data.loops[loop].vertex_index]
                layer.data[loop].uv=finishes.uv(key,u,clamp(v))
        ob.location=position;ob.rotation_euler.x=radians(tilt)
        return ob

    def dish(self,kind,x,y,z,tilt=0):
        folded=kind=='접이';melon=kind=='참외'
        radius=.085 if folded else .095 if melon else .12
        height=.037 if folded else .024 if melon else .039
        # Cataloque folded plate has an unglazed, low recessed foot and four
        # pinches whose narrow seams continue down the outside of the wall.
        coords=[(.035,.105),(.28,.105),(.291,.035),(.318,0),(.397,0),(.409,.083),
            (.48,.148),(.57,.206),(.67,.310),(.76,.44),(.84,.59),(.925,.771),
            (.973,.903),(1,.967),(.999,.993),(.989,1),(.973,.983),(.953,.93),
            (.922,.836),(.877,.712),(.806,.563),(.714,.428),(.594,.319),
            (.448,.248),(.281,.199),(.13,.188),(.025,.186)]
        p=[]
        for j,(r,h) in enumerate(coords):
            k='foot' if j<5 else ('clay' if j<15 else 'celadon') if folded else 'ivory'
            p.append((r,h,k,h))
        def form(r,h,a):
            theta=a+.17
            if folded:
                pinch=exp(-(sin(2*theta)/.095)**2)
                broad=cos(4*theta)*.017
                skew=.0022*sin(theta*3+.42)*r**2
                rad=radius*r*(1-.071*pinch*r**1.36+broad*r*r)
                elev=height*(h-.111*pinch*r**1.70)+.0031*cos(4*theta+.68)*r**2+skew
            elif melon:
                petal=exp(-(sin(4.5*theta)/.16)**2)
                rad=radius*r*(1-.031*petal*r*r)
                elev=height*h-.0020*petal*r*r+.0012*cos(9*theta)*r*r
            else:
                rad=radius*r*(1+.005*cos(3*theta)*r);elev=height*h+.00108*sin(2*theta)*r*r
            return rad,elev
        return self.turned({'접이':'청자 네 쪽 접이 접시','참외':'미각 설빛 참외형접시','선':'선 오목 접시'}[kind],(x,y,z),p,form,112 if folded else 90 if melon else 48,tilt)

    def jar(self,x,y,z,height,variant):
        # Match the rounded 2025 studio photograph: broad belly, short folded
        # mouth, slight sloping shoulder and a flat narrow foot, with open neck.
        form=[(.04,.018,'foot'),(.33,.018,'foot'),(.352,0,'foot'),(.404,0,'lacquer'),
              (.423,.016,'lacquer'),(.478,.051,'lacquer'),(.568,.105,'lacquer'),
              (.692,.176,'lacquer'),(.807,.258,'lacquer'),(.901,.352,'lacquer'),
              (.967,.452,'lacquer'),(.996,.535,'lacquer'),(1,.592,'lacquer'),
              (.989,.675,'lacquer'),(.951,.757,'lacquer'),(.886,.830,'lacquer'),
              (.801,.890,'lacquer'),(.692,.938,'lacquer'),(.56,.972,'lacquer'),
              (.455,.986,'lacquer'),(.450,.994,'lacquer'),(.481,1.003,'lacquer'),
              (.482,1.016,'lacquer'),(.474,1.026,'mouth'),(.456,1.032,'mouth'),
              (.402,1.030,'mouth'),(.393,1.021,'mouth'),(.395,.994,'mouth'),
              (.440,.976,'mouth'),(.556,.956,'mouth'),(.696,.912,'mouth'),
              (.784,.852,'mouth'),(.822,.779,'mouth'),(.804,.623,'mouth'),
              (.654,.355,'mouth'),(.345,.144,'mouth'),(.041,.13,'mouth')]
        p=[(r,h,k,h/1.032 if k=='lacquer' else clamp((h-.82)*4) if k=='mouth' else r) for r,h,k in form]
        def shape(r,h,a):
            minor=(.004*cos(3*a+.2*variant)+.0035*sin(2*a+.44+h*2.3))*(1-min(1,abs(h-.57))*.55)
            return height*.497*r*(1+minor),height*(h+.00145*cos(2*a+.5*variant)*r*r)/1.032
        return self.turned('푸른빛 옻칠 원호 '+str(round(100*height)),(x,y,z),p,shape,88)

    def apple(self,x,y,z):
        stages=[[(.06,.08),(.35,.08),(.39,.013),(.48,.015),(.56,.068),(.72,.15),
                 (.86,.27),(.95,.39),(.99,.485),(.976,.503),(.928,.499),(.91,.459),(.80,.29),(.56,.16),(.08,.13)],
                [(.09,.502),(.86,.503),(.973,.511),(.989,.527),(.993,.61),(.958,.713),
                 (.89,.819),(.787,.896),(.65,.956),(.50,.991),(.35,1.011),(.205,.998),(.102,.969)]]
        for j,part in enumerate(stages):
            def shape(r,h,a):
                # Round wide lobes with softly pinched troughs, deep at the
                # shoulder and disappearing into the foot and the top dimple.
                groove=(.5+.5*cos(23*a+.16*sin(pi*h)))**2.7
                intensity=(.04+.84*sin(pi*clamp(h))**.72)*r*r
                return .069*r*(1-.057*intensity*groove),.106*h-.00165*groove*r**2*max(0,h-.56)
            self.turned('미각 사과형 합 '+('뚜껑' if j else '몸체'),(x,y,z),[(r,h,'ivory',h) for r,h in part],shape,138)
        self.turned('미각 사과합 꼭지',(x,y,z+.102),
            [(.0039,0,'ivory',0),(.0041,.004,'ivory',.2),(.0035,.011,'ivory',.7),(.0051,.016,'ivory',.9),(.0042,.0185,'ivory',1)],
            lambda r,h,a:(r*(1+.10*sin(5*a+.2)),h),20)

    def cup(self,x,y,z):
        profile=[(.006,.004,'foot'),(.023,.004,'foot'),(.024,0,'foot'),(.032,0,'clay'),
                 (.035,.004,'clay'),(.036,.015,'clay'),(.0365,.034,'clay'),(.0366,.064,'clay'),
                 (.0368,.088,'clay'),(.0368,.0955,'clay'),(.0366,.0972,'celadon'),
                 (.0352,.0977,'celadon'),(.0339,.0969,'celadon'),(.0336,.092,'celadon'),
                 (.0334,.075,'celadon'),(.0332,.041,'celadon'),(.0325,.017,'celadon'),
                 (.030,.011,'celadon'),(.020,.010,'celadon'),(.003,.010,'celadon')]
        def form(r,h,a):
            # One edge is overlapped like a turned-down collar. The outer
            # seam dwindles at the foot. Its top also pinches the inner lip.
            t=h/.098;theta=a+1.29-.12*t
            fold=exp(-(sin(theta/2)/.035)**2)*clamp((t-.16)/.68)
            lip=r*(1-.047*fold)+.00045*sin(2*a+.2)*t
            return lip,h-.0016*fold*clamp((t-.82)/.18)
        return self.turned('청자 한 쪽 접이 물잔',(x,y,z),[(r,h,k,h/.098) for r,h,k in profile],form,104)

    def clear_counter(self,x,y,z,w,d,bronze):
        def outline(width,depth,rad):
            return [(x+sx*(width/2-rad)+rad*cos((j+i/5)*pi/2),
                     y+sy*(depth/2-rad)+rad*sin((j+i/5)*pi/2))
                    for j,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]) for i in range(6)]
        verts=[];faces=[];n=24
        for inset,h in [(0,.004),(0,.024),(.004,.029),(.023,.029),(.027,.023),(.027,.006)]:
            verts.extend((a,b,z+h) for a,b in outline(w-2*inset,d-2*inset,.064-inset))
        for j in range(6):
            for i in range(n):
                k=(i+1)%n;a=(j+1)%6
                faces.append((j*n+i,j*n+k,a*n+k,a*n+i))
        self.mesh('청동 상판 테',verts,faces,bronze,True)
        glass=self.block('열린 선반 위 유리 상판',x,y,z+.019,w-.042,d-.042,.007,self.glass,.045)
        tint=glass.data.color_attributes.new(name='GlassColour',type='BYTE_COLOR',domain='POINT')
        for i,c in enumerate(tint.data):
            c.color=(.54,.66,.60, .13 if i//20 in (0,3) else .34)

    def cutlery(self,x,y,z,index):
        # A small sloping tray keeps each handle visible from the aisle.
        # Its two feet, front return and slanted linen insert are all editable.
        w,d=.532,.355;ang=radians(19);sa,ca=sin(ang),cos(ang)
        def at(px,py,pz):return (x+px,y+py*ca-pz*sa,z+.069+py*sa+pz*ca)
        def panel(name,px,py,pz,ww,dd,hh,tile):
            ob=self.block(name,0,0,-hh/2,ww,dd,hh,self.mat,.004)
            finishes.assign(ob,self.mat,lambda i,v:(tile,clamp(v.x/ww+.5),clamp(v.y/dd+.5)))
            ob.rotation_euler.x=ang;ob.location=at(px,py,pz)
        for sx in [-1,1]:
            self.block('낮은 경사대 뒷받침',x+sx*(w/2-.035),y+.108,z,.025,.048,.102,self.fixture,.005)
        panel('수저 표본판 · 면 바탕',0,0,0,w,d,.016,'linen')
        panel('경사대 앞턱',0,-d/2+.006,.008,w,.012,.023,'clay')
        for sx in [-1,1]:panel('경사대 측면틀',sx*(w/2-.005),0,.004,.009,d,.018,'clay')
        def sheet(name,coords,faces,keys):
            ob=self.mesh(name,[at(*v) for v in coords],faces,self.mat,True)
            layer=ob.data.uv_layers.new(name='Craft')
            for loop in ob.data.loops:
                k,u,v=keys[loop.vertex_index];layer.data[loop.index].uv=finishes.uv(k,clamp(u),clamp(v))
            return ob
        def spoon(px,s,tile):
            # The walnut catalogue set has a flat, slightly flared handle,
            # shallow concave egg-shaped bowl and a deeply narrowed neck.
            ny,nx=45,11;vertices=[];faces=[];uv=[]
            stations=[(0,.0038),(.034,.0043),(.13,.0031),(.169,.0030),(.178,.005),
                      (.187,.012),(.198,.0185),(.214,.0210),(.226,.0155),(.236,.0035)]
            def half(v):
                if v>=.178:
                    t=clamp((v-.178)/.058)
                    return .0005+.0044*(1-t)+.0179*sin(pi*t)**.65*(.90+.10*t)
                for a,b in zip(stations,stations[1:]):
                    if v<=b[0]:
                        q=clamp((v-a[0])/(b[0]-a[0]));return a[1]*(1-q)+b[1]*q
                return stations[-1][1]
            for layer in range(2):
                for j in range(ny):
                    u=j/(ny-1);l=u*.236;r=half(l);head=clamp((l-.174)/.062)
                    arch=sin(pi*head)**.8 if head else 0
                    for k in range(nx):
                        v=k/(nx-1);q=v*2-1
                        xx=px+s*r*q
                        yy=s*(l-.118-.002*head*abs(q)**2)
                        height=.016+.004*s*sin(u*pi)+s*(.0087*arch*(q*q-.52)+.0055*head)
                        vertices.append((xx,yy,height-(1-layer)*s*(.002+.0018*(1-arch)+.0013*(1-abs(q)))))
                        uv.append((tile,u,.5+q*(r/.022)*.45))
            count=nx*ny
            for j in range(ny-1):
                for k in range(nx-1):
                    a=j*nx+k;f=(a,a+1,a+nx+1,a+nx)
                    faces.extend((tuple(reversed(f)),tuple(vi+count for vi in f)))
            edge=list(range(0,count,nx))+list(range(count-nx+1,count))+list(range(count-nx-1,nx-2,-nx))+list(range(nx-2,0,-1))
            faces.extend((a,b,b+count,a+count) for a,b in zip(edge,edge[1:]+edge[:1]))
            return sheet('상차림 숟가락 · 오목한 술과 사각 자루',vertices,faces,uv)
        def chop(px,tile):
            coords=[];uv=[];fs=[]
            for j,(v,w,bevel) in enumerate([(-.119,.0036,.0006),(-.116,.0037,.0006),(.004,.003,.00055),(.091,.0018,.00045),(.117,.0012,.00040)]):
                for k,(dx,dz) in enumerate([(w-bevel,w),(-w+bevel,w),(-w,w-bevel),(-w,-w+bevel),(-w+bevel,-w),(w-bevel,-w),(w,-w+bevel),(w,w-bevel)]):
                    coords.append((px+dx,v,.016+dz));uv.append((tile,(v+.119)/.236,k/7))
                    if j:
                        a=(j-1)*8+k;b=(j-1)*8+(k+1)%8;fs.append((a,a+8,b+8,b))
            fs.extend([tuple(range(8)),tuple(reversed(range(len(coords)-8,len(coords))))])
            sheet('끝이 가늘어지는 목 젓가락',coords,fs,uv)
        if index==0:
            for i,(px,tile) in enumerate([(-.185,'walnut'),(-.065,'ebony'),(.060,'walnut'),(.178,'ebony')]):
                spoon(px,1,tile);chop(px+.036,tile);chop(px+.046,tile)
        else:
            for i,px in enumerate([-.200,-.121,-.041,.040,.119,.2]):
                spoon(px,.77+.055*(i%3),['spoonsteel','walnut','spoonsteel','ebony','spoonsteel','walnut'][i])
        return at

    def plant(self,x,y,z):
        p=[(.017,0),(.031,0),(.042,.008),(.053,.030),(.058,.069),(.055,.11),(.046,.14),
           (.036,.153),(.036,.157),(.032,.158),(.031,.153),(.038,.134),(.041,.08),(.019,.011)]
        self.turned('유약 얼룩이 있는 꽃병',(x,y,z),[(r,h,'stone',h/.158) for r,h in p],
                    lambda r,h,a:(r*(1+.022*sin(5*a+h*4)),h),56)
        rng=Random(1963)
        for branch in range(8):
            theta=TAU*(branch+.23)/8;reach=.052+.052*rng.random();height=.114+.11*rng.random()
            root=(x+.007*cos(theta),y+.007*sin(theta),z+.122)
            def at(t):return (root[0]+reach*cos(theta)*t**1.36,root[1]+reach*sin(theta)*t**1.24,root[2]+height*t)
            for a,b in zip([0,.34,.64],[.34,.64,1.]):self.bar('꽃병 가지',at(a),at(b),.0018*(1-a*.45),self.gray)
            for i in range(7):
                t=.25+.105*i;bx,by,bz=at(t);dir=theta+(-1 if i%2 else 1)*(.6+.35*rng.random())
                length=.015+.013*rng.random();size=length*.22
                ex,ey=bx+cos(dir)*length,by+sin(dir)*length
                self.bar('옆으로 뻗은 잔가지',(bx,by,bz),(ex,ey,bz+.010),.0008,self.gray)
                verts=[(bx,by,bz+.0004),(bx+.60*(ex-bx)-size*sin(dir),by+.60*(ey-by)+size*cos(dir),bz+.006),
                       (ex,ey,bz+.011),(bx+.51*(ex-bx)+size*sin(dir),by+.51*(ey-by)-size*cos(dir),bz+.007),
                       (bx+.56*(ex-bx),by+.56*(ey-by),bz+.010)]
                mat=self.green if i<5 or branch%3 else self.petal
                self.mesh('가늘게 펼쳐진 잎과 꽃받침',verts,[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],mat,True)
                if i>4 and branch%3:
                    for j in range(4):
                        a=dir+TAU*j/4
                        vs=[(ex,ey,bz+.010),(ex+.002*cos(a-.6),ey+.002*sin(a-.6),bz+.0106),
                            (ex+.0041*cos(a),ey+.0041*sin(a),bz+.0132),(ex+.002*cos(a+.6),ey+.002*sin(a+.6),bz+.0116)]
                        self.mesh('작은 크림색 꽃잎',vs,[(0,1,2),(0,2,3)],self.petal,True)

    def bowl(self,x,y,z,color):
        """Thick rim and small fluted foot on the coloured display bowls."""
        n=52;profile=[(.008,.003),(.022,.003),(.023,0),(.030,0),(.031,.006),(.029,.012),
                      (.044,.021),(.058,.033),(.072,.053),(.077,.069),(.077,.074),
                      (.074,.076),(.070,.074),(.069,.069),(.064,.054),(.052,.039),
                      (.040,.031),(.026,.027),(.006,.027)]
        coords=[];faces=[];colors=[]
        for i,(r,h) in enumerate(profile):
            for j in range(n):
                a=j*TAU/n;flute=.0023*sin(13*a)*clamp((r-.030)/.045)
                coords.append((x+(r+flute)*cos(a),y+(r+flute)*sin(a),z+h))
                reflection=.22*max(0,cos(a+1.4))**25+.12*max(0,cos(a-.6))**42
                gain=.68+.24*max(0,cos(a+.86))+.09*cos(13*a)
                alpha=.53 if i in [0,1,2,3,4,5,10,11,12,16,17,18] else .35
                colors.append(tuple(c*gain+reflection for c in color)+(alpha,))
                if i:
                    a0=(i-1)*n+j;a1=(i-1)*n+(j+1)%n
                    faces.append((a0,a1,a1+n,a0+n))
        ob=self.mesh('빛이 비치는 매입장 색유리 볼',coords,faces,self.glass,True)
        tint=ob.data.color_attributes.new(name='GlassColour',type='BYTE_COLOR',domain='POINT')
        for attr,c in zip(tint.data,colors):attr.color=c
        return ob
