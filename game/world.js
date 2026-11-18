import T from './three.js';
export const districts=['Porto Dourado','Centro Velho','Jardim Sul','Ponta Brava'];
export function buildWorld(scene){
 const materials=new Map(),solid=[];
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c)};
 const texture=(kind,base,repeat=8)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);let seed=79;const rand=()=>((seed=seed*16807%2147483647)/2147483647);if(kind==='asphalt'){for(let i=0;i<1900;i++){g.fillStyle=`rgba(${rand()>.5?230:20},${rand()>.5?220:24},${rand()>.5?200:28},${rand()*.22})`;g.fillRect(rand()*256,rand()*256,1+rand()*3,1+rand()*2)}for(let y=24;y<256;y+=64){g.fillStyle='#d6c58e';for(let x=rand()*20;x<256;x+=75)g.fillRect(x,y,36,3)}}else if(kind==='stucco'){for(let i=0;i<900;i++){g.fillStyle=`rgba(65,48,34,${rand()*.12})`;g.fillRect(rand()*256,rand()*256,2+rand()*7,1+rand()*3)}}else if(kind==='tile'){for(let y=0;y<256;y+=24)for(let x=(y/24%2)*20;x<256;x+=40){g.fillStyle=rand()>.5?'#a95643':'#c66c50';g.beginPath();g.ellipse(x,y,20,13,0,Math.PI,Math.PI*2);g.fill();g.strokeStyle='#743d35';g.stroke()}}else if(kind==='water'){for(let i=0;i<90;i++){g.strokeStyle=`rgba(177,224,219,${.12+rand()*.22})`;g.lineWidth=1+rand()*3;g.beginPath();g.moveTo(rand()*256,rand()*256);g.lineTo(rand()*256,rand()*256);g.stroke()}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;return t};
 const box=(x,y,z,w,h,d,c)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='string'?mat(c):c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
 const sign=(text,x,y,z,color='#123d44',width=10)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,512,128);g.fillStyle='#fff2cf';g.textAlign='center';g.font='bold 44px Arial';g.fillText(text,256,83);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));m.position.set(x,y,z);scene.add(m);return m};
  box(0,-.3,0,184,.5,184,new T.MeshStandardMaterial({map:texture('stucco','#a18c64',10),roughness:.96}));const water=box(-96,0,0,48,.08,210,new T.MeshStandardMaterial({color:'#167c9b',map:texture('water','#167c9b',7),roughness:.25,metalness:.3}));water.name='harbour-water';const quay=box(-71,.15,0,2,1.4,184,'#c6a66c');quay.name='quay-wall';box(-68,.12,0,4,.3,184,'#c6a66c');
   // Moored boats at the quay, each with a hull, cabin and rigging. One is a
   // small fishing boat with a derrick arm, two are sailing hulls with masts.
   const boats=[[78,'sail'],[86,'sail'],[94,'fish']];
   boats.forEach(([z,kind],i)=>{
    const hull=box(-80,.5,z,4.4,1.1,9,kind==='fish'?'#d8cba6':'#e5dcc4');hull.name='moored-boat';
    box(-80,1.35,z-2.2,3,.95,3.4,kind==='fish'?'#3d6a4f':'#315a6c');          // cabin
    box(-80,1.95,z-2.2,3.2,.12,3.6,kind==='fish'?'#2c4d3a':'#24485a');         // cabin roof
    box(-76,.3,z,5.4,.22,.22,'#665646');                                      // gunwale rail
    if(kind==='fish'){
     const arm=new T.Mesh(new T.CylinderGeometry(.08,.12,6,8),new T.MeshStandardMaterial({color:'#8a6f4a',roughness:.7}));arm.position.set(-79,3.2,z+3);arm.rotation.z=-.5;arm.name='boat-derrick';arm.castShadow=true;scene.add(arm);
     const winch=new T.Mesh(new T.CylinderGeometry(.35,.35,.5,10),new T.MeshStandardMaterial({color:'#5a6a62',metalness:.4}));winch.rotation.z=Math.PI/2;winch.position.set(-80,1.9,z-3.6);scene.add(winch);
    }else{
     const mast=new T.Mesh(new T.CylinderGeometry(.12,.16,7,8),new T.MeshStandardMaterial({color:'#7a6446',roughness:.7}));mast.position.set(-80,4.4,z+1.6);mast.name='boat-mast';mast.castShadow=true;scene.add(mast);
     const yard=new T.Mesh(new T.CylinderGeometry(.08,.08,4.4,6),new T.MeshStandardMaterial({color:'#7a6446'}));yard.position.set(-80,5.4,z+1.6);yard.rotation.z=Math.PI/2;scene.add(yard);
     const sail=new T.Mesh(new T.PlaneGeometry(.1,3.2),new T.MeshStandardMaterial({color:'#f2ead4',side:T.DoubleSide}));sail.position.set(-80,3.9,z+2.2);sail.name='boat-sail';scene.add(sail);
    }
    const wake=new T.Mesh(new T.RingGeometry(1.3,2.1,20),new T.MeshBasicMaterial({color:'#c6e7df',transparent:true,opacity:.45,side:T.DoubleSide}));wake.rotation.x=-Math.PI/2;wake.position.set(-84,.08,z+2);wake.name='boat-wake';scene.add(wake);
   });
   // Gantry crane straddling the quay, set back in z from the boats, with four
   // legs, a cross girder, a travelling trolley, cable and hook.
   const craneMat=new T.MeshStandardMaterial({color:'#c98a3c',roughness:.6,metalness:.25});
   const crane=new T.Group();crane.name='gantry-crane';
   for(const z of [90,102]){const leg=new T.Mesh(new T.BoxGeometry(.5,7,.5),craneMat);leg.position.set(-66,3.5,z);crane.add(leg);const leg2=new T.Mesh(new T.BoxGeometry(.5,7,.5),craneMat);leg2.position.set(-74,3.5,z);crane.add(leg2);const foot=new T.Mesh(new T.BoxGeometry(1,.4,1),new T.MeshStandardMaterial({color:'#5c6a63'}));foot.position.set(-66,.2,z);crane.add(foot);const foot2=foot.clone();foot2.position.set(-74,.2,z);crane.add(foot2)}
   const girder=new T.Mesh(new T.BoxGeometry(9.4,.6,.8),craneMat);girder.position.set(-70,7.2,96);crane.add(girder);
   const bieam=new T.Mesh(new T.BoxGeometry(.5,.5,15),new T.MeshStandardMaterial({color:'#d8a24a',metalness:.3}));bieam.position.set(-70,7.8,96);crane.add(bieam);
   const trolley=new T.Mesh(new T.BoxGeometry(1.1,.7,1.4),new T.MeshStandardMaterial({color:'#3f4c50'}));trolley.position.set(-70,7.3,95);trolley.name='crane-trolley';crane.add(trolley);
   const cable=new T.Mesh(new T.CylinderGeometry(.06,.06,3.2,6),new T.MeshStandardMaterial({color:'#3b5053'}));cable.position.set(-70,5.6,95);crane.add(cable);
   const hook=new T.Mesh(new T.BoxGeometry(.9,.5,.9),new T.MeshStandardMaterial({color:'#b65b3f'}));hook.position.set(-70,4,95);hook.name='crane-hook';crane.add(hook);
   scene.add(crane);
   // Two container stacks in different colours, each two boxes high.
   const stackColors=['#b65b3f','#367f8d','#c8a94a'];
   const stacks=[[-62,88],[-62,96]];stacks.forEach(([sx,sz],i)=>{const c1=box(sx,1.4,sz,5.4,2.6,4.2,stackColors[i%3]);c1.name='container-stack';const c2=box(sx,4,sz,4.8,2.4,3.8,stackColors[(i+1)%3]);c2.name='container-stack'});

  for(let a=-48;a<=72;a+=24){
    const road=new T.MeshStandardMaterial({color:'#343d44',map:texture('asphalt','#343d44',3),roughness:.96});box(a,.015,0,9,.12,184,road);box(0,.02,a,160,.12,a===72?14:9,road);
   for(const side of [-1,1]){box(a+side*5,.16,0,.45,.3,184,'#9a927e');box(a+side*6.2,.1,0,2,.2,184,'#b58464');}
   // Break the east/west pavements at intersections so kerbs never cross traffic lanes.
   if(a!==72)for(let block=-60;block<=60;block+=24)for(const side of [-1,1]){
    box(block,.16,a+side*5,14,.3,.45,'#9a927e');
    box(block,.1,a+side*6.2,14,.2,2,'#b58464');
   }
   for(let b=-84;b<88;b+=6){if(Math.abs(b%24)>5){box(a,.09,b,.13,.02,2.6,'#d6c080');box(b,.1,a,2.6,.02,.13,'#d6c080')}}
  }
  // The harbour avenue has a broad promenade and a continuous sand verge.
  for(const z of [64,80]){box(0,.12,z,160,.24,2,'#bd916f');box(0,.2,z+(z===64?1:-1),160,.4,.35,'#9b998c');}
  box(0,.02,84,160,.1,5,'#c4a46e');
 let seed=93;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
 for(let x=-60;x<=60;x+=24)for(let z=-60;z<=60;z+=24){
  if((x===-60&&z===12)||(x===36&&z===36))continue;
  const h=5+rand()*10+(x>0&&z<0?6:0),w=12+rand()*3,d=12+rand()*3;
    box(x,.13,z,19,.3,19,'#b99473');box(x,h/2,z,w,h,d,new T.MeshStandardMaterial({color:['#c8ac82','#b57359','#719b99','#b29a59','#b9b5a4'][Math.floor(rand()*5)],map:texture('stucco','#c8ac82',2),roughness:.88}));solid.push({x,z,w:w/2,d:d/2});
   box(x,h+.2,z,w+.7,.4,d+.7,'#eee1c7');box(x,h+.48,z,w+.25,.2,d+.25,'#d3b89a');box(x+2,h+.8,z,3,1.2,3,'#7d918b');
   for(const dx of [-w/2+2,w/2-2])box(x+dx,h+.85,z+d/2-1,1.2,1.3,1.2,'#879992');
   const tank=new T.Mesh(new T.CylinderGeometry(.9,.9,1.3,10),new T.MeshStandardMaterial({color:'#738986',roughness:.75}));tank.position.set(x-2,h+1,z-2);scene.add(tank);const aerial=box(x+4,h+1.8,z+3,.08,2.4,.08,'#43565a');
   if(x%48===0){const aw=box(x,h-2,z+d/2+.6,w*.8,.18,1.1,'#d47556');aw.rotation.x=-.08}
  for(let y=2;y<h-1;y+=2.5)for(let a=-w/2+1.5;a<w/2;a+=2.6){box(x+a,y,z+d/2+.02,1.1,1.25,.08,'#426b73');box(x+w/2+.02,y,z+a,.08,1.25,1.1,'#426b73')}
  if(z===12)sign(x<0?'CASA DO SOL':'VALE & CO',x,2.5,z+d/2+.12,'#254e50',w-1);
 }
  box(-60,1,12,10,2,8,'#e3b36b');box(-60,3.2,12,13,.4,11,'#ca745d');sign('PORTO MARKET',-60,3,17.6,'#1d6467',12);
  for(let i=0;i<7;i++){const column=box(-66+i*2,2,11, .35,4.2,.35,'#f1d7ae');column.position.z=8.2;const arch=box(-66+i*2,4.1,8.2,2,.35,.45,'#bc7855')}
 box(36,.3,36,19,.5,19,'#c6d5aa');box(36,4,36,4,8,4,'#f0dec1');box(36,8.6,36,6,1,6,'#cb875f');
 for(const x of [-61,-39]){box(x,8,66,1.1,16,1.1,'#dca44a');box(x,16,60,1,1,17,'#dca44a');box(x,12,53,.12,7,.12,'#283e45')}
  sign('PORT AUTHORITY',-50,9,69,'#224e59',23);for(let i=0;i<7;i++){const cable=new T.Mesh(new T.CylinderGeometry(.035,.035,20,5),new T.MeshStandardMaterial({color:'#3b5053'}));cable.position.set(-61+i*3.5,12.2,63);cable.rotation.z=Math.PI/2;scene.add(cable)}
 for(let z=-78;z<84;z+=12){box(-69,2,z,.4,4,.4,'#80674d');for(let k=0;k<5;k++){const leaf=box(-69,4.3,z,4.7,.18,1,'#397854');leaf.rotation.y=k*Math.PI/5;leaf.rotation.z=.18}box(-65,.5,z+4,2,1,.6,'#99734c')}
  for(let x=-48;x<=48;x+=24)for(let z=-48;z<=48;z+=24){box(x+5,2.4,z+5,.15,4.8,.15,'#32464a');box(x+5,4.8,z+4.2,.7,1.4,.6,'#263d43');const head=box(x+5,4.9,z+3.88,.35,.35,.08,new T.MeshStandardMaterial({color:'#edb85a',emissive:'#edb85a',emissiveIntensity:.45}));for(let a=-3;a<=3;a+=1.5)box(x+a,.11,z+7,.65,.02,2,'#e9e1c7');if(x<24&&z<24){const bench=box(x-3,.65,z+5,2.8,.16,.65,'#936c4e');for(const bx of [-1,1])box(x-3+bx,.35,z+5,.12,.55,.12,'#344b50');box(x+2,.55,z+6,.65,1,.65,'#3d7967')}}
  for(let x=-48;x<=48;x+=24)for(let z=-48;z<=48;z+=24){for(const side of [-1,1]){const pole=box(x+side*6,3.3,z+5,.12,6.6,.12,'#465a59');const arm=box(x+side*6,6.4,z+3,.12,.12,4,'#465a59');const lamp=new T.Mesh(new T.SphereGeometry(.28,8,6),new T.MeshStandardMaterial({color:'#ffe7a4',emissive:'#e6b95f',emissiveIntensity:.7}));lamp.position.set(x+side*6,6.25,z+1.2);scene.add(lamp)}}
  for(const z of [-2,22]){const signal=box(8,3,z,.22,5,.22,'#36494b');for(let i=0;i<3;i++){const light=new T.Mesh(new T.SphereGeometry(.22,8,6),new T.MeshStandardMaterial({color:['#eb5147','#e8c44d','#4ebc77'][i],emissive:['#eb5147','#e8c44d','#4ebc77'][i],emissiveIntensity:.65}));light.position.set(8,4.5-i*.75,z+.18);scene.add(light)}}
  box(57,.2,48,12,.4,12,'#79a8a2');sign('NICO / MOTOR WORKS',59,4,52,'#215b5b',14);
  const sunDisc=new T.Mesh(new T.SphereGeometry(7,16,12),new T.MeshBasicMaterial({color:'#ffe9a3'}));sunDisc.position.set(-85,63,-115);sunDisc.name='sky-sun';scene.add(sunDisc);for(let i=0;i<6;i++){const cloud=new T.Group();for(let j=0;j<4;j++){const puff=new T.Mesh(new T.SphereGeometry(2+((i+j)%2),8,6),new T.MeshBasicMaterial({color:'#f3f1dd',transparent:true,opacity:.72}));puff.position.set(j*2.5,Math.sin(j)*.6,0);cloud.add(puff)}cloud.position.set(-66+i*26,48+(i%3)*5,-106+(i%2)*24);cloud.name='sky-cloud';scene.add(cloud)}
 const ramp=box(-48,.8,61,6,.5,7,'#ba8956');ramp.rotation.x=-.23;sign('COURIER / E',-61,3,53,'#28515c',9);
 const blocked=(x,z,r=.7)=>solid.some(b=>Math.abs(x-b.x)<b.w+r&&Math.abs(z-b.z)<b.d+r);
 const occluded=(x,z,tx,tz)=>{const n=Math.ceil(Math.hypot(tx-x,tz-z));for(let i=1;i<n;i++)if(blocked(x+(tx-x)*i/n,z+(tz-z)*i/n,0))return true;return false};
  return {box,sign,blocked,occluded,districtAt:(x,z)=>z>24?'Porto Dourado':x>12?'Centro Velho':z< -24?'Ponta Brava':'Jardim Sul',animate(time){water.material.map.offset.x=time*.001;water.material.map.offset.y=time*.0006;scene.children.filter(o=>o.name==='boat-wake').forEach((o,i)=>{o.material.opacity=.26+Math.sin(time*.001+i)*.12;o.scale.setScalar(1+((time*.0003+i)%1)*.4)})}};
}
