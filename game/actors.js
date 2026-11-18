import T from './three.js';
export function person(scene,color='#d7b354'){
 const p=new T.Group();const part=(x,y,z,w,h,d,c)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:c}));b.position.set(x,y,z);b.castShadow=true;p.add(b);return b};
  const torso=part(0,1.05,0,.65,.75,.4,color);torso.material.roughness=.78;part(0,.78,.01,.61,.22,.42,'#d8c6a5');part(0,1.68,0,.4,.42,.4,'#bd8b68');part(0,1.93,0,.48,.12,.45,'#263e45');
  const legs=[part(-.19,.35,0,.23,.7,.28,'#35515c'),part(.19,.35,0,.23,.7,.28,'#35515c')],arms=[part(-.45,1,0,.2,.65,.22,'#bd8b68'),part(.45,1,0,.2,.65,.22,'#bd8b68')];scene.add(p);p.userData.legs=legs;p.userData.arms=arms;return p;
}
export function makeActors(scene){const a=[];for(let i=0;i<96;i++){const x=i<24?-54:-42+(i%5)*24,z=-78+(i*13)%156,p=person(scene,['#d67760','#e8c775','#72a8aa','#f0dec0'][i%4]);p.position.set(x,0,z);a.push({p,homeX:x,homeZ:z,phase:i,axis:'z'})}return a}
export function walkActors(people,time){for(const a of people){const along=Math.sin(time*.35+a.phase)*4;a.p.position.set(a.homeX+(a.axis==='x'?along:0),.2,a.homeZ+(a.axis==='z'?along:0));a.p.rotation.y=(a.axis==='x'?Math.PI/2:0)+(Math.cos(time*.35+a.phase)>0?0:Math.PI);a.p.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(time*5+a.phase+i*Math.PI)*.4);a.p.userData.arms.forEach((l,i)=>l.rotation.x=Math.sin(time*5+a.phase+(i?Math.PI:0))*.28)}}
