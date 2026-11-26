"""Model the Gangnam 7F GLXY studio from Samsung C&T's September 2026 opening photograph."""
import math
import random
import runpy
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parents[2]/'tools'))
import blender_shop_mesh as G

bpy.ops.wm.read_factory_settings(use_empty=True)
G.group=bpy.data.collections.new('SSG_7F_GLXY_Studio')
bpy.context.scene.collection.children.link(G.group)
colors={
    'Oak':'b58c64','Oak light':'c19a73','Oak shadow':'7e674e','Oak grain':'a68161',
    'Pale tile':'dbd7cb','Tile seam':'c2bfb1','Grey marble':'c2c1ba','Marble vein':'e2e1da',
    'Marble shadow':'a5a59f','Flannel charcoal':'46464a','Worsted black':'2c3034','Faded navy':'3c4755',
    'Oat':'d4c4ac','Stone':'a19784','Pearl':'dbd9d0','Ivory':'eae5da','Chambray':'8696a3',
    'Olive':'676859','Maroon':'653e44','Chalk stripe':'b1b3ae','Carbon tube':'26292b',
    'Silver':'acaea9','Mirror':'a6aca9','Hanger beech':'ccb18e','Paper':'ede9de','Printer ink':'393b3a',
    'Chino':'bba586','Chino seam':'a48b6d','Cream stitch':'cdb79b','Belt leather':'51423a','Belt stitch':'a89179',
    'Sneaker':'ebe9e1','Sole':'d3d4ca','Laces':'f1efe8','Cordovan':'74443b','Loafer seam':'9e6c58',
    'Red cashmere':'af2530','Red purl':'c73843','Cocoa knit':'855e51','Warm spot':'fff3d0',
    'Letters':'edfff9','Logo return':'d0d5cc','Cast shadow':'625849'}
for name,col in colors.items():
    m=G.material(name,col,.47 if name in ('Silver','Mirror','Carbon tube','Logo return') else 0)
    if name in ('Warm spot','Letters'):
        shader=m.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Emission Color'].default_value=m.diffuse_color
        shader.inputs['Emission Strength'].default_value=1.1
    G.palette[name]=m

B=G.block
R=G.rod
Q=G.piece
rng=random.Random(70926)

def tube(name,levels,col,seg=20,fold=0,angle=0):
    """Rings (x, depth, elevation, half-width, half-depth) with a few soft fabric folds."""
    ca,sa=math.cos(angle),math.sin(angle);points=[]
    for j,(x,d,z,w,h) in enumerate(levels):
        for i in range(seg):
            t=i*math.tau/seg
            rip=1+fold*(math.sin(5*t+.3*j)+.45*math.sin(9*t-.45*j))
            dx=w*math.cos(t)*rip;dd=h*math.sin(t)*rip
            points.append((x+ca*dx-sa*dd,d+sa*dx+ca*dd,z))
    faces=[tuple(reversed(range(seg))),tuple(range((len(levels)-1)*seg,len(levels)*seg))]
    faces += [(k*seg+i,k*seg+(i+1)%seg,(k+1)*seg+(i+1)%seg,(k+1)*seg+i)
              for k in range(len(levels)-1) for i in range(seg)]
    ob=Q(name,points,faces,col)
    for poly in list(ob.data.polygons)[2:]:poly.use_smooth=True
    return ob

def text(body,x,d,z,w,h,tone='Printer ink',thick=.004):
    font=bpy.data.curves.new(body,'FONT');font.body=body;font.font=typeface
    font.extrude=thick/2;font.resolution_u=4
    ob=bpy.data.objects.new(body,font);G.group.objects.link(ob);font.materials.append(G.palette[tone])
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.convert(target='MESH')
    mins,maxs=zip(*[(min(v.co[i] for v in ob.data.vertices),max(v.co[i] for v in ob.data.vertices)) for i in [0,1]])
    for v in ob.data.vertices:
        for axis,size in [(0,w),(1,h)]:v.co[axis]=(v.co[axis]-(mins[axis]+maxs[axis])/2)*size/(maxs[axis]-mins[axis])
    ob.rotation_euler=(math.pi/2,0,0);ob.location=(x,-d,z);return ob

