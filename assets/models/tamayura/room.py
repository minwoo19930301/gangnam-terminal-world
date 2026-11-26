"""Low dining-room ceiling and the west wall facing the three public counters."""
import blender_shop_mesh as m
from floor import WIDTH,DEPTH,U,V
B=m.block

def build():
    B('공용 천장 바탕',0,0,3.315,WIDTH,DEPTH,.075,'cream2')
    for start,end,tone in [(-6.19,-1.55,'walnut'),(-1.55,1.12,'tea_wood'),(1.12,6.19,'cream')]:
        B('서쪽 기존 벽 위의 목재 또는 석고',-WIDTH/2+.055,(start+end)/2,.018,.098,end-start,3.303,tone,.008)
    for k in range(28):
        B('스시 바 끝의 세로 목재 벽',-WIDTH/2+.12,1.40+k*.164,.032,.075,.102,3.205,'ash',.006)
    for x,d,w,l,tone in [(-2.40,-2.24,4.86,4.42,'cream'),(2.17,-3.11,3.85,4.68,'tea_wood'),(-.75,3.22,7.68,4.69,'hinoki')]:
        B('천장의 나무 또는 미장 반자',x,d,3.209,w,l,.074,tone,.010)
        for side in [-1,1]:
            B('반자 옆의 들어간 그림자 줄',x,d+side*(l/2+.038),3.276,w,.068,.025,'blackwood',.002)
            B('반사 간접 조명의 좁은 선',x,d+side*(l/2+.089),3.290,w,.037,.022,'cove',.002)
    for j in range(6):
        for k in range(3):
            x=-3.6+3.48*k;d=-4.7+1.93*j
            if abs(x+2.4)<1.79 and abs(d+2.1)<1.13:continue
            m.profile('천장 매입등 테두리',x,d,3.202,[(.052,0),(.057,.004),(.057,.010)],'brass',16)
            m.profile('점형 다운라이트',x,d,3.198,[(.041,0),(.044,.004)],'cove',16)
