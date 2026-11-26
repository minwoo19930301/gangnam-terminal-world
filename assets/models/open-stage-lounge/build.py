"""Editable low lounge group. X along the sofa and +Y across the facing pair."""
from pathlib import Path
from math import pi, sin, cos, tau
import bpy
import runpy
import subprocess

HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
collection=bpy.data.collections.new('오픈 스테이지 · 흰 소파와 낮은 테이블')
scene.collection.children.link(collection)
collection['export_model']='lounge'
collection['preview_origin']=(0,0,0)

def material(name,code):
    t=[int(code[i:i+2],16)/255 for i in (0,2,4)]
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in t),1)
    return m

ivory=material('상아색 패딩','F2EEE3')
shell=material('아이보리 외피','DED9CA')
piping=material('봉제 파이핑','C8BCAA')
metal=material('무광 샴페인 프레임','A99F88')
stone=material('백색 석재','F4F0E8')
vein=material('회갈색 맥','C8C4BA')
cup=material('백자 유약','FAF6E7')
coffee=material('커피','573C2E')
foot=material('어두운 받침','514C45')

def mesh(name,points,faces,mat,smooth=False):
    m=bpy.data.meshes.new(name)
    m.from_pydata(points,[],faces)
    m.update()
    obj=bpy.data.objects.new(name,m)
    collection.objects.link(obj)
    m.materials.append(mat)
    for poly in m.polygons: poly.use_smooth=smooth
    return obj

def skin(name,rings,mat,smooth=False):
    n=len(rings[0])
    faces=[tuple(reversed(range(n)))]
    for row in range(len(rings)-1):
        for j in range(n):
            i=row*n+j
            k=row*n+(j+1)%n
            faces.append((i,k,k+n,i+n))
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    return mesh(name,[v for ring in rings for v in ring],faces,mat,smooth)

def outline(x,y,z,w,d,r):
    r=min(r,w*.48,d*.48)
    ring=[]
    for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(5):
            a=(start+22.5*i)*pi/180
            ring.append((x+sx*(w/2-r)+r*cos(a),y+sy*(d/2-r)+r*sin(a),z))
    return ring

def pad(name,x,y,z,w,d,h,r,mat,soft=.014):
    rings=[outline(x,y,z+dz,w-cut,d-cut,r) for dz,cut in
           [(0,soft*1.6),(h*.16,soft*.32),(h*.48,0),(h*.84,soft*.32),(h,soft*1.6)]]
    return skin(name,rings,mat,True)

def turned(name,x,y,z,profile,mat,n=24):
    return skin(name,[[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z+h) for i in range(n)] for r,h in profile],mat,True)

for side in (-1,1):
    y=side*2.05
    pad('하부 섀도 라인',0,y,.09,2.56,.75,.085,.07,foot)
    pad('하부 프레임',0,y,.14,2.72,.88,.22,.075,shell,.042)
    for x in [-1.29,1.29]:
        pad('낮은 팔걸이',x,y,.27,.16,.91,.29,.07,ivory,.028)
    for x in [-.81,0,.81]:
        pad('좌방석',x,y-side*.045,.356,.795,.68,.145,.078,ivory,.075)
        pad('좌방석 가장자리 끈',x,y-side*.045,.394,.794,.68,.009,.077,piping,.002)
        pad('등받이 쿠션',x,y+side*.341,.39,.80,.192,.35,.08,ivory,.065)
    for x in [-1.10,1.10]:
        for off in [-.31,.31]:
            turned('금속 풋',x,y+off,0,[(.026,0),(.030,.018),(.041,.14)],metal,12)
    table=y-side*1.1
    for x in [-.52,.52]:
        pad('테이블 발',x,table,.032,.06,.54,.033,.008,metal)
        for off in [-.23,.23]:
            pad('각관 다리',x,table+off,.061,.032,.032,.415,.006,metal)
    pad('석재 상판 옆면',0,table,.475,1.3,.72,.056,.058,stone)
    pad('상판 모따기',0,table,.527,1.294,.714,.016,.057,stone)
    for j in range(3):
        x=-.32+j*.32
        path=[(x-.13,table-.28),(x-.06,table-.16),(x-.07,table-.08),(x+.01,table+.015),(x+.065,table+.19)]
        mesh('상판의 가는 맥',[(a+offset,b,.5435) for a,b in path for offset in [-.0014,.0014]],
             [(i,i+1,i+3,i+2) for i in range(0,8,2)],vein)
    x=.29
    turned('컵받침',x,table,.544,[(.056,0),(.080,.003),(.078,.009),(.050,.009)],cup)
    turned('잔과 안쪽 림',x,table,.553,[(.030,0),(.041,.012),(.052,.080),(.052,.091),(.047,.092),(.046,.069)],cup)
    turned('커피 수면',x,table,.628,[(.046,.000),(.046,.002)],coffee)
    rings=[]
    for i in range(13):
        a=-pi/2+i*pi/12
        rings.append([(x+.045+(.031+.006*cos(tau*j/8))*cos(a),table+.006*sin(tau*j/8),
                       .601+(.034+.006*cos(tau*j/8))*sin(a)) for j in range(8)])
    skin('도자기 손잡이',rings,cup,True)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lounge.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')

subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'lounge.glb'),'.56','.0007'],check=True)
