import { bounds } from './parcel-cover-bounds.js';

async function loadPacket(name) {
  const path = './parcel-cover-' + name + '.js';
  try { return (await import(path)).parcelCover; }
  catch { return (await import(path + '?retry')).parcelCover; }
}

// Every OSM parcel touching this rectangle is in the terminal packet.
export async function loadParcelCover(streetBounds) {
  const terminal = loadPacket('terminal');
  if (streetBounds && streetBounds[0] >= bounds[0] && streetBounds[1] >= bounds[1]
      && streetBounds[2] <= bounds[2] && streetBounds[3] <= bounds[3]) return terminal;
  const [near, outer] = await Promise.all([terminal, loadPacket('outer')]);
  return {...near, ...outer};
}
