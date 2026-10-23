# Constella prototype: build plan for Claude Code

Give this whole file to Claude Code as the brief. It has everything needed: the brief's rules for the prototype, what to build, how it should look, the demo data, the order of work and the checks before packaging.

---

## 0. Read this first

You are building a **clickable prototype of Constella**, a mobile app, for a case submission (Flipkart APM 2029). The prototype is a **visual aid only**. It does not need a server, accounts or real data. It must look and feel like the real app for a 3–4 minute walkthrough.

**What Constella is (one paragraph).** It is 2040 and everyone has a personal AI agent that does their day-to-day tasks. People rehearse everything with their agent, alone, and meet life's agent-free moments (an exam, an interview, a hard conversation, a first meeting) out of practice. Constella is a global, English-language app that keeps people able to do things **themselves** and **with other people**. It is **not another agent**: it never watches the user, keeps no profile, never acts for them and uses **no AI model**. It has five jobs: find people nearby working toward the same goal, practise without the agent, learn how people looked after themselves before agents chose for them, see what you can do on your own, and limit your agent when you ask to. Line: **"Stay able, together."**

**Theme in one line.** Deep space and nebulas with levelling-up mechanics. Your agent's convenience is a gravity well; every agent-free rep and every real meeting gives you thrust, and you rise out of it with your crew.

---

## 1. Hard rules from the case brief (do not break)

| Rule | What it means for the build |
| --- | --- |
| HTML, CSS and JS only | No React, Vue, Svelte, Tailwind build, TypeScript, npm packages or bundlers. Plain `.html`, `.css`, `.js` files |
| Runs on the reviewer's computer after download | The reviewer unzips the folder and double-clicks `index.html`. It must work from `file://`, **offline**, with no local server |
| Zipped folder of `.html` files | Ship one folder, zipped. `index.html` at its top level |
| File name | `<your name>_<your college>` for both the folder and the zip, e.g. `Ayansh_Shankar_Yadav_<College>.zip`. **Ask the user for the exact college name before packaging** |
| Visual aid, not the main deliverable | Spend effort on the screens the walkthrough shows; skip anything a reviewer will never click |
| Alternative format | The brief also accepts a screen-recorded walkthrough video (a recording of someone using the prototype, not a slideshow). Section 10 has the script so the same build serves both |

### What `file://` forbids (these break silently, so avoid them)

- **No `type="module"` scripts and no `import`/`export`.** Chrome blocks module scripts on `file://`. Load plain scripts in order with `<script src="js/....js" defer></script>` and share one global namespace object, `window.C = {}`.
- **No `fetch()` or XHR of local files** (JSON, HTML partials). Put all demo data in `js/data.js` as a JS object.
- **No CDN, no Google Fonts, no external images.** Use a system font stack. Draw every icon and illustration as inline SVG or CSS.
- **No service workers, no Web Components that need modules.**
- `localStorage` may be used for demo state, but wrap every read and write in `try/catch` and make the app work if it throws (Safari and some browsers restrict it on `file://`).

### Product rules the prototype must respect (reviewers will notice)

- **No chatbot, no AI anywhere.** No "ask AI" button, no generated text. Lumen, the companion, **never talks**: it only glows and reacts.
- **No ads, sponsored items or "promoted" labels.** Nothing anyone can pay to rank.
- **No public leaderboards.** Compare with your past self ("your Echo") and your crew only.
- **XP only from agent-free practice, confirmed meetings, teaching hours and missions.** Time in the app earns nothing, and the UI should say so once.
- **Limits apply only when the user switches them on.**
- **Original theme only.** Do **not** use Solo Leveling's names, characters, catchphrases (including "Arise"), logos or artwork, or any other anime's. Our own words are: Awakening, Status Window, Daily Quest, Gates, Constellation, **Ascend**, Lumen, ranks Stardust → Nebula → Protostar → Star → Supernova.
- All copy in plain international English. No Hindi or other languages, no India-only references.
- Demo people, places and messages are fictional. Do not use real brands, real companies or real people.

---

## 2. Folder and files

```
<Name>_<College>/
├── index.html            ← the whole app (one page, hash routes)
├── README.txt            ← how to open it, in 5 lines
├── css/
│   └── styles.css
└── js/
    ├── data.js           ← all demo data (C.data)
    ├── state.js          ← state, XP and rank logic, save/load with try/catch (C.state)
    ├── ui.js             ← small helpers: el(), toast(), modal(), icons as SVG strings (C.ui)
    ├── screens.js        ← one render function per screen (C.screens)
    └── app.js            ← router, tab bar, demo controls, start-up (C.app)
```

