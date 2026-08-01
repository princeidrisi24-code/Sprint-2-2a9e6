import { formatCurrency, getPct } from '@/lib/formatters'

export default function DebtCard({ debt, priority }) {
  const paidOff = Number(debt.principal) - Number(debt.remaining_balance)
  const pct = getPct(paidOff, debt.principal)
  const isHighInterest = Number(debt.interest_rate) > 20

  const debtTypeIcons = {
    credit_card: '💳',
    personal_loan: '🏦',
    home_loan: '🏠',
    car_loan: '🚗',
    other: '📋',
  }

  return (
    <div className="debt-card">
      <div className="debt-priority">{priority}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1.4rem' }}>{debtTypeIcons[debt.type] || '📋'}</span>
        <h3 className="debt-name">{debt.name}</h3>
      </div>
      <p className="debt-type" style={{ textTransform: 'capitalize' }}>{debt.type?.replace(/_/g, ' ')}</p>

      <div className="debt-stats">
        <div>
          <div className="debt-stat-label">Balance</div>
          <div className="debt-stat-value" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(debt.remaining_balance)}
          </div>
        </div>
        <div>
          <div className="debt-stat-label">Interest</div>
          <div className="debt-stat-value" style={{ color: isHighInterest ? 'var(--color-danger)' : 'var(--color-warning)' }}>
            {debt.interest_rate}%
          </div>
        </div>
        <div>
          <div className="debt-stat-label">EMI</div>
          <div className="debt-stat-value">{formatCurrency(debt.emi_amount)}/mo</div>
        </div>
      </div>

      <div className="progress-track" style={{ marginBottom: '8px' }}>
        <div className="progress-fill accent" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>{pct}% paid off</span>
        <span>{formatCurrency(paidOff)} repaid</span>
      </div>
    </div>
  )
}
