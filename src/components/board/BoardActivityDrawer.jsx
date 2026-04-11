import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ActivityLogItem from '../ui/ActivityLogItem';

const BoardActivityDrawer = ({ boardId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        profiles (full_name, email, avatar_url),
        cards (title)
      `)
      .eq('board_id', boardId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (boardId) {
      fetchLogs();

      // Real-time subscription
      const channel = supabase
        .channel(`board-activity:${boardId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `board_id=eq.${boardId}`
        }, (payload) => {
          fetchLogs();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [boardId]);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[300] border-l border-border-light flex flex-col"
    >
      <div className="p-6 border-b border-border-light flex items-center justify-between bg-bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
            <History size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-text-primary">Board Activity</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-tertiary hover:text-text-primary">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative before:absolute before:left-[39px] before:top-8 before:bottom-8 before:w-[2px] before:bg-bg-secondary">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <Loader2 size={24} className="animate-spin text-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Fetching history...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <History size={24} className="text-text-tertiary" />
            </div>
            <p className="text-sm font-bold text-text-primary mb-2">No activity yet</p>
            <p className="text-xs text-text-tertiary leading-relaxed">Actions taken on this board will appear here automatically.</p>
          </div>
        ) : (
          logs.map((log) => (
            <ActivityLogItem key={log.id} log={log} />
          ))
        )}
      </div>

      <div className="p-4 border-t border-border-light bg-bg-secondary/10">
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh History</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BoardActivityDrawer;
