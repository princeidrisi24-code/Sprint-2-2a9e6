'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          // Create profile
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: name,
            onboarding_complete: false,
            financial_health_score: 0,
          })
          window.location.href = '/onboarding'
        } else {
          setMessage('Check your email to confirm your account!')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Check onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single()
        window.location.href = profile?.onboarding_complete ? '/dashboard' : '/onboarding'
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-primary)',
    }}>

      {/* Left Panel — Brand */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.08) 100%)',
        borderRight: '1px solid var(--bg-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', boxShadow: 'var(--shadow-glow-primary)',
            }}>💸</div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem' }}>FinMentor AI</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            Build wealth,<br />
            <span style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              one habit at a time.
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '48px', maxWidth: '380px' }}>
            Your AI-powered finance mentor that understands your real situation and guides you with personalized, actionable steps.
          </p>

          {/* Feature list */}
          {[{
            icon: <TrendingUp size={18} />, color: 'var(--color-accent)',
            text: 'Dynamic Financial Health Score',
          }, {
            icon: <Zap size={18} />, color: 'var(--color-primary-light)',
            text: 'Weekly AI-powered Money Nudges',
          }, {
            icon: <Shield size={18} />, color: 'var(--color-warning)',
            text: 'Bank-grade data security',
          }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: `${item.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color, flexShrink: 0,
              }}>{item.icon}</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', gap: '4px',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            padding: '4px', marginBottom: '32px',
            border: '1px solid var(--bg-border)',
          }}>
            {['signin', 'signup'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  background: mode === m ? 'var(--color-primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >{m === 'signin' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>
            {mode === 'signin' ? 'Welcome back 👋' : 'Start your journey 🚀'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create your free account today'}
          </p>

          {/* Google OAuth */}
          <button
            className="btn btn-ghost w-full"
            style={{ marginBottom: '20px', gap: '12px', fontSize: '0.95rem' }}
            onClick={handleGoogleAuth}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" type="text" placeholder="Riya Sharma" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="riya@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-danger-glow)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-danger)', fontSize: '0.875rem',
              }}>{error}</div>
            )}
            {message && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-glow)', border: '1px solid rgba(16,185,129,0.3)',
                color: 'var(--color-accent)', fontSize: '0.875rem',
              }}>{message}</div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signin' && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                Sign up free
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="borderRight"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
