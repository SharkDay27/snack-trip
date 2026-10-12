const assert=require('node:assert/strict');const {Game,config}=require('./dist/engine.js');
for(let l=1;l<=100;l++){let g=new Game(l,440+l);assert.equal(g.match().length,0);assert(g.legal().length);assert(!g.adj(6,7));assert(!g.adj(-1,6));assert(!g.adj(g.cfg.size-1,g.cfg.size));for(let i=0;i<g.cfg.size;i++)if(!g.cfg.mask[i])assert.equal(g.b[i],-1);}
let g=new Game(96,77),i=g.ice.findIndex((v,i)=>v&&g.jelly[i]);assert(i>=0);g.ice[i]=1;g.jelly[i]=1;g.clear([i]);assert.equal(g.ice[i],0);assert.equal(g.jelly[i],1);g.fall();g.clear([i]);assert.equal(g.jelly[i],0);
g=new Game(38,99);const bottom=[52,59];g.b[52]=2;g.b[59]=3;g.b[3]=-1;g.b[10]=-1;g.fall();assert.equal(g.b[52],2);assert.equal(g.b[59],3);for(let r=2;r<=6;r++)assert.equal(g.b[r*7+3],-1);
g=new Game(74,22);i=g.boxes.findIndex(Boolean);assert(i>=0);g.boxes[i]=2;g.clear([i]);assert.equal(g.boxes[i],1);g.clear([i]);assert.equal(g.boxes[i],0);g.fall();assert(g.b[i]>=0);
for(let l of [1,8,22,38,56,74,96,100]){g=new Game(l,1);g.ice.fill(0);g.boxes.fill(0);g.jelly.fill(0);g.got=g.cfg.target;g.score=g.cfg.scoreTarget;assert(g.won());if(g.cfg.target){g.got--;assert(!g.won());g.got++;}if(g.cfg.scoreTarget){g.score--;assert(!g.won());}}
console.log('PASS: 100 starts; gap boundaries; independent refill; stacked ice/jelly; double crates; goal modes.');