typeface=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')

# Rift-sawn oak backdrop, backlit white letters and a pale stone floor, rather than the dark generic carpet.
B('Oak backing',0,-3.12,.02,7.31,.13,3.17,'Oak')
for i in range(12):
    x=-3.35+i*.61
    B('Oak panel',x,-3.037,.025,.602,.039,3.15,['Oak','Oak light','Oak','Oak'][i%4])
    for k in range(6):
        xx=x+rng.uniform(-.27,.27);h=rng.uniform(.55,1.65);z=rng.uniform(.13,2.93-h)
        R('Oak grain',[(xx,-3.013,z),(xx+.012,-3.013,z+h*.43),(xx-.006,-3.013,z+h)],.004,'Oak grain',4)
text('GLXY',-.40,-2.945,2.64,1.16,.31,'Logo return',.058)
text('studio',.67,-2.945,2.619,.82,.259,'Logo return',.058)
text('GLXY',-.40,-2.908,2.64,1.16,.31,'Letters')
text('studio',.67,-2.908,2.619,.82,.259,'Letters')
B('Limestone floor',0,.005,.012,7.45,6.48,.016,'Pale tile')
for x in [-2.75,-1.55,-.35,.85,2.05,3.25]:B('Stone joint',x,.005,.029,.007,6.48,.001,'Tile seam')
for d in [-2.54,-1.34,-.14,1.06,2.26]:B('Stone joint',0,d,.029,7.45,.007,.001,'Tile seam')
# The high mirrored frame is visible at the back and side, with a pale ceiling above the oak.
B('Back mirror band',0,-3.085,3.19,7.42,.11,.27,'Mirror')
for x in [-3.65,3.65]:B('Mirror end cap',x,-3.015,3.19,.045,.07,.27,'Silver')
for d in [-2.43,.76]:
    B('Dark ceiling slot',0,d,3.53,6.4,.056,.036,'Carbon tube')
    B('Profile light',0,d+.10,3.526,6.4,.035,.024,'Warm spot')
B('Soffit',0,-.01,3.563,7.46,6.44,.035,'Pearl')

def hanger(x,d,z,amp=.24,rotation=0):
    c,s=math.cos(rotation),math.sin(rotation)
    R('Beech hanger',[(x+a*c,d+a*s,z-h) for a,h in [(-amp,.115),(-.09,.045),(0,0),(.09,.045),(amp,.115)]],
      .022,'Hanger beech',8)
    R('Hook',[(x,d,z),(x,d,z+.057),(x,d+.032,z+.085),(x,d+.031,z+.106),(x,d+.000,z+.116),(x,d-.024,z+.096)],.0065,'Silver',6)

def jacket(x,d,z,col,index,angle=.0):
    # A suspended jacket faces along the rail. Its small side-to-side twist breaks up the row.
    co,si=math.cos(angle),math.sin(angle)
    def pos(a,b,h):return (x+co*a-si*b,d+si*a+co*b,z+h)
    def mesh(name,levels,color,fold=.018):
        return tube(name,[(*pos(a,b,h),w,e) for a,b,h,w,e in levels],color,16,fold,angle)
    mesh('Hanging jacket',[(0,0,0,.231,.072),(0,.003,.21,.207,.064),(.004,-.004,.42,.216,.086),
      (0,0,.54,.249,.095),(0,-.007,.62,.239,.069),(0,-.003,.70,.084,.035)],col)
    for sign in [-1,1]:
        mesh('Tailored sleeve',[(sign*.235,.020,.025,.050,.040),(sign*.243,.016,.23,.057,.053),
          (sign*.219,0,.47,.071,.066),(sign*.2,-.003,.58,.079,.071)],col)
        verts=[pos(sign*.068,.045,.692),pos(sign*.145,.070,.616),pos(sign*.080,.091,.596),
               pos(sign*.122,.093,.559),pos(sign*.016,.088,.37)]
        Q('Folded lapel',verts,[(0,1,2,4),(2,3,4)],col)
    R('Jacket front edge',[pos(.008,.084,.374),pos(.015,.069,.16),pos(.032,.071,.018)],.005,'Flannel charcoal',5)
    if index%4==0:
        for a in [-.14,-.04,.07,.16]:
            R('Pinstripe',[pos(a,.053,.035),pos(a*.92,.055,.27),pos(a,.077,.48)],.0026,'Chalk stripe',4)
    # Collar returns, cuff seams, breast welt and the different lower pockets
    # are legible on a front or three-quarter view of an individual garment.
    for side in [-1,1]:
        Q('Notched collar',[pos(0,.010,.695),pos(side*.061,.008,.710),
          pos(side*.118,.082,.652),pos(side*.058,.093,.593)],[(0,1,2,3)],col)
        R('Sleeve cuff seam',[pos(side*.279,.035,.059),pos(side*.240,.073,.059),pos(side*.206,.058,.058)],
          .0032,'Chalk stripe' if index%4==0 else 'Flannel charcoal',5)
        R('Lower pocket welt',[pos(side*.195,.057,.192),pos(side*.14,.070,.197),pos(side*.078,.076,.201)],.005,col,6)
    R('Breast pocket',[pos(-.170,.071,.461),pos(-.130,.079,.459),pos(-.090,.085,.466)],.004,col,6)
    for h,dep in [(.30,.082),(.21,.076)]:
        R('Suit button',[pos(.014,dep,h),pos(.014,dep+.008,h)],.011,'Carbon tube',9)
    hx,hd,hz=pos(0,0,.71);hanger(hx,hd,hz,.21,angle)

