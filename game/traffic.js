import T from './three.js';
export function vehicle(scene,color='#ddac44',police=false,heavy=false){
 const g=new T.Group(),paint=new T.MeshStandardMaterial({color,roughness:.48}),dark=new T.MeshStandardMaterial({color:'#263f49'});
 const part=(x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
 part(0,.7,0,heavy?2.6:2.2,.8,4.5,paint);part(0,1.38,-.2,1.9,.7,2.2,dark);part(0,1.8,-.2,2,.12,2.3,paint);
 for(const x of [-1.13,1.13])for(const z of [-1.4,1.4]){const w=new T.Mesh(new T.CylinderGeometry(.45,.45,.27,12),new T.MeshStandardMaterial({color:'#20292e'}));w.rotation.z=Math.PI/2;w.position.set(x,.45,z);g.add(w)}
 for(const x of [-.75,.75]){part(x,.8,2.28,.45,.25,.05,new T.MeshBasicMaterial({color:'#fff2b0'}));part(x,.8,-2.28,.45,.2,.05,new T.MeshBasicMaterial({color:'#ee654b'}))}
  let lamps=[];if(police){part(0,.95,0,2.25,.3,3,new T.MeshStandardMaterial({color:'#183744'}));lamps=['#ff344e','#37a4ff'].map((color,i)=>part(i?.5:-.5,1.98,0,.65,.2,.4,new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0}))) }
 scene.add(g);return {g,paint,lamps,stolen:false,speed:0,health:100};
}
export function makeTraffic(scene){const cars=[];for(let i=0;i<64;i++){const c=vehicle(scene,['#d6a12f','#bd5843','#458e9f','#c9c2ab','#435f7a'][i%5]);c.axis=i<32?'z':'x';c.direction=i%2?1:-1;const lane=-48+(Math.floor(i/2)%6)*24+c.direction*2.2,along=-78+(Math.floor(i/12)*31+i%2*13)%156;c.g.position.set(c.axis==='z'?lane:along,.1,c.axis==='z'?along:lane);c.g.rotation.y=c.axis==='x'?c.direction*Math.PI/2:c.direction>0?0:Math.PI;c.speed=3+(i%4);cars.push(c)}cars[0].g.position.set(-46,.1,0);return cars}
export function updateTraffic(cars,dt){for(const c of cars)if(!c.stolen){c.g.position[c.axis]+=c.speed*c.direction*dt;if(c.g.position[c.axis]>86)c.g.position[c.axis]=-86;if(c.g.position[c.axis]<-86)c.g.position[c.axis]=86}}