- Load order at the end of `<body>`: `data.js`, `state.js`, `ui.js`, `screens.js`, `app.js`, all with `defer`.
- If `screens.js` passes about 1,500 lines, split it into `screens-a.js` and `screens-b.js`. Keep plain scripts.
- **Routing:** `location.hash` (`#/home`, `#/map`, `#/crew`, …), a `hashchange` listener, and one `render(route)` that clears `<main>` and calls the screen function. The browser's back button must work.
- **Layout on a computer:** show the app inside a phone frame (390 × 844 px, rounded, centred) on a starfield page, with a narrow **Demo controls** panel to the right (Section 8). **On a phone-width window** (under 500 px), drop the frame and fill the screen.
- `README.txt`: "Open index.html in Chrome, Edge, Firefox or Safari. No internet or installation needed. Use the Demo controls on the right to jump between screens or reset the demo."

---

## 3. Look and feel

### Colour tokens (put on `:root`, dark mode by default)

| Token | Value | Use |
| --- | --- | --- |
| `--space` | `#070B1F` | Page background |
| `--panel` | `rgba(20, 26, 60, 0.72)` | Glass panels like a ship's display |
| `--panel-line` | `rgba(140, 160, 255, 0.28)` | Panel borders, 1 px |
| `--violet` | `#8B6CFF` | Primary accent, XP, buttons |
| `--magenta` | `#E25BC9` | Relating stat, crew, people |
| `--teal` | `#2ED3C0` | Doing stat, success, confirmed |
| `--gold` | `#F5C451` | Rank, Ascend moment |
| `--sky` | `#6FB7FF` | Thinking stat, links |
| `--ember` | `#FF8A5C` | Persevering stat, warnings |
| `--text` | `#EEF1FF` | Body text |
| `--text-dim` | `#A9B0D6` | Secondary text |

