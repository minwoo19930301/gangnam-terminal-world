// Run with node tests/lazy-custom-texture.mjs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createTextures} from '../js/textures.js';

let canvases = 0;
globalThis.__makeCanvas = (width, height) => {
  canvases++;
  return {width, height, getContext: () => ({})};
};
const textures = createTextures(THREE);
let paints = 0;
const draw = () => { paints++; };
const record = textures.custom('floor', 32, 16, draw, [2, 1], {lazy: true, facade: true});
assert.equal(textures.surface('floor'), record);
assert.deepEqual(record.scale, [2, 1]);
assert.equal(record.facade, true);
assert.equal(canvases, 0);
const texture = textures.surface('floor').tex;
assert.equal(texture.image.width, 32);
assert.equal(texture.image.height, 16);
assert.equal(textures.custom('floor', 99, 99, draw).tex, texture);
assert.equal(paints, 1);
assert.equal(canvases, 1);
textures.custom('eager', 16, 16, draw);
assert.equal(paints, 2);
console.log('OK: lazy and eager custom texture registration, direct access and shared cache');
