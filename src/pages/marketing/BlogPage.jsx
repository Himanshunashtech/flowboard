import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { Newspaper, Search, ArrowRight, Zap, User, Clock, MessageSquare, Star, Mail } from 'lucide-react';

const BlogPage = () => {
    const posts = [
        {
            category: 'Engineering',
            title: 'Scaling Real-time State with Supabase',
            excerpt: 'How we achieved sub-50ms latency for board updates across thousands of concurrent users using high-performance Postgres triggers and optimized replication slots.',
            date: 'April 8, 2026',
            author: 'Jane Doe',
            authorRole: 'Backend Lead',
            authorImg: '/assets/marketing/lead_sofia.png',
            readTime: '12 min',
            image: '/assets/marketing/blog_engineering.png',
            slug: 'scaling-realtime-supabase'
        },
        {
            category: 'Design',
            title: 'The Psychology of Glassmorphism',
            excerpt: 'Why depth, transparency, and micro-interactions are key to reducing cognitive load in complex SaaS applications. A deep dive into the FlowBoard design system.',
            date: 'March 25, 2026',
            author: 'John Smith',
            authorRole: 'Product Designer',
            authorImg: '/assets/marketing/lead_marcus.png',
            readTime: '8 min',
            image: '/assets/marketing/blog_design.png',
            slug: 'psychology-of-glassmorphism'
        },
        {
            category: 'Culture',
            title: 'Work-Life Flow: Beyond Balance',
            excerpt: 'How our team maintains high throughput while prioritizing mental well-being, async communication, and flexible hours in a remote-first world.',
            date: 'March 10, 2026',
            author: 'Alice Wonderland',
            authorRole: 'People Ops',
            authorImg: '/assets/marketing/lead_elena.png',
            readTime: '15 min',
            image: '/assets/marketing/blog_culture.png',
            slug: 'work-life-flow'
        },
        {
            category: 'Product',
            title: 'The Future of Visual Project Management',
            excerpt: 'Our roadmap for 2026 and why we believe AI won\'t replace project managers, but will instead give them superpowers to focus on strategic execution.',
            date: 'February 28, 2026',
            author: 'Alex Rivera',
            authorRole: 'CEO & Founder',
            authorImg: '/assets/marketing/lead_alex.png',
            readTime: '10 min',
            image: '/assets/marketing/blog_product.png',
            slug: 'future-of-visual-pm'
        }
    ];

    return (
        <MarketingLayout>
            {/* 1. Hero / Featured Article */}
            <section className="py-24 px-6 bg-background overflow-hidden relative border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <Link to="/blog/velocity-is-the-only-metric" className="w-full md:w-1/2 aspect-video bg-secondary rounded-[64px] relative overflow-hidden group cursor-pointer border border-border shadow-2xl">
                            <img 
                                src="/assets/marketing/blog_featured.png" 
                                alt="Featured Post" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                        </Link>
                        <div className="w-full md:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                <Star size={12} className="fill-current" /> featured post
                            </div>
                            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
                                Why velocity <br className="hidden lg:block"/> is the only <span className="text-primary italic">metric.</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                In the modern tech landscape, speed isn't just an advantage—it's a survival mechanism. 
                                We break down why the fastest teams always win, and how to build a culture that moves at lightspeed.
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border">
                                        <img src="/assets/marketing/lead_alex.png" alt="Alex Rivera" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Alex Rivera</p>
                                        <p className="text-[10px] font-black uppercase text-text-tertiary">Founder & CEO</p>
                                    </div>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm font-bold text-muted-foreground">April 10, 2026</span>
                            </div>
                            <Link to="/blog/velocity-is-the-only-metric" className="btn btn-primary !rounded-[24px] !px-10 !py-4 font-bold inline-flex items-center gap-3">
                                Read Full Article <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Search & Category Filter */}
            <section className="py-6 px-6 bg-background/80 border-b border-border sticky top-[72px] md:top-[80px] z-[90] backdrop-blur-xl overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3 shrink-0">
                        {['All Posts', 'Engineering', 'Design', 'Product', 'Culture', 'News'].map((cat, i) => (
                            <button key={i} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${i === 0 ? 'bg-foreground text-white border-text-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/40'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="w-full lg:w-96 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            className="w-full h-12 pl-14 pr-6 bg-background border border-border rounded-full focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Latest Articles Grid */}
            <section className="py-32 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {posts.map((post, i) => (
                            <Link key={i} to={`/blog/${post.slug}`} className="group cursor-pointer space-y-8 block">
                                <div className={`aspect-[16/10] bg-secondary rounded-[48px] overflow-hidden relative border border-border shadow-sm group-hover:shadow-2xl transition-all duration-700`}>
                                   <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                    />
                                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                </div>
                                <div className="space-y-6 px-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{post.category}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{post.readTime} read</span>
                                    </div>
                                    <h3 className="text-3xl font-bold group-hover:text-primary transition-colors tracking-tight leading-tight">{post.title}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed font-medium line-clamp-3">{post.excerpt}</p>
                                    <div className="pt-4 flex items-center justify-between border-t border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden border border-border">
                                                <img src={post.authorImg} alt={post.author} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground leading-none">{post.author}</span>
                                                <span className="text-[8px] font-black uppercase text-text-tertiary tracking-widest mt-0.5">{post.authorRole}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{post.date}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-24 text-center">
                        <button className="btn btn-secondary !rounded-[24px] !px-12 !py-5 font-black text-lg">Load More Articles</button>
                    </div>
                </div>
            </section>

            {/* 4. Deep Dive Newsletter Section */}
            <section className="py-32 px-6 bg-foreground text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-64 opacity-10 blur-3xl bg-primary rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="max-w-3xl mx-auto space-y-10">
                        <Mail size={48} className="mx-auto text-primary animate-bounce-slow" />
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85]">The Flow <br/><span className="text-primary italic">Letter.</span></h2>
                        <p className="text-xl text-white/50 leading-relaxed font-medium">
                            Join 45,000+ engineers and product leads who get our bi-weekly deep dives into 
                            high-performance engineering culture, design systems, and scaling strategy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                className="flex-1 px-8 py-5 bg-background/10 border border-white/20 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold placeholder:text-white/30"
                            />
                            <button className="btn btn-primary !rounded-[24px] !px-10 font-black">Subscribe Now</button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">No marketing fluff. Only structural value.</p>
                    </div>
                </div>
            </section>

            {/* 5. Popular Series / Case Studies */}
            <section className="py-32 px-6 bg-background border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                         <div className="max-w-2xl space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Popular Series.</h2>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">Deep-dive series exploring the intersections of code, design, and team flow.</p>
                         </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'The Scalable Tech Stack', count: '12 Parts', desc: 'A complete build-out of a high-performance SaaS using modern tools.' },
                            { title: 'Psychology of Flow', count: '5 Parts', desc: 'Understanding the biological basis of deep work and focus.' },
                            { icon: <MessageSquare />, title: 'Interview Series', count: '20+ Interviews', desc: 'Conversations with world-class engineering leads at major tech hubs.' }
                        ].map((series, i) => (
                            <div key={i} className="p-10 bg-secondary/30 rounded-[48px] border border-transparent hover:border-primary/20 hover:bg-background hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                        <Newspaper size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 rounded-full">{series.count}</span>
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{series.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{series.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Author Showcase / Contribute CTA */}
            <section className="py-32 px-6 bg-background">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-5xl font-bold tracking-tighter leading-none">Share your <br/><span className="text-primary underline decoration-dashed underline-offset-[16px] decoration-4">insights.</span></h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        Are you building something revolutionary in the world of project management or team collaboration? 
                        We're always looking for guest contributors to share their technical knowledge with our community.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                        <button className="btn btn-primary !px-12 !py-6 !rounded-[24px] !text-lg font-black shadow-2xl shadow-primary/20">Apply as Guest Author</button>
                        <button className="btn btn-secondary !px-12 !py-6 !rounded-[24px] !text-lg font-black bg-background">View Style Guide</button>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

export default BlogPage;
