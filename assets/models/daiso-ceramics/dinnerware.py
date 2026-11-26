"""Open porcelain plate profiles, shallow floral embossing, wire stands and shelf labels."""
from math import sin,cos,tau,pi,atan2
import blender_shop_mesh as m
from kitchen import B,P,R,ring,label,platter,sphere
def standing_plate(x,d,z,r,shape,pattern):
    # Vary a circle, a gently scalloped rim or a rounded-square section.
    n=72;verts=[];faces=[]
    def point(a,rad,depth):
        c,s=cos(a),sin(a)
        if shape==1:c,s=(1 if c>=0 else -1)*abs(c)**.61,(1 if s>=0 else -1)*abs(s)**.61
        wobble=1+.025*sin(11*a) if shape==2 else 1
        return (x+c*rad*wobble,d+depth-(s+1)*.020,z+r+s*rad*wobble)
    rings=[(.04,-.016),(.53,-.018),(.87,-.009),(.99,-.006),(1,.001),(.976,.006),(.92,.005),(.78,-.004),(.63,-.010),(.15,-.010)]
    for j,(radius,depth) in enumerate(rings):verts.extend([point(i*tau/n,r*radius,depth) for i in range(n)])
    for j in range(len(rings)-1):
        faces.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
    faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
    o=m.piece('플라워 패턴 전시 '+['원접시','사각 접시','물결 접시'][shape],verts,[tuple(reversed(f)) for f in faces],'white')
    for face in o.data.polygons:face.use_smooth=len(face.vertices)==4
    if shape!=2:R('돋은 접시 띠',[point(i*tau/n,r*.917,.0054) for i in range(n+1)],.0011,'warm',5)
    for i in range(5):
        base=.55+pattern*.3+i*.057;xy=point(base,r*(.76+.044*(i%2)),-.0003);xx,dd,zz=xy
        R('작은 가지 무늬',[(xx-.009,dd+.002,zz-.014),(xx,dd+.003,zz),(xx+.009,dd+.004,zz+.013)],.0009,'motif',5)
        for j in range(4):
            a=j*pi/2;sphere('도드라진 꽃잎',xx+.0039*cos(a),dd+.006,zz+.0039*sin(a),.0032,.0013,.003,'ivory',8,4)
    for sign in [-1,1]:
        dx=r*.46*sign
        R('진열 접시를 받치는 철사',[(x+dx,d-.040,z+.006),(x+dx,d+.025,z+.004),(x+dx,d+.035,z+.024),(x+dx,d+.031,z+.040)],.003,'tin',6)
def stock(group):
    group('dinner')
    for layer,z in enumerate([.144,1.300]):
        for j in range(6):
            x=(j-2.5)*.207;r=.088+((j+layer)%3)*.005
            standing_plate(x,.11,z,r,(j+layer)%3,j)
            for q in range(2):
                # Additional plates remain visible at the back edge of the display.
                if j%2==0:standing_plate(x+.008*(q+1),.065-.031*q,z+.009*q,r*.99,(j+layer)%3,j)
    group('bowls')
    for j in range(6):
        x=(j-2.5)*.192
        for row in range(2):
            d=(row-.5)*.202;r=.083-.005*(j%2)
            for k in range(4+(j%3)):
                z=k*.026;P('차곡차곡 놓은 공기와 찬기',x,d,z,[(.040,0),(.048,.005),(.051,.019),(.070,.043),(r,.059),(r,.069),(r-.004,.074),(r-.008,.065),(.060,.040),(.037,.027)],'white' if j%2 else 'ivory',38)
                ring('백자 굽',x,d,z+.006,.046,.0023,'warm',30)
    group('ticket')
    B('붉은 카테고리 표지판',0,0,0,1.26,.021,.217,'red',.003)
    B('상부 고정 레일',0,-.013,.209,1.29,.037,.014,'tin',.003)
    label('플라워 패턴 식기',-.18,.013,.112,.80,.091,'white')
    label('FLOWER PATTERN',.409,.013,.124,.321,.030,'white')
    label('DINNERWARE',.409,.013,.081,.321,.031,'white')
