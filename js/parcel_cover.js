// Complete cover for outdoor gameplay, native exports and synchronous map audits.
import { parcelCover as terminal } from './parcel-cover-terminal.js';
import { parcelCover as outer } from './parcel-cover-outer.js';

export const parcelCover = {...terminal, ...outer};
