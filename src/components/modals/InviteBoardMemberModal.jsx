import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, Search, Shield, Eye, Crown, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ROLE_CONFIG = {
  ADMIN:    { label: 'Admin',    icon: Shield, color: 'text-purple-600 bg-purple-50' },
  MEMBER:   { label: 'Member',   icon: Check,  color: 'text-blue-600 bg-blue-50' },
  OBSERVER: { label: 'Observer', icon: Eye,    color: 'text-gray-600 bg-gray-100' },
};

const InviteBoardMemberModal = ({ boardId, onClose }) => {
  const { members: boardMembers } = useSelector(s => s.board);
  const { workspaces } = useSelector(s => s.workspaces);
  const activeWorkspaceId = useSelector(s => s.workspaces.activeWorkspace?.id);

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

  // Load workspace members on open
  React.useEffect(() => { fetchWorkspaceMembers(); }, []);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Board Members</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage who has access to this board</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              placeholder="Search workspace members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {/* Current Board Members */}
          {boardMembers?.length > 0 && (
            <div className="px-6 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">On this board</p>
              <div className="space-y-1">
                {boardMembers.map(bm => {
                  const profile = bm.profiles;
                  const roleCfg = ROLE_CONFIG[bm.role] || ROLE_CONFIG.MEMBER;
                  return (
                    <div key={bm.user_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 group transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {getInitials(profile)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || profile?.email || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={bm.role}
                          onChange={e => updateRole(bm.user_id, e.target.value)}
                          className="text-xs font-semibold text-gray-600 bg-gray-100 border-none rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                          <option value="OBSERVER">Observer</option>
                        </select>
                        <button
                          onClick={() => removeMember(bm.user_id)}
                          disabled={removing === bm.user_id}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workspace Members to Invite */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Invite from workspace</p>
              <div className="space-y-1">
                {filtered.map(wm => {
                  const isOnBoard = boardMemberIds.includes(wm.user_id);
                  const profile = wm.profiles;
                  return (
                    <div key={wm.user_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                        {getInitials(profile)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || profile?.email || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                      </div>
                      {isOnBoard ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Check size={11} strokeWidth={3} /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => addMember(wm)}
                          disabled={adding === wm.user_id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary-hover transition-colors disabled:opacity-60"
                        >
                          <UserPlus size={12} />
                          {adding === wm.user_id ? 'Adding...' : 'Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loadingWs && (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Loading members...</p>
            </div>
          )}

          {!loadingWs && filtered.length === 0 && search && (
            <div className="p-8 text-center text-sm text-gray-400">
              No members found matching "{search}"
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteBoardMemberModal;
