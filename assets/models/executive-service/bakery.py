"""Editable biscuits, macaron shells and evening service against the pale-stone credenza."""
from math import pi,tau,sin,cos
from random import Random
from kitchen import B,P,R,ring,platter,sphere
rnd=Random(118)
def treats(group):
    group('jars')
    for i in range(3):
        x=(i-1)*.333
        P('두꺼운 벽 유리 쿠키병',x,0,0,[(.107,0),(.123,.009),(.132,.029),(.132,.217),(.124,.245),(.108,.260),(.109,.285),(.102,.290),(.099,.263),(.122,.236),(.125,.031),(.106,.016)],'glass',48)
        P('접시형 유리 뚜껑',x,0,.283,[(.104,0),(.120,.006),(.125,.015),(.112,.026),(.083,.031),(.031,.037)],'glass',40)
        P('각을 낸 투명 손잡이',x,0,.316,[(.019,0),(.019,.012),(.039,.035),(.030,.056),(.017,.061)],'glass',8)
    group('biscuits')
    for jar in range(3):
        x=(jar-1)*.333
        for layer in range(7):
            for n in range(5):
                a=n*tau/5+layer*.47;r=.065+rnd.random()*.012;xx=x+cos(a)*r;d=sin(a)*r;z=.017+layer*.027
                if jar==0:
                    B('각진 다크초콜릿 쿠키',xx,d,z,.055,.051,.026,'dark',.004)
                    for j in range(4):B('초콜릿 면의 실금',xx+(j-1.5)*.010,d,z+.026,.0012,.037,.0008,'cocoa')
                else:
                    rr=.036 if jar==1 else .032
                    P('버터 사블레' if jar==2 else '초콜릿 칩 쿠키',xx,d,z,[(rr*.88,0),(rr,.007),(rr*.97,.018),(rr*.83,.024)],'butter' if jar==2 else 'biscuit',17,.94)
                    if jar==1:
                        for k in range(6):
                            a=rnd.random()*tau;r=.022*rnd.random();sphere('초콜릿 칩',xx+r*cos(a),d+r*sin(a),z+.024,.0046,.0038,.0027,'dark',8,4)
                    else:
                        for k in range(3):R('버터쿠키 골',[(xx-.020,d+(k-1)*.009,z+.023),(xx+.020,d+(k-1)*.009,z+.023)],.0008,'gold',4)
    group('macarons')
    platter('타원형 흰 진열 접시',0,0,.010,.489,'white',.59)
    for col,(shell,cream) in enumerate([('apricot','cream'),('rose','berry'),('pistachio','cream'),('lemon','cream'),('cocoa','caramel')]):
        for row in range(5):
            x=(col-2)*.158+(rnd.random()-.5)*.004;d=(row-2)*.083;z=.033;r=.035+rnd.random()*.002
            P('마카롱 아랫 셸',x,d,z,[(r*.76,0),(r*.98,.004),(r,.011),(r*.94,.014)],shell,24,.96)
            P('샌드한 크림',x,d,z+.013,[(r*.90,0),(r*.94,.004),(r*.91,.011)],cream,22,.96)
            P('마카롱 윗 셸',x,d,z+.023,[(r*.92,0),(r,.003),(r*.96,.009),(r*.81,.013),(r*.58,.016),(.002,.017)],shell,26,.96)
            for k in range(16):
                a=tau*k/16+.09*rnd.random();sphere('셸 가장자리 기공',x+cos(a)*r*.96,d+sin(a)*r*.93,z+.024,.0025,.0025,.0023,shell,6,4)
    group('plates')
    for i in range(8):platter('겹쳐 놓은 작은 접시',-.187,.028,.003+i*.008,.112)
    x=.183;d=-.062
    P('빵 스틱을 꽂은 도자기 컵',x,d,0,[(.057,0),(.065,.006),(.071,.156),(.068,.166),(.059,.165),(.056,.023)],'white',36)
    for k in range(19):
        a=k*2.40;r=.05*(k/19)**.56;xx=x+r*cos(a);dd=d+r*sin(a);z=.245+.084*rnd.random()
        R('가늘게 구운 빵 스틱',[(xx,dd,.075),(xx+.043*cos(a),dd+.043*sin(a),z)],.005+rnd.random()*.002,'butter' if k%3 else 'biscuit',8)
    for sign in [-1,1]:
        R('긴 서빙 집게',[(.012, .10,.016),(.052,.13,.022),(.141,.140+sign*.014,.018),(.196,.140+sign*.020,.011)],.004,'chrome',8)
    group('shelf')
    for x in [-.755,.755]:
        for d in [-.216,.217]:B('얇은 금속 선반 기둥',x,d,.004,.022,.022,1.110,'chrome',.003)
    for level in [.037,.368,.859]:
        B('진열대 선반',0,0,level,1.56,.495,.032,'tin',.007)
        B('빛이 퍼지는 선반 하부',0,.168,level-.002,1.48,.031,.004,'paper',.001)
        for x in [-.393,.393]:
            B('긴 흰색 플래터',x,.046,level+.033,.703,.365,.010,'white',.005)
            for side in [-1,1]:B('플래터 가장자리',x,.046+side*.18,level+.041,.697,.009,.005,'white',.002)
    group('candyglass')
    for i in range(5):
        x=(i-2)*.273
        P('낮은 사탕병 유리',x,0,.005,[(.075,0),(.093,.009),(.100,.040),(.100,.193),(.088,.211),(.073,.221),(.068,.219),(.094,.192),(.094,.044),(.079,.018)],'candyglass',36)
    group('candy')
    for i,col in enumerate(['berry','pistachio','blue','lemon','apricot']):
        x=(i-2)*.273
        P('사탕병 금속 뚜껑',x,0,.224,[(.075,0),(.084,.005),(.084,.023),(.077,.026)],'tin',24)
        for row in range(6):
            for j in range(11):
                a=j*tau/11+row*.23;r=.079 if j<9 else .031
                sphere('색을 입힌 초콜릿 알',x+r*cos(a),r*sin(a),.031+row*.026,.021,.016,.013,col,10,5)
    group('evening')
    for tray in range(2):
        for row in range(3):
            for j in range(5):
                x=(tray-.5)*.782+(j-2)*.103;d=(row-1)*.094;z=.016
                B('구운 사각 바닥',x,d,z,.077,.065,.016,'biscuit' if tray==0 else 'gold',.003)
                if tray==0:
                    B('크림치즈',x,d,z+.017,.072,.060,.013,'cream',.003)
                    for k in range(4):sphere('훈제 연어의 접힌 살',x+(.013*k-.021),d+.006*sin(k*2),z+.035,.016,.020,.010,'salmon',10,5)
                    R('딜 잎',[(x-.013,d,z+.046),(x+.008,d-.004,z+.056),(x+.017,d+.006,z+.061)],.0022,'green',5)
                else:
                    B('겹겹이 구운 페이스트리',x,d,z+.015,.070,.060,.024,'butter',.002)
                    for k in range(3):B('페이스트리 결',x,d+.030,z+.019+k*.006,.066,.001,.0015,'gold')
                    sphere('작은 과일 토핑',x,d,z+.046,.011,.011,.009,'berry',10,6)
