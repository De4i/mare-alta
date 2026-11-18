import {boot} from './simulation.js';
import {ROLES, fresh} from './save.js';
import {defaults, loadSettings} from './render.js';
import {spreadFor, damageFor} from './combat.js';

// Composition root. boot() owns the mutable game state; this module only reads
// that state and attaches the cross-cutting pieces (role perks, graphics
// settings and the police air/roadblock references) to one window handle.
const game=boot();

// Role perks are derived from the single ROLES table, never duplicated.
const perks={
  table:ROLES,
  for:(role=game.state.role)=>({...(ROLES[role]||ROLES.COURIER),spread:spreadFor(game.state.attributes?.aim??1),damage:damageFor(game.state.attributes?.aim??1)}),
  maxHealth:(s=game.state)=>80+(s.attributes?.endurance??1)*10,
  maxArmour:(s=game.state)=>(s.attributes?.endurance??1)*10,
  sprint:(s=game.state)=>(ROLES[s.role]||ROLES.COURIER).sprint*(1+(s.attributes?.endurance??1)*.05),
};

// Graphics settings live in render.js; re-expose them without a second copy.
const settings={defaults,current:loadSettings};

// The helicopter and roadblock are created in police.js and reached through the
// live police system, so there is exactly one instance of each.
const policeSystem=game.qa.police;
const police={
  get units(){return policeSystem.units},
  get helicopter(){return policeSystem.helicopter},
  get rotor(){return policeSystem.rotor},
  get roadblock(){return policeSystem.roadblock},
  wanted:()=>game.qa.wanted(),
};

window.mareAlta=Object.assign(game,{perks,settings,police,roles:ROLES,newRun:(role='COURIER')=>game.start(fresh(role))});
