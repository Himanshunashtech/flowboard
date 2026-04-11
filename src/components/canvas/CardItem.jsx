import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Paperclip, Clock, Check, MoreVertical, Plus, Circle } from 'lucide-react';
import { setActiveCardId, toggleModal } from '../../store/slices/uiSlice';
import { isPast } from 'date-fns';
import ReactDOM from 'react-dom';

const PRIORITY_STYLES = {
  CRITICAL: { color: 'text-red-600',    bg: 'bg-red-50',    label: 'Critical' },
  HIGH:     { color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
  MEDIUM:   { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' },
  LOW:      { color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Low' },
  NONE:     { color: 'text-gray-400',  bg: '',             label: '' },
};

const CardItem = ({ card, index }) => {
  const dispatch = useDispatch();
  const { labels: boardLabels, members: boardMembers } = useSelector(s => s.board);
  const priority = PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.NONE;

  const handleOpen = (e) => {
    e.stopPropagation();
    dispatch(setActiveCardId(card.id));
    dispatch(toggleModal({ modalName: 'cardDetails', isOpen: true }));
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

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => {
        const content = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleOpen}
            className={`relative bg-white rounded-[28px] border border-border-light shadow-md mb-4 cursor-pointer select-none 
              hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 group
              ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-brand-primary/20 rotate-1 scale-[1.03] z-[9999]' : ''}`}
            style={{
              ...provided.draggableProps.style,
            }}
          >
            {/* Card Content wrapper */}
            <div className="p-5">
              {/* Header: Title + More */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {card.is_completed && (
                    <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-success text-white flex items-center justify-center animate-in zoom-in duration-500 shadow-sm">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                  <h4 className={`text-[15px] font-black tracking-tight leading-tight transition-colors break-words
                    ${card.is_completed ? 'text-text-tertiary line-through decoration-text-tertiary/40' : 'text-text-primary group-hover:text-brand-primary'}`}>
                    {card.title}
                  </h4>
                </div>
                <button className="p-1 -mr-1 text-text-tertiary opacity-0 group-hover:opacity-100 transition-all hover:bg-bg-secondary rounded-lg">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Labels & Priority Area */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {priority.label && (
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-current/10 ${priority.bg} ${priority.color}`}>
                     {priority.label}
                   </span>
                )}
                {cardLabels.map(label => (
                  <span 
                    key={label.id}
                    className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-bg-tertiary text-text-secondary border border-border-medium hover:bg-white transition-colors"
                  >
                    {label.name}
                  </span>
                ))}
              </div>

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
                <div className="flex items-center gap-3 text-[10px] font-bold text-text-tertiary">
                  {dueDateObj && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${isOverdue && !card.is_completed ? 'bg-red-50 text-red-600' : 'bg-bg-secondary text-text-secondary'}`}>
                      <Clock size={12} />
                      <span className="tabular-nums tracking-widest uppercase">{dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {card.comments?.length > 0 && (
                    <div className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                      <MessageSquare size={12} />
                      <span className="tabular-nums">{card.comments.length}</span>
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
                  {assignees.length === 0 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-bg-secondary flex items-center justify-center text-text-tertiary opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                      <Plus size={12} strokeWidth={3} />
                    </div>
                  )}
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
