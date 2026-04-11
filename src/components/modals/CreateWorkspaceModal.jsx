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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex min-h-[540px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Visual Branding (Panoramic Wing) */}
        <div className="w-1/2 bg-brand-primary p-16 flex flex-col justify-between relative overflow-hidden">
           {/* Abstract Decorative Circles */}
           <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-white/5 blur-3xl" />
           <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-black/10 blur-3xl opacity-50" />
           
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center text-white mb-10 shadow-xl border border-white/10">
                 <Box size={32} />
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                Build your <br/>epic team.
              </h2>
              <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">
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

           {/* Large background Box Icon */}
           <div className="absolute bottom-[-10%] right-[-10%] opacity-10 text-white select-none pointer-events-none">
              <Box size={400} strokeWidth={1} />
           </div>
        </div>

        {/* Right Side: The Control Center (Panoramic Form) */}
        <div className="w-1/2 p-16 flex flex-col justify-center bg-white relative">
           <button 
             onClick={handleClose}
             className="absolute top-8 right-8 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-2xl transition-all"
           >
             <X size={24} />
           </button>

           <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-1">Identity</label>
                  <input 
                    autoFocus
                    required
                    placeholder="e.g. Acme Design Studio"
                    className="w-full h-16 bg-bg-secondary border-none rounded-3xl px-8 text-xl font-bold text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none placeholder:text-text-tertiary/30 shadow-inner"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-1">Philosophy (Optional)</label>
                  <textarea 
                    placeholder="Short description of your project scope..."
                    className="w-full h-32 bg-bg-secondary border-none rounded-3xl p-8 text-base font-medium text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none resize-none placeholder:text-text-tertiary/30 shadow-inner"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 p-4 bg-bg-secondary/40 rounded-[28px] border border-transparent hover:border-border-light transition-all group">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-brand-primary transition-colors">
                       <Globe size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Public URL</span>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-bg-secondary/40 rounded-[28px] border border-transparent hover:border-border-light transition-all group">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-brand-primary transition-colors">
                       <Users size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Team Access</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                   type="submit" 
                   disabled={!name || loading}
                   className="flex-1 h-16 bg-brand-primary text-white rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                 >
                   {loading ? (
                     <span className="animate-pulse">Building...</span>
                   ) : (
                     <>
                        <Sparkles size={18} className="fill-current group-hover:rotate-12 transition-transform" />
                        <span>Initialize Workspace</span>
                        <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-all" />
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
