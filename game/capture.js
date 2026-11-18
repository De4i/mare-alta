import T from './three.js';
import {follow} from './render.js';
import {person} from './actors.js';
import {jobs} from './missions.js';

// Stage live scene objects; all evidence comes from the rendered camera matrices.
export function captureTools({scene,camera,traffic,people,police,player,avatar,start,getState,sync,pause}){
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
 return {stage,audit,motion,freeze:()=>{pause(true);return audit()},resume:()=>pause(false)};
}
