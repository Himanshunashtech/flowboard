import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Filter, 
  MoreHorizontal, 
  Share2, 
  Calendar, 
  Table2, 
  Kanban, 
  Network, 
  ChevronDown, 
  History as HistoryIcon, 
  Star, 
  Settings, 
  BarChart3, 
  Clock,
  ArrowRightCircle,
  Shield,
  X,
  Maximize2,
  Minimize2,
  GitGraph
} from 'lucide-react';
import BoardSharePopover from '../components/board/BoardSharePopover';
import JoinWorkspaceModal from '../components/modals/JoinWorkspaceModal';
import PrismRulesDialog from '../components/modals/PrismRulesDialog';
import { supabase, getBoardChannel, removeBoardChannel } from '../lib/supabase';
import {
  setActiveBoard,
  setLists,
  setCards,
  setBoardMembers,
  setLabels,
  setLoading,
  addList,
  updateList,
  deleteList,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  setStarredBoardIds,
  toggleStar,
  setSprints,
  setDependencies,
  setPresence
} from '../store/slices/boardSlice';
import { addNotification, toggleModal, toggleSidebarHidden } from '../store/slices/uiSlice';
import { throttle, isLightColor, darkenHexColor } from '../lib/utils';
import { Ordering } from '../lib/ordering';
import LiveCursors from '../components/board/LiveCursors';
import AppLayout from '../components/layout/AppLayout';
import ListView from '../components/canvas/ListView';
import CardDetailsModal from '../components/canvas/CardDetailsModal';
import SprintManager from '../components/board/SprintManager';
import TableView from '../components/board/TableView';
import CalendarView from '../components/board/CalendarView';
import TimelineView from '../components/board/TimelineView';
import DependencyMap from '../components/board/DependencyMap';
import MindmapView from '../components/board/MindmapView';
import AnalyticsDashboard from '../components/board/AnalyticsDashboard';
import BoardSettingsDrawer from '../components/board/BoardSettingsDrawer';
import { BoardSkeleton } from '../components/ui/Skeleton';
import { useUndoRedo } from '../hooks/useUndoRedo';
import ActivitySidePanel from '../components/board/ActivitySidePanel';
import TemplateGuideModal from '../components/modals/TemplateGuideModal';
import { TEMPLATES } from '../components/modals/TemplateGallery';


