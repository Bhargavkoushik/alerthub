/* eslint-disable react/prop-types */
import { useState } from 'react'
import LiveMap from '../LiveMap'
import { Link, NavLink } from 'react-router-dom'
import { Globe, Settings, Moon, SunMedium, Menu, Pencil, SatelliteDish, Shield } from 'lucide-react'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  function toggleTheme() {
    setDark((d) => !d)
    const root = document.documentElement
    if (!dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }

  function chooseLang(code) {
    setLang(code)
    try { localStorage.setItem('lang', code) } catch {}
  }

  const linkBase = 'rounded-full px-3 py-1.5 text-sm transition-colors'

  function scrollToSection(id) {
    try {
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    } catch {}
  }

  return (
    <header className="fixed inset-x-0 top-3 z-50 pointer-events-none">
      <div className="mx-auto max-w-7xl px-4 pointer-events-auto">
        <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/50 p-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-rose-500/20 px-3 py-1.5 text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            <Globe className="h-5 w-5 text-brand" />
            AlertHub
          </Link>

          {/* Center: Menu (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? 'bg-white/70 text-neutral-900 shadow dark:bg-neutral-800/80 dark:text-white'
                    : 'text-neutral-700 hover:text-brand dark:text-neutral-200'
                }`
              }
            >
              Home
            </NavLink>
            <button
              type="button"
              className={`${linkBase} text-neutral-700 hover:text-brand dark:text-neutral-200`}
              onClick={() => scrollToSection('disasters')}
            >
              About
            </button>
            <button
              type="button"
              className={`${linkBase} text-neutral-700 hover:text-brand dark:text-neutral-200`}
              onClick={() => scrollToSection('evolution')}
            >
              Evolution
            </button>
            <button
              type="button"
              className={`${linkBase} text-neutral-700 hover:text-brand dark:text-neutral-200`}
              onClick={() => scrollToSection('process')}
            >
              Process
            </button>
          </nav>

          {/* Right: Register + Settings */}
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90">
              Register / Login
            </Link>
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-3 py-2 text-sm shadow-sm backdrop-blur hover:bg-white/60 dark:border-white/10 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/60"
                onClick={() => setSettingsOpen((o) => !o)}
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white/95 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
                  <div className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Language</div>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${lang==='en' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                    onClick={() => { chooseLang('en'); setSettingsOpen(false) }}
                  >
                    English
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${lang==='te' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                    onClick={() => { chooseLang('te'); setSettingsOpen(false) }}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${lang==='hi' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                    onClick={() => { chooseLang('hi'); setSettingsOpen(false) }}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Appearance</div>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={toggleTheme}>
                    {dark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Theme
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: hamburger */}
          <button className="md:hidden rounded-full border border-white/20 bg-white/40 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-800/50" onClick={() => setMenuOpen((o) => !o)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile sheet */}
        {menuOpen && (
          <div className="mt-2 rounded-2xl border border-white/20 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-neutral-900/80 md:hidden">
            <div className="flex flex-col gap-2">
              <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white' : ''}`} onClick={() => setMenuOpen(false)}>Home</NavLink>
              <button className={`${linkBase}`} onClick={() => { scrollToSection('disasters'); setMenuOpen(false) }}>About</button>
              <button className={`${linkBase}`} onClick={() => { scrollToSection('evolution'); setMenuOpen(false) }}>Evolution</button>
              <button className={`${linkBase}`} onClick={() => { scrollToSection('process'); setMenuOpen(false) }}>Process</button>
              <Link to="/login" className="rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>
                Register / Login
              </Link>
              <button onClick={() => { toggleTheme(); setMenuOpen(false) }} className="mt-1 flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800/60">
                {dark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Theme
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function Section({ title, children }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12">
      {title && (
        <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-rose-50 to-amber-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_-10%,rgba(59,130,246,.15),transparent)]" />
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 pb-24 pt-12 text-center md:pt-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          Welcome to AlertHub
        </h1>
        <h2 className="mt-2 bg-gradient-to-r from-fuchsia-500 to-sky-500 bg-clip-text text-2xl font-extrabold uppercase tracking-widest text-transparent sm:text-3xl">
          Disaster Awareness & Alert System
        </h2>
        <p className="mt-4 max-w-3xl text-balance text-neutral-700 dark:text-neutral-300">
          Stay ahead of emergencies with real-time alerts, interactive safety tools, and role-based dashboards. Empowering students,
          teachers, families, and authorities to prepare, respond, and stay safe when it matters most.
        </p>
        <div className="mt-8">
          <Link to="/login" className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  )
}

const disasterItems = [
  {
    key: 'card1',
    emoji: '🌍',
    title: 'Understanding Disasters',
    desc:
      'Disasters can strike anytime, disrupting lives and communities. AlertHub provides reliable, real-time information to help you stay aware, prepared, and safe.',
    img: '/images/disasters-1.png',
    alt: 'Understanding Disasters — Stay Aware. Be Prepared. Stay Safe.',
  },
  {
    key: 'card2',
    emoji: '⚡',
    title: 'Types of Disasters Covered',
    desc:
      'Learn and track major disaster events including Earthquake, Volcano, Tornado, Tsunami, Hurricane, Drought, Wildfire, Landslide, and Flood — with guides, alerts, and safety resources for each.',
    img: '/images/disasters-2.png',
    alt: 'Types of Disasters Covered — icons around a compass',
  },
  {
    key: 'card3',
    emoji: '👥',
    title: 'For Everyone in the Community',
    desc:
      'Tailored dashboards and tools for Students, Teachers, Parents, Institutions, and Authorities — ensuring safety guidance and alerts are accessible to all.',
    img: '/images/disasters-3.png',
    alt: 'For Everyone in the Community — shield and roles',
  },
]

function Disasters() {
  function GlassCard({ emoji, title, desc }) {
    return (
      <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:min-h-[280px]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500/0 via-pink-500/0 to-sky-500/0 opacity-0 transition duration-300 group-hover:from-fuchsia-500/20 group-hover:via-pink-500/10 group-hover:to-sky-500/20 group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-lg">{emoji}</div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-200">{desc}</p>
        </div>
      </div>
    )
  }

  function ImageTile({ src, alt }) {
    // Try multiple common extensions so images show even if not saved as .png
    const base = src.replace(/\.(png|jpg|jpeg|webp)$/i, '')
    const candidates = [
      `${base}.png`,
      `${base}.jpg`,
      `${base}.jpeg`,
      `${base}.webp`,
    ]
    const [idx, setIdx] = useState(0)
    const [failed, setFailed] = useState(false)
    const tryNext = () => {
      if (idx < candidates.length - 1) setIdx((i) => i + 1)
      else setFailed(true)
    }
    return (
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl md:min-h-[280px]">
        {!failed ? (
          <img
            src={candidates[idx]}
            alt={alt}
            loading="lazy"
            className="h-64 w-full object-cover md:h-[280px]"
            onError={tryNext}
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-sm text-neutral-300 md:h-[280px]">
            Image coming soon
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>
    )
  }

  return (
    <div className="relative isolate overflow-hidden">
      <section id="disasters" className="relative mx-auto w-full max-w-7xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-wide text-cyan-300 md:text-3xl">
          DISASTERS
        </h2>

        <div className="grid gap-10 md:gap-12">
          {/* Row 1: card1 | image */}
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className="md:flex md:justify-start">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <GlassCard emoji={disasterItems[0].emoji} title={disasterItems[0].title} desc={disasterItems[0].desc} />
              </div>
            </div>
            <div className="md:flex md:justify-end">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <ImageTile src={disasterItems[0].img} alt={disasterItems[0].alt} />
              </div>
            </div>
          </div>

          {/* Row 2: image | card2 */}
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className="md:flex md:justify-start">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <ImageTile src={disasterItems[1].img} alt={disasterItems[1].alt} />
              </div>
            </div>
            <div className="md:flex md:justify-end">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <GlassCard emoji={disasterItems[1].emoji} title={disasterItems[1].title} desc={disasterItems[1].desc} />
              </div>
            </div>
          </div>

          {/* Row 3: card3 | image */}
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className="md:flex md:justify-start">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <GlassCard emoji={disasterItems[2].emoji} title={disasterItems[2].title} desc={disasterItems[2].desc} />
              </div>
            </div>
            <div className="md:flex md:justify-end">
              <div className="w-full md:w-[520px] xl:w-[560px]">
                <ImageTile src={disasterItems[2].img} alt={disasterItems[2].alt} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Process() {
  const cards = [
    {
      icon: Pencil,
      title: 'Register Your Profile',
      desc: 'Create your free account, select your category, and choose your preferences.',
      tilt: '-rotate-8',
    },
    {
      icon: SatelliteDish,
      title: 'Stay Informed',
      desc: 'Get real-time alerts, disaster guides, and resources tailored to your community and needs.',
      tilt: '-rotate-8',
    },
    {
      icon: Shield,
      title: 'Be Prepared & Act',
      desc: 'Access safety tips, emergency contacts, and guides to take when disasters strike.',
      tilt: '-rotate-8',
    },
  ]
  return (
    <section id="process" className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-wide text-cyan-300 md:text-3xl">GETTING STARTED</h2>
        <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
        <p className="mt-2 text-sm text-neutral-200">It's easy as 1, 2, 3</p>
      </div>

      <div className="mt-10 grid justify-center gap-8 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="flex items-stretch justify-center">
            <button
              className={`group relative ${c.tilt} w-full md:w-[260px] xl:w-[300px] h-[240px] md:h-[280px] cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1 hover:rotate-0 focus:rotate-0 active:rotate-0`}
              type="button"
            >
              {/* glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/15">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">{c.title}</div>
              <p className="mt-2 text-sm text-white/80">{c.desc}</p>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90">
          Start Registration
        </Link>
      </div>
    </section>
  )
}

function History() {
  const items = [
    {
      year: '2004',
      title: 'Indian Ocean Tsunami 🌊',
      impact: 'One of the deadliest tsunamis in history, over 10,000 lives lost in India.',
      lesson: 'The critical need for instant, multi-channel alerts to save lives.',
      marker: '📍',
    },
    {
      year: '2013',
      title: 'Uttarakhand Flash Floods ⛰️',
      impact: 'Heavy rains caused devastating floods and landslides; Kedarnath badly hit.',
      lesson: 'The importance of preparedness in vulnerable regions with reliable evacuation planning.',
      marker: '📍',
    },
    {
      year: '2018',
      title: 'Kerala Floods 🌧️',
      impact: 'Unprecedented monsoon floods submerged large areas; 400+ lives lost, lakhs displaced.',
      lesson: 'The power of a prepared and connected community in reducing damage.',
      marker: '📍',
    },
    {
      year: '2020',
      title: 'Cyclone Amphan 🌪️',
      impact: 'Bengal & Odisha severely hit; billions in losses; widespread displacement.',
      lesson: 'Stronger coastal preparedness supported by real-time alerts and resilient infrastructure.',
      marker: '📍',
    },
    {
      year: '2021',
      title: 'COVID-19 Pandemic 🦠',
      impact: 'Nationwide health crisis with millions affected.',
      lesson: 'Preparedness for biological and health emergencies is as vital as natural disasters.',
      marker: '📍',
    },
  ]

  return (
    <section id="evolution" className="relative isolate overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-extrabold tracking-wide text-cyan-300 md:text-3xl">EVOLUTION TIMELINE</h2>
        <div className="mx-auto mb-10 h-1 w-24 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />

        <div className="relative">
          {/* Center line */}
          <div className="pointer-events-none absolute left-1/2 top-0 -ml-px h-full w-0.5 bg-gradient-to-b from-fuchsia-400/70 via-white/60 to-cyan-400/70" />

          <div className="space-y-10">
            {items.map((it, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={`${it.year}-${it.title}`} className="relative grid items-stretch gap-6 md:grid-cols-2">
                  {isLeft ? (
                    <div className="md:pr-10">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white/90">{it.year}</div>
                        <div className="text-lg font-bold">{it.title}</div>
                        <p className="mt-2 text-sm text-white/80"><span className="font-semibold">Impact:</span> {it.impact}</p>
                        <p className="text-sm text-white/80"><span className="font-semibold">Lesson:</span> {it.lesson}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}

                  {/* Marker */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -ml-2 -translate-y-1/2 transform">
                    <div className="h-4 w-4 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                  </div>

                  {!isLeft ? (
                    <div className="md:pl-10">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white/90">{it.year}</div>
                        <div className="text-lg font-bold">{it.title}</div>
                        <p className="mt-2 text-sm text-white/80"><span className="font-semibold">Impact:</span> {it.impact}</p>
                        <p className="text-sm text-white/80"><span className="font-semibold">Lesson:</span> {it.lesson}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="text-white/90">“History has taught us the cost of being unprepared. The future doesn’t have to repeat the past.”</div>
            <Link to="/register" className="mt-4 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white shadow hover:opacity-90">
              Register to Get Prepared
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Map placeholder removed; embedding the real LiveMap below

function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-neutral-200 bg-white py-10 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-brand">AlertHub</div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            A disaster preparedness and awareness platform designed for everyone.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Quick Links</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/">Home</Link></li>
            <li><a href="#disasters">About</a></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="relative">
          <div className="text-sm font-semibold">Need help?</div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Start a chat with our assistant.</p>
          <button className="fixed bottom-6 right-6 rounded-full bg-brand px-5 py-3 font-semibold text-white shadow-lg hover:opacity-90">
            Chat
          </button>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen isolate text-neutral-100">
      {/* Global neon background like reference */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#1a1240] via-[#2a0a52] to-[#3a0a40]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(80rem_50rem_at_50%_-10%,black,transparent)]">
        <div className="absolute -left-24 top-24 h-72 w-72 rotate-12 rounded-2xl border border-white/10" />
        <div className="absolute right-24 top-64 h-16 w-16 rounded-full border border-white/10" />
      </div>

      <Navbar />
      <main className="relative z-10 pt-28 md:pt-32">
        <Hero />
        <Disasters />
        <Process />
        <History />
        <LiveMap />
      </main>
      <Footer />
    </div>
  )
}
