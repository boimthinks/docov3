# Agent Memory — doco_v3

## Project
- **Name:** doco_v3 — AI-powered document management app (React + Vite + Tailwind CSS)
- **Location:** `/data/data/com.termux/files/home/doco_v3`
- **Owner:** boimthinks (abahbimbim@gmail.com)
- **GitHub:** https://github.com/boimthinks/docov3 (branch: `main`)

## Tech Stack
- React 19, Vite 6, TypeScript 5.8
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- @google/genai (Gemini API)
- Express / Dexie (IndexedDB wrapper)
- Lucide React icons, Motion (framer motion)

## Project Files & Structure
```
.
├── src/
│   ├── App.tsx          # Main app, routing, layout, SW registration
│   ├── main.tsx         # Entry point
│   ├── db.ts            # IndexedDB via Dexie (v1→v2 schema)
│   ├── types.ts         # TypeScript types (Document, FamilyMember, etc.)
│   ├── constants.ts     # Static categories (DEFAULT_CATEGORIES)
│   ├── utils.ts         # Expiry status, date formatting, image compression
│   ├── index.css        # Global styles / Tailwind + custom animations
│   └── components/      # UI components
│       ├── AddEditDocument.tsx   # Add/edit document form
│       ├── AlertsPage.tsx        # Expiry alerts page
│       ├── BottomNavigation.tsx  # Bottom nav bar (fixed z-40)
│       ├── ConfirmModal.tsx      # Reusable modal (createPortal → document.body)
│       ├── Dashboard.tsx         # Home dashboard
│       ├── DocumentDetail.tsx    # Document detail view + delete confirm
│       ├── DocumentList.tsx      # Document list with search/filter
│       ├── Header.tsx            # App header (sticky z-30)
│       ├── LockScreen.tsx        # PIN lock screen
│       ├── LucideIcon.tsx        # Dynamic Lucide icon component
│       ├── MeSettings.tsx        # Settings: family mgmt, backup/restore, wipe
│       └── Onboarding.tsx        # First-time setup wizard
├── public/
│   ├── sw.js            # Service Worker (PWA offline cache)
│   ├── assets/          # Logo icons (64, 128, 256, original)
├── netlify.toml         # Netlify deploy config
├── index.html           # Entry HTML
├── package.json         # Scripts: dev, build, preview, clean, lint
├── vite.config.ts       # Vite config (React + Tailwind plugins, @ alias)
├── tsconfig.json
└── agent.md             # This file
```

## What Has Been Done

### Initial Setup (2026-07-17)
- Initialized git repo, set user.name=boimthinks, user.email=abahbimbim@gmail.com
- Created public repo `docov3` on GitHub via `gh` CLI
- Renamed branch `master` → `main`, set default branch to `main`
- Pushed all code to GitHub

### PWA Enhancement (2026-07-17)
- **manifest.json** — full PWA manifest with shortcuts, maskable icons, categories
- **icons/** — all PWA icons created via Python/Pillow
- **favicon.ico** — multi-size (16x16, 32x32, 48x48)
- **index.html** — PWA meta tags + splash screen
- **sw.js** — production asset caching

### Bug Fixes (2026-07-17)
1. **vite.config.ts** — Fixed corrupted UTF-8 character (`âfile`)
2. **MeSettings.tsx** — Removed duplicate broken `if` statement (line 287-288)
3. **ConfirmModal.tsx** — Fixed modal centering:
   - Changed `backdrop-blur-sm` → `backdrop-blur-md` for stronger blur
   - Removed `p-4` from overlay, added `mx-4` to modal card
4. **MeSettings.tsx** — Fixed modal centering:
   - Local `ConfirmModal` now uses `ReactDOM.createPortal` → `document.body`
   - Wipe confirm modal replaced inline HTML with `ConfirmModal` component
5. **DocumentDetail.tsx** — Fixed delete document modal:
   - Replaced inline modal with global `ConfirmModal` component
   - Used correct props: `isOpen`, `onClose`, `onConfirm`, `type="danger"`

### Modal Architecture (Important)
- **Global ConfirmModal** (`ConfirmModal.tsx`): Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `type`, `icon`
- **Local ConfirmModal** (`MeSettings.tsx`): Props: `title`, `message`, `onConfirm`, `onCancel`, `danger`
- Both use `ReactDOM.createPortal` → `document.body` for full-screen centering and blur

## Known Issues / Limitations

### Build Error on Android (Termux)
- **Rollup native module:** `@rollup/rollup-android-arm64` fails on Android
- **Solution:** Build on Netlify (Linux x86_64) or standard machine

### API Key Requirement
- App uses `@google/genai` — requires `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`
- Must be set in Netlify environment variables for production

## Next Steps
- [ ] Deploy to Netlify (connect repo to netlify.app)
- [ ] Set Gemini API key env var in Netlify
- [ ] Additional revisions per user request

## Agent Notes
- User speaks Indonesian — respond in Indonesian unless technical terms need English
- User's home dir: `/data/data/com.termux/files/home`
- Dev server runs on port 3000 (or next available)
- Run `npm run dev` from `/data/data/com.termux/files/home/doco_v3`
