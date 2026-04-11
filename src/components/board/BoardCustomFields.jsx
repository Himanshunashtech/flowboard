import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Type, 
  Hash, 
  Calendar, 
  List, 
  CheckSquare, 
  Link as LinkIcon, 
  Star,
  Settings2,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const FIELD_TYPES = [
  { id: 'TEXT', label: 'Text', icon: Type, desc: 'Single line of text' },
  { id: 'NUMBER', label: 'Number', icon: Hash, desc: 'Value or amount' },
  { id: 'DATE', label: 'Date', icon: Calendar, desc: 'Date and time selector' },
  { id: 'DROPDOWN', label: 'Dropdown', icon: List, desc: 'Select from options' },
  { id: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare, desc: 'Yes/No toggle' },
  { id: 'URL', label: 'URL', icon: LinkIcon, desc: 'Clickable link' },
  { id: 'RATING', label: 'Rating', icon: Star, desc: 'Star rating (1-5)' },
];

const BoardCustomFields = ({ boardId }) => {
  const [fields, setFields] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('TEXT');

  useEffect(() => {
    fetchFields();
  }, [boardId]);

  const fetchFields = async () => {
    const { data } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('board_id', boardId)
      .order('position');
    if (data) setFields(data);
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;
    const { data } = await supabase
      .from('custom_fields')
      .insert({
        board_id: boardId,
        name: newFieldName,
        type: newFieldType,
        position: fields.length
      })
      .select()
      .single();

    if (data) {
      setFields([...fields, data]);
      setNewFieldName('');
      setShowAdd(false);
    }
  };

  const handleRemoveField = async (id) => {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', id);
    if (!error) setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary">
          <Settings2 size={14} />
          <span>Custom Fields</span>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-1.5 bg-brand-primary text-white rounded-lg hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => {
          const typeInfo = FIELD_TYPES.find(t => t.id === field.type);
          const Icon = typeInfo?.icon || Type;
          return (
            <div key={field.id} className="flex items-center justify-between p-4 bg-bg-secondary/50 rounded-2xl border border-transparent hover:border-border-light transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-text-tertiary shadow-sm group-hover:text-brand-primary transition-colors">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">{field.name}</p>
                  <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-widest">{field.type}</p>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveField(field.id)}
                className="p-2 text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {fields.length === 0 && !showAdd && (
          <div className="text-center py-8 border-2 border-dashed border-border-medium rounded-2xl">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">No custom fields yet</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-text-primary tracking-tight">Create Field</h3>
                <button onClick={() => setShowAdd(false)} className="text-text-tertiary hover:text-text-primary"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Field Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Budget, Priority Score..."
                    className="w-full h-14 bg-bg-secondary border-none rounded-2xl px-6 font-bold text-text-primary transition-all outline-none focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Field Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FIELD_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setNewFieldType(t.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          newFieldType === t.id ? 'border-brand-primary bg-brand-primary/5' : 'border-bg-secondary hover:border-border-light'
                        }`}
                      >
                        <t.icon size={16} className={newFieldType === t.id ? 'text-brand-primary' : 'text-text-tertiary'} />
                        <span className={`text-[11px] font-bold ${newFieldType === t.id ? 'text-brand-primary' : 'text-text-primary'}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddField}
                className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Add Field
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BoardCustomFields;
