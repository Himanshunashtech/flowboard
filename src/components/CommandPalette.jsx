import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Command, 
  Search, 
  Sparkles, 
  Layout, 
  Settings, 
  Users, 
  Plus, 
  Terminal,
  Zap,
  ArrowRight,
  MessageSquare,
  X,
  Keyboard
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { activeWorkspace } = useSelector((state) => state.workspaces);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setIsAiMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 1 && !isAiMode) {
      const searchTasks = async () => {
        const { data } = await supabase
          .from('cards')
          .select('id, title, board_id')
          .ilike('title', `%${query}%`)
          .limit(5);
        
        setResults(data || []);
      };
      searchTasks();
    } else {
      setResults([]);
    }
  }, [query, isAiMode]);

  const handleAiAction = async () => {
    setAiLoading(true);
    // Simulate AI thinking
    setTimeout(() => {
      setAiLoading(false);
      // In a real app, this would call an Edge Function to create a card or give an answer
      console.log('AI generating for query:', query);
    }, 1500);
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[90] group"
    >
      <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
      <div className="absolute right-full mr-4 px-4 py-2 bg-card border border-border rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">AI Assistance</p>
        <p className="text-[8px] font-bold text-muted-foreground">Press Ctrl + I</p>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500 ring-1 ring-primary/10">
        {/* Header / Input */}
        <div className="relative p-6 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-4">
            {isAiMode ? <Sparkles className="text-primary animate-pulse" /> : <Search className="text-muted-foreground" />}
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none outline-none text-lg font-bold placeholder:text-muted-foreground/50"
              placeholder={isAiMode ? "Ask AI to do something... (e.g. Create a card for design review)" : "Search tasks, settings, or type '/' for AI..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value === '/') setIsAiMode(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   if (isAiMode) handleAiAction();
                   else if (results[selectedIndex]) {
                     // Navigate to task
                   }
                }
                if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0));
              }}
            />
            <div className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border">
              <span>Esc</span>
            </div>
          </div>
        </div>

        {/* Results / Options */}
        <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
          {aiLoading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={24} className="animate-spin" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse text-center">
                AI Agent is processing your request...
              </p>
            </div>
          ) : query.length === 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h4>
                <div className="space-y-1">
                  {[
                    { icon: Plus, label: 'Create New Board', shortcut: 'N', color: 'text-green-500' },
                    { icon: Users, label: 'Invite Team Member', shortcut: 'I', color: 'text-primary' },
                    { icon: Settings, label: 'Workspace Settings', shortcut: 'S', color: 'text-muted-foreground' },
                    { icon: Terminal, label: 'Open MCP Console', shortcut: 'C', color: 'text-amber-500' }
                  ].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-secondary transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl bg-background flex items-center justify-center ${item.color} shadow-sm border border-border group-hover:scale-110 transition-transform`}>
                          <item.icon size={16} />
                        </div>
                        <span className="text-sm font-bold text-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        <span>Cmd</span>
                        <span>{item.shortcut}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">AI Assistance</h5>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Type '/' to start a conversation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiMode(true)}
                  className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
               {results.map((task, idx) => (
                 <button 
                  key={task.id} 
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${idx === selectedIndex ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary'}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                 >
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground">
                        <Layout size={16} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{task.title}</span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Task</span>
                 </button>
               ))}
               {results.length === 0 && !isAiMode && (
                 <div className="p-10 text-center space-y-2">
                    <p className="text-sm font-bold text-muted-foreground">No matching tasks found.</p>
                    <button 
                      onClick={() => setIsAiMode(true)}
                      className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
                    >
                      Ask AI to search deeper?
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/10 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <kbd className="px-2 py-1 bg-secondary rounded text-[9px] font-black text-muted-foreground border border-border shadow-sm">↑↓</kbd>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                 <kbd className="px-2 py-1 bg-secondary rounded text-[9px] font-black text-muted-foreground border border-border shadow-sm">Enter</kbd>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Zen Protocol AI v2.4</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
