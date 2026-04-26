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
  ChevronLeft,
  Hash,
  Star,
  Zap,
  Users,
  Users2,

  ClipboardList,
  FileText,
  Sparkles,
  Inbox,
  CalendarDays,
  User,
  Bell,
  Shield,
  Link as LinkIcon
} from 'lucide-react';
import { TEMPLATES } from './modals/TemplateGallery';
import { supabase } from '../lib/supabase';
import { signOut } from '../store/slices/authSlice';
import { toggleModal, toggleSidebar } from '../store/slices/uiSlice';
import { setStarredBoardIds } from '../store/slices/boardSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);
  const { starredBoardIds, activeBoard } = useSelector((state) => state.board);
  const { sidebarOpen, sidebarHidden } = useSelector((state) => state.ui);

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
    navigate('/');
  };

  return (
    <div className={`border-r border-border bg-card backdrop-blur-xl flex flex-col h-full relative z-20 transition-all duration-300 ease-in-out
      ${sidebarHidden ? 'w-0 border-none overflow-hidden' : (sidebarOpen ? 'w-[280px]' : 'w-[72px]')}`}>



      <div className={`p-6 border-b border-border shadow-sm flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center p-4'}`}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/logo.png" alt="FlowBoard Logo" className={`rounded-lg transition-all ${sidebarOpen ? 'w-8 h-8' : 'w-10 h-10'}`} />
          {sidebarOpen && <span className="text-xl font-bold text-primary tracking-tight">FlowBoard</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 custom-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={!sidebarOpen ? 'Dashboard' : ''}>
            <LayoutDashboard size={18} className="shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/inbox" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={!sidebarOpen ? 'Inbox' : ''}>
            <Inbox size={18} className="shrink-0" />
            {sidebarOpen && <span>Inbox</span>}
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={!sidebarOpen ? 'Planner' : ''}>
            <CalendarDays size={18} className="shrink-0" />
            {sidebarOpen && <span>Planner</span>}
          </NavLink>
          <NavLink
            to={`/w/${workspaces[0]?.slug || 'default'}/team`}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            title={!sidebarOpen ? 'Team Hub' : ''}
          >
            <Users2 size={18} className="shrink-0" />
            {sidebarOpen && <span>Team Hub</span>}
          </NavLink>
          <NavLink to="/templates" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={!sidebarOpen ? 'Templates' : ''}>
            <Sparkles size={18} className="shrink-0" />
            {sidebarOpen && <span>Templates</span>}
          </NavLink>
        </div>



        {/* Teams Section */}
        <div className="mt-8">
          <div className={`px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between tracking-widest ${!sidebarOpen && 'hidden'}`}>
            <span>Teams</span>
            <button
              className="p-1 hover:bg-secondary rounded transition-colors"
              onClick={() => dispatch(toggleModal({ modalName: 'createWorkspace', isOpen: true }))}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1 px-3 mt-1">
            {workspaces.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground italic">No teams yet</div>
            ) : (
              workspaces.map((ws) => (
                <div key={ws.id} className="group px-3">
                  <div className="relative flex items-center">
                    <NavLink
                      to={`/w/${ws.slug}`}
                      className={({ isActive }) => `flex-1 flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm font-medium ${!sidebarOpen && 'justify-center mx-0'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                      title={!sidebarOpen ? ws.name : ''}
                    >
                      <Box size={18} className="shrink-0" />
                      {sidebarOpen && <span>{ws.name}</span>}
                    </NavLink>
                  </div>
                  {/* Boards within this Team */}
                  {sidebarOpen && (
                    <div className="mt-1 space-y-0.5 border-l border-border ml-8 pl-2">
                      {ws.boards?.map((board) => (
                        <NavLink
                          key={board.id}
                          to={`/w/${ws.slug}/b/${board.id}`}
                          className={({ isActive }) => `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isActive ? 'bg-primary/5 text-primary shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                        >
                          <Hash size={12} className="opacity-40" />
                          <span className="truncate">{board.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Favorite Boards Section */}
        <div className="mt-8">
          <div className={`px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between tracking-widest ${!sidebarOpen && 'hidden'}`}>
            <span>Favorite Boards</span>
            <Star size={14} className="text-muted-foreground" />
          </div>
          <div className="space-y-1 px-3 mt-1">
            {starredBoards.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground italic text-center opacity-50">No favorites yet</div>
            ) : (
              starredBoards.map(board => {
                const ws = workspaces.find(w => w.boards?.some(b => b.id === board.id));
                return (
                  <NavLink
                    key={board.id}
                    to={`/w/${ws?.slug}/b/${board.id}`}
                    className={({ isActive }) => `flex items-center gap-2.5 px-4 py-2 rounded-md transition-all text-xs font-bold ${!sidebarOpen && 'justify-center mx-1'} ${isActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                    title={!sidebarOpen ? board.title : ''}
                  >
                    <Star size={12} className={`text-yellow-500 fill-current shrink-0 ${!sidebarOpen && 'm-1'}`} />
                    {sidebarOpen && <span className="truncate">{board.title}</span>}
                  </NavLink>
                );
              })
            )}
          </div>
        </div>

        {/* Blueprints Section */}
        {sidebarOpen && (
          <div className="mt-8 mb-8">
            <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between tracking-widest">
              <span>Blueprints</span>
              <Sparkles size={14} className="text-primary" />
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
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-primary group text-left"
                >
                  <div className={`p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity bg-secondary group-hover:bg-primary/10`}>
                    <template.icon size={12} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="truncate">{template.name}</span>
                </button>
              ))}
              <NavLink
                to="/templates"
                className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-tight text-primary hover:underline text-left mt-1 block"
              >
                Browse all templates...
              </NavLink>
            </div>
          </div>
        )}
        
        {/* Global Settings Section (Moved to Bottom) */}
        <div className="mt-auto pt-8 pb-4">
           <div className={`px-4 py-2 text-[10px] font-black text-muted-foreground uppercase flex items-center justify-between tracking-[0.3em] ${!sidebarOpen && 'hidden'}`}>
            <span>Settings</span>
          </div>
          <div className="space-y-1 mt-1">
             {[
               { icon: User, label: 'Profile', tab: 'profile' },
               { icon: Sparkles, label: 'AI Persona', tab: 'ai' },
               { icon: Box, label: 'Workspace', tab: 'workspace' },
               { icon: Bell, label: 'Notifications', tab: 'notifications' },
               { icon: Shield, label: 'Security', tab: 'security' },
               { icon: LinkIcon, label: 'Integrations', tab: 'integrations' }
             ].map((item) => (
               <NavLink 
                 key={item.tab}
                 to={`/settings?tab=${item.tab}`}
                 className={({ isActive }) => {
                    const isSettings = location.pathname === '/settings';
                    const activeTab = new URLSearchParams(location.search).get('tab') || 'profile';
                    const isTabActive = isSettings && activeTab === item.tab;
                    return `flex items-center gap-3 px-4 py-2 mx-3 rounded-md transition-all text-sm font-medium ${!sidebarOpen && 'justify-center mx-1'} ${isTabActive ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`;
                 }}
                 title={!sidebarOpen ? item.label : ''}
               >
                 <item.icon size={18} className="shrink-0" />
                 {sidebarOpen && <span>{item.label}</span>}
               </NavLink>
             ))}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className={`p-4 border-t border-border bg-card/50 backdrop-blur-md ${!sidebarOpen && 'flex justify-center'}`}>
        <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border shadow-sm overflow-hidden ${!sidebarOpen && 'p-1'}`}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-lg shadow-primary/20">
            {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                <div className="text-[10px] text-muted-foreground truncate">{profile?.role || 'Personal Workspace'}</div>
              </div>
              <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Logout">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
