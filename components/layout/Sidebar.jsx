'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, PiggyBank, Target, CreditCard,
  MessageSquare, BarChart2, Settings, LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getInitials, getScoreLabel } from '@/lib/formatters'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/budget', icon: PiggyBank, label: 'Budget' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/debt', icon: CreditCard, label: 'Debt' },
  { href: '/mentor', icon: MessageSquare, label: 'AI Mentor' },
  { href: '/insights', icon: BarChart2, label: 'Insights' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [score, setScore] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, financial_health_score')
          .eq('id', user.id)
          .single()
        if (profile) {
          setUser(prev => ({ ...prev, full_name: profile.full_name }))
          setScore(profile.financial_health_score)
        }
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'You'

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-slate-950 border-r border-slate-800 p-6 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
          💸
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          FinMentor AI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
              {label}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full"
                />
              )}
            </Link>
          )
        })}

        <div className="pt-8">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Account
          </p>
          <Link 
            href="/settings" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/settings' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Settings size={18} className="text-slate-500" />
            Settings
          </Link>
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
          >
            <LogOut size={18} className="text-slate-500 hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* User Profile Chip */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-700">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">
              {score !== null ? (
                <span className={score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}>
                  Score: {score} · {getScoreLabel(score)}
                </span>
              ) : 'View profile →'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
