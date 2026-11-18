const KEY='mare-alta-save-v1';
export function fresh(){return {x:-48,z:0,health:100,armour:50,cash:650,ammo:18,clip:18,reserve:144,reloading:0,wanted:0,mission:0,stage:0,missions:[],activities:0,collect:0,collected:[],kills:0,shots:0,stunts:0,distance:0,radio:0,volume:.35,vehicle:false,upgrades:{engine:0,armor:0,paint:0},tutorial:0}}
export function store(s){localStorage.setItem(KEY,JSON.stringify({...s,vehicle:false,reloading:0}))}
export function restore(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&typeof s==='object'?{...fresh(),...s}:null}catch{return null}}
export function hasSave(){return !!restore()}
