import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  LogOut, 
  Box, 
  ChevronRight,
  Hash,
  Star,
  Zap,
  Users,
  Github,
  ClipboardList,
  FileText,
  Sparkles
} from 'lucide-react';
import { TEMPLATES } from './modals/TemplateGallery';
import { supabase } from '../lib/supabase';
import { signOut } from '../store/slices/authSlice';
import { toggleModal } from '../store/slices/uiSlice';
import { setStarredBoardIds } from '../store/slices/boardSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);
  const { starredBoardIds } = useSelector((state) => state.board);

  React.useEffect(() => {
    const fetchStars = async () => {
      if (!user) return;
      const { data } = await supabase.from('board_stars').select('board_id').eq('user_id', user.id);
      if (data) {
        dispatch(setStarredBoardIds(data.map(d => d.board_id)));
      }
    };
    fetchStars();
  }, [user, dispatch]);

  const starredBoards = workspaces
    .flatMap(ws => ws.boards || [])
    .filter(b => starredBoardIds.includes(b?.id));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(signOut());
    navigate('/login');
  };

  return (
    <div className="w-sidebar border-r border-border-light bg-white/40 backdrop-blur-xl flex flex-col h-full relative z-20">
      <div className="p-6 border-b border-border-light shadow-sm bg-white/20">
        <Link to="/dashboard" className="flex items-center gap-3 text-xl font-bold text-brand-primary tracking-tight">
          <img src="/logo.png" alt="FlowBoard Logo" className="w-8 h-8 rounded-lg" />
          FlowBoard
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-white text-brand-primary shadow-sm border border-border-light' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/automations" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-white text-brand-primary shadow-sm border border-border-light' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}>
            <Zap size={18} />
            <span>Automations</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-white text-brand-primary shadow-sm border border-border-light' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* Teams Section */}
        <div className="mt-8">
          <div className="px-4 py-2 text-[10px] font-bold text-text-tertiary uppercase flex items-center justify-between tracking-widest">
            <span>Teams</span>
            <button 
              className="p-1 hover:bg-bg-tertiary rounded transition-colors"
              onClick={() => dispatch(toggleModal({ modalName: 'createWorkspace', isOpen: true }))}
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="space-y-1 px-3 mt-1">
            {workspaces.length === 0 ? (
              <div className="px-4 py-2 text-xs text-text-tertiary italic">No teams yet</div>
            ) : (
              workspaces.map((ws) => (
                <div key={ws.id} className="group px-3">
                  <div className="relative flex items-center">
                    <NavLink 
                      to={`/w/${ws.slug}`} 
                      className={({ isActive }) => `flex-1 flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-white text-brand-primary shadow-sm border border-border-light' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
                    >
                      <Box size={18} />
                      <span>{ws.name}</span>
                    </NavLink>
                  </div>
                  {/* Boards within this Team */}
                  <div className="mt-1 space-y-0.5 border-l border-border-light ml-8 pl-2">
                    {ws.boards?.map((board) => (
                      <NavLink
                        key={board.id}
                        to={`/w/${ws.slug}/b/${board.id}`}
                        className={({ isActive }) => `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isActive ? 'bg-brand-primary/5 text-brand-primary shadow-sm' : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary'}`}
                      >
                         <Hash size={12} className="opacity-40" />
                         <span className="truncate">{board.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Favorite Boards Section */}
        <div className="mt-8">
          <div className="px-4 py-2 text-[10px] font-bold text-text-tertiary uppercase flex items-center justify-between tracking-widest">
            <span>Favorite Boards</span>
            <Star size={14} className="text-text-tertiary" />
          </div>
          <div className="space-y-1 px-3 mt-1">
            {starredBoards.length === 0 ? (
              <div className="px-4 py-2 text-xs text-text-tertiary italic text-center opacity-50">No favorites yet</div>
            ) : (
              starredBoards.map(board => {
                const ws = workspaces.find(w => w.boards?.some(b => b.id === board.id));
                return (
                  <NavLink
                    key={board.id}
                    to={`/w/${ws?.slug}/b/${board.id}`}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-2 rounded-md transition-all text-xs font-bold ${isActive ? 'bg-white text-brand-primary shadow-sm border border-border-light' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
                  >
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="truncate">{board.title}</span>
                  </NavLink>
                );
              })
            )}
          </div>
        </div>

        {/* Blueprints (Templates) Section */}
        <div className="mt-8 mb-8">
          <div className="px-4 py-2 text-[10px] font-bold text-text-tertiary uppercase flex items-center justify-between tracking-widest">
            <span>Blueprints</span>
            <Sparkles size={14} className="text-brand-primary" />
          </div>
          <div className="space-y-0.5 px-3 mt-1">
            {TEMPLATES.slice(0, 3).map(template => (
               <button
                key={template.id}
                type="button"
                onClick={() => dispatch(toggleModal({ 
                  modalName: 'createBoard', 
                  isOpen: true, 
                  data: { templateId: template.id } 
                }))}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all text-xs font-bold text-text-secondary hover:bg-bg-tertiary hover:text-brand-primary group text-left"
              >
                <div className={`p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity bg-bg-tertiary group-hover:bg-brand-primary/10`}>
                  <template.icon size={12} className="text-text-tertiary group-hover:text-brand-primary" />
                </div>
                <span className="truncate">{template.name}</span>
              </button>
            ))}
            <button 
              onClick={() => dispatch(toggleModal({ modalName: 'createBoard', isOpen: true }))}
              className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-tight text-brand-primary hover:underline text-left mt-1"
            >
              Browse all templates...
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border-light bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-border-light shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-brand-primary/20">
            {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
            <div className="text-[10px] text-text-tertiary truncate">{profile?.role || 'Personal Workspace'}</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
