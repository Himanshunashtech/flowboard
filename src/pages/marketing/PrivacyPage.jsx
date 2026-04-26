import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, UserCheck, Globe, HelpCircle, Mail, ArrowRight } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Transparency Statement */}
            <section className="py-24 px-6 bg-gradient-to-b from-secondary/30 to-background text-center border-b border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 opacity-5 blur-3xl bg-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                        <Lock size={12} />
                        Data Protection
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-10">
                        Privacy is <br className="hidden md:block"/> <span className="text-primary italic">fundamental.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
                        At FlowBoard, we believe privacy is a human right. This policy outlines how we handle 
                         your information with the transparency and respect you deserve.
                    </p>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Last Updated: April 10, 2026</p>
                </div>
            </section>

            {/* 2. Core Privacy Principles */}
            <section className="py-24 px-6 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: <Shield />, title: 'Data Minimization', desc: 'We only collect what we absolutely need to provide a high-performance experience.' },
                            { icon: <Lock />, title: 'Encryption First', desc: 'Your data is encrypted at rest and in transit using industry-standard protocols.' },
                            { icon: <Eye />, title: 'Zero Selling', desc: 'We never have and never will sell your personal data to third-party advertisers.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-secondary/30 rounded-[48px] text-center space-y-8 border border-transparent hover:border-primary/10 transition-all">
                                <div className="w-20 h-20 bg-background rounded-[32px] flex items-center justify-center text-primary mx-auto shadow-sm">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold">{item.title}</h3>
                                <p className="text-lg text-muted-foreground font-medium px-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Detailed Information Breakdown */}
            <section className="py-32 px-6 bg-background border-y border-border">
                <div className="max-w-4xl mx-auto space-y-24">
                    <div className="space-y-12">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">1. Information We Collect</h2>
                        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed font-medium">
                            <p>We collect information you provide directly to us when you create an account, create or modify your profile, set up your workspace, or communicate with us.</p>
                            
                            <div className="p-8 bg-secondary/50 rounded-[32px] border border-border space-y-6">
                                <h4 className="font-bold text-foreground text-xl flex items-center gap-3">
                                   <FileText size={20} className="text-primary" /> Personal Information
                                </h4>
                                <ul className="space-y-4 list-disc pl-6 marker:text-primary">
                                    <li>Account credentials (name, email, hashed password).</li>
                                    <li>Billing details (managed securely via Stripe).</li>
                                    <li>Workspace metadata (name, organizational domain).</li>
                                    <li>Profile information (avatar image, bio, role).</li>
                                </ul>
                            </div>

                            <div className="p-8 bg-secondary/50 rounded-[32px] border border-border space-y-6">
                                <h4 className="font-bold text-foreground text-xl flex items-center gap-3">
                                   <Globe size={20} className="text-primary" /> Usage & Automated Data
                                </h4>
                                <ul className="space-y-4 list-disc pl-6 marker:text-primary">
                                    <li>Log data (IP address, browser type, timestamps).</li>
                                    <li>Device information (OS, screen resolution).</li>
                                    <li>App interaction metrics (features used, board activity).</li>
                                    <li>Cookies and local storage for session management.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">2. How We Use Information</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                            Our primary goal is to provide a seamless, high-performance project management experience. We use your statistics to:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: 'Platform Delivery', desc: 'Ensuring your boards sync across all devices in real-time.' },
                                { title: 'Security & Auth', desc: 'Verifying identity and protecting your workspace from unauthorized access.' },
                                { title: 'Customer Support', desc: 'Technical troubleshooting and responding to your specific inquiries.' },
                                { title: 'Communication', desc: 'Sending product updates, security alerts, and weekly strategy newsletters.' }
                            ].map((use, i) => (
                                <div key={i} className="p-8 bg-background border border-border rounded-[32px] hover:shadow-lg transition-shadow">
                                   <h5 className="font-bold text-lg mb-2 text-foreground">{use.title}</h5>
                                   <p className="text-sm text-muted-foreground">{use.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">3. Data Sharing & Third Parties</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                            We do not sell your personal data. We share information only with trusted service providers who help us deliver the FlowBoard experience:
                        </p>
                        <ul className="space-y-6">
                            {[
                                { name: 'Infrastructure (Supabase/PostgreSQL)', purpose: 'Data storage, real-time sync, and authentication.' },
                                { name: 'Payment Processing (Stripe)', purpose: 'Secure billing and transaction management.' },
                                { name: 'Error Reporting (Sentry)', purpose: 'Crash reports and performance monitoring.' },
                                { name: 'Communication (SendGrid/Resend)', purpose: 'Transactional and marketing emails.' }
                            ].map((third, i) => (
                                <li key={i} className="flex gap-4 p-6 border-l-4 border-primary bg-secondary/30 rounded-r-[24px]">
                                   <div>
                                      <p className="font-bold text-foreground">{third.name}</p>
                                      <p className="text-sm text-muted-foreground">{third.purpose}</p>
                                   </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 4. Your Rights (GDPR/CCPA) */}
            <section className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <UserCheck size={64} className="mx-auto text-primary animate-pulse" />
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Your Data, <br/> Your Rights.</h2>
                    <p className="text-2xl text-white/50 leading-relaxed font-serif">
                        Regardless of where you live, we provide the same high level of data control. 
                        You have the right to access, export, correct, and delete your personal information at any time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="p-8 bg-card border border-border rounded-[40px] text-left">
                            <h4 className="text-xl font-bold mb-4">GDPR (Europe)</h4>
                            <p className="text-sm text-muted-foreground">Full compliance with the General Data Protection Regulation, including data portability and "Right to be Forgotten."</p>
                        </div>
                        <div className="p-8 bg-card border border-border rounded-[40px] text-left">
                            <h4 className="text-xl font-bold mb-4">CCPA (California)</h4>
                            <p className="text-sm text-muted-foreground">Full compliance with the California Consumer Privacy Act, including the right to opt-out of "sale" of information.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Security & Retention */}
            <section className="py-32 px-6 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <h2 className="text-5xl font-bold tracking-tighter leading-tight">Security & <br/> Retention.</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                We retain your personal information for as long as your account is active or as needed 
                                to provide you with the services. If you delete your account, we will erase your data 
                                within 30 days, unless required otherwise by law.
                            </p>
                            <Link to="/security" className="inline-flex items-center gap-3 text-lg font-bold text-primary group">
                                Learn about our Security Infrastructure <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                        <div className="p-12 bg-secondary rounded-[64px] border border-border shadow-2xl space-y-8 flex flex-col items-center justify-center text-center">
                            <Shield size={100} className="text-primary opacity-20" />
                            <h4 className="text-3xl font-bold">Safe & Sound</h4>
                            <p className="text-muted-foreground font-medium px-8 font-serif italic text-lg opacity-60">"Your boards are your castle. We just provide the walls."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Contact DPO */}
            <section className="py-24 px-6 bg-background">
                <div className="max-w-4xl mx-auto bg-secondary/30 rounded-[64px] p-16 md:p-24 text-center space-y-10 relative overflow-hidden">
                    <HelpCircle size={48} className="mx-auto text-primary" />
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Privacy Questions?</h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        If you have questions about our privacy practices, please contact our Data Protection Officer 
                        or our legal team directly.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        <button className="btn btn-primary !rounded-2xl !px-12 !py-5 font-black text-lg flex items-center gap-3">
                            <Mail size={20} /> privacy@flowboard.com
                        </button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default PrivacyPage;
