/* eslint-disable react/prop-types */
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'institution', label: 'Institution' },
  { value: 'authority', label: 'Authority' },
]

function getRegisterContactMeta(role) {
  // Dynamic contact field based on role
  switch (role) {
    case 'student':
    case 'parent':
      return { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' }
    case 'teacher':
    case 'institution':
      return { key: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' }
    case 'authority':
      return { key: 'email', label: 'Official Email', type: 'email', placeholder: 'name@gov.example' }
    default:
      return { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' }
  }
}

function getLoginIdentityMeta(role) {
  // Dynamic username/id based on role
  switch (role) {
    case 'student':
      return { key: 'phone', label: 'Phone (or Student ID)', type: 'text', placeholder: '+91 98765 43210 or ID' }
    case 'parent':
      return { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' }
    case 'teacher':
    case 'institution':
      return { key: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' }
    case 'authority':
      return { key: 'email', label: 'Official Email (or Phone)', type: 'text', placeholder: 'name@gov.example or +91…' }
    default:
      return { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' }
  }
}

function getSecretLabel(role) {
  return role === 'student' || role === 'parent' ? 'PIN' : 'Password'
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-white/90">{label}</div>
      {children}
    </label>
  )
}

const TextInput = forwardRef(function TextInputInner(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 shadow-inner outline-none backdrop-blur transition focus:border-white/30 focus:bg-white/20 ${props.className || ''}`}
    />
  )
})

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-white/15 px-3 py-2 text-sm text-white shadow-inner outline-none backdrop-blur transition focus:border-white/30 focus:bg-white/20 ${props.className || ''}`}
    >
      {props.children}
    </select>
  )
}

function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 ${className}`}
    >
      {children}
    </button>
  )
}

function GhostLinkButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`text-xs font-medium text-white/80 underline-offset-2 hover:underline ${className}`}
    >
      {children}
    </button>
  )
}

function Card({ title, subtitle, children, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      <div className="relative">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-white/80">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

function RegisterForm({ onFocusLogin, autoFocusFirst = false }) {
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (autoFocusFirst && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [autoFocusFirst])

  const contactMeta = useMemo(() => getRegisterContactMeta(role), [role])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!contact.trim()) return setError(`Please enter your ${contactMeta.key}.`)
    if (!password) return setError('Please set a password/PIN.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    // No backend yet
    // eslint-disable-next-line no-console
    console.log('Register submit', { fullName, role, [contactMeta.key]: contact, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}
      <Field label="Full Name">
        <TextInput
          ref={firstInputRef}
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label="Role">
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r.value} value={r.value} className="bg-neutral-900">
              {r.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={contactMeta.label}>
        <TextInput
          type={contactMeta.type}
          placeholder={contactMeta.placeholder}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          autoComplete={contactMeta.key === 'email' ? 'email' : 'tel'}
          inputMode={contactMeta.key === 'email' ? undefined : 'tel'}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password">
          <TextInput
            type="password"
            placeholder="Enter password/PIN"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm Password">
          <TextInput
            type="password"
            placeholder="Re-enter password/PIN"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <PrimaryButton type="submit">Register →</PrimaryButton>
        <GhostLinkButton type="button" onClick={onFocusLogin}>
          Already have an account? Login here
        </GhostLinkButton>
      </div>
    </form>
  )
}

function LoginForm({ onFocusRegister, autoFocusFirst = false }) {
  const [role, setRole] = useState('student')
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (autoFocusFirst && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [autoFocusFirst])

  const idMeta = useMemo(() => getLoginIdentityMeta(role), [role])
  const secretLabel = useMemo(() => getSecretLabel(role), [role])

  function handleSendOtp() {
    if (!identity.trim()) return setError('Enter your email/phone to receive an OTP.')
    setError('')
    // eslint-disable-next-line no-console
    console.log('Send OTP to', identity)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!identity.trim()) return setError('Please enter your login identifier.')
    if (otpMode && !otp.trim()) return setError('Please enter the OTP sent to you.')
    if (!otpMode && !password) return setError(`Please enter your ${secretLabel}.`)
    // No backend yet
    // eslint-disable-next-line no-console
    console.log('Login submit', { role, [idMeta.key]: identity, password: otpMode ? undefined : password, otp: otpMode ? otp : undefined, verificationCode: role === 'authority' ? verificationCode : undefined, remember })
  }

  function switchRole() {
    const idx = roles.findIndex((r) => r.value === role)
    const next = roles[(idx + 1) % roles.length].value
    setRole(next)
  }

  const showVerification = role === 'authority'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}
      <Field label="Role">
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r.value} value={r.value} className="bg-neutral-900">
              {r.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={idMeta.label}>
        <TextInput
          ref={firstInputRef}
          type={idMeta.type}
          placeholder={idMeta.placeholder}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          autoComplete={idMeta.key === 'email' ? 'email' : 'tel'}
        />
      </Field>

      {otpMode ? (
        <Field label="One-Time Password (OTP)">
          <TextInput
            type="text"
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
          />
        </Field>
      ) : (
        <Field label={secretLabel}>
          <TextInput
            type="password"
            placeholder={`Enter your ${secretLabel.toLowerCase()}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
      )}

      {showVerification && (
        <Field label="Verification Code (optional)">
          <TextInput
            type="text"
            placeholder="Enter your authority verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </Field>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-brand focus:ring-white/30"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          {' '}
          <span>Remember Me</span>
        </label>
        <div className="flex items-center gap-3">
          <GhostLinkButton type="button" onClick={() => console.log('Forgot Password clicked')}>
            Forgot Password?
          </GhostLinkButton>
          <GhostLinkButton type="button" onClick={switchRole}>
            Switch Role
          </GhostLinkButton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PrimaryButton type="submit">Login →</PrimaryButton>
          {otpMode ? (
            <GhostLinkButton type="button" onClick={() => setOtpMode(false)}>
              Use Password instead
            </GhostLinkButton>
          ) : (
            <GhostLinkButton type="button" onClick={() => setOtpMode(true)}>
              Login with OTP
            </GhostLinkButton>
          )}
        </div>
        {!otpMode && (
          <GhostLinkButton type="button" onClick={handleSendOtp}>
            Send OTP
          </GhostLinkButton>
        )}
      </div>

      <div className="pt-2">
        <GhostLinkButton type="button" onClick={onFocusRegister}>
          Don’t have an account? Register here
        </GhostLinkButton>
      </div>
    </form>
  )
}

export default function AuthPage() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const [showRegister, setShowRegister] = useState(false)

  const focusRight = () => {
    if (rightRef.current) rightRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Focus first interactive element on the right card
    setTimeout(() => {
      const el = rightRef.current?.querySelector('input, select, button')
      el?.focus()
    }, 250)
  }

  const focusLeft = () => {
    if (leftRef.current) leftRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      const el = leftRef.current?.querySelector('input, select, button')
      el?.focus()
    }, 250)
  }

  const openRegister = () => {
    setShowRegister(true)
    // After expanding, scroll/focus into the register form
    focusLeft()
  }

  return (
    <div className="relative min-h-screen isolate text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#1a1240] via-[#2a0a52] to-[#3a0a40]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(90rem_60rem_at_50%_-10%,black,transparent)]">
        <div className="absolute -left-24 top-24 h-72 w-72 rotate-12 rounded-2xl border border-white/10" />
        <div className="absolute right-24 top-64 h-16 w-16 rounded-full border border-white/10" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">Welcome to AlertHub</h1>
          <p className="mt-1 text-sm text-white/80">Register or login to stay prepared.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            title="Create an Account"
            subtitle="Join AlertHub and stay prepared."
            cardRef={leftRef}
          >
            {showRegister ? (
              <RegisterForm onFocusLogin={focusRight} />
            ) : (
              <div className="text-sm text-white/85">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p>Don’t have an account?
                    {' '}
                    <GhostLinkButton type="button" onClick={openRegister}>
                      Register here
                    </GhostLinkButton>
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Login to AlertHub"
            subtitle="Stay safe. Stay prepared."
            cardRef={rightRef}
          >
            <LoginForm onFocusRegister={openRegister} />
          </Card>
        </div>
      </div>
    </div>
  )
}

// (PropTypes intentionally omitted; project disables react/prop-types)

