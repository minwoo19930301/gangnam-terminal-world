import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();const png=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=768;c.height=512;const g=c.getContext('2d');
    let seed=20250415;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
    const oval=(x,y,w,h,a,color)=>{g.beginPath();g.ellipse(x,y,w,h,a,0,2*Math.PI);g.fillStyle=color;g.fill()};
    rect(0,0,768,512,'white');
    for(let i=0;i<3;i++){
      const x=i*256,w=251,h=208;g.save();g.beginPath();g.rect(x,0,w,h);g.clip();g.translate(x,0);
      const grad=g.createLinearGradient(0,0,w,h);grad.addColorStop(0,['#9f343d','#bd4043','#a74747'][i]);grad.addColorStop(.55,['#c15552','#d65f59','#be625b'][i]);grad.addColorStop(1,['#8c303b','#a33d42','#9d4549'][i]);g.fillStyle=grad;g.fillRect(0,0,w,h);
      for(let j=0;j<5500;j++){const xx=random()*w,yy=random()*h;oval(xx,yy,.6+random()*2,.3+random(),-.6+random()*.8,
          j%3?'rgba(225,146,130,.11)':'rgba(91,35,42,.13)')}
      // Primary fat seams bend between muscle groups; short branching veins and
      // flecks change direction on their two sides, like the cuts in the case.
      function vein(xx,yy,length,dy,width,color,branches){
        let dx=length/11;g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(xx,yy);
        const pts=[[xx,yy]];for(let k=0;k<11;k++){xx+=dx*(.7+random()*.6);yy+=dy/11+(random()-.5)*4;pts.push([xx,yy]);g.lineTo(xx,yy)}g.stroke();
        if(branches&&width>.8){for(let k=2;k<10;k+=2){if(random()>.76)continue;const p=pts[k];vein(p[0],p[1],length*(.14+random()*.15),-dy*.14-3-random()*5,width*.41,color,false)}}
      }
      // Broad fat channels distinguish the three large cross sections at standing distance.
      for(let k=0;k<5;k++){
        const sx=-18+k*48+(i*13)%23,sy=50+k*19;
        vein(sx,sy,70-k*2,20*Math.sin(k+1.6*i)+24,2.3+((k+i)%3)*.65,'rgba(244,208,187,.89)',true)}
      const fat=i===2?'rgba(240,209,185,.88)':'rgba(248,218,190,.86)';
      for(let j=0;j<(i===1?180:235);j++){let xx=random()*w-8,yy=random()*h;
        const l=4+random()**2*28;vein(xx,yy,l,yy<100?-l*.45:l*.53,.55+random()**1.7*2.1,'rgba(255,219,199,.81)',true)}
      // A broad meandering muscle boundary and creamy fat cap are visible at the cut face.
      g.beginPath();g.moveTo(-5,26);g.bezierCurveTo(50,13+15*i,83,51,129,36);g.bezierCurveTo(177,13,213,27,257,14);
      g.lineWidth=6+i;g.strokeStyle='#e8c8af';g.stroke();
      g.beginPath();g.moveTo(-3,0);g.lineTo(257,0);g.lineTo(257,10);g.bezierCurveTo(208,21,169,8,127,19);g.bezierCurveTo(92,28,56,8,0,24);g.closePath();g.fillStyle='#ecceb4';g.fill();
      for(let j=0;j<14;j++){const xx=random()*225,yy=8+random()*27;vein(xx,yy,9+random()*11,-7,.9,fat,false)}
      if(i===2){oval(214,92,20,14,-.7,'#cfb293');oval(213,91,14,9,-.7,'#ebd3ae');oval(212,91,6.5,4,-.7,'#d4bd9e')}
      g.restore();
    }
    // Exterior bark and a second side cut with collagen bands on the hanging ribs.
    rect(0,219,348,166,'#894749');for(let j=0;j<5800;j++){const x=random()*346,y=222+random()*159;oval(x,y,.5+random()*3,.3+random()*2,random()*3,['#a76256','#743d42','#a87769','#aa615a'][j%4])}
    rect(354,219,411,166,'#9f5e59');
    for(let j=0;j<3500;j++)oval(355+random()*405,221+random()*159,1+random()*4,.6+random()*2,random()*2,j%3?'#aa6960':'#864646');
    for(let j=0;j<10;j++){const yy=223+j*16;g.beginPath();g.moveTo(355,yy+19);g.bezierCurveTo(466,yy+15,544,yy+3,763,yy-4);
      g.strokeStyle=j%3?'#d6b5a0':'#e6c7ac';g.lineWidth=j%3?1.5:3.4;g.stroke()}
    rect(0,394,366,109,'#262724');
    for(const [i,word] of ['WET-AGED','DRY-AGED'].entries()){
      g.fillStyle='#d1c4a3';g.font='bold 25px Georgia,serif';g.textAlign='center';g.fillText(word,91+i*183,459,160)}
    rect(379,394,256,109,'#6d624c');for(let j=0;j<580;j++)rect(381+random()*237,396+random()*102,3+random()*15,.6,j%2?'#9f8d6a':'#857353');
    return c.toDataURL().split(',')[1];});await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close()}
