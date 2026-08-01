'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PiggyBank, Target, CreditCard, MessageSquare, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/budget', icon: PiggyBank, label: 'Budget' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/debt', icon: CreditCard, label: 'Debt' },
  { href: '/mentor', icon: MessageSquare, label: 'Mentor' },
  { href: '/insights', icon: BarChart2, label: 'Insights' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center justify-center py-2 relative">
                <Icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active" 
                    className="absolute -top-2 w-8 h-1 bg-indigo-500 rounded-b-full"
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
