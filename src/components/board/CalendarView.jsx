import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Zap,
  Loader2,
  Users,
  Flag,
  ArrowRight
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isToday,
  parseISO,
  differenceInDays,
  addDays,
  startOfDay
} from 'date-fns';
import { setActiveCardId, toggleModal } from '../../store/slices/uiSlice';
import { addCard, updateCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';

const CalendarView = () => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(null);
  const [draggingCard, setDraggingCard] = useState(null);
  const { cards, lists, activeBoard } = useSelector((state) => state.board);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getCardsForDay = (day) => {
    return cards.filter(card => card.due_date && isSameDay(parseISO(card.due_date), day));
  };

  const handleQuickAdd = async (day) => {
    if (!lists[0]) return;
    setIsCreating(day);

    // We open the full modal for better entry, or stick to quick add? 
    // Let's do a prompt-less quick add as requested for "Mission Timeline"
    const destCards = cards.filter(c => c.list_id === lists[0].id).sort((a, b) => String(a.position || '').localeCompare(String(b.position || '')));
    const lastPos = destCards[destCards.length - 1]?.position;

    const newCard = {
      title: 'New Mission...',
      board_id: activeBoard.id,
      list_id: lists[0].id,
      due_date: day.toISOString(),
      position: Ordering.last(lastPos),
    };

    const { data, error } = await supabase.from('cards').insert(newCard).select().single();
    if (data) {
      dispatch(addCard(data));
      // Immediately open the details modal to fill in info
      dispatch(setActiveCardId(data.id));
    }
    setIsCreating(null);
  };

  const handleDragEnd = async (event, info, card, originalDay) => {
    setDraggingCard(null);
    if (!containerRef.current) return;

    const gridRect = containerRef.current.getBoundingClientRect();
    const x = info.point.x - gridRect.left;
    const y = info.point.y - gridRect.top;

    if (x < 0 || x > gridRect.width || y < 0 || y > gridRect.height) return;

    const col = Math.floor((x / gridRect.width) * 7);
    const rowCount = Math.ceil(calendarDays.length / 7);
    const row = Math.floor((y / gridRect.height) * rowCount);
    const targetIdx = row * 7 + col;

    if (targetIdx >= 0 && targetIdx < calendarDays.length) {
      const targetDay = calendarDays[targetIdx];
      if (isSameDay(targetDay, originalDay)) return;

      const newDueDate = targetDay.toISOString();

      // Optimistic update
      dispatch(updateCard({ id: card.id, due_date: newDueDate }));

      const { error } = await supabase
        .from('cards')
        .update({ due_date: newDueDate })
        .eq('id', card.id);

      if (error) {
        // Rollback
        dispatch(updateCard({ id: card.id, due_date: originalDay.toISOString() }));
        console.error('Failed to move card:', error);
      }
    }
  };


  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden selection:bg-brand-primary/10">
      {/* Professional Minimalist Header */}
      <header className="shrink-0 p-8 flex items-center justify-between relative z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex gap-6 items-center">
          <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-text-primary shadow-sm">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
              {format(currentDate, 'MMMM')} <span className="opacity-30">{format(currentDate, 'yyyy')}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Mission Timeline</span>
              <div className="w-1 h-1 bg-text-tertiary/20 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{cards.filter(c => c.due_date).length} Active Deadlines</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <button onClick={prevMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-text-tertiary hover:text-text-primary">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-text-tertiary hover:text-text-primary">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* Week Labels */}
      <div className="grid grid-cols-7 px-8 pb-3 pt-6 bg-white border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-[9px] font-black uppercase tracking-[0.4em] text-text-tertiary/60 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
        <div className="grid grid-cols-7 border border-gray-200 rounded-[20px] overflow-hidden shadow-sm bg-white min-h-max" ref={containerRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDate.toString()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="grid grid-cols-7 col-span-7 auto-rows-fr"
            >
              {calendarDays.map((day, idx) => {
                const dayCards = getCardsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);
                const isActionable = isCreating && isSameDay(isCreating, day);

                return (
                  <div
                    key={idx}
                    className={`min-h-[140px] p-4 border-r border-b border-gray-100 flex flex-col gap-3 group transition-all relative
                      ${!isCurrentMonth ? 'bg-gray-50/50 opacity-40' : 'bg-white hover:bg-gray-50/30'}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all
                        ${isDayToday ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10' : 'text-text-primary group-hover:bg-gray-100'}`}>
                        {format(day, 'd')}
                      </span>
                      <button
                        onClick={() => handleQuickAdd(day)}
                        disabled={isCreating}
                        className="p-2.5 hover:bg-white rounded-xl text-text-tertiary hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-sm"
                      >
                        {isActionable ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 relative z-10">
                      {dayCards.map(card => {
                        const priorityColors = {
                          CRITICAL: 'bg-red-500',
                          HIGH: 'bg-orange-500',
                          MEDIUM: 'bg-blue-500',
                          LOW: 'bg-gray-400'
                        };
                        return (
                          <motion.div
                            key={card.id}
                            drag
                            dragSnapToOrigin
                            onDragStart={() => setDraggingCard(card.id)}
                            onDragEnd={(e, info) => handleDragEnd(e, info, card, day)}
                            whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
                            className={`group/card-container relative ${draggingCard === card.id ? 'z-50' : 'z-10'}`}
                          >
                            <button
                              onClick={() => dispatch(setActiveCardId(card.id))}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-bold border border-gray-100 hover:border-brand-primary hover:shadow-md transition-all relative overflow-hidden flex items-center gap-2
                                ${card.is_completed ? 'bg-gray-50 text-text-tertiary line-through opacity-60' : 'bg-white text-text-primary shadow-sm'}`}
                            >
                              {!card.is_completed && card.priority && (
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColors[card.priority]}`} />
                              )}
                              <span className="truncate">{card.title}</span>

                              {!card.is_completed && (
                                <div className="ml-auto opacity-0 group-hover/card-container:opacity-100 transition-opacity">
                                  <ArrowRight size={10} className="text-brand-primary" />
                                </div>
                              )}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {isDayToday && (
                      <div className="absolute inset-0 bg-brand-primary/[0.03] pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
