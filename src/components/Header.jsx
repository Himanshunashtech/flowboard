import React from 'react';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import NotificationDropdown from './ui/NotificationDropdown';

const Header = ({ onOpenSearch }) => {
  const { user, profile } = useSelector((state) => state.auth);
  
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : user?.email?.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-border-light bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex-1 max-w-2xl cursor-text" onClick={onOpenSearch}>
        <div className="relative group pointer-events-none">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={18} />
          <input 
            type="text" 
            readOnly
            placeholder="Search cards, boards, or people... (⌘K)"
            className="w-full pl-12 h-10 bg-bg-secondary border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium outline-none placeholder:text-text-tertiary/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-xl transition-all" title="Help & Documentation">
          <HelpCircle size={20} />
        </button>
        
        <NotificationDropdown user={user} />
        
        <div className="h-8 w-px bg-border-light mx-2"></div>
        
        <Link 
          to="/settings"
          className="flex items-center gap-3 pl-2 pr-2 py-1.5 hover:bg-bg-secondary rounded-2xl transition-all border border-transparent hover:border-border-light group"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-brand-primary/20">
            {initials}
          </div>
          <div className="hidden lg:block text-left mr-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary leading-none mb-1">Account</div>
            <div className="text-xs font-bold text-text-primary leading-none truncate max-w-[100px]">
              {profile?.full_name || 'My Profile'}
            </div>
          </div>
          <ChevronDown size={14} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
