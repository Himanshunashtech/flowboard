import React, { useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  differenceInDays,
  addDays,
  parseISO,
  startOfDay,
  addMonths,
  subMonths
} from 'date-fns';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  ArrowRight,
  Maximize2,
  Zap,
  Tag
} from 'lucide-react';
import { setActiveCardId } from '../../store/slices/uiSlice';
import { updateCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';

const TimelineView = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { lists, cards } = useSelector((state) => state.board);
  const containerRef = useRef(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const CELL_WIDTHS = {
    DAY: 80,
    WEEK: 160,
    MONTH: 320
  };

  const [zoomLevel, setZoomLevel] = useState('DAY'); // DAY, WEEK, MONTH
  const CELL_WIDTH = CELL_WIDTHS[zoomLevel];
  const SIDEBAR_WIDTH = 280;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const timelineCards = useMemo(() => {
    // 1. First Pass: Calculate basic dimensions
    const processed = cards.map(card => {
      const end = card.due_date ? startOfDay(parseISO(card.due_date)) : null;
      const start = card.start_date ? startOfDay(parseISO(card.start_date)) : (end ? addDays(end, -1) : null);
      
      if (!start || !end) return null;

      const duration = differenceInDays(end, start) + 1;
      const offsetDays = differenceInDays(start, monthStart);
      
      const left = offsetDays * CELL_WIDTH;
      const width = duration * CELL_WIDTH;

      // Only show if it overlaps with current month
      if (offsetDays + duration < 0 || offsetDays > days.length) return null;

      return {
        ...card,
        left,
        width,
        start,
        end
      };
    }).filter(Boolean);

    // 2. Second Pass: Calculate Stacking (Tracks) per List
    const listTracks = {}; // listId -> [[intervals]]

    return processed.map(card => {
      if (!listTracks[card.list_id]) listTracks[card.list_id] = [];
      const tracks = listTracks[card.list_id];
      
      let trackIndex = 0;
      while (true) {
        const hasConflict = (tracks[trackIndex] || []).some(interval => 
          (card.start < interval.end && card.end > interval.start)
        );

        if (!hasConflict) {
          if (!tracks[trackIndex]) tracks[trackIndex] = [];
          tracks[trackIndex].push({ start: card.start, end: card.end });
          break;
        }
        trackIndex++;
      }

      return { ...card, trackIndex };
    });
  }, [cards, monthStart, days.length, CELL_WIDTH]);

  const groupedRows = useMemo(() => {
    return lists.map(list => {
      const listCards = timelineCards.filter(c => c.list_id === list.id);
      const maxTrack = listCards.reduce((max, c) => Math.max(max, c.trackIndex), -1);
      return {
        ...list,
        cards: listCards,
        height: Math.max(80, (maxTrack + 1) * 44 + 32) // Responsive height based on tracks
      };
    }).filter(l => l.cards.length > 0 || lists.length < 5);
  }, [lists, timelineCards]);

  const handleTimelineMove = async (card, info) => {
    if (!containerRef.current) return;
    const deltaDays = Math.round(info.offset.x / CELL_WIDTH);
    if (deltaDays === 0) return;

    const newStart = addDays(card.start, deltaDays);
    const newEnd = addDays(card.end, deltaDays);

    const updates = { 
      start_date: newStart.toISOString(), 
      due_date: newEnd.toISOString() 
    };

    // Optimistic
    dispatch(updateCard({ id: card.id, ...updates }));

    const { error } = await supabase.from('cards').update(updates).eq('id', card.id);
    if (error) {
       dispatch(updateCard({ id: card.id, start_date: card.start.toISOString(), due_date: card.end.toISOString() }));
    }
  };

  const handleTimelineResize = async (card, side, deltaX) => {
    const deltaDays = Math.round(deltaX / CELL_WIDTH);
    if (deltaDays === 0) return;

    let newStart = card.start;
    let newEnd = card.end;

    if (side === 'left') {
      newStart = addDays(card.start, deltaDays);
      if (newStart >= newEnd) newStart = addDays(newEnd, -1);
    } else {
      newEnd = addDays(card.end, deltaDays);
      if (newEnd <= newStart) newEnd = addDays(newStart, 1);
    }

    const updates = { 
      start_date: newStart.toISOString(), 
      due_date: newEnd.toISOString() 
    };

    // Optimistic
    dispatch(updateCard({ id: card.id, ...updates }));

    const { error } = await supabase.from('cards').update(updates).eq('id', card.id);
    if (error) {
       dispatch(updateCard({ id: card.id, start_date: card.start.toISOString(), due_date: card.end.toISOString() }));
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden selection:bg-brand-primary/10">
      {/* Professional Minimalist Header */}
      <header className="shrink-0 p-8 flex items-center justify-between relative z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex gap-6 items-center">
          <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-text-primary shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
              Roadmap <span className="opacity-30">Timeline</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{format(currentDate, 'MMMM yyyy')}</span>
              <div className="w-1 h-1 bg-text-tertiary/20 rounded-full" />
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-success rounded-full" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Completed In-situ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Zoom Toggles */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
            {['DAY', 'WEEK', 'MONTH'].map(v => (
              <button
                key={v}
                onClick={() => setZoomLevel(v)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${zoomLevel === v ? 'bg-white text-brand-primary shadow-sm active:scale-95' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
            <button onClick={prevMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-text-tertiary hover:text-text-primary">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-text-tertiary hover:text-text-primary">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Timeline Viewport */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white mx-8 mb-8 border border-gray-200 rounded-[20px] shadow-sm relative" ref={containerRef}>
        <div className="min-w-max relative">
          
          {/* Timeline Header (Days) */}
          <div className="flex sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
            <div className="w-[280px] shrink-0 border-r border-gray-100 p-6 font-black text-[9px] uppercase tracking-[0.4em] text-text-tertiary/60 flex items-center gap-3 bg-white sticky left-0 z-40">
               <Layers size={16} className="opacity-40" />
               Project Phases
            </div>
            {days.map(day => (
              <div 
                key={day.toString()} 
                className={`shrink-0 h-16 flex flex-col items-center justify-center border-r border-gray-100/40 transition-all ${isSameDay(day, new Date()) ? 'bg-brand-primary/5' : ''}`}
                style={{ width: CELL_WIDTH }}
              >
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isSameDay(day, new Date()) ? 'text-brand-primary' : 'text-text-tertiary opacity-40'}`}>
                   {format(day, 'EEE')}
                </span>
                <span className={`text-sm font-black ${isSameDay(day, new Date()) ? 'text-brand-primary' : 'text-text-primary'}`}>
                   {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Background */}
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="w-[280px] shrink-0 border-r border-gray-100 bg-gray-50/10" />
            {days.map(day => (
              <div 
                key={day.toString()} 
                className={`shrink-0 border-r border-gray-100/10 ${isSameDay(day, new Date()) ? 'bg-brand-primary/[0.01]' : ''}`}
                style={{ width: CELL_WIDTH }}
              />
            ))}
          </div>

          {/* Rows */}
          <div className="relative z-10">
            <AnimatePresence>
              {groupedRows.map((list) => (
                <div key={list.id} className="border-b border-gray-100 group hover:bg-gray-50/20 transition-colors">
                  <div className="flex" style={{ minHeight: list.height }}>
                    {/* List Info Segment */}
                    <div className="w-[280px] shrink-0 p-6 flex flex-col justify-center border-r border-gray-100 bg-white sticky left-0 z-20">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: list.color || '#3B82F6' }} />
                        <h3 className="text-[11px] font-black text-text-primary uppercase tracking-tight truncate pr-4">{list.title}</h3>
                      </div>
                      <span className="text-[8px] font-bold tracking-widest text-text-tertiary mt-1 uppercase opacity-40">
                        {list.cards.length} Active Tracks
                      </span>
                    </div>

                    {/* Bars Segment */}
                    <div className="relative flex-1 flex flex-col justify-center py-6">
                      {list.cards.map((card, idx) => {
                        const priorityColors = {
                          CRITICAL: 'from-red-500 to-red-600 shadow-red-200',
                          HIGH: 'from-orange-500 to-orange-600 shadow-orange-200',
                          MEDIUM: 'from-blue-500 to-blue-600 shadow-blue-200',
                          LOW: 'from-gray-400 to-gray-500 shadow-gray-100'
                        };
                        const pColor = priorityColors[card.priority] || 'from-brand-primary to-brand-secondary shadow-brand-light';
                        
                        return (
                          <motion.div 
                            key={card.id}
                            drag="x"
                            dragMomentum={false}
                            dragElastic={0}
                            onDragEnd={(e, info) => handleTimelineMove(card, info)}
                            className={`absolute h-8 rounded-lg flex items-center px-3 cursor-pointer shadow-sm hover:shadow-md transition-all group/card border border-white/10 text-white
                              ${card.is_completed ? 'bg-gray-400 opacity-60' : `bg-gradient-to-r ${pColor}`}`}
                            style={{ 
                              left: card.left, 
                              width: card.width,
                              top: 24 + (card.trackIndex * 44),
                              zIndex: 10 + idx,
                              touchAction: 'none'
                            }}
                            onClick={() => dispatch(setActiveCardId(card.id))}
                          >
                             {/* Resize Handles */}
                             {!card.is_completed && (
                               <>
                                 <motion.div 
                                   drag="x"
                                   dragMomentum={false}
                                   onDrag={(e, info) => handleTimelineResize(card, 'left', info.delta.x)}
                                   className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-20"
                                 />
                                 <motion.div 
                                   drag="x"
                                   dragMomentum={false}
                                   onDrag={(e, info) => handleTimelineResize(card, 'right', info.delta.x)}
                                   className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-20"
                                 />
                               </>
                             )}

                             <div className="flex items-center gap-2 truncate relative z-10 w-full">
                                <span className="text-[10px] font-black truncate drop-shadow-md">{card.title}</span>
                             </div>
                             
                             <div className="absolute right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <ArrowRight size={10} className="text-white/80" />
                             </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimelineView;
