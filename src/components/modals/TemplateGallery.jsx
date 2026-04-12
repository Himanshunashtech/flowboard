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
  ShieldCheck,
  ClipboardList,
  FileText
} from 'lucide-react';

export const TEMPLATES = [
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Perfect for agile teams tracking features and releases.',
    icon: Rocket,
    color: 'bg-brand-primary',
    background: '#0052CC',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: ['Backlog', 'In Discovery', 'Ready for Dev', 'In Progress', 'Done']
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Launch',
    description: 'Coordinate multi-channel campaigns with ease.',
    icon: Target,
    color: 'bg-orange-500',
    background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    listStyle: 'solid',
    cardStyle: 'shadowed',
    lists: ['Strategy', 'Creative Assets', 'Ad Ops', 'Published', 'Reporting']
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Track leads through your customized sales funnel.',
    icon: ShieldCheck,
    color: 'bg-success',
    background: '#36B37E',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: ['Incoming Leads', 'Qualified', 'Negotiation', 'Won', 'Lost']
  },
  {
    id: 'personal-tasks',
    name: 'Personal Planner',
    description: 'Stay organized with a clean, daily task tracker.',
    icon: Zap,
    color: 'bg-indigo-500',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: ['Today', 'Upcoming', 'Waiting on', 'Completed']
  },

  {
    id: 'agile-scrub',
    name: 'Agile Scrub',
    description: 'A fast-paced Scrum variant for high-velocity teams.',
    icon: ClipboardList,
    color: 'bg-blue-600',
    background: 'linear-gradient(135deg, #2AF598 0%, #009EFD 100%)',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: ['Product Backlog', 'Sprint Planning', 'In Progress', 'QA / UAT', 'Done']
  },
  {
    id: 'content-pipeline',
    name: 'File & Content Pipeline',
    description: 'Track assets from drafting to final publication.',
    icon: FileText,
    color: 'bg-emerald-600',
    background: '#00875A',
    listStyle: 'solid',
    cardStyle: 'shadowed',
    lists: ['Resources / Assets', 'Drafting', 'Internal Review', 'Final Polish', 'Published']
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
                         {template.icon ? <template.icon size={28} /> : <Layout size={28} />}
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

                   <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-light group-hover:border-brand-primary/20">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-bg-tertiary rounded text-[8px] font-black uppercase text-text-tertiary">{template.listStyle}</span>
                        <span className="px-2 py-0.5 bg-bg-tertiary rounded text-[8px] font-black uppercase text-text-tertiary">{template.cardStyle}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(template);
                        }}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                      >
                         Use Template
                         <ArrowRight size={12} />
                      </button>
                   </div>
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
