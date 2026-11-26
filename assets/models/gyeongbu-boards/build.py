"""Native housings for the photographed departure portal serving bays 5 to 10."""
from math import pi, cos, sin
from pathlib import Path
import runpy
import bpy

HERE=Path(__file__).resolve().parent
scene=bpy.context.scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['reference']='AD-Gangnam Seoul bus media 2024, pp. 88–90, Gyeongbu departure portal'
scene['datum']='Centred between the pair of public glass doors; front faces local minus Y.'


def material(name,h):
    mat=bpy.data.materials.new(name)
    rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    mat.diffuse_color=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
    return mat


carbon=material('무광 검정 외함','252728')
black=material('매입부 안쪽','15191b')
graphite=material('모서리 · 흑연','35393a')
liner=material('패널 틈','434749')
steel=material('고정구 · 어두운 스틸','727777')
glass=material('표시기 보호유리 · 테두리','34434a')
rim=material('보호유리 · 단면','45575c')
left_bg=material('왼쪽 광고 · 아이보리','eee7d8')
left_shade=material('왼쪽 광고 · 황토','d3b57a')
left_ochre=material('왼쪽 광고 · 노랑','ecd997')
left_blue=material('왼쪽 광고 · 녹청','779d9b')
left_dark=material('왼쪽 광고 · 음영','87968f')
lilac=material('오른쪽 광고 · 연보라','c9cbe8')
violet=material('오른쪽 광고 · 보랏빛','9192c6')
lavender=material('오른쪽 광고 · 밝은 보라','e4e4f1')
blue=material('오른쪽 광고 · 푸른 그림자','a7b0d5')
white=material('흰 하이라이트','f6f4ee')


def bank(name):
    c=bpy.data.collections.new(name);scene.collection.children.link(c)
    c['bundle']='departure-portal';c['origin']=[0,0,0]
    return c


housings=bank('Housing')
posters=bank('Lightboxes')


def obj(name,points,faces,mat,group=housings):
    g=bpy.data.meshes.new(name);g.from_pydata([(x,-(d+depth_offset),z) for x,d,z in points],[],faces);g.update()
    g.materials.append(mat);o=bpy.data.objects.new(name,g);group.objects.link(o);return o


