"""Editable public-facing cladding and lettering, in local x / front / height axes."""
import base64
import math
import struct

import bpy
from mathutils import Vector


def lin(c):
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4

class Part:
    columns=4
    rows=2
    def __init__(self,name,finish='Stone'):
        self.name,self.finish=name,finish
        self.verts,self.faces,self.loops=[],[],[]

    def face(self,points,swatch,normal,tint=1.,uv=None):
        if len(points)<3:return
        coords=[Vector((x,-d,z)) for x,d,z in points]
        n=Vector((normal[0],-normal[1],normal[2]))
        facing=(coords[1]-coords[0]).cross(coords[2]-coords[0])
        if facing.length<1e-7:return
        order=list(range(len(coords)))
        if facing.dot(n)<0: order.reverse()
        if uv is None:
            a,b,c=map(abs,normal)
            projection=[(x,d) if c>=max(a,b) else (x,z) if b>=a else (d,z) for x,d,z in points]
            minx,miny=map(min,zip(*projection));maxx,maxy=map(max,zip(*projection))
            scale=2.2 if swatch==2 else 1.4
            uv=[((x-minx)/max(scale,maxx-minx),(y-miny)/max(scale,maxy-miny)) for x,y in projection]
        first=len(self.verts);self.verts.extend(coords)
        self.faces.append([first+i for i in order])
        for i in order:
            light=tint(*points[i]) if callable(tint) else tint
            if isinstance(light,(int,float)):light=(light,light,light)
            tex=uv[i]
            self.loops.append((swatch,((swatch%self.columns+.019+.962*tex[0])/self.columns,(swatch//self.columns+.019+.962*tex[1])/self.rows),tuple(lin(min(1,max(0,a))) for a in light)+(1,)))

    def front(self,a,z0,b,z1,d,swatch,tint=1.):
        self.face([(a,d,z0),(b,d,z0),(b,d,z1),(a,d,z1)],swatch,(0,1,0),tint)

    def top(self,a,b,c,d,h,swatch,tint=1.,down=False):
        self.face([(a,b,h),(c,b,h),(c,d,h),(a,d,h)],swatch,(0,0,-1 if down else 1),tint)

    def box(self,x,d,h,w,deep,high,swatch,tint=1.):
        a,b=x-w/2,x+w/2
        self.prism([(a,h),(b,h),(b,h+high),(a,h+high)],d-deep/2,d+deep/2,swatch,tint)

    def prism(self,outline,back,front,swatch,tint=1.,side=None):
        self.face([(x,front,z) for x,z in outline],swatch,(0,1,0),tint)
        self.face([(x,back,z) for x,z in outline],swatch,(0,-1,0),tint)
        area=sum(x*outline[(i+1)%len(outline)][1]-outline[(i+1)%len(outline)][0]*z for i,(x,z) in enumerate(outline))
        for i,(x0,z0) in enumerate(outline):
            x1,z1=outline[(i+1)%len(outline)]
            norm=(z1-z0,0,x0-x1) if area>0 else (z0-z1,0,x1-x0)
            self.face([(x0,front,z0),(x1,front,z1),(x1,back,z1),(x0,back,z0)],swatch if side is None else side,norm,tint)

    def stroke(self,path,w,back,front,swatch,tint=1.,side=None):
        # Mitred flat-faced sign channel. Keep closed counters open on the
        # square MI and BIEUP, and rounded on IEUNG.
        closed=math.dist(path[0],path[-1])<.0001
        pts=path[:-1] if closed else path
        if len(pts)<2:return
        true=[]
        for a in pts:
            if not true or math.dist(a,true[-1])>.0001:true.append(a)
        pts=true
        r=w/2;rails=[]
        def normal(a,b):
            dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
            return (-dy/length,dx/length)
        for i,p in enumerate(pts):
            if not closed and i==0:n=normal(p,pts[1])
            elif not closed and i==len(pts)-1:n=normal(pts[i-1],p)
            else:
                a=normal(pts[(i-1)%len(pts)],p);b=normal(p,pts[(i+1)%len(pts)])
                denom=max(.35,1+a[0]*b[0]+a[1]*b[1]);n=((a[0]+b[0])/denom,(a[1]+b[1])/denom)
            rails.append(((p[0]+r*n[0],p[1]+r*n[1]),(p[0]-r*n[0],p[1]-r*n[1])))
        for i in range(len(pts) if closed else len(pts)-1):
            l0,r0=rails[i];l1,r1=rails[(i+1)%len(rails)]
            self.prism([r0,r1,l1,l0],back,front,swatch,tint,side)

    def mesh(self,collection,materials):
        mesh=bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.verts,[],self.faces)
        mesh.materials.append(materials[self.finish])
        mesh.uv_layers.new(name='Original finish atlas')
        mesh.color_attributes.new(name='Finish tint',type='BYTE_COLOR',domain='CORNER')
        mesh.uv_layers['Original finish atlas'].uv.foreach_set('vector',[v for _,tex,_ in self.loops for v in tex])
        mesh.color_attributes['Finish tint'].data.foreach_set('color',[v for _,_,colour in self.loops for v in colour])
        obj=bpy.data.objects.new(self.name,mesh);collection.objects.link(obj)
        return obj


def write_proxy(parts,file,palette):
    vertices=bytearray();indices=[];unique={}
    for p in parts:
        if p.finish=='Glass':continue
        cursor=0
        for poly in p.faces:
            face=[]
            for index in poly:
                sw,uv,tint=p.loops[cursor];cursor+=1
                x,negd,z=p.verts[index]
                rgb=tuple(round(lin(c/255)*v*255) for c,v in zip(palette[sw],tint[:3]))
                key=(round(x*100),round(z*100),round(-negd*100),*rgb)
                if key not in unique:
                    unique[key]=len(unique);vertices+=struct.pack('<3h3B',*key)
                face.append(unique[key])
            for i in range(1,len(face)-1):indices.extend((face[0],face[i],face[i+1]))
    encode=lambda d:base64.b64encode(d).decode('ascii')
    idx=struct.pack('<'+'H'*len(indices),*indices)
    file.write_text('// Generated from the editable native distant mesh.\n'+
                   "export const vertices='"+encode(vertices)+"';\nexport const triangles='"+encode(idx)+"';\n")
