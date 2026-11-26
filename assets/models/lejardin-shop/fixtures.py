"""Cream limestone portal, folding timber leaves, illuminated cooler, glassware and flower wrapping."""
from math import cos,sin,tau,pi
from random import Random
from pathlib import Path
from mathutils import Vector
import bpy
import blender_shop_mesh as m
import botany

def title(name,word,x,d,z,width,height,key,font_paths=(),thick=.008):
    data=bpy.data.curves.new(name,'FONT');data.body=word;data.align_x='CENTER';data.align_y='CENTER';data.extrude=thick
    for path in font_paths:
        if Path(path).is_file():data.font=bpy.data.fonts.load(path,check_existing=True);break
    data.bevel_depth=.0008;data.resolution_u=8
    ob=bpy.data.objects.new(name,data);m.group.objects.link(ob);ob.rotation_euler=(pi/2,0,pi);ob.location=(x,-d,z)
    data.materials.append(m.palette[key]);bpy.context.view_layer.update()
    # Keep only the mesh outlines in the native file, so the source is portable across systems.
    me=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()));me.name=name
    obj=bpy.data.objects.new(name+' · 채널 윤곽',me);m.group.objects.link(obj)
    pts=[p.co for p in me.vertices];sx=width/(max(v.x for v in pts)-min(v.x for v in pts));sy=height/(max(v.y for v in pts)-min(v.y for v in pts))
    obj.location=ob.location;obj.rotation_euler=ob.rotation_euler;obj.scale=(sx,sy,1)
    bpy.data.objects.remove(ob,do_unlink=True);bpy.data.curves.remove(data)
    return obj
serif=['/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf']
def shell():
    rnd=Random(73)
    # The shell collection sits at the centre of the bay, depth 2.5 m.
    for i in range(6):
        for j in range(5):
            x=(i-2.5)*1.16;d=(j-2)*.99
            m.block('줄눈이 얇은 유광 바닥 타일',x,d,.020,1.155,.986,.038,rnd.choice(['floor','floor','floorCool']),.0014)
            for k in range(rnd.randrange(1,4)):
                sx=x+rnd.uniform(-.46,.20);sd=d+rnd.uniform(-.32,.38);length=rnd.uniform(.18,.58)
                p=[(sx+length*f,sd+.055*sin(5*f+k)+f*.040,.0585) for f in [0,.26,.56,.81,1]]
                m.rod('대리석의 밝은 잔결',p,rnd.uniform(.0007,.0021),'vein',3)
    for side in [-1,1]:m.block('매장 측벽',side*3.46,0,.06,.085,5.0,3.17,'wall')
    m.block('안쪽 작업대 바탕 벽',0,2.46,.06,6.97,.073,3.17,'wall')
    m.block('백색 천장과 들여놓은 매립등',0,.12,3.225,6.97,5.18,.075,'white')
    for x in [-2.5,-.75,1.08,2.55]:
        for d in [-1.43,.41,1.71]:
            m.profile('천장 매립등 테두리',x,d,3.213,[(.070,0),(.067,.007)],'brass',22)
            m.profile('매립등 유백 렌즈',x,d,3.208,[(.053,0),(.057,.006)],'glow',18)
def portal():
    # Below the sign, two bronze folding leaves are parked against each jamb.
    m.block('크림색 석재 인방',0,-.10,2.58,7.00,.57,.71,'limestone',.009)
    for x in [-2.42,-.78,.84,2.46]:m.block('석재 사이 세로 줄눈',x,-.392,2.60,.007,.01,.68,'joint')
    m.block('인방 위 루버 그림자',0,-.08,3.276,6.96,.39,.208,'joint')
    for k in range(8):m.block('밝은 수평 루버 핀',0,-.29,3.28+k*.026,6.94,.08,.014,'stoneEdge',.003)
    for x in [-3.29,3.31]:
        m.block('주두와 받침 석재',x,-.11,.056,.49,.67,.16,'limestone',.01)
        m.block('세로 홈 기둥의 몸통',x,-.045,.20,.409,.51,3.09,'limestone',.008)
        for i in range(8):
            sx=x+(i-3.5)*.049
            m.block('기둥 전면 채널의 그림자',sx,-.309,.23,.019,.015,2.91,'flute',.006)
            m.block('기둥 홈의 좁은 빛선',sx-.010,-.318,.24,.009,.013,2.90,'stoneEdge',.003)
        for z,w,h in [(3.06,.48,.08),(3.14,.53,.066),(3.206,.57,.057)]:m.block('높이가 다른 주두 몰딩',x,-.075,z,w,.59,h,'stoneEdge',.009)
    for side in [-1,1]:
        for i in range(3):
            x=side*(2.07+i*.34);m.block('짙은 목재 폴딩 도어',x,.023,.06,.313,.135,2.51,'wood'+str(i%2),.008)
            for edge in [-.144,.144]:m.block('세로 동제 테두리',x+edge,-.047,.078,.012,.035,2.48,'darkBronze')
            for z in [.18,1.24,2.331]:m.block('폴딩 도어 이음 장식',x,-.055,z,.306,.031,.023,'brass',.004)
            m.block('세로 손잡이 덮개',x,-.070,1.08,.042,.03,.29,'darkBronze',.006)
def brand():
    title('백색 세리프 입체 글자','LEJARDIN',0,0,.238,3.22,.388,'letter',serif,.018)
