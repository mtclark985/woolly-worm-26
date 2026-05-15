# Family Trip App — Build Spec

A private website for our family's October 2026 trip to **Banner Elk, NC** for the **Woolly Worm Festival** (with two other families, 6 kids total). Themed around the festival, with a woolly-worm-race game as the centerpiece of the landing page.

---

## Trip Context

- **Festival:** 49th Annual Woolly Worm Festival, **October 17–18, 2026**, Banner Elk, NC
- **Lodging base:** Beech Mountain, NC (~15 min drive to Banner Elk)
- **Group:** 3 families, 6 kids total
- **The kids:** Luca, Isla, Kameron, Kinze, Carter, Jack
- **Festival flavor:** Worms race up 3-foot strings. Live MC ("Adam Binder" — bearded, ballcap covered in stuffed worms) does play-by-play commentary. Mascot named "Merryweather." Winning worm gets a randomized 13-week winter forecast based on its 13 body segments.

---

## Stack & Infrastructure

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (auth, Postgres, Storage for photos)
- **Hosting:** Vercel (connected to GitHub repo)
- **Auth model:** Single shared password for the site (env var on Vercel). Simpler than per-user accounts for 3 families.
- **Repo:** New GitHub repo, public is fine since access is password-gated.

> **Note to Claude Code:** match the patterns from my existing `personal-finance-app` repo (same stack). I'm a self-taught dev — explain the *why* on non-obvious decisions, not just the *what*.

---

## Build Plan: Two Sessions

### Session 1 (this one) — Scaffold + Race Game + Deploy
Goal: working URL by end of session, with the woolly worm race playable.

