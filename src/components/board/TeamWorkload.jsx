import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Layout,
  Gauge
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TeamWorkload = ({ boardId }) => {
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkload = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_member_workload', { p_board_id: boardId });
      if (data) setWorkload(data);
      setLoading(false);
    };

    if (boardId) fetchWorkload();
  }, [boardId]);

  if (loading) return <div className="space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-bg-secondary rounded-2xl animate-pulse" />)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-3">
          <Gauge size={18} className="text-primary" />
          Resource Capacity
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workload.map((member, idx) => {
          const isOverloaded = member.card_count > 5;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member.user_id} 
              className="p-6 bg-white rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                  {member.full_name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-bold text-foreground">{member.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${isOverloaded ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {isOverloaded ? 'At Capacity' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Active Cards</p>
                  <p className="text-lg font-black text-foreground">{member.card_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Completed</p>
                  <p className="text-lg font-black text-success">{member.completed_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Overdue</p>
                  <p className="text-lg font-black text-danger">{member.overdue_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Est. Hours</p>
                  <p className="text-lg font-black text-primary">{member.total_estimated_hours}h</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2.5 bg-bg-secondary text-text-tertiary hover:text-primary rounded-xl transition-all">
                  <Layout size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamWorkload;
