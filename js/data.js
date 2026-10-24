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
    { id: 'nightwatch',   code: 'S7b', label: 'Night Watch',        tab: 'shield', chrome: true },
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
    { label: 'Night Watch',        note: 'Quiet late-night rooms',             route: 'nightwatch' },
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


/* Training (S5, S6). All content is fixed and written by hand; nothing is generated. Fictional names only.
   Demo timers are shortened and always labelled "demo speed" on screen. */
C.data.train = {
  quest: {
    demoSeconds: 30,
    realMinutes: 5,
    /* One 5-minute agent-free rep per goal. */
    reps: {
      exam:       'Close the book. Write down everything you remember about one topic, then check what you missed.',
      language:   'Say five sentences out loud in your language, about your day. No translating, no apps.',
      instrument: 'Play one short piece from memory, slowly, with no tuner and no backing track.',
      job:        'Out loud, describe one thing you did at work or study in three sentences, with no notes.',
      code:       'On paper, draw the steps of a small program in boxes and arrows before you type anything.',
      cook:       'Write a meal for tonight from what is in your kitchen, then work out the steps in order.',
      fit:        'Do ten minutes of moves you know by heart. Count your own reps and rest on your own clock.'
    },
    fallback: 'Pick one thing you are learning and do it for five minutes with your agent put away.',
    /* The stat a quest nudges, by the type of rep (Section 7): working something out in your head is Thinking,
       making or doing it with your hands and body is Doing. */
    stat: { exam: 'thinking', language: 'thinking', code: 'thinking', job: 'thinking', instrument: 'doing', cook: 'doing', fit: 'doing' }
  },

  /* Solo Flights. stat: which stat the XP nudges. mark: the pre-written peer mark that arrives in the demo. */
  flights: {
    demoSeconds: 15,
    skills: [
      { id: 'handwriting', label: 'Handwriting',  stat: 'doing',    realMinutes: 10, mark: 71,
        task: 'Copy a paragraph from a book onto paper, in your neatest hand, with a pen.' },
      { id: 'maths',       label: 'Mental maths', stat: 'thinking', realMinutes: 10, mark: 78,
        task: 'Work out twenty sums in your head and write only the answers on paper.' },
      { id: 'map',         label: 'Map reading',  stat: 'doing',    realMinutes: 10, mark: 66,
        task: 'Sketch the route from home to the library from memory, with three landmarks.' },
      { id: 'language',    label: 'A language',   stat: 'thinking', realMinutes: 10, mark: 74,
        task: 'Write ten sentences in the language you are learning, without looking anything up.' }
    ],
    markers: ['Tomás', 'Mei']
  },

  /* Star Charts: three chapters of three questions. Hints are plain nudges; the answer is shown last. */
  chapters: [
    {
      id: 'ch1', title: 'Everyday numbers', topic: 'Mental maths',
      author: 'Priya', reviewers: ['Tomás', 'Mei'], licence: 'CC BY 4.0',
      intro: 'Three questions you can do in your head.',
      questions: [
        { id: 'ch1q1', text: 'A shirt costs 40. It is 25% off. What is the new price?', answer: '30',
          hints: ['Find a quarter of 40 first.', 'A quarter of 40 is 10.', 'Take that 10 away from 40.'] },
        { id: 'ch1q2', text: 'A bill of 96 is split equally between 8 people. How much does each person pay?', answer: '12',
          hints: ['Halving three times is the same as dividing by 8.', '96 halved is 48, and 48 halved is 24.', '24 halved is 12.'] },
        { id: 'ch1q3', text: 'A train leaves at 9:45 and the trip takes 2 hours 30 minutes. When does it arrive?', answer: '12:15',
          hints: ['Add the hours first.', '9:45 plus 2 hours is 11:45.', 'Now add 30 minutes to 11:45.'] }
      ]
    },
    {
      id: 'ch2', title: 'The lighthouse', topic: 'Reading recall',
      author: 'Amara', reviewers: ['Kofi', 'Priya'], licence: 'CC BY-SA 4.0',
      intro: 'Read the short passage once. It hides when you start, so you answer from memory.',
      passage: 'Mira kept the lighthouse on Gull Rock for nine winters. Every evening at dusk she climbed the 112 steps, trimmed the wick and lit the lamp. On the night of the great storm she stayed up until dawn so that three fishing boats could find the harbour. In the morning the crews left a basket of bread at her door.',
      questions: [
        { id: 'ch2q1', text: 'How many steps did Mira climb each evening?', answer: '112',
          hints: ['It is a number, and it is over a hundred.', 'It was mentioned right after she climbed.', 'It starts with 11.'] },
        { id: 'ch2q2', text: 'How many fishing boats found the harbour in the storm?', answer: '3 (three)',
          hints: ['It is a small number.', 'It was the night of the great storm.', 'More than two, fewer than four.'] },
        { id: 'ch2q3', text: 'What did the crews leave at her door?', answer: 'A basket of bread',
          hints: ['It was left in the morning, as thanks.', 'It is something you can eat.', 'It is baked, and it came in a basket.'] }
      ]
    },
    {
      id: 'ch3', title: 'Thinking it through', topic: 'Everyday reasoning',
      author: 'Mei', reviewers: ['Amara', 'Tomás'], licence: 'CC0',
      intro: 'Short puzzles. Stay with them before you reach for a hint.',
      questions: [
        { id: 'ch3q1', text: 'Which is heavier: a kilogram of feathers or a kilogram of stones?', answer: 'Neither. They weigh the same.',
          hints: ['Read the units carefully.', 'Both amounts are one kilogram.', 'The same unit and the same amount weigh the same.'] },
        { id: 'ch3q2', text: 'What comes next? 2, 4, 8, 16, ?', answer: '32',
          hints: ['Look at how each number relates to the one before it.', 'Each number is the one before it, doubled.', 'Double 16.'] },
        { id: 'ch3q3', text: 'Today is Wednesday. What day will it be in 10 days?', answer: 'Saturday',
          hints: ['Seven days from now is a Wednesday again.', 'That leaves 3 more days.', 'Count on from Wednesday: Thursday, Friday, then the third.'] }
      ]
    }
  ],
  struggleSeconds: 30,
  licences: ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0'],

  /* Orbits: topic rooms of 4 to 8 people with a human host. size counts everyone, so seats left = size - joined. */
  orbits: [
    { id: 'o1', topic: 'Should exams allow notes?',            host: 'Priya',  when: 'Today, 6:30 pm', size: 8, joined: 5, view: 'Is it fair to ask people to remember what they can look up?',
      names: ['Tomás', 'Amara', 'Sofia', 'Kenji'] },
    { id: 'o2', topic: 'Telling a story in two minutes',       host: 'Hana',   when: 'Today, 7:15 pm', size: 6, joined: 4, view: 'What makes a short story worth listening to?',
      names: ['Jonas', 'Ines', 'Olu'] },
    { id: 'o3', topic: 'Interview answers without notes',      host: 'Zainab', when: 'Today, 8:00 pm', size: 6, joined: 3, view: 'What do you say when you freeze in an interview?',
      names: ['Yuki', 'Marco'] },
    { id: 'o4', topic: 'Is a walk the best way to think?',     host: 'Gabriel', when: 'Tomorrow, 7:30 am', size: 4, joined: 2, view: 'Where do you think best, and what makes it work?',
      names: ['Mina'] },
    { id: 'o5', topic: 'Cooking for one, without a recipe',    host: 'Giulia', when: 'Tomorrow, 6:00 pm', size: 8, joined: 6, view: 'What can you cook with no recipe, and who taught you?',
      names: ['Sana', 'Luis', 'Wren', 'Kofi', 'Aiko'] },
    { id: 'o6', topic: 'Reading a map and finding the way',    host: 'Dmitri', when: 'Saturday, 10:00 am', size: 5, joined: 2, view: 'When did you last find a place without a map app?',
      names: ['Carlos'] }
  ],

  /* Simulators: three formats, one rubric. Notes are pre-written demo feedback from two named people. */
  rubric: [
    { id: 'clarity',    label: 'Clarity',    line: 'Could a listener follow what you meant?' },
    { id: 'structure',  label: 'Structure',  line: 'Did it have a start, a middle and an end?' },
    { id: 'listening',  label: 'Listening',  line: 'Did you answer what was asked?' },
    { id: 'confidence', label: 'Confidence', line: 'Did you stay steady when it got hard?' }
  ],
  simulators: [
    { id: 'interview', label: 'Mock interview', realMinutes: 10, demoSeconds: 20,
      line: 'A person asks three questions about your work. Answer out loud, with no notes.',
      scenario: 'Tell me about a time something went wrong and what you did next.',
      notes: [
        { from: 'Mei', note: 'You opened with the outcome, which made the rest easy to follow. Your middle part ran long. Try one sentence for the problem and one for the fix.', scores: { clarity: 4, structure: 3, listening: 4, confidence: 3 } },
        { from: 'Kofi', note: 'You answered the question I asked, not the one you prepared. That was the best moment. When you paused, you looked down; look up and the pause feels calm.', scores: { clarity: 4, structure: 4, listening: 5, confidence: 3 } }
      ] },
    { id: 'talk', label: '3-minute talk', realMinutes: 3, demoSeconds: 20,
      line: 'Give a three-minute talk to two or three people on something you know well.',
      scenario: 'Teach us one thing you know well, in three minutes, with no slides.',
      notes: [
        { from: 'Amara', note: 'Your first line pulled me in. I lost the thread in the middle when you added a second idea. One idea, three examples, would land better.', scores: { clarity: 3, structure: 3, listening: 4, confidence: 4 } },
        { from: 'Priya', note: 'Warm and clear. You spoke a little fast at the start and slowed once you saw us nodding. Start at that slower pace.', scores: { clarity: 4, structure: 4, listening: 4, confidence: 4 } }
      ] },
    { id: 'hard', label: 'Hard conversation', realMinutes: 5, demoSeconds: 20,
      line: 'Practise saying something difficult to a person who plays the other side.',
      scenario: 'You need to tell a friend you cannot lend them money this month.',
      notes: [
        { from: 'Tomás', note: 'You were kind and direct, and you did not over-explain. When I pushed back you almost gave in, then held. That held moment worked.', scores: { clarity: 4, structure: 3, listening: 5, confidence: 3 } },
        { from: 'Mei', note: 'Good opening: you said what you could do instead. Watch the apology count; two is enough. I felt respected.', scores: { clarity: 4, structure: 4, listening: 4, confidence: 4 } }
      ] }
  ]
};


