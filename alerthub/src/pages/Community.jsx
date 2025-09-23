import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'

const DISASTER_TYPES = ['Earthquake','Flood','Cyclone','Wildfire','Volcano','Tornado','Tsunami','Hurricane','Drought','Landslide']

function useCurrentUser() {
  const [user] = useState(() => {
    const id = localStorage.getItem('currentUserId') || `u_${Math.random().toString(36).slice(2,9)}`
    const role = (localStorage.getItem('currentRole') || 'student').toLowerCase()
    const name = localStorage.getItem('currentName') || 'Guest'
    try { localStorage.setItem('currentUserId', id) } catch {}
    return { id, role, name }
  })
  return user
}

function seedPosts() {
  return [
    {
      id: 'p1', createdAt: Date.now()-1000*60*60*12,
      author: { id: 's1', name: 'Aisha', role: 'student' },
      type: 'text', text: 'During our earthquake drill I hid under the desk and counted 60 seconds. My kit: water, flashlight, whistle. #EarthquakeStory #SafetyHero',
      disaster: 'Earthquake', hashtags: ['#EarthquakeStory','#SafetyHero'], likes: 5, likedBy: [], comments: [], verified: false, flagged: 0,
    },
    {
      id: 'p2', createdAt: Date.now()-1000*60*60*24,
      author: { id: 't1', name: 'Mr. Kumar', role: 'teacher' },
      type: 'video', text: 'Flood drill recap – 1 minute summary!', media: { type: 'video', url: '' },
      disaster: 'Flood', hashtags: ['#FloodTips'], likes: 9, likedBy: [], comments: [ { id:'c1', author:{ id:'p3', name:'Parent Rani', role:'parent' }, text:'Great plan! We added sandbags.', createdAt: Date.now()-1000*60*60*20 } ], verified: true, flagged: 0,
    },
    {
      id: 'p3', createdAt: Date.now()-1000*60*60*36,
      author: { id: 'i1', name: 'Green Valley School', role: 'institution' },
      type: 'image', text: 'Our safe shelter map for the campus. #SafeZone', media: { type: 'image', url: '' },
      disaster: 'Cyclone', hashtags: ['#SafeZone'], likes: 4, likedBy: [], comments: [], verified: true, flagged: 0,
    },
  ]
}

function useCommunityStore() {
  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem('community_posts')
      if (raw) return JSON.parse(raw)
      const seeded = seedPosts()
      localStorage.setItem('community_posts', JSON.stringify(seeded))
      return seeded
    } catch { return seedPosts() }
  })
  useEffect(() => { try { localStorage.setItem('community_posts', JSON.stringify(posts)) } catch {} }, [posts])

  function addPost(p) { setPosts(prev => [{...p, id:`p_${Date.now()}_${Math.random().toString(36).slice(2,6)}`}, ...prev]) }
  function toggleLike(id, userId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p
      const liked = new Set(p.likedBy || [])
      if (liked.has(userId)) { liked.delete(userId); return { ...p, likedBy: Array.from(liked), likes: Math.max(0, (p.likes||0)-1) } }
      liked.add(userId); return { ...p, likedBy: Array.from(liked), likes: (p.likes||0)+1 }
    }))
  }
  function addComment(id, comment) {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, comments: [...(p.comments||[]), comment] } : p)))
  }
  function verifyPost(id, verified) { setPosts(prev => prev.map(p => (p.id === id ? { ...p, verified } : p))) }
  function flagPost(id) { setPosts(prev => prev.map(p => (p.id === id ? { ...p, flagged: (p.flagged||0)+1 } : p))) }

  return { posts, addPost, toggleLike, addComment, verifyPost, flagPost }
}

