# 1CA Booking App

## Project Structure
- Root: `c:\Users\91895\Music\level3\1ca\1cabooking\`
- App source: `1cabooking/src/`
- Framework: React + TypeScript + Vite + Tailwind v4
- Deployed on Vercel (frontend), Root Directory = `1cabooking`

## Backend
- URL: `https://1cleanairbackend.vercel.app`
- API Secret: `1cleanAir_2026_dispatch_secure_X9d83jsk29DKL` (header: `X-API-SECRET`)
- Endpoints: `POST /api/availability`, `POST /api/book`, `GET /oauth/google/start`
- **CRITICAL**: Backend returns 500 if `Origin` header is present — must strip it in Vite proxy

## Region Routing (CONFIRMED WORKING)
- Frontend detects city via Google Places API in LocationGate (Step 0)
- Sends `region: 'ottawa' | 'montreal'` in both `/api/availability` and `/api/book` request bodies
- Backend `getCalendarsForRegion(region)` maps:
  - `"ottawa"` → `OTTAWA_CAL_IDS` + `HD_DC_IDS`
  - `"montreal"` → `MONTREAL_CAL_IDS`
  - `"carpet"` → `CLEAN_CAR_IDS` + `HD_CAR_IDS` (different service type)
- Old `CALENDAR_IDS` Vercel env var is no longer used

## Vite Proxy (local dev CORS fix)
- Proxy `/api` → backend, strips `origin` + `referer` headers via `proxyReq` hook
- In code: `BACKEND_URL = ''` always (empty = relative URL for both dev proxy and Vercel functions)
- Vercel serverless proxy functions: `api/availability.js`, `api/book.js` (pass req.body unchanged)

## Steps Built (all complete)
- Step 0: LocationGate — address check via Google Places, city→region detection, served/not-served UI
- Step 1: Service/package selection
- Step 2: Extras (availability prefetch starts here)
- Step 3: Customer details (name, email, phone, address pre-filled from Step 0, province, agreement)
- Step 4: Appointment time — merges 2×60-min blocks into 120-min slots, blocks Sundays
- Step 5: Review & Confirm — full summary + calls `POST /api/book` → green confirmation screen

## LocationGate Key Logic
- NFD normalization strips diacritics: "Montréal" → "montreal"
- `cityToRegion()` in `src/components/LocationGate.tsx`:
  - 'ottawa' or 'gatineau' → `'ottawa'`
  - 'montreal' → `'montreal'`
  - anything else → `null` (not served)
- `VITE_PLACES_API_KEY` must be set in Vercel dashboard env vars for production

## API: /api/availability
- Request: `{ start, end, workStart: "08:00", workEnd: "16:00", slotStepMinutes: 60, region }`
- Response: `{ ok, timezone, days: [{ date, slots: [{start, end, label}] }] }`
- Slot labels are 24h format → convert to 12h for display
- Fetch 2 months ahead, triggered at Step 2

## API: /api/book
- Request: `{ start, end, name, phone, email, address, notes, region }`

## Booking Notes
- `packageName` is type `T = {en, fr}` — must cast to access `.en`
- `buildNotes()` function in App.tsx assembles the full notes string

## Step4Data shape
```typescript
{ selectedDate: string | null, selectedSlot: { label, start, end } | null }
```
- `selectedSlot.start` / `.end` are ISO datetime strings — pass directly to `/api/book`

## Vercel Config (vercel.json)
```json
{ "buildCommand": "npm install && npm run build", "outputDirectory": "dist",
  "installCommand": "echo skip",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Root Directory in Vercel dashboard = `1cabooking` (do NOT use `cd 1cabooking` in buildCommand)
