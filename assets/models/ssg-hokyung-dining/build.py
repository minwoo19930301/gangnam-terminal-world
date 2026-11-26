"""Build the public dining tables, tea service, soup and a section of wall."""
import sys
from pathlib import Path
from math import sin,cos,pi,sqrt,exp
from random import Random
import bpy
from mathutils import Vector
D=Path(__file__).resolve().parent
sys.path.insert(0,str(D));sys.dont_write_bytecode=True
import surfaces
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
col=bpy.data.collections.new('SSG_11F_Hokyung_Dining')
bpy.context.scene.collection.children.link(col)
rng=Random(58011);tau=2*pi
batches=('HokyungJoinery','HokyungSizzlingRice','HokyungTeaMetal','HokyungFanAndWood','HokyungLamplight')
def material(name,rough,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes; shader=n.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=rough;shader.inputs['Metallic'].default_value=metal
    if name==batches[3]:
        tint=n.new('ShaderNodeTexImage');tint.image=surfaces.paint()
    else:
        tint=n.new('ShaderNodeVertexColor');tint.layer_name='Tint'
    m.node_tree.links.new(tint.outputs['Color'],shader.inputs['Base Color'])
    if name==batches[4]:
        emiss=shader.inputs.get('Emission Color') or shader.inputs.get('Emission')
        emiss.default_value=(1,.73,.41,1);shader.inputs['Emission Strength'].default_value=.7
    return m
mats=[material(name,r,m) for name,r,m in zip(batches,[.55,.24,.25,.38,.52],[0,0,.53,0,0])]
def linear(c):
    v=int(c,16)/255
    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def mesh(name,verts,faces,color,mat=0,smooth=False,uvs=None):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    me.materials.append(mats[mat])
    if mat==3:
        section,coords=uvs
        layer=me.uv_layers.new(name='표면')
        for loop in me.loops:layer.data[loop.index].uv=surfaces.uv(section,*coords[loop.vertex_index])
    else:
        attr=me.color_attributes.new(name='Tint',domain='POINT',type='BYTE_COLOR')
        palette=color if isinstance(color,list) else [color]
        rgba=[tuple(linear(c[i:i+2]) for i in (0,2,4))+(1,) for c in palette]
        for i,p in enumerate(attr.data):
            # Baked broad window reflections retain volume in the evening game
            # lighting. Keep a separate PBR response for native scene lights.
            nx,ny,nz=me.vertices[i].normal
            light=max(0,-.48*nx+.51*ny+.71*nz)
            if mat==2:
                band=exp(-((nx-.31)/.18)**2)+.7*exp(-((nx+.76)/.115)**2)
                gain=.30+.44*light+.78*band+.16*max(0,nz)
                gleam=.21*band
            elif mat==1:
                gain=.44+.54*light+.24*max(0,nz)
                gleam=.17*(max(0,-.32*nx+.64*ny+.698*nz)**19)
            else:
                gain=.57+.46*light;gleam=0
            rgb=rgba[i%len(rgba)]
            p.color=tuple(min(1,v*gain+gleam) for v in rgb[:3])+(1,)
    if smooth:
        for p in me.polygons:p.use_smooth=True
    ob=bpy.data.objects.new(name,me);col.objects.link(ob);return ob
def rings(name,rows,color,mat=0,smooth=True,uvs=None):
    n=len(rows[0]);k=len(rows)
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(k-1) for j in range(n)]
    return mesh(name,sum(rows,[]),faces+[tuple(reversed(range(n))),tuple(range((k-1)*n,k*n))],color,mat,smooth,uvs)
def box(name,x,y,z,w,d,h,color,mat=0,section=None,rad=.006):
    # Chamfered edges with rounded plan corners. z is the bottom.
    r=min(w/4,d/4,rad);b=min(.003,r/2,h/5)
    rows=[];coords=[]
    for inset,hh in [(b,0),(0,b),(0,h-b),(b,h)]:
        row=[]
        for k,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for j in range(3):
                a=(k+j/2)*pi/2
                dx=sx*(w/2-r)+(r-inset)*cos(a);dy=sy*(d/2-r)+(r-inset)*sin(a)
                row.append((x+dx,y+dy,z+hh));coords.append((.5+dx/w,.5+dy/d))
        rows.append(row)
    return rings(name,rows,color,mat,False,(section,coords) if section else None)
