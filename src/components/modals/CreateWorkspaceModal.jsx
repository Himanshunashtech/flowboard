import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Box, Globe, Shield, Sparkles } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { addWorkspace } from '../../store/slices/workspaceSlice';
import { supabase } from '../../lib/supabase';

const CreateWorkspaceModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'createWorkspace', isOpen: false }));
  };

  const generateSlug = (val) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    let slug = generateSlug(name);

    try {
      // 1. Insert Workspace
      let { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      // Handle duplicate slug (409 Conflict)
      if (wsError && wsError.code === '23505') {
        const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        const { data: retryData, error: retryError } = await supabase
          .from('workspaces')
          .insert({
            name,
            description,
            slug: uniqueSlug,
            owner_id: user.id
          })
          .select()
          .single();
        
        ws = retryData;
        wsError = retryError;
      }

      if (wsError) throw wsError;

      dispatch(addWorkspace(ws));
      handleClose();
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert(error.message || 'Failed to create workspace. Please try a different name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-12">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-primary">
            <Box size={240} strokeWidth={1} />
          </div>

          <div className="flex items-center justify-between mb-10 relative">
            <div className="p-4 bg-brand-primary/10 rounded-3xl text-brand-primary">
              <Box size={32} />
            </div>
            <button 
              onClick={handleClose}
              className="p-3 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-12 relative">
            <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-4">Create team</h2>
            <p className="text-text-secondary leading-relaxed">Boost your productivity by grouping your boards, members, and automations into a dedicated team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Team Name</label>
              <input 
                autoFocus
                required
                placeholder="e.g. Acme Design Team"
                className="w-full h-16 bg-bg-secondary border-none rounded-3xl px-8 text-lg font-bold focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none placeholder:text-text-tertiary/50"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Description (Optional)</label>
              <textarea 
                placeholder="What does this team focus on?"
                className="w-full h-32 bg-bg-secondary border-none rounded-3xl p-8 text-base font-medium focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none resize-none placeholder:text-text-tertiary/50"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 text-xs font-bold text-text-tertiary">
              <div className="flex items-center gap-3 p-4 bg-bg-secondary/50 rounded-2xl">
                <Globe size={16} />
                <span>Unique shareable URL</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-bg-secondary/50 rounded-2xl">
                <Shield size={16} />
                <span>Private by default</span>
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
                disabled={!name || loading}
                className="btn btn-primary !flex-1 !h-16 !rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 disabled:opacity-50"
              >
                {loading ? 'Creating...' : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="fill-current" />
                    <span>Create Team</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
