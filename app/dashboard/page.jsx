'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ScoreRing from '@/components/ui/ScoreRing';
import NudgeCard from '@/components/ui/NudgeCard';
import GoalCard from '@/components/ui/GoalCard';
import MetricCard from '@/components/ui/MetricCard';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getGreeting, getPct, getCurrentMonth, CATEGORY_ICONS } from '@/lib/formatters';
import { calculateHealthScore } from '@/lib/scoreCalculator';
import { TrendingUp, TrendingDown, Plus, ArrowRight, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    profile: null,
    goals: [],
    debts: [],
    transactions: [],
    budgets: [],
    nudges: [],
    score: null
  });

  useEffect(() => {
    async function loadData() {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        router.push('/auth');
        return;
      }
      
      const currentUser = session.user;
      setUser(currentUser);

      try {
        const [
          { data: profile },
          { data: goals },
          { data: debts },
          { data: transactions },
          { data: budgets },
          { data: nudges }
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
          supabase.from('goals').select('*').eq('user_id', currentUser.id),
          supabase.from('debts').select('*').eq('user_id', currentUser.id),
          supabase.from('transactions')
            .select('*')
            .eq('user_id', currentUser.id)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('date', { ascending: false }),
          supabase.from('budgets').select('*').eq('user_id', currentUser.id).eq('month', getCurrentMonth()),
          supabase.from('nudges').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3)
        ]);

        const newScore = calculateHealthScore({ profile, goals, debts, transactions, budgets });
        
        if (profile && newScore.total !== profile.health_score) {
          await supabase
            .from('profiles')
            .update({ health_score: newScore.total })
            .eq('id', currentUser.id);
        }

        setData({
          profile,
          goals: goals || [],
          debts: debts || [],
          transactions: transactions || [],
          budgets: budgets || [],
          nudges: nudges || [],
          score: newScore
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="text-slate-400 font-medium">Crunching your financial data...</p>
        </div>
      </AppLayout>
    );
  }

  const { profile, goals, transactions, nudges, score } = data;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const spending = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const savingsRate = income > 0 ? ((income - spending) / income) * 100 : 0;
  const netWorth = profile?.net_worth || 0;

  let aiInsightMessage = "You're on track this week. Keep maintaining those healthy financial habits!";
  if (savingsRate < 10 && income > 0) {
    aiInsightMessage = "Your savings rate is a bit low this month. Let's look for small areas to trim spending.";
  } else if (goals.some(g => (g.current_amount / g.target_amount) > 0.8 && (g.current_amount / g.target_amount) < 1)) {
    const closeGoal = goals.find(g => (g.current_amount / g.target_amount) > 0.8 && (g.current_amount / g.target_amount) < 1);
    aiInsightMessage = `Amazing! You are so close to reaching your "${closeGoal.name}" goal. Keep it up!`;
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2 tracking-tight">
          {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">{firstName}</span> 👋
        </h1>
        <p className="text-slate-400 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard 
          title="Net Worth" 
          value={formatCurrency(netWorth)} 
          icon={<TrendingUp className="text-emerald-400" size={20} />} 
        />
        <MetricCard 
          title="Monthly Income" 
          value={formatCurrency(income)} 
          icon={<Plus className="text-indigo-400" size={20} />} 
        />
        <MetricCard 
          title="Monthly Spending" 
          value={formatCurrency(spending)} 
          icon={<TrendingDown className="text-rose-400" size={20} />} 
        />
        <MetricCard 
          title="Savings Rate" 
          value={getPct(savingsRate)} 
          icon={<Zap className="text-amber-400" size={20} />} 
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-8 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20" 
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="p-3 bg-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Zap className="text-indigo-400" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-300 mb-1 flex items-center gap-2">
              AI Insight
            </h3>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              {aiInsightMessage}
            </p>
          </div>
        </div>
        <Link href="/mentor" className="relative z-10 whitespace-nowrap px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/25">
          Ask Mentor <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="flex flex-col gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 mb-8 self-start w-full">Financial Health Score</h2>
            {score && (
              <ScoreRing 
                score={score.total} 
                dimensions={score.dimensions} 
                size={240} 
                showDimensions={true} 
              />
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">This Week's Nudges</h2>
            <div className="flex flex-col gap-4">
              {nudges.length > 0 ? (
                nudges.map(nudge => (
                  <NudgeCard key={nudge.id} nudge={nudge} />
                ))
              ) : (
                <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
                  No nudges for now. You're doing great!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Active Goals</h2>
              <Link href="/goals" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
            </div>
            <div className="flex flex-col gap-4">
              {goals.length > 0 ? (
                goals.slice(0, 3).map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              ) : (
                <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
                  No active goals. <Link href="/goals/new" className="text-indigo-400 font-medium hover:underline">Create one</Link>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map(tx => {
                    const Icon = CATEGORY_ICONS?.[tx.category] || Plus;
                    const isExpense = tx.type === 'expense';
                    return (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'} group-hover:scale-110 transition-transform`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{tx.name}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${isExpense ? 'text-slate-200' : 'text-emerald-400'}`}>
                          {isExpense ? '-' : '+'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 text-slate-500">
                    No recent transactions.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Add Transaction Button for Mobile */}
      <Link 
        href="/transactions/new" 
        className="fixed bottom-24 right-6 md:hidden w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all z-50"
      >
        <Plus size={24} />
      </Link>
    </AppLayout>
  );
}
