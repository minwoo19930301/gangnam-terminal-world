"""Interpret the published exterior palettes on the source tower wall planes."""
from math import floor
import struct
import zlib
from functools import lru_cache
import bpy
from mathutils import Vector


@lru_cache(None)
def colour(hex_colour):
    rgb=[int(hex_colour[i:i+2],16)/255 for i in (0,2,4)]
    return (*[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb],1)


def glazing_atlas(material):
    # One repeat covers a single generic storey. The alpha cutout leaves the
    # true opaque cladding behind the window, also when its night shader runs.
    size=96
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
    rows=[]
    for y in range(size):
        row=bytearray([0])
        for x in range(size):
            sky=round(218+26*(1-y/size))
            # Recess under the head and beside the left jamb. Mipmapped
            # cutouts separate floors and subdivide wide panes at long range.
            recess=18 if 12<=y<17 or x<4 else 0
            opaque=12<=y<=77 and x>1 and x<94
            row.extend((sky-recess,sky-recess,min(255,sky+3-recess),255 if opaque else 0))
        rows.append(row)
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows),9))+chunk(b'IEND',b'')
    image=bpy.data.images.get('Storey glazing cutout')
    if not image:
        image=bpy.data.images.new('Storey glazing cutout',size,size,alpha=True)
        image.pack(data=data,data_len=len(data));image.source='FILE'
        image.filepath_raw='//storey-glazing.png'
    nodes=material.node_tree.nodes;links=material.node_tree.links
    bs=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    tint=bs.inputs['Base Color'].links[0].from_socket
    tex=nodes.new('ShaderNodeTexImage');tex.image=image;tex.name='Storey glazing'
    mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    links.new(tex.outputs['Color'],mix.inputs[1]);links.new(tint,mix.inputs[2]);links.new(mix.outputs[0],bs.inputs['Base Color'])
    mask=nodes.new('ShaderNodeMath');mask.operation='GREATER_THAN';mask.inputs[1].default_value=.48
    links.new(tex.outputs['Alpha'],mask.inputs[0]);links.new(mask.outputs[0],bs.inputs['Alpha'])
    bs.inputs['Roughness'].default_value=.57
    bs.inputs['Metallic'].default_value=.045


