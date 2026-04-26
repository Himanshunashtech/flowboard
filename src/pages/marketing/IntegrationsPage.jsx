import React from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Share2, Terminal, Cpu, Cloud, Globe, Code, Zap, ArrowRight, Shield, MessageSquare, GitPullRequest, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_SVGS = {
  Slack: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.527 2.527 0 0 1-2.522-2.523 2.527 2.527 0 0 1 2.522-2.52h.01v2.518c0 .002 0 .002 0 0zm.63 0a2.527 2.527 0 0 1 2.522-2.52h6.305a2.527 2.527 0 0 1 2.522 2.52 2.527 2.527 0 0 1-2.522 2.52H8.194a2.528 2.528 0 0 1-2.522-2.52zM8.824 5.042a2.528 2.528 0 0 1-2.523-2.52A2.527 2.527 0 0 1 8.824 0a2.527 2.527 0 0 1 2.52 2.522v.01H8.824v2.51zM8.824 5.672a2.527 2.527 0 0 1 2.52-2.522v6.305a2.527 2.527 0 0 1-2.52 2.522 2.527 2.527 0 0 1-2.523-2.522V8.194a2.528 2.528 0 0 1 2.523-2.522zM18.958 8.824a2.528 2.528 0 0 1 2.52-2.523 2.527 2.527 0 0 1 2.522 2.523 2.527 2.527 0 0 1-2.522 2.52h-.01V8.824zM18.328 8.824a2.527 2.527 0 0 1-2.522 2.52H9.501a2.527 2.527 0 0 1-2.522-2.52 2.527 2.527 0 0 1 2.522-2.52h6.305a2.528 2.528 0 0 1 2.522 2.52zM15.176 18.958a2.528 2.528 0 0 1 2.523 2.52 2.527 2.527 0 0 1-2.523 2.522 2.527 2.527 0 0 1-2.52-2.522v-.01h2.52v-2.51zM15.176 18.328a2.527 2.527 0 0 1-2.52 2.522v-6.305c0-1.392 1.128-2.522 2.52-2.522a2.527 2.527 0 0 1 2.523 2.522v6.305a2.528 2.528 0 0 1-2.523 2.522z"/>
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  Figma: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.686 0 6 2.686 6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6M12 12C8.686 12 6 14.686 6 18s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6"/>
      <path d="M6 6c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6S6 9.314 6 6M6 18c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6S6 21.314 6 18M12 6c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6S12 9.314 12 6M12 18c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6S12 21.314 12 18"/>
      <path d="M3 6a3 3 0 0 1 6 0 3 3 0 0 1-6 0m6 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0m6 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0M3 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0m6 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0M3 18a3 3 0 0 1 6 0 3 3 0 0 1-6 0m6 0a3 3 0 0 1 3 0 3 3 0 0 1-3 0"/>
    </svg>
  ),
  Notion: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.195 2.885c.196-.407.568-.67 1.011-.67.085 0 .17.01.258.03l13.141 2.381c.548.099.96.575.96 1.134v13.064c0 .548-.445.992-.993.992H5.188a.992.992 0 0 1-.993-.992V2.885zm4.846 11.236l-.01-5.63-2.67.48.01 6.83 1.95.34.01-4.72 4.19.74.005 5.25 1.95.35-.01-7.85-2.07-.37-3.35.48v4.06z"/>
    </svg>
  ),
  Zendesk: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.91 1.764L1.764 12.91 12.91 22.236l11.146-11.146z"/>
    </svg>
  ),
  Intercom: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm0 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>
    </svg>
  ),
  GitLab: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0L16.425 9.452H7.575l-2.665-8.189c-.135-.417-.724-.417-.859 0L1.387 9.452.045 13.587c-.114.35.011.737.309.953L12 23.4l11.646-8.86c.298-.216.423-.603.309-.953z"/>
    </svg>
  ),
  Discord: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  ),
  Jira: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.523 0L7.438 4.086c-.724.724-.724 1.884 0 2.608L14.131 13.3c.724.724 1.884.724 2.608 0l4.086-4.086c.724-.724.724-1.884 0-2.608L14.131 0c-.724-.724-1.884-.724-2.608 0zM7.438 17.306l-4.086 4.086c-.724.724-.724 1.884 0 2.608L10.045 24c.724-.724 1.884-.724 2.608 0l4.086-4.086c.724-.724.724-1.884 0-2.608l-6.693-6.693c-.724-.724-1.884-.724-2.608 0z"/>
    </svg>
  ),
  Sentry: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L1.44 6V18L12 24L22.56 18V6L12 0zm0 3.3l7.26 4.14v9.12L12 20.7L4.74 16.56V7.44L12 3.3z"/>
    </svg>
  ),
  Zoom: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm6.182 16.035a1.137 1.137 0 0 1-1.137 1.137H8.955a1.137 1.137 0 0 1-1.137-1.137V7.965a1.137 1.137 0 0 1 1.137-1.137h8.09a1.137 1.137 0 0 1 1.137 1.137z"/>
    </svg>
  ),
  Google: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
    </svg>
  )
};

