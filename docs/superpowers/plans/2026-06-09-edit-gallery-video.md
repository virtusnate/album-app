# Edit, Gallery & Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add date editing from the home grid, a photo/video lightbox gallery, per-photo action buttons behind long-press on mobile, and video upload support.

**Architecture:** All four features are independent UI layers on top of the existing Firestore/Cloudinary stack — no schema migrations required except adding an optional `type` field to photo documents. The lightbox is a new standalone component rendered at App level via a portal-style fixed overlay. Mobile action visibility follows the same long-press pattern already established in `DateCard`.

**Tech Stack:** React 18, Vite, Tailwind CSS, Firebase Firestore, Cloudinary unsigned upload, @dnd-kit/sortable (unchanged), `use-swipeable` (new — for lightbox swipe)

> **ui-ux-pro-max review fixes applied:**
> - `form-labels`: `EditDateModal` inputs have `id` + `htmlFor` pairs
> - `touch-target-size`: Mobile action buttons in `SortablePhoto` are 44×44px (not inherited 36px)
> - `modal-motion`: `PhotoLightbox` has fade+scale entrance (250ms) and fade exit (150ms)
> - `reduced-motion`: Lightbox animation wrapped in `prefers-reduced-motion` media query
> - `loading-buttons`: Video upload shows per-file upload progress bar (XHR progress event)

---

## File Map

| File | Change |
|---|---|
| `src/components/DateCard.jsx` | Add pencil (edit) button alongside existing action buttons |
| `src/components/HomeView.jsx` | Add `onEditDate` handler, pass to DateCard |
| `src/components/EditDateModal.jsx` | **New** — modal to edit title + date, saves to Firestore |
| `src/components/PhotoLightbox.jsx` | **New** — full-screen overlay, arrow nav, swipe, counter |
| `src/components/SortablePhoto.jsx` | Replace click→FocalPointEditor with click→lightbox; add long-press mobile pattern for focal/delete buttons |
| `src/components/PhotoGrid.jsx` | Pass `onOpenLightbox(index)` down to SortablePhoto; open lightbox at correct index |
| `src/components/DetailView.jsx` | Lift lightbox state here; render `<PhotoLightbox>` when open |
| `src/components/AddPhotosButton.jsx` | Accept `video/*` in addition to `image/*`; route to correct upload util |
| `src/utils/uploadVideo.js` | **New** — Cloudinary `/video/upload` + Firestore doc with `type:'video'` |
| `src/utils/uploadPhoto.js` | Add `type: 'image'` field to Firestore doc (backwards compat) |
| `src/index.css` | Add lightbox animation, long-press styles for photo grid |

---

## Task 1: Edit date title & date from HomeView

**Files:**
- Create: `src/components/EditDateModal.jsx`
- Modify: `src/components/DateCard.jsx`
- Modify: `src/components/HomeView.jsx`
- Test: `src/components/EditDateModal.test.jsx` (new)

- [ ] **Step 1: Create `EditDateModal.jsx`**

```jsx
// src/components/EditDateModal.jsx
import { useState } from 'react'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function EditDateModal({ date, onClose }) {
  const [title, setTitle] = useState(date.title)
  const [dateStr, setDateStr] = useState(
    date.date?.toDate().toISOString().split('T')[0] ?? ''
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim() || !dateStr) return
    setSaving(true)
    await updateDoc(doc(db, 'dates', date.id), {
      title: title.trim(),
      date: Timestamp.fromDate(new Date(dateStr + 'T12:00:00')),
    })
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(44,26,14,0.60)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <h3 className="font-display text-xl" style={{ color: 'var(--text)' }}>
          Editar date
        </h3>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-title" className="font-body text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>
            Título
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg px-3 py-2 font-body text-sm border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              minHeight: '44px',
            }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-date" className="font-body text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>
            Fecha
          </label>
          <input
            id="edit-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-lg px-3 py-2 font-body text-sm border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              minHeight: '44px',
            }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 font-body text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', minHeight: '44px' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !dateStr}
            className="flex-1 btn-accent"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add pencil button to `DateCard.jsx`**

Add an edit button alongside the existing desktop hover and mobile long-press button sets. Desktop button goes next to the delete button (e.g. top-right area, shift delete a bit). Mobile button appears in the `mobileActive` block.

In `DateCard.jsx`, add `onEdit` to the props and insert these buttons:

```jsx
// props: { date, onClick, onDelete, onEdit, onMoveUp, onMoveDown, isFirst, isLast }

