import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'

export default function AuthorityAlerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('community-alerts') || '[]')
    } catch {
      return []
    }
  })
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')

  const types = useMemo(() => Array.from(new Set(alerts.map((a) => a.type))), [alerts])

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => (status === 'all' ? true : a.status === status))
      .filter((a) => (type === 'all' ? true : a.type === type))
      .filter((a) =>
        q.trim()
          ? `${a.type} ${a.district} ${a.description} ${a.reporter}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
      .sort((a, b) => (b.reportedAt || 0) - (a.reportedAt || 0))
  }, [alerts, q, status, type])

  function setAction(id, action) {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, status: action, verifiedAt: Date.now(), verifier: 'NDMA Officer' } : a
    )
    setAlerts(updated)
    localStorage.setItem('community-alerts', JSON.stringify(updated))
    toast.success(`Marked as ${action}`)
  }

  function badgeClass(status) {
    if (status === 'pending') return 'border border-amber-600/60 text-amber-300'
    if (status === 'verified') return 'border border-emerald-600/60 text-emerald-300'
    return 'border border-rose-600/60 text-rose-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Navbar to match Student/Authority theme */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl"><AlertTriangle className="h-5 w-5" /></div>
            <div className="text-lg font-semibold">Authority Alerts</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <Link className="hover:text-white/90" to="/">Home</Link>
            <Link className="hover:text-white/90" to="/authority">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Manage Community Alerts</h2>
            <p className="mt-1 text-sm text-slate-300">Verify or reject alerts submitted by the public</p>
          </div>
          <Link to="/authority" className="text-sm text-emerald-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <input
              placeholder="Search..."
              className="rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 shadow-inner outline-none backdrop-blur focus:border-white/30 focus:bg-white/20"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white shadow-inner outline-none backdrop-blur focus:border-white/30 focus:bg-white/20"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all" className="text-slate-900">All Status</option>
              <option value="pending" className="text-slate-900">Pending</option>
              <option value="verified" className="text-slate-900">Verified</option>
              <option value="rejected" className="text-slate-900">Rejected</option>
            </select>
            <select
              className="rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white shadow-inner outline-none backdrop-blur focus:border-white/30 focus:bg-white/20"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all" className="text-slate-900">All Types</option>
              {types.map((t) => (
                <option key={t} value={t} className="text-slate-900">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">Reported</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((a) => (
                <tr key={a.id} className="odd:bg-white/0 even:bg-white/[0.03]">
                  <td className="px-3 py-2">{a.type}</td>
                  <td className="px-3 py-2">{a.district}</td>
                  <td className="px-3 py-2">{new Date(a.reportedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{a.reporter}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-md px-2 py-1 text-xs ${badgeClass(a.status)}`}>{a.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                        onClick={() => navigate(`/authority/alerts/${a.id}`)}
                      >
                        Review
                      </button>
                      <button
                        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-600/20"
                        onClick={() => setAction(a.id, 'verified')}
                      >
                        Verify
                      </button>
                      <button
                        className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-600/20"
                        onClick={() => setAction(a.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No alerts match filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
