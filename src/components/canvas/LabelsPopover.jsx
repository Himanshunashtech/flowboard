import React, { useState } from 'react';
import { X, Search, Edit3, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LabelsPopover = ({ 
  labels, 
  cardLabels, 
  onToggleLabel, 
  onClose, 
  onCreateNewLabel, 
  onEditLabel 
}) => {
  const [search, setSearch] = useState('');
  const [colorblindMode, setColorblindMode] = useState(false);

  const filteredLabels = labels?.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Labels</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            autoFocus
          />
        </div>
      </div>

      {/* Labels List */}
      <div className="px-3 pb-3 max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1">Labels</p>
        {filteredLabels.map((label) => {
          const isActive = cardLabels.includes(label.id);
          return (
            <div key={label.id} className="group flex items-center gap-2">
              {/* Checkbox */}
              <button 
                onClick={() => onToggleLabel(label.id)}
                className={`w-5 h-5 rounded border transition-all flex items-center justify-center shrink-0
                  ${isActive ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                {isActive && <Check size={12} strokeWidth={4} />}
              </button>

              {/* Label Bar */}
              <button
                onClick={() => onToggleLabel(label.id)}
                className="flex-1 h-8 rounded-lg flex items-center px-3 relative overflow-hidden transition-transform active:scale-[0.98]"
                style={{ backgroundColor: label.color }}
              >
                <span className="text-[11px] font-bold text-white truncate drop-shadow-sm">
                  {label.name || (colorblindMode ? `Color: ${label.color}` : '')}
                </span>
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Check size={14} className="text-white opacity-80" strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Edit Icon */}
              <button 
                onClick={() => onEditLabel(label)}
                className="p-1.5 opacity-40 group-hover:opacity-100 hover:bg-gray-100 rounded-lg text-gray-600 transition-all"
              >
                <Edit3 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-gray-50/50 border-t border-gray-100 space-y-2">
        <button 
          onClick={onCreateNewLabel}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Create a new label
        </button>
        <button 
          onClick={() => setColorblindMode(!colorblindMode)}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
        >
          {colorblindMode ? 'Disable' : 'Enable'} colorblind friendly mode
        </button>
      </div>
    </div>
  );
};

export default LabelsPopover;
