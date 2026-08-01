'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetBar from '@/components/ui/BudgetBar';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrentMonth, EXPENSE_CATEGORIES } from '@/lib/formatters';
import { Plus, ChevronLeft, ChevronRight, Zap, TrendingDown } from 'lucide-react';

export default function BudgetCenterPage() {
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const [newBudget, setNewBudget] = useState({ category: '', limit_amount: '' });
  const [newTransaction, setNewTransaction] = useState({ 
    category: '', 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0], 
    type: 'expense' 
  });

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (currentUser) {
      const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('month', yearMonth);
        
      setBudgets(budgetData || []);

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
        
      setTransactions(transactionData || []);
    }
    setLoading(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        { 
          user_id: user.id, 
          category: newBudget.category, 
          limit_amount: parseFloat(newBudget.limit_amount), 
          month: yearMonth 
        }
      ]);
      
    if (!error) {
      fetchData();
      setShowAddBudget(false);
      setNewBudget({ category: '', limit_amount: '' });
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { 
          user_id: user.id, 
          ...newTransaction,
          amount: parseFloat(newTransaction.amount)
        }
      ]);
      
    if (!error) {
      fetchData();
      setShowAddTransaction(false);
      setNewTransaction({ 
        category: '', 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        type: 'expense' 
      });
    }
  };

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit_amount, 0);
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const percentSpent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  
  // Calculate category spending
  const categorySpending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  // Find most overspent category
  let mostOverspent = null;
  let highestOverspentAmount = 0;
  
  budgets.forEach(b => {
    const spent = categorySpending[b.category] || 0;
    if (spent > b.limit_amount) {
      const overspent = spent - b.limit_amount;
      if (overspent > highestOverspentAmount) {
        highestOverspentAmount = overspent;
        mostOverspent = b.category;
      }
    }
  });

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Budget Center</h1>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="font-medium min-w-[120px] text-center">{monthName}</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Overview</h2>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-semibold text-gray-700">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden mt-4">
            <div 
              className={`h-full ${percentSpent > 90 ? 'bg-red-500' : percentSpent > 75 ? 'bg-orange-500' : 'bg-primary-500'} transition-all duration-500`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining
          </p>
        </div>

        {/* AI Insight */}
        {mostOverspent && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={64} />
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm text-indigo-500">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">AI Budget Insight</h3>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  You've spent more than your budget on <span className="font-bold">{mostOverspent}</span> this month. 
                  Try cutting back next week to save {formatCurrency(highestOverspentAmount)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Category Budgets</h2>
            <button 
              onClick={() => setShowAddBudget(!showAddBudget)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={16} /> Add Budget
            </button>
          </div>

          {showAddBudget && (
            <form onSubmit={handleAddBudget} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select 
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {EXPENSE_CATEGORIES?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {(!EXPENSE_CATEGORIES || EXPENSE_CATEGORIES.length === 0) && (
                    <>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Limit Amount</label>
                <input 
                  type="number" required min="0" step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newBudget.limit_amount}
                  onChange={(e) => setNewBudget({...newBudget, limit_amount: e.target.value})}
                  placeholder="e.g. 5000"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium h-[42px]">
                Save
              </button>
            </form>
          )}

          <div className="space-y-4">
            {budgets.length === 0 && !loading ? (
              <p className="text-gray-500 text-center py-4">No budgets set for this month.</p>
            ) : (
              budgets.map(budget => (
                <BudgetBar 
                  key={budget.id}
                  category={budget.category}
                  spent={categorySpending[budget.category] || 0}
                  limit={budget.limit_amount}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button 
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={16} /> Add Transaction
            </button>
          </div>

          {showAddTransaction && (
            <form onSubmit={handleAddTransaction} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  placeholder="e.g. Groceries"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                <input 
                  type="number" required min="0" step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="e.g. Walmart"
                />
              </div>
               <div className="flex-1 min-w-[130px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input 
                  type="date" required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium h-[42px] min-w-[100px]">
                Save
              </button>
            </form>
          )}

          <div className="divide-y divide-gray-100">
            {transactions.length === 0 && !loading ? (
              <p className="text-gray-500 text-center py-4">No transactions found.</p>
            ) : (
              transactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg -mx-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                       <TrendingDown size={16} className={tx.type === 'income' ? 'rotate-180' : ''} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.category}</p>
                      <p className="text-xs text-gray-500">{tx.description || tx.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                    {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
