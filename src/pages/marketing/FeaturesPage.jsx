import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Layout, Zap, Shield, Users, BarChart3, Layers, Check, MousePointer2, Search, Cpu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const mainFeatures = [
    { icon: <Layout />, title: 'Visual Kanban', desc: 'Customizable cards and lists that mirror your team\'s unique workflow with pixel-perfect precision.' },
    { icon: <Zap />, title: 'Real-time Sync', desc: 'Updates happen instantly across all devices. No more refresh-tag. Powered by low-latency architecture.' },
    { icon: <Shield />, title: 'Enterprise Security', desc: 'Work confidently with SOC2 compliance, advanced RLS patterns, and data localization options.' },
    { icon: <Users />, title: 'Collaborative Portals', desc: 'Invite clients to view progress without exposing internal discussions or sensitive data.' },
    { icon: <BarChart3 />, title: 'Advanced Analytics', desc: 'Measure velocity, cycle time, and workload balance with beautiful, automated dashboards.' },
    { icon: <Layers />, title: 'Infinite Hierarchy', desc: 'Nested checklists and task dependencies designed for projects of any size or complexity.' }
  ];

  return (
    <MarketingLayout>
      {/* 1. Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-bg-secondary/20 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-widest border border-brand-primary/10">
            <Zap size={14} className="fill-current" />
            Product Features
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-10">
            Engineered for <br/> <span className="text-brand-primary">total flow.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            FlowBoard isn't just another project manager. It's a high-performance engine designed to eliminate friction, 
            automate the mundane, and provide a unified canvas for teams that refuse to move slow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup" className="btn btn-primary !px-10 !py-5 !text-lg !rounded-[24px] shadow-2xl shadow-brand-primary/30">
              Start Building for Free
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Core Capabilities Grid */}
      <section className="py-24 px-6 border-y border-border-light bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {mainFeatures.map((f, i) => (
              <div key={i} className="group p-10 bg-bg-secondary/30 rounded-[40px] border border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">{f.title}</h3>
                <p className="text text-text-secondary leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Deep Dive: Automation Engine */}
      <section className="py-32 px-6 bg-text-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="inline-block px-4 py-1.5 bg-brand-primary/20 text-brand-primary border border-brand-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Automation 2.0
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                Stop doing <br/> the busy work.
              </h2>
              <p className="text-xl text-white/70 leading-relaxed font-medium">
                Our advanced automation engine allows you to build complex logic without a single line of code. 
                Trigger actions based on status changes, date arrivals, or metadata updates.
              </p>
              <ul className="space-y-6">
                {[
                  'Multi-step conditional workflows',
                  'Cross-workspace global triggers',
                  'Custom webhook outgoing events',
                  'AI-suggested optimization rules'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold">
                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border border-white/10 shadow-3xl">
              <div className="space-y-6">
                <div className="p-6 bg-white/10 rounded-3xl border border-white/5 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-warning/20 text-warning flex items-center justify-center"><Zap size={20} /></div>
                  <div>
                    <h4 className="font-bold text-lg">When status changes to "Done"</h4>
                    <p className="text-sm text-white/50">Trigger for all tasks in "Sprint Beta"</p>
                  </div>
                </div>
                <div className="h-10 w-0.5 bg-white/10 ml-12"></div>
                <div className="p-6 bg-brand-primary rounded-3xl border border-white/20 flex items-center gap-6 shadow-2xl shadow-brand-primary/40">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center"><MessageSquare size={20} /></div>
                  <div>
                    <h4 className="font-bold text-lg">Notify #engineering on Slack</h4>
                    <p className="text-sm text-white/80">Include task summary and owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deep Dive: High-Performance Canvas */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
                <div className="aspect-video bg-bg-secondary rounded-[40px] border border-border-light shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="text-3xl font-black text-brand-primary/20 rotate-12 transition-transform group-hover:rotate-0 duration-1000">60FPS CANVAS</div>
                   </div>
                </div>
                <div className="absolute -bottom-8 -right-8 p-8 bg-white rounded-3xl border border-border-light shadow-xl max-w-xs animate-bounce-slow">
                    <p className="text-xs font-bold text-text-tertiary mb-2 uppercase tracking-widest">Latency Report</p>
                    <div className="text-2xl font-black text-success tracking-tighter">0.02ms</div>
                    <p className="text-[10px] font-medium text-text-secondary mt-1">Faster than eye-tracking refresh rate.</p>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-10">
              <div className="inline-block px-4 py-1.5 bg-success/10 text-success border border-success/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                Engine Specs
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                Butter-smooth <br/> interactions.
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                We rebuilt our board rendering engine from the ground up to handle massive projects. 
                Move 1,000 cards without a single frame drop.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: <Cpu className="text-brand-primary" />, title: 'GPU Accelerated', desc: 'Hardware-level layout calculations.' },
                  { icon: <MousePointer2 className="text-brand-primary" />, title: 'Instant Drag', desc: 'Zero-latency feedback on card movement.' }
                ].map((item, i) => (
                   <div key={i} className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center">{item.icon}</div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-text-secondary font-medium leading-relaxed">{item.desc}</p>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Deep Dive: Global Search & AI */}
      <section className="py-32 px-6 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-5xl font-bold tracking-tighter mb-8 italic text-brand-primary">Command center.</h2>
              <p className="text-xl text-text-secondary font-medium leading-relaxed">
                Find anything, anywhere, in milliseconds. Our global command bar isn't just a search tool—it's your ultimate navigator.
              </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Search />, title: 'Omni-Search', desc: 'Search tasks, files, comments, and members in one unified view.' },
              { icon: <Zap />, title: 'Quick Actions', desc: 'Create tasks, assign owners, or change status via keyboard shortcuts.' },
              { icon: <Shield />, title: 'Permission Aware', desc: 'Search results are filtered in real-time based on your RLS access.' },
              { icon: <BarChart3 />, title: 'Semantic Insights', desc: 'AI-driven search that understands intent, not just keywords.' }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-white rounded-[40px] border border-border-light hover:shadow-2xl transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-8">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Social Proof / Quote */}
      <section className="py-32 px-6 bg-white overflow-hidden border-t border-border-light">
        <div className="max-w-4xl mx-auto text-center relative">
           <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-9xl font-black text-bg-secondary leading-none opacity-50 select-none">"</div>
           <blockquote className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.1] mb-12 relative z-10">
              "FlowBoard has completely transformed our engineering culture. 
              We've seen a <span className="text-success underline decoration-dashed underline-offset-8">30% increase</span> in sprint velocity since switching."
           </blockquote>
           <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-bg-secondary"></div>
              <div className="text-left">
                <p className="font-bold text-lg">Marcus Chen</p>
                <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">VP Engineering, TechStream</p>
              </div>
           </div>
        </div>
      </section>

      {/* 7. Final Banner CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-brand-primary rounded-[64px] p-24 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-12">Ready to ship <br/> faster?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/signup" className="btn bg-white text-brand-primary hover:bg-white/95 !px-12 !py-6 !text-xl !rounded-[24px] font-bold shadow-2xl transition-all hover:scale-105">
                Join 5,000+ High-Performance Teams
              </Link>
            </div>
            <p className="mt-12 text-white/60 font-medium tracking-wide flex items-center justify-center gap-2">
               No credit card required <span className="w-1 h-1 rounded-full bg-white/40"></span> 14-day free trial
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FeaturesPage;
