import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=new URL('../socialF(X)/',import.meta.url);
await mkdir(out,{recursive:true});
const result=await build({entryPoints:['src/App.tsx'],bundle:true,minify:true,format:'esm',target:'es2022',outdir:out.pathname,entryNames:'app',assetNames:'[name]',write:false,legalComments:'none'});
const hashes={};for(const file of result.outputFiles){const ext=file.path.endsWith('.css')?'css':'js';const hash=createHash('sha256').update(file.contents).digest('hex').slice(0,12);hashes[ext]=hash;await writeFile(file.path,file.contents);}
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#354c3d"><title>Social FX | Founding Pilot by Social Effects NJ</title><meta name="description" content="Explore the Social FX founding pilot: a community network and production rehearsal for Filmanthropy by Design."><link rel="canonical" href="https://socialeffectsnj.com/socialF(X)/"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect rx='32' width='64' height='64' fill='%23354c3d'/%3E%3Ctext x='12' y='43' fill='%23f5f2ea' font-size='32' font-family='Georgia'%3Efx%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="/socialF(X)/app.css?v=${hashes.css}"><script type="module" src="/socialF(X)/app.js?v=${hashes.js}"></script></head><body><div id="root"></div><noscript><h1>Social FX Founding Pilot</h1><p>This interactive pilot needs JavaScript. Visit <a href="/">Social Effects NJ</a> to learn about the initiative.</p></noscript></body></html>`;
await writeFile(new URL('index.html',out),html);
console.log('Built /socialF(X)/ with content-versioned JS and CSS.');

const roomOut=new URL('v2/',out);
const workspaceOut=new URL('workspace/',roomOut);
await mkdir(workspaceOut,{recursive:true});
const roomBuild=await build({entryPoints:['src/room/Room.tsx'],bundle:true,minify:true,format:'esm',target:'es2022',outdir:roomOut.pathname,entryNames:'room',write:false,legalComments:'none'});
const roomHashes={};
for(const asset of roomBuild.outputFiles){
  const extension=asset.path.split('.').pop();
  roomHashes[extension]=createHash('sha256').update(asset.contents).digest('hex').slice(0,12);
  await writeFile(asset.path,asset.contents);
}
await writeFile(new URL('index.html',roomOut),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Social FX V2 | The Rehearsal Room</title><link rel="stylesheet" href="./room.css?v=${roomHashes.css}"><script type="module" src="./room.js?v=${roomHashes.js}"></script></head><body><div id="root"></div><noscript>Enable JavaScript to enter the rehearsal room.</noscript></body></html>`);
await writeFile(new URL('index.html',workspaceOut),html.replace('Social FX | Founding Pilot by Social Effects NJ','Social FX V2 | Full workspace').replace('rel="canonical" href="https://socialeffectsnj.com/socialF(X)/"','rel="canonical" href="https://socialeffectsnj.com/socialF(X)/v2/workspace/"'));
