import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

// Simple helper progress bar component matching student UI vibe
function ProgressBar({ value, color = 'bg-emerald-500' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

const HAZARD_TYPES = ['Earthquake','Flood','Wildfire','Hurricane','Tsunami','Landslide','Drought','Tornado','Volcano']
const MODULE_TITLES = ['Earthquake Safety 101','Flood Readiness','Wildfire Awareness','Cyclone Prep Basics','Tsunami Evacuation','Landslide Safety','Heatwave Do’s & Don’ts']

function uid() { return Math.random().toString(36).slice(2, 9) }

// NDMA Guidelines (subset) to display in modal, mirroring structure from the pasted page
const NDMA_GUIDELINES = [
  { no: 1, title: 'National Guidelines on International Humanitarian Assistance and Disaster Relief (HADR)', date: 'Oct 2024', size: '5.8 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/HADR_Guideline_Oct_2024.pdf' },
  { no: 2, title: 'National Guidelines on Disaster Management Exercises (DMEX)', date: 'Oct 2024', size: '21 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/DMEx_Guidlines_Oct_2024.pdf' },
  { no: 3, title: 'National Guidelines for Establishment and Operations of Emergency Operations Center (EOC)', date: 'Oct 2024', size: '7.9 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/EOC_Guidelines_Oct_2024.pdf' },
  { no: 4, title: 'National Guidelines on Community-Based Disaster Risk Reduction (CBDRR)', date: 'Oct 2024', size: '5.7 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/CBDRR_Guidelines_Oct_2024.pdf' },
  { no: 5, title: 'Updated National Guidelines for Mental Health and Psychosocial Support Services in Disasters - 2023', date: 'Dec 2023', size: '17 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/Guidelines_Mental_Health_Psychosocial_Support_Dec23.pdf' },
  { no: 6, title: 'National Guidelines for Preparation of Action Plan – Prevention and Management of Cold Wave and Frost 2021', date: 'Oct 2021', size: '7 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/Guidelines-on-Cold-Wave-and-Frost.pdf' },
  { no: 7, title: 'Simplified Guideline for Earthquake Safety of Building from National Building Code of India 2016', date: 'May 2021', size: '10 MB', href: 'https://ndma.gov.in/sites/default/files/PDF/Guidelines/Simplified_Guidelines_for_earthquake.pdf' },
  { no: 8, title: "Cool Roof: House Owners' Guide to alternate roof cooling solutions", date: 'May 2021', size: '8.30 MB', href: '#' },
  { no: 9, title: 'Guidelines on Management of Glacial Lake Outburst Floods (GLOFs)', date: 'Oct 2020', size: '11.21 MB', href: '#' },
  { no: '9.a', title: 'Compendium of Task Force Report on NDMA Guidelines on Management of GLOFs', date: 'Oct 2020', size: '12.70 MB', href: '#' },
  { no: '9.b', title: 'Summary for Policy Makers on NDMA Guidelines on Management of GLOFs', date: 'Oct 2020', size: '0.41 MB', href: '#' },
  { no: 10, title: 'Guidelines for Preparation of Action Plan - Prevention and Management of Heat Wave', date: 'Oct 2020', size: '45.74 MB', href: '#' },
  { no: 11, title: 'Landslide Risk Management Strategy', date: 'Sept 2019', size: '12.48 MB', href: '#' },
  { no: 12, title: 'Guidelines on Disability Inclusive Disaster Risk Reduction', date: 'Sept 2019', size: '64.83 MB', href: '#' },
  { no: 13, title: 'Guidelines on Temporary Shelters for Disaster-Affected Families', date: 'Sept 2019', size: '9.86 MB', href: '#' },
  { no: 14, title: 'Guidelines on Prevention & Management of Thunderstorm & Lightning/Squall/Dust/Hailstorm & Strong Winds', date: 'Mar 2019', size: '9.55 MB', href: '#' },
  { no: 15, title: 'Guidelines on Boat Safety', date: 'Sept 2017', size: '4.40 MB', href: '#' },
  { no: 16, title: 'Guidelines on Cultural Heritage Sites and Precincts', date: 'Sept 2017', size: '21.45 MB', href: '#' },
  { no: 17, title: 'Guidelines on Museums', date: 'May 2017', size: '2.12 MB', href: '#' },
  { no: 18, title: 'Guidelines on Minimum Standards of Relief', date: 'Feb 2016', size: '3.00 MB', href: '#' },
]

export default function Teacher() {
  // Touch motion to satisfy certain linters that miss JSX usage
  const _ensureMotionUsed = motion && AnimatePresence
  // Classes (sections) — persisted so user changes survive reloads
  const [classes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('teacher-classes') || 'null') || [
        { id: '8A', name: 'Class 8A', size: 32 },
        { id: '8B', name: 'Class 8B', size: 28 },
        { id: '9A', name: 'Class 9A', size: 30 },
      ]
    } catch { return [ { id: '8A', name: 'Class 8A', size: 32 }, { id: '8B', name: 'Class 8B', size: 28 }, { id: '9A', name: 'Class 9A', size: 30 } ] }
  })
  useEffect(() => { localStorage.setItem('teacher-classes', JSON.stringify(classes)) }, [classes])

  // Drill assignments
  const [drills, setDrills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('teacher-drills') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('teacher-drills', JSON.stringify(drills)) }, [drills])

  // Module assignments
  const [modules, setModules] = useState(() => {
    try { return JSON.parse(localStorage.getItem('teacher-modules') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('teacher-modules', JSON.stringify(modules)) }, [modules])

  // Broadcasts
  const [broadcasts, setBroadcasts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('teacher-broadcasts') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('teacher-broadcasts', JSON.stringify(broadcasts)) }, [broadcasts])

  // Estimations for progress (since we don’t have live backend yet)
  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const pctFromDate = useCallback((iso) => {
    if (!iso) return 0
    return iso < today ? 0 : 0 // Always start with 0% for new users
  }, [today])

  // Compute per-class metrics
  const classMetrics = useMemo(() => {
    return classes.map(c => {
      const cDrills = drills.filter(d => d.classId === c.id)
      const cModules = modules.filter(m => m.classId === c.id)
      const drillPct = cDrills.length ? Math.round(cDrills.map(d => pctFromDate(d.date)).reduce((a,b)=>a+b,0)/cDrills.length) : 0
      const modulePct = cModules.length ? Math.round(cModules.map(m => pctFromDate(m.due)).reduce((a,b)=>a+b,0)/cModules.length) : 0
      const prepared = Math.round((drillPct + modulePct) / 2)
      return { ...c, drillPct, modulePct, prepared }
    })
  }, [classes, drills, modules, pctFromDate])

  // Drill type stats for chart
  const drillTypeStats = useMemo(() => {
    const map = new Map()
    for (const t of HAZARD_TYPES) map.set(t, { type: t, count: 0, completed: 0 })
    for (const d of drills) {
      const key = d.type
      const row = map.get(key) || { type: key, count: 0, completed: 0 }
      row.count += 1
      if (d.date < today) row.completed += 1
      map.set(key, row)
    }
    const arr = Array.from(map.values())
    return arr.map(r => ({ type: r.type, pct: r.count ? Math.round((r.completed / r.count) * 100) : 0 }))
  }, [drills, today])

  // Module progress by class for chart
  const moduleProgressByClass = useMemo(() => {
    return classMetrics.map(c => ({ name: c.name, value: c.modulePct }))
  }, [classMetrics])

  // UI state: modals
  const [openDrill, setOpenDrill] = useState(false)
  const [openModule, setOpenModule] = useState(false)
  const [openNDMA, setOpenNDMA] = useState(false)

  // Forms
  const [drillForm, setDrillForm] = useState({ classId: '', type: HAZARD_TYPES[0], date: today })
  const [moduleForm, setModuleForm] = useState({ classId: '', title: MODULE_TITLES[0], due: today })

  function assignDrill() {
    if (!drillForm.classId || !drillForm.type || !drillForm.date) return toast.error('Please fill all drill fields')
    setDrills(prev => [{ id: uid(), ...drillForm }, ...prev])
    setOpenDrill(false)
    setDrillForm({ classId: '', type: HAZARD_TYPES[0], date: today })
    toast.success('Drill assigned')
  }
  function assignModule() {
    if (!moduleForm.classId || !moduleForm.title || !moduleForm.due) return toast.error('Please fill all module fields')
    setModules(prev => [{ id: uid(), ...moduleForm }, ...prev])
    setOpenModule(false)
    setModuleForm({ classId: '', title: MODULE_TITLES[0], due: today })
    toast.success('Module assigned')
  }

  // Broadcasts
  const [msg, setMsg] = useState('')
  const [target, setTarget] = useState('ALL')
  function sendBroadcast() {
    const trimmed = msg.trim()
    if (!trimmed) return toast.error('Message cannot be empty')
    setBroadcasts(prev => [{ id: uid(), when: new Date().toISOString(), to: target, text: trimmed }, ...prev])
    setMsg('')
    toast.success('Broadcast sent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Header / Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl">🎓</div>
            <div className="text-lg font-semibold">Teacher Dashboard</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <a className="hover:text-white/90" href="/">Home</a>
            <a className="hover:text-white/90" href="#alerts">Alerts</a>
            <a className="hover:text-white/90" href="#contact">Contact</a>
            <a className="hover:text-white/90" href="/login">Logout</a>
          </div>
        </div>
      </nav>

      {/* Main grid */}
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left / Center */}
        <section id="overview" className="space-y-6 lg:col-span-8">
          {/* Welcome + quick stats */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl">👩‍🏫</div>
                <div>
                  <h1 className="text-xl font-semibold md:text-2xl">Welcome, Teacher</h1>
                  <p className="text-sm text-slate-300">Assign drills and modules, track progress, and keep your classes informed.</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">
                Classes: {classes.length} • Drills: {drills.length} • Modules: {modules.length}
              </div>
            </div>
          </div>

          {/* Class Overview */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">Class Overview</h2>
            <div className="space-y-3">
              {classMetrics.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/90 font-semibold">{c.name}</div>
                      <div className="text-xs text-slate-300">Students: {c.size}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href="/teacher/reports" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Drill Reports</a>
                      <button onClick={()=>setOpenDrill(true)} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Assign Drill</button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-300">Preparedness: <span className="font-semibold text-white">{c.prepared}%</span></div>
                  <div className="mt-3 text-xs text-slate-300">Drill Completion</div>
                  <ProgressBar value={c.drillPct} />
                  <div className="mt-3 text-xs text-slate-300">Modules Progress</div>
                  <ProgressBar value={c.modulePct} color="bg-cyan-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Drill Assignment / Reports */}
          <div id="drills" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Drill Assignment & Reports</h2>
              <button onClick={()=>setOpenDrill(true)} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Assign Drill</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-xs font-semibold text-white/80">Upcoming Drills</h3>
                <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 text-sm">
                  {drills.slice(0,6).map(d => (
                    <li key={d.id} className="flex items-center justify-between bg-white/5 px-3 py-2">
                      <div>
                        <div className="font-medium">{d.type}</div>
                        <div className="text-xs text-slate-300">Class {d.classId} • {d.date}</div>
                      </div>
                      <div className="text-xs text-slate-400">{d.date < today ? 'Completed (est.)' : 'Scheduled'}</div>
                    </li>
                  ))}
                  {drills.length === 0 && (
                    <li className="px-3 py-3 text-sm text-slate-300">No drills yet. Click "Assign Drill" to schedule one.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-xs font-semibold text-white/80">Completion by Drill Type</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drillTypeStats}>
                      <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#cbd5e1' }} interval={0} angle={-20} dy={10} height={60} />
                      <YAxis tick={{ fontSize: 12, fill: '#cbd5e1' }} domain={[0,100]} />
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
                      <Bar dataKey="pct" radius={[6,6,0,0]} fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Modules Assignment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Learning Modules</h2>
              <div className="flex items-center gap-2">
                <a href="/teacher/quizzes" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Assign Quizzes</a>
                <button onClick={()=>setOpenModule(true)} className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white">Assign Module</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-xs font-semibold text-white/80">Latest Assignments</h3>
                <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 text-sm">
                  {modules.slice(0,6).map(m => (
                    <li key={m.id} className="flex items-center justify-between bg-white/5 px-3 py-2">
                      <div>
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-slate-300">Class {m.classId} • Due {m.due}</div>
                      </div>
                      <div className="text-xs text-slate-400">{m.due < today ? 'In review' : 'Assigned'}</div>
                    </li>
                  ))}
                  {modules.length === 0 && (
                    <li className="px-3 py-3 text-sm text-slate-300">No modules yet. Click "Assign Module" to create one.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-xs font-semibold text-white/80">Module Progress by Class</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={moduleProgressByClass} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {moduleProgressByClass.map((entry, idx) => (
                          <Cell key={entry.name} fill={[ '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5 ]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Broadcast Alerts */}
          <div id="alerts" className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-semibold">Broadcast Alerts</h3>
            <div className="grid gap-2 text-sm">
              <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={target} onChange={e=>setTarget(e.target.value)}>
                <option value="ALL">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea rows={3} placeholder="Type a message (e.g., Earthquake drill at 10:30 AM)" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={msg} onChange={e=>setMsg(e.target.value)} />
              <button onClick={sendBroadcast} className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:border-red-500/60 hover:bg-red-600/20 hover:text-white">Send Broadcast</button>
            </div>
            {broadcasts.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold text-white/80">Recent</h4>
                <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 text-sm">
                  {broadcasts.slice(0,5).map(b => (
                    <li key={b.id} className="bg-white/5 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{b.to === 'ALL' ? 'All Classes' : `Class ${b.to}`}</div>
                        <div className="text-xs text-slate-400">{new Date(b.when).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-slate-300">{b.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Teacher Resources */}
          <div id="resources" className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold">Teacher Resources</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">NDMA Protocols</span>
                <button className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white" onClick={()=>setOpenNDMA(true)}>Open</button>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">Lesson Plans Pack (PDF)</span>
                <button onClick={()=>toast('Downloading lesson plans…')} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Download</button>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">Safety Videos Collection</span>
                <button onClick={()=>toast('Opening videos…')} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">View</button>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">More Resources & Virtual Drills</span>
                <a href="/teacher/resources" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-slate-200 hover:bg-white/10">Open</a>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white/90">Resource Maps (Safe Zones)</span>
                <a href="/teacher/maps" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-slate-200 hover:bg-white/10">Open</a>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-300 md:flex-row">
          <div className="flex gap-4">
            <a className="hover:text-white/90" href="#drills">View Reports</a>
            <a className="hover:text-white/90" href="#resources">Resources</a>
          </div>
          <div id="contact" className="text-xs">© {new Date().getFullYear()} AlertHub — Empowering educators 🧭 • Contact: support@alerthub.local</div>
        </div>
      </footer>

      {/* Assign Drill Modal */}
      <AnimatePresence>
        {openDrill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={()=>setOpenDrill(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-4" onClick={(e)=>e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Assign Drill</h3>
                <button className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20" onClick={()=>setOpenDrill(false)}>Close</button>
              </div>
              <div className="grid gap-3 text-sm">
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Class</span>
                  <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={drillForm.classId} onChange={e=>setDrillForm(prev=>({ ...prev, classId: e.target.value }))}>
                    <option value="">Select a class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Disaster Type</span>
                  <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={drillForm.type} onChange={e=>setDrillForm(prev=>({ ...prev, type: e.target.value }))}>
                    {HAZARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Scheduled Date</span>
                  <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={drillForm.date} onChange={e=>setDrillForm(prev=>({ ...prev, date: e.target.value }))} />
                </label>
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={()=>setOpenDrill(false)}>Cancel</button>
                  <button className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white" onClick={assignDrill}>Assign</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Module Modal */}
      <AnimatePresence>
        {openModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={()=>setOpenModule(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-4" onClick={(e)=>e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Assign Module</h3>
                <button className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20" onClick={()=>setOpenModule(false)}>Close</button>
              </div>
              <div className="grid gap-3 text-sm">
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Class</span>
                  <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={moduleForm.classId} onChange={e=>setModuleForm(prev=>({ ...prev, classId: e.target.value }))}>
                    <option value="">Select a class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Module</span>
                  <select className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={moduleForm.title} onChange={e=>setModuleForm(prev=>({ ...prev, title: e.target.value }))}>
                    {MODULE_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-slate-300">Due Date</span>
                  <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={moduleForm.due} onChange={e=>setModuleForm(prev=>({ ...prev, due: e.target.value }))} />
                </label>
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={()=>setOpenModule(false)}>Cancel</button>
                  <button className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white" onClick={assignModule}>Assign</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NDMA Guidelines Modal */}
      <AnimatePresence>
        {openNDMA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            onClick={() => setOpenNDMA(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-base font-semibold text-white">NDMA Guidelines</h3>
                <button className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20" onClick={() => setOpenNDMA(false)}>
                  Close
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto p-4">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
                    <tr>
                      <th className="px-3 py-2">S No.</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2 whitespace-nowrap">Release Date</th>
                      <th className="px-3 py-2">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {NDMA_GUIDELINES.map((g) => (
                      <tr key={String(g.no)} className="odd:bg-white/0 even:bg-white/[0.03]">
                        <td className="px-3 py-2 align-top text-slate-200">{g.no}</td>
                        <td className="px-3 py-2 align-top text-white/90">{g.title}</td>
                        <td className="px-3 py-2 align-top text-slate-300">{g.date}</td>
                        <td className="px-3 py-2 align-top">
                          <button onClick={()=>toast(`Downloading: ${g.title}`)} className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-cyan-300 transition hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">
                            Download ({g.size})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
