import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Zap, Heart, Shield, Rocket, Users, Globe, Award, Star, ArrowRight } from 'lucide-react';

const AboutPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Mission */}
            <section className="py-24 px-6 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-5 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <Users size={12} />
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-12">
                        We build tools for <br className="hidden md:block"/> the <span className="text-brand-primary italic underline decoration-dashed underline-offset-[8px] md:underline-offset-[16px]">builders.</span>
                    </h1>
                    <p className="text-2xl text-text-secondary max-w-4xl mx-auto mb-20 leading-relaxed font-medium">
                        FlowBoard was born from the belief that project management shouldn't feel like a chore. 
                        It should be the engine that drives your team toward their most ambitious goals.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-y border-border-light">
                        {[
                            { label: 'Founded', value: '2024' },
                            { label: 'Happy Teams', value: '5,000+' },
                            { label: 'Tasks Moved', value: '12M+' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-6xl font-black text-brand-primary mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. Our Story: Frustrated Engineers to Flow */}
            <section className="py-32 px-6 bg-bg-secondary/30 overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">Born from <br/> frustration.</h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                In 2024, our founding team was leading a high-growth engineering organization. 
                                We were drowning in a sea of slow, rigid, and fragmented project management tools. 
                                We didn't want another "list" app—we needed a high-performance canvas.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                We built FlowBoard as a internal prototype in a single weekend. Within a month, 
                                every team in our company was using it. We realized that the world was hungry 
                                for a tool that prioritized human flow over administrative paperwork.
                            </p>
                            <div className="pt-6">
                                <button className="btn btn-primary !rounded-2xl !px-10 !py-4 font-bold">See Our Timeline</button>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-brand-primary/5 rounded-[64px] blur-3xl"></div>
                            <div className="relative aspect-square bg-white rounded-[64px] border border-border-light shadow-2xl overflow-hidden shadow-black/5 rotate-3 hover:rotate-0 transition-transform duration-1000">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Rocket size={100} className="text-brand-primary opacity-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Core Values */}
            <section className="py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight">The Flow Philosophy.</h2>
                        <p className="text-xl text-text-secondary font-medium leading-relaxed">
                            These aren't just posters on a wall. They are the principles that guide every feature we ship 
                             and every person we hire.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: <Zap />, title: 'Latency is a Bug', desc: 'If a tool makes you wait, it breaks your concentration. We optimize for millisecond response times.' },
                            { icon: <Award />, title: 'High Trust, High Agency', desc: 'We build for professionals who know their craft. No micromanagement, only visual alignment.' },
                            { icon: <Heart />, title: 'Human Centered', desc: 'Software should adapt to people, not the other way around. Every interface is designed for delight.' }
                        ].map((item, i) => (
                            <div key={i} className="text-center space-y-8 p-12 bg-bg-secondary/20 rounded-[48px] border border-transparent hover:border-brand-primary/10 transition-all">
                                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-brand-primary mx-auto shadow-sm">
                                    {item.icon}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold">{item.title}</h3>
                                    <p className="text-lg text-text-secondary leading-relaxed font-medium px-4">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The Leadership Team */}
            <section className="py-32 px-6 bg-text-primary text-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">Led by <br/> practitioners.</h2>
                            <p className="text-xl text-white/50 leading-relaxed font-medium font-serif">
                                Our leadership team consists of former engineers, designers, and project leads 
                                from companies like Google, Meta, and Stripe.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 md:pt-0">
                                {[
                                    { name: 'Alex Rivera', role: 'CEO & Founder', bio: 'Former Head of Product at TechFlow.' },
                                    { name: 'Sofia Chen', role: 'CTO', bio: 'Architected real-time engines at ScaleDB.' },
                                    { name: 'Marcus Day', role: 'Design Lead', bio: 'Award-winning visual designer and UX researcher.' },
                                    { name: 'Elena Vance', role: 'Ops & Culture', bio: 'Scaling high-performance remote teams since 2016.' }
                                ].map((lead, i) => (
                                    <div key={i} className="space-y-2 group cursor-pointer">
                                        <div className="aspect-square bg-white/10 rounded-[32px] mb-6 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <h4 className="font-bold text-xl">{lead.name}</h4>
                                        <p className="text-xs font-black uppercase tracking-widest text-brand-primary">{lead.role}</p>
                                        <p className="text-sm text-white/40">{lead.bio}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-[64px] border border-white/5 p-16 h-full flex flex-col justify-center items-center text-center space-y-10 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent"></div>
                            <Globe size={100} className="text-brand-primary animate-pulse" />
                            <h3 className="text-3xl font-bold tracking-tight">We're a global, <br/> remote-first team.</h3>
                            <p className="text-lg text-white/50 font-medium px-12">Distributed across 14 countries and 22 cities. We live the "Flow" every day.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Impact & Sustainability */}
            <section className="py-32 px-6 bg-white overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="p-12 bg-bg-secondary rounded-[64px] border border-border-light shadow-2xl space-y-8 flex flex-col items-center justify-center text-center">
                                <Shield size={100} className="text-success opacity-20" />
                                <h4 className="text-3xl font-bold">1% for the Planet</h4>
                                <p className="text-text-secondary font-medium px-8">We commit 1% of our annual revenue to verified environmental restoration and data localization projects.</p>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-10">
                            <div className="inline-flex items-center gap-2 text-success font-bold tracking-widest uppercase text-xs">
                                <Star size={16} /> beyond product
                            </div>
                            <h2 className="text-5xl font-bold tracking-tighter leading-[1.1]">
                                Measuring <br/> our <span className="text-success">footprint.</span>
                            </h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                Growth is important, but not at the cost of our planet or our principles. 
                                We are carbon-neutral (verified) and prioritize ethical data handling at every level of our infrastructure.
                            </p>
                            <button className="btn btn-secondary !rounded-2xl !px-10 !py-4 font-bold">Read Impact Report 2025</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Media & Press Kit */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-5xl font-bold tracking-tighter leading-none">Journalists & <br/><span className="text-brand-primary italic">Media.</span></h2>
                    <p className="text-xl text-text-secondary font-medium">
                        Looking for assets, logos, or founder interviews? 
                        Our press kit contains all the high-resolution assets you need to tell the FlowBoard story.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                        <button className="btn btn-primary !px-12 !py-6 !rounded-[24px] !text-lg font-black shadow-2xl shadow-brand-primary/20">Download Press Kit (ZIP)</button>
                        <button className="btn btn-secondary !px-12 !py-6 !rounded-[24px] !text-lg font-black bg-white">Contact PR Team</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default AboutPage;
