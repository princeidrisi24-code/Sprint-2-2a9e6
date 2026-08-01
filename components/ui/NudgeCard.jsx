'use client'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

const NUDGE_ICONS = {
  save: { emoji: '💰', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  spend_less: { emoji: '📉', bg: 'bg-rose-500/10', color: 'text-rose-400' },
  debt: { emoji: '💳', bg: 'bg-amber-500/10', color: 'text-amber-400' },
  invest: { emoji: '📈', bg: 'bg-indigo-500/10', color: 'text-indigo-400' },
  learn: { emoji: '🧠', bg: 'bg-purple-500/10', color: 'text-purple-400' },
}

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  stretch: 'text-rose-400',
}

export default function NudgeCard({ nudge, onComplete, onSkip }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(nudge.status === 'completed')
  const icon = NUDGE_ICONS[nudge.category] || NUDGE_ICONS.save

  const handleComplete = async () => {
    setLoading(true)
    try {
      await supabase
        .from('nudges')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', nudge.id)
      setDone(true)
      onComplete?.(nudge)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    await supabase.from('nudges').update({ status: 'skipped' }).eq('id', nudge.id)
    onSkip?.(nudge)
  }

  return (
    <motion.div 
      layout
      className={`bg-slate-900 border ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800'} rounded-2xl p-5 flex gap-4 transition-all`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${icon.bg}`}>
        {icon.emoji}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <p className="font-semibold text-slate-200">{nudge.title}</p>
          <span className={`text-xs font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[nudge.difficulty]}`}>
            {nudge.difficulty}
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          {nudge.description}
        </p>
        {nudge.impact_text && (
          <p className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-4">
            <span>⚡</span> {nudge.impact_text}
          </p>
        )}

        {/* Actions */}
        {!done && (
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              onClick={handleComplete}
              disabled={loading}
            >
              <Check size={16} />
              {loading ? 'Saving...' : 'Done!'}
            </button>
            <button
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              onClick={handleSkip}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {done && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 mt-2 text-emerald-400 text-sm font-bold"
          >
            <Check size={16} />
            Completed!
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
