"""Two open-crown visors studied from the Naver Place visitor photos for this branch."""
from math import sin,cos,pi,tau
import blender_shop_mesh as m

def sidewall(name,rings,tone,n=72,closed=False):
    vs=[p for row in rings for p in row];width=n if closed else n-1
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(width)]
    ob=m.piece(name,vs,faces,tone)
    for poly in ob.data.polygons:poly.use_smooth=True
    return ob

def visor(navy):
    n=78;angles=[-.99*pi+.99*tau*i/(n-1) for i in range(n)]
    # Rear opening makes the crown, sweatband and overlapping adjustment ends readable from above.
    def band(a,h,inside=0):
        fr=(1+cos(a))/2
        return ((.085-inside+.002*h)*sin(a),-(.091-inside-.001*h)*cos(a),
                .040+.006*(1-fr)+h*(.024+.041*fr))
    outer=[[band(a,h) for a in angles] for h in [0,.07,.31,.64,.92,1]]
    sidewall('이마를 감싸는 열린 직물 밴드',outer,'ivoryMesh',n)
    sidewall('밴드 안쪽의 땀받이',[[band(a,h,.0038) for a in angles] for h in [1,.60,.13,0]],'sweat',n)
    sidewall('밴드 윗단 바이어스',[[band(a,1) for a in angles],[band(a,1,.0038) for a in angles]],'ivoryEdge',n)
    for h in [.095,.90]:
        # Stitching is interrupted by the opening, including the hidden return edge.
        for i in range(0,n-1,2):
            pts=[band(angles[i]+(angles[i+1]-angles[i])*t,h,-.00027) for t in (0,.45,.92)]
            m.rod('이마 밴드의 흰 봉제선',pts,.00045,'thread',5)
    seg=54;midx=[-1+2*i/(seg-1) for i in range(seg)]
    def lip(t,v,dz=0):
        side=sin(t*pi*.48);sweep=cos(t*pi*.48)
        x=(.080+.023*v)*side
        d=-.015-(.075+.076*v)*sweep
        z=.044-.017*v+.012*t*t-.009*t*t*v+.003*cos(t*pi*.90)+dz
        return x,d,z
    top=[[lip(t,j/9) for t in midx] for j in range(10)]
    bottom=[[lip(t,j/9,-.0034) for t in midx] for j in range(9,-1,-1)]
    sidewall('챙 윗면의 굽은 패널',top,'navy' if navy else 'ivoryMesh',seg)
    sidewall('챙 안쪽 짙은 원단' if navy else '챙 아랫면 원단',bottom,'navyDark' if navy else 'sweat',seg)
    sidewall('챙 끝의 얇은 직물 돌림',[top[-1],bottom[0]],'navyEdge' if navy else 'ivoryEdge',seg)
    for v in [.90,.965]:
        m.rod('챙 가장자리의 두줄 상침',[lip(t,v,.00037) for t in midx],.00045,'navyEdge' if navy else 'ivoryEdge',5)
    if not navy:
        for k in range(3):
            points=[lip(.04+k*.18+.032*j/9,.24+j*.064,.0007) for j in range(10)]
            left=[(x-.0047,d,z) for x,d,z in points];right=[(x+.0047,d,z) for x,d,z in points]
            sidewall('흰 챙 위 톤온톤 세 줄',[left,right],'tonalStripe',len(points))
        for side in [-1,1]:
            loop=[(side*(.006+.029*sin(pi*i/16)),.083+.027*sin(pi*i/16)**2,.076+.003*i/16+.014*sin(tau*i/16)) for i in range(17)]
            m.rod('후면 나비 매듭 고리',loop,.0038,'ivoryMesh',7)
            end=[(side*.005,.091,.077),(side*.027,.111,.069),(side*.037,.131,.052)]
            m.rod('묶음 끈 끝',end,.003,'ivoryMesh',7)
    else:
        for k,(w,h) in enumerate([(.014,.014),(.015,.023),(.016,.034)]):
            x=.020-.0175*k;d=-.092;z=.065
            # Applied iridescent bars sit slightly proud of the front panel.
            ob=m.piece('앞이마의 홀로그램 삼선',[(x,d,z),(x+w,d,z),(x+w-.009,d,z+h),(x-.009,d,z+h)],[(0,1,2,3)],['pearlLilac','pearlMint','pearlAmber'][k])
            m.rod('삼선 자수의 짙은 테두리',[(x,d-.0003,z),(x+w,d-.0003,z),(x+w-.009,d-.0003,z+h),(x-.009,d-.0003,z+h),(x,d-.0003,z)],.00058,'edgeInk',5)
        from typography import word
        word('adidas','캡 앞의 작은 자수 워드마크',0,-.0934,.056,.016,'edgeInk')
    m.block('후면 버클의 직물 꼬리',0,.094,.052,.061,.003,.016,'ivoryMesh',.001)
    m.block('후면 작은 조절 버클',.017,.0955,.053,.013,.0018,.014,'steel',.001)
    m.block('밴드 안 사이즈 라벨',-.008,.084,.060,.027,.001,.012,'ink',.0005)
    m.block('라벨 위 흰 표시',-.008,.083,.064,.017,.0003,.002,'white')
