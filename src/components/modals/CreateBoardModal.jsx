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
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
    if (!title || loading || !effectiveWorkspace) return;

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
        <div className="w-full max-w-md bg-white rounded-[48px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6">
            <Layout size={40} />
          </div>
          <h2 className="text-2xl font-black text-text-primary mb-4 tracking-tighter">No Access Found</h2>
          <p className="text-text-secondary font-medium mb-8">You need to be part of a team (workspace) to initialize a new board project.</p>
          <button onClick={handleClose} className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-8 animate-in fade-in duration-300 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-7xl bg-white rounded-[56px] shadow-[0_48px_120px_-24px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row min-h-[680px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Panoramic Wing 1: The Identity (Form) */}
        <div className="w-full md:w-[40%] p-16 flex flex-col justify-center bg-bg-secondary/40 border-r border-border-light relative overflow-hidden">
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-brand-primary pointer-events-none">
            <Layout size={320} strokeWidth={1} />
          </div>

          <div className="relative z-10 space-y-12">
            <header className="space-y-4">
              <div className="w-14 h-14 bg-brand-primary rounded-[20px] shadow-xl shadow-brand-primary/20 flex items-center justify-center text-white mb-6">
                <Target size={28} />
              </div>
              <h2 className="text-5xl font-black text-text-primary tracking-tighter leading-[1] mb-4">
                Forge your <br />workspace.
              </h2>
              <p className="text-text-tertiary text-lg font-medium leading-relaxed max-w-[280px]">
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
                  className="w-full h-16 bg-white border border-border-light rounded-3xl px-8 text-lg font-black text-text-primary focus:border-brand-primary/50 focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1 leading-none">Security Group</label>
                <div className="flex bg-white rounded-2xl p-1 border border-border-light h-14">
                  {[
                    { id: 'PRIVATE', icon: Lock, label: 'Private' },
                    { id: 'WORKSPACE', icon: Users, label: 'Team' },
                    { id: 'PUBLIC', icon: Globe, label: 'Public' },
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setVisibility(type.id)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${visibility === type.id ? 'bg-brand-primary text-white shadow-lg' : 'text-text-tertiary hover:bg-bg-secondary'}`}
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
                className="w-full h-16 bg-brand-primary text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <span className="animate-pulse">Provisioning...</span> : (
                  <>
                    <Zap size={18} className="fill-current" />
                    <span>Launch Project</span>
                    <ChevronRight size={16} className="opacity-40" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Panoramic Wing 2: The Visuals (Blueprints & Backgrounds) */}
        <div className="w-full md:w-[60%] p-16 flex flex-col bg-white relative">
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-2xl transition-all"
          >
            <X size={24} />
          </button>

          <div className="h-full flex flex-col gap-12">
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary mb-1">Visual DNA</h3>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-normal">Define the chromatic identity of your command hub.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setBackground(c);
                    }}
                    className={`w-12 h-12 rounded-[18px] transition-all border-4 ${background === c && !selectedTemplate ? 'border-brand-primary scale-110 shadow-lg' : 'border-bg-secondary hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  >
                    {background === c && !selectedTemplate && <Check size={18} className="text-white mx-auto shadow-sm" strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary mb-1">Strategic Blueprints</h3>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-normal underline decoration-brand-primary/20 decoration-2 underline-offset-4">Accelerate with pre-configured project workflows.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TEMPLATES.slice(0, 6).map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTitle(`${template.name} - ${effectiveWorkspace.name}`);
                      setBackground(template.background);
                    }}
                    className={`group relative p-6 rounded-[32px] border-2 text-left transition-all overflow-hidden ${selectedTemplate?.id === template.id ? 'border-brand-primary bg-brand-primary/5 ring-4 ring-brand-primary/5' : 'border-bg-secondary hover:border-border-light'}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-[14px] ${template.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        {template.icon ? <template.icon size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-text-primary uppercase tracking-tight">{template.name}</p>
                        <p className="text-[9px] font-bold text-text-tertiary uppercase opacity-60">Ready to Ship</p>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-4 right-4 text-brand-primary">
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
                  <Layout size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-text-tertiary uppercase tracking-wider">Targeting:</p>
                  <p className="text-xs font-black text-brand-primary">{effectiveWorkspace.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-8 py-4 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
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