def lathe(name,x,y,z,profile,color,mat=1,n=36):
    return rings(name,[[(x+r*cos(j*tau/n),y+r*sin(j*tau/n),z+t) for j in range(n)] for r,t in profile],color,mat)
def line(name,pts,radii,color,mat=0,n=8):
    pts=[Vector(p) for p in pts];rows=[]
    for i,p in enumerate(pts):
        t=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        # Select a continuous transverse axis along this bent rod.
        if i==0: axis=t.cross(Vector((0,1,0)) if abs(t.y)<.85 else Vector((1,0,0))).normalized()
        else: axis=(axis-t*t.dot(axis)).normalized()
        b=t.cross(axis);r=radii[i] if isinstance(radii,list) else radii
        rows.append([p+r*(axis*cos(j*tau/n)+b*sin(j*tau/n)) for j in range(n)])
    return rings(name,rows,color,mat)
def oval_geom(x,y,z,rx,ry,rz,ang=0,n=12):
    return [[(x+rx*cos(t)*cos(j*tau/n)*cos(ang)-ry*cos(t)*sin(j*tau/n)*sin(ang),
              y+rx*cos(t)*cos(j*tau/n)*sin(ang)+ry*cos(t)*sin(j*tau/n)*cos(ang),z+rz*sin(t))
             for j in range(n)] for t in (-1.48,-.72,0,.72,1.48)]
def oval(name,x,y,z,rx,ry,rz,color,ang=0,mat=1,n=12):
    return rings(name,oval_geom(x,y,z,rx,ry,rz,ang,n),color,mat)
def panel(name,x,y,z,w,h,section):
    return mesh(name,[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],[(0,3,2,1)],'',3,False,(section,[(0,0),(1,0),(1,1),(0,1)]))

TOP=.765
wood='674432';brass='bf9555';trim='38444a';china='fcf5e8'
def chair(x,side):
    y=0; x+=side*.78
    for i in (-1,1):
        for j in (-1,1):
            line('의자 벌어진 다리',[(x+i*.198,y+j*.19,.01),(x+i*.167,y+j*.163,.45)], [.018,.025],'393630',n=6)
    box('목재 의자틀',x,y,.406,.44,.45,.042,'4d4035')
    box('가죽 방석',x,y,.447,.45,.46,.048,'',3,'leather',.035)
    # A curved upholstered back arches toward the sitter at each side.
    rows=[];coords=[]
    for h,push in [(0,0),(.10,.009),(.33,.047),(.41,.052)]:
        pts=[]
        for thickness,order in [(0,range(9)),(.027,reversed(range(9)))]:
            for j in order:
                v=j/8; a=(v-.5)*2
                pts.append((x+side*(.198+push-.047*a*a+thickness),y+a*.22,.455+h-.012*a*a))
                coords.append((v,h/.42))
        rows.append(pts)
    rings('휘어진 가죽 등받이',rows,'',3,True,('leather',coords))
def table(x):
    for a in (-1,1):
        for b in (-1,1):
            box('식탁 각재 다리',x+a*.54,b*.427,0,.065,.065,.719,'433126')
    for b in (-1,1):box('상판 밑 장부',x,b*.423,.626,1.13,.054,.095,wood)
    box('목재 식탁 상판',x,0,TOP-.048,1.25,.98,.048,'',3,'set-table' if x==0 else 'walnut',.015)
    for side in (-1,1):chair(x,side)
for x in (0,-2.1): table(x)
# Back wall in the surveyed bay. The two tables and wall are distinct objects.
wy=-3.73
box('회청색 벽 바탕',-1.05,wy,0,4.8,.085,2.93,'5f6c71')
for k in range(6):
    x=-3.36+k*.925
    box('회청색 세로 몰딩',x,wy+.052,0,.052,.062,2.92,trim)
