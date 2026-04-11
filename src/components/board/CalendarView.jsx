import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Zap,
  Loader2
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
  parseISO
} from 'date-fns';
import { setActiveCardId } from '../../store/slices/uiSlice';
import { addCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';

const CalendarView = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(null); // stores day being created
  const { cards, lists, board } = useSelector((state) => state.board);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getCardsForDay = (day) => {
    return cards.filter(card => card.due_date && isSameDay(parseISO(card.due_date), day));
  };

  const openCardDetails = (card) => {
    dispatch(setActiveCardId(card.id));
  };

  const handleQuickAdd = async (day) => {
    if (!lists[0]) return;
    setIsCreating(day);
    
    const newCard = {
      title: 'New Task',
      board_id: board.id,
      list_id: lists[0].id,
      due_date: day.toISOString(),
      position: cards.length * 1000
    };

    const { data, error } = await supabase.from('cards').insert(newCard).select().single();
    
    if (data) {
      dispatch(addCard(data));
      dispatch(setActiveCardId(data.id));
    }
    setIsCreating(null);
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden selection:bg-brand-primary/10">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-border-light bg-bg-secondary/10 backdrop-blur-md">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-inner">
              <CalendarIcon size={24} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-text-primary tracking-tighter">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">Project Schedule & Deadlines</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/50 p-1 rounded-2xl border border-border-light shadow-sm">
            <button 
              onClick={prevMonth}
              className="p-3 hover:bg-bg-secondary rounded-xl transition-all text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-3 hover:bg-bg-secondary rounded-xl transition-all text-text-secondary hover:text-text-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 border-b border-border-light bg-bg-secondary/5">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.25em] text-text-tertiary text-center border-r border-border-light/50 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-7 auto-rows-fr custom-scrollbar">
        {calendarDays.map((day, index) => {
          const dayCards = getCardsForDay(day);
          const isSelectedMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const isActionable = isCreating && isSameDay(isCreating, day);
          
          return (
            <div 
              key={index}
              className={`min-h-[160px] border-r border-b border-border-light p-4 flex flex-col gap-3 transition-all group relative overflow-hidden ${!isSelectedMonth ? 'bg-bg-secondary/20' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-1 relative z-10">
                <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isDayToday ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : isSelectedMonth ? 'text-text-primary group-hover:bg-bg-secondary' : 'text-text-tertiary/40'}`}>
                  {format(day, 'd')}
                </span>
                <button 
                  onClick={() => handleQuickAdd(day)}
                  disabled={isCreating}
                  className="p-2 hover:bg-brand-primary/10 rounded-xl text-text-tertiary hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isActionable ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar relative z-10">
                {dayCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => openCardDetails(card)}
                    className={`w-full text-left p-3 rounded-2xl text-[11px] font-bold border border-black/5 hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group/card ${card.is_completed ? 'bg-bg-secondary/50 text-text-tertiary line-through border-transparent' : 'bg-white text-text-primary shadow-sm'}`}
                  >
                    <div className="truncate relative z-10 flex items-center gap-2">
                       {!card.is_completed && card.priority === 'CRITICAL' && <Zap size={10} className="text-danger fill-current" />}
                       {card.title}
                    </div>
                    {card.priority && !card.is_completed && (
                      <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                        card.priority === 'CRITICAL' ? 'bg-danger' : 
                        card.priority === 'HIGH' ? 'bg-orange-500' : 
                        card.priority === 'MEDIUM' ? 'bg-brand-primary' : 'bg-success'
                      }`} />
                    )}
                  </button>
                ))}
              </div>
              
              {isDayToday && (
                <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

