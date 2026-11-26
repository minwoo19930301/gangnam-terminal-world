"""Editable modules for a parametric public escalator. X across, game +Z uphill."""
from math import pi, cos, sin
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
materials={}


def group(name,offset):
    c=bpy.data.collections.new(name)
    c['part']=name
    c['origin']=offset
    bpy.context.scene.collection.children.link(c)
    return c


def part(name,points,faces,color):
    # Author in game axes; rotate to Blender's Z-up native viewport.
    points=[Vector((x,-z,y)) for x,y,z in points]
    center=sum(points,Vector())/len(points)
    geo=bpy.data.meshes.new(name)
    geo.from_pydata([p-center for p in points],[],faces);geo.update()
    obj=bpy.data.objects.new(name,geo);coll.objects.link(obj)
    obj.location=center+Vector(coll['origin'])
    if color not in materials:
        m=bpy.data.materials.new(color);materials[color]=m
        rgb=[int(color[k:k+2],16)/255 for k in (0,2,4)]
        m.diffuse_color=[c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
    geo.materials.append(materials[color])
    return obj


def flat(name,verts,col):
    return part(name,verts,[(0,1,2,3)],col)


def strip(name,x0,x1,y,z0,z1,col):
    return flat(name,[(x0,y,z0),(x0,y,z1),(x1,y,z1),(x1,y,z0)],col)


def profile(name,xy,z0,z1,col):
    p=[(x,y,z) for z in (z0,z1) for x,y in xy]
    n=len(xy)
    faces=[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range(n,n*2))])
    return part(name,p,faces,col)


coll=group('Tread',(-2,0,0))
# One normalized station in the continuous chain. A small rolled nose joins
# the crown to the fluted kick plate; actual width, rise and run come from the game.
section=[(-.95,0),(-.08,.000),(-.028,.009),(.0,.032),(.008,.074),(.008,.98)]
for i,((y0,z0),(y1,z1)) in enumerate(zip(section,section[1:])):
    flat('알루미늄 디딤판 단면', [(-.5,y0,z0),(-.5,y1,z1),(.5,y1,z1),(.5,y0,z0)],
         ['616b71','798186','aaa88f','d8bb51','92999d'][i])
strip('앞쪽 황색 디딤 경계',-.496,.496,.011,.038,.090,'dcb94a')
for s in (-1,1):
    mid=s*.479
    strip('가장자리 황색 띠',mid-.013,mid+.013,.012,.088,.974,'d1b144')
for i in range(24):
    x=-.45+i*.039
    strip('주행 방향 홈',x,x+.011,.011,.093,.975,'606a72')
    flat('앞판 아래 골',[(x,-.93,-.0007),(x,-.14,-.0007),(x+.011,-.14,-.0007),(x+.011,-.93,-.0007)],'515d65')

coll=group('Comb',(0,0,0))
# Z=0 is the threshold and +Z points onto the tread chain; the deck extends behind it.
strip('검사판 바닥',-.5,.5,.010,-.33,-.018,'889297')
for i in range(24):
    x=-.454+i*.039
    strip('바닥판 홈',x,x+.009,.012,-.325,-.060,'5b676e')
strip('빗살 고정대',-.50,.50,.015,-.070,-.010,'d4b54c')
for i in range(24):
    x=-.453+i*.039
    flat('빗살판 낱개 이',[(x,.016,-.014),(x+.003,.012,.030),(x+.024,.012,.030),(x+.028,.016,-.014)],'e0bd4e')
for x in [-.44,0,.44]:
    strip('빗살판 고정 볼트',x-.008,x+.008,.0165,-.045,-.032,'5c6260')

coll=group('Skirt',(1.5,0,0))
profile('스테인리스 하부 내외 측판',[(-.049,.012),(.049,.012),(.049,.235),(.029,.269),(-.027,.269),(-.049,.235)],0,1,'a6afb0')
profile('측판의 어두운 고무 띠',[(-.056,.18),(.056,.18),(.056,.193),(-.056,.193)],0,1,'4d5659')
profile('밸러스트레이드 상단 유리 가이드',[(-.029,.888),(.029,.888),(.029,.952),(-.029,.952)],0,1,'9fa9a8')
rail=[(.060*cos(2*pi*i/12),.993+.048*sin(2*pi*i/12)) for i in range(12)]
profile('고무 손잡이 벨트',rail,0,1,'2e3335')
profile('스테인리스 받침 띠',[(-.033,.941),(.033,.941),(.033,.961),(-.033,.961)],0,1,'818b8c')

coll=group('Return',(3,0,0))
# An end-return is mirrored onto the upper landing. The horizontal reach is
# shorter than the existing 0.33 m threshold, including the curved belt's thickness.
v=[];faces=[]
for i in range(15):
    a=i*pi/14
    for j in range(12):
        t=2*pi*j/12
        v.append((.060*cos(t),.683+(.31+.046*sin(t))*cos(a),-(.25+.046*sin(t))*sin(a)))
for i in range(14):
    for j in range(12):faces.append((i*12+j,i*12+(j+1)%12,(i+1)*12+(j+1)%12,(i+1)*12+j))
part('둥글게 감기는 손잡이',v,faces,'2e3335')
profile('손잡이 반환구',[(-.063,.284),(.063,.284),(.064,.360),(.049,.396),(-.049,.396),(-.064,.36)],-.08,.058,'586367')
profile('고정 스커트 캡',[(-.050,.018),(.050,.018),(.050,.259),(.023,.286),(-.023,.286),(-.050,.259)],-.11,.08,'a4adae')

bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'escalator.blend'),compress=True)
