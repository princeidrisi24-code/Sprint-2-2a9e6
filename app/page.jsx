'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Target, 
  CreditCard, 
  MessageSquare, 
  BarChart2, 
  Shield, 
  ChevronRight, 
  Check, 
  Star, 
  Zap, 
  Brain, 
  PiggyBank 
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      {/* 1. Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:rotate-12 transition-transform">💸</span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
              FinMentor AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="landing-hero relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Radial gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
        </div>

        <div className="hero-content relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="hero-badge animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-8">
            <span className="text-sm font-medium text-emerald-400">✨ AI-Powered Finance Mentor</span>
          </div>

          <h1 className="hero-title animate-fade-in-up animation-delay-100 text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Build wealth, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400 to-emerald-300">
              one habit at a time.
            </span>
          </h1>

          <p className="animate-fade-in-up animation-delay-200 text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
            Stop guessing with your money. Get personalized, AI-driven weekly nudges that guide you out of debt and towards financial freedom—automatically.
          </p>

          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row items-center gap-4 mb-12">
            <Link 
              href="/signup" 
              className="px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start for Free <ChevronRight size={20} />
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-8 py-4 rounded-full text-lg font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2"
            >
              See How It Works
            </Link>
          </div>

          <div className="animate-fade-in-up animation-delay-400 flex items-center justify-center gap-8 md:gap-16 text-slate-400 text-sm font-medium border-t border-slate-800/60 pt-8 w-full max-w-2xl">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-200">10,000+</span>
              <span>users</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-200">₹50Cr+</span>
              <span>tracked</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-2xl font-bold text-slate-200">
                4.9 <Star size={20} className="fill-amber-400 text-amber-400" />
              </span>
              <span>rated</span>
            </div>
          </div>
        </div>

        {/* Floating Mockup */}
        <div className="animate-fade-in-up animation-delay-500 relative z-10 w-full max-w-3xl mx-auto mt-16 perspective-1000">
          <div className="transform rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-transform duration-700 ease-out p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/10 flex flex-col md:flex-row gap-6">
            
            {/* Score Card Mockup */}
            <div className="metric-card flex-1 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Financial Health</h3>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#34d399" strokeWidth="8" strokeDasharray="283" strokeDashoffset="76" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">73</span>
                  <span className="text-xs text-emerald-400 font-medium">Good</span>
                </div>
              </div>
            </div>

            {/* Nudges Mockup */}
            <div className="flex-[2] flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <h3 className="font-semibold text-slate-200">Weekly Nudges</h3>
                <span className="text-xs text-indigo-400 font-medium">2/3 Completed</span>
              </div>
              <div className="nudge-card bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 line-through opacity-70">Transfer ₹2000 to Emergency Fund</h4>
                  <p className="text-xs text-slate-400 opacity-70">Done on Monday</p>
                </div>
              </div>
              <div className="nudge-card bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Review Weekend Spending</h4>
                  <p className="text-xs text-indigo-300 mt-1">You spent 15% more on dining out this weekend. Tap to review.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section className="py-24 px-6 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-wider text-rose-400 uppercase mb-3 block">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-bold">Why most finance apps fail you</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "They only track, never guide", desc: "Knowing you spent ₹5000 on food doesn't help you stop. You need actionable next steps.", icon: <BarChart2 size={24} className="text-rose-400" /> },
              { title: "Generic advice that ignores your life", desc: "Articles about 'saving 20%' are useless if you're drowning in debt or have a variable income.", icon: <Target size={24} className="text-rose-400" /> },
              { title: "No habit formation, just data", desc: "Seeing a red budget bar makes you feel guilty, not motivated. You need positive reinforcement.", icon: <Brain size={24} className="text-rose-400" /> }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 border border-rose-500/10 p-8 rounded-2xl flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900 relative border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-wider text-indigo-400 uppercase mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold">From confusion to clarity in 4 steps</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-800 via-indigo-500/50 to-slate-800 z-0" />
            
            {[
              { num: "1", title: "Tell us your situation", desc: "Input your income, debts, and life goals. It takes 3 minutes." },
              { num: "2", title: "Get your Health Score", desc: "Instantly see where you stand with a personalized 0-100 score." },
              { num: "3", title: "Follow weekly AI Nudges", desc: "Complete 3 small, personalized actions sent to you every Monday." },
              { num: "4", title: "Watch your wealth grow", desc: "Track progress, hit milestones, and build lasting financial habits." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl pt-10 mt-6 lg:mt-0 text-center flex flex-col items-center transition-transform hover:-translate-y-2">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20 ring-4 ring-slate-900">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section className="features-section py-24 px-6 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-3 block">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold">Everything you need to master money</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp className="text-emerald-400" />, title: "💯 Health Score", desc: "A live 0-100 score across 5 financial dimensions to track your overall standing." },
              { icon: <Zap className="text-amber-400" />, title: "⚡ Weekly Nudges", desc: "3 personalized, bite-sized actions every Monday to build momentum." },
              { icon: <Target className="text-indigo-400" />, title: "🎯 Goal Tracker", desc: "Set and track multiple financial goals simultaneously with AI guidance." },
              { icon: <CreditCard className="text-rose-400" />, title: "💳 Debt Planner", desc: "Avalanche or snowball strategies, personalized to your exact debts." },
              { icon: <MessageSquare className="text-blue-400" />, title: "🤖 AI Mentor Chat", desc: "Ask anything, get context-aware financial advice 24/7." },
              { icon: <BarChart2 className="text-purple-400" />, title: "📊 Rich Insights", desc: "Monthly AI-written summaries and deep-dive spending analytics." }
            ].map((feat, i) => (
              <div key={i} className="feature-card bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-all hover:bg-slate-800/50 group">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24 px-6 bg-slate-900 relative border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Don't just take our word for it</h2>
            <p className="text-slate-400 text-lg">Join thousands rewriting their financial future.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Riya S.", age: 24, persona: "Early Career", quote: "I paid off my credit card in 4 months following the AI nudges! It felt like a game rather than a chore." },
              { name: "Arjun M.", age: 31, persona: "Freelancer", quote: "Finally an app that understands my variable income. The AI mentor adapts my budget dynamically each month." },
              { name: "Meera P.", age: 38, persona: "Working Parent", quote: "Balancing 4 goals simultaneously was overwhelming. Now it's effortless. The monthly insights are pure gold." }
            ].map((t, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-300 text-lg italic mb-6">"{t.quote}"</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{t.name}, {t.age}</h4>
                  <p className="text-sm text-slate-400">{t.persona}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section className="py-24 px-6 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Invest in your financial future for less than a cup of coffee.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="pricing-card bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">₹0</span>
                <span className="text-slate-500">/forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Basic budget tracker', '1 Financial Goal', 'Basic monthly insights', 'Health Score (Monthly update)'].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Check size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full py-3 px-4 rounded-xl font-bold text-center border border-slate-700 hover:bg-slate-800 transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="pricing-card relative bg-slate-800 border-2 border-indigo-500 p-8 rounded-3xl flex flex-col shadow-2xl shadow-indigo-500/20 transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-indigo-300 mb-2">Mentor Pro</h3>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-white">₹299</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-sm text-emerald-400 font-medium mb-6">Or ₹2,499/year (save 30%)</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {['Full AI Mentor Chat (24/7)', 'Unlimited Goals', 'Weekly AI Nudges', 'Advanced Debt Planner', 'Real-time Health Score', 'Deep-dive Analytics'].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-100">
                    <Check size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="w-full py-3 px-4 rounded-xl font-bold text-center bg-indigo-500 hover:bg-indigo-400 text-white transition-colors">
                Start 7-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-emerald-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Your financial transformation starts today
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join the movement of people taking control of their money with the power of AI.
          </p>
          <Link href="/signup" className="inline-flex items-center justify-center px-10 py-5 rounded-full text-xl font-bold bg-white text-slate-900 hover:scale-105 hover:shadow-xl transition-all gap-2">
            Claim Your Free Account <ChevronRight size={24} />
          </Link>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 px-6 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">💸</span>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
                FinMentor AI
              </span>
            </Link>
            <p className="text-slate-500 text-sm">Building wealth, one habit at a time.</p>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <div className="text-slate-600 text-sm">
            © {new Date().getFullYear()} FinMentor AI. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
        .hover\\:rotate-x-0:hover {
          transform: rotateX(0deg) scale(1);
        }
      `}</style>
    </div>
  );
}
