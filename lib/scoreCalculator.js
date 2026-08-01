/**
 * Financial Health Score Calculator
 * Scores each of 5 dimensions and returns a composite 0-100 score
 */

/**
 * Calculate savings rate score (0-25)
 * Ideal: 20%+ savings rate
 */
function calcSavingsScore(monthlyIncome, totalFixedExpenses, transactions = []) {
  if (!monthlyIncome || monthlyIncome === 0) return 0
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date?.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = totalFixedExpenses + monthExpenses
  const savingsRate = Math.max(0, (monthlyIncome - totalExpenses) / monthlyIncome)
  if (savingsRate >= 0.30) return 25
  if (savingsRate >= 0.20) return 20
  if (savingsRate >= 0.10) return 14
  if (savingsRate >= 0.05) return 8
  return 2
}

/**
 * Calculate debt health score (0-25)
 * Ideal: Debt-to-income ratio under 30%
 */
function calcDebtScore(monthlyIncome, debts = []) {
  if (!monthlyIncome || monthlyIncome === 0) return 12
  if (!debts || debts.length === 0) return 25
  const totalEMI = debts.reduce((sum, d) => sum + Number(d.emi_amount || 0), 0)
  const dtiRatio = totalEMI / monthlyIncome
  if (dtiRatio === 0) return 25
  if (dtiRatio <= 0.10) return 23
  if (dtiRatio <= 0.20) return 18
  if (dtiRatio <= 0.30) return 13
  if (dtiRatio <= 0.50) return 7
  return 2
}

/**
 * Calculate emergency fund score (0-20)
 * Ideal: 6 months of expenses covered
 */
function calcEmergencyScore(goals = [], monthlyExpenses) {
  const emergencyGoal = goals.find(
    g => g.name?.toLowerCase().includes('emergency')
  )
  if (!emergencyGoal) return 5
  if (!monthlyExpenses || monthlyExpenses === 0) return 10
  const monthsCovered = emergencyGoal.saved_amount / monthlyExpenses
  if (monthsCovered >= 6) return 20
  if (monthsCovered >= 3) return 14
  if (monthsCovered >= 1) return 8
  if (monthsCovered > 0) return 4
  return 1
}

/**
 * Calculate goal progress score (0-20)
 */
function calcGoalScore(goals = []) {
  const activeGoals = goals.filter(g => g.status === 'active')
  if (!activeGoals || activeGoals.length === 0) return 8
  const avgProgress = activeGoals.reduce((sum, g) => {
    const pct = g.target_amount > 0
      ? (g.saved_amount / g.target_amount) * 100
      : 0
    return sum + pct
  }, 0) / activeGoals.length
  if (avgProgress >= 75) return 20
  if (avgProgress >= 50) return 15
  if (avgProgress >= 25) return 10
  if (avgProgress >= 10) return 6
  return 3
}

/**
 * Calculate spending control score (0-10)
 */
function calcSpendingScore(budgets = []) {
  if (!budgets || budgets.length === 0) return 5
  const overBudget = budgets.filter(b => Number(b.spent_amount) > Number(b.allocated_amount))
  const ratio = overBudget.length / budgets.length
  if (ratio === 0) return 10
  if (ratio <= 0.1) return 8
  if (ratio <= 0.25) return 6
  if (ratio <= 0.5) return 3
  return 1
}

/**
 * Main score calculator
 */
export function calculateHealthScore({ profile, debts, goals, transactions, budgets }) {
  const monthlyIncome = Number(profile?.monthly_income || 0)
  const fixedExpenses = Number(profile?.total_fixed_expenses || 0)
  const monthlyExpenses = fixedExpenses +
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) / Math.max(1, 3)

  const savingsScore = calcSavingsScore(monthlyIncome, fixedExpenses, transactions)
  const debtScore = calcDebtScore(monthlyIncome, debts)
  const emergencyScore = calcEmergencyScore(goals, monthlyExpenses)
  const goalScore = calcGoalScore(goals)
  const spendingScore = calcSpendingScore(budgets)

  const total = savingsScore + debtScore + emergencyScore + goalScore + spendingScore

  return {
    total: Math.min(100, Math.max(0, total)),
    dimensions: {
      savings: { score: savingsScore, max: 25, label: 'Savings Rate' },
      debt: { score: debtScore, max: 25, label: 'Debt Health' },
      emergency: { score: emergencyScore, max: 20, label: 'Emergency Fund' },
      goals: { score: goalScore, max: 20, label: 'Goal Progress' },
      spending: { score: spendingScore, max: 10, label: 'Spending Control' },
    },
  }
}
