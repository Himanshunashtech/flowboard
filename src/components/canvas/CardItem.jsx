import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Paperclip, Clock, Check, MoreVertical, Plus, Circle, MapPin, Trash2, CheckCircle2 } from 'lucide-react';
import { setActiveCardId, toggleModal } from '../../store/slices/uiSlice';
import { updateCard, deleteCard } from '../../store/slices/boardSlice';
import { isPast } from 'date-fns';
import { supabase } from '../../lib/supabase';
import ReactDOM from 'react-dom';

const PRIORITY_STYLES = {
  CRITICAL: { color: 'text-red-600',    bg: 'bg-red-50',    label: 'Critical' },
  HIGH:     { color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
  MEDIUM:   { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' },
  LOW:      { color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Low' },
  NONE:     { color: 'text-gray-400',  bg: '',             label: '' },
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
        return "rounded-xl shadow-sm hover:shadow-md border-border-light";
      case 'shadowed':
        return "rounded-2xl shadow-xl hover:shadow-2xl border-transparent mb-6";
      case 'modern':
      default:
        return "rounded-xl shadow-md hover:shadow-2xl border-border-light transition-all duration-400";
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
            className={`relative bg-white border cursor-pointer select-none group overflow-hidden transition-all duration-300 flex-shrink-0
              ${getCardStyleClasses()}
              ${isSelected ? 'ring-4 ring-brand-primary border-transparent' : ''}
              group-hover:border-black
              ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-brand-primary/20 rotate-1 scale-[1.03] z-[9999]' : ''}`}
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
                      ${card.is_completed ? 'bg-success text-white' : 'bg-bg-secondary text-text-tertiary hover:bg-brand-primary/10 hover:text-brand-primary'}`}
                  >
                    {card.is_completed ? <CheckCircle2 size={12} strokeWidth={4} /> : <Circle size={12} strokeWidth={3} />}
                  </button>
                  <h4 className={`text-[15px] font-black tracking-tight leading-tight transition-colors break-words
                    ${card.is_completed ? 'text-text-tertiary line-through decoration-text-tertiary/40' : 'text-text-primary group-hover:text-brand-primary'}`}>
                    {card.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
                    title="Delete card"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button className="p-1.5 text-text-tertiary hover:bg-bg-secondary rounded-lg">
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
                   <div className="flex items-center justify-between text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${completedItems === totalItems ? 'bg-success' : 'bg-brand-primary'}`} />
                         <span>Checklist</span>
                      </div>
                      <span className="tabular-nums font-bold text-text-secondary">{completedItems}/{totalItems}</span>
                   </div>
                   <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden border border-border-light">
                      <div 
                         className={`h-full transition-all duration-1000 ${completedItems === totalItems ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-brand-primary'}`}
                         style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                   </div>
                </div>
              )}

              {/* Card Footer: Metadata (Comments, Date, Assignees) */}
              <div className="flex items-center justify-between pt-2 border-t border-border-light">
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-text-tertiary">
                  {dueDateObj && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${isOverdue && !card.is_completed ? 'bg-red-50 text-red-600' : 'bg-bg-secondary text-text-secondary'}`} title="Due date">
                      <Clock size={12} />
                      <span className="tabular-nums tracking-widest uppercase">{dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {card.description_text && (
                    <div className="flex items-center gap-1 opacity-60" title="Has description">
                      <Circle size={10} className="fill-brand-primary text-brand-primary" />
                    </div>
                  )}
                  {card.attachments?.length > 0 && (
                    <div className="flex items-center gap-1 hover:text-brand-primary transition-colors cursor-help" title={`${card.attachments.length} attachment(s)`}>
                      <Paperclip size={12} />
                      <span className="tabular-nums">{card.attachments.length}</span>
                    </div>
                  )}
                  {card.comments?.length > 0 && (
                    <div className="flex items-center gap-1 hover:text-brand-primary transition-colors cursor-help" title={`${card.comments.length} comment(s)`}>
                      <MessageSquare size={12} />
                      <span className="tabular-nums">{card.comments.length}</span>
                    </div>
                  )}
                  {card.location && (
                    <div className="flex items-center gap-1 hover:text-brand-primary transition-colors cursor-help" title={`Location: ${card.location.name}`}>
                      <MapPin size={12} className="text-brand-primary" />
                    </div>
                  )}
                  {card.time_entries?.some(t => !t.ended_at) && (
                    <div className="flex items-center gap-1 text-brand-primary animate-pulse" title="Timer is running">
                      <Clock size={12} className="fill-brand-primary/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                    </div>
                  )}
                </div>

                <div className="flex -space-x-2.5">
                  {assignees.map((assignee) => (
                    <div 
                      key={assignee.user_id}
                      className="w-7 h-7 rounded-full border-2 border-white bg-bg-tertiary flex items-center justify-center text-[9px] font-black overflow-hidden hover:z-10 hover:scale-110 transition-all cursor-pointer shadow-sm"
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
