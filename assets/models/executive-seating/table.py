"""Ivory round top and dark apron from the photographed 9F lounge tables."""
from math import sin,cos,pi,tau
from kitchen import B,P,R,ring
def table():
    P('둥근 아이보리 상판',0,0,.704,[(.641,0),(.665,.005),(.670,.012),(.670,.026),(.664,.033),(.638,.036),(.001,.036)],'stone',96)
    ring('연마한 상판 가장자리',0,0,.733,.666,.0027,'stoneEdge',96)
    P('검은 에이프런',0,0,.590,[(.612,0),(.635,.006),(.640,.014),(.640,.107),(.634,.115),(.603,.118)],'ash',72)
    for j in range(5):
        ring('에이프런 아래의 선',0,0,.598+.005*j,.636,.00115,'apron',72)
    for sx in [-1,1]:
        for sd in [-1,1]:
            x=sx*.365;d=sd*.365
            B('검게 마감한 테이블 다리',x,d,.012,.050,.048,.629,'ash',.005)
            B('짧은 바닥 받침',x,d,.001,.048,.046,.017,'foot',.003)
            B('밑면 모서리 조임쇠',x,d,.601,.075,.067,.017,'apron',.003)
        B('다리를 잇는 하부 띠',sx*.365,0,.587,.033,.738,.040,'ash',.004)
        B('맞은편 다리 조인트',0,sx*.365,.587,.738,.033,.040,'ash',.004)
    # Keep the polished face nearly continuous at normal viewing distance.
    for j in range(16):
        a=j*2.40;dist=.12+(j%6)*.075;xx=dist*cos(a);dd=dist*sin(a)
        R('상판의 미세한 광물 결',[(xx+.018*k,dd+.003*sin(k+j),.74035) for k in range(5)],.00048,'stoneEdge',4)
