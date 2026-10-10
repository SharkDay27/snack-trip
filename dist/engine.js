(function(root){
const N=7, names=['草莓','布丁','花椰菜','葡萄','糖果','甜甜圈'];
function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}}
function config(l){let shape=l<5?0:(l-5)%8;let mask=Array.from({length:49},(_,i)=>{let r=i/7|0,c=i%7;return shape===0?true:shape===1?!( (r===0||r===6)&&(c<2||c>4)):shape===2?!(r<2&&(c<2||c>4)):shape===3?!(r===3&&c===3):shape===4?!( (r<2||r>4)&&(c===0||c===6)):shape===5?!(r===0&&(c===0||c===3||c===6)):shape===6?!(c===3&&(r===0||r===6)):!(r===6&&(c<2||c>4));});let ice=Array(49).fill(0),boxes=Array(49).fill(0),jelly=Array(49).fill(0);
// Each chapter introduces a mechanic, then combines it with earlier mechanics.
let cells=mask.map((v,i)=>v?i:-1).filter(i=>i>=0);
let pattern=(l-1)%5;
const rank=i=>{let r=i/7|0,c=i%7;return pattern===0?Math.abs(r-3)+Math.abs(c-3):pattern===1?Math.abs(c-3)*3+r/10:pattern===2?6-r+Math.abs(c-3)/10:pattern===3?Math.min(r,c,6-r,6-c)*3+(i%2):Math.abs(r-c)+r/10;};
cells.sort((a,b)=>rank(a)-rank(b)||a-b);
if(l>=6)cells.slice(0,Math.min(14,3+Math.floor((l-6)/8))).forEach((i,k)=>ice[i]=l>=46&&k%3===0?2:1);
// Spaced crates avoid complete walls and keep openings for matches.
let crateCells=cells.filter(i=>i%7>0&&i%7<6&&(i/7|0)>0&&(i/7|0)<6&&(i%7)%2===1&&(i/7|0)%2===1);
if(l>=16)crateCells.slice(0,Math.min(7,2+Math.floor((l-16)/14))).forEach((i,k)=>{boxes[i]=l>=61&&k%2===0?2:1;ice[i]=0;});
let jellyCells=[...cells].reverse().filter(i=>!boxes[i]);
if(l>=31)jellyCells.slice(0,Math.min(12,3+Math.floor((l-31)/8))).forEach(i=>jelly[i]=l>=81?2:1);
// Final chapters also layer ice above jelly; only one layer is removed per match.
if(l>=76)cells.filter(i=>ice[i]&&!boxes[i]).slice(0,3).forEach(i=>jelly[i]=1);
let mode=l<6?'order':['order','clear','score','mixed','clear'][(l-6)%5];
return {l,mask,ice,boxes,jelly,mode,colors:l<6?5:6,moves:l<6?24:34+Math.floor(l/20)*3+(l%10===0?3:0),target:mode==='order'||mode==='mixed'?(l<6?12+l*2:16+Math.floor(l/12)):0,scoreTarget:mode==='score'?4200+Math.floor(l/10)*300:mode==='mixed'?2400+Math.floor(l/10)*150:0,food:(l-1)%6};}

class Game{
constructor(l,seed=Date.now()){this.cfg=config(l);this.rand=rng(seed);this.b=Array(49).fill(-1);this.ice=[...this.cfg.ice];this.boxes=[...this.cfg.boxes];this.jelly=[...this.cfg.jelly];this.moves=this.cfg.moves;this.score=0;this.got=0;this.fillClean();}
active(i){return i>=0&&i<49&&this.cfg.mask[i]&&!this.boxes[i];}
fillClean(){for(let i=0;i<49;i++)if(this.active(i)){let allowed=Array.from({length:this.cfg.colors},(_,v)=>v).filter(v=>!(i%7>1&&this.b[i-1]===v&&this.b[i-2]===v)&&!(i>=14&&this.b[i-7]===v&&this.b[i-14]===v));this.b[i]=allowed[this.rand()*allowed.length|0];}if(!this.legal().length)this.shuffle();}
match(){let s=new Set;for(let i=0;i<49;i++){if(!this.active(i)||this.b[i]<0)continue;for(let d of [1,7]){if(d===1&&i%7>4||d===7&&i>34)continue;let a=[i,i+d,i+2*d];if(a.every(j=>this.active(j)&&this.b[j]===this.b[i]))a.forEach(j=>s.add(j));}}return [...s];}
adj(a,b){return Math.abs(a-b)===7||(Math.abs(a-b)===1&&(a/7|0)===(b/7|0));}
swap(a,b){[this.b[a],this.b[b]]=[this.b[b],this.b[a]];}
legal(){let out=[];for(let a=0;a<49;a++)for(let b of [a+1,a+7])if(this.active(a)&&this.active(b)&&this.adj(a,b)){this.swap(a,b);let m=this.match();this.swap(a,b);if(m.length)out.push([a,b]);}return out;}
shuffle(){for(let k=0;k<300;k++){for(let i=0;i<49;i++)if(this.active(i))this.b[i]=this.rand()*this.cfg.colors|0;if(!this.match().length&&this.legal().length)return;}throw Error('Unable to shuffle');}
clear(ids){let hit=new Set(ids),near=new Set;for(let i of hit){if(this.boxes[i]){this.boxes[i]--;continue;}if(!this.active(i)||this.b[i]<0)continue;if(this.b[i]===this.cfg.food)this.got++;this.score+=60;if(this.ice[i])this.ice[i]--;else if(this.jelly[i])this.jelly[i]--;this.b[i]=-1;for(let j of [i-7,i+7,i-1,i+1])if(this.adj(i,j)&&j>=0&&j<49)near.add(j);}for(let i of near)if(this.boxes[i]&&!hit.has(i))this.boxes[i]--;}
fall(){for(let c=0;c<7;c++){let segment=[];const flush=()=>{let values=segment.map(i=>this.b[i]).filter(v=>v>=0);for(let k=segment.length-1;k>=0;k--)this.b[segment[k]]=values.length?values.pop():this.rand()*this.cfg.colors|0;segment=[];};for(let r=0;r<7;r++){let i=r*7+c;if(this.active(i))segment.push(i);else flush();}flush();}}
won(){return this.got>=this.cfg.target&&this.score>=this.cfg.scoreTarget&&!this.ice.some(Boolean)&&!this.boxes.some(Boolean)&&!this.jelly.some(Boolean);}
}root.Snack={Game,config,names};if(typeof module!=='undefined')module.exports=root.Snack;
})(typeof window==='undefined'?globalThis:window);