/* The Shield (S7) and Night Watch. Demo speed: one minute on the clock is one second on screen, and every timer says so. */
C.data.shield = {
  secondsPerMinute: 1,
  coolingMinutes: 10, /* the cooling-off before a limit takes effect, and the wait to lift one early */
  exceptionMinutes: 20, /* what a crew member can approve */
  budgetMax: 8, /* hours a day */
  approver: 'priya', /* the crew member who approves in the demo; the answer comes after 3 seconds */
  approveSeconds: 3,
  windows: [
    { id: 'w1', label: '7 am to 10 am', name: 'Study' },
    { id: 'w2', label: '12 pm to 1 pm', name: 'Lunch with people' },
    { id: 'w3', label: '6 pm to 9 pm', name: 'Crew time' }
  ],
  nightTimes: [
    { id: '21:00', label: '9 pm' },
    { id: '22:00', label: '10 pm' },
    { id: '23:00', label: '11 pm' }
  ],
  lateClock: '11:30 pm',
  dayClock: '10:30 am', /* where the demo clock returns after the Night Lock scene, so Home never shows the late time */
  /* Night Watch: quiet study rooms hosted by people. No phone numbers anywhere. */
  rooms: [
    { id: 'nw1', topic: 'Quiet study hour', host: 'Noor', when: 'Tonight, 11 pm to 1 am', joined: 5, size: 8,
      names: ['Kofi', 'Sana', 'Luis', 'Wren'], line: 'Cameras off, voices low. Work on your own thing, together.' },
    { id: 'nw2', topic: 'Reading and winding down', host: 'Daniel', when: 'Tonight, 11 pm to 1 am', joined: 4, size: 6,
      names: ['Mei', 'Giulia', 'Tom\u00e1s'], line: 'Books, notes or a quiet cup of tea. Say hello, or don\u2019t.' }
  ],
  crisis: {
    title: 'Your local crisis line',
    line: 'Find one for your country at',
    site: 'findahelpline.com',
    url: 'https://findahelpline.com',
    note: 'If you are in danger right now, contact your local emergency services.'
  }
};


