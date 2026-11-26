"""Fluted seat-back, bentwood chairs, stone-topped tables and table service."""
import struct,zlib,tempfile,numpy as np
seat=part('seat');section(seat,'공개 식탁의 적갈색 골 등받이와 곡목 의자')
# Bench on the back side of the table, bentwood chairs opposite.
B('벤치 하부 짙은 목재',0,.604,.043,1.51,.45,.370,'walnut',.016)
B('적갈색 좌석 방석',0,.579,.413,1.55,.472,.092,'red',.030)
B('벤치 등받이 목재',0,.827,.460,1.56,.080,.654,'walnut',.018)
for i in range(13):
    B('세로로 누빈 가죽 골',(i-6)*.113,.79,.494,.114,.098,.538,'cushion' if i%4 else 'red',.035)
B('등받이 위 짙은 녹색 띠',0,.817,1.036,1.566,.127,.051,'sage',.013)
for x in [-.712,.712]:C('벤치 등 위 황동 난간 받침',x,.826,1.09,[(.013,0),(.013,.135)],'brass',9)
tube('벤치 위 얇은 황동 손잡이',[(-.734,.826,1.222),(.734,.826,1.222)],.013,'gold',9)
for x in [-.395,.395]:
    d=-.641;smooth(C('곡목 의자 둥근 좌판',x,d,.435,[(.164,0),(.194,.011),(.203,.034),(.198,.051),(.177,.062)],'oak',25,.94))
    for sg in [-1,1]:
        for sd in [-1,1]:tube('벌어진 곡목 의자 다리',[(x+sg*.177,d+sd*.179,.046),(x+sg*.144,d+sd*.134,.329),(x+sg*.143,d+sd*.122,.458)],.020,'walnut',8)
    # Steam-bent horseshoe back with separate lower rods and two open arm returns.
    hoop=[(x+.218*cos(a),d+.172*sin(a)-.037,.712+.129*max(0,-sin(a))) for a in [pi+i*pi/20 for i in range(21)]]
    tube('증기로 휜 곡목 반원 등',hoop,.023,'walnut',10)
    for sg in [-1,1]:
        tube('앞으로 낮아지는 팔걸이',[(x+sg*.151,d+.058,.476),(x+sg*.196,d+.077,.577),(x+sg*.221,d+.034,.672),(x+sg*.218,d-.037,.711)],.017,'oak',8)
    for j in [-2,-1,0,1,2]:
        xx=x+j*.065;tube('곡목 의자의 가는 등살',[(x+j*.030,d-.106,.492),(xx,d-.172,.662),(xx,d-.193+.016*abs(j),.812-.018*abs(j))],.010,'wood',7)
B('석판 아래 짙은 받침',0,0,.716,1.49,.772,.038,'walnut',.008)
for x in [-.468,.468]:
    C('식탁 주철 발판',x,0,.044,[(.167,0),(.172,.015),(.144,.035),(.05,.040)],'black',21,.92)
    C('두 다리 원형 기둥',x,0,.075,[(.043,0),(.035,.61),(.075,.639)],'ink',16)
stone=part('granite');section(stone,'사진에서 관찰한 흑운모·석영 얼룩을 직접 생성한 상판')
# The editable stone image is embedded in the native Blender file and in the two-triangle game surface.
# Layer coarse inclusions, quartz grains and dark flecks. It is generated from a fixed seed.
W,H=384,224;X,Z=np.meshgrid(np.arange(W),np.arange(H));rng=np.random.default_rng(8314)
def noise(w,h):
    field=rng.random((h+1,w+1));u=X/W*w;v=Z/H*h;i=u.astype(int);j=v.astype(int);a=u-i;b=v-j
    a=a*a*(3-2*a);b=b*b*(3-2*b)
    return ((1-a)*(1-b)*field[j,i]+a*(1-b)*field[j,i+1]+(1-a)*b*field[j+1,i]+a*b*field[j+1,i+1])