def oxford(x,d,z,col,i,angle):
    co,si=math.cos(angle),math.sin(angle)
    def v(a,b,h):return x+co*a-si*b,d+si*a+co*b,z+h
    def body(label,sections,fold=.017):
        return tube(label,[(*v(a,b,h),w,e) for a,b,h,w,e in sections],col,18,fold,angle)
    body('Oxford body',[(0,0,.015,.225,.057),(0,.003,.15,.226,.066),(.005,-.002,.36,.20,.070),
        (0,0,.49,.23,.078),(0,0,.58,.242,.060),(0,0,.661,.067,.024)])
    for sign in [-1,1]:
        if i%3:
            levels=[(sign*.265,.044,.010,.044,.041),(sign*.26,.035,.18,.047,.044),(sign*.234,0,.37,.060,.049),(sign*.179,-.002,.554,.072,.054)]
        else:
            levels=[(sign*.282,.019,.320,.070,.064),(sign*.269,.010,.38,.069,.064),(sign*.201,0,.537,.082,.070)]
        body('Shirt sleeve',levels)
        Q('Shirt collar leaf',[v(0,.019,.664),v(sign*.067,.011,.674),v(sign*.112,.057,.619),v(sign*.047,.081,.569)],[(0,1,2,3)],col)
    R('Placket',[v(.004,.072,.030),v(.004,.073,.22),v(.004,.076,.42),v(.004,.079,.59)],.0065,col,6)
    for j in range(6):
        h=.07+j*.092;dep=.069 if j<3 else .076
        R('Pearl button',[v(.005,dep,h),v(.005,dep+.005,h)],.0058,'Pearl',7)
    Q('Shirt pocket', [v(-.174,.050,.500),v(-.07,.075,.50),v(-.075,.073,.389),v(-.112,.070,.367),v(-.166,.059,.391)],[(0,1,2,3,4)],col)
    hanger(x,d,z+.676,.20,angle)

def hung_pants(x,d,z,col,angle):
    co,si=math.cos(angle),math.sin(angle)
    def v(a,b,h):return x+co*a-si*b,d+si*a+co*b,z+h
    for side in [-1,1]:
        levels=[(side*.105,0,0,.082,.034),(side*.106,.001,.13,.082,.039),
            (side*.099,-.006,.39,.091,.041),(side*.090,.003,.58,.103,.045),(side*.077,0,.75,.107,.049)]
        tube('Hanging trouser leg',[(*v(a,b,h),w,e) for a,b,h,w,e in levels],col,16,.02,angle)
        R('Pressed crease',[v(side*.099,.035,.018),v(side*.105,.040,.27),v(side*.100,.041,.42),v(side*.09,.047,.66)],.0027,'Flannel charcoal',4)
    tube('Hanging trouser waist',[(*v(0,0,.71),.177,.051),(*v(0,0,.80),.198,.059),
         (*v(0,0,.916),.183,.051)],col,20,.012,angle)
    R('Clip hanger',[v(-.19,0,.944),v(.19,0,.944)],.006,'Silver',8)
    for side in [-1,1]:
        R('Clip jaws',[v(side*.137,.016,.893),v(side*.137,.016,.95)],.010,'Carbon tube',8)
    R('Swivel hook',[v(0,0,.943),v(0,0,.983),v(0,.022,1.001),v(0,.032,.980)],.006,'Silver',6)

