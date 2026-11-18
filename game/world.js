import T from './three.js';
export const districts=['Porto Dourado','Centro Velho','Jardim Sul','Ponta Brava'];
export function buildWorld(scene){
 const materials=new Map(),solid=[];
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c)};
 const box=(x,y,z,w,h,d,c)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='string'?mat(c):c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
 const sign=(text,x,y,z,color='#123d44',width=10)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,512,128);g.fillStyle='#fff2cf';g.textAlign='center';g.font='bold 44px Arial';g.fillText(text,256,83);const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));m.position.set(x,y,z);scene.add(m);return m};
  box(0,-.3,0,184,.5,184,'#a18c64');const water=box(-96,0,0,48,.08,210,new T.MeshStandardMaterial({color:'#167c9b',roughness:.25,metalness:.35}));water.name='harbour-water';const quay=box(-71,.15,0,2,1.4,184,'#c6a66c');quay.name='quay-wall';box(-68,.12,0,4,.3,184,'#c6a66c');
  for(const z of [38,51,64]){const hull=box(-78,.45,z,4,1,8,'#e5dcc4');hull.name='moored-boat';box(-78,1.25,z-1,2.8,.9,3,'#315a6c');box(-74,.25,z,5,.2,.2,'#665646');}
  for(const z of [43,49])box(-64,1.3,z,5,2.6,4,z===43?'#b65b3f':'#367f8d');
  for(let a=-48;a<=72;a+=24){
   box(a,.015,0,9,.12,184,'#343d44');box(0,.02,a,160,.12,a===72?14:9,'#343d44');
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
   box(x,.13,z,19,.3,19,'#b99473');box(x,h/2,z,w,h,d,['#c8ac82','#b57359','#719b99','#b29a59','#b9b5a4'][Math.floor(rand()*5)]);solid.push({x,z,w:w/2,d:d/2});
  box(x,h+.2,z,w+.7,.4,d+.7,'#eee1c7');box(x+2,h+.8,z,3,1.2,3,'#7d918b');
  for(let y=2;y<h-1;y+=2.5)for(let a=-w/2+1.5;a<w/2;a+=2.6){box(x+a,y,z+d/2+.02,1.1,1.25,.08,'#426b73');box(x+w/2+.02,y,z+a,.08,1.25,1.1,'#426b73')}
  if(z===12)sign(x<0?'CASA DO SOL':'VALE & CO',x,2.5,z+d/2+.12,'#254e50',w-1);
 }
 box(-60,1,12,10,2,8,'#e3b36b');box(-60,3.2,12,13,.4,11,'#ca745d');sign('PORTO MARKET',-60,3,17.6,'#1d6467',12);
 box(36,.3,36,19,.5,19,'#c6d5aa');box(36,4,36,4,8,4,'#f0dec1');box(36,8.6,36,6,1,6,'#cb875f');
 for(const x of [-61,-39]){box(x,8,66,1.1,16,1.1,'#dca44a');box(x,16,60,1,1,17,'#dca44a');box(x,12,53,.12,7,.12,'#283e45')}
 sign('PORT AUTHORITY',-50,9,69,'#224e59',23);
 for(let z=-78;z<84;z+=12){box(-69,2,z,.4,4,.4,'#80674d');for(let k=0;k<5;k++){const leaf=box(-69,4.3,z,4.7,.18,1,'#397854');leaf.rotation.y=k*Math.PI/5;leaf.rotation.z=.18}box(-65,.5,z+4,2,1,.6,'#99734c')}
 for(let x=-48;x<=48;x+=24)for(let z=-48;z<=48;z+=24){box(x+5,2.4,z+5,.15,4.8,.15,'#32464a');box(x+5,4.8,z+4.2,.7,1.4,.6,'#263d43');box(x+5,4.9,z+3.88,.35,.35,.08,'#edb85a');for(let a=-3;a<=3;a+=1.5)box(x+a,.11,z+7,.65,.02,2,'#e9e1c7')}
 box(57,.2,48,12,.4,12,'#79a8a2');sign('NICO / MOTOR WORKS',59,4,52,'#215b5b',14);
 const ramp=box(-48,.8,61,6,.5,7,'#ba8956');ramp.rotation.x=-.23;sign('COURIER / E',-61,3,53,'#28515c',9);
 const blocked=(x,z,r=.7)=>solid.some(b=>Math.abs(x-b.x)<b.w+r&&Math.abs(z-b.z)<b.d+r);
 const occluded=(x,z,tx,tz)=>{const n=Math.ceil(Math.hypot(tx-x,tz-z));for(let i=1;i<n;i++)if(blocked(x+(tx-x)*i/n,z+(tz-z)*i/n,0))return true;return false};
 return {box,sign,blocked,occluded,districtAt:(x,z)=>z>24?'Porto Dourado':x>12?'Centro Velho':z< -24?'Ponta Brava':'Jardim Sul'};
}
