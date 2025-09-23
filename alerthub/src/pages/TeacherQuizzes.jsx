import { useMemo, useState, useEffect } from 'react'

const DEFAULT_CLASSES = [
  { id: '8A', name: 'Class 8A', size: 32 },
  { id: '8B', name: 'Class 8B', size: 28 },
  { id: '9A', name: 'Class 9A', size: 30 },
]
const QUIZ_TEMPLATES = [
  { id: 'q1', title: 'Earthquake Basics Quiz' },
  { id: 'q2', title: 'Flood Safety Quiz' },
  { id: 'q3', title: 'Wildfire Readiness Quiz' },
]

function readLS(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }
function uid() { return Math.random().toString(36).slice(2, 9) }

export default function TeacherQuizzes() {
  const classes = useMemo(() => readLS('teacher-classes', DEFAULT_CLASSES), [])
  const [assignments, setAssignments] = useState(() => readLS('quiz-assignments', []))
  useEffect(() => localStorage.setItem('quiz-assignments', JSON.stringify(assignments)), [assignments])

  const [form, setForm] = useState({ classId: '', quizId: QUIZ_TEMPLATES[0].id, due: new Date().toISOString().slice(0,10) })

  function assignQuiz() {
    if (!form.classId) return
    const t = QUIZ_TEMPLATES.find(q => q.id === form.quizId)
    setAssignments(prev => [{ id: uid(), ...form, title: t?.title || 'Quiz' }, ...prev])
    setForm({ classId: '', quizId: QUIZ_TEMPLATES[0].id, due: new Date().toISOString().slice(0,10) })
  }

  function approveSubmission(aid, sid) {
    setAssignments(prev => prev.map(a => a.id !== aid ? a : { ...a, approvals: { ...(a.approvals || {}), [sid]: !(a.approvals?.[sid]) } }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl">📝</div>
            <div className="text-lg font-semibold">Assign Quizzes</div>
          </div>
          <a className="text-sm text-cyan-300 hover:text-white" href="/teacher">Back to Dashboard</a>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Assignment form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Class</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={form.classId} onChange={e=>setForm(prev=>({ ...prev, classId: e.target.value }))}>
                <option value="" className="text-slate-900">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Quiz</span>
              <select className="rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/30 focus:bg-white/20" value={form.quizId} onChange={e=>setForm(prev=>({ ...prev, quizId: e.target.value }))}>
                {QUIZ_TEMPLATES.map(q => <option key={q.id} value={q.id} className="text-slate-900">{q.title}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-slate-300">Due Date</span>
              <input type="date" className="rounded-lg bg-white/10 px-3 py-2 outline-none" value={form.due} onChange={e=>setForm(prev=>({ ...prev, due: e.target.value }))} />
            </label>
            <div className="flex items-end">
              <button onClick={assignQuiz} className="w-full rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-700 hover:text-white">Assign Quiz</button>
            </div>
          </div>
        </div>

        {/* Submissions/Approvals */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Assignments</div>
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/5 text-xs text-slate-300">
                <tr>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Quiz</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Approve Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {assignments.map(a => (
                  <tr key={a.id} className="align-top">
                    <td className="px-3 py-2">{a.classId}</td>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2">{a.due}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 8 }).map((_,i) => {
                          const sid = `${a.classId}-S${i+1}`
                          const on = !!a.approvals?.[sid]
                          return (
                            <button key={sid} onClick={()=>approveSubmission(a.id, sid)} className={`rounded-full px-3 py-1 text-xs font-semibold border ${on ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                              {sid}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-sm text-slate-300" colSpan={4}>No quizzes assigned yet.</td>
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
