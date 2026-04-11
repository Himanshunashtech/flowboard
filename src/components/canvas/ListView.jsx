import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, X, UserPlus, Check } from 'lucide-react';
import CardItem from './CardItem';
import { supabase } from '../../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

const ListView = ({ list, cards }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { members } = useSelector((state) => state.board);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPeoplePanel, setShowPeoplePanel] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [assigningUser, setAssigningUser] = useState(null);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!title || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          list_id: list.id,
          board_id: list.board_id,
          created_by: user.id,
          title,
          position: cards.length > 0 ? Math.max(...cards.map(c => c.position)) + 65535 : 65535
        })
        .select()
        .single();

      if (error) throw error;
      setTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Assign a member to ALL unassigned cards in this list
  const assignMemberToList = async (member) => {
    setAssigningUser(member.user_id);
    await Promise.all(
      cards.map(card =>
        supabase.from('card_assignments')
          .insert({ card_id: card.id, user_id: member.user_id, assigned_by: user.id })
          .select()
          .then(() => {}) // Ignore conflict errors (already assigned)
      )
    );
    setAssigningUser(null);
    setShowPeoplePanel(false);
  };

  const handleUpdateTitle = async () => {
    if (!listTitle.trim() || listTitle === list.title) {
      setIsEditingTitle(false);
      setListTitle(list.title);
      return;
    }
    await supabase.from('lists').update({ title: listTitle }).eq('id', list.id);
    setIsEditingTitle(false);
  };

  const archiveAllCards = async () => {
    if (!confirm('Archive all cards in this list?')) return;
    await supabase.from('cards').update({ is_archived: true }).eq('list_id', list.id);
    setShowMenu(false);
  };

  const deleteList = async () => {
    if (!confirm('Delete this list and all its cards?')) return;
    await supabase.from('lists').delete().eq('id', list.id);
    setShowMenu(false);
  };

  return (
    <div className="list-container w-80 shrink-0 bg-white/70 backdrop-blur-xl rounded-[40px] flex flex-col h-full snap-center border border-white/40 shadow-2xl shadow-black/[0.03] relative animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
      {/* List Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0 group/title">
          {isEditingTitle ? (
            <input
              autoFocus
              className="flex-1 text-[11px] font-black uppercase tracking-[0.1em] text-text-primary bg-bg-secondary px-3 py-1 rounded-xl outline-none ring-2 ring-brand-primary/20"
              value={listTitle}
              onChange={e => setListTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={e => e.key === 'Enter' && handleUpdateTitle()}
            />
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary px-1 truncate cursor-pointer hover:bg-bg-secondary rounded-lg transition-colors"
            >
              {list.title}
            </h3>
          )}
          <div className="ml-auto flex items-center gap-3">
             <span className="text-[10px] font-black text-text-tertiary opacity-40">
               {cards.length}
             </span>
             <div className="flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowPeoplePanel(p => !p)}
                  className={`p-1.5 rounded-lg transition-all ${showPeoplePanel ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary'}`}
                >
                  <UserPlus size={14} />
                </button>
                <button 
                  onClick={() => setShowMenu(p => !p)}
                  className={`p-1.5 rounded-lg transition-all ${showMenu ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary'}`}
                >
                  <MoreHorizontal size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* People Panel */}
      <AnimatePresence>
        {showPeoplePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mb-2 bg-white border border-border-light rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2.5">
                Assign member to list
              </p>
              {members?.length > 0 ? (
                <div className="space-y-1">
                  {members.map(m => {
                    const name = m.profiles?.full_name || m.profiles?.email || 'User';
                    const isLoading = assigningUser === m.user_id;
                    return (
                      <button
                        key={m.user_id}
                        onClick={() => assignMemberToList(m)}
                        disabled={isLoading}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {name[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-text-secondary flex-1 truncate">{name}</span>
                        {isLoading ? (
                          <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus size={12} className="text-text-tertiary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary italic text-center py-2">No board members yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <Droppable droppableId={list.id} type="card">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-3 py-1 min-h-[50px] transition-colors ${snapshot.isDraggingOver ? 'bg-brand-primary/5 rounded-2xl' : ''}`}
          >
            {cards.map((card, index) => (
              <CardItem key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card */}
      <div className="p-3">
        {isAdding ? (
          <form onSubmit={handleAddCard} className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <textarea
              autoFocus
              placeholder="What needs to be done?"
              className="w-full p-3 bg-white border border-border-medium rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-brand-primary/10 outline-none resize-none"
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e); }
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!title || loading}
                className="btn btn-primary !h-9 !px-4 !text-xs !rounded-lg"
              >
                {loading ? 'Adding...' : 'Add Card'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-2 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-text-secondary hover:bg-bg-tertiary hover:text-brand-primary rounded-xl transition-all group"
          >
            <Plus size={16} className="text-text-tertiary group-hover:text-brand-primary" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ListView;