def cooler():
    m.block('검은 철제 하부 몸통',0,0,0,3.14,.817,.21,'steel',.021)
    m.block('유리창 위 넓은 검정 헤더',0,0,1.75,3.14,.817,.272,'steel',.015)
    m.block('빛을 받은 진열장 뒷판',0,.366,.178,3.06,.04,1.59,'mirror')
    for x in [-1.54,1.54]:m.block('냉장고의 닫힌 옆판',x,0,.18,.06,.76,1.60,'steel',.005)
    for z in [.165,.680,1.184,1.72]:
        m.block('유리 선반의 광택 있는 앞 테',0,-.392,z,3.12,.045,.031,'shelfEdge',.005)
        m.block('밝은 선반 하부 띠',0,-.310,z+.021,3.02,.023,.011,'glow')
        if z<1.6:m.block('절화 냉장고 선반',0,-.025,z+.008,3.04,.641,.032,'mirror',.004)
    for x in [-1.51,-.508,.508,1.51]:
        m.block('슬라이딩 유리의 세로 프레임',x,-.398,.20,.026,.045,1.54,'steel',.004)
        m.block('프레임 안 수직 LED',x+.015,-.372,.213,.007,.016,1.51,'glow')
    for k in range(29):m.block('하부 방열 슬롯',-1.34+k*.096,-.414,.058,.062,.005,.009,'black')
    title('상단 오른쪽 백색 서명','Lejardin',-1.29,-.423,1.87,.31,.062,'white',serif,.001)
def doors():
    for x in [-1.017,0,1.017]:
        m.block('얇은 반사 유리',x,0,0,.973,.004,1.54,'glass')
        m.block('유리 문 앞 타원 손잡이',x+.442,-.044,.68,.015,.035,.219,'clearEdge',.005)
def vaseware():
    for row in range(3):
        for ix in range(9):
            x=(ix-4)*.33;z=row*.505
            m.profile('물을 채운 여러 높이의 화병',x,0,z,[(.055,0),(.062,.012),(.061,.085),(.075,.217),(.075,.224),(.070,.224),(.056,.014)],'glass',18,.78)
            m.profile('물 표면과 푸른 유리 테',x,0,z+.114,[(.065,0),(.064,.003)],'water',18,.79)
def counter():
    m.block('안쪽 꽃 손질용 무광 주문대',0,0,0,2.71,.71,.90,'steel',.024)
    m.block('카운터의 짙은 돌판',0,-.03,.89,2.75,.78,.039,'black',.014)
    m.block('간접등 받침의 뒤로 들어간 하부',0,-.313,.05,2.65,.10,.104,'joint',.005)
    m.block('주문대 아래 따뜻한 선형 조명',0,-.376,.055,2.61,.016,.019,'glow')
    for x in [-.97,-.64,-.31,.02,.35,.68,1.01]:m.block('전면 가는 이음',x,-.359,.18,.005,.008,.59,'joint')
def stand():
    for x in [-.18,.18]:
        for d in [-.15,.15]:m.rod('회전 카드대 프레임',[(x,d,.018),(x,d,1.36)],.008,'black',6)
    for z in [.09,.49,.84,1.19]:
        m.block('카드 받침의 검은 선반',0,0,z,.47,.35,.023,'steel',.004)
        for i in range(4):
            x=(i-1.5)*.094
            m.block('분홍 꽃 카드와 봉투',x,-.103,z+.029,.086,.018,.143,['paperPink','white','paperBlush','kraft'][i],.002)
            for j in range(3):m.block('카드의 엷은 인쇄선',x,-.114,z+.056+j*.017,.057-.007*j,.002,.003,'ink')
        for h in [.03,.083]:m.rod('엽서가 넘어가지 않는 가는 철사',[(-.213,-.166,z+h),(.213,-.166,z+h)],.0033,'black',5)
    m.block('작은 안내판의 크림지',0,0,1.38,.298,.018,.16,'white',.005)
def sleeve(base,angle,width,height,key,index):
    rnd=Random(320+index);n=15;pts=[];faces=[]
    for row,(r,z) in enumerate([(.040,.017),(.055,height*.39),(.10,height*.67),(width,height)]):
        for j in range(n+1):
            t=j/n;a=angle+(-.67+1.34*t)*pi
            R=r*(.91+.11*cos(5*a+index));h=z+(max(0,1-abs(2*t-1))**1.9*.07-.035*cos(t*pi*3))*row/3
            pts.append((base[0]+R*cos(a),base[1]+R*sin(a),h))
    for j in range(3):
        for k in range(n):i=j*(n+1)+k;faces.append((i,i+1,i+n+2,i+n+1))
    ob=m.piece('접힌 포장지 층',pts,faces,key)
    return ob
def bouquet(mixed):
    rnd=Random(277 if mixed else 281);colors=['kraft','paperSoft','vellum'] if mixed else ['paperBlush','ivoryPaper','vellum']
    for i in range(3):sleeve((0,0),i*2.07,.165-i*.014,.39-i*.032,colors[i],i)
    m.profile('아랫단의 좁은 포장지 매듭',0,0,0,[(.035,0),(.055,.025),(.046,.104),(.065,.16)],'kraft' if mixed else 'ivoryPaper',17,.73)
    for k in range(3):m.rod('꽃다발 리본',[(-.035,0,.142),(-.065+k*.044,-.027,.106),(-.074+k*.05,-.061,.054)],.0032,'ribbon',5)
    keys=['gerbera','pinkMum','rose','anthurium','ranunculus','lisianthus','greenHydra'] if mixed else ['hydrangea','lisianthus','whiteLis','hydrangea','lisianthus','greenHydra']
    for i,key in enumerate(keys):
        a=2.39996*i;r=.107*((i+.45)/len(keys))**.6;x=r*cos(a);d=r*sin(a)
        botany.stem((x*.26,d*.27,.144),(x,d,.429+.042*cos(i*2.11)),key,rnd,1.18 if key=='hydrangea' else 1.08)
    for i in range(8):botany.leaf((.057*cos(i),.057*sin(i),.29),i*.79,.107,.024,.115,'sage' if i%2 else 'leaf')
