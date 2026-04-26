import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { History, User, ArrowRight, Clock } from 'lucide-react';

const CardAuditHistory = ({ cardId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('card_history')
        .select('*, profiles(full_name, avatar_url, email)')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });

      if (!error) setHistory(data);
      setLoading(false);
    };

    fetchHistory();

    // Subscribe to real-time updates for this card's history
    const channel = supabase
      .channel(`card_history_${cardId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'card_history',
        filter: `card_id=eq.${cardId}` 
      }, async (payload) => {
        // Fetch profile for the new entry
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('id', payload.new.changed_by)
          .single();
        
        const newEntry = { ...payload.new, profiles: profile };
        setHistory(prev => [newEntry, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId]);

  const renderValue = (val, field) => {
    if (val === null) return <span className="text-gray-400 italic">none</span>;
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (field === 'due_date' || field === 'next_recurrence_at') {
      return new Date(val).toLocaleDateString();
    }
    return String(val);
  };

  const getFieldLabel = (field) => {
    const labels = {
      title: 'Title',
      description: 'Description',
      due_date: 'Due Date',
      priority: 'Priority',
      list_id: 'List',
      is_completed: 'Status',
      story_points: 'Story Points',
      estimated_hours: 'Estimated Hours',
      recurrence_rule: 'Recurrence'
    };
    return labels[field] || field;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Clock className="animate-spin mb-2" size={20} />
      <span className="text-[10px] font-black uppercase tracking-widest">Loading History...</span>
    </div>
  );

  if (history.length === 0) return (
    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
      <History className="mx-auto text-gray-200 mb-2" size={32} />
      <p className="text-xs text-gray-400 font-medium whitespace-pre-wrap">No history records yet.\nChanges will appear here as they happen.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {history.map((entry) => (
        <div key={entry.id} className="relative pl-8 group">
          {/* Connector Line */}
          <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-100 group-last:hidden" />
          
          {/* Point Icon */}
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10">
            {entry.profiles?.avatar_url ? (
              <img src={entry.profiles.avatar_url} className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <User size={10} className="text-gray-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-gray-900">
                {entry.profiles?.full_name || 'Someone'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                updated {getFieldLabel(entry.field)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium">
              <div className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-500 line-through opacity-60">
                {renderValue(entry.old_value, entry.field)}
              </div>
              <ArrowRight size={10} className="text-gray-300" />
              <div className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded text-primary font-bold">
                {renderValue(entry.new_value, entry.field)}
              </div>
            </div>

            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest pt-0.5">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardAuditHistory;