1. Initialize Vite + React + Tailwind project
2. Create GitHub repo, connect to Vercel, get a live URL up early (deploy "Hello World" first, iterate from there)
3. Set up Supabase project (auth + DB + storage buckets — don't need to use it all yet, just provision)
4. Build the password gate (env var, sessionStorage to remember within session)
5. Build the landing page:
   - Festival-themed hero (autumn / Blue Ridge Mountains palette — burnt orange, deep red, golden yellow, brown, cream)
   - **Countdown timer** to October 17, 2026
   - **The Woolly Worm Race** game (full spec below)
6. Deploy final, share URL

### Session 2 (next) — Trip Content Sections
- Itinerary (daily schedule, editable)
- **Meals** (per-day breakfast/lunch/dinner sign-up, see spec below)
- **House** (editable card with rental info + link, see spec below)
- **Weather widget** (Open-Meteo forecast for trip days, see spec below)
- **"We're on our way" travel page** (status + pin map + ETA, see spec below)
- Packing lists (per-family, checkable, syncs via Supabase)
- Interactive map (Beech Mountain lodging + Banner Elk festival site + nearby spots)
- Message board (Supabase real-time)
- Photo gallery (Supabase storage, upload + grid view)
- Navigation between sections, mobile polish

---

## The Woolly Worm Race (Landing Page Game)

This is the soul of the site. Make it feel like a real festival event.

### The 6 racers

Each kid has a worm alter-ego with a punny race name. Kid photos will be uploaded later — for now, use placeholder avatars (colored circles with initials). Build the data structure so swapping in real photos is one prop change per kid.

| Kid | Worm Name | Suggested Color |
|---|---|---|
| Luca | Luca Brrr-asi | Deep red `#B91C1C` |
| Isla | Isla of Wool | Cream / off-white `#F5E6D3` (with dark outline) |
| Kameron | Kam-Anchor Leg | Forest green `#15803D` |
| Kinze | Kinze the Caterpillar Killer | Hot pink `#DB2777` |
| Carter | Carter the Cold Front | Ice blue `#0EA5E9` |
| Jack | Jack Frost | Silver / pale gray `#94A3B8` |

### Race mechanics
- **Layout:** 6 vertical strings rendered side-by-side, ~3 feet tall in visual proportion (tall and narrow). Cardboard-backed look à la the real festival.
- **Start:** Big "🐛 START RACE" button. On click, plays a countdown: "On your mark... Get set... GO!" (text on screen + optional sound).
- **Animation:** Worms inch up their strings over ~10–15 seconds. Use small, jittery upward movements — *not* smooth linear motion. Real worms are erratic. Each worm gets a fresh random progress curve per race.
- **Outcome:** Pure random — equal odds for each worm every race. No weighting, no rigging.
- **Visual:** Each worm = a segmented caterpillar drawn with SVG or CSS (13 segments to honor the festival's 13-weeks-of-winter tradition). Animate a subtle wiggle as they climb.

### Full theater treatment

**1. Pre-race intro screen**
Briefly show all 6 worms lined up with their names. Cue line:
> *"Folks, this is the moment we've all been waiting for. Six worms. One string. One champion. Take it away, Adam!"*

**2. Live commentary during the race**
Display a rolling commentary feed (auto-scrolling text box at the bottom, like a sports ticker). Generate lines dynamically based on the race state. Lines should mimic Adam Binder's real cadence. Examples to seed the pool:

- "On your mark... get set... GO!"
- "And they're off! {leader} jumps out to an early lead!"
- "{worm} is making a move on the outside!"
- "Folks, {worm} is taking the scenic route up there..."
- "WAIT — {worm} just surged past {previous_leader}!"
- "It's anybody's race! {worm1} and {worm2} are neck and neck!"
- "{worm} is wiggling like there's a thousand-dollar bounty on the line!"
- "Merryweather is going WILD in the crowd right now!"
- "Down the stretch they come!"
- "And your 2026 Family Trip Woolly Worm Champion is... **{winner}**!"

Logic: every 1–2 seconds, check positions, pick a relevant commentary template, fill in current leader/challenger names, push to feed. Call out lead changes loudly.

**3. Winner screen**
- Confetti burst (use `canvas-confetti` package — small, no deps)
- Big text: "🏆 **{Worm Name}** 🏆 — Wins the 2026 Family Trip Race!"
- Show the kid's name below the worm name ("Worm raced by: **{Kid}**")
- **Bonus: Winter Forecast.** Show 13 colored segments (alternating brown/black gradient — lighter = milder, darker = colder). Each segment labeled with a week of winter. Randomly generate the pattern. Include a fun caption: *"{Winner}'s 13-segment winter forecast for the 2026–27 season:"*
- "🐛 Race Again" button to reset

**4. Sound (optional — graceful degrade if user blocks audio)**
- Countdown beeps + GO horn
- Crowd cheering during race (loop, low volume)
- Air horn on winner
- Use Web Audio API or small `.mp3` files. If sound fails, race still works visually.

### Components to build (suggested structure)
```
src/
  components/
    PasswordGate.jsx          # site-wide password protection
    Countdown.jsx              # days/hrs/mins/secs to Oct 17 2026
    WoollyWormRace/
      index.jsx                # main race component
      RaceTrack.jsx            # the 6 strings + worms
      Worm.jsx                 # single animated worm (SVG)
      CommentaryFeed.jsx       # auto-scrolling text
      WinnerScreen.jsx         # confetti + forecast
      racers.js                # data: kids + worm names + colors
      commentary.js            # commentary line templates
  pages/
    Landing.jsx                # hero + countdown + race
  lib/
    supabase.js                # client init (for later sessions)
  App.jsx
  main.jsx
```

---

## Meals Section (Session 2)

A shared meal-planning grid so families can sign up to cook specific meals during the trip.

### Family identity (needed for meals + house + packing lists)

Since auth is a single shared password, the app doesn't know which family is using it. Solve this with a one-time picker:

- On first visit to any editable section, prompt: "Which family are you?"
- 3 options (placeholder names — leave as TODO for me to fill in): Family A, Family B, Family C
- Store choice in `localStorage` under `family_trip_app_family`
- Show the chosen family in a small badge in the nav, with a "switch" link (just in case)
- All edits get tagged with that family name (for "claimed by" labels)

This is not security — it's just a label. Anyone can switch their identity. Fine for 3 trusted families.

### Meals data model

Supabase table `meals`:
```
id            uuid (primary key)
date          date (e.g. 2026-10-16)
meal_type     text ('breakfast' | 'lunch' | 'dinner')
claimed_by    text (family name, nullable)
description   text (e.g. "Pancakes, bacon, fruit", nullable)
notes         text (e.g. "Bringing the griddle", nullable)
updated_at    timestamp
```

Unique constraint on (`date`, `meal_type`) so there's exactly one row per slot.

### Meals UI

- **Layout:** Grid with rows = days of the trip, columns = Breakfast / Lunch / Dinner. On mobile, stack vertically — one day per section, three meal cards per day.
- **Empty slot:** "Sign up to cook" button. Click → modal with family auto-filled (from localStorage), description textarea, notes textarea, save.
- **Filled slot:** Show family badge, meal description, notes. Tap to edit (anyone can edit anyone's — simple model).
- **Trip dates:** Generate the grid from a `tripStartDate` / `tripEndDate` constant at the top of the file. Default to Oct 16–19, 2026 (leaving Friday for arrival, Sat/Sun for festival, Monday for departure) — but **leave it easy for me to change**.
- **Live updates:** Use Supabase realtime so if one family edits, others see it immediately. (`supabase.channel('meals').on('postgres_changes', ...)`)

---

## House Section (Session 2)

A simple editable card for the rental house. We don't have it booked yet, so the UI needs to handle the "not yet booked" state gracefully.

### Data model

Supabase table `house` (single-row table — only ever one record):
```
id            uuid (primary key, fixed value or just first row)
name          text (e.g. "The Mountain View Cabin", nullable)
listing_url   text (Airbnb/VRBO/etc link, nullable)
address       text (nullable)
check_in      date (nullable)
check_out     date (nullable)
notes         text (free-form: wifi, codes, parking, etc., nullable)
updated_at    timestamp
```

### House UI

- **Empty state** (no record yet, or record has no listing_url):
  - Card with: "🏔️ We haven't booked a house yet!"
  - Single button: "Add house details"
  - On click → modal/form with all fields, save to Supabase
- **Filled state:**
  - Card with name as the title
  - Address (with a "Open in Maps" link if filled)
  - Check-in / check-out dates
  - Big button: "View listing →" (opens listing_url in new tab)
  - Notes section (collapsible if long)
  - Small "Edit" link in the corner — anyone can edit
- **Edit modal:** All fields editable, including clearing them. Saving updates the single row.
- **Link previews (optional, nice-to-have):** if the listing_url is set, try to render a small preview thumbnail. Use a simple Open Graph fetch on the client (`fetch` the URL, parse `<meta property="og:image">`). If it fails or is blocked (Airbnb often is), just show a clean card with the URL and a button. Don't make this a hard requirement — graceful degrade to "just a link" is fine.

### Why a single-row table?

Could just be a `localStorage` blob, but Supabase means the info is shared across all devices/families automatically (which is the whole point). Using a single-row table is cleaner than overloading another structure.

---

## Weather Widget (Session 2)

A small forecast widget on the landing page so the group can see what to expect — and pack accordingly. Banner Elk is at ~3,700 ft elevation, so October weather is highly variable (anywhere from 65°F sunny to 35°F frosty).

### API: Open-Meteo

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **No API key required**, no rate limits for personal use
- **Coordinates for Banner Elk, NC:** lat `36.1632`, lon `-81.8712`
- **Range:** Open-Meteo returns up to 16 days of forecast. Far enough out, it returns null — handle gracefully.

Example call:
```
https://api.open-meteo.com/v1/forecast?
  latitude=36.1632&longitude=-81.8712
  &daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code
  &temperature_unit=fahrenheit
  &timezone=America/New_York
  &start_date=2026-10-16&end_date=2026-10-19
```

### Display logic

- **If trip is >16 days away:** show a placeholder card: "🌤️ Forecast available 16 days before the trip." Don't bother hitting the API.
- **If trip is within 16 days:** fetch and render a card per trip day with:
  - Day name + date ("Fri, Oct 16")
  - Weather emoji from WMO weather code (clear=☀️, partly cloudy=⛅, cloudy=☁️, rain=🌧️, snow=🌨️, etc.)
  - High / low temps
  - Precipitation chance %
- **Refresh cadence:** fetch on page load, cache in memory for the session. No need to refresh more often.
- **Placement:** Compact card on the landing page below the countdown, above the race. Mobile: stacked card per day.

### WMO weather code → emoji mapping (cheat sheet)

| Code | Condition | Emoji |
|---|---|---|
| 0 | Clear | ☀️ |
| 1–3 | Mostly clear → overcast | 🌤️ ⛅ ☁️ |
| 45, 48 | Fog | 🌫️ |
| 51–67 | Drizzle / rain | 🌦️ 🌧️ |
| 71–77 | Snow | 🌨️ |
| 80–82 | Rain showers | 🌧️ |
| 95–99 | Thunderstorm | ⛈️ |

(Open-Meteo docs have the full list; Claude Code can build a small helper function.)

---

## "We're On Our Way" Travel Feature (Session 2)

Trip-day excitement: each family updates their status as they head out and can optionally drop a pin showing where they are. Keep it simple — no routing APIs. Use **Google Maps deep links** for any actual navigation/ETA, since that's what people will use to drive anyway.

### Data model

Supabase table `travel_status` (one row per family):
```
id              uuid (primary key)
family_name     text (unique — matches family picker)
hometown        text (e.g. "Charlotte, NC", nullable — free-form, no geocoding needed)
status          text ('not_yet' | 'on_the_way' | 'arrived', default 'not_yet')
current_lat     float (nullable — set when they tap "drop my pin")
current_lon     float (nullable)
eta_text        text (free-form note, e.g. "ETA 4:30pm — stopping for lunch", nullable)
updated_at      timestamp
```

### Travel page UI

A new page `/travel` (linked from main nav, prominent on the landing page during the trip dates).

**Top of page:** Simple map (using Leaflet + OpenStreetMap, no key) showing the cabin as a big pin and each family's current pin if dropped.

**Below the map:** A row/card per family:
- Family name + status badge (🏠 Not yet / 🚗 On the way / 🏔️ Arrived)
- Hometown text (if set), e.g. "From Charlotte, NC"
- Optional ETA note ("Stopping for lunch around Asheville")
- Buttons (only enabled for the user's own family — others read-only):
  - **Mark "On the way"**
  - **Mark "Arrived"**
  - **Update my pin** (uses browser geolocation, one-tap snapshot)
  - **🗺️ Get directions to the cabin** — opens Google Maps in a new tab with the cabin address as the destination. Google handles the routing + live ETA natively.

**First-time setup per family:** If a family hasn't set their hometown yet, show a small form: free-text input for "Hometown (e.g. Charlotte, NC)". No geocoding needed — it's just a label for display.

### Google Maps deep link format

```
https://www.google.com/maps/dir/?api=1&destination={cabin_address_or_lat,lon}
```

If user's location is also known (from their pin), include `&origin={lat,lon}`. Otherwise let Google Maps use the user's current location automatically.

### Cabin destination

- If `house.address` is set in Supabase → use that as the destination string
- Otherwise → fall back to "Beech Mountain, NC" as the destination
- This way directions work even before the house is booked

### "Drop my pin" logic

```js
navigator.geolocation.getCurrentPosition((pos) => {
  const { latitude, longitude } = pos.coords;
  // update supabase travel_status row for this family
  // map re-renders with the new pin
});
```

**Privacy note (for the README and for me to know):** Uses the browser's geolocation API, which requires explicit user permission each time. Fires only when the user taps the button. No background tracking — each pin is a one-time snapshot the user chooses to share.

### Subtle nice-to-haves

- When all 3 families are marked "Arrived," confetti + a "🏔️ Squad Assembled!" celebration moment on the page
- Sort families by status: arrived → on the way → not yet (so action moves to the top on trip day)
- Show a "last updated" timestamp on each family card

---

## Design Direction

- **Vibe:** Blue Ridge Mountain autumn, festival-fun, family-friendly. Cozy not corporate.
- **Palette:** Burnt orange, deep red, golden yellow, forest green, cream, dark brown. Think "October leaves + woolly worm."
- **Fonts:** A friendly display font for headings (Fraunces, DM Serif Display, or similar — something with personality), clean sans for body (Inter or system).
- **Hero:** Big title ("[Family Name] Goes to Woolly Worm Fest 2026" — leave the family name as a TODO for me to fill in), subtitle, countdown, then the race below the fold.
- **Mobile-first.** Site will mostly be viewed on phones during the trip itself.

---

## Things to leave as TODOs (I'll fill in)

- Exact trip dates (festival is Oct 17–18, we'll go around then — leave Oct 17 as countdown target; default the meals grid to Oct 16–19)
- Family/group name for the hero
- The 3 family names (placeholder: Family A, Family B, Family C — for the meals/packing identity picker)
- Kid photos (placeholder colored circles for now)
- House details — all editable in-app once we book it, no code changes needed
- Each family's hometown — added in-app via the travel page
- The site password itself (I'll set the env var on Vercel)

---

## Definition of Done — Session 1

- [ ] Repo created on GitHub, pushed
- [ ] Deployed to Vercel with a live URL
- [ ] Password gate works (one shared password via env var)
- [ ] Landing page loads with hero, countdown to Oct 17 2026, and the race
- [ ] Race plays end-to-end: countdown → animated climb → commentary → winner + forecast
- [ ] Random outcome every race
- [ ] Works on mobile
- [ ] Supabase project provisioned (even if not yet used)
- [ ] README explains how to set the password env var locally and on Vercel

---

## YOLO Mode Notes for Claude Code

- Don't ask me a bunch of questions before starting. Make reasonable choices and tell me what you did.
- Get something deployed early so we can see progress.
- Use TypeScript if it's not friction; plain JSX if it is. Match the personal-finance-app style.
- Use `canvas-confetti` for confetti, `framer-motion` only if needed for the race (CSS animations may be enough).
- No testing setup needed — this is a personal/family app.
- Commit frequently with clear messages so I can follow along.
