import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, User, CreditCard, List, CheckCircle2, MessageCircle, Clock, Settings, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  'card.created': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
  'card.moved': { icon: History, color: 'text-purple-500', bg: 'bg-purple-50' },
  'card.completed': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  'list.created': { icon: List, color: 'text-orange-500', bg: 'bg-orange-50' },
  'comment.added': { icon: MessageCircle, color: 'text-primary', bg: 'bg-primary/5' },
};

const ActivitySidePanel = ({ isOpen, onClose, boardId }) => {
  const { members } = useSelector(state => state.board);
  const [activities, setActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // In a real app, fetch from activity_logs table
  // For now, we mock some recent activity for the UI demo
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setActivities([
          { id: '1', action: 'card.created', title: 'Implement logic for Undo/Redo', user: members[0]?.profiles?.full_name || 'You', time: new Date() },
          { id: '2', action: 'card.moved', title: 'Fractional Indexing Research', user: members[1]?.profiles?.full_name || 'Sarah', time: new Date(Date.now() - 3600000) },
          { id: '3', action: 'card.completed', title: 'Supabase Presence Setup', user: 'System', time: new Date(Date.now() - 7200000) },
        ]);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, members]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-bg-secondary flex items-center justify-center text-foreground shadow-inner">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Board Menu</h2>
                  <p className="text-[10px] font-bold text-text-tertiary">All activities and history</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-xl text-text-tertiary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">
                  <Clock size={12} />
                  <span>Recent Activity</span>
                </div>

                {loading ? (
                   <div className="animate-pulse space-y-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="flex gap-4">
                         <div className="w-8 h-8 rounded-xl bg-bg-secondary" />
                         <div className="flex-1 space-y-2">
                            <div className="h-3 bg-bg-secondary rounded w-3/4" />
                            <div className="h-2 bg-bg-secondary rounded w-1/4" />
                         </div>
                       </div>
                     ))}
                   </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map(activity => {
                      const config = ACTIVITY_ICONS[activity.action] || { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50' };
                      const Icon = config.icon;
                      return (
                        <div key={activity.id} className="flex gap-4 group">
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${config.bg} ${config.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground leading-relaxed">
                              <span className="font-bold underline decoration-primary/20">{activity.user}</span>
                              {' '}{activity.action.split('.')[1]} card{' '}
                              <span className="font-bold">{activity.title}</span>
                            </p>
                            <p className="text-[10px] text-text-tertiary mt-1 font-medium">
                              {formatDistanceToNow(activity.time, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Quick Actions or Settings can go here */}
              <section className="pt-8 border-t border-border-light">
                 <div className="flex items-center gap-2 text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">
                  <Settings size={12} />
                  <span>Board Configuration</span>
                </div>
                <button className="w-full p-4 rounded-2xl bg-bg-secondary hover:bg-bg-tertiary transition-all text-left flex items-center justify-between group">
                  <span className="text-xs font-bold text-foreground">Change Board Background</span>
                  <ArrowRight size={14} className="text-text-tertiary group-hover:translate-x-1 transition-transform" />
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivitySidePanel;
