import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Check, 
  Save, 
  Loader2, 
  Globe,
  Mail,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toggleModal } from '../../store/slices/uiSlice';
import { updateWorkspace } from '../../store/slices/workspaceSlice';

const WorkspaceSettingsModal = () => {
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.workspaces.activeWorkspace || state.workspaces.workspaces[0]);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'members' | 'invites'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // General Settings State
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [slug, setSlug] = useState(activeWorkspace?.slug || '');

  // Members State
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setSlug(activeWorkspace.slug);
      fetchMembersAndInvites();
    }
  }, [activeWorkspace]);

  const fetchMembersAndInvites = async () => {
    if (!activeWorkspace) return;
    setFetchingMembers(true);
    
    const [membersRes, invitesRes] = await Promise.all([
      supabase
        .from('workspace_members')
        .select('*, profiles(*)')
        .eq('workspace_id', activeWorkspace.id),
      supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
    ]);

    if (membersRes.data) setMembers(membersRes.data);
    if (invitesRes.data) setInvites(invitesRes.data);
    setFetchingMembers(false);
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('workspaces')
      .update({ name, slug })
      .eq('id', activeWorkspace.id)
      .select()
      .single();

    if (data) {
      dispatch(updateWorkspace(data));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    setLoading(false);
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return;
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', activeWorkspace.id)
      .eq('user_id', userId);
    
    if (!error) {
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    }
  };

  const updateMemberRole = async (userId, role) => {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', activeWorkspace.id)
      .eq('user_id', userId);
    
    if (!error) {
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role } : m));
    }
  };

  const cancelInvite = async (inviteId) => {
    const { error } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', inviteId);
    
    if (!error) {
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    }
  };

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'workspaceSettings', isOpen: false }));
  };

  if (!activeWorkspace) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex h-[600px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 bg-bg-secondary border-r border-border-light flex flex-col p-8">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20">
                 <Settings size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-text-primary">Settings</h2>
           </div>

           <nav className="space-y-2 flex-1">
             {[
               { id: 'general', label: 'General', icon: Globe },
               { id: 'members', label: 'Members', icon: Users },
               { id: 'invites', label: 'Invitations', icon: Mail },
             ].map(item => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white text-brand-primary shadow-lg ring-1 ring-black/5' : 'text-text-tertiary hover:text-text-primary hover:bg-white/50'}`}
               >
                 <item.icon size={16} />
                 <span>{item.label}</span>
               </button>
             ))}
           </nav>

           <button 
             onClick={handleClose}
             className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-red-500 transition-colors"
           >
              <X size={16} />
              <span>Close</span>
           </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
           <div className="p-10 h-full overflow-y-auto">
             <AnimatePresence mode="wait">
               {activeTab === 'general' && (
                 <motion.div 
                   key="general"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-10"
                 >
                    <header>
                       <h3 className="text-2xl font-black text-text-primary tracking-tighter">Team Configuration</h3>
                       <p className="text-sm text-text-tertiary mt-2">Manage your team's identity and custom access URL.</p>
                    </header>

                    <form onSubmit={handleUpdateWorkspace} className="space-y-6 max-w-md">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Workspace Name</label>
                          <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full h-12 bg-bg-secondary border-none rounded-2xl px-5 text-sm font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                            placeholder="Engineering Team"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Public Slug (URL)</label>
                          <div className="flex items-center gap-2 group">
                             <div className="h-12 bg-bg-secondary/50 rounded-2xl px-4 flex items-center text-[10px] font-black text-text-tertiary uppercase tracking-widest border border-transparent group-focus-within:border-brand-primary/20 transition-all">
                                flowboard.pro/w/
                             </div>
                             <input 
                               type="text" 
                               value={slug}
                               onChange={e => setSlug(e.target.value)}
                               className="flex-1 h-12 bg-bg-secondary border-none rounded-2xl px-5 text-sm font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                               placeholder="engineering"
                             />
                          </div>
                       </div>

                       <button 
                         type="submit"
                         disabled={loading || !name || !slug}
                         className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                       >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <Check size={14} /> : <Save size={14} />}
                          <span>{success ? 'Saved!' : 'Save Changes'}</span>
                       </button>
                    </form>
                 </motion.div>
               )}

               {activeTab === 'members' && (
                 <motion.div 
                   key="members"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-8"
                 >
                    <header className="flex items-center justify-between">
                       <div>
                          <h3 className="text-2xl font-black text-text-primary tracking-tighter">Team Directory</h3>
                          <p className="text-sm text-text-tertiary mt-2">Manage access and roles for all workspace collaborators.</p>
                       </div>
                       <button 
                         onClick={() => dispatch(toggleModal({ modalName: 'memberInvite', isOpen: true }))}
                         className="flex items-center gap-2 px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         <UserPlus size={14} />
                         Invite
                       </button>
                    </header>

                    <div className="space-y-3">
                       {fetchingMembers ? (
                         <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <Loader2 size={24} className="animate-spin mb-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Fetching team...</span>
                         </div>
                       ) : (
                         members.map(member => (
                           <div key={member.user_id} className="flex items-center gap-4 p-4 bg-bg-secondary/30 border border-transparent hover:border-border-light hover:bg-white rounded-[24px] transition-all group">
                              <div className="w-12 h-12 rounded-[18px] bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-primary/10">
                                 {(member.profiles?.full_name || member.profiles?.email || 'U')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold text-text-primary truncate">{member.profiles?.full_name || 'Anonymous User'}</p>
                                 <p className="text-xs text-text-tertiary truncate font-medium">{member.profiles?.email}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <select 
                                   value={member.role}
                                   onChange={(e) => updateMemberRole(member.user_id, e.target.value)}
                                   disabled={member.user_id === user?.id} // Cannot change own role here
                                   className="bg-white border border-border-light rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all appearance-none cursor-pointer"
                                 >
                                    <option value="OWNER">Owner</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MEMBER">Member</option>
                                 </select>
                                 {member.user_id !== user?.id && (
                                   <button 
                                     onClick={() => removeMember(member.user_id)}
                                     className="p-2.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                 )}
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'invites' && (
                 <motion.div 
                   key="invites"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-8"
                 >
                    <header>
                       <h3 className="text-2xl font-black text-text-primary tracking-tighter">Pending Invitations</h3>
                       <p className="text-sm text-text-tertiary mt-2">Active invites waiting for acceptance.</p>
                    </header>

                    <div className="space-y-3">
                       {invites.map(invite => (
                         <div key={invite.id} className="flex items-center gap-4 p-4 bg-bg-secondary/30 border border-border-light rounded-[24px]">
                            <div className="w-10 h-10 rounded-xl bg-white border border-border-light flex items-center justify-center text-text-tertiary shadow-sm">
                               <Mail size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-text-primary truncate">{invite.email}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-md">
                                     {invite.role}
                                  </span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">
                                     Sent 2 days ago
                                  </span>
                               </div>
                            </div>
                            <button 
                              onClick={() => cancelInvite(invite.id)}
                              className="px-4 py-2 bg-white border border-border-light text-[9px] font-black uppercase tracking-widest text-text-tertiary hover:text-red-500 hover:border-red-100 transition-all rounded-xl"
                            >
                               Revoke
                            </button>
                         </div>
                       ))}
                       {invites.length === 0 && (
                         <div className="py-20 text-center opacity-30 flex flex-col items-center">
                            <Mail size={48} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No pending invites</p>
                         </div>
                       )}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkspaceSettingsModal;
