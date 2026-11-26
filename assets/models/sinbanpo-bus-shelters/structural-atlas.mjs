import sharp from 'sharp';
const [surface,header,output]=process.argv.slice(2);
await sharp({create:{width:1536,height:384,channels:3,background:'#343b3d'}})
  .composite([{input:surface,left:0,top:128},{input:header,left:0,top:14}]).png().toFile(output);
