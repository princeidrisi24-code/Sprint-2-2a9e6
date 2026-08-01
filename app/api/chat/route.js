import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req) {
  try {
    const { message, sessionId } = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load user's financial context
    const [profileRes, goalsRes, debtsRes, budgetsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('debts').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const debts = debtsRes.data || []
    const budgets = budgetsRes.data || []

    // Build financial context for AI
    const totalDebt = debts.reduce((s, d) => s + Number(d.remaining_balance), 0)
    const totalEMI = debts.reduce((s, d) => s + Number(d.emi_amount), 0)
    const topGoal = goals[0]
    const highInterestDebt = debts.sort((a, b) => b.interest_rate - a.interest_rate)[0]

    const systemPrompt = `You are FinMentor AI, a warm, empathetic, and highly knowledgeable personal finance mentor. You give personalized, specific, actionable financial advice. You never give generic advice — always tie your response back to the user's actual financial data below.

USER FINANCIAL CONTEXT:
- Name: ${profile?.full_name || 'User'}
- Monthly Income: ₹${Number(profile?.monthly_income || 0).toLocaleString('en-IN')}
- Financial Health Score: ${profile?.financial_health_score || 0}/100
- Life Stage: ${profile?.life_stage || 'not specified'}
- Active Goals: ${goals.map(g => `${g.name} (${Math.round((g.saved_amount/g.target_amount)*100)}% done)`).join(', ') || 'None set'}
- Total Debt: ₹${totalDebt.toLocaleString('en-IN')} | Monthly EMI: ₹${totalEMI.toLocaleString('en-IN')}
${highInterestDebt ? `- Highest Interest Debt: ${highInterestDebt.name} at ${highInterestDebt.interest_rate}% APR` : ''}

GUIDELINES:
- Be warm and encouraging, not preachy or judgmental
- Give ONE clear next action at the end of every response
- Use ₹ INR currency
- Keep responses concise (3-5 short paragraphs max)
- If asked about investments, check emergency fund status first
- Format numbers in Indian system (lakhs, crores)
- Celebrate progress before addressing problems`

    // Save user message
    await supabase.from('ai_messages').insert({
      user_id: user.id,
      session_id: sessionId,
      role: 'user',
      content: message,
    })

    // Load recent conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
    ]

    // Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!openaiRes.ok) {
      // Fallback response if API key not set
      const fallbackResponse = generateFallbackResponse(message, profile, goals, debts)
      await supabase.from('ai_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role: 'assistant',
        content: fallbackResponse,
      })
      return NextResponse.json({ response: fallbackResponse })
    }

    const openaiData = await openaiRes.json()
    const aiResponse = openaiData.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.'

    // Save AI response
    await supabase.from('ai_messages').insert({
      user_id: user.id,
      session_id: sessionId,
      role: 'assistant',
      content: aiResponse,
    })

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateFallbackResponse(message, profile, goals, debts) {
  const name = profile?.full_name?.split(' ')[0] || 'there'
  const income = Number(profile?.monthly_income || 0)
  const score = profile?.financial_health_score || 0

  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('spend') || lowerMsg.includes('budget')) {
    return `Great question, ${name}! Looking at your financial profile, I can see your current health score is ${score}/100. The key to better spending control is awareness first — and you’re already doing that by asking!\n\nWith a monthly income of ₹${income.toLocaleString('en-IN')}, a good target is to keep variable spending (food, shopping, entertainment) under 30% of your income, which is ₹${Math.round(income * 0.3).toLocaleString('en-IN')}/month.\n\n**Your next action:** Review your top spending category this week and identify one expense you can reduce by 20%.`
  }

  if (lowerMsg.includes('invest') || lowerMsg.includes('sip') || lowerMsg.includes('mutual fund')) {
    const hasEmergencyFund = goals?.some(g => g.name?.toLowerCase().includes('emergency') && Number(g.saved_amount) > income * 3)
    if (!hasEmergencyFund) {
      return `${name}, I love that you're thinking about investing! Before we dive into investments, let's make sure your foundation is solid.\n\nWith your current income of ₹${income.toLocaleString('en-IN')}/month, your first priority should be an emergency fund of at least ₹${(income * 3).toLocaleString('en-IN')} (3 months of expenses). This protects you if you ever need to pause investments.\n\n**Your next action:** Set up an emergency fund goal and automate a monthly transfer of even ₹${Math.round(income * 0.05).toLocaleString('en-IN')} to start.`
    }
    return `Excellent, ${name}! You're thinking like a wealth builder. With your emergency fund in place, here's a simple investing framework:\n\n1. **SIPs in index funds** — Start with ₹${Math.round(income * 0.1).toLocaleString('en-IN')}/month in a Nifty 50 index fund\n2. **Increase by 10%** every year as your income grows\n3. **Stay consistent** — don't pause during market dips\n\n**Your next action:** Open a Zerodha or Groww account and set up a ₹${Math.round(income * 0.1).toLocaleString('en-IN')}/month SIP in a Nifty 50 index fund today.`
  }

  if (lowerMsg.includes('debt') || lowerMsg.includes('loan') || lowerMsg.includes('credit card')) {
    const highDebt = debts?.sort((a, b) => b.interest_rate - a.interest_rate)[0]
    return `${name}, let's tackle your debt strategically! The golden rule: always pay off the highest-interest debt first (the Avalanche method) to minimize total interest paid.\n\n${highDebt ? `Your **${highDebt.name}** at ${highDebt.interest_rate}% APR is your top priority. Even paying ₹${Math.round(Number(highDebt.emi_amount) * 1.1).toLocaleString('en-IN')}/month (10% more than the minimum) can save you significantly in interest.` : 'List all your debts with their interest rates, and we can build a personalized payoff plan.'}\n\n**Your next action:** Make one extra payment this month, even a small one, toward your highest-interest debt.`
  }

  return `Hi ${name}! I'm FinMentor AI, your personal finance mentor. I can see your financial health score is ${score}/100 — ${score >= 70 ? "you're doing great!" : score >= 40 ? "there's good progress to build on!" : "we have exciting work to do together!"}.\n\nI can help you with budgeting, goal planning, debt payoff strategies, investment basics, and building long-term wealth habits.\n\nWhat specific aspect of your finances would you like to work on today?`
}
