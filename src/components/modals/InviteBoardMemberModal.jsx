import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UserPlus, Check, Search, Shield, Eye, Crown, Trash2,
  Users, Target, Zap, Fingerprint, ChevronRight, Mail,
  Users2,
  Settings2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ROLE_CONFIG = {
  ADMIN:    { label: 'Admin',    icon: Shield, color: 'text-purple-600 bg-purple-50' },
  MEMBER:   { label: 'Member',   icon: Check,  color: 'text-blue-600 bg-blue-50' },
  OBSERVER: { label: 'Observer', icon: Eye,    color: 'text-gray-600 bg-gray-100' },
};

const InviteBoardMemberModal = ({ boardId, onClose }) => {
  const { members: boardMembers, activeBoard } = useSelector(s => s.board);
  const activeWorkspaceId = useSelector(s => s.workspaces.activeWorkspace?.id);
  const { user } = useSelector(s => s.auth);

  const [search, setSearch] = useState('');
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [adding, setAdding] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loadingWs, setLoadingWs] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchWorkspaceMembers = async () => {
    if (fetched || !activeWorkspaceId) return;
    setLoadingWs(true);
    const { data } = await supabase
      .from('workspace_members')
      .select('user_id, role, profiles(id, full_name, email, avatar_url)')
      .eq('workspace_id', activeWorkspaceId);
    if (data) setWorkspaceMembers(data);
    setLoadingWs(false);
    setFetched(true);
  };

  useEffect(() => { fetchWorkspaceMembers(); }, []);

  const boardMemberIds = boardMembers?.map(m => m.user_id) || [];

  const filtered = workspaceMembers.filter(wm => {
    const name = wm.profiles?.full_name || wm.profiles?.email || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const addMember = async (wm) => {
    setAdding(wm.user_id);
    await supabase.from('board_members').insert({
      board_id: boardId,
      user_id: wm.user_id,
      role: 'MEMBER'
    });
    setAdding(null);
  };

  const removeMember = async (userId) => {
    if (userId === user?.id) return; // Prevention
    setRemoving(userId);
    await supabase.from('board_members').delete()
      .eq('board_id', boardId)
      .eq('user_id', userId);
    setRemoving(null);
  };

  const updateRole = async (userId, role) => {
    await supabase.from('board_members')
      .update({ role })
      .eq('board_id', boardId)
      .eq('user_id', userId);
  };

  const getInitials = (profile) => {
    const name = profile?.full_name || profile?.email || '?';
    return name[0].toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-[56px] shadow-[0_48px_120px_-24px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-[720px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Panoramic Wing 1: Board Identity & Security Status */}
        <div className="w-[35%] bg-bg-secondary/40 border-r border-border-light p-14 flex flex-col justify-between relative overflow-hidden">
           {/* Abstract Identity */}
           <div className="absolute top-[-5%] left-[-5%] opacity-[0.03] text-brand-primary pointer-events-none">
              <Users2 size={320} />
           </div>

           <div className="relative z-10 space-y-12">
              <header className="space-y-4">
                 <div className="w-14 h-14 bg-brand-primary rounded-[22px] shadow-xl shadow-brand-primary/20 flex items-center justify-center text-white mb-8">
                    <Users size={28} />
                 </div>
                 <h2 className="text-4xl font-black text-text-primary tracking-tighter leading-none mb-2 underline decoration-brand-primary/20 decoration-4 underline-offset-8">
                   Board Members
                 </h2>
                 <p className="text-text-tertiary text-lg font-medium tracking-tight">
                    Synchronize access for the <span className="text-brand-primary font-black">"{activeBoard?.title}"</span> project environment.
                 </p>
              </header>

              <div className="space-y-6">
                 <div className="p-6 bg-white rounded-[32px] shadow-sm border border-border-light flex items-center gap-5 group hover:border-brand-primary/30 transition-all">
                    <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary font-black text-xs">
                       {boardMembers?.length}
                    </div>
                    <div className="text-left leading-none">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Active Personnel</p>
                       <p className="text-xs font-black text-text-primary">Enlisted Operators</p>
                    </div>
                 </div>

                 <div className="p-6 bg-white rounded-[32px] shadow-sm border border-border-light flex items-center gap-5 group hover:border-indigo-500/30 transition-all">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                       {ROLE_CONFIG.ADMIN.label[0]}
                    </div>
                    <div className="text-left leading-none">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Security Level</p>
                       <p className="text-xs font-black text-text-primary">Multi-Admin Protocol</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="relative z-10">
              <button 
                onClick={onClose}
                className="flex items-center gap-4 px-8 py-4 bg-white border border-border-light text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-red-500 hover:border-red-100 transition-all rounded-[20px] shadow-sm"
              >
                 <X size={14} />
                 <span>Terminate Link</span>
              </button>
           </div>
        </div>

        {/* Panoramic Wing 2: Roster & Invitation Console */}
        <div className="w-[65%] flex flex-col bg-white">
           <div className="p-14 h-full flex flex-col space-y-10">
              {/* Search Control Bar */}
              <div className="relative group">
                 <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" />
                 <input
                    autoFocus
                    placeholder="Search personnel by name or email hash..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-16 pl-16 pr-8 bg-bg-secondary border-none rounded-[28px] text-base font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner placeholder:text-text-tertiary/40"
                 />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-10">
                 {/* Current Roster Section */}
                 <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">Current Roster</h3>
                       <span className="text-[9px] font-bold text-brand-primary uppercase">Encrypted</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {boardMembers?.map(bm => (
                          <div key={bm.user_id} className="flex items-center gap-5 p-4 bg-bg-secondary/30 border border-transparent hover:border-border-light hover:bg-white rounded-[28px] transition-all group">
                             <div className="w-12 h-12 rounded-[18px] bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-lg">
                                {getInitials(bm.profiles)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-text-primary truncate tracking-tight">{bm.profiles?.full_name || 'Anonymous Operative'}</p>
                                <p className="text-[10px] text-text-tertiary font-bold truncate opacity-60 uppercase">{bm.profiles?.email}</p>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="relative">
                                   <select
                                      defaultValue={bm.role}
                                      onChange={e => updateRole(bm.user_id, e.target.value)}
                                      className="bg-white border border-border-light rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all appearance-none cursor-pointer pr-10"
                                      disabled={bm.user_id === user?.id}
                                   >
                                      <option value="ADMIN">Command</option>
                                      <option value="MEMBER">Operative</option>
                                      <option value="OBSERVER">Analyst</option>
                                   </select>
                                   <Settings2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                                </div>
                                {bm.user_id !== user?.id && (
                                   <button
                                      onClick={() => removeMember(bm.user_id)}
                                      className="p-3 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>

                 {/* Expansion Section: Workspace Directory */}
                 {filtered.length > 0 && (
                    <section className="space-y-4 pt-4 border-t border-border-light/50">
                       <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Workspace Hub</h3>
                          <span className="text-[9px] font-bold text-indigo-400 uppercase">Available for Enlistment</span>
                       </div>
                       <div className="grid grid-cols-1 gap-2">
                          {filtered.map(wm => {
                             const isOnBoard = boardMemberIds.includes(wm.user_id);
                             return (
                                <div key={wm.user_id} className="flex items-center gap-5 p-4 bg-bg-secondary/10 border border-transparent hover:border-indigo-100 hover:bg-white rounded-[28px] transition-all group">
                                   <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-text-tertiary font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                      {getInitials(wm.profiles)}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black text-text-primary truncate tracking-tight">{wm.profiles?.full_name || 'Team Agent'}</p>
                                      <p className="text-[9px] text-text-tertiary font-bold truncate opacity-50 uppercase tracking-tighter">{wm.profiles?.email}</p>
                                   </div>
                                   {isOnBoard ? (
                                      <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl flex items-center gap-2">
                                         <Check size={12} strokeWidth={3} />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Enlisted</span>
                                      </div>
                                   ) : (
                                      <button
                                         onClick={() => addMember(wm)}
                                         disabled={adding === wm.user_id}
                                         className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                      >
                                         <UserPlus size={14} />
                                         <span>{adding === wm.user_id ? 'Adding...' : 'Add'}</span>
                                      </button>
                                   )}
                                </div>
                             );
                          })}
                       </div>
                    </section>
                 )}

                 {fetchingMembers && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                       <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Authenticating Directory...</span>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteBoardMemberModal;
