import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

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
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Community Alerts</h2>
          <p className="mt-1 text-neutral-400">Verify or reject alerts submitted by the public</p>
        </div>
        <Link to="/authority" className="text-sm text-emerald-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <input
          placeholder="Search..."
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/70 text-left text-neutral-400">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">District</th>
              <th className="px-3 py-2">Reported</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-neutral-800">
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
                      className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
                      onClick={() => navigate(`/authority/alerts/${a.id}`)}
                    >
                      Review
                    </button>
                    <button
                      className="rounded-md border border-emerald-700/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/20"
                      onClick={() => setAction(a.id, 'verified')}
                    >
                      Verify
                    </button>
                    <button
                      className="rounded-md border border-rose-700/60 px-2 py-1 text-rose-300 hover:bg-rose-900/20"
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
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-400">
                  No alerts match filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
