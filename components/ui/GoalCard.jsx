'use client'
import { formatCurrency, getPct, daysUntil } from '@/lib/formatters'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GoalCard({ goal, onClick, showAddButton = false, onAddSavings }) {
  const currentAmt = goal.current_amount || goal.saved_amount || 0
  const pct = getPct(currentAmt, goal.target_amount)
  const deadline = goal.deadline || goal.target_date
  const days = deadline ? daysUntil(deadline) : null
  const remaining = Number(goal.target_amount) - Number(currentAmt)

  const ringSize = 48
  const radius = (ringSize - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const progressColor = pct >= 100 ? '#10B981' : pct >= 75 ? '#34D399' : pct >= 40 ? '#818CF8' : '#F59E0B'
  const progressBgClass = pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-emerald-400' : pct >= 40 ? 'bg-indigo-400' : 'bg-amber-400'

  return (
    <motion.div 
      layout
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {goal.emoji || goal.icon || '🎯'}
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{goal.name}</h3>
            {days !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium mt-1 ${days < 30 ? 'text-rose-400' : 'text-slate-500'}`}>
                <Calendar size={12} />
                {days > 0 ? `${days} days left` : days === 0 ? 'Due today!' : `${Math.abs(days)} days overdue`}
              </div>
            )}
          </div>
        </div>
        
        {/* Mini circular progress */}
        <div className="relative flex-shrink-0">
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" className="stroke-slate-800" strokeWidth={6} />
            <motion.circle
              cx={ringSize/2} cy={ringSize/2} r={radius}
              fill="none" stroke={progressColor} strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
            {pct}%
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-xl font-bold text-slate-100">{formatCurrency(currentAmt)}</div>
          <div className="text-xs font-medium text-slate-500">of {formatCurrency(goal.target_amount)}</div>
        </div>
      </div>

      {/* Linear Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
        <motion.div 
          className={`h-full ${progressBgClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
        <span className="text-xs font-medium text-slate-500">
          <span className="text-slate-300">{formatCurrency(remaining)}</span> remaining
        </span>
        {showAddButton && onAddSavings && (
          <button
            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onAddSavings(goal); }}
          >
            + Add Funds
          </button>
        )}
      </div>
    </motion.div>
  )
}
