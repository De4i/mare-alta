// Role attributes drive the gunplay: AIM tightens the spread cone and raises
// per-hit damage, ENDURANCE feeds max health, armour and sprint length (applied
// in the simulation). Every resolved hit paints a short impact flash on the
// target, and incoming fire tints the screen edge.
export function spreadFor(aim){return Math.max(.05,1.05-(aim-1)*.14)}
export function damageFor(aim){return 34+(aim-1)*11}
export function fire(s,sim){
 if(s.reloading||s.ammo<=0){sim.toast('Press R to reload');return null}
 const aim=s.attributes?.aim??1;
 s.ammo--;s.shots++;s.wanted=Math.min(5,s.wanted+1);
 sim.shoot({spread:spreadFor(aim),damage:damageFor(aim),aim});
 sim.sound(150);
 return {spread:spreadFor(aim),damage:damageFor(aim)};
}
export function reload(s,sim){if(s.ammo===s.clip||s.reserve<=0||s.reloading)return;s.reloading=1.1;sim.toast('Reloading…');sim.sound(330)}
export function hitFeedback(sim,x,z){sim?.impact&&sim.impact(x,z)}
export function playerHit(sim,intensity=1){sim?.tint&&sim.tint(intensity)}
