"""Editable 3D letter outlines. The EDIYA alphabet follows the official 2024 wordmark."""
import math
import bpy
from geometry import Part

def loop(x,y,rx,ry,n=28,power=2.42):
    def squash(v):
        return math.copysign(abs(v)**(2/power),v)
    return [(x+rx*squash(math.cos(k*math.tau/n)),y+ry*squash(math.sin(k*math.tau/n))) for k in range(n)]

def glyph(char):
    if char=='E':return [.81, [[(0,0),(.81,0),(.81,.23),(.31,.23),(.31,.40),(.72,.40),(.72,.61),(.31,.61),(.31,.78),(.81,.78),(.81,1),(0,1)]]]
    if char=='F':return [.78, [[(0,0),(.32,0),(.32,.37),(.71,.37),(.71,.60),(.32,.60),(.32,.77),(.78,.77),(.78,1),(0,1)]]]
    if char=='I':return [.31,[[(0,0),(.31,0),(.31,1),(0,1)]]]
    if char=='Y':return [.99, [[(.33,0),(.65,0),(.65,.36),(.99,1),(.65,1),(.497,.645),(.34,1),(0,1),(.33,.36)]]]
    if char=='A':return [.99,[[(0,0),(.32,0),(.37,.18),(.65,.18),(.70,0),(.99,0),(.64,1),(.34,1)],[(.425,.397),(.595,.397),(.506,.709)]]]
    if char=='O':return [1.05,[loop(.525,.5,.525,.5),loop(.525,.50,.192,.275,power=2.27)]]
    if char=='D':
        front=[(0,0),(.48,0)]+[(.48+.49*math.cos(t),.50+.50*math.sin(t)) for t in [-math.pi/2+k*math.pi/18 for k in range(1,19)]]+[(0,1)]
        counter=[(.32,.22),(.45,.22)]+[(.45+.18*math.cos(t),.50+.28*math.sin(t)) for t in [-math.pi/2+k*math.pi/16 for k in range(1,17)]]+[(.32,.78)]
        return [.97,[front,counter]]
    if char=='C':
        def arc(rx,ry,angs):
            return [(.53+rx*math.copysign(abs(math.cos(t))**.79,math.cos(t)),.5+ry*math.copysign(abs(math.sin(t))**.79,math.sin(t))) for t in angs]
        outside=arc(.53,.50,[.30+i*(2*math.pi-.60)/27 for i in range(28)])
        inside=arc(.208,.264,[2*math.pi-.50-i*(2*math.pi-1.0)/23 for i in range(24)])
        return [1.02,[outside+inside]]

def area(poly):
    return sum(x*poly[(i+1)%len(poly)][1]-poly[(i+1)%len(poly)][0]*y for i,(x,y) in enumerate(poly))

def ediya_curve(low):
    curve=bpy.data.curves.new('EDIYA COFFEE · individual closed outlines','CURVE')
    curve.dimensions='2D';curve.fill_mode='BOTH'
    cursor=0
    for c in 'EDIYA COFFEE':
        if c==' ':cursor+=.39;continue
        width,contours=glyph(c)
        for i,poly in enumerate(contours):
            if (area(poly)>0)!=(i==0):poly=list(reversed(poly))
            sp=curve.splines.new('POLY');sp.points.add(len(poly)-1)
            for v,(x,y) in zip(sp.points,poly):v.co=(cursor+x,y,0,1)
            sp.use_cyclic_u=True
        cursor+=width+.107
    curve.extrude=0 if low else .055
    return curve

def extract(curve,name,x,d,h,width,swatch,low,variable_height=1.0):
    obj=bpy.data.objects.new(name,curve);bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.update()
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
    xmin,xmax=min(v.co.x for v in mesh.vertices),max(v.co.x for v in mesh.vertices)
    ymin,ymax=min(v.co.y for v in mesh.vertices),max(v.co.y for v in mesh.vertices)
    k=width/(xmax-xmin)
    letters=Part(name,'Metal')
    for tri in mesh.loop_triangles:
        n=tri.normal
        if low and n.z<.85:continue
        points=[mesh.vertices[j].co for j in tri.vertices]
        letters.face([(x+(v.x-(xmin+xmax)/2)*k,d+v.z*k,h+(v.y-(ymin+ymax)/2)*k*variable_height) for v in points],swatch,
                     (n.x,n.z,n.y),1.0 if n.z>.80 else .66)
    evaluated.to_mesh_clear()
    if low:bpy.data.objects.remove(obj,do_unlink=True)
    else:
        obj.location=(x-(xmin+xmax)*k/2,-d,h-(ymin+ymax)*k*variable_height/2)
        obj.rotation_euler.x=math.pi/2;obj.scale=(k,k*variable_height,k);obj.hide_render=True;obj.hide_viewport=True
    return letters

def signage(low=False):
    result=[extract(ediya_curve(low),'EDIYA COFFEE · upper channel letters',7.33,.431,6.82,5.27,4,low)]
    if not low:
        backing=extract(ediya_curve(True),'EDIYA COFFEE · offset letter shadow',7.365,.377,6.793,5.27,7,True)
        result.append(backing)
        light=extract(ediya_curve(True),'EDIYA COFFEE · lit faces',7.33,.463,6.82,5.27,4,True)
        light.finish='Lamps';result.append(light)
        upper=extract(ediya_curve(low),'EDIYA COFFEE · behind the upper glazing',7.48,-.58,5.69,2.38,4,False)
        upper.finish='Lamps';result.append(upper)
    for text,x,h,w in [('Kitchen & Pub',-2.86,6.72,3.15),('dolly 9',.01,6.81,2.17)]:
        c=bpy.data.curves.new(text,'FONT');c.body=text;c.size=1;c.space_character=1.045;c.resolution_u=2 if low else 4
        c.extrude=0 if low else .023
        if text=='dolly 9':c.offset=.015
        result.append(extract(c,text,x,.397,h,w,6 if text=='dolly 9' else 4,low,1.04))
    return result
