import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Sparkles, MapPin, Clock, Heart, Zap, Shield, Sun, Coffee, Rocket, ArrowRight, UserCheck, CheckCircle } from 'lucide-react';

const CareersPage = () => {
    const jobs = [
        { title: 'Senior Product Designer', location: 'Remote / SF / London', type: 'Full-time', team: 'Design', salary: '$140k - $190k' },
        { title: 'Backend Engineer (Node/Supabase)', location: 'Remote Global', type: 'Full-time', team: 'Internal Engine', salary: '$130k - $180k' },
        { title: 'Growth Marketing Manager', location: 'London / NYC', type: 'Full-time', team: 'Growth', salary: '$110k - $160k' },
        { title: 'Customer Success Lead', location: 'Remote / EMEA', type: 'Full-time', team: 'Success', salary: '$90k - $130k' }
    ];

    return (
        <MarketingLayout>
            {/* 1. Hero / Culture Statement */}
            <section className="py-24 px-6 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-5 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <Sparkles size={12} />
                        Join the Flow
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-12">
                        Build the future <br className="hidden md:block"/> of <span className="text-brand-primary italic">human coord.</span>
                    </h1>
                    <p className="text-2xl text-text-secondary max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                        We're a distributed team of engineers, designers, and strategists obsessed with the physics of work. 
                        We don't believe in "balance"—we believe in "flow." Join us in building the unified command center for high-performance teams.
                    </p>
                    <button className="btn btn-primary !px-12 !py-6 !text-lg !rounded-[24px] font-black shadow-2xl shadow-brand-primary/20">View Open Positions</button>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16 mt-16 border-t border-border-light w-full">
                        {[
                            { label: 'Team Size', value: '45+' },
                            { label: 'Countries', value: '14' },
                            { label: 'Retention', value: '98%' },
                            { label: 'Diversity', value: '50/50' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-black text-text-primary mb-1 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. Perks & Benefits */}
            <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight">Work that flows with you.</h2>
                        <p className="text-xl text-text-secondary font-medium leading-relaxed">
                            We offer premium benefits designed to support your focus, health, and long-term growth 
                             regardless of where in the world you choose to call home.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Globe />, title: 'Remote-First Forever', desc: 'Work from anywhere in the world. We offer a $2,500 home-office stipend and local co-working memberships.' },
                            { icon: <Heart />, title: 'Premium Health', desc: 'Comprehensive medical, dental, and vision for you and your dependents. 100% premium coverage in the US/UK.' },
                            { icon: <Sun />, title: 'Unlimited & Mandatory PTO', desc: 'We require a minimum of 4 weeks off per year. We want you rested, refreshed, and in your flow.' },
                            { icon: <Zap />, title: 'Modern Tools', desc: 'Latest MacBook Pro M3, ergonomic furniture, and premium subscriptions to all the tools you need to excel.' },
                            { icon: <Coffee />, title: 'Learning & Growth', desc: '$3,000 annual budget for books, conferences, and courses relevant to your career path.' },
                            { icon: <Shield />, title: 'Equity & Ownership', desc: 'Every employee is an owner. We offer competitive early-stage equity packages for all full-time roles.' }
                        ].map((item, i) => (
                            <div key={i} className="p-12 bg-white rounded-[48px] border border-border-light hover:shadow-2xl transition-all duration-500 group">
                                <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                    {item.icon}
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                                <p className="text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. The Hiring Process */}
            <section className="py-32 px-6 bg-white overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">No surprises <br/> in the process.</h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                We value your time. Our hiring process is designed to be transparent, respectful, and relatively fast. 
                                We want to understand how you think, not just how you solve riddles.
                            </p>
                            <div className="space-y-8">
                                {[
                                    { step: '01', title: 'Intro Call', desc: 'A 20-minute chat with our Talent Lead to discuss mutual alignment.' },
                                    { step: '02', title: 'Technical/Craft Deep Dive', desc: 'A 60-minute session looking at your past work or a practical live-pairing task.' },
                                    { step: '03', title: 'Team/Culture Interview', desc: 'Meet with your future peers to discuss workflows, values, and collaboration style.' },
                                    { step: '04', title: 'Founder Chat', desc: 'Final conversation with Alex (CEO) or Sofia (CTO) about our vision and roadmap.' }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-12 h-12 rounded-full border border-border-light flex items-center justify-center text-xs font-black text-text-tertiary group-hover:border-brand-primary group-hover:text-brand-primary transition-all shrink-0">{s.step}</div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-1">{s.title}</h4>
                                            <p className="text-sm text-text-secondary font-medium">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group p-12 bg-bg-secondary/50 rounded-[64px] border border-border-light">
                             <div className="space-y-8">
                                <h4 className="text-2xl font-bold tracking-tight italic">Our Promise to You:</h4>
                                <ul className="space-y-6">
                                    {[
                                        'Response to app within 72 hours.',
                                        'Constructive feedback at every stage.',
                                        'Standardized interview questions.',
                                        'No unpaid "test project" work.'
                                    ].map((promise, i) => (
                                        <li key={i} className="flex items-center gap-4 font-bold text-text-primary">
                                            <CheckCircle className="text-success" size={20} /> {promise}
                                        </li>
                                    ))}
                                </ul>
                                <div className="p-8 bg-white rounded-3xl border border-border-light shadow-xl text-center">
                                    <p className="font-bold mb-2">Average Hire Time:</p>
                                    <p className="text-4xl font-black text-brand-primary tracking-tighter">14 Days</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DEI & Values Statement */}
            <section className="py-32 px-6 bg-text-primary text-white overflow-hidden text-center">
                <div className="max-w-4xl mx-auto space-y-10">
                    <UserCheck size={64} className="mx-auto text-brand-secondary animate-pulse" />
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Diverse minds <br/> create better flow.</h2>
                    <p className="text-2xl text-white/50 leading-relaxed font-serif">
                        FlowBoard is an equal opportunity employer. We celebrate diversity and are committed to 
                        creating an inclusive environment for all employees. We believe that variety in experience 
                        and background leads to better product decisions and a healthier team culture.
                    </p>
                    <div className="flex justify-center gap-12 pt-8 opacity-50">
                        <div className="text-center">
                            <p className="text-4xl font-black">50%</p>
                            <p className="text-[10px] font-black uppercase tracking-widest">Women in Leadership</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-black">14</p>
                            <p className="text-[10px] font-black uppercase tracking-widest">Global Nationalities</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Open Roles Detailed Grid */}
            <section id="positions" className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                         <div className="max-w-2xl space-y-6">
                            <h2 className="text-5xl font-bold tracking-tight">Open Positions.</h2>
                            <p className="text-xl text-text-secondary font-medium leading-relaxed">Join a team where your work will have a visible impact on the daily lives of 50,000+ users.</p>
                         </div>
                    </div>
                    <div className="space-y-6">
                        {jobs.map((job, i) => (
                            <div key={i} className="group p-10 bg-white border border-border-light rounded-[48px] flex flex-col md:flex-row md:items-center justify-between gap-12 hover:shadow-3xl hover:border-brand-primary/20 transition-all duration-500 cursor-pointer">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-3xl font-black group-hover:text-brand-primary transition-colors tracking-tight">{job.title}</h3>
                                        <span className="px-3 py-1 bg-bg-secondary text-[10px] font-black rounded-full uppercase tracking-widest">{job.team}</span>
                                    </div>
                                    <div className="flex items-center gap-8 text-sm text-text-tertiary font-bold tracking-wide">
                                        <span className="flex items-center gap-2"><MapPin size={16} /> {job.location}</span>
                                        <span className="flex items-center gap-2"><Clock size={16} /> {job.type}</span>
                                        <span className="text-success">{job.salary}</span>
                                    </div>
                                </div>
                                <button className="btn btn-secondary !rounded-[24px] !px-12 !py-6 !text-lg font-black group-hover:bg-brand-primary group-hover:text-white transition-all whitespace-nowrap">Apply Now <ArrowRight size={18} className="ml-2" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Talent Community CTA */}
            <section className="py-32 px-6 bg-bg-secondary/20">
                <div className="max-w-5xl mx-auto bg-white rounded-[64px] border border-border-light p-16 md:p-32 text-center space-y-12 relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl"></div>
                    <Rocket size={48} className="mx-auto text-brand-primary" />
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Don't see a fit?</h2>
                    <p className="text-xl text-text-secondary font-medium px-8">
                        We're always growing. Join our Talent Community to stay in touch for future roles 
                        and get first dibs on new openings in your area of expertise.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        <button className="btn btn-primary !rounded-2xl !px-12 !py-6 !text-xl font-black shadow-2xl shadow-brand-primary/20">Join Talent Pool</button>
                        <button className="btn btn-secondary !rounded-2xl !px-12 !py-6 !text-xl font-black bg-white">Follow us on LinkedIn</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default CareersPage;
