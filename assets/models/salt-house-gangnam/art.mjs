// Original food illustrations and scanned-material interpretations for the Gangnam counter.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  const output=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=768;c.height=768;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,768,768);
    let seed=514234;function r(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
    function line(x,y,x2,y2,color,w=1){g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();}
    function ellipse(x,y,rx,ry,color,a=0){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,a,0,Math.PI*2);g.fill();}
    function label(str,x,y,h,color,font='Arial, sans-serif',bold=true){
      g.fillStyle=color;g.font=(bold?'bold ':'')+h+'px '+font;g.textAlign='center';g.fillText(str,x,y);
    }
    function shape(pts,color){g.fillStyle=color;g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](...p));g.closePath();g.fill();}
    function sandwich(x,y,scale,kind){
      g.save();g.translate(x,y);g.scale(scale,scale);
      function half(dx,dy,sl,rot){
        g.save();g.translate(dx,dy);g.rotate(rot);g.scale(sl,sl);
        const rye=kind===6,focaccia=kind===4||kind===5;
        ellipse(0,12,47,6,'#c5baab');
        shape([[-45,6],[-31,2],[30,-2],[43,0],[42,8],[27,13],[-34,16],[-45,12]],rye?'#906345':'#b7814e');
        shape([[-45,5],[-27,1],[32,-2],[42,-1],[40,5],[25,9],[-33,12],[-45,9]],rye?'#bb9677':'#f3d9a4');
        for(let layer=0;layer<3;layer++){
          const yy=4-layer*3;
          g.beginPath();g.moveTo(-43,yy);for(let i=0;i<=24;i++){
            const xx=-42+i*3.5;g.lineTo(xx,yy-xx*.065-2*Math.sin(i*.9+layer)-2.1*r());}
          for(let i=24;i>=0;i--){const xx=-42+i*3.5;g.lineTo(xx,yy+3.6-xx*.065+2*Math.sin(i*1.5+layer));}
          g.closePath();g.fillStyle=(rye?['#9c6656','#bc806b','#a5695c']:['#c48c78','#e5b7a3','#d09a87'])[layer];g.fill();
        }
        if(kind===3||kind===5)for(let i=0;i<14;i++)ellipse(-38+r()*74,-5+r()*3,1.5+r()*4,1.3+r()*1.8,i%2?'#587445':'#889846',r());
        if(kind===3)for(let i=0;i<7;i++)ellipse(-35+r()*74,-4+r()*3,2+r()*3,1.3,'#a14835',.1);
        if(kind===1||kind===2||kind===4)shape([[-36,-5],[-2,-8],[29,-8],[36,-7],[26,-3],[-11,-1]],kind===2?'#ecd291':'#f5dea8');
        const top=focaccia?[[-43,-5],[-42,-15],[-33,-21],[30,-25],[43,-19],[43,-10],[32,-5],[-31,0]]:
          [[-45,-5],[-43,-11],[-31,-18],[22,-23],[40,-21],[44,-15],[42,-10],[30,-6],[-32,0]];
        shape(top,rye?'#8c6447':'#bf8951');
        shape([[-40,-8],[-31,-17],[20,-22],[38,-19],[39,-16],[25,-12],[-26,-6]],rye?'#ad8058':'#e0b078');
        for(let i=0;i<68;i++)ellipse(-33+r()*67,-17+r()*7, .25+r()*1.45,.3+r()*.65,i%3?(rye?'#8b654b':'#b98b5b'):'#e8c892',.1);
        for(let i=0;i<3;i++)line(-24+i*20,-12-i*.9,-15+i*20,-17-i*.8,'#efcf97',focaccia?1.1:1.9);
        g.restore();
      }
      half(-12,-8,.77,-.16);half(6,8,1.0,.045);
      g.restore();
    }
    const names=[['JAMBON BEURRE','잠봉 뵈르'],['JAMBON FROMAGE','잠봉 프로마쥬'],['JAMBON SUN-DRIED TOMATO','잠봉 선드라이드 토마토'],['MORTI','모르티'],['FIRENZE','피렌체'],['REUBEN','루벤']];
    for(let i=0;i<6;i++){
      const x=(i%3)*152,y=Math.floor(i/3)*108;
      g.fillStyle='#f6f2e8';g.fillRect(x,y,149,104);g.strokeStyle='#c7baa5';g.lineWidth=1.0;g.strokeRect(x+3,y+3,143,98);
      label(names[i][0],x+74,y+18,i===2?8:10,'#342e27','Georgia,serif');
      sandwich(x+76,y+62,1.18,i+1);label(names[i][1],x+74,y+95,8,'#494035','Apple SD Gothic Neo, sans-serif');
    }
    // Cream-and-pink butcher paper as seen on the finished sandwich and on the ready-wrapped counter.
    g.save();g.beginPath();g.rect(457,0,149,214);g.clip();
    g.fillStyle='#f3e7df';g.fillRect(457,0,149,214);
    for(let j=-1;j<10;j++)for(let i=-1;i<4;i++){
      g.save();g.translate(459+i*73+(j%2)*25,14+j*28);g.rotate(-.27);
      label('SALT HOUSE',25,0,7,'#c88e8f','Arial',true);line(0,3,50,3,'#d2a6a1',.6);g.restore();
    }
    g.restore();
    // The branch's bright white-letter name sits inside a thin brass outline.
    g.fillStyle='#332c2a';g.fillRect(0,223,607,81);
    g.strokeStyle='#b9a07a';g.lineWidth=1.55;g.strokeRect(5,228,595,71);
    label('SALT HOUSE SANDWICH',301,277,36,'#fff0bb','Arial, sans-serif',true);
    // Standing sandwich sign, identified as Jambon Fromage in the branch entrance photograph.
    g.fillStyle='#bad4d8';g.fillRect(612,0,154,213);
    label('CITY FRIENDLY',689,20,9,'#313f4c');label('SALT HOUSE SANDWICH',689,34,9,'#313f4c');
    label('JAMBON FROMAGE',689,54,12,'#33404a','Georgia,serif');
    sandwich(689,112,1.39,1);sandwich(683,160,1.06,1);
    // Mahogany stile and panel grain, glass-case backing, wrapping and cured meats.
    function noiseTile(x,y,w,h,base,count){
      g.fillStyle=base;g.fillRect(x,y,w,h);
      for(let i=0;i<count;i++){const a=.04+r()*.15;
        g.fillStyle=i%3?'rgba(59,44,35,'+a+')':'rgba(255,247,222,'+a+')';
        g.fillRect(x+r()*w,y+r()*h,.5+r()*2,.5+r()*1.2);}
    }
    noiseTile(0,313,283,144,'#55453c',5000);
    g.save();g.beginPath();g.rect(0,313,283,144);g.clip();
    for(let i=0;i<270;i++){const y=313+r()*144;g.strokeStyle=i%3?'rgba(37,31,30,.23)':'rgba(196,164,126,.16)';g.lineWidth=.28+r()*.9;
      g.beginPath();for(let j=0;j<=288;j+=4)g[j?'lineTo':'moveTo'](j,y+1.6*Math.sin(j/27+i*.08)+1.2*Math.cos(j/46+i*.7));g.stroke();}
    g.restore();
    const mirrored=g.createLinearGradient(290,0,504,0);
    for(const [x,c]of[[0,'#84796a'],[.09,'#c2b9a1'],[.28,'#a49d8c'],[.45,'#ded8bd'],[.51,'#9c9e91'],[.75,'#d3c9aa'],[1,'#918f80']])mirrored.addColorStop(x,c);
    g.fillStyle=mirrored;g.fillRect(290,313,216,144);
    noiseTile(515,313,247,144,'#e7e2d3',5000);
    // Aged casings: pale bloom, mottled salami and the fat-to-lean stripes of a cured belly.
    noiseTile(0,466,185,139,'#c8bda7',3000);
    noiseTile(190,466,183,139,'#a07850',3000);
    for(let i=0;i<650;i++){
      const x=r()*173, y=468+r()*130;
      ellipse(x+5,y,1+r()*3,1+r()*5.4,i%4?'rgba(128,115,90,.22)':'rgba(255,248,226,.8)',r());
      ellipse(x+194,y,1+r()*3.5,1+r()*5,i%5?'rgba(95,74,50,.32)':'rgba(232,225,201,.75)',r());}
    g.save();g.beginPath();g.rect(378,466,183,139);g.clip();
    g.fillStyle='#a17554';g.fillRect(378,466,183,139);
    for(let i=-1;i<8;i++){const yy=465+i*26;g.beginPath();g.moveTo(377,yy);
      for(let xx=377;xx<568;xx+=4)g.lineTo(xx,yy+10*Math.sin(xx/29+3*i)+4*Math.cos(xx/11));
      for(let xx=568;xx>376;xx-=4)g.lineTo(xx,yy+10+10*Math.sin(xx/30+3*i)+3*Math.cos(xx/17));
      g.closePath();g.fillStyle=i%3?'#d7bf93':'#ead3ac';g.fill();}
    g.restore();
    noiseTile(567,466,196,139,'#bb7770',1700);
    for(let i=0;i<230;i++)ellipse(570+r()*188,469+r()*131,1+r()*2.9,1+r()*2.0,i%5?'#e5b7a0':'#855d50',r());
    // Baguette crust and porous pale crumb.
    noiseTile(0,613,252,151,'#ce9b62',5200);
    for(let i=0;i<340;i++)ellipse(3+r()*246,615+r()*144,1+r()*2.2,.5+r()*1.8,i%4?'#b58351':'#ead1a0',r());
    noiseTile(258,613,254,151,'#edd6a6',2900);
    for(let i=0;i<310;i++)ellipse(260+r()*246,617+r()*140,1+r()*2,.6+r()*1.6,i%5?'#c6a97f':'#aa8c68',r());
    noiseTile(516,613,245,91,'#a99e91',3600);
    g.save();g.beginPath();g.rect(516,613,245,91);g.clip();
    for(let i=0;i<140;i++){const y=612+r()*92,a=r()*6;
      g.strokeStyle=i%3?'rgba(84,79,73,.13)':'rgba(230,219,200,.17)';g.lineWidth=.4+r()*.9;
      g.beginPath();for(let x=514;x<768;x+=3)g[x===514?'moveTo':'lineTo'](x,y+1.4*Math.sin(x/44+a)+.7*Math.cos(x/11));g.stroke();}
    g.restore();
    // Menu-shaped ceiling lamps and light cabinet edges use a clean field.
    return c.toDataURL('image/png').split(',')[1];
  });
  await writeFile(process.argv[2],Buffer.from(output,'base64'));
}finally{await browser.close();}
