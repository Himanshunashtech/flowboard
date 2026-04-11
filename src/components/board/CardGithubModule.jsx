import React, { useState, useEffect } from 'react';
import { 
  Github, 
  ExternalLink, 
  Plus, 
  Search, 
  Loader2, 
  GitPullRequest, 
  CircleDot, 
  CheckCircle2, 
  RefreshCcw,
  X,
  Link2
} from 'lucide-react';
import { githubService } from '../../lib/githubService';
import { supabase } from '../../lib/supabase';

const CardGithubModule = ({ cardId, boardId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [cardId]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('card_github_items')
      .select('*')
      .eq('card_id', cardId);
    setItems(data || []);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const results = await githubService.searchItems(boardId, searchQuery);
      setSearchResults(results.items || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const linkItem = async (item) => {
    try {
      const linked = await githubService.linkItemToCard(cardId, item);
      setItems([...items, linked]);
      setShowSearch(false);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      console.error('Linking failed:', err);
    }
  };

  const unlinkItem = async (id) => {
    try {
      await supabase.from('card_github_items').delete().eq('id', id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error('Unlinking failed:', err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await githubService.syncCardItems(cardId);
      await fetchItems();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (state) => {
    const configs = {
      OPEN: { icon: CircleDot, color: 'text-success bg-success/10 border-success/20', label: 'Open' },
      CLOSED: { icon: X, color: 'text-danger bg-danger/10 border-danger/20', label: 'Closed' },
      MERGED: { icon: GitPullRequest, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', label: 'Merged' },
    };
    const config = configs[state] || configs.OPEN;
    return (
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
        <config.icon size={10} />
        {config.label}
      </div>
    );
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-tertiary">
          <Github size={16} />
          Development
        </div>
        {items.length > 0 && (
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`p-2 hover:bg-bg-secondary rounded-xl transition-all ${syncing ? 'animate-spin text-brand-primary' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            <RefreshCcw size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="group p-4 rounded-3xl bg-bg-secondary border border-transparent hover:border-border-light transition-all flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0">
               <div className={`mt-0.5 p-2 rounded-xl bg-white shadow-sm ${item.item_type === 'PULL_REQUEST' ? 'text-brand-primary' : 'text-success'}`}>
                  {item.item_type === 'PULL_REQUEST' ? <GitPullRequest size={14} /> : <CircleDot size={14} />}
               </div>
               <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter">#{item.item_number}</span>
                     {getStatusBadge(item.state)}
                  </div>
                  <h4 className="text-[11px] font-black text-text-primary leading-tight line-clamp-2 pr-2 mb-2">{item.title}</h4>
                  <p className="text-[9px] font-bold text-text-tertiary uppercase truncate">{item.repo_full_name}</p>
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-white shadow-lg rounded-xl text-text-tertiary hover:text-brand-primary transition-all border border-black/5"
              >
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => unlinkItem(item.id)}
                className="p-2.5 text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {showSearch ? (
          <div className="p-4 rounded-[32px] bg-white border-2 border-brand-primary shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Find Issue or PR..."
                className="w-full bg-bg-secondary pl-10 pr-4 py-3.5 rounded-2xl text-xs font-bold focus:outline-none"
              />
              {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" />}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar px-1">
              {searchResults.map(item => (
                <button 
                  key={item.id}
                  onClick={() => linkItem(item)}
                  className="w-full p-4 rounded-2xl hover:bg-bg-secondary text-left flex items-start gap-4 group transition-colors"
                >
                  <div className={`p-2 rounded-xl bg-bg-secondary flex items-center justify-center ${item.pull_request ? 'text-brand-primary' : 'text-success'}`}>
                     {item.pull_request ? <GitPullRequest size={14} /> : <CircleDot size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-text-primary leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">{item.title}</p>
                    <p className="text-[10px] text-text-tertiary font-bold mt-1">#{item.number} • {item.repository_url.split('/repos/')[1]}</p>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => { setShowSearch(false); setSearchResults([]); }}
              className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-text-primary"
            >
              Close
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowSearch(true)}
            className="w-full p-4 rounded-3xl border-2 border-dashed border-border-light hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-3 group"
          >
            <Plus size={16} className="text-text-tertiary group-hover:text-brand-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-text-tertiary group-hover:text-brand-primary">Link Github PR or Issue</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CardGithubModule;