const IntegrationsPage = () => {
  return (
    <MarketingLayout>
      {/* 1. Hero Section */}
      <section className="py-24 px-6 bg-background overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-secondary/30 -z-10 skew-y-3 origin-top-left"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black text-primary bg-primary/10 rounded-full uppercase tracking-[0.2em] border border-primary/10">
            <Share2 size={12} />
            Ecosystem & APIs
          </span>
          <h1 className="text-4xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9] mb-8">
            Work with the tools <br className="hidden md:block"/> you <span className="text-primary">already love.</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium px-4 md:px-0">
            FlowBoard isn't a walled garden. We designed our platform to be the central nervous system 
            of your high-velocity tech stack, connecting every tool your engineers depend on.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="h-16 px-10 flex items-center justify-center bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Explore Marketplace</button>
            <button className="h-16 px-10 flex items-center justify-center bg-secondary text-foreground border border-border text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-muted transition-all">Read API Docs</button>
          </div>
        </div>
      </section>

      {/* 2. Unified Interface Grid */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 px-4 md:px-0">
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Native connections, <br className="hidden sm:block"/> zero setup.</h2>
             <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">Our growing library of native integrations means you're just a few clicks away from a unified workspace.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 mb-20 px-4 md:px-0">
            {/* Icon Grid with Dark Mode Support */}
            {[
              { name: 'Slack', color: 'bg-[#4A154B]/5 dark:bg-[#4A154B]/20 text-[#4A154B] dark:text-[#E01E5A]' },
              { name: 'GitHub', color: 'bg-black/5 dark:bg-white/10 text-black dark:text-white' },
              { name: 'Figma', color: 'bg-[#F24E1E]/5 dark:bg-[#F24E1E]/20 text-[#F24E1E]' },
              { name: 'Notion', color: 'bg-black/5 dark:bg-white/10 text-black dark:text-white' },
              { name: 'Zendesk', color: 'bg-[#03363D]/5 dark:bg-[#03363D]/20 text-[#03363D]' },
              { name: 'Intercom', color: 'bg-[#2867F0]/5 dark:bg-[#2867F0]/20 text-[#2867F0]' },
              { name: 'GitLab', color: 'bg-[#FC6D26]/5 dark:bg-[#FC6D26]/20 text-[#FC6D26]' },
              { name: 'Discord', color: 'bg-[#5865F2]/5 dark:bg-[#5865F2]/20 text-[#5865F2]' },
              { name: 'Jira', color: 'bg-[#0052CC]/5 dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#2684FF]' },
              { name: 'Sentry', color: 'bg-[#362D59]/5 dark:bg-[#362D59]/20 text-[#362D59] dark:text-[#BD93F9]' },
              { name: 'Zoom', color: 'bg-[#2D8CFF]/5 dark:bg-[#2D8CFF]/20 text-[#2D8CFF]' },
              { name: 'Google', color: 'bg-[#4285F4]/5 dark:bg-[#4285F4]/20 text-[#4285F4]' }
            ].map((app, i) => (
              <div key={i} className={`aspect-square flex flex-col items-center justify-center p-6 rounded-[32px] border border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-500 cursor-pointer group ${app.color}`}>
                  <div className="w-14 h-14 bg-white dark:bg-black/50 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform flex items-center justify-center p-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {LOGO_SVGS[app.name] || <Layout size={24} />}
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">{app.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 4. API & Developer SDK */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="order-2 lg:order-1 grid grid-cols-2 gap-8">
                 {[
                    { title: 'REST API', desc: 'Comprehensive endpoints for all board data.' },
                    { title: 'GraphQL', desc: 'Query exactly what you need with zero overfetching.' },
                    { title: 'Webhooks', desc: 'Real-time event streams for your own consumers.' },
                    { title: 'Auth', desc: 'Enterprise-grade OAuth 2.0 and API Key management.' }
                 ].map((item, i) => (
                    <div key={i} className="p-8 bg-secondary/30 rounded-[40px] border border-transparent hover:border-primary/20 transition-all">
                       <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 ))}
              </div>
              <div className="order-1 lg:order-2 space-y-10">
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                    Build your <br className="hidden md:block"/> own <span className="text-primary">logic.</span>
                 </h2>
                 <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                    Our platform is built API-first. Anything you can do in the UI, 
                    you can do programmatically. Build custom dashboards, 
                    automatic reporting tools, or niche-specific extensions.
                 </p>
                 <Link to="/docs" className="inline-flex items-center gap-3 text-lg font-bold text-primary group">
                    View Developer Documentation <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Workflow Connectors */}
      <section className="py-32 px-6 bg-foreground text-background overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-5xl font-bold tracking-tight mb-8">Communicate without <br className="hidden md:block"/> leaving the flow.</h2>
              <p className="text-xl text-background/60 font-medium">Connect Slack or Discord to keep your team aligned with zero context-switching.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                 { icon: <MessageSquare />, title: 'Channel Sync', desc: 'Map boards to specific channels for automatic team updates.' },
                 { icon: <Zap />, title: 'Smart Previews', desc: 'Full card rich-previews when you paste links in messages.' },
                 { icon: <Cpu />, title: 'Slack Actions', desc: 'Update status, assign owners, or add labels directly from the chat.' }
              ].map((item, i) => (
                 <div key={i} className="text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
                       {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-background/50 leading-relaxed font-medium px-8">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. Request & Partnerships */}
      <section className="py-32 px-6 bg-background border-t border-border">
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Missing something?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium">
               We're adding new integrations every week. If your tool isn't listed, let us know 
               or join our partner program to build it yourself.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <button className="h-14 px-10 bg-secondary text-foreground border border-border rounded-2xl font-bold hover:bg-muted transition-all">Request an Integration</button>
               <button className="h-14 px-10 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Become a Partner</button>
            </div>
         </div>
      </section>
    </MarketingLayout>
  );
};

export default IntegrationsPage;
