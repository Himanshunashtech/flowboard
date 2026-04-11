import React, { useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval, 
  differenceInDays,
  addDays,
  parseISO,
  startOfDay
} from 'date-fns';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Info,
  Layers,
  BarChart2
} from 'lucide-react';
import { setActiveCardId } from '../../store/slices/uiSlice';

const TimelineView = ({ date = new Date(2026, 3, 1) }) => { // Default to April 2026
  const dispatch = useDispatch();
  const { board, lists, cards } = useSelector((state) => state.board);
  const containerRef = useRef(null);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const CELL_WIDTH = 60;
  const TIMELINE_START_X = 240; // width of the sidebar (list names)

  const openCardDetails = (cardId) => {
    dispatch(setActiveCardId(cardId));
  };

  const timelineCards = useMemo(() => {
    return cards.map(card => {
      // Use due_date as end, and start_date as start. 
      // Fallback: If no start_date, assume it starts 1 day before due_date or today.
      const end = card.due_date ? startOfDay(parseISO(card.due_date)) : null;
      const start = card.start_date ? startOfDay(parseISO(card.start_date)) : (end ? addDays(end, -2) : null);
      
      if (!start || !end) return null;

      const duration = differenceInDays(end, start) + 1;
      const offsetDays = differenceInDays(start, monthStart);
      
      // Calculate position
      const left = TIMELINE_START_X + (offsetDays * CELL_WIDTH);
      const width = duration * CELL_WIDTH;

      // Filter out cards completely outside this month for now
      if (offsetDays + duration < 0 || offsetDays > days.length) return null;

      return {
        ...card,
        left: Math.max(TIMELINE_START_X, left),
        width: Math.min(width, (days.length - offsetDays) * CELL_WIDTH),
        actualWidth: width,
        actualLeft: left
      };
    }).filter(Boolean);
  }, [cards, monthStart, days.length]);

  // Group by lists for vertical layout
  const groupedCards = useMemo(() => {
    return lists.map(list => ({
      ...list,
      cards: timelineCards.filter(c => c.list_id === list.id)
    })).filter(l => l.cards.length > 0);
  }, [lists, timelineCards]);

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden selection:bg-brand-primary/10">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-border-light bg-bg-secondary/10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-inner">
              <Clock size={24} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-text-primary tracking-tighter">
                Timeline Flow
              </h2>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                {format(monthStart, 'MMMM yyyy')} • Sprint Duration Visualization
              </p>
           </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-text-tertiary">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/20" />
               <span>In Progress</span>
            </div>
            <div className="w-px h-4 bg-border-light mx-2" />
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-success rounded-full shadow-lg shadow-success/20" />
               <span>Completed</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar" ref={containerRef}>
        <div className="min-w-max">
           {/* Timeline Grid Header */}
           <div className="flex sticky top-0 z-20 bg-white border-b border-border-light shadow-sm">
             <div className="w-[240px] shrink-0 border-r border-border-light bg-bg-secondary/10 p-4 font-black text-[10px] uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Layers size={14} />
                Structure
             </div>
             {days.map(day => (
               <div 
                 key={day.toString()} 
                 className={`w-[60px] shrink-0 h-16 flex flex-col items-center justify-center border-r border-border-light/50 transition-all ${isSameDay(day, new Date()) ? 'bg-brand-primary/5' : ''}`}
               >
                 <span className={`text-[10px] font-black uppercase tracking-tighter ${isSameDay(day, new Date()) ? 'text-brand-primary' : 'text-text-tertiary opacity-40'}`}>
                    {format(day, 'EEE')}
                 </span>
                 <span className={`text-sm font-black ${isSameDay(day, new Date()) ? 'text-brand-primary' : 'text-text-primary'}`}>
                    {format(day, 'd')}
                 </span>
               </div>
             ))}
           </div>

           {/* Timeline Body */}
           <div className="relative">
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                 <div className="w-[240px] shrink-0 border-r border-border-light shadow-2xl z-10" />
                 {days.map(day => (
                   <div key={day.toString()} className={`w-[60px] shrink-0 border-r border-border-light/20 ${isSameDay(day, new Date()) ? 'bg-brand-primary/[0.02]' : ''}`} />
                 ))}
              </div>

              {/* Timeline Rows */}
              <div className="relative z-0">
                {groupedCards.map((list) => (
                  <div key={list.id} className="border-b border-border-light/50 group">
                    <div className="flex">
                       {/* List Sidebar Name */}
                       <div className="w-[240px] shrink-0 p-6 flex flex-col justify-center border-r border-border-light bg-white sticky left-0 z-10 group-hover:bg-bg-secondary/30 transition-colors">
                          <HeaderLabel color={list.color}>{list.title}</HeaderLabel>
                          <span className="text-[8px] font-black tracking-widest text-text-tertiary mt-2 uppercase">{list.cards.length} Tasks active</span>
                       </div>

                       {/* Bars Container */}
                       <div className="relative flex-1 h-32 flex flex-col justify-center">
                          {list.cards.map((card, idx) => (
                            <div 
                              key={card.id}
                              className={`absolute h-10 rounded-2xl flex items-center px-4 cursor-pointer hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all group/card border border-black/5 overflow-hidden ${card.is_completed ? 'bg-success/90 text-white' : 'bg-brand-primary text-white'} shadow-lg`}
                              style={{ 
                                left: card.actualLeft - TIMELINE_START_X, 
                                width: card.actualWidth,
                                top: '50%',
                                transform: `translateY(-50%) translateY(${(idx - (list.cards.length - 1)/2) * 44}px)`,
                                zIndex: 10 + idx
                              }}
                              onClick={() => openCardDetails(card.id)}
                            >
                               <div className="flex items-center gap-2 truncate relative z-10">
                                  <span className="text-[11px] font-black truncate drop-shadow-sm">{card.title}</span>
                               </div>
                               {/* Progress indicator or glass effect */}
                               <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HeaderLabel = ({ children, color }) => (
  <div className="flex items-center gap-2">
    {color && <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />}
    <h3 className="text-xs font-black text-text-primary truncate uppercase tracking-tight">{children}</h3>
  </div>
);

export default TimelineView;
