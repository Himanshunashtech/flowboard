import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Layout, Globe, Lock, Palette, Sparkles, Check, Users, ChevronRight, Zap, Target } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { setActiveBoard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { addBoardToWorkspace } from '../../store/slices/workspaceSlice';
import TemplateGallery, { TEMPLATES } from './TemplateGallery';
import { motion, AnimatePresence } from 'framer-motion';

const CreateBoardModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workspaces, activeWorkspace } = useSelector((state) => state.workspaces);
  const { modals, modalData } = useSelector((state) => state.ui);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('WORKSPACE');
  const [background, setBackground] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState('basic');

  useEffect(() => {
    const data = modalData?.createBoard;
    if (data?.templateId) {
      const template = TEMPLATES.find(t => t.id === data.templateId);
      if (template) {
        setSelectedTemplate(template);
        const ws = activeWorkspace || (workspaces && workspaces[0]);
        setTitle(`${template.name} - ${ws?.name || 'New'}`);
      }
    }
  }, [modalData, activeWorkspace, workspaces]);

  const colors = [
    '#FFFFFF', '#0052CC', '#0747A6', '#0065FF', '#2684FF',
    '#00875A', '#36B37E', '#BF2600', '#DE350B',
    '#FF8B00', '#FFAB00', '#5243AA', '#6554C0',

  ];

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'createBoard', isOpen: false }));
  };

  const effectiveWorkspace = activeWorkspace || (workspaces && workspaces[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationErrors({ title: 'Board title is required' });
      return;
    }
    
    if (loading || !effectiveWorkspace) return;
    setValidationErrors({});

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
          background_type: selectedTemplate
            ? (selectedTemplate.background.includes('gradient') ? 'GRADIENT' : 'COLOR')
            : 'COLOR',
          background_value: selectedTemplate ? selectedTemplate.background : background,
          thumbnail_url: selectedTemplate?.coverImage || null,
          settings: {
            card_covers: true,
            voting: false,
            aging: false,
            calendar_feed: false,
            list_style: selectedTemplate?.listStyle || 'solid',
            card_style: selectedTemplate?.cardStyle || 'modern'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // 1.5 Set flag for Onboarding Guide if template used
      if (selectedTemplate) {
        localStorage.setItem(`flowboard_guide_pending_${board.id}`, selectedTemplate.id);
      }

      // 2. Provision Lists
      const listBlueprint = selectedTemplate ? selectedTemplate.lists : [
        { title: 'Getting Started', color: '#F8FAFC' },
        { title: 'Backlog', color: '#F1F5F9' },
        { title: 'In Progress', color: '#EFF6FF' },
        { title: 'Done', color: '#F0FDF4' }
      ];

      const { data: createdLists, error: listError } = await supabase.from('lists').insert(
        listBlueprint.map((list, index) => ({
          board_id: board.id,
          title: typeof list === 'string' ? list : list.title,
          color: typeof list === 'string' ? null : list.color,
          position: `a${index}`
        }))
      ).select();

      if (listError) throw listError;

      // 3. Provision Initial Cards from Blueprint
      if (selectedTemplate?.initialCards && createdLists) {
        const cardBlueprints = selectedTemplate.initialCards.map((card, index) => {
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
      handleClose();
      if (effectiveWorkspace?.slug) {
        navigate(`/w/${effectiveWorkspace.slug}/b/${board.id}`);
      } else {
        navigate(`/dashboard`);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!effectiveWorkspace && !loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-white rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <Layout size={40} />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-4 tracking-tighter">No Access Found</h2>
          <p className="text-text-secondary font-medium mb-8">You need to be part of a team (workspace) to initialize a new board project.</p>
          <button onClick={handleClose} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-8 animate-in fade-in duration-300 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Panoramic Wing 1: The Identity (Form) */}
        <div className="w-full md:w-[40%] px-12 py-8 flex flex-col justify-center bg-bg-secondary/40 border-r border-border-light relative overflow-hidden">
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-primary pointer-events-none">
            <Layout size={200} strokeWidth={1} />
          </div>

          <div className="relative z-10 space-y-6">
            <header className="space-y-4">
              <div className={`w-10 h-10 ${selectedTemplate?.color || 'bg-primary text-white'} rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center mb-6`}>
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tighter leading-[1.1] mb-2">
                Forge your <br />board.
              </h2>
              <p className="text-text-tertiary text-sm font-medium leading-relaxed max-w-[200px]">
                Initialize a strategic roadmap where your team executes mission-critical tasks.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Board Architecture</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Kinetic Engine 2.0"
                  className="w-full h-12 bg-white border border-border-light rounded-xl px-5 text-base font-black text-foreground focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all outline-none shadow-sm placeholder:text-text-tertiary/20"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {validationErrors.title && (
                  <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1 tracking-widest uppercase">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1 leading-none">Security Group</label>
                <div className="flex bg-white rounded-xl p-1 border border-border-light h-12">
                  {[
                    { id: 'PRIVATE', icon: Lock, label: 'Private' },
                    { id: 'WORKSPACE', icon: Users, label: 'Team' },
                    { id: 'PUBLIC', icon: Globe, label: 'Public' },
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setVisibility(type.id)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${visibility === type.id ? 'bg-primary text-white shadow-lg' : 'text-text-tertiary hover:bg-bg-secondary'}`}
                    >
                      <type.icon size={14} className={visibility === type.id ? 'animate-pulse' : ''} />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!title || loading}
                className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
              >
                {loading ? <span className="animate-pulse text-[10px]">Building...</span> : (
                  <>
                    <Zap size={14} className="fill-current" />
                    <span>Initialize Board</span>
                    <ChevronRight size={12} className="opacity-40 shadow-sm" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Panoramic Wing 2: The Visuals (Blueprints & Backgrounds) */}
        <div className="w-full md:w-[60%] px-12 py-8 flex flex-col bg-white relative">
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-foreground rounded-2xl transition-all"
          >
            <X size={24} />
          </button>

          <div className="h-full flex flex-col gap-6">
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-1">Visual DNA</h3>
                <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-normal">Define the chromatic identity of your command hub.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setBackground(c);
                    }}
                    className={`w-10 h-10 rounded-xl transition-all border-4 ${background === c && !selectedTemplate ? 'border-primary' : 'border-bg-secondary hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  >
                    {background === c && !selectedTemplate && <Check size={14} className="text-white mx-auto shadow-sm" strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-1">Strategic Blueprints</h3>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-normal underline decoration-primary/20 decoration-2 underline-offset-4">Accelerate with pre-configured project workflows.</p>
                </div>
                
                <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-xl border border-border-light/50 shadow-inner">
                  {[
                    { id: 'basic', label: 'Basic' },
                    { id: 'developer', label: 'Dev' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-white text-primary shadow-sm' : 'text-text-tertiary hover:bg-white/50'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TEMPLATES.filter(t => activeCategory === 'all' || t.category === activeCategory).map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTitle(`${template.name} - ${effectiveWorkspace.name}`);
                      setBackground(template.background);
                    }}
                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden ${selectedTemplate?.id === template.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-bg-secondary hover:border-border-light'}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-[14px] ${template.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        {template.icon ? <template.icon size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{template.name}</p>
                        <p className="text-[9px] font-bold text-text-tertiary uppercase opacity-60">Ready to Ship</p>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-4 right-4 text-primary">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <footer className="pt-8 border-t border-border-light flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-bg-secondary rounded-xl flex items-center justify-center text-text-tertiary">
                  <Layout size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-text-tertiary uppercase tracking-wider">Targeting:</p>
                  <p className="text-xs font-black text-primary">{effectiveWorkspace.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Cancel Launch
              </button>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateBoardModal;
