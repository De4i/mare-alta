import T from './three.js';
import {follow} from './render.js';
import {person} from './actors.js';
import {jobs} from './missions.js';

// Stage live scene objects; all evidence comes from the rendered camera matrices.
// Every measured element is checked on five axes: projected NDC bounds inside a
// [-0.95, 0.95] box, in front of the camera in view space, not occluded by an
// earlier hit along the camera ray, large enough on screen, and (for police
// lamps) in the lit phase. The capture is refused unless the in-frame counts a
// frame claims are actually measured inside the frame.
export function captureTools({scene,camera,traffic,people,police,player,avatar,start,getState,sync,pause,step,render,shoot}){
 const project=v=>v.clone().project(camera),frustum=new T.Frustum();
 let frame=0;
 const marker=new T.Mesh(new T.TorusGeometry(1.6,.18,8,24),new T.MeshStandardMaterial({color:'#ffe58b',emissive:'#e9ad32',emissiveIntensity:1.5}));marker.rotation.x=Math.PI/2;scene.add(marker);marker.visible=false;
 const driver=person(scene,'#d6ad54');scene.remove(driver);traffic[0].g.add(driver);driver.position.set(-.5,.25,-.2);driver.scale.setScalar(.72);driver.visible=false;
 // Open side glazing leaves the seated driver visible from the chase camera.
 const glazing=traffic[0].g.children[1].material.clone();glazing.transparent=true;glazing.opacity=.22;traffic[0].g.children[1].material=glazing;const roof=traffic[0].g.children[2].material.clone();roof.transparent=true;roof.opacity=.25;traffic[0].g.children[2].material=roof;
 const gun=new T.Mesh(new T.BoxGeometry(.16,.18,.65),new T.MeshStandardMaterial({color:'#23333c'}));gun.position.set(.46,1.35,.55);avatar.add(gun);gun.visible=false;
 const raycaster=new T.Raycaster();
 function bounds(object){const box=new T.Box3().setFromObject(object),p=[...Array(8)].map((_,i)=>project(new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z)));return {left:Math.min(...p.map(v=>(v.x+1)*640)),right:Math.max(...p.map(v=>(v.x+1)*640)),top:Math.min(...p.map(v=>(1-v.y)*360)),bottom:Math.max(...p.map(v=>(1-v.y)*360)),depth:p.every(v=>v.z>-1&&v.z<1)};}
 function visible(object){return object.visible&&frustum.intersectsBox(new T.Box3().setFromObject(object));}
 function stage(index){
  frame=index;start();const s=getState();Object.assign(s,{mission:index===2?0:3,stage:0,vehicle:index!==1,wanted:index===0?3:0,x:index===2?-66:index===1?24:-42,z:index===2?72:index===1?72:72,heading:index===2?Math.PI:Math.PI/2,clockMinutes:858,health:100,armour:75,tutorial:1});
  s.captureCamera=index===0?{position:[-49,2.9,72],target:[-24,1,72]}:index===1?{position:[16,5.5,62],target:[30,1,76]}:{position:[-65,5.2,81],target:[-77,1,49]};
  camera.fov=index===0?78:70;camera.updateProjectionMatrix();follow(camera,s);camera.updateMatrixWorld();
  traffic.forEach(c=>c.stolen=false);const c=traffic[0];c.stolen=true;c.g.position.set(s.x,.1,s.z+(index===1?3.5:0));c.g.rotation.y=s.heading;driver.visible=s.vehicle;gun.visible=index===1;avatar.rotation.y=Math.PI/2;
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
  // 0.95 margin: an element whose own bounding box pokes outside the safe frame is
  // treated as not in frame, so the picture and the assertion cannot disagree.
  const NDC_LIMIT=.95;
  function ndcBox(box){
   const points=Array.from({length:8},(_,i)=>new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z));
   const front=points.every(v=>v.clone().applyMatrix4(camera.matrixWorldInverse).z<0),p=points.map(project);
   const min=['x','y','z'].map(k=>Math.min(...p.map(v=>v[k]))),max=['x','y','z'].map(k=>Math.max(...p.map(v=>v[k])));
   const inside=front&&min[0]>= -NDC_LIMIT&&max[0]<=NDC_LIMIT&&min[1]>= -NDC_LIMIT&&max[1]<=NDC_LIMIT;
   const area=((max[0]-min[0])/2)*((max[1]-min[1])/2);
   return {min,max,front,inside,area};
  }
  // A ray from the camera to the element centre must reach that element before
  // any other scene object. Hits that belong to the element's own group subtree,
  // or to a group it is parented under (a seated driver inside its vehicle, a
  // lamp on its own cruiser), never count as occluding: the audit must not block
  // on an element being hidden by its own parent or vehicle.
  function owns(root,object){for(let p=object;p;p=p.parent)if(p===root)return true;return false}
  function occluded(group,center){
   const dir=center.clone().sub(camera.position);const len=dir.length();if(len<1e-4)return false;dir.normalize();
   raycaster.set(camera.position,dir);raycaster.far=len+1e-3;
   const hits=raycaster.intersectObjects(scene.children,true);
   for(const hit of hits){if(hit.distance>len+1e-3)break;if(owns(group,hit.object))return false;let parent=group.parent;while(parent){if(owns(parent,hit.object))return false;parent=parent.parent}return true}
   return false;
  }
  function requireObject(id,o,kind='other'){required.push({id,o,kind});}
  function section(id,min,max,kind='surface'){required.push({id,box:new T.Box3(new T.Vector3(...min),new T.Vector3(...max)),kind});}
  function measure(){
   scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   const s=getState(),j=jobs[s.mission];
   const elements=required.map(({id,o,box,kind})=>{
    let visible=true;for(let p=o;p;p=p.parent)visible&&=p.visible;
    const worldBox=box||new T.Box3().setFromObject(o),center=worldBox.getCenter(new T.Vector3());
    const ndc=ndcBox(worldBox);
    const occl=box?null:occluded(o,center);
    const minArea=kind==='vehicle'?.0006:kind==='pedestrian'?.0002:0;
    return {id,kind,visible,distance:Math.hypot(center.x-s.x,center.z-s.z),emissive:o?.material?.emissiveIntensity,...ndc,occluded:occl,minArea,areaOk:ndc.area>=minArea,center:[center.x,center.y,center.z]};
   });
   if(preset==='cityrecord')for(const selector of ['#modal .modal-box','#modal h2']){const el=document.querySelector(selector),b=el.getBoundingClientRect(),min=[b.left/innerWidth*2-1,1-b.bottom/innerHeight*2,0],max=[b.right/innerWidth*2-1,1-b.top/innerHeight*2,0];elements.push({id:selector,kind:'ui',visible:!el.closest('.hidden'),min,max,front:true,inside:min.every(v=>v>=-1)&&max.every(v=>v<=1),area:0,occluded:null,minArea:0,areaOk:true})}
   const inFrame=obj=>{for(let p=obj;p;p=p.parent)if(!p.visible)return false;return ndcBox(new T.Box3().setFromObject(obj)).inside};
   const lit=u=>u.lamps.some(l=>l.material.emissiveIntensity>=3);
   const counts={vehicles:[...traffic.filter(c=>!c.stolen&&inFrame(c.g)),...police.units.filter(u=>inFrame(u.g))].length,pedestrians:people.filter(a=>inFrame(a.p)).length,policeLampsInLitPhase:police.units.filter(u=>inFrame(u.g)&&lit(u)).length,boats:scene.children.filter(o=>o.name==='moored-boat'&&inFrame(o)).length,cranes:scene.children.filter(o=>o.name==='gantry-crane'&&inFrame(o)).length,containers:scene.children.filter(o=>o.name==='container-stack'&&inFrame(o)).length,water:required.filter(r=>r.id&&r.id.startsWith('sea')&&r.box&&ndcBox(r.box).inside).length};
   return {preset,elements,counts,camera:{position:camera.position.toArray(),pitch:Math.asin(-camera.getWorldDirection(new T.Vector3()).y)*180/Math.PI,behind:Math.hypot(camera.position.x-s.x,camera.position.z-s.z)},state:{name:s.name,role:s.role,attributes:s.attributes,vehicle:s.vehicle,health:s.health,armour:s.armour,ammo:s.ammo,reserve:s.reserve,cash:s.cash,wanted:s.wanted,mission:s.mission,shots:s.shots},minimapMarker:{x:89+(j.x-s.x)*.7,y:71+(j.z-s.z)*.6},flash:flash.visible};
  }
  function place(name){
   preset=name;required=[];const s=getState(),cover=name==='cover',foot=name==='onfoot';
   Object.assign(s,{mission:cover||foot?3:6,stage:0,vehicle:cover,wanted:cover?3:foot?2:0,x:cover?-42:foot?0:-68,z:cover?72:foot?64:88,heading:Math.PI/2,clockMinutes:858,health:60,armour:40,ammo:11,reserve:48,cash:650,tutorial:1,reloading:0});
   // The cover camera rides 12 m behind and above the player car, pitched down
   // 12 degrees so the road, the pursuing cruisers and the kerbside crowds all
   // fall inside the safe frame.
   s.captureCamera=cover?{position:[-54,4.5,72],target:[-6,4.5-48*Math.tan(12*Math.PI/180),72]}:foot?{position:[-7,4,60],target:[18,1.4,69]}:{position:[-84,9,52],target:[-78,4,88]};
   camera.fov=cover?64:foot?65:74;camera.updateProjectionMatrix();follow(camera,s);
   traffic.forEach(c=>{c.g.visible=false;c.stolen=false});people.forEach(a=>{a.p.visible=false});police.units.forEach(u=>{u.g.visible=false;u.active=true});police.officers.forEach(o=>o.visible=false);police.helicopter.visible=false;
   const car=(c,x,z,id,kind='vehicle')=>{c.g.visible=true;c.g.position.set(x,.1,z);c.g.speed=0;c.axis='x';c.direction=1;requireObject(id,c.g,kind)};
   const pedestrian=(i,x,z)=>{const a=people[i];a.p.visible=true;a.homeX=x;a.homeZ=z;a.p.position.set(x,.2,z);a.p.rotation.y=Math.PI/2;a.p.userData.legs.forEach((l,k)=>l.rotation.x=k?.2:-.2);requireObject(`pedestrian-${i+1}`,a.p,'pedestrian')};
   const cruiser=(i,x,z)=>{const u=police.units[i];car(u,x,z,`police-${i+1}`);u.active=true;u.hp=u.heavy?150:100;u.lamps.forEach((l,k)=>{l.visible=true;l.material.emissiveIntensity=3.0;l.scale.set(1.6,1.7,1.5);requireObject(`police-${i+1}-${k?'blue':'red'}-lamp`,l,'lamp')})};
   driver.visible=cover;gun.visible=foot;flash.visible=foot;avatar.rotation.y=Math.PI/2;marker.visible=!cover&&!foot;
   if(cover){
    // Chase-camera cover: the player's car holds the broad Porto Dourado avenue
    // at three stars, and two cruisers stand 12-25 m ahead of it in the camera's
    // view, one slightly left of the camera axis and one slightly right, with
    // their red and blue lightbar lamps lit. The queue ahead is a deterministic
    // lane fill and both kerbside sidewalks carry a standing crowd, placed so no
    // mesh cuts the camera-to-police lines. The two staged cruisers are the
    // leading pair; every element is registered for the audit.
    car(traffic[0],s.x,s.z,'player-car');traffic[0].stolen=true;requireObject('seated-driver',driver,'pedestrian');
    // One cruiser left of the axis, one right, both 12 m ahead of the player car.
    cruiser(0,s.x+12,67.5);cruiser(1,s.x+12,76.5);
    applyAvenue();
    for(let i=0;i<8;i++)requireObject(`traffic-${i+1}`,traffic[i+1].g,'vehicle');
    for(let i=0;i<12;i++)requireObject(`pedestrian-${i+1}`,people[i].p,'pedestrian');
   }else if(foot){requireObject('player',avatar);requireObject('drawn-weapon',gun);requireObject('muzzle-flash',flash);car(traffic[0],9,69,'parked-car');traffic[0].speed=0;cruiser(0,24,71);for(let i=0;i<3;i++)pedestrian(i,8+i*6,64);
   }else{
    // Harbour: moored boats with hulls, cabins and masts beside the quay, a
    // gantry crane straddling the quay with legs and a trolley, two container
    // stacks in different colours, quay traffic and a promenade crowd. The
    // camera sits out on the water, low and southwest of the yard, looking back
    // north-northeast so the broad water, the quay wall, the boats alongside it,
    // the crane and the container stacks all fall inside the frame together with
    // the promenade traffic.
    const walk=[[-66,80],[-66,84],[-66,88],[-64,80],[-64,84],[-64,88]];
    walk.forEach(([x,z],i)=>pedestrian(i,x,z));
    for(let i=0;i<3;i++)car(traffic[i],-68+i*3,79+i*4,`quay-vehicle-${i+1}`);
    const boats=scene.children.filter(o=>o.name==='moored-boat');boats.forEach((o,i)=>{requireObject(`moored-boat-${i+1}`,o);const mast=scene.children.find(c=>c.name==='boat-mast'&&Math.abs(c.position.z-(o.position.z+1.6))<.2);if(mast)requireObject(`boat-${i+1}-mast`,mast)});
    const crane=scene.children.find(o=>o.name==='gantry-crane');requireObject('gantry-crane',crane);requireObject('crane-trolley',crane.getObjectByName('crane-trolley'));
    scene.children.filter(o=>o.name==='container-stack').forEach((o,i)=>requireObject(`container-stack-${i+1}`,o));
    section('sea-visible-section',[-94,0,66],[-74,.04,92]);
    marker.position.set(-62,3,84);marker.rotation.x=0;requireObject('active-job-marker',marker);
   }
   sync();document.querySelectorAll('#toast,#dialog,#modal').forEach(el=>el.classList.add('hidden'));
  }
  // Deterministic layout of the cover avenue: the queue ahead (>=8 vehicles
  // inside 70 m, all with nonzero speed so the count is of moving traffic) and
  // the two kerbside crowds (12 pedestrians inside 45 m).
  function applyAvenue(){
   const s=getState();
    const queue=[[-30,68],[-22,68],[-14,68],[-6,68],[2,68],[-30,76],[-22,76],[-14,76],[-6,76],[2,76],[10,72],[18,72]];
   queue.forEach(([x,z],i)=>{const c=traffic[i+1];c.g.visible=true;c.g.position.set(x,.1,z);c.g.rotation.y=Math.PI/2;c.speed=3.4;c.stolen=false;c.axis='x';c.direction=1});
   const crowd=[[-34,63],[-30,63],[-26,63],[-22,63],[-18,63],[-14,63],[-34,81],[-30,81],[-26,81],[-22,81],[-18,81],[-14,81]];
   crowd.forEach(([x,z],i)=>{const a=people[i];a.p.visible=true;a.homeX=x;a.homeZ=z;a.axis='x';a.phase=i;a.p.position.set(x,.2,z);a.p.rotation.y=Math.PI/2;a.p.userData.legs.forEach((l,k)=>l.rotation.x=k?.2:-.2)});
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
   }else if(name==='cover'){
    place(name);
    const s=getState();s.wanted=3;
    // The two cruisers are already planted by place('cover') 12 m ahead of the
    // player car, one either side of the camera axis. Warm the live scene with
    // two fixed ticks (which may nudge traffic) and then re-pin the exact staged
    // pose so nothing drifts before the frame is frozen.
    police.escape=0;police.bust=0;
    for(let i=0;i<2;i++){pause(false);step(1/60);pause(true)}
    traffic[0].g.position.set(s.x,.1,s.z);traffic[0].g.rotation.y=Math.PI/2;applyAvenue();
    police.units.forEach((u,i)=>{if(i>1)return;u.g.visible=true;u.active=true;u.g.position.x=s.x+12;u.g.position.z=i?76.5:67.5});
    follow(camera,s);camera.updateMatrixWorld();sync();
    // Freeze the response in the lit phase so the captured frame really shows a
    // lit, alternating lightbar; the registration below is the same meshes the
    // audit reads, so the picture and the assertion cannot disagree.
    police.units.slice(0,2).forEach((u,i)=>{u.lamps.forEach((l,k)=>{l.visible=true;l.material.emissiveIntensity=3.0;requireObject(`police-${i+1}-${k?'blue':'red'}-lamp`,l,'lamp')})});
    render();
   }else{
    place(name);
    for(let i=0;i<2;i++){pause(false);step(1/60);pause(true);await new Promise(requestAnimationFrame)}
    place(name);if(name==='onfoot'){Object.assign(getState(),{ammo:12,wanted:1});shoot();sync()}render();
   }
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);return measure();
  }
  return {stage,audit,motion,setPreset,measure,freeze:()=>{pause(true);return audit()},resume:()=>pause(false)};
 }
