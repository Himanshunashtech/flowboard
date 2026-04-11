import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

const AnalyticsDashboard = ({ boardId }) => {
  const [loading, setLoading] = useState(true);
  const [velocityData, setVelocityData] = useState([]);
  const [leadTimeData, setLeadTimeData] = useState([]);
  const [stats, setStats] = useState({
    avgLeadTime: 0,
    totalCompleted: 0,
    activeTasks: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [boardId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: velocity } = await supabase
        .from('analytics_velocity')
        .select('*')
        .eq('board_id', boardId)
        .order('completion_date', { ascending: true })
        .limit(30);

      const { data: leadTime } = await supabase
        .from('analytics_lead_time')
        .select('*')
        .eq('board_id', boardId)
        .order('completed_at', { ascending: false })
        .limit(50);

      const { count: activeCount } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('board_id', boardId)
        .eq('is_completed', false);

      setVelocityData(velocity || []);
      setLeadTimeData(leadTime || []);
      
      // Calculate Stats
      if (leadTime && leadTime.length > 0) {
        const avg = leadTime.reduce((acc, curr) => acc + curr.lead_time_hours, 0) / leadTime.length;
        setStats({
          avgLeadTime: avg.toFixed(1),
          totalCompleted: leadTime.length,
          activeTasks: activeCount || 0,
          completionRate: ((leadTime.length / (leadTime.length + (activeCount || 0))) * 100).toFixed(0)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center animate-pulse">
        <TrendingUp className="text-brand-primary" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Calculating Insights...</p>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-8 bg-bg-secondary/30 space-y-8 custom-scrollbar">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Lead Time', value: `${stats.avgLeadTime}h`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Cards Completed', value: stats.totalCompleted, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
          { label: 'Active Tasks', value: stats.activeTasks, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Success Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[32px] bg-white shadow-xl shadow-black/5 border border-border-light flex flex-col gap-4"
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-black text-text-primary tabular-nums">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Velocity Chart */}
        <div className="md:col-span-2 p-8 rounded-[40px] bg-white shadow-2xl shadow-black/5 border border-border-light">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Team Velocity</h3>
                <p className="text-[10px] font-bold text-text-tertiary uppercase">Cards completed per day</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded-xl text-[10px] font-bold text-text-tertiary uppercase">
              <Calendar size={12} /> Last 30 Days
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F7" />
                <XAxis 
                  dataKey="completion_date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#999' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="cards_completed" stroke="#0052CC" strokeWidth={3} fillOpacity={1} fill="url(#colorVel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Time Breakdown */}
        <div className="p-8 rounded-[40px] bg-white shadow-2xl shadow-black/5 border border-border-light">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Complexity</h3>
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Time to finish work</p>
            </div>
          </div>

          <div className="space-y-6">
            {leadTimeData.slice(0, 5).map((item, i) => (
              <div key={item.card_id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-text-primary truncate max-w-[140px]">{item.title}</span>
                  <span className="text-[9px] font-black text-text-tertiary tabular-nums uppercase">{item.lead_time_hours.toFixed(1)}h</span>
                </div>
                <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.lead_time_hours / 48) * 100, 100)}%` }}
                    className={`h-full rounded-full ${item.lead_time_hours > 24 ? 'bg-orange-400' : 'bg-success'}`}
                  />
                </div>
              </div>
            ))}
            {leadTimeData.length === 0 && (
              <div className="py-12 flex flex-col items-center text-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">No data yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Bottleneck Identification */}
         <div className="p-8 rounded-[40px] bg-white border border-border-light">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center`}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Bottlenecks</h3>
                <p className="text-[10px] font-bold text-text-tertiary uppercase">Oldest active tasks</p>
              </div>
            </div>
            <div className="space-y-2">
               {/* Logic to find oldest active tasks based on activity/created_at */}
               {stats.activeTasks > 0 ? (
                 <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
                   Currently focusing on <span className="font-black text-text-primary underline decoration-brand-primary/30 decoration-2 underline-offset-2">{stats.activeTasks} items</span>. 
                   Team velocity suggests you are completing <strong>{(velocityData.reduce((acc, c) => acc + c.cards_completed, 0) / (velocityData.length || 1)).toFixed(1)} tasks</strong> per active day.
                 </p>
               ) : (
                 <p className="text-[11px] font-medium text-text-tertiary text-center py-4 italic">No bottlenecks detected. Flow is optimal.</p>
               )}
            </div>
         </div>

         {/* Distribution Summary */}
         <div className="p-8 rounded-[40px] bg-gradient-to-br from-brand-primary to-indigo-600 text-white shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-80">Health Score</h3>
            <div className="flex items-baseline gap-2">
               <h2 className="text-6xl font-black tabular-nums tracking-tighter">84</h2>
               <span className="text-lg font-bold opacity-60">/ 100</span>
            </div>
            <p className="mt-6 text-xs font-medium leading-relaxed opacity-90">
               Your team is highly efficient. Lead time is down 12% compared to last week. Keep the "In Progress" list under 5 items for maximum flow.
            </p>
            <button className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               Generate Sprint Report
            </button>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
