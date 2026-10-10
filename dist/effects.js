(function(root){
function profile(chain,reduced=false){const tier=chain<2?1:chain<4?2:chain<6?3:chain<8?4:5;return {tier,particles:reduced?0:[0,12,24,40,58,80][tier],rings:reduced?0:Math.max(0,tier-1),confetti:!reduced&&tier>=3,duration:reduced?0:480+tier*130,label:chain<2?'':chain<4?'好吃！':chain<6?'美味連發！':chain<8?'甜蜜風暴！':'點心大爆發！'};}
root.SnackEffects={profile};if(typeof module!=='undefined')module.exports=root.SnackEffects;
})(typeof window==='undefined'?globalThis:window);
