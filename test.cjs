const assert=require('node:assert/strict');const {Game,config}=require('./dist/engine.js');const {play}=require('./simulate.cjs');const fs=require('node:fs');
let wins=0,toolWins=0,cascades=0,games=0;const byLevel=[],shapes=new Set,signatures=new Set;
for(let l=1;l<=100;l++){
 const c=config(l);shapes.add(c.shape);assert.equal(c.size,c.cols*c.rows);assert([7,9].includes(c.rows));assert(c.food<c.colors);assert(c.moves>=18&&c.moves<=64);assert(c.mask.filter(Boolean).length>=39);
 signatures.add(JSON.stringify([c.layout,c.ice,c.boxes,c.jelly,c.target,c.scoreTarget,c.food,c.colors]));
 for(let i=0;i<c.size;i++){assert(c.ice[i]>=0&&c.boxes[i]>=0&&c.jelly[i]>=0);if(!c.mask[i])assert.equal(c.ice[i]+c.boxes[i]+c.jelly[i],0);if(c.boxes[i])assert.equal(c.ice[i]+c.jelly[i],0);}
 let w=0,t=0;for(let s=0;s<12;s++){
  const seed=923983+l*1703+s*3167;
  const a=play(l,seed,c.moves,true,false),b=play(l,seed,c.moves,true,true);games+=2;cascades+=a.cascades+b.cascades;w+=+a.won;t+=+b.won;
 }
 assert(w>0,'No unassisted validation wins on level '+l);assert(t>=6,'Low validation wins with free tools on level '+l+': '+t+'/12');wins+=w;toolWins+=t;byLevel.push({level:l,moves:c.moves,unassisted:w,withFreeTools:t,gamesPerPolicy:12});
 if(l%10===0)console.log('Verified '+l+'/100');
}
assert.equal(shapes.size,18);assert.equal(signatures.size,100);
const summary={levels:100,shapes:18,simulatedGames:games,cascades,unassistedWins:wins,withFreeToolWins:toolWins,gamesPerPolicy:1200,method:'Goal-aware greedy simulation with seeded randomness; not a human win-rate estimate',byLevel};fs.writeFileSync('validation-report.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,byLevel:undefined}));
