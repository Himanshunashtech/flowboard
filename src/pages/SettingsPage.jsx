import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
  Camera,
  ChevronRight,
  AlertTriangle,
  Link as LinkIcon,
  Globe,
  Key,
  Copy,
  RefreshCw,
  Slack,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { setProfile, signOut } from '../store/slices/authSlice';
import { setWorkspaces, deleteWorkspace } from '../store/slices/workspaceSlice';
import { toggleModal } from '../store/slices/uiSlice';
import { compressImage } from '../lib/imageUtils';
import AppLayout from '../components/layout/AppLayout';

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

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
  const [confirmWsName, setConfirmWsName] = useState('');
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  // Integrations State
  const [webhooks, setWebhooks] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [externalApps, setExternalApps] = useState([]);
  const [publicSettings, setPublicSettings] = useState({
    allow_public_submission: false,
    allow_public_roadmap: false,
    allow_public_releases: false
  });

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
      } else if (activeTab === 'integrations') {
        fetchWebhooks();
        fetchApiKeys();
        fetchExternalApps();
        fetchPublicSettings();
      }
    }
  }, [selectedWsId, activeTab]);

  const fetchWebhooks = async () => {
    if (!activeWorkspace) return;
    const { data } = await supabase
      .from('workspace_webhooks')
      .select('*')
      .eq('workspace_id', activeWorkspace.id);
    if (data) setWebhooks(data);
  };

  const fetchApiKeys = async () => {
    if (!activeWorkspace) return;
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('workspace_id', activeWorkspace.id);
    if (data) setApiKeys(data);
  };

  const handleGenerateWebhook = async (service) => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('workspace_webhooks')
      .insert({
        workspace_id: activeWorkspace.id,
        service: service,
        config: { move_to_status: 'done', auto_link_prs: true }
      })
      .select()
      .single();

    if (data) setWebhooks(prev => [...prev, data]);
    setLoading(false);
  };

  const handleGenerateApiKey = async () => {
    if (!activeWorkspace || !newApiKeyName.trim()) return;
    setLoading(true);

    const rawKey = `fb_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        workspace_id: activeWorkspace.id,
        name: newApiKeyName,
        key_hash: rawKey, // In production, hash this!
        key_preview: rawKey.substring(0, 7) + '...'
      })
      .select()
      .single();

    if (data) {
      setApiKeys(prev => [...prev, data]);
      setGeneratedKey(rawKey);
      setNewApiKeyName('');
    }
    setLoading(false);
  };

  const fetchExternalApps = async () => {
    if (!activeWorkspace) return;
    const { data } = await supabase
      .from('workspace_external_apps')
      .select('*')
      .eq('workspace_id', activeWorkspace.id);
    if (data) setExternalApps(data);
  };

  const fetchPublicSettings = async () => {
    if (!activeWorkspace) return;
    const { data } = await supabase
      .from('workspace_public_settings')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .maybeSingle();
    if (data) setPublicSettings(data);
  };

  const handleUpdatePublicSetting = async (key, value) => {
    if (!activeWorkspace) return;
    const newSettings = { ...publicSettings, [key]: value };
    setPublicSettings(newSettings);

    await supabase
      .from('workspace_public_settings')
      .upsert({
        workspace_id: activeWorkspace.id,
        [key]: value,
        updated_at: new Date().toISOString()
      });
  };

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
    if (!activeWorkspace) return;
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

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    if (confirmWsName !== activeWorkspace.name) {
      alert('Workspace name does not match. Deletion aborted.');
      return;
    }

    if (!window.confirm(`CRITICAL: Are you sure you want to delete "${activeWorkspace.name}"? This will permanently wipe all boards and data in this workspace. This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', activeWorkspace.id);

      if (error) throw error;

      dispatch(deleteWorkspace(activeWorkspace.id));
      setConfirmWsName('');

      // If any other workspace exists, select it
      const remaining = workspaces.filter(ws => ws.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        setSelectedWsId(remaining[0].id);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      alert('Failed to delete workspace: ' + err.message);
    } finally {
      setLoading(false);
    }
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
    { id: 'ai', label: 'AI Persona', icon: Sparkles },
    { id: 'workspace', label: 'Workspace', icon: Box },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  ];

  // AI Preferences State
  const [aiPrefs, setAiPrefs] = useState({
    optimization_goal: 'BALANCED',
    work_start_time: '09:00:00',
    work_end_time: '17:00:00',
    ai_tone: 'PROFESSIONAL'
  });

  useEffect(() => {
    if (user && activeTab === 'ai') {
      fetchAiPrefs();
    }
  }, [user, activeTab]);

  const fetchAiPrefs = async () => {
    const { data } = await supabase
      .from('user_ai_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) setAiPrefs(data);
  };

  const handleUpdateAiPrefs = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('user_ai_preferences')
      .upsert({
        user_id: user.id,
        ...aiPrefs,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Settings</h1>
          <p className="text-muted-foreground font-medium">Manage your account and workspace preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Desktop Sidebar */}


          <div className="flex-1 w-full space-y-6 bg-card/30 rounded-[40px] border border-border/50 overflow-hidden min-h-[700px]">
            <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-4 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'integrations' && (
              <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <LinkIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground tracking-tighter">Integrations Hub</h3>
                      <p className="text-muted-foreground font-medium text-sm">Connect your engineering stack and automate your workflow.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {[
                      { title: 'Git Webhooks', desc: 'Auto-link PRs and move tasks when code is merged.', icon: Globe },
                      { title: 'Chat Ops', desc: 'Create tasks and get updates directly in Slack/Teams.', icon: Slack },
                      { title: 'API Access', desc: 'Build custom workflows with secure API keys.', icon: Key }
                    ].map((step, i) => (
                      <div key={i} className="p-5 bg-secondary/30 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <step.icon size={16} className="text-primary" />
                          <h4 className="font-bold text-xs uppercase tracking-widest">{step.title}</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* GitHub */}
                  <div className="p-8 bg-secondary/30 rounded-[32px] border border-border/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#24292f] flex items-center justify-center">
                          <Globe size={24} color="white" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg">GitHub</h4>
                          <p className="text-xs text-muted-foreground font-medium">Link PRs and auto-move tasks on merge</p>
                        </div>
                      </div>
                      {webhooks.some(w => w.service === 'GITHUB') ? (
                        <span className="px-4 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">Connected</span>
                      ) : (
                        <button onClick={() => handleGenerateWebhook('GITHUB')} className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Connect</button>
                      )}
                    </div>

                    {webhooks.filter(w => w.service === 'GITHUB').map(webhook => (
                      <div key={webhook.id} className="mt-8 pt-8 border-t border-border/50 space-y-6 animate-in fade-in duration-500">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Save these values — they won't be shown again!</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Webhook URL</label>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-xs font-mono text-muted-foreground"
                                  value={`https://wyrboobykiephmaolxmu.supabase.co/functions/v1/github-webhook?workspace=${activeWorkspace?.id || ''}&token=${webhook.webhook_token}`}
                                />
                                <button onClick={() => navigator.clipboard.writeText(`https://wyrboobykiephmaolxmu.supabase.co/functions/v1/github-webhook?workspace=${activeWorkspace?.id || ''}&token=${webhook.webhook_token}`)} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80">
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Webhook Secret</label>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  type="password"
                                  className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-xs font-mono text-muted-foreground"
                                  value={webhook.webhook_secret}
                                />
                                <button onClick={() => navigator.clipboard.writeText(webhook.webhook_secret)} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80">
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-background border border-border rounded-[24px] space-y-4">
                             <div className="flex items-center gap-2 mb-2">
                                <RefreshCw size={14} className="text-primary" />
                                <h5 className="font-black text-[10px] uppercase tracking-widest">Automation Rules</h5>
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <span className="text-xs font-bold">Auto-move on merge</span>
                                   <div className="w-10 h-5 bg-primary rounded-full p-1 cursor-pointer">
                                      <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Move to list</label>
                                   <select className="w-full h-10 bg-secondary border-none rounded-xl px-4 text-xs font-bold">
                                      <option>Done</option>
                                      <option>Released</option>
                                   </select>
                                </div>
                                <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                                   Mention the task number in your PR title or body (e.g. #123) to link it.
                                </p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* GitLab Integration */}
                  <div className="p-8 bg-secondary/30 rounded-[32px] border border-border/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#fca326] flex items-center justify-center">
                          <Box size={24} color="white" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg">GitLab</h4>
                          <p className="text-xs text-muted-foreground font-medium">Link MRs and auto-move tasks on merge</p>
                        </div>
                      </div>
                      {webhooks.some(w => w.service === 'GITLAB') ? (
                        <span className="px-4 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">Connected</span>
                      ) : (
                        <button
                          onClick={() => handleGenerateWebhook('GITLAB')}
                          className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {webhooks.filter(w => w.service === 'GITLAB').map(webhook => (
                      <div key={webhook.id} className="mt-8 pt-8 border-t border-border/50 space-y-6 animate-in fade-in duration-500">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Save these values — they won't be shown again!</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Webhook URL</label>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-xs font-mono text-muted-foreground"
                                  value={`https://wyrboobykiephmaolxmu.supabase.co/functions/v1/gitlab-webhook?workspace=${activeWorkspace?.id || ''}&token=${webhook.webhook_token}`}
                                />
                                <button onClick={() => navigator.clipboard.writeText(`https://wyrboobykiephmaolxmu.supabase.co/functions/v1/gitlab-webhook?workspace=${activeWorkspace?.id || ''}&token=${webhook.webhook_token}`)} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80">
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Secret Token</label>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  type="password"
                                  className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-xs font-mono text-muted-foreground"
                                  value={webhook.webhook_secret}
                                />
                                <button onClick={() => navigator.clipboard.writeText(webhook.webhook_secret)} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80">
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-background border border-border rounded-[24px] space-y-4">
                             <div className="flex items-center gap-2 mb-2">
                                <RefreshCw size={14} className="text-primary" />
                                <h5 className="font-black text-[10px] uppercase tracking-widest">Automation Rules</h5>
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <span className="text-xs font-bold">Auto-move on merge</span>
                                   <div className="w-10 h-5 bg-primary rounded-full p-1 cursor-pointer">
                                      <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Move to list</label>
                                   <select className="w-full h-10 bg-secondary border-none rounded-xl px-4 text-xs font-bold">
                                      <option>Done</option>
                                      <option>Released</option>
                                   </select>
                                </div>
                                <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                                   Mention the task number in your MR title or branch name (e.g. #123) to link it.
                                </p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slack & Teams */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-[#4a154b]/5 rounded-[32px] border border-[#4a154b]/10 flex flex-col justify-between h-[200px]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#4a154b] flex items-center justify-center">
                          <Slack size={20} color="white" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm">Slack</h4>
                          <p className="text-[10px] text-muted-foreground font-medium">Create tasks via /flowboard</p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-[#4a154b] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">Connect Slack</button>
                    </div>

                    <div className="p-8 bg-[#6264a7]/5 rounded-[32px] border border-[#6264a7]/10 flex flex-col justify-between h-[200px]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#6264a7] flex items-center justify-center">
                          <Box size={20} color="white" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm">Microsoft Teams</h4>
                          <p className="text-[10px] text-muted-foreground font-medium">Bot integration for channels</p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-[#6264a7] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">Connect Teams</button>
                    </div>
                  </div>

                  {/* Public Sharing & Roadmap */}
                  <div className="p-8 bg-secondary/30 rounded-[32px] border border-border/50 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Public Sharing</h4>
                        <p className="text-xs text-muted-foreground font-medium">Share your roadmap and collect feedback</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'submission', label: 'Public Submission', icon: Mail, key: 'allow_public_submission' },
                        { id: 'roadmap', label: 'Public Roadmap', icon: Box, key: 'allow_public_roadmap' },
                        { id: 'releases', label: 'Public Releases', icon: Sparkles, key: 'allow_public_releases' }
                      ].map(item => (
                        <div key={item.id} className="p-6 bg-background border border-border rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <item.icon size={20} className="text-muted-foreground" />
                            <div
                              onClick={() => handleUpdatePublicSetting(item.key, !publicSettings[item.key])}
                              className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${publicSettings[item.key] ? 'bg-primary' : 'bg-muted'}`}
                            >
                              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${publicSettings[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                          </div>
                          <h5 className="font-bold text-xs">{item.label}</h5>
                          {publicSettings[item.key] && (
                            <button className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                              <LinkIcon size={10} />
                              Copy Link
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MCP Server Config */}
                  <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-primary" size={20} />
                        <h4 className="font-black text-sm">MCP Server (Beta)</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded">Advanced AI</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Connect Claude, Cursor, or ChatGPT directly to your FlowBoard workspace using the Model Context Protocol.
                    </p>
                    <div className="p-4 bg-background border border-primary/20 rounded-xl">
                      <code className="text-[9px] font-mono text-primary break-all">
                        npx @flowboard/mcp-server --workspace={activeWorkspace?.id || 'YOUR_WORKSPACE_ID'} --key=YOUR_API_KEY
                      </code>
                    </div>
                  </div>

                  {/* API Keys Section */}
                  <div className="p-8 bg-secondary/30 rounded-[32px] border border-border/50">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Key size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">API Keys</h4>
                        <p className="text-xs text-muted-foreground font-medium">Generate keys for external applications</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <input
                          placeholder="Key Name (e.g. CI/CD Bot)"
                          className="flex-1 h-14 bg-background border border-border rounded-2xl px-6 font-bold text-sm"
                          value={newApiKeyName}
                          onChange={e => setNewApiKeyName(e.target.value)}
                        />
                        <button
                          onClick={handleGenerateApiKey}
                          className="px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl"
                        >
                          Generate
                        </button>
                      </div>

                      {generatedKey && (
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">New API Key Generated!</p>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              className="flex-1 h-12 bg-background border border-primary/20 rounded-xl px-4 text-xs font-mono text-primary font-bold"
                              value={generatedKey}
                            />
                            <button onClick={() => navigator.clipboard.writeText(generatedKey)} className="p-3 bg-primary text-white rounded-xl">
                              <Copy size={16} />
                            </button>
                          </div>
                          <p className="text-[9px] font-medium text-muted-foreground italic">Make sure to copy this now. You won't be able to see it again.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {apiKeys.map(key => (
                          <div key={key.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <Key size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest">{key.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">{key.key_preview}</p>
                              </div>
                            </div>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <form onSubmit={handleUpdateAiPrefs} className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                    <Sparkles className="text-primary" size={24} />
                    AI Intelligence Identity
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm">Define how your AI Agent perceives and organizes your mission.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Optimization Goal</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'PRODUCTIVITY', label: 'High Productivity', desc: 'Prioritizes "Eating the Frog" and intense focus blocks.', icon: Zap },
                        { id: 'BALANCED', label: 'Balanced Flow', desc: 'Mixes deep work with administrative recovery.', icon: Box },
                        { id: 'WELLBEING', label: 'Wellbeing First', desc: 'Ensures breaks and lower cognitive load sessions.', icon: Users }
                      ].map(goal => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setAiPrefs({ ...aiPrefs, optimization_goal: goal.id })}
                          className={`p-6 rounded-[32px] border-2 text-left transition-all ${aiPrefs.optimization_goal === goal.id ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' : 'bg-secondary/50 border-transparent hover:border-border'}`}
                        >
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${aiPrefs.optimization_goal === goal.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-muted-foreground'}`}>
                            <goal.icon size={20} />
                          </div>
                          <h4 className="font-bold text-sm text-foreground mb-1">{goal.label}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{goal.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI Agent Personality Tone</label>
                      <select
                        className="w-full h-14 bg-secondary border-none rounded-2xl px-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                        value={aiPrefs.ai_tone}
                        onChange={e => setAiPrefs({ ...aiPrefs, ai_tone: e.target.value })}
                      >
                        <option value="PROFESSIONAL">Professional Identity</option>
                        <option value="CASUAL">Casual & Friendly</option>
                        <option value="ZEN">Zen Master (Minimalist)</option>
                        <option value="CHALLENGING">Military / Hardcore</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Daily Mission Window</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="time"
                          className="flex-1 h-14 bg-secondary border-none rounded-2xl px-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          value={aiPrefs.work_start_time}
                          onChange={e => setAiPrefs({ ...aiPrefs, work_start_time: e.target.value })}
                        />
                        <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">To</span>
                        <input
                          type="time"
                          className="flex-1 h-14 bg-secondary border-none rounded-2xl px-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          value={aiPrefs.work_end_time}
                          onChange={e => setAiPrefs({ ...aiPrefs, work_end_time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <p className={`text-sm font-bold text-green-500 flex items-center gap-2 transition-all duration-500 ${saveSuccess ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <Save size={16} />
                    <span>AI Identity updated!</span>
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs"
                  >
                    {loading ? 'Synching...' : 'Synchronize Identity'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-3xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black uppercase">
                          {fullName[0] || user?.email[0]}
                        </div>
                      )}
                      {(loading || isCompressingAvatar) && (
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          {isCompressingAvatar ? (
                            <>
                              <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-primary animate-pulse text-center px-2">Optimizing...</span>
                            </>
                          ) : (
                            <Loader2 size={16} className="text-primary animate-spin" />
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
                    <h3 className="text-xl font-bold text-foreground mb-1">Your Avatar</h3>
                    <p className="text-sm text-muted-foreground">Click the icon to upload a profile picture.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User size={18} />
                      </div>
                      <input
                        className="w-full h-14 bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    {validationErrors.full_name && (
                      <p className="text-[10px] font-bold text-destructive ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                        {validationErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail size={18} />
                      </div>
                      <input
                        disabled
                        className="w-full h-14 bg-secondary/50 border-none rounded-2xl pl-12 pr-6 font-bold text-muted-foreground cursor-not-allowed"
                        value={user?.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Timezone</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Clock size={18} />
                      </div>
                      <select
                        className="w-full h-14 bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
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
                      <p className="text-[10px] font-bold text-destructive ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                        {validationErrors.timezone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <p className={`text-sm font-bold text-green-500 flex items-center gap-2 transition-all duration-500 ${saveSuccess ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
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
              <div className="divide-y divide-border">
                <div className="p-10 pb-0 flex items-center gap-4 overflow-x-auto scrollbar-hide">
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => setSelectedWsId(ws.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${selectedWsId === ws.id ? 'bg-secondary text-primary border-2 border-primary' : 'bg-transparent text-muted-foreground border-2 border-transparent hover:bg-secondary hover:text-foreground'}`}
                    >
                      <div className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center overflow-hidden">
                        {ws.logo_url ? <img src={ws.logo_url} className="w-full h-full object-cover" /> : <Box size={10} />}
                      </div>
                      {ws.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleUpdateWorkspace} className="p-10 space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-3xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                        {wsLogo ? (
                          <img src={wsLogo} alt="Workspace Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Box size={24} className="text-muted-foreground group-hover:text-primary" />
                        )}
                        {(isUploading || isCompressingLogo) && (
                          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                            {isCompressingLogo ? (
                              <>
                                <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Optimizing...</span>
                              </>
                            ) : (
                              <Loader2 size={20} className="text-primary animate-spin" />
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
                      <h4 className="text-sm font-bold text-foreground">Workspace Logo</h4>
                      <p className="text-xs text-muted-foreground">Recommended: 400x400px, PNG or JPG.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Name</label>
                      <input
                        className="w-full h-14 bg-secondary border-none rounded-2xl px-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        value={wsName}
                        onChange={e => setWsName(e.target.value)}
                      />
                      {validationErrors.name && (
                        <p className="text-[10px] font-bold text-destructive ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                          {validationErrors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace URL ID (Slug)</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase opacity-40 select-none">/w/</span>
                        <input
                          className="w-full h-14 bg-secondary border-none rounded-2xl pl-12 pr-6 font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                          value={wsSlug}
                          onChange={e => setWsSlug(e.target.value)}
                        />
                      </div>
                      {validationErrors.slug && (
                        <p className="text-[10px] font-bold text-destructive ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                          {validationErrors.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                    <textarea
                      className="w-full h-32 bg-secondary border-none rounded-2xl p-6 font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
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

                {/* Danger Zone */}
                <div className="p-10 pb-16 border-t border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle size={24} className="text-destructive" />
                    <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground">Delete Workspace</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Deleting this workspace will permanently remove all boards, cards, and associated data.
                        This action is irreversible. Please type the workspace name <strong>{activeWorkspace?.name}</strong> to confirm.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <input
                        type="text"
                        value={confirmWsName}
                        onChange={e => setConfirmWsName(e.target.value)}
                        placeholder="Type workspace name to confirm"
                        className="w-full h-14 bg-card border-2 border-destructive/20 rounded-2xl px-6 font-bold text-destructive focus:ring-8 focus:ring-destructive/5 transition-all outline-none placeholder:text-destructive/20"
                      />

                      <button
                        onClick={handleDeleteWorkspace}
                        disabled={loading || confirmWsName !== activeWorkspace?.name}
                        className="btn bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-destructive/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        <span>Delete Workspace Permanently</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-10 pb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                      <Users size={24} className="text-primary" />
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
                      <div key={m.profiles.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-transparent hover:border-border transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-foreground font-bold shadow-sm overflow-hidden">
                            {m.profiles.avatar_url ? (
                              <img src={m.profiles.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              m.profiles.full_name?.[0] || m.profiles.email[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">{m.profiles.full_name || 'Anonymous Member'}</div>
                            <div className="text-xs text-muted-foreground">{m.profiles.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.profiles.id, e.target.value)}
                            className="bg-card border border-border text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:bg-secondary transition-all"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="GUEST">GUEST</option>
                            <option value="CLIENT">CLIENT</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(m.profiles.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
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
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-3 mb-6">
                      <Clock size={20} className="text-primary" />
                      Pending Invitations
                    </h3>
                    <div className="space-y-3">
                      {invitations.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-dashed border-border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-muted-foreground italic font-black shadow-sm border border-border">
                              @
                            </div>
                            <div>
                              <div className="font-bold text-sm text-foreground">{inv.email}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invited as {inv.role}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeInvitation(inv.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
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
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Bell size={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Advanced notifications coming soon</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">We're building these features to give you full control over your FlowBoard experience.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-10 space-y-12">
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter mb-2">Security & Privacy</h3>
                  <p className="text-muted-foreground font-medium">Manage your account security and data privacy settings.</p>
                </div>

                <div className="p-8 bg-secondary/30 rounded-2xl border border-border space-y-6">
                  <div className="flex items-center gap-4 text-warning">
                    <Shield size={24} />
                    <h4 className="font-bold text-foreground uppercase tracking-widest text-xs">Identity Protection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Your identity and sessions are protected by Supabase Auth with enterprise-grade encryption.
                    Multi-factor authentication (MFA) and SSO settings will be available in the next update.
                  </p>
                </div>

                <div className="pt-10 border-t border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <Trash2 size={24} className="text-destructive" />
                    <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Once you delete your account, there is no going back. All your workspaces where you are the owner,
                        all your boards, cards, and personal data will be permanently wiped from our servers.
                        Please be certain.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="btn bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 !rounded-2xl px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-destructive/20 transition-all flex items-center gap-3"
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
