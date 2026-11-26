import sharp from 'sharp';
const out=process.argv[2];
const font='Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif';
const text=(x,y,size,color,value,extra='')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="'+font+'" font-size="'+size+'" '+extra+'>'+value+'</text>';
// All signs below are original vector type. Coordinates denote regions in the
// same packed atlas used on the native front, rear and side glazing.
for(const [route,to] of [['142','도봉산'],['360','여의도']]){
  let content='<rect width="1024" height="1024" fill="none"/>';
  content+='<defs><pattern id="led" width="3.5" height="3.5" patternUnits="userSpaceOnUse"><circle cx="1.7" cy="1.7" r="1.38" fill="white"/></pattern><mask id="matrix"><rect width="1024" height="200" fill="url(#led)"/></mask></defs>';
  content+='<rect width="1024" height="196" fill="#101c1d"/><g mask="url(#matrix)" font-weight="800">';
  content+=text(20,147,143,'#ffc971',route)+text(328,90,83,'#9cebb6','고속터미널')+text(339,164,48,'#fbd882',to+' 방면')+'</g>';

  content+=text(14,351,148,'#fbfaf6',route,'font-weight="800"')+text(352,300,75,'#f3f4f6','간선버스','font-weight="700"')+text(356,352,34,'#bde6f2','SEOUL METROPOLITAN BUS','letter-spacing="1.2"');
  content+='<rect y="383" width="1024" height="135" rx="4" fill="#202e35"/>';
  content+=text(28,474,82,'#fdcf73',route+'  고속터미널','font-weight="700"');

  content+=text(32,610,64,'#ffffff','서울특별시')+text(398,607,40,'#c7e6f1','저상 전기버스','font-weight="600"');
  content+=text(45,737,46,'#f0fbff','저상버스')+text(383,736,42,'#efefdf','승차')+text(756,736,42,'#faf3d6','하차');
  for(const [x,dir] of [[300,1],[695,-1]])content+='<path d="M'+x+' 719h45m-17 -15l18 15 -18 15" fill="none" stroke="#e7f4e2" stroke-width="7" transform="translate('+ (dir<0?2*x+45:0) +' 0) scale('+dir+' 1)"/>';
  // Substitute artwork for a changing roadside campaign, drawn for the model.
  content+='<rect y="782" width="1024" height="226" rx="3" fill="#eceadd"/><path d="M0 969Q85 930 152 963T327 968L327 1008H0Z" fill="#699996"/>';
  content+='<path d="M19 926h247m-233 0v35m42-35v30m42-30v32m42-32v37m42-37v33m42-33v33" fill="none" stroke="#436d76" stroke-width="5"/>';
  for(let i=0;i<18;i++){const x=33+i*12;content+='<path d="M'+x+' 922q6 -'+(29+18*Math.sin(Math.PI*i/17))+' 14 -1" fill="none" stroke="'+['#789da5','#d29287','#b4ad76'][i%3]+'" stroke-width="3"/>';}
  content+=text(322,870,35,'#476c70','반포 한강공원','letter-spacing="2"')+text(319,948,68,'#213d48','달빛무지개분수','font-weight="700"');
  content+=text(327,986,22,'#637b7b','BANPO HANGANG PARK   ·   MOONLIGHT RAINBOW FOUNTAIN');
  await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">'+content+'</svg>')).webp({quality:93,effort:5}).toFile(out+'/'+route+'.webp');
}
