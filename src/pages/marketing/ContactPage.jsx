import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone, Globe, MapPin, Zap, ArrowRight, Shield, Heart, Share2 } from 'lucide-react';

const ContactPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Direct Impact */}
            <section className="py-24 px-6 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-5 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                        <MessageSquare size={12} />
                        Get in Touch
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-12">
                        Let's start the <br className="hidden md:block"/> <span className="text-brand-primary italic">conversation.</span>
                    </h1>
                    <p className="text-2xl text-text-secondary max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                        Whether you're looking for a custom enterprise solution, interested in partnering with us, 
                        or just want to say hello—our team is ready to help you find your flow.
                    </p>
                </div>
            </section>

            {/* 2. Enterprise Sales Inquiry Form */}
            <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-5xl font-bold tracking-tighter">Talk to Sales.</h2>
                            <p className="text-xl text-text-secondary font-medium leading-relaxed">
                                Our solutions engineers can build a custom demo based on your unique team structure, 
                                governance needs, and software stack.
                            </p>
                        </div>
                        <div className="space-y-8">
                            {[
                                { icon: <Shield />, title: 'Custom Governance', desc: 'Enterprise-grade RLS and SSO setup.' },
                                { icon: <Zap />, title: 'Migration Support', desc: 'Seamlessly transition from legacy tools.' },
                                { icon: <Heart />, title: 'Priority Onboarding', desc: 'Dedicated success team for your rollout.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-sm text-text-secondary font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[32px]">
                            <p className="text-sm font-bold text-brand-primary flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                                 Average reply time for Sales: &lt; 2 Hours
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-12 rounded-[64px] border border-border-light shadow-3xl shadow-black/5">
                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary ml-2">First Name</label>
                                    <input type="text" className="w-full px-8 py-5 bg-bg-secondary/50 border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-tertiary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary ml-2">Last Name</label>
                                    <input type="text" className="w-full px-8 py-5 bg-bg-secondary/50 border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-tertiary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary ml-2">Work Email</label>
                                <input type="email" placeholder="name@company.com" className="w-full px-8 py-5 bg-bg-secondary/50 border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-tertiary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary ml-2">Team Size</label>
                                <select className="w-full px-8 py-5 bg-bg-secondary/50 border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold">
                                    <option>10 - 50</option>
                                    <option>51 - 200</option>
                                    <option>201 - 500</option>
                                    <option>501+</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary ml-2">What's on your mind?</label>
                                <textarea rows="4" className="w-full px-8 py-5 bg-bg-secondary/50 border border-border-light rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-tertiary resize-none"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary !w-full !rounded-[24px] !py-6 !text-lg font-black shadow-2xl shadow-brand-primary/20">Send Inquiry</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 3. Partnerships & Dev Relations */}
            <section className="py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { icon: <Share2 />, title: 'OEM Partnerships', desc: 'White-label FlowBoard for your own platform.' },
                                    { icon: <Zap />, title: 'App Marketplace', desc: 'Publish your own plugins and extensions.' }
                                ].map((item, i) => (
                                    <div key={i} className="p-10 bg-bg-secondary/30 rounded-[48px] border border-transparent hover:border-brand-primary/20 transition-all text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-8 shadow-sm">
                                            {item.icon}
                                        </div>
                                        <h4 className="font-bold text-xl mb-3">{item.title}</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-10">
                            <div className="inline-flex items-center gap-2 text-brand-secondary font-bold tracking-widest uppercase text-xs">
                                <Globe size={16} /> developers
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                                Build the <br/> ecosystem.
                            </h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                We're building more than just a tool; we're building a platform. 
                                We'd love to partner with teams building the next generation of productivity software.
                            </p>
                            <button className="btn btn-secondary !rounded-[24px] !px-10 !py-4 font-bold">Partnerships Portal</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Worldwide Hubs */}
            <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight text-text-primary">Global Presence.</h2>
                        <p className="text-xl text-text-secondary font-medium leading-relaxed">
                            We're a remote-first team, but we maintain collaborative hubs in the world's 
                             most vibrant tech cities.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { city: 'San Francisco', address: '600 California St, Floor 12, San Francisco, CA 94108', tz: 'Pacific Time' },
                            { city: 'London', address: '12-18 Hoxton Street, Shoreditch, London N1 6NG', tz: 'GMT/BST' },
                            { city: 'Austin', address: '111 Congress Ave, Suite 3000, Austin, TX 78701', tz: 'Central Time' }
                        ].map((hub, i) => (
                            <div key={i} className="p-10 bg-white rounded-[48px] border border-border-light hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center text-brand-primary mb-8 border border-border-light">
                                    <MapPin size={24} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{hub.city}</h4>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6">{hub.address}</p>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary border-t border-border-light pt-6">
                                    Local Time: <span className="text-text-primary">Active Support</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Press & Media Contact */}
            <section className="py-32 px-6 bg-white overflow-hidden border-b border-border-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl font-bold tracking-tighter leading-[1.1]">
                                Press & <br className="hidden md:block"/> <span className="text-brand-primary italic">Media.</span>
                            </h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                For all press inquiries, please contact our community and PR team. 
                                We're happy to provide logos, brand assets, or arrange founder interviews.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="p-6 bg-bg-secondary rounded-3xl border border-border-light flex items-center gap-4">
                                     <Mail className="text-brand-primary" />
                                     <span className="font-bold">press@flowboard.com</span>
                                </div>
                            </div>
                            <Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary uppercase tracking-[0.2em] group">
                                View About Us <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                        <div className="aspect-square bg-bg-secondary rounded-[64px] border border-border-light flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent"></div>
                             <div className="text-7xl font-black text-brand-primary/10 tracking-widest -rotate-45 select-none">PRESS KIT</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Global Support Desk CTA */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto bg-text-primary rounded-[64px] p-24 text-center text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
                    <div className="relative z-10 space-y-12">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">Need Support?</h2>
                        <p className="text-xl text-white/50 max-w-xl mx-auto font-medium">
                            If you're already a user and need help with your account, please visit our 
                            Help Center or start a direct chat with our support team.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/help" className="btn bg-white text-brand-primary hover:bg-white/95 !rounded-[24px] !px-12 !py-6 !text-xl font-black shadow-2xl transition-all hover:scale-105">
                                Visit Help Center
                            </Link>
                            <button className="btn bg-white/10 text-white hover:bg-white/20 !rounded-[24px] !px-12 !py-6 !text-xl font-black border border-white/20">Chat Now</button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default ContactPage;
