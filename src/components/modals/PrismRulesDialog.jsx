import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  Plus, 
  Zap, 
  AlertCircle,
  Check,
  Palette,
  Settings2,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { updateBoard } from '../../store/slices/boardSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { OPERATORS } from '../../lib/prismEvaluator';

const PRISM_PRESETS = [
  { id: 'red-alert', label: 'Red Alert', bg: '#FFF1F2', border: '#FECACA', text: '#991B1B', glow: true },
  { id: 'ocean-calm', label: 'Ocean Calm', bg: '#F0F9FF', border: '#BAE6FD', text: '#075985', glow: false },
  { id: 'forest-grow', label: 'Forest Grow', bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', glow: false },
  { id: 'amber-warning', label: 'Amber Warning', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', glow: true },
  { id: 'night-mode', label: 'Stealth', bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', glow: false }
];

const PrismRulesDialog = ({ isOpen, onClose, board }) => {
  const dispatch = useDispatch();
  const [rules, setRules] = useState(board?.settings?.prism_rules || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRule = () => {
    const newRule = {
      id: crypto.randomUUID(),
      name: 'New Formatting Protocol',
      condition: { field: 'priority', operator: OPERATORS.EQ, value: 'CRITICAL' },
      style: PRISM_PRESETS[0]
    };
    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleUpdateRule = (id, updates) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newSettings = {
      ...board.settings,
      prism_rules: rules
    };

    const { error } = await supabase
      .from('boards')
      .update({ settings: newSettings })
      .eq('id', board.id);

    if (!error) {
      dispatch(updateBoard({ id: board.id, settings: newSettings }));
      dispatch(addNotification({ message: 'Prism formatting applied', type: 'success' }));
      onClose();
    } else {
      dispatch(addNotification({ message: 'Failed to save Prism rules', type: 'error' }));
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-border-light"
      >
        <div className="p-8 border-b border-border-light flex items-center justify-between bg-bg-secondary/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
               <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tighter">The Prism Engine</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Conditional Formatting Protocols</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-text-tertiary">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {rules.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-bg-secondary rounded-[32px] flex items-center justify-center text-text-tertiary mb-6 opacity-20">
                  <Palette size={40} />
               </div>
               <h3 className="text-lg font-black text-text-primary tracking-tight">No Active Protocols</h3>
               <p className="text-sm text-text-tertiary mt-2 max-w-xs leading-relaxed">Illuminate your data by adding formatting rules based on priorities, lists, or task titles.</p>
            </div>
          ) : (
            rules.map((rule, index) => (
              <motion.div 
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-bg-secondary/40 rounded-[32px] border border-border-light relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-brand-primary shadow-sm border border-border-light">
                      {index + 1}
                    </span>
                    <input 
                      type="text"
                      value={rule.name}
                      onChange={e => handleUpdateRule(rule.id, { name: e.target.value })}
                      className="bg-transparent border-none outline-none text-sm font-black text-text-primary placeholder:text-text-tertiary"
                      placeholder="Protocol Name..."
                    />
                  </div>
                  <button onClick={() => handleRemoveRule(rule.id)} className="p-2 text-text-tertiary hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Field</label>
                      <select 
                        value={rule.condition.field}
                        onChange={e => handleUpdateRule(rule.id, { condition: { ...rule.condition, field: e.target.value }})}
                        className="w-full h-10 bg-white border border-border-light rounded-xl px-3 text-[11px] font-bold outline-none"
                      >
                         <option value="priority">Priority</option>
                         <option value="title">Task Title</option>
                         <option value="list_id">List ID</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Operator</label>
                      <select 
                        value={rule.condition.operator}
                        onChange={e => handleUpdateRule(rule.id, { condition: { ...rule.condition, operator: e.target.value }})}
                        className="w-full h-10 bg-white border border-border-light rounded-xl px-3 text-[11px] font-bold outline-none"
                      >
                         <option value={OPERATORS.EQ}>Is Exactly</option>
                         <option value={OPERATORS.CONTAINS}>Contains</option>
                         <option value={OPERATORS.NEQ}>Is Not</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Value</label>
                      <input 
                        type="text"
                        value={rule.condition.value}
                        onChange={e => handleUpdateRule(rule.id, { condition: { ...rule.condition, value: e.target.value }})}
                        className="w-full h-10 bg-white border border-border-light rounded-xl px-3 text-[11px] font-bold outline-none"
                        placeholder="Condition..."
                      />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Prism Preset</label>
                  <div className="flex flex-wrap gap-2">
                     {PRISM_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleUpdateRule(rule.id, { style: preset })}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${rule.style.id === preset.id ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105' : 'border-border-light hover:border-brand-primary/40'}`}
                          style={{ backgroundColor: preset.bg }}
                        >
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.text }} />
                           <span className="text-[8px] font-black uppercase tracking-tight" style={{ color: preset.text }}>
                             {preset.label}
                           </span>
                           {rule.style.id === preset.id && <Check size={10} style={{ color: preset.text }} />}
                        </button>
                     ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          
          <button 
            onClick={handleAddRule}
            className="w-full pb-6 pt-4 border-2 border-dashed border-border-light rounded-[32px] text-text-tertiary hover:border-brand-primary hover:text-brand-primary transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-bg-secondary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
               <Plus size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Formatting Protocol</span>
          </button>
        </div>

        <div className="p-8 bg-bg-secondary/30 border-t border-border-light flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-border-light rounded-xl flex items-center justify-center text-brand-primary">
                 <AlertCircle size={20} />
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed font-bold max-w-[240px]">
                Rules are evaluated in sequence. Lower rules can override higher ones.
              </p>
           </div>
           
           <button 
            disabled={isSaving}
            onClick={handleSave}
            className="h-14 px-8 bg-brand-primary text-white rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
             {isSaving ? 'Encrypting...' : 'Save Protocols'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrismRulesDialog;
