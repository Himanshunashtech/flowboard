import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Zap, Star, Shield, Rocket, Clock, MessageSquare, ArrowRight, Github } from 'lucide-react';

const ChangelogPage = () => {
  const updates = [
    {
      version: 'v2.4.0',
      date: 'April 10, 2026',
      title: 'Enhanced Automation Engine',
      desc: 'Introducing multi-step automation triggers and advanced conditional logic for board workflows. This update allows for complex "if-this-then-that" sequences across multiple workspaces.',
      details: [
        'Added nested conditional logic for triggers.',
        'New "Wait for Trigger" action for multi-phase workflows.',
        'Enhanced Slack & Discord notification templates.',
        'Workspace-level global variables for automation state.'
      ],
      icon: <Zap className="text-warning" />,
      tag: 'Major'
    },
    {
      version: 'v2.3.5',
      date: 'March 28, 2026',
      title: 'Collaborative Sidebars & Presence',
      desc: 'Real-time presence indicators now appear in card details for better team coordination. See who is viewing or editing a card in millisecond precision.',
      details: [
        'Live "Currently Viewing" avatars in modal header.',
        'Typing indicators in comment threads.',
        'Resolved race condition in concurrent checklist updates.',
        'Optimized WebSocket payload size for mobile networks.'
      ],
      icon: <Star className="text-brand-primary" />,
      tag: 'Update'
    },
    {
      version: 'v2.3.0',
      date: 'March 15, 2026',
      title: 'SAML 2.0 & Enterprise Security',
      desc: 'Enterprise users can now connect their identity providers for seamless SSO. We\'ve added support for Okta, Azure AD, and Google Workspace.',
      details: [
        'Full SAML 2.0 integration for enterprise auth.',
        'SCIM 2.0 support for automated user provisioning.',
        'New audit logs for security critical events.',
        'Enhanced RLS (Row Level Security) monitoring dashboard.'
      ],
      icon: <Shield className="text-success" />,
      tag: 'Security'
    },
    {
      version: 'v2.2.0',
      date: 'February 20, 2026',
      title: 'Canvas Performance Boost',
      desc: 'We\'ve optimized the board rendering engine, resulting in a 40% speed increase on large boards with over 500+ cards.',
      details: [
        'Virtualization engine for infinite scrolling boards.',
        'GPU-accelerated drag and drop animations.',
        'Reduced initial bundle size by 15% via dynamic imports.',
        'Improved caching layer for board metadata.'
      ],
      icon: <Rocket className="text-brand-secondary" />,
      tag: 'Performance'
    }
  ];

  return (
    <MarketingLayout>
      {/* 1. Hero Section */}
      <section className="py-20 md:py-24 px-6 bg-white overflow-hidden relative border-b border-border-light">
        <div className="absolute top-0 right-0 p-32 opacity-5 blur-3xl bg-brand-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-brand-primary bg-brand-primary/10 rounded-full uppercase tracking-[0.2em]">
            <Clock size={12} />
            Version History
          </span>
          <h1 className="text-4xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-8">
            What's <span className="text-brand-primary">new.</span>
          </h1>
          <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium px-4 md:px-0">
            We ship updates weekly. Keep up with the latest features, performance improvements, 
            and bug fixes we've pushed to the FlowBoard platform.
          </p>
          <button className="h-14 px-8 flex items-center justify-center bg-bg-secondary text-text-primary text-[10px] font-black uppercase tracking-widest rounded-full gap-3 mx-auto">
             <Github size={20} /> View Open Source Logs
          </button>
        </div>
      </section>

      {/* 2. Featured Release Spotlight */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-bg-secondary/20">
         <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-[40px] md:rounded-[48px] p-8 md:p-24 border border-brand-primary shadow-2xl shadow-brand-primary/5 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 md:p-8">
                  <span className="px-3 py-1 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">Recent Highlight</span>
               </div>
               <div className="space-y-8 md:space-y-10">
                  <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-black text-xl">2.4</div>
                  <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight">Automation <br className="hidden md:block"/> Workflow 2.0</h2>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
                     The biggest update to our workflow engine yet. Build complex, branching logic 
                     that runs across multiple boards and workspaces with zero latency.
                  </p>
                  <ul className="space-y-4">
                     {[
                        'Branching logic (If/Then/Else)',
                        'Shared workspace triggers',
                        'Scheduled cron actions',
                        'External webhook inputs'
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-text-primary uppercase tracking-widest">
                           <Zap size={16} className="text-warning fill-current" /> {item}
                        </li>
                     ))}
                  </ul>
                  <button className="h-14 px-8 flex items-center justify-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20">Deep Dive into 2.4</button>
               </div>
               <div className="bg-bg-secondary rounded-[32px] md:rounded-[40px] aspect-square relative group hidden md:block">
                   <div className="absolute inset-8 bg-white/50 backdrop-blur-3xl rounded-[24px] md:rounded-[32px] border border-white shadow-xl flex items-center justify-center">
                       <Zap size={100} className="text-brand-primary opacity-20 group-hover:scale-125 transition-transform duration-1000" />
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Detailed Timeline */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-20 md:space-y-24">
            {updates.map((update, i) => (
              <div key={i} className="relative pl-10 md:pl-24 group">
                {/* Timeline Line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border-light group-last:bg-gradient-to-b group-last:from-border-light group-last:to-transparent"></div>
                {/* Timeline Dot */}
                <div className="absolute left-0 -translate-x-1/2 top-4 w-10 md:w-16 h-10 md:h-16 rounded-full bg-white border-4 border-bg-secondary shadow-lg flex items-center justify-center group-hover:border-brand-primary transition-colors">
                  {update.icon}
                </div>
                
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">{update.date}</span>
                    <span className="px-3 py-1 bg-bg-secondary rounded-full text-[9px] font-black uppercase tracking-[0.1em]">{update.tag}</span>
                    <span className="ml-auto text-xs font-black text-brand-primary tracking-widest">{update.version}</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-5xl font-black tracking-tighter text-text-primary leading-tight">{update.title}</h3>
                  <p className="text-base md:text-xl text-text-secondary leading-relaxed font-medium max-w-3xl">
                    {update.desc}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-bg-secondary/30 p-6 md:p-8 rounded-[32px] border border-border-light">
                     {update.details.map((detail, j) => (
                        <div key={j} className="flex gap-4 text-sm font-medium text-text-secondary leading-relaxed">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mt-2 shrink-0"></div>
                           {detail}
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Release Categories Breakdown */}
      <section className="py-32 px-6 bg-text-primary text-white overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
               <h2 className="text-4xl font-bold tracking-tight">Focusing on details.</h2>
               <p className="text-lg text-white/50 font-medium leading-relaxed">We split our energy across performance, design, and developer experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                  { title: 'Core UI/UX', items: ['Dark mode refinement', 'New sidebar layout', 'Glassmorphism depth', 'Micro-interactions'] },
                  { title: 'Performance', items: ['Canvas FPS boost', 'Faster cold starts', 'Asset compression', 'Edge-cached data'] },
                  { title: 'Stability', items: ['Concurrent write fix', 'Supabase auth edge', 'Retry-logic sync', 'Memory leak patch'] },
                  { title: 'Public API', items: ['New GraphQL nodes', 'Webhook retry limit', 'API key scoping', 'SDK v2 stable'] }
               ].map((cat, i) => (
                  <div key={i} className="p-10 bg-white/5 rounded-[40px] border border-white/5 space-y-8">
                     <h4 className="text-xl font-bold border-b border-white/10 pb-6 tracking-tight">{cat.title}</h4>
                     <ul className="space-y-4">
                        {cat.items.map((item, j) => (
                           <li key={j} className="text-sm font-medium text-white/60 flex gap-3">
                              <span className="text-brand-primary">→</span> {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. Roadmap Preview */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                 <div className="inline-flex items-center gap-2 text-warning font-bold tracking-widest uppercase text-xs">
                    <Rocket size={16} /> what's next
                 </div>
                 <h2 className="text-5xl font-bold tracking-tighter leading-[1.1]">
                    The 2026 <br/> roadmap.
                 </h2>
                 <p className="text-xl text-text-secondary leading-relaxed font-medium">
                    We're not stopping at 2.4. Here's a glimpse of the heavy-hitters coming to your boards later this year.
                 </p>
                 <div className="space-y-8">
                    {[
                       { title: 'Native Desktop App', desc: 'Full offline support and global system shortcuts.', status: 'Beta' },
                       { title: 'AI Scribe', desc: 'Automatic task generation from meeting recordings.', status: 'Q3' },
                       { title: 'Visual Automations', desc: 'Drag-and-drop flow builder for complex logic.', status: 'Q4' }
                    ].map((item, i) => (
                       <div key={i} className="flex gap-6 group">
                          <div className="text-sm font-black text-brand-primary opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</div>
                          <div>
                             <h4 className="font-bold text-lg flex items-center gap-3">
                                {item.title} <span className="px-2 py-0.5 bg-bg-secondary text-[10px] font-bold rounded uppercase tracking-widest">{item.status}</span>
                             </h4>
                             <p className="text-sm text-text-secondary font-medium">{item.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative">
                 <div className="p-10 bg-bg-secondary/50 rounded-[48px] border border-border-light h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                    <MessageSquare size={64} className="text-text-tertiary mb-4" />
                    <h4 className="text-2xl font-bold tracking-tight">Have a feature request?</h4>
                    <p className="text-text-secondary font-medium px-12">Our roadmap is driven by your feedback. Join our community to submit and vote on new ideas.</p>
                    <button className="btn btn-secondary !rounded-2xl !px-8 font-bold">Visit Community Forum</button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 6. Subscription CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-brand-primary rounded-[64px] p-24 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Stay in the loop.</h2>
            <p className="text-xl text-white/80 max-w-xl mx-auto font-medium">Get a monthly summary of new features, bug fixes, and workflow tips delivered to your inbox.</p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
               <input type="email" placeholder="email@example.com" className="flex-1 px-8 py-5 bg-white/10 border border-white/20 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-white/10 transition-all placeholder:text-white/40 font-bold" />
               <button className="btn bg-white text-brand-primary hover:bg-white/95 !rounded-[24px] !px-10 font-bold">Subscribe</button>
            </div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">No spam. Only product value.</p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ChangelogPage;
