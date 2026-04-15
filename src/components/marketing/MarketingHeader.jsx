import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ChevronRight, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const NAV_LINKS = {
  product: [
    { label: 'Features', path: '/features' },
    { label: 'Integrations', path: '/integrations' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Changelog', path: '/changelog' },
  ],
  resources: [
    { label: 'Documentation', path: '/docs' },
    { label: 'Help Center', path: '/help' },
    { label: 'Community', path: '/community' },
    { label: 'Guides', path: '/guides' },
  ],
  company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Security', path: '/security' },
  ]
};

const MarketingHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border-light sticky top-0 bg-white/80 backdrop-blur-xl z-[100]">
        <Link to="/" className="flex items-center gap-3 text-xl font-black text-brand-primary tracking-tighter">
          <img src="/logo.png" alt="FlowBoard Logo" className="w-9 h-9 rounded-xl shadow-lg shadow-brand-primary/10" />
          <span className="hidden sm:inline">FlowBoard</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-10 text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
          {NAV_LINKS.product.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`hover:text-brand-primary transition-colors ${location.pathname === link.path ? 'text-brand-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="h-11 px-6 flex items-center bg-bg-secondary text-text-primary text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-bg-tertiary transition-all">
              Dashboard
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-text-primary px-4 hover:text-brand-primary transition-colors">Log in</Link>
              <Link to="/signup" className="h-11 px-6 flex items-center bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                Get Started
              </Link>
            </div>
          )}
          
          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 bg-bg-secondary rounded-xl text-text-primary hover:bg-white border border-transparent hover:border-border-light transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] lg:hidden"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full bg-white flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
                <Link to="/" className="flex items-center gap-3 text-xl font-black text-brand-primary tracking-tighter">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                  FlowBoard
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-bg-secondary rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] text-center mb-8">Access FlowBoard Console</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {user ? (
                      <Link 
                        to="/dashboard" 
                        className="h-20 flex items-center justify-center rounded-[32px] bg-brand-primary font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to="/login" 
                          className="h-20 flex items-center justify-center rounded-[32px] bg-bg-secondary font-black text-sm uppercase tracking-widest text-text-primary border border-border-light hover:bg-white transition-all shadow-inner"
                        >
                          Log In
                        </Link>
                        <Link 
                          to="/signup" 
                          className="h-20 flex items-center justify-center rounded-[32px] bg-brand-primary font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-12 border-t border-border-light flex flex-col items-center gap-6">
                   <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Connect with the nexus</p>
                   <div className="flex items-center gap-8 text-text-tertiary">
                      <a href="#" className="hover:text-brand-primary transition-colors"><Twitter size={24} /></a>

                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarketingHeader;
