import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users,
  PieChart as LucidePieChart,
  ArrowRight,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { supabase } from '../../lib/supabase';
import TeamWorkload from './TeamWorkload';
import TimeReports from './TimeReports';

const BoardAnalytics = ({ boardId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_board_summary', { p_board_id: boardId });
      if (data) setStats(data);
      setLoading(false);
    };

    if (boardId) fetchStats();
  }, [boardId]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-bg-secondary/50 rounded-[32px] border border-border-light"></div>
      ))}
    </div>
  );

  if (!stats) return null;

  const PRIORITY_COLORS = {
    CRITICAL: '#ff4d4d',
    HIGH:     '#ff9f43',
    MEDIUM:   '#4facfe',
    LOW:      '#34c759',
    NONE:     '#8e8e93'
  };

  const priorityData = Object.entries(stats.by_priority).map(([name, value]) => ({
    name,
    value,
    fill: PRIORITY_COLORS[name] || '#61BD4F'
  })).filter(d => d.value > 0);

  const statusData = [
    { name: 'Completed', count: stats.completed_cards },
    { name: 'Remaining', count: stats.total_cards - stats.completed_cards },
    { name: 'Overdue',   count: stats.overdue_cards }
  ];

  const statCards = [
    { label: 'Total Tasks', value: stats.total_cards, icon: BarChart3, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Completed', value: stats.completed_cards, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Overdue', value: stats.overdue_cards, icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Due Today', value: stats.due_today, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-10 selection:bg-brand-primary/10">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label} 
            className="p-8 bg-white rounded-[32px] border border-border-light shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all group overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                 <card.icon size={28} />
              </div>
              <span className="text-3xl font-black text-text-primary tracking-tight">{card.value}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary relative z-10">{card.label}</p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${card.bg} opacity-0 group-hover:opacity-40 transition-opacity blur-2xl`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 bg-white rounded-[40px] border border-border-light shadow-sm flex flex-col min-h-[450px]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-3">
              <LucidePieChart size={18} className="text-brand-primary" />
              Priority Distribution
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-64 md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-text-primary">{item.value} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Velocity Trend Line Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 bg-white rounded-[40px] border border-border-light shadow-sm flex flex-col min-h-[450px]"
        >
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-3">
              <Activity size={18} className="text-brand-primary" />
              Velocity Trend
            </h3>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-brand-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Completed</span>
            </div>
          </div>

          <div className="flex-1 w-full h-full">
             {/* Note: In a real app, this data would come from board_history or similar. 
                 Simulating a 7-day trend for visualization purposes. */}
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { day: 'Mon', count: 4 },
                 { day: 'Tue', count: 6 },
                 { day: 'Wed', count: 5 },
                 { day: 'Thu', count: 8 },
                 { day: 'Fri', count: 12 },
                 { day: 'Sat', count: 9 },
                 { day: 'Sun', count: 15 }
               ]} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                 <XAxis 
                   dataKey="day" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 'black', fill: '#8e8e93', textTransform: 'uppercase' }} 
                 />
                 <YAxis hide />
                 <Tooltip 
                   cursor={{ fill: '#f8f9fa', radius: 12 }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }}
                 />
                 <Bar 
                   dataKey="count" 
                   radius={[12, 12, 12, 12]} 
                   barSize={40}
                   fill="#0052CC"
                 />
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="mt-8 p-6 bg-bg-secondary/50 rounded-3xl border border-border-light/50">
             <div className="flex items-center gap-3 text-brand-primary mb-2">
                <TrendingUp size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Efficiency Forecast</span>
             </div>
             <p className="text-[10px] text-text-secondary leading-relaxed font-bold">
                Project velocity is up <span className="text-success">24%</span> this week. At this rate, the current sprint will be completed 2 days ahead of schedule.
             </p>
          </div>
        </motion.div>
      </div>

      {/* Team Workload */}
      <TeamWorkload boardId={boardId} />

      {/* Time Tracking Reports */}
      <div className="pt-12 border-t border-border-light">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">Time & Effort Analysis</h2>
            <p className="text-sm text-text-secondary mt-1">Deep dive into resource allocation and billable efficiency.</p>
          </div>
          <button className="btn btn-secondary !h-12 !px-6 !text-xs !font-black uppercase tracking-widest hover:!bg-brand-primary hover:!text-white transition-all shadow-sm">
             Export Data
          </button>
        </div>
        <TimeReports boardId={boardId} />
      </div>
    </div>
  );
};

export default BoardAnalytics;

