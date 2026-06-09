# Nath & Dai Dates Album — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public React + Firebase photo album web app where Nath and Dai can document their adventures with polaroid-style date cards, real-time photo uploads, drag-to-reorder, and a focal point editor.

**Architecture:** Single-page React app (Vite) with no router — a `selectedDateId` state in `App.jsx` switches between HomeView and DetailView. Firebase Firestore stores dates and photo metadata with real-time `onSnapshot` listeners. Firebase Storage holds the actual image files.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Firebase 10, @dnd-kit/core + @dnd-kit/sortable, browser-image-compression, Vitest + React Testing Library

---

## File Map

```
nath-dai-album/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                          ← Firebase config template (committed)
├── .env.local                            ← Actual Firebase keys (NOT committed)
├── src/
│   ├── main.jsx                          ← React entry, mounts <App />
│   ├── App.jsx                           ← Root: selectedDateId state, HomeView/DetailView switch
│   ├── firebase.js                       ← Firebase init, exports db + storage
│   ├── index.css                         ← CSS vars, fonts, film grain, base styles
│   ├── test/
│   │   └── setup.js                      ← @testing-library/jest-dom setup
│   ├── utils/
│   │   ├── tiltFromId.js                 ← Deterministic -2°→+2° tilt from Firestore ID
│   │   ├── compressImage.js              ← browser-image-compression wrapper
│   │   └── uploadPhoto.js               ← Storage upload + Firestore doc write
│   ├── hooks/
│   │   ├── useDates.js                   ← onSnapshot dates collection → [{id,...}]
│   │   └── usePhotos.js                  ← onSnapshot photos subcollection → [{id,...}]
│   └── components/
│       ├── Header.jsx                    ← "Nath & Dai" title bar
│       ├── HomeView.jsx                  ← Masonry grid of DateCards + "+ New Date" button
│       ├── DateCard.jsx                  ← Polaroid card (cover photo, title, date)
│       ├── CreateDateModal.jsx           ← Modal form: title + date + optional photo
│       ├── DetailView.jsx                ← Hero photo + PhotoGrid + AddPhotosButton
│       ├── HeroPhoto.jsx                 ← Full-width first photo with focal point
│       ├── PhotoGrid.jsx                 ← dnd-kit SortableContext wrapper
│       ├── SortablePhoto.jsx             ← Draggable photo card with focal point click
│       ├── FocalPointEditor.jsx          ← Overlay to set focalX/focalY on a photo
│       └── AddPhotosButton.jsx           ← File input trigger + upload orchestration
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/test/setup.js`

- [ ] **Step 1: Initialize project**

