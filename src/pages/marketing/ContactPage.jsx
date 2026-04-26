import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone, Globe, MapPin, Zap, ArrowRight, Shield, Heart, Share2 } from 'lucide-react';

const ContactPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Direct Impact */}
            <section className="py-24 px-6 bg-background overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-5 blur-3xl bg-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                        <MessageSquare size={12} />
                        Get in Touch
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-12">
                        Let's start the <br className="hidden md:block"/> <span className="text-primary italic underline decoration-dashed underline-offset-[16px]">Dialogue.</span>
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                        Whether you're looking for a custom enterprise solution, interested in partnering with us, 
                        or just want to say hello—our team is ready to help you find your flow.
                    </p>
                </div>
            </section>

            {/* 2. Enterprise Sales Inquiry Form */}
            <section className="py-32 px-6 bg-secondary/30 border-y border-border relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-5xl font-bold tracking-tighter">Talk to Sales.</h2>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
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
                                    <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center text-primary shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-primary/5 border border-primary/10 rounded-[32px]">
                            <p className="text-sm font-bold text-primary flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                 Average reply time for Sales: &lt; 2 Hours
                            </p>
                        </div>
                    </div>

                    <div className="bg-card p-12 rounded-[64px] border border-border shadow-3xl shadow-black/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl -z-10"></div>
                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">First Name</label>
                                    <input type="text" className="w-full px-8 py-5 bg-secondary/50 border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Last Name</label>
                                    <input type="text" className="w-full px-8 py-5 bg-secondary/50 border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Work Email</label>
                                <input type="email" placeholder="name@company.com" className="w-full px-8 py-5 bg-secondary/50 border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Team Size</label>
                                <select className="w-full px-8 py-5 bg-secondary/50 border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold">
                                    <option>10 - 50</option>
                                    <option>51 - 200</option>
                                    <option>201 - 500</option>
                                    <option>501+</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">What's on your mind?</label>
                                <textarea rows="4" className="w-full px-8 py-5 bg-secondary/50 border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground resize-none"></textarea>
                            </div>
                            <button type="submit" className="h-[72px] w-full bg-primary text-primary-foreground rounded-[24px] text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Send Inquiry</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 3. Partnerships & Dev Relations */}
            <section className="py-32 px-6 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { icon: <Share2 />, title: 'OEM Partnerships', desc: 'White-label FlowBoard for your own platform.' },
                                    { icon: <Zap />, title: 'App Marketplace', desc: 'Publish your own plugins and extensions.' }
                                ].map((item, i) => (
                                    <div key={i} className="p-10 bg-secondary/30 rounded-[48px] border border-transparent hover:border-primary/20 transition-all text-center">
                                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 shadow-sm">
                                            {item.icon}
                                        </div>
                                        <h4 className="font-bold text-xl mb-3">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-10">
                            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                                <Globe size={16} /> developers
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                                Build the <br/> ecosystem.
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                We're building more than just a tool; we're building a platform. 
                                We'd love to partner with teams building the next generation of productivity software.
                            </p>
                            <button className="h-14 px-10 bg-secondary text-foreground border border-border rounded-[24px] font-bold hover:bg-muted transition-all">Partnerships Portal</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Worldwide Hubs */}
            <section className="py-32 px-6 bg-secondary/30 border-y border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <h2 className="text-5xl font-bold tracking-tight text-foreground">Global Presence.</h2>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
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
                            <div key={i} className="p-10 bg-background rounded-[48px] border border-border hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-8 border border-border">
                                    <MapPin size={24} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{hub.city}</h4>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">{hub.address}</p>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-t border-border pt-6 flex items-center justify-between">
                                    <span>Local Time:</span>
                                    <span className="text-primary animate-pulse">Active Support</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Press & Media Contact */}
            <section className="py-32 px-6 bg-background overflow-hidden border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl font-bold tracking-tighter leading-[1.1]">
                                Press & <br className="hidden md:block"/> <span className="text-primary italic">Media.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                For all press inquiries, please contact our community and PR team. 
                                We're happy to provide logos, brand assets, or arrange founder interviews.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="p-6 bg-secondary rounded-3xl border border-border flex items-center gap-4">
                                     <Mail className="text-primary" />
                                     <span className="font-bold">press@flowboard.com</span>
                                </div>
                            </div>
                            <Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-[0.2em] group">
                                View About Us <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                        <div className="aspect-square bg-secondary rounded-[64px] border border-border flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
                             <div className="text-7xl font-black text-primary/10 tracking-widest -rotate-45 select-none">PRESS KIT</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Global Support Desk CTA */}
            <section className="py-24 px-6 bg-background">
                <div className="max-w-4xl mx-auto bg-foreground rounded-[64px] p-24 text-center text-background relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                    <div className="relative z-10 space-y-12">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">Need Support?</h2>
                        <p className="text-xl text-background/50 max-w-xl mx-auto font-medium">
                            If you're already a user and need help with your account, please visit our 
                            Help Center or start a direct chat with our support team.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/help" className="h-20 px-12 bg-background text-primary rounded-[24px] text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                                Visit Help Center
                            </Link>
                            <button className="h-20 px-12 bg-background/10 text-background rounded-[24px] text-xl font-black border border-background/20 hover:bg-background/20 transition-all">Chat Now</button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default ContactPage;
