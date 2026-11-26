"""The branch's brass screw top, broad serving tongs and open glass jar of dressed vegetable strips."""
pickle=part('pickles');section(pickle,'검은 직조 받침과 따로 놓인 금속 뚜껑')
rng=Random(21844)
for key,color in [('straw','cf913b'),('mustard','dda447'),('radish','edbd60'),('carrotStrip','c87939'),('redpepper','a14b28'),('brine','b77c36'),('matA','46443c'),('matB','292a28'),('matC','6a6557'),('brightSteel','e1ded1')]:
    m.palette[key]=m.material(key,color)
B('테두리를 누른 직조 받침',0,0,.001,.158,.154,.004,'matB',.003)
verts=[];faces=[]
for ix in range(15):
    for iz in range(14):
        x=(ix-7)*.00991;d=(iz-6.5)*.01015;ww=.00471 if ix%2 else .00453;wd=.00469 if iz%2 else .00479;z=.0056
        start=len(verts);verts.extend([(x-ww,d-wd,z),(x+ww,d-wd,z+.0008),(x+ww,d+wd,z),(x-ww,d+wd,z+.0006)]);faces.append(tuple(range(start,start+4)))
woven=m.piece('직교해 지나가는 검은 엮임',verts,faces,'matA');woven.data.materials.append(m.palette['matB']);woven.data.materials.append(m.palette['matC'])
for ix,poly in enumerate(woven.data.polygons):poly.material_index=2 if ix%11==6 else (ix//14+ix%14)%2
lidX,lidD=.128,-.045
smooth(C('식탁에 내려놓은 황동 캡',lidX,lidD,.008,[(.044,0),(.049,.003),(.050,.013),(.049,.015),(.045,.016)],'brass',40))
smooth(C('동심으로 눌러 만든 뚜껑 윗면',lidX,lidD,.023,[(.039,0),(.039,.0014),(.035,.0015)],'gold',37))
for j in range(36):
    a=j*tau/36;x=lidX+.0497*cos(a);d=lidD+.0497*sin(a)
    tube('뚜껑 둘레의 촘촘한 홈',[(x,d,.011),(x,d,.019)],.00085,'gold',5)
section(pickle,'짙은 국물과 휘어진 짜사이 채')
smooth(C('채 사이로 보이는 붉은 양념 국물',0,0,.014,[(.043,0),(.051,.006),(.052,.022),(.045,.036),(.039,.043)],'brine',25))
def strip(label,cx,cd,rad,angle,sweep,z,climb,w,thickness,colour,ripple,stretch=1):
    # Each strip meanders across its own chord. The square-edged cut and folds vary along the grain.
    v=[];f=[];steps=7;sideX=-sin(angle);sideD=cos(angle)
    bend=.008+.011*abs(sin(ripple));start=rng.uniform(-.024,.024);curve=sweep*.28
    for i in range(steps):
        t=i/(steps-1);along=(2*t-1)*rad
        off=start+bend*sin(t*1.45*pi+curve)+.0044*sin(t*2.8*pi+ripple)
        h=z+t*climb+.0042*sin(t*tau+ripple)
        width=w*(.37+.63*sin(pi*(.03+.94*t)))
        for e,dh in [(-1,0),(-.10,thickness),(1,thickness*.24)]:
            sx=along*cos(angle)+(off+e*width)*sideX;sd=along*sin(angle)+(off+e*width)*sideD
            # Keep the brined vegetables inside the blown glass, including sharply bent strips.
            maxrad=.060 if stretch==1 else .071;scale=min(1,maxrad/max(.0001,sqrt(sx*sx+sd*sd)))
            v.append((cx+sx*scale,cd+stretch*sd*scale,h+dh+e*.0018*sin(t*pi+ripple)))
        if i:
            n=(i-1)*3;f.extend([(n,n+1,n+4,n+3),(n+1,n+2,n+5,n+4)])
    return smooth(m.piece(label,v,f,colour))
tones=['straw','mustard','radish','carrotStrip','straw','mustard','redpepper']
for j in range(103):
    r=rng.uniform(.023,.057);height=rng.uniform(.023,.104);speed=rng.uniform(-.028,.023)
    strip('병 안의 겹쳐 접힌 짜사이 채',0,0,r,rng.uniform(0,tau),rng.uniform(-2.7,2.7),height,speed,rng.uniform(.0026,.0056),.0026,tones[j%7],rng.random()*5)
for j in range(19):
    a=rng.uniform(0,tau);r=rng.uniform(.037,.054);z=rng.uniform(.033,.108)
    sphere('짜사이의 고추 양념 조각',r*cos(a),r*sin(a),z,.0026,.0015,.0020,'redpepper',7,3)
section(pickle,'접시에 덜어 놓은 절임과 집게')
sx,sd=.112,-.328
smooth(C('얇은 회색 반찬 접시',sx,sd,.002,[(.051,0),(.063,.002),(.094,.012),(.095,.015),(.092,.017),(.081,.013),(.054,.007)],'metal',32,.88))
for j in range(24):
    r=rng.uniform(.014,.058);z=.012+.009*(1-r/.073)+rng.uniform(0,.012)
    strip('반찬 접시에 덜은 길쭉한 채',sx,sd,r,rng.uniform(0,tau),rng.choice([-1,1])*rng.uniform(.7,2.49),z,rng.uniform(-.006,.007),rng.uniform(.0027,.0046),.0015,tones[j%7],rng.uniform(0,6),.81)
for side in [-1,1]:
    v=[];f=[]
    for i,(x,d,z,w) in enumerate([(-.003,side*.012,.089,.008),(-.003,side*.009,.107,.009),(-.017,side*.006,.136,.005),(-.027,side*.002,.175,.005),(-.036,side*.004,.202,.0086),(-.044,side*.011,.235,.0093),(-.050,side*.012,.249,.0071)]):
        start=len(v);v.extend([(x-w,d-.001,z),(x+w,d-.001,z),(x+w,d+.001,z),(x-w,d+.001,z)])
        if i:
            for j in range(4):f.append((start-4+j,start-4+(j+1)%4,start+(j+1)%4,start+j))
    f.extend([(0,1,2,3),(24,25,26,27)]);m.piece('금속 집게의 길고 얇은 판스프링',v,f,'brightSteel')
for side in [-1,1]:
    ob=sphere('집게의 황동 리벳',-.028,side*.0047,.177,.0025,.0014,.0025,'gold',9,5)
tube('집게 손잡이의 둥근 절곡',[(x,d,z) for x,d,z in [(-.050,-.012,.249),(-.051,-.008,.254),(-.052,0,.255),(-.051,.008,.254),(-.050,.012,.249)]],.0029,'steel',7)
glass=part('pickleGlass');section(glass,'입구와 바닥 두께가 남는 투명 나사병')
mat=m.material('황갈색 진짜 유리','e4cd95',0);node=mat.node_tree.nodes.get('Principled BSDF');node.inputs['Transmission Weight'].default_value=.96;node.inputs['IOR'].default_value=1.48;node.inputs['Roughness'].default_value=.105
m.palette['pickleWindow']=mat
smooth(C('안팎 면과 두꺼운 굽을 가진 병',0,0,.007,[(.048,0),(.054,.002),(.058,.009),(.064,.028),(.065,.065),(.060,.092),(.051,.106),(.052,.118),(.053,.125),(.052,.130),(.048,.130),(.047,.126),(.048,.118),(.047,.109),(.055,.094),(.061,.063),(.060,.029),(.054,.012),(.046,.008)],'pickleWindow',36))
thread=[]
for i in range(62):
    a=i*tau*1.68/61;thread.append((.0530*cos(a),.0530*sin(a),.120+.011*i/61))
tube('나선으로 한 바퀴 반 도는 유리산',thread,.0016,'pickleWindow',6)
