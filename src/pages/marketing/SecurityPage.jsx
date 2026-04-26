import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Shield, Lock, Server, Eye, Zap, CheckCircle, AlertTriangle, Terminal, Globe, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecurityPage = () => {
    return (
        <MarketingLayout>
            {/* 1. Hero / Security Philosophy */}
            <section className="py-24 px-6 bg-background overflow-hidden relative border-b border-border">
                <div className="absolute top-0 right-0 p-32 opacity-5 blur-3xl bg-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
                        <Shield size={12} />
                        Enterprise Security
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-10">
                        Security is our <br className="hidden md:block"/> <span className="text-primary italic">DNA.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        At FlowBoard, security isn't a feature—it's the core of our DNA. 
                        We combine industrial-grade compliance with modern cryptographic safeguards to protect your intellectual property.
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-50 grayscale contrast-125">
                       <div className="font-black text-2xl tracking-tighter">SOC2 TYPE II</div>
                       <div className="font-black text-2xl tracking-tighter">GDPR COMPLIANT</div>
                       <div className="font-black text-2xl tracking-tighter">ISO 27001</div>
                       <div className="font-black text-2xl tracking-tighter">HIPAA READY</div>
                    </div>
                </div>
            </section>

            {/* 2. Infrastructure Security */}
            <section className="py-32 px-6 bg-secondary/30 border-b border-border overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                                <Server size={16} /> World-Class Infrastructure
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                                Hardened <br/> at every layer.
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                Our platform is built on world-class, multi-region cloud infrastructure via Supabase and PostgreSQL, 
                                providing industry-leading redundancy and physical security.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { title: 'Multi-Region Redundancy', desc: 'Data is replicated across multiple physical regions for maximum availability.' },
                                    { title: 'DDoS Protection', desc: 'Enterprise-grade mitigation layers protect against volumetric and protocol attacks.' },
                                    { title: 'Identity & Access', desc: 'Strict internally restricted environments with multi-factor authentication for all engineers.' },
                                    { title: 'Automated Patches', desc: 'Continuous vulnerability scanning and automated OS/Library patching cycles.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <CheckCircle className="text-success shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-bold text-foreground">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-primary/5 rounded-[64px] blur-3xl"></div>
                            <div className="relative p-12 bg-foreground dark:bg-card rounded-[64px] shadow-3xl text-background dark:text-foreground font-mono text-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-background/10 pb-4">
                                   <div className="flex gap-2">
                                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                                      <div className="w-3 h-3 rounded-full bg-success"></div>
                                   </div>
                                   <span className="text-[10px] font-black uppercase text-background/30 tracking-widest">Network Monitor</span>
                                </div>
                                <div className="space-y-2">
                                   <div className="flex justify-between text-success">
                                      <span>» ingress_traffic_secured</span>
                                      <span className="font-black">1.2 GB/s</span>
                                   </div>
                                   <div className="flex justify-between text-primary">
                                      <span>» active_threat_scanning</span>
                                      <span className="font-black text-xs px-2 bg-primary/20 rounded">ENABLED</span>
                                   </div>
                                   <div className="flex justify-between text-warning">
                                      <span>» anomalous_pattern_detected</span>
                                      <span className="font-black">0.00%</span>
                                   </div>
                                </div>
                                <div className="h-32 bg-background/5 rounded-2xl border border-background/5 flex items-center justify-center">
                                   <Zap size={48} className="text-primary animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Data Protection & Encryption */}
            <section className="py-32 px-6 bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                        <Lock size={48} className="mx-auto text-primary" />
                        <h2 className="text-5xl font-bold tracking-tight">Your data is yours. <br/> Period.</h2>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                            We use military-grade encryption to ensure that only you and your authorized members 
                             can ever see your board data.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-12 bg-secondary/30 rounded-[48px] border border-transparent hover:border-primary/20 transition-all space-y-8">
                            <h3 className="text-3xl font-bold tracking-tight">Encryption at Rest</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                All user data is encrypted at the storage layer using AES-256 with managed keys updated periodically. 
                                This includes all text in cards, checklists, and metadata.
                            </p>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                               <Shield size={16} className="text-primary" /> Verified AES-256 standard
                            </div>
                        </div>
                        <div className="p-12 bg-secondary/30 rounded-[48px] border border-transparent hover:border-primary/20 transition-all space-y-8">
                            <h3 className="text-3xl font-bold tracking-tight">Encryption in Transit</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Data that moves between our servers and your device is always encrypted using Transport Layer Security (TLS 1.3). 
                                We enforce HSTS to prevent downgrade attacks.
                            </p>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                               <Globe size={16} className="text-primary" /> Forced TLS 1.3 / HTTPS
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Compliance & Access Controls (RLS) */}
            <section className="py-32 px-6 bg-foreground text-background overflow-hidden text-center relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-primary to-transparent blur-[120px]"></div>
                </div>
                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <Eye size={64} className="mx-auto text-primary animate-pulse" />
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">Advanced <br/> Access Controls.</h2>
                    <p className="text-2xl text-background/50 leading-relaxed font-serif">
                        FlowBoard utilizes Row-Level Security (RLS) at the database layer. 
                        This means your data is literally impossible to access by any user outside 
                        of your workspace, even at the deepest layer of our API.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                        {[
                            { title: 'Granular Permissions', desc: 'Define who can view, edit, or delete specific boards and task metadata.' },
                            { title: 'SSO & SAML', desc: 'Connect your Enterprise IDP (Okta, Azure, Google) for centralized user management.' },
                            { title: 'Detailed Audit Logs', desc: 'Track every single action taken across your workspace for compliance reviews.' },
                            { title: 'SCIM Provisioning', desc: 'Automatically sync user lifecycle with your HR management systems.' }
                        ].map((p, i) => (
                            <div key={i} className="p-8 bg-background/5 border border-background/5 rounded-[40px] text-left">
                                <h4 className="text-xl font-bold mb-4">{p.title}</h4>
                                <p className="text-sm text-background/40">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Vulnerability Disclosure & Trust */}
            <section className="py-32 px-6 bg-background overflow-hidden border-b border-border">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <Terminal size={48} className="mx-auto text-muted-foreground" />
                        <h2 className="text-5xl font-bold tracking-tight">Our Trust Program.</h2>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                            We work with some of the best security researchers in the world to find and fix issues 
                            before they can ever affect our users.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Search />, title: 'Bug Bounty', label: 'Incentivized Reporting', desc: 'We operate a private bug bounty program for verified security researchers.' },
                            { icon: <Zap />, title: 'Penetration Testing', label: 'Quarterly Audits', desc: 'Independent security firms perform deep-dive penetration tests every quarter.' },
                            { icon: <AlertTriangle />, title: 'VDP Program', label: 'Vulnerability Disclosure', desc: 'We have a public policy for responsible disclosure and remediation of issues.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-secondary/30 rounded-[48px] border border-transparent hover:border-primary/10 transition-all group">
                                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block">{item.label}</span>
                                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                                <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. System Status CTA */}
            <section className="py-24 px-6 bg-background">
                <div className="max-w-4xl mx-auto bg-secondary/30 rounded-[64px] p-24 text-center space-y-12 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 text-[30rem] font-black text-primary/5 select-none">99.99%</div>
                    <h2 className="text-5xl font-bold tracking-tighter leading-tight">FlowBoard Status.</h2>
                    <p className="text-xl text-muted-foreground font-medium px-12">
                        We pride ourselves on our uptime and transparency. Visit our Trust Center to view 
                        real-time system health and historical availability reports.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        <button className="h-20 px-12 bg-primary text-primary-foreground rounded-2xl text-xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                           <Globe size={24} /> Visit Trust Center
                        </button>
                        <button className="h-20 px-12 bg-background text-foreground border border-border rounded-2xl text-xl font-black hover:bg-muted transition-all">Report Security Issue</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default SecurityPage;