/* Earth Archive (S8). The six entries below are the ones in PLAN.md Section 5, word for word in "evidence" and "source".
   "people" and "skill" are written for the prototype. Every entry carries the prototype note: verify before launch. */
C.data.archive = {
  intro: 'How people fed, cleaned and looked after themselves before agents chose for them, checked against today\'s evidence.',
  categories: ['Food', 'Hygiene', 'Sleep', 'First aid', 'Repair'],
  note: 'Prototype content: verify before launch',
  footer: 'No brands, no products, no shopping links. Nothing here is for sale.',
  /* verdict: keep, adapt or drop. The badge shows the word as well as the colour. */
  verdicts: {
    keep:  { label: 'Keep',  line: 'Still holds up today' },
    adapt: { label: 'Adapt', line: 'Keep the idea, change the method' },
    drop:  { label: 'Drop',  line: 'Today’s evidence says do something else' }
  },
  entries: [
    { id: 'hands', title: 'Washing hands with soap', category: 'Hygiene', verdict: 'keep',
      people: 'Families washed their hands with soap and water before eating and after the toilet, and kept a bar of soap by every tap.',
      evidence: 'Scrub with soap for at least 20 seconds, then rinse',
      skill: 'Wash your hands now and hum a song you know from start to finish. That is about 20 seconds.',
      source: 'US CDC, handwashing guidance' },
    { id: 'whole', title: 'Cooking from whole ingredients', category: 'Food', verdict: 'keep',
      people: 'Most meals were cooked at home from raw ingredients: vegetables, grains, beans, eggs, fish or meat, bought fresh and in season.',
      evidence: 'Diets high in ultra-processed food are linked to worse health; cooking from whole foods keeps that choice in your hands',
      skill: 'Cook one meal from ingredients you can name, such as lentils, rice and a chopped vegetable.',
      source: 'The Lancet series on ultra-processed food, 2025' },
    { id: 'fridge', title: 'Keeping the fridge cold', category: 'Food', verdict: 'keep',
      people: 'Before fridges, families kept food in cool cellars and pantries and used salting, pickling and drying to keep it safe.',
      evidence: 'Keep the fridge at 5 °C or below',
      skill: 'Put a fridge thermometer on the middle shelf and check it reads 5 °C or below.',
      source: 'UK Food Standards Agency' },
    { id: 'sleep', title: 'A regular night\'s sleep', category: 'Sleep', verdict: 'keep',
      people: 'People went to bed and got up with the light, at about the same time every day.',
      evidence: 'Adults need 7 or more hours a night',
      skill: 'Choose one wake-up time and keep it for a whole week, even on the weekend.',
      source: 'US CDC / American Academy of Sleep Medicine' },
    { id: 'butter', title: 'Butter on a burn', category: 'First aid', verdict: 'drop',
      people: 'Many households rubbed butter or oil on a burn, believing it would soothe the skin.',
      evidence: 'Cool the burn under cool running water for 20 minutes instead',
      skill: 'Learn the rule now: cool running water, 20 minutes. Set a timer once, so you know how long that feels.',
      source: 'UK NHS, burns and scalds' },
    { id: 'mend', title: 'Mending clothes', category: 'Repair', verdict: 'adapt',
      people: 'Families darned socks, patched knees and sewed on buttons instead of throwing clothes away.',
      evidence: 'A basic stitch kit keeps clothes in use longer; learn one stitch',
      skill: 'Learn the running stitch and use it to sew a button back on.',
      source: '', sourceNote: 'No source needed: a skill entry with no health claim' }
  ],
  /* Elder Signals: recipes recorded by older members. Each opens the "Cook a family recipe" mission. */
  elders: {
    label: 'Recorded by a member, reviewed before publishing',
    cards: [
      { id: 'e1', title: 'Rosa’s lentil soup', by: 'Rosa', age: 78, mission: 'cook',
        line: 'The soup my mother made every Friday, on the back burner while she did everything else.',
        need: 'Lentils, an onion, two carrots, water, salt and a squeeze of lemon.',
        tip: 'Cook the onion slowly until it is soft and sweet. Do not rush that part.' },
      { id: 'e2', title: 'Tunde’s rice and greens', by: 'Tunde', age: 81, mission: 'cook',
        line: 'A pot we ate after the long walk home from the market, with whatever greens were fresh.',
        need: 'Rice, a bunch of greens, garlic, an onion, oil and salt.',
        tip: 'Wash the rice until the water runs clear, then leave the lid on and let it be.' }
    ]
  }
};


