/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../lib/api'

const roles = ['student','teacher','parent','institution','authority']

export default function Register() {
  const [role, setRole] = useState('student')
  const [base, setBase] = useState({ full_name: '', password: '', confirm: '', location: '' })
  const [fields, setFields] = useState({})
  const nav = useNavigate()

  // Password rule checks for live feedback
  const pwd = base.password || ''
  const hasLen = pwd.length >= 8
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNum = /\d/.test(pwd)
  const hasSpec = /[@$!%*?&]/.test(pwd)

  // Full name rule checks for live feedback
  const full = (base.full_name || '').trim()
  const nameNonEmpty = full.length > 0
  const nameOnlyLettersSpaces = /^[a-zA-Z\s]+$/.test(full)

  const rightTitle = 'Create an Account'
  const rightSubtitle = 'Join AlertHub and stay prepared.'

  const roleFields = useMemo(() => ({
    student: [
      ['username','Username'],
      ['school_name','School Name'],
      ['parent_contact','Parent Contact'],
    ],
    teacher: [
      ['email','Email'],
      ['school_name','School Name'],
      ['subjects','Subjects/Grades Taught'],
    ],
    parent: [
      ['email_or_phone','Email/Phone'],
      ['linked_student_code','Linked Student Code (optional)'],
    ],
    institution: [
      ['institution_name','Institution Name'],
      ['institution_type','Type'],
      ['admin_name','Admin Name'],
      ['official_email','Official Email'],
      ['staff_students_count','Staff/Students Count'],
    ],
    authority: [
      ['department_name','Department Name'],
      ['official_email','Official Email'],
      ['verification_code','Verification Code'],
    ],
  }), [])

  function change(k, v) { setFields((s) => ({ ...s, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    const nameRe = /^[a-zA-Z\s]+$/
    const userRe = /^[a-zA-Z0-9_]{3,20}$/
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRe = /^(?:\+91)?[6-9]\d{9}$/
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    // Full name
    if (!base.full_name.trim() || !nameRe.test(base.full_name.trim())) {
      toast.error('Please enter a valid full name (letters and spaces only)')
      return
    }
    // Passwords
    if (base.password !== base.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (!strongPw.test(base.password)) {
      toast.error('Password must be 8+ chars with upper, lower, number, and special character')
      return
    }

    // Identifier validation by role
    if (role === 'student') {
      if (!fields.username?.trim() || !userRe.test(fields.username.trim())) {
        toast.error('Please enter a valid username (3-20 letters, numbers, underscores)')
        return
      }
    } else if (role === 'teacher') {
      if (!fields.email?.trim() || !emailRe.test(fields.email.trim())) {
        toast.error('Please enter a valid email')
        return
      }
    } else if (role === 'parent') {
      const v = fields.email_or_phone?.trim()
      if (!v) { toast.error('Please enter email or phone'); return }
      const ok = v.includes('@') ? emailRe.test(v) : phoneRe.test(v)
      if (!ok) { toast.error('Please enter a valid email or Indian phone (+91 optional)'); return }
    } else if (role === 'institution') {
      if (!fields.official_email?.trim() || !emailRe.test(fields.official_email.trim())) {
        toast.error('Please enter a valid official email')
        return
      }
    } else if (role === 'authority') {
      if (!fields.official_email?.trim() || !emailRe.test(fields.official_email.trim())) {
        toast.error('Please enter a valid official email')
        return
      }
    }
  const extra_data = { role_specific: fields, location: base.location }
    const payload = {
      full_name: base.full_name,
      role,
      password: base.password,
      username: fields.username,
      email: fields.email || fields.official_email || (fields.email_or_phone?.includes('@') ? fields.email_or_phone : undefined),
      phone: fields.phone || (!fields.email_or_phone?.includes('@') ? fields.email_or_phone : undefined),
      extra_data,
    }
    try {
      const { user } = await registerUser(payload)
      toast.success('Account created')
      const pathByRole = { student: '/student', teacher: '/teacher', parent: '/parent', institution: '/institution', authority: '/authority' }
      nav(pathByRole[role] || '/')
    } catch (err) {
      console.error('Register failed:', err)
      toast.error(err?.message || 'Registration failed')
    }
  }

  return (
    <div className="relative min-h-screen isolate text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#1a1240] via-[#2a0a52] to-[#3a0a40]" />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
        <div className="grid gap-6">
          {/* Form card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold">{rightTitle}</h2>
            <p className="mt-1 text-sm text-white/80">{rightSubtitle}</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input label="Full Name" value={base.full_name} onChange={(e) => setBase({ ...base, full_name: e.target.value })} />
                  <div className="mt-1 rounded-lg border border-white/15 bg-white/10 p-3 text-xs">
                    <div className="font-semibold text-white/90">Full name rules</div>
                    <ul className="mt-1 list-disc pl-5">
                      <li className={nameNonEmpty ? 'text-green-300' : 'text-red-300'}>Cannot be empty</li>
                      <li className={nameOnlyLettersSpaces ? 'text-green-300' : 'text-red-300'}>Only letters and spaces</li>
                    </ul>
                  </div>
                </div>
                <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    type="password"
                    label={'Password'}
                    value={base.password}
                    onChange={(e) => setBase({ ...base, password: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    label="Confirm Password"
                    value={base.confirm}
                    onChange={(e) => setBase({ ...base, confirm: e.target.value })}
                  />
                  {base.confirm && base.password !== base.confirm && (
                    <div className="mt-1 text-xs text-red-300">not matches</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="mt-1 rounded-lg border border-white/15 bg-white/10 p-3 text-xs">
                    <div className="font-semibold text-white/90">Password rules</div>
                    <ul className="mt-1 list-disc pl-5">
                      <li className={hasLen ? 'text-green-300' : 'text-red-300'}>At least 8 characters</li>
                      <li className={(hasUpper && hasLower) ? 'text-green-300' : 'text-red-300'}>At least one uppercase and one lowercase letter</li>
                      <li className={hasNum ? 'text-green-300' : 'text-red-300'}>At least one number</li>
                      <li className={hasSpec ? 'text-green-300' : 'text-red-300'}>At least one special character (@ $ ! % * ? &)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <Input label="Location" value={base.location} onChange={(e) => setBase({ ...base, location: e.target.value })} />
              </div>
              <div className="grid gap-4">
                {roleFields[role].map(([k, lbl]) => (
                  <Input key={k} label={lbl} value={fields[k] || ''} onChange={(e) => change(k, e.target.value)} />
                ))}
              </div>
              <div className="pt-2">
                <Button type="submit">Register →</Button>
              </div>
              <p className="pt-1 text-xs text-white/80">Already have an account? <Link to="/login" className="underline-offset-2 hover:underline">Login here</Link></p>
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
