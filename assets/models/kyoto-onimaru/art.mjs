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
    const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
    rect(0,0,510,94,'#19191a');g.fillStyle='#fff8e6';drawMark(x=>x<124,16,11,71,71);
    text('KYOTO ONIMARU',296,64,43,'Arial,sans-serif',true);
    rect(0,99,510,75,'#ded9c9');g.fillStyle='#4d514c';drawMark(()=>true,156,103,198,66);
    for(let j=0;j<9;j++){
      const x=22+j*57;g.strokeStyle='#96958c';g.lineWidth=2.3;
      for(const sign of [-1,1]){g.beginPath();for(let i=0;i<=54;i++){
        const t=i/54*2.1*Math.PI,r=14*(1-i/58);const px=x+sign*(10+Math.cos(t)*r),py=222+Math.sin(t)*r;
        g[i?'lineTo':'moveTo'](px,py)}g.stroke()}}
    rect(0,253,352,124,'#373639');
    for(let j=0;j<100;j++){g.beginPath();let x=random()*352,y=255+random()*118;g.moveTo(x,y);
      for(let i=0;i<6;i++){x+=random()*12;y+=(random()-.55)*9;g.lineTo(x,Math.min(375,Math.max(254,y)))}g.strokeStyle=j%4?'#424145':'#89837c';g.lineWidth=j%4?.5:1;g.stroke()}
    rect(360,253,242,124,'#d4ac72');
    for(let i=0;i<210;i++)rect(360+random()*206,255+random()*119,5+random()*34,random()*1.4,'#bb945f');
    rect(0,387,159,119,'#252e26');rect(168,387,153,119,'#f3eddd');rect(330,387,152,119,'#c89043');
    for(let i=0;i<950;i++){
      rect(random()*156,389+random()*113,random()*4+.4,1.3,i%2?'#384039':'#29302b');
      const x=170+random()*147,y=389+random()*112;g.beginPath();g.ellipse(x,y,3,1.5,random()*2,0,Math.PI*2);g.fillStyle=i%2?'#fff9ec':'#ded8c8';g.fill();
      rect(332+random()*146,389+random()*112,2.2,2,i%3?'#f6c56c':'#985026')}
    rect(525,0,231,125,'#fcf7e5');g.fillStyle='#302c27';drawMark(()=>true,542,14,194,69);
    text('KYOTO ONIMARU',641,105,16,'Arial',true);
    return canvas.toDataURL('image/png').split(',')[1];
  },rings);await writeFile(process.argv[2],Buffer.from(encoded,'base64'));
}finally{await browser.close();}
