import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Paperclip, Clock, Check, MoreVertical, Plus, Circle, MapPin, Trash2, CheckCircle2, Zap } from 'lucide-react';
import { setActiveCardId, toggleModal } from '../../store/slices/uiSlice';
import { updateCard, deleteCard } from '../../store/slices/boardSlice';
import { isPast } from 'date-fns';
import { supabase } from '../../lib/supabase';
import ReactDOM from 'react-dom';

const PRIORITY_STYLES = {
  CRITICAL: { color: 'text-red-500',    bg: 'bg-red-500/10',    label: 'Critical' },
  HIGH:     { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'High' },
  MEDIUM:   { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Medium' },
  LOW:      { color: 'text-blue-500',   bg: 'bg-blue-500/10',   label: 'Low' },
  NONE:     { color: 'text-muted-foreground',  bg: '',             label: '' },
};

const CardItem = ({ card, index, onClick, isSelected, stylePreset = 'modern' }) => {
  const dispatch = useDispatch();
  const { labels: boardLabels, members: boardMembers } = useSelector(s => s.board);
  const priority = PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.NONE;

  const handleClick = (e) => {
    if (onClick) {
      onClick(e, card.id);
      if (e.shiftKey) return; // Don't open modal if selecting
    }
    dispatch(setActiveCardId(card.id));
    dispatch(toggleModal({ modalName: 'cardDetails', isOpen: true }));
  };

  const toggleComplete = async (e) => {
    e.stopPropagation();
    const newState = !card.is_completed;
    dispatch(updateCard({ id: card.id, is_completed: newState }));
    const { error } = await supabase.from('cards').update({ is_completed: newState }).eq('id', card.id);
    if (error) {
      console.error('Error toggling completion:', error);
      dispatch(updateCard({ id: card.id, is_completed: !newState }));
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this card?')) return;
    dispatch(deleteCard(card.id));
    const { error } = await supabase.from('cards').delete().eq('id', card.id);
    if (error) {
       console.error('Error deleting card:', error);
       // In a real app we would re-fetch to restore
    }
  };

  const dueDateObj = card.due_date ? new Date(card.due_date) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !card.is_completed;

  // Process checklist items
  const checklist = card.checklists?.flatMap(c => c.checklist_items || []) || [];
  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.is_completed).length;

  // Process Labels
  const cardLabelIds = card.card_labels?.map(cl => cl.label_id) || [];
  const cardLabels = boardLabels.filter(l => cardLabelIds.includes(l.id));

  // Process Assignments
  const assignedUserIds = card.card_assignments?.map(ca => ca.user_id) || [];
  const assignees = boardMembers.filter(m => assignedUserIds.includes(m.user_id));

  const getCardStyleClasses = () => {
    switch (stylePreset) {
      case 'compact':
        return "rounded-xl shadow-sm hover:shadow-md border-border";
      case 'shadowed':
        return "rounded-2xl shadow-xl hover:shadow-2xl border-transparent mb-6";
      case 'modern':
      default:
        return "rounded-xl shadow-md hover:shadow-2xl border-border transition-all duration-400";
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => {
        const content = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleClick}
            className={`relative bg-card border cursor-pointer select-none group overflow-hidden transition-all duration-300 flex-shrink-0
              ${getCardStyleClasses()}
              ${isSelected ? 'ring-4 ring-primary border-transparent' : ''}
              group-hover:border-foreground/20
              ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-primary/20 rotate-1 scale-[1.03] z-[9999]' : ''}`}
            style={{
              ...provided.draggableProps.style,
            }}
          >
            {/* Card Cover */}
            {card.cover_type !== 'NONE' && (
              <div 
                className={`absolute top-0 left-0 right-0 overflow-hidden z-0 transition-all duration-500
                  ${card.cover_type === 'IMAGE' ? 'h-40' : 'h-8'}`}
              >
                {card.cover_type === 'IMAGE' && (card.cover_value || card.cover_image_url) ? (
                  <img 
                    src={card.cover_value || card.cover_image_url} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div 
                    className="w-full h-full" 
                    style={{ backgroundColor: card.cover_value || '#eee' }} 
                  />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            {/* Content wrapper with internal padding */}
            <div className={`relative z-10 flex flex-col p-5 
              ${card.cover_type === 'IMAGE' ? 'pt-[174px]' : card.cover_type === 'COLOR' ? 'pt-10' : ''}`}
            >
              {/* Header: Title + Actions */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button 
                    onClick={toggleComplete}
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-sm
                      ${card.is_completed ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                  >
                    {card.is_completed ? <CheckCircle2 size={12} strokeWidth={4} /> : <Circle size={12} strokeWidth={3} />}
                  </button>
                  <h4 className={`text-[17px] font-black tracking-tight leading-tight transition-colors break-words
                    ${card.is_completed ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground group-hover:text-primary'}`}>
                    {card.title}
                  </h4>
                </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    title="Delete card"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Labels Area (Small color bars at top) */}
              {cardLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {cardLabels.map(label => (
                    <div 
                      key={label.id}
                      className="h-2 w-10 rounded-full shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    />
                  ))}
                </div>
              )}

              {/* Priority Pill */}
              {priority.label && (
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-current/10 ${priority.bg} ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>
              )}

              {/* Enhanced Checklist & Meta Section */}
              {totalItems > 0 && (
                <div className="space-y-3 mb-4">
                   <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${completedItems === totalItems ? 'bg-green-500' : 'bg-primary'}`} />
                         <span>Checklist</span>
                      </div>
                      <span className="tabular-nums font-bold text-muted-foreground">{completedItems}/{totalItems}</span>
                   </div>
                   <div className="h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                      <div 
                         className={`h-full transition-all duration-1000 ${completedItems === totalItems ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-primary'}`}
                         style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                   </div>
                </div>
              )}

              {/* Card Footer: Metadata (Comments, Date, Assignees) */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-black text-muted-foreground">
                    {card.comments?.length > 0 && (
                      <div className="flex items-center gap-1.5" title="Comments">
                        <MessageSquare size={16} className="text-muted-foreground" />
                        <span className="tabular-nums">{card.comments.length}</span>
                      </div>
                    )}
                    {card.attachments?.length > 0 && (
                      <div className="flex items-center gap-1.5" title="Attachments">
                        <Paperclip size={16} className="text-muted-foreground" />
                        <span className="tabular-nums">{card.attachments.length}</span>
                      </div>
                    )}
                    {checklist.length > 0 && (
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors ${completedItems === totalItems ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'}`} title="Checklist progress">
                        <Check size={16} strokeWidth={3} />
                        <span className="tabular-nums">{completedItems}/{totalItems}</span>
                      </div>
                    )}
                    {dueDateObj && (
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors
                        ${card.is_completed ? 'bg-green-500/10 text-green-600' : isOverdue ? 'bg-red-500/10 text-red-600' : 'bg-secondary text-muted-foreground'}`}
                        title={card.is_completed ? 'Completed' : isOverdue ? 'Overdue' : 'Due date'}
                      >
                        <Clock size={16} />
                        <span className="tabular-nums uppercase">{format(dueDateObj, 'MMM d')}</span>
                      </div>
                    )}
                    {card.location && (
                      <div className="flex items-center gap-1.5" title="Location">
                        <MapPin size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    {card.time_entries?.some(t => !t.ended_at) && (
                      <div className="flex items-center gap-1 text-primary animate-pulse" title="Timer is running">
                        <Clock size={16} className="fill-primary/20 shadow-sm" />
                        <span className="font-black uppercase tracking-tight">Live</span>
                      </div>
                    )}
                </div>
                   {card.story_points > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/10 transition-all hover:bg-primary/20" title={`${card.story_points} Story Points`}>
                      <Zap size={10} className="fill-current" />
                      <span className="text-[9px] font-black tabular-nums">{card.story_points}</span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(toggleModal({ modalName: 'automations', isOpen: true, data: { cardId: card.id } }));
                    }}
                    className="flex items-center gap-1 text-warning hover:text-amber-500 transition-colors p-1 rounded-md hover:bg-warning/10" 
                    title="Card Automations"
                  >
                    <Zap size={12} className="fill-current" />
                  </button>
                </div>

                <div className="flex -space-x-2.5">
                  {assignees.map((assignee) => (
                    <div 
                      key={assignee.user_id}
                      className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-black overflow-hidden hover:z-10 hover:scale-110 transition-all cursor-pointer shadow-sm"
                      title={assignee.profiles?.full_name}
                    >
                      {assignee.profiles?.avatar_url ? (
                        <img src={assignee.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        assignee.profiles?.full_name?.[0]?.toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        );

        const portalRoot = document.getElementById('portal-root');
        if (snapshot.isDragging && portalRoot) {
          return ReactDOM.createPortal(content, portalRoot);
        }
        return content;
      }}
    </Draggable>
  );
};

export default CardItem;
