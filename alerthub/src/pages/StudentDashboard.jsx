import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { disastersData } from './disastersData'
import FlipBookModal from './FlipBookModal.jsx'
const EmergencyKitBuilder = lazy(() => import('./EmergencyKitBuilder.jsx'))

// Helper: readable plural hazard names for button/heading text
function hazardPlural(mod) {
  const map = {
    earthquake: 'earthquakes',
    flood: 'floods',
    wildfire: 'wildfires',
    hurricane: 'cyclones', // or "hurricanes" based on region
    tsunami: 'tsunamis',
    pandemic: 'pandemics',
    heatwave: 'heatwaves',
    landslide: 'landslides',
    volcano: 'volcanoes',
    tornado: 'tornadoes',
    drought: 'droughts',
    fire: 'fires',
    thunderstorm: 'thunderstorms',
  }
  const id = (mod?.id || '').toLowerCase()
  return map[id] || `${(mod?.title || 'hazards').toLowerCase()}s`
}
function capitalize(s) { return typeof s === 'string' && s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

// Emoji icon for each hazard id
function hazardEmoji(id) {
  const k = String(id || '').toLowerCase()
  const map = {
    earthquake: '🏚️',
    volcano: '🌋',
    tornado: '🌪️',
    tsunami: '🌊',
    hurricane: '🌀',
    drought: '🏜️',
    wildfire: '🔥',
    landslide: '⛰️',
    flood: '🌧️',
  }
  return map[k] || '⚠️'
}

export default function StudentDashboard() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [opsOpen, setOpsOpen] = useState(false)
  const name = useMemo(() => localStorage.getItem('currentName') || 'varun', [])

  // Progress percent (computed from module completion below)
  const [progressPct, setProgressPct] = useState(() => {
    // Always start with 0% for new users
    const saved = localStorage.getItem('progressPct')
    return saved ? Math.max(0, parseInt(saved) || 0) : 0
  })

  // Show only the requested disaster modules in a fixed, neat order
  // Reordered so Flood appears to the right of Wildfire as a pair; Landslide follows after
  // Place Landslide to the left of Flood (top-left), with Wildfire nearby as shown
  const allowedIds = ['earthquake','volcano','tornado','tsunami','hurricane','drought','landslide','flood','wildfire']
  const displayOrder = allowedIds
  const modules = disastersData
    .filter(m => allowedIds.includes((m.id || '').toLowerCase()))
    .sort((a,b) => displayOrder.indexOf(a.id.toLowerCase()) - displayOrder.indexOf(b.id.toLowerCase()))

  // Track visited sections per module to infer completion
  const [visitedMap, setVisitedMap] = useState(() => {
    // Always start with empty map for new users
    try { 
      const saved = localStorage.getItem('visited-modules')
      return saved ? JSON.parse(saved) : {} 
    } catch { 
      return {} 
    }
  })
  useEffect(() => { localStorage.setItem('visited-modules', JSON.stringify(visitedMap)) }, [visitedMap])

  const requiredKeys = useMemo(() => ['know','dosdonts','plan','recovery','effects'], [])
  const completedModules = useMemo(() => {
    return modules.filter(m => {
      const v = visitedMap[m.id] || {}
      return requiredKeys.every(k => !!v[k])
    }).length
  }, [modules, visitedMap, requiredKeys])
  // Compute XP as 10 points per visited section across allowed modules
  const xp = useMemo(() => {
    const xpPerSection = 10
    let visitedCount = 0
    for (const m of modules) {
      const v = visitedMap[m.id] || {}
      for (const k of requiredKeys) if (v[k]) visitedCount++
    }
    return visitedCount * xpPerSection
  }, [modules, visitedMap, requiredKeys])
  const computedProgress = useMemo(() => {
    const total = modules.length || 1
    return Math.round((completedModules / total) * 100)
  }, [modules.length, completedModules])
  useEffect(() => {
    setProgressPct(computedProgress)
    localStorage.setItem('progressPct', String(computedProgress))
  }, [computedProgress])

  function markVisited(id, key) {
    setVisitedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: true } }))
  }
  function onOpenModule(mod) { setActive({ ...mod, _variant: 'dosdonts', _heading: `${mod.title}` }); markVisited(mod.id, 'dosdonts'); setOpen(true) }
  function onKnow(mod) {
    setActive({ ...mod, _variant: 'generic', _heading: 'Know the Disaster' });
    markVisited(mod.id, 'know')
    setOpen(true)
  }
  function onPlanPrepare(mod) {
    const h = capitalize(hazardPlural(mod))
    setActive({ ...mod, _variant: 'plan', _heading: `Plan & Rebuild for ${h}` });
    markVisited(mod.id, 'plan')
    setOpen(true)
  }
  function onRecoveryBuild(mod) {
    setActive({ ...mod, _variant: 'recovery', _heading: `Recover & Build` });
    markVisited(mod.id, 'recovery')
    setOpen(true)
  }
  function onEffects(mod) {
    setActive({ ...mod, _variant: 'effects', _heading: 'Effects of Disasters' })
    markVisited(mod.id, 'effects')
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
            <a className="hover:text-white/90" href="/quiz">Quiz</a>
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
                </div>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">
                Progress: {progressPct}% • Completed {completedModules}/{modules.length} modules • {xp} XP
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
            {/* Manual XP/Level buttons removed: progress reflects module completion */}
          </div>

          {/* My Modules */}
          <div id="modules" className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">My Modules</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((m) => (
                <div key={m.id} className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow transition hover:shadow-lg">
                  <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-white/5 to-white/10 opacity-30 blur-2xl`} />
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 place-items-center shrink-0 rounded-lg bg-white/10 text-lg">{hazardEmoji(m.id)}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white/90">{m.title}</h3>
                      <p className="mt-1 text-xs text-slate-300">{m.description}</p>
                      <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        <button
                          title={`Know ${m.title}`}
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onKnow(m)}
                        >
                          Know the Disaster
                        </button>
                        <button
                          title="Effects of Disasters"
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onEffects(m)}
                        >
                          Effects of Disasters
                        </button>
                        <button
                          title="Do’s & Don’ts"
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onOpenModule(m)}
                        >
                          Do’s & Don’ts
                        </button>
                        <button
                          title="Plan & Rebuild"
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onPlanPrepare(m)}
                        >
                          Plan & Rebuild
                        </button>
                        <button
                          title="Recover & Build"
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
                          onClick={() => onRecoveryBuild(m)}
                        >
                          Recover & Build
                        </button>
                        <button
                          title="Build a Kit"
                          className="block w-full rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-300 transition-colors duration-200 ease-out hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60 active:bg-cyan-700"
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

          {/* Preparedness Toolkit moved below main for full-width */}
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
              {/* Quiz/Drill buttons removed from Awareness Dashboard per request */}
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-3">
            <Helplines onOpenOps={() => setOpsOpen(true)} />
          </div>
        </aside>
      </main>

      {/* Full-width Emergency Kit Builder below main grid */}
      <section className="mx-auto max-w-7xl px-4 pb-6">
        <Suspense fallback={<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Loading kit builder…</div>}>
          <EmergencyKitBuilder />
        </Suspense>
      </section>

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

      {/* Emergency Operations Center Modal */}
      <EmergencyOpsModal open={opsOpen} onClose={() => setOpsOpen(false)} />

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

// Old EmergencyKit removed; replaced by EmergencyKitBuilder component

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
function Helplines({ onOpenOps }) {
  const lines = [
    { name: 'Police', num: '100' },
    { name: 'Ambulance', num: '102' },
    { name: 'Fire', num: '101' },
    { name: 'NDMA', num: '011-26701728' },
  ]
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="mb-3 text-sm font-semibold">Emergency Helplines</h4>
      <ul className="space-y-3 text-sm">
        {lines.map((l) => (
          <li key={l.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="font-medium text-white/90">{l.name}</span>
            <a
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 font-extrabold text-red-400 shadow-sm transition hover:border-red-500/60 hover:bg-red-600/20 hover:text-red-300"
              href={`tel:${l.num}`}
            >
              {l.num}
            </a>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-center text-sm font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white"
        onClick={onOpenOps}
      >
        Emergency Operations Center
      </button>
    </div>
  )
}

// Emergency Operations Center Modal
function EmergencyOpsModal({ open, onClose }) {
  // Close on Escape (must be before early return to satisfy hooks rules)
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null
  const rows = [
    { entity: 'National Emergency Response Center, Disaster Management Division, Ministry of Home Affairs', contact: '011-23438252, 011-23438253; Helpline: 011-1070', email: 'dresponse-nerc@gov.in', website: 'https://ndmindia.mha.gov.in', timings: '' },
    { entity: 'Ministry of Railways', contact: '+91-23382638 (O), 9717641291 (M)', email: 'safetycontrolrb@gmail.com', website: 'https://indianrailways.gov.in/index1.html', timings: '24x7' },
    { entity: 'Andaman & Nicobar Island', contact: '03192-238880; 9434280357; 9434269884', email: 'statecontrolroom@gmail.com', website: 'https://ddm.and.nic.in/', timings: '24x7' },
    { entity: 'Andhra Pradesh', contact: '08645-246600, 8333905033; 0863-2377119, 2377120, 8333905022', email: 'seoc-apsdma@ap.gov.in', website: 'http://apsdma.ap.gov.in/', timings: '24x6 (Mon to Sat)' },
    { entity: 'Arunachal Pradesh', contact: '+91-9436074396, +91-8132887868, +91-8257891310', email: 'arun01ddm@gmail.com', website: 'https://itanagar.nic.in/disaster-management/', timings: '24x7' },
    { entity: 'Assam', contact: '+91-361-2237219, +91-361-2237377, +91-9401044617, +91-9435592762', email: 'sdma-assam@gov.in; statedmcontrolroomassam@gmail.com', website: 'https://asdma.assam.gov.in/', timings: '24x7' },
    { entity: 'Bihar', contact: '+91-612-2294204, +91-612-2294205, +91-9431089514', email: 'secy-disastermgmt-bih@nic.in', website: 'https://state.bihar.gov.in/disastermgmt', timings: '24x7' },
    { entity: 'Chandigarh (UT)', contact: '+91-172-2704048, +91-9915557733', email: 'civildefence.chandigarh@gmail.com', website: 'https://chandigarh.gov.in/departments/other-departments/sdma', timings: '24x7' },
    { entity: 'Chhattisgarh', contact: '+91-771-2221242, +91-771-2510593', email: 'cgrelief@gmail.com', website: 'https://sdma.cg.nic.in/', timings: 'June to Oct.' },
    { entity: 'Dadra & Nagar Haveli, Daman & Diu', contact: '+91-9426779928; 91-260-2253000; +91-260-112; +91-9099600112', email: 'eoc-dnhdd@nic.in', website: 'https://ddd.gov.in/', timings: '24x7' },
    { entity: 'Delhi', contact: '0107, 011-23982164, 23831077', email: 'ddma1077.delhi@nic.in', website: 'https://ddma.delhi.gov.in/', timings: '24x7' },
    { entity: 'Goa', contact: '+91-832-2419444, +91-832-2419446, +91-7875015991', email: 'usrev1-sect.goa@nic.in; usrev2-sect.goa@nic.in', website: 'https://sdma.goa.gov.in/', timings: '24x7' },
    { entity: 'Gujarat', contact: '+91-79-23251900, +91-79-23251903', email: 'revcontrol1@gujarat.gov.in', website: 'http://gsdma.org/', timings: '24x7' },
    { entity: 'Haryana', contact: '+91-172-2545938, +91-7015375601', email: 'sdmaharyana@gmail.com', website: 'http://hdma.gov.in/en', timings: '24x7' },
    { entity: 'Himachal Pradesh', contact: '+91-177-2628940, +91-8629880160', email: 'seocshimla@gmail.com; sdma_hp@nic.in', website: 'https://hpsdma.nic.in/', timings: '24x7' },
    { entity: 'Jammu & Kashmir', contact: '+91-191-2303399, +91-9419007285', email: 'jksdma@gmail.com; pcrjammuoff@jkpolice.gov.in; pcrkashmir@gmail.com', website: 'https://jksdma.jk.gov.in/', timings: '24x7' },
    { entity: 'Jharkhand', contact: '+91-651-2446923, +91-9410992681', email: 'dmjharkhand@gmail.com', website: 'https://www.jharkhand.gov.in/home', timings: '24x5 (Mon to Fri)' },
    { entity: 'Karnataka', contact: '080-22340676, 080-22353980', email: 'sodmrevenue@gmail.com', website: 'https://ksdma.karnataka.gov.in/english', timings: '24x7' },
    { entity: 'Kerala', contact: '+91-471-2364424, 9400202927', email: 'keralasdma@gmail.com', website: 'https://sdma.kerala.gov.in/', timings: '24x7' },
    { entity: 'Ladakh (UT)', contact: '+91-1982-251169; +91-1982-260887, 260888', email: 'igpladakh@gmail.com', website: 'https://leh.nic.in/document-category/disaster-management/', timings: '24x7' },
    { entity: 'Lakshadweep', contact: '+91-4896-263100, +91-9447482258', email: 'controlroomkvt@gmail.com; lk-coll@nic.in; ldmaeoc@gmail.com', website: 'https://lakshadweep.gov.in/disaster-management/', timings: '' },
    { entity: 'Madhya Pradesh', contact: '+91-755-2441419, +91-755-2527177, +91-8964903409', email: 'reliefcom@nic.in', website: 'https://mpsdma.mp.gov.in', timings: '24x7' },
    { entity: 'Maharashtra', contact: '+91-22-22027990, +91-22-22794229, +918007902145', email: 'controlroom@maharashtra.gov.in; director.dm@maharashtra.gov.in', website: 'https://rfd.maharashtra.gov.in/en', timings: '24x7' },
    { entity: 'Manipur', contact: '+91-385-2443941, +91-385-2443441, +919612642060', email: 'ranjitoff@gmail.com', website: 'https://manipur.gov.in/?page_id=1649', timings: '24x7' },
    { entity: 'Meghalaya', contact: '+91364-2502098, +91-6009924512', email: 'sdmadeptt007@gmail.com', website: 'https://msdma.gov.in/', timings: '24x7' },
    { entity: 'Mizoram', contact: '+91-389-2342520, +91-389-2335837, +91-9862661763, +91-9615332933', email: 'mizoramdmr@gmail.com; dmr.gov@gmail.com', website: 'https://dmr.mizoram.gov.in/', timings: '24x7' },
    { entity: 'Nagaland', contact: '0370-22911200, 9402489435', email: 'sdma.nagaland@gmail.com; seoc.nsdma@gmail.com', website: 'https://nsdma.nagaland.gov.in/home', timings: '24x7' },
    { entity: 'Odisha', contact: '+91-674-2534177, +91-9437111705', email: 'srcodishagov@gmail.com', website: 'https://www.osdma.org/?lang=en', timings: '24x7' },
    { entity: 'Puducherry', contact: '+91-413-2253407', email: 'seoc.pon@nic.in; eocpdy@gmail.com', website: 'https://puducherry-dt.gov.in/disaster-management/', timings: '24x7' },
    { entity: 'Punjab', contact: '0172-2740298; Civil CR-2740397; 2740936; 2440035; +91-172-2720153', email: 'sccr.pd2020@gmail.com', website: 'https://revenue.punjab.gov.in/?q=floodsnatural-calamities', timings: '24x7' },
    { entity: 'Rajasthan', contact: '+91-141-2227084, +91-9414000240', email: 'relief-rj@nic.in', website: 'https://dmrelief.rajasthan.gov.in/#', timings: 'June to Sep (Monsoon)' },
    { entity: 'Sikkim', contact: '+91-359-2201145, +91-9647872307, +91-9434137226', email: 'ssdma01@gmail.com', website: 'https://www.ssdma.nic.in/', timings: '24x7' },
    { entity: 'Tamil Nadu', contact: '044-28593990, 044-28414513, 9445869849', email: 'tnstateeoc@gmail.com', website: 'https://www.cra.tn.gov.in/disaster.php', timings: '24x7' },
    { entity: 'Telangana', contact: '040-23454088, 1079, 40-23454088, 9505027167', email: 'instaxx@telangana.gov.in; commr_dm@telangana.gov.in', website: 'https://fire.telangana.gov.in/', timings: 'SEOC Not Establish' },
    { entity: 'Tripura', contact: '+91-381-2416045, +91-381-2416241, +91-8787676210', email: 'scrtripura@gmail.com', website: 'https://tdma.tripura.gov.in/', timings: '24x7' },
    { entity: 'Uttarakhand', contact: '+91-135-2710334, +91-33509557444486, +91-9152443853', email: 'seoc.dmmc@gmail.com', website: 'https://usdma.uk.gov.in/', timings: '24x7' },
    { entity: 'Uttar Pradesh', contact: '+91-522-2235083, +91-9336612864', email: 'rahat@nic.in', website: 'https://upsdma.up.nic.in/', timings: '24x7' },
    { entity: 'West Bengal', contact: '+91-33-22143526, 22141378 (F)', email: 'wbdmeoc@gmail.com', website: 'http://wbdmd.gov.in/Pages/Default.aspx', timings: '24x7' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl" onClick={(e)=>e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Emergency Operations Center</h3>
          <button className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20" onClick={onClose}>Close</button>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-3 py-2">Ministry / State</th>
                <th className="px-3 py-2">Contact Number</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Website</th>
                <th className="px-3 py-2">Timings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-white/0 even:bg-white/[0.03]">
                  <td className="max-w-[320px] px-3 py-2 align-top text-white/90">{r.entity}</td>
                  <td className="min-w-[220px] px-3 py-2 align-top font-semibold text-red-400">
                    <div className="space-y-1 break-words">
                      {String(r.contact)
                        .split(/[;,]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                    </div>
                  </td>
                  <td className="max-w-[280px] px-3 py-2 align-top"><a className="break-words text-cyan-400" href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td className="max-w-[300px] px-3 py-2 align-top"><a className="break-words text-cyan-400" href={r.website} target="_blank" rel="noreferrer">{r.website}</a></td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-300">{r.timings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
