const fs=require('node:fs'),levels=require('./dist/levels.js'),{play}=require('./simulate.cjs');
const report=[];let games=0;
for(let l=1;l<=100;l++){
 const d=levels[l-1],rate=l<=10?.95:l<=40?.9:l<=70?.85:.8;let turns=[],adjustments=0;
 const measure=()=>{turns=[];for(let s=1;s<=16;s++){turns.push(play(l,140039+s*2371+l*79,80).turns);games++;}turns.sort((a,b)=>a-b);};measure();
 while(turns[Math.ceil(rate*turns.length)-1]>56&&adjustments<5){
  // Reduce remote clutter, preserve all introduced mechanics and layered combinations.
  for(const k of ['ice','jelly'])if(d[k].length>4)d[k].splice(Math.floor(d[k].length*.82));
  if(d.boxes.length>2)d.boxes.splice(d.boxes.length-1);
  d.target=Math.ceil(d.target*.9);d.scoreTarget=Math.round(d.scoreTarget*.9/60)*60;
  adjustments++;measure();
 }
 const q=turns[Math.ceil(rate*turns.length)-1];
 d.moves=Math.min(64,Math.max(l<=10?18:24,q+(l<=10?5:l<=40?4:l<=70?3:2)));
 if(l%10===0&&l>10)d.moves=Math.max(24,d.moves-2);
 report.push({level:l,shape:d.name,moves:d.moves,medianTurns:turns[7],calibrationWins:turns.filter(t=>t<=d.moves).length,calibrationGames:16,adjustments,obstacleLayers:[...d.ice,...d.boxes,...d.jelly].reduce((n,p)=>n+p[1],0)});
 if(l%10===0)console.log('Calibrated '+l+'/100; chapter move range '+Math.min(...report.slice(-10).map(r=>r.moves))+'–'+Math.max(...report.slice(-10).map(r=>r.moves)));
}
fs.writeFileSync('dist/levels.js','(function(root){const levels='+JSON.stringify(levels)+';root.SnackLevels=levels;if(typeof module!=="undefined")module.exports=levels;})(typeof window==="undefined"?globalThis:window);\n');
fs.writeFileSync('balance-report.json',JSON.stringify({method:'Seeded goal-aware greedy policy; 12% second-best moves, no boosters. Calibration seeds are separate from validation. These results are not human win-rate estimates.',games,levels:report},null,2));
console.log('Completed '+games+' calibration games.');
