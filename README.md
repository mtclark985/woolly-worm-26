# Woolly Worm Fest 2026 🐛

Private family trip app for our October 2026 trip to the 49th Annual Woolly Worm Festival in Banner Elk, NC.

Built with: React + Vite + Tailwind CSS · Hosted on Vercel · Backend: Supabase

---

## Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file for local config:

```
# Password gate — leave blank to skip the gate in local dev
VITE_SITE_PASSWORD=yourpassword

# Supabase (add after provisioning your project)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Setting the Password on Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add `VITE_SITE_PASSWORD` with your chosen password
3. Redeploy

The password is checked client-side and stored in `sessionStorage` — it persists for the browser session. This is a convenience gate for family use, not a security system.

## Supabase Setup (Session 2)

Tables to create (SQL in `/supabase/schema.sql` — coming in Session 2):
- `meals` — meal sign-up grid
- `house` — rental house details
- `travel_status` — family travel status + pins

## TODOs (fill these in)

- `src/pages/Landing.jsx` line 21: Replace `[Your Family Name]` with your group name
- `src/components/WoollyWormRace/racers.js`: Add real kid photos when ready (change `photo: null` to `photo: '/photos/kid.jpg'` and drop images in `/public/photos/`)
- Trip dates: default meals grid uses Oct 16–19 (change `tripStartDate`/`tripEndDate` in Session 2)
- Family names: default picker shows Family A/B/C — update in Session 2

## Privacy Note

The travel page (Session 2) uses the browser's Geolocation API for family pins. It only fires when a family member taps "Drop my pin" — no background tracking, one-time snapshot they choose to share.
