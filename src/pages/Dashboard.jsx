import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Bell, Layout, Settings, Calendar, Users, UserPlus, PlusCircle, History, MessageSquare, ArrowRight, Target, CheckCircle2, Github, Sparkles, Star, Zap, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { setWorkspaces, setLoading, setActiveWorkspace } from '../store/slices/workspaceSlice';
import { toggleModal } from '../store/slices/uiSlice';
import AppLayout from '../components/layout/AppLayout';
import ActivityLogItem from '../components/ui/ActivityLogItem';
import { DashboardSkeleton } from '../components/ui/Skeleton';

const Dashboard = () => {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspaces, loading } = useSelector((state) => state.workspaces);
  const { user } = useSelector((state) => state.auth);
  const { starredBoardIds } = useSelector((state) => state.board);
  const [recentLogs, setRecentLogs] = useState([]);
  
  // Toggles for "View All" sections
  // Toggles for "View All" sections
  const [viewAllBoards, setViewAllBoards] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));

      // FETCH RECENT ACTIVITY (Specific to Dashboard)
      const { data: logData } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (full_name, email, avatar_url),
          boards (title),
          cards (title)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (logData) {
        setRecentLogs(logData);
      }
      
      dispatch(setLoading(false));
    };

    if (user) {
      fetchData();
    }
  }, [dispatch, user]);

  const filteredWorkspaces = workspaceSlug
    ? workspaces.filter(ws => ws.slug === workspaceSlug)
    : workspaces;

  const currentWorkspace = workspaceSlug ? filteredWorkspaces[0] : null;

  if (loading && workspaces.length === 0) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-16">
        {/* Massive Welcome Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-6">
          <div className="space-y-4">
            <h1 className="text-7xl font-black text-foreground tracking-tighter leading-none">
              {currentWorkspace ? currentWorkspace.name : 'Welcome back!'}
            </h1>
            <p className="text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
              {currentWorkspace
                ? `You have ${currentWorkspace.boards?.length || 0} active roadmap projects under review today.`
                : "You have 4 tasks to complete today and 2 new project invitations waiting for your review."}
            </p>
          </div>
          {!workspaceSlug && (
            <div className="flex items-center gap-4">

              <button
                className="px-8 py-4 bg-bg-secondary text-foreground border border-border rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-bg-tertiary transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                onClick={() => navigate('/templates')}
              >
                <Sparkles size={20} className="text-primary" strokeWidth={3} />
                <span>Templates</span>
              </button>
              <button
                className="px-8 py-4 bg-primary text-primary-foreground rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                onClick={() => dispatch(toggleModal({ modalName: 'createWorkspace', isOpen: true }))}
              >
                <Plus size={20} strokeWidth={3} />
                <span>New Workspace</span>
              </button>
            </div>
          )}
        </header>
        
        {/* Statistics Bar (Main Dashboard Only) */}
        {!workspaceSlug && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total Boards', 
                value: workspaces.reduce((acc, ws) => acc + (ws.boards?.length || 0), 0), 
                icon: Layout, 
                color: 'text-blue-500', 
                bg: 'bg-blue-500/10' 
              },
              { 
                label: 'Starred', 
                value: starredBoardIds.length, 
                icon: Star, 
                color: 'text-yellow-500', 
                bg: 'bg-yellow-500/10' 
              },
              { 
                label: 'Recent', 
                value: workspaces.flatMap(ws => ws.boards || [])
                  .filter(b => b.updated_at && (new Date() - new Date(b.updated_at)) < 7 * 24 * 60 * 60 * 1000).length, 
                icon: Clock, 
                color: 'text-purple-500', 
                bg: 'bg-purple-500/10' 
              },
              { 
                label: 'Active Now', 
                value: Array.from(new Set(recentLogs
                  .filter(log => (new Date() - new Date(log.created_at)) < 24 * 60 * 60 * 1000)
                  .map(log => log.board_id))).length, 
                icon: Zap, 
                color: 'text-emerald-500', 
                bg: 'bg-emerald-500/10' 
              }
            ].map((stat, i) => (
              <div key={i} className="bg-card/40 backdrop-blur-xl border border-border/50 p-6 rounded-[32px] flex items-center gap-6 group hover:bg-card/60 transition-all hover:scale-[1.02] shadow-sm">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!workspaceSlug && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              {/* Recently Viewed (High-Fidelity Roadmap Cards) */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Recently Viewed</h2>
                  <button 
                    onClick={() => setViewAllBoards(!viewAllBoards)}
                    className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    {viewAllBoards ? 'Show Less' : 'View All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {workspaces.flatMap(ws => ws.boards || []).slice(0, viewAllBoards ? 8 : 2).map((board, idx) => {
                    const ws = workspaces.find(w => w.id === board.workspace_id);
                    const hasThumbnail = board.thumbnail_url;
                    const colors = [
                      { bg: 'bg-[#FF9F7C]', tag: 'bg-[#FFB79D]', text: 'text-white', label: 'STRATEGY' },
                      { bg: 'bg-[#A3D9FF]', tag: 'bg-[#C5E8FF]', text: 'text-foreground', label: 'DEVELOPMENT' }
                    ];
                    const theme = colors[idx % colors.length];

                    return (
                      <Link
                        key={board.id}
                        to={`/w/${ws?.slug}/b/${board.id}`}
                        className={`group relative h-72 rounded-[48px] overflow-hidden ${hasThumbnail ? 'bg-black' : theme.bg} shadow-2xl shadow-black/5 hover:-translate-y-3 transition-all duration-700 p-10 flex flex-col justify-between`}
                      >
                        {/* Background Image with Overlay */}
                        {hasThumbnail && (
                          <>
                            <div 
                              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"
                              style={{ backgroundImage: `url(${board.thumbnail_url})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 group-hover:from-black/50 transition-colors" />
                          </>
                        )}

                        <div className="relative z-10 space-y-6">
                          <div className={`px-4 py-2 rounded-2xl ${hasThumbnail ? 'bg-white/10 backdrop-blur-md' : theme.tag} inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] ${hasThumbnail ? 'text-white' : theme.text} shadow-sm border border-white/10`}>
                            {theme.label}
                          </div>
                          <h4 className={`text-4xl font-black leading-tight tracking-tight ${hasThumbnail ? 'text-white' : theme.text}`}>
                            {board.title}
                          </h4>
                          <div className={`text-xs font-bold ${hasThumbnail ? 'text-white/70' : theme.text + ' opacity-70'}`}>
                            Updated by {ws?.profiles?.full_name?.split(' ')[0] || 'Team'}
                          </div>
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className={`h-2.5 w-full ${hasThumbnail ? 'bg-white/20' : 'bg-white/20'} rounded-full overflow-hidden border border-white/10`}>
                            <div
                              className={`h-full ${hasThumbnail ? 'bg-primary' : 'bg-black/40 group-hover:bg-black/60'} transition-all duration-1000 ease-out`}
                              style={{ width: idx === 0 ? '65%' : '40%' }}
                            />
                          </div>
                        </div>

                        {/* Background Decorative Icon - Subtler on images */}
                        {!hasThumbnail && (
                          <div className="absolute bottom-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none">
                            <Layout size={200} strokeWidth={1} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>

              {workspaces.flatMap(ws => ws.boards || []).length === 0 && (
                <div className="col-span-full p-12 border-2 border-dashed border-border rounded-[40px] bg-secondary/30 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <History size={32} />
                  </div>
                  <p className="font-bold text-sm">Your recent boards will materialize here.</p>
                </div>
              )}

              {/* Your Workspaces (Horizontal Pro Capsules) */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Your Teams</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Active Ops</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredWorkspaces.map(ws => (
                    <div
                      key={ws.id}
                      className="group bg-card border border-border rounded-[32px] p-8 flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                      onClick={() => {
                        dispatch(setActiveWorkspace(ws));
                        navigate(`/w/${ws.slug}`);
                      }}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-[24px] flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg ring-4 ring-secondary group-hover:rotate-6 transition-transform">
                          {ws.name[0]}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-foreground tracking-tight">{ws.name}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <span className="text-primary">{ws.boards?.length || 0} Active Projects</span>
                            <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                            <span>{24} Members</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/w/${ws.slug}/team`);
                          }}
                          className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 transition-all group/team"
                          title="Team Directory"
                        >
                          <Users size={20} className="group-hover/team:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/settings?tab=workspace`);
                          }}
                          className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group/settings"
                        >
                          <Settings size={20} className="group-hover/settings:rotate-90 transition-transform duration-500" />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-10">
              <section>
                <div className="flex items-center justify-between mb-8 ps-2">
                  <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Activity Feed</h2>
                </div>
                <div className="bg-card border border-border rounded-[48px] p-10 shadow-sm relative overflow-hidden">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[64px] top-24 bottom-24 w-0.5 bg-secondary rounded-full" />

                  <div className="space-y-2 relative z-10">
                    {recentLogs.length === 0 ? (
                      <div className="py-20 text-center opacity-50">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No activity yet</p>
                      </div>
                    ) : (
                      recentLogs.map(log => (
                        <ActivityLogItem key={log.id} log={log} />
                      ))
                    )}
                  </div>

                  <button 
                    onClick={() => navigate('/history')}
                    className="w-full mt-6 py-4 bg-secondary hover:bg-muted rounded-[24px] text-xs font-black uppercase tracking-widest text-muted-foreground transition-all active:scale-95 shadow-sm"
                  >
                    View Full History
                  </button>
                </div>
              </section>
            </aside>
          </div>
        )}

        {/* Global Floating Action Button (FAB) */}
        {!workspaceSlug && (
          <button
            onClick={() => dispatch(toggleModal({ modalName: 'createBoard', isOpen: true }))}
            className="fixed bottom-12 right-12 w-20 h-20 bg-primary text-primary-foreground rounded-[32px] shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[100] group"
          >
            <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
            <div className="absolute -top-12 right-0 bg-foreground text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              New Board
            </div>
          </button>
        )}

        {workspaceSlug && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            {/* Header Area */}
            {/* Dynamic Content Divider - No duplicate title needed as it is in the main header */}
            <div className="h-px w-full bg-border/50" />


            {/* Vibrant Theme Banner */}
            <div className="relative bg-gradient-to-br from-primary to-indigo-600 rounded-[48px] p-12 text-primary-foreground overflow-hidden shadow-2xl shadow-primary/20 group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                <Users size={200} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="px-4 py-1.5 bg-primary-foreground/10 rounded-full inline-block text-[10px] font-black uppercase tracking-widest border border-primary-foreground/10">Workspace Active</div>
                  <h2 className="text-5xl font-black tracking-tight leading-tight">Team Access Enabled</h2>
                  <div className="flex items-center gap-6 text-sm font-bold text-primary-foreground/80">
                     <span className="flex items-center gap-2"><Layout size={16} /> {filteredWorkspaces[0]?.boards?.length || 0} Project</span>
                     <span className="flex items-center gap-2"><Users size={16} /> Shared with Team</span>
                  </div>
                </div>
                <button 
                  className="bg-primary-foreground text-primary hover:opacity-90 px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  onClick={() => dispatch(toggleModal({ modalName: 'memberInvite', isOpen: true }))}
                >
                  <UserPlus size={18} />
                  <span>Invite Team</span>
                </button>
              </div>
            </div>

            {/* Boards Grid Section */}
            <div>
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Workspace Boards</h2>
                 <div className="flex bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                    <button className="p-2 bg-secondary rounded-xl text-primary" title="Grid View"><Layout size={16} /></button>
                    <button 
                      onClick={() => navigate(`/w/${workspaceSlug}/team`)}
                      className="p-2 text-muted-foreground hover:text-primary" 
                      title="Team View"
                    >
                      <Users size={16} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredWorkspaces.flatMap(ws => ws.boards || []).map(board => (
                  <Link
                    key={board.id}
                    to={`/w/${workspaceSlug}/b/${board.id}`}
                    className="group bg-card rounded-[40px] border border-border shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Card Thumbnail */}
                    <div className="p-3">
                      <div 
                         className="h-44 rounded-[32px] overflow-hidden relative shadow-inner bg-secondary"
                      >
                         {board.thumbnail_url ? (
                           <img 
                             src={board.thumbnail_url} 
                             alt="" 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                           />
                         ) : (
                           <div 
                             className="w-full h-full opacity-50"
                             style={{ 
                               background: board.background_type === 'IMAGE' ? board.background_value : board.background_value,
                               backgroundSize: 'cover',
                               backgroundPosition: 'center'
                             }}
                           />
                         )}
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                         <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20 shadow-sm">
                            Portfolio Project
                         </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{board.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 font-medium">Strategic roadmap and project milestones for this project.</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                          <div className="flex -space-x-3">
                            {filteredWorkspaces[0]?.workspace_members?.slice(0, 3).map((member, i) => (
                              <div 
                                 key={member.user_id} 
                                 className="w-9 h-9 rounded-full border-4 border-card bg-muted overflow-hidden shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center"
                                 title={member.profiles?.full_name}
                              >
                                 {member.profiles?.avatar_url ? (
                                   <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-[10px] font-black">{member.profiles?.full_name?.[0].toUpperCase()}</span>
                                 )}
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                             View Board
                          </div>
                      </div>
                    </div>
                  </Link>
                ))}


                {/* New Theme Create Board Action */}
                <button
                  onClick={() => {
                    dispatch(setActiveWorkspace(filteredWorkspaces[0]));
                    dispatch(toggleModal({ modalName: 'createBoard', isOpen: true }));
                  }}
                  className="group bg-secondary border-2 border-dashed border-border rounded-[40px] h-full min-h-[400px] flex flex-col items-center justify-center gap-6 hover:bg-primary transition-all duration-500 hover:border-primary text-foreground hover:text-primary-foreground group"
                >
                  <div className="w-20 h-20 rounded-[32px] bg-card text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Plus size={32} strokeWidth={3} />
                  </div>
                  <div className="text-center px-8">
                     <span className="block text-sm font-black uppercase tracking-[0.2em] mb-1">Add New Board</span>
                     <p className="text-[10px] opacity-60 font-medium">Start a new creative canvas</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Activity Section */}
            <section className="pt-20">
               <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-10">Recent Activity</h2>
               <div className="space-y-4">
                   {recentLogs.slice(0, 6).map(log => {
                     const formatActivity = (l) => {
                       const name = l.profiles?.full_name || 'Someone';
                       const boardName = l.boards?.title || 'a board';
                       const cardName = l.cards?.title || 'a task';
                       
                       switch (l.action) {
                          case 'card.created': return { text: `${name} created ${cardName}`, icon: <Plus size={18} />, color: 'text-green-600', bg: 'bg-green-100' };
                          case 'card.moved': return { text: `${name} moved ${cardName}`, icon: <ArrowRight size={18} />, color: 'text-blue-600', bg: 'bg-blue-100' };
                          case 'comment.added': return { text: `${name} commented on ${cardName}`, icon: <MessageSquare size={18} />, color: 'text-purple-600', bg: 'bg-purple-100' };
                          case 'board.created': return { text: `${name} created board ${boardName}`, icon: <Layout size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-100' };
                          case 'member.added': return { text: `${name} joined the team`, icon: <UserPlus size={18} />, color: 'text-orange-600', bg: 'bg-orange-100' };
                          default: return { text: `${name} updated ${cardName}`, icon: <History size={18} />, color: 'text-primary', bg: 'bg-primary/10' };
                        }
                     };

                     const { text, icon, color, bg } = formatActivity(log);

                     return (
                        <div key={log.id} className="flex items-center justify-between p-6 bg-card rounded-[32px] border border-border shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
                                 {icon}
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[11px] font-black text-foreground">{text}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium">
                                   {new Date(log.created_at).toLocaleDateString()} • In {log.boards?.title || 'General'}
                                 </p>
                              </div>
                           </div>
                           <div className="w-2 h-2 rounded-full bg-border" />
                        </div>
                      );
                   })}
               </div>
            </section>
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
