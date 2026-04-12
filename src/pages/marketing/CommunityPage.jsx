import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { MessageSquare, Twitter, Github, Slack, Users, Star, MapPin, Zap, ArrowRight, Award, Heart } from 'lucide-react';

const CommunityPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero Section */}
            <section className="py-20 md:py-24 px-6 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-10 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <Users size={12} />
                        The FlowBoard Collective
                    </span>
                    <h1 className="text-4xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-8 md:mb-10">
                        Join the <span className="text-brand-primary">flow.</span>
                    </h1>
                    <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium px-4 md:px-0">
                        FlowBoard isn't just software—it's a movement of high-performance teams. 
                        Join 50,000+ members sharing workflows, templates, and insights every day.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20">Join the Slack Community</button>
                        <button className="h-14 px-8 flex items-center justify-center bg-bg-secondary text-text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl">Explore Discussion Forum</button>
                    </div>
                </div>
            </section>

            {/* 2. Platform Channels Grid */}
            <section className="py-24 md:py-32 px-6 bg-white border-y border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { icon: <Slack />, name: 'Slack', members: '25k+', desc: 'Real-time discussions and instant help from fellow builders.', color: 'hover:text-[#4A154B]' },
                            { icon: <Twitter />, name: 'Twitter / X', members: '100k+', desc: 'Daily tips, new feature drops, and industry news.', color: 'hover:text-[#1DA1F2]' },
                            { icon: <Github />, name: 'GitHub', members: '5k+', desc: 'Contribute to our open modules and report issues directly.', color: 'hover:text-[#333]' },
                            { icon: <MessageSquare />, name: 'Discord', members: '15k+', desc: 'Voice chats, developer hangouts, and live AMAs.', color: 'hover:text-[#5865F2]' }
                        ].map((item, i) => (
                            <div key={i} className={`p-8 md:p-10 bg-bg-secondary/30 rounded-[40px] md:rounded-[48px] border border-transparent transition-all cursor-pointer hover:shadow-2xl md:hover:scale-105 group ${item.color}`}>
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-current shadow-sm group-hover:bg-current group-hover:text-white transition-all">
                                    {React.cloneElement(item.icon, { size: 32 })}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-2 text-center text-text-primary group-hover:text-current transition-colors">{item.name}</h3>
                                <div className="text-center mb-6">
                                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-text-tertiary uppercase tracking-widest">{item.members} Members</span>
                                </div>
                                <p className="text-sm text-text-secondary text-center leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Meetups & Global Events */}
            <section className="py-24 md:py-32 px-6 bg-bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-2 text-brand-primary font-bold tracking-widest uppercase text-xs">
                                <MapPin size={16} /> Global Network
                            </div>
                            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                                Connect in <br className="hidden md:block"/> the <span className="text-brand-primary">real world.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                                We host monthly meetups in major tech hubs and a massive annual conference, 
                                **FlowCon**, where the best teams share their scaling secrets.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { date: 'May 12', location: 'San Francisco, CA', event: 'FlowBoard SF Meetup' },
                                    { date: 'June 05', location: 'London, UK', event: 'Agile Scale Summit' },
                                    { date: 'Sept 18', location: 'Austin, TX', event: 'FlowCon 2026' }
                                ].map((e, i) => (
                                    <div key={i} className="flex items-center gap-4 md:gap-6 p-6 bg-white rounded-[32px] border border-border-light shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                                        <div className="text-center w-12 border-r border-border-light pr-4 md:pr-6">
                                            <p className="font-black text-brand-primary text-xs uppercase leading-none">{e.date.split(' ')[0]}</p>
                                            <p className="font-black text-text-primary text-lg">{e.date.split(' ')[1]}</p>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-base md:text-lg group-hover:text-brand-primary transition-colors">{e.event}</h4>
                                            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{e.location}</p>
                                        </div>
                                        <ArrowRight size={20} className="text-text-tertiary group-hover:text-brand-primary transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-brand-primary/10 rounded-[48px] blur-3xl group-hover:bg-brand-primary/20 transition-colors"></div>
                            <div className="relative aspect-square bg-white rounded-[48px] md:rounded-[64px] border border-border-light shadow-2xl overflow-hidden shadow-black/5">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-text-primary via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
                                    <h4 className="text-xl md:text-2xl font-bold mb-2">FlowCon 2025 Highlight</h4>
                                    <p className="text-sm md:text-base text-white/70 font-medium">2,500+ attendees from 40 countries.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. The Ambassador Program */}
            <section className="py-24 md:py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-6">
                        <Award size={40} className="mx-auto text-warning md:w-12 md:h-12" />
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Become a Flow Ambassador.</h2>
                        <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed">
                            Are you a FlowBoard power user? Join our elite program to get early access to features, 
                            exclusive swag, and a direct line to our product team.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { icon: <Zap />, title: 'Beta Access', desc: 'Test-drive new features weeks before the general public release.' },
                            { icon: <Star />, title: 'Premium Badges', desc: 'Display your verified expert status on your profile and community posts.' },
                            { icon: <Heart />, title: 'Exclusive Swag', desc: 'Limited edition apparel, stickers, and workstation upgrades every quarter.' }
                        ].map((item, i) => (
                            <div key={i} className="text-center space-y-6">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-warning/10 rounded-[28px] md:rounded-[32px] flex items-center justify-center text-warning mx-auto mb-6 md:mb-8">
                                    {React.cloneElement(item.icon, { size: 28 })}
                                </div>
                                <h3 className="text-2xl font-bold">{item.title}</h3>
                                <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium px-4 md:px-8">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Contribution Gallery */}
            <section className="py-24 md:py-32 px-6 bg-text-primary text-white overflow-hidden border-y border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-video bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center group cursor-pointer hover:border-brand-primary transition-colors">
                                        <Zap size={24} className="opacity-10 group-hover:opacity-100 transition-opacity text-brand-primary" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute -top-6 -left-6 md:-top-12 md:-left-12 p-6 md:p-8 bg-brand-primary rounded-2xl md:rounded-[32px] text-white shadow-2xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Templates</p>
                                <p className="text-2xl md:text-4xl font-black">1,240+</p>
                            </div>
                        </div>
                        <div className="space-y-8 md:space-y-10">
                            <div className="inline-flex items-center gap-2 text-brand-secondary font-bold tracking-widest uppercase text-xs">
                                <Star size={16} /> shared growth
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1]">
                                Share your <br className="hidden md:block"/> <span className="text-brand-secondary">secret sauce.</span>
                            </h2>
                            <p className="text-base md:text-xl text-white/50 leading-relaxed font-medium">
                                Every team has a unique workflow. In our Template Gallery, you can browse and import 
                                the exact board structures used by companies like Acme, GlobalTech, and Bolt.
                            </p>
                            <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">Browse Gallery</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Join CTA */}
            <section className="py-24 md:py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none">Ready to <br/><span className="text-brand-primary underline decoration-dashed underline-offset-[16px] decoration-4">find your flow?</span></h2>
                    <p className="text-base md:text-xl text-text-secondary font-medium px-4">Whether you're looking for help, templates, or just networking—there's a place for you here.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                        <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20">Sign Up & Join</button>
                        <button className="h-14 px-8 flex items-center justify-center bg-bg-secondary text-text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl">Community Guidelines</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default CommunityPage;
