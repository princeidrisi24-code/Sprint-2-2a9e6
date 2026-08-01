'use client'

import { useState, useEffect, useMemo } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getScoreLabel, getScoreColor } from '@/lib/formatters'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flame, Trophy, TrendingUp, Calendar, Download } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [scoreHistory, setScoreHistory] = useState([])
  const [goals, setGoals] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, txRes, scoreRes, goalsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('score_history').select('*').eq('user_id', user.id).order('recorded_at', { ascending: true }),
        supabase.from('goals').select('*').eq('user_id', user.id)
      ])

      setProfile(profileRes.data)
      setTransactions(txRes.data || [])
      setScoreHistory(scoreRes.data || [])
      setGoals(goalsRes.data || [])
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  // Monthly filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [transactions, selectedMonth, selectedYear])

  // Stats
  const totalSpent = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  }, [monthTransactions])

  const totalSaved = useMemo(() => {
    return monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) - totalSpent
  }, [monthTransactions, totalSpent])

  // Category Breakdown for PieChart
  const spendingByCategory = useMemo(() => {
    const expenses = monthTransactions.filter(t => t.type === 'expense')
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
      return acc
    }, {})
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [monthTransactions])

  const biggestCategory = spendingByCategory.length > 0 ? spendingByCategory[0].name : 'N/A'

  // Score trend mapping
  const chartData = useMemo(() => {
    if (scoreHistory.length === 0) return []
    // Group by month
    const history = scoreHistory.map(h => {
      const d = new Date(h.recorded_at)
      return {
        month: MONTHS[d.getMonth()],
        score: h.score,
        netWorth: h.score * 1000 // Fake net worth logic based on score for demo
      }
    })
    return history.slice(-6)
  }, [scoreHistory])

  // Narrative logic
  const narrative = useMemo(() => {
    if (!profile) return ''
    const currentScore = profile.financial_health_score || 0
    const scoreDir = currentScore > 60 ? 'went up' : 'stayed stable'
    const saveRate = profile.monthly_income ? Math.max(0, Math.round((totalSaved / profile.monthly_income) * 100)) : 0
    return `In ${MONTHS[selectedMonth]}, you saved ${saveRate}% of your income and kept your expenses in check. Your health score ${scoreDir} to ${currentScore}. One challenge was spending on ${biggestCategory}. Next month, focus on sticking to your top budget categories.`
  }, [profile, selectedMonth, totalSaved, biggestCategory])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-xl">
          <p className="text-gray-300 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name === 'netWorth' ? 'Net Worth: ' + formatCurrency(entry.value) : `Score: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <AppLayout title="Insights & Reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Insights & Reports">
      <div className="space-y-6 pb-20">
        
        {/* Month Selector */}
        <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-5 h-5" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-white focus:ring-0 outline-none cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i} className="bg-gray-900">{m} {selectedYear}</option>
              ))}
            </select>
          </div>
          <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Financial Story */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Your Financial Story
          </h2>
          <p className="text-indigo-100/80 leading-relaxed text-sm">
            {narrative}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-1">Total Saved</p>
            <p className="text-emerald-400 font-bold text-lg">{formatCurrency(totalSaved > 0 ? totalSaved : 0)}</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-1">Total Spent</p>
            <p className="text-rose-400 font-bold text-lg">{formatCurrency(totalSpent)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div className="chart-wrapper bg-[var(--bg-elevated)] p-5 rounded-2xl border border-gray-800">
            <div className="chart-header mb-4">
              <h3 className="text-white font-medium">Health Score Trend</h3>
              <p className="text-gray-400 text-xs">Last 6 months</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-wrapper bg-[var(--bg-elevated)] p-5 rounded-2xl border border-gray-800">
            <div className="chart-header mb-4">
              <h3 className="text-white font-medium">Spending Breakdown</h3>
              <p className="text-gray-400 text-xs">{MONTHS[selectedMonth]} {selectedYear}</p>
            </div>
            <div className="h-64">
              {spendingByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No spending data for this month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wins and Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-elevated)] p-5 rounded-2xl border border-gray-800">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Your Wins This Month
            </h3>
            <div className="space-y-3">
              <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-50 text-sm font-medium">Stayed under budget</p>
                  <p className="text-emerald-200/60 text-xs">Food & Dining expenses were 15% lower than last month.</p>
                </div>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-50 text-sm font-medium">Goal Milestone Hit</p>
                  <p className="text-emerald-200/60 text-xs">You reached 25% of your Emergency Fund goal!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] p-5 rounded-2xl border border-gray-800">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Streak Badges
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-900 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-800">
                <span className="text-3xl mb-1">🔥</span>
                <p className="text-white font-bold text-lg">5 Days</p>
                <p className="text-gray-400 text-xs text-center">App Open Streak</p>
              </div>
              <div className="flex-1 bg-gray-900 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-800">
                <span className="text-3xl mb-1">🎯</span>
                <p className="text-white font-bold text-lg">3 Weeks</p>
                <p className="text-gray-400 text-xs text-center">Budget Target Met</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
