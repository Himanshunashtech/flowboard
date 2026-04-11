import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Settings, Palette, Globe, Lock, Users, Archive, Trash2, Check, ChevronRight, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { updateBoard } from '../../store/slices/boardSlice';
import { compressImage } from '../../lib/imageUtils';
import BoardCustomFields from './BoardCustomFields';
import BoardIntegrations from './BoardIntegrations';

const GRADIENTS = [
  { name: 'Oceanic', value: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' },
  { name: 'Royal', value: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #2AF598 0%, #009EFD 100%)' },
  { name: 'Deep Purple', value: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)' },
];

const COLORS = [
  { name: 'Brand', value: '#0052CC' },
  { name: 'Neutral', value: '#F4F5F7' },
  { name: 'Success', value: '#36B37E' },
  { name: 'Warning', value: '#FFab00' },
  { name: 'Danger', value: '#FF5630' },
  { name: 'Info', value: '#00B8D9' },
];

const PATTERNS = [
  { name: 'Circuit', value: 'url("https://www.transparenttextures.com/patterns/circuit-board.png")' },
  { name: 'Carbon', value: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' },
  { name: 'Dots', value: 'url("https://www.transparenttextures.com/patterns/diagmonds-light.png")' },
  { name: 'Fiber', value: 'url("https://www.transparenttextures.com/patterns/binding-dark.png")' },
  { name: 'Grid', value: 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")' },
  { name: 'Lines', value: 'url("https://www.transparenttextures.com/patterns/diagonal-striped-brick.png")' },
];


const BoardSettingsDrawer = ({ board, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = React.useRef(null);

  const updateSettings = async (updates) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', board.id)
      .select()
      .single();

    if (data) {
      dispatch(updateBoard(data));
    }
    setLoading(false);
  };

  const handleArchive = async () => {
    await updateSettings({ is_archived: !board.is_archived });
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure? This action is permanent.')) return;
    setLoading(true);
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', board.id);
    
    if (error) {
      console.error('Board deletion failed:', error);
      alert('Failed to delete board.');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };
  
  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        fileToUpload = await compressImage(file, 100);
      } finally {
        setIsCompressing(false);
      }
    } else if (file.size > 102400) {
      alert('File too large (max 100 KB).');
      return;
    }

    setLoading(true);
    try {
      const fileExt = fileToUpload.name ? fileToUpload.name.split('.').pop() : 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${board.workspace_id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('board-backgrounds')
        .upload(filePath, fileToUpload);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('board-backgrounds')
        .getPublicUrl(filePath);
        
      await updateSettings({ background_type: 'IMAGE', background_value: publicUrl });
    } catch (err) {
      console.error('BG upload failed:', err);
      alert('Failed to upload background.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[300] border-l border-border-light flex flex-col"
    >
      <div className="p-6 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bg-secondary rounded-xl text-text-primary">
            <Settings size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-text-primary">Board Settings</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {/* Appearance */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary">
            <Palette size={14} />
            <span>Appearance</span>
          </div>
          
          <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Gradients</p>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g.name}
                onClick={() => updateSettings({ background_type: 'GRADIENT', background_value: g.value })}
                className="aspect-video rounded-lg relative overflow-hidden group border-2 border-transparent hover:border-brand-primary transition-all"
                style={{ background: g.value }}
              >
                {board.background_value === g.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1 mt-4">Solid Colors</p>
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => updateSettings({ background_type: 'COLOR', background_value: c.value })}
                className="aspect-video rounded-lg relative border-2 border-transparent hover:border-brand-primary transition-all shadow-sm"
                style={{ backgroundColor: c.value }}
              >
                {board.background_value === c.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} className={c.value === '#F4F5F7' ? 'text-text-primary' : 'text-white'} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1 mt-4">Textures & Patterns</p>
          <div className="grid grid-cols-3 gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.name}
                onClick={() => updateSettings({ background_type: 'IMAGE', background_value: p.value })}
                className={`aspect-video rounded-lg relative border-2 transition-all bg-bg-secondary ${board.background_value === p.value ? 'border-brand-primary shadow-lg scale-[1.05]' : 'border-transparent hover:border-border-light'}`}
                style={{ backgroundImage: p.value }}
              >
                {board.background_value === p.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10">
                    <Check size={16} className="text-text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1 mt-6">Custom Image</p>
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleBackgroundUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isCompressing}
              className={`w-full aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group overflow-hidden
                ${board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) 
                  ? 'border-brand-primary bg-brand-primary/10' 
                  : 'border-border-medium hover:border-brand-primary hover:bg-bg-secondary'}`}
              style={board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) ? { 
                backgroundImage: board.background_value,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              {(isCompressing || loading) ? (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  {isCompressing ? (
                    <>
                      <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary animate-pulse">Optimizing...</span>
                    </>
                  ) : (
                    <Loader2 size={24} className="text-brand-primary animate-spin" />
                  )}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center gap-2 ${board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) ? 'bg-white/80 p-4 rounded-xl shadow-lg backdrop-blur-sm mx-4' : ''}`}>
                  <Plus size={20} className={board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) ? 'text-brand-primary' : 'text-text-tertiary group-hover:text-brand-primary'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center ${board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) ? 'text-brand-primary' : 'text-text-tertiary group-hover:text-brand-primary'}`}>
                    {board.background_type === 'IMAGE' && !PATTERNS.some(p => p.value === board.background_value) ? 'Change Background' : 'Upload Custom Image'}
                  </span>
                </div>
              )}
            </button>
          </div>
        </section>

        {/* Custom Fields */}
        <BoardCustomFields boardId={board.id} />

        {/* GitHub Integrations */}
        <BoardIntegrations boardId={board.id} />

        {/* Visibility */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary">
            <Globe size={14} />
            <span>Visibility</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'PRIVATE', label: 'Private', icon: Lock, desc: 'Only board members can see this.' },
              { id: 'WORKSPACE', label: 'Workspace', icon: Users, desc: 'Everyone in the workspace can see this.' },
              { id: 'PUBLIC', label: 'Public', icon: Globe, desc: 'Anyone with the link can view.' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => updateSettings({ visibility: v.id })}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  board.visibility === v.id 
                  ? 'border-brand-primary bg-brand-primary/5' 
                  : 'border-bg-secondary hover:border-border-light'
                }`}
              >
                <div className={`p-2 rounded-xl ${board.visibility === v.id ? 'bg-brand-primary text-white' : 'bg-white text-text-tertiary shadow-sm'}`}>
                  <v.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold leading-none mb-1 ${board.visibility === v.id ? 'text-brand-primary' : 'text-text-primary'}`}>{v.label}</p>
                  <p className="text-[10px] text-text-tertiary font-medium">{v.desc}</p>
                </div>
                {board.visibility === v.id && <Check size={14} className="text-brand-primary" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-6 border-t border-border-light">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary">
            <Archive size={14} />
            <span>Archive & Actions</span>
          </div>
          
          <button 
            onClick={handleArchive}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-bg-secondary hover:bg-bg-tertiary transition-all group"
          >
            <div className="flex items-center gap-3">
              <Archive size={18} className="text-text-tertiary group-hover:text-text-secondary" />
              <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                {board.is_archived ? 'Restore Board' : 'Archive Board'}
              </span>
            </div>
            <ChevronRight size={14} className="text-text-tertiary" />
          </button>

          {user?.id === board?.created_by && !showDeleteConfirm && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-danger/20 hover:border-danger/50 hover:bg-danger/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-danger/60 group-hover:text-danger" />
                <span className="text-xs font-bold text-danger/80 group-hover:text-danger">Delete Board</span>
              </div>
              <ChevronRight size={14} className="text-danger/40" />
            </button>
          )}

          {user?.id === board?.created_by && showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-danger/5 border-2 border-danger space-y-4 animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-2 text-danger">
                 <AlertTriangle size={18} />
                 <p className="text-xs font-black uppercase tracking-tight">Are you sure?</p>
               </div>
               <p className="text-[11px] text-danger/80 font-medium leading-relaxed">
                 Deleting a board is permanent and cannot be undone. All lists, cards, and activity will be lost.
               </p>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-text-primary"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={loading}
                   className="flex-1 py-2 bg-danger text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger/20 disabled:opacity-50"
                 >
                   {loading ? 'Deleting...' : 'Delete Forever'}
                 </button>
               </div>
            </div>
          )}
        </section>
      </div>

      <div className="p-6 bg-bg-secondary/30 text-center">
        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Board ID: {board.id.slice(0, 8)}...</p>
      </div>
    </motion.div>
  );
};

export default BoardSettingsDrawer;
