import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { BookOpen, Search, HelpCircle, MessageSquare, Code, Terminal, Zap, ArrowRight, Shield, Globe, Layers } from 'lucide-react';

const DocumentationPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero & Global Search */}
            <section className="py-24 px-6 bg-white overflow-hidden relative border-b border-border-light">
                <div className="absolute top-0 left-0 p-32 opacity-5 blur-3xl bg-brand-primary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em]">
                        <BookOpen size={12} />
                        Developer Documentation
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-10">
                        Built for <br/> <span className="text-brand-primary">builders.</span>
                    </h1>
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search docs, APIs, and libraries..." 
                            className="w-full h-18 pl-16 pr-8 bg-bg-secondary border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-lg"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
                           <kbd className="px-2 py-1 bg-white border border-border-light rounded text-[10px] font-bold text-text-tertiary shadow-sm">CMD</kbd>
                           <kbd className="px-2 py-1 bg-white border border-border-light rounded text-[10px] font-bold text-text-tertiary shadow-sm">K</kbd>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Quick Start / Fundamentals */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                        <div className="space-y-10">
                            <h2 className="text-5xl font-bold tracking-tighter leading-tight">Get running in <br/> under 5 minutes.</h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                Follow our step-by-step guide to setting up your first workspace, 
                                inviting your team, and configuring your high-performance canvas.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { step: '01', title: 'Account Setup', desc: 'Initialize your workspace and profile defaults.' },
                                    { step: '02', title: 'Core Definitions', desc: 'Define your lists, labels, and custom metadata.' },
                                    { step: '03', title: 'First Trigger', desc: 'Connect Slack or Email for your first automation.' }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="text-sm font-black text-brand-primary/20 group-hover:text-brand-primary transition-colors">{s.step}</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                                            <p className="text-sm text-text-secondary font-medium leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-text-primary rounded-[48px] p-8 shadow-3xl text-white font-mono text-sm space-y-4 overflow-hidden relative">
                             <div className="flex items-center gap-2 mb-6 opacity-30">
                                <div className="w-3 h-3 rounded-full bg-danger"></div>
                                <div className="w-3 h-3 rounded-full bg-warning"></div>
                                <div className="w-3 h-3 rounded-full bg-success"></div>
                             </div>
                             <div className="space-y-2">
                                <p className="text-success"># Install the FlowBoard SDK</p>
                                <p><span className="text-brand-secondary">npm install</span> @flowboard/sdk</p>
                             </div>
                             <div className="space-y-2">
                                <p className="text-success">// Initialize client</p>
                                <p><span className="text-brand-secondary">import</span> &#123; createClient &#125; <span className="text-brand-secondary">from</span> '@flowboard/sdk'</p>
                                <p><span className="text-brand-secondary">const</span> flow = <span className="text-success">createClient</span>(&#123;</p>
                                <p className="pl-6">apiKey: <span className="text-warning">process.env.FB_API_KEY</span></p>
                                <p>&#125;)</p>
                             </div>
                             <div className="absolute -bottom-10 -right-10 scale-150 opacity-10 pointer-events-none">
                                <Terminal size={200} />
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. API & SDK Deep Dive */}
            <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight">The SDK Architecture.</h2>
                        <p className="text-lg text-text-secondary font-medium">We built our core as a set of modular libraries so you can use only what you need.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <Terminal />, title: 'Core SDK', desc: 'Board management, card CRUD, and workspace settings.' },
                            { icon: <Zap />, title: 'Automation Lib', desc: 'The logic engine for custom triggers and remote actions.' },
                            { icon: <Shield />, title: 'Auth Service', desc: 'Securely manage session tokens and permission scoping.' },
                            { icon: <Layers />, title: 'UI Kit', desc: 'React components for building your own board-based apps.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-white rounded-[40px] border border-border-light hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center text-brand-primary mb-8 border border-border-light">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Advanced Tutorials */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold tracking-tight mb-20">Advanced Tutorials.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[
                            { tag: 'Advanced', title: 'Multi-tenant Client Portals', desc: 'Learn how to use RLS and the FlowBoard SDK to build isolated client-facing dashboards for your service business.' },
                            { tag: 'Efficiency', title: 'Automated Sprint Reporting', desc: 'Generate PDF reports every Friday at 5 PM using our Cron engine and external storage webhooks.' },
                            { tag: 'Integration', title: 'Custom Figma Plugin', desc: 'A step-by-step guide to mapping design comments in Figma directly to FlowBoard cards.' },
                            { tag: 'Security', title: 'SSO Scoping with Okta', desc: 'Configure advanced attribute mapping for automatic team assignment via SAML 2.0 signatures.' }
                        ].map((t, i) => (
                            <div key={i} className="group p-10 bg-bg-secondary/20 rounded-[48px] border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer">
                                <span className="px-3 py-1 bg-white border border-border-light rounded-full text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-6 inline-block">{t.tag}</span>
                                <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-primary transition-colors">{t.title}</h3>
                                <p className="text-text-secondary font-medium leading-relaxed mb-8">{t.desc}</p>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary group-hover:text-brand-primary transition-colors flex items-center gap-2">Read Tutorial <ArrowRight size={14} /></span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Support & Community */}
            <section className="py-32 px-6 bg-text-primary text-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center md:text-left">
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-4xl font-bold tracking-tight">Need help <br/> with code?</h3>
                            <p className="text-white/50 font-medium">Our engineers hang out in the community forums and are ready to help you debug your implementation.</p>
                            <button className="btn btn-primary !rounded-2xl !px-8 font-bold">Ask on Discord</button>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { icon: <HelpCircle />, name: 'Help Center', desc: 'Hundreds of non-technical articles for everyday users.' },
                                { icon: <MessageSquare />, name: 'Community Forum', desc: 'Discuss feature requests and share your custom SDK modules.' },
                                { icon: <Globe />, name: 'System Status', desc: 'Real-time monitoring of our API and WebSocket infrastructure.' },
                                { icon: <Shield />, name: 'Security Center', desc: 'Documentation on our encryption, RLS, and data policies.' }
                            ].map((item, i) => (
                                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[40px] hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">{item.name}</h4>
                                    <p className="text-sm text-white/40 font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Feedback & Contributions */}
            <section className="py-24 px-6 bg-white border-t border-border-light">
                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <h2 className="text-4xl font-bold tracking-tight italic">Help us improve.</h2>
                    <p className="text-xl text-text-secondary font-medium">
                        Spot a typo? Missing a code example? Our documentation is open to contributions. 
                        Edit any page directly via GitHub or send us your feedback.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="btn btn-secondary !px-10 !py-5 !rounded-2xl font-bold flex items-center justify-center gap-3">
                            <Github size={20} /> Edit Page on GitHub
                        </button>
                        <button className="btn btn-primary !px-10 !py-5 !rounded-2xl font-bold">Submit Feedback</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default DocumentationPage;
