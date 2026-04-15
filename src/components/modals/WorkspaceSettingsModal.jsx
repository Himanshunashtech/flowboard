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
  MoreVertical,
  AlertTriangle,
  ChevronRight,
  Target,
  Zap,
  Fingerprint,
  Plus,
  Hash
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toggleModal } from '../../store/slices/uiSlice';
import { updateWorkspace, deleteWorkspace } from '../../store/slices/workspaceSlice';
import { useNavigate } from 'react-router-dom';

const WorkspaceSettingsModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.workspaces.activeWorkspace || state.workspaces.workspaces[0]);
  const { user } = useSelector((state) => state.auth);
  const { modals, modalData } = useSelector((state) => state.ui);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'members' | 'invites'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    if (modalData?.workspaceSettings?.tab) {
      setActiveTab(modalData.workspaceSettings.tab);
    }
  }, [modalData]);

  // General Settings State
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [slug, setSlug] = useState(activeWorkspace?.slug || '');

  // Members State
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  // Board Assignment State
  const [selectedMember, setSelectedMember] = useState(null);
  const [allBoards, setAllBoards] = useState([]);
  const [memberBoardIds, setMemberBoardIds] = useState([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  // Permission Logic
  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isWorkspaceOwner = activeWorkspace?.owner_id === user?.id;
  const isAdmin = currentUserMember?.role === 'ADMIN' || currentUserMember?.role === 'OWNER' || isWorkspaceOwner;
  const isOwner = currentUserMember?.role === 'OWNER' || isWorkspaceOwner;

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setSlug(activeWorkspace.slug);
      fetchMembersAndInvites();
      fetchAllWorkspaceBoards();
    }
  }, [activeWorkspace]);

  useEffect(() => {
    // If not admin, force to members tab
    if (currentUserMember && !isAdmin) {
      setActiveTab('members');
    }
  }, [currentUserMember, isAdmin]);

  const fetchAllWorkspaceBoards = async () => {
    const { data } = await supabase
      .from('boards')
      .select('id, title, visibility')
      .eq('workspace_id', activeWorkspace.id);
    if (data) setAllBoards(data);
  };

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

  const removeMember = async (memberUserId) => {
    if (!isAdmin) return;
    if (memberUserId === user?.id) return; // Cannot remove self here

    if (!window.confirm('Are you sure you want to remove this member? They will lose all access immediately.')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', memberUserId);

      if (error) throw error;

      // Update local state
      setMembers(members.filter(m => m.user_id !== memberUserId));
    } catch (err) {
      console.error('Removal Error:', err);
      alert('Failed to remove member.');
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('user_id', memberId)
        .eq('workspace_id', activeWorkspace.id);

      if (error) throw error;

      // Update local state
      setMembers(members.map(m => 
        m.user_id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (err) {
      console.error('Update Role Error:', err);
      alert('Failed to update member role.');
    }
  };

  const toggleBoardAssignment = async (boardId) => {
    if (!selectedMember) return;
    
    const isAssigned = memberBoardIds.includes(boardId);
    
    try {
      if (isAssigned) {
        await supabase
          .from('board_members')
          .delete()
          .eq('board_id', boardId)
          .eq('user_id', selectedMember.user_id);
        
        setMemberBoardIds(prev => prev.filter(id => id !== boardId));
      } else {
        await supabase
          .from('board_members')
          .insert({
            board_id: boardId,
            user_id: selectedMember.user_id,
            role: 'MEMBER'
          });
        
        setMemberBoardIds(prev => [...prev, boardId]);
      }
    } catch (err) {
      console.error('Assignment Error:', err);
    }
  };

  const handleOpenAssignments = async (member) => {
    setSelectedMember(member);
    const { data } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', member.user_id);
    
    if (data) {
      setMemberBoardIds(data.map(d => d.board_id));
    }
  };

  const handleDeleteWorkspace = async () => {
    if (confirmName !== activeWorkspace.name) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', activeWorkspace.id);

      if (error) throw error;

      dispatch(deleteWorkspace(activeWorkspace.id));
      handleClose();
      navigate('/dashboard');
    } catch (err) {
      console.error('Deletion Error:', err);
      alert('Failed to delete workspace. Ensure you are the owner.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'workspaceSettings', isOpen: false }));
  };

  if (!activeWorkspace) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-[56px] shadow-[0_48px_120px_-24px_rgba(0,0,0,0.4)] overflow-hidden flex h-[720px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Panoramic Sidebar (The Control Wing) */}
        <div className="w-80 bg-bg-secondary/40 border-r border-border-light flex flex-col p-12 relative overflow-hidden">
           {/* Abstract Identity */}
           <div className="absolute top-[-5%] left-[-5%] opacity-[0.03] text-brand-primary pointer-events-none">
              <Settings size={280} />
           </div>

           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-14">
                 <div className="w-12 h-12 bg-brand-primary rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-brand-primary/20">
                    <Fingerprint size={24} />
                 </div>
                 <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Console</h2>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase leading-none mt-1">v4.0.01</p>
                 </div>
              </div>

              <nav className="space-y-3 flex-1">
                {[
                  { id: 'general', label: 'Identity', icon: Globe, color: 'text-brand-primary', adminOnly: false },
                  { id: 'members', label: 'Directory', icon: Users, color: 'text-indigo-500', adminOnly: false },
                  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-500', adminOnly: false },
                ].filter(item => !item.adminOnly || isAdmin).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[24px] transition-all group ${activeTab === item.id ? 'bg-white text-text-primary shadow-xl ring-1 ring-black/5' : 'text-text-tertiary hover:bg-white/50 hover:text-text-primary'}`}
                  >
                    <div className="flex items-center gap-4">
                       <item.icon size={18} className={activeTab === item.id ? item.color : 'opacity-40'} />
                       <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    {activeTab === item.id && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                  </button>
                ))}
              </nav>

              <button 
                onClick={handleClose}
                className="mt-auto flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-text-primary group transition-all"
              >
                 <div className="w-8 h-8 rounded-xl bg-white border border-border-light flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-all shadow-sm">
                    <X size={14} />
                 </div>
                 <span>Terminate Session</span>
              </button>
           </div>
        </div>

        {/* Panoramic Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
           <div className="p-16 h-full overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div 
                    key="general"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                     <header className="space-y-4">
                        <div className="flex items-center gap-3 text-brand-primary">
                           <Globe size={24} />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Environmental Identity</span>
                        </div>
                        <h3 className="text-5xl font-black text-text-primary tracking-tighter leading-none">Team Ecosystem</h3>
                        <p className="text-text-tertiary text-lg font-medium max-w-lg">Modify the core parameters of your workspace environment, including the public access vector.</p>
                     </header>

                     <form onSubmit={handleUpdateWorkspace} className="space-y-10 max-w-xl">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Universal Designation</label>
                           <input 
                             type="text" 
                             value={name}
                             onChange={e => setName(e.target.value)}
                             className="w-full h-16 bg-bg-secondary border-none rounded-[28px] px-8 text-lg font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner"
                             placeholder="Engineering Team"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Access Protocol (URL Slug)</label>
                           <div className="flex items-center gap-4 group">
                              <div className="h-16 bg-bg-secondary/50 rounded-[28px] px-8 flex items-center text-[10px] font-black text-text-tertiary uppercase tracking-widest border border-border-light/20">
                                 flowboard.pro/w/
                              </div>
                              <input 
                                type="text" 
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                className="flex-1 h-16 bg-bg-secondary border-none rounded-[28px] px-8 text-lg font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner"
                                placeholder="engineering"
                              />
                           </div>
                        </div>

                        {isAdmin && (
                          <button 
                            type="submit"
                            disabled={loading || !name || !slug}
                            className="flex items-center gap-4 px-10 py-5 bg-brand-primary text-white rounded-[32px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                             {loading ? <Loader2 size={16} className="animate-spin" /> : success ? <Check size={16} /> : <Zap size={16} />}
                             <span>{success ? 'Protocol Updated' : 'Synchronize Identity'}</span>
                          </button>
                        )}
                     </form>
                  </motion.div>
                )}

                {activeTab === 'members' && (
                  <motion.div 
                    key="members"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     <header className="flex items-end justify-between">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-indigo-500">
                              <Users size={24} />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Biometric Directory</span>
                           </div>
                           <h3 className="text-5xl font-black text-text-primary tracking-tighter leading-none">Human Capital</h3>
                        </div>
                        {isAdmin && (
                          <button 
                            onClick={() => {
                              dispatch(toggleModal({ modalName: 'workspaceSettings', isOpen: false }));
                              dispatch(toggleModal({ modalName: 'memberInvite', isOpen: true }));
                            }}
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            <UserPlus size={16} />
                            Enlist Member
                          </button>
                        )}
                     </header>

                     <div className="grid grid-cols-1 gap-4">
                        {fetchingMembers ? (
                          <div className="py-20 flex flex-col items-center justify-center opacity-40">
                             <Loader2 size={32} className="animate-spin mb-4 text-brand-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Decrypting Roster...</span>
                          </div>
                         ) : (
                          members
                            .filter(m => isAdmin || (m.role !== 'OWNER' && m.role !== 'ADMIN'))
                            .map(member => (
                            <div key={member.user_id} className="flex items-center gap-6 p-6 bg-bg-secondary/20 border-2 border-transparent hover:border-border-light hover:bg-white rounded-[40px] transition-all group relative overflow-hidden">
                               <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-brand-primary to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                                  {(member.profiles?.full_name || member.profiles?.email || 'U')[0].toUpperCase()}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-lg font-black text-text-primary tracking-tight">{member.profiles?.full_name || 'Anonymous Agent'}</p>
                                  <p className="text-sm text-text-tertiary font-bold opacity-60 uppercase flex items-center gap-2">
                                     <Mail size={12} /> {member.profiles?.email}
                                  </p>
                               </div>
                               <div className="flex items-center gap-4">
                                  <div className="relative group">
                                     <select 
                                       value={member.role}
                                       onChange={(e) => updateMemberRole(member.user_id, e.target.value)}
                                       disabled={!isAdmin || member.user_id === user?.id || member.role === 'OWNER'}
                                       className="bg-white border-2 border-border-light rounded-[20px] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-secondary outline-none focus:border-brand-primary/40 transition-all appearance-none cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                        <option value="OWNER">Headquarters</option>
                                        <option value="ADMIN">Command</option>
                                        <option value="MEMBER">Operative</option>
                                     </select>
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <MoreVertical size={14} />
                                     </div>
                                  </div>
                                  {isAdmin && (
                                    <button 
                                      onClick={() => handleOpenAssignments(member)}
                                      className="flex items-center gap-2 px-6 py-3 bg-bg-secondary hover:bg-white border-2 border-transparent hover:border-border-light rounded-[20px] text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-all"
                                    >
                                       <Target size={14} />
                                       Assignments
                                    </button>
                                  )}
                                  {isAdmin && member.user_id !== user?.id && member.role !== 'OWNER' && (
                                    <button 
                                      onClick={() => removeMember(member.user_id)}
                                      className="w-12 h-12 bg-bg-secondary hover:bg-red-50 text-text-tertiary hover:text-red-500 rounded-[20px] flex items-center justify-center transition-all group/trash"
                                      title="Remove Member"
                                    >
                                       <Trash2 size={16} className="group-hover/trash:scale-110 transition-transform" />
                                    </button>
                                  )}
                               </div>
                            </div>
                          ))
                        )}

                        {/* Assignment Sub-View */}
                        <AnimatePresence>
                          {selectedMember && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute inset-0 z-50 bg-white p-16 overflow-y-auto"
                            >
                              <div className="flex items-center justify-between mb-12">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 text-brand-primary">
                                    <Target size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Authorization</span>
                                  </div>
                                  <h3 className="text-4xl font-black text-text-primary tracking-tighter">Assigning: {selectedMember.profiles?.full_name}</h3>
                                </div>
                                <button 
                                  onClick={() => setSelectedMember(null)}
                                  className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center text-text-tertiary hover:bg-black hover:text-white transition-all shadow-sm"
                                >
                                  <X size={20} />
                                </button>
                              </div>

                              <div className="space-y-4">
                                {allBoards.length === 0 ? (
                                  <div className="py-20 text-center text-text-tertiary font-bold italic opacity-40">No workspace boards detected.</div>
                                ) : (
                                  allBoards.map(board => (
                                    <div key={board.id} className="flex items-center justify-between p-6 bg-bg-secondary/40 rounded-[32px] border border-transparent hover:border-border-light transition-all">
                                      <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${memberBoardIds.includes(board.id) ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-white border border-border-light text-text-tertiary'}`}>
                                           <Hash size={20} />
                                        </div>
                                        <div>
                                          <p className="text-lg font-black text-text-primary tracking-tight">{board.title}</p>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{board.visibility} ACCESS</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => toggleBoardAssignment(board.id)}
                                        className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${memberBoardIds.includes(board.id) ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-105'}`}
                                      >
                                        {memberBoardIds.includes(board.id) ? <Trash2 size={14} /> : <Plus size={14} />}
                                        <span>{memberBoardIds.includes(board.id) ? 'Revoke Access' : 'Authorize Deployment'}</span>
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'danger' && isAdmin && (
                  <motion.div 
                    key="danger"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                     <header className="space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                           <AlertTriangle size={24} />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Destructive Axis</span>
                        </div>
                        {isAdmin ? (
                          <>
                            <h3 className="text-5xl font-black text-text-primary tracking-tighter leading-none">Danger Zone</h3>
                            <p className="text-text-tertiary text-lg font-medium max-w-lg">Executing these protocols will permanently purge all workspace data from the mainframe.</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-5xl font-black text-text-primary tracking-tighter leading-none">Safe Passage</h3>
                            <p className="text-text-tertiary text-lg font-medium max-w-lg">Would you like to revoke your access and leave this team ecosystem?</p>
                          </>
                        )}
                     </header>

                      {isAdmin ? (
                        <div className="bg-red-50/50 border-2 border-red-100/50 rounded-[48px] p-12 space-y-10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 text-red-500/5 pointer-events-none">
                             <Trash2 size={240} />
                          </div>
                          
                          <div className="space-y-6 relative z-10">
                             <div>
                                <h4 className="text-lg font-black text-red-600 mb-2">Delete Workspace Artifacts</h4>
                                <p className="text-sm text-red-500/70 font-bold leading-relaxed max-w-lg">
                                   This action is irreversible. All boards, card data, automations, and historical audit logs associated with this team will be TERMINATED globally.
                                </p>
                             </div>

                             <div className="space-y-4 max-w-md">
                                <label className="text-[10px] font-black uppercase tracking-widest text-red-400 ml-1">Confirm Identity (Enter Workspace Name)</label>
                                <div className="relative">
                                   <input 
                                     type="text" 
                                     value={confirmName}
                                     onChange={e => setConfirmName(e.target.value)}
                                     placeholder={activeWorkspace.name}
                                     className="w-full h-16 bg-white border-2 border-red-100 rounded-[28px] px-8 text-lg font-black text-red-600 focus:ring-8 focus:ring-red-500/5 transition-all outline-none placeholder:text-red-200"
                                   />
                                   {confirmName === activeWorkspace.name && (
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in">
                                         <Target size={20} />
                                      </div>
                                   )}
                                </div>
                             </div>

                             <button 
                               onClick={handleDeleteWorkspace}
                               disabled={loading || confirmName !== activeWorkspace.name}
                               className="group flex items-center gap-4 px-10 py-5 bg-red-600 text-white rounded-[32px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/20 hover:bg-black hover:shadow-black/20 transition-all disabled:opacity-50"
                             >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="group-hover:scale-125 transition-transform" />}
                                <span>Terminate Ecosystem</span>
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-bg-secondary/40 border-2 border-border-light/50 rounded-[48px] p-12 space-y-6 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 text-brand-primary/5 pointer-events-none">
                             <LogOut size={240} />
                          </div>
                          
                          <div className="relative z-10 space-y-6">
                            <div>
                               <h4 className="text-lg font-black text-text-primary mb-2">Abandon Mission</h4>
                               <p className="text-sm text-text-tertiary font-bold leading-relaxed max-w-lg">
                                 Revoking your membership will remove your access to all boards and data in this workspace. You will need a new invitation to return.
                               </p>
                            </div>
                            
                            <button 
                              onClick={() => removeMember(user.id)}
                              disabled={loading}
                              className="group flex items-center gap-4 px-10 py-5 bg-black text-white rounded-[32px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-red-600 hover:shadow-red-600/20 transition-all"
                            >
                               <LogOut size={16} />
                               <span>Leave Workspace</span>
                            </button>
                          </div>
                        </div>
                      )}
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
