import { useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'

// Lightweight CSS page-flip effect without extra deps
// Contract:
// - props.open: boolean
// - props.onClose: () => void
// - props.module: { id, title, image, dos[], donts[], quiz, drills }
export default function FlipBookModal({ open, onClose, module, variant = 'dosdonts', heading, customContent }) {
  const dialogRef = useRef(null)
  const bookRef = useRef(null)

  useEffect(() => {
    if (!dialogRef.current) return
    if (open) {
      try { dialogRef.current.showModal() } catch { /* no-op */ }
      // Keyboard navigation: Left/Right arrows to flip pages
      const onKeyDown = (e) => {
        if (!open) return
        if (!bookRef.current || typeof bookRef.current.pageFlip !== 'function') return
        const api = bookRef.current.pageFlip()
        if (!api) return
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault()
          try { api.flipNext() } catch { /* no-op */ }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault()
          try { api.flipPrev() } catch { /* no-op */ }
        }
      }
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    } else {
      try { dialogRef.current.close() } catch { /* no-op */ }
    }
  }, [open])

  if (!module) return null

  // Build pages as two-page spreads: First sheet 4 items, subsequent sheets 3 items
  function chunkFirstThen(list, firstSize = 4, size = 3) {
    const res = []
    const n = Array.isArray(list) ? list.length : 0
    if (!n) return res
    const a = Math.min(firstSize, n)
    res.push(list.slice(0, a))
    for (let i = a; i < n; i += size) res.push(list.slice(i, i + size))
    return res
  }
  const dos = Array.isArray(module.dos) ? module.dos : []
  const donts = Array.isArray(module.donts) ? module.donts : []
  const doChunks = chunkFirstThen(dos, 4, 3)
  const dontChunks = chunkFirstThen(donts, 4, 3)

  const pages = []
  // Cover
  const coverTitle = heading || module.title
  const coverSubtitle = variant === 'dosdonts' ? "Do's & Don’ts Flipbook" : 'Flipbook'
  pages.push({ key: 'cover', content: (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/90 to-white/70 text-slate-900">
      <div className="text-5xl">{module.icon || '📘'}</div>
      <div className="mt-2 text-lg font-bold">{coverTitle}</div>
      <div className="mt-1 text-xs text-slate-600">{coverSubtitle}</div>
    </div>
  )})
  // Spreads
  if (variant === 'dosdonts') {
    const sheets = Math.max(doChunks.length, dontChunks.length)
    for (let i = 0; i < sheets; i++) {
      const left = doChunks[i] || []
      const right = dontChunks[i] || []
      pages.push({ key: `do-spread-${i}`, content: (
        <div className="book-page left-page h-full w-full bg-emerald-50/90 p-6 text-slate-900 border-r-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 text-center">Do’s • Sheet {i+1}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {left.length === 0 ? <li className="text-slate-500">—</li> : left.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
      pages.push({ key: `dont-spread-${i}`, content: (
        <div className="book-page right-page h-full w-full bg-rose-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 text-center">Don’ts • Sheet {i+1}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {right.length === 0 ? <li className="text-slate-500">—</li> : right.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
    }
  } else {
    // Generic flipbook content for other buttons
    const generic = Array.isArray(customContent) && customContent.length ? customContent : ['Content coming soon']
    // First sheet
    pages.push({ key: `gen-left-0`, content: (
      <div className="book-page left-page h-full w-full bg-emerald-50/90 p-6 text-slate-900 border-r-2 border-white/60 flex flex-col items-center justify-center text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{heading || 'Overview'}</div>
        <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm text-left">
          {generic.map((d, idx) => <li key={idx}>{d}</li>)}
        </ul>
      </div>
    )})
    pages.push({ key: `gen-right-0`, content: (
      <div className="book-page right-page h-full w-full bg-rose-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col items-center justify-center text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">{heading || 'Overview'}</div>
        <div className="mt-3 text-sm text-slate-700">Content coming soon</div>
      </div>
    )})
  }
  // Final page
  pages.push({ key: 'final', content: (
    <div className="flex h-full w-full flex-col items-center justify-center bg-indigo-50/90 p-6 text-slate-900">
      <div className="text-base font-semibold">What next?</div>
      <div className="mt-2 text-sm text-slate-700">Test your knowledge or practice a drill.</div>
      <div className="mt-4 flex gap-2 text-sm">
        <button className="rounded-lg bg-cyan-600 px-3 py-2 font-semibold text-white hover:bg-cyan-500" onClick={() => alert('Quiz coming soon')}>{module.quiz?.title || 'Start Quiz'}</button>
        <button className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-500" onClick={() => alert('Drill coming soon')}>{module.drills?.title || 'Do a Drill'}</button>
      </div>
    </div>
  )})

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,960px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900/95 p-0 text-white shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <div className="text-sm font-semibold">{module.title} — Do’s & Don’ts</div>
        <button className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={onClose}>Close</button>
      </div>

      {/* Flipbook */}
      <div className="p-4">
        <div className="relative mx-auto h-[420px] w-full max-w-3xl">
          <HTMLFlipBook
            ref={bookRef}
            width={340}
            height={420}
            size="stretch"
            minWidth={280}
            maxWidth={600}
            minHeight={360}
            maxHeight={720}
            maxShadowOpacity={0.3}
            showCover
            className="mx-auto rounded-xl shadow-2xl"
            mobileScrollSupport
          >
            {pages.map((p) => (
              <div key={p.key} className="book-page">
                {p.content}
              </div>
            ))}
          </HTMLFlipBook>
          {/* Instructions overlay that adapts to page color */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 text-center">
            <span className="rounded px-2 py-1 text-xs font-medium text-white mix-blend-difference drop-shadow">
              Tap/click the right side to go next, left to go back, or use the ← and → keys
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .book-page {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        /* Optional subtle grain or gradient could be added here for a paper feel */
      `}</style>
    </dialog>
  )
}
