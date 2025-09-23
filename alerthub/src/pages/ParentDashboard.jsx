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

  // Get real student progress data from localStorage
  const [refreshKey, setRefreshKey] = useState(0)
  const visitedMap = useMemo(() => {
    // Always start with empty map for new users
    try { 
      const saved = localStorage.getItem('visited-modules')
      return saved ? JSON.parse(saved) : {} 
    } catch { 
      return {} 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]) // refreshKey intentionally included to trigger updates

  // Listen for localStorage changes to update progress in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'visited-modules' || e.key === 'progressPct') {
        setRefreshKey(prev => prev + 1)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check for changes periodically since localStorage events 
    // don't fire for changes in the same tab
    const interval = setInterval(() => {
      const currentData = localStorage.getItem('visited-modules')
      if (currentData !== JSON.stringify(visitedMap)) {
        setRefreshKey(prev => prev + 1)
      }
    }, 3000) // Check every 3 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [visitedMap])

  // Calculate dynamic progress based on actual student actions
  const studentProgress = useMemo(() => {
    const allowedModuleIds = ['earthquake', 'volcano', 'tornado', 'tsunami', 'hurricane', 'drought', 'wildfire', 'landslide', 'flood']
    const requiredKeys = ['know','dosdonts','plan','recovery','effects']
    
    // Calculate completed modules
    const completedModules = allowedModuleIds.filter(moduleId => {
      const v = visitedMap[moduleId] || {}
      return requiredKeys.every(k => !!v[k])
    }).length

    // Calculate individual module progress
    const moduleProgress = allowedModuleIds.map(moduleId => {
      const v = visitedMap[moduleId] || {}
      const completedSections = requiredKeys.filter(k => !!v[k]).length
      const percentage = Math.round((completedSections / requiredKeys.length) * 100)
      
      // Map module IDs to display names
      const moduleNames = {
        earthquake: 'Earthquake Safety',
        volcano: 'Volcano Safety', 
        tornado: 'Tornado Safety',
        tsunami: 'Tsunami Safety',
        hurricane: 'Hurricane Safety',
        drought: 'Drought Safety',
        wildfire: 'Wildfire Safety',
        landslide: 'Landslide Safety',
        flood: 'Flood Safety'
      }
      
      return {
        name: moduleNames[moduleId] || `${moduleId} Safety`,
        pct: percentage,
        completed: completedSections,
        total: requiredKeys.length
      }
    })

    // Overall progress percentage
    const overallProgress = Math.round((completedModules / allowedModuleIds.length) * 100)

    // Get most recent activity
    let lastActivity = 'No recent activity'
    let lastModule = ''
    for (const moduleId of allowedModuleIds) {
      const v = visitedMap[moduleId] || {}
      if (Object.keys(v).length > 0) {
        const moduleNames = {
          earthquake: 'Earthquake Safety',
          volcano: 'Volcano Safety', 
          tornado: 'Tornado Safety',
          tsunami: 'Tsunami Safety',
          hurricane: 'Hurricane Safety',
          drought: 'Drought Safety',
          wildfire: 'Wildfire Safety',
          landslide: 'Landslide Safety',
          flood: 'Flood Safety'
        }
        lastModule = moduleNames[moduleId] || moduleId
        const completedSections = requiredKeys.filter(k => !!v[k])
        if (completedSections.length > 0) {
          lastActivity = `completed ${lastModule} sections`
          break
        }
      }
    }

    return {
      overallProgress,
      completedModules,
      totalModules: allowedModuleIds.length,
      moduleProgress,
      lastActivity,
      lastModule
    }
  }, [visitedMap])

  // Legacy progress for compatibility
  const studentProgressPct = studentProgress.overallProgress
  const percent = studentProgress.overallProgress

  // Dynamic notifications based on student progress and simulated alerts
  const notifications = useMemo(() => {
    const now = new Date()
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
    
    const progressNotifications = []
    const alertNotifications = []
    
    // Generate progress notifications based on actual student data
    studentProgress.moduleProgress.forEach((module) => {
      if (module.pct === 100) {
        progressNotifications.push({
          icon: '🎉',
          title: `${childName} completed ${module.name}!`,
          time: `${Math.random() > 0.5 ? 'Today' : 'Yesterday'}, ${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          type: 'success',
          priority: 'high'
        })
      } else if (module.pct >= 60) {
        progressNotifications.push({
          icon: '📚',
          title: `${childName} is making progress in ${module.name} (${module.pct}%)`,
          time: `${Math.random() > 0.5 ? 'Today' : 'Yesterday'}, ${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          type: 'info',
          priority: 'medium'
        })
      }
    })
    
    // Simulated emergency alerts (realistic examples)
    const emergencyAlerts = [
      {
        icon: '🌊',
        title: 'Flood Warning: Heavy rainfall expected in your area',
        time: 'Today, 6:00 AM',
        type: 'warning',
        priority: 'critical'
      },
      {
        icon: '🌡️',
        title: 'Heat Wave Advisory: Temperature may reach 42°C',
        time: 'Yesterday, 3:30 PM',
        type: 'warning',
        priority: 'high'
      },
      {
        icon: '💨',
        title: 'Strong Wind Alert: Gusts up to 60 km/h expected',
        time: `${twoDaysAgo}, 7:45 PM`,
        type: 'warning',
        priority: 'medium'
      },
      {
        icon: '🔥',
        title: 'Fire Safety Drill scheduled for schools in your district',
        time: `${twoDaysAgo}, 11:15 AM`,
        type: 'info',
        priority: 'medium'
      }
    ]
    
    // Add some emergency alerts
    alertNotifications.push(...emergencyAlerts.slice(0, 2))
    
    // Add achievement notifications
    if (studentProgress.overallProgress >= 80) {
      progressNotifications.unshift({
        icon: '🏆',
        title: `${childName} is a Safety Champion! 80%+ completion`,
        time: 'Today, 2:15 PM',
        type: 'achievement',
        priority: 'high'
      })
    } else if (studentProgress.overallProgress >= 50) {
      progressNotifications.unshift({
        icon: '⭐',
        title: `${childName} reached 50% completion milestone!`,
        time: 'Today, 1:30 PM',
        type: 'achievement',
        priority: 'medium'
      })
    }
    
    // If no progress yet, show encouraging message
    if (studentProgress.overallProgress === 0) {
      progressNotifications.push({
        icon: '👋',
        title: `Welcome! Encourage ${childName} to start their safety journey`,
        time: 'Today, 9:00 AM',
        type: 'info',
        priority: 'medium'
      })
    }
    
    // Combine and sort by priority
    const allNotifications = [...alertNotifications, ...progressNotifications]
    
    return allNotifications
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 6) // Show only top 6 notifications
  }, [studentProgress, childName])

  // Quiz results data
  const quizResults = useMemo(() => {
    try {
      const results = JSON.parse(localStorage.getItem('quiz-results') || '[]')
      const latestResult = JSON.parse(localStorage.getItem('latest-quiz-result') || 'null')
      return {
        history: results,
        latest: latestResult,
        averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
        totalQuizzesTaken: results.length,
        bestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
        recentScores: results.slice(0, 5).map(r => ({ score: r.score, level: r.level, date: r.completedAt }))
      }
    } catch {
      return {
        history: [],
        latest: null,
        averageScore: 0,
        totalQuizzesTaken: 0,
        bestScore: 0,
        recentScores: []
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]) // Use refreshKey to update when localStorage changes

  // Toolkit checklist
  const defaultItems = [
    { t: 'Water Bottle', desc: 'Stay hydrated during emergencies', icon: '🥤', done: true },
    { t: 'First-aid Kit', desc: 'Handle small injuries quickly', icon: '🚑', done: true },
    { t: 'Flashlight', desc: 'Light during power cuts', icon: '🔦', done: false },
    { t: 'Whistle', desc: 'Signal for help', icon: '📢', done: false },
    { t: 'Snacks', desc: 'Quick energy boost', icon: '🍫', done: false },
    { t: 'Battery Pack', desc: 'Charge devices', icon: '🔋', done: false },
    { t: 'Phone', desc: 'Stay connected', icon: '📱', done: true },
    { t: 'Blanket', desc: 'Keep warm', icon: '🧥', done: false },
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

  // Quick links filtered to match specified disaster types only
  const quickLinks = useMemo(() => {
    const allowedDisasterIds = ['earthquake', 'volcano', 'tornado', 'tsunami', 'hurricane', 'drought', 'wildfire', 'landslide', 'flood']
    return disastersData.filter(disaster => allowedDisasterIds.includes(disaster.id.toLowerCase()))
  }, [])

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
        return <Waves className={`${cls} text-cyan-400`} />
      case 'hurricane':
      case 'tornado':
        return <Wind className={`${cls} text-cyan-400`} />
      case 'wildfire':
      case 'fire':
        return <Flame className={`${cls} text-amber-400`} />
      case 'volcano':
        return <Flame className={`${cls} text-rose-400`} />
      case 'earthquake':
      case 'landslide':
        return <Mountain className={`${cls} text-rose-400`} />
      case 'heatwave':
      case 'drought':
        return <Sun className={`${cls} text-amber-400`} />
      case 'thunderstorm':
        return <CloudLightning className={`${cls} text-indigo-400`} />
      case 'pandemic':
        return <ShieldAlert className={`${cls} text-purple-400`} />
      default:
        return <ListChecks className={`${cls} text-slate-400`} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl">🛡️</div>
            <div className="text-lg font-semibold">Parent Dashboard</div>
          </div>
          <div className="hidden items-center gap-4 text-sm text-slate-200 sm:flex">
            <a className="hover:text-white/90" href="#home">Dashboard</a>
            <a className="hover:text-white/90" href="#plan">My Family Plan</a>
            <a className="hover:text-white/90" href="#student-progress">Child Progress</a>
            <a className="hover:text-white/90" href="#tools">Emergency Tools</a>
            <div className="ml-4 flex items-center gap-2 text-slate-200">
              <Users className="h-4 w-4 text-cyan-400" />
              <select value={activeChild} onChange={e=>setActiveChild(Number(e.target.value))} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-slate-100">
                {children.map((c, idx) => <option key={idx} value={idx} className="text-slate-900">{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left/Center */}
        <section className="space-y-6 lg:col-span-8">
          {/* Greeting + Top KPIs */}
          <div id="home" className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <h2 className="text-base font-semibold">Hi {childName ? `${childName.split(' ')[0]}'s Parent` : 'Parent'} 👋</h2>
            <p className="mt-1 text-sm text-slate-300">Here's your family's safety status today.</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-xs font-semibold text-slate-200">Family Preparedness</div>
              {(() => {
                const kitPct = Math.round((items.filter(i=>i.done).length / items.length) * 100) || 0
                const planPct = Math.round((plan.filter(i=>i.done).length / plan.length) * 100) || 0
                const prep = Math.round((kitPct + planPct + studentProgressPct) / 3)
                return (
                  <>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${prep}%` }} />
                    </div>
                    <div className="mt-2 text-right text-xs text-slate-300">{prep} %</div>
                  </>
                )
              })()}
            </div>
          </div>
          
          {/* Student Progress */}
          <div id="student-progress" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-200">Child Progress Tracker</div>
                <div className="mt-1 text-xs text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 
                  {childName} {studentProgress.lastActivity}
                </div>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-cyan-400 shadow-inner">
                <div className="text-lg font-bold">{percent}%</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-cyan-500" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-300 text-center">
              Completed {studentProgress.completedModules} of {studentProgress.totalModules} modules
            </div>
            {/* Progress bars by topic - now showing real data */}
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              {studentProgress.moduleProgress.slice(0, 6).map((module) => (
                <div key={module.name} className="flex items-center gap-3">
                  <div className="w-44 shrink-0">{module.name}</div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${module.pct}%` }} />
                  </div>
                  <div className="w-10 shrink-0 text-right tabular-nums">{module.pct}%</div>
                </div>
              ))}
              {studentProgress.moduleProgress.length > 6 && (
                <div className="text-center text-slate-400">
                  +{studentProgress.moduleProgress.length - 6} more modules
                </div>
              )}
            </div>
          </div>

          {/* Quiz Results Section */}
          <div id="quiz-results" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> 
                Child's Quiz Performance
              </div>
            </div>
            
            {quizResults.latest ? (
              <div className="space-y-4">
                {/* Latest Quiz Result */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-200">Latest Quiz</div>
                    <div className={`text-lg font-bold ${
                      quizResults.latest.score >= 80 ? 'text-emerald-400' :
                      quizResults.latest.score >= 60 ? 'text-cyan-400' :
                      quizResults.latest.score >= 40 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {quizResults.latest.score}%
                    </div>
                  </div>
                  <div className="text-xs text-slate-300">
                    {quizResults.latest.correctAnswers} of {quizResults.latest.totalQuestions} correct • 
                    {' '}{quizResults.latest.level} level • 
                    {' '}{new Date(quizResults.latest.completedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div 
                      className={`h-full rounded-full ${
                        quizResults.latest.score >= 80 ? 'bg-emerald-500' :
                        quizResults.latest.score >= 60 ? 'bg-cyan-500' :
                        quizResults.latest.score >= 40 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`} 
                      style={{ width: `${quizResults.latest.score}%` }} 
                    />
                  </div>
                </div>

                {/* Quiz Statistics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <div className="text-lg font-bold text-cyan-400">{quizResults.bestScore}%</div>
                    <div className="text-slate-300">Best Score</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <div className="text-lg font-bold text-emerald-400">{quizResults.averageScore}%</div>
                    <div className="text-slate-300">Average</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <div className="text-lg font-bold text-slate-200">{quizResults.totalQuizzesTaken}</div>
                    <div className="text-slate-300">Quizzes Taken</div>
                  </div>
                </div>

                {/* Recent Scores */}
                {quizResults.recentScores.length > 1 && (
                  <div>
                    <div className="mb-2 text-xs font-semibold text-slate-300">Recent Scores</div>
                    <div className="space-y-2">
                      {quizResults.recentScores.slice(0, 3).map((result, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                          <span className="text-slate-200">
                            {result.level} level • {new Date(result.date).toLocaleDateString()}
                          </span>
                          <span className={`font-semibold ${
                            result.score >= 80 ? 'text-emerald-400' :
                            result.score >= 60 ? 'text-cyan-400' :
                            result.score >= 40 ? 'text-amber-400' :
                            'text-rose-400'
                          }`}>
                            {result.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quizResults.history.length > 3 && (
                  <div className="text-center">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">
                      View all {quizResults.totalQuizzesTaken} quiz results
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-2">No quiz results yet</p>
                <p className="text-xs">Encourage {childName} to take their first safety quiz!</p>
              </div>
            )}
          </div>

          {/* Family Action Cards / Checklists */}
          <div id="plan" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Family Emergency Plan */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><CheckSquare className="h-4 w-4 text-cyan-400" /> Family Emergency Plan</div>
              <ul className="space-y-2 text-sm">
                {plan.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => togglePlan(idx)} />
                    <span className={it.done ? 'line-through text-slate-400' : 'text-slate-200'}>{it.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Emergency Kit Builder */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><BoxIcon /> Emergency Kit Builder</div>
              <ul className="space-y-2 text-sm">
                {items.slice(0,3).map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={it.done} onChange={() => toggle(idx)} />
                    <span className={it.done ? 'line-through text-slate-400' : 'text-slate-200'}>{it.t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-slate-400">Manage all items in Toolkit below</div>
            </div>
            {/* One-Tap SOS */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
              <div className="grid place-items-center">
                <div className="grid h-28 w-28 place-items-center rounded-full bg-slate-100 text-2xl font-bold text-slate-900 shadow">SOS</div>
                <div className="mt-3 text-sm font-semibold text-slate-200">One-Tap-SOS</div>
                <button onClick={() => alert('Emergency alert sent (demo)')} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"><CircleAlert className="h-4 w-4" /> Send emergency alert</button>
              </div>
            </div>
          </div>

          {/* Toolkit Readiness */}
          <div id="tools" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><CheckSquare className="h-4 w-4 text-cyan-400" /> Emergency Toolkit</div>
            <ul className="space-y-2 text-sm">
              {items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{it.icon}</span>
                    <div>
                      <div className={it.done ? 'text-slate-200' : 'text-slate-200'}>{it.t}</div>
                      <div className="text-xs text-slate-400">{it.desc}</div>
                    </div>
                  </span>
                  <button 
                    onClick={() => toggle(idx)}
                    className={`p-1 rounded-full transition-colors ${
                      it.done 
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                        : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                    }`}
                  >
                    {it.done ? <ShieldCheck className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-slate-400">
              {items.filter(it => it.done).length} of {items.length} items ready
            </div>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-20 self-start">
          {/* Alert CTA */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-900/20 p-5 shadow">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200"><AlertTriangle className="h-4 w-4" /> Flood alert in your city</div>
            <button onClick={() => {
              const flood = disastersData.find(d=>d.id==='flood') || disastersData[0]
              openDosDonts(flood)
            }} className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">View Do's & Don'ts</button>
          </div>

          {/* Today's Task */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><CalendarCheck className="h-4 w-4 text-cyan-400" /> Today's Task</div>
            {(() => {
              const flood = disastersData.find(d=>d.id==='flood') || disastersData[0]
              return (
                <button onClick={() => openDosDonts(flood)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-500/10">Review {flood.title} Do's & Don'ts with your child</button>
              )
            })()}
          </div>

          {/* Do's & Don'ts Quick Links */}
          <div id="dosdonts" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><BookOpenText className="h-4 w-4 text-cyan-400" /> Do's & Don'ts — Quick Access</div>
            <div className="grid max-h-80 gap-2 overflow-auto pr-1">
              {quickLinks.map((m) => (
                <button key={m.id} onClick={() => openDosDonts(m)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-500/10">
                  <span className="flex items-center gap-2">
                    <DisasterIcon id={m.id} />
                    <span>View {m.title} Do's & Don'ts</span>
                  </span>
                  <ListChecks className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Family Drill Planner */}
          <FamilyDrillPlanner />

          {/* Family Badges */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><Medal className="h-4 w-4 text-emerald-400" /> Family Badges</div>
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-3 py-2 text-sm text-emerald-300">
              <span className="text-lg">🏅</span> Prepared Family
            </div>
          </div>

          {/* Emergency Contacts */}
          <div id="contacts" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><Phone className="h-4 w-4 text-cyan-400" /> Emergency Contacts</div>
            <div className="mb-2 text-xs font-semibold text-slate-300">Helplines</div>
            <ul className="mb-4 grid gap-2 sm:grid-cols-2 text-sm">
              {[['NDMA','1078'],['Police','100'],['Ambulance','102'],['Fire','101']].map(([name,num]) => (
                <li key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-slate-200">{name}</span>
                  <a className="text-cyan-400 hover:underline" href={`tel:${num}`}>{num}</a>
                </li>
              ))}
            </ul>
            <div className="text-xs font-semibold text-slate-300">Personal Contacts</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-xs font-semibold text-slate-200">Add Personal Contact</div>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <input value={newContact.name} onChange={e=>setNewContact({...newContact, name:e.target.value})} placeholder="Name" className="col-span-2 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-slate-100 placeholder-slate-400" />
                <input value={newContact.phone} onChange={e=>setNewContact({...newContact, phone:e.target.value})} placeholder="Phone" className="col-span-2 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-slate-100 placeholder-slate-400" />
                <button onClick={addContact} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-2 text-white hover:bg-cyan-700"><Plus className="h-4 w-4" /></button>
              </div>
              <ul className="mt-3 space-y-2">
                {contacts.map((c,i) => (
                  <li key={`${c.name}-${i}`} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm">
                    <span className="text-slate-200">{c.name}</span>
                    <span className="text-cyan-400">{c.phone}</span>
                    <button onClick={()=>removeContact(i)} className="text-slate-400 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notifications */}
          <div id="notifications" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Bell className="h-4 w-4 text-cyan-400" /> 
              Notifications & Alerts
              {notifications.some(n => n.type === 'warning' || n.type === 'critical') && (
                <span className="inline-flex h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
              )}
            </div>
            {notifications.length > 0 ? (
              <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
                {notifications.map((n, i) => (
                  <li key={i} className={`flex items-center justify-between px-3 py-2 ${
                    n.type === 'critical' ? 'bg-red-500/10 border-l-4 border-red-400' :
                    n.type === 'warning' ? 'bg-amber-500/10 border-l-4 border-amber-400' :
                    n.type === 'achievement' ? 'bg-emerald-500/10 border-l-4 border-emerald-400' :
                    n.type === 'success' ? 'bg-green-500/10 border-l-4 border-green-400' :
                    'bg-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{n.icon}</span>
                      <div>
                        <div className="text-sm text-slate-200">{n.title}</div>
                        {(n.type === 'warning' || n.type === 'critical') && (
                          <div className="text-xs text-slate-400 mt-1">Tap for emergency guidelines</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400">{n.time}</span>
                      {n.priority === 'critical' && (
                        <span className="text-xs text-red-400 font-semibold">URGENT</span>
                      )}
                      {n.priority === 'high' && (
                        <span className="text-xs text-amber-400 font-semibold">HIGH</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            )}
            {notifications.length > 0 && (
              <div className="mt-3 text-center">
                <button className="text-xs text-cyan-400 hover:text-cyan-300">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-300">NDMA Student Preparedness Portal</div>
      </footer>

      {/* Flipbook Modal */}
      <FlipBookModal open={open} onClose={() => setOpen(false)} module={active} variant={active?._variant||'dosdonts'} heading={active?._heading} />

      {/* AI Buddy */}
      <button onClick={() => alert('AI Buddy coming soon')} className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-cyan-700">
        <LifeBuoy className="h-4 w-4" /> Ask the AI Buddy
      </button>
    </div>
  )
}

// Small icon component for kit card title
function BoxIcon() {
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-cyan-500/20 text-[10px] font-bold text-cyan-300">🧰</span>
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
    <div id="planner" className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><Calendar className="h-4 w-4 text-cyan-400" /> Family Drill Planner</div>
      <div className="grid grid-cols-5 gap-2 text-sm">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Drill (e.g., Earthquake)" className="col-span-2 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-slate-100 placeholder-slate-400" />
        <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="col-span-2 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-slate-100" />
        <input type="time" value={form.time} onChange={e=>setForm({...form, time:e.target.value})} className="col-span-1 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-slate-100" />
      </div>
      <div className="mt-2 flex justify-end"><button onClick={addDrill} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700"><Plus className="h-4 w-4" /> Add</button></div>
      <ul className="mt-3 space-y-2">
        {drills.map((d,i) => (
          <li key={i} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm">
            <div>
              <div className="font-medium text-slate-200">{d.title}</div>
              <div className="text-xs text-slate-400">{d.date} {d.time && `• ${d.time}`}</div>
            </div>
            <button onClick={()=>removeDrill(i)} className="text-slate-400 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}