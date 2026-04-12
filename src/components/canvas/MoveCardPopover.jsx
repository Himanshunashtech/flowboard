import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X, ArrowRight, Copy, ChevronDown, Layout, List as ListIcon, Hash, Check, Search, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Ordering } from '../../lib/ordering';

const MoveCardPopover = ({ card, initialBoard, initialList, mode = 'move', onAction, onClose }) => {
  const dispatch = useDispatch();
  const { workspaces } = useSelector(s => s.workspaces);
  
  const [activeTab, setActiveTab] = useState(mode); // 'move' | 'copy'
  const [selectedBoardId, setSelectedBoardId] = useState(initialBoard?.id);
  const [selectedListId, setSelectedListId] = useState(initialList?.id);
  const [selectedPosition, setSelectedPosition] = useState(0); // 1-indexed for display
  
  const [targetLists, setTargetLists] = useState([]);
  const [targetCards, setTargetCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // All boards across all workspaces
  const allBoards = workspaces.flatMap(ws => (ws.boards || []).map(b => ({ ...b, workspaceName: ws.name })));
  const selectedBoard = allBoards.find(b => b.id === selectedBoardId);

  // Fetch lists when board changes
  useEffect(() => {
    const fetchLists = async () => {
      if (!selectedBoardId) return;
      setLoading(true);
      const { data } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', selectedBoardId)
        .order('position');
      if (data) {
        setTargetLists(data);
        // Default to same list if on same board, else first list
        if (selectedBoardId === initialBoard?.id) {
          setSelectedListId(initialList?.id);
        } else if (data.length > 0) {
          setSelectedListId(data[0].id);
        }
      }
      setLoading(false);
    };
    fetchLists();
  }, [selectedBoardId, initialBoard, initialList]);

  // Fetch cards when list changes to determine positions
  useEffect(() => {
    const fetchCards = async () => {
      if (!selectedListId) return;
      setLoading(true);
      const { data } = await supabase
        .from('cards')
        .select('id, position, title')
        .eq('list_id', selectedListId)
        .eq('is_archived', false)
        .order('position');
      if (data) {
        setTargetCards(data);
        // Default position
        if (selectedListId === initialList?.id) {
          const idx = data.findIndex(c => c.id === card.id);
          setSelectedPosition(idx !== -1 ? idx + 1 : data.length + 1);
        } else {
          setSelectedPosition(data.length + 1);
        }
      }
      setLoading(false);
    };
    fetchCards();
  }, [selectedListId, initialList, card.id]);

  const handleExecute = async () => {
    setIsProcessing(true);
    
    // 1. Calculate the fractional position
    let newPos = '';
    const numericIndex = selectedPosition - 1; // 0-indexed
    
    // If moving to the same list and same position, do nothing but close
    if (activeTab === 'move' && selectedListId === initialList?.id && numericIndex === targetCards.findIndex(c => c.id === card.id)) {
      onClose();
      return;
    }

    // Filter out the current card if we're moving it within the same list to get real index neighbors
    const siblingCards = (selectedListId === initialList?.id && activeTab === 'move')
      ? targetCards.filter(c => c.id !== card.id)
      : targetCards;

    if (siblingCards.length === 0) {
      newPos = Ordering.last(null);
    } else if (numericIndex === 0) {
      newPos = Ordering.first(siblingCards[0]?.position);
    } else if (numericIndex >= siblingCards.length) {
      newPos = Ordering.last(siblingCards[siblingCards.length - 1]?.position);
    } else {
      newPos = Ordering.between(siblingCards[numericIndex - 1]?.position, siblingCards[numericIndex]?.position);
    }

    await onAction({
      type: activeTab,
      boardId: selectedBoardId,
      listId: selectedListId,
      position: newPos,
      numericIndex
    });
    
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="w-80 bg-white rounded-[24px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-border-light overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex bg-bg-secondary p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('move')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'move' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            Move
          </button>
          <button 
            onClick={() => setActiveTab('copy')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'copy' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            Copy
          </button>
        </div>
        <button onClick={onClose} className="p-1.5 text-text-tertiary hover:bg-bg-secondary rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Suggested Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-text-tertiary">
            <Sparkles size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Suggested Destination</span>
          </div>
          <div className="bg-bg-secondary/50 rounded-xl p-3 flex items-center gap-3 border border-border-light/50 opacity-60">
             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-primary">
                <ArrowRight size={14} />
             </div>
             <p className="text-[11px] font-bold text-text-primary">Continue in {initialList?.title}</p>
          </div>
        </section>

        {/* Selectors */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Select Destination</p>
           </div>
           
           <div className="space-y-3">
              {/* Board */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Board</label>
                <div className="relative group">
                  <select 
                    value={selectedBoardId}
                    onChange={e => setSelectedBoardId(e.target.value)}
                    className="w-full h-11 bg-bg-secondary border border-border-light hover:border-brand-primary/40 rounded-xl px-4 text-xs font-bold text-text-primary appearance-none outline-none transition-all cursor-pointer"
                  >
                    {allBoards.map(b => (
                      <option key={b.id} value={b.id}>{b.workspaceName} / {b.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>

              {/* List & Position Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">List</label>
                  <div className="relative group">
                    <select 
                      value={selectedListId}
                      onChange={e => setSelectedListId(e.target.value)}
                      disabled={loading || targetLists.length === 0}
                      className="w-full h-11 bg-bg-secondary border border-border-light hover:border-brand-primary/40 rounded-xl px-4 text-xs font-bold text-text-primary appearance-none outline-none transition-all cursor-pointer disabled:opacity-50"
                    >
                      {targetLists.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                      {targetLists.length === 0 && <option>No lists</option>}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Position</label>
                  <div className="relative group">
                    <select 
                      value={selectedPosition}
                      onChange={e => setSelectedPosition(parseInt(e.target.value))}
                      disabled={loading || !selectedListId}
                      className="w-full h-11 bg-bg-secondary border border-border-light hover:border-brand-primary/40 rounded-xl px-4 text-xs font-bold text-text-primary appearance-none outline-none transition-all cursor-pointer disabled:opacity-50"
                    >
                      {/* If moving within same list, length is targetCards.length. 
                          If moving to new list or copying, length is targetCards.length + 1 */}
                      {Array.from({ length: (selectedListId === initialList?.id && activeTab === 'move') ? targetCards.length : targetCards.length + 1 }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  </div>
                </div>
              </div>
           </div>
        </section>

        {/* Action Button */}
        <button 
          onClick={handleExecute}
          disabled={isProcessing || loading || !selectedBoardId || !selectedListId}
          className="w-full py-4 bg-brand-primary text-white rounded-[18px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : activeTab === 'move' ? 'Relocate Card' : 'Duplicate Card'}
        </button>
      </div>
    </div>
  );
};

export default MoveCardPopover;
