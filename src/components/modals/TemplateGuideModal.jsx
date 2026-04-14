import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Rocket, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const TemplateGuideModal = ({ isOpen, onClose, template }) => {
  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-full max-w-5xl bg-white rounded-[48px] shadow-[0_32px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Left Wing: Visual Identity */}
            <div className="w-full md:w-1/2 relative overflow-hidden bg-bg-secondary group">
               <img 
                 src={template.coverImage} 
                 alt={template.name} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/40 to-transparent mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               
               <div className="absolute bottom-12 left-12 right-12 space-y-4">
                  <div className={`w-16 h-16 rounded-3xl ${template.color} text-white flex items-center justify-center shadow-2xl animate-bounce-subtle`}>
                     {template.icon ? <template.icon size={32} /> : <Rocket size={32} />}
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">
                     Introducing the <br/>
                     <span className="text-brand-primary brightness-150">{template.name}</span>
                  </h2>
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                        Premium Blueprint
                     </span>
                     <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                        {template.lists.length} Strategic Lists
                     </span>
                  </div>
               </div>
            </div>

            {/* Right Wing: The Content Guide */}
            <div className="w-full md:w-1/2 flex flex-col bg-white">
               <div className="p-8 border-b border-border-light flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <Sparkles className="text-brand-primary" size={18} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Operational manual</span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-3 hover:bg-bg-secondary rounded-2xl transition-all text-text-tertiary hover:text-text-primary"
                  >
                     <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
                  <section className="space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <Zap className="text-brand-primary" size={24} />
                        <h3 className="text-xl font-black text-text-primary tracking-tight">Executive Strategy</h3>
                     </div>
                     
                     {/* The Long Description Content */}
                     <div className="prose prose-slate max-w-none">
                        {template.longDescription.split('\n\n').map((paragraph, i) => (
                           <p key={i} className="text-text-secondary leading-relaxed font-medium mb-4">
                              {paragraph}
                           </p>
                        ))}
                     </div>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-border-light">
                     <h4 className="text-xs font-black uppercase tracking-widest text-text-tertiary">Quick Start Checklist</h4>
                     <div className="grid gap-3">
                        {[
                           "Review the pre-provisioned lists and cards",
                           "Assign tasks to your lead executors",
                           "Configure automation triggers in settings",
                           "Share the project with your strategic partners"
                        ].map((step, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-4 bg-bg-secondary/50 rounded-2xl border border-transparent hover:border-brand-primary/10 transition-all">
                              <CheckCircle2 size={18} className="text-brand-primary" />
                              <span className="text-sm font-bold text-text-primary">{step}</span>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>

               <div className="p-8 bg-bg-secondary/30 border-t border-border-light">
                  <button 
                    onClick={onClose}
                    className="w-full h-16 bg-brand-primary text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                     <span>Initialize Protocol</span>
                     <ArrowRight size={18} />
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplateGuideModal;