const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { activeBoard, lists, cards, loading, members, presence, starredBoardIds } = useSelector((state) => state.board);
  const { modals, sidebarHidden } = useSelector((state) => state.ui);
  const { user, profile, loading: authLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const channelRef = useRef(null);
  const prevPresenceKeys = useRef([]);
  const { pushAction } = useUndoRedo();
  
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'kanban';
  const setCurrentView = (view) => setSearchParams({ view });

  const [showSharePopover, setShowSharePopover] = useState(false);
  const shareBtnRef = useRef(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [targetWorkspace, setTargetWorkspace] = useState(null);
  const [joining, setJoining] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isBoardCollapsed, setIsBoardCollapsed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const viewBtnRef = useRef(null);
  const [isWsMember, setIsWsMember] = useState(false);
  const [isWsAdmin, setIsWsAdmin] = useState(false);

  const handleCreateList = async () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }

    const pos = lists.length > 0 
      ? Ordering.last(lists[lists.length - 1].position)
      : Ordering.first(null);

    const tempId = crypto.randomUUID();
    const optimisticList = {
      id: tempId,
      board_id: boardId,
      title: newListTitle.trim(),
      position: pos
    };

    // Step 1: Optimistic Update
    dispatch(addList(optimisticList));
    setNewListTitle('');
    setIsAddingList(false);

    // Step 2: Remote Persistence
    const { data, error } = await supabase
      .from('lists')
      .insert({
        board_id: boardId,
        title: newListTitle.trim(),
        position: pos
      })
      .select()
      .single();

    if (error) {
      dispatch(addNotification({ message: 'Failed to create list', type: 'error' }));
      dispatch(deleteList(tempId)); // Rollback
    } else {
      // The real-time listener will eventually replace the tempId version with the real data
      // but we can also manually replace it here if we want absolute certainty.
      dispatch(deleteList(tempId));
      dispatch(addList(data));
    }
  };


  // --- Drag-to-Scroll Logic ---
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (e.target.closest('.list-container') || e.target.closest('button')) return;
    setIsDragging(true);
    setStartX(e.pageX - canvasRef.current.offsetLeft);
    setScrollLeft(canvasRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - canvasRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    canvasRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchBoardData = async () => {
      dispatch(setLoading(true));
      
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select(`
          *,
          workspace:workspaces(id, name),
          custom_fields(*)
        `)
        .eq('id', boardId)
        .maybeSingle();
      
      // If no board found (could be RLS or invalid ID)
      if (!board) {
        if (!user) {
          navigate('/login');
          return;
        }
        
        // If logged in but can't see board, check if it exists at all
        // We'll try a fallback to see if we can get basic info
        const { data: basic } = await supabase.from('boards').select('id, title, workspace_id').eq('id', boardId).maybeSingle();
        if (basic) {
          // If we see basic info but no full data, it's a join opportunity
          const { data: ws } = await supabase.from('workspaces').select('name').eq('id', basic.workspace_id).maybeSingle();
          setTargetWorkspace({ id: basic.workspace_id, name: ws?.name });
          setShowJoinModal(true);
        } else {
          // Truly not found or absolutely private
          dispatch(addNotification({ message: 'Board not found or no access', type: 'error' }));
          navigate('/dashboard');
        }
        dispatch(setLoading(false));
        return;
      }

      // Check membership
      const { data: memberData } = await supabase.from('board_members').select('*, profiles(*)').eq('board_id', boardId);
      const isMem = memberData?.some(m => m.user_id === user?.id);

      // Check workspace membership for role-based access
      const { data: wsMem } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', board.workspace_id)
        .eq('user_id', user?.id)
        .maybeSingle();

      const isWsMember = !!wsMem;
      const isWsAdmin = wsMem?.role === 'ADMIN' || wsMem?.role === 'OWNER';
      setIsWsMember(isWsMember);
      setIsWsAdmin(isWsAdmin);

      if (board.visibility === 'PRIVATE' && !isMem && !isWsAdmin && user) {
        setTargetWorkspace({ id: board.workspace_id, name: board.workspace?.name });
        setShowJoinModal(true);
        dispatch(setLoading(false));
        return;
      }

      dispatch(setActiveBoard(board));
      if (memberData) dispatch(setBoardMembers(memberData));

      const { data: listData, error: listError } = await supabase.from('lists').select('*').eq('board_id', boardId).order('position');
      if (listError) console.error('RLS Error (Lists):', listError);
      if (listData) dispatch(setLists(listData));

      const { data: cardData, error: cardError } = await supabase.from('cards')
        .select('*, card_labels(label_id), card_assignments(user_id), checklists(checklist_items(id, title, is_completed)), comments(id), attachments(id), time_entries(id, user_id, ended_at)')
        .eq('board_id', boardId).order('position');
      
      if (cardError) console.error('RLS Error (Cards):', cardError);
      if (cardData) dispatch(setCards(cardData));

      dispatch(setLoading(false));
    };

    if (boardId) {
      fetchBoardData();

      // Check for pending template guide
      const pendingTemplateId = localStorage.getItem(`flowboard_guide_pending_${boardId}`);
      if (pendingTemplateId) {
        const template = TEMPLATES.find(t => t.id === pendingTemplateId);
        if (template) {
          setActiveTemplate(template);
          setShowGuideModal(true);
          // Clear flag so it only shows once
          localStorage.removeItem(`flowboard_guide_pending_${boardId}`);
        }
      }

      const channel = getBoardChannel(boardId);
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const cursorMap = {};
          const currentKeys = Object.keys(newState);
          
          Object.keys(newState).forEach((key) => {
            const data = newState[key][newState[key].length - 1];
            if (data.user) {
              cursorMap[data.user.id] = data;
              if (data.user.id !== user?.id && !prevPresenceKeys.current.includes(data.user.id)) {
                dispatch(addNotification({ message: `${data.user.full_name} joined the board`, type: 'info' }));
              }
            }
          });
          prevPresenceKeys.current = currentKeys.map(k => newState[k][0]?.user?.id).filter(Boolean);
          dispatch(setPresence(cursorMap));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Handled by sync
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          // Handled by sync
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` }, (payload) => {
          if (payload.eventType === 'INSERT') dispatch(addCard(payload.new));
          if (payload.eventType === 'UPDATE') dispatch(updateCard(payload.new));
          if (payload.eventType === 'DELETE') dispatch(deleteCard(payload.old.id));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lists', filter: `board_id=eq.${boardId}` }, (payload) => {
          if (payload.eventType === 'INSERT') dispatch(addList(payload.new));
          if (payload.eventType === 'UPDATE') dispatch(updateList(payload.new));
          if (payload.eventType === 'DELETE') dispatch(deleteList(payload.old.id));
        })
        .subscribe();

      return () => {
        removeBoardChannel(boardId);
        channelRef.current = null;
      };
    }
  }, [boardId, dispatch, user, profile]);

  const updatePresence = useCallback(
    throttle((data) => {
      if (channelRef.current) {
        channelRef.current.track({
          user: { id: user?.id, full_name: profile?.full_name || user?.email, avatar_url: profile?.avatar_url },
          ...data,
          lastActive: Date.now()
        });
      }
    }, 100),
    [user, profile]
  );

  const handleBoardMouseMove = (e) => updatePresence({ cursor: { x: e.pageX, y: e.pageY } });

  const handleCardClick = (e, cardId) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    if (type === 'card' && !isReadOnly) {
      const cardId = draggableId;
      const newListId = destination.droppableId;
      const newIndex = destination.index;

      const destCards = cards.filter(c => c.list_id === newListId).sort((a, b) => String(a.position || '').localeCompare(String(b.position || '')));
      const newPosition = Ordering.between(destCards[newIndex - 1]?.position, destCards[newIndex]?.position);

      pushAction({
        label: 'Move Card',
        undo: async () => {
           await supabase.from('cards').update({ list_id: source.droppableId }).eq('id', cardId);
           dispatch(addNotification({ message: 'Moved card back', type: 'info' }));
        }
      });

      dispatch(updateCard({ id: cardId, list_id: newListId, position: newPosition }));
      await supabase.from('cards').update({ list_id: newListId, position: newPosition }).eq('id', cardId);
    }
  };

  const handleAcceptJoin = async () => {
    if (!targetWorkspace || !user) return;
    setJoining(true);
    try {
      // 1. Join Workspace
      const { error: wsError } = await supabase.from('workspace_members').insert({
        workspace_id: targetWorkspace.id,
        user_id: user.id,
        role: 'MEMBER'
      });
      if (wsError && wsError.code !== '23505') throw wsError; // Ignore if already member

      // 2. Join Board explicitly (if needed for board_members)
      const { error: boardError } = await supabase.from('board_members').insert({
        board_id: boardId,
        user_id: user.id,
        role: 'MEMBER'
      });
      if (boardError && boardError.code !== '23505') throw boardError;

      setShowJoinModal(false);
      dispatch(addNotification({ message: `Welcome to ${targetWorkspace.name}!`, type: 'success' }));
      // Reload Board Data
      window.location.reload(); // Simple reload to refresh everything
    } catch (err) {
      console.error('Join Error:', err);
      dispatch(addNotification({ message: 'Failed to join workspace', type: 'error' }));
    } finally {
      setJoining(false);
    }
  };

  const isMember = members.some(m => m.user_id === user?.id);
  const isReadOnly = (activeBoard?.visibility === 'PUBLIC' && !isMember && !isWsMember) || (!user);


  const updateVisibility = async (newVisibility) => {
    const { data, error } = await supabase.from('boards').update({ visibility: newVisibility }).eq('id', boardId).select().maybeSingle();
    if (error) {
      dispatch(addNotification({ message: 'Failed to update visibility', type: 'error' }));
    } else if (data) {
      dispatch(setActiveBoard(data));
      dispatch(addNotification({ message: 'Board visibility updated', type: 'success' }));
    } else {
      dispatch(addNotification({ message: 'Permission denied for visibility update', type: 'error' }));
    }
  };

  if (loading && !activeBoard) return <AppLayout scrollable={false}><BoardSkeleton /></AppLayout>;


  const getBackgroundStyle = () => {
    if (!activeBoard) return {};
    const val = activeBoard.background_value;
    switch (activeBoard.background_type) {
      case 'COLOR': return { backgroundColor: val };
      case 'GRADIENT': return { background: val };
      case 'PATTERN': 
        return { 
          backgroundImage: val.startsWith('url') ? val : `url("${val}")`, 
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto' 
        };
      case 'IMAGE': 
        return { 
          backgroundImage: val.startsWith('url') ? val : `url("${val}")`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        };
      default: return { backgroundColor: 'var(--background)' };
    }
  };
  
  const backgroundType = activeBoard?.background_type?.toUpperCase();
  const isSolidColor = backgroundType === 'COLOR';
  const isLight = activeBoard ? isLightColor(activeBoard.background_value) : true;
  
  const navTextColor = isSolidColor && !isLight ? 'text-white' : 'text-slate-900';
  const navSecondaryColor = isSolidColor && !isLight ? 'text-white/60' : 'text-slate-500';
  const navBgColor = isSolidColor && !isLight ? 'bg-white/10' : 'bg-slate-100';
  const borderColor = isSolidColor && !isLight ? 'border-white/10' : 'border-slate-200';

  const getHeaderStyle = () => {
    if (isSolidColor) {
      const bgColor = darkenHexColor(activeBoard.background_value, -10);
      return { 
        backgroundColor: bgColor,
        borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: 'none',
        backdropFilter: 'none'
      };
    }
    return { 
      backgroundColor: 'white',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      backdropFilter: 'none'
    };
  };

  const headerNavLinkClass = (isActive) => `flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : `${isSolidColor && !isLight ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}`;
  const headerIconColor = isSolidColor && !isLight ? "text-white/40 group-hover:text-white transition-colors" : "text-slate-400 group-hover:text-primary transition-colors";
  const headerTextColor = isSolidColor && !isLight ? "text-white font-black" : "text-slate-900 font-black";
  const headerSecondaryColor = isSolidColor && !isLight ? "text-white/60" : "text-slate-500";

  return (
    <AppLayout scrollable={false}>
      <div className="flex flex-col h-full overflow-hidden transition-all duration-700" style={getBackgroundStyle()} onMouseMove={handleBoardMouseMove}>
        <LiveCursors />
        <header 
          className="h-18 flex items-center justify-between px-8 shrink-0 z-[50] relative"
          style={getHeaderStyle()}
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group/star">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                   <div className={`w-2 h-2 rounded-full ${activeBoard?.visibility === 'PUBLIC' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                   <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${navSecondaryColor}`}>{activeBoard?.visibility} PROJECT</span>
                </div>
                <h2 className={`text-3xl font-black ${navTextColor} tracking-tighter leading-none whitespace-nowrap`}>{activeBoard?.title}</h2>
              </div>
              
              <button 
                onClick={async () => {
                  const isStarred = starredBoardIds.includes(activeBoard.id);
                  dispatch(toggleStar(activeBoard.id));
                  if (isStarred) {
                    await supabase.from('board_stars').delete().eq('board_id', activeBoard.id).eq('user_id', user.id);
                  } else {
                    await supabase.from('board_stars').insert({ board_id: activeBoard.id, user_id: user.id });
                  }
                }}
                className={`p-2.5 rounded-2xl transition-all ${starredBoardIds.includes(activeBoard?.id) ? 'text-yellow-400 bg-yellow-400/10' : `${navTextColor} opacity-20 hover:opacity-100 hover:bg-white/10`}`}
              >
                <Star size={22} fill={starredBoardIds.includes(activeBoard?.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="h-10 w-px bg-border/20 mx-2 hidden lg:block"></div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {members?.slice(0, 5).map((m, i) => (
                  <motion.div 
                    key={m.user_id} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-9 h-9 rounded-2xl border-2 ${isLight ? 'border-primary/20' : 'border-white/20'} bg-primary flex items-center justify-center text-xs font-black text-primary-foreground shadow-xl ring-4 ring-black/5`}
                  >
                    {(m.profiles?.full_name || m.profiles?.email || '?')[0].toUpperCase()}
                  </motion.div>
                ))}
              </div>
              {isReadOnly && (
                <div className={`flex items-center gap-2 px-4 py-1.5 ${isLight ? 'bg-primary/10 border-primary/20' : 'bg-yellow-400/20 border-yellow-400/30'} rounded-xl border backdrop-blur-md`}>
                  <Shield size={14} className={isLight ? 'text-primary' : 'text-yellow-400'} />
                  <span className={`text-[10px] font-black uppercase ${isLight ? 'text-primary' : 'text-yellow-100'} tracking-widest`}>Read Only</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* View Switcher: Dropdown Style */}
            <div className="relative">
              {(() => {
                const ViewIcon = [
                  { id: 'kanban', icon: Kanban, label: 'Board' },
                  { id: 'table', icon: Table2, label: 'Table' },
                  { id: 'calendar', icon: Calendar, label: 'Calendar' },
                  { id: 'timeline', icon: Clock, label: 'Timeline' },
                  { id: 'map', icon: Network, label: 'Map' },
                  { id: 'mindmap', icon: GitGraph, label: 'Mindmap' },
                  { id: 'dashboard', icon: BarChart3, label: 'Analytics' }
                ].find(v => v.id === currentView)?.icon || Kanban;

                return (
                  <button 
                    ref={viewBtnRef}
                    onClick={() => setShowViewDropdown(!showViewDropdown)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${borderColor} ${showViewDropdown ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20' : `${navBgColor} ${navTextColor} hover:${isLight ? 'bg-white/80' : 'bg-white/20'}`}`}
                  >
                    <ViewIcon size={16} />
                    <span>View: {[
                      { id: 'kanban', label: 'Board' },
                      { id: 'table', label: 'Table' },
                      { id: 'calendar', label: 'Calendar' },
                      { id: 'timeline', label: 'Timeline' },
                      { id: 'map', label: 'Map' },
                      { id: 'mindmap', label: 'Mindmap' },
                      { id: 'dashboard', label: 'Analytics' }
                    ].find(v => v.id === currentView)?.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showViewDropdown ? 'rotate-180' : ''}`} />
                  </button>
                );
              })()}

              <AnimatePresence>
                {showViewDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute left-0 mt-3 w-64 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl rounded-3xl border border-white/20 p-2 z-[100]`}
                  >
                    {[
                      { id: 'kanban', icon: Kanban, label: 'Board', desc: 'Classic Kanban canvas' },
                      { id: 'table', icon: Table2, label: 'Table', desc: 'Spreadsheet-style grid' },
                      { id: 'calendar', icon: Calendar, label: 'Calendar', desc: 'Date-based scheduling' },
                      { id: 'timeline', icon: Clock, label: 'Timeline', desc: 'Gantt & roadmap view' },
                      { id: 'map', icon: Network, label: 'Map', desc: 'Dependency connections' },
                      { id: 'mindmap', icon: GitGraph, label: 'Mindmap', desc: 'Visual brainstorming' },
                      { id: 'dashboard', icon: BarChart3, label: 'Analytics', desc: 'Metrics & insights' }
                    ].map((view, i) => (
                      <button 
                        key={view.id} 
                        onClick={() => {
                          setCurrentView(view.id);
                          setShowViewDropdown(false);
                        }} 
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${currentView === view.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : `hover:${isLight ? 'bg-black/5' : 'bg-white/10'}`}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentView === view.id ? 'bg-white/20' : 'bg-black/5 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                          <view.icon size={18} />
                        </div>
                        <div className="text-left">
                          <p className={`text-[11px] font-black uppercase tracking-widest ${currentView === view.id ? 'text-white' : 'text-foreground'}`}>{view.label}</p>
                          <p className={`text-[9px] font-medium ${currentView === view.id ? 'text-white/60' : 'text-muted-foreground'}`}>{view.desc}</p>
                        </div>
                        {currentView === view.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-border/20 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="relative">
                  <button 
                    ref={shareBtnRef}
                    className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${showSharePopover ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105' : `${navBgColor} ${navTextColor} hover:${isLight ? 'bg-accent border-primary/20' : 'bg-white/20 border-white/40'} border ${borderColor}`}`}
                    onClick={() => setShowSharePopover(!showSharePopover)}
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <AnimatePresence>
                    {showSharePopover && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 z-[100]"
                      >
                        <BoardSharePopover 
                           board={activeBoard} 
                           onClose={() => setShowSharePopover(false)}
                           onUpdateVisibility={updateVisibility}
                           members={members}
                           lists={lists}
                           cards={cards}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

              <button 
                onClick={() => setIsBoardCollapsed(!isBoardCollapsed)}
                className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all shadow-md border ${isBoardCollapsed ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-xl' : `${navBgColor} ${navSecondaryColor} hover:${navTextColor} ${borderColor}`}`}
                title={isBoardCollapsed ? "Expand All Lists" : "Collapse All Lists"}
              >
                {isBoardCollapsed ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
              </button>

              <button 
                className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all border ${modals.activityDrawer ? 'bg-primary text-primary-foreground border-primary' : `${navBgColor} ${navSecondaryColor} hover:${navTextColor} ${borderColor}`}`} 
                onClick={() => dispatch(toggleModal({ modalName: 'activityDrawer', isOpen: !modals.activityDrawer }))}
              >
                <HistoryIcon size={20} />
              </button>

              <button 
                className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all border border-transparent hover:bg-primary/10 hover:border-primary/20 group`} 
                onClick={() => dispatch(toggleModal({ modalName: 'boardSettings', isOpen: !modals.boardSettings }))}
              >
                <Settings size={20} className={`${navSecondaryColor} group-hover:text-primary transition-colors`} />
              </button>
            </div>
          </div>
        </header>

        {/* Floating Zen Toggle Overlay - Bottom Middle of Board */}
        <div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <button 
             onClick={() => dispatch(toggleSidebarHidden())}
             className={`h-12 px-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 flex items-center gap-3 group transition-all hover:scale-105 active:scale-95 ${sidebarHidden ? 'ring-4 ring-primary/5' : ''}`}
          >
             <div className="flex flex-col items-center">
               <div className="flex items-center gap-3">
                 <Kanban size={18} className="text-primary stroke-[2.5]" />
                 <span className="text-sm font-black text-primary tracking-tight whitespace-nowrap">{activeBoard?.title || 'Board'}</span>
               </div>
               <div className="w-6 h-0.5 bg-primary rounded-full mt-1 animate-in zoom-in duration-300" />
             </div>
          </button>
          
          {sidebarHidden && (
            <div className="px-4 py-2 bg-black/80 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-2xl">
              Zen Mode Active
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentView === 'kanban' && (
              <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                <DragDropContext onDragEnd={onDragEnd}>
                  <div ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove} className="canvas bg-transparent p-6">
                    {lists.map(list => (
                      <ListView 
                        key={list.id} 
                        list={list} 
                        cards={cards.filter(c => c.list_id === list.id)} 
                        onCardClick={handleCardClick} 
                        selectedIds={selectedCardIds}
                        listStyle={activeBoard?.settings?.list_style || 'solid'}
                        cardStyle={activeBoard?.settings?.card_style || 'modern'}
                        isReadOnly={isReadOnly}
                        isCollapsed={isBoardCollapsed}
                      />
                    ))}

                     {/* Add List Button */}
                    {!isReadOnly && (
                      <div className={`${isBoardCollapsed ? 'w-16 h-[280px]' : 'w-[380px] h-fit'} shrink-0 transition-all duration-500`}>
                        {isAddingList ? (
                          <div className={`bg-card/80 backdrop-blur-md rounded-2xl p-4 border border-border shadow-2xl ${isBoardCollapsed ? 'w-80 absolute z-[60]' : 'w-full'}`}>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Enter list title..."
                              value={newListTitle}
                              onChange={e => setNewListTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateList();
                                if (e.key === 'Escape') setIsAddingList(false);
                              }}
                              className="w-full px-4 py-3 bg-card border-2 border-primary/20 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all mb-3"
                            />
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={handleCreateList}
                                className="flex-1 h-10 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                              >
                                Add List
                              </button>
                              <button 
                                onClick={() => setIsAddingList(false)}
                                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-lg transition-all"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ) : isBoardCollapsed ? (
                          <button 
                            onClick={() => setIsAddingList(true)}
                            className={`w-full h-full border-2 border-dashed border-muted-foreground/20 rounded-[28px] flex flex-col items-center py-12 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-card/40 transition-all group`}
                          >
                            <div className="p-2 bg-card/50 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm mb-6">
                              <Plus size={18} />
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.4em] origin-center -rotate-90 transform-gpu opacity-60 group-hover:opacity-100 transition-opacity">
                                Add List
                              </span>
                            </div>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIsAddingList(true)}
                            className="w-full h-14 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl flex items-center gap-3 px-6 text-foreground/70 font-bold hover:bg-card/60 hover:text-primary transition-all group shadow-sm"
                          >
                            <div className="p-1.5 bg-card/50 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                              <Plus size={16} />
                            </div>
                            <span className="text-sm">Add another list</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </DragDropContext>
              </motion.div>
            )}
            {currentView === 'table' && (
              <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-background">
                <TableView />
              </motion.div>
            )}
            {currentView === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-background text-foreground">
                <CalendarView />
              </motion.div>
            )}
            {currentView === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 bg-background text-foreground">
                <TimelineView />
              </motion.div>
            )}
            {currentView === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 bg-background">
                <DependencyMap />
              </motion.div>
            )}
            {currentView === 'mindmap' && (
              <motion.div key="mindmap" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 bg-background">
                <MindmapView />
              </motion.div>
            )}
            {currentView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 bg-background">
                <AnalyticsDashboard boardId={boardId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {modals.activityDrawer && (
            <ActivitySidePanel 
              isOpen={modals.activityDrawer} 
              onClose={() => dispatch(toggleModal({ modalName: 'activityDrawer', isOpen: false }))} 
              boardId={boardId} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modals.boardSettings && (
            <BoardSettingsDrawer 
              isOpen={modals.boardSettings} 
              onClose={() => dispatch(toggleModal({ modalName: 'boardSettings', isOpen: false }))} 
              board={activeBoard} 
              isWsAdmin={isWsAdmin}
            />
          )}
        </AnimatePresence>

        {modals.cardDetails && <CardDetailsModal />}
        {modals.prismRules && (
          <PrismRulesDialog 
            isOpen={modals.prismRules} 
            onClose={() => dispatch(toggleModal({ modalName: 'prismRules', isOpen: false }))} 
            board={activeBoard} 
          />
        )}
        {showJoinModal && (
          <JoinWorkspaceModal 
            workspaceName={targetWorkspace?.name} 
            onAccept={handleAcceptJoin}
            onReject={() => navigate('/dashboard')}
            loading={joining}
          />
        )}
        <TemplateGuideModal 
          isOpen={showGuideModal} 
          onClose={() => setShowGuideModal(false)} 
          template={activeTemplate} 
        />
      </div>
    </AppLayout>
  );
};

export default BoardPage;
