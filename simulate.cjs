const {Game,rng}=require('./dist/engine.js');
function choose(g,policy){let scored=[];const needFood=g.got<g.cfg.target,pending=g.b.flatMap((_,i)=>g.ice[i]||g.jelly[i]||g.boxes[i]?[i]:[]);
 for(const pair of g.legal()){
  g.swap(...pair);const m=g.match(),near=new Set;
  let value=m.length*(g.score<g.cfg.scoreTarget?2:0.35);
  for(let i of m){if(needFood&&g.b[i]===g.cfg.food)value+=5; if(g.ice[i]||g.jelly[i])value+=10;for(let j of [i-7,i+7,i-1,i+1])if(g.adj(i,j)&&g.boxes[j])near.add(j);}
  value+=near.size*12;
  if(pending.length)value+=m.reduce((sum,i)=>sum+Math.max(...pending.map(j=>2/(1+Math.abs(i%7-j%7)+Math.abs(Math.floor(i/7)-Math.floor(j/7))))),0);
  g.swap(...pair);scored.push({pair,value:value+policy()*.15});
 }
 scored.sort((a,b)=>b.value-a.value);return scored[policy()<.12&&scored.length>1?1:0]?.pair;
}
function play(l,seed,limit=80,verify=false,boosters=false){let g=new Game(l,seed),policy=rng(seed^0x739eaa),cascades=0,shuffles=0;
 let hammers=3,rows=2,reorders=2,stale=0,boosts=0;
 const layers=()=>[...g.ice,...g.boxes,...g.jelly].reduce((a,b)=>a+b,0);
 const settle=ids=>{let chain=0;while(ids.length){if(++chain>200)throw Error('Cascade loop '+l);g.clear(ids);g.fall();ids=g.match();cascades++;}};
 if(g.match().length||!g.legal().length)throw Error('Invalid start '+l);
 for(let turn=1;turn<=limit;turn++){
  if(boosters){
   const remain=layers();
   if(remain&&rows&&(turn>=Math.ceil(limit*.45)||stale>=8)){
    const totals=Array.from({length:g.cfg.rows},(_,r)=>g.ice.slice(r*7,r*7+7).reduce((a,b)=>a+b,0)+g.jelly.slice(r*7,r*7+7).reduce((a,b)=>a+b,0)+g.boxes.slice(r*7,r*7+7).reduce((a,b)=>a+b,0));
    const row=totals.indexOf(Math.max(...totals));settle(Array.from({length:7},(_,c)=>row*7+c));rows--;boosts++;stale=0;
   }
   if(layers()&&hammers&&(layers()<=hammers||stale>=10||turn>=limit-4)){const ids=g.b.flatMap((_,i)=>g.ice[i]||g.boxes[i]||g.jelly[i]?[i]:[]);settle([ids[0]]);hammers--;boosts++;stale=0;}
   if(stale>=12&&reorders){g.shuffle();reorders--;boosts++;stale=0;}
   if(g.won())return {turns:turn-1,cascades,shuffles,boosts,won:true};
  }
  let before=layers()+Math.max(0,g.cfg.target-g.got)+Math.max(0,g.cfg.scoreTarget-g.score)/60;
  let pair=choose(g,policy);if(!pair){g.shuffle();shuffles++;pair=choose(g,policy);}if(!pair)throw Error('No move '+l);
  g.swap(...pair);g.moves--;let m=g.match(),chain=0;
  while(m.length){if(++chain>200)throw Error('Cascade loop '+l);g.clear(m);g.fall();m=g.match();cascades++;}
  if(verify)for(let i=0;i<g.cfg.size;i++){if(g.active(i)&&!(g.b[i]>=0&&g.b[i]<g.cfg.colors))throw Error('Unfilled cell '+l);if(!g.cfg.mask[i]&&(g.b[i]!==-1||g.ice[i]||g.boxes[i]||g.jelly[i]))throw Error('Void corrupted '+l);}
  let after=layers()+Math.max(0,g.cfg.target-g.got)+Math.max(0,g.cfg.scoreTarget-g.score)/60;stale=after<before?0:stale+1;
  if(g.won())return {turns:turn,cascades,shuffles,boosts,won:true};
 }
 return {turns:limit+1,cascades,shuffles,won:false};
}
module.exports={play,choose};
