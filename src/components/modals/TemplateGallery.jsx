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
    id: 'task-template',
    name: 'Task Template',
    description: 'A clean, high-performance workflow for daily task execution.',
    icon: ClipboardList,
    color: 'bg-indigo-500',
    background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#E0F7FA' },
      { title: 'To Do', color: '#F3E5F5' },
      { title: 'Doing', color: '#FFF3E0' },
      { title: 'Done', color: '#E8F5E9' }
    ],
    initialCards: [
      { 
        listTitle: 'Getting Started', 
        title: '👋 Welcome to your Task Board!', 
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This board is optimized for execution. Move tasks from To Do to Doing when you start working on them.' }] }] } 
      },
      { 
        listTitle: 'To Do', 
        title: 'Define your first mission', 
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Click on this card to add details, labels, or a location.' }] }] } 
      }
    ]
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the core features of FlowBoard with this interactive guide.',
    icon: Sparkles,
    color: 'bg-brand-primary',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    listStyle: 'glass',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#F8FAFC' },
      { title: 'Features Tour', color: '#F1F5F9' },
      { title: 'Next Steps', color: '#F8FAFC' }
    ],
    initialCards: [
      { 
        listTitle: 'Getting Started', 
        title: '📍 Using Locations', 
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'You can now add real-world locations to any card using the Location Selector.' }] }] } 
      },
      { 
        listTitle: 'Features Tour', 
        title: '⚙️ Power-up with Automations', 
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Open the "Automations" tab to create rules that automate your workflow.' }] }] } 
      }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Perfect for agile teams tracking features and releases.',
    icon: Rocket,
    color: 'bg-brand-primary',
    background: '#0052CC',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#F8FAFC' },
      { title: 'Product Backlog' }, 
      { title: 'In Discovery' }, 
      { title: 'Ready for Dev' }, 
      { title: 'In Progress' }, 
      { title: 'Done' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Roadmap Guide', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use this board to visualize your product strategy. Move items from Backlog to Discovery as they are defined.' }] }] } }
    ]
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
    lists: [
      { title: 'Getting Started', color: '#FFF7ED' },
      { title: 'Channel Strategy' }, 
      { title: 'Creative Assets' }, 
      { title: 'Ad Operations' }, 
      { title: 'Live / Published' }, 
      { title: 'Performance Tracking' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Campaign Blueprint', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Track all your creative assets and ad operations. Ensure the Channel Strategy is finalized before moving to Creative.' }] }] } }
    ]
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
    lists: [
      { title: 'Getting Started', color: '#F0FDF4' },
      { title: 'Incoming Leads' }, 
      { title: 'Qualification' }, 
      { title: 'Proposal Sent' }, 
      { title: 'Negotiation' }, 
      { title: 'Won / Closed' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Pipeline Best Practices', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Move leads through the funnel as conversations progress. Use labels to indicate lead priority or deal size.' }] }] } }
    ]
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
    lists: [
      { title: 'Getting Started', color: '#F5F3FF' },
      { title: 'Today’s Focus' }, 
      { title: 'Upcoming' }, 
      { title: 'Someday / Maybe' }, 
      { title: 'Archive / Done' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Plan Your Day', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Start every morning by moving tasks from "Upcoming" to "Today’s Focus". Focus on one thing at a time.' }] }] } }
    ]
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
    lists: [
      { title: 'Getting Started', color: '#F0FDF9' },
      { title: 'Sprint Backlog' }, 
      { title: 'Development' }, 
      { title: 'Code Review' }, 
      { title: 'QA Testing' }, 
      { title: 'Deployed' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Sprint Protocol', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Only move cards into "Development" that have a clear definition of done.' }] }] } }
    ]
  },
  {
    id: 'content-pipeline',
    name: 'Content Production',
    description: 'Track assets from drafting to final publication.',
    icon: FileText,
    color: 'bg-emerald-600',
    background: '#00875A',
    listStyle: 'solid',
    cardStyle: 'shadowed',
    lists: [
      { title: 'Getting Started', color: '#ECFDF5' },
      { title: 'Idea Bank' }, 
      { title: 'In Drafting' }, 
      { title: 'Editorial Review' }, 
      { title: 'Final Polish' }, 
      { title: 'Published' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Content Guide', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use the Idea Bank to store future topics. Move to Drafting once research is complete.' }] }] } }
    ]
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
                      {template.lists.slice(0, 3).map(list => {
                        const title = typeof list === 'string' ? list : list.title;
                        return (
                          <span key={title} className="px-3 py-1 bg-bg-secondary/80 rounded-full text-[9px] font-bold text-text-secondary uppercase tracking-tight">
                             {title}
                          </span>
                        );
                      })}
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
