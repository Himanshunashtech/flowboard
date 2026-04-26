import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
// Dashboard screenshots (Moved to public/assets)
const dashboardScreen1 = '/assets/Screenshot 2026-04-12 134609.png';
const dashboardScreen2 = '/assets/Screenshot 2026-04-12 134713.png';
const dashboardScreen3 = '/assets/Screenshot 2026-04-12 134739.png';

const LandingPage = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="bg-background min-h-screen selection:bg-primary/10 overflow-x-hidden">
      {/* 1. Header/Nav */}
      <MarketingHeader />

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-16 md:pt-24 pb-0 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-flex items-center gap-3 px-4 py-1.5 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
              <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded shadow-sm" />
              FlowBoard 2.0 is live
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.95] mb-8">
              Manage projects <br className="hidden sm:block" /> with unparalleled <span className="text-primary">flow.</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              FlowBoard is the modern command center for high-performance teams.
              Visualize work, automate boring tasks, and scale without limits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 md:mb-24">
              {user ? (
                <Link to="/dashboard" className="h-16 px-12 flex items-center justify-center bg-primary text-primary-foreground text-base font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="h-16 px-10 flex items-center justify-center bg-primary text-primary-foreground text-base font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                    Start free trial
                  </Link>
                  <button className="h-16 px-10 flex items-center justify-center bg-secondary text-foreground text-base font-black uppercase tracking-widest rounded-3xl hover:bg-muted transition-all">
                    Book a demo
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 3. Detailed Feature Sections (Replacing the stack) */}
          <div className="space-y-32 md:space-y-64 mt-32">
            {/* Section 1: Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="text-left space-y-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-4 py-2 rounded-full">Dashboard</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Built for High-Density <span className="text-primary">Engineering.</span></h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  The dashboard provides a bird's-eye view of your entire project landscape. 
                  Monitor cycle times, identify bottlenecks, and balance workloads across teams 
                  with our 60FPS rendering engine.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="px-6 py-3 bg-card rounded-2xl border border-border flex items-center gap-3">
                    <Zap className="text-primary" size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Real-time Analytics</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-card shadow-2xl">
                  <img src={dashboardScreen1} alt="Dashboard" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>

            {/* Section 2: Board (Reversed) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="relative group order-2 lg:order-1">
                <div className="absolute -inset-4 bg-blue-500/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-card shadow-2xl">
                  <img src={dashboardScreen2} alt="Board" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-left space-y-6 order-1 lg:order-2 lg:pl-12">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-500/10 px-4 py-2 rounded-full">Board</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Global State, <span className="text-blue-500">Local Speed.</span></h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  Our Kinetic Canvas allows you to manage thousands of cards with zero latency. 
                  Distributed WebSocket architecture ensures your entire team stays in sync 
                  at millisecond speeds.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="px-6 py-3 bg-card rounded-2xl border border-border flex items-center gap-3">
                    <Layout className="text-blue-500" size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Kinetic UI</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Teams */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="text-left space-y-6">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-2 rounded-full">Teams</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Security Without <span className="text-emerald-500">Friction.</span></h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  Collaborative portals for clients and partners. Cryptographically isolated 
                  workspaces protected by physical-layer RLS policies ensure your internal 
                  data stays internal.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="px-6 py-3 bg-card rounded-2xl border border-border flex items-center gap-3">
                    <Users className="text-emerald-500" size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Sandboxed Portals</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-card shadow-2xl">
                  <img src={dashboardScreen3} alt="Teams" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-20 border-y border-border bg-secondary/20 overflow-hidden">
        <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-12 px-6">Trusted by the world's most innovative teams</p>
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
      <section id="features" className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black text-foreground tracking-tighter mb-6 leading-tight">Everything you <br className="sm:hidden" /> need to ship faster</h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">Ditch the spreadsheets and fragmented tools for a unified workspace built for the next decade of work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Layout />, title: 'Kinetic Canvas', desc: 'A 60FPS board rendering engine designed for high-density projects. Move thousands of cards without a single frame drop.' },
              { icon: <Zap />, title: 'Atomic Sync', desc: 'Distributed state updates in under 20ms across the global nexus. Powered by a persistent WebSocket layer.' },
              { icon: <Shield />, title: 'Governed Access', desc: 'Every data block is protected by hardware-level Row Level Security (RLS) and cryptographically signed JWTs.' },
              { icon: <Users />, title: 'Collaborative Portals', desc: 'Securely invite external partners into sandboxed portals without exposing internal discussions.' },
              { icon: <BarChart3 />, title: 'Semantic Analytics', desc: 'Advanced cycle-time monitoring and workload balancing that understands project intent through AI metadata.' },
              { icon: <Layers />, title: 'Workflow Forge', desc: 'Ditch the busy work. Automate multi-step actions using high-level conditional logic branching.' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 md:p-10 bg-secondary/30 rounded-[40px] border border-border/50 hover:border-primary/10 hover:bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-foreground mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Breakdown */}
      <section className="py-24 md:py-32 px-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
              <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter leading-[1] mb-6 md:mb-10">Real-time <br className="hidden sm:block" /> Collaboration.</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-xl">
                Work together in perfect harmony. See who's online, who's typing,
                and watch tasks move across the board in real-time.
              </p>
              <ul className="space-y-5">
                {[
                  'Live presence indicators',
                  'Instant comment notifications',
                  'Collaborative card editing'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-black text-foreground uppercase tracking-widest">
                    <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/features" className="inline-flex items-center gap-2 group text-primary font-black uppercase text-xs tracking-widest pt-4">
                Explore features <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative group order-1 lg:order-2">
              <div className="absolute -inset-4 bg-primary/5 rounded-[48px] blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="relative bg-card p-6 md:p-10 rounded-[40px] md:rounded-[56px] shadow-2xl shadow-black/5 border border-border overflow-hidden">
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/20 animate-pulse"></div>
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-3 bg-secondary rounded-full w-1/3"></div>
                    <div className="h-3 bg-secondary rounded-full w-full"></div>
                  </div>
                </div>
                <div className="h-40 md:h-48 bg-secondary/50 rounded-3xl border border-dashed border-border overflow-hidden relative">
                  {/* Kinetic Flow Animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M-50 100H150L180 70H220L250 130H450"
                        stroke="url(#gradient1)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, pathOffset: 0 }}
                        animate={{ pathLength: 0.3, pathOffset: 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }}
                      />
                      <motion.path
                        d="M-50 150H120L150 180H250L280 120H450"
                        stroke="url(#gradient2)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, pathOffset: 0 }}
                        animate={{ pathLength: 0.4, pathOffset: 1 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
                      />
                      <motion.path
                        d="M-50 50H180L210 20H300L330 80H450"
                        stroke="url(#gradient3)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, pathOffset: 0 }}
                        animate={{ pathLength: 0.35, pathOffset: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }}
                        style={{ filter: 'drop-shadow(0 0 8px #8b5cf6)' }}
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0" y1="100" x2="400" y2="100" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="0.5" stopColor="#3b82f6" />
                          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0" y1="150" x2="400" y2="150" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#10b981" stopOpacity="0" />
                          <stop offset="0.5" stopColor="#10b981" />
                          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0" y1="50" x2="400" y2="50" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8b5cf6" stopOpacity="0" />
                          <stop offset="0.5" stopColor="#8b5cf6" />
                          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-[1px]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground text-center px-8 leading-relaxed shadow-sm">
                      Syncing Atomic State...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dashboard Showcase: The High-Fidelity Experience (Feature Theater) */}


      {/* Workflow Section */}
      <section id="workflow" className="py-24 md:py-40 px-6 bg-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[12rem] font-black text-secondary/60 select-none -z-10 tracking-tighter hidden md:block">STEPS</div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4">Streamline your flow</h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">From idea to deployment in four simple, automated steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            {[
              { step: '01', title: 'Plan', desc: 'Map out your backlog and sprints with priority-first engine.' },
              { step: '02', title: 'Build', desc: 'Execute tasks with focused, high-performance canvas views.' },
              { step: '03', title: 'Refine', desc: 'Analyze data and optimize team flow with automatic reporting.' },
              { step: '04', title: 'Ship', desc: 'Deliver value to your customers faster than ever before.' }
            ].map((step, i) => (
              <div key={i} className="relative group text-center sm:text-left transition-all duration-500 hover:scale-105">
                <div className="text-6xl md:text-8xl font-black text-secondary/50 mb-6 group-hover:text-primary/10 transition-colors leading-none tracking-tighter">{step.step}</div>
                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Removed as it is now free */}


      {/* CTA Final Banner */}



      {/* 16. Footer */}
      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