- Nebula fields: two or three large blurred radial gradients (violet, magenta, teal) behind the content, very low opacity.
- Starfield: 120–200 small dots placed once by JS with a fixed seed (so it looks the same every time), slow twinkle by CSS animation. Turn the motion off under `@media (prefers-reduced-motion: reduce)` and with the Demo controls' motion switch.
- Panels: `--panel` background, `backdrop-filter: blur(10px)`, 1 px `--panel-line` border, 16 px radius, a faint outer glow in the accent of that section.
- Type: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`. Body 15 px, small 13 px, headings 20 / 24 px, numbers in `font-variant-numeric: tabular-nums`.
- Contrast at least 4.5:1 for text. Never use colour alone to carry meaning: stats also carry a label and an icon.
- A light mode is optional; if added, it is a toggle in Settings.

### Signature pieces to get right (they carry the theme)

1. **Status Window:** a ship-style panel with the user's rank badge, XP bar, four stats as labelled bars with levels, and the weekly meter.
2. **Star Map:** a dark map made of a faint neighbourhood grid; clusters are glowing star groups sized by how many people are in them.
3. **Your Constellation:** each person you practised with, met or taught is a star; each confirmed meeting draws a line between you.
4. **Ascend:** when a rank goes up, a short burst of light, the new rank name, and the line "Ascend". Under 1.5 seconds; skipped with reduced motion.
5. **Lumen:** a small original star-creature (simple SVG: a soft glowing orb with two dot eyes and a faint halo). It brightens when the user does something agent-free and dims gently when they have not. It **never shows a speech bubble**.

---

## 4. Navigation

- **Bottom tab bar (5):** Home · Map · Crew · Train · Shield.
- **"More" sheet from Home:** Earth Archive · Light Exchange · Missions · Constellation · Night Watch · Privacy & settings.
- Every screen in Section 6 is reachable within three taps from Home.

---

## 5. Demo data (`js/data.js`)

All fictional. One demo user and one demo city so the story holds together.

- **User:** first name entered at onboarding (placeholder "Arjun"), age band 18–30, goal chosen at onboarding.
- **Goals offered (to show it is not only for exams):** Pass a big exam · Learn a language · Play an instrument · Land a job · Learn to code · Cook from scratch · Get fit with others.
- **City:** "Harbour City" (fictional), with 8–10 neighbourhoods named plainly (Northgate, Old Market, Riverside, University Quarter, …).
- **Clusters on the map:** 10–14, each with a goal, a neighbourhood, a count (5–60) and a small list of first names with goals. Clusters under 5 people are never drawn; show "Fewer than 5 nearby: hidden for privacy" where relevant.
- **Crew:** 6 members (diverse first names from several regions of the world), shared goal, next meet-up at a public place ("City Library, room 2, Thursday 6 pm"), and 3 past meet-ups.
- **Orbits (topic rooms):** 6 scheduled rooms with a host, topic, time and seats left.
- **Simulators:** 3 practice formats: mock interview, 3-minute talk, hard conversation.
- **Star Charts (chapters):** 3 short chapters for the demo goal, each with 3 questions, a struggle timer, up to 3 hints and the answer. Write simple general-knowledge questions (e.g. mental maths, a reading-recall question) so nothing needs checking.
- **Light Exchange:** 8 offers ("I can teach: spreadsheet basics · I want to learn: public speaking").
- **Landing Missions (this week):** "Cook a family recipe with someone", "Find a place across town without a map app", "Teach someone one thing you know well".
- **Shooting Star activities:** 5 public activities in the next 2 hours (a library study table, a park run club, a language swap at a café, a chess table, a community kitchen shift).
- **Earth Archive entries (use these exact ones; each shows its source name and a "prototype content: verify before launch" note):**

| Entry | Category | Verdict | What the evidence says now | Source to cite |
| --- | --- | --- | --- | --- |
| Washing hands with soap | Hygiene | Keep | Scrub with soap for at least 20 seconds, then rinse | US CDC, handwashing guidance |
| Cooking from whole ingredients | Food | Keep | Diets high in ultra-processed food are linked to worse health; cooking from whole foods keeps that choice in your hands | The Lancet series on ultra-processed food, 2025 |
| Keeping the fridge cold | Food | Keep | Keep the fridge at 5 °C or below | UK Food Standards Agency |
| A regular night's sleep | Sleep | Keep | Adults need 7 or more hours a night | US CDC / American Academy of Sleep Medicine |
| Butter on a burn | First aid | Drop | Cool the burn under cool running water for 20 minutes instead | UK NHS, burns and scalds |
| Mending clothes | Repair | Adapt | A basic stitch kit keeps clothes in use longer; learn one stitch | — (skill entry, no health claim) |

- **Elder Signals:** 2 recipe cards recorded by older members, each linking to the "Cook a family recipe" mission.
- **Night Watch:** 2 quiet late-night study rooms, and a crisis-line card that says "Your local crisis line" with the text "Find one for your country at findahelpline.com". **Do not print a phone number.**
- **Status Window starting numbers (week view):** agent hours handed over 31 h; with-agent score 82, unaided score 54; together hours 0.5 h. These change as the demo user acts (Section 7).

---

## 6. Screens

For each screen: what it shows, what the user can do, and what proves it works in the demo.

### S0 Welcome
- Full-bleed starfield, Lumen in the centre, the name **Constella**, the line "Stay able, together."
- One sentence of story: "Your agent's convenience is a gravity well. Rise out of it with your crew."
- Button: **Begin your Awakening**.

### S1 Onboarding (under a minute in the demo)
1. **Pick a goal** from the list (cards with simple icons).
2. **Choose how you appear on the Star Map:** Hidden · Counted only · Visible (first name and goal). Explain each in one line. Toggle: **Women-only view** (off by default).
3. **Awakening:** a short agent-free check across the four stats. Banner: "Put your agent away. This one is just you." Four quick tasks, each 20–40 seconds in the demo:
   - **Thinking:** write a three-line view on a prompt (textarea, no autocomplete: `autocomplete="off" spellcheck="false"`).
   - **Doing:** three mental-maths questions.
   - **Persevering:** hold a hard puzzle for 30 seconds before a hint unlocks (a struggle timer).
   - **Relating:** a self-rating of three statements on a 1–5 scale (e.g. "Last week I had a real conversation without my agent in the middle").
4. Result: four stat levels, starting rank **Stardust**, Lumen lights up. Button: **See the Star Map**.

### S2 Home: Status Window
- Rank badge, XP bar to the next rank, a line under it: "XP comes only from what you do without your agent and with people. Time in the app earns nothing."
- **Four stats:** Relating (magenta), Doing (teal), Thinking (sky), Persevering (ember), each a labelled bar with a level.
- **Weekly meter**, three numbers in a row: *Handed to your agent* (hours) · *You vs you with the agent* (unaided score / assisted score) · **Together hours** (largest, gold).
- Note under the meter: "These numbers stay on your phone."
- **Today:** the Daily Quest card (start button, streak count; a missed day pauses the streak and says so) and the next crew meet-up card.
- **Your Echo:** a small line comparing this week with last week. No leaderboard anywhere.
- Lumen sits in the corner and glows by today's activity.

### S3 Star Map
- An SVG map of Harbour City's neighbourhoods (simple polygons, faint lines). Clusters are glowing star groups at neighbourhood centres, sized by count. Your own position is a soft ring, never a pin.
- Filter chips by goal. Privacy chip shows the current state and opens the S1 choice again. Women-only toggle.
- Tap a cluster → bottom sheet: goal, neighbourhood, count, up to six first names with goals (only those set to Visible), buttons **Open the cluster chat** and **Ask to join a crew**.
- **Cluster chat:** 6–8 pre-written human messages; the user can type and send (local only). A strip at the top: "People only. Agents can't join this chat." First entry shows a quick **person check** ("Hold the button for 2 seconds" with a fill animation).
- **Shooting Star** button (top right): opens S9.

### S4 Crew
- Crew name (the user names it; default "Northgate Orbit"), goal, six member avatars (initials in coloured circles), the next meet-up at a public place, past meet-ups.
- **Signals** (human-only invites): invite a member to a plan; the invite card shows "Only a person can open this. Their agent sees only that a human signal is waiting." Opening it requires the hold-to-confirm person check.
- **Check in at the meet-up:** shows the user's code (a generated square pattern, not a real QR) and a button **Scan a crew member's code**. In the demo, the button simulates a successful two-sided scan → toast "Meeting confirmed · +1.5 together hours · +75 XP", the Constellation gains a line, Lumen brightens.
- Report and block are present on every member (they open a simple confirm sheet).

### S5 Train
Three tabs:
- **Daily Quest:** a 5-minute agent-free rep for the chosen goal (in the demo, compress to 30 seconds with a visible "demo speed" label). Complete → +20 XP, streak +1.
- **Solo Flights:** pick a skill (handwriting, mental maths, map reading, a language), timer runs, then **Add a photo of your paper** (file input with an image preview, kept in memory only) and **enter your score** or **send for peer marking**. Saves to the Status Window's unaided score. +30 XP.
- **Star Charts:** open a chapter; each question asks for **your answer before reveal**. A struggle timer (30 s in the demo) must run before Hint 1 unlocks; then Hint 2, Hint 3, then the answer. Chapter page shows "Author: a named member · Peer reviewed · Openly licensed". A **Publish a chapter** button opens a simple form (title, licence choice) to show anyone can contribute.

### S6 Orbits and Simulators (from Train or Crew)
- **Orbits list:** topic rooms of 4–8 people with a human host, time and seats.
- **Entry gate:** "Write your own three-line view before you enter." The **Enter** button stays disabled until three lines are written. Then the room view: participant tiles (initials), host label, a session timer, a "Raise hand" button, and a banner "No agents in this room".
- **Simulators:** choose a format (mock interview, 3-minute talk, hard conversation), see the rubric (clarity, structure, listening, confidence; 1–5 each), run a timer, then show **two written feedback notes from people** (pre-written demo notes) with rubric scores. +40 XP.

### S7 Shield (limits the user sets)
- Big switch at the top: **Limits are off. Nothing changes until you switch one on.**
- **Gravity Shield:** daily agent budget (slider, hours) and agent-free windows (e.g. 7–10 am "study"). Switching on shows a **10-minute cooling-off** before it takes effect (demo speed: 10 seconds, labelled).
- **Night Lock:** companion voice off after a chosen time; no self-improvement purchases late at night; "Share any offer with a crew member in one tap".
- **Co-pilot Unlock:** to break a limit early, either wait out the cooling-off or **ask a crew member** (demo: a member approves after 3 seconds, toast "Priya approved a 20-minute exception").
- A line at the bottom: "Constella can only pause your agent on phones that allow it. It never reads your agent's data."
- **Simulated limit event** (from Demo controls): it is 11:30 pm and the Night Lock is on → a calm full-screen card: "Night Lock is on. Your companion voice is resting." with buttons **Join a Night Watch room**, **Your local crisis line**, **Ask a crew member to unlock**, **Wait 10 minutes**.

### S8 Earth Archive (from More)
- Intro line: "How people fed, cleaned and looked after themselves before agents chose for them, checked against today's evidence."
- Category chips: Food · Hygiene · Sleep · First aid · Repair.
- Entry cards from Section 5, each with a **Keep / Adapt / Drop** badge (text plus colour), "What people did", "What the evidence says now", "One skill to try", and the source name.
- **Elder Signals** shelf: recipe cards "Recorded by a member, reviewed before publishing", each with a button **Make it with someone** that opens the matching Landing Mission.
- A footer: "No brands, no products, no shopping links. Nothing here is for sale."

### S9 Shooting Star
- One big button **Shooting Star**. Pressing it plays a short streak animation and lists public, member-hosted activities in the next 2 hours, each with place, start time and "Going" count. "Same list for everyone in your area."

### S10 Light Exchange (from More)
- Balance in **hours** (start: 1.0 h taught, 0.5 h learned). "Hours, not money."
- Two lists: **Learn** (offers to book) and **Teach** (what the user offers; an add form).
- Book a session → confirm a public place or a room → after the demo session, **both sides rate** it → the balance moves (teacher +1 h, learner −1 h), +60 XP for teaching.
- Show progress toward **Supernova**: "Supernova needs 5 teaching hours: a supernova seeds new stars."

### S11 Landing Missions (from More or Home)
- This week's three missions. Each says **"Can't be completed alone"**. Completing one requires the crew-code scan from S4. +80 XP.

### S12 Constellation and ranks (from More or by tapping the rank badge)
- An SVG night sky: the user is a central star; each person met, practised with or taught is a star; confirmed meetings draw lines. Tapping a star shows the first name and what you did together.
- Rank ladder: Stardust (0 XP) → Nebula (200) → Protostar (600) → Star (1,500) → Supernova (3,000 **and** 5 teaching hours). Mark these values in the code as prototype values.

### S13 Privacy and settings (from More)
- "What Constella knows about you": goal, rough area, availability, your own scores. Nothing else.
- "What it never does": watch you, read your agent, show ads, sell data, let sponsors or agents in.
- Map visibility setting, women-only view, reduced motion, **Delete everything** (one tap → confirm → resets the demo to S0).

---

## 7. State and game logic (`js/state.js`)

- One state object: `user` (name, goal, visibility, womenOnly), `stats` (relating, doing, thinking, persevering: level 1–10), `xp`, `rank`, `streak`, `week` (agentHours, assistedScore, unaidedScore, togetherHours), `crew`, `constellation` (stars, lines), `exchange` (taught, learned), `limits` (shieldOn, budget, windows, nightLockOn, nightTime, coolingUntil), `completed` (quests, flights, missions).
- **XP table (prototype values):** Daily Quest 20 · Solo Flight 30 · Simulator session 40 · confirmed crew meeting 50 per hour · teaching hour 60 · Landing Mission 80 · time in app 0.
- Each XP event also nudges one stat: meetings and teaching → Relating; quests and solo flights → Doing or Thinking by type; struggle timers completed without opening a hint → Persevering.
- Each confirmed meeting adds to **together hours**. Each Solo Flight updates the **unaided score** (moving average) so the "you vs you with the agent" gap narrows visibly over the demo.
- Rank up triggers the **Ascend** moment once per rank.
- `save()` and `load()` use `localStorage` inside `try/catch`; if it fails, keep state in memory. **Reset** restores the seed state.

---

## 8. Demo controls (side panel on a computer, hidden behind a small button on a phone)

Built for recording the walkthrough and for reviewers who want to jump around:

- Jump to any screen (a list of S0–S13).
- **Fill a demo week:** applies a set of completed actions so the Status Window shows progress (together hours 4.5 h, unaided score up from 54 to 63, agent hours down from 31 to 24, rank Nebula).
- **Set time to 11:30 pm** (triggers the Night Lock card if it is on).
- **Trigger Ascend** (for the recording).
- Motion on/off. **Reset demo.**
- A small label at the top: "Demo controls: not part of the app".

---

## 9. Build order (commit or save after each milestone)

| # | Milestone | Done when |
| --- | --- | --- |
| M1 | Shell | Phone frame, starfield, nebula, tab bar, hash router, Demo controls panel; opens from `file://` with no console errors |
| M2 | Onboarding and Home | S0, S1 (with the Awakening), S2 Status Window with live numbers |
| M3 | People | S3 Star Map with clusters, privacy states and cluster chat; S4 Crew with Signals and the code check-in; S9 Shooting Star |
| M4 | Training | S5 (Daily Quest, Solo Flights, Star Charts) and S6 (Orbits gate, Simulators) |
| M5 | Limits | S7 Shield with cooling-off, Co-pilot Unlock and the Night Lock card |
| M6 | The rest | S8 Earth Archive with Elder Signals, S10 Light Exchange, S11 Missions, S12 Constellation and ranks, S13 Privacy |
| M7 | Game layer and polish | XP, stats, ranks, Ascend, Lumen reactions, the "Fill a demo week" control, reduced motion, keyboard focus styles |
| M8 | QA and package | Section 11 checklist passes; zip built and opened again from a fresh unzip |