cloud=noise(31,18);crystal=noise(96,55);mineral=.59*noise(51,28)+.28*crystal+.13*rng.random((H,W));
base=np.clip(.52*cloud+.37*crystal+.11*rng.random((H,W)),0,1)
rgb=np.array([165,151,125])[None,None,:]+base[:,:,None]*np.array([67,66,72]);
rgb-=np.clip((.46-mineral)*5.2,0,1)[:,:,None]*np.array([139,131,120]);rgb+=np.clip((crystal-.66)*2.5,0,1)[:,:,None]*np.array([32,32,32]);rgb=np.clip(rgb,0,255).astype('uint8')
def chunk(tag,b):return struct.pack('>I',len(b))+tag+b+struct.pack('>I',zlib.crc32(tag+b)&0xffffffff)
with tempfile.TemporaryDirectory() as tmp:
    file=Path(tmp)/'grain.png';raw=b''.join(b'\0'+row.tobytes() for row in rgb)
    file.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',W,H,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,8))+chunk(b'IEND',b''));img=bpy.data.images.load(str(file));img.name='식탁의 화강석 결정 · 원본';img.pack();img.filepath='//granite.png'
mat=m.palette['granite'];bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.37;tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img;mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
ob=B('두꺼운 닦은 화강석',0,0,.748,1.56,.812,.032,'granite');uv=ob.data.uv_layers.new(name='판석 결')
for face in ob.data.polygons:
    for loop in face.loop_indices:
        x,y,z=ob.data.vertices[ob.data.loops[loop].vertex_index].co;uv.data[loop].uv=(x/1.56+.5,y/.812+.5)
service=part('setting');section(service,'절임병과 작은 접시·금속 수저·바구니')
for i in range(3):smooth(C('포개 놓은 앞접시',-.587,.253,.001+i*.008,[(.040,0),(.063,.003),(.082,.013),(.080,.017),(.068,.012),(.045,.009)],'porcelain',26))
for k in [-1,1]:
    xx=.354*k;dd=-.279
    smooth(C('일인용 회색 앞접시',xx,dd,.002,[(.046,0),(.071,.003),(.088,.012),(.090,.0145),(.085,.016),(.061,.008)],'metal',25))
    for a in [-.009,.009]:tube('가늘게 깎은 검은 젓가락',[(xx+.101+a,dd-.082,.013),(xx+.13+a,dd+.105,.015)],.0031,'black',6)
    tube('갈색 손잡이 스푼',[(xx+.064,dd-.087,.012),(xx+.079,dd+.057,.019)],.005,'wood',8)
    sphere('금속 숟가락 머리',xx+.081,dd+.080,.021,.015,.030,.005,'steel',13,5)
smooth(C('절임이 든 작은 갈색 유리병',.53,.253,.003,[(.052,0),(.062,.009),(.064,.093),(.047,.117),(.048,.130)],'blacktea',22));
for j in range(16):
    a=j*2.34;x=.53+.058*cos(a);d=.253+.058*sin(a);z=.020+(j%4)*.016
    tube('유리 너머의 총채 절임',[(x-.005,d,z),(x+.004,d+.006,z+.014),(x+.012,d,z+.021)],.0045,'pickles' if j%3 else 'pickles2',5)
C('유리병의 황동색 돌림 뚜껑',.53,.253,.129,[(.05,0),(.052,.013),(.049,.020)],'brass',23)
B('납작한 수저 바구니',.05,.285,.003,.259,.112,.019,'oak',.006)
for s in [-1,1]:
    B('등나무 가장자리',.05+s*.125,.285,.020,.010,.112,.018,'lightwood');B('등나무 앞뒤 가장자리',.05,.285+s*.050,.020,.252,.010,.019,'lightwood')
for i in range(10):B('작은 고리무늬 옮김',-.055+i*.023,.285,.022,.006,.095,.004,'panel')
