export function fire(s,sim){if(s.reloading||s.ammo<=0){sim.toast('Press R to reload');return}s.ammo--;s.shots++;s.wanted=Math.min(5,s.wanted+1);sim.shoot();sim.sound(150)}
export function reload(s,sim){if(s.ammo===s.clip||s.reserve<=0||s.reloading)return;s.reloading=1.1;sim.toast('Reloading…');sim.sound(330)}