Work milestone by milestone. After each one, open `index.html` directly from disk in a browser (use Playwright with Chromium against the `file://` URL if no browser window is available), click through the new screens, and fix console errors before moving on.

---

## 10. Walkthrough script (for the video or a live demo, about 3–4 minutes)

Record at 1080p, phone frame centred, with a voice-over. Hide the Demo controls panel while recording if it distracts (use them before a scene, not on camera).

| Time | Scene | Show | Say (one or two lines) |
| --- | --- | --- | --- |
| 0:00 | The problem | S0 | "In 2040 your agent does everything, so you meet the moments that matter (an exam, an interview, a first meeting) out of practice and alone." |
| 0:20 | Awakening | S1 | "Constella starts with an agent-free check. No AI here: just you, and a starting rank of Stardust." |
| 0:50 | Find your people | S3 → cluster → chat | "People near you working toward the same goal. You choose how you appear; clusters show only with five or more people." |
| 1:20 | Crew and a real meeting | S4 → code check-in | "A crew of six meets at a public place. A two-sided code check confirms the meeting. That is a together hour." |
| 1:50 | Practise without the agent | S5 Solo Flight → S6 Orbit gate | "Practice is agent-free and peer-checked. You write your own view before you can join a room." |
| 2:20 | Limits you set | S7 → Night Lock card | "Limits apply only when you switch them on, and breaking one needs a wait or a crew member's approval." |
| 2:45 | Before the agents | S8 Earth Archive | "A sponsor-free reference for food, hygiene and sleep, checked against today's evidence." |
| 3:05 | Does it work? | S2 after "Fill a demo week" → Ascend | "The number that matters is together hours. Here the gap between you with and without your agent narrows, and you Ascend." |
| 3:30 | Close | S12 Constellation | "Every person you meet becomes a star. Stay able, together." |

