import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  MessageSquare, 
  ShieldCheck, 
  Clock,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ClientPortal = () => {
  const { portalSlug } = useParams();
  const [board, setBoard] = useState(null);
  const [portalConfig, setPortalConfig] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      setLoading(true);
      // Fetch Portal Config
      const { data: portal } = await supabase
        .from('client_portals')
        .select(`
          *,
          boards (*)
        `)
        .eq('slug', portalSlug)
        .single();
      
      if (portal) {
        setPortalConfig(portal);
        setBoard(portal.boards);

        // Fetch Lists
        const { data: boardLists } = await supabase
          .from('lists')
          .select('*')
          .eq('board_id', portal.board_id)
          .order('position');
        
        // Fetch Cards
        const { data: boardCards } = await supabase
          .from('cards')
          .select('*')
          .eq('board_id', portal.board_id)
          .order('position');

        if (boardLists) setLists(boardLists);
        if (boardCards) setCards(boardCards);
      }
      setLoading(false);
    };

    if (portalSlug) {
      fetchPortalData();
    }
  }, [portalSlug]);

  if (loading) return <div className="p-10 flex flex-col items-center gap-4">
    <div className="animate-pulse w-full max-w-lg h-8 bg-bg-secondary rounded"></div>
    <div className="animate-pulse w-full max-w-lg h-60 bg-bg-secondary rounded"></div>
  </div>;

  if (!portalConfig) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Private Portal</h1>
        <p className="text-secondary mb-8">This board portal is private or does not exist. Please contact the board owner for access.</p>
        <button className="btn btn-secondary">Go to Homepage</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col selection:bg-primary/10">
      {/* Portal Header */}
      <header className="px-10 py-6 bg-white border-b border-border-light flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
            {board?.title[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{board?.title}</h1>
            <div className="flex items-center gap-3 text-xs font-bold text-text-tertiary">
              <div className="flex items-center gap-1.5 text-success">
                <ShieldCheck size={14} strokeWidth={3} />
                <span className="uppercase tracking-widest">Verified Portal</span>
              </div>
              <span className="text-border-medium">•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span className="uppercase tracking-widest text-[9px]">Updated 5m ago</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold rounded-lg uppercase tracking-[0.2em] border border-success/10">
            Live View
          </div>
          <button className="btn btn-secondary !px-4 !h-10 !rounded-xl !text-xs font-bold">
            <MessageSquare size={16} />
            <span>Support</span>
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-primary/5 px-10 py-3 border-b border-primary/10 flex items-center gap-3 text-xs font-bold text-primary">
         <Info size={16} />
         <p className="uppercase tracking-widest">You are viewing a secure read-only version of this board portal.</p>
      </div>

      {/* Live Portal Canvas */}
      <div className="flex-1 p-10 overflow-x-auto select-none bg-bg-secondary/30 custom-scrollbar">
         <div className="flex gap-8 items-start">
            {lists.map(list => (
              <div key={list.id} className="w-[320px] shrink-0 bg-white/40 backdrop-blur-md rounded-[32px] p-6 border border-border-light flex flex-col gap-6 shadow-sm">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-xs uppercase tracking-widest text-foreground">{list.title}</h3>
                    <div className="px-2 py-0.5 bg-bg-tertiary rounded-md text-[10px] font-bold text-text-tertiary">
                      {cards.filter(c => c.list_id === list.id).length}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   {cards
                     .filter(c => c.list_id === list.id)
                     .map(card => (
                       <div key={card.id} className="bg-white rounded-[24px] border border-border-light shadow-sm p-6 hover:shadow-xl transition-all duration-300 group cursor-default">
                          {card.priority !== 'NONE' && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                card.priority === 'CRITICAL' ? 'bg-danger' : 
                                card.priority === 'HIGH' ? 'bg-orange-500' : 'bg-primary'
                              }`} />
                              <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">{card.priority}</span>
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-foreground mb-3 leading-relaxed">{card.title}</h4>
                          <div className="flex items-center gap-4 text-text-tertiary">
                             {card.due_date && (
                               <div className="flex items-center gap-1.5">
                                 <Clock size={12} />
                                 <span className="text-[10px] font-bold">{new Date(card.due_date).toLocaleDateString()}</span>
                               </div>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      </div>

      <footer className="py-12 text-center text-[10px] font-bold text-text-tertiary uppercase tracking-[0.3em]">
        <p>FlowBoard Security Portals © 2026 • Encrypted Data</p>
      </footer>
    </div>
  );
};

export default ClientPortal;
