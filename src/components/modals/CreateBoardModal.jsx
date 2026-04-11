import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Layout, Globe, Lock, Palette } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { setActiveBoard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TemplateGallery, { TEMPLATES } from './TemplateGallery';
import { Sparkles, Check } from 'lucide-react';
import { useEffect } from 'react';

const CreateBoardModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workspaces, activeWorkspace } = useSelector((state) => state.workspaces);
  const { modals, modalData } = useSelector((state) => state.ui);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('WORKSPACE');
  const [background, setBackground] = useState('#0052CC');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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
    '#0052CC', '#0747A6', '#0065FF', '#2684FF', 
    '#00875A', '#36B37E', '#BF2600', '#DE350B', 
    '#FF8B00', '#FFAB00', '#5243AA', '#6554C0'
  ];

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'createBoard', isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || loading || !effectiveWorkspace) return;

    setLoading(true);

    try {
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

      // 2. Provision Lists (either from template or standard)
      const listBlueprint = selectedTemplate ? selectedTemplate.lists : ['Backlog', 'In Progress', 'Done'];
      
      await Promise.all(listBlueprint.map((ltitle, index) => 
        supabase.from('lists').insert({
          board_id: board.id,
          title: ltitle,
          position: `a${index}`
        })
      ));

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

  const handleApplyTemplate = async (template) => {
    if (loading || !effectiveWorkspace) return;
    setLoading(true);

    try {
      // 1. Create Board
      const { data: board, error } = await supabase
        .from('boards')
        .insert({
          title: `${template.name} - ${effectiveWorkspace.name}`,
          workspace_id: effectiveWorkspace.id,
          created_by: user.id,
          visibility: 'WORKSPACE',
          background_type: template.background.includes('gradient') ? 'GRADIENT' : 'COLOR',
          background_value: template.background,
          settings: {
            card_covers: true,
            voting: false,
            aging: false,
            list_style: template.listStyle,
            card_style: template.cardStyle
          }
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Provision Lists from Blueprint
      await Promise.all(template.lists.map((ltitle, index) => 
        supabase.from('lists').insert({
          board_id: board.id,
          title: ltitle,
          position: `a${index}`
        })
      ));

      dispatch(setActiveBoard(board));
      setShowTemplates(false);
      handleClose();
      if (effectiveWorkspace?.slug) {
        navigate(`/w/${effectiveWorkspace.slug}/b/${board.id}`);
      } else {
        navigate(`/dashboard`);
      }
    } catch (err) {
      console.error('Template Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If no active workspace is selected, try to use the first one available
  const effectiveWorkspace = activeWorkspace || (workspaces && workspaces[0]);

  if (!effectiveWorkspace && !loading) {
    // We can't create a board without a workspace
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-white rounded-[40px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6">
            <Layout size={40} />
          </div>
          <h2 className="text-2xl font-black text-text-primary mb-4">No Team Found</h2>
          <p className="text-text-secondary font-medium mb-8">You need to be part of a team (workspace) to create a board.</p>
          <button 
            onClick={handleClose}
            className="btn btn-primary w-full !h-14 !rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.4)] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-12">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-primary">
            <Layout size={240} strokeWidth={1} />
          </div>

          <div className="flex items-center justify-between mb-10 relative">
            <div className="p-4 bg-brand-primary/10 rounded-3xl text-brand-primary">
              <Layout size={32} />
            </div>
            <button 
              onClick={handleClose}
              className="p-3 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-12 relative">
            <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-4">Create board</h2>
            {selectedTemplate ? (
              <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl animate-in slide-in-from-left-4 duration-500">
                <div className={`p-2 rounded-xl scale-75 ${selectedTemplate.color} text-white`}>
                  {selectedTemplate.icon ? <selectedTemplate.icon size={20} /> : <Layout size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-0.5">Applied Blueprint</p>
                  <p className="text-xs font-bold text-text-primary">{selectedTemplate.name}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 text-text-tertiary hover:text-danger"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="text-text-secondary leading-relaxed font-medium">A board is where you and your team visualize your workflow, from initial idea to successful shipment.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Board Title</label>
              <input 
                autoFocus
                required
                placeholder="e.g. Product Roadmap 2026"
                className="w-full h-16 bg-bg-secondary border-none rounded-3xl px-8 text-lg font-bold focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none placeholder:text-text-tertiary/50"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Visibility</label>
                <div className="flex bg-bg-secondary rounded-[20px] p-1 h-12">
                  <button 
                    type="button"
                    onClick={() => setVisibility('WORKSPACE')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-[16px] text-[10px] font-bold transition-all ${visibility === 'WORKSPACE' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-tertiary'}`}
                  >
                    <Globe size={14} />
                    <span>Workspace</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVisibility('PRIVATE')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-[16px] text-[10px] font-bold transition-all ${visibility === 'PRIVATE' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-tertiary'}`}
                  >
                    <Lock size={14} />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1 flex items-center gap-2">
                    <Palette size={12} /> Background
                 </label>
                 <div className="flex bg-bg-secondary rounded-[20px] p-1 h-12 items-center justify-center gap-2 overflow-x-auto">
                    {colors.slice(0, 5).map(c => (
                      <button 
                        key={c}
                        type="button"
                        onClick={() => setBackground(c)}
                        className={`w-6 h-6 rounded-full shrink-0 transition-all border-2 ${background === c ? 'border-brand-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                  type="button"
                  onClick={() => setShowTemplates(true)}
                  className="w-full h-16 bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 rounded-[30px] flex items-center justify-center gap-3 text-brand-primary hover:bg-brand-primary/10 transition-all font-black uppercase tracking-widest text-[10px]"
                 >
                    <Sparkles size={18} />
                    Start from blueprint
                 </button>
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              <button 
                type="button" 
                onClick={handleClose}
                className="btn btn-secondary !flex-1 !h-16 !rounded-3xl font-black uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!title || loading}
                className="btn btn-primary !flex-1 !h-16 !rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Board'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <TemplateGallery 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        onSelect={handleApplyTemplate}
      />
    </div>
  );
};

export default CreateBoardModal;