for z in (.13,.93,2.55,2.85):box('가로 몰딩',-1.05,wy+.054,z,4.78,.066,.045,trim)
for x,section in [(-2.13,'fan'),(.05,'fan-red')]:
    box('부채 액자 테두리',x,wy+.094,1.27,1.48,.088,.79,'2b2929')
    panel('접부채 그림',x,wy+.140,1.301,1.407,.717,section)
for x in (-2.09,-1.05,-.01):
    box('벽면 소파 하부',x,wy+.36,.05,1.035,.55,.37,'463a31')
    box('벽면 소파 방석',x,wy+.41,.42,1.03,.58,.11,'84786a',rad=.045)
    box('소파 등쿠션',x,wy+.19,.51,1.03,.16,.48,'a49a89',rad=.052)
    line('등쿠션 파이핑',[(x-.49,wy+.273,.54),(x-.49,wy+.273,.965),
        (x+.49,wy+.273,.965),(x+.49,wy+.273,.54)],.005,'b9aa96')
box('벽과 천장을 잇는 몰딩',-1.05,wy+.10,2.89,4.80,.27,.18,'bca486')
for x in (-2.08,0):
    box('벽쪽 공동',x,-2.976,2.99,2.02,1.08,.035,'d8bda2')
    for side in (-1,1):
        box('벽쪽 공동 세로틀',x+.98*side,-2.976,2.91,.07,1.08,.08,'ad8a6c')
# Copper squared coffers and the multi-arm lamp seen above the public tables.
for x in (-2.08,0):
    box('천장 공동 안쪽',x,-1.32,2.99,2.02,2.24,.035,'dec29f')
    for sign in (-1,1):
        for off,z,h,c in [(0,2.91,.08,'ab8061'),(.058,2.958,.04,'c9a388')]:
            box('공동 천장 가로 턱',x,-1.32+sign*(1.11-off),z,2.03,.065,h,c)
            box('공동 천장 세로 턱',x+sign*(.98-off),-1.32,z,.065,2.23,h,c)
def chandelier(x,y):
    lathe('천장 장미판',x,y,2.928,[(.10,0),(.116,.022),(.072,.05)],brass,2)
    line('황동 현수봉',[(x,y,2.48),(x,y,2.94)],.009,brass,2)
    lathe('다등 중앙 허브',x,y,2.39,[(.015,0),(.05,.024),(.045,.085),(.013,.12)],brass,2)
    for k in range(6):
        a=k*tau/6
        path=[(x+r*cos(a),y+r*sin(a),z) for r,z in [(0,2.43),(.12,2.37),(.235,2.36),(.291,2.40),(.30,2.51)]]
        line('굽은 샹들리에 팔',path,.009,brass,2)
        px,py=path[-1][:2]
        lathe('검은 갓',px,py,2.52,[(.071,0),(.073,.008),(.047,.108),(.044,.11)],'37312d',0,20)
        lathe('갓 속 불빛',px,py,2.515,[(.065,0),(.067,.006)],'ffdf9c',4,20)
chandelier(-.9,-1.3)
# Section of the walnut trivet and thick-lipped black casserole.
cx,cy=.055,.205
box('솥받침 통목',cx,cy,TOP,.36,.307,.027,'',3,'walnut',.020)
base=TOP+.027
lathe('흑갈색 뚝배기',cx,cy,base,[(.087,0),(.094,.003),(.096,.009),(.107,.015),(.129,.035),
    (.145,.065),(.151,.091),(.15,.105),(.147,.111),(.141,.112),(.137,.109),
    (.138,.101),(.14,.094),(.133,.066),(.116,.035),(.086,.019),(.001,.019)],'382a25',1,64)
line('뚝배기 손잡이',[(cx-.13,cy,base+.063),(cx-.152,cy,base+.064),(cx-.18,cy,base+.069)],
     [.029,.025,.034],'3b2d29',1,20)
