import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { HelpCircle, Search, Mail, Phone, PlayCircle, Shield, CreditCard, Users, Settings, MessageSquare, ArrowRight } from 'lucide-react';

const HelpCenterPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero & Search */}
            <section className="py-24 px-6 bg-gradient-to-b from-bg-secondary/30 to-white overflow-hidden relative border-b border-border-light">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <HelpCircle size={12} />
                        Support Center
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-10">
                        How can we <br/> <span className="text-brand-primary">help you?</span>
                    </h1>
                    <div className="max-w-3xl mx-auto relative group">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={24} />
                        <input 
                            type="text" 
                            placeholder="Type your question or search for articles..." 
                            className="w-full h-24 pl-20 pr-8 bg-white border border-border-light rounded-[40px] shadow-2xl shadow-black/5 focus:outline-none focus:ring-8 focus:ring-brand-primary/5 transition-all text-2xl font-medium placeholder:text-text-tertiary"
                        />
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-bold text-text-tertiary">
                        <span>Popular:</span>
                        <a href="#" className="text-brand-primary hover:underline">Resetting password</a>
                        <a href="#" className="text-brand-primary hover:underline">Inviting members</a>
                        <a href="#" className="text-brand-primary hover:underline">API errors</a>
                        <a href="#" className="text-brand-primary hover:underline">Invoicing</a>
                    </div>
                </div>
            </section>

            {/* 2. Knowledge Base Categories */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Users />, title: 'Getting Started', desc: 'New to FlowBoard? Start here with our onboarding basics and workspace setup.' },
                            { icon: <CreditCard />, title: 'Billing & Plans', desc: 'Questions about invoices, upgrading your team, and managing your subscription.' },
                            { icon: <Settings />, title: 'Workspace Settings', desc: 'Configure permissions, custom fields, and organization-wide defaults.' },
                            { icon: <Shield />, title: 'Privacy & Security', desc: 'Learn about our data encryption, SOC2 compliance, and RLS policies.' },
                            { icon: <MessageSquare />, title: 'Collaboration', desc: 'Tips on using real-time presence, comments, and client portals effectively.' },
                            { icon: <HelpCircle />, title: 'Troubleshooting', desc: 'Common fixes for sync issues, browser compatibility, and mobile app errors.' }
                        ].map((item, i) => (
                            <div key={i} className="group p-10 bg-bg-secondary/30 rounded-[48px] border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                                <p className="text text-text-secondary leading-relaxed font-medium mb-8">{item.desc}</p>
                                <span className="text-xs font-black uppercase tracking-widest text-text-tertiary group-hover:text-brand-primary transition-colors flex items-center gap-2">Explore Category <ArrowRight size={14} /></span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Popular Articles Grid */}
            <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                         <div className="max-w-2xl space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Top read articles.</h2>
                            <p className="text-xl text-text-secondary font-medium leading-relaxed">The most helpful guides as voted by our community of 10,000+ teams.</p>
                         </div>
                         <button className="btn btn-secondary !rounded-2xl !px-8 font-bold">View All 500+ Articles</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            'How to map custom RLS policies to your team structure',
                            'Setting up automated weekly status emails',
                            'Migrating your board data from Trello or Jira',
                            'Integrating FlowBoard with Slack for real-time alerts',
                            'Managing client permissions in collaborative portals',
                            'Using keyboard shortcuts for high-speed navigation'
                        ].map((title, i) => (
                            <div key={i} className="flex items-center justify-between p-8 bg-white rounded-[32px] border border-border-light hover:shadow-xl transition-all cursor-pointer group">
                                <span className="font-bold text-lg text-text-primary group-hover:text-brand-primary transition-colors">{title}</span>
                                <ArrowRight size={20} className="text-text-tertiary group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Video Training Center */}
            <section className="py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-2 text-warning font-bold tracking-widest uppercase text-xs">
                                <PlayCircle size={16} /> academy
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                                Master the <br/> platform.
                            </h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                Prefer watching to reading? Our Academy features short, high-production video lessons 
                                covering everything from basics to advanced automation architecture.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { time: '4:20', title: 'Onboarding for Enterprise Teams' },
                                    { time: '8:45', title: 'Architecture of an Automation Logic' },
                                    { time: '12:00', title: 'Security Best Practices for Admins' }
                                ].map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                            <PlayCircle size={18} />
                                        </div>
                                        <span className="font-bold text-text-primary flex-1">{v.title}</span>
                                        <span className="text-xs font-bold text-text-tertiary">{v.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-warning/5 rounded-[48px] blur-3xl"></div>
                            <div className="relative aspect-video bg-text-primary rounded-[48px] shadow-3xl flex items-center justify-center overflow-hidden">
                                <PlayCircle size={80} className="text-white opacity-20 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 cursor-pointer" />
                                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                    <div className="h-1 bg-white/20 rounded-full flex-1 mx-4">
                                        <div className="h-full w-1/3 bg-warning rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Live: Masterclass</span>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </section>

            {/* 5. Direct Support Channels */}
            <section className="py-32 px-6 bg-text-primary text-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight">Need a human?</h2>
                        <p className="text-xl text-white/50 font-medium leading-relaxed">Sometimes you need a direct answer. Our global team is online 24/7 to support you.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Mail />, title: 'Email Support', desc: 'Average response time: &lt; 4 hours. Best for detailed técnico questions.', value: 'support@flowboard.com' },
                            { icon: <MessageSquare />, title: 'Live Chat', desc: 'Available for Pro and Enterprise plans. Instant answers to quick questions.', value: 'Open Messenger' },
                            { icon: <Phone />, title: 'Phone Support', desc: 'Dedicated line for Critical (S1) Enterprise issues with immediate routing.', value: '+1 (800) FLOW-HELP' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-[48px] text-center space-y-8 hover:bg-white/10 transition-colors">
                                <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mx-auto">
                                    {item.icon}
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-bold">{item.title}</h4>
                                    <p className="text-sm text-white/40 font-medium leading-relaxed px-4">{item.desc}</p>
                                </div>
                                <button className="text-lg font-black text-brand-primary underline decoration-dashed underline-offset-8 decoration-2">{item.value}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Success Stories CTA */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto bg-bg-secondary/30 rounded-[64px] p-16 md:p-32 text-center space-y-10 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 text-[20rem] font-black text-white/40 select-none">?</div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Can't find what you're looking for?</h2>
                    <p className="text-xl text-text-secondary font-medium">Try searching again or visit our full documentation for developer-specific guides.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/docs" className="btn btn-primary !rounded-2xl !px-12 !py-5 font-black text-lg">Go to Documentation</Link>
                        <button className="btn btn-secondary !rounded-2xl !px-12 !py-5 font-black text-lg bg-white">Contact Us</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default HelpCenterPage;
