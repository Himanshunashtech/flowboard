import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Box, Globe, Shield, Sparkles, ChevronRight, Users, Zap } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { addWorkspace } from '../../store/slices/workspaceSlice';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

const CreateWorkspaceModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
    if (!name.trim()) {
      setValidationErrors({ name: 'Workspace name is required' });
      return;
    }

    const slug = generateSlug(name);
    setValidationErrors({});

    setLoading(true);

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Visual Branding (Panoramic Wing) */}
        <div className="w-1/2 bg-primary px-12 py-10 flex flex-col justify-between relative overflow-hidden">
           {/* Abstract Decorative Circles */}
           <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-white/5 blur-3xl" />
           <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-black/10 blur-3xl opacity-50" />
           
           <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-white mb-6 shadow-xl border border-white/10">
                 <Box size={20} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter leading-[1.1] mb-3">
                Build your <br/>epic team.
              </h2>
              <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[200px]">
                Consolidate your boards, members, and automations into a high-performance workspace.
              </p>
           </div>

           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                 <Zap size={14} className="fill-current text-white/20" />
                 <span>Kinetic Workspace Logic</span>
              </div>
              <div className="h-1 w-24 bg-white/20 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '60%' }}
                   transition={{ duration: 1.5 }}
                   className="h-full bg-white" 
                 />
              </div>
           </div>

           <div className="absolute bottom-[-10%] right-[-10%] opacity-10 text-white select-none pointer-events-none">
              <Box size={160} strokeWidth={1} />
           </div>
        </div>

        {/* Right Side: The Control Center (Panoramic Form) */}
        <div className="w-1/2 px-12 py-10 flex flex-col justify-center bg-white relative">
           <button 
             onClick={handleClose}
             className="absolute top-8 right-8 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-foreground rounded-2xl transition-all"
           >
             <X size={24} />
           </button>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-1">Identity</label>
                  <input 
                    autoFocus
                    required
                    placeholder="e.g. Acme Design Studio"
                    className="w-full h-12 bg-bg-secondary border-none rounded-xl px-5 text-base font-bold text-foreground focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all outline-none placeholder:text-text-tertiary/30 shadow-inner"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  {validationErrors.name && (
                    <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1 tracking-widest uppercase">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-1">Philosophy (Optional)</label>
                  <textarea 
                    placeholder="Short description of your project scope..."
                    className="w-full h-24 bg-bg-secondary border-none rounded-2xl p-6 text-sm font-medium text-foreground focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-text-tertiary/30 shadow-inner"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center gap-3 p-3 bg-bg-secondary/40 rounded-xl border border-transparent hover:border-border-light transition-all group">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:text-primary transition-colors">
                       <Globe size={14} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Public URL</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-bg-secondary/40 rounded-xl border border-transparent hover:border-border-light transition-all group">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:text-primary transition-colors">
                       <Users size={14} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Team Access</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-2">
                  <button 
                    type="submit" 
                    disabled={!name || loading}
                    className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {loading ? (
                      <span className="animate-pulse text-[10px]">Building...</span>
                    ) : (
                      <>
                         <Sparkles size={14} className="fill-current group-hover:rotate-12 transition-transform" />
                         <span>Initialize Workspace</span>
                         <ChevronRight size={12} className="opacity-40 group-hover:translate-x-1 transition-all" />
                      </>
                    )}
                  </button>
              </div>
           </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateWorkspaceModal;
