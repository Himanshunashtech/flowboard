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
  Minimize2
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
import { addNotification, toggleModal } from '../store/slices/uiSlice';
import { throttle, isLightColor } from '../lib/utils';
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
import AnalyticsDashboard from '../components/board/AnalyticsDashboard';
import BoardSettingsDrawer from '../components/board/BoardSettingsDrawer';
import { BoardSkeleton } from '../components/ui/Skeleton';
import { useUndoRedo } from '../hooks/useUndoRedo';
import ActivitySidePanel from '../components/board/ActivitySidePanel';
import TemplateGuideModal from '../components/modals/TemplateGuideModal';
import { TEMPLATES } from '../components/modals/TemplateGallery';

import ErrorBoundary from '../components/ui/ErrorBoundary';

const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { activeBoard, lists, cards, loading, members, presence, starredBoardIds } = useSelector((state) => state.board);
  const { modals } = useSelector((state) => state.ui);
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
    const { data, error } = await supabase.from('boards').update({ visibility: newVisibility }).eq('id', boardId).select().single();
    if (!error && data) {
      dispatch(setActiveBoard(data));
      dispatch(addNotification({ message: 'Board visibility updated', type: 'success' }));
    }
  };

  if (loading && !activeBoard) return <AppLayout scrollable={false}><BoardSkeleton /></AppLayout>;


  const getBackgroundStyle = () => {
    if (!activeBoard) return {};
    const val = activeBoard.background_value;
    switch (activeBoard.background_type) {
      case 'COLOR': return { backgroundColor: val };
      case 'GRADIENT': return { background: val };
      case 'IMAGE': return { backgroundImage: `url("${val}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
      default: return {};
    }
  };
  
  const isLight = activeBoard ? isLightColor(activeBoard.background_value) : false;
  const navTextColor = isLight ? 'text-text-primary' : 'text-white';
  const navSecondaryColor = isLight ? 'text-text-tertiary' : 'text-white/60';
  const navBgColor = isLight ? 'bg-black/5' : 'bg-white/10';
  const headerBg = isLight ? 'bg-white/80' : 'bg-black/10';
  const borderColor = isLight ? 'border-black/5' : 'border-white/10';

  return (
    <AppLayout scrollable={false}>
      <div className="flex flex-col h-full overflow-hidden transition-all duration-700" style={getBackgroundStyle()} onMouseMove={handleBoardMouseMove}>
        <LiveCursors />
        <header className={`h-14 border-b ${borderColor} flex items-center justify-between px-6 ${headerBg} backdrop-blur-md shrink-0 z-[50] relative transition-colors duration-500`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group/star">
              <h2 className={`text-2xl font-black ${navTextColor} tracking-tighter`}>{activeBoard?.title}</h2>
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
                className={`p-2 rounded-xl transition-all ${starredBoardIds.includes(activeBoard?.id) ? 'text-yellow-400 bg-yellow-400/10' : `${navTextColor} opacity-40 hover:bg-black/5 opacity-0 group-hover/star:opacity-100`}`}
              >
                <Star size={20} fill={starredBoardIds.includes(activeBoard?.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex -space-x-2">
              {members?.slice(0, 4).map(m => (
                <div key={m.user_id} className={`w-7 h-7 rounded-full border-2 ${isLight ? 'border-brand-primary/20' : 'border-white/20'} bg-brand-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                  {(m.profiles?.full_name || m.profiles?.email || '?')[0].toUpperCase()}
                </div>
              ))}
            </div>
            {isReadOnly && (
              <div className={`flex items-center gap-2 px-3 py-1 ${isLight ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-yellow-400/20 border-yellow-400/30'} rounded-lg`}>
                <Shield size={12} className={isLight ? 'text-brand-primary' : 'text-yellow-400'} />
                <span className={`text-[9px] font-black uppercase ${isLight ? 'text-brand-primary' : 'text-yellow-100'} tracking-widest`}>Read Only Mode</span>
              </div>
            )}

          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  ref={shareBtnRef}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showSharePopover ? 'bg-brand-primary text-white shadow-lg' : `${navBgColor} ${navTextColor} hover:${isLight ? 'bg-black/10' : 'bg-white/20'} border ${borderColor}`}`}
                  onClick={() => setShowSharePopover(!showSharePopover)}
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <AnimatePresence>
                  {showSharePopover && (
                    <div className="absolute right-0 top-12 z-[100]">
                      <BoardSharePopover 
                         board={activeBoard} 
                         onClose={() => setShowSharePopover(false)}
                         onUpdateVisibility={updateVisibility}
                         members={members}
                         lists={lists}
                         cards={cards}
                      />
                    </div>
                  )}
                </AnimatePresence>
             </div>
            <div className={`flex items-center ${isLight ? 'bg-black/5' : 'bg-black/20'} rounded-xl p-1 shadow-sm border ${borderColor} font-medium overflow-x-auto max-w-[500px] no-scrollbar`}>
              {[
                { id: 'kanban', icon: Kanban, label: 'Board' },
                { id: 'table', icon: Table2, label: 'Table' },
                { id: 'calendar', icon: Calendar, label: 'Calendar' },
                { id: 'timeline', icon: Clock, label: 'Timeline' },
                { id: 'map', icon: Network, label: 'Map' },
                { id: 'dashboard', icon: BarChart3, label: 'Analytics' }
              ].map(view => (
                <button 
                  key={view.id} 
                  onClick={() => setCurrentView(view.id)} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${currentView === view.id ? (isLight ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/20 text-white shadow-sm') : `${navSecondaryColor} hover:${isLight ? 'bg-black/5' : 'bg-white/10'}`}`}
                >
                  <view.icon size={13} />
                  <span className="uppercase">{view.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsBoardCollapsed(!isBoardCollapsed)}
              className={`p-2 rounded-xl transition-all shadow-sm border ${isBoardCollapsed ? 'bg-brand-primary text-white border-brand-primary' : `${navBgColor} ${navSecondaryColor} hover:${navTextColor} ${borderColor}`}`}
              title={isBoardCollapsed ? "Expand All Lists" : "Collapse All Lists"}
            >
              {isBoardCollapsed ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>

            <button 
              className={`p-2 rounded-xl transition-all ${modals.activityDrawer ? 'bg-brand-primary text-white' : `${navSecondaryColor} hover:${navTextColor} hover:${navBgColor}`}`} 
              onClick={() => dispatch(toggleModal({ modalName: 'activityDrawer', isOpen: !modals.activityDrawer }))}
            >
              <HistoryIcon size={18} />
            </button>
            <button 
              className={`p-2 rounded-xl transition-all ${modals.boardSettings ? 'bg-brand-primary text-white' : `${navSecondaryColor} hover:${navTextColor} hover:${navBgColor}`}`} 
              onClick={() => dispatch(toggleModal({ modalName: 'boardSettings', isOpen: !modals.boardSettings }))}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

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
                          <div className={`bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-border-light shadow-2xl ${isBoardCollapsed ? 'w-80 absolute z-[60]' : 'w-full'}`}>
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
                              className="w-full px-4 py-3 bg-white border-2 border-brand-primary/20 rounded-xl font-bold text-sm outline-none focus:border-brand-primary transition-all mb-3"
                            />
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={handleCreateList}
                                className="flex-1 h-10 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                              >
                                Add List
                              </button>
                              <button 
                                onClick={() => setIsAddingList(false)}
                                className="w-10 h-10 flex items-center justify-center text-text-tertiary hover:bg-bg-secondary rounded-lg transition-all"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ) : isBoardCollapsed ? (
                          <button 
                            onClick={() => setIsAddingList(true)}
                            className={`w-full h-full border-2 border-dashed border-text-tertiary/20 rounded-[28px] flex flex-col items-center py-12 text-text-tertiary hover:border-brand-primary/40 hover:text-brand-primary hover:bg-white/40 transition-all group`}
                          >
                            <div className="p-2 bg-white/50 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm mb-6">
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
                            className="w-full h-14 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl flex items-center gap-3 px-6 text-text-primary/70 font-bold hover:bg-white/60 hover:text-brand-primary transition-all group shadow-sm"
                          >
                            <div className="p-1.5 bg-white/50 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
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
              <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-white">
                <TableView />
              </motion.div>
            )}
            {currentView === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-white">
                <CalendarView />
              </motion.div>
            )}
            {currentView === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 bg-white">
                <TimelineView />
              </motion.div>
            )}
            {currentView === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 bg-white">
                <DependencyMap />
              </motion.div>
            )}
            {currentView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 bg-white">
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
            />
          )}
        </AnimatePresence>

        <ErrorBoundary>
          {modals.cardDetails && <CardDetailsModal />}
        </ErrorBoundary>
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
