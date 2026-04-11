import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Layout, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Layers, 
  MessageSquare, 
  ArrowRight,
  Plus
} from 'lucide-react';

import MarketingHeader from '../components/marketing/MarketingHeader';
import MarketingFooter from '../components/marketing/MarketingFooter';

// Importing the generated hero mockup
import heroMockup from '../assets/hero_mockup.png';

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen selection:bg-brand-primary/10">
      {/* 1. Header/Nav */}
      <MarketingHeader />

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-20 pb-0 overflow-hidden bg-bg-primary">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="inline-flex items-center gap-3 px-5 py-2 mb-10 text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-widest border border-brand-primary/10">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded" />
                FlowBoard 2.0 is live
              </span>
              <h1 className="text-6xl md:text-8xl font-bold text-text-primary tracking-tighter leading-[0.9] mb-10">
                Manage projects with <br className="hidden md:block"/> unparalleled <span className="text-brand-primary">flow.</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                FlowBoard is the modern command center for high-performance teams. 
                Visualize work, automate boring tasks, and scale without limits.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
                <Link to="/signup" className="btn btn-primary !px-10 !py-5 !text-lg !rounded-[24px] shadow-2xl shadow-brand-primary/30 hover:scale-105 transition-all">
                  Start your free trial
                </Link>
                <button className="btn btn-secondary !px-10 !py-5 !text-lg !rounded-[24px] hover:bg-bg-tertiary transition-all">
                  Book a demo
                </button>
              </div>
            </div>
            
            <div className="relative group perspective-1000">
              <img 
                src={heroMockup} 
                alt="FlowBoard Dashboard Mockup" 
                className="w-full max-w-6xl mx-auto rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white transform transition-transform duration-1000 group-hover:rotate-x-1" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
          </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-24 border-y border-border-light bg-bg-secondary/30 overflow-hidden">
        <p className="text-center text-[10px] font-bold text-text-tertiary uppercase tracking-[0.3em] mb-12">Trusted by the world's most innovative teams</p>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
            <div className="font-bold text-2xl uppercase tracking-tighter">Acme Corp</div>
            <div className="font-bold text-2xl uppercase tracking-tighter">GloboChem</div>
            <div className="font-bold text-2xl uppercase tracking-tighter">Soylent Corp</div>
            <div className="font-bold text-2xl uppercase tracking-tighter">Initech</div>
            <div className="font-bold text-2xl uppercase tracking-tighter">Umbrella</div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-6 leading-tight">Everything you need to ship faster</h2>
            <p className="text-lg text-text-secondary leading-relaxed">Ditch the spreadsheets and fragmented tools for a unified workspace built for the next decade of work.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Layout />, title: 'Visual Kanban', desc: 'Customizable cards and lists that mirror your team\'s unique workflow with pixel-perfect precision.' },
              { icon: <Zap />, title: 'Real-time Sync', desc: 'Updates happen instantly across all devices. No more refresh-tag. Powered by low-latency architecture.' },
              { icon: <Shield />, title: 'Enterprise Security', desc: 'Work confidently with SOC2 compliance, advanced RLS patterns, and data localization options.' },
              { icon: <Users />, title: 'Collaborative Portals', desc: 'Invite clients to view progress without exposing internal discussions or sensitive data.' },
              { icon: <BarChart3 />, title: 'Advanced Analytics', desc: 'Measure velocity, cycle time, and workload balance with beautiful, automated dashboards.' },
              { icon: <Layers />, title: 'Infinite Hierarchy', desc: 'Nested checklists and task dependencies designed for projects of any size or complexity.' }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-bg-secondary/30 rounded-[40px] border border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Breakdown */}
      <section className="py-32 px-6 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tighter leading-[1.1]">Real-time <br/> Collaboration.</h2>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                Work together in perfect harmony. See who's online, who's typing, 
                and watch tasks move across the board in real-time. 
                Built on high-performance triggers for zero-latency workflows.
              </p>
              <ul className="space-y-6">
                {[
                  'Live presence indicators',
                  'Instant comment notifications',
                  'Collaborative card editing'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-text-primary">
                    <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-brand-primary/5 rounded-[48px] blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
              <div className="relative bg-white p-10 rounded-[48px] shadow-2xl shadow-black/5 border border-border-light overflow-hidden">
                <div className="flex gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 animate-pulse"></div>
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-3 bg-bg-secondary rounded-full w-1/3"></div>
                    <div className="h-3 bg-bg-secondary rounded-full w-full"></div>
                  </div>
                </div>
                <div className="h-48 bg-bg-secondary/50 rounded-3xl border border-dashed border-border-medium flex flex-col items-center justify-center gap-4 text-text-tertiary">
                   <div className="w-10 h-10 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                   <p className="text-xs font-bold uppercase tracking-widest text-center px-8">Simulating millisecond latency updates...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24 relative">
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10rem] font-black text-bg-secondary select-none -z-10 opacity-60">STEPS</div>
             <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-6">Streamline your flow</h2>
             <p className="text-lg text-text-secondary leading-relaxed">From idea to deployment in four simple, automated steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: '01', title: 'Plan', desc: 'Map out your backlog and sprints with priority-first engine.' },
              { step: '02', title: 'Build', desc: 'Execute tasks with focused, high-performance canvas views.' },
              { step: '03', title: 'Refine', desc: 'Analyze data and optimize team flow with automatic reporting.' },
              { step: '04', title: 'Ship', desc: 'Deliver value to your customers faster than ever before.' }
            ].map((step, i) => (
              <div key={i} className="relative group text-center md:text-left transition-all duration-500 hover:scale-105">
                <div className="text-7xl font-black text-bg-secondary mb-6 group-hover:text-brand-primary/10 transition-colors leading-none tracking-tighter">{step.step}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-6">Flexible for every team</h2>
            <p className="text-lg text-text-secondary">Start for free, upgrade when you're ready to scale your throughput.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="p-12 bg-white rounded-[40px] border border-border-light flex flex-col">
              <h3 className="text-xl font-bold text-text-primary mb-2">Free</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For small side projects</p>
              <div className="text-5xl font-black text-text-primary mb-10 flex items-baseline gap-1">
                $0 <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">/forever</span>
              </div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Up to 3 boards</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Unlimited workspaces</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Basic integrations</li>
              </ul>
              <Link to="/signup" className="btn btn-secondary !w-full !rounded-[20px] !py-4 font-bold">Start for free</Link>
            </div>

            <div className="p-12 bg-white rounded-[40px] border-4 border-brand-primary relative shadow-2xl shadow-brand-primary/10 flex flex-col scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Pro</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For high-growth teams</p>
              <div className="text-5xl font-black text-text-primary mb-10 flex items-baseline gap-1">
                $12 <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">/user /mo</span>
              </div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Unlimited boards</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Custom fields & views</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Real-time collaboration</li>
                <li className="flex items-center gap-3 font-bold text-brand-primary"><Plus size={16} /> AI Search helper</li>
              </ul>
              <Link to="/signup" className="btn btn-primary !w-full !rounded-[20px] !py-4 font-bold">Upgrade to Pro</Link>
            </div>

            <div className="p-12 bg-white rounded-[40px] border border-border-light flex flex-col">
              <h3 className="text-xl font-bold text-text-primary mb-2">Enterprise</h3>
              <p className="text-sm font-medium text-text-tertiary mb-8">For large organizations</p>
              <div className="text-5xl font-black text-text-primary mb-10">Custom</div>
              <ul className="space-y-5 mb-12 flex-1 font-medium text-sm text-text-secondary">
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> SSO & SAML 2.0</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Multi-team admin</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> Priority Support</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-success" /> 99.9% Uptime SLA</li>
              </ul>
              <button className="btn btn-secondary !w-full !rounded-[20px] !py-4 font-bold">Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Banner */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto bg-brand-primary rounded-[64px] p-16 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent"></div>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
             <Zap size={300} />
          </div>
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-10">Ready to find <br className="hidden md:block"/> your flow?</h2>
            <p className="mb-14 text-white/80 max-w-xl mx-auto text-lg font-medium leading-relaxed">
              Join thousands of teams and start managing your projects with FlowBoard today. Experience the future of team coordination.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/signup" className="btn bg-white text-brand-primary hover:bg-white/95 !px-12 !py-6 !text-xl !rounded-[24px] font-bold shadow-2xl hover:scale-105 transition-all">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 16. Footer */}
      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
