import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const ALL_ITEMS = [
  { id: 'water', icon: '🥤', name: 'Water Bottle', desc: 'Stay hydrated during emergencies' },
  { id: 'firstaid', icon: '🚑', name: 'First-aid Kit', desc: 'Handle small injuries quickly' },
  { id: 'flashlight', icon: '🔦', name: 'Flashlight', desc: 'Light during power cuts' },
  { id: 'whistle', icon: '📢', name: 'Whistle', desc: 'Signal for help' },
  { id: 'snacks', icon: '🥫', name: 'Raw Food', desc: 'Non-perishable food items' },
  { id: 'battery', icon: '🔋', name: 'Battery Pack', desc: 'Charge devices' },
  { id: 'phone', icon: '📱', name: 'Phone', desc: 'Stay connected' },
  { id: 'blanket', icon: '🧥', name: 'Blanket', desc: 'Keep warm' },
]

export default function EmergencyKitBuilder() {
  const [collected, setCollected] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kit-builder-collected')||'[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('kit-builder-collected', JSON.stringify(collected)) }, [collected])

  const collectedSet = useMemo(() => new Set(collected), [collected])
  const available = ALL_ITEMS.filter(it => !collectedSet.has(it.id))
  const inBag = ALL_ITEMS.filter(it => collectedSet.has(it.id))
  const total = ALL_ITEMS.length
  const done = collected.length
  const pct = Math.round((done / total) * 100)

  function addItem(id) { if (!collectedSet.has(id)) setCollected(prev => [...prev, id]) }
  function removeItem(id) { if (collectedSet.has(id)) setCollected(prev => prev.filter(x => x !== id)) }

  return (
    <div id="kit" className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {/* Header + progress */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold">Emergency Kit Builder</h3>
        <div className="text-xs text-slate-300">{done}/{total} items collected</div>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {done === total && (
        <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-center text-sm font-semibold text-emerald-300">
          🎉 Your Emergency Kit is Ready! Stay Safe.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Available items grid */}
        <div className="lg:col-span-8">
          <div className="mb-2 text-xs font-semibold text-white/80">Available Items</div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <AnimatePresence initial={false}>
              {available.map((it) => (
                <Motion.div
                  key={it.id}
                  layoutId={`item-${it.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">{it.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-white/90">{it.name}</div>
                      <div className="text-xs text-slate-300">{it.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-cyan-500"
                      onClick={() => addItem(it.id)}
                    >Add to Backpack</button>
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Backpack inventory */}
        <div className="lg:col-span-4">
          <div className="mb-2 text-xs font-semibold text-white/80">Backpack</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
              <span className="text-lg">🎒</span>
              <span>Items in Backpack</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {inBag.length === 0 && (
                  <div className="rounded-lg bg-white/5 p-2 text-xs text-slate-400">No items yet. Add items from the grid.</div>
                )}
                {inBag.map((it) => (
                  <Motion.div
                    key={it.id}
                    layoutId={`item-${it.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{it.icon}</span>
                      <span className="text-xs text-white/90">{it.name}</span>
                    </div>
                    <button className="rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20" onClick={()=>removeItem(it.id)}>Remove</button>
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
