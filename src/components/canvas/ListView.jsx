import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable } from '@hello-pangea/dnd';
import { 
  MoreHorizontal, 
  Plus, 
  X, 
  UserPlus, 
  Check, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';
import CardItem from './CardItem';
import { supabase } from '../../lib/supabase';
import { Ordering } from '../../lib/ordering';
import { AnimatePresence, motion } from 'framer-motion';
import { addCard, updateList, deleteList } from '../../store/slices/boardSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { hexToRgba, isLightColor } from '../../lib/utils';

const LIST_COLORS = [
  { name: 'Green',  value: '#61bd4f' },
  { name: 'Yellow', value: '#f2d600' },
  { name: 'Orange', value: '#ff9f1a' },
  { name: 'Red',    value: '#eb5a46' },
  { name: 'Purple', value: '#c377e0' },
  { name: 'Blue',   value: '#0079bf' },
  { name: 'Sky',    value: '#00c2e0' },
  { name: 'Lime',   value: '#51e898' },
  { name: 'Pink',   value: '#ff78cb' },
  { name: 'Gray',   value: '#838c91' }
];

const ListView = ({ list, cards, onCardClick, selectedIds, listStyle = 'solid', cardStyle = 'modern', isReadOnly = false, isCollapsed = false }) => {
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
  const [isUpdatingColor, setIsUpdatingColor] = useState(false);
  
  // Individual Collapse State
  const [isLocalCollapsed, setIsLocalCollapsed] = useState(isCollapsed);

  // Sync with global collapse prop
  useEffect(() => {
    setIsLocalCollapsed(isCollapsed);
  }, [isCollapsed]);

  const handleUpdateColor = async (color) => {
    // Optimistic Update
    dispatch(updateList({ id: list.id, color }));

    setIsUpdatingColor(true);
    const { error } = await supabase
      .from('lists')
      .update({ color })
      .eq('id', list.id);
    
    if (error) {
      console.error('Error updating list color:', error);
      // Revert if error (not strictly required for prototype but good practice)
      dispatch(updateList({ id: list.id, color: list.color }));
    }
    setIsUpdatingColor(false);
    setShowMenu(false);
  };

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
          position: Ordering.last(cards[cards.length - 1]?.position)
        })
        .select()
        .single();

      if (error) throw error;
      
      // Step: Instant UI Update (Optimistic-hybrid)
      if (data) {
        dispatch(addCard(data));
      }

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
    // Optimistic Update
    dispatch(updateList({ id: list.id, title: listTitle }));
    setIsEditingTitle(false);

    const { error } = await supabase.from('lists').update({ title: listTitle }).eq('id', list.id);
    if (error) {
      dispatch(addNotification({ message: 'Failed to update title', type: 'error' }));
      dispatch(updateList({ id: list.id, title: list.title })); // Rollback
    }
  };

  const archiveAllCards = async () => {
    if (!confirm('Archive all cards in this list?')) return;
    await supabase.from('cards').update({ is_archived: true }).eq('list_id', list.id);
    setShowMenu(false);
  };

  const deleteListHandler = async () => {
    if (!confirm('Delete this list and all its cards?')) return;
    
    // Optimistic Update
    dispatch(deleteList(list.id));
    setShowMenu(false);

    const { error } = await supabase.from('lists').delete().eq('id', list.id);
    if (error) {
      dispatch(addNotification({ message: 'Failed to delete list', type: 'error' }));
      // In a real app, we would re-fetch the board here to restore the list
    }
  };

  const getListStyleClasses = () => {
    if (list.color) return ""; // User color overrides presets
    switch (listStyle) {
      case 'glass':
        return "bg-card/40 backdrop-blur-xl border-border/20 shadow-2xl shadow-black/[0.03]";
      case 'minimal':
        return "bg-transparent border-none shadow-none p-0";
      case 'solid':
      default:
        return "bg-secondary border-border shadow-sm";
    }
  };

  const isLight = list.color ? isLightColor(list.color) : true;
  const listContrastText = isLight ? 'text-foreground' : 'text-white';
  const listContrastSecondary = isLight ? 'text-muted-foreground' : 'text-white/80';
  const listContrastIcon = isLight ? 'text-foreground' : 'text-white';

  return (
    <div 
      className={`list-container ${isLocalCollapsed ? 'w-16 h-[280px]' : 'w-[380px] max-h-full h-fit'} shrink-0 ${getListStyleClasses()} rounded-2xl flex flex-col snap-center border relative transition-all duration-500 overflow-hidden shadow-2xl shadow-black/5`}
      style={{ 
        backgroundColor: list.color || '#ffffff',
        borderTop: list.color ? `10px solid ${hexToRgba(list.color, 0.2)}` : '1px solid transparent',
        borderColor: list.color ? hexToRgba(list.color, 0.3) : 'rgba(0,0,0,0.08)'
      }}
    >
      {isLocalCollapsed ? (
        <div className="flex flex-col items-center py-6 h-full relative">
           <button 
             onClick={() => setIsLocalCollapsed(false)}
             className={`absolute top-4 p-1.5 rounded-lg ${listContrastSecondary} hover:bg-black/5 transition-all mb-4`}
           >
             <Maximize2 size={14} />
           </button>
           <div className="flex-1 flex items-center justify-center pt-8">
             <h3 
               onClick={() => setIsLocalCollapsed(false)}
               className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.3em] text-foreground origin-center -rotate-90 transform-gpu py-2 hover:text-primary transition-colors cursor-pointer"
             >
               {list.title}
             </h3>
           </div>
           <div className="mt-auto mb-2 px-2 py-1 bg-card/50 rounded-full text-[8px] font-black text-muted-foreground">
             {cards.length}
           </div>
        </div>
      ) : (
        <>
          {/* List Header */}
          <div className="px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0 group/title">
              {isEditingTitle ? (
                <input
                  autoFocus
                  className={`flex-1 text-[13px] font-black uppercase tracking-[0.1em] ${listContrastText} bg-black/10 px-3 py-1 rounded-xl outline-none ring-2 ring-primary/20`}
                  value={listTitle}
                  onChange={e => setListTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={e => e.key === 'Enter' && handleUpdateTitle()}
                />
              ) : (
                <h3 
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-[13px] font-black uppercase tracking-[0.15em] ${listContrastText} px-1 truncate cursor-pointer hover:bg-black/5 rounded-lg transition-colors`}
                >
                  {list.title}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-1 ml-auto">
               <div className="flex flex-col items-end mr-2">
                 <div className={`text-[11px] font-black ${listContrastText} opacity-90 whitespace-nowrap`}>
                   {cards.length} <span className="text-[9px] opacity-60">Cards</span>
                 </div>
                 {cards.reduce((acc, c) => acc + (c.story_points || 0), 0) > 0 && (
                   <div className={`text-[11px] font-black ${listContrastText} opacity-70 whitespace-nowrap`}>
                     {cards.reduce((acc, c) => acc + (c.story_points || 0), 0)} <span className="text-[9px] opacity-60">PTS</span>
                   </div>
                 )}
               </div>

               <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsLocalCollapsed(true)}
                    className={`p-1.5 rounded-lg transition-all ${listContrastIcon} hover:bg-black/5`}
                    title="Collapse List"
                  >
                    <Minimize2 size={16} />
                  </button>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowPeoplePanel(p => !p)}
                        className={`p-1.5 rounded-lg transition-all ${showPeoplePanel ? 'bg-primary/10 text-primary' : `${listContrastIcon} hover:bg-black/5`}`}
                      >
                        <UserPlus size={16} />
                      </button>
                      <button 
                        onClick={() => setShowMenu(p => !p)}
                        className={`p-1.5 rounded-lg transition-all ${showMenu ? 'bg-black/10 text-primary' : `${listContrastIcon} hover:bg-black/5`}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Interaction Panels */}
          <AnimatePresence>
            {showPeoplePanel && (
              <motion.div
                key="people-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-3 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden relative z-50"
              >
                <div className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">
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
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
                              {name[0].toUpperCase()}
                            </div>
                              <span className="text-xs font-semibold text-muted-foreground flex-1 truncate">{name}</span>
                            {isLoading ? (
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus size={12} className="text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No board members yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {showMenu && (
              <motion.div
                key="color-menu"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="mx-3 mb-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative z-50"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Change list color
                    </p>
                    <button onClick={() => setShowMenu(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {LIST_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleUpdateColor(c.value)}
                        className="group relative w-full aspect-square rounded-lg transition-all hover:scale-110 active:scale-95 shadow-sm overflow-hidden"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {list.color === c.value && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-white">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateColor(null)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all"
                  >
                    <X size={14} />
                    Remove color
                  </button>
                </div>

                <div className="border-t border-border p-3 bg-secondary/30">
                   <button 
                    onClick={archiveAllCards}
                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                   >
                     Archive all cards
                   </button>
                   <button 
                    onClick={deleteListHandler}
                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                   >
                     Delete list
                   </button>
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
                className={`flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3 min-h-0 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-2xl' : ''}`}
              >
                {cards.map((card, index) => (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    index={index} 
                    onClick={onCardClick}
                    isSelected={selectedIds?.includes(card.id)}
                    stylePreset={cardStyle}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card */}
          {!isReadOnly && (
            <div className="p-3 shrink-0">
              {isAdding ? (
                <form onSubmit={handleAddCard} className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <textarea
                    autoFocus
                    placeholder="What needs to be done?"
                    className="w-full p-3 bg-card/90 backdrop-blur-sm border border-border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary/10 outline-none resize-none"
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
                      className={`p-2 ${listContrastSecondary} hover:bg-black/5 hover:${listContrastText} rounded-lg transition-all`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold ${listContrastSecondary} hover:bg-black/10 hover:${listContrastText} rounded-xl transition-all group`}
                >
                  <Plus size={16} className={`${listContrastIcon} group-hover:scale-110 transition-transform`} />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListView;
