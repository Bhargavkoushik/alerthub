import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'
import { AlertTriangle, CheckCircle2, XCircle, LineChart, MapPin } from 'lucide-react'

// Seed some demo data if not present
function useSeedData() {
  useEffect(() => {
    const seeded = localStorage.getItem('authority-seeded')
    if (seeded) return

    const now = Date.now()
    const districts = ['Central', 'North', 'South', 'East', 'West']
    const schools = Array.from({ length: 18 }, (_, i) => ({
      id: `SCH-${100 + i}`,
      name: `Govt School ${i + 1}`,
      district: districts[i % districts.length],
      readiness: 60 + ((i * 7) % 35), // 60-94
      drillsYTD: (i * 2) % 6,
    }))
    const alerts = [
      {
        id: 'AL-' + Math.random().toString(36).slice(2, 8),
        type: 'Flood',
        district: 'Central',
        status: 'pending',
        reportedAt: now - 1000 * 60 * 60 * 5,
        coordinates: [17.385, 78.4867],
        description: 'Water level rising near river embankment',
        reporter: 'Citizen App',
        severity: 'medium',
      },
      {
        id: 'AL-' + Math.random().toString(36).slice(2, 8),
        type: 'Earthquake',
        district: 'North',
        status: 'pending',
        reportedAt: now - 1000 * 60 * 60 * 20,
        coordinates: [28.6139, 77.209],
        description: 'Mild tremors felt across neighborhoods',
        reporter: 'Community Helpline',
        severity: 'low',
      },
      {
        id: 'AL-' + Math.random().toString(36).slice(2, 8),
        type: 'Wildfire',
        district: 'West',
        status: 'verified',
        verifiedAt: now - 1000 * 60 * 60 * 30,
        reportedAt: now - 1000 * 60 * 60 * 36,
        coordinates: [15.3173, 75.7139],
        description: 'Forest fire reported near reserve area',
        reporter: 'Forest Dept',
        severity: 'high',
      },
    ]
    localStorage.setItem('authority-schools', JSON.stringify(schools))
    localStorage.setItem('community-alerts', JSON.stringify(alerts))
    localStorage.setItem('authority-seeded', '1')
  }, [])
}

// (Note) KPI cards are rendered inline in the header panel to match Student UI

export default function Authority() {
  useSeedData()
  const navigate = useNavigate()
  const [schools, setSchools] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('authority-schools') || '[]')
    } catch {
      return []
    }
  })
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('community-alerts') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    const onStorage = () => {
      try {
        setSchools(JSON.parse(localStorage.getItem('authority-schools') || '[]'))
        setAlerts(JSON.parse(localStorage.getItem('community-alerts') || '[]'))
      } catch {
        // ignore storage read errors in demo mode
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const kpis = useMemo(() => {
    const total = schools.length
    const avgReadiness = total
      ? Math.round(schools.reduce((a, s) => a + s.readiness, 0) / total)
      : 0
    const drillsYTD = schools.reduce((a, s) => a + (s.drillsYTD || 0), 0)
    const pending = alerts.filter((a) => a.status === 'pending').length
    return { total, avgReadiness, drillsYTD, pending }
  }, [schools, alerts])

  const readinessByDistrict = useMemo(() => {
    const map = new Map()
    for (const s of schools) {
      const e = map.get(s.district) || { district: s.district, count: 0, total: 0 }
      e.count += 1
      e.total += s.readiness
      map.set(s.district, e)
    }
    return Array.from(map.values()).map((d) => ({
      district: d.district,
      readiness: Math.round(d.total / (d.count || 1)),
    }))
  }, [schools])

  const alertTypeAgg = useMemo(() => {
    const map = new Map()
    for (const a of alerts) {
      const k = a.type
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map, ([name, value]) => ({ name, value }))
  }, [alerts])

  const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa']

  const pendingAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'pending').sort((a, b) => b.reportedAt - a.reportedAt),
    [alerts]
  )

  function handleQuickVerify(alertId, action) {
    const updated = alerts.map((a) =>
      a.id === alertId
        ? {
            ...a,
            status: action,
            verifiedAt: Date.now(),
            verifier: 'NDMA Officer',
          }
        : a
    )
    setAlerts(updated)
    localStorage.setItem('community-alerts', JSON.stringify(updated))
    toast.success(`Alert ${action === 'verified' ? 'verified' : 'rejected'}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Navbar (Student style) */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl"><AlertTriangle className="h-5 w-5" /></div>
            <div className="text-lg font-semibold">Authority Dashboard</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <Link className="hover:text-white/90" to="/">Home</Link>
            <Link className="hover:text-white/90" to="/authority/alerts">Alerts</Link>
            <Link className="hover:text-white/90" to="/community">Community</Link>
            <a className="hover:text-white/90" href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left / Center */}
        <section className="space-y-6 lg:col-span-8">
          {/* Welcome + KPIs */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-semibold md:text-2xl">Oversee readiness and validate community alerts</h1>
                <p className="mt-1 text-sm text-slate-300">Policy analytics for regional planning</p>
              </div>
              <button
                className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white"
                onClick={() => navigate('/authority/alerts')}
              >
                Manage Alerts
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-300">Schools Onboarded</div>
                <div className="mt-1 text-2xl font-semibold">{kpis.total}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-300">Avg Readiness</div>
                <div className="mt-1 text-2xl font-semibold">{kpis.avgReadiness}%</div>
                <div className="text-xs text-slate-400">Across districts</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-300">Drills Conducted (YTD)</div>
                <div className="mt-1 text-2xl font-semibold">{kpis.drillsYTD}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-300">Pending Alerts</div>
                <div className="mt-1 text-2xl font-semibold">{kpis.pending}</div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LineChart className="h-4 w-4 text-emerald-400" /> Readiness by District
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={readinessByDistrict}>
                    <XAxis dataKey="district" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                    <Bar dataKey="readiness" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-medium">Alert Types Distribution</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={alertTypeAgg} dataKey="value" nameKey="name" outerRadius={86} innerRadius={46}>
                      {alertTypeAgg.map((entry, index) => (
                        <Cell key={`c-${entry.name}`} fill={COLORS[index % COLORS.length]} />
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
          <div id="alerts" className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Pending Alerts
              </div>
              <Link to="/authority/alerts" className="text-xs text-emerald-400 hover:underline">See all</Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-left text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">District</th>
                    <th className="px-3 py-2">Reported</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pendingAlerts.slice(0, 6).map((a) => (
                    <tr key={a.id} className="odd:bg-white/0 even:bg-white/[0.03]">
                      <td className="px-3 py-2">{a.type}</td>
                      <td className="px-3 py-2">{a.district}</td>
                      <td className="px-3 py-2">{new Date(a.reportedAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{a.reporter}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                            onClick={() => navigate(`/authority/alerts/${a.id}`)}
                            title="Open verification"
                          >
                            Review
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-600/20"
                            onClick={() => handleQuickVerify(a.id, 'verified')}
                            title="Quick verify"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Verify
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-600/20"
                            onClick={() => handleQuickVerify(a.id, 'rejected')}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingAlerts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-400">No pending alerts</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div id="contact" className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-sky-400" /> Contact
            </div>
            <p className="text-sm text-slate-300">NDMA Control Room: 011-1078 · Email: controlroom@ndma.gov.in</p>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-300 md:flex-row">
          <div className="flex gap-4">
            <a className="hover:text-white/90" href="#alerts">Alerts</a>
            <a className="hover:text-white/90" href="#contact">Contact</a>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} AlertHub — Authority Console</div>
        </div>
      </footer>
    </div>
  )
}
