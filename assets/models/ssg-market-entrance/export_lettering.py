"""Project the native gilt lettering onto the front of the low-detail lintel."""
import base64
import math
from pathlib import Path
import bpy

WIDTH, HEIGHT = 640, 40
LINTEL_WIDTH, LINTEL_BASE, LINTEL_HEIGHT = 6.60, 3.44, .40

def bake_lettering(objects):
    # Viewed from Blender +X, the writing reads left to right along native +Y.
    pixels = bytearray(WIDTH * HEIGHT // 8)
    for obj in objects:
        if not any(slot.material and slot.material.name == '글자 · 금박' for slot in obj.material_slots):
            continue
        me = obj.data
        me.calc_loop_triangles()
        projected = []
        for vert in me.vertices:
            p = obj.matrix_world @ vert.co
            projected.append(((p.y / LINTEL_WIDTH + .5) * WIDTH, (p.z - LINTEL_BASE) / LINTEL_HEIGHT * HEIGHT))
        for tri in me.loop_triangles:
            a,b,c = [projected[i] for i in tri.vertices]
            points = [a,b,c]
            lo = [max(0,math.floor(min(p[i] for p in points))) for i in range(2)]
            hi = [min(limit,math.ceil(max(p[i] for p in points))) for i,limit in enumerate((WIDTH,HEIGHT))]
            for y in range(lo[1],hi[1]):
                for x in range(lo[0],hi[0]):
                    sides=[]
                    for u,v in ((a,b),(b,c),(c,a)):
                        sides.append((v[0]-u[0])*(y+.5-u[1])-(v[1]-u[1])*(x+.5-u[0]))
                    if min(sides) >= 0 or max(sides) <= 0:
                        i=y*WIDTH+x
                        pixels[i//8] |= 1 << (i%8)
    if not any(pixels):
        raise ValueError('No gold entrance letters intersect the lintel')
    # Long runs of zero bytes dominate. Prefix every literal segment by the count
    # of preceding zeroes and the literal length; no asynchronous decoder is needed.
    chunks=bytearray();i=0
    while i<len(pixels):
        start=i
        while i<len(pixels) and pixels[i]==0 and i-start<255:i+=1
        empty=i-start;start=i
        while i<len(pixels) and pixels[i]!=0 and i-start<255:i+=1
        chunks.extend((empty,i-start));chunks.extend(pixels[start:i])
    return base64.b64encode(chunks).decode('ascii')

def write_label_module(objects):
    path=Path(bpy.data.filepath).parent/'model.js'
    source=path.read_text()
    prefix="const giltMask = '"; start=source.index(prefix)+len(prefix); end=source.index("';",start)
    mask=bake_lettering(objects)
    path.write_text(source[:start]+mask+source[end:])
