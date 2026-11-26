"""The branch-specific mosaic, cubbies and coffee sacks on the customer-facing bar back."""
import math
import bpy

def build_bar(group,obj,cylinder,material):
    previous=set(group.objects)
    black=material('검은 수납 선반',(45,48,47));edge=material('선반 모서리',(65,65,59))
    walnut=material('커피바 따뜻한 뒷판',(157,124,81));shadow=material('선반 안쪽',(53,52,47))
    ceramic=material('차콜색 머그',(74,76,74));inside=material('머그 안쪽',(36,38,37))
    lid=material('유리병 뚜껑 테',(157,156,139));beans=material('원두가 든 투명 병',(107,88,70))
    ivory=material('종이와 도자기',(229,225,210));white=material('글자',(245,242,230))
    burlap=[material('생두 자루 '+str(i),c) for i,c in enumerate([(188,151,101),(202,170,124),(174,139,94),(158,123,82)])]
    colors=[material('지점 포스터 삼각형 '+str(i),c) for i,c in enumerate([
        (229,222,207),(205,183,148),(221,158,153),(138,151,147),(32,49,54),(231,195,184)])]
    blue=material('지점 포스터 바탕',(31,48,56));rose=material('포스터의 연분홍 면',(212,148,153))
    teal=material('포스터의 청록 면',(103,182,179))

    # Shop normal is west. Horizontal display coordinate u increases to the shopper's right (south).
    def pt(u,h,x):return (x,-u,h)
    def box(name,u,base,x,w,h,depth,mat):
        v=[pt(u+du,base+dz,x+dx) for dz in [0,h] for du,dx in [
            (-w/2,-depth/2),(w/2,-depth/2),(w/2,depth/2),(-w/2,depth/2)]]
        return obj(name,v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],[mat])
    def panel(name,points,x,mat):
        return obj(name,[pt(u,h,x) for u,h in points],[tuple(range(len(points)))],[mat])
    def text(name,u,h,x,size,mat,tilt=0):
        cu=bpy.data.curves.new(name,'FONT');cu.body=name;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.resolution_u=3
        cu.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Georgia Bold.ttf',check_existing=True)
        o=bpy.data.objects.new(name,cu);group.objects.link(o);o.location=pt(u,h,x)
        # Local X points south, text normal west. Turn around its local writing normal.
        from mathutils import Matrix
        o.rotation_euler=(Matrix.Rotation(-math.pi/2,4,'Z') @ Matrix.Rotation(math.pi/2,4,'X') @ Matrix.Rotation(tilt,4,'Z')).to_euler()
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        bpy.ops.object.convert(target='MESH');o.data.materials.append(mat);o.select_set(False)
    # The dated photograph resolves one illustrated sign, a pair of cubbies and a band of four light menus.
    box('카운터 뒤 보관장',-.9,1.65,15.38,4.78,.96,.19,black)
    box('잔을 놓는 아래턱',-.9,1.64,15.24,4.80,.055,.35,edge)
    box('커피자루 선반',-.9,2.59,15.29,4.82,.065,.46,edge)
    p=-2.84;w=.78;bottom=1.71;hh=.84
    box('파미에파크 액자',p,bottom-.026,15.236,w+.052,hh+.052,.075,edge)
    def pos(a,b):return (p+(a-.5)*w,bottom+b*hh)
    def shape(name,verts,x,mat):return panel(name,[pos(*v) for v in verts],x,mat)
    shape('포스터의 짙은 바탕',[(0,0),(1,0),(1,1),(0,1)],15.195,blue)
    # Branch poster depicts the triangulated dome in pale gold, pink and off-white.
    rings=[[(.08,.38),(.28,.48),(.47,.55),(.69,.67),(.82,.64)],
           [(.15,.30),(.32,.34),(.58,.40),(.76,.50),(.93,.45)],
           [(.21,.23),(.39,.20),(.64,.24),(.83,.31),(.99,.33)],
           [(.30,.13),(.48,.10),(.69,.09),(.88,.15),(.99,.22)]]
    for row in range(3):
        for j in range(4):
            a,b=rings[row][j:j+2];d,c=rings[row+1][j:j+2]
            for k,triangle in enumerate([(d,c,b),(d,b,a)]):
                center=tuple(sum(v[i] for v in triangle)/3 for i in [0,1])
                inset=[tuple(.95*v[i]+.05*center[i] for i in [0,1]) for v in triangle]
                shape('돔 모자이크 조각',inset,15.189,colors[(3*row+5*j+2*k)%len(colors)])
    shape('장밋빛 앞면',[(0,0),(.81,0),(0,.42)],15.184,rose)
    shape('청록색 앞면',[(.75,0),(1,0),(1,.34)],15.183,teal)
    text('Famille',p-.08,bottom+.72,15.178,.114,white,.15)
    text('Park',p+.035,bottom+.61,15.177,.103,white,.15)

    for u,glass in [(-2.12,False),(-1.60,True)]:
        box('오픈 찻장 뒷면',u,1.71,15.273,.50,.85,.012,shadow)
        for h in [1.72,2.14,2.56]:box('찻장 선반',u,h,15.19,.52,.032,.24,edge)
        for side in [-1,1]:box('찻장 옆면',u+side*.253,1.72,15.2,.02,.86,.22,black)
        for row,z in enumerate([1.755,2.175]):
            for j in range(2):
                su=u+(j-.5)*.20;x=15.17
                if glass:
                    cylinder('커피 원두 보관병',pt(su,z,x),pt(su,z+.21+.015*j,x),.073,beans,16)
                    cylinder('보관병 금속 뚜껑',pt(su,z+.21+.015*j,x),pt(su,z+.235+.015*j,x),.078,lid,16)
                    cylinder('병 아래 유리 굽',pt(su,z+.004,x),pt(su,z+.025,x),.074,lid,16)
                else:
                    cylinder('짙은 세라믹 잔',pt(su,z,x),pt(su,z+.13,x),.062,ceramic,16)
                    cylinder('머그 입구',pt(su,z+.13,x),pt(su,z+.131,x),.051,inside,16)
                    last=None
                    for k in range(8):
                        a=-math.pi/2+k*math.pi/7
                        q=pt(su+.052+.043*math.cos(a),z+.068+.043*math.sin(a),x)
                        if last:cylinder('손잡이',last,q,.008,ceramic,5)
                        last=q

    # Keep price lists and rotating offers unlettered. Indicate the photographed print density.
    rule=material('메뉴 인쇄',(170,166,152))
    for j in range(4):
        u=-1.01+.55*j
        box('검은 테두리 메뉴',u,1.70,15.234,.54,.87,.053,black)
        box('밝은 메뉴 용지',u,1.724,15.201,.494,.82,.009,ivory)
        for k in range(8):
            width=.18+.10*((k+2*j)%4)/3
            box('메뉴 인쇄 행',u-.19+width/2,2.355-k*.064,15.193,width,.007,.003,rule)
    # Top shelf holds horizontally stacked, loosely filled burlap sacks.
    for i,(u,length,depth,h) in enumerate([(-2.66,.87,.34,.16),(-1.71,1.03,.36,.20),(-1.95,.77,.29,.17),(.62,.88,.36,.17)]):
        base=2.66+(.165 if i==2 else 0);v=[];f=[];m=[]
        for row in range(7):
            t=row/6;rad=(.18+.82*math.sin(math.pi*t)**.58)
            for k in range(12):
                a=k*math.tau/12
                x=15.29+depth*.5*rad*math.cos(a)
                z=base+h*(.50+.46*rad*math.sin(a))+.014*math.sin(row*1.12+a)
                v.append(pt(u+(t-.5)*length,z,x))
        for row in range(6):
            for k in range(12):
                n=row*12+k;q=row*12+(k+1)%12
                f.append((n,n+12,q+12,q));m.append((i+int(k%4==0))%4)
        f.extend([tuple(reversed(range(12))),tuple(range(72,84))]);m.extend([2,2])
        obj('포개 놓은 생두 마대',v,f,burlap,m)
    for piece in set(group.objects)-previous:piece.location.z+=.16

    # The counter photograph shows a clear two-tier food case to the left,
    # with colourful take-home packages and a tilted black till at the other end.
    steel=material('쇼케이스 스테인리스',(154,161,159));glint=material('유리 판끝의 청록빛',(166,197,192))
    dark=material('냉장 쇼케이스 검은 테',(44,46,45));cake=material('밝은 빵 속',(220,179,120))
    cocoa=material('초콜릿색 케이크 층',(94,62,46));frosting=material('옅은 크림',(242,219,174))
    berry=material('붉은 과일층',(178,85,77));leaf=material('포장 라벨의 옅은 녹색',(133,170,133))
    mint=material('민트색 선물 상자',(122,196,181));pink=material('산호색 포장',(208,138,143))
    case_start=set(group.objects)
    # Low rails and the green glass edges keep the case see-through in the one opaque draw.
    center=-2.03;width=2.18;counter_x=13.99;base=1.06
    box('제과 쇼케이스 하부',center,base,counter_x,width,.09,.86,dark)
    for h in [1.22,1.61]:
        box('진열 유리 선반 가장자리',center,h,13.575,width,.013,.024,glint)
        box('안쪽 진열 선반',center,h,14.00,width-.07,.013,.76,steel)
    for u in [center-width/2,center+width/2]:
        for x in [13.57,14.40]:box('쇼케이스 가는 수직 모서리',u,base+.08,x,.021,.82,.021,steel)
        box('위쪽 유리 측면',u,base+.91,13.99,.022,.019,.85,glint)
    for x in [13.57,14.4]:box('쇼케이스 위 가로 테',center,base+.91,x,width,.026,.022,glint)
    box('케이스 하단 가림판',center,base+.10,13.56,width,.085,.040,dark)
    def loaf(name,u,x,z,w,d,h):
        v=[];faces=[]
        for n in range(7):
            t=n/6;scale=.57+.43*math.sin(math.pi*t)
            for k in range(9):
                a=math.pi*k/8
                v.append(pt(u+w*(t-.5),z+h*math.sin(a)*scale,x+math.cos(a)*d*.5*scale))
        for n in range(6):
            for k in range(8):
                j=n*9+k;faces.append((j,j+9,j+10,j+1))
        faces.extend([tuple(range(8,-1,-1)),tuple(range(54,63))])
        return obj(name,v,faces,[cake])
    for j in range(6):
        u=center-width*.39+j*(width*.78/5)
        if j%3==1:
            box('종이 포장 샌드위치',u,1.238,13.93,.265,.146,.223,ivory)
        else:
            loaf('둥근 포장 빵',u,13.93,1.238,.278,.241,.151)
        box('접은 포장의 앞면',u,1.237,13.807,.232,.082,.014,ivory)
        box('종이 포장 띠',u-.024,1.244,13.798,.043,.047,.006,leaf if j%3==0 else frosting)
    for j in range(5):
        u=center-.82+.405*j;x=13.94
        cylinder('백색 받침',pt(u,1.626,x),pt(u,1.642,x),.13,ivory,16)
        cylinder('디저트 받침의 굽',pt(u,1.64,x),pt(u,1.691,x),.039,ivory,12)
        cylinder('흰 접시',pt(u,1.689,x),pt(u,1.709,x),.15,ivory,20)
        if j==0:
            box('초콜릿 케이크',u,1.711,x,.166,.091,.149,cocoa)
            for k in range(5):
                a=math.tau*k/5
                cylinder('크림 장식',pt(u+.03*math.cos(a),1.802,x+.031*math.sin(a)),
                         pt(u+.03*math.cos(a),1.822,x+.031*math.sin(a)),.020,frosting,8)
        elif j==2:
            cylinder('노란 원형 케이크',pt(u,1.711,x),pt(u,1.83,x),.11,cake,28)
            cylinder('얇은 윗면 아이싱',pt(u,1.83,x),pt(u,1.84,x),.111,frosting,28)
        elif j==4:
            loaf('황금색 구움과자',u,x,1.713,.23,.145,.12)
        else:
            for n,col in enumerate([cake,berry if j==3 else cocoa,frosting,cake]):
                a,b,c=pt(u-.101,1.713+n*.027,x-.07),pt(u+.105,1.713+n*.027,x-.07),pt(u+.065,1.713+n*.027,x+.102)
                top=[(vx,vy,vz+.027) for vx,vy,vz in [a,b,c]]
                obj('진열판의 케이크 조각',[a,b,c,*top],[(2,1,0),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],[col])
        box('작은 진열 카드',u+.045,1.635,13.69,.095,.047,.009,black)

    for piece in set(group.objects)-case_start:
        for v in piece.data.vertices:v.co.z=base+.85*(v.co.z-base)

    for u,x,h,w,d,col in [(-.61,13.83,.25,.18,.18,mint),(-.40,13.92,.32,.18,.16,ivory),
                             (-.18,13.87,.22,.19,.18,mint),(-.34,14.10,.39,.16,.14,mint),
                             (.06,13.91,.19,.16,.15,pink),(.23,13.96,.16,.16,.17,ivory)]:
        box('테이크홈 진열 상자',u,base,x,w,h,d,col)
        box('패키지 앞 띠',u-.035,base+.009,x-d/2-.003,.026,h-.018,.005,white)
    # Dark register from the customer's side; no editable payment interface is depicted.
    box('계산대 받침',.78,base,14.07,.33,.045,.25,dark)
    box('계산대 목',.78,base+.04,14.07,.15,.18,.10,black)
    screen=box('기울인 계산 화면',.78,base+.20,14.03,.50,.27,.043,dark)
    # Tilt the top away while retaining the foot of the screen.
    for v in screen.data.vertices:v.co.x+=(v.co.z-base-.20)*.35
