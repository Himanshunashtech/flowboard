import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, ArrowRight, Layers, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RelatedCards = ({ cardId, boardId, onCardSelect }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_related_cards_deterministic', {
        source_card_id: cardId,
        p_board_id: boardId,
        match_limit: 4
      });

      if (!error && data) {
        setRelated(data);
      }
      setLoading(false);
    };

    if (cardId && boardId) {
      fetchRelated();
    }
  }, [cardId, boardId]);

  if (loading) {
    return (
      <div className="flex gap-3 py-2 overflow-x-auto scrollbar-hide">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-48 h-20 bg-bg-secondary rounded-2xl animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
          <Sparkles size={12} className="text-brand-primary" />
          Related Suggestions
        </h3>
        <span className="text-[10px] font-bold text-text-tertiary opacity-40">Based on context</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mask-linear">
        <AnimatePresence mode="popLayout">
          {related.map((card, idx) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onCardSelect(card.id)}
              className="group w-56 p-4 bg-white border border-border-light rounded-[24px] text-left shrink-0 hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                 <Layout size={60} />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary truncate">
                    {card.list_title}
                 </span>
              </div>
              
              <p className="text-xs font-bold text-text-primary mb-3 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                {card.title}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="px-2 py-0.5 bg-bg-secondary rounded-lg text-[8px] font-black text-text-tertiary uppercase tracking-tighter">
                   {Math.round(card.similarity * 100)}% Match
                </div>
                <div className="text-brand-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RelatedCards;
