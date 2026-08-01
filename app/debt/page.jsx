'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DebtCard from '@/components/ui/DebtCard';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/formatters';
import { Plus, TrendingDown, AlertCircle, Calculator, Info } from 'lucide-react';

export default function DebtTrackerPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState('avalanche'); // 'avalanche' or 'snowball'
  const [showAddForm, setShowAddForm] = useState(false);
  const [extraPayment, setExtraPayment] = useState(0);
  const [newDebt, setNewDebt] = useState({
    name: '', type: 'credit_card', principal: '', remaining_balance: '', interest_rate: '', monthly_emi: ''
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const debtData = {
        user_id: user.id,
        name: newDebt.name,
        type: newDebt.type,
        principal: parseFloat(newDebt.principal),
        remaining_balance: parseFloat(newDebt.remaining_balance),
        interest_rate: parseFloat(newDebt.interest_rate),
        monthly_emi: parseFloat(newDebt.monthly_emi)
      };
      
      const { data, error } = await supabase
        .from('debts')
        .insert([debtData])
        .select();
        
      if (error) throw error;
      
      setDebts([...debts, data[0]]);
      setShowAddForm(false);
      setNewDebt({ name: '', type: 'credit_card', principal: '', remaining_balance: '', interest_rate: '', monthly_emi: '' });
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  // Sort debts based on strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'avalanche') {
      return b.interest_rate - a.interest_rate; // Highest interest first
    } else {
      return a.remaining_balance - b.remaining_balance; // Lowest balance first
    }
  });

  const totalRemaining = debts.reduce((sum, debt) => sum + debt.remaining_balance, 0);
  const totalEMI = debts.reduce((sum, debt) => sum + debt.monthly_emi, 0);
  
  // Extra payment calculation on highest priority debt
  let monthsSaved = 0;
  if (sortedDebts.length > 0 && extraPayment > 0) {
    const topDebt = sortedDebts[0];
    const normalMonths = topDebt.remaining_balance / topDebt.monthly_emi;
    const newMonths = topDebt.remaining_balance / (topDebt.monthly_emi + Number(extraPayment));
    monthsSaved = Math.max(0, Math.floor(normalMonths - newMonths));
  }

  // AI Insight logic
  const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
  const yearlyInterest = highestInterestDebt 
    ? (highestInterestDebt.remaining_balance * highestInterestDebt.interest_rate / 100).toFixed(0)
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Debt Payoff Tracker">
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Summary Card */}
        <div className="card bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
              <TrendingDown className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Total Debt Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Remaining Balance</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalRemaining)}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Total Monthly EMI</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalEMI)}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Number of Debts</p>
              <p className="text-3xl font-bold text-white">{debts.length}</p>
            </div>
          </div>
        </div>

        {debts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold">Your Debts</h3>
                
                {/* Strategy Toggle */}
                <div className="bg-background-light p-1 rounded-lg flex items-center">
                  <button 
                    onClick={() => setStrategy('avalanche')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${strategy === 'avalanche' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                  >
                    Avalanche
                    <span className="group relative">
                      <Info className="h-3 w-3" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-background-light border border-border text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        Targets highest interest rate first. Saves the most money.
                      </div>
                    </span>
                  </button>
                  <button 
                    onClick={() => setStrategy('snowball')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${strategy === 'snowball' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                  >
                    Snowball
                    <span className="group relative">
                      <Info className="h-3 w-3" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-background-light border border-border text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        Targets smallest balance first. Good for quick psychological wins.
                      </div>
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sortedDebts.map((debt, index) => (
                  <div key={debt.id} className="relative">
                    <div className="absolute -left-3 -top-3 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10 ring-2 ring-background">
                      {index + 1}
                    </div>
                    <DebtCard debt={debt} />
                  </div>
                ))}
              </div>

              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 border border-dashed border-border rounded-xl text-text-muted hover:text-white hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Another Debt
                </button>
              )}

              {showAddForm && (
                <div className="card border-primary/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Add New Debt</h4>
                    <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-white text-sm">Cancel</button>
                  </div>
                  <form onSubmit={handleAddDebt} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Debt Name</label>
                        <input type="text" required value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} className="input w-full" placeholder="e.g. HDFC Credit Card" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Type</label>
                        <select required value={newDebt.type} onChange={(e) => setNewDebt({...newDebt, type: e.target.value})} className="input w-full">
                          <option value="credit_card">Credit Card</option>
                          <option value="personal_loan">Personal Loan</option>
                          <option value="home_loan">Home Loan</option>
                          <option value="car_loan">Car Loan</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Original Principal</label>
                        <input type="number" required value={newDebt.principal} onChange={(e) => setNewDebt({...newDebt, principal: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Remaining Balance</label>
                        <input type="number" required value={newDebt.remaining_balance} onChange={(e) => setNewDebt({...newDebt, remaining_balance: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" required value={newDebt.interest_rate} onChange={(e) => setNewDebt({...newDebt, interest_rate: e.target.value})} className="input w-full" placeholder="0.0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Monthly EMI</label>
                        <input type="number" required value={newDebt.monthly_emi} onChange={(e) => setNewDebt({...newDebt, monthly_emi: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">Save Debt</button>
                  </form>
                </div>
              )}

            </div>

            {/* Sidebar Tools */}
            <div className="space-y-6">
              
              {/* AI Insight Card */}
              {highestInterestDebt && (
                <div className="card bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
                    <AlertCircle className="h-16 w-16" />
                  </div>
                  <h3 className="font-bold flex items-center gap-2 mb-3 text-primary">
                    <AlertCircle className="h-5 w-5" /> AI Debt Insight
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed relative z-10">
                    Your <strong className="text-white">{highestInterestDebt.name}</strong> at <strong className="text-white">{highestInterestDebt.interest_rate}% APR</strong> costs you approximately <strong className="text-red-400">{formatCurrency(yearlyInterest)}</strong> in interest yearly. Paying it off first saves the most money in the long run.
                  </p>
                </div>
              )}

              {/* Extra Payment Simulator */}
              <div className="card">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-accent" /> Extra Payment Simulator
                </h3>
                <p className="text-sm text-text-muted mb-4">See how much time you save on your highest priority debt by paying extra.</p>
                
                <div className="mb-4">
                  <label className="block text-sm mb-2 text-white">If I pay extra per month:</label>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">₹</span>
                    <input 
                      type="number" 
                      value={extraPayment} 
                      onChange={(e) => setExtraPayment(Number(e.target.value))} 
                      className="input flex-1"
                      placeholder="0"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="500" 
                    value={extraPayment} 
                    onChange={(e) => setExtraPayment(Number(e.target.value))} 
                    className="w-full mt-4 accent-primary"
                  />
                </div>
                
                {extraPayment > 0 && sortedDebts.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400 font-medium text-center">
                      You would save <strong className="text-white text-lg">{monthsSaved}</strong> months on your {sortedDebts[0].name}!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
              <TrendingDown className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You are Debt Free!</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              You have no debt tracked. Celebrate! If you do have loans or credit cards, add them to plan your payoff strategy.
            </p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary mx-auto inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add a Debt
            </button>
            {showAddForm && (
              <div className="mt-8 text-left max-w-2xl mx-auto">
                <div className="card border-primary/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Add New Debt</h4>
                    <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-white text-sm">Cancel</button>
                  </div>
                  <form onSubmit={handleAddDebt} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Debt Name</label>
                        <input type="text" required value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} className="input w-full" placeholder="e.g. HDFC Credit Card" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Type</label>
                        <select required value={newDebt.type} onChange={(e) => setNewDebt({...newDebt, type: e.target.value})} className="input w-full">
                          <option value="credit_card">Credit Card</option>
                          <option value="personal_loan">Personal Loan</option>
                          <option value="home_loan">Home Loan</option>
                          <option value="car_loan">Car Loan</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Original Principal</label>
                        <input type="number" required value={newDebt.principal} onChange={(e) => setNewDebt({...newDebt, principal: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Remaining Balance</label>
                        <input type="number" required value={newDebt.remaining_balance} onChange={(e) => setNewDebt({...newDebt, remaining_balance: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" required value={newDebt.interest_rate} onChange={(e) => setNewDebt({...newDebt, interest_rate: e.target.value})} className="input w-full" placeholder="0.0" />
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Monthly EMI</label>
                        <input type="number" required value={newDebt.monthly_emi} onChange={(e) => setNewDebt({...newDebt, monthly_emi: e.target.value})} className="input w-full" placeholder="0" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">Save Debt</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
