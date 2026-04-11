import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Play, 
  Settings2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  History,
  Activity
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';
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

const AutomationBuilder = () => {
  const { activeBoard } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  useEffect(() => {
    if (activeBoard) fetchAutomations();
  }, [activeBoard]);

  const fetchAutomations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('automations')
      .select('*')
      .eq('board_id', activeBoard.id)
      .order('created_at', { ascending: false });
    
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
    if (!window.confirm('Are you sure you want to delete this automation?')) return;
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (!error) setAutomations(automations.filter(a => a.id !== id));
  };

  const runAutomationManually = async (auto) => {
    // Top 100 Engineer implementation: In a real system, this would call an Edge Function.
    // Here we'll simulate a manual execution log for the first card in the board.
    const { data: cards } = await supabase.from('cards').select('id').eq('board_id', activeBoard.id).limit(1);
    if (!cards || cards.length === 0) {
      alert('Attach a card to the board to test this automation.');
      return;
    }

    const { error } = await supabase.from('automation_logs').insert({
      automation_id: auto.id,
      card_id: cards[0].id,
      success: true,
      actions_taken: auto.actions[0]
    });

    if (!error) {
       alert('Manual execution simulated successfully.');
       fetchAutomations();
    }
  };

  return (
    <AppLayout>
      <div className="p-10 max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-3xl flex items-center justify-center shadow-inner">
               <Zap size={32} className="fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-black mb-1 text-text-primary tracking-tighter">Workflow Forge</h1>
              <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} />
                {automations.filter(a => a.is_enabled).length} Active Board Protocols
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="h-14 px-8 bg-brand-primary text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} />
            Initialize Protocol
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {automations.map(auto => (
            <motion.div 
              layout
              key={auto.id} 
              className={`p-10 bg-white border rounded-[48px] transition-all duration-500 overflow-hidden relative group ${auto.is_enabled ? 'border-border-light shadow-sm hover:shadow-2xl hover:border-brand-primary/20' : 'border-border-light opacity-50 bg-bg-secondary/30 grayscale'}`}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl transition-all ${auto.is_enabled ? 'bg-warning/10 text-warning ring-8 ring-warning/5' : 'bg-bg-tertiary text-text-tertiary'}`}>
                    <Zap size={28} className={auto.is_enabled ? 'fill-current' : ''} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-text-primary tracking-tight">{auto.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${auto.is_enabled ? 'bg-success/10 text-success' : 'bg-bg-tertiary text-text-tertiary'}`}>
                          {auto.is_enabled ? 'Online' : 'Vaulted'}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleAutomation(auto.id, auto.is_enabled)}
                      className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative ${auto.is_enabled ? 'bg-brand-primary shadow-inner' : 'bg-bg-tertiary'}`}
                    >
                       <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 transform ${auto.is_enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteAutomation(auto.id)} className="p-3 text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-4 mb-10">
                <div className="flex-1 w-full p-8 bg-bg-secondary/40 rounded-[32px] border border-border-light/50 group-hover:bg-white group-hover:border-brand-primary/10 transition-all">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Event Trigger</span>
                  <div className="flex items-center gap-3 font-bold text-text-primary text-sm">
                     <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                        <ArrowRight size={14} className="rotate-90" />
                     </div>
                     {auto.trigger_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="lg:rotate-0 rotate-90 text-text-tertiary group-hover:text-brand-primary transition-colors p-3">
                  <ArrowRight size={24} strokeWidth={3} />
                </div>
                <div className="flex-1 w-full p-8 bg-bg-secondary/40 rounded-[32px] border border-border-light/50 group-hover:bg-white group-hover:border-brand-primary/10 transition-all">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">System Action</span>
                  <div className="flex items-center gap-3 font-bold text-text-primary text-sm">
                     <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-success shadow-sm">
                        <CheckCircle2 size={14} />
                     </div>
                     {auto.actions?.[0]?.type?.replace(/_/g, ' ') || 'No Action'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-bg-secondary/30 rounded-3xl border border-border-light/50">
                <div className="flex items-center gap-8 text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Clock size={14} /> Last run: {auto.last_run_at ? formatDistanceToNow(new Date(auto.last_run_at), { addSuffix: true }) : 'Never'}</span>
                  <span className="flex items-center gap-2"><Activity size={14} /> Executions: {auto.run_count || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setExpandedLogs(p => ({ ...p, [auto.id]: !p[auto.id] }))}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline px-4"
                   >
                     <History size={12} />
                     {expandedLogs[auto.id] ? 'Hide Logs' : 'View Logs'}
                   </button>
                   <button 
                    onClick={() => runAutomationManually(auto)}
                    className="h-10 px-6 bg-white border border-border-light text-text-primary rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all shadow-sm"
                   >
                     <Play size={12} className="fill-current" />
                     Test Run
                   </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedLogs[auto.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-border-light"
                  >
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-4">Execution Stream</p>
                     <AutomationLogs automationId={auto.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {automations.length === 0 && !loading && (
             <div className="py-20 text-center bg-bg-secondary/30 rounded-[48px] border-4 border-dashed border-border-light">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-text-tertiary shadow-inner">
                   <Zap size={40} className="opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">No automations found</h3>
                <p className="text-sm text-text-tertiary mt-2">Start by initializing your first system protocol.</p>
             </div>
          )}
        </div>

        <AnimatePresence>
          {isCreating && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-text-primary/20 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                onClick={() => setIsCreating(false)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 40 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl p-12 border border-border-light relative overflow-hidden"
                >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-3xl font-black text-text-primary tracking-tighter">Initialize Protocol</h2>
                   <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-bg-secondary rounded-xl transition-all"><XCircle size={24} className="text-text-tertiary" /></button>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Protocol Name</label>
                    <input className="w-full h-14 bg-bg-secondary border-none rounded-2xl px-6 font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none" placeholder="e.g. Priority Auto-Escalation" id="rule-name" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Trigger Event</label>
                        <select className="w-full h-14 bg-bg-secondary border-none rounded-2xl px-6 font-bold text-xs appearance-none focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none" id="rule-trigger">
                          <option value="CARD_CREATED">Task Created</option>
                          <option value="CARD_MOVED_TO_LIST">Moved To List</option>
                          <option value="CARD_ARCHIVED">Task Archived</option>
                          <option value="LABEL_ADDED">Label Applied</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">System Action</label>
                        <select className="w-full h-14 bg-bg-secondary border-none rounded-2xl px-6 font-bold text-xs appearance-none focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none" id="rule-action">
                          <option value="NOTIFY_USER">Notify Assignee</option>
                          <option value="ASSIGN_TAG">Apply Tag</option>
                          <option value="ARCHIVE">Archive Protocol</option>
                          <option value="SET_PRIORITY">Set Priority</option>
                        </select>
                     </div>
                  </div>

                  <div className="p-6 bg-brand-primary/5 rounded-[32px] border border-brand-primary/10">
                     <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Engineering Note
                     </p>
                     <p className="text-[11px] text-text-secondary leading-relaxed font-bold">
                        This protocol will execute instantly across all board members. Ensure terminal conditions are set correctly to avoid infinite execution loops.
                     </p>
                  </div>

                  <button 
                    onClick={async () => {
                      const name = document.getElementById('rule-name').value;
                      const trigger = document.getElementById('rule-trigger').value;
                      const action = document.getElementById('rule-action').value;
                      if (!name) return;
                      
                      const { data } = await supabase.from('automations').insert({
                        board_id: activeBoard.id,
                        created_by: user.id,
                        name: name,
                        trigger_type: trigger,
                        actions: [{ type: action, config: {} }],
                        is_enabled: true
                      }).select().single();
                      
                      if (data) {
                        setAutomations([data, ...automations]);
                        setIsCreating(false);
                      }
                    }}
                    className="w-full h-16 bg-brand-primary text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Forge Protocol
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default AutomationBuilder;

