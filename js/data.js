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
  ],

  city: { name: 'Harbour City' },

  /* Section 5. icon: key into C.ui.icons. */
  goals: [
    { id: 'exam',       label: 'Pass a big exam',       icon: 'exam' },
    { id: 'language',   label: 'Learn a language',      icon: 'language' },
    { id: 'instrument', label: 'Play an instrument',    icon: 'instrument' },
    { id: 'job',        label: 'Land a job',            icon: 'job' },
    { id: 'code',       label: 'Learn to code',         icon: 'code' },
    { id: 'cook',       label: 'Cook from scratch',     icon: 'cook' },
    { id: 'fit',        label: 'Get fit with others',   icon: 'fit' }
  ],

  visibility: [
    { id: 'hidden',  label: 'Hidden',       line: 'Nobody sees you on the Star Map. You can still look around.' },
    { id: 'counted', label: 'Counted only', line: 'You add to a cluster\u2019s count. Your name and goal stay private.' },
    { id: 'visible', label: 'Visible',      line: 'People in a cluster see your first name and your goal.' }
  ],

  /* The four stats. cls picks the colour in CSS; the label and icon carry the meaning too. */
  stats: [
    { id: 'relating',    label: 'Relating',    cls: 'relating',    icon: 'relating',    line: 'Being with people' },
    { id: 'doing',       label: 'Doing',       cls: 'doing',       icon: 'doing',       line: 'Making and working things out' },
    { id: 'thinking',    label: 'Thinking',    cls: 'thinking',    icon: 'thinking',    line: 'Forming your own view' },
    { id: 'persevering', label: 'Persevering', cls: 'persevering', icon: 'persevering', line: 'Staying with the hard part' }
  ],

  /* The Awakening: four short agent-free tasks. All content is fixed and checked by the page, not generated. */
  awakening: {
    banner: 'Put your agent away. This one is just you.',
    thinking: {
      prompt: 'Should a city close its centre to cars one day a month? Give your own view in three lines.',
      lines: 3
    },
    doing: {
      prompt: 'Three sums, in your head. No phone, no paper.',
      questions: [
        { text: '38 + 47', answer: 85 },
        { text: '9 \u00d7 8',  answer: 72 },
        { text: '150 \u2212 68', answer: 82 }
      ]
    },
    persevering: {
      prompt: 'A snail climbs a 10 m well. Each day it climbs 3 m, and each night it slips back 2 m. On which day does it get out?',
      answer: 8,
      hint: 'Look at the last day on its own. Does the snail slip back once it is out?',
      holdSeconds: 30
    },
    relating: {
      prompt: 'Rate how true each line is for you. 1 is not at all, 5 is completely.',
      statements: [
        'Last week I had a real conversation without my agent in the middle.',
        'Before asking my agent, I asked another person for help.',
        'In the last month I made a plan with someone and kept it in person.'
      ]
    }
  },

  /* Next crew meet-up shown on Home. The Crew screen (M3) fills in the rest of the crew. */
  crew: {
    name: 'Northgate Orbit',
    nextMeetup: { place: 'City Library, room 2', when: 'Thursday 6 pm' }
  },

  /* Items in the More sheet on Home (Section 4). */
  more: [
    { label: 'Earth Archive',      note: 'How people looked after themselves', route: 'archive' },
    { label: 'Light Exchange',     note: 'Teach an hour, learn an hour',       route: 'exchange' },
    { label: 'Missions',           note: 'This week, with other people',       route: 'missions' },
    { label: 'Constellation',      note: 'Everyone you have met or taught',    route: 'constellation' },
    { label: 'Night Watch',        note: 'Quiet late-night rooms',             route: 'shield' },
    { label: 'Privacy & settings', note: 'What Constella knows about you',     route: 'privacy' }
  ]
};
