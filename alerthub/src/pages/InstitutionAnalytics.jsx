import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function InstitutionAnalytics() {
  const byDate = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({ month: `M${i+1}`, drills: Math.round(5 + Math.random()*10), modules: Math.round(10 + Math.random()*20) })), [])
  const byClass = useMemo(() => ['8A','8B','9A','10A'].map(c => ({ name: c, pct: Math.round(40 + Math.random()*60) })), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📈</div>
            <div className="text-lg font-semibold">Institution Analytics</div>
          </div>
          <Link className="text-sm text-cyan-300 hover:text-white" to="/institution">Back to Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold">Monthly Drills vs Modules</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDate}>
                  <XAxis dataKey="month" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="drills" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="modules" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold">Preparedness by Class</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byClass}>
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" domain={[0,100]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                  <Bar dataKey="pct" fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
