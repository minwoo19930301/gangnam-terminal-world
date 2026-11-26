"""Cold buffet platters from the NewCore Gangnam Ashley Queens branch photograph."""
from math import cos, sin, pi
from random import Random
import blender_shop_mesh as m


def citrus(x, d, z, angle, roll, radius):
    # A quarter of a citrus sphere has two flat cut faces behind the peel.
    def point(a, b, h):
        depth = b*cos(roll) - h*sin(roll)
        return (x+a*cos(angle)-depth*sin(angle), d+a*sin(angle)+depth*cos(angle),
                z+b*sin(roll)+h*cos(roll))

    peel = []
    for j in range(9):
        v = -.5*pi + pi*j/8
        for k in range(7):
            t = -.5*pi + .5*pi*k/6
            peel.append(point(radius*sin(v), radius*cos(v)*cos(t), radius*cos(v)*sin(t)))
    m.piece('감귤 껍질', peel, [(j*7+k,j*7+k+1,(j+1)*7+k+1,(j+1)*7+k)
                            for j in range(8) for k in range(6)], 'rind')
    for face in (0,1):
        def cut(r,t,lift):
            a=r*cos(t); b=r*sin(t)
            return point(a,b,lift) if face==0 else point(a,-lift,-b)
        rim = [cut(radius,pi*j/12,0) for j in range(13)]
        m.piece('감귤 속 흰 껍질',rim,[tuple(range(13))],'pith')
        for k in range(5):
            lo=pi*(k+.05)/5; hi=pi*(k+.95)/5
            pts=[cut(radius*.09,(lo+hi)/2,.0007)]
            pts.extend(cut(radius*.89,lo+(hi-lo)*j/4,.0007) for j in range(5))
            m.piece('감귤 과육 단면',pts,[tuple(range(6))],['citrus','juice'][k%2])


def make_cold_salad(group, ball, loft, letters):
    group('coldSalad')
    rng=Random(409)
    for index,(x,label) in enumerate([(-.53,'감귤'),(0,'단호박 샐러드'),(.53,'모둠 피클')]):
        loft('넓게 벌어진 백자 뷔페 접시',x,0,0,[
            (.316,.62,0),(.343,.65,.012),(.507,.847,.122),(.509,.85,.130),
            (.494,.833,.132),(.332,.645,.033),(.30,.612,.030)],'bowl')
        m.block('메뉴 카드 받침',x,.505,.003,.22,.075,.015,'char',.004)
        m.block('금속 카드 홀더',x,.522,.018,.015,.012,.13,'steel')
        m.block('메뉴 카드 남색 테두리',x,.522,.145,.225,.010,.118,'blue',.002)
        m.block('인쇄물',x,.515,.152,.215,.003,.100,'paper')
        letters(label,x,.512,.201,.197,.047,'print')
        for j in range(15):
            xx=x+(j%3-1)*.095+rng.uniform(-.013,.013)
            dd=(j//3-2)*.108+rng.uniform(-.017,.017)
            if index==0:
                citrus(xx,dd,.082+rng.uniform(0,.014),rng.uniform(-pi,pi),
                       rng.uniform(-.50,.75),rng.uniform(.055,.068))
            elif index==1:
                ball('으깬 단호박',xx,dd,.063,rng.uniform(.056,.072),rng.uniform(.061,.086),rng.uniform(.030,.051),'pumpkin',12,6)
                for k in range(3):
                    ball('결을 남긴 단호박 조각',xx+rng.uniform(-.042,.042),dd+rng.uniform(-.05,.05),
                         .101+rng.uniform(-.004,.013),.023,.019,.012,'golden',8,5)
                if j in [1,3,7,8,11,13]:
                    ball('베리 소스',xx+.01,dd,.116,.040,.032,.006,'jam',10,4)
                    ball('말린 베리',xx,dd,.12,.021,.016,.011,'currant',10,5)
            else:
                for k in range(5):
                    px=xx+rng.uniform(-.050,.050); pd=dd+rng.uniform(-.056,.056)
                    rad=rng.uniform(.030,.048); base=.047+.009*k
                    m.profile('얇게 썬 피클',px,pd,base,[(rad*.91,0),(rad,.005),(rad,.009),(rad*.95,.011)],
                              ['gherkin','palePickle','carrot'][(j+k)%3],12,.74)
                    if (j+k)%3==0:
                        ball('오이의 연한 씨방',px,pd,base+.012,rad*.73,rad*.50,.002,'palePickle',10,4)
        # The tongs rest across the front lip with two shallow, spoon-shaped tips.
        tx=x+.14
        for side in (-1,1):
            m.rod('스테인리스 집게 날',[(tx,-.52,.031),(tx+side*.009,-.48,.045),
                  (tx+side*.025,-.37,.131),(tx+side*.032,-.27,.11)],.005,'silver',8)
            ball('집게 끝',tx+side*.032,-.263,.110,.014,.028,.007,'chrome',10,5)
