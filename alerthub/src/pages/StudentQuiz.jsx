import { useEffect, useState } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

// Simple question model
// type: 'single' | 'multi' | 'text'
// options: string[] (for single/multi)
// answer: number (single) | number[] (multi) | { keywords: string[], minMatch?: number } (text)


function makeEasyQuestions() {
  const qs = [
    { type: 'single', q: 'Which natural disaster is caused by heavy rainfall and poor drainage?', options: ['Flood','Earthquake','Volcano','Tornado'], answer: 0 },
    { type: 'single', q: 'Which disaster involves shaking of the ground due to tectonic movement?', options: ['Cyclone','Earthquake','Drought','Wildfire'], answer: 1 },
    { type: 'single', q: 'Which one is a rotating column of air touching the ground?', options: ['Tornado','Tsunami','Volcano','Flood'], answer: 0 },
    { type: 'single', q: 'A large ocean wave caused by an underwater earthquake is called?', options: ['Cyclone','Tsunami','Landslide','Heatwave'], answer: 1 },
    { type: 'single', q: 'Prolonged period with little or no rain is a?', options: ['Drought','Flood','Earthquake','Volcano'], answer: 0 },
    { type: 'single', q: 'Which hazard involves burning of forests?', options: ['Wildfire','Volcano','Flood','Tornado'], answer: 0 },
    { type: 'single', q: 'Which is a violent storm system over the ocean?', options: ['Cyclone','Landslide','Earthquake','Drought'], answer: 0 },
    { type: 'single', q: 'Downhill movement of rock and soil is called?', options: ['Landslide','Flood','Tornado','Volcano'], answer: 0 },
    { type: 'multi', q: 'Select flood-prone areas features (multiple answers).', options: ['Low-lying regions','Steep hills','Riverbanks','Deserts'], answer: [0,2] },
    { type: 'multi', q: 'Which are safety items for an emergency kit?', options: ['Whistle','First-aid kit','Scented candles','Flashlight'], answer: [0,1,3] },
  ]
  // Add 10 more straightforward single-choice questions using hazard facts
  const extras = [
    { type: 'single', q: 'Which disaster is linked with lava and ash?', options: ['Volcano','Flood','Cyclone','Earthquake'], answer: 0 },
    { type: 'single', q: 'High winds and storm surge are common in?', options: ['Cyclone','Drought','Landslide','Tornado'], answer: 0 },
    { type: 'single', q: 'Ground cracks and shaking indicate a?', options: ['Earthquake','Flood','Drought','Wildfire'], answer: 0 },
    { type: 'single', q: 'Dry conditions for months may lead to a?', options: ['Drought','Tsunami','Tornado','Volcano'], answer: 0 },
    { type: 'single', q: 'Falling rocks on slopes is a sign of?', options: ['Landslide','Cyclone','Flood','Tornado'], answer: 0 },
    { type: 'single', q: 'A series of ocean waves after a quake is a?', options: ['Tsunami','Drought','Wildfire','Volcano'], answer: 0 },
    { type: 'single', q: 'Spinning funnel-shaped clouds suggest a?', options: ['Tornado','Flood','Cyclone','Landslide'], answer: 0 },
    { type: 'single', q: 'Thick smoke and advancing flames indicate a?', options: ['Wildfire','Tsunami','Earthquake','Drought'], answer: 0 },
    { type: 'single', q: 'Sandbags are often used during a?', options: ['Flood','Volcano','Earthquake','Tornado'], answer: 0 },
    { type: 'single', q: 'Drop, Cover, and Hold On is used during a?', options: ['Earthquake','Cyclone','Flood','Volcano'], answer: 0 },
  ]
  return [...qs, ...extras]
}

