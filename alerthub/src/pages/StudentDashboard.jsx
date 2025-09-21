import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { disastersData } from './disastersData'
import FlipBookModal from './FlipBookModal.jsx'

export default function StudentDashboard() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const name = useMemo(() => localStorage.getItem('currentName') || 'varun', [])

  // progress and XP (persisted)
  const [progressPct, setProgressPct] = useState(() => Number(localStorage.getItem('progressPct') || 65))
  const [xp, setXp] = useState(() => Number(localStorage.getItem('xp') || 120))
  const [level, setLevel] = useState(() => Number(localStorage.getItem('level') || 3))
  useEffect(() => { localStorage.setItem('progressPct', String(progressPct)) }, [progressPct])
  useEffect(() => { localStorage.setItem('xp', String(xp)) }, [xp])
  useEffect(() => { localStorage.setItem('level', String(level)) }, [level])

  const modules = disastersData

  function onOpenModule(mod) { setActive({ ...mod, _variant: 'dosdonts', _heading: `${mod.title}` }); setOpen(true) }
  function onKnow(mod) {
    setActive({ ...mod, _variant: 'generic', _heading: `Know the Disaster — ${mod.title}` });
    setOpen(true)
  }
  function onPlanPrepare(mod) {
    setActive({ ...mod, _variant: 'generic', _heading: `Plan & Prepare — ${mod.title}` });
    setOpen(true)
  }
  function onRecoveryBuild(mod) {
    setActive({ ...mod, _variant: 'generic', _heading: `Recovery & Build — ${mod.title}` });
    setOpen(true)
  }
  function onBuildKit() {
    const el = document.getElementById('kit')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Quick tip popup on load
  const tips = useMemo(() => [
    'Keep a small first-aid kit in your backpack.',
    'Practice your family meeting point during weekends.',
    'Know the safest spot in your classroom for earthquakes.',
    'Store emergency contacts on your phone favorites.',
  ], [])
  const [showTip, setShowTip] = useState(false)
  const [tip, setTip] = useState('')
  useEffect(() => {
    const t = tips[Math.floor(Math.random() * tips.length)]
    setTip(t); setShowTip(true)
    const id = setTimeout(() => setShowTip(false), 6000)
    return () => clearTimeout(id)
  }, [tips])

  // recent alerts
  const [alerts, setAlerts] = useState([])
  useEffect(() => {
    fetch('/alerts-sample.json').then(r => r.json()).then(setAlerts).catch(() => setAlerts([]))
  }, [])

  // awareness data (safe vs unsafe)
  const data = [
    { name: 'Safe', value: Math.max(10, Math.min(90, progressPct)) },
    { name: 'Unsafe', value: 100 - Math.max(10, Math.min(90, progressPct)) },
  ]
  const COLORS = ['#10b981', '#ef4444']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl">⚡</div>
            <div className="text-lg font-semibold">Dashboard</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <a className="hover:text-white/90" href="#modules">My Modules</a>
            <a className="hover:text-white/90" href="#quizzes">Quizzes & Drills</a>
            <a className="hover:text-white/90" href="#leaderboard">Leaderboard</a>
            <a className="hover:text-white/90" href="#rewards">Rewards</a>
            <a className="hover:text-white/90" href="#settings">Settings</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left / Center Content */}
        <section className="space-y-6 lg:col-span-8">
          {/* Welcome Section */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl">🧒</div>
                <div>
                  <h1 className="text-xl font-semibold md:text-2xl">Hi {name} 👋, ready to learn how to stay safe?</h1>
                  <p className="mt-1 text-xs text-slate-300">Level {level} • {xp} XP</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">
                Today: 1 Quiz, 1 Drill — {progressPct}%
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <button
                className="rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white transition-colors duration-200 ease-out hover:bg-emerald-700 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                onClick={() => { setXp(xp+10); setProgressPct(Math.min(100, progressPct+5)) }}
              >
                Gain 10 XP
              </button>
              <button
                className="rounded-lg bg-indigo-600 px-3 py-1 font-semibold text-white transition-colors duration-200 ease-out hover:bg-indigo-700 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                onClick={() => setLevel(level+1)}
              >
                Level Up
              </button>
            </div>
          </div>

          {/* My Modules */}
          <div id="modules" className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">My Modules</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((m) => (
                <div key={m.id} className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow transition hover:shadow-lg">
                  <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-white/5 to-white/10 opacity-30 blur-2xl`} />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xl">
                      <span aria-hidden>{m.icon || '📘'}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90">{m.title}</h3>
                      <p className="mt-1 text-xs text-slate-300">{m.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <button
                          title={`Know ${m.title}`}
                          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onKnow(m)}
                        >
                          Know the Disaster
                        </button>
                        <button
                          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onOpenModule(m)}
                        >
                          Do’s & Don’ts
                        </button>
                        <button
                          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onPlanPrepare(m)}
                        >
                          Plan & Prepare
                        </button>
                        <button
                          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onRecoveryBuild(m)}
                        >
                          Recovery & Build
                        </button>
                        <button
                          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={onBuildKit}
                        >
                          Build a Kit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preparedness Toolkit */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Emergency Kit Builder */}
            <EmergencyKit />
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Awareness Dashboard */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold">Awareness Dashboard</h3>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" innerRadius={34} outerRadius={50} paddingAngle={3}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-slate-300">
                <div className="mb-1 flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Safe</div>
                <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Unsafe</div>
              </div>
            </div>

            {/* Recent Alerts (from public/alerts-sample.json) */}
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold text-white/80">Recent Alerts</h4>
              <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 text-sm">
                {alerts.slice(0,4).map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2">
                    <div>
                      <div className="font-medium">{a.eventname}</div>
                      <div className="text-xs text-slate-300">Level: {a.alertlevel || 'NA'}</div>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(a.fromdate).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2 text-sm">
                <button
                  className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 font-semibold text-white transition-colors duration-200 ease-out hover:bg-cyan-700 active:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  onClick={() => alert('Quiz coming soon')}
                >
                  Start a Quiz
                </button>
                <button
                  className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white transition-colors duration-200 ease-out hover:bg-indigo-700 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  onClick={() => alert('Drill coming soon')}
                >
                  Do a Drill
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-3">
            <div id="rewards" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-semibold">Rewards Center</h4>
              <p className="mt-1 text-xs text-slate-300">View Badges & Certificates</p>
              <button className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-amber-700 active:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/60">View Rewards</button>
            </div>
            <Helplines />
          </div>
        </aside>
      </main>

      {/* Flipbook Modal */}
      <FlipBookModal open={open} onClose={() => setOpen(false)} module={active} variant={active?._variant || 'dosdonts'} heading={active?._heading}
        customContent={active?._content}
      />

      {/* Quick Tip */}
      {showTip && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-xl border border-white/10 bg-white/10 p-3 text-sm backdrop-blur">
          <div className="font-semibold">Quick Tip</div>
          <div className="mt-1 text-white/90">{tip}</div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-300 md:flex-row">
          <div className="flex gap-4">
            <a className="hover:text-white/90" href="#emergency">Emergency Contacts</a>
            <a className="hover:text-white/90" href="#about">About AlertHub</a>
            <a className="hover:text-white/90" href="#feedback">Feedback</a>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} AlertHub — Stay safe, keep learning 💡</div>
        </div>
      </footer>
    </div>
  )
}

// Emergency Kit Builder
function EmergencyKit() {
  const defaultItems = [
    'Water bottle', 'First-aid kit', 'Flashlight', 'Whistle', 'Snacks', 'Battery pack'
  ]
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kit-items') || 'null')
      return saved || defaultItems.map((t) => ({ t, done: false }))
    } catch { return defaultItems.map((t) => ({ t, done: false })) }
  })
  useEffect(() => { localStorage.setItem('kit-items', JSON.stringify(items)) }, [items])

  function toggle(idx) { setItems(items.map((it, i) => i===idx ? { ...it, done: !it.done } : it)) }

  return (
    <div id="kit" className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-2 text-sm font-semibold">Emergency Kit Builder</h3>
      <ul className="space-y-2 text-sm">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => toggle(idx)} />
            <span className={it.done ? 'line-through text-slate-400' : ''}>{it.t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Family Emergency Plan
function FamilyPlan() {
  const [form, setForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem('family-plan') || 'null') || { meeting: '', contact: '' } } catch { return { meeting: '', contact: '' } }
  })
  useEffect(() => { localStorage.setItem('family-plan', JSON.stringify(form)) }, [form])
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-sm font-semibold">Family Emergency Plan</h4>
      <div className="mt-2 grid gap-2 text-xs">
        <input value={form.meeting} onChange={e=>setForm({ ...form, meeting: e.target.value })} placeholder="Safe meeting place" className="rounded-lg bg-white/10 px-3 py-2 outline-none" />
        <input value={form.contact} onChange={e=>setForm({ ...form, contact: e.target.value })} placeholder="Emergency contact" className="rounded-lg bg-white/10 px-3 py-2 outline-none" />
      </div>
    </div>
  )
}

// Helpline panel
function Helplines() {
  const lines = [
    { name: 'Police', num: '100' },
    { name: 'Ambulance', num: '102' },
    { name: 'Fire', num: '101' },
    { name: 'NDMA', num: '011-26701728' },
  ]
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-sm font-semibold">Emergency Helplines</h4>
      <ul className="mt-2 space-y-1 text-xs text-slate-300">
        {lines.map((l) => (
          <li key={l.name} className="flex items-center justify-between">
            <span>{l.name}</span>
            <a className="text-cyan-400" href={`tel:${l.num}`}>{l.num}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
