import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, 
  Box, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2, 
  Save,
  Users,
  Mail,
  Clock,
  UserPlus,
  X,
  Sparkles,
  Loader2,
  Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { setProfile, signOut } from '../store/slices/authSlice';
import { setWorkspaces } from '../store/slices/workspaceSlice';
import { toggleModal } from '../store/slices/uiSlice';
import { compressImage } from '../lib/imageUtils';
import AppLayout from '../components/layout/AppLayout';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');

  // Workspace Settings Multi-Support
  const [selectedWsId, setSelectedWsId] = useState(workspaces[0]?.id || '');
  const activeWorkspace = workspaces.find(ws => ws.id === selectedWsId) || workspaces[0];
  
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
  const [wsSlug, setWsSlug] = useState(activeWorkspace?.slug || '');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [wsLogo, setWsLogo] = useState(activeWorkspace?.logo_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const avatarInputRef = React.useRef(null);
  const logoInputRef = React.useRef(null);

  useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name || '');
      setWsDesc(activeWorkspace.description || '');
      setWsSlug(activeWorkspace.slug || '');
      setWsLogo(activeWorkspace.logo_url || '');
      
      if (activeTab === 'workspace') {
        fetchMembers();
        fetchInvitations();
      }
    }
  }, [selectedWsId, activeTab]);

  const fetchMembers = async () => {
    if (!activeWorkspace) return;
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        role,
        joined_at,
        profiles (id, full_name, email, avatar_url)
      `)
      .eq('workspace_id', activeWorkspace.id);
    
    if (data) setMembers(data);
  };

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .is('accepted_at', null);
    
    if (data) setInvitations(data);
  };

  const handleRevokeInvitation = async (id) => {
    const { error } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('workspace_id', activeWorkspace.id)
      .eq('user_id', userId);
    
    if (!error) {
      setMembers(prev => prev.map(m => 
        m.profiles.id === userId ? { ...m, role: newRole } : m
      ));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', activeWorkspace.id)
      .eq('user_id', userId);
    
    if (!error) {
      setMembers(prev => prev.filter(m => m.profiles.id !== userId));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;

    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      setIsCompressingAvatar(true);
      try {
        fileToUpload = await compressImage(file, 100);
      } finally {
        setIsCompressingAvatar(false);
      }
    } else if (file.size > 102400) {
      alert('Avatar must be under 100 KB.');
      return;
    }

    setLoading(true);
    try {
      const fileExt = fileToUpload.name ? fileToUpload.name.split('.').pop() : 'jpg';
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      // Update local state via redux if needed, or just refresh
      window.location.reload(); 
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload avatar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeWorkspace) return;

    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      setIsCompressingLogo(true);
      try {
        fileToUpload = await compressImage(file, 100);
      } finally {
        setIsCompressingLogo(false);
      }
    } else if (file.size > 102400) {
      alert('Non-image file is too large. All attachments must be under 100 KB.');
      return;
    }

    setIsUploading(true);
    const fileExt = fileToUpload.name ? fileToUpload.name.split('.').pop() : 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${activeWorkspace.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('workspace-logos')
      .upload(filePath, fileToUpload);

    if (uploadError) {
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('workspace-logos')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ logo_url: publicUrl })
      .eq('id', activeWorkspace.id);

    if (!updateError) {
      setWsLogo(publicUrl);
    }
    setIsUploading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setValidationErrors({ full_name: 'Full name is required' });
      return;
    }

    setValidationErrors({});

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, timezone })
      .eq('id', user.id)
      .select()
      .single();
    
    if (data) {
      dispatch(setProfile(data));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    if (!wsName.trim()) {
      setValidationErrors({ name: 'Workspace name is required' });
      return;
    }
    if (!wsSlug.trim()) {
      setValidationErrors({ slug: 'Workspace slug is required' });
      return;
    }

    setValidationErrors({});

    setLoading(true);
    const { data, error } = await supabase
      .from('workspaces')
      .update({ name: wsName, description: wsDesc, slug: wsSlug })
      .eq('id', activeWorkspace.id)
      .select()
      .single();
    
    if (data) {
      const updatedWorkspaces = workspaces.map(ws => ws.id === data.id ? { ...ws, ...data } : ws);
      dispatch(setWorkspaces(updatedWorkspaces));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL: Are you sure you want to delete your account? This action is permanent and will delete all your workspaces, boards, and data. This cannot be undone.')) {
      return;
    }

    const doubleCheck = window.prompt('Please type "DELETE" to confirm permanent account deletion:');
    if (doubleCheck !== 'DELETE') {
      alert('Delete confirmation failed. Account was not deleted.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      // Successfully deleted. Sign out and redirect.
      await supabase.auth.signOut();
      dispatch(signOut());
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Box },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-2">Settings</h1>
          <p className="text-text-secondary font-medium">Manage your account and workspace preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-border-light rounded-[32px] shadow-sm overflow-hidden">
            
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-3xl bg-bg-secondary border-2 border-dashed border-border-medium flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-primary">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-4xl font-black uppercase">
                          {fullName[0] || user?.email[0]}
                        </div>
                      )}
                      {(loading || isCompressingAvatar) && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          {isCompressingAvatar ? (
                            <>
                              <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary animate-pulse text-center px-2">Optimizing...</span>
                            </>
                          ) : (
                            <Loader2 size={16} className="text-brand-primary animate-spin" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1">Your Avatar</h3>
                    <p className="text-sm text-text-tertiary">Click the icon to upload a profile picture.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <User size={18} />
                      </div>
                      <input 
                        className="w-full h-14 bg-bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    {validationErrors.full_name && (
                      <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                        {validationErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <Mail size={18} />
                      </div>
                      <input 
                        disabled
                        className="w-full h-14 bg-bg-secondary/50 border-none rounded-2xl pl-12 pr-6 font-bold text-text-tertiary cursor-not-allowed"
                        value={user?.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Timezone</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <Clock size={18} />
                      </div>
                      <select 
                        className="w-full h-14 bg-bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none appearance-none"
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                        <option value="GMT">GMT (Greenwich Mean Time)</option>
                      </select>
                    </div>
                    {validationErrors.timezone && (
                      <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                        {validationErrors.timezone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border-light flex items-center justify-between">
                  <p className={`text-sm font-bold text-success flex items-center gap-2 transition-all duration-500 ${saveSuccess ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <Save size={16} />
                    <span>Changes saved successfully!</span>
                  </p>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'workspace' && (
              <div className="divide-y divide-border-light">
                {workspaces.length > 1 && (
                  <div className="p-10 pb-0 flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    {workspaces.map(ws => (
                      <button 
                        key={ws.id}
                        onClick={() => setSelectedWsId(ws.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${selectedWsId === ws.id ? 'bg-bg-secondary text-brand-primary border-2 border-brand-primary' : 'bg-transparent text-text-tertiary border-2 border-transparent hover:bg-bg-secondary hover:text-text-primary'}`}
                      >
                         <div className="w-5 h-5 rounded-md bg-white border border-border-light flex items-center justify-center overflow-hidden">
                           {ws.logo_url ? <img src={ws.logo_url} className="w-full h-full object-cover" /> : <Box size={10} />}
                         </div>
                         {ws.name}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleUpdateWorkspace} className="p-10 space-y-10">
                    <div className="flex items-center gap-8">
                      <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-3xl bg-bg-secondary border-2 border-dashed border-border-medium flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-primary">
                          {wsLogo ? (
                            <img src={wsLogo} alt="Workspace Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Box size={24} className="text-text-tertiary group-hover:text-brand-primary" />
                          )}
                          {(isUploading || isCompressingLogo) && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                              {isCompressingLogo ? (
                                <>
                                  <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary animate-pulse">Optimizing...</span>
                                </>
                              ) : (
                                <Loader2 size={20} className="text-brand-primary animate-spin" />
                              )}
                            </div>
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={logoInputRef}
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-text-primary">Workspace Logo</h4>
                        <p className="text-xs text-text-tertiary">Recommended: 400x400px, PNG or JPG.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Workspace Name</label>
                        <input 
                          className="w-full h-14 bg-bg-secondary border-none rounded-2xl px-6 font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                          value={wsName}
                          onChange={e => setWsName(e.target.value)}
                        />
                        {validationErrors.name && (
                          <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                            {validationErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Workspace URL ID (Slug)</label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-tertiary uppercase opacity-40 select-none">/w/</span>
                          <input 
                            className="w-full h-14 bg-bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                            value={wsSlug}
                            onChange={e => setWsSlug(e.target.value)}
                          />
                        </div>
                        {validationErrors.slug && (
                          <p className="text-[10px] font-bold text-danger ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                            {validationErrors.slug}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Description</label>
                      <textarea 
                        className="w-full h-32 bg-bg-secondary border-none rounded-2xl p-6 font-medium text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none resize-none"
                        value={wsDesc}
                        onChange={e => setWsDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={loading || !activeWorkspace}
                        className="btn btn-primary h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs"
                      >
                        Update Workspace
                      </button>
                    </div>
                  </form>

                <div className="p-10 pb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-3">
                      <Users size={24} className="text-brand-primary" />
                      Team Members
                    </h3>
                    <button 
                      onClick={() => dispatch(toggleModal({ modalName: 'memberInvite', isOpen: true }))}
                      className="btn btn-secondary !h-10 !rounded-xl !px-4 !text-xs font-bold"
                    >
                      <UserPlus size={14} />
                      Invite Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {members.map((m) => (
                      <div key={m.profiles.id} className="flex items-center justify-between p-4 bg-bg-secondary/50 rounded-2xl border border-transparent hover:border-border-light transition-all">
                        <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-text-primary font-bold shadow-sm overflow-hidden">
                        {m.profiles.avatar_url ? (
                          <img src={m.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          m.profiles.full_name?.[0] || m.profiles.email[0].toUpperCase()
                        )}
                      </div>
                          <div>
                            <div className="font-bold text-sm text-text-primary">{m.profiles.full_name || 'Anonymous Member'}</div>
                            <div className="text-xs text-text-tertiary">{m.profiles.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select 
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.profiles.id, e.target.value)}
                            className="bg-white border border-border-light text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-text-tertiary outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer hover:bg-bg-secondary transition-all"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="GUEST">GUEST</option>
                            <option value="CLIENT">CLIENT</option>
                          </select>
                          <button 
                            onClick={() => handleRemoveMember(m.profiles.id)}
                            className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {invitations.length > 0 && (
                  <div className="p-10 pb-16 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-3 mb-6">
                      <Clock size={20} className="text-brand-primary" />
                      Pending Invitations
                    </h3>
                    <div className="space-y-3">
                      {invitations.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-bg-secondary/10 rounded-2xl border border-dashed border-border-light">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-text-tertiary italic font-black shadow-sm border border-border-light">
                              @
                            </div>
                            <div>
                              <div className="font-bold text-sm text-text-primary">{inv.email}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Invited as {inv.role}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRevokeInvitation(inv.id)}
                            className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            title="Revoke Invitation"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mx-auto text-text-tertiary">
                  <Bell size={32} />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Advanced notifications coming soon</h3>
                <p className="text-text-secondary max-w-sm mx-auto">We're building these features to give you full control over your FlowBoard experience.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-10 space-y-12">
                <div>
                   <h3 className="text-2xl font-black text-text-primary tracking-tighter mb-2">Security & Privacy</h3>
                   <p className="text-text-secondary font-medium">Manage your account security and data privacy settings.</p>
                </div>

                <div className="p-8 bg-bg-secondary/30 rounded-2xl border border-border-light space-y-6">
                   <div className="flex items-center gap-4 text-warning">
                      <Shield size={24} />
                      <h4 className="font-bold text-text-primary uppercase tracking-widest text-xs">Identity Protection</h4>
                   </div>
                   <p className="text-sm text-text-secondary font-medium leading-relaxed">
                      Your identity and sessions are protected by Supabase Auth with enterprise-grade encryption. 
                      Multi-factor authentication (MFA) and SSO settings will be available in the next update.
                   </p>
                </div>

                <div className="pt-10 border-t border-border-light">
                   <div className="flex items-center gap-3 mb-6">
                      <Trash2 size={24} className="text-danger" />
                      <h3 className="text-xl font-bold text-danger">Danger Zone</h3>
                   </div>
                   
                   <div className="bg-danger/5 border border-danger/10 rounded-2xl p-8 space-y-6">
                      <div className="space-y-2">
                         <h4 className="font-bold text-text-primary">Delete Account</h4>
                         <p className="text-sm text-text-secondary leading-relaxed">
                            Once you delete your account, there is no going back. All your workspaces where you are the owner, 
                            all your boards, cards, and personal data will be permanently wiped from our servers. 
                            Please be certain.
                         </p>
                      </div>
                      <button 
                         onClick={handleDeleteAccount}
                         disabled={loading}
                         className="btn bg-danger hover:bg-danger-dark text-white h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-danger/20 transition-all flex items-center gap-3"
                      >
                         {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                         Delete My Account Permanently
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
