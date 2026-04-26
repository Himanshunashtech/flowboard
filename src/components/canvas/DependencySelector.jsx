import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search, Hash, X, ArrowRight, CornerDownRight } from 'lucide-react';

const DependencySelector = ({ currentCardId, onSelect, onClose }) => {
  const { cards, lists } = useSelector(state => state.board);
  const [search, setSearch] = useState('');

  const filteredCards = useMemo(() => {
    if (!search) return [];
    return cards
      .filter(c => 
        c.id !== currentCardId && 
        !c.is_archived &&
        c.title.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 8);
  }, [cards, currentCardId, search]);

  return (
    <div className="w-80 bg-white rounded-[24px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-border-light overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Link Dependency</span>
        <button onClick={onClose} className="p-1.5 text-text-tertiary hover:bg-bg-secondary rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-3">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            autoFocus
            className="w-full h-10 bg-bg-secondary border-none rounded-xl pl-9 pr-4 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search cards by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1 min-h-[100px] max-h-[300px] overflow-y-auto pr-1">
          {filteredCards.map(card => {
            const list = lists.find(l => l.id === card.list_id);
            return (
              <button
                key={card.id}
                onClick={() => onSelect(card)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-bg-secondary rounded-xl transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-text-tertiary border border-border-light group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  <Hash size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate">{card.title}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">{list?.title || 'Unknown List'}</p>
                </div>
              </button>
            );
          })}

          {search && filteredCards.length === 0 && (
            <div className="py-10 text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest">No matching cards found</p>
            </div>
          )}

          {!search && (
             <div className="py-10 text-center opacity-30">
               <CornerDownRight size={24} className="mx-auto mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">Type to search the board</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DependencySelector;
