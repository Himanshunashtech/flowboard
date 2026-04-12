import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { X, TrendingUp, Users, CheckCircle2, Clock, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#0052CC', '#36B37E', '#FFab00', '#FF5630', '#00B8D9', '#6554C0'];

const BoardInsights = ({ isOpen, onClose, lists, cards, members }) => {
  
  const stats = useMemo(() => {
    // 1. Distribution by List
    const distributionData = lists.map(l => ({
      name: l.title,
      count: cards.filter(c => c.list_id === l.id).length
    }));

    // 2. Completion Rate
    const completed = cards.filter(c => c.is_completed).length;
    const total = cards.length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 3. Workload by Member
    // Note: This is a simplified calculation
    const workloadData = members.map(m => ({
      name: m.profiles?.full_name || 'Unassigned',
      cards: cards.filter(c => c.card_assignments?.some(a => a.user_id === m.user_id)).length
    }));

    // 4. Activity Over Time (Simulation for now - would normally pull from activity_logs)
    const activityData = [
      { day: 'Mon', active: 12 },
      { day: 'Tue', active: 18 },
      { day: 'Wed', active: 15 },
      { day: 'Thu', active: 25 },
      { day: 'Fri', active: 20 },
      { day: 'Sat', active: 8 },
      { day: 'Sun', active: 5 },
    ];

    return { distributionData, completionPct, total, workloadData, activityData };
  }, [lists, cards, members]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-border-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                <BarChart3 size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Board Pulse</h2>
                <p className="text-sm text-text-tertiary">Real-time performance and workload distribution analytics.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 text-text-tertiary hover:bg-bg-secondary rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard label="Total Cards" value={stats.total} icon={BarChart3} color="bg-blue-500" />
             <StatCard label="Completion" value={`${stats.completionPct}%`} icon={CheckCircle2} color="bg-green-500" />
             <StatCard label="Board Velocity" value="8.4" icon={TrendingUp} color="bg-indigo-500" subValue="Cards / Day" />
             <StatCard label="Active Members" value={members.length} icon={Users} color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             
             {/* List Distribution */}
             <div className="bg-bg-secondary/30 rounded-[32px] p-8 border border-border-light">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-8 flex items-center gap-2">
                   <PieIcon size={16} className="text-brand-primary" />
                   Card Distribution
                </h3>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.distributionData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                         <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                         <Tooltip 
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                           cursor={{ fill: 'rgba(0,82,204,0.05)' }}
                         />
                         <Bar dataKey="count" fill="var(--brand-primary)" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Activity Trends */}
             <div className="bg-bg-secondary/30 rounded-[32px] p-8 border border-border-light">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-8 flex items-center gap-2">
                   <TrendingUp size={16} className="text-indigo-500" />
                   Collaboration Velocity
                </h3>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.activityData}>
                         <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                         <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                         <Area type="monotone" dataKey="active" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
  <div className="bg-white p-6 rounded-[28px] border border-border-light shadow-sm hover:shadow-md transition-all flex items-center gap-5">
     <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg shrink-0`}>
        <Icon size={24} />
     </div>
     <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{label}</p>
        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-black text-text-primary tracking-tight">{value}</span>
           {subValue && <span className="text-[10px] font-bold text-text-tertiary">{subValue}</span>}
        </div>
     </div>
  </div>
);

export default BoardInsights;