```bash
cd C:/Users/natan/.claude/code-projects
npm create vite@latest nath-dai-album -- --template react
cd nath-dai-album
npm install
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install firebase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities browser-image-compression
npm install -D tailwindcss postcss autoprefixer vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure vite.config.js**

Replace the generated `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nath-dai-album/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Configure tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Abril Fatface"', 'serif'],
        script: ['Pacifico', 'cursive'],
        body: ['Merriweather', 'serif'],
      },
      colors: {
        parchment: '#F5E6C8',
        card: '#FDF6E3',
        sepia: '#2C1A0E',
        terracotta: '#C67B5C',
        border: '#D4A574',
        teal: '#4A7B7C',
        blush: '#E8B4B8',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Create test setup file**

`src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 7: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts at `http://localhost:5173/nath-dai-album/`

- [ ] **Step 8: Commit**

```bash
git init
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/
git commit -m "feat: project scaffold with React, Vite, Tailwind, Firebase, dnd-kit"
```

---

## Task 2: Firebase Config

**Files:**
- Create: `.env.example`
- Create: `.env.local` (not committed)
- Create: `src/firebase.js`
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
.env.local
.env.*.local
```

- [ ] **Step 2: Create .env.example**

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

- [ ] **Step 3: Set up Firebase project**

1. Go to https://console.firebase.google.com
2. Create a new project named `nath-dai-album`
3. Add a Web app → copy the config object
4. Enable **Firestore Database** (start in test mode)
5. Enable **Storage** (start in test mode)

- [ ] **Step 4: Create .env.local with your actual values**

Copy `.env.example` to `.env.local` and fill in your Firebase project values from step 3.

- [ ] **Step 5: Create src/firebase.js**

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

- [ ] **Step 6: Set Firestore security rules**

In Firebase Console → Firestore → Rules, replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Do the same in Storage → Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add .gitignore .env.example src/firebase.js
git commit -m "feat: Firebase config and security rules"
```

---

## Task 3: Global Design System (CSS)

**Files:**
- Create/Replace: `src/index.css`

- [ ] **Step 1: Write the global stylesheet**

Replace `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Pacifico&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #F5E6C8;
  --card: #FDF6E3;
  --text: #2C1A0E;
  --accent: #C67B5C;
  --border: #D4A574;
  --muted: #4A7B7C;
  --blush: #E8B4B8;
  --grain-opacity: 0.15;
  --light-leak: rgba(255, 200, 100, 0.15);
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Merriweather', serif;
  min-height: 100dvh;
  position: relative;
}

/* Film grain overlay on page background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  background-repeat: repeat;
}

/* All content above grain */
#root {
  position: relative;
  z-index: 1;
}

/* Analog photo filter applied to all album images */
.photo-analog {
  filter: sepia(15%) contrast(1.05) saturate(0.85);
  position: relative;
}

/* Light leak overlay on photo cards */
.photo-analog::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--light-leak) 0%, transparent 60%);
  pointer-events: none;
  border-radius: inherit;
}
```

- [ ] **Step 2: Verify fonts load**

```bash
npm run dev
```

Open browser → check DevTools Network tab for Google Fonts requests. All three fonts should load.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: global design system — film grain, CSS tokens, analog photo filter"
```

---

## Task 4: tiltFromId Utility

**Files:**
- Create: `src/utils/tiltFromId.js`
- Create: `src/utils/tiltFromId.test.js`

- [ ] **Step 1: Write the failing test**

`src/utils/tiltFromId.test.js`:
```js
import { tiltFromId } from './tiltFromId'

describe('tiltFromId', () => {
  it('returns a number between -2 and 2', () => {
    const tilt = tiltFromId('abc123XYZ789abc123XY')
    expect(tilt).toBeGreaterThanOrEqual(-2)
    expect(tilt).toBeLessThanOrEqual(2)
  })

  it('is deterministic — same ID always returns same tilt', () => {
    const id = 'abc123XYZ789abc123XY'
    expect(tiltFromId(id)).toBe(tiltFromId(id))
  })

  it('returns different values for different IDs', () => {
    const tilts = new Set([
      tiltFromId('aaaaaaaaaaaaaaaaaaa1'),
      tiltFromId('aaaaaaaaaaaaaaaaaaa2'),
      tiltFromId('aaaaaaaaaaaaaaaaaaa3'),
      tiltFromId('bbbbbbbbbbbbbbbbbbb1'),
    ])
    expect(tilts.size).toBeGreaterThan(1)
  })

  it('handles empty string without throwing', () => {
    expect(() => tiltFromId('')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tiltFromId
```

Expected: FAIL — `Cannot find module './tiltFromId'`

- [ ] **Step 3: Implement tiltFromId.js**

`src/utils/tiltFromId.js`:
```js
export function tiltFromId(id) {
  const hash = id.split('').reduce(
    (acc, c) => (((acc << 5) - acc + c.charCodeAt(0)) | 0) >>> 0,
    0
  )
  return (hash % 401) / 100 - 2
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tiltFromId
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/tiltFromId.js src/utils/tiltFromId.test.js
git commit -m "feat: tiltFromId utility — deterministic rotation from Firestore ID"
```

---

## Task 5: compressImage Utility

**Files:**
- Create: `src/utils/compressImage.js`
- Create: `src/utils/compressImage.test.js`

- [ ] **Step 1: Write the failing test**

`src/utils/compressImage.test.js`:
```js
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { compressImage } from './compressImage'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

import imageCompression from 'browser-image-compression'

describe('compressImage', () => {
  beforeEach(() => {
    imageCompression.mockReset()
  })

  it('calls imageCompression with max 1200px and 0.5MB', async () => {
    const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const mockCompressed = new File(['compressed'], 'photo.jpg', { type: 'image/jpeg' })
    imageCompression.mockResolvedValue(mockCompressed)

    const result = await compressImage(mockFile)

    expect(imageCompression).toHaveBeenCalledWith(mockFile, {
      maxWidthOrHeight: 1200,
      maxSizeMB: 0.5,
      useWebWorker: true,
    })
    expect(result).toBe(mockCompressed)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- compressImage
```

Expected: FAIL — `Cannot find module './compressImage'`

- [ ] **Step 3: Implement compressImage.js**

`src/utils/compressImage.js`:
```js
import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.5,
    useWebWorker: true,
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- compressImage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/compressImage.js src/utils/compressImage.test.js
git commit -m "feat: compressImage utility — max 1200px / 0.5MB before upload"
```

---

## Task 6: useDates Hook

**Files:**
- Create: `src/hooks/useDates.js`
- Create: `src/hooks/useDates.test.js`

- [ ] **Step 1: Write the failing test**

`src/hooks/useDates.test.js`:
```js
import { vi, describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDates } from './useDates'

vi.mock('../firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}))

import { onSnapshot } from 'firebase/firestore'

describe('useDates', () => {
  it('returns empty array initially', () => {
    onSnapshot.mockImplementation(() => () => {})
    const { result } = renderHook(() => useDates())
    expect(result.current).toEqual([])
  })

  it('returns dates from Firestore snapshot', () => {
    let capturedCallback
    onSnapshot.mockImplementation((_, callback) => {
      capturedCallback = callback
      return () => {}
    })

    const { result } = renderHook(() => useDates())

    act(() => {
      capturedCallback({
        docs: [
          { id: 'id1', data: () => ({ title: 'Hike', date: { toDate: () => new Date('2024-03-15') } }) },
          { id: 'id2', data: () => ({ title: 'Beach', date: { toDate: () => new Date('2024-04-01') } }) },
        ],
      })
    })

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toMatchObject({ id: 'id1', title: 'Hike' })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()
    onSnapshot.mockImplementation(() => unsubscribe)
    const { unmount } = renderHook(() => useDates())
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- useDates
```

Expected: FAIL — `Cannot find module './useDates'`

- [ ] **Step 3: Implement useDates.js**

`src/hooks/useDates.js`:
```js
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useDates() {
  const [dates, setDates] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'dates'), orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [])

  return dates
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- useDates
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDates.js src/hooks/useDates.test.js
git commit -m "feat: useDates hook — real-time Firestore listener for dates collection"
```

---

## Task 7: usePhotos Hook

**Files:**
- Create: `src/hooks/usePhotos.js`
- Create: `src/hooks/usePhotos.test.js`

- [ ] **Step 1: Write the failing test**

`src/hooks/usePhotos.test.js`:
```js
import { vi, describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePhotos } from './usePhotos'

vi.mock('../firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
}))

import { onSnapshot } from 'firebase/firestore'

describe('usePhotos', () => {
  it('returns empty array initially', () => {
    onSnapshot.mockImplementation(() => () => {})
    const { result } = renderHook(() => usePhotos('date1'))
    expect(result.current).toEqual([])
  })

  it('returns photos ordered by order field', () => {
    let capturedCallback
    onSnapshot.mockImplementation((_, callback) => {
      capturedCallback = callback
      return () => {}
    })

    const { result } = renderHook(() => usePhotos('date1'))

    act(() => {
      capturedCallback({
        docs: [
          { id: 'p1', data: () => ({ storageUrl: 'https://url1', order: 0, focalX: 0.5, focalY: 0.5 }) },
          { id: 'p2', data: () => ({ storageUrl: 'https://url2', order: 1, focalX: 0.3, focalY: 0.7 }) },
        ],
      })
    })

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toMatchObject({ id: 'p1', order: 0 })
    expect(result.current[1]).toMatchObject({ id: 'p2', order: 1 })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()
    onSnapshot.mockImplementation(() => unsubscribe)
    const { unmount } = renderHook(() => usePhotos('date1'))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- usePhotos
```

Expected: FAIL — `Cannot find module './usePhotos'`

- [ ] **Step 3: Implement usePhotos.js**

`src/hooks/usePhotos.js`:
```js
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

export function usePhotos(dateId) {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (!dateId) return
    const q = query(
      collection(db, 'dates', dateId, 'photos'),
      orderBy('order', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [dateId])

  return photos
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- usePhotos
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePhotos.js src/hooks/usePhotos.test.js
git commit -m "feat: usePhotos hook — real-time listener for photos subcollection"
```

---

## Task 8: Header Component

**Files:**
- Create: `src/components/Header.jsx`
- Create: `src/components/Header.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/Header.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />)
    expect(screen.getByText('Nath & Dai')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Header />)
    expect(screen.getByText(/nossas aventuras/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- Header
```

Expected: FAIL — `Cannot find module './Header'`

- [ ] **Step 3: Implement Header.jsx**

`src/components/Header.jsx`:
```jsx
export function Header() {
  return (
    <header className="w-full py-12 px-6 text-center border-b-2" style={{ borderColor: 'var(--border)' }}>
      <h1 className="font-display text-6xl md:text-8xl" style={{ color: 'var(--text)' }}>
        Nath & Dai
      </h1>
      <p className="font-body text-sm mt-3 tracking-widest uppercase opacity-60">
        nossas aventuras
      </p>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- Header
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.jsx src/components/Header.test.jsx
git commit -m "feat: Header component — Nath & Dai title with film aesthetic"
```

---

## Task 9: DateCard Component

**Files:**
- Create: `src/components/DateCard.jsx`
- Create: `src/components/DateCard.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/DateCard.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateCard } from './DateCard'

const mockDate = {
  id: 'abc123XYZ789abc123XY',
  title: 'Trilha da Pedra',
  date: { toDate: () => new Date('2024-03-15') },
  coverPhoto: { storageUrl: 'https://example.com/photo.jpg', focalX: 0.5, focalY: 0.3 },
}

describe('DateCard', () => {
  it('renders the adventure title', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    expect(screen.getByText('Trilha da Pedra')).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('renders cover photo when present', () => {
    render(<DateCard date={mockDate} onClick={() => {}} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders placeholder when no cover photo', () => {
    const dateWithoutPhoto = { ...mockDate, coverPhoto: null }
    render(<DateCard date={dateWithoutPhoto} onClick={() => {}} />)
    expect(screen.getByTestId('photo-placeholder')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<DateCard date={mockDate} onClick={onClick} />)
    await userEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledWith(mockDate.id)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- DateCard
```

Expected: FAIL — `Cannot find module './DateCard'`

- [ ] **Step 3: Implement DateCard.jsx**

`src/components/DateCard.jsx`:
```jsx
import { tiltFromId } from '../utils/tiltFromId'

export function DateCard({ date, onClick }) {
  const tilt = tiltFromId(date.id)
  const formattedDate = date.date?.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      role="article"
      onClick={() => onClick(date.id)}
      className="cursor-pointer break-inside-avoid mb-6"
      style={{
        transform: `rotate(${tilt}deg)`,
        transition: 'transform 200ms ease-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${tilt}deg)`)}
    >
      <div
        className="rounded-sm overflow-hidden shadow-lg"
        style={{ backgroundColor: 'var(--card)', border: '8px solid var(--card)', paddingBottom: '0' }}
      >
        <div className="relative overflow-hidden" style={{ paddingBottom: '75%' }}>
          {date.coverPhoto ? (
            <img
              src={date.coverPhoto.storageUrl}
              alt={date.title}
              className="photo-analog absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${(date.coverPhoto.focalX ?? 0.5) * 100}% ${(date.coverPhoto.focalY ?? 0.5) * 100}%`,
              }}
            />
          ) : (
            <div
              data-testid="photo-placeholder"
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--border)', opacity: 0.4 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-3 py-3">
          <p className="font-script text-lg truncate" style={{ color: 'var(--text)' }}>{date.title}</p>
          <p className="font-body text-xs mt-1 opacity-60" style={{ color: 'var(--text)' }}>{formattedDate}</p>
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- DateCard
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/DateCard.jsx src/components/DateCard.test.jsx
git commit -m "feat: DateCard component — polaroid card with tilt, cover photo, focal point"
```

---

## Task 10: CreateDateModal Component

**Files:**
- Create: `src/components/CreateDateModal.jsx`
- Create: `src/components/CreateDateModal.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/CreateDateModal.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateDateModal } from './CreateDateModal'

describe('CreateDateModal', () => {
  it('renders title and date inputs', () => {
    render(<CreateDateModal onClose={() => {}} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<CreateDateModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<CreateDateModal onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('disables submit button when title or date is empty', () => {
    render(<CreateDateModal onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- CreateDateModal
```

Expected: FAIL — `Cannot find module './CreateDateModal'`

- [ ] **Step 3: Implement CreateDateModal.jsx**

`src/components/CreateDateModal.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'

export function CreateDateModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setLoading(true)
    const dateRef = await addDoc(collection(db, 'dates'), {
      title,
      date: new Date(date),
      coverPhotoId: null,
      createdAt: serverTimestamp(),
    })
    if (file) {
      const compressed = await compressImage(file)
      await uploadPhoto(compressed, dateRef.id, 0)
    }
    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-sm shadow-2xl p-8"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <h2 className="font-display text-3xl mb-6" style={{ color: 'var(--text)' }}>
          Nova aventura
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-b-2 bg-transparent py-2 font-body text-base focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Ex: Trilha da Pedra Grande"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
              Data *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-b-2 bg-transparent py-2 font-body text-base focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="photo" className="font-body text-sm font-bold" style={{ color: 'var(--text)' }}>
              Foto de capa (opcional)
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="font-body text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 font-body text-sm border rounded-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title || !date || loading}
              className="px-5 py-2 font-body text-sm text-white rounded-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- CreateDateModal
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/CreateDateModal.jsx src/components/CreateDateModal.test.jsx
git commit -m "feat: CreateDateModal — form with title, date, optional cover photo upload"
```

---

## Task 11: uploadPhoto Utility

**Files:**
- Create: `src/utils/uploadPhoto.js`
- Create: `src/utils/uploadPhoto.test.js`

- [ ] **Step 1: Write the failing test**

`src/utils/uploadPhoto.test.js`:
```js
import { vi, describe, it, expect } from 'vitest'

vi.mock('../firebase', () => ({ db: {}, storage: {} }))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

import { uploadPhoto } from './uploadPhoto'
import { uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc } from 'firebase/firestore'

describe('uploadPhoto', () => {
  it('uploads file to storage and writes Firestore doc', async () => {
    const mockFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    uploadBytes.mockResolvedValue({})
    getDownloadURL.mockResolvedValue('https://storage.example.com/photo.jpg')
    addDoc.mockResolvedValue({ id: 'newPhotoId' })

    const result = await uploadPhoto(mockFile, 'dateId1', 2)

    expect(uploadBytes).toHaveBeenCalled()
    expect(getDownloadURL).toHaveBeenCalled()
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        storageUrl: 'https://storage.example.com/photo.jpg',
        order: 2,
        focalX: 0.5,
        focalY: 0.5,
      })
    )
    expect(result).toBe('newPhotoId')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- uploadPhoto
```

Expected: FAIL — `Cannot find module './uploadPhoto'`

- [ ] **Step 3: Implement uploadPhoto.js**

`src/utils/uploadPhoto.js`:
```js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '../firebase'

export async function uploadPhoto(file, dateId, order) {
  const photoId = crypto.randomUUID()
  const storageRef = ref(storage, `dates/${dateId}/${photoId}`)
  await uploadBytes(storageRef, file)
  const storageUrl = await getDownloadURL(storageRef)
  const docRef = await addDoc(collection(db, 'dates', dateId, 'photos'), {
    storageUrl,
    order,
    focalX: 0.5,
    focalY: 0.5,
    uploadedAt: serverTimestamp(),
  })
  // Denormalize cover photo onto the date doc so DateCard can render without N+1 queries
  if (order === 0) {
    await updateDoc(doc(db, 'dates', dateId), {
      coverPhoto: { storageUrl, focalX: 0.5, focalY: 0.5 },
    })
  }
  return docRef.id
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- uploadPhoto
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/uploadPhoto.js src/utils/uploadPhoto.test.js
git commit -m "feat: uploadPhoto utility — Storage upload + Firestore doc with focal point defaults"
```

---

## Task 12: HomeView Component

**Files:**
- Create: `src/components/HomeView.jsx`
- Create: `src/components/HomeView.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/HomeView.test.jsx`:
```jsx
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeView } from './HomeView'

vi.mock('../hooks/useDates', () => ({
  useDates: () => [
    { id: 'id1', title: 'Trilha', date: { toDate: () => new Date('2024-03-15') }, coverPhoto: null },
    { id: 'id2', title: 'Praia', date: { toDate: () => new Date('2024-04-01') }, coverPhoto: null },
  ],
}))

describe('HomeView', () => {
  it('renders all date cards', () => {
    render(<HomeView onSelectDate={() => {}} />)
    expect(screen.getByText('Trilha')).toBeInTheDocument()
    expect(screen.getByText('Praia')).toBeInTheDocument()
  })

  it('renders + New Date button', () => {
    render(<HomeView onSelectDate={() => {}} />)
    expect(screen.getByRole('button', { name: /nova aventura/i })).toBeInTheDocument()
  })

  it('opens modal when + New Date is clicked', async () => {
    render(<HomeView onSelectDate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /nova aventura/i }))
    expect(screen.getByText('Nova aventura')).toBeInTheDocument()
  })

  it('calls onSelectDate when a card is clicked', async () => {
    const onSelectDate = vi.fn()
    render(<HomeView onSelectDate={onSelectDate} />)
    await userEvent.click(screen.getAllByRole('article')[0])
    expect(onSelectDate).toHaveBeenCalledWith('id1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- HomeView
```

Expected: FAIL — `Cannot find module './HomeView'`

- [ ] **Step 3: Implement HomeView.jsx**

`src/components/HomeView.jsx`:
```jsx
import { useState } from 'react'
import { useDates } from '../hooks/useDates'
import { DateCard } from './DateCard'
import { CreateDateModal } from './CreateDateModal'

export function HomeView({ onSelectDate }) {
  const dates = useDates()
  const [showModal, setShowModal] = useState(false)

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 font-body text-sm text-white rounded-sm shadow-md"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-label="Nova aventura"
        >
          + Nova aventura
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-24 opacity-50">
          <p className="font-script text-2xl">Nenhuma aventura ainda...</p>
          <p className="font-body text-sm mt-2">Clique em "+ Nova aventura" para começar!</p>
        </div>
      ) : (
        <div style={{ columns: '3', columnGap: '1.5rem' }}>
          {dates.map((date) => (
            <DateCard key={date.id} date={date} onClick={onSelectDate} />
          ))}
        </div>
      )}

      {showModal && <CreateDateModal onClose={() => setShowModal(false)} />}
    </main>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- HomeView
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/HomeView.jsx src/components/HomeView.test.jsx
git commit -m "feat: HomeView — masonry grid of date cards with create modal"
```

---

## Task 13: FocalPointEditor Component

**Files:**
- Create: `src/components/FocalPointEditor.jsx`
- Create: `src/components/FocalPointEditor.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/FocalPointEditor.test.jsx`:
```jsx
import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocalPointEditor } from './FocalPointEditor'

const mockPhoto = {
  id: 'photo1',
  storageUrl: 'https://example.com/photo.jpg',
  focalX: 0.5,
  focalY: 0.5,
}

describe('FocalPointEditor', () => {
  it('renders the photo', () => {
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={() => {}} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', mockPhoto.storageUrl)
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the backdrop', async () => {
    const onClose = vi.fn()
    render(<FocalPointEditor photo={mockPhoto} dateId="date1" onClose={onClose} />)
    await userEvent.click(screen.getByTestId('focal-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- FocalPointEditor
```

Expected: FAIL — `Cannot find module './FocalPointEditor'`

- [ ] **Step 3: Implement FocalPointEditor.jsx**

`src/components/FocalPointEditor.jsx`:
```jsx
import { useEffect, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function FocalPointEditor({ photo, dateId, onClose }) {
  const imgRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function computeFocal(e) {
    const rect = imgRef.current.getBoundingClientRect()
    const focalX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const focalY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    return { focalX, focalY }
  }

  async function handleClick(e) {
    const { focalX, focalY } = computeFocal(e)
    await updateDoc(doc(db, 'dates', dateId, 'photos', photo.id), { focalX, focalY })
    // Keep denormalized cover photo in sync if this is the first photo
    if (photo.order === 0) {
      await updateDoc(doc(db, 'dates', dateId), {
        'coverPhoto.focalX': focalX,
        'coverPhoto.focalY': focalY,
      })
    }
    onClose()
  }

  return (
    <div
      data-testid="focal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(44,26,14,0.85)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-3xl w-full">
        <p className="font-body text-sm text-center mb-3" style={{ color: 'var(--card)', opacity: 0.8 }}>
          Clique na foto para definir o ponto de foco
        </p>
        <div className="relative cursor-crosshair" onClick={handleClick}>
          <img
            ref={imgRef}
            src={photo.storageUrl}
            alt="Definir ponto de foco"
            className="w-full rounded-sm"
            draggable={false}
          />
          <div
            className="absolute w-6 h-6 rounded-full border-4 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow"
            style={{
              left: `${photo.focalX * 100}%`,
              top: `${photo.focalY * 100}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- FocalPointEditor
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/FocalPointEditor.jsx src/components/FocalPointEditor.test.jsx
git commit -m "feat: FocalPointEditor — click to set focalX/focalY, saves to Firestore"
```

---

## Task 14: PhotoGrid + SortablePhoto (dnd-kit)

**Files:**
- Create: `src/components/SortablePhoto.jsx`
- Create: `src/components/PhotoGrid.jsx`
- Create: `src/components/PhotoGrid.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/PhotoGrid.test.jsx`:
```jsx
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoGrid } from './PhotoGrid'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}))
vi.mock('../firebase', () => ({ db: {} }))

const photos = [
  { id: 'p1', storageUrl: 'https://example.com/1.jpg', order: 0, focalX: 0.5, focalY: 0.5 },
  { id: 'p2', storageUrl: 'https://example.com/2.jpg', order: 1, focalX: 0.3, focalY: 0.7 },
]

describe('PhotoGrid', () => {
  it('renders all photos', () => {
    render(<PhotoGrid photos={photos} dateId="date1" />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
  })

  it('renders empty state when no photos', () => {
    render(<PhotoGrid photos={[]} dateId="date1" />)
    expect(screen.getByText(/nenhuma foto ainda/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- PhotoGrid
```

Expected: FAIL — `Cannot find module './PhotoGrid'`

- [ ] **Step 3: Implement SortablePhoto.jsx**

`src/components/SortablePhoto.jsx`:
```jsx
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FocalPointEditor } from './FocalPointEditor'

export function SortablePhoto({ photo, dateId }) {
  const [editingFocal, setEditingFocal] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative group rounded-sm overflow-hidden shadow-md"
      >
        <div className="relative" style={{ paddingBottom: '100%' }}>
          <img
            src={photo.storageUrl}
            alt=""
            className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
            style={{
              objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%`,
            }}
            onClick={() => setEditingFocal(true)}
          />
        </div>
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          style={{ backgroundColor: 'rgba(253,246,227,0.9)', color: 'var(--text)', cursor: 'grab' }}
          aria-label="Arrastar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>
      {editingFocal && (
        <FocalPointEditor photo={photo} dateId={dateId} onClose={() => setEditingFocal(false)} />
      )}
    </>
  )
}
```

- [ ] **Step 4: Implement PhotoGrid.jsx**

`src/components/PhotoGrid.jsx`:
```jsx
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { SortablePhoto } from './SortablePhoto'

export function PhotoGrid({ photos, dateId }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(photos, oldIndex, newIndex)

    const batch = writeBatch(db)
    reordered.forEach((photo, index) => {
      batch.update(doc(db, 'dates', dateId, 'photos', photo.id), { order: index })
    })
    await batch.commit()

    // Sync denormalized cover photo on the date doc if first photo changed
    const newFirst = reordered[0]
    if (newFirst && newFirst.id !== photos[0]?.id) {
      await import('firebase/firestore').then(({ updateDoc, doc: firestoreDoc }) =>
        updateDoc(firestoreDoc(db, 'dates', dateId), {
          coverPhoto: { storageUrl: newFirst.storageUrl, focalX: newFirst.focalX, focalY: newFirst.focalY },
        })
      )
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 opacity-50">
        <p className="font-script text-xl">Nenhuma foto ainda...</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <SortablePhoto key={photo.id} photo={photo} dateId={dateId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- PhotoGrid
```

Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/SortablePhoto.jsx src/components/PhotoGrid.jsx src/components/PhotoGrid.test.jsx
git commit -m "feat: PhotoGrid + SortablePhoto — dnd-kit drag-to-reorder with batch Firestore update"
```

---

## Task 15: AddPhotosButton Component

**Files:**
- Create: `src/components/AddPhotosButton.jsx`
- Create: `src/components/AddPhotosButton.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/AddPhotosButton.test.jsx`:
```jsx
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPhotosButton } from './AddPhotosButton'

vi.mock('../utils/compressImage', () => ({ compressImage: vi.fn((f) => Promise.resolve(f)) }))
vi.mock('../utils/uploadPhoto', () => ({ uploadPhoto: vi.fn().mockResolvedValue('newId') }))

describe('AddPhotosButton', () => {
  it('renders the button', () => {
    render(<AddPhotosButton dateId="date1" currentPhotoCount={2} />)
    expect(screen.getByRole('button', { name: /adicionar fotos/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- AddPhotosButton
```

Expected: FAIL — `Cannot find module './AddPhotosButton'`

- [ ] **Step 3: Implement AddPhotosButton.jsx**

`src/components/AddPhotosButton.jsx`:
```jsx
import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'

export function AddPhotosButton({ dateId, currentPhotoCount }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    await Promise.all(
      files.map((file, i) =>
        compressImage(file).then((compressed) =>
          uploadPhoto(compressed, dateId, currentPhotoCount + i)
        )
      )
    )
    setUploading(false)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => inputRef.current.click()}
        disabled={uploading}
        className="px-6 py-3 font-body text-sm text-white rounded-sm shadow-md disabled:opacity-40"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="Adicionar fotos"
      >
        {uploading ? 'Enviando...' : '+ Adicionar fotos'}
      </button>
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- AddPhotosButton
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/AddPhotosButton.jsx src/components/AddPhotosButton.test.jsx
git commit -m "feat: AddPhotosButton — multi-file upload with compression, parallel uploads"
```

---

## Task 16: HeroPhoto + DetailView Assembly

**Files:**
- Create: `src/components/HeroPhoto.jsx`
- Create: `src/components/DetailView.jsx`
- Create: `src/components/DetailView.test.jsx`

- [ ] **Step 1: Implement HeroPhoto.jsx**

`src/components/HeroPhoto.jsx`:
```jsx
export function HeroPhoto({ photo }) {
  if (!photo) return null
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '60vh' }}>
      <img
        src={photo.storageUrl}
        alt=""
        className="photo-analog w-full h-full object-cover"
        style={{
          objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 40%, rgba(44,26,14,0.7) 100%)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write the failing test for DetailView**

`src/components/DetailView.test.jsx`:
```jsx
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailView } from './DetailView'

vi.mock('../hooks/usePhotos', () => ({
  usePhotos: () => [
    { id: 'p1', storageUrl: 'https://example.com/1.jpg', order: 0, focalX: 0.5, focalY: 0.5 },
  ],
}))
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), writeBatch: vi.fn(() => ({ update: vi.fn(), commit: vi.fn() })) }))
vi.mock('../firebase', () => ({ db: {} }))

const mockDate = {
  id: 'date1',
  title: 'Trilha da Pedra',
  date: { toDate: () => new Date('2024-03-15') },
}

describe('DetailView', () => {
  it('renders the adventure title', () => {
    render(<DetailView date={mockDate} onBack={() => {}} />)
    expect(screen.getByText('Trilha da Pedra')).toBeInTheDocument()
  })

  it('renders back button', () => {
    render(<DetailView date={mockDate} onBack={() => {}} />)
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn()
    render(<DetailView date={mockDate} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /voltar/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- DetailView
```

Expected: FAIL — `Cannot find module './DetailView'`

- [ ] **Step 4: Implement DetailView.jsx**

`src/components/DetailView.jsx`:
```jsx
import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main>
      <HeroPhoto photo={coverPhoto} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm mb-8 opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text)' }}
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="mb-10">
          <h2 className="font-display text-5xl" style={{ color: 'var(--text)' }}>{date.title}</h2>
          <p className="font-body text-sm mt-2 opacity-60" style={{ color: 'var(--text)' }}>{formattedDate}</p>
        </div>

        <PhotoGrid photos={photos} dateId={date.id} />

        <div className="flex justify-center mt-10">
          <AddPhotosButton dateId={date.id} currentPhotoCount={photos.length} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- DetailView
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroPhoto.jsx src/components/DetailView.jsx src/components/DetailView.test.jsx
git commit -m "feat: DetailView — hero photo, sortable photo grid, add photos button"
```

---

## Task 17: App Root + Final Wiring

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Implement App.jsx**

Replace `src/App.jsx` with:

```jsx
import { useState } from 'react'
import { Header } from './components/Header'
import { HomeView } from './components/HomeView'
import { DetailView } from './components/DetailView'
import { useDates } from './hooks/useDates'

export default function App() {
  const [selectedDateId, setSelectedDateId] = useState(null)
  const dates = useDates()

  const selectedDate = selectedDateId
    ? dates.find((d) => d.id === selectedDateId) ?? null
    : null

  return (
    <>
      <Header />
      {selectedDate ? (
        <DetailView date={selectedDate} onBack={() => setSelectedDateId(null)} />
      ) : (
        <HomeView onSelectDate={setSelectedDateId} />
      )}
    </>
  )
}
```

- [ ] **Step 2: Ensure main.jsx imports index.css**

`src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: ALL tests pass (no failures)

- [ ] **Step 4: Start dev server and verify app works end-to-end**

```bash
npm run dev
```

Manual verification checklist:
- [ ] Home page loads with "Nath & Dai" header and film grain visible
- [ ] "+" button opens the Create Date modal
- [ ] Creating a date adds a card to the grid in real-time
- [ ] Clicking a card opens the detail view
- [ ] "Voltar" button returns to home
- [ ] Uploading photos shows them in the grid in real-time
- [ ] Dragging photos by the handle reorders them
- [ ] Clicking a photo opens the focal point editor
- [ ] Clicking the focal point editor sets the visible area of the photo in the grid

- [ ] **Step 5: Build and check output**

```bash
npm run build
```

Expected: `dist/` folder created with all assets. Check that paths include `/nath-dai-album/` prefix.

- [ ] **Step 6: Final commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: App root — selectedDateId navigation between HomeView and DetailView"
```

---

## Task 18: GitHub Pages Deploy (Manual — You Do This)

This task is performed by you, not the AI agent, since GitHub deployment is not automated in this project.

- [ ] **Step 1: Install gh-pages helper (optional)**

```bash
npm install -D gh-pages
```

Add to `package.json` scripts:
```json
"deploy": "gh-pages -d dist"
```

- [ ] **Step 2: Build the app**

```bash
npm run build
```

- [ ] **Step 3: Create GitHub repo**

1. Create a new GitHub repo named `nath-dai-album`
2. Push your code: `git remote add origin <your-repo-url> && git push -u origin main`

- [ ] **Step 4: Deploy to GitHub Pages**

```bash
npm run deploy
```

Or manually push the `dist/` folder contents to the `gh-pages` branch.

- [ ] **Step 5: Enable GitHub Pages in repo settings**

Repo → Settings → Pages → Source: `gh-pages` branch → Save

Your app will be live at: `https://<your-username>.github.io/nath-dai-album/`
