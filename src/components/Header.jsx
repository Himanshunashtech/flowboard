import React from 'react';
import { Search, HelpCircle, ChevronDown, Users2, PanelLeft, PanelRight, Moon, Sun } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleModal, toggleSidebar, setTheme, toggleSidebarHidden } from '../store/slices/uiSlice';
import NotificationDropdown from './ui/NotificationDropdown';
import { isLightColor, darkenHexColor } from '../lib/utils';

const Header = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { sidebarOpen, theme } = useSelector((state) => state.ui);
  const { workspaces } = useSelector((state) => state.workspaces);
  const { activeBoard } = useSelector((state) => state.board);
  const activeWorkspace = useSelector((state) => state.workspaces.activeWorkspace);

  const backgroundType = activeBoard?.background_type?.toUpperCase();
  const isSolidColor = backgroundType === 'COLOR';
  const isLight = activeBoard ? isLightColor(activeBoard.background_value) : true;
  const isDarkTheme = isSolidColor && !isLight;

  const workspaceSlug = activeWorkspace?.slug || workspaces[0]?.slug || 'default';
  
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : user?.email?.substring(0, 2).toUpperCase();

  const getHeaderStyle = () => {
    if (isSolidColor) {
      const bgColor = darkenHexColor(activeBoard.background_value, -20);
      return { 
        backgroundColor: bgColor,
        borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
      };
    }
    return {};
  };

  return (
    <header 
      className={`h-16 border-b border-border-light flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-500 ${!isDarkTheme ? 'bg-white/80 backdrop-blur-md' : ''}`}
      style={getHeaderStyle()}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className={`p-2.5 rounded-xl transition-all group ${isDarkTheme ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-text-tertiary hover:bg-bg-secondary hover:text-primary'}`}
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? <PanelLeft size={22} /> : <PanelRight size={22} />}
        </button>

        <div className="flex-1 max-w-2xl cursor-text" onClick={onOpenSearch}>
        <div className="relative group pointer-events-none">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkTheme ? 'text-white/40' : 'text-text-tertiary group-focus-within:text-primary'}`} size={18} />
          <input 
            type="text" 
            readOnly
            placeholder="Search cards, boards, or people... (⌘K)"
            className={`w-full pl-12 h-10 border-none rounded-2xl transition-all text-sm font-medium outline-none placeholder:text-text-tertiary/60 ${isDarkTheme ? 'bg-white/10 text-white placeholder:text-white/40' : 'bg-bg-secondary focus:bg-white focus:ring-4 focus:ring-primary/5'}`}
          />
        </div>
      </div>
    </div>

      <div className="flex items-center gap-4">
        <button 
          className="p-2.5 text-text-tertiary hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" 
          title="Team Hub"
          onClick={() => {
             navigate(`/w/${workspaceSlug}/team`);
          }}
        >
          <Users2 size={20} />
        </button>
        <button className="p-2.5 text-text-tertiary hover:bg-bg-secondary hover:text-foreground rounded-xl transition-all" title="Help & Documentation">
          <HelpCircle size={20} />
        </button>
        
        <NotificationDropdown user={user} />
        
        <div className="h-8 w-px bg-border-light mx-2"></div>
        
        <Link 
          to="/settings"
          className={`flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-2xl transition-all border border-transparent group ${isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-bg-secondary hover:border-border-light'}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg ${isDarkTheme ? 'bg-white/20' : 'bg-primary shadow-primary/20'}`}>
            {initials}
          </div>
          <div className="hidden lg:block text-left mr-1">
            <div className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isDarkTheme ? 'text-white/40' : 'text-text-tertiary'}`}>Account</div>
            <div className={`text-xs font-bold leading-none truncate max-w-[100px] ${isDarkTheme ? 'text-white' : 'text-foreground'}`}>
              {profile?.full_name || 'My Profile'}
            </div>
          </div>
          <ChevronDown size={14} className={`transition-colors ${isDarkTheme ? 'text-white/40 group-hover:text-white' : 'text-text-tertiary group-hover:text-foreground'}`} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
