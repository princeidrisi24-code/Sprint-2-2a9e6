'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getScoreLabel } from '@/lib/formatters';
import { Send, Bot, User, Sparkles, RefreshCw, MessageSquare, Plus, Target, TrendingDown, DollarSign } from 'lucide-react';

export default function MentorPage() {
  const [profile, setProfile] = useState(null);
  const [financialData, setFinancialData] = useState({ score: 0, income: 0, savings: 0, topGoal: null, topDebt: null });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Review my spending this month",
    "Should I pay debt or invest?",
    "Help me plan a vacation",
    "What's my biggest financial risk?",
    "Create a savings plan for me"
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (currentSessionId) {
      loadMessagesForSession(currentSessionId);
    }
  }, [currentSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Load fin score & income
      const { data: finScoreData } = await supabase
        .from('financial_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      // Load goals & debts
      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', user.id).order('target_date', { ascending: true }).limit(1);
      const { data: debtsData } = await supabase.from('debts').select('*').eq('user_id', user.id).order('interest_rate', { ascending: false }).limit(1);

      setFinancialData({
        score: finScoreData?.score || 0,
        income: profileData?.monthly_income || 0,
        savings: 0, // Simplified
        topGoal: goalsData?.[0] || null,
        topDebt: debtsData?.[0] || null
      });

      // Load sessions
      const { data: messagesData } = await supabase
        .from('ai_messages')
        .select('session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Extract unique session IDs
      if (messagesData) {
        const uniqueSessions = [...new Set(messagesData.map(m => m.session_id))];
        setSessions(uniqueSessions);
        if (uniqueSessions.length > 0) {
          setCurrentSessionId(uniqueSessions[0]);
        } else {
          startNewSession();
        }
      } else {
        startNewSession();
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForSession = async (sessionId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startNewSession = () => {
    const newSessionId = `sess_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setSessions([newSessionId, ...sessions]);
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI Financial Mentor. Based on your profile, how can I help you today?",
      id: 'welcome_msg'
    }]);
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMessage = { role: 'user', content, session_id: currentSessionId, user_id: user.id };
    
    // Optimistic UI update
    setMessages(prev => [...prev, { ...userMessage, id: Date.now().toString() }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Save user message
      await supabase.from('ai_messages').insert([userMessage]);

      // Call API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          sessionId: currentSessionId,
          context: financialData // Pass context to AI
        })
      });

      let aiResponseContent = "I'm sorry, I'm having trouble processing that right now.";
      
      if (res.ok) {
        const data = await res.json();
        aiResponseContent = data.response;
      }

      const aiMessage = { role: 'assistant', content: aiResponseContent, session_id: currentSessionId, user_id: user.id };
      
      // Save AI message
      const { data: savedAiMsg } = await supabase.from('ai_messages').insert([aiMessage]).select();
      
      if (savedAiMsg) {
        setMessages(prev => [...prev, savedAiMsg[0]]);
      } else {
        setMessages(prev => [...prev, { ...aiMessage, id: Date.now().toString() }]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was a network error. Please try again.', id: Date.now().toString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="AI Financial Mentor" hidePadding>
      <div className="chat-layout h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
        
        {/* Left Sidebar - Chat History */}
        <div className="hidden md:flex flex-col bg-background-dark/50 border-r border-border h-full overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-background-dark/95 z-10">
            <button 
              onClick={startNewSession}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {sessions.map((sessionId, index) => (
              <button
                key={sessionId}
                onClick={() => setCurrentSessionId(sessionId)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${currentSessionId === sessionId ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-background-light'}`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">Session {sessions.length - index}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-background relative">
          
          {/* Header for mobile */}
          <div className="md:hidden p-3 border-b border-border flex justify-between items-center bg-background">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> FinMentor
            </h2>
            <button onClick={startNewSession} className="text-sm text-text-muted hover:text-white">
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-sm shadow-md' 
                    : 'bg-background-light border border-border text-text rounded-bl-sm shadow-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
                      <Bot className="h-3.5 w-3.5" /> FinMentor AI
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background-light border border-border rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-12">
            
            {/* Quick Prompts */}
            <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full bg-background-light border border-border text-xs text-text-muted hover:text-white hover:border-primary/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your finances, goals, or debts..."
                className="w-full bg-background-light border border-border rounded-xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="text-center mt-2 text-[10px] text-text-muted">
              AI can make mistakes. Consider verifying important financial information.
            </div>
          </div>
        </div>

        {/* Right Context Panel */}
        <div className="hidden lg:block bg-background-dark/50 border-l border-border h-full p-4 overflow-y-auto">
          <h3 className="font-semibold text-sm text-text-muted mb-4 uppercase tracking-wider">Your Financial Snapshot</h3>
          
          <div className="space-y-4">
            {/* Score Card */}
            <div className="card bg-background-light p-4">
              <div className="text-xs text-text-muted mb-1">Financial Health Score</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{financialData.score}</span>
                <span className={`text-xs mb-1 font-medium ${getScoreLabel(financialData.score).color}`}>
                  {getScoreLabel(financialData.score).label}
                </span>
              </div>
            </div>

            {/* Income */}
            <div className="card bg-background-light p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><DollarSign className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-text-muted">Monthly Income</div>
                <div className="font-semibold">{formatCurrency(financialData.income)}</div>
              </div>
            </div>

            {/* Top Goal */}
            {financialData.topGoal && (
              <div className="card bg-background-light p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                  <Target className="h-3.5 w-3.5 text-primary" /> Urgent Goal
                </div>
                <div className="font-medium text-sm mb-1">{financialData.topGoal.name}</div>
                <div className="text-xs text-white/70">{formatCurrency(financialData.topGoal.current_amount)} / {formatCurrency(financialData.topGoal.target_amount)}</div>
                <div className="w-full bg-background h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${Math.min(100, (financialData.topGoal.current_amount / financialData.topGoal.target_amount) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Top Debt */}
            {financialData.topDebt && (
              <div className="card bg-background-light p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" /> High Priority Debt
                </div>
                <div className="font-medium text-sm mb-1">{financialData.topDebt.name}</div>
                <div className="text-xs text-red-400 font-medium mb-1">{financialData.topDebt.interest_rate}% APR</div>
                <div className="text-xs text-white/70">Balance: {formatCurrency(financialData.topDebt.remaining_balance)}</div>
              </div>
            )}
            
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary/80 flex items-start gap-2 mt-6">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <p>The AI uses this snapshot to provide personalized advice tailored to your current situation.</p>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
