import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { 
  BookOpen, Search, HelpCircle, MessageSquare, Code, Terminal, Zap, 
  ArrowRight, Shield, Globe, Layers, Cpu, Box, Fingerprint, Lock,
  FileCode2, Github, Share2, Activity, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentationPage = () => {
  return (
    <MarketingLayout>
      {/* 1. Hero & Global Search - The Entry Point to Intelligence */}
      <section className="py-32 px-6 bg-white overflow-hidden relative border-b border-border-light">
        <div className="absolute top-0 left-0 p-64 opacity-[0.03] blur-3xl bg-brand-primary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion-reduced className="inline-flex items-center gap-3 px-6 py-2.5 mb-10 text-[10px] font-black text-brand-primary bg-brand-primary/5 rounded-full uppercase tracking-[0.3em] border border-brand-primary/10">
            <Fingerprint size={14} />
            The Architect's Handbook
          </motion-reduced>
          <h1 className="text-6xl md:text-[120px] font-black text-text-primary tracking-tighter leading-[0.85] mb-12">
            Build with <br/> <span className="text-brand-primary underline decoration-indigo-500/20 decoration-8 underline-offset-[12px]">absolute flow.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-text-secondary font-medium leading-relaxed mb-16 px-10">
             Welcome to the FlowBoard Documentation. Here, we outline the foundational principles and technical specifications 
             required to build, scale, and automate high-performance workspaces using our low-latency SDK.
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search the nexus (Boards, Cards, SDK, RLS)..." 
              className="w-full h-24 pl-20 pr-8 bg-bg-secondary border-none rounded-[40px] focus:outline-none focus:ring-8 focus:ring-brand-primary/5 transition-all text-xl font-black text-text-primary placeholder:text-text-tertiary/40 shadow-inner"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
               <kbd className="px-3 py-1.5 bg-white border border-border-light rounded-xl text-[10px] font-black text-text-tertiary shadow-sm tracking-widest uppercase">CMD K</kbd>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Architecture: The FlowBoard Engine (~200 words) */}
      <section className="py-32 px-6 bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-10">
                <div className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                   <Activity size={12} /> System Internals
                </div>
                <h2 className="text-5xl font-black text-text-primary tracking-tighter leading-[1.1]">The Physics of <br/> Project Management.</h2>
                <div className="prose prose-lg text-text-secondary font-medium leading-[1.8] space-y-6 max-w-xl">
                   <p>
                      At the heart of FlowBoard lies our custom-built <strong>Synchronization Engine</strong>. Unlike traditional REST-based project tools that rely on constant polling, our architecture uses a pervasive WebSocket layer combined with Postgres Realtime to ensure that state changes are distributed globally in under 20ms.
                   </p>
                   <p>
                      The documentation provided here covers the four fundamental pillars of our "Kinetic" ecosystem: <em>Atomic State</em>, <em>Governed Access</em>, <em>Automation Logic</em>, and <em>Semantic Connectivity</em>. Each board transition, card mutation, and comment thread is treated as an immutable event in our global log, allowing for perfect auditability and time-travel debugging.
                   </p>
                   <p>
                      By enlisting our SDK, you gain programmatic access to these internal signals, enabling you to build custom dashboard extensions, mirror data to external warehouses, or trigger industrial-scale automations based on simple UI interactions.
                   </p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                {[
                   { icon: <Database />, title: 'Atomic Persistence', desc: 'Immutable event logging for every card mutation.' },
                   { icon: <Lock />, title: 'RLS Governance', desc: 'Hardware-level row security for every user query.' },
                   { icon: <Zap />, title: 'Sync Pulse', desc: 'Low-latency state distribution via WebSocket.' },
                   { icon: <Cpu />, title: 'Logic Engine', desc: 'No-code automation translated to raw SQL.' }
                ].map((item, i) => (
                   <div key={i} className="p-10 bg-bg-secondary/30 rounded-[48px] border border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-2xl transition-all duration-500">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-sm">
                         {item.icon}
                      </div>
                      <h4 className="text-xl font-black tracking-tight mb-4">{item.title}</h4>
                      <p className="text-sm text-text-tertiary font-medium leading-relaxed">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Start: Initializing the Environment (~150 words) */}
      <section className="py-32 px-6 bg-text-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="bg-white/5 backdrop-blur-3xl p-1 p-[2px] rounded-[48px] border border-white/10 shadow-3xl">
                 <div className="bg-[#0b0c10] rounded-[46px] p-10 font-mono text-sm space-y-8 overflow-hidden relative">
                    <div className="flex items-center gap-2 mb-8 opacity-20">
                       <div className="w-3 h-3 rounded-full bg-danger"></div>
                       <div className="w-3 h-3 rounded-full bg-warning"></div>
                       <div className="w-3 h-3 rounded-full bg-success"></div>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-white/40 italic"># Step 1: Initialize the Nexas Environment</p>
                       <p className="text-success"><span className="text-indigo-400">npm install</span> @flowboard/sdk</p>
                    </div>

                    <div className="space-y-4">
                       <p className="text-white/40 italic"># Step 2: Establish Socket Connection</p>
                       <p><span className="text-indigo-400">const</span> nexus = <span className="text-brand-primary">initialize</span>(&#123;</p>
                       <p className="pl-8">key: <span className="text-warning">"fb_live_9a2f..."</span>,</p>
                       <p className="pl-8 text-white/50">// Automatic re-sync enabled</p>
                       <p className="pl-8">persistence: <span className="text-success">true</span></p>
                       <p>&#125;);</p>
                    </div>

                    <div className="space-y-4">
                       <p className="text-white/40 italic"># Step 3: Listen for Atomic Changes</p>
                       <p>nexus.<span className="text-brand-primary text-bold">on</span>(<span className="text-warning">'card:move'</span>, (event) =&gt; &#123;</p>
                       <p className="pl-8">console.<span className="text-success text-bold">log</span>(<span className="text-warning">`Flow shifting: ${event.id}`</span>);</p>
                       <p>&#125;);</p>
                    </div>

                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-5 pointer-events-none">
                       <Terminal size={400} />
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="inline-flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest px-4 py-1.5 bg-brand-primary/10 rounded-full">
                    <Zap size={12} /> Execution Layer
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">From Zero to <br/> Synchronized.</h2>
                 <p className="text-xl text-white/60 font-medium leading-relaxed">
                    Deploying the FlowBoard SDK takes less than 60 seconds. Our zero-config initialization automatically handles state reconciliation, local caching, and offline-first queueing so you can focus on building the interface.
                 </p>
                 <p className="text-lg text-white/40 leading-relaxed font-medium">
                    Whether you are building a custom CI/CD dashboard or an internal resource allocator, the SDK provides a unified `nexus` object that manages all data flows with cryptographic integrity.
                 </p>
                 <div className="pt-8 mb-2">
                    <Link to="/guides" className="flex items-center gap-4 text-brand-primary text-sm font-black uppercase tracking-widest hover:text-white transition-colors">
                       Download SDK Manual (v4.0) <ArrowRight size={16} />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. API & Scoping: Governed Intelligence (~150 words) */}
      <section className="py-32 px-6 bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto">
           <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
              <h2 className="text-5xl font-black text-text-primary tracking-tighter italic lg:text-7xl underline decoration-brand-primary/10 decoration-8 underline-offset-8">API Ecosystem.</h2>
              <p className="text-xl text-text-secondary font-medium leading-relaxed">
                 Every object in FlowBoard is a first-class citizen in our API. Manage your entire organization programmatically with granular control.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                 { title: 'The Board Object', fields: ['UUID', 'Metadata', 'Slug', 'Permission_Matrix'], desc: 'The root container for all project data and RLS rules.' },
                 { title: 'The List Vector', fields: ['Atomic_Ordering', 'Color_Shading', 'Position', 'WIP_Limits'], desc: 'Linear or non-linear stages defined within the board context.' },
                 { title: 'The Card Nucleus', fields: ['Title', 'Description', 'JSON_Metadata', 'Attachments'], desc: 'The core unit of work, rich with nested checklists and logs.' }
              ].map((obj, i) => (
                 <div key={i} className="group p-12 bg-bg-secondary/10 border border-border-light rounded-[56px] hover:bg-white hover:shadow-[0_48px_120px_-24px_rgba(0,0,0,0.1)] transition-all duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-border-light flex items-center justify-center text-brand-primary mb-10 group-hover:rotate-12 transition-transform">
                       <Box size={24} />
                    </div>
                    <h4 className="text-2xl font-black text-text-primary mb-6">{obj.title}</h4>
                    <p className="text-text-tertiary font-bold leading-relaxed mb-8">{obj.desc}</p>
                    <div className="space-y-3">
                       {obj.fields.map(f => (
                          <div key={f} className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
                             <span className="text-xs font-mono font-bold text-text-secondary text-brand-primary/60">{f}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Governance & RLS Section (~100 words) */}
      <section className="py-32 px-6 bg-bg-secondary/30">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-24">
               <div className="flex-1 space-y-10 order-2 lg:order-1">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-8 bg-white rounded-[32px] border border-border-light shadow-sm">
                        <Lock size={20} className="text-brand-primary mb-4" />
                        <h4 className="font-bold text-lg leading-tight mb-2">TLS 1.3 Encryption</h4>
                        <p className="text-xs text-text-tertiary">Every packet is encrypted at the protocol level.</p>
                     </div>
                     <div className="p-8 bg-white rounded-[32px] border border-border-light shadow-sm mt-8">
                        <Shield size={20} className="text-success mb-4" />
                        <h4 className="font-bold text-lg leading-tight mb-2">SOC2 Type II</h4>
                        <p className="text-xs text-text-tertiary">Audited governance for enterprise teams.</p>
                     </div>
                  </div>
               </div>
               <div className="flex-1 space-y-10 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-success uppercase tracking-widest px-4 py-1.5 bg-success/5 rounded-full border border-success/10">
                     <Lock size={12} /> Security Scoping
                  </div>
                  <h2 className="text-5xl font-black text-text-primary tracking-tighter leading-none">Governed by <br/> Row Level Security.</h2>
                  <div className="prose prose-lg text-text-secondary font-medium leading-[1.8] space-y-6">
                     <p>
                        FlowBoard utilizes <strong>Row Level Security (RLS)</strong> directly within the transactional database layer. This means that security isn't just a middleware check; it is a fundamental property of the data itself. Even a malformed SDK query is physically unable to access data it is not scoped for.
                     </p>
                     <p>
                        When a user initializes a nexus connection, their JWT is cryptographically verified against the workspace permission matrix. This governs not just reading, but real-time subscription signals—ensuring absolute data isolation for multi-tenant environments and client portals.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. Footer CTA - Call to Action for Contributors */}
      <section className="py-24 px-6 bg-white border-t border-border-light">
          <div className="max-w-5xl mx-auto space-y-12">
             <div className="bg-brand-primary rounded-[64px] p-24 text-center text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                <div className="relative z-10 space-y-10">
                   <h2 className="text-5xl font-black tracking-tighter leading-none">Help us evolve the <br/> technical nexus.</h2>
                   <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto">
                      Our documentation is open source. Contribute code samples, fix typos, or suggest new technical tracks directly on GitHub.
                   </p>
                   <div className="flex flex-col sm:flex-row justify-center gap-6">
                      <button className="btn bg-white text-brand-primary hover:bg-white/95 !px-12 !py-6 !text-lg !rounded-[32px] font-black shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-4">
                         <Github size={24} /> <span>Open on GitHub</span>
                      </button>
                      <button className="btn bg-brand-primary border border-white/20 text-white hover:bg-white/10 !px-12 !py-6 !text-lg !rounded-[32px] font-black transition-all">
                         Submit Technical Feedback
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center justify-between px-10 gap-10">
                <div className="flex items-center gap-6 text-text-tertiary">
                   <Share2 size={24} className="opacity-20Hover hover:opacity-100 transition-opacity cursor-pointer" />
                   <Github size={24} className="opacity-20Hover hover:opacity-100 transition-opacity cursor-pointer" />
                   <FileCode2 size={24} className="opacity-20Hover hover:opacity-100 transition-opacity cursor-pointer" />
                </div>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center">
                   © 2026 FlowBoard Engineering. All technical specifications are subject to kinetic evolution.
                </p>
             </div>
          </div>
      </section>
    </MarketingLayout>
  );
};

export default DocumentationPage;
