'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LIFE_STAGES, GOAL_TEMPLATES, EXPENSE_CATEGORIES } from '@/lib/formatters'
import { ChevronRight, ChevronLeft, Check, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  const [profile, setProfile] = useState({
    full_name: '',
    life_stage: '',
    monthly_income: '',
    income_type: 'stable'
  })

  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          if (data) {
            setProfile(p => ({ ...p, full_name: data.full_name || '' }))
          }
        })
      } else {
        router.push('/auth')
      }
    })
  }, [router])

  const addExpense = () => setExpenses([...expenses, { category: Object.keys(EXPENSE_CATEGORIES)[0], amount: '' }])
  const updateExpense = (i, field, val) => {
    const newEx = [...expenses]
    newEx[i][field] = val
    setExpenses(newEx)
  }
  const removeExpense = (i) => setExpenses(expenses.filter((_, idx) => idx !== i))

  const addDebt = () => setDebts([...debts, { name: '', type: 'Personal Loan', balance: '', interest_rate: '', emi: '' }])
  const updateDebt = (i, field, val) => {
    const newDb = [...debts]
    newDb[i][field] = val
    setDebts(newDb)
  }
  const removeDebt = (i) => setDebts(debts.filter((_, idx) => idx !== i))

  const toggleGoal = (goalTemplate) => {
    const exists = goals.find(g => g.name === goalTemplate.name)
    if (exists) {
      setGoals(goals.filter(g => g.name !== goalTemplate.name))
    } else {
      setGoals([...goals, { ...goalTemplate, target_amount: '', target_date: '' }])
    }
  }
  const updateGoal = (i, field, val) => {
    const newGoals = [...goals]
    newGoals[i][field] = val
    setGoals(newGoals)
  }

  const handleNext = () => setStep(s => Math.min(s + 1, 5))
  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleComplete = async () => {
    setLoading(true)
    try {
      await supabase.from('profiles').update({
        full_name: profile.full_name,
        life_stage: profile.life_stage,
        monthly_income: profile.monthly_income || 0,
        income_type: profile.income_type,
        onboarding_complete: true
      }).eq('id', userId)

      if (expenses.length > 0) {
        await supabase.from('fixed_expenses').insert(
          expenses.map(e => ({ user_id: userId, category: e.category, amount: parseFloat(e.amount) || 0 }))
        )
      }

      if (debts.length > 0) {
        await supabase.from('debts').insert(
          debts.map(d => ({
            user_id: userId, name: d.name, type: d.type,
            balance: parseFloat(d.balance) || 0,
            interest_rate: parseFloat(d.interest_rate) || 0,
            emi: parseFloat(d.emi) || 0
          }))
        )
      }

      if (goals.length > 0) {
        await supabase.from('goals').insert(
          goals.map(g => ({
            user_id: userId, name: g.name, category: g.category,
            target_amount: parseFloat(g.target_amount) || 0,
            target_date: g.target_date || null
          }))
        )
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 selection:bg-indigo-500/30">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="px-8 pt-8 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-indigo-500' : i < step ? 'w-2 bg-indigo-500/50' : 'w-2 bg-slate-800'
              }`} 
            />
          ))}
        </div>

        <div className="p-8 sm:p-12 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col"
            >
              {step === 1 && (
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-8 tracking-tight">Let's get to know you</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">What should we call you?</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                      value={profile.full_name} 
                      onChange={e => setProfile({...profile, full_name: e.target.value})} 
                      placeholder="Your Name" 
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Current Life Stage</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(LIFE_STAGES || {}).map(([key, stage]) => {
                        const isSelected = profile.life_stage === key
                        return (
                          <div 
                            key={key} 
                            onClick={() => setProfile({...profile, life_stage: key})}
                            className={`p-4 rounded-xl cursor-pointer border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <span className="text-3xl">{stage.emoji}</span>
                            <span className="text-sm font-semibold text-slate-200">{stage.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Monthly Income (₹)</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                      type="number" 
                      value={profile.monthly_income} 
                      onChange={e => setProfile({...profile, monthly_income: e.target.value})} 
                      placeholder="e.g. 50000" 
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Income Type</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none" 
                      value={profile.income_type} 
                      onChange={e => setProfile({...profile, income_type: e.target.value})}
                    >
                      <option value="stable">Stable (Salary)</option>
                      <option value="variable">Variable (Freelance/Business)</option>
                    </select>
                  </div>
                  
                  <button 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                    onClick={handleNext} 
                    disabled={!profile.full_name || !profile.monthly_income}
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col h-full">
                  <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">Fixed Expenses</h2>
                  <p className="text-slate-400 mb-8">Add your mandatory monthly expenses (Rent, Utilities, etc.)</p>
                  
                  <div className="flex-1 space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {expenses.map((expense, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800"
                      >
                        <select 
                          className="flex-1 bg-transparent text-slate-200 outline-none appearance-none" 
                          value={expense.category} 
                          onChange={e => updateExpense(i, 'category', e.target.value)}
                        >
                          {Object.entries(EXPENSE_CATEGORIES || {}).map(([key, cat]) => (
                            <option key={key} value={key} className="bg-slate-900">{cat.icon} {cat.label}</option>
                          ))}
                        </select>
                        <div className="w-px h-8 bg-slate-800"></div>
                        <input 
                          className="w-24 bg-transparent text-slate-200 outline-none text-right font-medium placeholder-slate-600" 
                          type="number" 
                          placeholder="Amount" 
                          value={expense.amount} 
                          onChange={e => updateExpense(i, 'amount', e.target.value)} 
                        />
                        <button onClick={() => removeExpense(i)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                    
                    <button 
                      onClick={addExpense} 
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium py-2 transition-colors"
                    >
                      <Plus size={18} /> Add Expense
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleBack}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleNext}>
                      Next Step <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col h-full">
                  <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">Existing Debts</h2>
                  <p className="text-slate-400 mb-8">Do you have any ongoing loans or credit card debt?</p>
                  
                  <div className="flex-1 space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {debts.map((debt, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-300 text-sm tracking-wide uppercase">Debt #{i + 1}</span>
                          <button onClick={() => removeDebt(i)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <input 
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          placeholder="Name (e.g. Student Loan)" 
                          value={debt.name} 
                          onChange={e => updateDebt(i, 'name', e.target.value)} 
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" type="number" placeholder="Total Balance" value={debt.balance} onChange={e => updateDebt(i, 'balance', e.target.value)} />
                          <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" type="number" placeholder="Monthly EMI" value={debt.emi} onChange={e => updateDebt(i, 'emi', e.target.value)} />
                        </div>
                        <input className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" type="number" placeholder="Interest Rate %" value={debt.interest_rate} onChange={e => updateDebt(i, 'interest_rate', e.target.value)} />
                      </motion.div>
                    ))}
                    
                    <button 
                      onClick={addDebt} 
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium py-2 transition-colors"
                    >
                      <Plus size={18} /> Add Debt
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleBack}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleNext}>
                      Next Step <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col h-full">
                  <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">Financial Goals</h2>
                  <p className="text-slate-400 mb-8">Select your goals and set targets.</p>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-3">
                      {(GOAL_TEMPLATES || []).map((goalTpl, i) => {
                        const isSelected = goals.some(g => g.name === goalTpl.name)
                        return (
                          <div 
                            key={i} 
                            onClick={() => toggleGoal(goalTpl)}
                            className={`p-4 rounded-xl cursor-pointer border-2 flex items-center gap-3 transition-all duration-200 ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <span className="text-2xl">{goalTpl.icon}</span>
                            <span className="text-sm font-semibold text-slate-200 leading-tight">{goalTpl.name}</span>
                          </div>
                        )
                      })}
                    </div>

                    {goals.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h4 className="font-semibold text-slate-300">Set Targets</h4>
                        {goals.map((goal, i) => (
                          <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <div className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                              {goal.icon} {goal.name}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" type="number" placeholder="Amount (₹)" value={goal.target_amount} onChange={e => updateGoal(i, 'target_amount', e.target.value)} />
                              <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" type="date" value={goal.target_date} onChange={e => updateGoal(i, 'target_date', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleBack}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onClick={handleNext}>
                      Review <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col h-full items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                  >
                    <Check size={48} strokeWidth={3} />
                  </motion.div>
                  <h2 className="text-4xl font-black text-slate-100 mb-4 tracking-tight">You're all set!</h2>
                  <p className="text-slate-400 mb-10 text-lg max-w-sm">
                    We've calculated your initial financial health score and prepared your personalized dashboard.
                  </p>
                  
                  <div className="w-full flex gap-3">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-colors" onClick={handleBack}>
                      Go Back
                    </button>
                    <button 
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50" 
                      onClick={handleComplete} 
                      disabled={loading}
                    >
                      {loading ? 'Preparing...' : 'Go to Dashboard'} {!loading && <ArrowRight size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
