'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import { LIFE_STAGES } from '@/lib/formatters'
import { LogOut, Save, User, Briefcase, Mail, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState({
    full_name: '',
    life_stage: '',
    monthly_income: '',
    income_type: 'stable'
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUserId(session.user.id)
      setEmail(session.user.email)

      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          life_stage: data.life_stage || '',
          monthly_income: data.monthly_income || '',
          income_type: data.income_type || 'stable'
        })
      }
      setLoading(false)
    }
    loadSession()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        life_stage: profile.life_stage,
        monthly_income: profile.monthly_income,
        income_type: profile.income_type
      }).eq('id', userId)

      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="text-muted">Loading settings...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>Settings</h1>

        <div style={{ display: 'grid', gap: '32px' }}>
          
          {/* Profile Section */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} className="text-primary" /> Profile Information
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              </div>

              <div className="input-group">
                <label className="input-label">Life Stage</label>
                <select className="input" value={profile.life_stage} onChange={e => setProfile({...profile, life_stage: e.target.value})}>
                  <option value="">Select Stage</option>
                  {Object.entries(LIFE_STAGES || {}).map(([key, stage]) => (
                    <option key={key} value={key}>{stage.emoji} {stage.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Monthly Income (₹)</label>
                  <input className="input" type="number" value={profile.monthly_income} onChange={e => setProfile({...profile, monthly_income: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Income Type</label>
                  <select className="input" value={profile.income_type} onChange={e => setProfile({...profile, income_type: e.target.value})}>
                    <option value="stable">Stable (Salary)</option>
                    <option value="variable">Variable (Freelance/Business)</option>
                  </select>
                </div>
              </div>

              {message.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: message.type === 'error' ? 'var(--color-danger-glow)' : 'var(--color-accent-glow)',
                  border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  color: message.type === 'error' ? 'var(--color-danger)' : 'var(--color-accent)',
                  fontSize: '0.875rem'
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} className="text-primary" /> Account
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Email Address</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{email}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* About Section */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={20} className="text-primary" /> About
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <span style={{ fontWeight: 500 }}>App Version</span>
              <span style={{ color: 'var(--text-muted)' }}>1.0.0 (Beta)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>Privacy Policy</span>
              <a href="#" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 600 }}>View Policy</a>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
