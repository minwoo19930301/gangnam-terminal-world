"""Model the A-008 display in actual metres, then fit it to the shared shop frame."""
from pathlib import Path
from math import cos, sin, tau, radians
import sys
import bpy

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
shop=bpy.data.collections.new('AnytimeApparel')
bpy.context.scene.collection.children.link(shop)
tones=dict(lacquer='26272A',steel='ADAEB0',wood='C69A65',white='F5EEE5',oat='D9C8A8',
           ivory='E4DCC5',citron='EDCD61',wine='AE254F',navy='344961',blue='6685AA',
           green='20694B',russet='B9694D',plum='855F88',sage='A8B5A3',black='2E3135',
           clay='CB8C75',taupe='83776E',taupeFold='6E655F',wineFold='932447',amber='CEA647',mint='A4C1B7')
for name,rgb in tones.items():m.palette[name]=m.material(name,rgb,.60 if name=='steel' else 0)

def group(name):
    collection=bpy.data.collections.new(name)
    shop.children.link(collection)
    m.group=collection

def rings(name,rows,finish,segments=12):
    points=[pt for row in rows for pt in row]
    faces=[(k*segments+i,k*segments+(i+1)%segments,(k+1)*segments+(i+1)%segments,(k+1)*segments+i)
           for k in range(len(rows)-1) for i in range(segments)]
    faces.extend([tuple(reversed(range(segments))),tuple(range(len(points)-segments,len(points)))])
    return m.piece(name,points,faces,finish)

def outfit(x,d,neck,colour,angle=0,skirt=None,cardigan=False,short=False):
    a=radians(angle)
    def pt(u,v,h):
        return (x+u*cos(a)-v*sin(a),d+u*sin(a)+v*cos(a),neck+h)
    def ring(cx,cz,w,depth,n=12,fold=.008,cy=0):
        points=[]
        for i in range(n):
            t=tau*i/n
            points.append(pt(cx+w*cos(t),cy+(depth+fold*cos(6*t+.3))*sin(t),cz+.008*cos(3*t)))
        return points
    # A folded-over shoulder, chest ease, and a slightly contracted rib hem.
    rings('몸판과 밑단', [ring(0,h,w,dep) for h,w,dep in
          [(-.69,.203,.066),(-.654,.222,.071),(-.52,.219,.079),
           (-.28,.209,.098),(-.135,.229,.089),(-.064,.185,.065),(0,.086,.041)]],colour)
    for side in [-1,1]:
        sleeve=[(-.144,.198,.067,.064),(-.20,.214,.076,.066),
                (-.31,.241,.075,.064)] if short else [(-.139,.2,.068,.064),
                (-.265,.227,.075,.067),(-.46,.251,.066,.062),(-.638,.269,.051,.042),(-.67,.269,.050,.04)]
        rings('소매와 시보리',[ring(side*cx,h,w,dep,cy=.009) for h,cx,w,dep in reversed(sleeve)],colour)
    # Front placket on cardigans; underlayer creates the white V seen on the right display.
    if cardigan:
        corners=[(-.083,-.072,-.003),(0,-.124,-.30),(.083,-.072,-.003)]
        m.piece('겹쳐 입은 V넥', [pt(*v) for v in corners],[(0,1,2)],'white')
        for side in [-1,1]:
            m.rod('가디건 앞단',[pt(side*.082,-.074,-.008),pt(0,-.126,-.30),pt(.004,-.074,-.644)],.008,colour,5)
        for h,v in [(-.34,-.101),(-.43,-.091),(-.53,-.083),(-.62,-.08)]:
            m.rod('작은 단추',[pt(.01,v,h),pt(.01,v-.009,h)],.009,'wood',7)
    else:
        m.rod('둥근 목둘레',[pt(-.083,-.034,-.005),pt(-.049,-.056,-.036),
               pt(0,-.061,-.047),pt(.049,-.056,-.036),pt(.083,-.034,-.005)],.008,colour,5)
    if skirt:
        slices=48
        levels=[]
        for h,w,dep,pleat in [(-1.37,.30,.155,.024),(-1.28,.297,.15,.024),
                (-.91,.24,.121,.017),(-.63,.171,.095,.008)]:
            levels.append([pt((w+(i%2)*pleat)*cos(tau*i/slices),
                              (dep+(i%2)*pleat)*sin(tau*i/slices),h+.008*cos(tau*i/slices*5)) for i in range(slices)])
        pleats=rings('주름 롱스커트',levels,skirt,slices)
        pleats.data.materials.append(m.palette[skirt+'Fold'])
        for face in list(pleats.data.polygons)[:-2]:
            face.material_index=face.index%2
    # Triangular beech hanger, separate curved hook over the rail.
    m.rod('목제 옷걸이',[pt(-.173,.006,-.062),pt(0,.006,.033),pt(.173,.006,-.062),
          pt(-.173,.006,-.062)],.012,'wood',5)
    m.rod('옷걸이 고리',[pt(0,.004,.027),pt(0,.004,.082),pt(.003,.019,.104),
          pt(.004,.039,.106),pt(.005,.055,.088)],.005,'steel',5)

