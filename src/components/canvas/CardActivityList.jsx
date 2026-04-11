import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ActivityLogItem from '../ui/ActivityLogItem';
import { History, Loader2 } from 'lucide-react';

const CardActivityList = ({ cardId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (full_name, email, avatar_url)
        `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setLogs(data);
      setLoading(false);
    };

    if (cardId) {
      fetchLogs();

      // Real-time subscription for this card's activity
      const channel = supabase
        .channel(`card-activity:${cardId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `card_id=eq.${cardId}`
        }, (payload) => {
          // Fetch the full log with profile info
          // (Simpler than joining manually in JS for a single row)
          fetchLogs(); 
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [cardId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-text-tertiary p-4">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading history...</span>
      </div>
    );
  }

  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
          <History size={16} className="text-brand-primary" />
          Timeline
        </h3>
      </div>

      <div className="space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-bg-secondary">
        {logs.length === 0 ? (
          <div className="pl-12 py-4">
            <p className="text-xs text-text-tertiary font-medium">No activity recorded for this card yet.</p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([date, items]) => (
            <div key={date} className="relative space-y-6">
               <div className="flex items-center gap-4 pl-[38px] mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-white px-2 py-1 rounded-md border border-border-light shadow-sm">
                    {date}
                  </span>
               </div>
               <div className="space-y-8">
                  {items.map(log => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CardActivityList;
