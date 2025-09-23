import { useEffect, useRef, useState } from 'react'
import { disastersData } from '../pages/disastersData.js'

const SUPPORTED_LANGS = ['en', 'hi', 'te']

const EMERGENCY_CONTACTS = {
  en: [
    'NDMA Control Room: 011-1078',
    'Police: 100',
    'Fire: 101',
    'Ambulance: 102 / 108',
  ],
  hi: [
    'एनडीएमए कंट्रोल रूम: 011-1078',
    'पुलिस: 100',
    'दमकल: 101',
    'एंबुलेंस: 102 / 108',
  ],
  te: [
    'NDMA కంట్రోల్ రూమ్: 011-1078',
    'పోలీస్: 100',
    'ఫైర్: 101',
    'ఆంబులెన్స్: 102 / 108',
  ],
}

function useRole() {
  const role = (localStorage.getItem('currentRole') || 'student').toLowerCase()
  return role
}

function hazardFromText(text) {
  const t = text.toLowerCase()
  const ids = ['earthquake','flood','tsunami','hurricane','drought','wildfire','landslide','volcano','tornado']
  return ids.find(id => t.includes(id))
}

function getHazardTips(id) {
  const mod = disastersData.find(m => (m.id || '').toLowerCase() === id)
  if (!mod) return {
    en: ['Stay calm and follow official instructions.'],
    hi: ['शांत रहें और आधिकारिक निर्देशों का पालन करें।'],
    te: ['శాంతంగా ఉండి అధికారిక సూచనలను అనుసరించండి.'],
  }
  // try to pull dos & donts & kit from module structure if present; fall back to generic
  const points = []
  if (Array.isArray(mod?.dos) && mod.dos.length) points.push(...mod.dos.map(x => `Do: ${x}`))
  if (Array.isArray(mod?.donts) && mod.donts.length) points.push(...mod.donts.map(x => `Don’t: ${x}`))
  if (Array.isArray(mod?.kit) && mod.kit.length) points.push(`Emergency Kit: ${mod.kit.slice(0,6).join(', ')} …`)
  const en = points.length ? points : [
    'Find safe cover; avoid hazardous areas.',
    'Keep emergency kit ready: water, flashlight, first-aid.',
  ]
  // light static translations for common phrases
  const hi = en.map(s => s
    .replace('Do:', 'करें:')
    .replace('Don’t:', 'न करें:')
    .replace('Emergency Kit:', 'आपातकालीन किट:')
    .replace('Find safe cover; avoid hazardous areas.', 'सुरक्षित जगह खोजें; खतरनाक क्षेत्रों से दूर रहें.')
    .replace('Keep emergency kit ready: water, flashlight, first-aid.', 'आपातकालीन किट तैयार रखें: पानी, टॉर्च, फर्स्ट-एड.'))
  const te = en.map(s => s
    .replace('Do:', 'చేయాలి:')
    .replace('Don’t:', 'చేయకూడదు:')
    .replace('Emergency Kit:', 'అత్యవసర కిట్:')
    .replace('Find safe cover; avoid hazardous areas.', 'సురక్షిత స్థలం వెతకండి; ప్రమాదకర ప్రాంతాలను దూరంగా ఉంచండి.')
    .replace('Keep emergency kit ready: water, flashlight, first-aid.', 'అత్యవసర కిట్ సిద్ధంగా ఉంచండి: నీరు, టార్చ్, ఫస్ట్-ఎయిడ్.'))
  return { en, hi, te }
}

function nearestSafe(markers, from = { lat: 20.5937, lng: 78.9629 }) {
  if (!markers?.length) return null
  let best = null
  let bestD = Infinity
  for (const m of markers) {
    const d = Math.hypot((m.lat - from.lat), (m.lng - from.lng))
    if (d < bestD) { bestD = d; best = m }
  }
  return best
}

function toLang(texts, lang) {
  return Array.isArray(texts) ? texts : (texts?.[lang] || texts?.en || [])
}

