import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { FileText, Scale, Zap, Shield, AlertTriangle, HelpCircle, Mail, Globe, CheckCircle } from 'lucide-react';

const TermsPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Acceptance of Terms */}
            <section className="py-24 px-6 bg-gradient-to-b from-secondary/30 to-background text-center border-b border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 p-32 opacity-5 blur-3xl bg-primary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                        <Scale size={12} />
                        Legal Terms
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-10">
                        Terms of <br className="hidden md:block"/> <span className="text-primary italic">service.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
                        By using the FlowBoard platform, you agree to these terms. Please read them carefully 
                         as they contain important information about your legal rights and obligations.
                    </p>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Last Updated: April 10, 2026</p>
                </div>
            </section>

            {/* 2. Agreement & Definition */}
            <section className="py-24 px-6 bg-background overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black tracking-tight text-foreground">1. Agreement to Terms</h2>
                    <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                        <p>
                            These Terms of Service ("Terms") constitute a legally binding agreement between you and FlowBoard Inc. ("FlowBoard," "we," "us," or "our") 
                             governing your access to and use of the FlowBoard website, mobile applications, and all associated services (collectively, the "Service").
                        </p>
                        <p>
                            If you are using the Service on behalf of an organization or entity ("Organization"), then you are agreeing to these Terms on behalf of that Organization, 
                            and you represent and warrant that you have the authority to bind the Organization to these Terms. In such cases, "you" and "your" will refer to that Organization.
                        </p>
                        <div className="p-8 bg-warning/5 border border-warning/20 rounded-[32px] flex gap-6">
                           <AlertTriangle className="text-warning shrink-0" size={24} />
                           <p className="text-sm font-bold text-foreground leading-relaxed">
                              IMPORTANT: By creating an account or using any part of the Service, you confirm that you have read, understood, and agreed to be bound by these Terms. 
                              If you do not agree, you must immediately cease using the Service.
                           </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Account & Use License */}
            <section className="py-32 px-6 bg-secondary/30 border-y border-border">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black tracking-tight text-foreground">2. Use License & Account Responsibility</h2>
                    <div className="prose prose-lg max-w-none text-muted-foreground font-medium leading-relaxed space-y-8">
                        <p>
                            Subject to your compliance with these Terms, FlowBoard grants you a non-exclusive, non-transferable, revocable, 
                             limited license to access and use the Service for your personal or internal business purposes.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 p-8 bg-background rounded-[32px] border border-border shadow-sm">
                                <h4 className="font-bold text-foreground flex items-center gap-2"><CheckCircle size={18} className="text-success" /> You May:</h4>
                                <ul className="text-sm space-y-2 list-disc pl-4">
                                    <li>Create and manage projects and boards.</li>
                                    <li>Invite members to your workspaces.</li>
                                    <li>Integrate supported third-party tools.</li>
                                    <li>Use the Service via our official APIs.</li>
                                </ul>
                            </div>
                            <div className="space-y-4 p-8 bg-background rounded-[32px] border border-border shadow-sm">
                                <h4 className="font-bold text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-danger" /> You May Not:</h4>
                                <ul className="text-sm space-y-2 list-disc pl-4">
                                    <li>Reverse engineer or decompile the Service.</li>
                                    <li>Use the service for illegal activities.</li>
                                    <li>Scrape data via automated non-API means.</li>
                                    <li>Resell or sublicense the Service access.</li>
                                </ul>
                            </div>
                        </div>
                        <p>
                           You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
                           You must notify us immediately of any unauthorized use of your account.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. Service Fees & Payments */}
            <section className="py-32 px-6 bg-background overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black tracking-tight text-foreground">3. Subscription, Fees, & Payments</h2>
                    <div className="space-y-8 text-lg text-muted-foreground font-medium leading-relaxed">
                        <p>
                            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic 
                             basis ("Billing Cycle") depending on the type of subscription plan you select.
                        </p>
                        <div className="space-y-6">
                            {[
                                { title: 'Billing Cycles', desc: 'Subscriptions are billed on a monthly or annual basis. Your Subscription will automatically renew at the end of each Billing Cycle unless you cancel.' },
                                { title: 'Fee Changes', desc: 'FlowBoard may modify the fees for Subscriptions at any time. We will provide at least 30 days\' notice before any such change takes effect.' },
                                { title: 'Refunds', desc: 'Except when required by law, paid Subscription fees are non-refundable. We may evaluate refund requests on a case-by-case basis.' }
                            ].map((policy, i) => (
                                <div key={i} className="flex gap-6 p-8 bg-secondary/20 rounded-[40px] border border-transparent hover:border-primary/10 transition-all">
                                   <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><FileText size={18} /></div>
                                   <div>
                                      <h4 className="font-bold text-foreground text-xl mb-2">{policy.title}</h4>
                                      <p className="text-sm text-muted-foreground leading-relaxed">{policy.desc}</p>
                                   </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Intellectual Property */}
            <section className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <Zap size={64} className="mx-auto text-primary" />
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Your Data is <br/> <span className="text-primary">yours.</span></h2>
                    <div className="text-2xl text-white/50 leading-relaxed font-serif space-y-8">
                        <p>
                           You retain all rights, title, and interest in and to any text, images, files, or other data you upload to the Service ("User Content"). 
                           By uploading User Content, you grant FlowBoard a limited license to host and process that content solely for the purpose of providing the Service.
                        </p>
                        <p>
                           Our brand, code, design, and logos are and will remain the exclusive property of FlowBoard Inc. and its licensors.
                        </p>
                    </div>
                </div>
            </section>

            {/* 6. Disclaimers & Termination */}
            <section className="py-32 px-6 bg-background overflow-hidden border-b border-border">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black tracking-tight text-foreground text-center mb-12">Disclaimer of Warranties</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-black uppercase tracking-widest text-center italic bg-secondary/50 p-12 rounded-[48px]">
                           THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. FLOWBOARD EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, 
                           INCLUDING, BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-foreground">Termination</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium">
                                We may terminate or suspend your account immediately, without prior notice or liability, 
                                for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-foreground">Governing Law</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium">
                                These Terms shall be governed and construed in accordance with the laws of the State of California, 
                                United States, without regard to its conflict of law provisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Contact Legal */}
            <section className="py-24 px-6 bg-background">
                <div className="max-w-4xl mx-auto bg-secondary/30 rounded-[64px] p-16 md:p-24 text-center space-y-10 relative overflow-hidden">
                    <Shield size={48} className="mx-auto text-primary" />
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Legal Questions?</h2>
                    <p className="text-xl text-muted-foreground font-medium px-12">
                        If you have any questions about these Terms, please contact our legal counsel.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        <button className="btn btn-primary !rounded-2xl !px-12 !py-5 font-black text-lg flex items-center gap-3">
                            <Mail size={20} /> legal@flowboard.com
                        </button>
                        <button className="btn btn-secondary !rounded-2xl !px-12 !py-5 font-black text-lg bg-background flex items-center gap-2">
                           <Globe size={18} /> Dispute Resolution
                        </button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default TermsPage;
