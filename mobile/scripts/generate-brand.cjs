// Rasterize the code-native mark in assets/brand/icon.svg; no external fonts or images.
const Jimp = require('jimp-compact');
const path = require('node:path');
const size=1024,polygon=[[176,282],[270,282],[407,638],[544,282],[638,282],[448,742],[366,742]];
function inside(x,y){let value=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])value=!value;}return value;}
function line(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const t=((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy);if(t<0||t>1)return false;return Math.hypot(x-ax-t*dx,y-ay-t*dy)<=38;}
async function main(){const image=new Jimp(size,size,0xf7f8f4ff);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const rgb=[0,0,0];for(const ox of [.125,.375,.625,.875])for(const oy of [.125,.375,.625,.875]){const red=line(x+ox,y+oy,652,345,824,679)||line(x+ox,y+oy,824,345,652,679);const color=red?[174,68,56]:inside(x+ox,y+oy)?[32,37,32]:[247,248,244];for(let c=0;c<3;c++)rgb[c]+=color[c];}image.setPixelColor(Jimp.rgbaToInt(...rgb.map(v=>Math.round(v/16)),255),x,y);}await image.writeAsync(path.join(__dirname,'../assets/brand/icon.png'));}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
