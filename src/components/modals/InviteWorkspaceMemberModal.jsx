import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, Shield, User, Send, Sparkles, Check, Users } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { supabase } from '../../lib/supabase';
import { createWorkspaceInvitations } from '../../lib/invitationService';

const InviteWorkspaceMemberModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const activeWorkspace = useSelector((state) => state.workspaces.activeWorkspace || state.workspaces.workspaces[0]);
  
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'memberInvite', isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emails || loading) return;

    setLoading(true);
    
    // Split comma-separated emails and trim
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email.length > 0);
    
    try {
      const result = await createWorkspaceInvitations({
        emailList,
        workspaceId: activeWorkspace.id,
        workspaceName: activeWorkspace.name,
        role,
        invitedByProfile: user
      });

      if (!result.success) throw new Error(result.error);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert(error.message || 'Failed to send invitations.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'ADMIN', label: 'Admin', icon: Shield, desc: 'Can manage workspace settings and members.' },
    { id: 'MEMBER', label: 'Member', icon: User, desc: 'Can create and edit boards and cards.' },
    { id: 'GUEST', label: 'Guest', icon: Mail, desc: 'Limited access to specific boards only.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-8 animate-in fade-in duration-500">
      <div 
        className="w-full max-w-5xl bg-white rounded-[48px] shadow-[0_48px_120px_-24px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row min-h-[560px] animate-in zoom-in-95 slide-in-from-bottom-10 duration-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Visual Identity / Instructions Wing */}
        <div className="w-full md:w-[40%] bg-gradient-to-br from-brand-primary to-indigo-700 p-12 text-white relative overflow-hidden flex flex-col justify-between">
           {/* Abstract patterns */}
           <div className="absolute top-[-10%] left-[-10%] opacity-10 pointer-events-none">
              <Sparkles size={400} />
           </div>
           
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[24px] flex items-center justify-center mb-10 shadow-2xl border border-white/20">
                 <Users size={32} className="text-white" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-none mb-6">Build the Squad</h2>
              <p className="text-white/70 text-lg font-medium tracking-tight leading-relaxed max-w-xs">
                Invite your counterparts to unify communication and accelerate the execution cycle.
              </p>
           </div>

           <div className="relative z-10 space-y-8 bg-black/10 backdrop-blur-md p-8 rounded-[32px] border border-white/10 mt-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Joining Protocol</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                    <p className="text-xs font-bold leading-snug">Team members receive a secure encrypted access link via email.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                    <p className="text-xs font-bold leading-snug">They must authorize their identity through our Magic Link terminal.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                    <p className="text-xs font-bold leading-snug">Once verified, they are instantly synchronized with the {activeWorkspace?.name || 'Admin'} workspace.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Action Wing */}
        <div className="flex-1 p-14 flex flex-col justify-center bg-white relative">
           <button 
             onClick={handleClose}
             className="absolute top-10 right-10 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-2xl transition-all group"
           >
             <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
           </button>

          {success ? (
            <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                <Check size={48} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-text-primary tracking-tighter">Transmission Successful</h3>
                <p className="text-text-tertiary text-base font-medium max-w-xs mx-auto">Your invites have been deployed. Real-time collaboration is imminent.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto w-full space-y-12">
              <header className="space-y-3">
                 <div className="flex items-center gap-3 text-brand-primary">
                    <Send size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">External Uplink</span>
                 </div>
                 <h3 className="text-4xl font-black text-text-primary tracking-tighter leading-none">Deploy Invitations</h3>
                 <p className="text-text-tertiary font-medium">Select the access tier for your new subordinates.</p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Communication Addresses (Emails)</label>
                   <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={20} />
                      <input 
                        type="text"
                        placeholder="agent1@company.com, agent2@company.com..."
                        className="w-full h-18 bg-bg-secondary border-none rounded-[28px] pl-16 pr-6 text-base font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner"
                        value={emails}
                        onChange={e => setEmails(e.target.value)}
                        required
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {roles.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col gap-4 p-6 rounded-[32px] border-2 transition-all text-left group relative overflow-hidden ${role === r.id ? 'border-brand-primary bg-brand-primary/5 shadow-xl shadow-brand-primary/5' : 'border-border-light hover:border-brand-primary/30 bg-white'}`}
                      >
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${role === r.id ? 'bg-brand-primary text-white shadow-lg' : 'bg-bg-secondary text-text-tertiary'}`}>
                            <r.icon size={20} />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-text-primary">{r.label}</p>
                            <p className="text-[9px] font-bold text-text-tertiary uppercase leading-tight">{r.desc}</p>
                         </div>
                         {role === r.id && (
                            <div className="absolute top-4 right-4 text-brand-primary animate-in zoom-in">
                               <Check size={16} strokeWidth={3} />
                            </div>
                         )}
                      </button>
                   ))}
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={!emails || loading}
                    className="w-full h-18 bg-brand-primary text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 group"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={18} className="fill-current group-hover:rotate-12 transition-transform" />
                        <span>Initialize Collaboration</span>
                      </>
                    )}
                  </button>
                  <p className="text-center mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center justify-center gap-3">
                     <span className="w-8 h-px bg-border-light" />
                     Multi-Agent Protocol Alpha
                     <span className="w-8 h-px bg-border-light" />
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteWorkspaceMemberModal;
