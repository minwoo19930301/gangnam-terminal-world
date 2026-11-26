"""Editable toppings and bakery forms, in metres local to each serving set."""
from math import sin,cos,pi,tau,sqrt
from random import Random
import blender_shop_mesh as m

def make_sweets(group,ball,ribbon,loft):
    B=m.block;P=m.profile;R=m.rod
    rng=Random(1920897502)
    group('bowls')
    B('긴 참나무 계단 받침',0,0,0,1.20,.78,.046,'oak',.011)
    for j in range(3):
        d=(j-1)*.254
        B('접시 사이 나뭇결',0,d,.035,1.19,.244,.032+j*.009,'wood',.004)
        for i in range(4):
            x=(i-1.5)*.295;z=.057+j*.009
            loft('사각 백자 그릇',x,d,z,[(.155,.120,0),(.177,.136,.010),(.275,.228,.100),(.278,.230,.108),(.264,.217,.111),(.161,.128,.014)],'bowl')
    group('sauces')
    for i,col in enumerate(['syrup','caramel','berry','cream']):
        x=(i-1.5)*.295
        if i<3:
            P('반투명 소스병',x,0,0,[(.041,0),(.045,.007),(.046,.153),(.040,.174),(.028,.180),(.027,.210)],col,24)
            P('흰 나사 뚜껑',x,0,.179,[(.030,0),(.031,.029),(.017,.035),(.009,.071),(.002,.083)],'ivory',20)
            for n in range(16):
                a=tau*n/16
                R('뚜껑 세로 리브',[(x+.030*cos(a),.030*sin(a),.184),(x+.030*cos(a),.030*sin(a),.203)],.0015,'cream',5)
        else:
            P('분당 스테인리스 체',x,0,.002,[(.039,0),(.044,.007),(.044,.098),(.047,.100),(.047,.107),(.038,.109)],'steel',28)
            for n in range(17):
                a=n*2.4;r=.031*sqrt(n/17);P('체 구멍',x+r*cos(a),r*sin(a),.111,[(.0016,0),(.0016,.0006)],'char',6)
    group('crunch')
    # Curled dust, candy sprinkles, striped marshmallows, dark cookies and pointed chocolate chips.
    for col,x,d,num in [('crumb',-.4425,.13,120),('candy',-.1475,.13,72),('mallow',.1475,.13,13),('chip',-.4425,-.125,63),('cookie',-.1475,-.125,7)]:
        for j in range(num):
            a=rng.uniform(-1,1);b=rng.uniform(-1,1);xx=x+a*.082;dd=d+b*.060
            mound=max(0,1-a*a*.55-b*b*.55)
            h=.015+mound*.030+(j%4)*.003
            if col=='crumb':
                rr=rng.uniform(.0037,.0071);ball('오렌지색 시리얼 크럼블',xx,dd,h,rr*1.3,rr,rr*.73,rng.choice(['butter','toast','apricot']),7,4)
            elif col=='candy':
                q=rng.uniform(0,pi);w=rng.uniform(.008,.018)
                R('무지개 스프링클',[(xx,dd,h),(xx+w*cos(q),dd+w*sin(q),h+rng.uniform(-.003,.003))],.0027,rng.choice(['sugar','berry','rose','mint','lemon','lilac']),6)
            elif col=='mallow':
                h+=j%3*.008;shape=.017
                R('파스텔 나선 마시멜로',[(xx-.016,dd,h),(xx+.016,dd+.009,h+.010)],shape,'ivory',16)
                for i,tone in enumerate(['rose','mint','lemon']):
                    pts=[]
                    for k in range(16):
                        t=k/15;phase=3*pi*t+i*tau/3
                        pts.append((xx-.016+t*.032,dd+.009*t+shape*cos(phase),h+.010*t+shape*sin(phase)))
                    R('비틀린 설탕 줄무늬',pts,.0032,tone,5)
            elif col=='chip':
                rr=rng.uniform(.005,.009)
                P('뾰족한 베이킹 초콜릿 방울',xx,dd,h,[(rr,0),(rr*.82,rr*.49),(rr*.48,rr),(0,rr*1.47)],'chip',8)
            else:
                rr=.029
                P('코코아 샌드 쿠키',xx,dd,h,[(rr*.96,0),(rr,.003),(rr,.007),(rr*.92,.008),(rr,.012),(rr,.016),(rr*.92,.017)],'cookie',24)
                P('쿠키의 얇은 크림 층',xx,dd,h+.0065,[(rr*.957,0),(rr*.948,.0047)],'cream',26)
                for k in range(8):
                    a=tau*k/8;R('쿠키 윗면의 꽃잎 무늬',[(xx+.008*cos(a),dd+.008*sin(a),h+.017),(xx+.019*cos(a+.16),dd+.019*sin(a+.16),h+.018),(xx+.023*cos(a),dd+.023*sin(a),h+.017)],.0014,'cocoa',5)
    # The serving spoon bowls and their narrow handles rise out of the food.
    for x,d,off in [(-.44,.135,-.035),(-.15,.13,.041),(-.44,-.122,-.05)]:
        ball('스테인리스 스푼',x,d,.065,.017,.027,.004,'silver',14,5)
        R('길게 접힌 스푼 손잡이',[(x,d-.017,.063),(x+off*.55,d-.081,.091),(x+off,d-.14,.126)],.005,'silver',8)
    group('berries')
    for i,(x,color) in enumerate([(-.1475,'berry'),(.1475,'cream')]):
        if i==0:
            for j in range(42):
                xx=x+rng.uniform(-.074,.074);dd=rng.uniform(-.055,.055);rr=rng.uniform(.008,.019)
                ball('딸기 콩포트 과육',xx,dd,.028+rng.uniform(-.005,.013),rr,rr*.8,rr*.52,rng.choice(['berry','jam','rosewood']),10,5)
            lo=[(.078,0),(.078,.005),(.069,.012),(0,.016)];P('딸기 소스',x,0,.016,lo,'jam',38,.70)
        else:
            for j in range(6):
                xx=x+(j%3-1)*.041;dd=(j//3-.5)*.061
                points=[]
                for k in range(31):
                    t=k/30;r=.028*(1-t)**.8;a=t*4.5*pi;points.append((xx+r*cos(a),dd+r*sin(a),.025+.048*t))
                R('별깍지로 짠 생크림',points,.0085,'cream',10)
    group('skewers')
    B('나무 꼬치함',.104,.006,0,.146,.252,.117,'wood',.009)
    B('꼬치함 홈',.104,.006,.117,.129,.232,.005,'darkwood',.003)
    for j in range(19):
        x=.104+rng.uniform(-.050,.050);d=rng.uniform(-.073,.078)
        R('대나무 퐁뒤 꼬치',[(x,d,.104),(x+rng.uniform(-.030,.030),d+rng.uniform(-.026,.026),.190+rng.uniform(-.015,.039))],.0017,'bamboo',6)
    loft('마시멜로 사각 그릇',-.088,0,0,[(.127,.157,0),(.19,.248,.064),(.183,.237,.070),(.132,.155,.011)],'bowl')
    for j in range(22):
        xx=-.088+rng.uniform(-.059,.059);dd=rng.uniform(-.073,.073);h=.028+(j%3)*.013
        R('퐁뒤용 흰 마시멜로',[(xx,dd,h),(xx+.021,dd+.010,h+.013)],.014,'ivory',14)
    group('croffle')
    P('와플 접시',0,0,0,[(.15,0),(.16,.008),(.190,.024),(.191,.031),(.182,.033),(.139,.014)],'bowl',40,.83)
    def waffle(x,d,z,r,phase):
        n=38
        points=[(x+r*cos(tau*i/n),d+r*sin(tau*i/n)) for i in range(n)]
        m.piece('노릇하게 구운 와플 가장자리',[(a,b,z+k*.009) for k in [0,1] for a,b in points],
            [tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],'toast')
        for i in range(-4,5):
            for j in range(-4,5):
                a=i*.014;b=j*.014
                if a*a+b*b>(r-.006)**2:continue
                xx=x+a*cos(phase)-b*sin(phase);dd=d+a*sin(phase)+b*cos(phase)
                loft('와플 격자의 깊은 사각 홈',xx,dd,z+.007,[(.014,.014,0),(.014,.014,.009),(.010,.010,.010),(.007,.007,.002)],'butter')
    waffle(-.061,.017,.022,.066,.12)
    # Tapered, folded dough strips show the layers on the croffle's edge.
    for j in range(9):
        t=(j-4)/4;xx=.063+t*.060;s=sqrt(max(.018,1-t*t))
        ball('겹겹이 접은 크루아상 생지',xx,-.012+t*.014,.033+s*.018,.018,.048*s+.006,.027*s+.004,['pastry','toast','pastry'][j%3],14,8)
    for j in range(8):
        t=j/7;R('크로플 윗면 캐러멜 결',[(.020+t*.095,-.035,.049+.021*sin(t*pi)),(.019+t*.091,.004,.054+.024*sin(t*pi)),(.017+t*.089,.017,.048+.015*sin(t*pi))],.0022,'caramel',5)
