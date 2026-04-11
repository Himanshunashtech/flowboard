import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  UserPlus,
  Calendar,
  AlertCircle,
  Zap,
  Clock,
  AtSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS = {
  CARD_ASSIGNED: { icon: UserPlus, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  CARD_DUE_SOON: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  COMMENT_ADDED: { icon: MessageSquare, color: 'text-info', bg: 'bg-info/10' },
  MENTION: { icon: AtSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  BOARD_INVITATION: { icon: Calendar, color: 'text-success', bg: 'bg-success/10' },
  AUTOMATION_TRIGGERED: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

const NotificationDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time subscription
      const channel = supabase
        .channel(`user-notifications:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);
    
    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all relative ${isOpen ? 'bg-brand-primary text-white' : 'hover:bg-bg-secondary text-text-tertiary hover:text-text-primary'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-border-light z-[101] overflow-hidden"
            >
              <div className="p-5 border-b border-border-light flex items-center justify-between bg-bg-secondary/30">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-brand-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const style = NOTIFICATION_ICONS[n.type] || { icon: Bell, color: 'text-text-tertiary', bg: 'bg-bg-secondary' };
                    const Icon = style.icon;
                    return (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-border-light flex gap-4 transition-colors relative group ${!n.is_read ? 'bg-brand-primary/5' : 'hover:bg-bg-secondary/50'}`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${style.bg} ${style.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-relaxed ${!n.is_read ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
                            {n.title}
                          </p>
                          {n.body && <p className="text-[11px] text-text-tertiary mt-1 line-clamp-2">{n.body}</p>}
                          <p className="text-[10px] text-text-tertiary mt-2 font-medium">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-white rounded-lg shadow-sm text-brand-primary hover:scale-110 transition-all border border-border-light"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-text-tertiary">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm font-bold text-text-primary mb-1">All caught up!</p>
                    <p className="text-xs text-text-tertiary">No new notifications for you.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-bg-secondary/30 text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-colors">
                  View Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
