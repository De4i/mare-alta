import T from './three.js';
import {follow} from './render.js';
import {person} from './actors.js';
import {jobs} from './missions.js';

// Stage live scene objects; all evidence comes from the rendered camera matrices.
export function captureTools({scene,camera,traffic,people,police,player,avatar,start,getState,sync,pause,step,render,shoot}){
 const project=v=>v.clone().project(camera),frustum=new T.Frustum();
 let frame=0;
 const marker=new T.Mesh(new T.TorusGeometry(1.6,.18,8,24),new T.MeshStandardMaterial({color:'#ffe58b',emissive:'#e9ad32',emissiveIntensity:1.5}));marker.rotation.x=Math.PI/2;scene.add(marker);marker.visible=false;
 const driver=person(scene,'#d6ad54');scene.remove(driver);traffic[0].g.add(driver);driver.position.set(-.5,.25,-.2);driver.scale.setScalar(.72);driver.visible=false;
 // Open side glazing leaves the seated driver visible from the chase camera.
 const glazing=traffic[0].g.children[1].material.clone();glazing.transparent=true;glazing.opacity=.22;traffic[0].g.children[1].material=glazing;const roof=traffic[0].g.children[2].material.clone();roof.transparent=true;roof.opacity=.25;traffic[0].g.children[2].material=roof;
 const gun=new T.Mesh(new T.BoxGeometry(.16,.18,.65),new T.MeshStandardMaterial({color:'#23333c'}));gun.position.set(.46,1.35,.55);avatar.add(gun);gun.visible=false;
 function bounds(object){const box=new T.Box3().setFromObject(object),p=[...Array(8)].map((_,i)=>project(new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z)));return {left:Math.min(...p.map(v=>(v.x+1)*640)),right:Math.max(...p.map(v=>(v.x+1)*640)),top:Math.min(...p.map(v=>(1-v.y)*360)),bottom:Math.max(...p.map(v=>(1-v.y)*360)),depth:p.every(v=>v.z>-1&&v.z<1)};}
 function visible(object){return object.visible&&frustum.intersectsBox(new T.Box3().setFromObject(object));}
 function stage(index){
  frame=index;start();const s=getState();Object.assign(s,{mission:index===2?0:3,stage:0,vehicle:index!==1,wanted:index===0?3:0,x:index===2?-66:index===1?24:-42,z:index===2?72:index===1?72:72,heading:index===2?Math.PI:Math.PI/2,clockMinutes:858,health:100,armour:75,tutorial:1});
  s.captureCamera=index===0?{position:[-49,2.9,72],target:[-24,1,72]}:index===1?{position:[16,5.5,62],target:[30,1,76]}:{position:[-65,5.2,81],target:[-77,1,49]};
  camera.fov=index===0?78:70;camera.updateProjectionMatrix();follow(camera,s);camera.updateMatrixWorld();
  traffic.forEach(c=>c.stolen=false);const c=traffic[0];c.stolen=true;c.g.position.set(s.x,.1,s.z+(index===1?3.5:0));c.g.rotation.y=s.heading;driver.visible=s.vehicle;gun.visible=index===1;avatar.rotation.y=Math.PI/2;
  // A broad harbour avenue for the chase and foot frames; waterfront access for the port.
  traffic.slice(1).forEach((c,i)=>{c.g.visible=i<30;c.axis=index===2?'z':'x';c.direction=i%2?1:-1;c.speed=.35;c.g.position.set(index===2?-66+(i%2)*3:s.x+10+Math.floor(i/3)*7,.1,index===2?60-Math.floor(i/2)*7:68+(i%3)*4);c.g.rotation.y=c.axis==='x'?Math.PI/2:0;});
  people.forEach((a,i)=>{a.p.visible=i<40;a.homeX=index===2?-68+(i%2)*2:s.x+9+Math.floor(i/2)*2.6;a.homeZ=index===2?65-Math.floor(i/2)*2.5:i%2?80:64;a.axis=index===2?'z':'x';a.phase=i;});
  marker.visible=index===2;marker.position.set(jobs[s.mission].x,6,jobs[s.mission].z);marker.rotation.x=0;
  police.escape=0;police.bust=0;
  const positions=[[-45,75],[-32,70],[-18,74],[-9,70]];
  police.units.forEach((u,i)=>{u.active=true;u.hp=100;u.g.visible=!!s.wanted;u.g.position.set(...[positions[i][0],.1,positions[i][1]]);});
  sync();document.querySelectorAll('#toast,#dialog,#modal').forEach(el=>el.classList.add('hidden'));
 }
 function audit(){
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);frustum.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  const s=getState(),car=traffic[0],b=bounds(car.g),units=police.units.filter(u=>visible(u.g)).map(u=>({distance:Math.hypot(u.g.position.x-s.x,u.g.position.z-s.z),lamps:u.lamps.map(l=>l.material.emissiveIntensity),x:u.g.position.x,z:u.g.position.z}));
  const quay=scene.getObjectByName('quay-wall'),q=new T.Box3().setFromObject(quay),nearest=q.clampPoint(camera.position,new T.Vector3());
  return {frame,vehicle:s.vehicle,carBounds:b,playerCarInFrame:b.depth&&b.left>=18&&b.right<=1262&&b.top>=18&&b.bottom<=702,traffic:traffic.filter(c=>!c.stolen&&visible(c.g)).length,pedestrians:people.filter(a=>visible(a.p)).length,police:units,water:scene.children.filter(o=>o.name==='harbour-water'&&visible(o)).length,quayDistance:camera.position.distanceTo(nearest),boats:scene.children.filter(o=>o.name==='moored-boat'&&visible(o)).length,markerVisible:visible(marker),markerBounds:bounds(marker),playerVisible:player.visible&&visible(avatar),gunVisible:gun.visible&&visible(gun),camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z,behind:Math.hypot(camera.position.x-s.x,camera.position.z-s.z)},clock:s.clockMinutes};
 }
 function motion(){audit();return {traffic:traffic.filter(c=>!c.stolen&&visible(c.g)).map(c=>({id:traffic.indexOf(c),x:c.g.position.x,z:c.g.position.z})),people:people.filter(a=>visible(a.p)).map(a=>({id:people.indexOf(a),x:a.p.position.x,z:a.p.position.z})),lamps:police.units.flatMap(u=>u.lamps.map(l=>l.material.emissiveIntensity))};}
  const flash=new T.Mesh(new T.SphereGeometry(.24,8,6),new T.MeshBasicMaterial({color:'#fff0a0'}));flash.position.set(.46,1.35,1);avatar.add(flash);flash.visible=false;
  let preset='',required=[];
  function ndcBox(box){
   const points=Array.from({length:8},(_,i)=>new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z));
   const front=points.every(v=>v.clone().applyMatrix4(camera.matrixWorldInverse).z<0),p=points.map(project);
   const min=['x','y','z'].map(k=>Math.min(...p.map(v=>v[k]))),max=['x','y','z'].map(k=>Math.max(...p.map(v=>v[k])));
   return {min,max,front,inside:front&&min.every(v=>v>=-1)&&max.every(v=>v<=1)};
  }
  function requireObject(id,o){required.push({id,o});}
  function section(id,min,max){required.push({id,box:new T.Box3(new T.Vector3(...min),new T.Vector3(...max))});}
  function measure(){
   scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   const s=getState(),j=jobs[s.mission];
   const elements=required.map(({id,o,box})=>{let visible=true;for(let p=o;p;p=p.parent)visible&&=p.visible;const center=box?box.getCenter(new T.Vector3()):o.getWorldPosition(new T.Vector3());return {id,visible,distance:Math.hypot(center.x-s.x,center.z-s.z),emissive:o?.material?.emissiveIntensity,...ndcBox(box||new T.Box3().setFromObject(o))}});
   if(preset==='cityrecord')for(const selector of ['#modal .modal-box','#modal h2']){const el=document.querySelector(selector),b=el.getBoundingClientRect(),min=[b.left/innerWidth*2-1,1-b.bottom/innerHeight*2,0],max=[b.right/innerWidth*2-1,1-b.top/innerHeight*2,0];elements.push({id:selector,visible:!el.closest('.hidden'),min,max,front:true,inside:min.every(v=>v>=-1)&&max.every(v=>v<=1)})}
   return {preset,elements,camera:{position:camera.position.toArray(),pitch:Math.asin(-camera.getWorldDirection(new T.Vector3()).y)*180/Math.PI,behind:Math.hypot(camera.position.x-s.x,camera.position.z-s.z)},state:{vehicle:s.vehicle,health:s.health,armour:s.armour,ammo:s.ammo,reserve:s.reserve,cash:s.cash,wanted:s.wanted,mission:s.mission,shots:s.shots},minimapMarker:{x:89+(j.x-s.x)*.7,y:71+(j.z-s.z)*.6},flash:flash.visible};
  }
  function place(name){
   preset=name;required=[];const s=getState(),cover=name==='cover',foot=name==='onfoot';
   Object.assign(s,{mission:cover||foot?3:6,stage:0,vehicle:cover,wanted:cover?3:foot?2:0,x:cover?-42:foot?0:-68,z:cover?72:foot?64:88,heading:Math.PI/2,clockMinutes:858,health:60,armour:40,ammo:11,reserve:48,cash:650,tutorial:1,reloading:0});
   s.captureCamera=cover?{position:[-49,3,72],target:[-19,3-30*Math.tan(Math.PI/15),72]}:foot?{position:[-7,4,60],target:[18,1.4,69]}:{position:[-68,3,88],target:[-72,3,48]};
   camera.fov=cover?64:foot?65:80;camera.updateProjectionMatrix();follow(camera,s);
   traffic.forEach(c=>{c.g.visible=false;c.stolen=false});people.forEach(a=>{a.p.visible=false});police.units.forEach(u=>{u.g.visible=false;u.active=true});police.officers.forEach(o=>o.visible=false);police.helicopter.visible=false;
   const car=(c,x,z,id)=>{c.g.visible=true;c.g.position.set(x,.1,z);c.g.rotation.y=Math.PI/2;c.speed=.35;c.axis='x';c.direction=1;requireObject(id,c.g)};
   const pedestrian=(i,x,z)=>{const a=people[i];a.p.visible=true;a.homeX=x;a.homeZ=z;a.p.position.set(x,.2,z);a.p.rotation.y=Math.PI/2;a.p.userData.legs.forEach((l,k)=>l.rotation.x=k?.2:-.2);requireObject(`pedestrian-${i+1}`,a.p)};
   const cruiser=(i,x,z)=>{const u=police.units[i];car(u,x,z,`police-${i+1}`);u.hp=100;u.lamps.forEach((l,k)=>{l.visible=true;l.material.emissiveIntensity=3;requireObject(`police-${i+1}-${k?'blue':'red'}-lamp`,l)})};
   driver.visible=cover;gun.visible=foot;flash.visible=foot;avatar.rotation.y=Math.PI/2;marker.visible=!cover&&!foot;
   if(cover){car(traffic[0],s.x,s.z,'player-car');traffic[0].stolen=true;requireObject('seated-driver',driver);cruiser(0,-30,69);cruiser(1,-22,75);
    for(let i=0;i<10;i++)car(traffic[i+1],-12+Math.floor(i/2)*7,69+(i%2)*6,`traffic-${i+1}`);
    for(let i=0;i<16;i++)pedestrian(i,-28+Math.floor(i/2)*5,i%2?80:64);
   }else if(foot){requireObject('player',avatar);requireObject('drawn-weapon',gun);requireObject('muzzle-flash',flash);car(traffic[0],9,69,'parked-car');traffic[0].speed=0;cruiser(0,24,71);for(let i=0;i<3;i++)pedestrian(i,8+i*6,64);
   }else{
    for(let i=0;i<6;i++)pedestrian(i,-68,72-i*4);
    for(let i=0;i<3;i++)car(traffic[i],-63,70-i*10,`quay-vehicle-${i+1}`);
    const boats=scene.children.filter(o=>o.name==='moored-boat');boats.forEach((o,i)=>{requireObject(`moored-boat-${i+1}`,o);section(`boat-${i+1}-cabin`,[-79.4,.8,o.position.z-2.5],[-76.6,1.7,o.position.z+.5])});
    // Surface patches belong to the existing broad meshes; projecting their full
    // 184–210 m bounds would require framing the entire coastline.
    section('sea-visible-section',[-86,0,35],[-74,.04,68]);section('quay-wall-visible-section',[-72,-.55,38],[-70,.85,70]);section('promenade-visible-section',[-70,0,42],[-66,.27,76]);
    scene.children.filter(o=>o.position.x===-64&&o.position.y===1.3).forEach((o,i)=>requireObject(`container-${i+1}`,o));
    marker.position.set(jobs[s.mission].x,3,jobs[s.mission].z);marker.rotation.x=0;requireObject('active-job-marker',marker);
   }
   sync();document.querySelectorAll('#toast,#dialog,#modal').forEach(el=>el.classList.add('hidden'));
  }
  async function setPreset(name){
   if(!['cover','onfoot','harbour','cityrecord'].includes(name))throw new Error(`Unknown capture preset: ${name}`);
   start();pause(true);
   if(name==='cityrecord'){
    // Preserve the existing port backdrop and CITY RECORD presentation.
     stage(2);pause(true);preset=name;required=[];
     for(let i=0;i<2;i++){pause(false);step(1/60);pause(true);await new Promise(requestAnimationFrame)}
     sync();follow(camera,getState());render();
    dispatchEvent(new KeyboardEvent('keydown',{key:'Tab'}));
   }else{
    place(name);
    // Two fixed simulation ticks warm the live scene; reapply the exact pose before holding.
    for(let i=0;i<2;i++){pause(false);step(1/60);pause(true);await new Promise(requestAnimationFrame)}
     place(name);if(name==='onfoot'){Object.assign(getState(),{ammo:12,wanted:1});shoot();sync()}render();
   }
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);return measure();
  }
  return {stage,audit,motion,setPreset,measure,freeze:()=>{pause(true);return audit()},resume:()=>pause(false)};
}
