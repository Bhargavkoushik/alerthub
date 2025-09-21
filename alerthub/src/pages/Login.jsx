/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { loginLocal } from '../lib/localAuth'

const roles = ['student','teacher','parent','institution','authority']

export default function Login() {
  const [role, setRole] = useState('student')
  const [identity, setIdentity] = useState({ username: '', email: '', phone: '' })
  const [password, setPassword] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()


  const idMeta = useMemo(() => {
    if (role === 'student') return { key: 'username', label: 'Username' }
    if (role === 'authority') return { key: 'email', label: 'Email' }
    return { key: 'email_or_phone', label: 'Email/Phone' }
  }, [role])

  async function submit(e) {
    e.preventDefault()
    setError('')
    let payload = { role, password: otpMode ? undefined : password, verificationCode: role === 'authority' ? verificationCode : undefined }
    if (idMeta.key === 'username') payload.username = identity.username
    else if (idMeta.key === 'email') payload.email = identity.email
    else {
      const id = identity.email || identity.phone
      if (id?.includes('@')) payload.email = id; else payload.phone = id
    }
    try {
  loginLocal(payload)
      toast.success('Login successful')
      const pathByRole = { student: '/student', teacher: '/teacher', parent: '/parent', institution: '/institution', authority: '/authority' }
      nav(pathByRole[role] || '/')
    } catch (err) {
      console.error('Login (local) failed:', err)
      setError(err?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="relative min-h-screen isolate text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#1a1240] via-[#2a0a52] to-[#3a0a40]" />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
        <div className="grid gap-6">
          {/* Form card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold">AlertHub Login</h2>
            <p className="mt-1 text-sm text-white/80">Stay safe. Stay prepared.</p>
            {error && (
              <div className="mt-3 rounded-md border border-red-400 bg-red-500/20 px-3 py-2 text-xs text-red-100">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
              </Select>

              {idMeta.key === 'username' && (
                <Input label="Username" value={identity.username} onChange={(e) => setIdentity({ ...identity, username: e.target.value })} />
              )}
              {idMeta.key === 'email' && (
                <Input type="email" label="Email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} />
              )}
              {idMeta.key === 'email_or_phone' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input type="email" label="Email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} />
                  <Input type="tel" label="Phone" value={identity.phone} onChange={(e) => setIdentity({ ...identity, phone: e.target.value })} />
                </div>
              )}

              {!otpMode ? (
                <Input type="password" label={role === 'student' ? 'PIN' : 'Password'} value={password} onChange={(e) => setPassword(e.target.value)} />
              ) : (
                <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              )}

              {role === 'authority' && (
                <Input label="Verification Code (optional)" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-white/80">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-brand" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember Me</span>
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <button type="button" className="underline-offset-2 hover:underline" onClick={() => toast('Reset link sent (demo)')}>Forgot Password?</button>
                  <button type="button" className="underline-offset-2 hover:underline" onClick={() => setOtpMode((s) => !s)}>{otpMode ? 'Use Password' : 'Login with OTP'}</button>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit">Login →</Button>
              </div>
              <p className="pt-1 text-xs text-white/80">
                Don’t have an account? <Link to="/register" className="underline-offset-2 hover:underline">Create one here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({ label, className = '', ...rest }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-xs text-white/80">{label}</div>
      <input {...rest} className={`w-full rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 shadow-inner outline-none backdrop-blur focus:border-white/30 focus:bg-white/20 ${className}`} />
    </label>
  )
}

function Select({ label, children, className = '', ...rest }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-xs text-white/80">{label}</div>
      <select {...rest} className={`w-full rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white shadow-inner outline-none backdrop-blur focus:border-white/30 focus:bg-white/20 ${className}`}>{children}</select>
    </label>
  )
}

function Button({ className = '', ...rest }) {
  return <button {...rest} className={`inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 ${className}`} />
}
