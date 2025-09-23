import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const HAZARD_TYPES = ['Earthquake','Flood','Wildfire','Hurricane','Tsunami','Landslide','Drought','Tornado','Volcano']
const DEFAULT_CLASSES = [
  { id: '8A', name: 'Class 8A', size: 32 },
  { id: '8B', name: 'Class 8B', size: 28 },
  { id: '9A', name: 'Class 9A', size: 30 },
  { id: '10A', name: 'Class 10A', size: 29 },
]
function readLS(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }

export default function InstitutionReports() {
  const classes = useMemo(() => readLS('teacher-classes', DEFAULT_CLASSES), [])
  const drills = useMemo(() => readLS('inst-drills', []), [])

  const [filters, setFilters] = useState({ classId: '', type: '', teacher: '' })
  const [teacher, setTeacher] = useState('')

  const visible = useMemo(() => {
    return drills.filter(d => {
      if (filters.classId && d.classId !== filters.classId) return false
      if (filters.type && d.type !== filters.type) return false
      if (filters.teacher && d.teacher !== filters.teacher) return false
      return true
    })
  }, [drills, filters])

  function exportCSV() {
    const header = 'Class,Type,Date\n'
    const rows = visible.map(d => `${d.classId},${d.type},${d.date}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'institution-drill-report.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📑</div>
            <div className="text-lg font-semibold">Institution Drill Reports</div>
          </div>
          <Link className="text-sm text-cyan-300 hover:text-white" to="/institution">Back to Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Class</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={filters.classId} onChange={e=>setFilters(prev=>({ ...prev, classId: e.target.value }))}>
                <option value="" className="text-slate-900">All</option>
                {classes.map(c => <option className="text-slate-900" key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Drill Type</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={filters.type} onChange={e=>setFilters(prev=>({ ...prev, type: e.target.value }))}>
                <option value="" className="text-slate-900">All</option>
                {HAZARD_TYPES.map(t => <option className="text-slate-900" key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Teacher</span>
              <input placeholder="Name" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={teacher} onChange={e=>{ setTeacher(e.target.value); setFilters(prev=>({ ...prev, teacher: e.target.value })) }} />
            </label>
            <div className="flex items-end">
              <button onClick={exportCSV} className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white">Export CSV</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Results</div>
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
                <tr>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Drill Type</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visible.map(d => (
                  <tr key={`${d.id}`}> 
                    <td className="px-3 py-2">{d.classId}</td>
                    <td className="px-3 py-2">{d.type}</td>
                    <td className="px-3 py-2">{d.date}</td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-300" colSpan={3}>No records match selected filters</td>
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
