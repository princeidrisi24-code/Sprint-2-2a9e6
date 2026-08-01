import { formatCurrency, getPct } from '@/lib/formatters'
import { EXPENSE_CATEGORIES } from '@/lib/formatters'

export default function BudgetBar({ budget, onClick }) {
  const pct = getPct(budget.spent_amount, budget.allocated_amount)
  const isOver = Number(budget.spent_amount) > Number(budget.allocated_amount)
  const catInfo = EXPENSE_CATEGORIES.find(c => c.value === budget.category) || EXPENSE_CATEGORIES.find(c => c.value === 'other')

  const barColor = pct >= 100 ? 'var(--color-danger)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-accent)'

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--bg-card)',
        border: `1px solid ${isOver ? 'rgba(239,68,68,0.3)' : 'var(--bg-border)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>{catInfo?.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              {catInfo?.label || budget.category}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.allocated_amount)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: barColor }}>
            {pct}%
          </span>
          {isOver && (
            <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 600 }}>
              Over by {formatCurrency(budget.spent_amount - budget.allocated_amount)}
            </div>
          )}
        </div>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  )
}
