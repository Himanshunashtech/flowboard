import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Play, 
  X,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Activity,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleModal } from '../../store/slices/uiSlice';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const AutomationLogs = ({ automationId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('automation_id', automationId)
        .order('triggered_at', { ascending: false })
        .limit(5);
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [automationId]);

  if (loading) return <div className="h-20 animate-pulse bg-bg-secondary rounded-xl" />;

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="flex items-center justify-between text-[10px] font-bold py-2 border-b border-border-light last:border-0">
          <div className="flex items-center gap-2">
            {log.success ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-danger" />}
            <span className="text-text-secondary">{log.actions_taken?.type || 'Execution'}</span>
          </div>
          <span className="text-text-tertiary">{formatDistanceToNow(new Date(log.triggered_at), { addSuffix: true })}</span>
        </div>
      ))}
      {logs.length === 0 && <p className="text-[10px] text-text-tertiary italic">No executions recorded yet.</p>}
    </div>
  );
};

const AutomationsModal = () => {
  const dispatch = useDispatch();
  const { activeBoard, lists } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);
  const { modalData } = useSelector((state) => state.ui);
  
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    trigger: 'CARD_CREATED',
    action: 'NOTIFY_USER',
    targetListId: '',
    conditions: []
  });

  const cardId = modalData?.automations?.cardId;

  useEffect(() => {
    if (activeBoard?.id) {
      fetchAutomations();
      if (lists?.length > 0 && !newProtocol.targetListId) {
        setNewProtocol(prev => ({ ...prev, targetListId: lists[0].id }));
      }
    }
  }, [activeBoard?.id, lists]);

  const fetchAutomations = async () => {
    if (!activeBoard?.id) return;
    setLoading(true);
    let query = supabase
      .from('automations')
      .select('*')
      .eq('board_id', activeBoard.id)
      .order('created_at', { ascending: false });
    
    // If cardId is provided, we could potentially filter rules specific to this card
    // However, Flowboard automations are currently board-level. 
    // We'll show all board automations but highlight that we're in card context.
    
    const { data } = await query;
    if (data) setAutomations(data);
    setLoading(false);
  };

  const toggleAutomation = async (id, status) => {
    const { error } = await supabase
      .from('automations')
      .update({ is_enabled: !status })
      .eq('id', id);
    
    if (!error) {
      setAutomations(automations.map(a => a.id === id ? { ...a, is_enabled: !status } : a));
    }
  };

  const deleteAutomation = async (id) => {
    if (!window.confirm('Delete this protocol?')) return;
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (!error) setAutomations(automations.filter(a => a.id !== id));
  };

  const handleClose = () => {
    dispatch(toggleModal({ modalName: 'automations', isOpen: false }));
  };

  if (!activeBoard) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Creation/Controls */}
        <div className="w-full md:w-[40%] p-10 bg-bg-secondary/40 border-r border-border-light flex flex-col relative overflow-hidden">
           <div className="relative z-10 space-y-8 flex-1">
             <header className="space-y-4">
                <div className="w-12 h-12 bg-warning/10 text-warning rounded-2xl flex items-center justify-center shadow-inner">
                   <Zap size={24} className="fill-current" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none">
                  Workflow <br />Forge.
                </h2>
                <p className="text-text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} />
                  {automations.filter(a => a.is_enabled).length} Active Protocols
                </p>
             </header>

             {isCreating ? (
               <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Protocol Name</label>
                    <input 
                      autoFocus
                      className="w-full h-12 bg-white border border-border-light rounded-xl px-5 font-bold text-sm text-foreground focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                      placeholder="e.g. Notify on move" 
                      value={newProtocol.name}
                      onChange={e => setNewProtocol({ ...newProtocol, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Trigger</label>
                      <select 
                        className="w-full h-12 bg-white border border-border-light rounded-xl px-4 font-bold text-[10px] appearance-none"
                        value={newProtocol.trigger}
                        onChange={e => setNewProtocol({ ...newProtocol, trigger: e.target.value })}
                      >
                        <option value="CARD_CREATED">Task Created</option>
                        <option value="CARD_MOVED_TO_LIST">Moved To List</option>
                        <option value="CARD_ARCHIVED">Task Archived</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Action</label>
                      <select 
                        className="w-full h-12 bg-white border border-border-light rounded-xl px-4 font-bold text-[10px] appearance-none"
                        value={newProtocol.action}
                        onChange={e => setNewProtocol({ ...newProtocol, action: e.target.value })}
                      >
                        <option value="SET_DUE_DATE_RELATIVE">Set Due Date (+7d)</option>
                        <option value="ADD_COMMENT">Post System Comment</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsCreating(false)}
                      className="flex-1 h-12 bg-bg-tertiary text-text-secondary rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={!newProtocol.name}
                      onClick={async () => {
                        const { data, error } = await supabase.from('automations').insert({
                          board_id: activeBoard.id,
                          created_by: user.id,
                          name: newProtocol.name,
                          trigger_type: newProtocol.trigger,
                          actions: [{ type: newProtocol.action, config: {} }],
                          conditions: [],
                          is_enabled: true
                        }).select().single();
                        if (data) {
                          setAutomations([data, ...automations]);
                          setIsCreating(false);
                          setNewProtocol({ ...newProtocol, name: '' });
                        }
                      }}
                      className="flex-2 h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      Forge Protocol
                    </button>
                  </div>
               </div>
             ) : (
               <div className="space-y-6">
                 <button 
                   onClick={() => setIsCreating(true)}
                   className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   <Plus size={18} strokeWidth={3} />
                   Initialize Protocol
                 </button>
                 <div className="p-6 bg-warning/5 rounded-[32px] border border-warning/10">
                    <p className="text-[10px] text-warning font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                       <AlertCircle size={14} />
                       Context Aware
                    </p>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-bold">
                       {cardId 
                         ? "You are managing automations in the context of a specific task. Rules created here apply to the entire board workflow."
                         : "Protocols forged here execute across all board members and tasks instantly."}
                    </p>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Right Side: List of Automations */}
        <div className="w-full md:w-[60%] p-10 flex flex-col bg-white relative">
           <button 
             onClick={handleClose}
             className="absolute top-8 right-8 p-3 text-text-tertiary hover:bg-bg-secondary hover:text-foreground rounded-2xl transition-all z-20"
           >
             <X size={24} />
           </button>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-6">Active Board Protocols</h3>
              
              {loading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-bg-secondary animate-pulse rounded-3xl" />)}
                </div>
              ) : automations.length === 0 ? (
                <div className="py-20 text-center bg-bg-secondary/30 rounded-[32px] border-2 border-dashed border-border-light">
                   <Zap size={40} className="mx-auto text-text-tertiary opacity-20 mb-4" />
                   <p className="text-xs font-bold text-text-tertiary">No protocols forged for this board yet.</p>
                </div>
              ) : (
                automations.map(auto => (
                  <div 
                    key={auto.id}
                    className={`p-6 rounded-[32px] border transition-all group ${auto.is_enabled ? 'bg-white border-border-light shadow-sm hover:shadow-md' : 'bg-bg-secondary/30 border-transparent opacity-50 grayscale'}`}
                  >
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-xl ${auto.is_enabled ? 'bg-warning/10 text-warning' : 'bg-bg-tertiary text-text-tertiary'}`}>
                              <Zap size={16} className={auto.is_enabled ? 'fill-current' : ''} />
                           </div>
                           <h4 className="font-black text-sm text-foreground tracking-tight">{auto.name}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => toggleAutomation(auto.id, auto.is_enabled)}
                             className={`w-10 h-6 rounded-full p-1 transition-all ${auto.is_enabled ? 'bg-primary' : 'bg-bg-tertiary'}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${auto.is_enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                           </button>
                           <button onClick={() => deleteAutomation(auto.id)} className="p-2 text-text-tertiary hover:text-danger rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-4">
                        <span className="flex items-center gap-1.5"><ArrowRight size={10} className="rotate-90" /> {auto.trigger_type}</span>
                        <span className="w-1 h-1 bg-border-medium rounded-full" />
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={10} /> {auto.actions?.[0]?.type}</span>
                     </div>

                     <div className="pt-4 border-t border-border-light flex items-center justify-between">
                        <span className="text-[9px] font-bold text-text-tertiary">Executions: {auto.run_count || 0}</span>
                        <button 
                          onClick={() => setExpandedLogs(p => ({ ...p, [auto.id]: !p[auto.id] }))}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                        >
                           <History size={12} />
                           {expandedLogs[auto.id] ? 'Hide Stream' : 'Activity Stream'}
                        </button>
                     </div>

                     <AnimatePresence>
                        {expandedLogs[auto.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-border-light overflow-hidden"
                          >
                             <AutomationLogs automationId={auto.id} />
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                ))
              )}
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutomationsModal;
