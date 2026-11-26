"""Original editable food and packaging for the photographed Gangnam deli products."""
from math import sin,cos,pi,tau,sqrt,exp
from random import Random
import bpy
from mathutils import Vector

def make_products(studio):
    group,mat,mesh,block,profile,rod,text,ellipse,rounded=studio
    rng=Random(923)
    for name,hexcode,rough in [
        ('kraft','cda77e',.73),('fold','b48a61',.79),('brim','ddc49d',.68),('blacktray','282925',.47),
        ('lid','d9d7c7',.15),('clearline','e9e2d0',.23),('red','8d3525',.30),('sauce','762e19',.29),
        ('fried','bf792f',.84),('deepfried','b57a38',.79),('crumb0','dfaa55',.81),('crumb1','cb8c39',.82),
        ('crumb2','edc88a',.80),('crumb3','9f612c',.80),('tail','b96b43',.53),('tailtip','ce9a69',.51),
        ('rice','e8dec6',.68),('grain','f0e7d2',.63),('nori','464a31',.46),('norisheen','6f7050',.51),
        ('egg','eeb950',.54),('eggBright','f8d371',.5),('cucumber','748f4f',.58),('leaf','759254',.55),
        ('ebi','e7b79a',.47),('ebitop','ebb49a',.46),('stripe','ce8462',.52),('vein','a7734c',.58),
        ('white','f4ead5',.7),('scallion','73904b',.58),('spring','a7b26c',.64),('cabbage','bf856f',.60),
        ('yellow','edc557',.58),('scarlet','c9553c',.48),('mushroom','776044',.53),
        ('noodle','a46937',.34),('noodleDark','743f21',.38),('celery','48902d',.49),('pepper','d6311e',.38),('wetegg','f0cb2b',.49),('woodEar','503524',.36),('kombu','66513e',.44),('sesame','d5b884',.66),('peel','f1d0b5',.56),
        ('sticker','eeeade',.63),('darkprint','373935',.72),('goldleaf','c4a261',.63),('shadetray','332e27',.56)
    ]:mat(name,hexcode,rough)
    # Only the original Blender dishes use this dielectric shader. The baked food
    # retains the shapes beneath the lid without screen-space refraction at runtime.
    for name,colors in [('fried',('9b5b25','e6ad57')),('deepfried',('885722','d19743')),('sauce',('5e2719','973e23'))]:
        material=mat(name,colors[0],.75)
        nodes=material.node_tree.nodes;links=material.node_tree.links;bsdf=nodes['Principled BSDF']
        noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=55.;noise.inputs['Detail'].default_value=3.4
        ramp=nodes.new('ShaderNodeValToRGB')
        for stop,code,pos in zip(ramp.color_ramp.elements,colors,[.29,.71]):
            rgb=[int(code[i:i+2],16)/255 for i in (0,2,4)]
            stop.color=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,);stop.position=pos
        links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],bsdf.inputs['Base Color'])
        bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.27;bump.inputs['Distance'].default_value=.00007 if name=='sauce' else .00065
        links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs[0],bsdf.inputs['Normal'])
    clear=mat('clearPET','e4eadf',.12)
    bs=clear.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Transmission Weight'].default_value=.95
    bs.inputs['IOR'].default_value=1.47

    def ring(x,y,w,d,r,z,steps=5):
        pts=[]
        for i,(xx,yy) in enumerate([(w/2-r,d/2-r),(-w/2+r,d/2-r),(-w/2+r,-d/2+r),(w/2-r,-d/2+r)]):
            for j in range(steps+1):
                a=(i+j/steps)*pi/2
                pts.append((x+xx+r*cos(a),y+yy+r*sin(a),z))
        return pts
    def pack_shell(x,y,kind,w,d):
        circular=kind=='salad'
        def contour(scale,z):
            if circular:
                return [(x+scale*w*.5*cos(tau*i/8+pi/8),y+scale*d*.5*sin(tau*i/8+pi/8),z) for i in range(8)]
            return ring(x,y,w*scale,d*scale,.016*scale,z)
        sections=[(.81,0),(.87,.002),(.99,.024),(1,.026),(.99,.030),(.95,.030),(.91,.025),(.81,.006)]
        loops=[contour(sc,h) for sc,h in sections]
        n=len(loops[0])
        faces=[(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for k in range(len(loops)-1) for i in range(n)]
        faces += [tuple(reversed(range(n))),tuple(range(n*(len(loops)-1),n*len(loops)))]
        mesh('용기 · 접어 올린 가장자리와 바닥',sum(loops,[]),faces,'kraft' if kind=='fried' else 'blacktray')
        rod('용기 · 테두리를 한 바퀴 도는 턱',contour(.984,.031)+[contour(.984,.031)[0]],.00125,'brim' if kind=='fried' else 'norisheen',6)
        # A real clear lid has a flat label zone, an angled side and raised rim.
        cover=[contour(scale,h) for scale,h in [(.995,.031),(1.008,.034),(.994,.036),(.904,.065),(.871,.069),(.844,.069)]]
        n=len(cover[0]);fs=[(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for k in range(len(cover)-1) for i in range(n)]
        fs.append(tuple(range(n*(len(cover)-1),n*len(cover))))
        obj=mesh('포장 · 투명 PET 덮개',sum(cover,[]),fs,'clearPET')
        # Hide only from top orthophotos. The original can be inspected with lids on.
        obj['transparent_lid']=True
        for sc,zz in [(.994,.035),(.878,.068)]:
            line=contour(sc,zz)
            rod('포장 · 눌러 성형한 모서리',line+[line[0]],.00065,'clearline',5)
        return contour

    def price_label(x,y,z,title,price,width=.067):
        d=.051
        block('포장 · 흰 품목 스티커',x,y,z,width,d,.00065,'sticker')
        block('스티커 · 검은 상호 띠',x,y+d*.37,z+.00072,width,.011,.00032,'darkprint')
        text('DELI by ASHLEY',x,y+d*.37,z+.0016,.0048,'white',horizontal=True,style='serif')
        text(title,x,y+.002,z+.0015,.0059,'darkprint',horizontal=True,style='ko')
        text(price,x,y-.010,z+.0015,.0071,'darkprint',horizontal=True)
        for j in range(25):
            xx=x-width*.34+j*width*.026
            block('상품 스티커 · 간격이 다른 바코드 선',xx,y-.018,z+.00076,.00044 if j%3 else .00079,.008,.00025,'darkprint')
    # A scatter of tiny convex solids is stored per ingredient, so every physical
    # texture and its silhouette come from the original model, including crumb shadows.
    def particles(name,spots,color,token):
        verts=[];faces=[]
        for (x,y,z,rx,ry,rz,angle) in spots:
            n=len(verts);ca,sa=cos(angle),sin(angle)
            for xx,yy,zz in [(-.91,0,0),(-.25,-.88,0),(.83,-.5,0),(.82,.50,.03),(-.27,.94,-.04),(-.12,-.03,1),(.05,.04,-.57)]:
                verts.append((x+rx*xx*ca-ry*yy*sa,y+rx*xx*sa+ry*yy*ca,z+rz*zz))
            for i in range(5):faces.extend([(n+i,n+(i+1)%5,n+5),(n+(i+1)%5,n+i,n+6)])
        if verts:
            obj=mesh(name,verts,faces,color)
            obj['ingredient']=token

    def tail(x,y,z,heading):
        ca,sa=cos(heading),sin(heading)
        def pt(a,b,h):return(x+a*ca-b*sa,y+a*sa+b*ca,z+h)
        for sign in [-1,1]:
            verts=[pt(0,0,0),pt(.009,sign*.002,.0015),pt(.024,sign*.012,.006),
                   pt(.022,sign*.006,.0065),pt(.009,0,.003)]
            mesh('새우 꼬리 · 투명한 두 갈래 꼬리부채',verts,[(0,1,4),(1,2,3,4)],'tailtip')
            rod('새우 꼬리 · 가는 주황 선',[pt(.002,0,.001),pt(.012,sign*.004,.003),pt(.022,sign*.009,.0066)],.00047,'tail',5)

    def fried_body(x,y,z,heading,length):
        ca,sa=cos(heading),sin(heading)
        def pt(a,b,h):return (x+a*ca-b*sa,y+a*sa+b*ca,z+h)
        n=14;m=15;vertices=[];faces=[];centres=[]
        def sample(t):
            spread=max(.10,sin(pi*t)**.52)
            return ((t-.5)*length,.011*sin(t*pi*1.32),.012+.005*cos(pi*.7*t),(.0156-.008*t)*spread,(.0121-.005*t)*spread)
        for j in range(m+1):
            t=j/m;cx,cy,cz,rr,rz=sample(t)
            for i in range(n):
                a=tau*i/n
                vertices.append(pt(cx,cy+rr*cos(a)*(1+rng.uniform(-.13,.13)),cz+rz*sin(a)*(1+rng.uniform(-.14,.14))))
            if j:
                for i in range(n):
                    k=(j-1)*n+i;faces.append((k,(j-1)*n+(i+1)%n,j*n+(i+1)%n,j*n+i))
        mesh('새우튀김 · 굽은 몸체',vertices,faces,'fried')
        per_tint=[[] for _ in range(4)]
        for _ in range(965):
            t=rng.uniform(.03,.98);a=rng.uniform(-.15,pi+.15);cx,cy,cz,rr,rz=sample(t)
            X,Y,Z=pt(cx,cy+rr*cos(a),cz+rz*sin(a))
            per_tint[rng.randrange(4)].append((X,Y,Z,rng.uniform(.0008,.0026),rng.uniform(.0005,.0013),rng.uniform(.00055,.0017),rng.uniform(0,tau)))
        for i,items in enumerate(per_tint):particles('빵가루 · 얇고 굵은 튀김옷',items,'crumb'+str(i),'bread crumbs')
        X,Y,Z=pt(length*.46,-.004,.012)
        tail(X,Y,Z,heading)

    fried=group('한입새우튀김 포장','fried',(0,0,0))
    pack_shell(0,0,'fried',.228,.163)
    for row in range(5):
        x=-.027 if row<3 else -.032;y=-.053+.0247*row
        fried_body(x,y,.011+(row%2)*.004,rng.uniform(-.20,.20),rng.uniform(.107,.132))
    for row in [0,1]:fried_body(.034,.029+row*.022,.016,.24,.079)
    profile('소스컵 · 맑은 작은 플라스틱 용기',.071,-.040,.008,[(.020,0),(.028,.017),(.028,.019),(.027,.020),(.022,.003)],'clearline',26)
    profile('새우튀김 · 붉은 소스',.071,-.040,.012,[(.022,0),(.026,.012),(.024,.015)],'sauce',28)
    price_label(.052,.006,.070,'한입새우튀김','3,990')
    # Black rectangular sushi container with two distinct sides: flower-like
    # cut rolls and shrimp-topped rice. Rice and roe are individually raised.
    maki=group('김가루 롤 포장','maki',(1.09,0,0))
    X=1.09;pack_shell(X,0,'maki',.246,.154)
    for i in range(8):
        xx=X-.077+(i//2)*.051;yy=-.028+(i%2)*.056
        profile('롤 · 김을 두른 단면',xx,yy,.007,[(.019,0),(.021,.004),(.021,.030),(.020,.034)],'nori',25,.92)
        profile('롤 · 흰 밥',xx,yy,.039,[(.0198,0),(.0195,.0035)],'rice',26,.91)
        for col,(dx,dy,rx,ry,tone) in enumerate([(-.003,0,.0072,.006,'egg'),(.006,.002,.004,.006,'cucumber'),(.002,-.005,.0048,.004,'fried')]):
            ellipse('롤 · 달걀과 채소 속',xx+dx,yy+dy,.042,rx,ry,.003,tone)
        grains=[]
        for j in range(58):
            a=rng.uniform(0,tau);r=rng.uniform(.010,.0183)
            grains.append((xx+r*cos(a),yy+r*.91*sin(a),.043,rng.uniform(.0012,.0020),.00075,.0009,a))
        particles('흰쌀 · 낱알',grains,'grain','rice')
        flecks=[]
        for j in range(120):
            a=rng.uniform(0,tau);r=rng.uniform(.0194,.0214)
            flecks.append((xx+r*cos(a),yy+.91*r*sin(a),rng.uniform(.012,.044),.0019,.0007,.0008,a))
        particles('겉 · 푸른 김가루',flecks,'leaf','green seaweed')
        for j in range(8):
            a=tau*j/8
            rod('김 · 얇은 윤기',[(xx+.0208*cos(a+.02*k),yy+.0191*sin(a+.02*k),.011+k*.0041) for k in range(6)],.00045,'norisheen',4)
    price_label(X+.056,.014,.070,'롤 모둠','3,990')
    sushi=group('새우롤 포장','sushi',(.36,0,0))
    X=.36;pack_shell(X,0,'sushi',.246,.154)
    for j in range(8):
        xx=X-.079+(j%4)*.052;yy=-.032+(j//4)*.064
        ellipse('새우롤 · 초밥 몸체',xx,yy,.024,.019,.029,.015,'rice')
        ellipse('새우롤 · 접힌 흰살',xx,yy,.039,.016,.028,.010,'ebi')
        for k in range(5):
            y0=yy-.021+.009*k;ww=.014*(.85+.15*sin(pi*(k+1)/6))
            mesh('익힌 새우 · V자 주황 띠',[(xx-ww,y0+.004,.046),(xx,y0-.003,.051),(xx+ww,y0+.004,.046),
                (xx+ww*.88,y0+.0075,.0465),(xx,y0+.0002,.0512),(xx-ww*.88,y0+.0075,.0465)],[(0,1,4,5),(1,2,3,4)],'stripe')
        for k in range(4):
            a=rng.uniform(0,tau);dx=.008*cos(a);dy=.008*sin(a)
            rod('새싹채소 · 줄기',[(xx,yy,.047),(xx+dx,yy+dy,.053),(xx+1.8*dx,yy+1.8*dy,.061)],.00065,'scallion',4)
            ellipse('새싹채소 · 떡잎',xx+1.8*dx,yy+1.8*dy,.061,.0032,.0016,.0011,'spring')
    price_label(X+.038,.024,.070,'새우롤','3,990')
    salad=group('팔각 양장피 포장','salad',(.73,0,0));X=.73
    pack_shell(X,0,'salad',.226,.207)
    # A densely filled base is visible below the six separate toppings in the
    # branch photograph. Each noodle curves within the octagonal tray footprint.
    for k in range(235):
        a=rng.uniform(0,tau);r=.082*sqrt(rng.random());phase=rng.uniform(0,tau)
        cx,cy=r*cos(a),r*.89*sin(a)
        pts=[]
        for j in range(11):
            t=j/10;dr=.0065*sin(t*5.7+phase)
            xx=cx+(t-.5)*.030*cos(a+1.2)+dr*cos(a)
            yy=cy+(t-.5)*.030*sin(a+1.2)+dr*sin(a)
            pts.append((X+xx,yy,.013+(k%10)*.00075+.0023*sin(t*4+phase)))
        rod('양장피 · 윤이 나는 당면과 목이채',pts,.00155 if k%3 else .0024,['noodle','noodleDark','woodEar'][k%3],6)
    for sector,tone in enumerate(['wetegg','pepper','peel','noodle','celery','wetegg']):
        angle=tau*(sector+.5)/6
        for k in range(64):
            a=angle+rng.uniform(-.46,.46);r=rng.uniform(.029,.084)
            x=X+r*cos(a);y=r*.91*sin(a);height=rng.uniform(.022,.041)
            if sector==2:
                if k%5:continue
                rx=.010 if k%3 else .013
                points=[(x+rx*cos(a+j*.39),y+.78*rx*sin(a+j*.39),height+.002*sin(j/9*pi)) for j in range(10)]
                rod('양장피 · 굽은 칵테일 새우',points,.0044,'peel',8)
                for j in [2,5,7]:
                    t=a+j*.39
                    rod('칵테일 새우 · 얇은 주황 마디',[(x+(rx+q)*cos(t),y+(.78*rx+q)*sin(t),height+.004) for q in [-.003,.003]],.00073,'stripe',4)
            else:
                span=rng.uniform(.009,.022);axis=a+rng.uniform(-.47,.87)
                dx=span*cos(axis);dy=span*sin(axis)
                bend=rng.uniform(-.007,.007);slope=rng.uniform(-.004,.004)
                path=[(x-dx,y-dy,height-.004),(x-dx*.5+bend*.4,y-dy*.51,height-.002),
                      (x+bend,y+bend*.5,height+.001),(x+dx*.45+bend*.7,y+dy*.5,height+slope),
                      (x+dx,y+dy,height+slope-.001)]
                rod('양장피 · 가늘게 채 썬 고명',path,rng.uniform(.0012,.0022),tone,6)
    profile('겨자장 소스컵',X,-.001,.015,[(.021,0),(.027,.020),(.026,.024),(.022,.026)],'goldleaf',20)
    price_label(X+.017,.007,.071,'잔치양장피','5,990')
    return [('fried',fried,.228,.163),('sushi',sushi,.246,.154),('salad',salad,.226,.207),('maki',maki,.246,.154)]
