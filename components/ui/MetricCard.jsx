import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ title, label, value, change, changeLabel, icon, children }) {
  const isPositive = change > 0
  const isNegative = change < 0
  const displayTitle = title || label

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{displayTitle}</span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
            {icon}
          </div>
        )}
      </div>

      <div className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
        {value}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-500'}`}>
          {isPositive && <TrendingUp size={16} />}
          {isNegative && <TrendingDown size={16} />}
          <span>{changeLabel || `${isPositive ? '+' : ''}${change}`}</span>
        </div>
      )}

      {children}
    </div>
  )
}
