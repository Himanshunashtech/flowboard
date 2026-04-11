import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Check, Plus, HelpCircle, Shield, Zap, Users, Globe, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <MarketingLayout>
      {/* 1. Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-bg-secondary/20 to-white text-center">
        <div className="max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
            <Zap size={12} />
            Pricing Plans
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-10">
            Flow for every <br className="hidden md:block"/> <span className="text-brand-primary">team size.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Start for free, upgrade when you're ready to scale your throughput. 
            No hidden fees, no complex licensing. Just simple, value-driven pricing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-24">
             <span className="text-sm font-bold text-text-tertiary">Monthly Billing</span>
             <div className="w-16 h-8 bg-brand-primary rounded-full p-1 relative cursor-pointer">
                <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
             </div>
             <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                Annual Billing <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full">Save 20%</span>
             </span>
          </div>
        </div>
      </section>

      {/* 2. Main Pricing Cards */}
      <section className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-12 relative z-10">
            <div className="p-12 bg-white rounded-[48px] border border-border-light flex flex-col hover:shadow-2xl transition-all duration-500">
              <h3 className="text-xl font-bold text-text-primary mb-2">Free</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For personal & side projects</p>
              <div className="text-6xl font-black text-text-primary mb-10 flex items-baseline gap-1 tracking-tighter">
                $0 <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">/mo</span>
              </div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Up to 3 boards</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Basic integrations</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Unlimited workspace members</li>
                <li className="flex items-center gap-3 text-text-tertiary"><Check size={16} className="text-transparent" /> Mobile access</li>
              </ul>
              <Link to="/signup" className="btn btn-secondary !w-full !rounded-[24px] !py-5 font-black text-lg">Start for free</Link>
            </div>

            <div className="p-12 bg-white rounded-[48px] border-4 border-brand-primary relative shadow-[0_50px_100px_-20px_rgba(var(--brand-primary-rgb),0.15)] flex flex-col scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Pro</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For high-growth scaleups</p>
              <div className="text-6xl font-black text-text-primary mb-10 flex items-baseline gap-1 tracking-tighter">
                $12 <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">/user /mo</span>
              </div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Unlimited boards</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Advanced automation engine</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Custom fields & views</li>
                <li className="flex items-center gap-3 font-bold text-brand-primary"><Plus size={16} /> AI-Powered Search Helper</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> 10GB Storage per user</li>
              </ul>
              <Link to="/signup" className="btn btn-primary !w-full !rounded-[24px] !py-5 font-black text-lg shadow-xl shadow-brand-primary/30">Get Started Now</Link>
            </div>

            <div className="p-12 bg-white rounded-[48px] border border-border-light flex flex-col hover:shadow-2xl transition-all duration-500">
              <h3 className="text-xl font-bold text-text-primary mb-2">Enterprise</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For global organizations</p>
              <div className="text-6xl font-black text-text-primary mb-10 tracking-tighter">Custom</div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> SSO / SAML / SCIM</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Priority 24/7 Support</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Custom SLA & Uptime Guarantees</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success shrink-0" /> Advanced Data Localization</li>
              </ul>
              <button className="btn btn-secondary !w-full !rounded-[24px] !py-5 font-black text-lg">Contact Sales</button>
            </div>
          </div>
      </section>

      {/* 3. Detailed Comparison */}
      <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-4xl font-bold tracking-tight mb-20 text-center">Compare all features.</h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left font-medium">
                 <thead>
                    <tr className="border-b border-border-light text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                       <th className="py-8 px-6 w-2/5">Platform Feature</th>
                       <th className="py-8 px-6">Free</th>
                       <th className="py-8 px-6 text-brand-primary">Pro</th>
                       <th className="py-8 px-6">Enterprise</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-light/50">
                    {[
                       { category: 'General', items: [
                          { name: 'Active Boards', free: '3', pro: 'Unlimited', ent: 'Unlimited' },
                          { name: 'Global Search', free: 'Basic', pro: 'AI-Enhanced', ent: 'AI-Enhanced' },
                          { name: 'Member Limit', free: 'Unlimited', pro: 'Unlimited', ent: 'Unlimited' }
                       ]},
                       { category: 'Efficiency', items: [
                          { name: 'Automation Runs', free: '100 /mo', pro: 'Unlimited', ent: 'Unlimited' },
                          { name: 'Custom Fields', free: 'None', pro: 'Unlimited', ent: 'Unlimited' },
                          { name: 'View Presets', free: '2', pro: 'Unlimited', ent: 'Unlimited' }
                       ]},
                       { category: 'Security', items: [
                          { name: 'RBAC Controls', free: 'Basic', pro: 'Advanced', ent: 'Custom' },
                          { name: 'SSO & SAML', free: 'No', pro: 'Legacy Add-on', ent: 'Included' },
                          { name: 'Activity Audit', free: '7 Days', pro: '90 Days', ent: 'Infinite' }
                       ]}
                    ].map((group, i) => (
                       <React.Fragment key={i}>
                          <tr>
                             <td colSpan="4" className="py-8 px-6 bg-bg-secondary font-black text-xs uppercase tracking-widest text-text-tertiary">{group.category}</td>
                          </tr>
                          {group.items.map((item, j) => (
                             <tr key={j} className="hover:bg-white/50 transition-colors">
                                <td className="py-6 px-6 text-text-primary">{item.name}</td>
                                <td className="py-6 px-6 text-text-secondary">{item.free}</td>
                                <td className="py-6 px-6 text-brand-primary font-bold">{item.pro}</td>
                                <td className="py-6 px-6 text-text-secondary">{item.ent}</td>
                             </tr>
                          ))}
                       </React.Fragment>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* 4. Enterprise Deep Dive */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                 <div className="inline-flex items-center gap-2 text-brand-secondary font-bold tracking-widest uppercase text-xs">
                    <Shield size={16} /> Enterprise Grade
                 </div>
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                    Powering global <br/> scale.
                 </h2>
                 <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    FlowBoard Enterprise provides the governance, security, and administrative controls needed for large-scale operations.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[
                       { icon: <Globe />, title: 'Global Admin', desc: 'Centralized management of teams, billing, and security settings.' },
                       { icon: <Shield />, title: 'Compliance', desc: 'Pre-vetted SOC2, HIPAA, and GDPR data processing agreements.' },
                       { icon: <Users />, title: 'Success Manager', desc: 'Dedicated support and training for smooth organization-wide rollout.' },
                       { icon: <BarChart />, title: 'Usage Insights', desc: 'Advanced reporting on organization productivity and bottlenecks.' }
                    ].map((item, i) => (
                       <div key={i} className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-brand-secondary">{item.icon}</div>
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <p className="text-sm text-text-secondary font-medium leading-relaxed">{item.desc}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative group">
                 <div className="absolute -inset-4 bg-brand-secondary/5 rounded-[48px] blur-3xl"></div>
                 <div className="relative p-12 bg-white rounded-[48px] border border-border-light shadow-2xl space-y-8">
                    <div className="flex items-center justify-between border-b border-border-light pb-6">
                       <h4 className="font-black uppercase tracking-widest text-[10px] text-text-tertiary">SLA Guaranteed</h4>
                       <span className="text-success font-bold text-lg">99.99%</span>
                    </div>
                    <div className="space-y-4">
                       <p className="font-bold text-xl">"FlowBoard Enterprise gave us the visibility we needed across 14 global offices. The SSO integration was flawless."</p>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-bg-secondary"></div>
                          <div className="text-xs">
                             <p className="font-bold">Director of Ops, Fortune 500 Co</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Billing FAQ */}
      <section className="py-32 px-6 bg-bg-secondary/30">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-12 text-center">Frequently asked questions.</h2>
            <div className="space-y-6">
               {[
                  { q: 'Can I change my plan later?', a: 'Absolutely. You can upgrade or downgrade at any time. Changes are prorated to your next billing cycle.' },
                  { q: 'What counts as a "Member"?', a: 'A member is any registered user in your workspace. You only pay for the users you explicitly invite.' },
                  { q: 'Do you offer non-profit discounts?', a: 'Yes! We offer 50% off all Pro plans for verified 501(c)(3) organizations.' },
                  { q: 'Is my data secure on the Free plan?', a: 'Every plan—including Free—benefits from the same high-level RLS security and encryption standards.' },
                  { q: 'How does the 14-day trial work?', a: 'You get full access to all Pro features. If you don\'t upgrade, your account reverts to the Free plan limits.' }
               ].map((faq, i) => (
                  <div key={i} className="p-8 bg-white rounded-[32px] border border-border-light hover:shadow-lg transition-shadow">
                     <h4 className="font-bold text-lg mb-4 flex items-center justify-between">
                        {faq.q} <HelpCircle size={18} className="text-text-tertiary" />
                     </h4>
                     <p className="text-text-secondary leading-relaxed font-medium">{faq.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. Contact Sales / Success CTA */}
      <section className="py-32 px-6 border-t border-border-light bg-white">
         <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-5xl font-bold tracking-tighter">Need a custom quote?</h2>
            <p className="text-xl text-text-secondary font-medium px-8">
               If you have more than 100 users or specific regulatory requirements, our sales team can build a package 
               that fits your unique organization structure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <button className="btn btn-primary !px-12 !py-6 !rounded-[24px] !text-lg font-black shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all">Talk to Sales</button>
               <button className="btn btn-secondary !px-12 !py-6 !rounded-[24px] !text-lg font-black bg-white">View Case Studies</button>
            </div>
         </div>
      </section>
    </MarketingLayout>
  );
};

export default PricingPage;
