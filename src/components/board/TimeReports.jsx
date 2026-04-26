import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Timer, 
  Users, 
  BarChart, 
  Clock, 
  TrendingUp,
  Layout
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TimeReports = ({ boardId }) => {
  const [data, setData] = useState({ members: [], stages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeData = async () => {
      setLoading(true);
      
      // Fetch time entries for this board
      const { data: entries } = await supabase
        .from('time_entries')
        .select(`
          duration_seconds,
          user_id,
          profiles (full_name),
          cards!inner (
            list_id,
            lists (title)
          )
        `)
        .eq('cards.board_id', boardId);

      if (entries) {
        // Aggregate by Member
        const memberMap = {};
        const stageMap = {};

        entries.forEach(entry => {
          const userName = entry.profiles?.full_name || 'Anonymous';
          const listTitle = entry.cards?.lists?.title || 'Unknown';
          const hours = entry.duration_seconds / 3600;

          memberMap[userName] = (memberMap[userName] || 0) + hours;
          stageMap[listTitle] = (stageMap[listTitle] || 0) + hours;
        });

        setData({
          members: Object.entries(memberMap).map(([name, hours]) => ({ name, hours })),
          stages: Object.entries(stageMap).map(([name, hours]) => ({ name, hours }))
        });
      }
      setLoading(false);
    };

    if (boardId) fetchTimeData();
  }, [boardId]);

  const maxMemberHours = Math.max(...data.members.map(m => m.hours), 1);
  const maxStageHours = Math.max(...data.stages.map(s => s.hours), 1);

  if (loading) return <div className="h-48 bg-bg-secondary rounded-3xl animate-pulse" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Hours by Member */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white/60 backdrop-blur-xl rounded-[40px] border border-border-light shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-3">
            <Users size={18} className="text-primary" />
            Hours by Member
          </h3>
        </div>

        <div className="space-y-6">
          {data.members.length > 0 ? data.members.map((member, idx) => (
            <div key={member.name} className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-secondary">{member.name}</span>
                <span className="text-foreground">{member.hours.toFixed(1)} hrs</span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(member.hours / maxMemberHours) * 100}%` }}
                  className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(38,132,255,0.3)]"
                />
              </div>
            </div>
          )) : (
            <p className="text-xs text-text-tertiary italic">No time logs recorded yet.</p>
          )}
        </div>
      </motion.div>

      {/* Hours by List/Stage */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white/60 backdrop-blur-xl rounded-[40px] border border-border-light shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-3">
            <Layout size={18} className="text-indigo-500" />
            Effort by Stage
          </h3>
        </div>

        <div className="space-y-6">
          {data.stages.length > 0 ? data.stages.map((stage, idx) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-secondary">{stage.name}</span>
                <span className="text-foreground">{stage.hours.toFixed(1)} hrs</span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stage.hours / maxStageHours) * 100}%` }}
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                />
              </div>
            </div>
          )) : (
            <p className="text-xs text-text-tertiary italic">No effort data available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TimeReports;
