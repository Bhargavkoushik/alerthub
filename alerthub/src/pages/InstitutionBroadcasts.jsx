import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function InstitutionBroadcasts() {
  const [broadcasts, setBroadcasts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inst-broadcasts') || '[]') } catch { return [] }
  })
  const templates = ['Fire Drill at 10:00 AM','Flood Alert: Avoid low-lying areas','Earthquake Safety: Drop, Cover, Hold']
  const [target, setTarget] = useState('students')
  const [message, setMessage] = useState('')
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0,16))

  function schedule() {
    const text = message.trim()
    if (!text) return toast.error('Message cannot be empty')
    const entry = { id: Math.random().toString(36).slice(2,9), when, to: target, text }
    const updated = [entry, ...broadcasts]
    setBroadcasts(updated)
    localStorage.setItem('inst-broadcasts', JSON.stringify(updated))
    toast.success('Broadcast scheduled')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📣</div>
            <div className="text-lg font-semibold">Institution Broadcast Tools</div>
          </div>
          <Link className="text-sm text-cyan-300 hover:text-white" to="/institution">Back to Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold">Create Broadcast</div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Audience</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={target} onChange={e=>setTarget(e.target.value)}>
                <option value="students" className="text-slate-900">Students</option>
                <option value="teachers" className="text-slate-900">Teachers</option>
                <option value="parents" className="text-slate-900">Parents</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Template</span>
              <div className="flex flex-wrap gap-2">
                {templates.map(tmp => (
                  <button key={tmp} type="button" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10" onClick={()=>setMessage(tmp)}>{tmp}</button>
                ))}
              </div>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Schedule</span>
              <input type="datetime-local" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={when} onChange={e=>setWhen(e.target.value)} />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-slate-300">Message</span>
            <textarea rows={3} placeholder="Type a message" className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none" value={message} onChange={e=>setMessage(e.target.value)} />
          </label>
          <div className="mt-3 flex justify-end">
            <button onClick={schedule} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Schedule Broadcast</button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Scheduled / Recent</div>
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">To</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {broadcasts.map(b => (
                  <tr key={b.id}>
                    <td className="px-3 py-2">{new Date(b.when).toLocaleString()}</td>
                    <td className="px-3 py-2">{b.to}</td>
                    <td className="px-3 py-2">{b.text}</td>
                  </tr>
                ))}
                {broadcasts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-300">No broadcasts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
