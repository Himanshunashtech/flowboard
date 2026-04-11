import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import { updateCard, updateList } from '../store/slices/boardSlice';
import { addNotification } from '../store/slices/uiSlice';

export const useUndoRedo = () => {
  const [history, setHistory] = useState([]);
  const dispatch = useDispatch();

  const pushAction = useCallback((action) => {
    // action: { typePath, undoData, redoData, executeUndo, executeRedo }
    setHistory(prev => [action, ...prev].slice(0, 50)); // Limit to 50 steps
  }, []);

  const undo = useCallback(async () => {
    if (history.length === 0) return;

    const [action, ...rest] = history;
    setHistory(rest);

    try {
      await action.undo();
      dispatch(addNotification({ message: 'Action undone', type: 'info' }));
    } catch (error) {
      console.error('Undo failed:', error);
      dispatch(addNotification({ message: 'Failed to undo action', type: 'error' }));
    }
  }, [history, dispatch]);

  // Global Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
            // redo logic would go here
        } else {
            e.preventDefault();
            undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  return { pushAction, undo };
};

// Specialized Card Move Action Creator
export const createMoveAction = (cardId, oldListId, oldPos, newListId, newPos) => ({
  undo: async () => {
    // DB Update
    await supabase.from('cards').update({ list_id: oldListId, position: oldPos }).eq('id', cardId);
    // Redux Update (Real-time might handle this, but optimistic is better)
    // Actually, Realtime will broadcast this back to us.
  },
  redo: async () => {
    await supabase.from('cards').update({ list_id: newListId, position: newPos }).eq('id', cardId);
  }
});
