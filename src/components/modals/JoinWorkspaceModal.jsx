import React from 'react';
import { motion } from 'framer-motion';
import { Users, Check, X, Sparkles, Layout } from 'lucide-react';

const JoinWorkspaceModal = ({ workspaceName, onAccept, onReject, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[48px] shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-primary pointer-events-none">
          <Users size={240} strokeWidth={1} />
        </div>

        <div className="p-12 text-center relative z-10">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-8 shadow-inner">
            <Sparkles size={40} className="fill-brand-primary/20" />
          </div>

          <h2 className="text-3xl font-black text-text-primary tracking-tighter mb-4 leading-tight">
            You've been invited!
          </h2>
          
          <p className="text-text-secondary font-medium mb-10 leading-relaxed px-4">
            Join the <span className="text-brand-primary font-black">{workspaceName || 'Project'}</span> team to start collaborating on this board.
          </p>

          <div className="space-y-4">
            <button 
              onClick={onAccept}
              disabled={loading}
              className="w-full py-5 bg-brand-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  <span>Accept & Join Team</span>
                </>
              )}
            </button>

            <button 
              onClick={onReject}
              disabled={loading}
              className="w-full py-5 bg-bg-secondary text-text-tertiary hover:text-text-primary rounded-[24px] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
            >
              <X size={18} strokeWidth={3} />
              <span>Maybe Later</span>
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 opacity-40">
              <Layout size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Shared Project</span>
            </div>
            <div className="w-1 h-1 bg-text-tertiary/20 rounded-full" />
            <div className="flex items-center gap-2 opacity-40">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Team Access</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinWorkspaceModal;