def rail(x,d,length,h):
    y0,y1=d-length/2,d+length/2
    m.rod('검은 이동식 행거',[(x,y0,.10),(x,y0,h),(x,y1,h),(x,y1,.10)],.016,'lacquer',8)
    m.rod('하부 연결대',[(x,y0,.20),(x,y1,.20)],.012,'lacquer',6)
    for y in [y0,y1]:
        m.rod('가로 받침',[(x-.20,y,.082),(x+.20,y,.082)],.020,'lacquer',8)
        for dx in [-.18,.18]:
            m.rod('바퀴',[(x+dx-.012,y,.053),(x+dx+.012,y,.053)],.042,'lacquer',8)

def stand(x,d,h):
    m.profile('둥근 검은 받침',x,d,0,[(.159,0),(.164,.023),(.130,.033)],'lacquer')
    m.rod('스탠드',[(x,d,.026),(x,d,h)],.015,'lacquer',8)

group('전면 코디와 스탠드')
for x,d,h,c,k in [(1.00,.30,1.52,'navy','taupe'),(.57,.66,1.56,'black','wine'),
                     (-.98,.38,1.40,'ivory',None)]:
    stand(x,d+.04,h+.10)
    outfit(x,d,h,c,skirt=k,cardigan=c!='navy')
group('왼쪽 색상별 티셔츠')
# The photographed rail runs across the opening, exposing each colour from the aisle.
for endpoint in [-1.18,-.34]:
    m.rod('가로 행거 기둥',[(endpoint,1.07,.085),(endpoint,1.07,1.52)],.014,'lacquer')
    m.rod('가로 행거 발',[(endpoint,.88,.08),(endpoint,1.26,.08)],.018,'lacquer')
    for depth in [.90,1.24]:
        m.rod('바퀴',[(endpoint-.014,depth,.045),(endpoint+.014,depth,.045)],.039,'lacquer')
m.rod('색상 행거 봉',[(-1.18,1.07,1.52),(-.34,1.07,1.52)],.016,'lacquer')
m.rod('하부 가로대',[(-1.18,1.07,.13),(-.34,1.07,.13)],.012,'lacquer')
colours=['citron','white','clay','blue','ivory','green','white','wine','oat','blue','navy','sage']
for i,c in enumerate(colours):
    outfit(-1.12+i*.066,1.07,1.42,c,angle=71 if i%2 else 75,short=i%3!=0)
group('오른쪽 니트와 안쪽 행거')
rail(.86,2.37,2.1,1.55)
for i,c in enumerate(['white','sage','green','plum','white','navy','russet','oat','ivory','amber']):
    outfit(.86,1.44+i*.19,1.45,c,angle=16,cardigan=i%3==0)
group('후면 옷걸이와 접은 옷')
m.rod('상의 레일',[(-1.18,5.84,2.03),(1.18,5.84,2.03)],.017,'steel')
for i,c in enumerate(['wine','amber','taupe','black','russet']):
    outfit(-.96+i*.48,5.80,1.93,c,cardigan=i%2==0)
for x in [-.82,.82]:
    m.block('접이식 진열 상판',x,4.71,.71,.68,.62,.045,'wood')
    for side in [-.27,.27]:
        m.block('상판 받침',x+side,4.71,.05,.035,.49,.66,'lacquer')
    for i in range(4):
        m.block('접은 니트',x+.015*cos(i),4.68,.755+i*.051,.45,.37,.051,
                ['navy','ivory','blue','white'][i],.015)
# Shared row scale is derived from the actual gameplay bay; stock is authored in real metres.
for ob in shop.all_objects:
    ob.scale.x=1/.7164814814814943
    ob.scale.y=1/2.068555669357946
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'anytime.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
