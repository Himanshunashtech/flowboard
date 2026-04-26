import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Zap, Heart, Shield, Rocket, Users, Globe, Award, Star, ArrowRight } from 'lucide-react';

const AboutPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Mission */}
            <section className="py-24 px-6 bg-background overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-5 blur-3xl bg-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                        <Users size={12} />
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-12">
                        We build for <br className="hidden md:block"/> the <span className="text-primary italic underline decoration-dashed underline-offset-[8px] md:underline-offset-[16px]">Frontier.</span>
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-4xl mx-auto mb-20 leading-relaxed font-medium">
                        FlowBoard was born from the belief that project management shouldn't feel like a chore. 
                        It should be the engine that drives your team toward their most ambitious goals.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-y border-border">
                        {[
                            { label: 'Founded', value: '2024' },
                            { label: 'Happy Teams', value: '5,000+' },
                            { label: 'Tasks Moved', value: '12M+' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-6xl font-black text-primary mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. Our Story: Frustrated Engineers to Flow */}
            <section className="py-32 px-6 bg-secondary/30 overflow-hidden border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">Born from <br/> frustration.</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                In 2024, our founding team was leading a high-growth engineering organization. 
                                We were drowning in a sea of slow, rigid, and fragmented project management tools. 
                                We didn't want another "list" app—we needed a high-performance canvas.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We built FlowBoard as a internal prototype in a single weekend. Within a month, 
                                every team in our company was using it. We realized that the world was hungry 
                                for a tool that prioritized human flow over administrative paperwork.
                            </p>
                            <div className="pt-6">
                                <button className="btn btn-primary !rounded-2xl !px-10 !py-4 font-bold">See Our Timeline</button>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-primary/5 rounded-[64px] blur-3xl"></div>
                            <div className="relative aspect-[4/3] bg-card rounded-[64px] border border-border shadow-2xl overflow-hidden shadow-black/5 rotate-3 hover:rotate-0 transition-transform duration-1000 group">
                                <img 
                                    src="/assets/marketing/about_hero.png" 
                                    alt="FlowBoard Team Collaboration" 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Core Values */}
            <section className="py-32 px-6 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight">The Flow Philosophy.</h2>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
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
                            <div key={i} className="text-center space-y-8 p-12 bg-secondary/20 rounded-[48px] border border-transparent hover:border-primary/10 transition-all">
                                <div className="w-20 h-20 bg-background rounded-[32px] flex items-center justify-center text-primary mx-auto shadow-sm">
                                    {item.icon}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold">{item.title}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed font-medium px-4">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The Leadership Team */}
            <section className="py-32 px-6 bg-card border-y border-border overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">Led by <br/> practitioners.</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                Our leadership team consists of former engineers, designers, and project leads 
                                from companies like Google, Meta, and Stripe.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 md:pt-0">
                                {[
                                    { name: 'Alex Rivera', role: 'CEO & Founder', bio: 'Former Head of Product at TechFlow.', img: '/assets/marketing/lead_alex.png' },
                                    { name: 'Sofia Chen', role: 'CTO', bio: 'Architected real-time engines at ScaleDB.', img: '/assets/marketing/lead_sofia.png' },
                                    { name: 'Marcus Day', role: 'Design Lead', bio: 'Award-winning visual designer and UX researcher.', img: '/assets/marketing/lead_marcus.png' },
                                    { name: 'Elena Vance', role: 'Ops & Culture', bio: 'Scaling high-performance remote teams since 2016.', img: '/assets/marketing/lead_elena.png' }
                                ].map((lead, i) => (
                                    <div key={i} className="space-y-2 group cursor-pointer">
                                        <div className="aspect-square bg-secondary rounded-[32px] mb-6 overflow-hidden relative border border-border">
                                            <img 
                                                src={lead.img} 
                                                alt={lead.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        </div>
                                        <h4 className="font-bold text-xl">{lead.name}</h4>
                                        <p className="text-xs font-black uppercase tracking-widest text-primary">{lead.role}</p>
                                        <p className="text-sm text-muted-foreground">{lead.bio}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-foreground rounded-[64px] border border-border h-full flex flex-col justify-center items-center text-center space-y-10 relative overflow-hidden group">
                            <img 
                                src="/assets/marketing/about_global.png" 
                                alt="Global Network" 
                                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-1000 scale-110 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 p-16 space-y-10">
                                <Globe size={100} className="text-primary animate-pulse mx-auto" />
                                <h3 className="text-3xl font-bold tracking-tight text-white">We're a global, <br/> remote-first team.</h3>
                                <p className="text-lg text-white/60 font-medium leading-relaxed">Distributed across 14 countries and 22 cities. We live the "Flow" every day.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Impact & Sustainability */}
            <section className="py-32 px-6 bg-background overflow-hidden border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative h-full">
                            <div className="h-full bg-secondary rounded-[64px] border border-border shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center group">
                                <img 
                                    src="/assets/marketing/about_sustainability.png" 
                                    alt="Sustainability Impact" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                                <div className="relative z-10 p-12 space-y-8">
                                    <Shield size={100} className="text-success mx-auto drop-shadow-2xl" />
                                    <h4 className="text-3xl font-bold text-white">1% for the Planet</h4>
                                    <p className="text-white/80 font-medium px-8 leading-relaxed">We commit 1% of our annual revenue to verified environmental restoration and data localization projects.</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-10">
                            <div className="inline-flex items-center gap-2 text-success font-bold tracking-widest uppercase text-xs">
                                <Star size={16} /> beyond product
                            </div>
                            <h2 className="text-5xl font-bold tracking-tighter leading-[1.1]">
                                Measuring <br/> our <span className="text-success">footprint.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                Growth is important, but not at the cost of our planet or our principles. 
                                We are carbon-neutral (verified) and prioritize ethical data handling at every level of our infrastructure.
                            </p>
                            <button className="btn btn-secondary !rounded-2xl !px-10 !py-4 font-bold">Read Impact Report 2025</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Media & Press Kit */}
            <section className="py-32 px-6 bg-background">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-5xl font-bold tracking-tighter leading-none">Journalists & <br/><span className="text-primary italic">Media.</span></h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        Looking for assets, logos, or founder interviews? 
                        Our press kit contains all the high-resolution assets you need to tell the FlowBoard story.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                        <button className="h-16 px-12 bg-primary text-primary-foreground rounded-[24px] text-lg font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Download Press Kit (ZIP)</button>
                        <button className="h-16 px-12 bg-secondary text-foreground border border-border rounded-[24px] text-lg font-black hover:bg-muted transition-all">Contact PR Team</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default AboutPage;