def rail(x,d,length,axis,stock,seed):
    # Black steel tubing has bent feet and a light metal rail edge.
    ax,ad=(1,0) if axis=='x' else (0,1)
    for side in [-1,1]:
        xx,dd=x+ax*side*length/2,d+ad*side*length/2
        B('Flat foot',xx,dd,.031,.40 if not ax else .1,.10 if not ax else .43,.034,'Carbon tube',.009)
        R('Upright',[(xx,dd,.065),(xx,dd,1.81)],.022,'Carbon tube',10)
    R('Display rail',[(x-ax*length/2,d-ad*length/2,1.79),(x+ax*length/2,d+ad*length/2,1.79)],.030,'Carbon tube',16)
    for i,col in enumerate(stock):
        t=length*((i+.68)/(len(stock)+.35)-.5)
        xx,dd=x+ax*t,d+ad*t
        # Turn hangers across the direction of travel along the rail.
        a=(.91 if ax else -.44)+.21*math.sin(i*3.5+seed)
        if seed==0 and i%5!=4:
            hung_pants(xx,dd,.789,col,a)
        elif seed==2 or i%4==0:
            oxford(xx,dd,1.008+.012*math.cos(i),col,i,a)
        else:
            jacket(xx,dd,.95+.024*math.cos(i),col,i,a)
    xx,dd=x-ax*(length*.30),d-ad*(length*.30)
    B('Rail grouping tab',xx,dd,1.81,.14,.038,.143,'Paper',.005)
    text(['G','X','Y'][seed%3],xx,dd+.022,1.889,.046,.061)
    B('Small tab rule',xx,dd+.024,1.836,.076,.003,.005,'Printer ink')

palette=['Worsted black','Faded navy','Flannel charcoal','Stone','Oat','Pearl','Ivory','Chambray','Olive','Maroon']
rail(-1.52,-1.58,3.05,'x',[palette[i] for i in [0,1,0,2,4,3,5,1,6,1]],0)
rail(1.46,-1.77,2.58,'x',[palette[i] for i in [4,6,5,3,9,0,2,1]],1)
rail(2.65,.32,2.53,'d',[palette[i] for i in [3,0,5,2,7,6,1,2]],2)
rail(-2.96,-.19,1.8,'d',[palette[i] for i in [1,0,7,2,0]],0)
# The black rectangular display frame stands behind the chino; its left/right
# openings align with the two clothing rows, like the manufacturer's photograph.
for xx in [-2.45,.15]:
    B('Display-frame upright',xx,-.67,.031,.057,.1,1.98,'Carbon tube')
B('Display-frame head',-1.15,-.67,1.96,2.66,.10,.075,'Carbon tube')
B('Display-frame sill',-1.15,-.67,.04,2.66,.10,.058,'Carbon tube')
rail(-1.05,-.79,2.47,'x',[palette[i] for i in [2,0,1,3,1,5,0]],2)