function Badge({ children }) { return <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">{children}</span> }
Badge.propTypes = { children: PropTypes.node }

function Composer({ onCreate, presetDisaster, presetText }) {
  const [text, setText] = useState(presetText || '')
  const [disaster, setDisaster] = useState(presetDisaster || '')
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState('')
  const [busy, setBusy] = useState(false)
  const user = useCurrentUser()
  const fileInputRef = useRef(null)

  function onPickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    let t = 'file'
    if (f.type.startsWith('image/')) t = 'image'
    else if (f.type.startsWith('video/')) t = 'video'
    else if (f.type.startsWith('audio/')) t = 'audio'
    setFile(f)
    setFileType(t)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content && !file) return
    try {
      setBusy(true)
      let media = null
      if (file && (fileType==='image' || fileType==='video' || fileType==='audio')) {
        // Convert file to data URL for demo/local storage
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(r.result)
          r.onerror = rej
          r.readAsDataURL(file)
        })
        media = { type: fileType, url: dataUrl }
      }
  const tags = Array.from(new Set((content.match(/#\w+/g) || []).map(s => s.trim())))
      onCreate({
        createdAt: Date.now(),
        author: { id: user.id, name: user.name, role: user.role },
        type: media ? media.type : 'text',
        text: content,
        media,
        disaster: disaster || '',
        hashtags: tags,
        likes: 0, likedBy: [], comments: [], verified: false, flagged: 0,
      })
      setText('')
      setDisaster('')
      setFile(null)
      setFileType('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="mb-2 text-sm font-semibold text-neutral-200">Share your experience</div>
      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder="Write a tip, story, or checklist. Include #hashtags like #FloodTips"
        className="h-24 w-full resize-none rounded-md border border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={disaster} onChange={e=>setDisaster(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-neutral-100">
          <option value="">Select disaster</option>
          {DISASTER_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" onChange={onPickFile} className="text-xs text-neutral-300" />
        <button disabled={busy} type="submit" className="ml-auto rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{busy? 'Posting…':'Post'}</button>
      </div>
      {file && (
        <div className="mt-2 text-xs text-neutral-400">Attached {fileType}: {file.name}</div>
      )}
    </form>
  )
}

Composer.propTypes = {
  onCreate: PropTypes.func.isRequired,
  presetDisaster: PropTypes.string,
  presetText: PropTypes.string,
}

function PostCard({ post, onLike, onComment, onVerify, onFlag, canVerify }) {
  const [comment, setComment] = useState('')
  const user = useCurrentUser()
  const liked = (post.likedBy||[]).includes(user.id)
  function submitComment(e) {
    e.preventDefault()
    const text = comment.trim()
    if (!text) return
    onComment(post.id, { id:`c_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, author:{ id:user.id, name:user.name, role:user.role }, text, createdAt: Date.now() })
    setComment('')
  }
  function onShare() {
    const shareText = `${post.author.name} (${post.author.role}) – ${post.text}`
    if (navigator.share) {
      navigator.share({ title: 'AlertHub Community', text: shareText }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(shareText)
    }
  }
  const hiddenForFlags = (post.flagged||0) >= 5
  if (hiddenForFlags) return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-400">This post is hidden due to multiple reports.</div>
  )
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-100">{post.author.name}</span>
            <span className="text-xs text-neutral-400">• {post.author.role}</span>
            {post.verified && <Badge>✅ Trusted</Badge>}
          </div>
          <div className="text-xs text-neutral-400">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {canVerify && (
          <button onClick={()=>onVerify(post.id, !post.verified)} className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">{post.verified?'Unverify':'Verify'}</button>
        )}
      </div>
      <div className="mt-3 whitespace-pre-wrap text-sm text-neutral-100">{post.text}</div>
      {post.media?.url && (
        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800">
          {post.media.type==='image' && <img src={post.media.url} alt="attachment" className="max-h-80 w-full object-cover" />}
          {post.media.type==='video' && (
            <video controls className="w-full">
              <source src={post.media.url} />
              <track kind="captions" label="English captions" />
            </video>
          )}
          {post.media.type==='audio' && (
            <audio controls className="w-full">
              <source src={post.media.url} />
              <track kind="captions" label="English captions" />
            </audio>
          )}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {post.disaster && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{post.disaster}</span>}
        {(post.hashtags||[]).map(h => <span key={h} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{h}</span>)}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button onClick={()=>onLike(post.id)} className={`rounded-md px-2 py-1 ${liked ? 'bg-cyan-600/30 text-cyan-300' : 'bg-white/5 text-neutral-200'} border border-white/10`}>👍 {post.likes||0}</button>
        <button onClick={onShare} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-neutral-200">↗️ Share</button>
        <button onClick={()=>onFlag(post.id)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-neutral-200">🚩 Report</button>
      </div>
      <div className="mt-3 space-y-2">
        {(post.comments||[]).map(c => (
          <div key={c.id} className="rounded-md border border-white/10 bg-white/5 p-2 text-xs">
            <div className="mb-1 flex items-center gap-2"><span className="font-medium text-neutral-200">{c.author.name}</span><span className="text-neutral-400">• {new Date(c.createdAt).toLocaleString()}</span></div>
            <div className="text-neutral-100">{c.text}</div>
          </div>
        ))}
        <form onSubmit={submitComment} className="flex items-center gap-2">
          <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment…" className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 placeholder:text-neutral-500" />
          <button type="submit" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-100">Post</button>
        </form>
      </div>
    </div>
  )
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  onLike: PropTypes.func.isRequired,
  onComment: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  canVerify: PropTypes.bool.isRequired,
}

function Filters({ q, setQ, disaster, setDisaster }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search #hashtags or text" className="w-64 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500" />
      <select value={disaster} onChange={e=>setDisaster(e.target.value)} className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm text-neutral-100">
        <option value="">All disasters</option>
        {DISASTER_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  )
}

Filters.propTypes = {
  q: PropTypes.string.isRequired,
  setQ: PropTypes.func.isRequired,
  disaster: PropTypes.string.isRequired,
  setDisaster: PropTypes.func.isRequired,
}

export default function Community() {
  const user = useCurrentUser()
  const { posts, addPost, toggleLike, addComment, verifyPost, flagPost } = useCommunityStore()
  const [q, setQ] = useState('')
  const [disaster, setDisaster] = useState('')
  let canVerify = false
  if (user.role === 'teacher' || user.role === 'institution' || user.role === 'authority' || user.role === 'admin') {
    canVerify = true
  }
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const presetDisaster = params.get('disaster') || ''
  let presetText = ''
  const ctx = params.get('context')
  if (ctx === 'drill') presetText = 'We completed a drill today! #DrillExperience '
  else if (ctx === 'learning') presetText = 'Sharing how I prepared for this hazard. '

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return posts.filter(p => {
      const matchesText = !term || (p.text||'').toLowerCase().includes(term) || (p.hashtags||[]).some(h => h.toLowerCase().includes(term))
      const matchesDisaster = !disaster || (p.disaster||'') === disaster
      return matchesText && matchesDisaster
    })
    .sort((a,b) => {
      if (b.verified === a.verified) return 0
      return b.verified ? 1 : -1
    })
    .sort((a,b) => b.createdAt - a.createdAt)
  }, [posts, q, disaster])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top Navbar to match Student UI */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl">👥</div>
            <div className="text-lg font-semibold">Community</div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-200 sm:flex">
            <a className="hover:text-white/90" href="/student-dashboard">Dashboard</a>
            <a className="hover:text-white/90" href="/community">Feed</a>
          </div>
        </div>
      </nav>

      {/* Main grid matching Student layout */}
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left / Center */}
        <section className="space-y-6 lg:col-span-8">
          {/* Welcome strip */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl">💬</div>
                <div>
                  <h1 className="text-xl font-semibold md:text-2xl">Share and learn from your community</h1>
                  <p className="text-sm text-slate-300">Role: {user.role}</p>
                </div>
              </div>
              <a href="#composer" className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:bg-cyan-700 hover:text-white">Create a Post</a>
            </div>
          </div>

          {/* Composer + Filters */}
          <div id="composer">
            <Composer onCreate={addPost} presetDisaster={presetDisaster} presetText={presetText} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold text-slate-200">Filter feed</div>
            <Filters q={q} setQ={setQ} disaster={disaster} setDisaster={setDisaster} />
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {filtered.map(p => (
              <PostCard key={p.id} post={p} onLike={(id)=>toggleLike(id, user.id)} onComment={addComment} onVerify={verifyPost} onFlag={flagPost} canVerify={canVerify} />
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">No posts yet. Be the first to share!</div>
            )}
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm font-semibold text-slate-200">Trending hashtags</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {['#FloodTips','#EarthquakeStory','#SafetyHero','#SafeZone','#CommunityHelper'].map(h => (
                <button key={h} onClick={()=>setQ(h)} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-200 hover:bg-white/10">{h}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <div className="mb-2 font-semibold">Badges</div>
            <ul className="list-inside list-disc space-y-1 text-slate-300">
              <li>Safety Hero – Verified life-saving tips</li>
              <li>First Responder – Early local reports</li>
              <li>Community Helper – Answers to peers</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <div className="mb-2 font-semibold">Tips</div>
            <p>Keep videos short (2–3 min). Avoid sharing personal data. Be respectful and constructive.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
