// Normalized offsets in metres from the centre of the corner, shared with the native model.
export const tiles=[];
const tile=(x,d,kind)=>tiles.push({x,d,kind});
for(let i=0;i<9;i++)for(let j=0;j<2;j++)tile(.38+i*.30,.14+j*.30,'dot');
for(let i=0;i<13;i++)tile(1.28,.74+i*.30,'line');
for(let i=0;i<8;i++)for(let j=0;j<2;j++)tile(-.66+j*.30,1.45+i*.30,'dot');
for(let i=0;i<4;i++)tile(-.06+i*.30,2.05,'across');
for(let i=0;i<9;i++)tile(1.58+i*.30,3.14,'across');
for(let j=0;j<2;j++)for(let i=0;i<5;i++)tile(4.1+i*.30,4.8+j*.30,'dot');
export const dotCenters=tiles.filter(t=>t.kind==='dot').flatMap(({x,d})=>[-1.5,-.5,.5,1.5].flatMap(i=>
  [-1.5,-.5,.5,1.5].map(j=>[x-.82+i*.067,.009,d-1.32+j*.067])));

export const guideCenters=tiles.filter(t=>t.kind!=='dot').flatMap(({x,d,kind})=>[-1.5,-.5,.5,1.5].map(u=>{
  const across=kind==='across';return [x-.82+(across?0:u*.067),.009,d-1.32+(across?u*.067:0),across?Math.PI/2:0];
}));
