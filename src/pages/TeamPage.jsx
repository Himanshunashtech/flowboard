import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Trash2, 
  Layout, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import { toggleModal } from '../store/slices/uiSlice';
import Skeleton from '../components/ui/Skeleton';

const TeamPage = () => {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals for board/task assignment
  const [selectedMember, setSelectedMember] = useState(null);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [memberBoards, setMemberBoards] = useState([]);

  // Task Management State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [unassignedTasks, setUnassignedTasks] = useState([]);

  useEffect(() => {
    fetchTeamData();
  }, [workspaceSlug]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // 1. Get Workspace
      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('slug', workspaceSlug)
        .single();
      
      if (wsError) throw wsError;
      setWorkspace(ws);

      // 2. Get Members
      const { data: mems, error: memsError } = await supabase
        .from('workspace_members')
        .select('*, profiles(*)')
        .eq('workspace_id', ws.id);
      
      if (memsError) throw memsError;
      setMembers(mems);

      // 3. Get Boards
      const { data: brds, error: brdsError } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', ws.id);
      
      if (brdsError) throw brdsError;
      setBoards(brds || []);

    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('workspace_id', workspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setMembers(prev => prev.map(m => 
        m.user_id === userId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const openBoardManagement = async (member) => {
    setSelectedMember(member);
    // Fetch which boards this member is in
    const { data, error } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', member.user_id);
    
    if (data) {
      setMemberBoards(data.map(d => d.board_id));
      setIsBoardModalOpen(true);
    }
  };

  const toggleBoardAccess = async (boardId) => {
    const isAssigned = memberBoards.includes(boardId);
    
    try {
      if (isAssigned) {
        await supabase
          .from('board_members')
          .delete()
          .eq('board_id', boardId)
          .eq('user_id', selectedMember.user_id);
        
        setMemberBoards(prev => prev.filter(id => id !== boardId));
      } else {
        await supabase
          .from('board_members')
          .insert({
            board_id: boardId,
            user_id: selectedMember.user_id,
            role: 'MEMBER'
          });
        
        setMemberBoards(prev => [...prev, boardId]);
      }
    } catch (error) {
      console.error('Error toggling board access:', error);
    }
  };

  const openTaskManagement = async (member) => {
    setSelectedMember(member);
    setIsTaskModalOpen(true);
    
    // Fetch assigned tasks
    const { data: assigned, error: assignedError } = await supabase
      .from('cards')
      .select('*, boards(title)')
      .in('id', (
        await supabase
          .from('card_assignments')
          .select('card_id')
          .eq('user_id', member.user_id)
      ).data?.map(d => d.card_id) || []);
    
    if (assigned) setAssignedTasks(assigned);

    // Fetch unassigned tasks in the same team
    const { data: unassigned, error: unassignedError } = await supabase
      .from('cards')
      .select('*, boards(title)')
      .eq('board_id', (await supabase.from('boards').select('id').eq('workspace_id', workspace.id)).data?.[0]?.id);
      // Simplify: just fetch some cards from boards in this workspace
    
    const boardIds = boards.map(b => b.id);
    const { data: teamCards } = await supabase
      .from('cards')
      .select('*, boards(title)')
      .in('board_id', boardIds)
      .limit(50);
    
    if (teamCards) {
       // Filter out those already assigned to this user
       const assignedIds = new Set(assigned?.map(t => t.id) || []);
       setUnassignedTasks(teamCards.filter(t => !assignedIds.has(t.id)));
    }
  };

  const assignTask = async (cardId) => {
    try {
      const { error } = await supabase
        .from('card_assignments')
        .insert({
          card_id: cardId,
          user_id: selectedMember.user_id,
          assigned_by: user.id
        });
      
      if (error) throw error;
      
      const task = unassignedTasks.find(t => t.id === cardId);
      setAssignedTasks(prev => [...prev, task]);
      setUnassignedTasks(prev => prev.filter(t => t.id !== cardId));
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const unassignTask = async (cardId) => {
    try {
      const { error } = await supabase
        .from('card_assignments')
        .delete()
        .eq('card_id', cardId)
        .eq('user_id', selectedMember.user_id);
      
      if (error) throw error;
      
      const task = assignedTasks.find(t => t.id === cardId);
      setUnassignedTasks(prev => [...prev, task]);
      setAssignedTasks(prev => prev.filter(t => t.id !== cardId));
    } catch (error) {
      console.error('Error unassigning task:', error);
    }
  };

  const filteredMembers = members.filter(m => 
    m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="p-10 space-y-10">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 rounded-[32px]" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-10 max-w-7xl mx-auto min-h-screen bg-white/30 backdrop-blur-sm">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Users size={24} />
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">
                {workspace?.name} Team
              </h1>
            </div>
            <p className="text-text-secondary max-w-md font-medium">
              Manage your team members, define their roles, and assign them to specific projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search team..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 h-14 bg-white border border-border-light rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none w-64"
              />
            </div>
            <button 
              onClick={() => dispatch(toggleModal({ modalName: 'memberInvite', isOpen: true }))}
              className="h-14 px-8 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <UserPlus size={16} />
              Invite
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member) => (
            <div key={member.user_id} className="bg-white border border-border-light rounded-[40px] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2">
                 <button 
                   onClick={() => handleRemoveMember(member.user_id)}
                   className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                   title="Remove from Team"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-primary p-1 mb-6 shadow-xl shadow-primary/20">
                  <div className="w-full h-full rounded-[28px] bg-white flex items-center justify-center text-3xl font-black text-primary">
                    {(member.profiles?.full_name || member.profiles?.email || 'U')[0].toUpperCase()}
                  </div>
                </div>

                <h3 className="text-xl font-black text-foreground mb-1 truncate w-full px-4">
                  {member.profiles?.full_name || 'Anonymous'}
                </h3>
                <p className="text-sm font-medium text-text-tertiary mb-6 truncate w-full px-4">
                  {member.profiles?.email}
                </p>

                <div className="w-full space-y-3 pt-6 border-t border-border-light/50">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Access Level</span>
                    <select 
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                      disabled={member.user_id === user?.id}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-primary outline-none cursor-pointer hover:bg-primary/5 px-2 py-1 rounded-lg"
                    >
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => openBoardManagement(member)}
                    className="w-full h-12 flex items-center justify-between px-4 bg-bg-secondary hover:bg-bg-tertiary rounded-2xl transition-all group/btn"
                  >
                    <div className="flex items-center gap-2">
                      <Layout size={14} className="text-text-tertiary group-hover/btn:text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Boards</span>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary" />
                  </button>

                  <button 
                    onClick={() => openTaskManagement(member)}
                    className="w-full h-12 flex items-center justify-between px-4 bg-bg-secondary hover:bg-bg-tertiary rounded-2xl transition-all group/btn"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-text-tertiary group-hover/btn:text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Tasks</span>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Board Assignment Modal */}
        {isBoardModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground">Assign Boards</h3>
                  <p className="text-xs font-bold text-text-tertiary mt-1">
                    Manage project access for {selectedMember?.profiles?.full_name}
                  </p>
                </div>
                <button onClick={() => setIsBoardModalOpen(false)} className="p-2 hover:bg-bg-secondary rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-3 max-h-[400px] overflow-y-auto">
                {boards.length === 0 ? (
                  <p className="text-center py-10 text-xs font-black uppercase text-text-tertiary">No boards found</p>
                ) : boards.map(board => (
                  <div key={board.id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-3xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: board.background_value }} />
                      <span className="text-sm font-bold text-foreground">{board.title}</span>
                    </div>
                    <button 
                      onClick={() => toggleBoardAccess(board.id)}
                      className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${memberBoards.includes(board.id) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-tertiary hover:bg-primary/5 hover:text-primary'}`}
                    >
                      {memberBoards.includes(board.id) ? 'Assigned' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task Management Modal */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground">Assign Tasks</h3>
                  <p className="text-xs font-bold text-text-tertiary mt-1">
                    View and manage tasks for {selectedMember?.profiles?.full_name}
                  </p>
                </div>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-bg-secondary rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary px-2">Assigned Tasks</h4>
                   {assignedTasks.length === 0 ? (
                     <div className="p-8 text-center bg-bg-secondary rounded-3xl border-2 border-dashed border-border-light">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-text-tertiary opacity-30" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">No tasks assigned</p>
                     </div>
                   ) : assignedTasks.map(task => (
                     <div key={task.id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl">
                        <div>
                           <p className="text-sm font-bold text-foreground">{task.title}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{task.boards?.title}</p>
                        </div>
                        <button 
                          onClick={() => unassignTask(task.id)}
                          className="p-2 text-text-tertiary hover:text-red-500 hover:bg-white rounded-xl transition-all"
                        >
                           <X size={16} />
                        </button>
                     </div>
                   ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-border-light/50">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary px-2">Unassigned Tasks in Team</h4>
                   {unassignedTasks.length === 0 ? (
                      <p className="text-center py-6 text-xs text-text-tertiary italic">No available tasks to assign</p>
                   ) : unassignedTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-border-light rounded-2xl hover:border-primary/20 transition-all">
                         <div>
                            <p className="text-sm font-bold text-foreground">{task.title}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{task.boards?.title}</p>
                         </div>
                         <button 
                           onClick={() => assignTask(task.id)}
                           className="h-10 px-4 bg-bg-secondary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                         >
                            Assign
                         </button>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TeamPage;
