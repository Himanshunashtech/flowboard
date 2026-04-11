import React, { useState, useEffect } from 'react';
import { 
  Github, 
  MessageSquare,
  Link2,
  Check, 
  Plus, 
  Search, 
  Trash2, 
  Loader2,
  ExternalLink,
  ChevronRight,
  Hash
} from 'lucide-react';
import { githubService } from '../../lib/githubService';
import { slackService } from '../../lib/slackService';
import { supabase } from '../../lib/supabase';

const BoardIntegrations = ({ boardId }) => {
  const [activeTab, setActiveTab] = useState('github');
  const [loading, setLoading] = useState(true);
  
  // GitHub State
  const [ghConnected, setGhConnected] = useState(false);
  const [ghRepos, setGhRepos] = useState([]);
  const [ghSearchQuery, setGhSearchQuery] = useState('');
  const [ghSearchResults, setGhSearchResults] = useState([]);
  const [ghSearching, setGhSearching] = useState(false);
  const [showGhSearch, setShowGhSearch] = useState(false);

  // Slack State
  const [slConnected, setSlConnected] = useState(false);
  const [slChannel, setSlChannel] = useState(null);
  const [slChannels, setSlChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [showSlSearch, setShowSlSearch] = useState(false);

  useEffect(() => {
    fetchAllStatus();
  }, [boardId]);

  const fetchAllStatus = async () => {
    setLoading(true);
    try {
      const [ghStatus, slStatus] = await Promise.all([
        githubService.getConnectionStatus(),
        slackService.getConnection()
      ]);

      setGhConnected(!!ghStatus);
      setSlConnected(!!slStatus);

      const [linkedRepos, linkedSlack] = await Promise.all([
        supabase.from('board_repositories').select('*').eq('board_id', boardId),
        supabase.from('board_slack_channels').select('*').eq('board_id', boardId).maybeSingle()
      ]);

      setGhRepos(linkedRepos.data || []);
      setSlChannel(linkedSlack.data);
    } catch (err) {
      console.error('Failed to fetch integration status:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- GitHub Handlers ---
  const handleGhSearch = async () => {
    if (!ghSearchQuery) return;
    setGhSearching(true);
    try {
      const results = await githubService.searchRepositories(ghSearchQuery);
      setGhSearchResults(results.filter(r => !ghRepos.some(existing => existing.repo_id === r.id)));
    } finally {
      setGhSearching(false);
    }
  };

  const linkRepo = async (repo) => {
    const linked = await githubService.linkRepository(boardId, repo);
    setGhRepos([...ghRepos, linked]);
    setShowGhSearch(false);
  };

  // --- Slack Handlers ---
  const handleSlConnect = async () => {
    await slackService.connect();
  };

  const fetchSlackChannels = async () => {
    setLoadingChannels(true);
    try {
      const channels = await slackService.listChannels();
      setSlChannels(channels);
    } finally {
      setLoadingChannels(false);
    }
  };

  const linkSlackChannel = async (channel) => {
    const linked = await slackService.linkChannel(boardId, channel.id, channel.name);
    setSlChannel(linked);
    setShowSlSearch(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={24} className="animate-spin text-brand-primary" />
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary">
        <Link2 size={14} />
        <span>Power-Ups & Integrations</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-bg-secondary rounded-2xl border border-border-light">
        {[
          { id: 'github', label: 'GitHub', icon: Github },
          { id: 'slack', label: 'Slack', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-brand-primary shadow-lg shadow-black/5' 
              : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'github' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {!ghConnected ? (
             <IntegrationPlaceholder 
               icon={Github} 
               title="GitHub" 
               desc="Sync PRs and issues." 
               onConnect={() => githubService.connect()} 
             />
           ) : (
             <div className="space-y-4">
                <ActiveBadge title="GitHub" />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Linked Repositories</p>
                  {ghRepos.map(repo => (
                    <RepoItem key={repo.id} repo={repo} onUnlink={() => {}} />
                  ))}
                  <AddButton 
                    label="Link Repository" 
                    onClick={() => setShowGhSearch(true)} 
                    active={showGhSearch} 
                  />
                  {showGhSearch && (
                    <SearchPanel 
                      query={ghSearchQuery}
                      onChange={setGhSearchQuery}
                      onSearch={handleGhSearch}
                      loading={ghSearching}
                      results={ghSearchResults}
                      onSelect={linkRepo}
                      onClose={() => setShowGhSearch(false)}
                      placeholder="Search repositories..."
                    />
                  )}
                </div>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {!slConnected ? (
             <IntegrationPlaceholder 
               icon={MessageSquare} 
               title="Slack" 
               desc="Channel notifications & slash commands." 
               onConnect={handleSlConnect} 
             />
           ) : (
             <div className="space-y-4">
                <ActiveBadge title="Slack" />
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Linked Channel</p>
                   {slChannel ? (
                     <div className="p-4 rounded-2xl bg-white border border-border-light flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                              <Hash size={14} />
                           </div>
                           <span className="text-xs font-black text-text-primary">#{slChannel.channel_name}</span>
                        </div>
                        <button className="p-2 text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={14} />
                        </button>
                     </div>
                   ) : (
                     <AddButton label="Connect Channel" onClick={() => { setShowSlSearch(true); fetchSlackChannels(); }} active={showSlSearch} />
                   )}
                   
                   {showSlSearch && (
                     <div className="p-4 rounded-3xl bg-white border-2 border-indigo-500/20 space-y-4 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-black uppercase text-indigo-500 ml-1">Select Channel</p>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                           {loadingChannels ? (
                             <div className="py-4 flex justify-center"><Loader2 size={18} className="animate-spin text-indigo-500" /></div>
                           ) : slChannels.map(ch => (
                             <button 
                               key={ch.id} 
                               onClick={() => linkSlackChannel(ch)}
                               className="w-full p-3 rounded-xl hover:bg-indigo-50 text-xs font-bold text-text-primary flex items-center justify-between group"
                             >
                                <span className="group-hover:text-indigo-600 transition-colors">#{ch.name}</span>
                                <Plus size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100" />
                             </button>
                           ))}
                        </div>
                        <button onClick={() => setShowSlSearch(false)} className="w-full py-2 text-[10px] font-black uppercase text-text-tertiary">Cancel</button>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      )}
    </section>
  );
};

// --- Sub-components ---
const IntegrationPlaceholder = ({ icon: Icon, title, desc, onConnect }) => (
  <div className="p-6 rounded-3xl bg-bg-secondary border-2 border-dashed border-border-light flex flex-col items-center text-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-text-primary"><Icon size={24} /></div>
    <div className="space-y-1">
      <h4 className="text-xs font-black uppercase tracking-tight text-text-primary">{title} Power-Up</h4>
      <p className="text-[10px] text-text-tertiary font-medium max-w-[200px] leading-relaxed">{desc}</p>
    </div>
    <button onClick={onConnect} className="w-full py-3 bg-text-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Connect Account</button>
  </div>
);

const ActiveBadge = ({ title }) => (
  <div className="p-4 rounded-2xl bg-bg-secondary border border-border-light flex items-center justify-between">
    <div className="flex items-center gap-3">
      {title === 'GitHub' ? <Github size={18} /> : <MessageSquare size={18} className="text-indigo-500" />}
      <div className="px-2 py-0.5 rounded-md bg-white text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/10">Connected</div>
    </div>
    <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-danger">Disconnect</button>
  </div>
);

const RepoItem = ({ repo, onUnlink }) => (
  <div className="p-4 rounded-2xl bg-white border border-border-light flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-tertiary"><Github size={14} /></div>
      <div className="min-w-0">
        <p className="text-xs font-black text-text-primary truncate">{repo.repo_full_name}</p>
        <p className="text-[9px] text-text-tertiary font-bold uppercase tracking-tighter">Branch: {repo.default_branch}</p>
      </div>
    </div>
    <button onClick={onUnlink} className="p-2 text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
  </div>
);

const AddButton = ({ label, onClick, active }) => (
  !active && (
    <button 
      onClick={onClick}
      className="w-full p-4 rounded-2xl border-2 border-dashed border-border-light hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 group"
    >
      <Plus size={16} className="text-text-tertiary group-hover:text-brand-primary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary group-hover:text-brand-primary">{label}</span>
    </button>
  )
);

const SearchPanel = ({ query, onChange, onSearch, loading, results, onSelect, onClose, placeholder }) => (
  <div className="p-4 rounded-3xl bg-white border-2 border-brand-primary/20 space-y-4 animate-in slide-in-from-top-2">
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input 
        autoFocus
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder={placeholder}
        className="w-full bg-bg-secondary pl-9 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
      {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" />}
    </div>
    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
      {results.map(item => (
        <button 
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full p-2.5 rounded-xl hover:bg-bg-secondary text-left flex items-center justify-between group"
        >
          <span className="text-xs font-bold text-text-primary">{item.full_name || item.name}</span>
          <Plus size={14} className="text-text-tertiary group-hover:text-brand-primary" />
        </button>
      ))}
    </div>
    <button onClick={onClose} className="w-full py-2 text-[10px] font-black uppercase text-text-tertiary">Cancel</button>
  </div>
);

export default BoardIntegrations;
