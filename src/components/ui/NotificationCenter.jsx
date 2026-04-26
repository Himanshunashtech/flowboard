import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, ExternalLink, Inbox, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NotificationCenter = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time subscription
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-text-tertiary hover:bg-bg-secondary hover:text-foreground rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-danger text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-[400px] bg-white border border-border-light rounded-[32px] shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-border-light flex items-center justify-between bg-bg-secondary/30">
              <h3 className="font-black text-foreground tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[480px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto text-text-tertiary">
                    <Inbox size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">All caught up!</p>
                    <p className="text-xs text-text-tertiary">New notifications will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border-light">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 hover:bg-bg-secondary transition-colors relative flex gap-4 ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${!n.is_read ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-tertiary'}`}>
                        <Bell size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-foreground truncate">{n.title}</span>
                          <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{n.body}</p>
                        {n.action_url && (
                          <a 
                            href={n.action_url}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details 
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {!n.is_read && (
                        <div className="absolute right-5 bottom-5 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-light bg-bg-secondary/30 text-center">
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-foreground transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