function makeMediumQuestions() {
  const qs = [
    { type: 'multi', q: 'Select the effects of a Flood (multiple answers).', options: ['Water contamination','Improved roads','Crop damage','Increased landslides'], answer: [0,2,3] },
    { type: 'multi', q: 'Choose earthquake safety actions indoors (multiple).', options: ['Run outside immediately','Drop, Cover, Hold On','Stay away from windows','Use elevators'], answer: [1,2] },
    { type: 'multi', q: 'Cyclone preparedness steps (multiple).', options: ['Secure loose items','Ignore weather alerts','Prepare emergency kit','Stay near coastal areas'], answer: [0,2] },
    { type: 'single', q: 'Which hazard can be triggered by heavy rainfall on slopes?', options: ['Landslide','Tornado','Drought','Tsunami'], answer: 0 },
    { type: 'single', q: 'Storm surge is primarily associated with?', options: ['Cyclones','Earthquakes','Volcanoes','Droughts'], answer: 0 },
    { type: 'single', q: 'Wildfires spread faster during?', options: ['Dry, windy conditions','Heavy rain','Snowfall','Calm humid nights'], answer: 0 },
    { type: 'multi', q: 'Flood safety: What should you avoid? (multiple)', options: ['Driving through water','Walking in moving water','Listening to warnings','Turning off electricity'], answer: [0,1] },
    { type: 'single', q: 'Tsunamis are least likely after?', options: ['Undersea landslides','Undersea earthquakes','Volcanic eruptions','Snowfall'], answer: 3 },
    { type: 'multi', q: 'Drought impacts (multiple).', options: ['Water shortages','Crop failures','Increased wildfires','Immediate ground shaking'], answer: [0,1,2] },
    { type: 'multi', q: 'Volcano hazards (multiple).', options: ['Ash fall','Lava flows','Storm surge','Lahars (mudflows)'], answer: [0,1,3] },
    { type: 'single', q: 'A warning sign of a landslide can be?', options: ['Cracks in the ground','Ocean receding quickly','Rotating funnel cloud','Ash plume'], answer: 0 },
    { type: 'single', q: 'During a tornado warning you should?', options: ['Go to a basement/safe room','Stay near windows','Drive to watch it','Go outside'], answer: 0 },
    { type: 'multi', q: 'Choose safe items for an emergency kit (multiple).', options: ['Flashlight','Whistle','Perishable food only','Water'], answer: [0,1,3] },
    { type: 'single', q: 'After an earthquake, expect?', options: ['Aftershocks','Storm surge','Ash rain','Waterspout'], answer: 0 },
    { type: 'multi', q: 'Tsunami safety (multiple).', options: ['Move to higher ground','Stay at the beach','Heed official warnings','Go near shore to take photos'], answer: [0,2] },
    { type: 'single', q: 'Best place during lightning?', options: ['Indoors away from windows','Under a tree','Open field','In water'], answer: 0 },
    { type: 'single', q: 'Cyclone eye is typically?', options: ['Calm area','Strongest winds','Storm surge','Rain band'], answer: 0 },
    { type: 'multi', q: 'Wildfire preparedness (multiple).', options: ['Create defensible space','Store dry leaves on roof','Pack go-bag','Keep exits clear'], answer: [0,2,3] },
    { type: 'single', q: 'Most tsunamis are caused by?', options: ['Undersea earthquakes','Drought','Tornadoes','Fires'], answer: 0 },
    { type: 'single', q: 'Lahar is associated with?', options: ['Volcanoes','Tornadoes','Drought','Cyclones'], answer: 0 },
  ]
  return qs
}

