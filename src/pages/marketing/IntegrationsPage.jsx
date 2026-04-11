import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Share2, Terminal, Cpu, Cloud, Globe, Code, Zap, ArrowRight, Shield, MessageSquare, Github, GitPullRequest, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntegrationsPage = () => {
  return (
    <MarketingLayout>
      {/* 1. Hero Section */}
      <section className="py-24 px-6 bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-bg-secondary/30 -z-10 skew-y-3 origin-top-left"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
            <Share2 size={12} />
            Ecosystem & APIs
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-10">
            Work with the tools <br className="hidden md:block"/> you <span className="text-brand-primary">already love.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            FlowBoard isn't a walled garden. We designed our platform to be the central nervous system 
            of your tech stack, connecting every tool your team depends on.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="btn btn-primary !px-10 !py-5 !text-lg !rounded-[24px]">Explore Marketplace</button>
            <button className="btn btn-secondary !px-10 !py-5 !text-lg !rounded-[24px]">Read API Docs</button>
          </div>
        </div>
      </section>

      {/* 2. Unified Interface Grid */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Native connections, <br/> zero setup.</h2>
             <p className="text-lg text-text-secondary leading-relaxed font-medium">Our growing library of native integrations means you're just a few clicks away from a unified workspace.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-20">
            {[
              { name: 'Slack', color: 'bg-[#4A154B]/5 text-[#4A154B]' },
              { name: 'GitHub', color: 'bg-black/5 text-black' },
              { name: 'Figma', color: 'bg-[#F24E1E]/5 text-[#F24E1E]' },
              { name: 'Notion', color: 'bg-black/5 text-black' },
              { name: 'Zendesk', color: 'bg-[#03363D]/5 text-[#03363D]' },
              { name: 'Intercom', color: 'bg-[#2867F0]/5 text-[#2867F0]' },
              { name: 'GitLab', color: 'bg-[#FC6D26]/5 text-[#FC6D26]' },
              { name: 'Discord', color: 'bg-[#5865F2]/5 text-[#5865F2]' },
              { name: 'Jira', color: 'bg-[#0052CC]/5 text-[#0052CC]' },
              { name: 'Sentry', color: 'bg-[#362D59]/5 text-[#362D59]' },
              { name: 'Zoom', color: 'bg-[#2D8CFF]/5 text-[#2D8CFF]' },
              { name: 'Google', color: 'bg-[#4285F4]/5 text-[#4285F4]' }
            ].map((app, i) => (
              <div key={i} className={`aspect-square flex flex-col items-center justify-center p-6 rounded-[32px] border border-border-light hover:shadow-xl transition-all duration-500 cursor-pointer group ${app.color}`}>
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform"></div>
                  <span className="text-xs font-bold tracking-widest uppercase">{app.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Deep Dive: GitHub Integration */}
      <section className="py-32 px-6 bg-bg-secondary/30 border-y border-border-light overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-10">
                <div className="inline-flex items-center gap-2 text-brand-primary font-bold tracking-widest uppercase text-xs">
                   <Code size={16} /> developer first
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                   The GitOps <br/> flow.
                </h2>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">
                   Connect your repositories and let FlowBoard handle the rest. 
                   Sync pull requests, track commits, and automate status changes based on your code activity.
                </p>
                <div className="space-y-6 pt-4">
                   {[
                      { icon: <GitPullRequest className="text-success" />, title: 'PR Sync', desc: 'Automatically move cards to "In Review" when a PR is opened.' },
                      { icon: <Shield className="text-brand-primary" />, title: 'Security Gates', desc: 'Require code reviews before tasks can be marked as complete.' },
                      { icon: <Zap className="text-warning" />, title: 'Auto-Labeling', desc: 'Sync GitHub labels directly to your FlowBoard categories.' }
                   ].map((item, i) => (
                      <div key={i} className="flex gap-6 p-6 bg-white rounded-[32px] border border-border-light shadow-sm">
                         <div className="shrink-0">{item.icon}</div>
                         <div>
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-sm text-text-secondary font-medium leading-relaxed">{item.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full"></div>
                <div className="relative p-10 bg-bg-primary rounded-[48px] border border-border-light shadow-2xl">
                   <div className="font-mono text-sm text-text-tertiary space-y-4">
                      <div className="flex gap-2"><span className="text-success">$</span> <span>flowboard-cli login --api-key=$SK_PRO_923</span></div>
                      <div className="flex gap-2"><span className="text-success">$</span> <span>git commit -m "feat: adding auth [FB-102]"</span></div>
                      <div className="p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-brand-primary font-bold">
                         » Task FB-102 moved to "In Progress"
                      </div>
                      <div className="flex gap-2 animate-pulse"><span className="text-success">$</span> <span className="w-2 h-5 bg-text-tertiary"></span></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. API & Developer SDK */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="order-2 lg:order-1 grid grid-cols-2 gap-8">
                 {[
                    { title: 'REST API', desc: 'Comprehensive endpoints for all board data.' },
                    { title: 'GraphQL', desc: 'Query exactly what you need with zero overfetching.' },
                    { title: 'Webhooks', desc: 'Real-time event streams for your own consumers.' },
                    { title: 'Auth', desc: 'Enterprise-grade OAuth 2.0 and API Key management.' }
                 ].map((item, i) => (
                    <div key={i} className="p-8 bg-bg-secondary/30 rounded-[40px] border border-transparent hover:border-brand-primary/20 transition-all">
                       <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                       <p className="text-sm text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 ))}
              </div>
              <div className="order-1 lg:order-2 space-y-10">
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                    Build your <br className="hidden md:block"/> own <span className="text-brand-primary">logic.</span>
                 </h2>
                 <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    Our platform is built API-first. Anything you can do in the UI, 
                    you can do programmatically. Build custom dashboards, 
                    automatic reporting tools, or niche-specific extensions.
                 </p>
                 <Link to="/docs" className="inline-flex items-center gap-3 text-lg font-bold text-brand-primary group">
                    View Developer Documentation <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Workflow Connectors */}
      <section className="py-32 px-6 bg-text-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-5xl font-bold tracking-tight mb-8">Communicate without <br className="hidden md:block"/> leaving the flow.</h2>
              <p className="text-xl text-white/60 font-medium">Connect Slack or Discord to keep your team aligned with zero context-switching.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                 { icon: <MessageSquare />, title: 'Channel Sync', desc: 'Map boards to specific channels for automatic team updates.' },
                 { icon: <Zap />, title: 'Smart Previews', desc: 'Full card rich-previews when you paste links in messages.' },
                 { icon: <Cpu />, title: 'Slack Actions', desc: 'Update status, assign owners, or add labels directly from the chat.' }
              ].map((item, i) => (
                 <div key={i} className="text-center space-y-6">
                    <div className="w-20 h-20 bg-brand-primary/20 rounded-[32px] flex items-center justify-center text-brand-primary mx-auto mb-8 border border-brand-primary/20">
                       {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed font-medium px-8">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. Request & Partnerships */}
      <section className="py-32 px-6 bg-white border-t border-border-light">
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Missing something?</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-medium">
               We're adding new integrations every week. If your tool isn't listed, let us know 
               or join our partner program to build it yourself.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <button className="btn btn-secondary !px-12 !py-5 !rounded-2xl font-bold">Request an Integration</button>
               <button className="btn btn-primary !px-12 !py-5 !rounded-2xl font-bold">Become a Partner</button>
            </div>
         </div>
      </section>
    </MarketingLayout>
  );
};

export default IntegrationsPage;