def box(name,x,d,z,w,dep,h,mat,group=housings):
    pts=[(x+dx*w/2,d+dd*dep/2,zh) for zh in [z,z+h] for dx,dd in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return obj(name,pts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,group)


def face(name,x,d,z,points,mat,group=posters):
    return obj(name,[(x+a,d,z+b) for a,b in points],[tuple(range(len(points)))],mat,group)


def ring(name,x,d,z,r,mat,group=housings):
    pts=[(r*cos(k*2*pi/12),r*sin(k*2*pi/12)) for k in range(12)]
    return face(name,x,d,z,pts,mat,group)


def border(label,x,d,z,w,h,thickness,mat):
    for side in [-1,1]:
        box(label+' · 세로',x+side*(w/2-thickness/2),d,z,thickness,.022,h,mat)
    for zh in [z,z+h-thickness]:
        box(label+' · 가로',x,d,zh,w-2*thickness,.022,thickness,mat)


def enclosure(x,w,screen_w,z0,sh,centre=False):
    h=2.97
    box('바닥 플린스',x,0,.008,w-.025,.265,.085,black)
    box('외함 · 몸체',x,-.006,.092,w,.258,h-.092,carbon)
    box('상부 덮개',x,-.009,h-.031,w+.01,.259,.031,graphite)
    for side in [-1,1]:
        box('둥근 모서리 · 빛 받는 단',x+side*(w/2-.010),.118,.092,.016,.014,h-.12,graphite)
        box('외함 옆·점검대 이음선',x+side*(w/2+.001),.015,.21,.002,.006,h-.45,liner)
    z1=z0+sh
    border('매입형 개구부',x,.128,z0-.017,screen_w+.034,sh+.034,.020,black)
    border('유리 고무 개스킷',x,.139,z0-.008,screen_w+.016,sh+.016,.007,glass)
    for side in [-1,1]:
        for zh in [z0-.037,z1+.038]:
            ring('외함의 매립 고정구',x+side*(screen_w*.5+.032),.141,zh,.0044,steel)
    for i in range(10 if centre else 14):
        width=.012 if centre else .017
        box('플린스 · 하부 통풍 슬롯',x+(i-(4.5 if centre else 6.5))*.023,.126,.122,width,.003,.006,black)
    if centre:
        # Slightly stepped protective glass sits in front of the LCD. The active texture occupies the inner rectangle.
        box('LCD · 어두운 유리',x,.138,z0,screen_w,.012,sh,black)
        for zh in [z0+.007,z1-.011]:
            box('보호유리 · 모서리 반사',x,.144,zh,screen_w-.016,.002,.003,rim)
        return
    sw=screen_w
    box('라이트박스 · 반투명 전면',x,.136,z0,sw,.013,sh,left_bg if x<0 else lilac,posters)
    if x<0:
        # Muted wheat, vegetation and building silhouettes echo the warm and pale values in the photographed panel.
        for i in range(7):
            px=-sw*.46+i*.139
            height=.18+(.10,.04,.19,.02,.13,.06,.09)[i]
            face('왼쪽 인쇄 · 건물 실루엣',x,.145,z0,
                 [(px,0),(px+.126,0),(px+.126,height),(px+.102,height+.018),(px,height)],left_shade)
        for i in range(7):
            mid=-.48*sw+i*.147
            face('왼쪽 인쇄 · 나무 수관',x,.146,z0,[(mid-.07,.05),(mid-.085,.14),(mid-.056,.193),
                 (mid-.02,.185),(mid+.015,.219),(mid+.074,.183),(mid+.084,.079)],left_blue)
        face('왼쪽 인쇄 · 하늘색 띠',x,.146,z0, [(-sw/2,.33),(sw/2,.27),(sw/2,.30),(-sw/2,.37)],left_ochre)
        for i in range(6):
            ring('왼쪽 인쇄 · 빛방울',x-.43*sw+.14*i,.146,z0+.52+.14*sin(i*2.1),.021 if i%2 else .032,left_ochre,posters)
    else:
        # Abstract folded paper and floating translucent fragments recreate the composition without embedding a photo.
        for i in range(7):
            xx=-.45*sw+i*.14
            face('오른쪽 인쇄 · 푸른 면',x,.145,z0,[(xx,.22+.05*cos(i)),(xx+.15,.20+.04*sin(i)),
                 (xx+.07,.47+.07*sin(i)),(xx-.04,.41+.05*cos(i))],blue if i%2 else lavender)
        for i,(dx,zh,w) in enumerate([(-.27,1.16,.13),(.185,1.05,.22),(-.03,.83,.16),(.29,.65,.10),(-.32,.62,.10)]):
            face('오른쪽 인쇄 · 떠 있는 면',x,.146,z0,[(dx-w/2,zh),(dx,zh+w*.28),(dx+w*.55,zh+.01),
                 (dx+w*.07,zh-w*.36)],lavender if i%2 else blue)
            face('오른쪽 인쇄 · 접힘',x,.147,z0,[(dx-w/2,zh),(dx+w*.07,zh-w*.36),(dx+w*.12,zh-w*.61)],violet)
    box('라이트박스 · 하단 씰',x,.147,z0+.032,sw-.04,.003,.009,white,posters)


depth_offset=0
enclosure(0,.92,.66,.309,2.205,True)
# The two lightboxes mount on the near face of the wider existing side piers.
depth_offset=.70
enclosure(-3.50,1.21,1.055,.313,2.17)
enclosure(3.52,1.29,1.13,.313,2.17)
runpy.run_path(str(HERE/'native-display.py'))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=7
        area.spaces.active.region_3d.view_location=(0,0,1.45)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'gates-5-to-10.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