soup=base+.084
lathe('호박색 육수',cx,cy,soup-.006,[(.135,0),(.139,.007),(.134,.006),(.084,.0066),(.001,.006)],'9f6c2e',1,64)
for i,(dx,dy,rad) in enumerate([(-.067,.066,.007),(.08,-.02,.004),(.095,-.015,.003),
                              (-.069,.083,.004),(.025,.053,.006),(-.038,.049,.003)]):
    lathe('육수 가장자리 기포',cx+dx,cy+dy,soup+.001,[(rad,0),(rad*.91,.001),
          (rad*.5,.002),(rad*.2,.001)],'c5a363',1,12)
for dx,dy,angle in [(-.072,.072,1.2),(.074,.011,-.6),(-.01,.119,.18)]:
    line('육수 위 윤기',[(cx+dx+t*cos(angle),cy+dy+t*sin(angle)+.0015*cos(t*180),soup+.0018)
        for t in [-.009,-.005,0,.006,.010]],[.0004,.0011,.0013,.001,.0004],'c8a15b',1,5)
def ingredient_pos(x,y):return cx+x,cy+y
# Two broken toasted squares stand above the soup. Each surface has a
# different footprint, tilt and scattering of puffed individual rice kernels.
def rice_crisp(x,y,w,h,angle,lean):
    ca,sa=cos(angle),sin(angle)
    def local(a,b,c):
        return (cx+x+a*ca-(b-lean*c)*sa,cy+y+a*sa+(b-lean*c)*ca,soup-.004+c)
    verts=[];faces=[];colors=[]
    kernels=['f9e2a8','e9c987','ffe9ba','f1d99e','d7ae70','f9e6bd']
    for side in (-1,1):
        for row in range(10):
            for j in range(13):
                a=(j+.5+rng.uniform(-.25,.25))/13*w-w/2
                c=(row+.4+rng.uniform(-.23,.23))/10*h
                if c>h*.93 and abs(a)>w*.46:continue
                b=side*(.0053+rng.uniform(-.001,.001))
                # Long axes point mostly up with variable lean, as puffed rice.
                rot=rng.uniform(-.9,.9)
                rows=oval_geom(0,0,0,.0039,.0036,.0065,0,6);offset=len(verts)
                color=rng.choice(kernels)
                for ring in rows:
                    for dx,dy,dz in ring:
                        verts.append(local(a+dx*cos(rot)+dz*sin(rot),b+dy,c+dz*cos(rot)-dx*sin(rot)))
                        colors.append(color)
                for m in range(4):
                    for k in range(6):
                        q=offset+6*m;faces.append((q+k,q+(k+1)%6,q+6+(k+1)%6,q+6+k))
    grain=mesh('누룽지 낱알',verts,faces,colors,1,True)
    grain['crisp_core']=[cx+x,cy+y,soup-.004,w,h,angle,lean]
    rows=[[local(a,b,c) for a,b in [(-w*.48,-.006),(w*.48,-.006),(w*.48,.006),(-w*.48,.006)]]
          for c in (0,h*.96)]
    rings('누룽지 속',rows,'dab477',1,False)
rice_crisp(-.047,-.088,.099,.065,-.25,.39)
rice_crisp(.063,-.075,.093,.058,.46,.5)
# Shellfish medallions have a dark frilled edge and a smooth golden foot.
for i in range(3):
    x,y=ingredient_pos(-.002+i*.010,-.032+i*.036)
    rows=[]
    for height,scale in [(0,.82),(.011,1),(.022,.98),(.027,.8)]:
        rows.append([(x+.037*scale*(1+.055*sin(a*18))*cos(a),y+.021*scale*sin(a),
                      soup+.008+height+.015*sin(a)) for a in [j*tau/48 for j in range(48)]])
    rings('전복 단면의 주름진 가장자리',rows,'62543a',1)
    oval('전복 속살',x,y-.001,soup+.031,.031,.016,.012,'d7ad69',-.19)
