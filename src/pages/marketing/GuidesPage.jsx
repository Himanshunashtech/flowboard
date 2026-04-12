import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { MousePointer2, Zap, Layout, Terminal, PlayCircle, BookOpen, ArrowRight, Check, Download, Users, BarChart3, Star } from 'lucide-react';

const GuidesPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Strategy Overview */}
            <section className="py-20 md:py-24 px-6 bg-gradient-to-b from-bg-secondary/30 to-white text-center border-b border-border-light overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <BookOpen size={12} />
                        Strategic Resources
                    </span>
                    <h1 className="text-4xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-8 md:mb-10">
                        Expert <span className="text-brand-primary">guides.</span>
                    </h1>
                    <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium px-4 md:px-0">
                        Learn how the world's most innovative teams use FlowBoard to eliminate friction, 
                        shorten cycle times, and build a culture of high performance.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20">Read Latest Guide</button>
                        <button className="h-14 px-8 flex items-center justify-center bg-bg-secondary text-text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl">Browse by Topic</button>
                    </div>
                </div>
            </section>

            {/* 2. Popular Deep Dives */}
            <section className="py-24 md:py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-16 md:mb-20">Master your workflow.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {[
                            { icon: <Layout />, category: 'Agile', title: 'The Sprint Velocity Engine', desc: 'How to structure your boards to measure and increase team output by 30% in under three months.' },
                            { icon: <Zap />, category: 'Automation', title: 'Zero-Maintenance Boards', desc: 'A complete blueprint for setting up absolute automation triggers that keep your board tidy without manual effort.' },
                            { icon: <MousePointer2 />, category: 'Leadership', title: 'Leading Remote-First Teams', desc: 'Communication strategies and board configurations that foster trust and alignment across time zones.' },
                            { icon: <Terminal />, category: 'Architecture', title: 'API-Driven Governance', desc: 'Leveraging our REST and GraphQL APIs to build custom reporting and compliance gates for large organizations.' }
                        ].map((guide, i) => (
                            <div key={i} className="group p-8 md:p-12 bg-bg-secondary/20 rounded-[40px] md:rounded-[48px] border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer">
                                <div className="flex items-center gap-6 mb-8 md:mb-10">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                        {React.cloneElement(guide.icon, { size: 28 })}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{guide.category} Masterclass</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 group-hover:text-brand-primary transition-colors tracking-tight">{guide.title}</h3>
                                <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium mb-8 md:mb-10">{guide.desc}</p>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary group-hover:text-brand-primary transition-colors flex items-center gap-3">Start Reading Guide <ArrowRight size={16} /></span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Case Study Spotlight */}
            <section className="py-24 md:py-32 px-6 bg-text-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-10 blur-3xl bg-brand-secondary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                        <div className="space-y-8 md:space-y-10">
                            <div className="inline-flex items-center gap-2 text-brand-secondary font-bold tracking-widest uppercase text-xs">
                                <Users size={16} /> success story
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1]">
                                Scaling to <br className="hidden md:block"/> 500+ users.
                            </h2>
                            <p className="text-lg md:text-xl text-white/60 leading-relaxed font-medium">
                                Learn how GlobalTech migrated 14 disparate tools into FlowBoard, 
                                resulting in a 40% reduction in licensing costs and a 2x increase in shipping frequency.
                            </p>
                            <div className="grid grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <p className="text-3xl md:text-4xl font-black text-brand-secondary mb-1">40%</p>
                                    <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-white/40">Cost Reduction</p>
                                </div>
                                <div>
                                    <p className="text-3xl md:text-4xl font-black text-brand-secondary mb-1">2.4x</p>
                                    <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-white/40">Release Speed</p>
                                </div>
                            </div>
                            <button className="h-14 px-8 flex items-center justify-center bg-white text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-2xl">Download Case Study PDF</button>
                        </div>
                        <div className="aspect-square bg-white/5 rounded-[48px] md:rounded-[64px] border border-white/10 p-8 md:p-12 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/20 to-transparent"></div>
                            <div className="h-full border border-white/10 rounded-[32px] md:rounded-[48px] flex items-center justify-center">
                                <BarChart3 size={100} className="text-brand-secondary opacity-30 w-24 h-24 md:w-32 md:h-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. The Agile Masterclass */}
            <section className="py-24 md:py-32 px-6 bg-white overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-6">
                        <PlayCircle size={48} className="mx-auto text-brand-primary" />
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">The Flow Masterclass.</h2>
                        <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed px-4 md:px-0">
                            A 12-module video course designed for project managers, team leads, and founders 
                            who want to build self-optimizing boards.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { module: 'Module 01', title: 'The Physics of Work', desc: 'Understanding cycle time, lead time, and the cost of context switching.' },
                            { module: 'Module 02', title: 'Board Architecture', desc: 'Laying the foundation for visual management that actually reflects reality.' },
                            { module: 'Module 03', title: 'Smart Automation', desc: 'Advanced logic sequences to automate the administrative burden.' }
                        ].map((m, i) => (
                            <div key={i} className="p-8 md:p-10 bg-bg-secondary/30 rounded-[32px] md:rounded-[40px] text-center space-y-6 border border-transparent hover:border-brand-primary/20 transition-all">
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-4 py-1 rounded-full">{m.module}</span>
                                <h4 className="text-xl md:text-2xl font-black tracking-tight">{m.title}</h4>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed px-4">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Weekly Strategy Newsletter */}
            <section className="py-24 md:py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="p-8 md:p-10 bg-white rounded-[40px] md:rounded-[48px] border border-border-light shadow-2xl space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center"><Check size={24} /></div>
                                    <h4 className="font-bold text-lg md:text-xl">Strategy of the week</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-text-secondary font-medium leading-relaxed border-l-4 border-brand-primary pl-6 py-2 italic text-base md:text-lg">
                                        "Batch your communication cards. Don't let every update trigger a notification. 
                                        Move them to a 'Pending Discussion' list and sync once a day."
                                    </p>
                                </div>
                                <div className="flex items-center justify-center p-4 bg-bg-secondary rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                                    Read and used by 45,000+ subscribers
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-8 md:space-y-10">
                            <div className="inline-flex items-center gap-2 text-brand-primary font-bold tracking-widest uppercase text-xs">
                                <Zap size={16} /> stay sharp
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1]">
                                Weekly <br className="hidden md:block"/> <span className="text-brand-primary italic">strategies.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                                No product news, just pure strategy. Every Tuesday, we send one highly-actionable 
                                workflow tip used by top-tier engineering teams.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input type="email" placeholder="email@example.com" className="flex-1 px-8 py-4 md:py-5 bg-bg-secondary border border-border-light rounded-[20px] md:rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold placeholder:text-text-tertiary" />
                                <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-[20px] md:rounded-[24px]">Join Weekly</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Performance Audit CTA */}
            <section className="py-24 md:py-32 px-4 md:px-6 bg-white overflow-hidden">
                <div className="max-w-4xl mx-auto bg-brand-primary rounded-[48px] md:rounded-[64px] p-12 md:p-24 text-center text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent"></div>
                    <div className="relative z-10 space-y-10 md:space-y-12">
                        <Star size={40} className="mx-auto text-warning animate-pulse md:w-12 md:h-12" />
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Flow Audit Tool.</h2>
                        <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto font-medium px-4 md:px-0">
                            Download our free self-assessment tool to identify bottlenecks in your team workflow.
                        </p>
                        <button className="h-16 px-8 flex items-center justify-center bg-white text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-105 gap-4 mx-auto">
                            <Download size={24} /> Get the PDF Audit
                        </button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default GuidesPage;
