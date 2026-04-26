import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Layout, 
  Trello, 
  User, 
  Command, 
  ArrowRight,
  Clock,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const UniversalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ boards: [], cards: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ boards: [], cards: [] });
      return;
    }

    setLoading(true);
    
    try {
      // 1. Keyword search using Postgres Full-Text Search RPC
      const { data: cardResults, error: cardError } = await supabase.rpc('search_cards_fulltext', {
        search_query: searchQuery,
        match_count: 10
      });

      // 2. Fallback or parallel search for boards (simple ilike is fine for boards as there are fewer)
      const { data: boardResults } = await supabase
        .from('boards')
        .select('id, title, workspace_id, workspaces(slug)')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (cardError) console.error('Search error:', cardError);

      setResults({
        boards: boardResults || [],
        cards: cardResults || []
      });
    } catch (err) {
      console.error('Search unexpected error:', err);
    } finally {
      setLoading(false);
      setSelectedIndex(0);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const allResults = [...results.boards.map(b => ({ ...b, type: 'board' })), ...results.cards.map(c => ({ ...c, type: 'card' }))];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      const selected = allResults[selectedIndex];
      if (selected) handleNavigate(selected);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNavigate = (item) => {
    if (item.type === 'board') {
      navigate(`/w/${item.workspaces.slug}/b/${item.id}`);
    } else {
      const slug = item.boards?.workspaces?.slug || 'default';
      navigate(`/w/${slug}/b/${item.board_id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-md z-[500]"
          />
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card rounded-[32px] shadow-2xl z-[501] overflow-hidden border border-border"
            onKeyDown={handleKeyDown}
          >
            <div className="p-6 border-b border-border flex items-center gap-4 relative">
              <div className={`transition-colors ${loading ? 'text-primary animate-pulse' : 'text-primary'}`}>
                {loading ? <Zap size={24} className="fill-current" /> : <Search size={24} />}
              </div>
               <input 
                autoFocus
                placeholder="Search for boards, cards, or tasks..."
                className="flex-1 bg-transparent border-none outline-none font-bold text-lg text-foreground placeholder:text-muted-foreground/50"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                  <Command size={10} />
                  <span>ESC</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all"
                  title="Close Search"
                >
                  <X size={18} />
                </button>
               </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar">
               {query.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary/50 rounded-[20px] flex items-center justify-center mx-auto text-muted-foreground shadow-inner">
                     <Clock size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight">Recent Searches</h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">Type anything to find your projects and tasks across the workspace.</p>
                </div>
              ) : allResults.length > 0 ? (
                <div className="space-y-6 px-2">
                   {results.boards.length > 0 && (
                    <section className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 opacity-50">Boards</p>
                       {results.boards.map((board, idx) => (
                         <div 
                          key={board.id}
                           onClick={() => handleNavigate({ ...board, type: 'board' })}
                          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${selectedIndex === idx ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-secondary'}`}
                         >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${selectedIndex === idx ? 'bg-background/20' : 'bg-primary/10'}`}>
                                <Trello size={18} className={selectedIndex === idx ? 'text-primary-foreground' : 'text-primary'} />
                              </div>
                               <span className="font-bold text-sm tracking-tight">{board.title}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedIndex === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>Board</span>
                         </div>
                       ))}
                    </section>
                  )}

                   {results.cards.length > 0 && (
                    <section className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 opacity-50">Cards & Tasks</p>
                       {results.cards.map((card, idx) => {
                         const actualIdx = idx + results.boards.length;
                         return (
                           <div 
                            key={card.id}
                            onClick={() => handleNavigate({ ...card, type: 'card' })}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${selectedIndex === actualIdx ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-secondary'}`}
                           >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${selectedIndex === actualIdx ? 'bg-background/20' : 'bg-muted-foreground/10'}`}>
                                  <Layout size={18} className={selectedIndex === actualIdx ? 'text-primary-foreground' : 'text-muted-foreground'} />
                                </div>
                                 <div>
                                  <p className="font-bold text-sm tracking-tight">{card.title}</p>
                                  <p className={`text-[10px] font-medium ${selectedIndex === actualIdx ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Matches found via Full-Text Analysis</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 {selectedIndex === actualIdx && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-background/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary-foreground">
                                    <Sparkles size={10} className="fill-current" />
                                    AI Search
                                  </div>
                                )}
                                <ExternalLink size={14} className={selectedIndex === actualIdx ? 'text-primary-foreground' : 'text-muted-foreground'} />
                              </div>
                           </div>
                         );
                       })}
                    </section>
                  )}
                </div>
               ) : !loading && (
                <div className="p-16 text-center">
                   <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground shadow-inner rotate-3">
                    <Search size={24} className="opacity-30" />
                   </div>
                   <p className="text-sm font-bold text-foreground">No results for "{query}"</p>
                   <p className="text-xs text-muted-foreground mt-2">Try searching for keywords, task titles, or board names.</p>
                </div>
              )}
            </div>

             <div className="p-5 bg-secondary/30 border-t border-border flex items-center justify-between px-8">
               <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="p-1.5 bg-card rounded-lg border border-border shadow-sm">↑↓</span>
                    Navigate
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="p-1.5 bg-card rounded-lg border border-border shadow-sm px-2">ENTER</span>
                    Open
                  </div>
               </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  <Sparkles size={12} className="fill-current" />
                  Hybrid Search Engine
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UniversalSearch;

