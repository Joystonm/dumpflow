import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { Particles } from '../components/Particles'
import toast from 'react-hot-toast'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    if (error) { toast.error(error.message); setLoading(false) }
    else toast.success('Account created!')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <Particles />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-3xl p-8 w-full max-w-md mx-4 relative z-10"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">DumpFlow</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Create your dump zone</h1>
        <p className="text-muted text-sm mb-8">Free forever. No credit card needed.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { key: 'name', icon: User, placeholder: 'Full name', type: 'text' },
            { key: 'email', icon: Mail, placeholder: 'Email', type: 'email' },
            { key: 'password', icon: Lock, placeholder: 'Password (min 6 chars)', type: 'password' },
          ].map(({ key, icon: Icon, placeholder, type }) => (
            <div key={key} className="relative">
              <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={type} value={form[key]} onChange={set(key)}
                placeholder={placeholder} required minLength={key === 'password' ? 6 : undefined}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-muted outline-none focus:border-primary/60 transition-all"
              />
            </div>
          ))}

          <motion.button
            type="submit" disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
          >
            {loading ? (
              <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><span>Get Started</span><ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
