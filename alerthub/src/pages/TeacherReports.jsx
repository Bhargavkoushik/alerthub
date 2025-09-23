import { useEffect, useMemo, useState } from 'react'

// Helpers
const DEFAULT_CLASSES = [
  { id: '8A', name: 'Class 8A', size: 32 },
  { id: '8B', name: 'Class 8B', size: 28 },
  { id: '9A', name: 'Class 9A', size: 30 },
]
const HAZARD_TYPES = ['Earthquake','Flood','Wildfire','Hurricane','Tsunami','Landslide','Drought','Tornado','Volcano']

function readLS(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback }
}

function ensureStudents(classes) {
  const existing = readLS('teacher-students', null)
  if (existing) return existing
  const demo = {}
  const NAMES = ['Aarav','Diya','Ishaan','Kavya','Rohit','Neha','Arjun','Priya','Vikram','Meera']
  for (const c of classes) {
    demo[c.id] = Array.from({ length: Math.min(10, c.size) }).map((_,i) => ({ id: `${c.id}-${i+1}`, name: NAMES[i % NAMES.length] + ' ' + (i+1) }))
  }
  localStorage.setItem('teacher-students', JSON.stringify(demo))
  return demo
}

export default function TeacherReports() {
  const classes = useMemo(() => readLS('teacher-classes', DEFAULT_CLASSES), [])
  const drills = useMemo(() => readLS('teacher-drills', []), [])
  const studentsByClass = useMemo(() => ensureStudents(classes), [classes])
  const [completions, setCompletions] = useState(() => readLS('drill-completions', {}))
  useEffect(() => localStorage.setItem('drill-completions', JSON.stringify(completions)), [completions])

  // Filters
  const [classId, setClassId] = useState('')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState('date')

  const visibleDrills = useMemo(() => {
    return drills.filter(d => {
      if (classId && d.classId !== classId) return false
      if (type && d.type !== type) return false
      if (dateFrom && d.date < dateFrom) return false
      if (dateTo && d.date > dateTo) return false
      return true
    }).sort((a,b) => sortKey === 'date' ? a.date.localeCompare(b.date) : a.type.localeCompare(b.type))
  }, [drills, classId, type, dateFrom, dateTo, sortKey])

  function toggleCompletion(drillId, studentId) {
    setCompletions(prev => {
      const byDrill = { ...(prev[drillId] || {}) }
      const next = !byDrill[studentId]
      byDrill[studentId] = next
      return { ...prev, [drillId]: byDrill }
    })
  }

  function studentMatches(s) {
    const q = query.trim().toLowerCase()
    return !q || s.name.toLowerCase().includes(q)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📊</div>
            <div className="text-lg font-semibold">Drill Reports</div>
          </div>
          <a className="text-sm text-cyan-300 hover:text-white" href="/teacher">Back to Dashboard</a>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Class</span>
              <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={classId} onChange={e=>setClassId(e.target.value)}>
                <option value="">All</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Drill Type</span>
              <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={type} onChange={e=>setType(e.target.value)}>
                <option value="">All</option>
                {HAZARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">From</span>
              <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">To</span>
              <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
            </label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Search Student</span>
              <input placeholder="Type a name" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={query} onChange={e=>setQuery(e.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Sort By</span>
              <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
                <option value="date">Date</option>
                <option value="type">Type</option>
              </select>
            </label>
          </div>
        </div>

        {/* Per-drill table with % completion and per-student toggles */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Results</div>
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
                <tr>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Drill Type</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">% Completion</th>
                  <th className="px-3 py-2">Per-student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleDrills.map(d => {
                  const students = studentsByClass[d.classId] || []
                  const byDrill = completions[d.id] || {}
                  const completed = students.filter(s => byDrill[s.id]).length
                  const pct = students.length ? Math.round((completed / students.length) * 100) : 0
                  return (
                    <tr key={d.id} className="align-top">
                      <td className="px-3 py-2">{d.classId}</td>
                      <td className="px-3 py-2">{d.type}</td>
                      <td className="px-3 py-2">{d.date}</td>
                      <td className="px-3 py-2 font-semibold text-white">{pct}%</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {students.filter(studentMatches).map(s => (
                            <button key={s.id} onClick={()=>toggleCompletion(d.id, s.id)} className={`rounded-full px-3 py-1 text-xs font-semibold border ${byDrill[s.id] ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {visibleDrills.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-sm text-slate-300" colSpan={5}>No drills found. Assign drills from the Teacher Dashboard.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
