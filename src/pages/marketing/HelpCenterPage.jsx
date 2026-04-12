import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { 
  HelpCircle, Search, Mail, Phone, PlayCircle, Shield, CreditCard, 
  Users, Settings, MessageSquare, ArrowRight, LifeBuoy, Zap, Target, 
  Layers, Lock, Sparkles, HeartHandshake, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero & The Intelligent Search Console */}
            <section className="py-32 px-6 bg-gradient-to-b from-bg-secondary/30 via-bg-secondary/10 to-white overflow-hidden relative border-b border-border-light">
                <div className="absolute top-0 right-0 p-64 opacity-[0.05] blur-3xl bg-brand-primary rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-10 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.3em] border border-brand-primary/10">
                        <LifeBuoy size={14} />
                        FlowBoard Concierge
                    </div>
                    <h1 className="text-4xl md:text-[110px] font-black text-text-primary tracking-tighter leading-[0.85] mb-8 md:mb-12">
                        How can we <br className="hidden md:block"/> <span className="text-brand-primary">empower you?</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-base md:text-xl text-text-secondary font-medium leading-relaxed mb-10 md:mb-16 px-6">
                        Access our complete library of articles, video masterclasses, and technical guides designed 
                        to help you master the kinetic landscape of FlowBoard.
                    </p>

                    <div className="max-w-4xl mx-auto relative group">
                        <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={24} />
                        <input 
                            type="text" 
                            placeholder="Describe your challenge..." 
                            className="w-full h-16 md:h-28 pl-16 md:pl-24 pr-8 md:pr-12 bg-white border border-border-light rounded-[32px] md:rounded-[48px] shadow-2xl shadow-black/5 focus:outline-none focus:ring-8 focus:ring-brand-primary/5 transition-all text-lg md:text-2xl font-black text-text-primary placeholder:text-text-tertiary/30"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                           <button className="bg-brand-primary text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-3xl hover:bg-brand-primary-hover active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
                               Search Intelligence
                           </button>
                        </div>
                    </div>
                    
                    <div className="mt-12 flex flex-wrap justify-center gap-8 text-[11px] font-black text-text-tertiary uppercase tracking-widest">
                        <span className="opacity-40">Frequent Vectors:</span>
                        <a href="#" className="text-brand-primary hover:underline decoration-2 underline-offset-8">Onboarding Logic</a>
                        <a href="#" className="text-brand-primary hover:underline decoration-2 underline-offset-8">API Authentication</a>
                        <a href="#" className="text-brand-primary hover:underline decoration-2 underline-offset-8">Team Scoping</a>
                        <a href="#" className="text-brand-primary hover:underline decoration-2 underline-offset-8">Invoicing Sync</a>
                    </div>
                </div>
            </section>

            {/* 2. The Knowledge Lattice: Categories Deep-Dive (~200 words) */}
            <section className="py-32 px-6 bg-white border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                       <h2 className="text-5xl font-black text-text-primary tracking-tighter">Structured Governance.</h2>
                       <p className="text-xl text-text-secondary font-medium leading-relaxed italic opacity-70">
                          We've organized our assistance into mission-critical streams to ensure you find clarity in milliseconds.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            { icon: <Users />, title: 'Getting Started', desc: 'The foundational path for new architects. Learn to initialize your first workspace, define kinetic lists, and map your team hierarchy. This section covers the "Day Zero" protocols for a successful launch.' },
                            { icon: <CreditCard />, title: 'Billing & Plans', desc: 'Manage the economic flow of your organization. Transition between seats, upgrade to Enterprise modules, and download cryptographically-signed invoices for your financial audits.' },
                            { icon: <Settings />, title: 'Workspace Settings', desc: 'Configure the underlying physics of your canvas. Custom metadata fields, global WIP limits, and board-level automation triggers are detailed here for administrative leads.' },
                            { icon: <Shield />, title: 'Privacy & Security', desc: 'Technical documentation on our SOC2 Type II compliance, data encryption at rest (AES-256), and row-level security (RLS) scoping for cross-tenant environments.' },
                            { icon: <MessageSquare />, title: 'Collaboration Pulse', desc: 'Master real-time presence and semantic commenting. Learn how to invite external clients into collaborative portals without exposing internal strategic discussion vectors.' },
                            { icon: <Zap />, title: 'Automation Engine', desc: 'Deep-dive into the "Protocol Engine." Build multi-step logic triggers that connect your FlowBoard state to external webhooks, Slack threads, and GitHub deployments.' }
                        ].map((item, i) => (
                            <div key={i} className="group p-12 bg-bg-secondary/20 rounded-[56px] border border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-[0_64px_120px_-24px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 text-brand-primary opacity-[0.02] group-hover:opacity-10 transition-opacity">
                                   {React.cloneElement(item.icon, { size: 120 })}
                                </div>
                                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-brand-primary mb-10 shadow-sm border border-border-light group-hover:bg-brand-primary group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                                    {item.icon}
                                </div>
                                <h4 className="text-2xl font-black text-text-primary mb-6 tracking-tight leading-none">{item.title}</h4>
                                <p className="text-text-tertiary font-bold leading-[1.8] mb-12 text-sm">{item.desc}</p>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary group-hover:text-brand-primary transition-colors flex items-center gap-3">
                                   Access Category Intelligence <ArrowRight size={14} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Popular Intelligence: High-Impact Articles (~150 words) */}
            <section className="py-32 px-6 bg-bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
                         <div className="max-w-2xl space-y-8">
                            <h2 className="text-5xl md:text-6xl font-black text-text-primary tracking-tighter leading-none">The Pulse of the <br/> Community.</h2>
                            <p className="text-xl text-text-secondary font-medium leading-relaxed">
                               Discover the guides that have redefined velocity for over 10,000 engineering teams globally.
                            </p>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                               <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Current Index</p>
                               <p className="text-xl font-black text-text-primary italic">542 ARTICLES</p>
                            </div>
                            <button className="btn bg-white border border-border-light text-text-primary !rounded-3xl !px-12 !py-6 font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-xl">Browse Full Registry</button>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: 'The definitive guide to scoping RLS for client-facing portals', reads: '14k+ reads' },
                            { title: 'Establishing a logic-first culture: 10 automations every PM needs', reads: '9k+ reads' },
                            { title: 'From Trello to FlowBoard: Migrating 100+ boards in under an hour', reads: '6k+ reads' },
                            { title: 'Synthesizing Slack data: Real-time alerts via logic webhooks', reads: '11k+ reads' },
                            { title: 'SSO and SAML 2.0: Architecture for Fortune 500 security teams', reads: '4k+ reads' },
                            { title: 'Keyboard Mastery: Navigating the Board page at 120 actions-per-minute', reads: '18k+ reads' }
                        ].map((article, i) => (
                            <div key={i} className="flex items-center justify-between p-10 bg-white rounded-[40px] border border-border-light hover:shadow-2xl transition-all cursor-pointer group">
                                <div className="space-y-2">
                                   <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{article.reads}</div>
                                   <div className="font-black text-xl text-text-primary group-hover:text-brand-primary transition-colors pr-10 leading-snug">{article.title}</div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center text-text-tertiary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                   <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Academy & Video Training (~100 words) */}
            <section className="py-40 px-6 bg-white overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-12">
                            <div className="inline-flex items-center gap-3 text-brand-primary font-black tracking-[0.3em] uppercase text-[10px] px-6 py-2.5 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                                <Sparkles size={14} className="fill-current" /> Cinematic Academy
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.85]">
                                Visualize your <br/> <span className="text-brand-primary">mastery.</span>
                            </h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                Technical manuals are only half the battle. Our Academy provides high-definition video masterclasses 
                                that demonstrate how to translate corporate goals into automated kinetic flows.
                            </p>
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { time: '4m 20s', title: 'Onboarding Logic for High-Growth Engineering Teams' },
                                    { time: '12m 45s', title: 'The Physics of the Protocol Engine: Advanced Automation' },
                                    { time: '9m 12s', title: 'Governance Mastery: RLS, JWT, and Enterprise Defense' }
                                ].map((v, i) => (
                                    <div key={i} className="flex items-center gap-6 group cursor-pointer p-6 bg-bg-secondary/10 rounded-3xl hover:bg-white border border-transparent hover:border-border-light transition-all shadow-hover-xl">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                            <PlayCircle size={24} />
                                        </div>
                                        <div className="flex-1">
                                           <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Lesson 0{i+1} • {v.time}</div>
                                           <span className="font-black text-xl text-text-primary leading-tight block">{v.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-10 bg-brand-primary/5 rounded-[80px] blur-3xl opacity-50"></div>
                            <div className="relative aspect-video bg-text-primary rounded-[64px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden border-[12px] border-white group-hover:rotate-1 transition-transform duration-1000">
                                <PlayCircle size={100} className="text-white opacity-20 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 cursor-pointer z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between text-white z-10">
                                    <div className="h-1.5 bg-white/10 rounded-full flex-1 mx-6">
                                        <div className="h-full w-2/3 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(79,70,229,0.8)]"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Now Streaming: Advanced Logic</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </section>

            {/* 5. Human-to-Human Support (~100 words) */}
            <section className="py-32 px-6 bg-text-primary text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-brand-primary via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-24 space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic lg:leading-[0.9]">Human <br/> Intelligence.</h2>
                        <p className="text-xl text-white/50 font-medium leading-relaxed">Sometimes intelligence requires absolute nuance. Our global engineering support team is online 24/7 to resolve your protocol challenges.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: <Mail />, title: 'Direct Transmission', desc: 'Typical resolution in under 4 hours. Best suited for detailed technical audits.', value: 'support@flowboard.pro' },
                            { icon: <MessageSquare />, title: 'Kinetic Live Chat', desc: 'Instant access for Pro and Enterprise leads. Real-time debugging via messenger.', value: 'Initialize Messenger' },
                            { icon: <Target />, title: 'Executive Line', desc: 'Dedicated 24/7 response for S1 enterprise incidents with priority routing.', value: '+1 (888) NIB-FLOW' }
                        ].map((item, i) => (
                            <div key={i} className="p-12 bg-white/5 border border-white/5 rounded-[64px] text-center space-y-10 hover:bg-white/10 hover:shadow-2xl transition-all duration-500 group">
                                <div className="w-20 h-20 bg-brand-primary/20 rounded-[32px] flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 transition-transform shadow-xl shadow-brand-primary/10">
                                    {item.icon}
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-3xl font-black tracking-tight">{item.title}</h4>
                                    <p className="text-sm text-white/40 font-medium leading-relaxed px-4">{item.desc}</p>
                                </div>
                                <button className="text-xl font-black text-brand-primary hover:text-white transition-colors underline decoration-brand-primary/30 decoration-dashed underline-offset-8 decoration-2">{item.value}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. The Last Mile CTA */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-brand-primary rounded-[72px] p-24 md:p-40 text-center space-y-12 relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 text-[40rem] font-black text-white/5 leading-none select-none pointer-events-none italic tracking-tighter">?</div>
                        
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/20 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 z-10">
                           <HeartHandshake size={14} /> Global Success Team
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] z-10">Still out of <br/> alignment?</h2>
                        <p className="text-2xl text-white/60 font-medium max-w-2xl z-10">We prioritize your velocity. Connect with us via social or visit our dedicated developer portal for specialized help.</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10 pt-8 w-full max-w-md">
                            <Link to="/contact" className="w-full bg-white text-brand-primary !rounded-[32px] !px-12 !py-6 font-black text-xl shadow-2xl hover:scale-105 transition-all text-center">
                               Contact Architect
                            </Link>
                            <Link to="/community" className="w-full bg-black/20 text-white border border-white/20 !rounded-[32px] !px-12 !py-6 font-black text-xl hover:bg-black/30 transition-all text-center">
                               Community Nexus
                            </Link>
                        </div>

                        <div className="flex justify-center gap-10 pt-12 z-10 opacity-40">
                           <Globe size={24} className="text-white" />
                           <Zap size={24} className="text-white" />
                           <Target size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default HelpCenterPage;
