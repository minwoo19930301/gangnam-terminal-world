"""Public dining tables in the operator's wide dining-room photograph."""
from math import cos, pi, sin


def add_settings(Part, frame, glass):
    for index,x in enumerate([-9.5,-5.5,-1.5,2.5]):
        cloth=Part('다이닝 %d열 · 접힌 냅킨과 커트러리'%(index+1),frame)
        cups=Part('다이닝 %d열 · 투명 물잔'%(index+1),glass)
        for z in [-5.5,-1.5,2.5,6.5]:
            for side in [-1,1]:
                cx=x+side*.28
                for k,color in enumerate(['b9aa97','e8dece','f0e7d8']):
                    y=.744+k*.004
                    cloth.box(cx+side*k*.001,y,z,.18-k*.003,.004,.245-k*.006,color)
                # Raised diagonal fold, hem and the visible rolled corner.
                cloth.face([(cx-.087,.755,z-.116),(cx+.084,.757,z-.116),
                            (cx+.080,.765,z+.092)],'f4e9d9')
                cloth.beam((cx-.082,.755,z+.108),(cx+.076,.757,z+.108),.004,.004,'cebfab')
                cloth.beam((cx-.068,.756,z-.074),(cx+.041,.768,z+.016),.015,.007,'5f5852')
                cloth.beam((cx+.039,.769,z+.017),(cx+.068,.767,z+.045),.010,.005,'aba498')
                wx=cx-side*.065;wz=z+.177*side
                # A short open tumbler, including its inner surface and clear rim.
                rings=[(.744,.039),(.751,.045),(.841,.052),(.844,.049),(.753,.041)]
                for (h0,r0),(h1,r1) in zip(rings,rings[1:]):
                    for j in range(12):
                        a,b=2*pi*j/12,2*pi*(j+1)/12
                        cups.face([(wx+r0*cos(b),h0,wz+r0*sin(b)),(wx+r0*cos(a),h0,wz+r0*sin(a)),
                                   (wx+r1*cos(a),h1,wz+r1*sin(a)),(wx+r1*cos(b),h1,wz+r1*sin(b))],'e5e7dc')
        cloth.finish();cups.finish()
