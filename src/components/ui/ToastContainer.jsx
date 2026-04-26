import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';
import { removeNotification } from '../../store/slices/uiSlice';

const ICON_MAP = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warning: { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

const ToastContainer = () => {
  const { notifications } = useSelector(state => state.ui);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const config = ICON_MAP[n.type] || ICON_MAP.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-start gap-4 min-w-[320px] max-w-md overflow-hidden relative group"
            >
              <div className={`p-2 rounded-xl ${config.bg} ${config.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-bold text-foreground leading-tight lowercase first-letter:uppercase tracking-tight">
                  {n.message}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                  Just now
                </p>
              </div>
               <button
                onClick={() => dispatch(removeNotification(n.id))}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              
              {/* Timeout Progress Bar */}
              <motion.div 
                className={`absolute bottom-0 left-0 h-1 ${config.color.replace('text', 'bg')}`}
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => dispatch(removeNotification(n.id))}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
