import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const MarketingHeader = () => {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-light sticky top-0 bg-white/80 backdrop-blur-xl z-[100]">
      <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-brand-primary tracking-tight">
        <img src="/logo.png" alt="FlowBoard Logo" className="w-10 h-10 rounded-xl" />
        FlowBoard
      </Link>
      <div className="hidden lg:flex gap-10 text-sm font-bold text-text-tertiary uppercase tracking-widest">
        <Link to="/features" className="hover:text-brand-primary transition-colors">Features</Link>
        <Link to="/integrations" className="hover:text-brand-primary transition-colors">Integrations</Link>
        <Link to="/pricing" className="hover:text-brand-primary transition-colors">Pricing</Link>
        <Link to="/changelog" className="hover:text-brand-primary transition-colors">Changelog</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="btn btn-secondary !border-none !bg-transparent text-text-primary px-4">Log in</Link>
        <Link to="/signup" className="btn btn-primary !rounded-2xl shadow-lg shadow-brand-primary/20">Get Started</Link>
      </div>
    </nav>
  );
};

export default MarketingHeader;