function makeHardQuestions() {
  const base = [
    { type: 'single', q: 'Primary cause of a tsunami?', options: ['Undersea earthquakes','Drought','Heatwave','Snow'], answer: 0 },
    { type: 'single', q: 'Best action during an earthquake indoors?', options: ['Drop, Cover, Hold On','Run to stairs','Use elevator','Stand by windows'], answer: 0 },
    { type: 'multi', q: 'Select correct wildfire safety steps (multiple).', options: ['Evacuate when told','Wet roof if safe','Block exits with furniture','Wear respirator if available'], answer: [0,1,3] },
    { type: 'single', q: 'Storm surge height increases with?', options: ['Wind speed & low pressure','Snowfall','Humidity only','Soil moisture'], answer: 0 },
    { type: 'single', q: 'Landslides are often triggered by?', options: ['Heavy rain & quakes','Sunny days','Calm winds','Frost'], answer: 0 },
    { type: 'multi', q: 'Flood after-safety (multiple).', options: ['Avoid contaminated water','Boil water advisories','Use electricity in wet areas','Discard spoiled food'], answer: [0,1,3] },
    { type: 'single', q: 'Tornado safest spot?', options: ['Basement/interior room','Under a bridge','Car on highway','Near windows'], answer: 0 },
    { type: 'single', q: 'Volcanic ash affects?', options: ['Air quality & engines','Ocean salinity','Magnetic poles','Tides only'], answer: 0 },
    { type: 'multi', q: 'Cyclone prep (multiple).', options: ['Trim trees','Charge power banks','Ignore alerts','Secure loose items'], answer: [0,1,3] },
    { type: 'single', q: 'Drop, Cover, Hold On protects primarily from?', options: ['Falling objects','Floodwater','Lava','Lightning'], answer: 0 },
    { type: 'single', q: 'Drought mitigation includes?', options: ['Water conservation','Leave taps open','Irrigate at noon','Ignore leaks'], answer: 0 },
    { type: 'multi', q: 'Tsunami alerts—what to do? (multiple)', options: ['Move to high ground','Go to shore','Follow evacuation routes','Wait on the beach'], answer: [0,2] },
    { type: 'single', q: 'Mudflow associated with volcanoes is?', options: ['Lahar','Waterspout','Dust devil','Sinkhole'], answer: 0 },
    { type: 'multi', q: 'Landslide warning signs (multiple).', options: ['Ground cracks','Doors/windows jam','Loud rumbling','Ocean recedes'], answer: [0,1,2] },
    { type: 'single', q: 'A cyclone in the Atlantic is often called?', options: ['Hurricane','Typhoon','Dust storm','Derecho'], answer: 0 },
    { type: 'single', q: 'Best footwear in floods?', options: ['Sturdy waterproof boots','Flip-flops','Barefoot','Heels'], answer: 0 },
    { type: 'multi', q: 'Earthquake prep (multiple).', options: ['Secure heavy furniture','Store water & food','Sleep under glass shelves','Practice drills'], answer: [0,1,3] },
    // Text questions (3)
    { type: 'text', q: 'Write any 2 Do’s during an Earthquake.', answer: { keywords: ['drop','cover','hold','stay away from windows','turn off gas','evacuate after shaking','protect head'], minMatch: 2 } },
    { type: 'text', q: 'Name 2 effects of a Flood.', answer: { keywords: ['water contamination','crop damage','displacement','infrastructure damage','landslide','disease'], minMatch: 2 } },
    { type: 'text', q: 'List 2 items to include in an Emergency Kit.', answer: { keywords: ['water','first-aid','flashlight','whistle','snacks','battery','radio'], minMatch: 2 } },
  ]
  return base
}

const bank = {
  easy: makeEasyQuestions(),
  medium: makeMediumQuestions(),
  hard: makeHardQuestions(),
}

const LEVELS = ['easy','medium','hard']

