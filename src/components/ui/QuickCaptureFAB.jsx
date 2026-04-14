import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Inbox, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addInboxItem } from '../store/slices/inboxSlice';

const QuickCaptureFAB = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await dispatch(addInboxItem({
        user_id: user.id,
        title: title.trim(),
        source: 'MANUAL'
      })).unwrap();
      setTitle('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to capture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-12 left-12 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 left-0 w-80 bg-white rounded-[32px] shadow-2xl border border-border-light p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-brand-primary">
                <Inbox size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Quick Capture</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-bg-secondary rounded-full transition-colors"
                type="button"
              >
                <X size={16} className="text-text-tertiary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind? (Capture now, organize later)"
                className="w-full h-24 bg-bg-secondary border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary resize-none placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full py-3 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>Add to Inbox</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-500 group ${isOpen ? 'bg-text-primary text-white rotate-45' : 'bg-white text-brand-primary hover:bg-brand-primary hover:text-white'}`}
        title="Quick Capture (Inbox)"
      >
        <Plus size={24} strokeWidth={3} />
      </button>
    </div>
  );
};

export default QuickCaptureFAB;
