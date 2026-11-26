"""Retail furniture in local metres. The hanging pegs, hangers and tags fit the four researched garments."""
from math import pi,sin,cos,tau
import blender_shop_mesh as m
from typography import word

def fascia():
    m.block('무광 흑색 간판 바탕',0,0,0,4.90,.094,.45,'ink',.018)
    # The three slanted bars rise toward the right as seen from the arcade.
    for i,h in enumerate([.097,.166,.239]):
        x=.92-.108*i;z=.168
        a=[(x,-.054,z),(x-.087,-.054,z),(x-.087+.068*h/.24,-.054,z+h),(x+.068*h/.24,-.054,z+h)]
        b=[(u,d+.008,v) for u,d,v in a]
        m.piece('흰 돌출 삼선',a+b,[(0,1,2,3),(7,6,5,4)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],'white',.0018)
    word('adidas','흰색 입체 소문자 상호',.205,-.057,.238,.32,'white')
    m.block('종목 글자 구분선',-.37,-.054,.136,.012,.013,.18,'steel')
    word('GOLF','종목 표기',-.73,-.057,.224,.201,'white')

def backwall():
    for i in range(4):
        x=(i-1.5)*.98
        m.block('린넨색 분할 벽판',x,.15,.22,.965,.07,2.26,'stoneA' if i%2 else 'stoneB',.014)
        m.rod('가로 행거를 받치는 고정쇠',[(x,.104,2.073),(x,-.23,2.073)],.012,'steel',12)
        m.profile('뒤판 아래 타공 고정 나사',x,.145,.207,[(.017,0),(.017,.004)],'steel',10)
    m.rod('상품을 앞보기로 거는 크롬 봉',[(-2.02,-.22,2.072),(2.02,-.22,2.072)],.015,'steel',18)
    m.block('앰버색 참나무 바닥 선반',0,-.037,.19,4.02,.61,.044,'oak',.008)
    m.block('선반 아래 무광 대좌',0,.039,.036,3.92,.42,.152,'stoneB',.012)
    m.block('상단 조명이 매입된 백색 헤드',0,-.063,2.496,4.05,.53,.093,'stoneB',.012)
    m.block('헤드 밑 확산 조명',0,-.214,2.489,3.81,.042,.011,'warmLight',.003)
    for x in [-1.47,-.49,.49,1.47]:
        m.block('상품 아래 작은 카드 홀더',x,-.25,.246,.19,.068,.010,'steel',.002)
    word('ORIGINALS','상단 금속 종목 글자',0,-.020,2.344,.11,'ink')

def hanger():
    # Real wooden hanger profile, a wire hook curls over the rail 0.19 m above the collar.
    outline=[(-.216,.549),(-.207,.568),(-.084,.631),(-.031,.654),(-.021,.668),(.021,.668),(.032,.653),
             (.087,.633),(.207,.570),(.218,.552),(.211,.541),(.192,.545),(.076,.586),(-.073,.586),(-.188,.546),(-.209,.539)]
    n=len(outline);verts=[(x,d,z) for d in [.019,.052] for x,z in outline]
    m.piece('너도밤나무 옷걸이의 둥근 어깨',verts,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+
            [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],'oak',.005)
    m.rod('상단 옷걸이 철사 목과 고리',[(0,.033,.656),(0,.033,.783),(.002,.033,.817),(.014,.033,.838),
          (.034,.033,.843),(.049,.033,.832),(.053,.033,.816),(.049,.033,.804)],.0041,'hook',11)

def accesstable():
    m.block('모서리가 둥근 흰 액세서리 상판',0,0,.807,1.96,.77,.043,'ivoryEdge',.018)
    for x in [-.851,.851]:
        for d in [-.275,.275]:
            m.block('각재 다리',x,d,.033,.045,.045,.772,'steel',.003)
            m.block('소음 방지 검은 신발',x,d,.024,.048,.048,.019,'ink',.004)
    m.block('상판 아래 가로받침',0,.275,.7,1.74,.024,.035,'steel',.006)
    for x,h in [(-.52,.19),(0,.104),(.52,.19)]:
        m.profile('챙을 띄우는 원판 받침',x,0,.85,[(.09,0),(.093,.003),(.09,.008)],'stoneB',48)
        m.profile('받침대 봉',x,0,.858,[(.010,0),(.010,h-.018)],'steel',18)
        m.profile('캡 안쪽을 받치는 완만한 타원',x,-.004,.85+h-.021,[(.041,0),(.071,.010),(.067,.027),(.040,.043)],'sweat',36,.9)
    word('ACCESSORIES','앞쪽 얇은 종목 글씨',0,-.392,.822,.029,'ink')

def tag(code):
    m.block('흰 종이 상품 카드',0,0,0,.137,.006,.082,'white',.002)
    word('adidas Golf','상품 카드 위 검정 상호',0,-.0039,.057,.014,'ink')
    word(code,'상품 번호',0,-.0039,.030,.016,'ink')
    for i in range(16):
        if i%5!=2:m.block('생성한 바코드 선',-.034+i*.0031,-.0044,.014,.0011+(i%3)*.0003,.0011,.008,'ink')
