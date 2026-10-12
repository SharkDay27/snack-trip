// Reproducible shapes and obstacle patterns; run before calibrate-levels.cjs.
const fs=require('node:fs');
const templates=[
 ['方形野餐',['#######','#######','#######','#######','#######','#######','#######']],
 ['沙漏點心',['#######','#######','.#####.','..###..','..###..','..###..','.#####.','#######','#######']],
 ['十字野餐',['..###..','..###..','..###..','#######','#######','#######','..###..','..###..','..###..']],
 ['甜甜圈庭院',['#######','#######','###.###','###.###','###.###','###.###','###.###','#######','#######']],
 ['雙盤下午茶',['###.###','###.###','###.###','###.###','###.###','###.###','###.###','###.###','###.###']],
 ['窄橋便當',['#######','#######','#######','..###..','..###..','..###..','#######','#######','#######']],
 ['階梯派對',['#####..','#####..','#####..','.#####.','.#####.','.#####.','..#####','..#####','..#####']],
 ['心形莓園',['.##.##.','#######','#######','#######','#######','.#####.','.#####.','..###..','..###..']],
 ['菱形餐桌',['..###..','.#####.','#######','#######','#######','#######','#######','.#####.','..###..']],
 ['杯形午茶',['###.###','###.###','###.###','###.###','###.###','###.###','#######','#######','#######']],
 ['雙翼廚房',['###.###','###.###','###.###','#######','#######','#######','###.###','###.###','###.###']],
 ['蘑菇小屋',['#######','#######','#######','..###..','..###..','..###..','..###..','..###..','..###..']],
 ['高腳甜品',['..###..','..###..','..###..','..###..','..###..','..###..','#######','#######','#######']],
 ['層層蛋糕',['..###..','..###..','..###..','.#####.','.#####.','.#####.','#######','#######','#######']],
 ['錯層餐盤',['#####..','#####..','#####..','#######','#######','#######','..#####','..#####','..#####']],
 ['蝴蝶花園',['###.###','###.###','#######','.#####.','..###..','.#####.','#######','###.###','###.###']],
 ['甜品拱門',['#######','#######','#######','###.###','###.###','###.###','###.###','###.###','###.###']],
 ['四葉點心',['.#####.','#######','#######','###.###','###.###','###.###','#######','#######','.#####.']]
];
function lanes(layout,blocked=new Set){let m=layout.join('').split('').map((s,i)=>s==='#'&&!blocked.has(i));return m.map((v,i)=>!v||[1,7].some(d=>[-2,-1,0].some(start=>{let ids=[i+start*d,i+(start+1)*d,i+(start+2)*d];return ids.every(j=>j>=0&&j<m.length&&m[j]&&(d===7||Math.floor(j/7)===Math.floor(i/7)));}))).every(Boolean);}
let levels=[];
for(let l=1;l<=100;l++){
 const chapter=Math.floor((l-1)/10),shape=({8:1,22:2,38:3,56:4,74:5,96:6})[l]??(l<=3?0:l<=10?[0,8,7,1,2,1,13][l-4]:(l*7+chapter*3)%templates.length);
 const [name,layout]=templates[shape];let cells=layout.join('').split('').flatMap((s,i)=>s==='#'?[i]:[]),height=layout.length;
 const pattern=(l+chapter)%6,center=(height-1)/2;
 function rank(i){const r=Math.floor(i/7),c=i%7;return pattern===0?Math.abs(r-center)+Math.abs(c-3)*1.3:pattern===1?Math.abs(c-3)*2+r/20:pattern===2?height-1-r+Math.abs(c-3)/10:pattern===3?Math.min(r,c,height-1-r,6-c)*2+(i%2)/3:pattern===4?Math.abs(r-c)+r/20:Math.abs(r-center)*2+c/10;}
 cells.sort((a,b)=>rank(a)-rank(b)||a-b);
 let boxes=[],blocked=new Set;
 let crateCandidates=cells.filter(i=>{let r=Math.floor(i/7),c=i%7;return r>0&&r<height-1&&(r+c+l)%3===0;});
 const desired=l<16?0:Math.min(6,2+Math.floor((l-16)/16));
 for(const i of crateCandidates){if(boxes.length===desired)break;blocked.add(i);if(lanes(layout,blocked))boxes.push([i,l>=65&&boxes.length%3===0?2:1]);else blocked.delete(i);}
 const available=cells.filter(i=>!blocked.has(i));
 const safe=available.filter(i=>{let r=Math.floor(i/7),c=i%7;return r>0&&r<height-1&&c>0&&c<6&&[1,7].every(delta=>[-2,-1,0].some(start=>[i+start*delta,i+(start+1)*delta,i+(start+2)*delta].every(j=>available.includes(j)&&(delta===7||Math.floor(j/7)===r))));});
 const free=safe.length>=6?safe:available,ice=[],jelly=[];
 let iceN=l<6?0:Math.min(free.length,16,3+Math.floor(l/8)),jellyN=l<31?0:Math.min(free.length,13,3+Math.floor((l-31)/7));
 for(let k=0;k<iceN;k++)ice.push([free[k],l>=55&&k%5===0?2:1]);
 for(let k=0;k<jellyN;k++){const i=l>=76&&k<3?free[k]:free[free.length-1-k];jelly.push([i,l>=91&&k%5===0?2:1]);}
 const mode=l<6?'order':['order','clear','score','mixed','clear'][(l-6)%5],colors=l<11?4:l<=60?5:(l%3===0?6:5);
 levels.push({l,name,shape,pattern,layout,ice,boxes,jelly,mode,colors,moves:60,target:['order','mixed'].includes(mode)?l<6?9+l*2:14+chapter:0,scoreTarget:mode==='score'?2400+chapter*180:mode==='mixed'?1500+chapter*120:0,food:(l-1)%colors,difficulty:l<=10?'入門':l%10===0?'挑戰':l<=40?'輕鬆':l<=70?'進階':'高手'});
 if(!lanes(layout,blocked))throw Error('Unmatchable cell in level '+l);
}
fs.writeFileSync('dist/levels.js','(function(root){const levels='+JSON.stringify(levels)+';root.SnackLevels=levels;if(typeof module!=="undefined")module.exports=levels;})(typeof window==="undefined"?globalThis:window);\n');
console.log('Designed',levels.length,'levels across',new Set(levels.map(l=>l.shape)).size,'shapes');
