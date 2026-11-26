import sharp from 'sharp';
const [left,right,output]=process.argv.slice(2);
await sharp({create:{width:1280,height:960,channels:3,background:'#fff'}})
  .composite([{input:left,left:0,top:0},{input:right,left:640,top:0}])
  .webp({quality:91,effort:5}).toFile(output);

await sharp(output).resize(160,120).webp({quality:76}).toFile(new URL('./posters-small.webp',import.meta.url).pathname);