export default function StudentQuiz() {
  const navigate = useNavigate()
  const [level, setLevel] = useState('easy')
  const [started, setStarted] = useState(false)
  const questions = bank[level]
  const total = questions.length
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { [qIndex]: value }
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Reset state on level change
    setIdx(0); setAnswers({}); setSubmitted(false)
  }, [level])

  function setAnswer(i, val) {
    setAnswers(prev => ({ ...prev, [i]: val }))
  }

  function toggleMulti(i, optionIndex) {
    const prev = answers[i] || []
    const has = prev.includes(optionIndex)
    const next = has ? prev.filter(x => x !== optionIndex) : [...prev, optionIndex]
    setAnswer(i, next)
  }

  function evaluate() {
    let correct = 0
    for (let i = 0; i < total; i++) {
      const q = questions[i]
      const a = answers[i]
      if (q.type === 'single') {
        if (typeof a === 'number' && a === q.answer) correct++
      } else if (q.type === 'multi') {
        const corr = Array.isArray(q.answer) ? q.answer.slice().sort() : []
        const got = Array.isArray(a) ? a.slice().sort() : []
        if (corr.length && corr.length === got.length && corr.every((v, k) => v === got[k])) correct++
      } else if (q.type === 'text') {
        const { keywords = [], minMatch = 2 } = q.answer || {}
        const text = String(a || '').toLowerCase()
        const matches = keywords.filter(k => text.includes(k.toLowerCase())).length
        if (matches >= minMatch) correct++
      }
    }
    return Math.round((correct / total) * 100)
  }

  // Save quiz results to localStorage when submitted
  useEffect(() => {
    if (submitted) {
      // Calculate score inside useEffect to avoid dependency issues
      let correct = 0
      for (let i = 0; i < total; i++) {
        const q = questions[i]
        const a = answers[i]
        if (q.type === 'single') {
          if (typeof a === 'number' && a === q.answer) correct++
        } else if (q.type === 'multi') {
          const corr = Array.isArray(q.answer) ? q.answer.slice().sort() : []
          const got = Array.isArray(a) ? a.slice().sort() : []
          if (corr.length && corr.length === got.length && corr.every((v, k) => v === got[k])) correct++
        } else if (q.type === 'text') {
          const { keywords = [], minMatch = 2 } = q.answer || {}
          const text = String(a || '').toLowerCase()
          const matches = keywords.filter(k => text.includes(k.toLowerCase())).length
          if (matches >= minMatch) correct++
        }
      }
      const score = Math.round((correct / total) * 100)
      
      const currentName = localStorage.getItem('currentName') || 'Student'
      const quizResult = {
        studentName: currentName,
        level: level,
        score: score,
        correctAnswers: correct,
        totalQuestions: total,
        completedAt: new Date().toISOString(),
        questions: questions.map((q, i) => ({
          question: q.q,
          type: q.type,
          studentAnswer: answers[i],
          correctAnswer: q.answer,
          isCorrect: (() => {
            const a = answers[i]
            if (q.type === 'single') {
              return typeof a === 'number' && a === q.answer
            } else if (q.type === 'multi') {
              const corr = Array.isArray(q.answer) ? q.answer.slice().sort() : []
              const got = Array.isArray(a) ? a.slice().sort() : []
              return corr.length && corr.length === got.length && corr.every((v, k) => v === got[k])
            } else if (q.type === 'text') {
              const { keywords = [], minMatch = 2 } = q.answer || {}
              const text = String(a || '').toLowerCase()
              const matches = keywords.filter(k => text.includes(k.toLowerCase())).length
              return matches >= minMatch
            }
            return false
          })()
        }))
      }
      
      // Store the latest quiz result and also append to history
      try {
        const existingResults = JSON.parse(localStorage.getItem('quiz-results') || '[]')
        const updatedResults = [quizResult, ...existingResults].slice(0, 10) // Keep last 10 results
        localStorage.setItem('quiz-results', JSON.stringify(updatedResults))
        localStorage.setItem('latest-quiz-result', JSON.stringify(quizResult))
      } catch (error) {
        console.error('Error saving quiz results:', error)
      }
    }
  }, [submitted, level, answers, questions, total])

  const percent = submitted ? evaluate() : Math.round(((idx + 1) / total) * 100)

  function gaugeColor(p) {
    if (p >= 80) return '#10b981' // green
    if (p >= 50) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const showSubmit = idx === total - 1 && !submitted
  const canPrev = idx > 0 && !submitted
  const canNext = idx < total - 1 && !submitted

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              aria-label="Back to Student Dashboard"
              title="Back"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg transition hover:bg-white/10"
              onClick={() => navigate('/student-dashboard')}
            >
              ←
            </button>
            <h1 className="text-xl font-semibold">Student Quiz</h1>
          </div>
          {started && (
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">Mode: {level.charAt(0).toUpperCase()+level.slice(1)}</div>
          )}
        </div>

        {/* Mode picker before starting */}
        {!started && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow">
            <div className="text-sm font-semibold text-white/90">Choose Difficulty</div>
            <div className="mt-1 text-xs text-slate-300">20 questions per level</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {LEVELS.map(l => (
                <button key={l}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition transform hover:scale-[1.02] ${l==='easy'?'bg-emerald-600':'bg-cyan-600'} text-white`}
                  onClick={() => { setLevel(l); setIdx(0); setAnswers({}); setSubmitted(false); setStarted(true); }}
                >{l.charAt(0).toUpperCase()+l.slice(1)}</button>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {started && !submitted && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-300"><span>Question {idx+1} of {total}</span><span>{Math.round(((idx+1)/total)*100)}%</span></div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${((idx+1)/total)*100}%` }} />
            </div>
          </div>
        )}

        {/* Quiz content */}
        {started && !submitted ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow">
              <div className="text-sm font-semibold text-white/90">{questions[idx].q}</div>
              <div className="mt-3 text-sm text-slate-200">
                {questions[idx].type === 'single' && (
                  <div className="grid gap-2">
                    {questions[idx].options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 rounded-lg bg-white/5 p-2 hover:bg-white/10">
                        <input type="radio" name={`q-${idx}`} checked={answers[idx]===oi} onChange={()=>setAnswer(idx, oi)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {questions[idx].type === 'multi' && (
                  <div className="grid gap-2">
                    {questions[idx].options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 rounded-lg bg-white/5 p-2 hover:bg-white/10">
                        <input type="checkbox" checked={Array.isArray(answers[idx]) && answers[idx].includes(oi)} onChange={()=>toggleMulti(idx, oi)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {questions[idx].type === 'text' && (
                  <textarea className="mt-2 w-full rounded-lg bg-white/10 p-2 outline-none" rows={4} placeholder="Type your answer here..." value={answers[idx]||''} onChange={e=>setAnswer(idx, e.target.value)} />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${canPrev? 'bg-white/10 hover:bg-white/15' : 'bg-white/5 text-slate-500'} transition`} disabled={!canPrev} onClick={()=>setIdx(i=>Math.max(0,i-1))}>Previous</button>
              <div className="flex gap-2">
                {canNext && (
                  <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-cyan-500 active:scale-100" onClick={()=>setIdx(i=>Math.min(total-1,i+1))}>Next</button>
                )}
                {showSubmit && (
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-500 active:scale-100" onClick={()=>setSubmitted(true)}>Submit Quiz</button>
                )}
              </div>
            </div>
          </div>
        ) : started ? (
          <div className="space-y-4">
            {/* Result gauge */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">Your Result</div>
              <div className="mx-auto flex max-w-md items-center">
                <div className="relative h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="80%" outerRadius="100%" startAngle={180} endAngle={0} data={[{ name: 'score', value: percent }]}>
                      <PolarAngleAxis type="number" domain={[0,100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={10} fill={gaugeColor(percent)} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {/* Centered percentage overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-extrabold" style={{ color: gaugeColor(percent) }}>{percent}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">Summary</div>
              <ul className="space-y-2 text-sm">
                {questions.map((q, i) => {
                  const a = answers[i]
                  let correct = false
                  let corrText = ''
                  if (q.type === 'single') { correct = a === q.answer; corrText = q.options[q.answer] }
                  else if (q.type === 'multi') { const corr = q.answer || []; correct = Array.isArray(a) && a.slice().sort().join(',')===corr.slice().sort().join(','); corrText = corr.map(ci=>q.options[ci]).join(', ') }
                  else { const { keywords = [], minMatch = 2 } = q.answer || {}; const text = String(a||'').toLowerCase(); const matches = keywords.filter(k=>text.includes(k.toLowerCase())).length; correct = matches>=minMatch; corrText = keywords.slice(0,3).join(', ') + '...' }
                  return (
                    <li key={i} className={`rounded-xl border p-2 ${correct? 'border-emerald-400/40 bg-emerald-400/10' : 'border-rose-400/40 bg-rose-400/10'}`}>
                      <div className="font-medium text-white/90">Q{i+1}. {q.q}</div>
                      <div className="text-xs text-slate-200">{correct? 'Correct' : 'Incorrect'} • Correct answer: {corrText}</div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex justify-center gap-3">
              <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-cyan-500" onClick={()=>{ setSubmitted(false); setIdx(0); setAnswers({}) }}>Retry Quiz</button>
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20" onClick={()=>navigate('/student-dashboard#modules')}>Back to Learning Modules</button>
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20" onClick={()=>{ setStarted(false); setSubmitted(false); setIdx(0); setAnswers({}) }}>Change Level</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