// Desktop edit button — add just below the desktop delete button:
<button
  onClick={(e) => { e.stopPropagation(); onEdit(date) }}
  className="date-card-action-btn hidden md:flex opacity-0 group-hover:opacity-100"
  style={{ top: '0.5rem', right: '3.5rem' }}   // 42px button + 8px gap from delete
  aria-label="Editar date"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
</button>

// Mobile edit button — inside the mobileActive block, add after the up/down buttons:
<button
  onClick={(e) => { e.stopPropagation(); setMobileActive(false); onEdit(date) }}
  className="date-card-action-btn md:hidden"
  style={{ bottom: '0.625rem', right: '0.625rem' }}
  aria-label="Editar date"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
</button>
```

- [ ] **Step 3: Wire `onEdit` in `HomeView.jsx`**

```jsx
// Add state near the top of HomeView:
const [dateToEdit, setDateToEdit] = useState(null)

// Pass to each DateCard:
onEdit={setDateToEdit}

// Render modal at the bottom of return(), after ConfirmDialog:
{dateToEdit && (
  <EditDateModal date={dateToEdit} onClose={() => setDateToEdit(null)} />
)}
```

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```

- Open app, hover a date card → pencil icon appears to the left of delete
- Click pencil → modal slides up (mobile) or appears centered (desktop)
- Change title + date → Save → card updates immediately (Firestore real-time)
- Cancel → no changes

- [ ] **Step 5: Commit**

```bash
git add src/components/EditDateModal.jsx src/components/DateCard.jsx src/components/HomeView.jsx
git commit -m "feat: edit date title and date from HomeView card"
```

---

## Task 2: Photo lightbox gallery

**Files:**
- Create: `src/components/PhotoLightbox.jsx`
- Modify: `src/components/PhotoGrid.jsx`
- Modify: `src/components/DetailView.jsx`

- [ ] **Step 1: Install `use-swipeable`**

```bash
npm install react-swipeable
```

Expected: package added to `node_modules` and `package.json`.

- [ ] **Step 2: Create `PhotoLightbox.jsx`**

Add the lightbox CSS keyframes to `src/index.css` first:

```css
/* ── Lightbox ─────────────────────────────────────── */
@keyframes lightbox-in {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes lightbox-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@media (prefers-reduced-motion: no-preference) {
  .lightbox-enter { animation: lightbox-in 250ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .lightbox-exit  { animation: lightbox-out 150ms ease-in forwards; }
}
```

Then create the component:

```jsx
// src/components/PhotoLightbox.jsx
import React, { useEffect, useCallback, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

export function PhotoLightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [closing, setClosing] = useState(false)

  const close = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 140)
  }, [onClose])

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])
  const next = useCallback(() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, close])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: false,
  })

  const photo = photos[index]

  return (
    <div
      className={closing ? 'lightbox-exit' : 'lightbox-enter'}
      onClick={(e) => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(20,10,5,0.95)',
      }}
    >
      {/* Close */}
      <button
        onClick={close}
        aria-label="Cerrar"
        style={{
          position: 'absolute',
          top: 'max(1rem, env(safe-area-inset-top))',
          right: '1rem',
          zIndex: 10,
          width: '44px', height: '44px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(253,246,227,0.15)', color: '#FDF6E3',
          cursor: 'pointer',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute left-1/2 -translate-x-1/2 font-body text-xs px-3 py-1 rounded-full"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          backgroundColor: 'rgba(253,246,227,0.15)', color: '#FDF6E3',
          pointerEvents: 'none',
        }}
      >
        {index + 1} / {photos.length}
      </div>

      {/* Left arrow */}
      {photos.length > 1 && (
        <button
          onClick={prev}
          aria-label="Anterior"
          style={{
            position: 'absolute', left: '0.5rem',
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(253,246,227,0.12)', color: '#FDF6E3',
            cursor: 'pointer',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Media */}
      <div
        {...swipeHandlers}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
          paddingLeft: '56px', paddingRight: '56px',
          maxHeight: '100dvh',
        }}
      >
        {photo.type === 'video' ? (
          <video
            key={photo.id}
            src={photo.storageUrl}
            controls autoPlay muted playsInline
            style={{ maxWidth: '100%', maxHeight: 'calc(100dvh - 80px)', borderRadius: '2px' }}
          />
        ) : (
          <img
            key={photo.id}
            src={photo.storageUrl}
            alt=""
            draggable={false}
            style={{
              maxWidth: '100%', maxHeight: 'calc(100dvh - 80px)',
              objectFit: 'contain', borderRadius: '2px',
            }}
          />
        )}
      </div>

      {/* Right arrow */}
      {photos.length > 1 && (
        <button
          onClick={next}
          aria-label="Siguiente"
          style={{
            position: 'absolute', right: '0.5rem',
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(253,246,227,0.12)', color: '#FDF6E3',
            cursor: 'pointer',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Lift lightbox state into `DetailView.jsx`**

```jsx
// src/components/DetailView.jsx
import { useState } from 'react'
import { usePhotos } from '../hooks/usePhotos'
import { HeroPhoto } from './HeroPhoto'
import { PhotoGrid } from './PhotoGrid'
import { AddPhotosButton } from './AddPhotosButton'
import { PhotoLightbox } from './PhotoLightbox'

