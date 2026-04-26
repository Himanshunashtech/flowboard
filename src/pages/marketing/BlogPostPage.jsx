import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MarketingLayout from '../../components/layout/MarketingLayout';
import { BLOG_POSTS } from '../../data/blogContent';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  MessageSquare, 
  ThumbsUp, 
  ChevronRight,
  User,
  Twitter,
  Linkedin,
  Mail,
  Bookmark
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS[slug];
  const [readingProgress, setReadingProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [post, navigate]);

  if (!post) return null;

  return (
    <MarketingLayout>
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-[72px] md:top-[80px] left-0 right-0 h-1.5 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Back Button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-primary transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </Link>

          {/* Title & Metadata */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                {post.category}
              </span>
              <span className="text-xs text-text-tertiary font-bold">•</span>
              <div className="flex items-center gap-2 text-xs text-text-tertiary font-bold">
                <Clock size={14} />
                {post.readTime} Read
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.95]">
              {post.title}
            </h1>

            <div className="flex items-center justify-between py-8 border-y border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary overflow-hidden border border-border shadow-sm">
                  <img src={post.authorImg} alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">{post.author}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">{post.authorRole}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button className="p-3 bg-secondary rounded-xl text-text-tertiary hover:text-primary hover:bg-primary/5 transition-all">
                  <Twitter size={18} />
                </button>
                <button className="p-3 bg-secondary rounded-xl text-text-tertiary hover:text-primary hover:bg-primary/5 transition-all">
                  <Linkedin size={18} />
                </button>
                <button className="p-3 bg-secondary rounded-xl text-text-tertiary hover:text-primary hover:bg-primary/5 transition-all">
                  <Link size={18} />
                </button>
                <button className="p-3 bg-secondary rounded-xl text-text-tertiary hover:text-primary hover:bg-primary/5 transition-all">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-[21/9] rounded-[48px] overflow-hidden border border-border bg-secondary shadow-2xl shadow-black/5">
             <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <article 
            className="prose prose-xl prose-slate max-w-none 
              prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
              prose-p:text-text-secondary prose-p:font-medium prose-p:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-bg-secondary prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:font-black prose-blockquote:tracking-tight
              prose-li:text-text-secondary prose-li:font-medium
              prose-strong:text-foreground prose-strong:font-black
              prose-lead:text-2xl prose-lead:font-black prose-lead:text-foreground prose-lead:tracking-tight prose-lead:mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Post Footer / Actions */}
          <div className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-primary/5 hover:text-primary rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <ThumbsUp size={16} />
                Clap (42)
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-primary/5 hover:text-primary rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <MessageSquare size={16} />
                Comment (12)
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Share Article</span>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary transition-colors">
                  <Twitter size={14} />
                </button>
                <button className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary transition-colors">
                  <Linkedin size={14} />
                </button>
                <button className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary transition-colors">
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Articles */}
      <section className="py-32 px-6 bg-bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-16">
            <h2 className="text-4xl font-black text-foreground tracking-tighter italic">Keep Flowing.</h2>
            <Link to="/blog" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View all articles</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(BLOG_POSTS)
              .filter(([pSlug]) => pSlug !== slug)
              .slice(0, 3)
              .map(([pSlug, pData]) => (
                <Link 
                  key={pSlug} 
                  to={`/blog/${pSlug}`}
                  className="group space-y-6"
                >
                  <div className="aspect-[4/3] rounded-[32px] overflow-hidden border border-border shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={pData.image} alt={pData.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="space-y-3 ps-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">{pData.category}</span>
                    <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{pData.title}</h3>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Newsletter Shortcut */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-black text-white tracking-tighter">Get the next deep dive.</h2>
            <p className="text-white/70 font-medium">Join 45,000+ practitioners who get our structural insights delivered bi-weekly.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="name@company.com" className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 font-bold focus:outline-none focus:ring-4 focus:ring-white/10" />
              <button className="px-8 py-4 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-xs hvr-scale shadow-xl shadow-black/10">Subscribe</button>
            </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default BlogPostPage;
