import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Filter, MoreHorizontal, Share2, Calendar, Table2, Kanban, Network, ChevronDown, History, Star, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  setActiveBoard,
  setLists,
  setCards,
  setBoardMembers,
  setLabels,
  setLoading,
  moveCard,
  updateCard,
  addCard,
  deleteCard,
  addList,
  updateList,
  deleteList,
  setSprints,
  setDependencies
} from '../store/slices/boardSlice';
import AppLayout from '../components/layout/AppLayout';
import ListView from '../components/canvas/ListView';
import CardDetailsModal from '../components/canvas/CardDetailsModal';
import SprintManager from '../components/board/SprintManager';
import TableView from '../components/board/TableView';
import CalendarView from '../components/board/CalendarView';
import TimelineView from '../components/board/TimelineView';
import DependencyMap from '../components/board/DependencyMap';
import InviteBoardMemberModal from '../components/modals/InviteBoardMemberModal';
import BoardActivityDrawer from '../components/board/BoardActivityDrawer';
import BoardSettingsDrawer from '../components/board/BoardSettingsDrawer';
import BoardAnalytics from '../components/board/BoardAnalytics';
import { BarChart3, Clock } from 'lucide-react';
import { BoardSkeleton } from '../components/ui/Skeleton';

const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { activeBoard, lists, cards, loading, sprints, members, labels } = useSelector((state) => state.board);
  const { modals } = useSelector((state) => state.ui);
  const [showSprints, setShowSprints] = useState(false);
  const [currentView, setCurrentView] = useState('kanban'); // kanban, table, calendar, timeline, dashboard
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // --- Drag-to-Scroll Logic ---
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    // Only scroll if we click the background canvas itself
    // Or if the target is something we know shouldn't block the scroll
    if (e.target.closest('.list-container') || e.target.closest('button')) return;
    
    setIsDragging(true);
    setStartX(e.pageX - canvasRef.current.offsetLeft);
    setScrollLeft(canvasRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - canvasRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Speed multiplier
    canvasRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchBoardData = async () => {
      dispatch(setLoading(true));

      // Update last_viewed_at (Silent visit tracking)
      supabase.from('boards').update({ last_viewed_at: new Date().toISOString() }).eq('id', boardId).then();

      // Fetch Board
      const { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (board) dispatch(setActiveBoard(board));

      // Fetch Lists
      const { data: listData } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      if (listData) dispatch(setLists(listData));

      // Fetch Cards with joins
      const { data: cardData } = await supabase
        .from('cards')
        .select(`
          *,
          card_labels (label_id),
          card_assignments (user_id),
          checklists (
            checklist_items (id, title, is_completed)
          )
        `)
        .eq('board_id', boardId)
        .order('position');

      if (cardData) dispatch(setCards(cardData));

      // Fetch Sprints
      const { data: sprintData } = await supabase
        .from('sprints')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (sprintData) dispatch(setSprints(sprintData));

      // Fetch Labels
      const { data: labelData } = await supabase
        .from('labels')
        .select('*')
        .eq('board_id', boardId);
      if (labelData) dispatch(setLabels(labelData));

      // Fetch Members
      const { data: memberData } = await supabase
        .from('board_members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('board_id', boardId);
      if (memberData) dispatch(setBoardMembers(memberData));

      // Fetch Dependencies
      const { data: depData } = await supabase
        .from('card_dependencies')
        .select('*')
        .in('blocked_card_id', cardData?.map(c => c.id) || []);
      if (depData) dispatch(setDependencies(depData));

      dispatch(setLoading(false));
    };

    if (boardId) {
      fetchBoardData();

      // Real-time Subscriptions
      const channel = supabase
        .channel(`board:${boardId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `board_id=eq.${boardId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') dispatch(addCard(payload.new));
          if (payload.eventType === 'UPDATE') dispatch(updateCard(payload.new));
          if (payload.eventType === 'DELETE') dispatch(deleteCard(payload.old.id));
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `board_id=eq.${boardId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') dispatch(addList(payload.new));
          if (payload.eventType === 'UPDATE') dispatch(updateList(payload.new));
          if (payload.eventType === 'DELETE') dispatch(deleteList(payload.old.id));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [boardId, dispatch]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'card') {
      const cardId = draggableId;
      const newListId = destination.droppableId;
      const newIndex = destination.index;

      // Optimistic Update
      dispatch(moveCard({ cardId, newListId, newPosition: newIndex }));

      // Persist to Supabase
      await supabase
        .from('cards')
        .update({ list_id: newListId, position: newIndex })
        .eq('id', cardId);
    }
  };

  if (loading && !activeBoard) {
    return (
      <AppLayout>
        <BoardSkeleton />
      </AppLayout>
    );
  }

  const getBackgroundStyle = () => {
    if (!activeBoard) return {};

    switch (activeBoard.background_type) {
      case 'COLOR':
        return { backgroundColor: activeBoard.background_value };
      case 'GRADIENT':
        return { background: activeBoard.background_value };
      case 'IMAGE':
        const val = activeBoard.background_value;
        return {
          backgroundImage: val?.startsWith('url') ? val : `url("${val}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {};
    }
  };

  return (
    <AppLayout>
      <div
        className="flex flex-col h-full overflow-hidden transition-all duration-700"
        style={getBackgroundStyle()}
      >
        {/* Board Header */}
        <header className="h-14 border-b border-border-light flex items-center justify-between px-6 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-primary tracking-tighter">{activeBoard?.title}</h2>
              <button className="p-1.5 text-text-tertiary hover:text-brand-primary transition-all rounded-lg hover:bg-bg-secondary">
                <Star size={18} className={activeBoard?.is_favorite ? 'fill-brand-primary text-brand-primary' : ''} />
              </button>
            </div>
            {/* Board Members */}
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {members?.slice(0, 4).map((m, i) => (
                  <div
                    key={m.user_id}
                    title={m.profiles?.full_name || m.profiles?.email}
                    className="w-7 h-7 rounded-full border-2 border-white bg-brand-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                    onClick={() => setShowMembersPanel(true)}
                  >
                    {(m.profiles?.full_name || m.profiles?.email || '?')[0].toUpperCase()}
                  </div>
                ))}
                {members?.length > 4 && (
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMembersPanel(true)}
                className="w-7 h-7 rounded-full border-2 border-dashed border-border-medium flex items-center justify-center text-text-tertiary ml-2 hover:bg-bg-secondary hover:text-brand-primary hover:border-brand-primary/50 transition-all"
                title="Manage board members"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* View Switcher Moved to Right Section */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const title = prompt('Enter list title:');
                if (title) {
                  await supabase.from('lists').insert({
                    board_id: boardId,
                    title,
                    position: lists.length > 0 ? Math.max(...lists.map(l => l.position)) + 65535 : 65535
                  });
                }
              }}
              className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-border-light shadow-sm flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Add New List</span>
            </button>

            <div className="w-px h-6 bg-border-light mx-2" />

            <div className="flex items-center bg-bg-secondary rounded-xl p-1 shadow-sm border border-border-light/50 font-medium">
              {[
                { id: 'kanban', icon: Kanban, label: 'Board' },
                { id: 'table', icon: Table2, label: 'Table' },
                { id: 'calendar', icon: Calendar, label: 'Calendar' },
                { id: 'timeline', icon: Clock, label: 'Timeline' },
                { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${currentView === view.id ? 'bg-white text-brand-primary shadow-sm ring-1 ring-black/5' : 'text-text-tertiary hover:text-text-primary hover:bg-white/50'}`}
                >
                  <view.icon size={13} className={currentView === view.id ? 'text-brand-primary' : 'text-text-tertiary'} />
                  <span className="uppercase">{view.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border-light mx-2" />

            <button
              className={`p-2 rounded-xl transition-all ${showSettingsDrawer ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-bg-secondary text-text-tertiary hover:text-text-primary border border-transparent'}`}
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              title="Board settings"
            >
              <Settings size={18} />
            </button>
            <button className="p-2 hover:bg-bg-secondary rounded-md text-text-tertiary hover:text-text-primary transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Board Views */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentView === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <DragDropContext onDragEnd={onDragEnd}>
                  <motion.div
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                    className={`canvas items-start bg-transparent ${isDragging ? 'snap-none' : 'snap-x snap-mandatory'}`}
                  >
                    {lists.map((list) => (
                      <motion.div
                        key={list.id}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <ListView
                          list={list}
                          cards={cards.filter(c => c.list_id === list.id)}
                        />
                      </motion.div>
                    ))}

                    <button
                      onClick={async () => {
                        const title = prompt('Enter list title:');
                        if (title) {
                          const { data, error } = await supabase
                            .from('lists')
                            .insert({
                              board_id: boardId,
                              title,
                              position: lists.length > 0 ? Math.max(...lists.map(l => l.position)) + 65535 : 65535
                            })
                            .select()
                            .single();
                          // No need to dispatch here, Realtime listener in useEffect handles it
                        }
                      }}
                      className="w-72 shrink-0 p-4 bg-bg-secondary/50 border-2 border-dashed border-border-medium rounded-2xl flex items-center justify-center gap-2 text-text-tertiary hover:text-brand-primary hover:border-brand-primary/50 hover:bg-bg-secondary transition-all font-bold text-sm group"
                    >
                      <div className="p-1 rounded-full border border-current group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all">
                        <Plus size={16} />
                      </div>
                      Add another list
                    </button>
                  </motion.div>
                </DragDropContext>
              </motion.div>
            )}

            {currentView === 'table' && (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 bg-white"
              >
                <TableView />
              </motion.div>
            )}

            {currentView === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 bg-white"
              >
                <CalendarView />
              </motion.div>
            )}

            {currentView === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white"
              >
                <DependencyMap />
              </motion.div>
            )}

            {currentView === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 bg-white"
              >
                <TimelineView />
              </motion.div>
            )}

            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 p-10 overflow-y-auto custom-scrollbar bg-white"
              >
                <BoardAnalytics boardId={boardId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {modals.cardDetails && <CardDetailsModal />}
        {showSprints && <SprintManager onClose={() => setShowSprints(false)} />}
        {showMembersPanel && (
          <InviteBoardMemberModal
            boardId={boardId}
            onClose={() => setShowMembersPanel(false)}
          />
        )}

        <AnimatePresence>
          {showActivityDrawer && (
            <BoardActivityDrawer
              boardId={boardId}
              onClose={() => setShowActivityDrawer(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettingsDrawer && (
            <BoardSettingsDrawer
              board={activeBoard}
              onClose={() => setShowSettingsDrawer(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default BoardPage;






