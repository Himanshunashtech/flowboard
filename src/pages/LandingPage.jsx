import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check,
  Layout,
  Zap,
  Shield,
  Users,
  BarChart3,
  Layers,
  MessageSquare,
  ArrowRight,
  Plus
} from 'lucide-react';

import MarketingHeader from '../components/marketing/MarketingHeader';
import MarketingFooter from '../components/marketing/MarketingFooter';

// Importing real dashboard screenshots
import dashboardScreen1 from '../assets/Screenshot 2026-04-12 134609.png';
import dashboardScreen2 from '../assets/Screenshot 2026-04-12 134713.png';
import dashboardScreen3 from '../assets/Screenshot 2026-04-12 134739.png';

const LandingPage = () => {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  const screens = [
    {
      img: dashboardScreen1,
      label: 'Kinetic Canvas',
      title: 'Built for High-Density Engineering.',
      desc: '60FPS rendering engine that handles thousands of concurrent state updates without a single frame drop.'
    },
    {
      img: dashboardScreen2,
      label: 'Atomic Sync',
      title: 'Global State, Local Speed.',
      desc: 'Distributed WebSocket architecture that ensures millisecond-level latency across your entire global nexus.'
    },
    {
      img: dashboardScreen3,
      label: 'Governed Access',
      title: 'Security Without Friction.',
      desc: 'Cryptographically isolated portals for clients and external partners, protected by physical-layer RLS policies.'
    }
  ];
  return (
    <div className="bg-white min-h-screen selection:bg-brand-primary/10 overflow-x-hidden">
      {/* 1. Header/Nav */}
      <MarketingHeader />

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-16 md:pt-24 pb-0 overflow-hidden bg-bg-primary">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-flex items-center gap-3 px-4 py-1.5 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
              <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded shadow-sm" />
              FlowBoard 2.0 is live
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.95] mb-8">
              Manage projects <br className="hidden sm:block" /> with unparalleled <span className="text-brand-primary">flow.</span>
            </h1>
            <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              FlowBoard is the modern command center for high-performance teams.
              Visualize work, automate boring tasks, and scale without limits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 md:mb-24">
              <Link to="/signup" className="h-16 px-10 flex items-center justify-center bg-brand-primary text-white text-base font-black uppercase tracking-widest rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,82,204,0.3)] hover:scale-105 active:scale-95 transition-all">
                Start free trial
              </Link>
              <button className="h-16 px-10 flex items-center justify-center bg-bg-secondary text-text-primary text-base font-black uppercase tracking-widest rounded-3xl hover:bg-bg-tertiary transition-all">
                Book a demo
              </button>
            </div>
          </div>

          <div className="relative group perspective-2000 px-4 md:px-0 mt-20 md:mt-32">
            <div className="absolute -inset-20 bg-gradient-to-b from-brand-primary/10 to-transparent blur-[120px] -z-10 rounded-full opacity-50"></div>

            <div className="relative max-w-6xl mx-auto min-h-[500px] md:min-h-[850px] flex items-center justify-center">
              {/* Screen 3 (Back Left) - Interactive Placeholder */}
              <div
                className="absolute top-1/2 left-0 w-[80%] aspect-video bg-white rounded-3xl shadow-2xl border border-border-light overflow-hidden transform -rotate-6 -translate-x-24 -translate-y-1/2 opacity-30 scale-90 transition-all duration-1000 z-10"
              >
                <img src={dashboardScreen3} alt="" className="w-full h-full object-cover grayscale opacity-50" />
              </div>

              {/* Screen 2 (Back Right) - Interactive Placeholder */}
              <div
                className="absolute top-1/2 right-0 w-[80%] aspect-video bg-white rounded-3xl shadow-2xl border border-border-light overflow-hidden transform rotate-6 translate-x-24 -translate-y-1/2 opacity-30 scale-90 transition-all duration-1000 z-10"
              >
                <img src={dashboardScreen2} alt="" className="w-full h-full object-cover grayscale opacity-50" />
              </div>

              {/* Main Interactive Screen (Center) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveScreenIndex((prev) => (prev + 1) % screens.length)}
                className="relative w-[92%] aspect-video bg-white rounded-[32px] md:rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-4 border-white z-20 cursor-pointer overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-8 bg-bg-secondary flex items-center justify-between px-6 z-30">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Click to switch views</span>
                </div>

                <div className="relative w-full h-full pt-8">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeScreenIndex}
                      src={screens[activeScreenIndex].img}
                      alt={screens[activeScreenIndex].label}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                </div>
              </motion.div>

              <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-white via-white/40 to-transparent z-40 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-20 border-y border-border-light bg-bg-secondary/20 overflow-hidden">
        <p className="text-center text-[9px] font-black text-text-tertiary uppercase tracking-[0.4em] mb-12 px-6">Trusted by the world's most innovative teams</p>
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-12 md:gap-24 opacity-30 grayscale min-w-max pb-4">
            <div className="font-black text-2xl uppercase tracking-tighter">Acme Corp</div>
            <div className="font-black text-2xl uppercase tracking-tighter">GloboChem</div>
            <div className="font-black text-2xl uppercase tracking-tighter">Soylent Corp</div>
            <div className="font-black text-2xl uppercase tracking-tighter">Initech</div>
            <div className="font-black text-2xl uppercase tracking-tighter">Umbrella</div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black text-text-primary tracking-tighter mb-6 leading-tight">Everything you <br className="sm:hidden" /> need to ship faster</h2>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium">Ditch the spreadsheets and fragmented tools for a unified workspace built for the next decade of work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Layout />, title: 'Visual Kanban', desc: 'Customizable cards and lists that mirror your team\'s unique workflow with pixel-perfect precision.' },
              { icon: <Zap />, title: 'Real-time Sync', desc: 'Updates happen instantly across all devices. No more refresh-tag. Powered by low-latency architecture.' },
              { icon: <Shield />, title: 'Enterprise Security', desc: 'Work confidently with SOC2 compliance, advanced RLS patterns, and data localization options.' },
              { icon: <Users />, title: 'Collaborative Portals', desc: 'Invite clients to view progress without exposing internal discussions or sensitive data.' },
              { icon: <BarChart3 />, title: 'Advanced Analytics', desc: 'Measure velocity, cycle time, and workload balance with beautiful, automated dashboards.' },
              { icon: <Layers />, title: 'Infinite Hierarchy', desc: 'Nested checklists and task dependencies designed for projects of any size or complexity.' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 md:p-10 bg-bg-secondary/30 rounded-[40px] border border-border-light/50 hover:border-brand-primary/10 hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Breakdown */}
      <section className="py-24 md:py-32 px-6 bg-bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
              <h2 className="text-4xl md:text-7xl font-black text-text-primary tracking-tighter leading-[1] mb-6 md:mb-10">Real-time <br className="hidden sm:block" /> Collaboration.</h2>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium max-w-xl">
                Work together in perfect harmony. See who's online, who's typing,
                and watch tasks move across the board in real-time.
              </p>
              <ul className="space-y-5">
                {[
                  'Live presence indicators',
                  'Instant comment notifications',
                  'Collaborative card editing'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-black text-text-primary uppercase tracking-widest">
                    <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/features" className="inline-flex items-center gap-2 group text-brand-primary font-black uppercase text-xs tracking-widest pt-4">
                Explore features <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative group order-1 lg:order-2">
              <div className="absolute -inset-4 bg-brand-primary/5 rounded-[48px] blur-3xl group-hover:bg-brand-primary/10 transition-colors"></div>
              <div className="relative bg-white p-6 md:p-10 rounded-[40px] md:rounded-[56px] shadow-2xl shadow-black/5 border border-border-light overflow-hidden">
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-primary/20 animate-pulse"></div>
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-3 bg-bg-secondary rounded-full w-1/3"></div>
                    <div className="h-3 bg-bg-secondary rounded-full w-full"></div>
                  </div>
                </div>
                <div className="h-40 md:h-48 bg-bg-secondary/50 rounded-3xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-4 text-text-tertiary">
                  <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center px-8 leading-relaxed">Simulating millisecond latency updates...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dashboard Showcase: The High-Fidelity Experience (Feature Theater) */}


      {/* Workflow Section */}
      <section id="workflow" className="py-24 md:py-40 px-6 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[12rem] font-black text-bg-secondary/60 select-none -z-10 tracking-tighter hidden md:block">STEPS</div>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter mb-4">Streamline your flow</h2>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium">From idea to deployment in four simple, automated steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            {[
              { step: '01', title: 'Plan', desc: 'Map out your backlog and sprints with priority-first engine.' },
              { step: '02', title: 'Build', desc: 'Execute tasks with focused, high-performance canvas views.' },
              { step: '03', title: 'Refine', desc: 'Analyze data and optimize team flow with automatic reporting.' },
              { step: '04', title: 'Ship', desc: 'Deliver value to your customers faster than ever before.' }
            ].map((step, i) => (
              <div key={i} className="relative group text-center sm:text-left transition-all duration-500 hover:scale-105">
                <div className="text-6xl md:text-8xl font-black text-bg-secondary/50 mb-6 group-hover:text-brand-primary/10 transition-colors leading-none tracking-tighter">{step.step}</div>
                <h3 className="text-xl font-black text-text-primary mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 px-6 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black text-text-primary tracking-tighter mb-6">Flexible for every team</h2>
            <p className="text-base md:text-lg text-text-secondary font-medium">Start for free, upgrade when you're ready to scale your throughput.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">
            <div className="p-8 md:p-12 bg-white rounded-[40px] border border-border-light flex flex-col shadow-xl shadow-black/5 hover:border-brand-primary/10 transition-colors">
              <h3 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tight">Free</h3>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">For small side projects</p>
              <div className="text-5xl font-black text-text-primary mb-10 flex items-baseline gap-1 tracking-tighter">
                $0 <span className="text-sm font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">/forever</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1 font-bold text-xs text-text-secondary">
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Up to 3 boards</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Unlimited workspaces</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Basic integrations</li>
              </ul>
              <Link to="/signup" className="h-14 flex items-center justify-center rounded-2xl border-2 border-border-light font-black text-[11px] uppercase tracking-widest text-text-primary hover:bg-bg-secondary transition-colors">Start for free</Link>
            </div>

            <div className="p-8 md:p-12 bg-white rounded-[40px] border-4 border-brand-primary relative shadow-2xl shadow-brand-primary/20 flex flex-col lg:scale-105 z-10 transition-transform hover:scale-[1.07]">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 bg-brand-primary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Most Popular</div>
              <h3 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tight">Pro</h3>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">For high-growth teams</p>
              <div className="text-5xl font-black text-text-primary mb-10 flex items-baseline gap-1 tracking-tighter">
                $12 <span className="text-sm font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">/user /mo</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1 font-bold text-xs text-text-secondary">
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Unlimited boards</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Custom fields & views</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Real-time collaboration</li>
                <li className="flex items-center gap-3 font-black text-brand-primary"><Plus size={14} strokeWidth={4} /> AI Search helper</li>
              </ul>
              <Link to="/signup" className="h-14 flex items-center justify-center rounded-2xl bg-brand-primary font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/40 transition-all">Upgrade to Pro</Link>
            </div>

            <div className="p-8 md:p-12 bg-white rounded-[40px] border border-border-light flex flex-col shadow-xl shadow-black/5 hover:border-brand-primary/10 transition-colors">
              <h3 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tight">Enterprise</h3>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">For large organizations</p>
              <div className="text-5xl font-black text-text-primary mb-10 tracking-tighter">Custom</div>
              <ul className="space-y-4 mb-12 flex-1 font-bold text-xs text-text-secondary">
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> SSO & SAML 2.0</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Multi-team admin</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> Priority Support</li>
                <li className="flex items-center gap-3"><Check size={14} className="text-success" strokeWidth={4} /> 99.9% Uptime SLA</li>
              </ul>
              <button className="h-14 flex items-center justify-center rounded-2xl border-2 border-border-light font-black text-[11px] uppercase tracking-widest text-text-primary hover:bg-bg-secondary transition-colors">Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Banner */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto bg-brand-primary rounded-[48px] md:rounded-[64px] p-12 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent"></div>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
            <Zap size={300} />
          </div>
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 md:mb-12">Ready to find <br className="hidden md:block" /> your flow?</h2>
            <p className="mb-12 md:mb-16 text-white/80 max-w-xl mx-auto text-base md:text-xl font-medium leading-relaxed">
              Join thousands of teams and start managing your projects with FlowBoard today. Experience the future of team coordination.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/signup" className="h-16 md:h-20 px-12 md:px-16 flex items-center justify-center bg-white text-brand-primary text-base md:text-xl font-black uppercase tracking-widest rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 16. Footer */}
      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
