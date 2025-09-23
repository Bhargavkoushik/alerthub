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

function kpiCard({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
    </div>
  )
}

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
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Navbar */}
      <nav className="mb-6 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold">AlertHub Authority</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link className="text-neutral-300 hover:text-white" to="/">Home</Link>
          <Link className="text-neutral-300 hover:text-white" to="/authority/alerts">Alerts</Link>
          <a className="text-neutral-300 hover:text-white" href="#contact">Contact</a>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Authority Dashboard</h2>
          <p className="mt-1 text-neutral-400">Oversee disaster readiness and validate alerts</p>
        </div>
        <button
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
          onClick={() => navigate('/authority/alerts')}
        >
          Manage Alerts
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCard({ title: 'Schools Onboarded', value: kpis.total })}
        {kpiCard({ title: 'Avg Readiness', value: `${kpis.avgReadiness}%`, sub: 'Across all districts' })}
        {kpiCard({ title: 'Drills Conducted (YTD)', value: kpis.drillsYTD })}
        {kpiCard({ title: 'Pending Alerts', value: kpis.pending })}
      </div>

      {/* Analytics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <LineChart className="h-4 w-4 text-emerald-400" />
            Readiness by District
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessByDistrict}>
                <XAxis dataKey="district" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a' }} />
                <Bar dataKey="readiness" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 text-sm font-medium">Alert Types Distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertTypeAgg} dataKey="value" nameKey="name" outerRadius={86} innerRadius={46}>
                  {alertTypeAgg.map((entry, index) => (
                    <Cell key={`c-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending alerts */}
      <div id="alerts" className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Community-Submitted Alerts (Pending)
          </div>
          <Link to="/authority/alerts" className="text-sm text-emerald-400 hover:underline">
            See all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">Reported</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAlerts.slice(0, 6).map((a) => (
                <tr key={a.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{a.type}</td>
                  <td className="px-3 py-2">{a.district}</td>
                  <td className="px-3 py-2">{new Date(a.reportedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{a.reporter}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
                        onClick={() => navigate(`/authority/alerts/${a.id}`)}
                        title="Open verification"
                      >
                        Review
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-700/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/20"
                        onClick={() => handleQuickVerify(a.id, 'verified')}
                        title="Quick verify"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Verify
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-rose-700/60 px-2 py-1 text-rose-300 hover:bg-rose-900/20"
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
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-400">
                    No pending alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-sky-400" /> Contact
        </div>
        <p className="text-sm text-neutral-400">
          NDMA Control Room: 011-1078 · Email: controlroom@ndma.gov.in
        </p>
      </div>
    </section>
  )
}