export function DetailView({ date, onBack }) {
  const photos = usePhotos(date.id)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const coverPhoto = photos[0] ?? null

  const formattedDate = date.date?.toDate().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <main>
      <div className="relative">
        <HeroPhoto photo={coverPhoto} />
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center gap-1.5 px-3 py-2 rounded-full min-h-[44px] backdrop-blur-sm"
          style={{
            top: 'max(0.75rem, env(safe-area-inset-top))',
            backgroundColor: 'rgba(44,26,14,0.52)',
            color: '#FDF6E3',
          }}
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-body text-sm">Volver</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-3 pb-10 md:pb-14">
        <div className="mb-4 md:mb-6">
          <h2 className="font-display text-3xl md:text-5xl leading-tight" style={{ color: 'var(--text)' }}>
            {date.title}
          </h2>
          <p className="font-body text-sm mt-0.5 pb-2" style={{ color: 'var(--text)', opacity: 0.5 }}>
            {formattedDate}
          </p>
        </div>

        <PhotoGrid
          photos={photos}
          dateId={date.id}
          onOpenLightbox={setLightboxIndex}
        />

        <div className="flex justify-center mt-8 md:mt-10">
          <AddPhotosButton dateId={date.id} currentPhotoCount={photos.length} />
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 4: Pass `onOpenLightbox` through `PhotoGrid.jsx`**

```jsx
// src/components/PhotoGrid.jsx  — add onOpenLightbox prop and pass to SortablePhoto
export function PhotoGrid({ photos, dateId, onOpenLightbox }) {
  // ...existing dnd setup...

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {photos.map((photo, i) => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              dateId={dateId}
              onDelete={handleDelete}
              onOpenLightbox={() => onOpenLightbox(i)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 5: Verify lightbox works**

```bash
npm run dev
```

- Open a date detail with 3+ photos
- Click any photo → lightbox opens on that photo
- Click left/right arrows → navigates
- Swipe left/right on mobile → navigates
- Press ESC → closes
- Counter shows correct "2 / 5" etc.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhotoLightbox.jsx src/components/PhotoGrid.jsx src/components/DetailView.jsx
git commit -m "feat: photo lightbox gallery with swipe and keyboard navigation"
```

---

## Task 3: Refactor SortablePhoto — long-press on mobile, focal point as button

**Files:**
- Modify: `src/components/SortablePhoto.jsx`

The current behavior: click photo → opens FocalPointEditor.
New behavior: click photo → opens lightbox (via `onOpenLightbox`). Focal point and delete are buttons revealed on hover (desktop) or long-press (mobile).

- [ ] **Step 1: Rewrite `SortablePhoto.jsx`**

```jsx
// src/components/SortablePhoto.jsx
import { useRef, useState, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FocalPointEditor } from './FocalPointEditor'

const LONG_PRESS_MS = 500

export function SortablePhoto({ photo, dateId, onDelete, onOpenLightbox }) {
  const [editingFocal, setEditingFocal] = useState(false)
  const [mobileActive, setMobileActive] = useState(false)
  const timerRef = useRef(null)
  const didLongPressRef = useRef(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  const startLongPress = useCallback((e) => {
    if (e.pointerType !== 'touch') return
    didLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true
      setMobileActive(true)
      if (navigator.vibrate) navigator.vibrate(30)
    }, LONG_PRESS_MS)
  }, [])

  const cancelLongPress = useCallback(() => clearTimeout(timerRef.current), [])

  function handleClick() {
    if (didLongPressRef.current) { didLongPressRef.current = false; return }
    if (mobileActive) { setMobileActive(false); return }
    onOpenLightbox()
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.4 : 1,
          outline: mobileActive ? '2.5px solid var(--accent)' : undefined,
          outlineOffset: mobileActive ? '2px' : undefined,
        }}
        className="relative group rounded-sm overflow-visible shadow-md"
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
      >
        {/* Photo/video thumbnail */}
        <div className="relative rounded-sm overflow-hidden" style={{ paddingBottom: '133%' }}>
          {photo.type === 'video' ? (
            <video
              src={photo.storageUrl}
              className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
              muted
              playsInline
              preload="metadata"
              onClick={handleClick}
            />
          ) : (
            <img
              src={photo.storageUrl}
              alt="Foto"
              className="photo-analog absolute inset-0 w-full h-full object-cover cursor-pointer"
              style={{ objectPosition: `${(photo.focalX ?? 0.5) * 100}% ${(photo.focalY ?? 0.5) * 100}%` }}
              onClick={handleClick}
            />
          )}

          {/* Video play indicator */}
          {photo.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(44,26,14,0.55)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FDF6E3' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop: drag handle (hover) ── */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="date-card-action-btn hidden md:flex opacity-0 group-hover:opacity-100"
          style={{ top: '0.5rem', left: '0.5rem', cursor: 'grab' }}
          aria-label="Mover foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* ── Desktop: focal point button (hover) ── */}
        {photo.type !== 'video' && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditingFocal(true) }}
            className="date-card-action-btn hidden md:flex opacity-0 group-hover:opacity-100"
            style={{ bottom: '0.5rem', left: '0.5rem' }}
            aria-label="Punto de enfoque"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {/* ── Desktop: delete button (hover) ── */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(photo) }}
          className="date-card-action-btn date-card-delete-btn hidden md:flex opacity-0 group-hover:opacity-100"
          style={{ top: '0.5rem', right: '0.5rem', width: '42px', height: '42px' }}
          aria-label="Eliminar foto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* ── Mobile: actions revealed on long-press (44px to meet touch target) ── */}
        {mobileActive && (
          <>
            {photo.type !== 'video' && (
              <button
                onClick={(e) => { e.stopPropagation(); setMobileActive(false); setEditingFocal(true) }}
                className="date-card-action-btn md:hidden"
                style={{ bottom: '0.5rem', left: '0.5rem', width: '44px', height: '44px' }}
                aria-label="Punto de enfoque"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setMobileActive(false); onDelete(photo) }}
              className="date-card-action-btn date-card-delete-btn md:hidden"
              style={{ top: '0.5rem', right: '0.5rem', width: '44px', height: '44px' }}
              aria-label="Eliminar foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {editingFocal && (
        <FocalPointEditor photo={photo} dateId={dateId} onClose={() => setEditingFocal(false)} />
      )}
    </>
  )
}
```

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

- Desktop: hover a photo → drag handle (top-left), focal point eye (bottom-left), delete (top-right)
- Desktop: click photo (no buttons) → lightbox opens
- Mobile: tap photo → lightbox opens
- Mobile: long-press 500ms → accent outline + focal/delete buttons appear
- Mobile: tap photo while active → dismisses buttons
- Mobile: long-press video → only delete button appears (no focal point)

- [ ] **Step 3: Commit**

```bash
git add src/components/SortablePhoto.jsx
git commit -m "feat: photo grid long-press mobile actions, click opens lightbox"
```

---

## Task 4: Video upload support

**Files:**
- Create: `src/utils/uploadVideo.js`
- Modify: `src/utils/uploadPhoto.js`
- Modify: `src/components/AddPhotosButton.jsx`

- [ ] **Step 1: Create `src/utils/uploadVideo.js`**

Uses `XMLHttpRequest` instead of `fetch` so we can report upload progress to the caller via an `onProgress` callback (videos can be large — `fetch` has no progress API).

```js
// src/utils/uploadVideo.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// onProgress(0–100) called during upload
export function uploadVideo(file, dateId, order, onProgress) {
  return new Promise((resolve, reject) => {
    const videoId = crypto.randomUUID()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('public_id', `dates/${dateId}/${videoId}`)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', async () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status !== 200) { reject(new Error(data.error?.message ?? 'Upload failed')); return }

        const storageUrl = data.secure_url
        // First-frame thumbnail: Cloudinary generates it by changing extension to .jpg
        const thumbnailUrl = storageUrl
          .replace('/video/upload/', '/video/upload/so_0,w_400/')
          .replace(/\.[^.]+$/, '.jpg')

        await addDoc(collection(db, 'dates', dateId, 'photos'), {
          storageUrl,
          thumbnailUrl,
          type: 'video',
          order,
          uploadedAt: serverTimestamp(),
        })
        resolve()
      } catch (err) { reject(err) }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during video upload')))
    xhr.send(formData)
  })
}
```

- [ ] **Step 2: Add `type: 'image'` to `uploadPhoto.js`**

In `src/utils/uploadPhoto.js`, add `type: 'image'` to the `addDoc` call:

```js
const docRef = await addDoc(collection(db, 'dates', dateId, 'photos'), {
  storageUrl,
  type: 'image',       // ← add this line
  order,
  focalX: 0.5,
  focalY: 0.5,
  uploadedAt: serverTimestamp(),
})
```

- [ ] **Step 3: Update `AddPhotosButton.jsx` to handle videos with progress feedback**

```jsx
// src/components/AddPhotosButton.jsx
import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage'
import { uploadPhoto } from '../utils/uploadPhoto'
import { uploadVideo } from '../utils/uploadVideo'

export function AddPhotosButton({ dateId, currentPhotoCount }) {
  const inputRef = useRef(null)
  // null = idle, 'images' = uploading images, number 0-100 = video upload progress
  const [uploadState, setUploadState] = useState(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const videos = files.filter((f) => f.type.startsWith('video/'))
    const images = files.filter((f) => !f.type.startsWith('video/'))

    // Upload images first (fast, parallel)
    if (images.length > 0) {
      setUploadState('images')
      await Promise.all(
        images.map((file, i) =>
          compressImage(file).then((compressed) =>
            uploadPhoto(compressed, dateId, currentPhotoCount + i)
          )
        )
      )
    }

    // Upload videos sequentially with progress (they're large)
    for (let i = 0; i < videos.length; i++) {
      const order = currentPhotoCount + images.length + i
      setUploadState(0)
      await uploadVideo(videos[i], dateId, order, (pct) => setUploadState(pct))
    }

    setUploadState(null)
    e.target.value = ''
  }

  const isUploading = uploadState !== null
  const label = uploadState === null
    ? '+ Agregar fotos y videos'
    : uploadState === 'images'
    ? 'Subiendo fotos…'
    : `Subiendo video… ${uploadState}%`

  return (
    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => inputRef.current.click()}
        disabled={isUploading}
        className="btn-accent w-full sm:w-auto px-8"
        aria-label="Agregar fotos y videos"
      >
        {label}
      </button>
      {/* Progress bar — only for video uploads */}
      {typeof uploadState === 'number' && (
        <div className="w-full sm:w-64 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${uploadState}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update cover photo logic in `uploadPhoto.js` — skip videos**

The cover is already handled only in `uploadPhoto.js` (only images set cover at `order === 0`). Videos in `uploadVideo.js` never set cover. This is already correct — no change needed here. Verify by checking the `if (order === 0)` block in `uploadPhoto.js` only exists there.

- [ ] **Step 5: Run dev server and verify video upload**

```bash
npm run dev
```

- Open a date detail
- Click "Agregar fotos y videos"
- Select a video file (`.mp4` or `.mov`)
- Video appears in the grid with a play button overlay
- Click the video thumbnail → lightbox opens, video plays (muted autoplay)
- Long-press on mobile → only delete button appears (no focal point for videos)

- [ ] **Step 6: Commit**

```bash
git add src/utils/uploadVideo.js src/utils/uploadPhoto.js src/components/AddPhotosButton.jsx
git commit -m "feat: video upload support via Cloudinary video endpoint"
```

---

## Final verification checklist

- [ ] All 4 features work end-to-end on desktop (Chrome)
- [ ] All 4 features work on mobile (DevTools touch simulation or real device)
- [ ] No accidental focal-point editor opens on photo click
- [ ] Lightbox closes on ESC and backdrop click
- [ ] Videos show play-button overlay in grid
- [ ] Edit modal saves correctly and date card updates in real time
- [ ] `npm run build` produces no errors
- [ ] Commit all changes
