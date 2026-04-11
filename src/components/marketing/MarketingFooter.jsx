import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const MarketingFooter = () => {
  return (
    <footer className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-8">Product</h4>
          <ul className="space-y-4 font-bold text-text-secondary">
            <li><Link to="/features" className="hover:text-brand-primary transition-colors">Features</Link></li>
            <li><Link to="/integrations" className="hover:text-brand-primary transition-colors">Integrations</Link></li>
            <li><Link to="/pricing" className="hover:text-brand-primary transition-colors">Pricing</Link></li>
            <li><Link to="/changelog" className="hover:text-brand-primary transition-colors">Changelog</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-8">Resources</h4>
          <ul className="space-y-4 font-bold text-text-secondary">
            <li><Link to="/docs" className="hover:text-brand-primary transition-colors">Documentation</Link></li>
            <li><Link to="/help" className="hover:text-brand-primary transition-colors">Help Center</Link></li>
            <li><Link to="/community" className="hover:text-brand-primary transition-colors">Community</Link></li>
            <li><Link to="/guides" className="hover:text-brand-primary transition-colors">Guides</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-8">Company</h4>
          <ul className="space-y-4 font-bold text-text-secondary">
            <li><Link to="/about" className="hover:text-brand-primary transition-colors">About</Link></li>
            <li><Link to="/blog" className="hover:text-brand-primary transition-colors">Blog</Link></li>
            <li><Link to="/careers" className="hover:text-brand-primary transition-colors">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-brand-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-8">Legal</h4>
          <ul className="space-y-4 font-bold text-text-secondary">
            <li><Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/security" className="hover:text-brand-primary transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-border-light flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-xl font-bold text-brand-primary tracking-tight">
          <img src="/logo.png" alt="FlowBoard Logo" className="w-6 h-6 rounded-lg" />
          FlowBoard
        </div>
        <div className="text-[11px] font-bold text-text-tertiary tracking-widest uppercase text-center md:text-left">
          © 2026 FlowBoard Inc. Made with <Zap size={10} className="inline fill-current text-warning" /> for high-performance teams.
        </div>
        <div className="flex gap-6 text-text-tertiary">
           {/* Social icons Placeholder */}
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
