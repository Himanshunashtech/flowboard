import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  RefreshCcw, 
  Sparkles, 
  Brain, 
  Music, 
  Volume2, 
  CheckCircle2,
  Wind
} from 'lucide-react';
import { toggleModal, addNotification } from '../../store/slices/uiSlice';

const AIFocusMode = () => {
  const dispatch = useDispatch();
  const { modals, modalData, activeCardId } = useSelector((state) => state.ui);
  const { cards } = useSelector((state) => state.board);
  const activeCard = cards.find(c => c.id === activeCardId) || modalData.focusMode?.card;

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionTips, setSessionTips] = useState([
    "Eliminate all browser tabs not related to this task.",
    "Put your phone in another room for 25 minutes.",
    "Deep breaths. You are entering the flow state."
  ]);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTips = async () => {
      if (activeCard) {
        try {
          const tips = await aiService.getFocusTips(activeCard);
          if (tips && tips.length > 0) {
            setSessionTips(tips);
          }
        } catch (e) {
          console.error('Tips fetch failed:', e);
        }
      }
    };
    if (modals.focusMode) {
      fetchTips();
    }
  }, [modals.focusMode, activeCard]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      dispatch(addNotification({ message: 'Focus Session Complete! Great work.', type: 'success' }));
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'focusMode', isOpen: false }));
  };

  if (!modals.focusMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             rotate: [0, 90, 0],
             opacity: [0.1, 0.2, 0.1]
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" 
        />
        <motion.div 
           animate={{ 
             scale: [1, 1.3, 1],
             rotate: [0, -45, 0],
             opacity: [0.1, 0.15, 0.1]
           }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px]" 
        />
      </div>

      <div className="relative w-full max-w-4xl px-8 flex flex-col items-center text-center space-y-12">
        {/* Header */}
        <div className="w-full flex items-center justify-between absolute top-0 left-0 p-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                <Brain size={20} />
             </div>
             <div className="text-left">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Zen Protocol</h3>
                <p className="text-sm font-bold text-white/80">Active Focus Session</p>
             </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Task Title */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mx-auto w-fit"
          >
            Current Objective
          </motion.div>
          <h1 className="text-6xl font-black text-white tracking-tighter leading-tight max-w-2xl mx-auto">
            {activeCard?.title || 'Deep Work Session'}
          </h1>
        </div>

        {/* Main Timer Display */}
        <div className="relative group">
          <div className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <motion.div 
            className="text-[180px] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <RefreshCcw size={24} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-[40px] shadow-2xl transition-all active:scale-95 flex items-center justify-center ${isActive ? 'bg-white text-black hover:bg-gray-200' : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'}`}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <Volume2 size={24} />
          </div>
        </div>

        {/* AI Nudges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl pt-12">
          {sessionTips.slice(0, 2).map((tip, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="p-6 rounded-[32px] bg-white/5 border border-white/10 text-left flex items-start gap-4 group hover:bg-white/10 transition-all"
            >
              <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0">
                <Sparkles size={16} />
              </div>
              <p className="text-sm font-medium text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{tip}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer Status */}
        <div className="absolute bottom-12 flex items-center gap-8">
           <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Bio-Optimized</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
              <Music size={14} />
              <span>Binaural Beats Active</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
              <Wind size={14} className="text-indigo-400" />
              <span>Oasis Atmosphere</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIFocusMode;
