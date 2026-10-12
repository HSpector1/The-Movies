import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('..',import.meta.url)),assets=join(root,'public/assets'),p=JSON.parse(readFileSync(join(root,'PROVENANCE.json')));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[relative(assets,join(dir,e.name))]);
assert.deepEqual(walk(assets).sort(),p.assets.map(a=>a.path).sort());assert.equal(p.assets.length,13);
let maps=0;
function jpegSize(b){assert.equal(b.readUInt16BE(0),0xffd8);let i=2;while(i<b.length){assert.equal(b[i++],255);let marker=b[i++];while(marker===255)marker=b[i++];const n=b.readUInt16BE(i);if([0xc0,0xc1,0xc2].includes(marker))return[b.readUInt16BE(i+5),b.readUInt16BE(i+3)];i+=n;}throw new Error('JPEG dimensions absent');}
for(const a of p.assets){const b=readFileSync(join(assets,a.path));assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256,a.path);assert.equal(b.length,a.byteSize);assert.equal(a.shippingLicensePermitted,true);if(a.path.endsWith('.jpg')){const dims=jpegSize(b);assert.deepEqual(dims,a.resolution);assert.ok(Math.max(...dims)<=1024);assert.equal(a.license,'CC0 1.0');assert.equal(new URL(a.downloadUrl).hostname,'dl.polyhaven.org');assert.ok(a.authors&&a.downloadDate&&a.licenseReference);maps+=b.length;}else{assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.equal(gltf.animations?.length||0,0);for(const buf of gltf.buffers||[])assert.ok(!buf.uri);for(const image of gltf.images||[])assert.ok(image.bufferView!==undefined);}}
assert.equal(maps,p.acquisition.assetBytes);assert.equal(maps+p.acquisition.metadataBytes,p.acquisition.totalNewDownloadedBytes);assert.ok(p.acquisition.totalNewDownloadedBytes<=25*1024*1024);
console.log(`Verified exact13 asset files, SHA256/licence fields/embedded GLB dependencies/zero clips/1K map dimensions; ${p.acquisition.totalNewDownloadedBytes} total downloaded bytes including metadata.`);
