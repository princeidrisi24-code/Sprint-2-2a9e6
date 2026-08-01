/**
 * Nudge Engine — Generates personalized weekly action nudges
 * based on the user's financial profile
 */

export function generateNudges({ profile, debts = [], goals = [], budgets = [], transactions = [] }) {
  const nudges = []
  const monthlyIncome = Number(profile?.monthly_income || 0)

  // Find overspent categories
  const overspentCategories = budgets.filter(
    b => Number(b.spent_amount) > Number(b.allocated_amount)
  )

  // Find emergency fund goal
  const emergencyGoal = goals.find(g =>
    g.name?.toLowerCase().includes('emergency')
  )

  // Find highest interest debt
  const highInterestDebt = debts
    .filter(d => d.remaining_balance > 0)
    .sort((a, b) => Number(b.interest_rate) - Number(a.interest_rate))[0]

  // --- NUDGE 1: Overspending alert ---
  if (overspentCategories.length > 0) {
    const cat = overspentCategories[0]
    const overage = Number(cat.spent_amount) - Number(cat.allocated_amount)
    nudges.push({
      category: 'spend_less',
      difficulty: 'easy',
      title: `Cut back on ${cat.category}`,
      description: `You've gone ₹${Math.round(overage).toLocaleString('en-IN')} over budget on ${cat.category} this month. Try skipping 2–3 non-essential ${cat.category} purchases this week.`,
      impact_text: `Saves ~₹${Math.round(overage / 2).toLocaleString('en-IN')} and puts you back on track`,
    })
  }

  // --- NUDGE 2: Emergency Fund ---
  if (!emergencyGoal || Number(emergencyGoal.saved_amount) < monthlyIncome * 3) {
    const savingsTarget = 500
    nudges.push({
      category: 'save',
      difficulty: 'easy',
      title: `Add ₹${savingsTarget.toLocaleString('en-IN')} to your Emergency Fund`,
      description: `Emergency funds are your financial safety net. Even a small addition this week builds the habit and adds security.`,
      impact_text: `Moves your emergency fund ${emergencyGoal ? Math.round((savingsTarget / Number(emergencyGoal.target_amount)) * 100) : 1}% closer to target`,
    })
  }

  // --- NUDGE 3: High interest debt ---
  if (highInterestDebt && Number(highInterestDebt.interest_rate) > 15) {
    const extraPayment = Math.round(monthlyIncome * 0.02)
    nudges.push({
      category: 'debt',
      difficulty: 'medium',
      title: `Make an extra payment on your ${highInterestDebt.name}`,
      description: `Your ${highInterestDebt.name} has a ${highInterestDebt.interest_rate}% interest rate — paying even a little extra this week saves you significantly in the long run.`,
      impact_text: `An extra ₹${extraPayment.toLocaleString('en-IN')} payment saves you interest over time`,
    })
  }

  // --- NUDGE 4: Goal boost ---
  const topGoal = goals
    .filter(g => g.status === 'active' && g.name?.toLowerCase() !== 'emergency fund')
    .sort((a, b) => a.priority - b.priority)[0]

  if (topGoal) {
    const boost = Math.round(monthlyIncome * 0.01)
    nudges.push({
      category: 'save',
      difficulty: 'easy',
      title: `Boost your "${topGoal.name}" goal`,
      description: `Transfer a small amount to your ${topGoal.name} goal today. Consistent small contributions beat occasional large ones every time.`,
      impact_text: `₹${boost.toLocaleString('en-IN')} moves you ${topGoal.target_amount > 0 ? Math.round((boost / Number(topGoal.target_amount)) * 100) : 1}% closer`,
    })
  }

  // --- NUDGE 5: Learning nudge ---
  const learningNudges = [
    {
      category: 'learn',
      difficulty: 'easy',
      title: 'Learn about the 50/30/20 rule',
      description: '50% needs, 30% wants, 20% savings. This simple framework is one of the most effective budgeting methods. Spend 5 minutes applying it to your income today.',
      impact_text: 'Better budget framework = more consistent savings',
    },
    {
      category: 'learn',
      difficulty: 'easy',
      title: 'Understand compound interest',
      description: 'Investing ₹1,000/month at 12% annual returns gives you ₹10 lakhs in 20 years. Understanding this motivates consistent investing.',
      impact_text: 'Knowledge that could transform your financial future',
    },
    {
      category: 'invest',
      difficulty: 'stretch',
      title: 'Research one SIP option this week',
      description: 'Systematic Investment Plans (SIPs) let you invest as little as ₹500/month in mutual funds. Spend 10 minutes researching one option this week.',
      impact_text: 'Starting early is the single biggest investing advantage',
    },
  ]

  if (nudges.length < 3) {
    nudges.push(learningNudges[Math.floor(Math.random() * learningNudges.length)])
  }

  return nudges.slice(0, 3)
}
