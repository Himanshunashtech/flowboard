import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import {
   Layout, Zap, Shield, Users, BarChart3, Layers, Check,
   MousePointer2, Search, Cpu, MessageSquare, Target,
   Activity, Box, Fingerprint, Lock, Sparkles, ArrowRight,
   Globe, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
   const mainFeatures = [
      { icon: <Layout />, title: 'Kinetic Canvas', desc: 'A 60FPS board rendering engine designed for high-density projects. Move thousands of cards with zero reactive latency.' },
      { icon: <Zap />, title: 'Atomic Sync', desc: 'Distributed state updates in under 20ms across the global nexus. Powered by a persistent WebSocket layer.' },
      { icon: <Shield />, title: 'Governed Access', desc: 'Enterprise-grade protection with hardware-level Row Level Security (RLS) and cryptographically signed JWTs.' },
      { icon: <Users />, title: 'Collaborative Portals', desc: 'Securely invite external partners into sandboxed portals without exposing internal discussion vectors.' },
      { icon: <BarChart3 />, title: 'Semantic Insights', desc: 'Advanced cycle-time monitoring and workload balancing that understands project intent through AI metadata.' },
      { icon: <Layers />, title: 'Deep Hierarchy', desc: 'Multi-level task dependencies and nested checklists designed for industrial-scale engineering complexity.' }
   ];

   return (
      <MarketingLayout>
         {/* 1. Hero Section: The Vision of Total Flow (~100 words) */}
         <section className="py-32 px-6 bg-background overflow-hidden relative border-b border-border">
            <div className="absolute top-0 left-0 p-64 opacity-[0.03] blur-3xl bg-primary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="max-w-7xl mx-auto text-center relative z-10">
               <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-10 text-[10px] font-black text-primary bg-primary/5 rounded-full uppercase tracking-[0.3em] border border-primary/10">
                  <Sparkles size={14} className="fill-current" />
                  Product Manifesto v4.0
               </div>
               <h1 className="text-5xl md:text-[130px] font-black text-foreground tracking-tighter leading-[0.8] mb-12">
                  Engineered for <br className="hidden md:block" /> <span className="text-primary">total flow.</span>
               </h1>
               <p className="max-w-3xl mx-auto text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed mb-16 px-6 md:px-10 italic opacity-80">
                  FlowBoard is a high-performance logic engine designed to eliminate the cognitive friction of management,
                  providing a unified, zero-latency canvas for teams building the next Frontier.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link to="/signup" className="h-16 md:h-20 px-8 md:px-16 flex items-center justify-center bg-primary text-primary-foreground text-sm md:text-xl font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center">
                     Start Building
                  </Link>
               </div>
            </div>
         </section>

         {/* 2. Atomic Performance: The 60FPS Canvas (~150 words) */}
         <section className="py-40 px-6 bg-background border-b border-border overflow-hidden">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                  <div className="space-y-12">
                     <div className="inline-flex items-center gap-3 text-[10px] font-black text-indigo-500 uppercase tracking-widest px-6 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                        <Activity size={12} /> Rendering Specs
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-[0.95]">Butter-smooth <br className="hidden sm:block" /> at any scale.</h2>
                     <div className="prose prose-lg text-muted-foreground font-medium leading-[1.8] space-y-6 max-w-xl">
                        <p className="text-base md:text-lg">
                           Traditional project management software struggles with "DOM-bloat," leading to jittery interactions as your board grows. Our <strong>Kinetic Canvas</strong> technology leverages hardware acceleration and virtualized list rendering to maintain a consistent 60FPS interaction rate.
                        </p>
                        <p className="text-base md:text-lg">
                           Whether you are managing a 10-card sprint or a 5,000-card global roadmap, every drag, drop, and scroll is processed with 0.02ms reactive latency.
                        </p>
                     </div>
                     <div className="p-10 bg-secondary/30 rounded-[48px] border border-border relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interaction</p>
                              <p className="text-3xl md:text-4xl font-black text-success tracking-tighter">0.02ms</p>
                           </div>
                           <div className="h-10 w-[1px] bg-border-light" />
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stability</p>
                              <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter">60 FPS</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="relative">
                     <div className="aspect-square bg-secondary border-[16px] border-white rounded-[80px] shadow-3xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] bg-cover opacity-20 transform scale-125 group-hover:scale-100 transition-transform duration-[10s] ease-linear"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center p-20">
                           <div className="w-full aspect-video bg-background/40 backdrop-blur-3xl rounded-[40px] border border-white/20 shadow-2xl flex items-center justify-center">
                              <div className="text-xl font-black text-primary tracking-[0.5em] opacity-40">KINETIC HUB</div>
                           </div>
                        </div>
                     </div>
                     <div className="absolute -bottom-10 -left-10 p-10 bg-background rounded-[40px] shadow-2xl border border-border max-w-[280px]">
                        <MousePointer2 size={32} className="text-primary mb-6" />
                        <p className="text-sm font-black text-foreground tracking-tight leading-none mb-3">Instant Vector Response</p>
                        <p className="text-xs text-muted-foreground font-bold leading-relaxed italic">Drag-and-drop feedback that matches the neural refresh rate of the human eye.</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* 3. Deep Dive: The Workflow Forge v2 (~150 words) */}
         <section className="py-40 px-6 bg-foreground text-background overflow-hidden relative">
            <div className="max-w-7xl mx-auto relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                  <div className="order-2 lg:order-1 relative">
                     <div className="space-y-8">
                        <div className="p-8 bg-background/5 rounded-3xl border border-background/10 backdrop-blur-xl flex items-center gap-8 group hover:bg-background/10 transition-colors">
                           <div className="w-16 h-16 rounded-2xl bg-warning/20 text-warning flex items-center justify-center shadow-2xl shadow-warning/20"><Zap size={28} /></div>
                           <div>
                              <h4 className="text-2xl font-black tracking-tight mb-1">When status is "In Review"</h4>
                              <p className="text-sm text-background/40 font-black uppercase tracking-widest">Protocol Initialize: Branch Sync</p>
                           </div>
                           <div className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity"><ArrowRight size={20} /></div>
                        </div>
                        <div className="h-12 w-0.5 bg-primary ml-16" />
                        <div className="p-8 bg-primary rounded-[40px] shadow-xl shadow-primary/20 flex items-center gap-8 border border-white/20">
                           <div className="w-16 h-16 rounded-2xl bg-background text-primary flex items-center justify-center"><MessageSquare size={28} /></div>
                           <div>
                              <h4 className="text-2xl font-black tracking-tight mb-1 italic">Deploy to Vercel + Slack</h4>
                              <p className="text-sm text-white/80 font-black uppercase tracking-widest">Execution Layer: Successful</p>
                           </div>
                        </div>
                     </div>
                     <div className="absolute -top-10 -right-10 opacity-[0.05] pointer-events-none scale-150">
                        <Cpu size={400} />
                     </div>
                  </div>
                  <div className="order-1 lg:order-2 space-y-12">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        <Cpu size={14} /> Logic Engine
                     </div>
                     <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.85]">Stop doing <br className="hidden sm:block" /> busy work.</h2>
                     <div className="prose prose-lg text-background/50 font-medium leading-[1.8] space-y-6">
                        <p>
                           Administrative overhead is the silent killer of engineering velocity. FlowBoard's <strong>Workflow Forge</strong> allows you to automate repetitive multi-step actions using high-level conditional logic.
                        </p>
                        <p>
                           Build triggers that respond to board transitions, date mutations, or external webhook signals. Want to notify a Slack channel only when a card with a specific "Urgent" metadata tag moves to the fourth list on a Friday? Our logic builder handles the complexity so your team can focus on shipping code.
                        </p>
                     </div>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        {[
                           'Conditional logic branching',
                           'Global workspace triggers',
                           'External webhook listeners',
                           'AI-suggested flow repairs'
                        ].map((item, i) => (
                           <li key={i} className="flex items-center gap-5 text-sm font-black italic tracking-tight">
                              <div className="w-10 h-10 rounded-2xl bg-background/10 text-primary flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-primary transition-all">
                                 <Check size={18} strokeWidth={4} />
                              </div>
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </section>

         {/* 4. Collaboration: The Unified Portal Matrix (~100 words) */}
         <section className="py-24 px-6 md:px-12 bg-background overflow-hidden relative border-b border-border">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                  <div className="space-y-12">
                     <div className="inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest px-6 py-2 bg-primary/10 rounded-full border border-primary/20">
                        <Globe size={12} /> Connectivity
                     </div>
                     <h2 className="text-6xl font-black text-foreground tracking-tighter leading-[0.95]">Total <br /> Transparency.</h2>
                     <p className="text-xl text-muted-foreground leading-relaxed font-medium italic">
                        Eliminate the "status update" meeting. Provide stakeholders with real-time access to the exact data they need, no more, no less.
                     </p>
                     <div className="prose prose-lg text-muted-foreground/80 font-medium leading-[1.8]">
                        The <strong>Unified Portal Matrix</strong> allows you to spin up sandboxed environments for clients and external partners. These portals are cryptographically isolated from your internal private discussions, yet they stay perfectly in sync with the board data you choose to share.
                     </div>
                     <div className="flex items-center gap-10 opacity-40 text-foreground">
                        <Share2 size={40} />
                        <Users size={40} />
                        <MessageSquare size={40} />
                     </div>
                  </div>
                  <div className="p-1 p-[2px] bg-gradient-to-tr from-primary/20 via-transparent to-indigo-500/20 rounded-[64px] shadow-3xl">
                     <div className="bg-secondary rounded-[62px] p-16 space-y-12 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 p-32 opacity-[0.03] text-primary"><Globe size={300} /></div>
                        <div className="space-y-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Access View</span>
                           <div className="h-4 w-48 bg-card rounded-full"></div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/20"></div>
                              <div className="flex-1 space-y-2">
                                 <div className="h-3 w-40 bg-card rounded-full"></div>
                                 <div className="h-2 w-24 bg-card/60 rounded-full"></div>
                              </div>
                              <div className="h-8 w-24 bg-success/20 text-success text-[10px] font-black italic rounded-full flex items-center justify-center">PORTAL ACTIVE</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <section className="py-40 px-6 bg-secondary/10">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {mainFeatures.map((f, i) => (
                     <div key={i} className="group p-12 bg-card rounded-[64px] border border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-700 cursor-default">
                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-10 shadow-sm border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-3 transition-all duration-500">
                           {f.icon}
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-6 tracking-tight">{f.title}</h3>
                        <p className="text-muted-foreground font-bold leading-[1.7] italic">{f.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section className="py-40 px-6 bg-background">
            <div className="max-w-4xl mx-auto text-center space-y-12">
               <h2 className="text-5xl font-black text-foreground tracking-tighter italic">Governed for the enterprise.</h2>
               <div className="prose prose-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                  FlowBoard's security isn't an afterthought. Every query is filtered through hard-coded Row Level Security (RLS) rules, ensuring your data is isolated at the physical storage layer.
               </div>
               <div className="flex flex-wrap justify-center gap-12 pt-8">
                  {[
                     { icon: <Lock />, label: 'AES-256 ENCRYPTION' },
                     { icon: <Shield />, label: 'SOC2 TYPE II AUDITED' },
                     { icon: <Fingerprint />, label: 'BIOMETRIC INVARIANT AUTH' }
                  ].map((s, i) => (
                     <div key={i} className="flex items-center gap-4 text-xs font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 px-8 py-4 rounded-3xl border border-border">
                        {s.icon} <span>{s.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>


      </MarketingLayout>
   );
};

export default FeaturesPage;
