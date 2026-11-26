import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  const png=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
    const g=canvas.getContext('2d');g.fillStyle='white';g.fillRect(0,0,768,512);
    function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
    function ellipse(x,y,rx,ry,rotation,c){g.beginPath();g.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);g.fillStyle=c;g.fill()}
    let seed=20250829;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    function butterfly(x,y,s,ink){
      g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=ink;
      for(const dir of [-1,1]){g.save();g.scale(dir,1);g.beginPath();g.moveTo(0,1);g.bezierCurveTo(-5,-9,-20,-20,-20,-12);g.bezierCurveTo(-20,-1,-14,4,-9,5);g.bezierCurveTo(-19,4,-13,15,-8,13);g.quadraticCurveTo(-3,10,0,2);g.fill();g.restore()}g.restore();
    }
    rect(0,0,460,100,'#44529a');g.font='italic 51px "Apple Chancery", cursive';g.fillStyle='#fffaf0';g.textAlign='center';
    g.fillText('Blue Butterfly',201,65,328);butterfly(390,53,1.35,'#fff9ed');
    rect(462,0,303,100,'#585ca3');butterfly(615,47,2.4,'#f8f6e9');
    rect(0,111,764,156,'#f9f5e8');g.font='bold 22px Optima, sans-serif';g.textAlign='left';g.fillStyle='#312f34';g.fillText('Spring Roll',17,140);
    butterfly(720,134,.58,'#505e99');
    const colors=['#e78b78','#e5a06b','#a2795a','#e7b28a','#88ae70','#d56e5f','#c1be78','#de876b'];
    for(let i=0;i<8;i++){
      const x=55+i*92;g.save();g.translate(x,200);g.rotate(-.34);
      ellipse(0,0,16,39,0,'#e5e1c9');ellipse(0,-2,13,35,0,colors[i]);
      for(let k=-23;k<26;k+=10){g.fillStyle=k%3?'#eff0c6':'#91ae6c';g.fillRect(-12,k,23,3)}
      g.restore();
    }
    rect(0,281,330,97,'#aa7446');
    for(let i=0;i<280;i++)rect(rand()*310,283+rand()*91,6+rand()*19,.6,'#bd8d5e');
    rect(340,281,424,97,'#523b35');
    for(let i=0;i<330;i++)rect(343+rand()*400,283+rand()*92,6+rand()*16,.5,i%3?'#654a3e':'#775d4c');
    // Separate wrap patterns depict the fillings seen through each rice paper skin.
    for(let i=0;i<4;i++){
      const x=i*165;rect(x,391,157,115,'#ebe7ca');
      for(let k=0;k<140;k++){const u=x+3+rand()*146,v=395+rand()*103;ellipse(u,v,2+rand()*4,1+rand()*2,rand()*3,k%3?'#bfd09a':'#9db27a')}
      for(let k=0;k<3;k++){
        const u=x+33+k*47,v=448+Math.sin(k*2)*8;
        if(i===0){ellipse(u,v,21,28,-.45,'#e99175');ellipse(u+4,v,13,20,-.45,'#f3bea0');g.lineWidth=2;g.strokeStyle='#faf0db';for(let n=-1;n<2;n++){g.beginPath();g.moveTo(u-11,v+n*11);g.quadraticCurveTo(u,v+n*11+7,u+11,v+n*11+3);g.stroke()}}
        if(i===1){ellipse(u,v,21,30,-.2,'#e89577');for(let n=-1;n<2;n++)rect(u-13,v+n*10,28,2,'#f9d7ba')}
        if(i===2){for(let n=0;n<14;n++)ellipse(u+(rand()-.5)*32,v+(rand()-.5)*41,3+rand()*7,3+rand()*4,rand()*2,'#aa8764')}
        if(i===3){ellipse(u,v,20,24,-.35,'#e7c9aa');ellipse(u-5,v,11,21,-.35,'#d77570')}
      }
    }
    return canvas.toDataURL().split(',')[1];
  });await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close()}
