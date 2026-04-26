import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Zap, Menu, X, ChevronRight, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../../store/slices/uiSlice';

const NAV_LINKS = {
  product: [
    { label: 'Features', path: '/features' },
    { label: 'Integrations', path: '/integrations' },
  ],
  resources: [
    { label: 'Help Center', path: '/help' },
    { label: 'Community', path: '/community' },
  ],
  company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Security', path: '/security' },
  ]
};

const MarketingHeader = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);

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
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-[100]">
        <Link to="/" className="flex items-center gap-3 text-xl font-black text-primary tracking-tighter">
          <img src="/logo.png" alt="FlowBoard Logo" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/10" />
          <span className="hidden sm:inline">FlowBoard</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          {NAV_LINKS.product.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <Link to="/dashboard" className="h-11 px-6 flex items-center bg-secondary text-foreground text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-muted transition-all">
              Dashboard
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-foreground px-4 hover:text-primary transition-colors">Log in</Link>
              <Link to="/signup" className="h-11 px-6 flex items-center bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Get Started
              </Link>
            </div>
          )}
          
          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 bg-secondary rounded-xl text-foreground hover:bg-card border border-transparent hover:border-border transition-all"
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
              className="absolute inset-y-0 right-0 w-full bg-background flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <Link to="/" className="flex items-center gap-3 text-xl font-black text-primary tracking-tighter">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                  FlowBoard
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-secondary rounded-xl text-foreground">
                  <X size={20} />
                </button>
              </div>

               <div className="flex-1 flex flex-col justify-center px-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] text-center mb-8">Access FlowBoard Console</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {user ? (
                      <Link 
                        to="/dashboard" 
                        className="h-20 flex items-center justify-center rounded-[32px] bg-primary font-black text-sm uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to="/login" 
                          className="h-20 flex items-center justify-center rounded-[32px] bg-secondary font-black text-sm uppercase tracking-widest text-foreground border border-border hover:bg-card transition-all shadow-inner"
                        >
                          Log In
                        </Link>
                        <Link 
                          to="/signup" 
                          className="h-20 flex items-center justify-center rounded-[32px] bg-primary font-black text-sm uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-12 border-t border-border flex flex-col items-center gap-6">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Connect with the nexus</p>
                   <div className="flex items-center gap-8 text-muted-foreground">
                      <a href="#" className="hover:text-primary transition-colors"><Twitter size={24} /></a>
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
