import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layout, 
  Zap, 
  ArrowRight, 
  Check, 
  Lock, 
  Users, 
  Globe, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { addBoardToWorkspace } from '../../store/slices/workspaceSlice';
import { setActiveBoard } from '../../store/slices/boardSlice';

const TemplatePreviewModal = ({ template, isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workspaces, activeWorkspace } = useSelector((state) => state.workspaces);
  const [title, setTitle] = useState(`${template.name} - My Project`);
  const [visibility, setVisibility] = useState('WORKSPACE');
  const [loading, setLoading] = useState(false);

  const effectiveWorkspace = activeWorkspace || (workspaces && workspaces[0]);

  const handleDeploy = async () => {
    if (!title.trim()) return;
    if (loading || !effectiveWorkspace) return;

    setLoading(true);
    try {
      // 1. Create Board
      const { data: board, error } = await supabase
        .from('boards')
        .insert({
          title,
          workspace_id: effectiveWorkspace.id,
          created_by: user.id,
          visibility,
          background_type: template.background.includes('gradient') ? 'GRADIENT' : 'COLOR',
          background_value: template.background,
          thumbnail_url: template.coverImage || null,
          settings: {
            card_covers: true,
            voting: false,
            aging: false,
            calendar_feed: false,
            list_style: template.listStyle || 'solid',
            card_style: template.cardStyle || 'modern'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Provision Lists
      const { data: createdLists, error: listError } = await supabase.from('lists').insert(
        template.lists.map((list, index) => ({
          board_id: board.id,
          title: typeof list === 'string' ? list : list.title,
          color: typeof list === 'string' ? null : list.color,
          position: `a${index}`
        }))
      ).select();

      if (listError) throw listError;

      // 3. Provision Cards
      if (template.initialCards && createdLists) {
        const cardBlueprints = template.initialCards.map((card, index) => {
          const targetList = createdLists.find(l => l.title === card.listTitle);
          if (!targetList) return null;

          return {
            board_id: board.id,
            list_id: targetList.id,
            created_by: user.id,
            title: card.title,
            description: card.description || { type: 'doc', content: [] },
            position: `a${index}`,
            priority: 'NONE',
            cover_type: card.coverImage ? 'IMAGE' : 'NONE',
            cover_value: card.coverImage || null
          };
        }).filter(Boolean);

        if (cardBlueprints.length > 0) {
          const { error: cardError } = await supabase.from('cards').insert(cardBlueprints);
          if (cardError) console.error('Error provisioning initial cards:', cardError);
        }
      }

      dispatch(addBoardToWorkspace({
        workspaceId: effectiveWorkspace.id,
        board: board
      }));
      dispatch(setActiveBoard(board));
      onClose();
      navigate(`/w/${effectiveWorkspace.slug}/b/${board.id}`);
    } catch (err) {
      console.error('Deployment failed:', err);
      alert(err.message || 'Failed to deploy template.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-6xl bg-white rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className="h-64 relative shrink-0">
          <img 
            src={template.coverImage} 
            alt={template.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/20 hover:bg-white text-white hover:text-foreground backdrop-blur-md rounded-2xl transition-all border border-white/20"
          >
            <X size={24} />
          </button>
          
          <div className="absolute -bottom-10 left-12 flex items-end gap-6">
            <div className={`p-6 rounded-[32px] ${template.color} shadow-2xl ring-8 ring-white`}>
              {template.icon ? <template.icon size={48} strokeWidth={2.5} /> : <Layout size={48} />}
            </div>
            <div className="pb-12">
              <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-2">{template.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                  Blueprint Optimized
                </span>
                <span className="text-xs text-text-tertiary font-bold">• {template.category} package</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-20 px-12 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-16 custom-scrollbar">
          {/* Left: Mission & Description */}
          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                <Info size={16} />
                <span>Blueprint Mission</span>
              </div>
              <p className="text-lg font-medium text-text-secondary leading-relaxed whitespace-pre-line">
                {template.longDescription || template.description}
              </p>
            </section>

            <section className="p-8 bg-bg-secondary rounded-[32px] border border-border-light space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" />
                Included Automations
              </h4>
              <p className="text-xs text-text-tertiary font-medium leading-relaxed">
                This template includes pre-configured operational logic, custom card layouts, and status-based coloring for maximum throughput.
              </p>
            </section>
          </div>

          {/* Right: Architecture Preview & Deployment Form */}
          <div className="lg:col-span-5 space-y-10">
            {/* List Preview */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                <Layout size={16} />
                <span>System Architecture</span>
              </div>
              <div className="flex flex-col gap-3">
                {template.lists.map((list, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div 
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: typeof list === 'string' ? '#e2e8f0' : list.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-foreground">{typeof list === 'string' ? list : list.title}</p>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tight">Workstream {idx + 1}</p>
                    </div>
                    <Check size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </section>

            {/* Deployment Form */}
            <section className="p-8 bg-foreground rounded-[40px] text-white space-y-8 shadow-2xl">
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <Zap size={24} className="text-primary fill-current" />
                  Deploy Blueprint
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Board Identifier</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Privacy Tier</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                    {[
                      { id: 'PRIVATE', icon: Lock, label: 'Private' },
                      { id: 'WORKSPACE', icon: Users, label: 'Team' },
                      { id: 'PUBLIC', icon: Globe, label: 'Public' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setVisibility(type.id)}
                        className={`flex flex-col items-center gap-1.5 py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${visibility === type.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/60'}`}
                      >
                        <type.icon size={14} />
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDeploy}
                disabled={loading || !title.trim()}
                className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Initializing System...</span>
                ) : (
                  <>
                    <span>Deploy to Workspace</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplatePreviewModal;