export default function ChatbotWidget() {
  const role = useRole()
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState(() => (localStorage.getItem('chatbot_lang') || 'en'))
  const [pendingAction, setPendingAction] = useState(null) // e.g., { type:'broadcast', payload }
  const msgId = useRef(0)
  const [messages, setMessages] = useState(() => ([
    { id: `m${Date.now()}`, from: 'bot', text: {
      en: `Hi! I’m your safety assistant. Ask me about disasters, drills, broadcasts, or reports. (Role: ${role})`,
      hi: `नमस्ते! मैं आपकी सुरक्षा सहायक हूँ। आपदाओं, ड्रिल, प्रसारण या रिपोर्ट के बारे में पूछें। (भूमिका: ${role})`,
      te: `హాయ్! నేను మీ భద్రత సహాయకుడు. విపత్తులు, డ్రిల్స్, ప్రసారాలు లేదా నివేదికలు గురించి అడగండి. (పాత్ర: ${role})`,
    }},
  ]))
  const inputRef = useRef(null)

  useEffect(() => { localStorage.setItem('chatbot_lang', lang) }, [lang])
  // Accept external prompts from inline hint cards
  useEffect(() => {
    function onExternalAsk(e) {
      const q = e?.detail || ''
      if (!q) return
      setOpen(true)
      onAsk(q)
    }
    window.addEventListener('chatbot:ask', onExternalAsk)
    return () => window.removeEventListener('chatbot:ask', onExternalAsk)
  }, [])

  function nextId() { msgId.current += 1; return `m${Date.now()}_${msgId.current}` }

  function renderText(t) {
    if (t == null) return ''
    if (typeof t === 'string') return t
    if (Array.isArray(t)) return t.join('\n')
    if (typeof t === 'object') {
      const maybe = t?.[lang] || t?.en
      if (typeof maybe === 'string') return maybe
      if (Array.isArray(maybe)) return maybe.join('\n')
      try { return JSON.stringify(t) } catch { return String(t) }
    }
    return String(t)
  }

  function pushBot(lines) {
    const arr = Array.isArray(lines) ? lines : [String(lines)]
    setMessages(prev => [...prev, ...arr.map(t => ({ id: nextId(), from: 'bot', text: t }))])
  }
  function pushUser(text) { setMessages(prev => [...prev, { id: nextId(), from: 'user', text }]) }

  function handleBroadcastApproval(yes) {
    if (!pendingAction || pendingAction.type !== 'broadcast') { setPendingAction(null); return }
    if (!yes) { pushBot({ en: 'Broadcast canceled.', hi: 'प्रसारण रद्द किया गया।', te: 'ప్రసారం రద్దు చేయబడింది.' }); setPendingAction(null); return }
    const { to, text } = pendingAction.payload
    const key = 'inst-broadcasts'
    let list = []
    try { list = JSON.parse(localStorage.getItem(key) || '[]') } catch { list = [] }
    const entry = { id: Math.random().toString(36).slice(2,9), when: new Date().toISOString(), to, text }
    localStorage.setItem(key, JSON.stringify([entry, ...list]))
    pushBot({ en: `✅ Broadcast sent to ${to}.`, hi: `✅ ${to} को प्रसारण भेजा गया।`, te: `✅ ${to} కు ప్రసారం పంపబడింది.` })
    setPendingAction(null)
  }

  function saveHistoryAndReset() {
    try {
      const key = 'chatbot_history'
      const prev = JSON.parse(localStorage.getItem(key) || '[]')
      const session = {
        id: `s_${Date.now()}`,
        at: new Date().toISOString(),
        role,
        lang,
        messages: messages.map(m => ({ from: m.from, text: renderText(m.text) })),
      }
      const updated = [session, ...prev].slice(0, 20)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {}
    // reset chat
    setMessages([
      { id: nextId(), from: 'bot', text: {
        en: `Hi! I’m your safety assistant. Ask me about disasters, drills, broadcasts, or reports. (Role: ${role})`,
        hi: `नमस्ते! मैं आपकी सुरक्षा सहायक हूँ। आपदाओं, ड्रिल, प्रसारण या रिपोर्ट के बारे में पूछें। (भूमिका: ${role})`,
        te: `హాయ్! నేను మీ భద్రత సహాయకుడు. విపత్తులు, డ్రిల్స్, ప్రసారాలు లేదా నివేదికలు గురించి అడగండి. (పాత్ర: ${role})`,
      }},
      { id: nextId(), from: 'bot', text: { en: 'Chat cleared. Previous conversation saved to history.', hi: 'चैट साफ़ हो गई। पिछली बातचीत इतिहास में सहेजी गई।', te: 'చాట్ క్లియర్ అయింది. గత సంభాషణ చరిత్రలో సేవ్ చేయబడింది.' } }
    ])
  }

  // Handlers to reduce onAsk complexity
  function handleLangSwitch(q, lower) {
    if (!lower.startsWith('lang:')) return false
    const next = lower.split(':')[1]?.trim()
    if (SUPPORTED_LANGS.includes(next)) { setLang(next); pushBot({ en: 'Language set to English.', hi: 'भाषा हिंदी पर सेट की गई।', te: 'భాషను తెలుగు‌కు సెట్ చేశారు.' }) }
    else { pushBot({ en: 'Supported: en, hi, te', hi: 'समर्थित: en, hi, te', te: 'మద్దతు: en, hi, te' }) }
    return true
  }
  function handleDisasterInfo(q, lower) {
    if (!/what\s*(should|to)\s*do.*(during|in)/i.test(lower)) return false
    const hid = hazardFromText(lower)
    const tips = getHazardTips(hid)
    pushBot([`• ${toLang(tips, lang).join('\n• ')}`])
    return true
  }
  function handleScheduleDrill(q, lower) {
    if (!/(schedule|assign).*drill/.test(lower)) return false
    if (role === 'teacher') {
      pushBot({ en: 'Go to Teacher Dashboard → Drill Assignment. Pick Class, Type, Date, then Assign.', hi: 'टीचर डैशबोर्ड → ड्रिल असाइनमेंट। क्लास, प्रकार, तारीख चुनें, फिर असाइन करें।', te: 'టీచర్ డ్యాష్‌బోర్డ్ → డ్రిల్ అసైన్‌మెంట్. క్లాస్, రకం, తేదీ ఎంచుకుని అసైన్ చేయండి.' })
    } else if (role === 'institution') {
      pushBot({ en: 'Institution Dashboard → Drill Scheduler. Select multiple classes, type, date → Schedule.', hi: 'इंस्टीट्यूशन डैशबोर्ड → ड्रिल शेड्यूलर। कई कक्षाएँ, प्रकार, तारीख चुनें → शेड्यूल करें।', te: 'ఇన్‌స్టిట్యూషన్ డ్యాష్‌బోర్డ్ → డ్రిల్ షెడ్యూలర్. బహుళ తరగతులు, రకం, తేదీ → షెడ్యూల్.' })
    } else {
      pushBot({ en: 'Please ask a Teacher or Institution admin to schedule drills.', hi: 'कृपया ड्रिल शेड्यूल के लिए टीचर/इंस्टिट्यूशन से पूछें।', te: 'డ్రిల్ షెడ్యూల్ కోసం టీచర్/ఇన్‌స్టిట్యూషన్‌ను అడగండి.' })
    }
    return true
  }
  function handleRecentDrills() {
    let list = []
    try { list = JSON.parse(localStorage.getItem('inst-drills') || '[]') } catch {}
    const rows = list.slice(0,3).map(d => `✅ ${d.type} — Class ${d.classId} — ${d.date}`)
    pushBot(rows.length ? rows : { en: 'No drills found.', hi: 'कोई ड्रिल नहीं मिली।', te: 'డ్రిల్స్ కనబడలేదు.' })
    return true
  }
  function handleRecentDrillsMatch(q, lower) {
    return /history.*(last|recent).*drills|last\s*3\s*drills/.test(lower)
  }
  function handleBroadcast(q, lower) {
    if (!/^send\s*broadcast\s*:\s*/.test(lower)) return false
    const text = q.replace(/^send\s*broadcast\s*:\s*/i, '')
    const to = role === 'teacher' ? 'students' : 'students+teachers'
    setPendingAction({ type: 'broadcast', payload: { to, text } })
    pushBot({ en: `Approve broadcast to ${to}?`, hi: `${to} को प्रसारण स्वीकृत करें?`, te: `${to} కు ప్రసారం ఆమోదించాలా?` })
    return true
  }
  function handleNearestSafeZone(q, lower) {
    if (!/nearest.*safe.*zone/.test(lower)) return false
    let markers = []
    try { markers = JSON.parse(localStorage.getItem('inst-markers') || '[]') } catch {}
    const best = nearestSafe(markers)
    if (!best) pushBot({ en: 'No campus safe zones mapped yet.', hi: 'अभी तक कोई सुरक्षित ज़ोन मैप नहीं किया गया।', te: 'ఇంకా సేఫ్ జోన్లు మ్యాప్ చేయలేదు.' })
    else pushBot({ en: `Nearest marker at lat ${best.lat.toFixed(3)}, lng ${best.lng.toFixed(3)}.`, hi: `निकटतम मार्कर: लैट ${best.lat.toFixed(3)}, लॉन्ग ${best.lng.toFixed(3)}।`, te: `సమీప మార్కర్: lat ${best.lat.toFixed(3)}, lng ${best.lng.toFixed(3)}.` })
    return true
  }
  function handleEmergencyContactsMatch(q, lower) { return /who.*to.*contact|emergency.*number|help.*number/.test(lower) }
  function handleEmergencyContacts() { pushBot(EMERGENCY_CONTACTS[lang]); return true }
  function handleLearningSupportMatch(q, lower) { return /explain|hint|help.*quiz|help.*module/.test(lower) }
  function handleLearningSupport() { pushBot({ en: 'Focus on the basics first. Revisit “Know the Disaster”, then “Do’s & Don’ts”.', hi: 'पहले मूल बातें देखें। “आपदा को जानें” फिर “क्या करें/क्या न करें” पढ़ें।', te: 'ముందుగా ప్రాథమికాలను చూడండి. “విపత్తుని తెలుసుకోండి”, తర్వాత “చేయాలి/చేయకూడదు” చదవండి.' }); return true }
  function handleMarkModuleDone(q, lower) {
    if (!/mark.*(earthquake|flood|tsunami|hurricane|drought|wildfire|landslide|volcano|tornado).*done/.test(lower)) return false
    const id = hazardFromText(lower)
    try {
      const saved = JSON.parse(localStorage.getItem('visited-modules') || '{}')
      saved[id] = { know: true, dosdonts: true, plan: true, recovery: true, effects: true }
      localStorage.setItem('visited-modules', JSON.stringify(saved))
      pushBot({ en: `Marked ${id} module completed for your progress.`, hi: `${id} मॉड्यूल पूर्ण रूप से मार्क कर दिया गया।`, te: `${id} మాడ్యూల్ పూర్తి చేసిందని గుర్తించాం.` })
    } catch {
      pushBot({ en: 'Could not update progress.', hi: 'प्रगति अपडेट नहीं हो सकी।', te: 'ప్రోగ్రెస్ అప్‌డేట్ కాలేదు.' })
    }
    return true
  }
  function handleAnalyticsPrompt(q, lower) {
    const m = lower.match(/show.*drill.*completion.*class\s*(\w+)/)
    if (!m) return false
    const cls = m[1]
    let drills = []
    let comp = {}
    try { drills = JSON.parse(localStorage.getItem('teacher-drills') || '[]') } catch {}
    try { comp = JSON.parse(localStorage.getItem('drill-completions') || '{}') } catch {}
    const forClass = drills.filter(d => (d.classId || '').toLowerCase() === (cls || '').toLowerCase())
    if (!forClass.length) { pushBot({ en: `No drills found for Class ${cls}.`, hi: `कक्षा ${cls} के लिए कोई ड्रिल नहीं मिली।`, te: `క్లాస్ ${cls} కోసం డ్రిల్స్ లేవు.` }); return true }
    let total = 0, done = 0
    for (const d of forClass) {
      const byDrill = comp[d.id] || {}
      const values = Object.values(byDrill)
      total += values.length || 0
      done += values.filter(Boolean).length || 0
    }
    const pct = total ? Math.round((done/total)*100) : 0
    pushBot({ en: `Drill completion for Class ${cls}: ${pct}%`, hi: `कक्षा ${cls} की ड्रिल पूर्णता: ${pct}%`, te: `క్లాస్ ${cls} డ్రిల్ పూర్తి: ${pct}%` })
    return true
  }
  function handleDownloadReport(q, lower) {
    if (!/download.*report.*flood/.test(lower)) return false
    pushBot({ en: 'Open Institution Reports and filter by Flood, then Export CSV.', hi: 'इंस्टीट्यूशन रिपोर्ट्स खोलें और Flood पर फ़िल्टर करें, फिर CSV एक्सपोर्ट करें।', te: 'ఇన్‌స్టిట్యూషన్ రిపోర్ట్స్‌లో ఫ్లడ్ ఫిల్టర్ పెట్టి CSV ఎగుమతి చేయండి.' })
    return true
  }

  // Pending broadcast approval gate
  function handlePendingBroadcastResponse(lower) {
    if (!(pendingAction && pendingAction.type === 'broadcast')) return false
    const yes = /(yes|approve|confirm|send)/.test(lower)
    const no = /(no|cancel|stop|reject)/.test(lower)
    if (yes || no) {
      handleBroadcastApproval(!!yes)
      return true
    }
    pushBot({ en: 'Please reply Yes or No to approve the pending broadcast.', hi: 'लंबित प्रसारण को स्वीकृत करने के लिए कृपया Yes या No लिखें।', te: 'పెండింగ్ ప్రసారానికి ఆమోదం ఇవ్వడానికి దయచేసి Yes లేదా No అని టైప్ చేయండి.' })
    return true
  }

  // Main intent router
  function onAsk(q) {
    const query = (q || '').trim()
    if (!query) return
    pushUser(query)
    const lower = query.toLowerCase()

    // If awaiting approval for a pending action (e.g., broadcast)
    if (handlePendingBroadcastResponse(lower)) return

    // Intent chain — first match wins
    const pipeline = [
      () => handleLangSwitch(query, lower),
      () => handleDisasterInfo(query, lower),
      () => handleScheduleDrill(query, lower),
      () => (handleRecentDrillsMatch(query, lower) ? (handleRecentDrills(), true) : false),
      () => handleBroadcast(query, lower),
      () => handleNearestSafeZone(query, lower),
      () => (handleEmergencyContactsMatch(query, lower) ? (handleEmergencyContacts(), true) : false),
      () => (handleLearningSupportMatch(query, lower) ? (handleLearningSupport(), true) : false),
      () => handleMarkModuleDone(query, lower),
      () => handleAnalyticsPrompt(query, lower),
      () => handleDownloadReport(query, lower),
    ]
    for (const step of pipeline) { if (step()) return }

    // Fallback
    pushBot({
      en: 'I did not catch that. Try: "What to do during an earthquake?", "Schedule a drill", "Nearest safe zone", or "Show drill completion % for Class 10".',
      hi: 'मैं समझ नहीं पाया। कोशिश करें: "भूकंप के दौरान क्या करें?", "ड्रिल शेड्यूल करें", "निकटतम सेफ जोन", या "कक्षा 10 की ड्रिल पूर्णता % दिखाएँ"।',
      te: 'నేను అర్థం చేసుకోలేకపోయాను. ప్రయత్నించండి: "భూకంపం సమయంలో ఏమి చేయాలి?", "డ్రిల్ షెడ్యూల్ చేయి", "సమీప సేఫ్ జోన్", లేదా "క్లాస్ 10 డ్రిల్ పూర్తి % చూపించు".'
    })
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50">
      {/* Toggle button (pill) */}
      <button onClick={()=>setOpen(s=>!s)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-white shadow-lg hover:bg-cyan-500" title="Ask the AI Buddy">
        <span className="text-base">🛟</span>
        <span className="font-semibold">Ask the AI Buddy</span>
      </button>

      {/* Left docked panel */}
      {open && (
        <div className="pointer-events-auto fixed right-4 top-4 bottom-4 z-50 w-[22rem] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-sm">
            <div className="font-semibold">Ask the AI Buddy</div>
            <div className="flex items-center gap-2">
              <button onClick={saveHistoryAndReset} className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">Reset</button>
              <select value={lang} onChange={e=>setLang(e.target.value)} className="rounded-md border border-white/15 bg-white/15 px-2 py-1 text-xs text-white outline-none">
                {SUPPORTED_LANGS.map(l => <option key={l} value={l} className="text-slate-900">{l.toUpperCase()}</option>)}
              </select>
              <button onClick={()=>setOpen(false)} className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">Close</button>
            </div>
          </div>

          <div className="flex h-[calc(100%-130px)] flex-col gap-2 overflow-hidden px-3 py-2 text-sm">
            <div className="flex-1 space-y-2 overflow-auto pr-1">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from==='user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.from==='user' ? 'bg-cyan-500/20 border-cyan-400/30' : 'bg-white/5 border-white/10'} max-w-[85%] whitespace-pre-wrap rounded-xl border px-3 py-2`}>{renderText(m.text)}</div>
                </div>
              ))}
            </div>

            {/* Pending approvals */}
            {pendingAction && pendingAction.type==='broadcast' && (
              <div className="border-t border-white/10 px-3 py-2 text-xs">
                <div className="mb-2">Approve broadcast?</div>
                <div className="flex gap-2">
                  <button onClick={()=>handleBroadcastApproval(true)} className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-emerald-300">Approve</button>
                  <button onClick={()=>handleBroadcastApproval(false)} className="rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-rose-300">Cancel</button>
                </div>
              </div>
            )}

            {/* Composer */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-2">
              <input ref={inputRef} onKeyDown={e=>{ if (e.key==='Enter') { onAsk(e.currentTarget.value); e.currentTarget.value='' } }} placeholder="Type a message…" className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50" />
              <button onClick={()=>{ const v = inputRef.current?.value || ''; onAsk(v); if (inputRef.current) inputRef.current.value='' }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">Send</button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-2 text-xs">
            {['What to do during an earthquake?','Show nearest safe zone','Who to contact?','Show drill completion % for Class 10'].map(s => (
              <button key={s} onClick={()=>onAsk(s)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10">{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
