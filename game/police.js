import T from './three.js';
import {vehicle} from './traffic.js';
import {person} from './actors.js';

// The response fleet. A light cruiser pair, a heavier interceptor, a persistent
// helicopter at four stars and a roadblock that lands ahead of the player at
// three stars. Cruiser pursuit and the escape-by-line-of-sight rule stay intact.
export function makePolice(scene){
 const units=Array.from({length:4},(_,i)=>Object.assign(vehicle(scene,i===3?'#334651':'#f0eee0',true,i>=2),{heavy:i>=2,active:false,hp:i>=2?150:100}));
 // Lift the lightbar above the roofline so the red and blue lamps stay visible
 // from an elevated chase camera.
 units.forEach(u=>u.lamps.forEach(l=>{l.position.y=2.3}));
 const officers=Array.from({length:3},()=>{const p=person(scene,'#23455e');p.visible=false;return p});

 // Persistent helicopter: fuselage, tail boom with stabiliser, and a turning rotor.
 const helicopter=new T.Group();
 const bodyMat=new T.MeshStandardMaterial({color:'#354b51',roughness:.55});
 const trimMat=new T.MeshStandardMaterial({color:'#d8dacb',roughness:.6});
 const fuselage=new T.Mesh(new T.SphereGeometry(1,14,10),bodyMat);fuselage.scale.set(1.5,1.1,2.8);fuselage.castShadow=true;helicopter.add(fuselage);
 const cockpit=new T.Mesh(new T.BoxGeometry(1.9,.9,1.4),new T.MeshStandardMaterial({color:'#2b3f4a'}));cockpit.position.set(0,-.1,1.5);helicopter.add(cockpit);
 const canopy=new T.Mesh(new T.SphereGeometry(.7,10,8),new T.MeshStandardMaterial({color:'#9fd0da',transparent:true,opacity:.5}));canopy.scale.set(1.2,.7,1);canopy.position.set(0,.35,1.7);helicopter.add(canopy);
 const tail=new T.Mesh(new T.BoxGeometry(.45,.45,5.4),trimMat);tail.position.set(0,.15,-3.6);tail.castShadow=true;helicopter.add(tail);
 const fin=new T.Mesh(new T.BoxGeometry(.15,1.4,1.1),trimMat);fin.position.set(0,.75,-6.1);helicopter.add(fin);
 const tailRotor=new T.Mesh(new T.BoxGeometry(.14,1.5,.14),new T.MeshStandardMaterial({color:'#233b42'}));tailRotor.position.set(.32,.75,-6.1);helicopter.add(tailRotor);
 const mast=new T.Mesh(new T.CylinderGeometry(.12,.12,.6,8),new T.MeshStandardMaterial({color:'#2c4046'}));mast.position.y=1.25;helicopter.add(mast);
 const rotor=new T.Mesh(new T.BoxGeometry(13,.12,.28),new T.MeshStandardMaterial({color:'#233b42'}));rotor.position.y=1.6;helicopter.add(rotor);
 const skidMat=new T.MeshStandardMaterial({color:'#8b9791',metalness:.4});for(const x of [-.7,.7]){const skid=new T.Mesh(new T.BoxGeometry(.12,.12,3),skidMat);skid.position.set(x,-.95,.2);helicopter.add(skid);const strut=new T.Mesh(new T.BoxGeometry(.1,.8,.1),skidMat);strut.position.set(x,-.55,.2);helicopter.add(strut)}
 const searchlight=new T.Mesh(new T.SphereGeometry(.22,8,6),new T.MeshStandardMaterial({color:'#fff3c0',emissive:'#ffe07a',emissiveIntensity:2}));searchlight.position.set(0,-.7,1.9);helicopter.add(searchlight);
 scene.add(helicopter);helicopter.visible=false;

 // Roadblock: barriers, cones and a spike strip that appears ahead of the player.
 const roadblock=new T.Group();
 const barMat=new T.MeshStandardMaterial({color:'#e8e3d2',roughness:.7});
 const stripeMat=new T.MeshStandardMaterial({color:'#d94a3d',emissive:'#5a1c17',emissiveIntensity:.5});
 for(const x of [-2.6,2.6]){
  const leg=new T.Mesh(new T.BoxGeometry(.28,1.6,.28),new T.MeshStandardMaterial({color:'#3a474d'}));leg.position.set(x,.8,0);roadblock.add(leg);
  const foot=new T.Mesh(new T.BoxGeometry(.7,.18,.7),new T.MeshStandardMaterial({color:'#3a474d'}));foot.position.set(x,.1,0);roadblock.add(foot);
 }
 const beam=new T.Mesh(new T.BoxGeometry(6.4,.55,.3),barMat);beam.position.set(0,1.45,0);roadblock.add(beam);
 for(let i=0;i<5;i++){const stripe=new T.Mesh(new T.BoxGeometry(.6,.56,.32),stripeMat);stripe.position.set(-2.4+i*1.2,1.45,.01);roadblock.add(stripe)}
 const light=new T.Mesh(new T.SphereGeometry(.2,8,6),new T.MeshStandardMaterial({color:'#e8534a',emissive:'#e8534a',emissiveIntensity:2.5}));light.position.set(0,1.9,0);roadblock.add(light);
 for(let i=0;i<7;i++){const cone=new T.Mesh(new T.ConeGeometry(.24,.6,10),new T.MeshStandardMaterial({color:'#e07a3a',emissive:'#713417',emissiveIntensity:.3}));cone.position.set(-3.6+i*1.2,.35,1.5);roadblock.add(cone)}
 const spikes=new T.Mesh(new T.BoxGeometry(7,.12,.4),new T.MeshStandardMaterial({color:'#5b6560',metalness:.5}));spikes.position.set(0,.06,-1.4);roadblock.add(spikes);
 scene.add(roadblock);roadblock.visible=false;

 return {units,officers,helicopter,rotor,tailRotor,searchlight,roadblock,roadblockLight:light,seen:false,escape:0,bust:0,roadblockAhead:null};
}

