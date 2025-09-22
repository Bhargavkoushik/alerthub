import { useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

// Lightweight CSS page-flip effect without extra deps
// Contract:
// - props.open: boolean
// - props.onClose: () => void
// - props.module: { id, title, image, dos[], donts[], quiz, drills }
export default function FlipBookModal({ open, onClose, module, variant = 'dosdonts', heading, customContent }) {
  const dialogRef = useRef(null)
  const bookRef = useRef(null)
  const [bookReady, setBookReady] = useState(false)

  useEffect(() => {
    if (!dialogRef.current) return
    if (open) {
      try { dialogRef.current.showModal() } catch { /* no-op */ }
      // Ensure flipbook mounts only after the dialog is visible to avoid blank render
      requestAnimationFrame(() => setBookReady(true))
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
      setBookReady(false)
      try { dialogRef.current.close() } catch { /* no-op */ }
    }
  }, [open])

  // When the content changes while open, remount the flipbook to re-measure
  useEffect(() => {
    if (!open) return
    setBookReady(false)
    const id = requestAnimationFrame(() => setBookReady(true))
    return () => cancelAnimationFrame(id)
  }, [module?.id, variant, heading, open])

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
  const coverSubtitle = variant === 'dosdonts' ? "Do's & Don’ts Flipbook" : (variant === 'plan' ? 'Plan & Prepare Flipbook' : 'Flipbook')
  pages.push({ key: 'cover', content: (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/90 to-white/70 text-slate-900">
      {variant !== 'effects' && (
        <div className="text-5xl">{module.icon || '📘'}</div>
      )}
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
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 text-center">Do’s</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {left.length === 0 ? <li className="text-slate-500">—</li> : left.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
      pages.push({ key: `dont-spread-${i}`, content: (
  <div className="book-page right-page h-full w-full bg-sky-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 text-center">Don’ts</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {right.length === 0 ? <li className="text-slate-500">—</li> : right.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
    }
  } else if (variant === 'plan') {
    // Plan & Prepare: use module.plan or custom content
    const planList = Array.isArray(customContent) && customContent.length
      ? customContent
      : (Array.isArray(module.plan) ? module.plan : ['Content coming soon'])
    let planChunks = chunkFirstThen(planList, 4, 3)
    if (planChunks.length >= 2) {
      const last = planChunks[planChunks.length - 1]
      if (last && last.length === 1) {
        planChunks[1] = [...(planChunks[1] || []), last[0]]
        planChunks = planChunks.slice(0, planChunks.length - 1)
      }
    }
    for (let i = 0; i < planChunks.length; i += 2) {
      const left = planChunks[i] || []
      const right = planChunks[i + 1] || []
      pages.push({ key: `plan-left-${i}`, content: (
  <div className="book-page left-page h-full w-full bg-emerald-50/90 p-6 text-slate-900 border-r-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 text-center">{heading || 'Plan & Prepare'}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {left.length === 0 ? <li className="text-slate-500">—</li> : left.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
      pages.push({ key: `plan-right-${i}`, content: (
  <div className="book-page right-page h-full w-full bg-sky-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 text-center">{heading || 'Plan & Prepare'}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {right.length === 0 ? <li className="text-slate-500">—</li> : right.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
    }
  } else if (variant === 'recovery') {
    // Recovery & Build: use module.recovery or custom content
    const recList = Array.isArray(customContent) && customContent.length
      ? customContent
      : (Array.isArray(module.recovery) ? module.recovery : ['Content coming soon'])
    let recChunks = chunkFirstThen(recList, 4, 3)
    if (recChunks.length >= 2) {
      const last = recChunks[recChunks.length - 1]
      if (last && last.length === 1) {
        recChunks[1] = [...(recChunks[1] || []), last[0]]
        recChunks = recChunks.slice(0, recChunks.length - 1)
      }
    }
    for (let i = 0; i < recChunks.length; i += 2) {
      const left = recChunks[i] || []
      const right = recChunks[i + 1] || []
      pages.push({ key: `rec-left-${i}`, content: (
        <div className="book-page left-page h-full w-full bg-emerald-50/90 p-6 text-slate-900 border-r-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 text-center">{heading || 'Recovery & Build'}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {left.length === 0 ? <li className="text-slate-500">—</li> : left.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
      pages.push({ key: `rec-right-${i}`, content: (
        <div className="book-page right-page h-full w-full bg-rose-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 text-center">{heading || 'Recovery & Build'}</div>
          <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
            {right.length === 0 ? <li className="text-slate-500">—</li> : right.map((d, idx) => <li key={idx}>{d}</li>)}
          </ul>
        </div>
      )})
    }
  } else if (variant === 'effects') {
    // Effects of Disasters: 5 items on left, 4 on right per spread
      const fxList = Array.isArray(customContent) && customContent.length
        ? customContent
        : (Array.isArray(module.effects) ? module.effects : ['Content coming soon'])

      const leftSize = 5
      const rightSize = 4
      // create pairs of [left(5), right(4)] chunks
      const spreads = []
      for (let i = 0; i < fxList.length; i += (leftSize + rightSize)) {
        const left = fxList.slice(i, i + leftSize)
        const right = fxList.slice(i + leftSize, i + leftSize + rightSize)
        spreads.push({ left, right })
      }
      spreads.forEach((sp, idx) => {
        pages.push({ key: `eff-left-${idx}`, content: (
          <div className="book-page left-page h-full w-full bg-emerald-50/90 p-6 text-slate-900 border-r-2 border-white/60 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 text-center">{heading || 'Effects of Disasters'}</div>
            <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
              {sp.left.length === 0 ? <li className="text-slate-500">—</li> : sp.left.map((d, i2) => <li key={i2}>{d}</li>)}
            </ul>
          </div>
        )})
        pages.push({ key: `eff-right-${idx}`, content: (
          <div className="book-page right-page h-full w-full bg-sky-50/90 p-6 text-slate-900 border-l-2 border-white/60 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 text-center">{heading || 'Effects of Disasters'}</div>
            <ul className="mt-3 list-disc space-y-1 pl-8 pr-6 text-sm">
              {sp.right.length === 0 ? <li className="text-slate-500">—</li> : sp.right.map((d, i3) => <li key={i3}>{d}</li>)}
            </ul>
          </div>
        )})
      })
  } else {
    // Generic: Show know content as paragraphs over multiple pages
    const knowList = Array.isArray(customContent) && customContent.length
      ? customContent
      : (Array.isArray(module.know) ? module.know : ['Content coming soon'])
    // Chunk the knowledge items into groups and render each group as a paragraph page
    const knowChunks = chunkFirstThen(knowList, 6, 6)
    for (let i = 0; i < Math.max(1, knowChunks.length); i++) {
      const text = (knowChunks[i] || knowList).join(' ')
      const isRight = i % 2 === 1
      const bgClass = isRight ? 'bg-sky-50/90' : 'bg-emerald-50/90'
      pages.push({ key: `know-paragraph-${i}`, content: (
        <div className={`book-page h-full w-full ${bgClass} p-8 text-slate-900 flex flex-col justify-center items-center`}>
          <div className="mb-3 text-base font-bold text-emerald-700 text-center">{heading || 'Know the Disaster'}</div>
          <div className="text-[15px] text-slate-800 leading-relaxed max-w-2xl text-left">{text}</div>
        </div>
      )})
    }
  }
  // For Do’s & Don’ts only: append a minimalist final page with a Drill button
  if (variant === 'dosdonts') {
    pages.push({ key: 'final-drill', content: (
      <div className="flex h-full w-full flex-col items-center justify-center bg-indigo-50/90 p-6 text-slate-900">
        <div className="text-base font-semibold">Ready to practice?</div>
        <div className="mt-2 text-sm text-slate-700">Run a quick drill for {module.title}.</div>
        <div className="mt-4 text-sm">
          <button className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-500" onClick={() => alert('Drill coming soon')}>
            {module.drills?.title || `${module.title} Drill`}
          </button>
        </div>
      </div>
    )})
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,960px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900/95 p-0 text-white shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <div className="text-sm font-semibold">
          {heading || (variant === 'dosdonts' ? `${module.title} — Do’s & Don’ts` : module.title)}
        </div>
        <button className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={onClose}>Close</button>
      </div>

      {/* Flipbook */}
      <div className="p-4">
        <div className="relative mx-auto h-[420px] w-full max-w-3xl">
          {bookReady ? (
            <HTMLFlipBook
              key={`${module.id}-${variant}`}
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
          ) : (
            <div className="grid h-full w-full place-items-center rounded-xl bg-white/10">
              <div className="text-sm text-white/70">Loading flipbook…</div>
            </div>
          )}
          {/* Center spine bar */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-5 w-[2px] -translate-x-1/2 bg-slate-300/40" />
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
