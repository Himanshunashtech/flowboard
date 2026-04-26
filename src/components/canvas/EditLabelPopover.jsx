import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Check } from 'lucide-react';

const LABEL_COLORS = [
  '#BDF3E0', '#F1E59C', '#F3D9A5', '#FAD1D1', '#E5DAFB',
  '#4BC99C', '#ECD233', '#FFA500', '#F87171', '#C084FC',
  '#1B835F', '#8F7600', '#C26300', '#C53030', '#9333EA',
  '#DAE7FF', '#CCF1FF', '#DAFBBE', '#FFD5F0', '#E2E8F0',
  '#60A5FA', '#67E8F9', '#84CC16', '#EC4899', '#94A3B8',
  '#2563EB', '#0891B2', '#4D7C0F', '#9D174D', '#475569',
];

const EditLabelPopover = ({ 
  label, 
  onSave, 
  onDelete, 
  onBack, 
  onClose 
}) => {
  const [title, setTitle] = useState(label?.name || '');
  const [selectedColor, setSelectedColor] = useState(label?.color || LABEL_COLORS[0]);

  useEffect(() => {
    if (label) {
      setTitle(label.name || '');
      setSelectedColor(label.color);
    }
  }, [label]);

  const handleSave = () => {
    onSave({ 
      id: label?.id, 
      name: title, 
      color: selectedColor 
    });
  };

  return (
    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-2 py-3 border-b border-gray-50 flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="flex-1 text-center text-sm font-bold text-gray-700">
          {label?.id ? 'Edit label' : 'Create label'}
        </span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5">
        {/* Preview */}
        <div 
          className="w-full h-8 rounded-lg flex items-center px-4 shadow-inner"
          style={{ backgroundColor: selectedColor || '#eee' }}
        >
           <span className="text-xs font-bold text-white drop-shadow-sm truncate">{title || 'Label Preview'}</span>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Type label title..."
          />
        </div>

        {/* Color Grid */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select a color</label>
          <div className="grid grid-cols-5 gap-2">
            {LABEL_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`h-8 rounded-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95 shadow-sm
                  ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110 z-10' : 'opacity-90 hover:opacity-100'}`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check size={14} className="text-white drop-shadow-md" strokeWidth={4} />}
              </button>
            ))}
          </div>
        </div>

        {/* Remove Color Action */}
        <button 
          onClick={() => setSelectedColor(null)}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} />
          Remove color
        </button>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3">
        <button 
          onClick={handleSave}
          className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          Save
        </button>
        {label?.id && (
          <button 
            onClick={onDelete}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EditLabelPopover;
