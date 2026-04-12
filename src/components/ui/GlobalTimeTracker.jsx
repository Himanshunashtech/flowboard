import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, Square, Clock, X, Check, Timer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { addNotification } from '../../store/slices/uiSlice';

const GlobalTimeTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchActiveTimer = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, card:cards(id, title)')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .maybeSingle();

      if (data) {
        setActiveEntry(data);
        const startTime = new Date(data.started_at).getTime();
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      } else {
        setActiveEntry(null);
        setElapsed(0);
      }
    };

    fetchActiveTimer();

    // Set up real-time subscription for time_entries
    const channel = supabase.channel('time_entries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${user?.id}` }, (payload) => {
        fetchActiveTimer();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (activeEntry) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeEntry]);

  const stopTimer = async () => {
    if (!activeEntry) return;
    const now = new Date();
    const startTime = new Date(activeEntry.started_at);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from('time_entries')
      .update({ 
        ended_at: now.toISOString(),
        duration_seconds: duration
      })
      .eq('id', activeEntry.id);

    if (error) {
      dispatch(addNotification({ message: 'Failed to stop timer', type: 'error' }));
    } else {
      dispatch(addNotification({ message: `Tracked ${formatTime(duration)} for ${activeEntry.card?.title}`, type: 'success' }));
      setActiveEntry(null);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeEntry) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="flex items-center gap-6 px-6 py-3 bg-black/90 text-white rounded-[32px] shadow-2xl border border-white/20 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 border-r border-white/20 pr-6">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.5)]">
            <Timer size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Tracking Time</span>
            <span className="text-xs font-bold truncate max-w-[150px]">{activeEntry.card?.title}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <span className="text-2xl font-black tabular-nums tracking-tighter">
             {formatTime(elapsed)}
           </span>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <button 
            onClick={stopTimer}
            className="group p-3 bg-danger rounded-2xl hover:bg-danger/80 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-danger/20"
            title="Stop Timer"
          >
            <Square size={16} fill="white" className="text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalTimeTracker;