# The waist-down G-fit display is the focus of the actual photograph.
def hero(x,d):
    B('Thin mannequin plate',x,d,.033,.68,.64,.021,'Silver',.008)
    for side in [-1,1]:
        sx=x+side*.143
        def leg(h,cx,dd,w,e):return (sx+side*cx,d+dd,h,w,e)
        tube('Chino leg',[
            leg(.165,.035,.005,.110,.108),leg(.198,.027,.010,.111,.096),leg(.239,.018,-.012,.105,.089),
            leg(.29,.019,.013,.111,.096),leg(.45,.024,.004,.112,.093),leg(.53,.009,-.017,.116,.086),
            leg(.59,.001,.005,.121,.098),leg(.73,-.007,.007,.13,.106),leg(.855,-.004,0,.141,.127),
            leg(.982,-.011,-.004,.145,.14),leg(1.038,-.018,-.008,.130,.120)],'Chino',32,.027)
        R('Outside leg seam',[(sx+side*.145,d+.020,.18),(sx+side*.139,d+.018,.48),(sx+side*.123,d+.010,.66),(sx+side*.139,d+.038,.93)],.003,'Cream stitch',5)
        R('Pressed front crease',[(sx+.009,d+.104,.197),(sx+.015,d+.094,.42),(sx,d+.083,.53),(sx+.006,d+.107,.72),(sx-.018,d+.125,.84)],.0033,'Cream stitch',5)
        # White low-top sneakers, separate toe box, outsole, eyestay and laces.
        foot=sx+side*.028;base=d+.018
        tube('Sneaker sole',[(foot,base+.042,.052,.104,.194),(foot,base+.041,.072,.109,.205),
             (foot,base+.040,.085,.105,.202)],'Sole',28)
        tube('White leather upper',[(foot,base+.041,.085,.104,.196),(foot,base+.045,.105,.103,.191),
            (foot,base+.026,.127,.091,.172),(foot,base-.007,.151,.083,.133),
            (foot,base-.045,.178,.077,.078)],'Sneaker',28,.003)
        for j in range(5):
            dd=base+.020+j*.023;zz=.157-j*.006
            R('White crossed laces',[(foot-.054,dd,zz),(foot+.048,dd+.020,zz-.005)],.0038,'Laces',5)
            R('White crossed laces',[(foot+.054,dd,zz),(foot-.048,dd+.020,zz-.005)],.0038,'Laces',5)
    tube('Chino seat and pleated waist',[(x,d,.878,.246,.129),(x,d,.955,.267,.15),(x,d,1.033,.256,.150),
         (x,d,1.143,.237,.137),(x,d,1.171,.234,.132)],'Chino',38,.014)
    tube('Chino waistband',[(x,d,1.125,.240,.140),(x,d,1.171,.238,.138)],'Chino seam',38)
    tube('Dark leather belt',[(x,d,1.132,.242,.145),(x,d,1.162,.240,.142)],'Belt leather',42)
    for off in [-.18,-.103,.12,.196]:
        dd=d+math.sqrt(max(0,1-(off/.24)**2))*.143
        B('Belt loop',x+off,dd,1.124,.017,.012,.05,'Chino',.003)
    R('Buckle',[(x-.027,d+.147,1.134),(x-.030,d+.150,1.162),(x+.035,d+.150,1.162),
        (x+.038,d+.147,1.135),(x-.027,d+.147,1.134)],.0043,'Silver',7)
    for side in [-1,1]:
        R('Slant pocket edge',[(x+side*.229,d+.053,1.105),(x+side*.190,d+.116,1.038),(x+side*.177,d+.128,.99)],.004,'Chino seam',6)
        R('Pocket topstitch',[(x+side*.224,d+.060,1.104),(x+side*.188,d+.119,1.035),(x+side*.174,d+.129,.99)],.002,'Cream stitch',5)
    R('Fly topstitch',[(x+.032,d+.142,1.121),(x+.037,d+.151,1.032),(x+.028,d+.151,.996),(x,d+.145,.984)],.003,'Chino seam',6)
    B('Angled paper label stand',x,d,1.174,.32,.17,.009,'Paper',.005)
    B('G fit display card',x,d-.033,1.18,.27,.012,.14,'Paper')
    text('G-FIT',x,d-.022,1.257,.157,.045)
hero(.42,1.70)

# Grey veined stone island and folded red knit, brown loafers and another folded sweater.
bx,bd=-.95,1.55
B('Recessed plinth',bx,bd,.028,1.68,.84,.065,'Carbon tube',.012)
B('Veined grey sandstone',bx,bd,.087,1.68,.84,.68,'Grey marble',.014)
B('Pale stone top',bx,bd,.766,1.68,.84,.016,'Grey marble',.007)
for i in range(39):
    a=rng.uniform(-.80,.73);zz=rng.uniform(.10,.72);length=rng.uniform(.04,.33)
    path=[(bx+a,bd+.422,zz),(bx+a+length*.22,bd+.423,zz+.027),(bx+a+length*.50,bd+.423,zz+.006),
          (bx+min(.822,a+length),bd+.422,min(.763,zz+.074))]
    R('Travertine veining',path,.0026 if i%3 else .005,['Marble vein','Marble shadow'][i%2],4)