export function updatePolice(p,s,world,dt,time,damage){
 let seen=false;const count=s.wanted?Math.min(4,s.wanted+1):0;
 p.units.forEach((u,i)=>{const active=i<count;u.g.visible=active&&u.hp>0;if(!active){u.active=false;u.hp=u.heavy?150:100;return}if(!u.active){u.g.position.set(s.x+(i%2?-12:13),.1,s.z-12-i*5);u.active=true}
  if(u.hp<=0)return;const dx=s.x-u.g.position.x,dz=s.z-u.g.position.z,d=Math.hypot(dx,dz),visible=!world.occluded(u.g.position.x,u.g.position.z,s.x,s.z);if(d<38&&visible)seen=true;
   if(d>7){const step=(u.heavy?8:6)*dt,nx=u.g.position.x+dx/d*step,nz=u.g.position.z+dz/d*step;if(!world.blocked(nx,u.g.position.z,1))u.g.position.x=nx;if(!world.blocked(u.g.position.x,nz,1))u.g.position.z=nz}u.g.rotation.y=Math.atan2(dx,dz);u.lamps.forEach(l=>{l.visible=true;l.material.emissiveIntensity=Math.sin(time*8)>0?3:0});
 });
 p.officers.forEach((o,i)=>{o.visible=s.wanted>=2;if(!o.visible)return;const u=p.units[i];o.position.set(u.g.position.x+3,0,u.g.position.z+2);const d=Math.hypot(o.position.x-s.x,o.position.z-s.z);if(d<15&&!world.occluded(o.position.x,o.position.z,s.x,s.z)&&Math.sin(time*3+i)>.96)damage(dt*70)});

 // Persistent helicopter shadows the player from four stars, rotor always turning.
 const air=s.wanted>=4;
 if(air&&!p.helicopter.visible)p.helicopter.visible=true;
 if(!air)p.helicopter.visible=false;
 if(p.helicopter.visible){const orbit=time*.5;p.helicopter.position.set(s.x+Math.cos(orbit)*16+6,17+Math.sin(time*.9)*.6,s.z+Math.sin(orbit)*16);p.helicopter.rotation.y=-orbit+Math.PI/2;p.rotor.rotation.y=time*30;p.tailRotor.rotation.x=time*34;p.searchlight.material.emissiveIntensity=1.4+Math.sin(time*6)*1.1;seen=true}

 // Roadblock lands ahead of the player from three stars and stays put until five.
 if(s.wanted>=3){if(!p.roadblock.visible){p.roadblock.visible=true;p.roadblockAhead=true}const ahead=14+Math.min(10,s.wanted*2),hx=s.x+Math.sin(s.heading||0)*ahead,hz=s.z+Math.cos(s.heading||0)*ahead;p.roadblock.position.set(hx,0,hz);p.roadblock.rotation.y=s.heading||0;p.roadblockLight.material.emissiveIntensity=Math.sin(time*10)>0?3:.4}else{p.roadblock.visible=false;p.roadblockAhead=false}

 p.seen=seen;if(s.wanted){p.escape=seen?0:p.escape+dt;if(p.escape>8){s.wanted=0;p.escape=0}const close=p.units.some(u=>u.g.visible&&Math.hypot(u.g.position.x-s.x,u.g.position.z-s.z)<9);p.bust=!s.vehicle&&close?p.bust+dt:0}else{p.bust=0;p.escape=0}
}
