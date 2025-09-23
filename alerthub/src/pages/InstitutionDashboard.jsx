import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'
import InlineChatHints from '../components/InlineChatHints.jsx'

// Mock data helpers
const DEFAULT_CLASSES = [
  { id: '8A', name: 'Class 8A', size: 32 },
  { id: '8B', name: 'Class 8B', size: 28 },
  { id: '9A', name: 'Class 9A', size: 30 },
  { id: '10A', name: 'Class 10A', size: 29 },
]
const HAZARD_TYPES = ['Earthquake','Flood','Wildfire','Hurricane','Tsunami','Landslide','Drought','Tornado','Volcano']

function readLS(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }
function uid() { return Math.random().toString(36).slice(2, 9) }

export default function InstitutionDashboard() {
  const [classes] = useState(() => readLS('teacher-classes', DEFAULT_CLASSES))
  const [drills, setDrills] = useState(() => readLS('inst-drills', []))
  const [broadcasts, setBroadcasts] = useState(() => readLS('inst-broadcasts', []))

  const studentPreparedness = useMemo(() => {
    return classes.map(c => ({ name: c.name, value: Math.round(40 + Math.random()*60) }))
  }, [classes])
  const moduleCompletion = useMemo(() => {
    return classes.map(c => ({ name: c.name, value: Math.round(30 + Math.random()*70) }))
  }, [classes])
  const alertTypeAgg = useMemo(() => {
    const m = new Map()
    HAZARD_TYPES.forEach(t => m.set(t, 0))
    for (const d of drills) {
      const k = d.type
      m.set(k, (m.get(k) || 0) + 1)
    }
    return Array.from(m, ([name, value]) => ({ name, value }))
  }, [drills])

  // Drill scheduler form
  const [form, setForm] = useState({ classIds: [], type: HAZARD_TYPES[0], date: new Date().toISOString().slice(0,10) })
  function toggleClass(id) {
    setForm(prev => ({ ...prev, classIds: prev.classIds.includes(id) ? prev.classIds.filter(x=>x!==id) : [...prev.classIds, id] }))
  }
  function schedule() {
    if (form.classIds.length === 0) return toast.error('Select at least one class')
    const newOnes = form.classIds.map(cid => ({ id: uid(), classId: cid, type: form.type, date: form.date }))
    setDrills(prev => [...newOnes, ...prev])
    localStorage.setItem('inst-drills', JSON.stringify([...newOnes, ...drills]))
    toast.success('Drill(s) scheduled')
  }

  // Broadcast tools
  const [target, setTarget] = useState('students')
  const [message, setMessage] = useState('')
  const templates = ['Fire Drill at 10:00 AM','Flood Alert: Avoid low-lying areas','Earthquake Safety: Drop, Cover, Hold']
  function sendBroadcast() {
    const text = message.trim()
    if (!text) return toast.error('Message cannot be empty')
    const entry = { id: uid(), when: new Date().toISOString(), to: target, text }
    const updated = [entry, ...broadcasts]
    setBroadcasts(updated)
    localStorage.setItem('inst-broadcasts', JSON.stringify(updated))
    toast.success('Broadcast queued')
    setMessage('')
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">🏫</div>
            <div className="text-lg font-semibold">Institution Dashboard</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <Link className="hover:text-white/90" to="/">Home</Link>
            <a className="hover:text-white/90" href="#alerts">Alerts</a>
            <Link className="hover:text-white/90" to="/community">Community</Link>
            <a className="hover:text-white/90" href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left/Center */}
        <section className="space-y-6 lg:col-span-8">
          {/* Overview & quick links */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-semibold md:text-2xl">Campus Readiness Overview</h1>
                <p className="mt-1 text-sm text-slate-300">Oversee teachers, students and drills across the institution.</p>
              </div>
              <div className="flex gap-2">
                <Link to="/institution/analytics" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Analytics</Link>
                <Link to="/institution/reports" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Drill Reports</Link>
                <Link to="/institution/broadcasts" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Broadcast Tools</Link>
                <Link to="/institution/maps" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Resource Maps</Link>
              </div>
            </div>
          </div>

          {/* Scheduler */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold">Drill Scheduler</div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="mb-1 text-xs text-slate-300">Select Classes</div>
                <div className="flex flex-wrap gap-2">
                  {classes.map(c => (
                    <button key={c.id} onClick={()=>toggleClass(c.id)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${form.classIds.includes(c.id) ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-slate-300">Disaster Type</span>
                <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={form.type} onChange={e=>setForm(prev=>({ ...prev, type: e.target.value }))}>
                  {HAZARD_TYPES.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-slate-300">Date</span>
                <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={form.date} onChange={e=>setForm(prev=>({ ...prev, date: e.target.value }))} />
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={schedule} className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white">Schedule Drills</button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">Student Preparedness %</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentPreparedness}>
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">Module Completion %</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={moduleCompletion} dataKey="value" nameKey="name" outerRadius={86} innerRadius={46}>
                      {moduleCompletion.map((entry, i) => (
                        <Cell key={entry.name} fill={['#10b981','#06b6d4','#f59e0b','#ef4444','#8b5cf6'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          <InlineChatHints hints={["Nearest safe zone","Show drill completion % for Class 10","Download report flood"]} />
          <div id="alerts" className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold">Broadcast Tools</div>
            <div className="grid gap-2 text-sm">
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={target} onChange={e=>setTarget(e.target.value)}>
                <option value="students" className="text-slate-900">Students</option>
                <option value="teachers" className="text-slate-900">Teachers</option>
                <option value="parents" className="text-slate-900">Parents</option>
              </select>
              <div className="flex gap-2">
                {templates.map(tmp => (
                  <button key={tmp} onClick={()=>setMessage(tmp)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10">{tmp}</button>
                ))}
              </div>
              <textarea rows={3} placeholder="Type a message" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={message} onChange={e=>setMessage(e.target.value)} />
              <button onClick={sendBroadcast} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Send</button>
            </div>
            {broadcasts.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold text-white/80">Recent</div>
                <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 text-sm">
                  {broadcasts.slice(0,6).map(b => (
                    <li key={b.id} className="bg-white/5 px-3 py-2">
                      <div className="flex items-center justify-between"><div className="font-medium">To: {b.to}</div><div className="text-xs text-slate-400">{new Date(b.when).toLocaleString()}</div></div>
                      <div className="text-xs text-slate-300">{b.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold">Alert Types from Scheduled Drills</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertTypeAgg}>
                  <XAxis dataKey="name" stroke="#cbd5e1" interval={0} angle={-20} dy={10} height={60} />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-300 md:flex-row">
          <div className="flex gap-4">
            <Link className="hover:text-white/90" to="/institution/reports">Reports</Link>
            <Link className="hover:text-white/90" to="/institution/maps">Maps</Link>
            <Link className="hover:text-white/90" to="/institution/broadcasts">Broadcasts</Link>
            <Link className="hover:text-white/90" to="/institution/analytics">Analytics</Link>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} AlertHub — Institution Console</div>
        </div>
      </footer>
    </div>
  )
}