---

## 11. Checks before packaging

- [ ] Opens by double-clicking `index.html` in Chrome, Edge, Firefox and Safari, **offline** (turn Wi-Fi off and check).
- [ ] No network requests in DevTools → Network, and no errors in the Console.
- [ ] Works at 390 px wide and on a desktop window; no horizontal scroll.
- [ ] Every screen in Section 6 is reachable within three taps from Home; the back button works.
- [ ] Keyboard: every button reachable by Tab with a visible focus ring; Enter and Space activate.
- [ ] Reduced motion stops the starfield twinkle and the Ascend burst.
- [ ] Text contrast at least 4.5:1; nothing relies on colour alone.
- [ ] Search the code for these and remove any found: `Arise`, `Solo Leveling`, `Sung`, `Shadow Monarch`, any anime character name, `AI coach`, `chatbot`, `Sponsored`, `Ad` or `Promoted` labels, `leaderboard`, any Hindi word.
- [ ] No phone numbers, real brands, real people or real addresses in the demo data.
- [ ] Every Earth Archive entry shows its source name and the "prototype content" note.
- [ ] `localStorage` blocked (try a private window): the app still runs.
- [ ] Folder and zip are named `<name>_<college>`; unzip into a new folder and open it again to confirm.

### Packaging command

```bash
cd <parent folder>
zip -r "<Name>_<College>.zip" "<Name>_<College>" -x "*.DS_Store"
```

---

## 12. Do not build

- Accounts, sign-in, a back end, real maps or real location.
- Any AI feature, generated text or recommendation engine.
- Real phone controls (the Shield is simulated and labelled "works on phones that allow it").
- Next-release features (Veteran Orbits, Global Event, Star Review, Gates as boss fights, Reclaim, Blackout Day, Human Signal) beyond, at most, a "Coming next" card on the More sheet.
- Payments, ads, sponsor content or leaderboards.
