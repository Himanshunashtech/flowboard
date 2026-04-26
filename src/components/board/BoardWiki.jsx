import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '../../lib/supabase';
import { Save, X, BookOpen, AlertCircle, Edit3, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BoardWiki = ({ boardId, isOpen, onClose, isReadOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write board documentation, meeting notes, or project specs here...',
      }),
    ],
    content: '',
    editable: editMode && !isReadOnly,
    onUpdate: ({ editor }) => {
      // Auto-save logic could go here, but we'll use a manual save for now to avoid too many DB calls
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editMode && !isReadOnly);
    }
  }, [editMode, isReadOnly, editor]);

  useEffect(() => {
    const fetchWiki = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('board_wiki')
        .select('*')
        .eq('board_id', boardId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching wiki:', error);
        setError('Failed to load wiki.');
      } else if (data && editor) {
        editor.commands.setContent(data.content);
      }
      setLoading(false);
    };

    if (isOpen && boardId) {
      fetchWiki();
    }
  }, [isOpen, boardId, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    const content = editor.getJSON();
    const contentText = editor.getText();

    const { error } = await supabase
      .from('board_wiki')
      .upsert({ 
        board_id: boardId, 
        content, 
        content_text: contentText,
        updated_at: new Date()
      }, { onConflict: 'board_id' });

    if (error) {
      console.error('Error saving wiki:', error);
      setError('Failed to save wiki.');
    } else {
      setEditMode(false);
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-14 bottom-0 w-[450px] bg-white/95 backdrop-blur-xl border-l border-border-light shadow-2xl z-[60] flex flex-col"
        >
          {/* Header */}
          <div className="h-16 px-6 border-b border-border-light flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Board Wiki</h3>
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-2 rounded-xl transition-all ${editMode ? 'bg-primary text-white shadow-lg' : 'text-text-tertiary hover:bg-bg-secondary'}`}
                  title={editMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
                >
                  {editMode ? <Eye size={18} /> : <Edit3 size={18} />}
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 text-text-tertiary hover:bg-bg-secondary rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Editor/Content Area */}
          <div className="flex-1 overflow-y-auto p-8 prose prose-sm prose-slate max-w-none">
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-8 bg-bg-secondary rounded-xl w-3/4" />
                <div className="h-4 bg-bg-secondary rounded-xl w-full" />
                <div className="h-4 bg-bg-secondary rounded-xl w-full" />
                <div className="h-4 bg-bg-secondary rounded-xl w-5/6" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <AlertCircle size={40} className="text-danger mb-4 opacity-20" />
                <p className="text-sm text-text-tertiary font-medium">{error}</p>
              </div>
            ) : (
              <EditorContent editor={editor} className={`min-h-full outline-none wiki-editor ${!editMode ? 'view-mode' : ''}`} />
            )}
          </div>

          {/* Footer (Actions) */}
          {editMode && !isReadOnly && (
            <div className="p-6 border-t border-border-light bg-bg-secondary/30 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:bg-bg-secondary rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {saving ? (
                   <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Save size={14} />}
                <span>Save Wiki</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BoardWiki;
