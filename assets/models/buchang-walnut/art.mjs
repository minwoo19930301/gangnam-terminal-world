// Build an original print, wood and pastry finish sheet for the editable shop.
import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
const rings=JSON.parse(await readFile(new URL('./mark.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true});
try{
  const p=await browser.newPage();
  const encoded=await p.evaluate(rings=>{
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
    const g=canvas.getContext('2d');g.fillStyle='white';g.fillRect(0,0,768,512);
    let seed=1963;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
    function drawMark(test,x,y,w,h){
      const group=rings.filter(r=>test(r[0][0],r[0][1])),pts=group.flat();
      const lx=Math.min(...pts.map(q=>q[0])),rx=Math.max(...pts.map(q=>q[0]));
      const ty=Math.min(...pts.map(q=>q[1])),by=Math.max(...pts.map(q=>q[1]));
      g.beginPath();for(const r of group){r.forEach((q,i)=>g[i?'lineTo':'moveTo'](x+(q[0]-lx)*w/(rx-lx),y+(q[1]-ty)*h/(by-ty)));g.closePath();}g.fill('evenodd');
    }
    function text(str,x,y,size,font='Georgia,serif',bold=false){
      g.font=(bold?'bold ':'')+size+'px '+font;g.textAlign='center';g.fillText(str,x,y);
    }
    const flower=(_,y)=>y<415,hangul=(_,y)=>y>420&&y<505;
    // The four-character box cover, central flower and small contrasting side legends.
    g.fillStyle='#ede3ca';g.fillRect(0,0,320,195);
    g.strokeStyle='#292723';g.lineWidth=2;g.strokeRect(9,8,302,179);g.lineWidth=.8;g.strokeRect(12,11,296,173);
    g.fillStyle='#252420';drawMark(flower,112,40,96,96);
    drawMark((x,y)=>hangul(x,y)&&x<391,28,29,92,37);
    drawMark((x,y)=>hangul(x,y)&&x>=391,202,29,92,37);
    text('TRADE',65,107,12,'Georgia',true);text('MARK',261,107,12,'Georgia',true);
    text('富 昌',68,161,27,'Songti SC, AppleMyungjo, serif',true);text('製 菓',254,161,27,'Songti SC, AppleMyungjo, serif',true);
    text('EST 1963',160,158,8,'Georgia',true);
    // Paper carrier: the same five-petal maker’s mark and Korean brush name.
    g.fillStyle='#eee4ce';g.fillRect(327,0,176,211);
    g.fillStyle='#26241f';drawMark(flower,381,38,68,68);drawMark(hangul,344,120,142,30);
    text('EST 1963',415,166,10,'Georgia',true);
    // A restrained pastry identification card. Only the two documented names are printed.
    for(const [i,str] of ['팥앙금 호두과자','우유니소금 호두과자'].entries()){
      const y=8+i*70;g.fillStyle='#f4efdf';g.fillRect(513,y,245,61);
      g.fillStyle='#514938';drawMark(flower,628,y+4,16,16);text(str,636,y+43,16,'AppleMyungjo, serif',true);
      g.strokeStyle='#b6a88a';g.lineWidth=.8;g.beginPath();g.moveTo(531,y+51);g.lineTo(740,y+51);g.stroke();
    }
    // Walnut veneer; no source photo is embedded. Different cabinet components sample different offsets.
    const wood=g.createLinearGradient(0,222,0,350);wood.addColorStop(0,'#82593b');wood.addColorStop(.5,'#946647');wood.addColorStop(1,'#755039');
    g.fillStyle=wood;g.fillRect(0,218,320,144);
    for(let i=0;i<420;i++){
      const y=218+random()*144,f=random(),d=random();
      g.strokeStyle=i%3?'rgba(73,45,30,'+(.08+f*.14)+')':'rgba(232,194,135,'+(.09+f*.16)+')';g.lineWidth=.3+f*.7;
      g.beginPath();for(let x=0;x<=320;x+=4){let v=y+2*Math.sin(x/(42+f*26)+d*8)+3*Math.cos(x/59+d*18);g[x?'lineTo':'moveTo'](x,v);}
      g.stroke();
    }
    // White crocheted cloth visible through the wood-framed sample box.
    g.fillStyle='#a19384';g.fillRect(327,220,281,153);
    g.save();g.beginPath();g.rect(328,221,280,152);g.clip();
    for(let y=219;y<385;y+=6)for(let x=323;x<621;x+=7){
      g.strokeStyle='#edebe2';g.lineWidth=1.15;g.beginPath();
      g.ellipse(x+(Math.round(y/6)%2)*3,y,3.6,2.4,Math.PI/4,0,Math.PI*2);g.stroke();
    }
    for(let y=236;y<389;y+=62)for(let x=341;x<638;x+=66){
      g.lineWidth=2.6;g.strokeStyle='#f7f3e7';for(let j=0;j<8;j++){
        const a=j*Math.PI/4;g.beginPath();g.ellipse(x+10*Math.cos(a),y+10*Math.sin(a),11,4.8,a,0,Math.PI*2);g.stroke();
      }
      g.fillStyle='#e5e0d0';g.beginPath();g.arc(x,y,4.3,0,Math.PI*2);g.fill();
    }
    g.restore();
    // The marble worktop has irregular warm grey veins under the curved guard.
    g.fillStyle='#eee8d9';g.fillRect(0,380,320,130);
    g.save();g.beginPath();g.rect(0,380,320,130);g.clip();
    for(let i=0;i<44;i++){g.strokeStyle=i%4?'rgba(156,154,145,.28)':'rgba(128,129,121,.45)';g.lineWidth=.4+random()*1.7;
      let x=-40+random()*365,y=375+random()*126;g.beginPath();g.moveTo(x,y);for(let j=0;j<14;j++){x+=random()*10;y-=random()*6;g.lineTo(x,y);}g.stroke();}g.restore();
    // Dry paper fibres/rice starch and cast iron have different surface grains.
    for(const [x,y,w,h,base] of [[515,148,243,61,'#484746'],[327,382,281,122,'#f5eee1']]){
      g.fillStyle=base;g.fillRect(x,y,w,h);for(let i=0;i<w*h*.16;i++){
        g.fillStyle=i%3?'rgba(46,37,29,.10)':'rgba(255,255,249,.29)';
        g.fillRect(x+random()*w,y+random()*h,random()*1.4,.6+random()*1.3);}
    }
    return canvas.toDataURL('image/png').split(',')[1];
  },rings);
  await writeFile(process.argv[2],Buffer.from(encoded,'base64'));
}finally{await browser.close();}