for off,col in [(-.56,'Cocoa knit'),(.53,'Red cashmere')]:
    B('Folded wool pullover',bx+off,bd+.015,.788,.43,.44,.062,col,.024)
    B('Folded knit yoke',bx+off,bd-.018,.839,.414,.32,.040,col,.018)
    for i in range(14):
        R('Ribbed hem',[(bx+off-.18+i*.027,bd+.23,.805),(bx+off-.18+i*.027,bd+.231,.828)],.002,
          'Red purl' if col=='Red cashmere' else 'Loafer seam',4)
for j in [-1,1]:
    x=bx+j*.066;d=bd+.04+j*.022
    tube('Cordovan loafer welt',[(x,d,.784,.062,.134),(x,d,.800,.064,.14)],'Belt leather',22)
    tube('Polished loafer',[(x,d,.800,.062,.135),(x,d+.006,.818,.063,.131),(x,d-.007,.847,.053,.095),
         (x,d-.035,.869,.044,.065)],'Cordovan',24)
    R('Penny keeper',[(x-.054,d+.014,.839),(x,d+.03,.850),(x+.054,d+.014,.839)],.010,'Loafer seam',8)

# Keep repeated small stitches editable by material without hundreds of Outliner entries.
for prefix in ['Oak grain','Grate bars','Travertine veining','White crossed laces','Ribbed hem','Pinstripe','Beech hanger','Hook']:
    groups={}
    for ob in list(G.group.objects):
        if ob.name.startswith(prefix):groups.setdefault(ob.data.materials[0].name,[]).append(ob)
    for col,obs in groups.items():
        if len(obs)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        for ob in obs:ob.select_set(True)
        bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();obs[0].name=prefix+' · '+col
# Contact between folded knit, adjacent sleeves, trouser legs and soles survives
# the one-material export. Reuse the neighbouring boutique's deterministic trace.
contact=runpy.run_path(str(ROOT.parent/'ssg-brownyard/contact.py'))
contact['bake']([G.group])
for ob in G.group.objects:
    material=ob.data.materials[0]
    if material.name in ('Warm spot','Letters'):
        continue
    shade=ob.data.color_attributes['Shop contact']
    tones=ob.data.color_attributes.new(name='Studio colour',type='BYTE_COLOR',domain='POINT')
    base=material.diffuse_color[:3]
    tones.data.foreach_set('color',[value for vertex in shade.data for value in
        (*[c*vertex.color[0] for c in base],1)])
contact['show_native']([mat for name,mat in G.palette.items() if name not in ('Warm spot','Letters')])
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
camera=bpy.data.cameras.new('GLXY · store view');cam=bpy.data.objects.new(camera.name,camera)
scene.collection.objects.link(cam);cam.location=(-.87,-6.1,1.78)
cam.rotation_euler=(Vector((-.05,.25,1.36))-cam.location).to_track_quat('-Z','Y').to_euler()
camera.lens=27;scene.camera=cam
for label,pos,target,energy,size in [('Daylight',(-2,-4,4.9),(0,0,1),650,5),('Garments',(2.3,-.9,3.30),(.6,1.7,1),220,2.8)]:
    light=bpy.data.lights.new(label,'AREA');light.energy=energy;light.shape='DISK';light.size=size
    ob=bpy.data.objects.new(label,light);scene.collection.objects.link(ob);ob.location=pos
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Shop ambient');scene.world.color=(.3,.3,.3)
scene.render.engine='CYCLES';scene.cycles.samples=10;scene.render.resolution_x=850;scene.render.resolution_y=540
scene.render.resolution_percentage=100
bpy.ops.object.select_all(action='DESELECT');bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'gallery.blend'),compress=True)
runpy.run_path(str(ROOT/'export.py'))
