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

  /* The crew (S4). Six members including the user, who is added by the screen. Fictional first names from several regions. */
  crew: {
    name: 'Northgate Orbit',
    nextMeetup: { place: 'City Library, room 2', when: 'Thursday 6 pm', hours: 1.5, note: 'A public place, open to everyone' },
    members: [
      { id: 'priya', name: 'Priya', color: 'violet',  line: 'Keeps the timer and the snacks' },
      { id: 'tomas', name: 'Tom\u00e1s', color: 'teal',    line: 'Brings the paper and the pens' },
      { id: 'amara', name: 'Amara', color: 'magenta', line: 'Asks the good questions' },
      { id: 'mei',   name: 'Mei',   color: 'sky',     line: 'Always early, always prepared' },
      { id: 'kofi',  name: 'Kofi',  color: 'ember',   line: 'Makes the quiet ones laugh' }
    ],
    past: [
      { when: 'Thursday last week, 6 pm',  place: 'City Library, room 2',      note: 'Timed practice, then tea. 5 of 6 came.' },
      { when: 'Saturday, two weeks ago',   place: 'Riverside Park, by the bandstand', note: 'A walk and talk. Everyone came.' },
      { when: 'Thursday, three weeks ago', place: 'Old Market caf\u00e9, long table', note: 'First meet-up. We set the plan together.' }
    ],
    /* Signals: invites only a person can open. */
    signalsIn: [
      { id: 's1', from: 'tomas', plan: 'Study table at City Library, Saturday 10 am', note: 'Bring one thing you got wrong this week and we will fix it together.' },
      { id: 's2', from: 'amara', plan: 'Cook lunch at Northgate Community Kitchen, Sunday 12 pm', note: 'I will bring the rice. You bring one vegetable.' }
    ],
    plans: [
      { id: 'p1', text: 'Study table at City Library, Saturday 10 am' },
      { id: 'p2', text: 'Walk and talk in Riverside Park, Sunday 4 pm' },
      { id: 'p3', text: 'Practice hour at the University Quarter hub, Wednesday 7 pm' }
    ],
    reportReasons: ['Made me feel unsafe', 'Pushed or pressured me', 'Pretending to be someone else', 'Something else']
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


/* The Star Map (S3, S9). Harbour City is fictional. Clusters of fewer than 5 people are never drawn and never counted on screen. */
C.data.map = {
  /* A jittered 4 x 4 grid of corner points makes nine neighbourhoods (3 x 3 cells). */
  grid: [
    [[14, 22],  [122, 12],  [238, 24],  [346, 14]],
    [[10, 142], [118, 132], [234, 146], [350, 136]],
    [[16, 266], [126, 278], [230, 262], [344, 272]],
    [[12, 386], [124, 394], [236, 384], [348, 392]]
  ],
  hoods: [
    { id: 'hillside',    name: 'Hillside',           cell: [0, 0] },
    { id: 'northgate',   name: 'Northgate',          cell: [0, 1] },
    { id: 'eastfield',   name: 'Eastfield',          cell: [0, 2] },
    { id: 'university',  name: 'University Quarter', cell: [1, 0] },
    { id: 'oldmarket',   name: 'Old Market',         cell: [1, 1] },
    { id: 'riverside',   name: 'Riverside',          cell: [1, 2] },
    { id: 'westdock',    name: 'Westdock',           cell: [2, 0] },
    { id: 'harbourfront', name: 'Harbourfront',      cell: [2, 1] },
    { id: 'docklands',   name: 'Docklands',          cell: [2, 2] }
  ],
  home: { hood: 'northgate', dx: 14, dy: 38 }, /* where the soft ring sits: a rough area, never a pin */

  /* people: only those set to Visible are ever named. count includes everyone else (counted only). */
  clusters: [
    { id: 'c1',  goal: 'exam',       hood: 'northgate',  count: 22, dx: -30, dy: -12, women: false, people: [
      ['Sofia', 'Chemistry final in March'], ['Kenji', 'Entrance exam in June'], ['Lena', 'Nursing board exam'], ['Mateo', 'Maths resit'], ['Ngozi', 'Accountancy part 2']] },
    { id: 'c2',  goal: 'code',       hood: 'northgate',  count: 9,  dx: 34,  dy: 2,   women: false, people: [
      ['Dmitri', 'First small web page'], ['Aisha', 'Loops and lists'], ['Carlos', 'Moving from spreadsheets']] },
    { id: 'c3',  goal: 'language',   hood: 'oldmarket',  count: 31, dx: 0,   dy: -18, women: false, people: [
      ['Hana', 'Spanish, beginner'], ['Jonas', 'English, speaking'], ['Fatima', 'French for work'], ['Ravi', 'Japanese, beginner'], ['Ines', 'German, intermediate'], ['Olu', 'Portuguese, beginner']] },
    { id: 'c4',  goal: 'job',        hood: 'university', count: 46, dx: -8,  dy: -22, women: false, people: [
      ['Yuki', 'First graduate role'], ['Anil', 'Career change into design'], ['Zainab', 'Interview next week'], ['Marco', 'Returning after a break'], ['Chiara', 'Product roles'], ['Tunde', 'Public sector roles']] },
    { id: 'c5',  goal: 'code',       hood: 'university', count: 58, dx: 30,  dy: 30,  women: false, people: [
      ['Nikhil', 'Data basics'], ['Elena', 'First app'], ['Samir', 'Learning by building'], ['Britt', 'Back-end curious'], ['Kwame', 'Open source starter']] },
    { id: 'c6',  goal: 'fit',        hood: 'riverside',  count: 27, dx: -4,  dy: -26, women: false, people: [
      ['Gabriel', 'Couch to 5 km'], ['Mina', 'Weekend cycling'], ['Oskar', 'Swim twice a week'], ['Leila', 'Walking group'], ['Pedro', 'Park run club']] },
    { id: 'c7',  goal: 'instrument', hood: 'riverside',  count: 8,  dx: 18,  dy: 36,  women: false, people: [
      ['Anya', 'Piano, grade 3 piece'], ['Tariq', 'Acoustic guitar'], ['Noor', 'Violin, restarting']] },
    { id: 'c8',  goal: 'exam',       hood: 'hillside',   count: 12, dx: 8,   dy: 6,   women: false, people: [
      ['Ayo', 'Medical school entry'], ['Freya', 'Architecture exam'], ['Bilal', 'Civil service test'], ['Mei Ling', 'Language certificate']] },
    { id: 'c9',  goal: 'cook',       hood: 'harbourfront', count: 19, dx: 0, dy: 0,   women: false, people: [
      ['Giulia', 'Bread from scratch'], ['Kofi A.', 'Weeknight stews'], ['Sana', 'Cooking for one'], ['Luis', 'No more takeaways'], ['Wren', 'Preserving and pickling']] },
    { id: 'c10', goal: 'language',   hood: 'eastfield',  count: 7,  dx: 0,   dy: 4,   women: false, people: [
      ['Petra', 'Swedish, beginner'], ['Idris', 'Arabic, speaking'], ['Thuy', 'English for nursing']] },
    /* Women-only clusters: shown only in the women-only view, and only women are listed. */
    { id: 'w1',  goal: 'exam',       hood: 'northgate',  count: 10, dx: -6,  dy: 14,  women: true,  people: [
      ['Aisha R.', 'Medical entrance'], ['Hana K.', 'Law finals'], ['Ines', 'Architecture exam'], ['Tamsin', 'Teaching qualification']] },
    { id: 'w2',  goal: 'job',        hood: 'westdock',   count: 11, dx: 0,   dy: 0,   women: true,  people: [
      ['Zainab', 'Returning to work'], ['Yuki', 'Engineering roles'], ['Ngozi', 'Interview practice'], ['Marta', 'First management role']] },
    { id: 'w3',  goal: 'fit',        hood: 'hillside',   count: 16, dx: -10, dy: -8,  women: true,  people: [
      ['Amani', 'Trail walking'], ['Sigrid', 'Evening runs'], ['Dalia', 'Strength basics'], ['Rosa', 'Swim club']] },
    { id: 'w4',  goal: 'cook',       hood: 'oldmarket',  count: 9,  dx: 0,   dy: 24,  women: true,  people: [
      ['Aiko', 'Dumplings from scratch'], ['Beatriz', 'Family stews'], ['Nadia', 'Baking basics']] }
  ],

  /* Pre-written human messages, by goal. w picks a speaker from the cluster's named people (w mod number of names). */
  chat: {
    exam: [
      [0, 'Anyone doing past papers this week? I am stuck on timing, not the content.'],
      [1, 'Same. I set a kitchen timer and it helped a lot, strange but true.'],
      [2, 'Library room 2 is free on Thursday evening if people want a table.'],
      [3, 'I will come. Plain pen, no laptop. I want to practise how the real day feels.'],
      [0, 'That is the whole point for me too. Two hours with no phone on the table.'],
      [2, 'Can someone who has sat this exam say how the last half hour felt?'],
      [1, 'Rushed. Read the questions twice at the start, it saves time later.']
    ],
    language: [
      [0, 'Looking for someone to talk to for twenty minutes a week. Slowly, with no translating.'],
      [1, 'Same. I can do greetings and food. I get nervous past that.'],
      [2, 'There is a swap on Saturday morning. Table by the window.'],
      [3, 'I will come. I can help with English if you help with my pronunciation.'],
      [1, 'Nervous is normal. The first ten minutes are the worst, then it gets easier.'],
      [0, 'I wrote ten sentences by hand yesterday. Very bad handwriting, very proud.'],
      [2, 'Bring them on Saturday and we will read each other\u2019s.']
    ],
    instrument: [
      [0, 'Does anyone else\u2019s hands forget everything the second someone is listening?'],
      [1, 'Every time. I play well for an empty room and freeze in front of two people.'],
      [2, 'Let us fix that. One short piece each, for the group, on Sunday.'],
      [0, 'Scary but yes. I will play my one good song.'],
      [1, 'The community hall has a free room for an hour. No recording, just us.'],
      [2, 'Tuning by ear only. Deal?'],
      [0, 'Deal.']
    ],
    job: [
      [0, 'I have an interview next week and I have not talked about my work out loud in months.'],
      [1, 'Happy to be your first interviewer. Fifteen minutes, three questions.'],
      [2, 'I will go after you. I want to answer without my notes.'],
      [0, 'I always read from my notes. I wonder what happens if I do not.'],
      [1, 'You pause, the pause feels huge, and then you carry on. That is all.'],
      [3, 'Thursday evening at the study hub works for me.'],
      [2, 'Same. People only, no scripts open.']
    ],
    code: [
      [0, 'Stuck on loops for two days. Not after the answer, just a person to talk it through.'],
      [1, 'Explain it out loud to me. Half the time the problem is in the explaining.'],
      [2, 'There is a table at the hub on Wednesday. Paper first, keyboards later.'],
      [0, 'Paper first? Honestly yes. I never plan before typing.'],
      [1, 'We tried it last week. Drawing the steps took ten minutes and saved an hour.'],
      [2, 'Count me in. I will bring graph paper.'],
      [3, 'I will bring snacks. Brains need them.']
    ],
    cook: [
      [0, 'Made bread from scratch for the first time. It was a brick. A tasty brick.'],
      [1, 'The first loaf is always a brick. Mine could have been a doorstop.'],
      [2, 'Anyone want to cook together on Sunday? Soup or stew, whatever people can bring.'],
      [0, 'I will bring onions and a big pot.'],
      [1, 'My neighbour taught me her stew. Three hours and no recipe.'],
      [2, 'That is the one I want. Can we do that one?'],
      [1, 'I will ask her. She loves an audience.']
    ],
    fit: [
      [0, 'Run club on Saturday, 8 am by the bandstand. There is a slow group too.'],
      [1, 'Slow is the only pace I have. See you there.'],
      [2, 'First time showing up anywhere new on my own. A bit nervous.'],
      [0, 'We will walk the first lap together. Look for the red cap.'],
      [3, 'Does anyone want to do the library stairs after? Short but brutal.'],
      [1, 'Yes. Then tea.'],
      [2, 'Tea is the real goal.']
    ]
  },
  chatTimes: ['6:02 pm', '6:05 pm', '6:11 pm', '6:14 pm', '6:20 pm', '6:31 pm', '6:40 pm'],

  /* Shooting Star: public, member-hosted activities. offset = minutes from the demo clock; all within 2 hours. */
  activities: [
    { id: 'a1', title: 'Library study table',    place: 'City Library, ground floor table', host: 'Priya',  offset: 15,  going: 6 },
    { id: 'a2', title: 'Park run club',          place: 'Riverside Park, by the bandstand', host: 'Gabriel', offset: 30, going: 14 },
    { id: 'a3', title: 'Language swap',          place: 'The Blue Door caf\u00e9, Old Market', host: 'Hana', offset: 55, going: 9 },
    { id: 'a4', title: 'Chess table',            place: 'Old Market square, stone tables',  host: 'Dmitri', offset: 80, going: 5 },
    { id: 'a5', title: 'Community kitchen shift', place: 'Northgate Community Kitchen',     host: 'Amara',  offset: 105, going: 11 }
  ]
};
