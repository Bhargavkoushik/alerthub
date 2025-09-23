import { useMemo, useState, useEffect } from 'react'

const DEFAULT_CLASSES = [
  { id: '8A', name: 'Class 8A', size: 32 },
  { id: '8B', name: 'Class 8B', size: 28 },
  { id: '9A', name: 'Class 9A', size: 30 },
]

function readLS(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }
function uid() { return Math.random().toString(36).slice(2, 9) }

const RESOURCES = [
  { id: 'ndma', title: 'NDMA Protocols (PDFs)', action: 'Open' },
  { id: 'lessonpack', title: 'Lesson Plans Pack', action: 'Download' },
  { id: 'videos', title: 'Safety Videos Collection', action: 'View' },
]

export default function TeacherResources() {
  const classes = useMemo(() => readLS('teacher-classes', DEFAULT_CLASSES), [])
  const [drills, setDrills] = useState(() => readLS('teacher-drills', []))
  useEffect(() => localStorage.setItem('teacher-drills', JSON.stringify(drills)), [drills])

  const [form, setForm] = useState({ classId: '', type: 'Earthquake', date: new Date().toISOString().slice(0,10) })

  function scheduleVirtualDrill() {
    if (!form.classId) return
    setDrills(prev => [{ id: uid(), classId: form.classId, type: form.type, date: form.date }, ...prev])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📚</div>
            <div className="text-lg font-semibold">Teaching Resources</div>
          </div>
          <a className="text-sm text-cyan-300 hover:text-white" href="/teacher">Back to Dashboard</a>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold">Resource Library</h3>
          <ul className="space-y-3 text-sm">
            {RESOURCES.map(r => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">{r.title}</span>
                <button className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">{r.action}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold">Schedule Virtual Drill</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Class</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={form.classId} onChange={e=>setForm(prev=>({ ...prev, classId: e.target.value }))}>
                <option value="" className="text-slate-900">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Disaster Type</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={form.type} onChange={e=>setForm(prev=>({ ...prev, type: e.target.value }))}>
                {['Earthquake','Flood','Wildfire','Hurricane','Tsunami','Landslide','Drought','Tornado','Volcano'].map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Date</span>
              <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={form.date} onChange={e=>setForm(prev=>({ ...prev, date: e.target.value }))} />
            </label>
            <div className="flex items-end">
              <button onClick={scheduleVirtualDrill} className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white">Schedule</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
