import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import ActivityLogItem from '../components/ui/ActivityLogItem';
import { History, Filter, Search, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (full_name, email, avatar_url),
          boards (title),
          cards (title)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (!error && data) setLogs(data);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.cards?.title?.toLowerCase().includes(search.toLowerCase()) || 
                          log.boards?.title?.toLowerCase().includes(search.toLowerCase()) ||
                          log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'CARDS') return matchesSearch && log.action.startsWith('card.');
    if (filter === 'BOARDS') return matchesSearch && log.action.startsWith('board.');
    if (filter === 'COMMENTS') return matchesSearch && log.action.startsWith('comment.');
    if (filter === 'TEAM') return matchesSearch && (log.action.includes('member') || log.action.includes('team'));
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-10 space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center bg-bg-secondary rounded-2xl border border-border hover:bg-bg-tertiary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-foreground tracking-tighter">Activity Stream</h1>
              <p className="text-sm font-medium text-muted-foreground">Comprehensive timeline of all workspace interactions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-6 py-3 bg-bg-secondary border border-border rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all w-64 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Activity' },
            { id: 'CARDS', label: 'Tasks' },
            { id: 'BOARDS', label: 'Boards' },
            { id: 'COMMENTS', label: 'Comments' },
            { id: 'TEAM', label: 'Team' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:bg-bg-secondary shadow-sm'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Main Content (Removed background box for a cleaner look) */}
        <div className="relative overflow-hidden min-h-[600px] px-2">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[64px] top-6 bottom-6 w-0.5 bg-secondary rounded-full opacity-50" />

          <div className="space-y-8 relative z-10 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
                <Loader2 className="animate-spin mb-4 text-primary" size={32} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronizing Stream...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-40 text-center opacity-50">
                <History className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No matching activities found</p>
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={log.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 20}ms` }}>
                  <ActivityLogItem log={log} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-10 opacity-50">
            <Calendar size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest">Showing last 100 actions</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
