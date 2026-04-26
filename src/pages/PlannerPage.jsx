import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CalendarDays, 
  Clock, 
  Layout, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday
} from 'date-fns';
import { 
  fetchAllAssignedCards, 
  fetchExternalEvents, 
  fetchTimeBlocks, 
  fetchDailyPriorities, 
  setViewMode,
  bulkInsertTimeBlocks
} from '../store/slices/plannerSlice';
import { setActiveCardId, addNotification } from '../store/slices/uiSlice';
import { aiService } from '../services/aiService';
import AppLayout from '../components/layout/AppLayout';
import { Sparkles, Zap, Wand2, PartyPopper } from 'lucide-react';

const PlannerPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    cards, 
    externalEvents, 
    timeBlocks, 
    dailyPriorities, 
    loading, 
    error, 
    viewMode 
  } = useSelector((state) => state.planner);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isOrchestrating, setIsOrchestrating] = React.useState(false);

  const handleAIOrchestrate = async () => {
    if (!user || isOrchestrating) return;
    
    setIsOrchestrating(true);
    try {
      // 1. Generate plan via AI
      const suggestedBlocks = await aiService.generateDailyPlan(cards, externalEvents);
      
      if (suggestedBlocks.length > 0) {
        // 2. Insert into database
        await dispatch(bulkInsertTimeBlocks({ 
          userId: user.id, 
          blocks: suggestedBlocks 
        })).unwrap();
        
        dispatch(addNotification({ 
          message: `AI Orchestration complete! ${suggestedBlocks.length} focus blocks created.`, 
          type: 'success' 
        }));
      } else {
        dispatch(addNotification({ 
          message: "AI couldn't find a better way to organize your day. You're already optimized!", 
          type: 'info' 
        }));
      }
    } catch (error) {
      console.error('Orchestration failed:', error);
      dispatch(addNotification({ 
        message: 'Master planning failed. AI Agent is offline.', 
        type: 'error' 
      }));
    } finally {
      setIsOrchestrating(false);
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchAllAssignedCards(user.id));
      dispatch(fetchExternalEvents(user.id));
      dispatch(fetchTimeBlocks(user.id));
      dispatch(fetchDailyPriorities(user.id));
    }
  }, [dispatch, user]);

  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCards = filteredCards.reduce((acc, card) => {
    const boardTitle = card.boards?.title || 'Personal';
    if (!acc[boardTitle]) acc[boardTitle] = [];
    acc[boardTitle].push(card);
    return acc;
  }, {});

  const priorityColors = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-blue-500',
    LOW: 'bg-gray-400'
  };

  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const eventsByDay = React.useMemo(() => {
    const combined = [
      ...externalEvents.map(e => ({ 
        ...e, 
        type: 'external',
        display_time: new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      ...cards.filter(c => c.due_date).map(c => ({
        ...c,
        start_time: c.due_date,
        type: 'internal',
        display_time: new Date(c.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    ].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return combined.reduce((acc, event) => {
      const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [cards, externalEvents]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-bg-secondary/30 pb-20">
        <header className="px-10 py-10 bg-white border-b border-border-light flex items-center justify-between sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm shadow-indigo-100">
                  <CalendarDays size={28} />
                </div>
                {viewMode === 'MONTH' ? (
                  <div className="flex items-center gap-8">
                    <h1 className="text-4xl font-black text-foreground tracking-tighter w-64">
                      {format(currentDate, 'MMMM yyyy')}
                    </h1>
                    <div className="flex items-center gap-2 bg-bg-secondary p-1 rounded-xl border border-border-light">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-all text-text-tertiary"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button 
                         onClick={handleToday}
                         className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-all text-text-tertiary"
                      >
                         Today
                      </button>
                      <button 
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-all text-text-tertiary"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-4xl font-black text-foreground tracking-tighter">My Planner</h1>
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-text-tertiary flex items-center gap-2 ps-1">
              <span className="text-indigo-600">{cards.length} assigned tasks</span>
              <span className="w-1 h-1 bg-border-medium rounded-full" />
              <span>Reviewing your upcoming mission timeline</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button
                onClick={handleAIOrchestrate}
                disabled={isOrchestrating}
                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl shadow-indigo-200 group"
             >
                {isOrchestrating ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                )}
                <span>{isOrchestrating ? 'Thinking...' : 'AI Orchestrate'}</span>
             </button>

             <div className="h-8 w-px bg-border-light mx-2"></div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your tasks..."
                  className="bg-bg-secondary border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-600 w-72 transition-all shadow-sm"
                />
             </div>
             <div className="flex bg-bg-secondary p-1 rounded-2xl border border-border-light">
                <button 
                  onClick={() => dispatch(setViewMode('WEEK'))}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'WEEK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-text-tertiary hover:text-foreground'}`}
                >
                  Daily Focus
                </button>
                <button 
                  onClick={() => dispatch(setViewMode('MONTH'))}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'MONTH' ? 'bg-white text-indigo-600 shadow-sm' : 'text-text-tertiary hover:text-foreground'}`}
                >
                  Full Calendar
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 opacity-50">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary animate-pulse">Syncing Mission Data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 gap-6 text-danger">
              <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertCircle size={40} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black">Connection Interrupted</h3>
                <p className="font-bold text-sm opacity-70">{error}</p>
              </div>
            </div>
          ) : viewMode === 'WEEK' ? (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h2 className="text-xs font-black text-text-tertiary uppercase tracking-[0.4em]">Daily Mission Priorities</h2>
                        <p className="text-[10px] font-bold text-indigo-600">The most critical tasks for your success today</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {dailyPriorities.length === 0 ? (
                       <div className="p-10 rounded-[40px] border-2 border-dashed border-border-medium bg-bg-secondary/20 flex flex-col items-center justify-center gap-4 text-text-tertiary opacity-50">
                          <CheckCircle2 size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-center">No priorities set for today.<br/>Select tasks to focus.</p>
                       </div>
                     ) : (
                       dailyPriorities.map((prio, idx) => (
                         <div 
                          key={prio.id}
                          onClick={() => dispatch(setActiveCardId(prio.card_id))}
                          className="group p-6 rounded-[32px] bg-white border border-border-light hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex items-center gap-8"
                         >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-200">
                               {idx + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                               <h4 className="text-xl font-black text-foreground tracking-tight">{prio.cards?.title}</h4>
                               <div className="flex items-center gap-3 text-[10px] font-bold text-text-tertiary">
                                  <span className="flex items-center gap-1.5 uppercase tracking-widest text-indigo-600">
                                    <Target size={12} />
                                    Main Objective
                                  </span>
                               </div>
                            </div>
                            <ChevronRight size={20} className="text-text-tertiary group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                         </div>
                       ))
                     )}
                  </div>
               </section>

               <section className="space-y-8">
                  <h2 className="text-xs font-black text-text-tertiary uppercase tracking-[0.4em]">Project Roadmap</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedCards).map(([boardTitle, boardCards]) => (
                      boardCards.map((card) => (
                        <motion.div
                          key={card.id}
                          layout
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => dispatch(setActiveCardId(card.id))}
                          className="group p-8 rounded-[40px] bg-white border border-border-light hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer flex flex-col justify-between h-72"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={`px-4 py-1.5 rounded-2xl ${card.priority ? priorityColors[card.priority] + ' text-white' : 'bg-bg-secondary text-text-tertiary'} text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                                {card.priority || 'No Priority'}
                              </div>
                              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{boardTitle}</span>
                            </div>
                            <h4 className="text-2xl font-black text-foreground tracking-tight line-clamp-2 leading-tight">
                              {card.title}
                            </h4>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${card.due_date ? 'border-indigo-100 bg-indigo-50/30 text-indigo-600' : 'border-border-light text-text-tertiary'} text-[10px] font-bold`}>
                                <Clock size={12} />
                                {card.due_date ? new Date(card.due_date).toLocaleDateString() : 'No Due Date'}
                              </div>
                            </div>
                            <div className="pt-6 border-t border-border-light flex items-center justify-between font-black uppercase tracking-widest text-[9px]">
                               <span className="text-indigo-600">Open Context</span>
                               <ChevronRight size={14} className="text-text-tertiary" />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ))}
                  </div>
               </section>
            </div>
          ) : viewMode === 'MONTH' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-[40px] border border-border-light shadow-xl shadow-indigo-500/5 overflow-hidden">
                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 border-b border-border-light bg-bg-secondary/20">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-6 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid Body */}
                  <div className="grid grid-cols-7 border-r border-border-light">
                    {calendarDays.map((day, i) => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayEvents = eventsByDay[dayKey] || [];
                      const isCurrMonth = isSameMonth(day, currentDate);
                      const isTd = isToday(day);

                      return (
                        <div 
                          key={i} 
                          className={`min-h-[160px] p-4 border-l border-b border-border-light transition-all hover:bg-bg-secondary/30 relative group ${!isCurrMonth ? 'bg-bg-secondary/10' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-sm font-black flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                              isTd ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                              isCurrMonth ? 'text-foreground group-hover:text-indigo-600' : 'text-text-tertiary'
                            }`}>
                              {format(day, 'd')}
                            </span>
                            {dayEvents.length > 0 && (
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-600/30 group-hover:scale-150 transition-transform" />
                            )}
                          </div>

                          <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar scrollbar-hide">
                            {dayEvents.map((event, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (event.type === 'internal') dispatch(setActiveCardId(event.id));
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-xl border transition-all flex flex-col gap-0.5 group/chip ${
                                  event.type === 'external' 
                                  ? 'bg-emerald-50 border-emerald-100/50 hover:bg-emerald-100 hover:border-emerald-200' 
                                  : 'bg-indigo-50 border-indigo-100/50 hover:bg-indigo-100 hover:border-indigo-200 shadow-sm'
                                }`}
                              >
                                <span className={`text-[8px] font-black uppercase tracking-wider ${event.type === 'external' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                  {event.display_time}
                                </span>
                                <span className={`text-[10px] font-bold truncate ${event.type === 'external' ? 'text-emerald-900' : 'text-indigo-950'}`}>
                                  {event.title}
                                </span>
                              </button>
                            ))}
                          </div>

                          {!isCurrMonth && (
                            <div className="absolute inset-0 bg-white/40 pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>

               {/* Alignment/Analysis Status Bar */}
               <div className="mt-12 p-8 rounded-[40px] bg-white border border-border-light flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-10">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Planned Capacity</p>
                        <div className="flex items-center gap-3">
                           <div className="w-32 h-2 bg-bg-secondary rounded-full overflow-hidden">
                              <div className="w-3/4 h-full bg-indigo-600 rounded-full" />
                           </div>
                           <span className="text-sm font-black text-foreground">75%</span>
                        </div>
                     </div>
                     <div className="h-10 w-[1px] bg-border-light" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Active Boards</p>
                        <p className="text-sm font-black text-foreground">{Object.keys(groupedCards).length} Projects Aligned</p>
                     </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">
                    <Target size={14} />
                    Optimize View
                  </button>
               </div>
            </div>
          ) : (
            <div className="space-y-12">
              <AnimatePresence mode="popLayout">
                {Object.entries(groupedCards).map(([boardTitle, boardCards]) => (
                  <motion.section 
                    key={boardTitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 group cursor-default">
                      <div className="w-1.5 h-6 bg-indigo-600 rounded-full group-hover:h-8 transition-all" />
                      <h2 className="text-xs font-black text-text-tertiary uppercase tracking-[0.4em]">{boardTitle}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {boardCards.map((card) => (
                        <motion.div
                          key={card.id}
                          layout
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => dispatch(setActiveCardId(card.id))}
                          className="group p-8 rounded-[40px] bg-white border border-border-light hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer flex flex-col justify-between h-72"
                        >
                          {/* Card UI */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={`px-4 py-1.5 rounded-2xl ${card.priority ? priorityColors[card.priority] + ' text-white' : 'bg-bg-secondary text-text-tertiary'} text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                                {card.priority || 'No Priority'}
                              </div>
                            </div>
                            <h4 className="text-2xl font-black text-foreground tracking-tight line-clamp-2 leading-tight">
                              {card.title}
                            </h4>
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${card.due_date ? 'border-indigo-100 bg-indigo-50/30 text-indigo-600' : 'border-border-light text-text-tertiary'} text-[10px] font-bold`}>
                                <Clock size={12} />
                                {card.due_date ? new Date(card.due_date).toLocaleDateString() : 'No Due Date'}
                              </div>
                            </div>
                            <div className="pt-6 border-t border-border-light flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex items-center gap-2">
                                 View Task <ArrowRight size={12} />
                               </span>
                               <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  <ChevronRight size={16} />
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PlannerPage;