# Prawns taper around a curl. Pigment follows the overlapping segments.
for dx,dy,angle in [(.085,.055,-.5),(.071,.081,-1.1)]:
    x,y=ingredient_pos(dx,dy);pts=[];radii=[]
    for j in range(15):
        a=angle+j*.16
        pts.append((x+.023*cos(a),y+.018*sin(a),soup+.013+.007*sin(j*pi/14)))
        radii.append(.005+.013*sin((j+2)*pi/18))
    line('새우 굽은 몸통',pts,radii,'edc99b',1,12)
    for j in (3,6,9,12):
        line('새우 마디 주홍 무늬',pts[j:j+2],[radii[j]*1.015,radii[j+1]*1.025],'d99567',1,12)
# Shiitake slices with arched brown skins and cream-coloured gills.
for j in range(3):
    x,y=ingredient_pos(-.089+j*.004,-.046+j*.028)
    arc=[]
    for i in range(15):
        a=pi*i/14;arc.append((x+.029*cos(a),y+.008*sin(a),soup+.008+.03*sin(a)))
    line('표고 갈색 갓',arc,.008,'70442a',1,9)
    verts=[(px,py+.003,pz-.004) for px,py,pz in arc]+[(x,y+.004,soup+.003)]
    mesh('표고버섯 절단면',verts,[(15,k,k+1) for k in range(14)],'dcc391',1)
    for k in range(2,14,2):line('표고버섯 주름살',[(x,y+.004,soup+.004),verts[k]],.00085,'b69462',1,5)
# Ivory squid mantle with cross-cuts, beside broccoli's granular florets.
x,y=ingredient_pos(-.045,.019)
oval('오징어 몸살',x,y,soup+.024,.026,.046,.019,'f1dfb6',-.50)
for j in range(-3,4):
    yy=y+j*.008
    line('오징어 칼집',[ (x-.012,yy-.005,soup+.034),(x,yy+.004,soup+.043),
                          (x+.012,yy+.009,soup+.036)],.0015,'d3b787',1,6)
for dx,dy in [(-.095,.057),(-.115,.024)]:
    x,y=ingredient_pos(dx,dy);oval('브로콜리 꽃대',x,y,soup+.003,.011,.019,.018,'869448')
    for k in range(28):
        a=k*2.4;r=.018*sqrt(k/28)
        oval('브로콜리 작은 꽃봉오리',x+r*cos(a),y+r*sin(a),soup+.018+.010*(1-r/.019),
             .005,.005,.005,rng.choice(['3a612b','55772e','698339','37582a']),n=6)
for dx,dy,ang in [(-.049,.085,-.23),(-.010,.109,-.5),(.028,.091,.17)]:
    x,y=ingredient_pos(dx,dy)
    oval('소스 묻은 죽순 조각',x,y,soup+.002,.017,.028,.012,'dfb879',ang)
# The branch photograph shows a bellied metal pot, domed flip lid, raised
# pouring lip and loop handle. Keep the spout open and model its dark bore.
def teapot(x,y):
    lathe('금빛 찻주전자 몸통',x,y,TOP,[(.041,0),(.046,.005),(.049,.012),(.059,.023),
          (.064,.054),(.061,.096),(.054,.143),(.047,.164),(.048,.174),(.042,.177)],'b7a078',2,48)
    lathe('주전자 굽',x,y,TOP,[(.046,.001),(.049,.004),(.049,.009),(.047,.011)],'544737',2)
    lathe('둥근 주전자 뚜껑',x,y,TOP+.172,[(.049,0),(.052,.004),(.052,.008),(.046,.010),
          (.041,.020),(.026,.028),(.012,.032),(.001,.033)],'c7b184',2,48)
    line('차 따르는 부리',[(x-.049,y,TOP+.068),(x-.071,y,TOP+.077),(x-.085,y,TOP+.106),
         (x-.101,y,TOP+.150),(x-.118,y,TOP+.176),(x-.127,y,TOP+.180)],
         [.022,.019,.015,.012,.010,.012],'c7b58c',2,18)
    oval('주전자 부리 안쪽',x-.127,y,TOP+.184,.009,.008,.0025,'4d4735')
    handle=[(x+.04,y,TOP+.149),(x+.067,y,TOP+.151),(x+.086,y,TOP+.14),(x+.092,y,TOP+.12),
            (x+.087,y,TOP+.087),(x+.069,y,TOP+.054),(x+.045,y,TOP+.046)]
    line('주전자 둥근 손잡이',handle,[.006,.008,.009,.009,.009,.008,.006],'bbab88',2,12)
    box('뚜껑 경첩',x+.045,y,TOP+.17,.021,.026,.010,brass,2)
