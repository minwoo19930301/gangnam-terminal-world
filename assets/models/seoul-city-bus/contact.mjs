import sharp from 'sharp';
const [src,out]=process.argv.slice(2);
await sharp(src).blur(.55).webp({quality:93,effort:6}).toFile(out);
