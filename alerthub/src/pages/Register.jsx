import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { registerLocal } from '../lib/localAuth'

const roles = ['student','teacher','parent','institution','authority']

export default function Register() {
  const [role, setRole] = useState('student')
  const [base, setBase] = useState({ full_name: '', password: '', confirm: '', location: '' })
  const [fields, setFields] = useState({})

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
    if (!base.full_name || !base.password || base.password !== base.confirm) {
      toast.error('Please fill required fields and confirm password')
      return
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
      const { user } = registerLocal(payload)
      toast.success('Registration successful')
      console.log('Registered (local):', user)
    } catch (err) {
      console.error('Register (local) failed:', err)
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
                <Input label="Full Name" value={base.full_name} onChange={(e) => setBase({ ...base, full_name: e.target.value })} />
                <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input type="password" label={role === 'student' ? 'PIN' : 'Password'} value={base.password} onChange={(e) => setBase({ ...base, password: e.target.value })} />
                <Input type="password" label="Confirm Password" value={base.confirm} onChange={(e) => setBase({ ...base, confirm: e.target.value })} />
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
              <p className="pt-1 text-xs text-white/80">Already have an account? <a className="underline-offset-2 hover:underline" onClick={() => (window.location.href = '/login')}>Login here</a></p>
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