/* Light Exchange (S10): hours, not money. Eight offers from other members, all fictional. */
C.data.exchange = {
  debtLimit: 2, /* prototype value: hours the balance may dip below zero; you pay it back by teaching */
  offers: [
    { id: 'x1', name: 'Jonas', teach: 'Spreadsheet basics',       want: 'Public speaking' },
    { id: 'x2', name: 'Hana',  teach: 'Spanish for beginners',    want: 'Bread baking' },
    { id: 'x3', name: 'Tunde', teach: 'Basic guitar chords',      want: 'Sewing on a button' },
    { id: 'x4', name: 'Ines',  teach: 'Reading a paper map',      want: 'Basic first aid' },
    { id: 'x5', name: 'Kenji', teach: 'Chess openings',           want: 'Conversational English' },
    { id: 'x6', name: 'Sofia', teach: 'Essay structure',          want: 'Cooking rice and stews' },
    { id: 'x7', name: 'Mina',  teach: 'Your first 5 km run',      want: 'Learning to code' },
    { id: 'x8', name: 'Wren',  teach: 'Pickling and preserving',  want: 'Writing a CV' }
  ],
  /* In the demo a member asks to learn each skill you list. These are crew members, so they join the same stars. */
  askers: [
    { id: 'amara', name: 'Amara' }, { id: 'kofi', name: 'Kofi' }, { id: 'priya', name: 'Priya' },
    { id: 'tomas', name: 'Tomás' }, { id: 'mei', name: 'Mei' }
  ],
  places: [
    { id: 'lib',     label: 'City Library, room 3',                 note: 'A bookable room, open to everyone' },
    { id: 'cafe',    label: 'The Blue Door café, Old Market',  note: 'The long table by the window' },
    { id: 'hub',     label: 'University Quarter hub, study room',   note: 'A public study room' },
    { id: 'park',    label: 'Riverside Park, bandstand benches',    note: 'Outdoors, in daylight' },
    { id: 'kitchen', label: 'Northgate Community Kitchen, side table', note: 'Staffed by members' }
  ],
  slots: ['Today, 6:00 pm', 'Tomorrow, 5:30 pm', 'Saturday, 10:00 am'],
  theirRatings: [5, 4, 5, 5], /* what the other person rates the session, in turn; pre-written for the demo */
  waitSeconds: 2 /* demo speed: how long the other person takes to rate */
};


/* Landing Missions (S11): this week, always with another person. */
C.data.missions = {
  week: 'This week',
  items: [
    { id: 'cook', title: 'Cook a family recipe with someone', icon: 'cook',
      what: 'Pick a recipe that someone in a family has cooked for years. Cook it together, from the ingredients up.',
      tip: 'Start with an Elder Signal in the Earth Archive.' },
    { id: 'wayfind', title: 'Find a place across town without a map app', icon: 'map',
      what: 'Choose a place on the other side of Harbour City. Reach it with a paper map, signs, or by asking people.',
      tip: 'Two people find the way better than one. Take turns leading.' },
    { id: 'teach', title: 'Teach someone one thing you know well', icon: 'relating',
      what: 'Pick one small skill. Show it, let them try it, and watch them get it wrong once before they get it right.',
      tip: 'Light Exchange counts a taught hour on its own too.' }
  ]
};