def finish(obj,model_id):
    old=obj.data
    leel=model_id=='apt-a10023673'
    verts=[];polygons=[];slots=[];tints=[];uvs=[]
    def face(corners,slot,colors,uv=None):
        start=len(verts)
        verts.extend(corners)
        polygons.append(tuple(range(start,len(verts))))
        slots.append(slot);tints.extend(colors);uvs.extend(uv or [(0,0)]*len(corners))
    # Keep the podium, each original tower wall, roof steps and parapets. The
    # procedural horizontal glazing strips are the only faces replaced.
    limits=[(min(v.co[i] for v in old.vertices),max(v.co[i] for v in old.vertices)) for i in range(2)]
    sides=[]
    for p in old.polygons:
        if p.material_index==1:continue
        points=[old.vertices[i].co.copy() for i in p.vertices]
        colors=[tuple(old.color_attributes.active_color.data[i].color) for i in p.loop_indices]
        face(points,p.material_index,colors)
        low=min(v.z for v in points);height=max(v.z for v in points)
        foot=[v for v in points if abs(v.z-low)<.025]
        if p.material_index==0 and low<.1 and height>10 and len(foot)==2 and abs(p.normal.z)<.05:
            sides.append((foot[0],foot[1],p.normal.copy(),height))

    for start,end,normal,height in sides:
        tangent=(end-start).normalized()
        if tangent.cross(Vector((0,0,1))).dot(normal)<0:
            start,end=end,start;tangent=-tangent
        length=(end-start).length
        if length<.9:continue
        def panel(left,right,lo,hi,depth,slot,color,upper=None,rows=0):
            if right<=left or hi<=lo:return
            a=start+tangent*left+normal*depth;b=start+tangent*right+normal*depth
            c0=colour(color);c1=colour(upper or color)
            # At extreme building corners the source glass already defines
            # the extent. Fit the cladding relief inside that original envelope.
            ax,ay,bx,by=[max(limits[i][0],min(limits[i][1],v)) for i,v in [(0,a.x),(1,a.y),(0,b.x),(1,b.y)]]
            face([(ax,ay,lo),(bx,by,lo),(bx,by,hi),(ax,ay,hi)],slot,[c0,c0,c1,c1],[(0,0),(1,0),(1,rows),(0,rows)] if rows else None)

        roof=height-.26
        courses=max(2,round(roof/2.92));rise=roof/courses
        if model_id == 'apt-a13790828':
            # The existing slabs photographed in February 2024 have unlike long
            # elevations: shaded gallery bands and enclosed blue-green balconies.
            # Follow the source wall orientation without assigning individual units.
            if length < 3:
                panel(0,length,.02,roof,.012,0,'C6B8A3')
                continue
            # At the bend of 201-dong the street photograph shows a salmon
            # panel with narrow staggered windows continuing above the roof.
            # The adjacent long glazed and gallery faces stay on their source axes.
            mid=obj.location+(start+end)*.5
            if abs(mid.x+58.75)<.45 and abs(mid.y-218.1)<.45 and 42<length<44:
                # The adjoining west-facing wing has rounded balcony openings
                # cut into cream cladding, clearly different from the gallery.
                panel(0,length,.02,roof,.02,0,'D9CFBA')
                bays=10
                bay=length/bays
                for col in range(bays):
                    left=col*bay+.29
                    right=(col+1)*bay-.29
                    for row in range(courses):
                        lo=row*rise+.38
                        hi=(row+1)*rise-.34
                        # Chamfered corners approximate the curved concrete reveals.
                        coords=[(left+.20,lo),(right-.20,lo),(right,lo+.22),
                                (right,hi-.22),(right-.20,hi),(left+.20,hi),
                                (left,hi-.22),(left,lo+.22)]
                        points=[]
                        tex=[]
                        for s,z in coords:
                            v=start+tangent*s+normal*.048
                            points.append((v.x,v.y,z))
                            tex.append((.10+.80*(s-left)/(right-left),
                                        row+.30+.45*(z-lo)/(hi-lo)))
                        face(points,1,[colour('64787A')]*8,tex)
                    center=(left+right)*.5
                    panel(center-.045,center+.045,.16,roof-.17,.057,0,'B2B0A2')
                continue
            if abs(mid.x+45.1)<.45 and abs(mid.y-193.8)<.45 and 11.8<length<12.4:
                def along(s):
                    return s if start.y>end.y else length-s
                def frontage(s0,s1,z0,z1,depth,tone):
                    left,right=sorted((along(s0),along(s1)))
                    panel(left,right,z0,z1,depth,0,tone)
                frontage(0,length,.02,height,.028,'D7C5AC')
                strip0,strip1=1.05,7.55
                frontage(strip0,strip1,.03,height,.105,'C3988A')
                for level in range(courses):
                    base=level*rise
                    for s,offset in ((strip0+.63,.06),(strip0+3.98,.49)):
                        sill=base+rise*offset
                        frontage(s,s+1.23,sill,sill+.79,.119,'A78577')
                        frontage(s+.07,s+1.16,sill+.09,sill+.72,.125,'505451')
                        frontage(s+.60,s+.655,sill+.09,sill+.72,.13,'A28E7C')
                # Closed roof return and projecting cream rim seen against the sky.
                left,right=sorted((along(strip0),along(strip1)))
                def corner(s,d,h):
                    v=start+tangent*s+normal*d
                    return (v.x,v.y,h)
                lo,hi=height-.02,height+3.20
                outer,inner=.106,-1.48
                corners=[corner(s,d,h) for h in (lo,hi) for s,d in
                         ((left,outer),(right,outer),(right,inner),(left,inner))]
                for indices,tone in [((0,1,5,4),'C3988A'),((1,2,6,5),'E1D2BC'),
                                     ((2,3,7,6),'C2AF9D'),((3,0,4,7),'CEBCA8'),
                                     ((4,5,6,7),'A79788')]:
                    points=[corners[i] for i in indices]
                    face(points,0,[colour(tone)]*4)
                continue
            count=max(1,round(length/4.0))
            bay=length/count
            gallery=length>=16 and normal.y<0
            for col in range(count):
                left=col*bay
                right=left+bay
                if gallery:
                    panel(left,right,.02,roof,.013,0,'70665C')
                    # A darker opening behind the front parapet gives selective
                    # light at night while the gallery slab itself stays dark.
                    panel(left+bay*.18,left+bay*.78,.16,roof,.031,1,
                          '5C635E','777A6C',courses)
                    pier='C39885' if col%4==0 else 'BCAB97'
                    panel(left,left+.22,.06,roof,.094,0,pier)
                else:
                    panel(left,right,.02,roof,.013,0,'CBBEA9')
                    margin=.35 if length>=16 else bay*.29
                    panel(left+margin,right-margin,.14,roof,.034,1,
                          ['466466','4A6566','536E6C'][col%3],'789089',courses)
                    centre=left+bay*.51
                    panel(centre-.052,centre+.052,.09,roof-.04,.056,0,'9C9C8D')
            for row in range(courses):
                sill=row*rise
                if gallery:
                    panel(.03,length-.03,sill+.08,sill+.80,.079,0,'BDA997','D6C6AD')
                    panel(0,length,sill+.80,sill+.94,.15,0,'A29584')
                elif length>=16:
                    panel(.08,length-.08,sill+.15,sill+.31,.076,0,'918579')
            if gallery:
                for col in range(0,count,4):
                    panel(col*bay,col*bay+.27,.06,roof,.105,0,'BC9783')
            continue
        n=max(1,round(length/3.25));bay=length/n
        # Long south-east elevation of 101-dong, fixed to the existing source wall.
        # The eastern four-storey shoulder and the shadow beneath its thin cap
        # are visible from Sinbanpo-ro. No other tower uses this finish.
        middle=obj.location+(start+end)*.5
        street_crown=(leel and abs(middle.x+115.69)<.8 and abs(middle.y-192.07)<.8
                      and 29<length<30 and normal.y<-.9)
        orientation=normal.x*normal.y<0
        for col in range(n):
            x0=col*bay;x1=(col+1)*bay;t=(col+.5)/n
            # On Le|El, a dark central bay sits between pale side grids.
            # Xi has alternating slate glazing and a pale grid with stepped returns.
            cobalt=.31<t<.70 if n>=4 else orientation
            salmon=(not leel and n>=4 and col==(n-1 if orientation else 0))
            shell='506B86' if leel and cobalt else 'C6D0D7' if leel else '9FAEB8' if cobalt else 'DFDCD6'
            panel(x0,x1,.018,roof,.011,0,shell)
            if street_crown and t>=.31 and not cobalt:
                panel(x0,x1,(courses-6)*rise,roof,.028,0,'516779')
            if salmon:
                panel(x0+.035,x0+bay*.67,.03,roof,.028,0,'B78678')
                panel(x0+bay*.65,x0+bay*.68,.03,roof,.032,0,'836D68')
            shift=(floor(start.x*2)+floor(start.y)*3+col*7)%11
            if not leel:
                panel(x0+.035,x1-.035,.03,2*rise,.027,0,'666767')
            if length<2.5:continue
            for row in range(0,courses,4):
                end_row=min(courses,row+4);idx=(row//4*3+col+shift)%7
                upper_blue=street_crown and t>=.31 and row>=courses-6
                if leel:
                    border=.16 if cobalt or upper_blue else .39
                    glass=(['284C79','2E5684','355A83','2C4A73','395C81','31577B','365678'] if cobalt or upper_blue else
                           ['496780','4C708C','486980','607789','526C7C','506C83','56748A'])[idx]
                    upper='456A91' if cobalt or upper_blue else '6B859B'
                else:
                    border=.23 if cobalt else .35
                    glass=['405967','4A616B','526975','415765','4A6676','566974','49606D'][idx]
                    upper='6D8390'
                left=x0+border;right=x1-border
                if salmon:left=x0+bay*.70
                if not leel and not cobalt and n>=4 and col==n//2 and row//4%2:left+=.34
                panel(left,right,rise*row,rise*end_row,.038,1,glass,upper,end_row-row)
            if length>=2.5:
                mullion=x0+bay*(.84 if salmon else .58)
                panel(mullion-.042,mullion+.042,.10,roof-.06,.047,0,
                      '73899E' if leel and cobalt else 'B7C2C7' if leel else '88989F')
                if leel and cobalt:
                    panel(x0+.015,x0+.112,.10,roof-.04,.043,0,'AABAC6')
        if leel:
            blue=[i for i in range(n) if (.31<(i+.5)/n<.70 if n>=4 else orientation)]
            if blue:
                for row in range(1,courses):
                    panel(blue[0]*bay+.09,(blue[-1]+1)*bay-.09,row*rise+.02,row*rise+.18,.050,0,'A2B6C4')
        if street_crown:
            # Recessed dark clerestory below a pale rim. Taper the returns into
            # the existing roof plane and retain the original height.
            left=length*.317;right=length-.45
            panel(left,right,roof-1.42,roof-.17,.081,0,'383D43','272F38')
            for i in range(5):
                pos=left+(right-left)*i/4
                panel(max(left,pos-.085),min(right,pos+.085),roof-1.42,roof-.14,.11,0,'899198')
            a=start+tangent*left;b=start+tangent*right
            # Walk around each visible face to keep its normal pointing out.
            def rim_point(point,depth,z):
                v=point+normal*depth
                return (v.x,v.y,z)
            back=.064;front=.64;lo=roof-.17;hi=roof+.03
            aa,bb,cc,dd=[rim_point(p,d,lo) for p,d in
                         ((a,back),(b,back),(b,front),(a,front))]
            ee,ff,gg,hh=[(v[0],v[1],hi) for v in (aa,bb,cc,dd)]
            for corners,tone in [
                    ((aa,bb,cc,dd),'3A4148'),((hh,gg,ff,ee),'7C848A'),
                    ((dd,cc,gg,hh),'B1B8BC'),((aa,dd,hh,ee),'7C848A'),
                    ((cc,bb,ff,gg),'7C848A')]:
                face(corners,0,[colour(tone)]*4)
    replacement=bpy.data.meshes.new(obj.name+' · 외관 마감과 유리')
    replacement.from_pydata(verts,[],polygons);replacement.update()
    for m in old.materials:replacement.materials.append(m)
    replacement.polygons.foreach_set('material_index',slots)
    attr=replacement.color_attributes.new(name=old.color_attributes.active_color.name,type='FLOAT_COLOR',domain='CORNER')
    attr.data.foreach_set('color',[v for color in tints for v in color])
    replacement.color_attributes.active_color=attr
    replacement.color_attributes.render_color_index=0
    uv=replacement.uv_layers.new(name='Storey repeat')
    uv.data.foreach_set('uv',[v for pair in uvs for v in pair])
    glazing_atlas(replacement.materials[1])
    obj.data=replacement
    bpy.data.meshes.remove(old)