teapot(-.315,-.18)
def cup(x,y):
    lathe('찻잔',x,y,TOP,[(.025,0),(.029,.004),(.031,.015),(.041,.042),(.045,.059),
          (.042,.060),(.040,.054),(.030,.026),(.001,.013)],china)
    lathe('호박빛 차',x,y,TOP+.044,[(.038,0),(.040,.002),(.001,.001)],'bc8135')
for x,y in [(-.334,.024),(.423,-.21),(-2.48,-.27)]:cup(x,y)
def saucer(x,y):
    lathe('반찬 종지',x,y,TOP,[(.043,0),(.049,.005),(.058,.016),(.066,.029),(.065,.032),
        (.061,.030),(.050,.017),(.041,.010),(.001,.010)],china)
sx,sy=.313,-.124
saucer(sx,sy)
for i in range(4):
    ob=box('얇은 단무지',0,0,0,.077,.024,.006,'edbd2b',1,rad=.006)
    ob.rotation_euler.z=.1+i*.065;ob.location=(sx+.003*i,sy-.029+.015*i,TOP+.014+.003*i)
sx+=.147;saucer(sx,sy)
for i in range(14):
    a=rng.uniform(0,tau);px=sx+rng.uniform(-.026,.026);py=sy+rng.uniform(-.022,.022)
    line('짜사이 무침',[(px+t*cos(a),py+t*sin(a)+.005*sin(j*pi/2),TOP+.019+i*.001+.005*sin(j*pi/3))
        for j,t in enumerate([-.022,-.008,.009,.021])],[.004,.007,.007,.003],rng.choice(['a76729','c48737','b3752e']),1)
# Condiment tray and folded napkins, kept off the empty seat's setting.
def condiments(x,y):
    box('양념 받침',x,y,TOP,.205,.102,.012,'eee5d3',1,None,.012)
    for j,(liquid,glass) in enumerate([('301f18','746453'),('bc9a5e','d1bda0')]):
        px=x-.051+j*.077
        lathe('양념 유리병',px,y,TOP+.012,[(.022,0),(.029,.006),(.029,.085),(.026,.10),(.026,.11)],glass)
        lathe('간장과 식초',px,y,TOP+.023,[(.026,0),(.03,.006),(.029,.066),(.027,.068)],liquid)
        lathe('유리병 마개',px,y,TOP+.117,[(.029,0),(.031,.008),(.029,.018),(.017,.022),(.012,.033)],'dacdb8')
condiments(-.37,-.365)
box('냅킨통',.02,-.36,TOP,.16,.075,.067,'e4d9c8',1)
for j in range(8):
    box('접은 냅킨',.018,-.382+j*.006,TOP+.062,.14,.003,.071+j%3*.004,'f5eee2')
for tx in (0,-2.1):
    for side in (-1,1):
        for j in range(2):
            line('젓가락',[(tx+side*.46,.075+j*.012,TOP+.008),(tx+side*.46-.018,.315+j*.012,TOP+.011)],
                [.003,.002],'574236',1)
        box('젓가락 받침',tx+side*.46,.23,TOP,.043,.014,.009,china,1)
# The second customer table has its own camera-dependent meal.
import meal_model
meal_model.make(col,meal_model.FRAME)
# Save separated objects in the artist's source before batching for the game.
bpy.context.scene.unit_settings.system='METRIC'
print('Editable mesh objects',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(D/'hokyung.blend'),compress=True)
exec(compile((D/'export.py').read_text(),str(D/'export.py'),'exec'))
