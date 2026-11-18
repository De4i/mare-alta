import T from './three.js';
import {vehicle} from './traffic.js';
import {person} from './actors.js';
export function makePolice(scene){
 const units=Array.from({length:4},(_,i)=>({...vehicle(scene,i===3?'#334651':'#f0eee0',true,i===3),heavy:i===3,active:false,hp:100}));
 const officers=Array.from({length:3},()=>{const p=person(scene,'#23455e');p.visible=false;return p});
 const helicopter=new T.Group(),fuselage=new T.Mesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color:'#354b51'}));fuselage.scale.set(1.8,1,3);helicopter.add(fuselage);const rotor=new T.Mesh(new T.BoxGeometry(12,.12,.25),new T.MeshStandardMaterial({color:'#233b42'}));rotor.position.y=1.3;helicopter.add(rotor);const tail=new T.Mesh(new T.BoxGeometry(.4,.4,5),new T.MeshStandardMaterial({color:'#d8dacb'}));tail.position.z=-4;helicopter.add(tail);scene.add(helicopter);helicopter.visible=false;
 return {units,officers,helicopter,rotor,seen:false,escape:0,bust:0};
}
export function updatePolice(p,s,world,dt,time,damage){
 let seen=false;const count=s.wanted?Math.min(4,s.wanted+1):0;
 p.units.forEach((u,i)=>{const active=i<count&&(!u.heavy||s.wanted>=3);u.g.visible=active&&u.hp>0;if(!active){u.active=false;u.hp=100;return}if(!u.active){u.g.position.set(s.x+(i%2?-12:13),.1,s.z-12-i*5);u.active=true}
  if(u.hp<=0)return;const dx=s.x-u.g.position.x,dz=s.z-u.g.position.z,d=Math.hypot(dx,dz),visible=!world.occluded(u.g.position.x,u.g.position.z,s.x,s.z);if(d<38&&visible)seen=true;
   if(d>7){const step=(u.heavy?8:6)*dt,nx=u.g.position.x+dx/d*step,nz=u.g.position.z+dz/d*step;if(!world.blocked(nx,u.g.position.z,1))u.g.position.x=nx;if(!world.blocked(u.g.position.x,nz,1))u.g.position.z=nz}u.g.rotation.y=Math.atan2(dx,dz);u.lamps.forEach(l=>{l.visible=true;l.material.emissiveIntensity=Math.sin(time*8)>0?3:0});
 });
 p.officers.forEach((o,i)=>{o.visible=s.wanted>=2;if(!o.visible)return;const u=p.units[i];o.position.set(u.g.position.x+3,0,u.g.position.z+2);const d=Math.hypot(o.position.x-s.x,o.position.z-s.z);if(d<15&&!world.occluded(o.position.x,o.position.z,s.x,s.z)&&Math.sin(time*3+i)>.96)damage(dt*70)});
 p.helicopter.visible=s.wanted>=4;if(p.helicopter.visible){p.helicopter.position.set(s.x+Math.cos(time*.4)*15,18,s.z+Math.sin(time*.4)*15);p.rotor.rotation.y=time*28;seen=true}
 p.seen=seen;if(s.wanted){p.escape=seen?0:p.escape+dt;if(p.escape>8){s.wanted=0;p.escape=0}const close=p.units.some(u=>u.g.visible&&Math.hypot(u.g.position.x-s.x,u.g.position.z-s.z)<9);p.bust=!s.vehicle&&close?p.bust+dt:0}else{p.bust=0;p.escape=0}
}
