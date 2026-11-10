// Hulpjes voor het realistische prototype: vaste willekeur, kleuren, samenvoegen van geometrie.
import * as THREE from 'three';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';

export function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
export const hash2=(x,y,k=0)=>{let h=(x*374761393+y*668265263+k*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
export function shade(h,k){const [r,g,b]=hexRgb(h);const f=v=>clamp(Math.round(v*k),0,255);return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
export function mix(a,b,t){const A=hexRgb(a),B=hexRgb(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('')}
export function jitter(h,r,amt){const [R,G,B]=hexRgb(h);const d=(r()-.5)*2*amt;const f=v=>clamp(Math.round(v+d),0,255);return '#'+[f(R),f(G),f(B)].map(v=>v.toString(16).padStart(2,'0')).join('')}

// geometrie een effen kleur per hoekpunt geven (voor samengevoegde meshes met vertexColors)
export function tint(geo,color,jit,r){const g=geo.index?geo.toNonIndexed():geo;const n=g.attributes.position.count,c=new THREE.Color(color),a=new Float32Array(n*3);
  for(let i=0;i<n;i++){const k=jit&&r?1+(r()-.5)*jit:1;a[i*3]=c.r*k;a[i*3+1]=c.g*k;a[i*3+2]=c.b*k}g.setAttribute('color',new THREE.BufferAttribute(a,3));if(!g.attributes.uv){g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2),2))}return g}
export function place(geo,x,y,z,ry,sx,sy,sz){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry||0,0)),new THREE.Vector3(sx||1,sy||sx||1,sz||sx||1));geo.applyMatrix4(m);return geo}

// verzamelt geometrie per materiaal en maakt er aan het eind één mesh per materiaal van
export class Batch{
  constructor(){this.b={}}
  add(key,geo){if(!geo.attributes.color)tint(geo,'#ffffff');let g=geo.index?geo.toNonIndexed():geo;if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    Object.keys(g.attributes).forEach(k=>{if(!['position','normal','uv','color'].includes(k))g.deleteAttribute(k)});(this.b[key]=this.b[key]||[]).push(g)}
  build(scene,mats,opt){opt=opt||{};const out={};Object.keys(this.b).forEach(k=>{const L=this.b[k];if(!L.length)return;const g=BGU.mergeGeometries(L,false);if(!g){console.log('[real] samenvoegen mislukt: '+k);return}
      const m=new THREE.Mesh(g,mats[k]);const o=(opt.noShadow||[]).includes(k);m.castShadow=!o;m.receiveShadow=true;m.name=k;scene.add(m);out[k]=m});return out}}

// zachte ruis op een canvas (kleur): fijn + grof
export function noiseCanvas(ctx,w,h,fine,coarse,scale,seed,mask){const im=ctx.getImageData(0,0,w,h),d=im.data,r=rng(seed||1);const gw=Math.ceil(w/scale)+2,gh=Math.ceil(h/scale)+2,G=new Float32Array(gw*gh);for(let i=0;i<G.length;i++)G[i]=r()-.5;
  for(let y=0;y<h;y++){const gy=y/scale,y0=gy|0,fy=gy-y0;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(mask&&!mask(d[i],d[i+1],d[i+2]))continue;const gx=x/scale,x0=gx|0,fx=gx-x0;
      const a=G[y0*gw+x0],b=G[y0*gw+x0+1],c=G[(y0+1)*gw+x0],e=G[(y0+1)*gw+x0+1];const n=(a+(b-a)*fx)+((c+(e-c)*fx)-(a+(b-a)*fx))*fy;const v=n*coarse*2+(r()-.5)*fine*2;
      d[i]=clamp(d[i]+v,0,255);d[i+1]=clamp(d[i+1]+v,0,255);d[i+2]=clamp(d[i+2]+v,0,255)}}ctx.putImageData(im,0,0)}

export function canvasTex(cv,srgb,rep){const t=new THREE.CanvasTexture(cv);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
export const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.round(w));c.height=Math.max(2,Math.round(h));return c};
