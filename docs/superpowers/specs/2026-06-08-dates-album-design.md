# Nath & Dai — Dates Album App Design Spec

**Date:** 2026-06-08  
**Stack:** React + Vite + Firebase (Firestore + Storage)  
**Deploy:** GitHub Pages (user deploys manually)  
**Access:** Fully public — anyone can view, create dates, and upload photos

---

## 1. Overview

A personal photo album web app for Nath and Dai to document their adventures together. The home page shows all dates as polaroid-style cards. Selecting a card opens the date detail view with all its photos. Anyone with the link can add new dates and upload photos. All changes appear in real-time without page reload.

---

## 2. Design System

### Style
Vintage Analog / Retro Film × Bohemian Earthy. Warm parchment backgrounds, analog photo filters, film grain texture, polaroid card frames with random tilt.

### Color Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F5E6C8` | Page background (warm faded parchment) |
| `--card` | `#FDF6E3` | Polaroid card base |
| `--text` | `#2C1A0E` | Primary text (deep sepia brown) |
| `--accent` | `#C67B5C` | Terracotta — buttons, active states |
| `--border` | `#D4A574` | Warm sepia — card borders, dividers |
| `--muted` | `#4A7B7C` | Dusty teal — secondary actions, tags |
| `--pink` | `#E8B4B8` | Decorative soft pink accents |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Page title / hero headings | Abril Fatface | 400 |
| Date stamps / card titles | Pacifico | 400 |
| Body / labels / form text | Merriweather | 300, 400, 700 |

```css
@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Pacifico&family=Merriweather:wght@300;400;700&display=swap');
```

### Visual Effects
- **Film grain:** SVG `feTurbulence` filter at 15% opacity on page background
- **Photo filter:** `filter: sepia(15%) contrast(1.05) saturate(0.85)` on all images
- **Light leak:** `rgba(255,200,100,0.15)` warm amber gradient overlay on photo cards
- **Polaroid tilt:** Each card gets a deterministic random rotation between -2° and +2° (seeded by `dateId` to stay stable)
- **Card hover:** rotation resets to 0° + `translateY(-4px)` lift, 200ms ease-out

---

## 3. App Structure

Single-page React app. No router — a `useState` variable (`selectedDateId`) controls which view renders.

### View 1: Adventures Home (`selectedDateId === null`)

- Full-width header: `"Nath & Dai"` in Abril Fatface, film grain background
- Masonry grid of polaroid date cards, ordered by `date` descending
- Each card shows:
  - Cover photo (cropped to card dimensions using `focalX`/`focalY` as `object-position`)
  - If no photos yet: a warm parchment placeholder with a camera icon
  - Adventure title in Pacifico
  - Date stamp in Merriweather small
- `"+ New Date"` button (terracotta accent) → opens Create Date modal
- New cards appear in real-time via Firestore `onSnapshot`

### View 2: Date Detail (`selectedDateId !== null`)

- Back arrow → sets `selectedDateId` to `null`
- Hero section: first photo full-width + adventure title + date in Abril Fatface
- 3-column masonry photo grid below
- Each photo card:
  - Analog filter + light leak overlay
  - Drag handle icon (top-left) for reordering
  - Click → opens Focal Point Editor overlay
- `"+ Add Photos"` button → file picker, multi-select, uploads in parallel
- Photos appear in real-time via Firestore `onSnapshot`

### Modal: Create New Date

Fields:
- Title (text input, required)
- Date (date input, styled as vintage stamp, required)
- Cover photo upload (optional — can add photos later)

On submit:
1. Create Firestore document in `dates/` collection
2. If cover photo provided, upload to Storage and write as first photo doc
3. Modal closes, card appears on home instantly

### Focal Point Editor Overlay

- Opens when user clicks any photo in the detail view
- Displays the full photo
- A crosshair cursor follows mouse/drag
- On click or drag-end: saves `focalX`, `focalY` (0.0–1.0) to Firestore
- Applied in grid via `object-position: {focalX * 100}% {focalY * 100}%`
- Close via Escape key or outside click

---

## 4. Data Model (Firestore)

```
dates/                           ← top-level collection
  {dateId}/
    title:         string        "First hike together"
    date:          timestamp     The date of the adventure
    coverPhotoId:  string        ID of the cover photo (auto = first by order)
    createdAt:     timestamp     Server timestamp on creation

    photos/                      ← subcollection
      {photoId}/
        storageUrl:  string      Firebase Storage download URL
        order:       number      Integer, 0-indexed. Controls display order.
        focalX:      number      0.0–1.0 horizontal focal point (default 0.5)
        focalY:      number      0.0–1.0 vertical focal point (default 0.5)
        uploadedAt:  timestamp
```

**Firebase Storage path:** `dates/{dateId}/{photoId}`

**Firestore security rules:**
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 5. Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Build tool | Vite | Fast dev server, static output for GitHub Pages |
| Styling | Tailwind CSS + CSS custom properties | Utility classes + design tokens |
| Drag-to-reorder | `@dnd-kit/core` | Lightweight, accessible, no jQuery dependency |
| Image compression | `browser-image-compression` | Compress before upload, max 1200px / ~500KB |
| Real-time | Firestore `onSnapshot` | Built-in, zero extra config |
| Routing | None — `useState` | No URL routing needed for 2-view app |
| GitHub Pages base | `vite.config.js` `base: '/nath-dai-album/'` | Required for asset paths to resolve — must match the actual GitHub repo name |

### Photo Upload Flow
1. User selects files via file input (multi-select)
2. Each file compressed client-side to max 1200px / ~500KB
3. Uploaded to `dates/{dateId}/{uuid}` in Firebase Storage
4. Firestore doc created: `{ storageUrl, order: lastOrder + 1, focalX: 0.5, focalY: 0.5, uploadedAt }`
5. `onSnapshot` picks it up → photo appears in UI instantly

### Drag-to-Reorder Flow
1. User grabs drag handle and reorders photos
2. On drop: compute new `order` values for all affected photos
3. Write a Firestore batch update (single atomic write)
4. `coverPhotoId` on the parent date doc updates if `order: 0` changed

---

## 6. Component Tree

```
App
├── Header
├── HomeView
│   ├── DateCard (×n)  — polaroid card, tilt, hover
│   └── CreateDateModal
│       ├── TitleInput
│       ├── DatePicker
│       └── PhotoUploader
└── DetailView
    ├── HeroPhoto
    ├── PhotoGrid (dnd-kit SortableContext)
    │   └── SortablePhoto (×n)
    │       └── FocalPointEditor (overlay)
    └── AddPhotosButton
```

---

## 7. Out of Scope

- Authentication / login (fully public by design)
- Deleting dates or photos (can add in a future iteration)
- Comments or reactions
- Dark mode
- Mobile-optimized photo grid (desktop-first for now)
