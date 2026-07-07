# Baby Food Tracker / Прикорм — трекер продуктів

A simple baby complementary-feeding tracker. Log how many times you've offered each food while working toward the **~100 foods before age one** goal.

Runs as a static web app with optional cloud sync via Netlify.

**Live use:** works on phone and laptop; installable via “Add to Home Screen” after deploying.

## Features

- **100 foods** catalog (meats, fish, vegetables, fruits, grains, legumes, dairy, allergens)
- **Per-food counter** — e.g. chicken ×2, carrot ×1
- **“Gave today”** quick action while feeding
- **Progress bar** toward ~100 foods tried
- **Filters:** search, category, not tried yet, allergens only
- **4 languages:** Ukrainian (default), English, Spanish, German
- **Cross-device sync** — share a sync code between phone and laptop
- **Daily recommendations** — age-based tips and suggested foods for today
- **Offline** after first load (local cache always kept)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

Sync only works when the Netlify API is available. For local development with sync:

```bash
npm run netlify:dev
```

This runs the Vite app and the sync function together on http://localhost:8888.

### Production build

```bash
npm run build
npm run preview
```

## Deploy to Netlify

### Option A — Connect GitHub (recommended)

1. Push this repo to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Pick your GitHub repo.
4. Netlify reads `netlify.toml` automatically:

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions | `netlify/functions` |

5. Click **Deploy site**.

No environment variables are required. Sync uses [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) (included on the free tier).

### Option B — Netlify CLI

```bash
npm install -g netlify-cli   # or use npx netlify
netlify login
netlify init                 # link to a new or existing site
netlify deploy --prod
```

### After deploy

1. Open your site URL.
2. Tap **Create sync code** on one device.
3. On another device, open the same site and enter the code under **Connect**.
4. Changes merge automatically (higher counts win; most recent date wins on ties).

Treat the sync code like a password — anyone with it can read or edit your log.

## Data & privacy

- Tracking is always cached in **browser localStorage** (`baby-food-tracker`)
- With sync enabled, data is also stored in **Netlify Blobs** under your sync code
- No accounts, no analytics, no third-party services
- Sync code is stored locally as `baby-food-tracker-sync-id`

## Project structure

```
data/
  knowledge-base.json   # feeding principles, allergen schedule, daily plan
  products.json         # 100 products (metadata)
  product-names.json    # Product names in UK / EN / ES / DE
netlify/
  functions/sync.ts     # GET/PUT sync API backed by Netlify Blobs
src/
  components/           # Table, filters, progress, sync panel
  hooks/                # Tracker + sync logic
  storage/              # Merge + API client
  i18n/                 # UI translations
```

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Netlify Functions](https://docs.netlify.com/build/functions/overview/) + [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) for sync
- Mobile-first CSS, no UI framework

---

**Suggested GitHub About description:**

> Baby complementary-feeding tracker — log 100 foods with counters, multilingual UI (UK/EN/ES/DE), cross-device sync via Netlify, offline PWA-ready static app.

**Suggested topics:** `baby-food`, `complementary-feeding`, `react`, `vite`, `typescript`, `netlify`, `pwa`, `tracker`, `ukrainian`
