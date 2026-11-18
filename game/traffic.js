import T from './three.js';
export function vehicle(scene,color='#ddac44',police=false,heavy=false){
 const g=new T.Group(),paint=new T.MeshStandardMaterial({color,roughness:.48}),dark=new T.MeshStandardMaterial({color:'#263f49'});
 const part=(x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
 // Cruisers ride taller and stand wider than a civilian sedan so the silhouette
 // reads as police even in a still frame.
 const lift=police?.14:0,width=police?2.7:heavy?2.6:2.2;
 part(0,.7+lift,0,width,.8,4.5,paint);part(0,1.38+lift,-.2,1.9,.7,2.2,dark);part(0,1.8+lift,-.2,2,.12,2.3,paint);
  for(const x of [-1.13,1.13])for(const z of [-1.4,1.4]){const tire=new T.Mesh(new T.CylinderGeometry(.45,.45,.27,12),new T.MeshStandardMaterial({color:'#20292e',roughness:.9}));tire.rotation.z=Math.PI/2;tire.position.set(x,.45,z);g.add(tire);const rim=new T.Mesh(new T.CylinderGeometry(.25,.25,.29,12),new T.MeshStandardMaterial({color:'#bac2bd',metalness:.65,roughness:.35}));rim.rotation.z=Math.PI/2;rim.position.set(x*1.01,.45,z);g.add(rim);for(let spoke=0;spoke<5;spoke++){const s=new T.Mesh(new T.BoxGeometry(.05,.38,.07),new T.MeshStandardMaterial({color:'#dce1d8',metalness:.5}));s.position.set(x*1.14,.45,z);s.rotation.x=spoke*Math.PI/5;g.add(s)}}
 for(const x of [-.75,.75]){part(x,.8+lift,2.28,.45,.25,.05,new T.MeshBasicMaterial({color:'#fff2b0'}));part(x,.8+lift,-2.28,.45,.2,.05,new T.MeshBasicMaterial({color:'#ee654b'}))}
  let lamps=[];if(police){
   // Contrasting livery: white body, dark doors and bonnet, a wide blue stripe
   // along both flanks and a blue block mark on each door.
   const white=new T.MeshStandardMaterial({color:'#f2f1ea',roughness:.5}),blue=new T.MeshStandardMaterial({color:'#20489a',roughness:.55}),door=new T.MeshStandardMaterial({color:'#1c2733',roughness:.5});
   part(0,.7+lift,0,width,.8,4.5,white);                       // white body
   part(0,1.38+lift,-.2,1.9,.7,2.2,door);                     // dark cabin band
   part(0,1.42+lift,2.05,2.0,.5,1.1,door);                    // dark bonnet
   part(0,1.42+lift,-2.05,2.0,.5,1.1,door);                   // dark boot
   for(const s of [-1,1]){
    part(s*(width/2+.01),.72+lift,0,.04,.34,4.4,blue);        // wide blue side stripe
    part(s*(width/2+.02),1.0+lift,-.2,.05,.55,.95,blue);      // door block mark
   }
   const barBase=part(0,1.95+lift,0,1.5,.16,.54,new T.MeshStandardMaterial({color:'#141b22',roughness:.4,metalness:.3}));
   barBase.name='light-bar-base';
   lamps=['#ff0000','#0033ff'].map((c,i)=>part(i?.42:-.42,2.2+lift,0,.66,.4,.52,new T.MeshStandardMaterial({color:'#03040a',emissive:c,emissiveIntensity:0,roughness:.35})));
   lamps[0].name='lamp-red';lamps[1].name='lamp-blue';
   part(-1.25,1.5+lift,0,.08,.9,1.7,new T.MeshStandardMaterial({color:'#101c23',metalness:.4}));
   part(1.25,1.5+lift,0,.08,.9,1.7,new T.MeshStandardMaterial({color:'#101c23',metalness:.4}));
  }
  scene.add(g);return {g,paint,lamps,stolen:false,speed:0,health:100};
}
export function makeTraffic(scene){const cars=[];for(let i=0;i<64;i++){const c=vehicle(scene,['#d6a12f','#bd5843','#458e9f','#c9c2ab','#435f7a'][i%5]);c.axis=i<32?'z':'x';c.direction=i%2?1:-1;const lane=-48+(Math.floor(i/2)%6)*24+c.direction*2.2,along=-78+(Math.floor(i/12)*31+i%2*13)%156;c.g.position.set(c.axis==='z'?lane:along,.1,c.axis==='z'?along:lane);c.g.rotation.y=c.axis==='x'?c.direction*Math.PI/2:c.direction>0?0:Math.PI;c.speed=3+(i%4);cars.push(c)}cars[0].g.position.set(-46,.1,0);return cars}
export function updateTraffic(cars,dt){for(const c of cars)if(!c.stolen){c.g.position[c.axis]+=c.speed*c.direction*dt;if(c.g.position[c.axis]>86)c.g.position[c.axis]=-86;if(c.g.position[c.axis]<-86)c.g.position[c.axis]=86}}
