/* Constella prototype: demo data. Plain script, no modules. Everything here is fictional. */
window.C = window.C || {};

C.data = {
  /* Every screen the router knows. tab: which bottom tab it belongs to ('' = none).
     chrome: false hides the tab bar (full-bleed screens). */
  routes: [
    { id: 'welcome',      code: 'S0',  label: 'Welcome',            tab: '',       chrome: false },
    { id: 'onboarding',   code: 'S1',  label: 'Onboarding',         tab: '',       chrome: false },
    { id: 'home',         code: 'S2',  label: 'Home: Status Window', tab: 'home',   chrome: true },
    { id: 'map',          code: 'S3',  label: 'Star Map',           tab: 'map',    chrome: true },
    { id: 'crew',         code: 'S4',  label: 'Crew',               tab: 'crew',   chrome: true },
    { id: 'train',        code: 'S5',  label: 'Train',              tab: 'train',  chrome: true },
    { id: 'orbits',       code: 'S6',  label: 'Orbits and Simulators', tab: 'train', chrome: true },
    { id: 'shield',       code: 'S7',  label: 'Shield',             tab: 'shield', chrome: true },
    { id: 'archive',      code: 'S8',  label: 'Earth Archive',      tab: '',       chrome: true },
    { id: 'shootingstar', code: 'S9',  label: 'Shooting Star',      tab: 'map',    chrome: true },
    { id: 'exchange',     code: 'S10', label: 'Light Exchange',     tab: '',       chrome: true },
    { id: 'missions',     code: 'S11', label: 'Landing Missions',   tab: '',       chrome: true },
    { id: 'constellation', code: 'S12', label: 'Constellation and ranks', tab: '', chrome: true },
    { id: 'privacy',      code: 'S13', label: 'Privacy and settings', tab: '',     chrome: true }
  ],

  tabs: [
    { id: 'home',   label: 'Home',   route: 'home' },
    { id: 'map',    label: 'Map',    route: 'map' },
    { id: 'crew',   label: 'Crew',   route: 'crew' },
    { id: 'train',  label: 'Train',  route: 'train' },
    { id: 'shield', label: 'Shield', route: 'shield' }
  ],

  /* Prototype values: not final rules. */
  ranks: [
    { id: 'stardust',  name: 'Stardust',  xp: 0 },
    { id: 'nebula',    name: 'Nebula',    xp: 200 },
    { id: 'protostar', name: 'Protostar', xp: 600 },
    { id: 'star',      name: 'Star',      xp: 1500 },
    { id: 'supernova', name: 'Supernova', xp: 3000, teachingHours: 5 }
  ]
};
