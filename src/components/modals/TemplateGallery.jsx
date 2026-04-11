import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layout, 
  Calendar, 
  Target, 
  Rocket, 
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Perfect for agile teams tracking features and releases.',
    icon: Rocket,
    color: 'bg-brand-primary',
    lists: ['Backlog', 'In Discovery', 'Ready for Dev', 'In Progress', 'Done']
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Launch',
    description: 'Coordinate multi-channel campaigns with ease.',
    icon: Target,
    color: 'bg-orange-500',
    lists: ['Strategy', 'Creative Assets', 'Ad Ops', 'Published', 'Reporting']
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Track leads through your customized sales funnel.',
    icon: ShieldCheck,
    color: 'bg-success',
    lists: ['Incoming Leads', 'Qualified', 'Negotiation', 'Won', 'Lost']
  },
  {
    id: 'personal-tasks',
    name: 'Personal Planner',
    description: 'Stay organized with a clean, daily task tracker.',
    icon: Zap,
    color: 'bg-indigo-500',
    lists: ['Today', 'Upcoming', 'Waiting on', 'Completed']
  }
];

const TemplateGallery = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-4xl bg-white rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-10 border-b border-border-light flex justify-between items-center bg-bg-secondary/30">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-brand-primary" size={24} />
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Board Templates</h2>
                  </div>
                  <p className="text-sm text-text-tertiary font-medium">Select a blueprint to provision your board in seconds.</p>
               </div>
               <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-border-light">
                  <X size={24} className="text-text-tertiary" />
               </button>
            </div>

            <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              {TEMPLATES.map((template, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className="group relative p-8 rounded-[32px] border border-border-light bg-white hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all cursor-pointer overflow-hidden flex flex-col gap-6"
                >
                   <div className="flex items-start justify-between relative z-10">
                      <div className={`p-4 rounded-2xl ${template.color} text-white shadow-lg`}>
                         <template.icon size={28} />
                      </div>
                      <div className="px-3 py-1 bg-bg-secondary rounded-lg text-[10px] font-black uppercase tracking-widest text-text-tertiary group-hover:bg-brand-primary group-hover:text-white transition-all">
                        {template.lists.length} Lists
                      </div>
                   </div>

                   <div className="relative z-10">
                      <h3 className="text-xl font-bold text-text-primary mb-2">{template.name}</h3>
                      <p className="text-sm text-text-tertiary leading-relaxed font-medium">{template.description}</p>
                   </div>

                   <div className="flex flex-wrap gap-2 relative z-10">
                      {template.lists.slice(0, 3).map(list => (
                        <span key={list} className="px-3 py-1 bg-bg-secondary/80 rounded-full text-[9px] font-bold text-text-secondary uppercase tracking-tight">
                           {list}
                        </span>
                      ))}
                      {template.lists.length > 3 && (
                        <span className="px-3 py-1 bg-bg-secondary/80 rounded-full text-[9px] font-bold text-text-tertiary uppercase tracking-tight">
                           +{template.lists.length - 3}
                        </span>
                      )}
                   </div>

                   <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all relative z-10">
                      Start with template
                      <ArrowRight size={14} />
                   </div>

                   {/* Subtle hover background logic */}
                   <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity ${template.color}`} />
                </motion.div>
              ))}
            </div>

            <div className="p-8 bg-bg-secondary/30 border-t border-border-light text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary/50">
                  Select a template to automatically configure lists and start working.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplateGallery;
