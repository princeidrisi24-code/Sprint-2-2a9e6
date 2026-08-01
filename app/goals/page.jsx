'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GoalCard from '@/components/ui/GoalCard';
import { supabase } from '@/lib/supabase';
import { formatCurrency, GOAL_TEMPLATES, daysUntil } from '@/lib/formatters';
import { Plus, Trophy, Target, Check, X } from 'lucide-react';
import Confetti from 'react-confetti';

export default function GoalsPage() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    emoji: '🎯',
    target_amount: '',
    current_amount: 0,
    deadline: ''
  });

  // Default templates if not in formatters
  const templates = GOAL_TEMPLATES || [
    { name: 'Emergency Fund', emoji: '🛡️', target_amount: 10000 },
    { name: 'Vacation', emoji: '✈️', target_amount: 5000 },
    { name: 'New Car', emoji: '🚗', target_amount: 20000 },
    { name: 'Laptop', emoji: '💻', target_amount: 2000 },
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (currentUser) {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      setGoals(data || []);
    }
    setLoading(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: user.id,
        name: newGoal.name,
        emoji: newGoal.emoji,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: 0,
        deadline: newGoal.deadline || null,
        status: 'active'
      }]);

    if (!error) {
      fetchGoals();
      setShowAddGoal(false);
      setNewGoal({ name: '', emoji: '🎯', target_amount: '', current_amount: 0, deadline: '' });
    }
  };

  const handleAddSavingsSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedGoalId || !savingsAmount) return;

    const goal = goals.find(g => g.id === selectedGoalId);
    if (!goal) return;

    const newAmount = goal.current_amount + parseFloat(savingsAmount);
    const isCompleted = newAmount >= goal.target_amount;

    const { error } = await supabase
      .from('goals')
      .update({ 
        current_amount: newAmount,
        status: isCompleted ? 'completed' : 'active' 
      })
      .eq('id', selectedGoalId);

    if (!error) {
      if (isCompleted && goal.status !== 'completed') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      fetchGoals();
      setShowAddSavings(false);
      setSavingsAmount('');
      setSelectedGoalId(null);
    }
  };

  const openAddSavings = (goalId) => {
    setSelectedGoalId(goalId);
    setShowAddSavings(true);
  };

  const activeGoals = goals.filter(g => g.status !== 'completed' && g.current_amount < g.target_amount);
  const completedGoals = goals.filter(g => g.status === 'completed' || g.current_amount >= g.target_amount);

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current_amount, 0);
  
  // Find nearest deadline
  let nearestDeadline = null;
  const goalsWithDeadlines = activeGoals.filter(g => g.deadline);
  if (goalsWithDeadlines.length > 0) {
    const sorted = [...goalsWithDeadlines].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    nearestDeadline = sorted[0].deadline;
  }

  return (
    <AppLayout>
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1000} height={typeof window !== 'undefined' ? window.innerHeight : 1000} />
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goals Hub</h1>
            <p className="text-gray-500">Track and achieve your financial targets</p>
          </div>
          <button 
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Saved</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSaved)}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Check size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nearest Deadline</p>
              <p className="text-lg font-bold text-gray-900">
                {nearestDeadline ? new Date(nearestDeadline).toLocaleDateString() : 'No deadlines'}
              </p>
            </div>
          </div>
        </div>

        {/* Active Goals Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Goals</h2>
          {activeGoals.length === 0 && !loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-primary-500 w-12 h-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active goals</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">Start your financial journey by setting your first savings goal.</p>
              <button 
                onClick={() => setShowAddGoal(true)}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                Start your first goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onAddSavings={() => openAddSavings(goal.id)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mt-12 opacity-75">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" /> Completed Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGoals.map(goal => (
                <div key={goal.id} className="bg-white/80 p-5 rounded-2xl border border-gray-200">
                   <div className="flex items-center gap-3 mb-3">
                     <span className="text-2xl">{goal.emoji}</span>
                     <h3 className="font-semibold text-gray-700 line-through decoration-gray-400">{goal.name}</h3>
                   </div>
                   <p className="text-sm text-gray-500">Reached {formatCurrency(goal.target_amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
              <button onClick={() => setShowAddGoal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewGoal({...newGoal, name: t.name, emoji: t.emoji, target_amount: t.target_amount})}
                      className="text-left p-3 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                    <input 
                      type="text" required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-xl"
                      value={newGoal.emoji}
                      onChange={(e) => setNewGoal({...newGoal, emoji: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                    <input 
                      type="text" required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      placeholder="e.g. Dream Vacation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input 
                      type="number" required min="1" step="1"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddSavings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add to Savings</h2>
            <form onSubmit={handleAddSavingsSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to add</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
                  <input 
                    type="number" required min="0.01" step="0.01" autoFocus
                    className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddSavings(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
