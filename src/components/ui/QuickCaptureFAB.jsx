import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Inbox, X, Send, Sparkles, Calendar, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addInboxItem } from '../../store/slices/inboxSlice';
import { aiService } from '../../services/aiService';
import { debounce } from '../../lib/utils';

const QuickCaptureFAB = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI States
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const performAIParse = useCallback(
    debounce(async (text) => {
      if (text.length < 5) {
        setParsedData(null);
        return;
      }
      setIsParsing(true);
      try {
        const result = await aiService.parseIntention(text);
        setParsedData(result);
      } catch (error) {
        console.error('AI Parse Error:', error);
      } finally {
        setIsParsing(false);
      }
    }, 800),
    []
  );

  useEffect(() => {
    if (title.trim()) {
      performAIParse(title);
    } else {
      setParsedData(null);
    }
  }, [title, performAIParse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await dispatch(addInboxItem({
        user_id: user.id,
        title: parsedData?.title || title.trim(),
        source: 'MANUAL',
        ai_metadata: parsedData,
        metadata: {
          original_text: title,
          parsed_at: new Date().toISOString()
        }
      })).unwrap();
      setTitle('');
      setParsedData(null);
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
            className="absolute bottom-24 left-0 w-96 bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] border border-white/40 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agentic Capture</span>
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
              <div className="relative">
                <textarea
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tell your agent what to do... (e.g., meeting with team tomorrow at 3pm)"
                  className="w-full h-32 bg-bg-secondary/50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-text-tertiary transition-all"
                />
                
                {isParsing && (
                  <div className="absolute top-4 right-4 animate-spin">
                    <Sparkles size={14} className="text-primary/40" />
                  </div>
                )}
              </div>

              {/* AI Insights Preview */}
              <AnimatePresence>
                {parsedData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/10"
                  >
                    {parsedData.due_date && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-primary shadow-sm border border-primary/10">
                        <Calendar size={12} />
                        <span>{new Date(parsedData.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {parsedData.priority && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm border ${
                        parsedData.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-primary border-primary/10'
                      }`}>
                        <AlertCircle size={12} />
                        <span>{parsedData.priority} PRIORITY</span>
                      </div>
                    )}
                    {parsedData.category && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100">
                        <Tag size={12} />
                        <span>{parsedData.category}</span>
                      </div>
                    )}
                    {parsedData.is_actionable && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-bold text-emerald-600 shadow-sm border border-emerald-100">
                        <CheckCircle2 size={12} />
                        <span>ACTIONABLE</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 group"
              >
                <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>{parsedData?.is_actionable ? 'Dispatch Agent' : 'Capture to Inbox'}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all duration-500 group ${isOpen ? 'bg-foreground text-white rotate-45' : 'bg-white text-primary hover:bg-primary hover:text-white'}`}
        title="Agentic Capture"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

export default QuickCaptureFAB;
