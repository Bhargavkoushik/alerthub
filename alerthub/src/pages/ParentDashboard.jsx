import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Phone, ShieldCheck, BookOpenText, CheckSquare, ListChecks, Info, Waves, Wind, Flame, Mountain, Sun, CloudLightning, ShieldAlert, CircleAlert, Medal, LifeBuoy, CalendarCheck, CheckCircle2, Calendar, Plus, Trash2, Users, FileText, Bell, Settings } from 'lucide-react'
import FlipBookModal from './FlipBookModal.jsx'
import { disastersData } from './disastersData'

export default function ParentDashboard() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  // Multi-child selector
  const [children] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_children')||'null') || ['Riya', 'Aarav'] } catch { return ['Riya','Aarav'] }
  })
  const [activeChild, setActiveChild] = useState(() => Number(localStorage.getItem('parent_active_child') || 0))
  useEffect(() => { localStorage.setItem('parent_active_child', String(activeChild)) }, [activeChild])
  const childName = children[activeChild] || (localStorage.getItem('currentName') || 'Your Child')

  // Student overall progress from Student Dashboard if available
  const studentProgressPct = useMemo(() => {
    const p = Number(localStorage.getItem('progressPct') || 65)
    return Math.max(0, Math.min(100, p))
  }, [])

  // Simple sample progress
  const sampleModules = ['earthquake','flood','tsunami','hurricane']
  const completed = Number(localStorage.getItem('parent_completed') || 2)
  const percent = Math.round((completed / sampleModules.length) * 100)

  // Toolkit checklist
  const defaultItems = [
    { t: 'First Aid Kit', done: true },
    { t: 'Flashlight', done: true },
    { t: 'Drinking Water (3 days)', done: false },
    { t: 'Whistle', done: false },
  ]
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_toolkit')||'null') || defaultItems } catch { return defaultItems }
  })
  useEffect(() => { localStorage.setItem('parent_toolkit', JSON.stringify(items)) }, [items])
  function toggle(idx) { setItems(items.map((it,i) => i===idx ? { ...it, done: !it.done } : it)) }

  // Family Emergency Plan checklist
  const defaultPlan = [
    { t: 'Emergency contacts', done: false },
    { t: 'Meeting locations', done: false },
    { t: 'Evacuation procedures', done: false },
  ]
  const [plan, setPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_family_plan')||'null') || defaultPlan } catch { return defaultPlan }
  })
  useEffect(() => { localStorage.setItem('parent_family_plan', JSON.stringify(plan)) }, [plan])
  function togglePlan(idx) { setPlan(plan.map((it,i) => i===idx ? { ...it, done: !it.done } : it)) }

  // Quick links now list ALL disasters available to students
  const quickLinks = useMemo(() => disastersData, [])

  function openDosDonts(mod) { setActive({ ...mod, _variant: 'dosdonts', _heading: `${mod.title}` }); setOpen(true) }

  // Personal Emergency Contacts
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_contacts')||'null') || [] } catch { return [] }
  })
  const [newContact, setNewContact] = useState({ name: '', phone: '' })
  useEffect(() => { localStorage.setItem('parent_contacts', JSON.stringify(contacts)) }, [contacts])
  function addContact() {
    if (!newContact.name.trim() || !newContact.phone.trim()) return
    setContacts([...contacts, { ...newContact }])
    setNewContact({ name: '', phone: '' })
  }
  function removeContact(i) { setContacts(contacts.filter((_, idx) => idx !== i)) }

  // Icon mapping per disaster type
  function DisasterIcon({ id }) {
    const cls = 'h-4 w-4'
    switch (id) {
      case 'flood':
      case 'tsunami':
        return <Waves className={`${cls} text-sky-600`} />
      case 'hurricane':
      case 'tornado':
        return <Wind className={`${cls} text-sky-600`} />
      case 'wildfire':
      case 'fire':
        return <Flame className={`${cls} text-amber-600`} />
      case 'volcano':
        return <Flame className={`${cls} text-rose-600`} />
      case 'earthquake':
      case 'landslide':
        return <Mountain className={`${cls} text-rose-600`} />
      case 'heatwave':
      case 'drought':
        return <Sun className={`${cls} text-amber-500`} />
      case 'thunderstorm':
        return <CloudLightning className={`${cls} text-indigo-600`} />
      case 'pandemic':
        return <ShieldAlert className={`${cls} text-purple-600`} />
      default:
        return <ListChecks className={`${cls} text-slate-400`} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 text-xl">🛡️</div>
            <div className="text-lg font-semibold">Parent Dashboard</div>
          </div>
          <div className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
            <a className="hover:text-slate-900" href="#home">Dashboard</a>
            <a className="hover:text-slate-900" href="#plan">My Family Plan</a>
            <a className="hover:text-slate-900" href="#student-progress">Child Progress</a>
            <a className="hover:text-slate-900" href="#tools">Emergency Tools</a>
            <a className="hover:text-slate-900" href="#feedback">Feedback</a>
            <div className="ml-4 flex items-center gap-2 text-slate-700">
              <Users className="h-4 w-4 text-sky-600" />
              <select value={activeChild} onChange={e=>setActiveChild(Number(e.target.value))} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                {children.map((c, idx) => <option key={idx} value={idx}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left/Center */}
        <section className="space-y-6 lg:col-span-8">
          {/* Greeting + Top KPIs */}
          <div id="home" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Hi {childName ? `${childName.split(' ')[0]}'s Parent` : 'Parent'} 👋</h2>
            <p className="mt-1 text-sm text-slate-600">Here’s your family’s safety status today.</p>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 text-xs font-semibold text-slate-700">Family Preparedness</div>
              {(() => {
                const kitPct = Math.round((items.filter(i=>i.done).length / items.length) * 100) || 0
                const planPct = Math.round((plan.filter(i=>i.done).length / plan.length) * 100) || 0
                const prep = Math.round((kitPct + planPct + studentProgressPct) / 3)
                return (
                  <>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${prep}%` }} />
                    </div>
                    <div className="mt-2 text-right text-xs text-slate-600">{prep} %</div>
                  </>
                )
              })()}
            </div>
          </div>
          {/* Student Progress */}
          <div id="student-progress" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">Child Progress Tracker</div>
                <div className="mt-1 text-xs text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {childName} completed Earthquake Safety Quiz</div>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-sky-50 text-sky-600 shadow-inner">
                <div className="text-lg font-bold">{percent}%</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-sky-500" style={{ width: `${percent}%` }} />
            </div>
            {/* Progress bars by topic */}
            <div className="mt-4 space-y-3 text-xs text-slate-700">
              {[
                { name: 'Earthquake Safety', pct: 75 },
                { name: 'Flood Preparedness', pct: 50 },
                { name: 'Fire Safety', pct: 100 },
                { name: 'Pandemic Safety', pct: 49 },
              ].map(({name,pct}) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-44 shrink-0">{name}</div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 shrink-0 text-right tabular-nums">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Action Cards / Checklists */}
          <div id="plan" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Family Emergency Plan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckSquare className="h-4 w-4 text-sky-600" /> Family Emergency Plan</div>
              <ul className="space-y-2 text-sm">
                {plan.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => togglePlan(idx)} />
                    <span className={it.done ? 'line-through text-slate-500' : 'text-slate-800'}>{it.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Emergency Kit Builder */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><BoxIcon /> Emergency Kit Builder</div>
              <ul className="space-y-2 text-sm">
                {items.slice(0,3).map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => toggle(idx)} />
                    <span className={it.done ? 'line-through text-slate-500' : 'text-slate-800'}>{it.t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-slate-500">Manage all items in Toolkit below</div>
            </div>
            {/* One-Tap SOS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid place-items-center">
                <div className="grid h-28 w-28 place-items-center rounded-full bg-slate-900 text-2xl font-bold text-white shadow">SOS</div>
                <div className="mt-3 text-sm font-semibold">One-Tap-SOS</div>
                <button onClick={() => alert('Emergency alert sent (demo)')} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"><CircleAlert className="h-4 w-4" /> Send emergency alert</button>
              </div>
            </div>
          </div>

          {/* Toolkit Readiness */}
          <div id="tools" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckSquare className="h-4 w-4 text-sky-600" /> Toolkit Readiness</div>
            <ul className="space-y-2 text-sm">
              {items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => toggle(idx)} />
                    <span className={it.done ? 'line-through text-slate-500' : 'text-slate-800'}>{it.t}</span>
                  </span>
                  {it.done ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <Info className="h-4 w-4 text-slate-400" />}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-20 self-start">
          {/* Alert CTA */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertTriangle className="h-4 w-4" /> Flood alert in your city</div>
            <button onClick={() => {
              const flood = disastersData.find(d=>d.id==='flood') || disastersData[0]
              openDosDonts(flood)
            }} className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">View Do’s & Don’ts</button>
          </div>

          {/* Today’s Task */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarCheck className="h-4 w-4 text-sky-600" /> Today’s Task</div>
            {(() => {
              const flood = disastersData.find(d=>d.id==='flood') || disastersData[0]
              return (
                <button onClick={() => openDosDonts(flood)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:border-sky-300 hover:bg-sky-50">Review {flood.title} Do’s & Don’ts with your child</button>
              )
            })()}
          </div>

          {/* Do’s & Don’ts Quick Links (moved up) */}
          <div id="dosdonts" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><BookOpenText className="h-4 w-4 text-sky-600" /> Do’s & Don’ts — Quick Access</div>
            <div className="grid max-h-80 gap-2 overflow-auto pr-1">
              {quickLinks.map((m) => (
                <button key={m.id} onClick={() => openDosDonts(m)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:border-sky-300 hover:bg-sky-50">
                  <span className="flex items-center gap-2">
                    <DisasterIcon id={m.id} />
                    <span>View {m.title} Do’s & Don’ts</span>
                  </span>
                  <ListChecks className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Family Drill Planner (moved up) */}
          <FamilyDrillPlanner />

          {/* Family Badges */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Medal className="h-4 w-4 text-emerald-600" /> Family Badges</div>
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 border border-emerald-200">
              <span className="text-lg">🏅</span> Prepared Family
            </div>
          </div>

          {/* Emergency Contacts (Helplines + Personal) */}
          <div id="contacts" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone className="h-4 w-4 text-sky-600" /> Emergency Contacts</div>
            <div className="mb-2 text-xs font-semibold text-slate-600">Helplines</div>
            <ul className="mb-4 grid gap-2 sm:grid-cols-2 text-sm">
              {[['NDMA','1078'],['Police','100'],['Ambulance','102'],['Fire','101']].map(([name,num]) => (
                <li key={name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-800">{name}</span>
                  <a className="text-sky-600 hover:underline" href={`tel:${num}`}>{num}</a>
                </li>
              ))}
            </ul>
            <div className="text-xs font-semibold text-slate-600">Personal Contacts</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {/* add form row below */}
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold text-slate-700">Add Personal Contact</div>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <input value={newContact.name} onChange={e=>setNewContact({...newContact, name:e.target.value})} placeholder="Name" className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2" />
                <input value={newContact.phone} onChange={e=>setNewContact({...newContact, phone:e.target.value})} placeholder="Phone" className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2" />
                <button onClick={addContact} className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"><Plus className="h-4 w-4" /></button>
              </div>
              <ul className="mt-3 space-y-2">
                {contacts.map((c,i) => (
                  <li key={`${c.name}-${i}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="text-slate-800">{c.name}</span>
                    <span className="text-sky-600">{c.phone}</span>
                    <button onClick={()=>removeContact(i)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notifications */}
          <div id="notifications" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><Bell className="h-4 w-4 text-sky-600" /> Notifications & Alerts</div>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
              { [
                { icon: '✅', title: `${childName} completed Flood Preparedness`, time: 'Today, 10:20 AM' },
                { icon: '⚠️', title: 'Heatwave advisory for your district', time: 'Yesterday, 5:00 PM' },
              ].map((n, i) => (
                <li key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-3"><span>{n.icon}</span><span className="text-sm text-slate-800">{n.title}</span></div>
                  <span className="text-xs text-slate-500">{n.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NDMA Reports */}
          <div id="reports" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><FileText className="h-4 w-4 text-sky-600" /> NDMA Reports & Resources</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
              <li><a className="text-sky-600 hover:underline" href="https://ndma.gov.in/" target="_blank" rel="noreferrer">NDMA Official Portal</a></li>
              <li><a className="text-sky-600 hover:underline" href="https://ndma.gov.in/document/earthquake-guidelines" target="_blank" rel="noreferrer">Earthquake Safety Guidelines</a></li>
              <li><a className="text-sky-600 hover:underline" href="https://ndma.gov.in/document/flood-guidelines" target="_blank" rel="noreferrer">Flood Management Guidelines</a></li>
              <li><a className="text-sky-600 hover:underline" href="https://ndma.gov.in/document/school-safety-policy" target="_blank" rel="noreferrer">School Safety Policy</a></li>
            </ul>
          </div>

          {/* Feedback (kept last) */}
          <FeedbackCard />
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-600">NDMA Student Preparedness Portal</div>
      </footer>

      {/* Flipbook Modal */}
      <FlipBookModal open={open} onClose={() => setOpen(false)} module={active} variant={active?._variant||'dosdonts'} heading={active?._heading} />

      {/* AI Buddy (demo) */}
      <button onClick={() => alert('AI Buddy coming soon')} className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700">
        <LifeBuoy className="h-4 w-4" /> Ask the AI Buddy
      </button>
    </div>
  )
}

// Small icon component for kit card title
function BoxIcon() {
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-sky-100 text-[10px] font-bold text-sky-700">🧰</span>
}

// Family Drill Planner component
function FamilyDrillPlanner() {
  const [drills, setDrills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_drills')||'null') || [] } catch { return [] }
  })
  const [form, setForm] = useState({ title: '', date: '', time: '' })
  useEffect(() => { localStorage.setItem('parent_drills', JSON.stringify(drills)) }, [drills])
  function addDrill() {
    if (!form.title.trim() || !form.date) return
    setDrills([...drills, { ...form }])
    setForm({ title: '', date: '', time: '' })
  }
  function removeDrill(i) { setDrills(drills.filter((_,idx)=>idx!==i)) }
  return (
    <div id="planner" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><Calendar className="h-4 w-4 text-sky-600" /> Family Drill Planner</div>
      <div className="grid grid-cols-5 gap-2 text-sm">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Drill (e.g., Earthquake)" className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2" />
        <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2" />
        <input type="time" value={form.time} onChange={e=>setForm({...form, time:e.target.value})} className="col-span-1 rounded-lg border border-slate-200 bg-white px-2 py-2" />
      </div>
      <div className="mt-2 flex justify-end"><button onClick={addDrill} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"><Plus className="h-4 w-4" /> Add</button></div>
      <ul className="mt-3 space-y-2">
        {drills.map((d,i) => (
          <li key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <div>
              <div className="font-medium text-slate-800">{d.title}</div>
              <div className="text-xs text-slate-500">{d.date} {d.time && `• ${d.time}`}</div>
            </div>
            <button onClick={()=>removeDrill(i)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Feedback card
function FeedbackCard() {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parent_feedback')||'null') || [] } catch { return [] }
  })
  const [form, setForm] = useState({ subject: '', message: '' })
  useEffect(() => { localStorage.setItem('parent_feedback', JSON.stringify(list)) }, [list])
  function submit() {
    if (!form.subject.trim() || !form.message.trim()) return
    setList([{ ...form, at: new Date().toISOString() }, ...list])
    setForm({ subject: '', message: '' })
    alert('Thanks for your feedback!')
  }
  return (
    <div id="feedback" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><Settings className="h-4 w-4 text-sky-600" /> Feedback</div>
      <div className="grid gap-2 text-sm">
        <input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="Subject" className="rounded-lg border border-slate-200 bg-white px-3 py-2" />
        <textarea value={form.message} onChange={e=>setForm({...form, message:e.target.value})} placeholder="Your message" className="min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2" />
        <div className="flex justify-end"><button onClick={submit} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Submit</button></div>
      </div>
      {list.length > 0 && (
        <ul className="mt-3 space-y-2">
          {list.slice(0,3).map((f,i) => (
            <li key={i} className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-sm font-medium text-slate-800">{f.subject}</div>
              <div className="text-xs text-slate-500">{new Date(f.at).toLocaleString()}</div>
              <div className="mt-1 text-sm text-slate-700">{f.message}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
