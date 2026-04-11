import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, Shield, User, Send, Sparkles, Check } from 'lucide-react';
import { toggleModal } from '../../store/slices/uiSlice';
import { supabase } from '../../lib/supabase';

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
      const invitations = emailList.map(email => ({
        workspace_id: activeWorkspace.id,
        email,
        role,
        invited_by: user.id
      }));

      const { error } = await supabase
        .from('workspace_invitations')
        .insert(invitations);

      if (error) throw error;

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div 
        className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-8">
          {success ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                <Check size={32} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-text-primary tracking-tighter">Invitations Sent!</h2>
                <p className="text-text-secondary text-sm font-medium">Your team will receive an email shortly.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tighter leading-none">Invite to {activeWorkspace?.name}</h2>
                    <p className="text-text-tertiary text-xs mt-1">Add coworkers to collaborate in real-time.</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col md:flex-row items-end gap-3 p-1.5 bg-bg-secondary rounded-[24px] border border-border-light focus-within:ring-4 focus-within:ring-brand-primary/5 focus-within:bg-white transition-all">
                  <div className="flex-1 w-full relative group">
                    <Mail className="absolute left-5 top-5 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder="Enter emails (comma separated)..."
                      className="w-full bg-transparent border-none pl-14 pr-4 py-4 text-sm font-bold outline-none placeholder:text-text-tertiary/50"
                      value={emails}
                      onChange={e => setEmails(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="w-full md:w-36 relative">
                    <label className="absolute left-4 -top-2 px-1 bg-white text-[9px] font-black uppercase tracking-widest text-brand-primary z-10 rounded-sm">Role</label>
                    <select 
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full bg-white border border-border-light rounded-xl pl-4 pr-10 py-4 text-xs font-black uppercase tracking-wider text-text-primary outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="GUEST">Guest</option>
                    </select>
                    <Shield className="absolute right-4 top-4.5 pointer-events-none text-text-tertiary" size={14} />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!emails || loading}
                    className="w-full md:w-auto px-8 py-4 bg-brand-primary text-white rounded-[18px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending...' : (
                      <>
                        <Sparkles size={14} className="fill-current" />
                        <span>Send Invite</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between px-4">
                   <p className="text-[9px] text-text-tertiary font-bold uppercase tracking-widest italic">Tip: Use commas for batch invites</p>
                   <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                      <span className="flex items-center gap-1"><Shield size={10} /> Admin: Manage</span>
                      <span className="flex items-center gap-1"><User size={10} /> Member: Edit</span>
                      <span className="flex items-center gap-1"><Mail size={10} /> Guest: View</span>
                   </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteWorkspaceMemberModal;
