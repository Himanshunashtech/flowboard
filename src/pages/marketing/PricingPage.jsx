import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { 
  Check, Plus, HelpCircle, Shield, Zap, Users, Globe, BarChart, 
  ArrowRight, Target, Activity, Lock, Share2, MessageSquare, Box, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <MarketingLayout>
      {/* 1. Hero Section: Economic Scaling (~100 words) */}
      <section className="py-32 px-6 bg-gradient-to-b from-bg-secondary/30 via-bg-secondary/10 to-white text-center border-b border-border-light relative overflow-hidden">
        <div className="absolute top-0 right-0 p-64 opacity-[0.03] blur-3xl bg-brand-primary rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-10 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.3em] border border-brand-primary/10">
            <Activity size={12} />
            Resource Allocation v4.0
          </div>
          <h1 className="text-5xl md:text-[120px] font-black text-text-primary tracking-tighter leading-[0.85] mb-12 italic">
            Flow for <br className="hidden md:block"/> <span className="text-brand-primary">every unit.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-text-secondary font-medium leading-relaxed mb-16 px-6 md:px-10">
             Start for free to explore the kinetic landscape, then scale your throughput with our high-fidelity pro and enterprise tiers. 
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 items-center mb-24">
             <span className="text-xs font-black uppercase tracking-widest text-text-tertiary">Standard Billing</span>
             <div className="w-16 h-8 bg-brand-primary rounded-full p-1 relative cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20">
                <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-text-primary flex items-center gap-3">
                Annual commitment <span className="text-[10px] bg-success/10 text-success px-4 py-1 rounded-full border border-success/20">LOCKED 20% OFF</span>
             </span>
          </div>
        </div>
      </section>

      {/* 2. Main Pricing Cards: The Three Protocol Tiers (~150 words) */}
      <section className="py-40 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch pt-12 relative z-10">
            {/* The Pilot Tier */}
            <div className="group p-12 bg-white rounded-[64px] border border-border-light flex flex-col hover:border-brand-primary/20 hover:shadow-[0_48px_120px_-24px_rgba(0,0,0,0.1)] transition-all duration-700">
               <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center text-text-tertiary mb-10 shadow-sm border border-border-light group-hover:rotate-6 transition-transform">
                  <Box size={24} />
               </div>
               <h3 className="text-2xl font-black text-text-primary mb-2">The Pilot</h3>
               <p className="text-sm font-bold text-text-tertiary mb-10 uppercase tracking-widest">Personal & Research</p>
               <div className="text-7xl font-black text-text-primary mb-12 flex items-baseline gap-2 tracking-tighter italic">
                 $0 <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">Forever</span>
               </div>
               <ul className="space-y-6 mb-16 flex-1 font-bold text-sm text-text-secondary">
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Up to 3 Kinetic Boards</li>
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Local Sync Protocol</li>
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Unlimited Contributors</li>
                 <li className="flex items-center gap-4 text-text-tertiary/40 italic"><Lock size={18} /> API Access (REST Only)</li>
               </ul>
               <Link to="/signup" className="btn bg-bg-secondary text-text-primary !w-full !rounded-[32px] !py-6 font-black text-lg transition-all hover:bg-brand-primary hover:text-white group-hover:shadow-2xl">Initialize Pilot</Link>
            </div>

            {/* The Nexus Tier */}
            <div className="p-1 px-[2px] bg-gradient-to-tr from-brand-primary via-indigo-600 to-brand-primary rounded-[68px] relative lg:scale-110 z-10 shadow-[0_80px_160px_-40px_rgba(79,70,229,0.3)] my-12 lg:my-0">
               <div className="p-12 bg-white rounded-[66px] flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
                  <div className="absolute -top-6 -right-6 p-12 opacity-[0.03] text-brand-primary"><Zap size={200} /></div>
                  <div className="flex justify-between items-start mb-10">
                     <div className="w-14 h-14 bg-brand-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20 scale-110">
                        <Zap size={28} />
                     </div>
                     <span className="px-5 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Hyper-Growth Tier</span>
                  </div>
                  <h3 className="text-3xl font-black text-text-primary mb-2">The Nexus</h3>
                  <p className="text-sm font-bold text-text-tertiary mb-10 uppercase tracking-widest">Engineering scaleups</p>
                  <div className="text-8xl font-black text-text-primary mb-4 flex items-baseline gap-2 tracking-tighter italic">
                    $12 <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">/Seat /Mo</span>
                  </div>
                  <p className="text-[10px] font-black text-success uppercase tracking-widest mb-10">Includes 20% annual reservation discount</p>
                  <ul className="space-y-6 mb-16 flex-1 font-bold text-sm text-text-secondary">
                    <li className="flex items-center gap-4"><Check size={20} className="text-success shrink-0" strokeWidth={3} /> Unlimited Kinetic Boards</li>
                    <li className="flex items-center gap-4"><Check size={20} className="text-success shrink-0" strokeWidth={3} /> Protocol Engine v2 (Automations)</li>
                    <li className="flex items-center gap-4"><Check size={20} className="text-success shrink-0" strokeWidth={3} /> Unified Portal Matrix (Clients)</li>
                    <li className="flex items-center gap-4 font-black text-brand-primary bg-brand-primary/5 px-4 py-2 rounded-2xl"><Sparkles size={18} className="fill-current" /> AI-Enhanced Semantic Search</li>
                    <li className="flex items-center gap-4"><Check size={20} className="text-success shrink-0" strokeWidth={3} /> 25GB Storage / Reserved Seat</li>
                  </ul>
                  <Link to="/signup" className="btn bg-brand-primary text-white !w-full !rounded-[32px] !py-7 font-black text-xl shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Authenticate Nexus</Link>
               </div>
            </div>

            {/* The Protocol Tier */}
            <div className="group p-12 bg-white rounded-[64px] border border-border-light flex flex-col hover:border-brand-primary/20 hover:shadow-[0_48px_120px_-24px_rgba(0,0,0,0.1)] transition-all duration-700">
               <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center text-text-tertiary mb-10 shadow-sm border border-border-light group-hover:rotate-6 transition-transform">
                  <Shield size={24} />
               </div>
               <h3 className="text-2xl font-black text-text-primary mb-2">The Protocol</h3>
               <p className="text-sm font-bold text-text-tertiary mb-10 uppercase tracking-widest">Global Organizations</p>
               <div className="text-5xl font-black text-text-primary mb-12 tracking-tighter italic lg:leading-none pt-4">Custom <br className="lg:block hidden"/> Architecture</div>
               <ul className="space-y-6 mb-16 flex-1 font-bold text-sm text-text-secondary">
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> SSO / SAML / SCIM Integration</li>
                 <li className="flex items-center gap-4 text-indigo-600"><Target size={18} className="shrink-0" /> Dedicated Protocol Success Lead</li>
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Hardware-level Data Isolation</li>
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Custom SLA & Uptime Guarantees</li>
                 <li className="flex items-center gap-4"><Check size={18} className="text-success shrink-0" /> Enterprise-wide Audit Registry</li>
               </ul>
               <Link to="/contact" className="btn bg-white border-2 border-border-light text-text-primary !w-full !rounded-[32px] !py-6 font-black text-lg transition-all hover:border-brand-primary hover:text-brand-primary">Engineer Quote</Link>
            </div>
          </div>
      </section>

      {/* 3. Comparison Matrix: Deep Feature Breakdown (~200 words) */}
      <section className="py-40 px-6 bg-bg-secondary/20 border-y border-border-light overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32 space-y-6 md:space-y-8 px-4 md:px-0">
               <h2 className="text-4xl md:text-7xl font-black text-text-primary tracking-tighter italic">The Feature Matrix.</h2>
               <p className="text-base md:text-xl text-text-secondary font-medium leading-relaxed italic opacity-70">
                  Absolute transparency is a core FlowBoard principle. Every tool, logic engine, and security layer mapped to your chosen tier.
               </p>
            </div>
           
           <div className="bg-white rounded-[64px] border border-border-light shadow-2xl overflow-hidden p-1 p-[2px]">
              <div className="overflow-x-auto rounded-[62px]">
                 <table className="w-full text-left font-bold">
                    <thead>
                       <tr className="bg-bg-secondary/50 border-b border-border-light text-[10px] font-black uppercase tracking-[0.4em] text-text-tertiary">
                          <th className="py-12 px-12 w-2/5">Capability Pillar</th>
                          <th className="py-12 px-8">Pilot</th>
                          <th className="py-12 px-8 text-brand-primary">Nexus</th>
                          <th className="py-12 px-8">Protocol</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/40">
                       {[
                          { category: 'Atomic Canvas', items: [
                             { name: 'Max Active Boards', pilot: '3', nexus: 'Unlimited', protocol: 'Unlimited' },
                             { name: 'Board Rendering engine', pilot: '60fps Standard', nexus: '60fps Kinetic', protocol: '60fps Kinetic' },
                             { name: 'Custom View Presets', pilot: '2', nexus: 'Unlimited', protocol: 'Unlimited' },
                             { name: 'WIP Limit Enforcement', pilot: 'Manual', nexus: 'Automated', protocol: 'Custom logic' }
                          ]},
                          { category: 'Protocol Engine', items: [
                             { name: 'Automation Runs /Mo', pilot: '100', nexus: 'Unlimited', protocol: 'Unlimited' },
                             { name: 'Conditional Branching', pilot: 'No', nexus: 'Included', protocol: 'Included' },
                             { name: 'External Webhooks', pilot: 'Standard', nexus: 'Advanced', protocol: 'Advanced' },
                             { name: 'AI Flow Repair', pilot: 'No', nexus: 'Included', protocol: 'Included' }
                          ]},
                          { category: 'Governance & Security', items: [
                             { name: 'Data Encryption', pilot: 'AES-256', nexus: 'AES-256', protocol: 'AES-256 + HSM' },
                             { name: 'RLS Policies', pilot: 'Standard', nexus: 'Advanced', protocol: 'Custom Architecture' },
                             { name: 'SSO / SAML 2.0', pilot: 'No', nexus: 'Add-on ($5/seat)', protocol: 'Included' },
                             { name: 'Retention Registry', pilot: '7 Days', nexus: '1 Year', protocol: 'Immutable Infinite' }
                          ]}
                       ].map((group, i) => (
                          <React.Fragment key={i}>
                             <tr>
                                <td colSpan="4" className="py-10 px-12 bg-bg-secondary/30 font-black text-xs uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> {group.category}
                                </td>
                             </tr>
                             {group.items.map((item, j) => (
                                <tr key={j} className="hover:bg-bg-secondary/10 transition-colors group">
                                   <td className="py-8 px-12 text-text-primary text-lg tracking-tight group-hover:pl-16 transition-all duration-500">{item.name}</td>
                                   <td className="py-8 px-8 text-text-tertiary">{item.pilot}</td>
                                   <td className="py-8 px-8 text-brand-primary font-black text-xl italic">{item.nexus}</td>
                                   <td className="py-8 px-8 text-text-secondary">{item.protocol}</td>
                                </tr>
                             ))}
                          </React.Fragment>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </section>

      {/* 4. Enterprise Architecture Deep Dive (~100 words) */}
      <section className="py-40 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-12">
                 <div className="inline-flex items-center gap-3 text-indigo-600 font-black tracking-[0.3em] uppercase text-[10px] px-6 py-2.5 bg-indigo-50 rounded-full border border-indigo-100">
                    <Shield size={14} /> The Protocol Lock
                 </div>
                 <h2 className="text-4xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.85]">
                    Engineered for <br className="hidden md:block"/> <span className="text-indigo-600 italic">Global Ops.</span>
                 </h2>
                 <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium italic">
                    The Protocol Tier isn't just a plan; it's a dedicated environment built for organizations where security is a legal requirement, not a feature.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {[
                       { icon: <Globe />, title: 'Sovereign Regions', desc: 'Choose where your data lives. Full GDPR/CCPA localized persistence pools.' },
                       { icon: <Lock />, title: 'HSM Vaulting', desc: 'Hardware Security Module managed keys for absolute encryption sovereignty.' },
                       { icon: <Users />, title: 'L3 Success', desc: 'Direct, 24/7 Slack access to our senior engineering and success leads.' },
                       { icon: <BarChart />, title: 'Global Registry', desc: 'Advanced board-wide audit logs showing metadata-level state history.' }
                    ].map((item, i) => (
                       <div key={i} className="space-y-4 group">
                          <div className="w-14 h-14 rounded-3xl bg-bg-secondary flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                             {item.icon}
                          </div>
                          <h4 className="font-black text-xl tracking-tight">{item.title}</h4>
                          <p className="text-sm text-text-tertiary font-bold leading-relaxed">{item.desc}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative p-1 p-[2px] bg-gradient-to-tr from-indigo-500/20 via-transparent to-brand-primary/20 rounded-[80px]">
                 <div className="relative p-20 bg-white rounded-[78px] shadow-3xl space-y-12 overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 opacity-[0.03] text-indigo-500 -translate-y-1/2 translate-x-1/2">
                       <Shield size={400} />
                    </div>
                    <div className="flex items-center justify-between border-b border-border-light pb-10">
                       <p className="font-black uppercase tracking-[0.4em] text-[10px] text-text-tertiary italic">Performance SLA Registry</p>
                       <span className="text-success font-black text-4xl italic tracking-tighter">99.999%</span>
                    </div>
                    <div className="space-y-8 relative z-10">
                       <p className="font-bold text-3xl leading-[1.2] text-text-primary tracking-tight">
                          "FlowBoard Protocol gave our global engineering team the absolute transparency needed for SOC2 compliance."
                       </p>
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">L3</div>
                          <div>
                             <p className="font-black text-xl tracking-tighter italic">Marcus Sterling</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Chief Architect, TechForm Global</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Frequently Inquired Proto-Questions (~100 words) */}
      <section className="py-40 px-6 bg-bg-secondary/30 relative overflow-hidden">
         <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-[0.02] text-brand-primary scale-150 rotate-12">
            <HelpCircle size={600} />
         </div>
         <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-24 space-y-6">
               <h2 className="text-5xl font-black text-text-primary tracking-tighter italic">Foundational FAQ.</h2>
               <p className="text-xl text-text-secondary font-medium italic opacity-70">Synthesized answers to common resource allocation inquiries.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
               {[
                  { q: 'Can I shift plans during a kinetic cycle?', a: 'Absolute flexibility is built-in. Scale up for intensive sprints or consolidate for archival cycles at any time with prorated adjustments.' },
                  { q: 'What is the "Economic Unit" (Member)?', a: 'We bill only for users explicitly invited to your workspace nexus with write-access. View-only portal contributors are free on Pro+ tiers.' },
                  { q: 'How does the 14-day Nexus trial work?', a: 'Enlist with full Pro-tier intelligence. If you do not choose to reserve your seats, your instance reverts to the Pilot tier limits automatically.' },
                  { q: 'Do you offer non-profit reservation pools?', a: 'Verified educational and 501(c)(3) entities are eligible for 50% reservation relief on all Nexus tier plans.' },
                  { q: 'Is my data isolated at the storage level?', a: 'Every plan utilizes the same architectural security. Protocol tier users have the option for dedicated VPC isolation and localized regional persistence.' }
               ].map((faq, i) => (
                  <div key={i} className="p-10 bg-white rounded-[48px] border border-border-light hover:shadow-2xl transition-all duration-500 group">
                     <h4 className="font-black text-2xl mb-6 flex items-center justify-between tracking-tight leading-none">
                        {faq.q} <HelpCircle size={24} className="text-text-tertiary group-hover:text-brand-primary group-hover:rotate-12 transition-all" />
                     </h4>
                     <p className="text-text-secondary leading-relaxed font-bold text-lg italic opacity-80">{faq.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. Contact Sales / The Last CTA (~50 words) */}
      <section className="py-40 px-6 bg-white border-t border-border-light">
          <div className="max-w-5xl mx-auto space-y-12 flex flex-col items-center">
             <div className="bg-text-primary rounded-[80px] p-24 md:p-32 text-center text-white relative overflow-hidden group w-full shadow-[0_80px_160px_-40px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent"></div>
                <div className="relative z-10 space-y-12">
                   <h2 className="text-6xl md:text-[100px] font-black tracking-tighter leading-[0.85] mb-8 italic">Need a custom <br/> <span className="text-brand-primary">reservation?</span></h2>
                   <p className="text-2xl text-white/50 font-medium max-w-3xl mx-auto italic">
                      For teams exceeding 100 collaborators or those with intricate regulatory requirements, our Sales Architects can build a specialized nexus plan.
                   </p>
                   <div className="flex flex-col sm:flex-row justify-center gap-10 pt-10">
                      <button className="btn bg-white text-brand-primary hover:bg-white/95 !px-16 !py-8 !text-2xl !rounded-[40px] font-black shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-4 group">
                         Start Engineering Quote <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                      <button className="btn bg-white/5 border border-white/20 text-white hover:bg-white/10 !px-16 !py-8 !text-2xl !rounded-[40px] font-black transition-all">Explore Case Studies</button>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12 opacity-30">
                <Shield size={32} />
                <Lock size={32} />
                <Globe size={32} />
                <Activity size={32} />
             </div>
          </div>
      </section>
    </MarketingLayout>
  );
};

export default PricingPage;
