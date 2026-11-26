"""Photographed round microwave rice pots, 610 mL display boxes and matching kitchenware."""
from math import sin,cos,tau,pi
from kitchen import B,P,R,ring,label,sphere
from random import Random
rnd=Random(704)
def pot(x,d,z,r,col,handled,glaze):
    P('세로 홈 도기 용기',x,d,z,[(r*.74,0),(r*.88,.005),(r*.92,.017),(r*.99,.091),(r,.104),(r*.94,.108),(r*.89,.103),(r*.83,.030),(r*.76,.022)],col,40)
    ring('도기의 말아 올린 전',x,d,z+.105,r*.973,.003,glaze,42)
    for j in range(26):
        a=j*tau/26
        R('도기 세로 골',[(x+cos(a)*r*(.90+t*.088),d+sin(a)*r*(.90+t*.088),z+.017+.078*t) for t in [0,.3,.7,1]],.0011,glaze,4)
    if handled:
        R('각진 머그 손잡이',[(x+r*.90,d,z+.093),(x+r*1.42,d,z+.095),(x+r*1.46,d,z+.082),(x+r*1.44,d,z+.030),(x+r*1.31,d,z+.024),(x+r*.88,d,z+.030)],.0084,col,9)
positions=[(-.47,-.104,0,.088,'yellow',False),(-.27,-.104,0,.082,'cream',False),(-.065,-.104,0,.087,'cream',True),
  (.108,-.080,0,.083,'yellow',False),(-.461,.098,0,.085,'blue',False),(-.249,.103,0,.084,'cream',False),(-.037,.105,0,.079,'cream',False),
  (.166,.096,0,.083,'cream',False),(-.461,-.104,.121,.086,'yellow',False),(-.065,-.104,.122,.088,'cream',True),(-.249,.102,.122,.082,'cream',False)]
def cookware(group):
    group('pots')
    for i,(x,d,z,r,col,handled) in enumerate(positions):pot(x,d,z,r,col,handled,'warm' if col!='blue' else 'blue2')
    group('lids')
    for i,(x,d,z,r,col,handled) in enumerate(positions):
        P('살짝 비치는 전자레인지 뚜껑',x,d,z+.107,[(r*.94,0),(r*1.02,.003),(r,.011),(r*.93,.014),(r*.52,.021),(r*.034,.021)],'smoke',36)
        ring('뚜껑 밀착 테',x,d,z+.116,r*.965,.0021,'clear',40)
        P('가운데 김 배출 마개',x,d,z+.127,[(.013,0),(.014,.003),(.011,.009)],'white',18)
        for n in range(3):
            a=n*tau/3;P('작은 김 구멍',x+.023*cos(a),d+.023*sin(a),z+.131,[(.0018,0),(.0018,.0007)],'slate',10)
    group('cartons')
    for j in range(2):
        z=j*.174;w=.248;dep=.188;h=.173
        B('백색 종이 상자 뒤',0,-.088,z,w,.011,h,'paper',.002)
        for side in [-1,1]:B('접힌 상자 옆면',side*.118,-.002,z,.012,dep,h,'paper',.002)
        B('종이 상자 윗면',0,-.002,z+h-.007,w,dep,.007,'paper',.0015)
        B('상자 앞 왼쪽 띠',-.113,.089,z,.022,.009,h,'paper')
        B('상자 앞 아래쪽 띠',0,.089,z,w,.009,.036,'paper')
        B('상자 윗 표시 면',0,.089,z+.102,w,.009,.071,'paper')
        B('상자 우측 제품 표시면',.047,.089,z+.035,.154,.009,.068,'paper')
        pot(-.043,.017,z+.016,.055,'cream',False,'warm')
        label('전자레인지용',-.037,.096,z+.148,.135,.016,'slate')
        label('도기밥솥',-.038,.096,z+.121,.143,.029,'walnut')
        label('₩3,000',.091,.096,z+.153,.058,.013,'ink')
        label('약 610 mL',.078,.096,z+.018,.078,.012,'ink')
        label('해동모드 15분',-.062,.096,z+.021,.103,.012,'red')
        for q in range(14):B('측면 유통 바코드',.124,-.055+q*.004,z+.016,.001,.0015 if q%4 else .003,.037,'ink')
        # Silhouette of the glazed pot printed on the front, with a window beside it.
        B('제품 인쇄 도기 몸체',.051,.095,z+.042,.058,.001,.043,'warm',.006)
        B('제품 인쇄 뚜껑',.050,.096,z+.083,.060,.001,.005,'slate',.001)
        R('인쇄된 손잡이',[(.080,.096,z+.082),(.096,.096,z+.081),(.096,.096,z+.055),(.080,.096,z+.053)],.0027,'slate',5)
        label('도기밥솥',0,-.006,z+h+.002,.143,.035,'walnut',tilt=0)
    group('storage')
    for i in range(7):
        x=(i-3)*.174
        for lay in range(3+(i%2)):
            z=lay*.071;d=.040 if i%2 else -.048
            if i%3:
                P('겹쳐 쌓는 둥근 보관 용기',x,d,z,[(.060,0),(.073,.009),(.078,.059),(.075,.065)],'fog',26)
                P('실리콘 테두리 덮개',x,d,z+.061,[(.079,0),(.081,.006),(.073,.012)],'blue2',26)
                P('원형 포장 라벨',x,d,z+.072,[(.052,0),(.053,.0015)],'white',22)
                for k in range(3):B('작은 인쇄 색띠',x,d+.009*(k-1),z+.074,.061-.009*k,.004,.001,'red' if k==0 else 'slate')
            else:
                B('각진 저장용기',x,d,z,.153,.209,.061,'fog',.014);B('패킹이 있는 뚜껑',x,d,z+.057,.162,.216,.009,'blue2',.009)
                B('뚜껑 날짜 라벨',x,d,z+.066,.132,.184,.002,'paper',.006)
                B('붉은 설명 띠',x,d+.020,z+.068,.128,.029,.001,'red')
    group('painted')
    for row in range(2):
        for j in range(4):
            x=(j-1.5)*.192;d=(row-.5)*.187;z=.005;r=.079
            for k in range(2+(j%2)):
                h=z+k*.050
                P('파란 전의 꽃무늬 찬기',x,d,h,[(.047,0),(.058,.008),(.079,.044),(.082,.060),(.078,.063),(.072,.053),(.050,.017)],'white',36)
                ring('짙푸른 테두리',x,d,h+.061,.080,.0027,'navy',38)
                for a in range(8):
                    th=a*tau/8+j*.15;xx=x+.071*cos(th);dd=d+.071*sin(th)
                    sphere('유약 꽃무늬',xx,dd,h+.039,.005,.005,.006,'navy',8,4)
                    sphere('노란 꽃술',xx+.003*cos(th),dd+.003*sin(th),h+.040,.002,.002,.002,'yellow',7,4)
